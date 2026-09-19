import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression } from "leaflet";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";

export type ProviderMapService = {
  id: string;
  title: string;
  category: string;
  price: number;
  price_unit: string;
  location_name: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type Props = {
  services: ProviderMapService[];
  selectedId?: string | null;
  onSelect?: (service: ProviderMapService) => void;
};

const DEFAULT_CENTER: [number, number] = [12.3714, -1.5197];

function Recenter({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 12), { duration: 0.6 });
  }, [map, position]);
  return null;
}

function FitProviders({ services }: { services: ProviderMapService[] }) {
  const map = useMap();
  const points = useMemo(
    () => services
      .filter((s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude))
      .map((s) => [Number(s.latitude), Number(s.longitude)] as [number, number]),
    [services],
  );

  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points as LatLngBoundsExpression, { padding: [32, 32], maxZoom: 13 });
    } else if (points.length === 1) {
      map.flyTo(points[0], 13, { duration: 0.5 });
    }
  }, [map, points]);

  return null;
}

export default function ProviderMap({ services, selectedId, onSelect }: Props) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const mapped = services.filter(
    (s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude),
  );

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setUserPosition([coords.latitude, coords.longitude]),
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 },
    );
  };

  useEffect(() => {
    locate();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-muted/20 shadow-sm">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={7}
        scrollWheelZoom
        className="h-[420px] w-full md:h-[520px]"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitProviders services={mapped} />
        <Recenter position={userPosition} />

        {mapped.map((service) => (
          <CircleMarker
            key={service.id}
            center={[Number(service.latitude), Number(service.longitude)]}
            radius={selectedId === service.id ? 11 : 8}
            pathOptions={{
              color: selectedId === service.id ? "hsl(var(--accent))" : "hsl(var(--primary))",
              fillColor: selectedId === service.id ? "hsl(var(--accent))" : "hsl(var(--primary))",
              fillOpacity: 0.9,
              weight: 3,
            }}
            eventHandlers={{ click: () => onSelect?.(service) }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-1">
                <strong className="block">{service.title}</strong>
                <span className="block text-xs">{service.location_name ?? "Localisation renseignée"}</span>
                <span className="block text-xs font-semibold">
                  {Number(service.price).toLocaleString("fr-FR")} FCFA / {service.price_unit}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute left-3 top-3 rounded-xl bg-background/95 px-3 py-2 text-xs font-medium shadow backdrop-blur">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {mapped.length} prestataire{mapped.length > 1 ? "s" : ""} géolocalisé{mapped.length > 1 ? "s" : ""}
        </div>
      </div>

      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute bottom-4 right-4 h-11 w-11 rounded-full shadow-lg"
        onClick={locate}
        aria-label="Me localiser"
        title="Me localiser"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
}
