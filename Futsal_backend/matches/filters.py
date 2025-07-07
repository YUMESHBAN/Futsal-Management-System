from django_filters import rest_framework as filters
from .models import Match

class MatchFilter(filters.FilterSet):
    class Meta:
        model = Match
        fields = {
            'match_type': ['exact'],
            'status': ['exact'],
            'scheduled_time': ['gte', 'lte', 'exact'],
            'venue': ['exact'],
            'team1': ['exact'],
            'team2': ['exact'],
        }