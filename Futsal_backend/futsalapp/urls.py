from django.urls import path
from .views import RegisterView, LoginView, LogoutView, CurrentUserView
from .views import VenueListCreateView, BookingListCreateView
urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('user/', CurrentUserView.as_view()),
]
urlpatterns += [
    path('venues/', VenueListCreateView.as_view()),
    path('bookings/', BookingListCreateView.as_view()),
]