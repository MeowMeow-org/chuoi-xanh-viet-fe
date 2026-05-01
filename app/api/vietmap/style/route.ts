import { NextRequest, NextResponse } from "next/server";

import { getVietmapTileApiKey } from "@/lib/vietmapKeys";

const VARIANTS = new Set(["tm", "lm", "dm"]);

/**
 * Trả style.json (MapLibre v8) dùng raster tile của VietMap (`/api/{variant}/{z}/{x}/{y}.png`).
 *
 * Lý do dùng raster:
 * - Vector tile `vlc-*` của VietMap được mã hoá độc quyền — `@vietmap/vietmap-gl-js` v6
 *   (fork MapLibre) không kèm decoder nên parse PBF lỗi (`Unable to parse the tile`).
 * - Raster PNG là chuẩn, nhẹ, render ngay; không cần sprite/glyphs riêng.
 *
 * Tile URL trong style trỏ vào path proxy same-origin; key được proxy server inject,
 * không lộ ra client.
 */
export async function GET(req: NextRequest) {
  const v = req.nextUrl.searchParams.get("v") ?? "tm";
  if (!VARIANTS.has(v)) {
    return NextResponse.json(
      { message: "Biến thể style không hợp lệ" },
      { status: 400 },
    );
  }

  const tileKey = getVietmapTileApiKey();
  if (!tileKey) {
    return NextResponse.json(
      {
        message:
          "Chưa cấu hình VIETMAP_TILE_API_KEY (hoặc VIETMAP_API_KEY) cho tile VietMap",
      },
      { status: 503 },
    );
  }

  const origin = req.nextUrl.origin;
  const tileUrl = `${origin}/api/vietmap/proxy-vietmap/maps.vietmap.vn/api/${v}/{z}/{x}/{y}.png`;

  const style = {
    version: 8,
    name: `VietMap Raster (${v})`,
    sources: {
      "vietmap-raster": {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 19,
        attribution:
          '© <a href="https://vietmap.vn" target="_blank" rel="noreferrer">VietMap</a>',
      },
    },
    layers: [
      {
        id: "vietmap-raster",
        type: "raster",
        source: "vietmap-raster",
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  } as const;

  return NextResponse.json(style, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
