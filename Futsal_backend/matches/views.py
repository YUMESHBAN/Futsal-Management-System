from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db import models
from .models import Team, Venue, Match, Booking, Commission
from .serializers import TeamSerializer, VenueSerializer, MatchSerializer, BookingSerializer, CommissionSerializer
import logging
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated



logger = logging.getLogger(__name__)

# Team Views
class TeamListCreateView(generics.ListCreateAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

# Venue Views 
class VenueListCreateView(generics.ListCreateAPIView):
    serializer_class = VenueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Venue.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# Match Views
class MatchCreateView(generics.CreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    
    def perform_create(self, serializer):
        match = serializer.save(created_by=self.request.user)
        
        # Create initial booking
        Booking.objects.create(
            match=match,
            payment_status='PENDING',
            payment_method='CASH'
        )
        
    
        

class MatchConfirmView(generics.UpdateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['patch']

    def get_queryset(self):
        return Match.objects.filter(
            status='PENDING',
            team2__isnull=False,
            team2__created_by=self.request.user
        )

    def perform_update(self, serializer):
        match = serializer.instance
        
        # Additional validation
        if match.scheduled_time < timezone.now():
            raise PermissionDenied("Cannot confirm past matches")
            
        if match.venue and Match.objects.filter(
            venue=match.venue,
            scheduled_time__lt=match.end_time,
            scheduled_time__gte=match.scheduled_time,
            status='CONFIRMED'
        ).exclude(id=match.id).exists():
            raise PermissionDenied("Venue already booked for this time")

        match.status = 'CONFIRMED'
        match.save()
        
        Booking.objects.get_or_create(
            match=match,
            defaults={
                'payment_status': 'PENDING',
                'payment_method': 'CASH'
            }
        )
        logger.info(f"Match {match.id} confirmed by {self.request.user}")

class MatchListView(generics.ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(
            models.Q(team1__created_by=user) |
            models.Q(team2__created_by=user)
        ).order_by('-scheduled_time')

# Booking Views
class BookingCreateView(generics.CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]