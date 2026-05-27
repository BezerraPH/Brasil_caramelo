/** Geo helpers para mapa de pet shops (PE — Recife / Caruaru). */

export const PET_SHOP_MAP_BOUNDS = {
  minLat: -8.35,
  maxLat: -8.0,
  minLng: -36.05,
  maxLng: -34.82,
};

export function latLngToMapPercent(lat: number, lng: number): { left: string; top: string } {
  const { minLat, maxLat, minLng, maxLng } = PET_SHOP_MAP_BOUNDS;
  const x = ((lng - minLng) / (maxLng - minLng)) * 100;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
  return {
    left: `${Math.min(96, Math.max(4, x))}%`,
    top: `${Math.min(92, Math.max(8, y))}%`,
  };
}

/** Distância aproximada em km (Haversine). */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Centro aproximado por cidade (para ordenar cupons). */
export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  recife: { lat: -8.0476, lng: -34.877 },
  caruaru: { lat: -8.2832, lng: -35.9722 },
};

export function cityCenter(city: string | null | undefined): { lat: number; lng: number } | null {
  if (!city?.trim()) return null;
  return CITY_CENTERS[city.trim().toLowerCase()] ?? null;
}
