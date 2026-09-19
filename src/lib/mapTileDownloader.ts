// Utilitaire de pré-téléchargement et mise en cache des tuiles cartographiques hors-ligne
// Permet aux techniciens et éclaireurs de terrain de visualiser les cartes et données GPS sans réseau.

export interface TileBBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface TileDownloadProgress {
  total: number;
  completed: number;
  failed: number;
  percent: number;
  currentZoom: number;
  status: "idle" | "downloading" | "completed" | "error" | "aborted";
}

// Convert latitude / longitude to Slippy Map tile numbers at given zoom
export function latLngToTile(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  return { x, y };
}

// Clamp zoom levels for offline caching to avoid exploding storage
export const DEFAULT_OFFLINE_ZOOMS = [12, 13, 14, 15, 16, 17];

// Tile URL templates used by the application
export const TILE_PROVIDERS = [
  {
    name: "ArcGIS Satellite",
    urlTemplate: (z: number, y: number, x: number) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
  },
  {
    name: "CartoDB Labels",
    urlTemplate: (z: number, y: number, x: number) => {
      const sub = ["a", "b", "c", "d"][Math.abs(x + y) % 4];
      return `https://${sub}.basemaps.cartocdn.com/light_only_labels/${z}/${x}/${y}.png`;
    },
  },
  {
    name: "OpenStreetMap Standard",
    urlTemplate: (z: number, y: number, x: number) => {
      const sub = ["a", "b", "c"][Math.abs(x + y) % 3];
      return `https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
    },
  },
];

export const MAP_TILES_CACHE_NAME = "map-tiles-cache";

/**
 * Calcule toutes les URLs de tuiles nécessaires pour une bounding box et une liste de niveaux de zoom
 */
export function computeTilesForBBox(
  bbox: TileBBox,
  zooms: number[] = DEFAULT_OFFLINE_ZOOMS,
  providers = [TILE_PROVIDERS[0], TILE_PROVIDERS[1]] // Par défaut ArcGIS satellite + CartoDB labels
): string[] {
  const urls: string[] = [];
  const maxTilesPerBatch = 600; // Sécurité pour préserver la mémoire et le stockage

  for (const z of zooms) {
    const p1 = latLngToTile(bbox.maxLat, bbox.minLng, z);
    const p2 = latLngToTile(bbox.minLat, bbox.maxLng, z);

    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (const provider of providers) {
          urls.push(provider.urlTemplate(z, y, x));
        }
        if (urls.length >= maxTilesPerBatch) {
          return urls;
        }
      }
    }
  }

  return urls;
}

/**
 * Télécharge et pré-met en cache un ensemble d'URLs de tuiles cartographiques dans le CacheStorage du navigateur
 */
export async function downloadMapTiles(
  urls: string[],
  onProgress?: (progress: TileDownloadProgress) => void,
  abortSignal?: AbortSignal
): Promise<{ completed: number; failed: number }> {
  if (urls.length === 0) {
    return { completed: 0, failed: 0 };
  }

  let cache: Cache | null = null;
  if ("caches" in window) {
    try {
      cache = await window.caches.open(MAP_TILES_CACHE_NAME);
    } catch (e) {
      console.warn("Impossible d'ouvrir CacheStorage:", e);
    }
  }

  let completed = 0;
  let failed = 0;
  const total = urls.length;

  const notify = (status: TileDownloadProgress["status"] = "downloading") => {
    if (onProgress) {
      onProgress({
        total,
        completed,
        failed,
        percent: Math.round(((completed + failed) / total) * 100),
        currentZoom: 0,
        status,
      });
    }
  };

  notify("downloading");

  // Fetch avec concurrence limitée pour ne pas saturer le réseau
  const CONCURRENCY = 6;
  const queue = [...urls];

  const worker = async () => {
    while (queue.length > 0) {
      if (abortSignal?.aborted) {
        throw new Error("Download aborted");
      }
      const url = queue.shift();
      if (!url) break;

      try {
        // Vérifier si déjà en cache
        if (cache) {
          const match = await cache.match(url);
          if (match) {
            completed++;
            notify();
            continue;
          }
        }

        const res = await fetch(url, {
          mode: "cors",
          signal: abortSignal,
          cache: "reload", // force le téléchargement
        });

        if (res.ok || res.type === "opaque") {
          if (cache) {
            await cache.put(url, res.clone());
          }
          completed++;
        } else {
          failed++;
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          throw err;
        }
        failed++;
      } finally {
        notify();
      }
    }
  };

  try {
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker());
    await Promise.all(workers);
    notify("completed");
  } catch (err: any) {
    if (err.name === "AbortError" || err.message === "Download aborted") {
      notify("aborted");
    } else {
      notify("error");
    }
    throw err;
  }

  return { completed, failed };
}

/**
 * Calcule une bounding box englobant des coordonnées avec une marge de sécurité en degrés
 */
export function getBBoxFromCoordinates(
  coords: { lat: number; lng: number }[],
  paddingDeg: number = 0.008 // ~800m-1km autour de la parcelle
): TileBBox {
  if (coords.length === 0) {
    // Par défaut Ouagadougou
    return {
      minLat: 12.35 - paddingDeg,
      maxLat: 12.39 + paddingDeg,
      minLng: -1.54 - paddingDeg,
      maxLng: -1.50 + paddingDeg,
    };
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const c of coords) {
    if (c.lat < minLat) minLat = c.lat;
    if (c.lat > maxLat) maxLat = c.lat;
    if (c.lng < minLng) minLng = c.lng;
    if (c.lng > maxLng) maxLng = c.lng;
  }

  return {
    minLat: minLat - paddingDeg,
    maxLat: maxLat + paddingDeg,
    minLng: minLng - paddingDeg,
    maxLng: maxLng + paddingDeg,
  };
}

/**
 * Récupère le nombre de tuiles actuellement présentes dans le cache
 */
export async function getCachedTileCount(): Promise<number> {
  if (!("caches" in window)) return 0;
  try {
    const cache = await window.caches.open(MAP_TILES_CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch {
    return 0;
  }
}
