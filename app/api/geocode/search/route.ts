import { NextRequest, NextResponse } from "next/server";

const USER_AGENT = "ChuoiXanhViet-FarmForm/1.0 (contact via site owner)";

/**
 * Địa chỉ → tọa độ (proxy server).
 * - Có `GOOGLE_MAPS_SERVER_KEY` hoặc `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Geocoding API.
 * - Không: OpenStreetMap Nominatim (giới hạn sử dụng — chỉ phục vụ form nông trại).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json(
      { message: "Thiếu q hoặc chuỗi tìm quá ngắn" },
      { status: 400 },
    );
  }

  const googleKey =
    process.env.GOOGLE_MAPS_SERVER_KEY?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (googleKey) {
    try {
      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", q);
      url.searchParams.set("key", googleKey);
      url.searchParams.set("region", "vn");

      const res = await fetch(url.toString(), { next: { revalidate: 0 } });
      const data = (await res.json()) as {
        status: string;
        results?: Array<{
          geometry?: { location?: { lat: number; lng: number } };
          formatted_address?: string;
        }>;
        error_message?: string;
      };

      if (data.status === "ZERO_RESULTS" || !data.results?.length) {
        return NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });
      }

      if (data.status !== "OK") {
        const status =
          data.status === "REQUEST_DENIED" || data.status === "INVALID_REQUEST"
            ? 403
            : 502;
        return NextResponse.json(
          {
            message:
              data.error_message?.trim() ||
              `Google Geocoding: ${data.status}`,
          },
          { status },
        );
      }

      const r = data.results[0];
      const loc = r.geometry?.location;
      if (
        !loc ||
        typeof loc.lat !== "number" ||
        typeof loc.lng !== "number" ||
        Number.isNaN(loc.lat) ||
        Number.isNaN(loc.lng)
      ) {
        return NextResponse.json(
          { message: "Phản hồi Google không hợp lệ" },
          { status: 502 },
        );
      }

      return NextResponse.json({
        lat: loc.lat,
        lng: loc.lng,
        formattedAddress: r.formatted_address,
      });
    } catch {
      return NextResponse.json(
        { message: "Lỗi gọi Google Geocoding" },
        { status: 502 },
      );
    }
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "vn");
    url.searchParams.set("accept-language", "vi,en");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: `Nominatim HTTP ${res.status}` },
        { status: 502 },
      );
    }

    const rows = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name?: string;
    }>;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ message: "Không tìm thấy" }, { status: 404 });
    }

    const row = rows[0];
    const lat = parseFloat(row.lat);
    const lng = parseFloat(row.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { message: "Dữ liệu OSM không hợp lệ" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      lat,
      lng,
      formattedAddress: row.display_name,
    });
  } catch {
    return NextResponse.json(
      { message: "Không gọi được dịch vụ địa chỉ" },
      { status: 502 },
    );
  }
}
