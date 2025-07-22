from django.urls import path
from .views import RegisterView, AdminCreateUserView, LoginView, LogoutView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('admin-create-user/', AdminCreateUserView.as_view()),
]
