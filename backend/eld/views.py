from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Trip, Location
from .serializers import TripSerializer, LocationSerializer
from .services import routing, eld_logic


class TripCreateView(generics.CreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer


class PlanView(APIView):
    """Accepts current/pickup/dropoff coordinates and returns route + generated ELD logs."""

    def post(self, request):
        data = request.data
        try:
            current = data['current']
            pickup = data['pickup']
            dropoff = data['dropoff']
        except KeyError:
            return Response({'error': 'current, pickup, dropoff required'}, status=status.HTTP_400_BAD_REQUEST)

        current_cycle = float(data.get('current_cycle_used_hours', 0.0))

        # Validate coords
        for p in (current, pickup, dropoff):
            if not all(k in p for k in ('lat', 'lon')):
                return Response({'error': 'locations must include lat and lon'}, status=status.HTTP_400_BAD_REQUEST)

        # Route legs: current -> pickup, pickup -> dropoff
        leg1 = routing.get_route_geometry(current['lat'], current['lon'], pickup['lat'], pickup['lon'])
        leg2 = routing.get_route_geometry(pickup['lat'], pickup['lon'], dropoff['lat'], dropoff['lon'])

        total_distance_km = (leg1.get('distance_km', 0) or 0) + (leg2.get('distance_km', 0) or 0)
        total_duration_hours = (leg1.get('duration_hours', 0) or 0) + (leg2.get('duration_hours', 0) or 0)

        logs = eld_logic.generate_eld_logs(
            distance_km=total_distance_km,
            duration_hours=total_duration_hours,
            pickup_hours=1.0,
            dropoff_hours=1.0,
            current_cycle_used_hours=current_cycle,
        )

        return Response({
            'legs': {
                'to_pickup': leg1,
                'to_dropoff': leg2,
                'total_distance_km': round(total_distance_km,2),
                'total_duration_hours': round(total_duration_hours,2),
            },
            'eld_logs': logs,
        })


class ContactView(APIView):
    """Simple contact endpoint used by the frontend. Accepts `name` and `message` in
    POST JSON and returns a simple acknowledgement. In production this can be
    extended to send an email to admins using Django's email utilities.
    """

    def post(self, request):
        data = request.data or {}
        name = data.get('name')
        message = data.get('message')

        if not name or not message:
            return Response({'error': 'name and message are required'}, status=status.HTTP_400_BAD_REQUEST)

        # TODO: send email to admins if EMAIL settings are configured.
        return Response({'ok': True})

