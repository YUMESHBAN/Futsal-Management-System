from django.urls import path
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
    path('team-matches/<int:match_id>/set-result/', UpdateMatchResultView.as_view(), name='set-match-result'),
]
