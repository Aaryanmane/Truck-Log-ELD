import requests

def get_route_geometry(start_lat, start_lon, end_lat, end_lon, api_key=None):
    """Query public OSRM demo server for a route between two points.

    Returns: dict with keys: geometry (GeoJSON LineString or None), distance_km (float), duration_hours (float)
    """
    try:
        coords = f"{start_lon},{start_lat};{end_lon},{end_lat}"
        url = f"https://router.project-osrm.org/route/v1/driving/{coords}?overview=full&geometries=geojson&steps=false"
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if 'routes' in data and len(data['routes']) > 0:
            route = data['routes'][0]
            distance_m = route.get('distance', 0)
            duration_s = route.get('duration', 0)
            geometry = route.get('geometry')
            return {
                'geometry': geometry,
                'distance_km': distance_m / 1000.0,
                'duration_hours': duration_s / 3600.0,
            }
    except Exception:
        pass
    return {'geometry': None, 'distance_km': 0.0, 'duration_hours': 0.0}
