from django.urls import path
from .views import TripCreateView, PlanView

urlpatterns = [
    path('trips/', TripCreateView.as_view(), name='create-trip'),
    path('plan/', PlanView.as_view(), name='plan-trip'),
]
