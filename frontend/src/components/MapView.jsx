import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView({ legs }) {
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = L.map("map", { center: [37.7749, -122.4194], zoom: 6 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    if (!legs) return;

    const group = L.featureGroup();

    const toPickup = legs.to_pickup;
    const toDrop = legs.to_dropoff;

    if (toPickup && toPickup.geometry) {
      const geo = L.geoJSON(toPickup.geometry, {
        style: { color: "#0077cc", weight: 4 },
      });
      geo.addTo(group);
      const coords = toPickup.geometry.coordinates;
      const last = coords[coords.length - 1];
      L.marker([last[1], last[0]]).bindPopup("Pickup").addTo(group);
    }

    if (toDrop && toDrop.geometry) {
      const geo2 = L.geoJSON(toDrop.geometry, {
        style: { color: "#cc7700", weight: 4 },
      });
      geo2.addTo(group);
      const coords2 = toDrop.geometry.coordinates;
      const last2 = coords2[coords2.length - 1];
      L.marker([last2[1], last2[0]]).bindPopup("Dropoff").addTo(group);
    }

    if (group.getLayers().length > 0) {
      group.addTo(mapRef.current);
      mapRef.current.fitBounds(group.getBounds(), { padding: [40, 40] });
      layerRef.current = group;
    }
  }, [legs]);

  return (
    <div
      id="map"
      style={{ flex: 1, minHeight: 320, border: "1px solid #ddd" }}
    ></div>
  );
}
