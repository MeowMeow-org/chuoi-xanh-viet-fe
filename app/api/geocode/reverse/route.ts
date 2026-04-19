import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy reverse geocoding (OSM Nominatim) — tránh CORS và gửi User-Agent hợp lệ.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ message: "Thiếu lat hoặc lon" }, { status: 400 });
  }

  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) {
    return NextResponse.json({ message: "lat/lon không hợp lệ" }, { status: 400 });
  }
  if (latN < -90 || latN > 90 || lonN < -180 || lonN > 180) {
    return NextResponse.json({ message: "Tọa độ ngoài phạm vi" }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(latN));
  url.searchParams.set("lon", String(lonN));
  url.searchParams.set("format", "json");
  url.searchParams.set("accept-language", "vi,en");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "ChuoiXanhViet-Marketplace/1.0 (contact via site owner)",
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: `Geocode HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const data = (await res.json()) as Record<string, unknown>;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Không gọi được dịch vụ địa chỉ" }, { status: 502 });
  }
}
