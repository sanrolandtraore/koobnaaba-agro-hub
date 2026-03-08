import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ParcelMapPreviewProps {
  coordinates: { lat: number; lng: number }[];
  height?: string;
  center?: { lat: number; lng: number };
}

const ParcelMapPreview = ({ coordinates, height = "250px", center }: ParcelMapPreviewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    const defaultCenter = center || (coordinates.length > 0
      ? { lat: coordinates.reduce((s, c) => s + c.lat, 0) / coordinates.length, lng: coordinates.reduce((s, c) => s + c.lng, 0) / coordinates.length }
      : { lat: 12.37, lng: -1.52 }); // Ouagadougou default

    const map = L.map(mapRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: coordinates.length > 0 ? 16 : 6,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
    }).addTo(map);

    // Add labels overlay
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    if (coordinates.length > 0) {
      // Draw markers
      coordinates.forEach((c, i) => {
        L.circleMarker([c.lat, c.lng], {
          radius: 6,
          color: "#22784a",
          fillColor: "#22784a",
          fillOpacity: 0.8,
          weight: 2,
        }).addTo(map).bindTooltip(`P${i + 1}`, { permanent: true, direction: "top", className: "text-xs" });
      });

      // Draw polygon if >= 3 points
      if (coordinates.length >= 3) {
        const latlngs = coordinates.map(c => [c.lat, c.lng] as L.LatLngTuple);
        const polygon = L.polygon(latlngs, {
          color: "#22784a",
          fillColor: "#22784a",
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map);
        map.fitBounds(polygon.getBounds().pad(0.2));
      } else {
        const group = L.featureGroup(
          coordinates.map(c => L.circleMarker([c.lat, c.lng]))
        );
        map.fitBounds(group.getBounds().pad(0.5));
      }
    }

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coordinates, center]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: "100%" }}
      className="rounded-lg border overflow-hidden"
    />
  );
};

export default ParcelMapPreview;
