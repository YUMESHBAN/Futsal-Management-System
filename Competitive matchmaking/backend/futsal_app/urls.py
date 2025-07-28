from django.urls import path, include
from rest_framework.routers import DefaultRouter
from futsal_app import views

router = DefaultRouter()
router.register(r'players', views.PlayerViewSet, basename='player')


urlpatterns = [
    # Futsal CRUD
    path('futsals/', views.FutsalListCreateView.as_view(), name='futsal-list-create'),
    path('futsals/<int:pk>/', views.FutsalDetailView.as_view(), name='futsal-detail'),
    path('my-futsals/', views.OwnerFutsalListView.as_view(), name='my-futsals'),

    # Teams
    path('my-team/', views.MyTeamView.as_view(), name='my-team'),
    path('teams/', views.TeamListCreateView.as_view(), name='team-list-create'),
    path('teams/<int:pk>/', views.TeamDetailView.as_view(), name='team-detail'),
    path('other-teams/', views.OtherTeamsListView.as_view(), name='other-teams'),

    # Players (handled via router too)
    path('players/<int:pk>/', views.PlayerDetailView.as_view(), name='player-detail'),
    path('my-players/', views.PlayerListCreateView.as_view(), name='my-players'),

    # Friendly Match
    path('friendly-matches/request/', views.create_friendly_match, name='friendly-match-request'),
    path('friendly-matches/respond/<int:request_id>/', views.respond_to_request, name='respond-friendly-request'),

    # Competitive Match
    path('competitive/request/<int:team_id>/', views.send_match_request, name='send-competitive-request'),
    path('competitive/respond/<int:match_id>/', views.respond_to_match_request, name='respond-competitive-request'),
    path('competitive/finalize/', views.finalize_match, name='finalize-competitive-match'),
    path('competitive/schedule/<int:match_id>/', views.schedule_match, name='schedule-match'),
    path('competitive/recommend/', views.recommend_competitive_match, name='recommend-match'),

    # Router-based endpoints
    path('', include(router.urls)),
]
