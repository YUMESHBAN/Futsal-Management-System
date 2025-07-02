from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from .models import Match, MatchResult
from teams.models import Team
from .serializers import MatchSerializer, MatchResultSerializer

class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user_team = Team.objects.filter(created_by=self.request.user).first()
        if not user_team:
            raise ValidationError("You must create a team before requesting a match.")

        team_2_id = self.request.data.get('team_2')
        if not Team.objects.filter(id=team_2_id).exists():
            raise ValidationError(f"Team with ID {team_2_id} does not exist.")

        serializer.save(team_1=user_team)

    def get_queryset(self):
        user_team = Team.objects.filter(created_by=self.request.user).first()
        if not user_team:
            return Match.objects.none()
        return Match.objects.filter(team_1=user_team) | Match.objects.filter(team_2=user_team)


class MatchResponseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            match = Match.objects.get(pk=pk)
        except Match.DoesNotExist:
            raise NotFound("Match not found.")

        user_team = Team.objects.filter(created_by=request.user).first()
        if not user_team or match.team_2 != user_team:
            raise PermissionDenied("You are not authorized to respond to this match.")

        response = request.data.get("status")
        if response not in ["accepted", "rejected"]:
            return Response({"error": "Status must be 'accepted' or 'rejected'."}, status=400)

        match.status = response
        match.save()
        return Response({"message": f"Match {response}."}, status=200)


class MatchResultCreateView(generics.CreateAPIView):
    queryset = MatchResult.objects.all()
    serializer_class = MatchResultSerializer
    permission_classes = [permissions.IsAuthenticated]


class MatchResultDetailView(generics.RetrieveAPIView):
    queryset = MatchResult.objects.all()
    serializer_class = MatchResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'match_id'