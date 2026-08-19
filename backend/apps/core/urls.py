from django.urls import path
from apps.core import views

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('auth/users/', views.list_demo_users, name='auth-users'),
    path('auth/quick-login/', views.quick_login, name='auth-quick-login'),
    path('auth/login/', views.login_view, name='auth-login'),
]
