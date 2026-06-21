from django.urls import path, include
from django.contrib import admin
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET'])
def root_view(request):
    """Root endpoint - redirects to API documentation"""
    return Response({
        'message': 'Truck ELD Backend API Server',
        'version': '1.0.0',
        'status': 'running',
        'api_endpoint': '/api/',
        'admin': '/admin/',
        'endpoints': {
            'api_root': '/api/',
            'plan': '/api/plan/',
            'trips': '/api/trips/',
            'contact': '/api/contact/',
        }
    })


@api_view(['GET'])
def api_root(request):
    return Response({
        'message': 'Truck ELD API',
        'endpoints': {
            'plan': '/api/plan/',
            'trips': '/api/trips/',
            'contact': '/api/contact/',
        }
    })

urlpatterns = [
    path('', root_view, name='root'),
    # Combine the API routes
    path('api/', include('eld.urls')),
    path('admin/', admin.site.urls),
]
