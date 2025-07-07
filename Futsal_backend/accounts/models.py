from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        PLAYER = 'PLAYER', 'Player'
        OWNER = 'OWNER', 'Futsal Owner'
        ADMIN = 'ADMIN', 'System Admin'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PLAYER
    )
    phone = models.CharField(max_length=15, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"