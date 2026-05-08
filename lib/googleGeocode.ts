/**
 * Địa chỉ → tọa độ qua `/api/geocode/search` (Google hoặc Nominatim trên server).
 * Không gọi maps.googleapis.com trực tiếp từ trình duyệt — tránh CORS / hạn chế referrer.
 */
export type AddressParts = {
  address?: string;
  ward?: string;
  district?: string;
  province?: string;
};

export function buildGeocodeQuery(parts: AddressParts): string {
  const bits = [
    parts.address?.trim(),
    parts.ward?.trim(),
    parts.district?.trim(),
    parts.province?.trim(),
  ].filter(Boolean);
  if (bits.length === 0) return "";
  return `${bits.join(", ")}, Việt Nam`;
}

export type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress?: string;
};

export async function geocodeVietnamAddress(
  query: string,
): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;

  const res = await fetch(
    `/api/geocode/search?${new URLSearchParams({ q })}`,
    { method: "GET" },
  );

  let data: {
    lat?: number;
    lng?: number;
    formattedAddress?: string;
    message?: string;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    throw new Error(`GEOCODE_${res.status}`);
  }

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const m = data.message?.trim() || "";
    if (res.status === 403 && /REQUEST_DENIED|denied/i.test(m)) {
      throw new Error("GOOGLE_DENIED");
    }
    throw new Error(m || `GEOCODE_${res.status}`);
  }

  if (
    typeof data.lat !== "number" ||
    typeof data.lng !== "number" ||
    Number.isNaN(data.lat) ||
    Number.isNaN(data.lng)
  ) {
    return null;
  }

  return {
    lat: data.lat,
    lng: data.lng,
    formattedAddress: data.formattedAddress,
  };
}
