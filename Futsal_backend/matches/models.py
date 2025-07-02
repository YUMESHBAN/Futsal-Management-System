from django.db import models
from teams.models import Team
from venues.models import Venue  # Assuming Venue model exists

class Match(models.Model):
    MATCH_TYPE_CHOICES = (
        ('friendly', 'Friendly'),
        ('competitive', 'Competitive'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )

    team_1 = models.ForeignKey(Team, related_name='initiated_matches', on_delete=models.CASCADE)
    team_2 = models.ForeignKey(Team, related_name='received_matches', on_delete=models.CASCADE, null=True, blank=True)
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True)
    match_type = models.CharField(max_length=20, choices=MATCH_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    scheduled_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_1 or 'TBD'} vs {self.team_2 or 'TBD'} ({self.match_type})"


class MatchResult(models.Model):
    match = models.OneToOneField(Match, on_delete=models.CASCADE)
    team_1_score = models.IntegerField()
    team_2_score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.match} - {self.team_1_score}:{self.team_2_score}"
