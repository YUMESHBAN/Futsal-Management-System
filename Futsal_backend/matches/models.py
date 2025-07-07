from django.db import models
from accounts.models import CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

# ---------------------
# Team Model
# ---------------------
class Team(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    skill_level = models.CharField(max_length=20, blank=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

# ---------------------
# Venue Model
# ---------------------
class Venue(models.Model):
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='venues')
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    hourly_rate = models.DecimalField(max_digits=6, decimal_places=2)
    capacity = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.name

# ---------------------
# Match Model
# ---------------------
class Match(models.Model):
    MATCH_TYPES = [
        ('FRIENDLY', 'Friendly'),
        ('COMPETITIVE', 'Competitive'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    team1 = models.ForeignKey('Team', related_name='home_matches', on_delete=models.CASCADE)
    team2 = models.ForeignKey('Team', related_name='away_matches', on_delete=models.CASCADE, null=True, blank=True)
    match_type = models.CharField(max_length=11, choices=MATCH_TYPES)
    scheduled_time = models.DateTimeField()
    duration = models.PositiveIntegerField(default=60)  # in minutes
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_matches')
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.team2 and self.team1 == self.team2:
            raise ValidationError("A team cannot play against itself")

        if self.scheduled_time < timezone.localtime():
            raise ValidationError("Match time cannot be in the past")

        if self.venue and self.status in ['PENDING', 'CONFIRMED']:
            overlapping_matches = Match.objects.filter(
                venue=self.venue,
                scheduled_time__lt=self.end_time,
                scheduled_time__gt=self.scheduled_time,
            ).exclude(id=self.id).exclude(status='CANCELLED')

            if overlapping_matches.exists():
                raise ValidationError("Venue already booked for this time slot")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

        if self.status == 'CONFIRMED' and self.venue:
            Booking.objects.get_or_create(
                match=self,
                defaults={
                    'payment_status': 'PENDING',
                    'payment_method': 'CASH'
                }
            )

    @property
    def end_time(self):
        return self.scheduled_time + timedelta(minutes=self.duration)

    def __str__(self):
        return f"{self.team1} vs {self.team2 or 'TBD'} at {self.scheduled_time}"

# ---------------------
# Booking Model
# ---------------------
class Booking(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('CASH', 'Cash'),
        ('ESEWA', 'eSewa'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ]

    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name='booking')
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Booking for Match #{self.match.id}"

# ---------------------
# Commission Model
# ---------------------
class Commission(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    payment_proof = models.FileField(upload_to='commissions/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commission for Booking #{self.booking.id}"

# ---------------------
# Invoice Model
# ---------------------
class Invoice(models.Model):
    match = models.OneToOneField(Match, on_delete=models.CASCADE, related_name='invoice')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    is_paid = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.due_date:
            self.due_date = (timezone.now() + timedelta(days=7)).date()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invoice #{self.id} for Match {self.match.id}"
