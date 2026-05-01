import { NextRequest, NextResponse } from "next/server";

import { getVietmapGeocodeApiKey } from "@/lib/vietmapKeys";

const USER_AGENT = "ChuoiXanhViet-VietMapPlace/1.0";

/**
 * Chi tiết địa điểm theo ref_id từ Autocomplete → lat/lng.
 * @see https://maps.vietmap.vn/docs/map-api/place-v4/
 */
export async function GET(req: NextRequest) {
  const refId = req.nextUrl.searchParams.get("refId")?.trim();
  if (!refId) {
    return NextResponse.json({ message: "Thiếu refId" }, { status: 400 });
  }

  const apiKey = getVietmapGeocodeApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { message: "Chưa cấu hình VIETMAP_GEOCODE_API_KEY cho Place" },
      { status: 503 },
    );
  }

  try {
    const url = new URL("https://maps.vietmap.vn/api/place/v4");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("refid", refId);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown;
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json(
        { message: `VietMap không trả JSON (HTTP ${res.status})` },
        { status: 502 },
      );
    }

    if (!res.ok) {
      const msg =
        typeof data === "object" &&
        data &&
        "message" in data &&
        typeof (data as { message: unknown }).message === "string"
          ? (data as { message: string }).message
          : `VietMap HTTP ${res.status}`;
      return NextResponse.json(
        { message: msg },
        { status: res.status === 401 || res.status === 403 ? 403 : 502 },
      );
    }

    const o = data as Record<string, unknown>;
    const lat = typeof o.lat === "number" ? o.lat : Number(o.lat);
    const lng = typeof o.lng === "number" ? o.lng : Number(o.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { message: "Place không có tọa độ hợp lệ" },
        { status: 502 },
      );
    }

    const formattedAddress =
      typeof o.display === "string" && o.display.trim().length > 0
        ? o.display.trim()
        : undefined;

    return NextResponse.json({
      lat,
      lng,
      formattedAddress,
    });
  } catch {
    return NextResponse.json(
      { message: "Lỗi gọi VietMap Place" },
      { status: 502 },
    );
  }
}
