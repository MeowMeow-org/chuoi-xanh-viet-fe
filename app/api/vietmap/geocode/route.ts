import { NextRequest, NextResponse } from "next/server";

import { extractGeocodePoint } from "@/lib/vietmapGeocodeShared";
import { getVietmapGeocodeApiKey } from "@/lib/vietmapKeys";

const USER_AGENT = "ChuoiXanhViet-VietMapProxy/1.0";

/**
 * Geocode qua VietMap Search API. Dùng `VIETMAP_GEOCODE_API_KEY` (consumer được cấp Search/Geocode).
 * Docs: https://maps.vietmap.vn/docs/ — GET /api/search?api-version=1.1&text=...
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json(
      { message: "Thiếu q hoặc chuỗi tìm quá ngắn" },
      { status: 400 },
    );
  }

  const apiKey = getVietmapGeocodeApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "Chưa cấu hình VIETMAP_GEOCODE_API_KEY (hoặc VIETMAP_API_KEY) cho Geocode",
      },
      { status: 503 },
    );
  }

  const focusLat = req.nextUrl.searchParams.get("focusLat");
  const focusLon = req.nextUrl.searchParams.get("focusLon");

  try {
    const url = new URL("https://maps.vietmap.vn/api/search");
    url.searchParams.set("api-version", "1.1");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("text", q);
    const fl = focusLat != null ? Number(focusLat) : NaN;
    const fo = focusLon != null ? Number(focusLon) : NaN;
    if (Number.isFinite(fl) && Number.isFinite(fo)) {
      url.searchParams.set("focus.point.lat", String(fl));
      url.searchParams.set("focus.point.lon", String(fo));
    }

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      next: { revalidate: 0 },
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json(
        { message: `VietMap không trả JSON hợp lệ (HTTP ${res.status})` },
        { status: 502 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            typeof data === "object" &&
            data &&
            "message" in data &&
            typeof (data as { message: unknown }).message === "string"
              ? (data as { message: string }).message
              : `VietMap HTTP ${res.status}`,
        },
        { status: res.status === 401 || res.status === 403 ? 403 : 502 },
      );
    }

    const point = extractGeocodePoint(data);
    if (!point) {
      return NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });
    }

    return NextResponse.json({
      lat: point.lat,
      lng: point.lng,
      formattedAddress: point.label,
    });
  } catch {
    return NextResponse.json(
      { message: "Lỗi gọi VietMap Search" },
      { status: 502 },
    );
  }
}
