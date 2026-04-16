/**
 * Google Geocoding API — cần bật "Geocoding API" trong Google Cloud
 * và biến môi trường NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (nên giới hạn theo HTTP referrer).
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

export type GeocodeResult = { lat: number; lng: number; formattedAddress?: string };

export async function geocodeVietnamAddress(
  query: string,
): Promise<GeocodeResult | null> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
  if (!key) {
    throw new Error("MISSING_GOOGLE_KEY");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("key", key);
  url.searchParams.set("region", "vn");
  url.searchParams.set("language", "vi");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("GEOCODE_HTTP");
  }

  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      formatted_address?: string;
      geometry?: { location?: { lat: number; lng: number } };
    }>;
    error_message?: string;
  };

  if (data.status === "ZERO_RESULTS" || !data.results?.length) {
    return null;
  }

  if (data.status === "REQUEST_DENIED") {
    throw new Error("GOOGLE_DENIED");
  }

  if (data.status !== "OK") {
    throw new Error(data.error_message || data.status || "GEOCODE_FAIL");
  }

  const loc = data.results[0].geometry?.location;
  if (loc == null || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
    return null;
  }

  return {
    lat: loc.lat,
    lng: loc.lng,
    formattedAddress: data.results[0].formatted_address,
  };
}
