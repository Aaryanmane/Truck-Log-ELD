from django.urls import path, include
from rest_framework.decorators import api_view
from rest_framework.response import Response


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
    path('api/', api_root, name='api-root'),
    path('api/', include('eld.urls')),
]
