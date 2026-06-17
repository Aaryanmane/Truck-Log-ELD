from rest_framework import serializers
from .models import Location, Trip, ELDLog

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = '__all__'
from rest_framework import serializers
from .models import Location, Trip, ELDLog

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class ELDLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ELDLog
        fields = '__all__'
