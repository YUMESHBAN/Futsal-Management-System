from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Venue(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=20, default='Booked')  # e.g., Booked, Cancelled

    def __str__(self):
        return f"{self.venue.name} booked by {self.user.username} on {self.date} at {self.time}"
