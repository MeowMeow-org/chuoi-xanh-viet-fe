/** Style URL cho VietMap GL — xem https://maps.vietmap.vn/docs/sdk-web-gl/overview/ */
export type VietMapStyleVariant = "tm" | "lm" | "dm";

export function vietmapStyleUrl(
  apiKey: string,
  variant: VietMapStyleVariant = "tm",
): string {
  const key = apiKey.trim();
  return `https://maps.vietmap.vn/maps/styles/${variant}/style.json?apikey=${encodeURIComponent(key)}`;
}

/** Trung tâm mặc định — Việt Nam [lng, lat] */
export const VIETMAP_DEFAULT_CENTER: [number, number] = [106.6755666, 10.7588867];
