from django.core.mail import send_mail
from django.conf import settings


#----Friendly------

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
        f"The payment has been confirmed through E-Sewa. "
        f"Please ensure the venue is ready for the match."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [futsal_owner_email],
        fail_silently=False,
    )

def notify_accepter_on_payment_confirmed(match):
    accepter_email = match.team_2.owner.email
    if not accepter_email:
        return
    
    amount = match.time_slot.futsal.price_per_hour if match.time_slot else 'N/A'

    subject = 'HamroFutsal - Your booking and payment are confirmed!'
    message = (
        f"Hi {match.team_2.owner.username},\n\n"
        f"Your booking and payment for the match have been successfully confirmed!\n\n"
        f"Match Details:\n"
        f"Opponent: {match.team_1.name}\n"
        f"Time: {match.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n"
        f"Venue: {match.time_slot.futsal.name if match.time_slot else 'N/A'}\n"
        f"Amount Paid: {amount}\n\n"
        f"Thank you for completing the payment! Enjoy your match."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [accepter_email],
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

def notify_team_owners_match_result(match):
    if not match.result_updated:
        return

    result_text = {
        'team_1': f"{match.team_1.name} won 🎉",
        'team_2': f"{match.team_2.name} won 🎉",
        'draw': "The match ended in a draw 🤝",
        'pending': "Result is pending",
    }.get(match.result, "Unknown")

    subject = f'HamroFutsal - Match Result: {match.team_1.name} vs {match.team_2.name}'
    message = (
        f"Hi Team Owner,\n\n"
        f"The result for your recent match has been submitted:\n\n"
        f"Teams: {match.team_1.name} vs {match.team_2.name}\n"
        f"Final Score: {match.team_1_score} - {match.team_2_score}\n"
        f"Result: {result_text}\n"
        f"Date & Time: {match.scheduled_time.strftime('%Y-%m-%d %H:%M')}\n"
        f"Venue: {match.time_slot.futsal.name if match.time_slot else 'N/A'}\n\n"
        f"Thanks for playing with HamroFutsal!"
    )

    to_emails = list({
        match.team_1.owner.email,
        match.team_2.owner.email,
    })

    if to_emails:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            to_emails,
            fail_silently=False,
        )


#----Competitive------


def notify_receiver_of_match_request(match):
    receiver_email = match.team_2.owner.email
    if not receiver_email:
        return

    subject = 'HamroFutsal - You have a new competitive match invitation!'
    

    message = (
        f"Hi {match.team_2.owner.username},\n\n"
        f"You have been invited to a competitive futsal match!\n\n"
        f"Match Details:\n"
        f"Opponent: {match.team_1.name}\n\n"
        f"Please confirm your participation to secure the slot.\n\n"
        f"Good luck and enjoy the game!"
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [receiver_email],
        fail_silently=False,
    )



def notify_sender_on_match_acceptance(match):
    sender_email = match.team_1.owner.email
    if not sender_email:
        return

    subject = 'HamroFutsal - Your match invitation has been accepted!'

    # Include futsal details only if available
    venue = match.futsal.name if match.futsal else 'N/A'
    contact = match.futsal.contact_number if match.futsal else 'N/A'
    scheduled_date = match.scheduled_date.strftime('%Y-%m-%d') if match.scheduled_date else 'N/A'

    message = (
        f"Hi {match.team_1.owner.username},\n\n"
        f"Your competitive match invitation has been accepted!\n\n"
        f"Match Details:\n"
        f"Opponent: {match.team_2.name}\n"
        f"Scheduled Date: {scheduled_date}\n"
        f"Venue: {venue}\n"
        f"Contact Number: {contact}\n\n"
        f"Good luck and enjoy the game!"
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [sender_email],
        fail_silently=False,
    )



def notify_sender_on_match_rejection(match, alternatives):
    sender_email = match.team_1.owner.email
    if not sender_email:
        return

    subject = 'HamroFutsal - Your match invitation has been rejected'
    message = (
        f"Hi {match.team_1.owner.username},\n\n"
        f"Your competitive match invitation to {match.team_2.name} has been rejected.\n\n"
        f"Match Details:\n"
        f"Opponent: {match.team_2.name}\n"
        f"Please Consider alternative teams for a match\n"
    )
    
    

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [sender_email],
        fail_silently=False,
    )


def notify_futsal_owner_on_competitive_booking(match):
    futsal_owner_email = match.futsal.owner.email if match.futsal else None
    if not futsal_owner_email:
        return

    subject = 'HamroFutsal - Your futsal has been booked for a match!'

    # Get futsal and match details
    futsal = match.futsal.name if match.futsal else 'N/A'
    scheduled_date = match.scheduled_date.strftime('%Y-%m-%d') if match.scheduled_date else 'N/A'
    team_1_name = match.team_1.name
    team_2_name = match.team_2.name

    message = (
        f"Hi {match.futsal.owner.username},\n\n"
        f"Your futsal {futsal} has been booked for a competitive match!\n\n"
        f"Match Details:\n"
        f"Team 1: {team_1_name}\n"
        f"Team 2: {team_2_name}\n"
        f"Scheduled Date: {scheduled_date}\n"
        
        f"Please ensure the venue is ready for the match.\n\n"
        f"Good luck and enjoy the game!"
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [futsal_owner_email],
        fail_silently=False,
    )

def notify_teams_on_game_completion(match):
    # Get the emails of both teams' owners
    team_1_email = match.team_1.owner.email
    team_2_email = match.team_2.owner.email

    if not team_1_email or not team_2_email:
        return

    # Determine match result
    result = "Draw"
    if match.winner == match.team_1:
        result = f"{match.team_1.name} Won"
    elif match.winner == match.team_2:
        result = f"{match.team_2.name} Won"

    # Get futsal and contact information
    futsal = match.futsal.name if match.futsal else 'N/A'
    scheduled_date = match.scheduled_date.strftime('%Y-%m-%d') if match.scheduled_date else 'N/A'

    # Prepare the email content
    subject = 'HamroFutsal - Match Completed!'

    message = (
        f"Dear {match.team_1.owner.username} and {match.team_2.owner.username},\n\n"
        f"The competitive match between {match.team_1.name} and {match.team_2.name} has been completed!\n\n"
        f"Match Details:\n"
        f"Scheduled Date: {scheduled_date}\n"
        f"Venue: {futsal}\n"
        f"Match Result: {result}\n"
        f"{match.team_1.name}: {match.goals_team_1} Goals\n"
        f"{match.team_2.name}: {match.goals_team_2} Goals\n\n"
        f"Thank you for participating! See you in the next match."
    )

    # Send emails to both teams' owners
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [team_1_email, team_2_email],
        fail_silently=False,
    )










    