from django.urls import path
from .views import (
    FutsalListCreateView,
    FutsalDetailView,
    OwnerFutsalListView,
    TeamListCreateView,
    TeamMatchListCreateView,
    AcceptMatchView,
    RejectMatchView,
    UpdateMatchResultView,
    MyTeamView,
    PlayerDetailView,
    TeamDetailView,
    PlayerListCreateView,
    OtherTeamsListView,
)


urlpatterns = [

# For  futsal operation
    path('futsals/', FutsalListCreateView.as_view(), name='futsal-list-create'),
    path('my-futsals/', OwnerFutsalListView.as_view(), name='my-futsals'),
    path('futsals/<int:pk>/', FutsalDetailView.as_view(), name='futsal-detail'),

# For  Team  making and matchmaking
    path('teams/', TeamListCreateView.as_view(), name='team-list-create'),
    path('my-team/', MyTeamView.as_view(), name='my-team'),
    path('teams/<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    path('other-teams/', OtherTeamsListView.as_view(), name='other-teams'),

#Matches
    path('team-matches/', TeamMatchListCreateView.as_view(), name='team-match-list-create'),
    path('team-matches/<int:match_id>/accept/', AcceptMatchView.as_view(), name='accept-match'),
    path('team-matches/<int:match_id>/reject/', RejectMatchView.as_view(), name='reject-match'),
    path('team-matches/<int:match_id>/set-result/', UpdateMatchResultView.as_view(), name='set-match-result'),
    
#Players
    path('players/<int:pk>/', PlayerDetailView.as_view(), name='player-detail'),
    path('players/', PlayerListCreateView.as_view(), name='player-list-create'),

]
