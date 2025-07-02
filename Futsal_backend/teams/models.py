from django.db import models
from accounts.models import CustomUser

class Team(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TeamMember(models.Model):
    POSITIONS = (
        ('GK', 'Goalkeeper'),
        ('DEF', 'Defender'),
        ('MID', 'Midfielder'),
        ('FWD', 'Forward'),
    )

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    position = models.CharField(max_length=10, choices=POSITIONS)
    photo = models.ImageField(upload_to='player_photos/', blank=True, null=True)
    is_captain = models.BooleanField(default=False)

    def __str__(self):
        return self.name
