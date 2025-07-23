from django.db import models
from core.models import CustomUser
from django.conf import settings

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
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Player(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    is_captain = models.BooleanField(default=False)
    is_goalkeeper = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='player_photos/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.team.name}"
    


class TeamMatch(models.Model):
    MATCH_TYPES = [
        ('friendly', 'Friendly'),
        ('competitive', 'Competitive'),
    ]

    RESULT_CHOICES = [
        ('team_1', 'Team 1 Won'),
        ('team_2', 'Team 2 Won'),
        ('draw', 'Draw'),
        ('pending', 'Pending'),
    ]

    team_1 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='sent_matches')
    team_2 = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='received_matches')
    match_type = models.CharField(max_length=20, choices=MATCH_TYPES)
    scheduled_time = models.DateTimeField()
    accepted = models.BooleanField(null=True)  # None = Pending, True = Accepted, False = Rejected
    result = models.CharField(max_length=20, choices=RESULT_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = (
            "Accepted" if self.accepted is True else
            "Rejected" if self.accepted is False else
            "Pending"
        )
        return f"{self.team_1.name} vs {self.team_2.name} ({self.match_type}) [{status}]"
