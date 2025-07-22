from django.db import models
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
