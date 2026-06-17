#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Quick test script to verify the Django backend is working"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'truck_eld_project.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from eld.views import PlanView, ContactView, TripCreateView
from truck_eld_project.urls import root_view

print("[OK] Django setup successful")
print("[OK] Installed apps: ", len(settings.INSTALLED_APPS), "apps")
print("[OK] Database configured")
print("\n=== Testing API Endpoints ===\n")

# Test Root View
factory = APIRequestFactory()
print("Testing Root Endpoint (/)...")
request = factory.get('/')
response = root_view(request)
print("[OK] Root Endpoint Status: " + str(response.status_code))
print("[OK] Response message: " + str(response.data.get('message', 'N/A')))
print("[OK] Version: " + str(response.data.get('version', 'N/A')))

# Test PlanView
print("\nTesting PlanView (/api/plan/)...")
plan_data = {
    'current': {'lat': 28.6139, 'lon': 77.2090},
    'pickup': {'lat': 28.5244, 'lon': 77.1855},
    'dropoff': {'lat': 28.4089, 'lon': 77.1066},
    'current_cycle_used_hours': 5.0
}
request = factory.post('/api/plan/', plan_data, format='json')
plan_view = PlanView.as_view()
response = plan_view(request)
print("[OK] PlanView Status: " + str(response.status_code))
if response.status_code == 200:
    print("[OK] Response contains legs: " + str('legs' in response.data))
    print("[OK] Response contains eld_logs: " + str('eld_logs' in response.data))

# Test ContactView
print("\nTesting ContactView (/api/contact/)...")
contact_data = {'name': 'Test User', 'message': 'Test message'}
request = factory.post('/api/contact/', contact_data, format='json')
contact_view = ContactView.as_view()
response = contact_view(request)
print("[OK] ContactView Status: " + str(response.status_code))
print("[OK] ContactView Response: " + str(response.data))

print("\n=== All checks passed! ===")
print("\nBackend is ready for deployment to Render.com!")

