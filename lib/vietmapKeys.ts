/**
 * VietMap có thể tách 2 consumer: 1 cho Tile, 1 cho Geocode/Search.
 * - Ưu tiên key chuyên dụng (`*_TILE_API_KEY`, `*_GEOCODE_API_KEY`).
 * - Fallback `VIETMAP_API_KEY` (server-only) hoặc `NEXT_PUBLIC_VIETMAP_API_KEY` (legacy).
 */

function readEnvKey(name: string): string | null {
  const v = process.env[name];
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export function getVietmapTileApiKey(): string | null {
  return (
    readEnvKey("VIETMAP_TILE_API_KEY") ??
    readEnvKey("VIETMAP_API_KEY") ??
    readEnvKey("NEXT_PUBLIC_VIETMAP_API_KEY")
  );
}

export function getVietmapGeocodeApiKey(): string | null {
  return (
    readEnvKey("VIETMAP_GEOCODE_API_KEY") ??
    readEnvKey("VIETMAP_API_KEY") ??
    readEnvKey("NEXT_PUBLIC_VIETMAP_API_KEY")
  );
}
