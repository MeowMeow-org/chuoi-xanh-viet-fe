/**
 * Bật UI VietMap ở client (tiles/style).
 * Server vẫn dùng VIETMAP_TILE_API_KEY / VIETMAP_GEOCODE_API_KEY riêng.
 */
export function isVietmapClientEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_VIETMAP_ENABLED?.trim().toLowerCase();
  if (flag === "1" || flag === "true") return true;
  return Boolean(process.env.NEXT_PUBLIC_VIETMAP_API_KEY?.trim());
}
