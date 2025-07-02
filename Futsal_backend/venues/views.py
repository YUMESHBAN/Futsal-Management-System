from rest_framework import generics
from .models import Venue
from .serializers import VenueSerializer

class RecommendedVenuesView(generics.ListAPIView):
    serializer_class = VenueSerializer

    def get_queryset(self):
        match_type = self.request.query_params.get('match_type')
        return Venue.objects.filter(is_available=True, match_type=match_type).order_by('-rating')
