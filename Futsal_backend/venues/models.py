from django.db import models

class Venue(models.Model):
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    is_available = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)
    match_type = models.CharField(max_length=20, choices=[('friendly', 'Friendly'), ('competitive', 'Competitive')])

    def __str__(self):
        return self.name
