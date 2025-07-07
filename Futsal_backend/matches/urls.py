

from django.urls import path
from .views import (
    TeamListCreateView, VenueListCreateView, MatchCreateView, 
    MatchListView, MatchConfirmView, BookingCreateView
)
urlpatterns = [
    path('teams/', TeamListCreateView.as_view(), name='team-list-create'),
    path('venues/', VenueListCreateView.as_view(), name='venue-list-create'),
    path('create/', MatchCreateView.as_view(), name='match-create'),
    path('list/', MatchListView.as_view(), name='match-list'),
    path('<int:pk>/confirm/', MatchConfirmView.as_view(), name='match-confirm'),
    path('bookings/', BookingCreateView.as_view(), name='booking-create'),
]