from rest_framework import generics, permissions
from .models import Team
from .serializers import TeamSerializer

class TeamCreateView(generics.ListCreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Team.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save()
