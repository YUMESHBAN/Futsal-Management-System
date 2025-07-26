from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TeamMatch
from utils.email_service import send_match_invitation_email

@receiver(post_save, sender=TeamMatch)
def send_invitation_on_match_create(sender, instance, created, **kwargs):
    if created:
        # Send email to the owner of the invited team
        to_emails = [instance.team_2.owner.email] if instance.team_2.owner.email else []
        if to_emails:
            send_match_invitation_email(to_emails, instance)
