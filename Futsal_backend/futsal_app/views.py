from rest_framework import viewsets, generics, permissions, status, serializers
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from django.db import models
from django.db.models import Q
from datetime import date
from rest_framework.generics import ListAPIView
from rest_framework.decorators import api_view,permission_classes
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.conf import settings
import uuid


from utils.email_service import (
    notify_futsal_owner_on_booking,
    notify_sender_on_booking_confirmed,
    notify_sender_on_match_rejected,
    notify_team_owners_match_result,
    send_match_payment_email,
    send_match_invitation_email 
)


from .models import Futsal, Team, Player, TeamMatch,TimeSlot,Payment,MatchRequest,Match
from .serializers import (
    FutsalSerializer,
    TeamSerializer,
    TeamMatchSerializer,
    PlayerSerializer,
    TimeSlotSerializer,
    MatchRequestSerializer
)

from futsal_app.Algorithms.elo import update_elo
from futsal_app.Algorithms.collabfiltering import recommend_by_collab
from futsal_app.Algorithms.contentbasedfiltering import recommend_by_content
from futsal_app.Algorithms.hybrid import merge_recommendations


# -------------------------------
# Futsal Views
# -------------------------------

class FutsalListCreateView(generics.ListCreateAPIView):
    queryset = Futsal.objects.all()
    serializer_class = FutsalSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return []


class FutsalDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Futsal.objects.all()
    serializer_class = FutsalSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return []


class OwnerFutsalListView(generics.ListAPIView):
    serializer_class = FutsalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Futsal.objects.filter(owner=self.request.user)

class TimeSlotListCreateView(generics.ListCreateAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        futsal_id = self.request.query_params.get("futsal")

        if futsal_id:
            return TimeSlot.objects.filter(futsal_id=futsal_id, is_booked=False).order_by("start_time")

        if user.user_type == "owner":
            return TimeSlot.objects.filter(futsal__owner=user).order_by("start_time")

        return TimeSlot.objects.filter(is_booked=False).order_by("start_time")
    
    def perform_create(self, serializer):
        serializer.save()


class AvailableTimeSlotListView(generics.ListAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TimeSlot.objects.filter(is_booked=False).order_by('start_time')



class TimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if self.request.user != obj.futsal.owner:
            raise PermissionDenied("You can only modify your own futsal's time slots.")
        return obj
    

class GenerateTimeSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        futsal_id = request.data.get("futsal_id")
        start_time_str = request.data.get("start_time")
        end_time_str = request.data.get("end_time")

        try:
            futsal = Futsal.objects.get(id=futsal_id, owner=user)
        except Futsal.DoesNotExist:
            return Response({"detail": "Invalid futsal or permission denied."}, status=403)

        try:
            start_time = datetime.fromisoformat(start_time_str)
            end_time = datetime.fromisoformat(end_time_str)
        except:
            return Response({"detail": "Invalid datetime format."}, status=400)

        if start_time >= end_time:
            return Response({"detail": "Start time must be before end time."}, status=400)

        current = start_time
        created_slots = []

        while current + timedelta(hours=1) <= end_time:
            slot = TimeSlot.objects.create(
                futsal=futsal,
                start_time=current,
                end_time=current + timedelta(hours=1),
            )
            created_slots.append(slot)
            current += timedelta(hours=1)

        return Response(TimeSlotSerializer(created_slots, many=True).data, status=201)
    
# -------------------------------
# Team Views
# -------------------------------

class TeamListCreateView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Check if user already has a team
        if Team.objects.filter(owner=self.request.user).exists():
            raise ValidationError({"detail": "You already have a team."})

        # Validate minimum 5 futsals selected
        preferred_futsals = self.request.data.get('preferred_futsal_ids') or []
        if len(preferred_futsals) < 2:
            raise ValidationError({"detail": "You must select at least 2 preferred futsals."})

        team = serializer.save(owner=self.request.user)

        # Assign preferred futsals to M2M
        team.preferred_futsals.set(preferred_futsals)

class MyTeamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        team = Team.objects.filter(owner=request.user).first()
        if team:
            return Response(TeamSerializer(team).data)
        return Response({"detail": "You have not created a team yet."}, status=404)


class TeamViewSet(viewsets.ModelViewSet):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        if Team.objects.filter(owner=request.user).exists():
            return Response(
                {"detail": "You already have a team."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().create(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

class TeamDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(owner=self.request.user)

    def perform_update(self, serializer):
        # Optional: extra permission check if needed
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to update this team.")
        serializer.save()

    def delete(self, request, *args, **kwargs):
        team = self.get_object()
        if team.owner != request.user:
            raise PermissionDenied("You cannot delete another user's team.")
        team.delete()
        return Response({"detail": "Team deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    
class OtherTeamsListView(ListAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Team.objects.exclude(owner=self.request.user)
    


# -------------------------------
# Team Match Views
# -------------------------------

class TeamMatchListCreateView(generics.ListCreateAPIView):
    serializer_class = TeamMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        include_all = self.request.query_params.get("include_all", "false").lower() == "true"

        base_filter = models.Q(team_1__owner=user) | models.Q(team_2__owner=user)
        futsal_filter = models.Q(time_slot__futsal__owner=user)

        if not include_all:
            base_filter &= models.Q(result_updated=False)
            futsal_filter &= models.Q(result_updated=False)

        team_matches = TeamMatch.objects.filter(base_filter)
        futsal_matches = TeamMatch.objects.filter(futsal_filter)

        return (team_matches | futsal_matches).distinct().order_by('-created_at')
    
    def perform_create(self, serializer):
        team_1 = serializer.validated_data['team_1']
        
        if team_1.owner != self.request.user:
            raise PermissionDenied("You can only send invites from your own team.")

        # Save match first (without committing to DB yet)
        match = serializer.save()

        # Handle slot booking if time_slot_id is provided
        time_slot_id = self.request.data.get("time_slot_id")
        if time_slot_id:
            try:
                slot = TimeSlot.objects.get(id=time_slot_id, is_booked=False)
                slot.is_booked = True
                slot.booked_by_match = match
                slot.save()
            except TimeSlot.DoesNotExist:
                raise ValidationError("Invalid or already booked time slot.")


class AcceptMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)

        if match.team_2.owner != request.user:
            return Response({"detail": "Not authorized to respond to this match."}, status=403)

        match.accepted = True
        match.save()
        if match.match_type == "friendly":
            notify_futsal_owner_on_booking(match)
            notify_sender_on_booking_confirmed(match)

        return Response({"detail": "Match accepted."})


class RejectMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)

        if match.team_2.owner != request.user:
            return Response({"detail": "Not authorized to reject this match."}, status=403)

        match.accepted = False
        match.save()

        notify_sender_on_match_rejected(match)
        
        return Response({"detail": "Match rejected."})






class UpdateMatchResultView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)
        user = request.user

        # Only futsal owner can submit result
        if not match.time_slot or match.time_slot.futsal.owner != user:
            return Response({"detail": "Only the venue owner can update the result."}, status=403)

        try:
            team_1_score = int(request.data.get("team_1_score"))
            team_2_score = int(request.data.get("team_2_score"))
            payment_method = request.data.get("payment_method")
        except (TypeError, ValueError):
            return Response({"detail": "Invalid scores or missing payment method."}, status=400)

        if payment_method not in ['Cash', 'eSewa']:
            return Response({"detail": "Invalid payment method."}, status=400)

        # Compute match result
        if team_1_score > team_2_score:
            result = "team_1"
        elif team_2_score > team_1_score:
            result = "team_2"
        else:
            result = "Draw"

        # Fetch or create payment
        payment, _ = Payment.objects.get_or_create(
            match=match,
            defaults={
                "amount": match.time_slot.futsal.price_per_hour,
                "method": payment_method,
                "status": "pending" if payment_method == "eSewa" else "paid"
            }
        )

        if payment_method == "eSewa" and payment.status != "paid":
            return Response({"detail": "eSewa payment not confirmed yet."}, status=400)

        # Save result
        match.team_1_score = team_1_score
        match.team_2_score = team_2_score
        match.result = result
        match.result_updated = True
        match.save()

        # Ensure payment is updated
        payment.method = payment_method
        payment.status = "paid"
        payment.save()

        notify_team_owners_match_result(match)

        return Response({"detail": "Result and payment recorded successfully."})


# -------------------------------
# Player Views
# -------------------------------

class PlayerViewSet(viewsets.ModelViewSet):
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Player.objects.filter(team__owner=self.request.user)


class PlayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Player.objects.filter(team__owner=self.request.user)

class PlayerListCreateView(generics.ListCreateAPIView):
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Player.objects.filter(team__owner=self.request.user)

    def perform_create(self, serializer):
        team = Team.objects.filter(owner=self.request.user).first()
        if not team:
            raise ValidationError({"detail": "Create a team first."})
        if Player.objects.filter(team=team).count() >= 8:
            raise ValidationError({"detail": "Maximum of 8 players allowed."})
        serializer.save(team=team)



# -------------------------------
# Payment Views
# -------------------------------

@api_view(['POST'])
@csrf_exempt
def esewa_success_callback(request):
    pid = request.POST.get('pid')
    try:
        payment = Payment.objects.get(transaction_id=pid)
        payment.status = 'paid'
        payment.save()
        return HttpResponse("Payment Successful")
    except Payment.DoesNotExist:
        return HttpResponse("Payment not found", status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_payment_email(request, match_id):
    match = get_object_or_404(TeamMatch, id=match_id)
    user = request.user

    if not match.time_slot or match.time_slot.futsal.owner != user:
        return Response({"detail": "Only the venue owner can send payment emails."}, status=403)

    payment = getattr(match, 'payment', None)
    if not payment or payment.method != 'eSewa' or payment.status != 'pending':
        return Response({"detail": "No pending eSewa payment found for this match."}, status=400)

    # Collect emails of players from both teams (assumes teams have owners with emails)
    to_emails = []
    if match.team_1.owner.email:
        to_emails.append(match.team_1.owner.email)
    if match.team_2.owner.email:
        to_emails.append(match.team_2.owner.email)

    if not to_emails:
        return Response({"detail": "No players found to send payment email."}, status=400)

    # Call your email helper (you will create this)
    send_match_payment_email(to_emails, match, payment)

    return Response({"detail": "Payment email sent to players."})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment_received(request, match_id):
    match = get_object_or_404(TeamMatch, id=match_id)
    user = request.user

    if not match.time_slot or match.time_slot.futsal.owner != user:
        return Response({"detail": "Only the venue owner can confirm payment."}, status=403)

    payment = getattr(match, 'payment', None)
    if not payment or payment.status != 'pending':
        return Response({"detail": "No pending payment to confirm."}, status=400)

    # Mark payment as paid
    payment.status = 'paid'
    payment.save()

    # Update match result now
    match.result_updated = True
    match.save()

    # (Optional) send notification emails here

    return Response({"detail": "Payment confirmed and match result updated."})

from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET', 'POST'])
def esewa_failure_callback(request):
    # Handle eSewa failure callback logic here
    return Response({"detail": "Payment failed or cancelled."})


class SendPaymentEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)

        # Only futsal owner can send payment email
        if not match.time_slot or match.time_slot.futsal.owner != request.user:
            return Response({"detail": "Only the venue owner can send payment email."}, status=403)

        # Compose eSewa payment URL (you can customize this as needed)
        payment_url = f"https://rc-epay.esewa.com.np/api/epay/main/v2/form?pid=HAMRO-{match_id}&amt={match.time_slot.futsal.price_per_hour}&scd=EPAYTEST&su=http://your-success-url&fu=http://your-failure-url"

        # Prepare list of player emails - assuming both teams' owners are paying players
        to_emails = []
        if match.team_1.owner.email:
            to_emails.append(match.team_1.owner.email)
        if match.team_2.owner.email:
            to_emails.append(match.team_2.owner.email)

        # Custom message with payment URL
        subject = f'HamroFutsal - Payment Request for Match {match.team_1.name} vs {match.team_2.name}'
        message = (
            f"Dear Player,\n\n"
            f"You have a payment request for your upcoming match:\n"
            f"Teams: {match.team_1.name} vs {match.team_2.name}\n"
            f"Scheduled Time: {match.scheduled_time}\n"
            f"Venue: {match.time_slot.futsal.name}\n\n"
            f"Please complete your payment via eSewa here:\n{payment_url}\n\n"
            f"Thank you,\nHamroFutsal Team"
        )

        send_match_payment_email(to_emails, match)  # or send_mail(subject, message, ...) if you want to send this message

        return Response({"detail": "Payment email sent to players."})
    

class ConfirmPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)

        # Only futsal owner can confirm payment
        if not match.time_slot or match.time_slot.futsal.owner != request.user:
            return Response({"detail": "Only the venue owner can confirm payment."}, status=403)

        # Create or update the payment record
        payment, created = Payment.objects.get_or_create(
            match=match,
            defaults={
                "amount": match.time_slot.futsal.price_per_hour,
                "method": "eSewa",
                "status": "paid",
            },
        )

        if not created and payment.status == "paid":
            return Response({"detail": "Payment is already marked as paid."})

        # Mark payment as paid
        payment.status = "paid"
        payment.save()

        return Response({"detail": "Payment marked as received."})
    



# -------------------------------
# Competitive Matchmaking View
# -------------------------------


class RecommendedOpponentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        my_team = Team.objects.filter(owner=request.user).first()
        if not my_team:
            return Response({"detail": "You don\'t have a team."}, status=404)

        other_teams = Team.objects.exclude(id=my_team.id)
        serializer = TeamSerializer(other_teams, many=True)
        return Response(serializer.data)

class SendMatchRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, team_id):
        my_team = Team.objects.filter(owner=request.user).first()
        opponent_team = Team.objects.filter(id=team_id).first()

        if not my_team or not opponent_team:
            return Response({"detail": "Teams not found."}, status=404)

        if my_team.id == opponent_team.id:
            return Response({"detail": "You cannot send request to your own team."}, status=400)

        MatchRequest.objects.create(team_1=my_team, team_2=opponent_team)
        return Response({"detail": "Match request sent."}, status=201)

class RespondMatchRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        action = request.data.get("action")  # "accept" or "reject"
        match = MatchRequest.objects.filter(id=match_id).first()

        if not match:
            return Response({"detail": "Match not found."}, status=404)

        if match.team_2.owner != request.user:
            return Response({"detail": "You are not authorized to respond."}, status=403)

        if action == "accept":
            match.status = "confirmed"
            match.save()
            return Response({"detail": "Match accepted."})
        elif action == "reject":
            match.delete()
            return Response({"detail": "Match rejected and deleted."})
        return Response({"detail": "Invalid action."}, status=400)


# ---------- Competitive Match Views ----------



@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommend_competitive_match(request):
    user_team = Team.objects.filter(owner=request.user).first()

    if not user_team:
        return Response({"error": "No team found."}, status=400)

    cf = recommend_by_collab(user_team.id, top_n=10)
    cb = recommend_by_content(user_team, top_n=10)
    hybrid = merge_recommendations(cf, cb)

    response = []
    for team_id, score in hybrid:
        try:
            t = Team.objects.get(id=team_id)
            response.append({
                "team_id": t.id,
                "team_name": t.name,
                "elo_rating": t.ranking,
                "win_rate": t.win_rate,
                "weighted_score": t.weighted_score,
                "preferred_futsals": [f.name for f in t.preferred_futsals.all()],
                "similarity_score": round(score, 3)
            })
        except Team.DoesNotExist:
            continue

    return Response({
        "your_team_id": user_team.id,
        "recommendations": response
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_match_request(request, team_id):
    sender = Team.objects.filter(owner=request.user).first()
    if not sender:
        return Response({"error": "You have no team."}, status=400)

    try:
        receiver = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response({"error": "Opponent not found."}, status=404)

    if Match.objects.filter(
        Q(team_1=sender, team_2=receiver, is_completed=False) |
        Q(team_1=receiver, team_2=sender, is_completed=False)
    ).exists():
        return Response({"error": "Existing match found."}, status=409)

    match = Match.objects.create(
    team_1=sender,
    team_2=receiver,
    match_type='competitive',
    status='pending',
    accepted=None  # Optional, but good for clarity
)

    return Response({"message": "Match request sent.", "match_id": match.id}, status=201)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_competitive_matches(request):
    user_team = Team.objects.filter(owner=request.user).first()
    if not user_team:
        return Response({"error": "You are not part of any team."}, status=400)

    matches = Match.objects.filter(
        match_type='competitive'
    ).filter(
        Q(team_1=user_team) | Q(team_2=user_team)
    ).order_by('-created_at')

    data = []
    for match in matches:
        data.append({
            "id": match.id,
            "team_1": match.team_1.id,
            "team_1_name": match.team_1.name,
            "team_2": match.team_2.id,
            "team_2_name": match.team_2.name,
            "match_type": match.match_type,
            "scheduled_time": match.scheduled_date,
            "status": match.status,
            "accepted": match.accepted,  # ✅ Add this
            "created_at": match.created_at,
            "futsal_name": match.futsal.name if match.futsal else None 
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_to_match_request(request, match_id):
    decision = request.data.get("decision")
    if decision not in ['accept', 'reject']:
        return Response({"error": "Invalid decision."}, status=400)

    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found."}, status=404)

    if match.team_2.owner != request.user:
        return Response({"error": "Unauthorized."}, status=403)

    if decision == 'accept':
        match.status = 'confirmed'
        match.accepted = True  # ✅ Add this
        match.save()
        return Response({"message": "Accepted."})

    # If rejected
    match.accepted = False  # ✅ Add this
    match.status = 'pending'  # Optional: or keep as 'pending'
    match.save()
    return Response({"message": "Rejected."})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_match(request, match_id):
    date_str = request.data.get("scheduled_date")

    # ✅ Validate date format
    try:
        date_obj = date.fromisoformat(date_str)
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    if date_obj < date.today():
        return Response({"error": "Cannot schedule match in the past."}, status=400)

    # ✅ Get match
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found."}, status=404)

    if match.status != 'confirmed':
        return Response({"error": "Only confirmed matches can be scheduled."}, status=400)

    # ✅ Get requesting user's team
    team = Team.objects.filter(owner=request.user).first()
    if not team:
        return Response({"error": "Your user is not linked to any team."}, status=400)

    if team not in [match.team_1, match.team_2]:
        return Response({"error": "You are not a participant in this match."}, status=403)

    # ✅ Determine opponent team
    opponent_team = match.team_2 if team == match.team_1 else match.team_1

    
    # ✅ Preserve order: iterate over requester's preferred futsals in saved order
    preferred_futsals = list(team.preferred_futsals.all())
    opponent_futsals = set(opponent_team.preferred_futsals.values_list('id', flat=True))

    common_futsal = next((f for f in preferred_futsals if f.id in opponent_futsals), None)

    if common_futsal:
       futsal = common_futsal
    else:
        futsal = team.futsal
        if not futsal:
           return Response({"error": "Your team has no assigned futsal."}, status=400)

    # ✅ Finalize scheduling
    match.scheduled_date = date_obj
    match.futsal = futsal
    match.status = 'scheduled'
    match.save()

    return Response({
        "message": "Match scheduled successfully.",
        "match_id": match.id,
        "date": date_str,
        "futsal": futsal.name
    }, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_competitive_matches(request):
    futsals = Futsal.objects.filter(owner=request.user)
    matches = Match.objects.filter(
        match_type='competitive',
        futsal__in=futsals
    ).order_by('-created_at')

    data = []
    for match in matches:
        data.append({
            "id": match.id,
            "team_1": match.team_1.name,
            "team_1_id": match.team_1.id,  # ✅ Include this
            "team_2": match.team_2.name,
            "team_2_id": match.team_2.id,  # ✅ Include this
            "status": match.status,
            "scheduled_date": match.scheduled_date,
            "winner": match.winner.name if match.winner else None,
            "futsal": match.futsal.name if match.futsal else None
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalize_match(request):
    match_id = request.data.get('match_id')
    goals_team_1 = request.data.get('goals_team_1')
    goals_team_2 = request.data.get('goals_team_2')

    # Validate input
    if not all([match_id, goals_team_1 is not None, goals_team_2 is not None]):
        return Response({'error': 'Missing required fields.'}, status=400)

    try:
        goals_team_1 = int(goals_team_1)
        goals_team_2 = int(goals_team_2)
    except ValueError:
        return Response({'error': 'Goals must be integers.'}, status=400)

    try:
        match = Match.objects.get(id=match_id, match_type='competitive')
    except Match.DoesNotExist:
        return Response({'error': 'Match not found.'}, status=404)

    if not match.futsal:
        return Response({'error': 'Match has no assigned futsal venue.'}, status=400)

    # Ensure the requesting user is the futsal owner
    if match.futsal.owner != request.user:
        return Response({'error': 'Only the futsal owner can finalize the match.'}, status=403)

    # Determine winner automatically
    if goals_team_1 > goals_team_2:
        winner_team = match.team_1
    elif goals_team_2 > goals_team_1:
        winner_team = match.team_2
    else:
        winner_team = None  # Draw

    # Save match results
    match.winner = winner_team
    match.goals_team_1 = goals_team_1
    match.goals_team_2 = goals_team_2
    match.status = 'completed'
    match.is_completed = True
    match.save()

    # Update ELO (update_elo should handle winner_team=None for draw)
    result = update_elo(
        team_a=match.team_1,
        team_b=match.team_2,
        winner_team=winner_team,
        goals_a=goals_team_1,
        goals_b=goals_team_2
    )

    return Response({
        'message': 'Match finalized, goals saved, and ELO updated.',
        'elo_result': result
    }, status=200)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def competitive_leaderboard(request):
    teams = Team.objects.all().order_by('-ranking')

    data = [
        {
            'id': team.id,
            'name': team.name,
            'ranking': round(team.ranking, 2),
            'owner_name': team.owner.username if team.owner else "N/A",
        }
        for team in teams
    ]
    return Response(data)

# ---------- Contact Us ----------


@api_view(['POST'])
@permission_classes([AllowAny])  
def contact_message(request):
    name = request.data.get('name')
    email = request.data.get('email')
    subject = request.data.get('subject')
    message = request.data.get('message')

    if not all([name, email, subject, message]):
        return Response({"error": "All fields are required."}, status=400)

    try:
        send_mail(
            subject=f"[HamroFutsal Contact] {subject}",
            message=f"From: {name} <{email}>\n\n{message}",
            from_email=settings.DEFAULT_FROM_EMAIL,  # must be configured in settings.py
            recipient_list=[settings.CONTACT_RECIPIENT_EMAIL],  # your email
            fail_silently=False,
        )
        return Response({"success": "Message sent successfully!"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
