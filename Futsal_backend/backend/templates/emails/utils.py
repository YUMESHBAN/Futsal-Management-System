# emails/utils.py
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.urls import reverse
from django.conf import settings

def send_match_request_email(match, request):
    """
    Send match request email to team2
    """
    team1 = match.team1
    team2 = match.team2
    context = {
        'recipient': team2.manager,
        'team': team1,
        'match': match,
        'accept_url': request.build_absolute_uri(
            reverse('match-confirm', kwargs={'pk': match.id})
        ),
        'reject_url': request.build_absolute_uri(
            reverse('match-reject', kwargs={'pk': match.id})
        )
    }
    
    subject = f"Match Request: {team1.name} vs {team2.name}"
    text_content = render_to_string('emails/match_request.txt', context)
    html_content = render_to_string('emails/match_request.html', context)
    
    email = EmailMultiAlternatives(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        [team2.manager.email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

def send_match_confirmation_email(match):
    """
    Send confirmation emails to both teams
    """
    booking = match.booking
    for team, opponent in [(match.team1, match.team2), (match.team2, match.team1)]:
        context = {
            'team': team,
            'opponent': opponent,
            'match': match,
            'booking': booking
        }
        
        subject = f"Match Confirmed: {team.name} vs {opponent.name}"
        text_content = render_to_string('emails/match_confirmation.txt', context)
        html_content = render_to_string('emails/match_confirmation.html', context)
        
        email = EmailMultiAlternatives(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [team.manager.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()