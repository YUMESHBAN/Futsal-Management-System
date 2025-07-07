from rest_framework import permissions
from .models import Match, Team, Venue

class IsTeamOwner(permissions.BasePermission):
    """Check if user owns the team"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Team):
            return obj.created_by == request.user
        return False

class IsVenueOwner(permissions.BasePermission):
    """Check if user owns the venue"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Venue):
            return obj.owner == request.user
        return False

class IsMatchParticipant(permissions.BasePermission):
    """Check if user is part of the match (team1, team2 or venue owner)"""
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Match):
            return (
                request.user == obj.team1.created_by or
                request.user == obj.team2.created_by or
                (obj.venue and request.user == obj.venue.owner)
            )
        return False