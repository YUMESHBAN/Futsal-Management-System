from rest_framework import viewsets, generics, permissions, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
from django.db import models
from rest_framework.generics import ListAPIView
from datetime import datetime, timedelta


from .models import Futsal, Team, Player, TeamMatch,TimeSlot
from .serializers import (
    FutsalSerializer,
    TeamSerializer,
    TeamMatchSerializer,
    PlayerSerializer,
    TimeSlotSerializer,
)

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
        if Team.objects.filter(owner=self.request.user).exists():
            raise ValidationError({"detail": "You already have a team."})
        serializer.save(owner=self.request.user)


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
        return TeamMatch.objects.filter(
            models.Q(team_1__owner=user) | models.Q(team_2__owner=user)
        ).order_by('-created_at')  # Show both sent and received matches

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
        return Response({"detail": "Match accepted."})


class RejectMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)

        if match.team_2.owner != request.user:
            return Response({"detail": "Not authorized to reject this match."}, status=403)

        match.accepted = False
        match.save()
        return Response({"detail": "Match rejected."})


class UpdateMatchResultView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(TeamMatch, id=match_id)
        result = request.data.get('result')

        if match.team_1.owner != request.user and match.team_2.owner != request.user:
            return Response({"detail": "Not authorized to update match result."}, status=403)

        if result not in ['team_1', 'team_2', 'draw']:
            return Response({"detail": "Invalid result value."}, status=400)

        match.result = result
        match.save()
        return Response({"detail": f"Match result set to {result}."})
    


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