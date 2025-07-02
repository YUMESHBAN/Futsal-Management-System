from django.urls import path
from .views import RecommendedVenuesView

urlpatterns = [
    path('recommendations/', RecommendedVenuesView.as_view(), name='venue-recommendations'),
]
