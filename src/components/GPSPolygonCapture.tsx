import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2, Navigation } from "lucide-react";
import { toast } from "sonner";

interface Coordinate {
  lat: number;
  lng: number;
}

interface GPSPolygonCaptureProps {
  value: Coordinate[];
  onChange: (coords: Coordinate[]) => void;
}

export const GPSPolygonCapture = ({ value, onChange }: GPSPolygonCaptureProps) => {
  const [capturing, setCapturing] = useState(false);

  const captureCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("GPS non disponible sur cet appareil");
      return;
    }
    setCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoord: Coordinate = {
          lat: Math.round(pos.coords.latitude * 1000000) / 1000000,
          lng: Math.round(pos.coords.longitude * 1000000) / 1000000,
        };
        onChange([...value, newCoord]);
        toast.success(`Point ${value.length + 1} capturé`);
        setCapturing(false);
      },
      (err) => {
        toast.error("Erreur GPS: " + err.message);
        setCapturing(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [value, onChange]);

  const removePoint = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const toGeoJSON = () => {
    if (value.length < 3) return null;
    const coords = value.map((c) => [c.lng, c.lat]);
    coords.push(coords[0]); // close polygon
    return { type: "Polygon" as const, coordinates: [coords] };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Points GPS ({value.length}/min 3)</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={captureCurrentPosition}
          disabled={capturing}
        >
          {capturing ? (
            <Navigation className="h-4 w-4 mr-1 animate-pulse" />
          ) : (
            <MapPin className="h-4 w-4 mr-1" />
          )}
          {capturing ? "Capture..." : "Capturer point"}
        </Button>
      </div>

      {value.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-2 space-y-1 max-h-40 overflow-y-auto">
          {value.map((coord, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="font-mono">
                P{i + 1}: {coord.lat}, {coord.lng}
              </span>
              <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removePoint(i)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length >= 3 && (
        <p className="text-xs text-success flex items-center gap-1">
          <Plus className="h-3 w-3" /> Polygone valide — {value.length} sommets
        </p>
      )}
    </div>
  );
};

export const coordsToGeoJSON = (coords: { lat: number; lng: number }[]) => {
  if (coords.length < 3) return null;
  const points = coords.map((c) => [c.lng, c.lat]);
  points.push(points[0]);
  return { type: "Polygon" as const, coordinates: [points] };
};
