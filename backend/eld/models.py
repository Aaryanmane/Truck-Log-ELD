from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=200)
    lat = models.FloatField()
    lon = models.FloatField()

    def __str__(self):
        return self.name

class Trip(models.Model):
    current_location = models.ForeignKey(Location, related_name='current_trips', on_delete=models.CASCADE)
    pickup_location = models.ForeignKey(Location, related_name='pickup_trips', on_delete=models.CASCADE)
    dropoff_location = models.ForeignKey(Location, related_name='dropoff_trips', on_delete=models.CASCADE)
    current_cycle_used_hours = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

class ELDLog(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    day_index = models.IntegerField()
    entries = models.JSONField(default=list)
