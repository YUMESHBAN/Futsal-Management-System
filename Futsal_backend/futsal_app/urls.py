from django.urls import path
from .views import FutsalListCreateView, FutsalDetailView, OwnerFutsalListView

urlpatterns = [
    path('futsals/', FutsalListCreateView.as_view(), name='futsal-list-create'),
    path('my-futsals/', OwnerFutsalListView.as_view(), name='my-futsals'),
    path('futsals/<int:pk>/', FutsalDetailView.as_view(), name='futsal-detail'),
]
