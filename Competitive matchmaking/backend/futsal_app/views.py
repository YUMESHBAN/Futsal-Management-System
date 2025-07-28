from django.shortcuts import render

# Create your views here.
from rest_framework import generics, viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from datetime import date
from django.utils import timezone
import math

from .models import Futsal, Team, Player, Match, MatchRequest
from .serializers import (
    FutsalSerializer, TeamSerializer, PlayerSerializer,
    MatchSerializer, MatchRequestSerializer
)
from core.models import CustomUser
from futsal_app.Algorithms.elo import update_elo
from futsal_app.Algorithms.collabfiltering import recommend_by_collab
from futsal_app.Algorithms.contentbasedfiltering import recommend_by_content
from futsal_app.Algorithms.hybrid import merge_recommendations

# ---------- Futsal Views ----------
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

# ---------- Team Views ----------
class TeamListCreateView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        if Team.objects.filter(owner=self.request.user).exists():
            raise ValidationError({"detail": "You already have a team."})
        serializer.save(owner=self.request.user)


class MyTeamView(generics.RetrieveAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        team = Team.objects.filter(owner=self.request.user).first()
        if not team:
            raise ValidationError({"detail": "You have not created a team yet."})
        return team


class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            raise PermissionDenied("You do not have permission to update this team.")
        serializer.save()

    def delete(self, request, *args, **kwargs):
        team = self.get_object()
        if team.owner != request.user:
            raise PermissionDenied("You cannot delete another user's team.")
        team.delete()
        return Response({"detail": "Team deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class OtherTeamsListView(generics.ListAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.exclude(owner=self.request.user)

# ---------- Player Views ----------
class PlayerViewSet(viewsets.ModelViewSet):
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Player.objects.filter(team__owner=self.request.user)


class PlayerDetailView(generics.RetrieveUpdateDestroyAPIView):
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




# ---------- Match Request (Friendly) ----------
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_friendly_match(request):
    team_a_id = request.data.get('team_a')
    team_b_id = request.data.get('team_b')

    if not team_a_id or not team_b_id or team_a_id == team_b_id:
        return Response({'error': 'Invalid team selection.'}, status=400)

    try:
        team_a = Team.objects.get(id=team_a_id)
        team_b = Team.objects.get(id=team_b_id)
    except Team.DoesNotExist:
        return Response({'error': 'Invalid team(s).'}, status=400)

    if team_a.owner != request.user:
        return Response({'error': 'You can only request from your team.'}, status=403)

    match_request = MatchRequest.objects.create(
        team_a=team_a,
        team_b=team_b,
        mode='friendly',
        status='pending'
    )

    return Response({"message": "Request sent.", "request_id": match_request.id}, status=201)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_to_request(request, request_id):
    try:
        match_request = MatchRequest.objects.get(id=request_id)
    except MatchRequest.DoesNotExist:
        return Response({"error": "Request not found."}, status=404)

    action = request.data.get("action")
    if action not in ['accept', 'reject']:
        return Response({"error": "Invalid action."}, status=400)

    if match_request.team_b.owner != request.user:
        return Response({"error": "Unauthorized."}, status=403)

    if action == 'accept':
        match_request.status = 'accepted'
        match_request.save()
        Match.objects.create(
            team_1=match_request.team_a,
            team_2=match_request.team_b,
            match_type='friendly'
        )
        return Response({"message": "Accepted."})

    match_request.status = 'rejected'
    match_request.save()
    return Response({"message": "Rejected."})





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
                "futsal": t.futsal.name if t.futsal else None,
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
        status='pending'
    )

    return Response({"message": "Match request sent.", "match_id": match.id}, status=201)


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
        match.save()
        return Response({"message": "Accepted."})

    match.delete()
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

    # ✅ Get user's team
    team = Team.objects.filter(owner=request.user).first()
    if not team:
        return Response({"error": "Your user is not linked to any team."}, status=400)

    if team not in [match.team_1, match.team_2]:
        return Response({"error": "You are not a participant in this match."}, status=403)

    # ✅ Get futsal from team
    futsal = team.futsal
    if not futsal:
        return Response({"error": "Your team has no assigned futsal."}, status=400)

    # ✅ Check for futsal conflict
    if Match.objects.filter(
        scheduled_date=date_obj,
        futsal=futsal,
        status='scheduled'
    ).exclude(id=match.id).exists():
        return Response({"error": "This futsal is already booked on that date."}, status=409)

    # ✅ Check for team conflict
    conflict = Match.objects.filter(
        scheduled_date=date_obj,
        is_completed=False,
        status__in=['confirmed', 'scheduled']
    ).filter(
        Q(team_1=match.team_1) | Q(team_2=match.team_1) |
        Q(team_1=match.team_2) | Q(team_2=match.team_2)
    ).exclude(id=match.id).exists()

    if conflict:
        return Response({"error": "One of the teams already has a match on that date."}, status=409)

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalize_match(request):
    match_id = request.data.get('match_id')
    winner_id = request.data.get('winner_id')
    goals_team_1 = request.data.get('goals_team_1')
    goals_team_2 = request.data.get('goals_team_2')

    # Validate input
    if not all([match_id, winner_id, goals_team_1 is not None, goals_team_2 is not None]):
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

    try:
        winner_team = Team.objects.get(id=winner_id)
    except Team.DoesNotExist:
        return Response({'error': 'Winner team not found.'}, status=404)

    if winner_team not in [match.team_1, match.team_2]:
        return Response({'error': 'Winner must be one of the participating teams.'}, status=400)

    # Finalize match
    match.winner = winner_team
    match.status = 'completed'
    match.is_completed = True
    match.save()

    # Call elo update with goals
    result = update_elo(
        team_a=match.team_1,
        team_b=match.team_2,
        winner_team=winner_team,
        goals_a=goals_team_1,
        goals_b=goals_team_2
    )

    return Response({
        'message': 'Match finalized and ELO updated.',
        'elo_result': result
    }, status=200)
