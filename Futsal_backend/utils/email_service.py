from django.core.mail import send_mail
from django.conf import settings

def send_match_invitation_email(to_emails, match):
    subject = 'HamroFutsal - You have a new match invitation!'

    futsal_name = match.time_slot.futsal.name if match.time_slot else "N/A"

    message = (
        f"Hello,\n\n"
        f"You have been invited to a {match.match_type} match.\n"
        f"Inviting Team: {match.team_1.name}\n"
        f"Scheduled Time: {match.scheduled_time}\n"
        f"Venue: {futsal_name}\n\n"
        f"Please log in to HamroFutsal to accept or decline the invitation."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        to_emails,
        fail_silently=False,
    )


def notify_futsal_owner_on_booking(match):
    if not match.time_slot or not match.time_slot.futsal:
        return

    futsal_owner_email = match.time_slot.futsal.owner.email
    if not futsal_owner_email:
        return

    subject = 'HamroFutsal - A slot has been booked at your venue!'
    message = (
        f"Dear {match.time_slot.futsal.owner.username},\n\n"
        f"A new match has been scheduled at your futsal:\n\n"
        f"Teams: {match.team_1.name} vs {match.team_2.name}\n"
        f"Match Type: {match.match_type}\n"
        f"Time: {match.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n"
        f"Venue: {match.time_slot.futsal.name}\n"
        f"Location: {match.time_slot.futsal.location}\n\n"
        f"Please ensure the venue is ready for the match."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [futsal_owner_email],
        fail_silently=False,
    )

def notify_sender_on_booking_confirmed(match):
    inviting_owner_email = match.team_1.owner.email
    if not inviting_owner_email:
        return

    subject = 'HamroFutsal - Your match invitation has been accepted!'
    message = (
        f"Hi {match.team_1.owner.username},\n\n"
        f"Your match invitation has been accepted!\n\n"
        f"Match Details:\n"
        f"Opponent: {match.team_2.name}\n"
        f"Time: {match.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n"
        f"Venue: {match.time_slot.futsal.name if match.time_slot else 'N/A'}\n\n"
        f"Good luck and enjoy the match!"
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [inviting_owner_email],
        fail_silently=False,
    )

def notify_sender_on_match_rejected(match):
    inviting_owner_email = match.team_1.owner.email
    if not inviting_owner_email:
        return

    subject = 'HamroFutsal - Your match invitation was rejected'
    message = (
        f"Hi {match.team_1.owner.username},\n\n"
        f"Unfortunately, your match invitation to {match.team_2.name} has been rejected.\n\n"
        f"Match Type: {match.match_type}\n"
        f"Originally Scheduled Time: {match.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n\n"
        f"You may try inviting another team or reschedule the match.\n\n"
        f"Thanks for using HamroFutsal!"
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [inviting_owner_email],
        fail_silently=False,
    )