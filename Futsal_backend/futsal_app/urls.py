from django.urls import path
from futsal_app import views
from .views import (
    # Futsal & Time Slots
    FutsalListCreateView,
    OwnerFutsalListView,
    FutsalDetailView,
    TimeSlotListCreateView,
    TimeSlotDetailView,

    # Team & Players
    TeamListCreateView,
    MyTeamView,
    TeamDetailView,
    PlayerDetailView,
    PlayerListCreateView,
    OtherTeamsListView,

    # Matches
    TeamMatchListCreateView,
    AcceptMatchView,
    RejectMatchView,
    UpdateMatchResultView,
    GenerateTimeSlotsView,

    # Payment
    esewa_success_callback,
    esewa_failure_callback,
    SendPaymentEmailView, 
    ConfirmPaymentView,


    # Competitive
    RecommendedOpponentsView,
    SendMatchRequestView,
    RespondMatchRequestView,


)

urlpatterns = [
    # ----- Futsals -----
    path('futsals/', FutsalListCreateView.as_view(), name='futsal-list-create'),
    path('my-futsals/', OwnerFutsalListView.as_view(), name='my-futsals'),
    path('futsals/<int:pk>/', FutsalDetailView.as_view(), name='futsal-detail'),

    # ----- Time Slots -----
    path('time-slots/', TimeSlotListCreateView.as_view(), name='time-slot-list-create'),
    path('time-slots/<int:pk>/', TimeSlotDetailView.as_view(), name='time-slot-detail'),
    path('generate-time-slots/', GenerateTimeSlotsView.as_view(), name='generate-time-slots'),

    # ----- Teams -----
    path('teams/', TeamListCreateView.as_view(), name='team-list-create'),
    path('my-team/', MyTeamView.as_view(), name='my-team'),
    path('teams/<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('other-teams/', OtherTeamsListView.as_view(), name='other-teams'),

    # ----- Players -----
    path('players/', PlayerListCreateView.as_view(), name='player-list-create'),
    path('players/<int:pk>/', PlayerDetailView.as_view(), name='player-detail'),

    # ----- Matches -----
    path('team-matches/', TeamMatchListCreateView.as_view(), name='team-match-list-create'),
    path('team-matches/<int:match_id>/accept/', AcceptMatchView.as_view(), name='accept-match'),
    path('team-matches/<int:match_id>/reject/', RejectMatchView.as_view(), name='reject-match'),
    


    path("api/payments/callback/success/", esewa_success_callback),
    path("api/payments/callback/failure/", esewa_failure_callback),
    path('team-matches/<int:match_id>/send-payment-email/', SendPaymentEmailView.as_view(), name='send_payment_email'),
    path('team-matches/<int:match_id>/confirm-payment/', ConfirmPaymentView.as_view(), name='confirm_payment'),
    path('team-matches/<int:match_id>/update-result/', UpdateMatchResultView.as_view(), name='set-match-result'),


    path('competitive/request/<int:team_id>/', views.send_match_request, name='send-competitive-request'),
    path('competitive/respond/<int:match_id>/', views.respond_to_match_request, name='respond-competitive-request'),
    path('competitive/finalize/', views.finalize_match, name='finalize-competitive-match'),
    path('competitive/schedule/<int:match_id>/', views.schedule_match, name='schedule-match'),
    path('competitive/recommend/', views.recommend_competitive_match, name='recommend-match'),
    path('competitive/matches/', views.list_competitive_matches, name='competitive-matches'),
    path("owner/competitive-matches/", views.owner_competitive_matches),
    path('competitive/leaderboard/', views.competitive_leaderboard),

   

]
