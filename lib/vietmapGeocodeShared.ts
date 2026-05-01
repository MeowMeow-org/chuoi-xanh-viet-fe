/**
 * Trích tọa độ từ JSON VietMap Search / các biến thể phổ biến.
 * API 1.1 và một số phiên bản trả mảng đối tượng có lat/lng.
 */

export function extractGeocodePoint(data: unknown): {
  lat: number;
  lng: number;
  label?: string;
} | null {
  if (data == null) return null;

  if (Array.isArray(data)) {
    for (const item of data) {
      const p = extractFromObject(item);
      if (p) return p;
    }
    return null;
  }

  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["features", "results", "data", "items"]) {
      const nested = o[key];
      if (nested != null) {
        const p = extractGeocodePoint(nested);
        if (p) return p;
      }
    }
    return extractFromObject(data);
  }

  return null;
}

function extractFromObject(item: unknown): {
  lat: number;
  lng: number;
  label?: string;
} | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;

  const latRaw = o.lat ?? o.latitude;
  const lngRaw = o.lng ?? o.longitude ?? o.lon;
  const lat = typeof latRaw === "number" ? latRaw : Number(latRaw);
  const lng = typeof lngRaw === "number" ? lngRaw : Number(lngRaw);
  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  ) {
    const label =
      typeof o.display === "string"
        ? o.display
        : typeof o.formatted_address === "string"
          ? o.formatted_address
          : typeof o.name === "string" && typeof o.address === "string"
            ? `${o.name}, ${o.address}`
            : undefined;
    return { lat, lng, label };
  }

  const geom = o.geometry as { type?: string; coordinates?: unknown } | undefined;
  const coords = geom?.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    const a = coords[0];
    const b = coords[1];
    const lngG = typeof a === "number" ? a : Number(a);
    const latG = typeof b === "number" ? b : Number(b);
    if (
      Number.isFinite(latG) &&
      Number.isFinite(lngG) &&
      latG >= -90 &&
      latG <= 90 &&
      lngG >= -180 &&
      lngG <= 180
    ) {
      return { lat: latG, lng: lngG };
    }
  }

  return null;
}
