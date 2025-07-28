from django.conf import settings
from django.db import models
from django.utils import timezone
import math
from core.models import CustomUser


class Futsal(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, limit_choices_to={'user_type': 'owner'})
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    contact_number = models.CharField(max_length=20)
    price_per_hour = models.DecimalField(max_digits=6, decimal_places=2)
    image = models.ImageField(upload_to='futsal_images/', null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True)
    skill_level = models.CharField(max_length=50, blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_teams'
    )

    # Competitive stats
    ranking = models.FloatField(default=1000.0)  # ELO-like rating
    wins = models.PositiveIntegerField(default=0)
    matches_played = models.PositiveIntegerField(default=0)

    # Optional home futsal
    futsal = models.ForeignKey(
        Futsal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teams'
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='created_teams'
    )

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('name', 'owner')

    def __str__(self):
        return self.name

    @property
    def win_rate(self):
        if self.matches_played == 0:
            return 0
        return round(self.wins / self.matches_played, 2)

    @property
    def weighted_score(self):
        return self.win_rate * math.log(self.matches_played + 1)


class Player(models.Model):
    POSITION_CHOICES = [
        ('Goalkeeper', 'Goalkeeper'),
        ('Defender', 'Defender'),
        ('Midfielder', 'Midfielder'),
        ('Forward', 'Forward')
    ]

    team = models.ForeignKey(Team, related_name='players', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, blank=True)
    photo = models.ImageField(upload_to='player_photos/', blank=True, null=True)
    is_captain = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.position}) - {self.team.name}"


class Match(models.Model):
    MATCH_TYPE_CHOICES = [
        ('competitive', 'Competitive'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
    ]

    team_1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team1_matches')
    team_2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='team2_matches')

    match_type = models.CharField(max_length=20, choices=MATCH_TYPE_CHOICES, default='friendly')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    scheduled_date = models.DateField(null=True, blank=True)

    futsal = models.ForeignKey(
        Futsal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches'
    )

    winner = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_won')
    is_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.team_1.name} vs {self.team_2.name} ({self.status})"


class MatchRequest(models.Model):
    MATCH_MODES = [
        ('friendly', 'Friendly'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    team_a = models.ForeignKey(Team, related_name='sent_requests', on_delete=models.CASCADE)
    team_b = models.ForeignKey(Team, related_name='received_requests', on_delete=models.CASCADE)

    mode = models.CharField(max_length=20, choices=MATCH_MODES, default='friendly')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request: {self.team_a.name} ➝ {self.team_b.name} [{self.status}]"
