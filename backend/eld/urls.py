from django.urls import path
from .views import TripCreateView, PlanView, ContactView

urlpatterns = [
    path('trips/', TripCreateView.as_view(), name='create-trip'),
    path('plan/', PlanView.as_view(), name='plan-trip'),
    path('contact/', ContactView.as_view(), name='contact'),
]
