from django.urls import path
from .views import (
    MatchListCreateView,
    MatchResponseView,
    MatchResultCreateView,
    MatchResultDetailView,
)

urlpatterns = [
    path('', MatchListCreateView.as_view(), name='match-list-create'),
    path('<int:pk>/respond/', MatchResponseView.as_view(), name='match-respond'),
    path('results/', MatchResultCreateView.as_view(), name='match-result-create'),
    path('results/<int:match_id>/', MatchResultDetailView.as_view(), name='match-result-detail'),
]