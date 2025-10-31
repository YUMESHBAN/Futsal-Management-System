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
from django.utils import timezone
import uuid, hmac, hashlib, base64, time



from utils.email_service import (
    notify_futsal_owner_on_booking,
    notify_sender_on_booking_confirmed,
    notify_sender_on_match_rejected,
    notify_team_owners_match_result,
    send_match_invitation_email,

    notify_sender_on_match_acceptance,
    notify_sender_on_match_rejection,
    notify_receiver_of_match_request,
    notify_futsal_owner_on_competitive_booking,
    notify_teams_on_game_completion,

)


from .models import Futsal, Team, Player, TeamMatch,TimeSlot,Payment,MatchRequest,Match, TeamRejection
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

        # Remove booking logic here - do not book futsal slot during match creation


# -------------------------------
# Payment Views
# -------------------------------

# -------------------------------
# Match Acceptance + Payment Flow
# -------------------------------

ESWEA_SECRET_KEY = "EPAYTEST"  # Sandbox key
ESEWA_PRODUCT_CODE = "EPAYTEST" 
ESEWA_PAYMENT_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"  # Sandbox
ESEWA_VERIFY_URL = "https://rc.esewa.com.np/api/epay/transaction/status/"  # Sandbox
# -------------------------------
# Payment Views
# -------------------------------

# Match Acceptance + Payment Flow

class InitiateEsewaPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)

        # Only invited team can accept
        if match.team_2.owner != request.user:
            return Response({"detail": "Not authorized to accept this match."}, status=403)

        # Ensure match has a futsal
        futsal = match.time_slot.futsal if match.time_slot else None
        if not futsal:
            return Response({"detail": "No futsal assigned to this match."}, status=400)

        amount = "{:.2f}".format(futsal.price_per_hour)
        tax = 0
        total_amount = "{:.2f}".format(float(amount) + tax)

        # Unique transaction ID
        transaction_uuid = f"{match.id}_{int(time.time())}"

        # Create/update payment record
        payment, _ = Payment.objects.update_or_create(
            match=match,
            defaults={
                "amount": amount,
                "method": "eSewa",
                "status": "pending",
                "transaction_id": transaction_uuid,
            },
        )

        # Fields to sign
        fields_to_sign = {
            "total_amount": amount,
            "transaction_uuid": transaction_uuid,
            "product_code": "EPAYTEST",
        }

        # HMAC SHA-256 signature
        secret_key = getattr(settings, "ESEWA_SECRET_KEY", "EPAYTESTSECRET").encode()
        signature_string = ",".join([f"{k}={v}" for k, v in fields_to_sign.items()])
        signature = hmac.new(secret_key, signature_string.encode(), hashlib.sha256).digest()
        signature_b64 = base64.b64encode(signature).decode()

        payment_data = {
            "amount": amount,
            "tax_amount": tax,
            "total_amount": total_amount,
            "transaction_uuid": transaction_uuid,
            "product_code": "EPAYTEST",
            "product_service_charge": 0,
            "product_delivery_charge": 0,
            "success_url": "http://localhost:5173/payment-success",
            "failure_url": "http://localhost:5173/payment-failure",
            "signed_field_names": "total_amount,transaction_uuid,product_code",
            "signature": signature_b64,
        }

        return Response({
            "payment_url": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
            "payment_data": payment_data
        })

@api_view(['POST'])
def esewa_verify(request):
    transaction_uuid = request.data.get("transaction_uuid")
    
    if not transaction_uuid:
        return Response({"detail": "Missing transaction_uuid"}, status=400)

    # Retrieve the payment object using the transaction ID (UUID)
    payment = Payment.objects.filter(transaction_id=transaction_uuid).first()

    if not payment:
        return Response({"detail": "Invalid transaction UUID"}, status=400)

    # Verify the payment via eSewa's API
    payload = {
        "amt": str(payment.amount),
        "scd": "EPAYTEST",  
        "pid": payment.transaction_id,
    }

    resp = requests.post("https://rc.esewa.com.np/api/epay/transaction/status/", data=payload)

    if resp.status_code == 200:
        if "SUCCESS" in resp.text:
            payment.status = "paid"
            payment.save()
            # Update the match acceptance status here if needed
            match = payment.match
            match.accepted = True
            match.save()
            return Response({"detail": "Payment verified and match accepted."})
        else:
            return Response({"detail": "Payment verification failed."}, status=400)
    else:
        return Response({"detail": "Payment verification request failed."}, status=500)

# -------------------------------
# Accept Match (for other cases)
# -------------------------------
class AcceptMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)

        if match.team_2.owner != request.user:
            raise PermissionDenied("You are not authorized to accept this match.")

        # Directly accept the match
        match.accepted = True
        match.save()
        if match.match_type == "friendly":
            notify_futsal_owner_on_booking(match)
            notify_sender_on_booking_confirmed(match)
            notify_accepter_on_payment_confirmed(match)
        

        return Response({"detail": "Match accepted successfully."})


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
        except (TypeError, ValueError):
            return Response({"detail": "Invalid scores."}, status=400)

        # Compute match result
        if team_1_score > team_2_score:
            result = "team_1"
        elif team_2_score > team_1_score:
            result = "team_2"
        else:
            result = "Draw"

        # Save result
        match.team_1_score = team_1_score
        match.team_2_score = team_2_score
        match.result = result
        match.result_updated = True
        match.save()

        notify_team_owners_match_result(match)

        return Response({"detail": "Result recorded successfully."})


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


# ----------------- Constants -----------------
COOLDOWN_DAYS = 1  # Number of days a rejection blocks invites


# ----------------- Recommendation View -----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_competitive_match(request):
    user_team = Team.objects.filter(owner=request.user).first()
    if not user_team:
        return Response({"error": "No team found."}, status=400)

    # Optional: clear expired rejections before recommending
    now = timezone.now()
    TeamRejection.objects.filter(
        cleared=False,
        timestamp__lte=now - timedelta(days=COOLDOWN_DAYS)
    ).update(cleared=True)

    cf = recommend_by_collab(user_team.id, top_n=10)
    cb = recommend_by_content(user_team, top_n=10)
    hybrid = merge_recommendations(cf, cb)

    response = []
    for team_id, score in hybrid:
        if team_id == user_team.id:
            continue
        try:
            t = Team.objects.get(id=team_id)

            recently_rejected = TeamRejection.objects.filter(
                rejecting_team=t,
                rejected_team=user_team,
                cleared=False
            ).exists()  # Only consider uncleared rejections

            response.append({
                "team_id": t.id,
                "team_name": t.name,
                "elo_rating": t.ranking,
                "win_rate": t.win_rate,
                "weighted_score": t.weighted_score,
                "preferred_futsals": [f.name for f in t.preferred_futsals.all()],
                "similarity_score": round(score, 3),
                "recently_rejected": recently_rejected
            })
        except Team.DoesNotExist:
            continue

    return Response({
        "your_team_id": user_team.id,
        "recommendations": response
    })


# ----------------- Send Match Request -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_match_request(request, team_id):
    sender = Team.objects.filter(owner=request.user).first()
    if not sender:
        return Response({"error": "You have no team."}, status=400)

    try:
        receiver = Team.objects.get(id=team_id)
    except Team.DoesNotExist:
        return Response({"error": "Opponent not found."}, status=404)

    # ✅ Clear old rejections that exceeded COOLDOWN_DAYS
    TeamRejection.objects.filter(
        cleared=False,
        timestamp__lte=timezone.now() - timedelta(days=COOLDOWN_DAYS)
    ).update(cleared=True)

    # Check if receiver has recently rejected sender
    if TeamRejection.objects.filter(
        rejecting_team=receiver,
        rejected_team=sender,
        cleared=False
    ).exists():
        return Response(
            {"error": f"You cannot send a request to {receiver.name} yet."},
            status=400
        )

    # Check for existing pending match
    if Match.objects.filter(
        Q(team_1=sender, team_2=receiver, status='pending') |
        Q(team_1=receiver, team_2=sender, status='pending')
    ).exists():
        return Response({"error": "Existing match found."}, status=409)

    match = Match.objects.create(
        team_1=sender,
        team_2=receiver,
        match_type='competitive',
        status='pending',
        accepted=None
    )

    notify_receiver_of_match_request(match)

    return Response({"message": "Match request sent.", "match_id": match.id}, status=201)


# ----------------- Respond to Match Request -----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_match_request(request, match_id):
    decision = request.data.get("decision")
    if decision not in ['accept', 'reject']:
        return Response({"error": "Invalid decision."}, status=400)

    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found."}, status=404)

    # Only the receiving team can respond
    if match.team_2.owner != request.user:
        return Response({"error": "Unauthorized."}, status=403)

    if decision == 'accept':
        match.status = 'confirmed'
        match.accepted = True
        match.save()
        
        return Response({"message": "Match accepted successfully."})

    # ❌ Handle rejection
    match.status = 'rejected'
    match.accepted = False
    match.save()

    # ✅ Record rejection
    TeamRejection.objects.update_or_create(
        rejecting_team=match.team_2,
        rejected_team=match.team_1,
        defaults={"cleared": False, "timestamp": timezone.now()}
    )

    # ✅ Optional: Clear expired rejections for sender
    TeamRejection.objects.filter(
        rejected_team=match.team_1,
        cleared=False,
        timestamp__lte=timezone.now() - timedelta(days=COOLDOWN_DAYS)
    ).update(cleared=True)

    # Get alternative recommended teams excluding rejected
    alternatives = get_alternative_teams(match.team_1, exclude_team=match.team_2.id)

    notify_sender_on_match_rejection(match, alternatives)

    return Response({
        "message": "Match request rejected.",
        "alternatives": alternatives
    })



# ---------- List Competitive Matches ----------
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
            "accepted": match.accepted,
            "created_at": match.created_at,
            "futsal_name": match.futsal.name if match.futsal else None
        })

    return Response(data)


# ----------------- Complete Match -----------------
def mark_match_completed(match_id):
    match = Match.objects.get(id=match_id)
    match.is_completed = True
    match.status = 'completed'
    match.save()

    # Clear old rejections for both teams
    clear_rejections_after_match(match)


def clear_rejections_after_match(match: Match):
    """
    Clears all previous rejections for both teams involved in a completed competitive match.
    """
    TeamRejection.objects.filter(
        Q(rejected_team=match.team_1) | Q(rejecting_team=match.team_1) |
        Q(rejected_team=match.team_2) | Q(rejecting_team=match.team_2),
        cleared=False
    ).update(cleared=True)



# ----------------- Alternative Teams -----------------
def get_alternative_teams(team, exclude_team=None):
    cf = recommend_by_collab(team.id, top_n=10)
    cb = recommend_by_content(team, top_n=10)
    hybrid = merge_recommendations(cf, cb)

    response = []
    for team_id, score in hybrid:
        if team_id == team.id:
            continue
        if exclude_team and team_id == exclude_team:
            continue
        try:
            t = Team.objects.get(id=team_id)

            recently_rejected = TeamRejection.objects.filter(
                rejecting_team=t,
                rejected_team=team,
                cleared=False,
                timestamp__gte=timezone.now() - timedelta(days=COOLDOWN_DAYS)
            ).exists()

            response.append({
                "team_id": t.id,
                "team_name": t.name,
                "elo_rating": t.ranking,
                "win_rate": t.win_rate,
                "weighted_score": t.weighted_score,
                "preferred_futsals": [f.name for f in t.preferred_futsals.all()],
                "similarity_score": round(score, 3),
                "recently_rejected": recently_rejected
            })
        except Team.DoesNotExist:
            continue

    return response

# ---------- Invitation Status ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invitation_status(request, team_id):
    user_team = Team.objects.filter(owner=request.user).first()
    opponent_team = Team.objects.get(id=team_id)
    match_request = MatchRequest.objects.filter(
        team_1=user_team, team_2=opponent_team
    ).first()
    if not match_request:
        return Response({"status": "none"})
    return Response({"status": match_request.status})


# ---------- Schedule Match ----------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_match(request, match_id):
    date_str = request.data.get("scheduled_date")

    try:
        date_obj = date.fromisoformat(date_str)
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

    if date_obj < date.today():
        return Response({"error": "Cannot schedule match in the past."}, status=400)

    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({"error": "Match not found."}, status=404)

    if match.status != 'confirmed':
        return Response({"error": "Only confirmed matches can be scheduled."}, status=400)

    team = Team.objects.filter(owner=request.user).first()
    if not team:
        return Response({"error": "Your user is not linked to any team."}, status=400)

    if team not in [match.team_1, match.team_2]:
        return Response({"error": "You are not a participant in this match."}, status=403)

    opponent_team = match.team_2 if team == match.team_1 else match.team_1

    preferred_futsals = list(team.preferred_futsals.all())
    opponent_futsals = set(opponent_team.preferred_futsals.values_list('id', flat=True))

    common_futsal = next((f for f in preferred_futsals if f.id in opponent_futsals), None)

    if common_futsal:
        futsal = common_futsal
    else:
        futsal = team.futsal
        if not futsal:
            return Response({"error": "Your team has no assigned futsal."}, status=400)

    match.scheduled_date = date_obj
    match.futsal = futsal
    match.status = 'scheduled'
    match.save()
    notify_sender_on_match_acceptance(match)
    notify_futsal_owner_on_competitive_booking(match)

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

    if match.futsal.owner != request.user:
        return Response({'error': 'Only the futsal owner can finalize the match.'}, status=403)

    # Determine winner
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

    # Clear previous rejections for both teams
    clear_rejections_after_match(match)

    # Update ELO ratings
    result = update_elo(
        team_a=match.team_1,
        team_b=match.team_2,
        winner_team=winner_team,
        goals_a=goals_team_1,
        goals_b=goals_team_2
    )

    notify_teams_on_game_completion(match)

    return Response({
        'message': 'Match finalized, goals saved, ELO updated, and previous rejections cleared.',
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
