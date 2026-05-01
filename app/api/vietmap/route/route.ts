import { NextRequest, NextResponse } from "next/server";

import { decodeGooglePolylineToLngLat } from "@/lib/decodeGooglePolyline";
import { getVietmapGeocodeApiKey } from "@/lib/vietmapKeys";

const USER_AGENT = "ChuoiXanhViet-VietMapRoute/1.0";

/**
 * Hai điểm dạng lat,lng (theo tài liệu VietMap Route v3).
 * Trả về GeoJSON LineString kiểu [lng,lat][] để map GL vẽ polyline.
 * @see https://maps.vietmap.vn/docs/map-api/route-version/route-v3/
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const oLat = Number(sp.get("originLat"));
  const oLng = Number(sp.get("originLng"));
  const dLat = Number(sp.get("destLat"));
  const dLng = Number(sp.get("destLng"));
  const vehicleRaw = sp.get("vehicle")?.trim().toLowerCase();
  const vehicle =
    vehicleRaw === "motorcycle"
      ? "motorcycle"
      : vehicleRaw === "truck"
        ? "truck"
        : "car";

  if (
    ![oLat, oLng, dLat, dLng].every(
      (n) => typeof n === "number" && Number.isFinite(n),
    )
  ) {
    return NextResponse.json(
      { message: "Thiếu hoặc sai originLat/originLng/destLat/destLng" },
      { status: 400 },
    );
  }

  const apiKey = getVietmapGeocodeApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { message: "Chưa cấu hình VIETMAP_GEOCODE_API_KEY cho Route" },
      { status: 503 },
    );
  }

  try {
    const url = new URL("https://maps.vietmap.vn/api/route/v3");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.append("point", `${oLat},${oLng}`);
    url.searchParams.append("point", `${dLat},${dLng}`);
    url.searchParams.set("points_encoded", "false");
    url.searchParams.set("vehicle", vehicle);

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
        { message: "VietMap Route không trả JSON hợp lệ" },
        { status: 502 },
      );
    }

    const root = data as {
      code?: string;
      messages?: string;
      paths?: Array<{
        distance?: number;
        time?: number;
        points?: unknown;
        points_encoded?: boolean;
        bbox?: number[];
        instructions?: Array<{
          text?: string;
          distance?: number;
          time?: number;
          street_name?: string | null;
        }>;
      }>;
    };

    if (!res.ok || root.code !== "OK" || !root.paths?.length) {
      const msg =
        typeof root.messages === "string" && root.messages.trim().length > 0
          ? root.messages.trim()
          : root.code === "ZERO_RESULTS"
            ? "Không tìm được lộ trình giữa hai điểm."
            : `VietMap Route: ${root.code ?? `HTTP ${res.status}`}`;
      return NextResponse.json(
        { message: msg, code: root.code ?? "ERROR" },
        { status: res.status === 401 || res.status === 403 ? 403 : 422 },
      );
    }

    const path = root.paths[0];
    const coordinates = extractRouteCoordinatesLngLat(path);

    if (coordinates.length < 2) {
      const snippet = text.slice(0, 600);
      console.warn(
        "[vietmap-route] không đọc được dạng điểm. Raw snippet:",
        snippet,
      );
      const isDev = process.env.NODE_ENV !== "production";
      return NextResponse.json(
        {
          message: isDev
            ? `Không đọc được dạng điểm từ VietMap. Mẫu phản hồi: ${snippet}`
            : "VietMap trả lộ trình nhưng không đọc được dạng điểm (polyline/mảng/GeoJSON).",
          code: "INVALID_GEOMETRY",
          ...(isDev ? { rawSample: snippet } : {}),
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        code: "OK",
        coordinates,
        distanceM: typeof path.distance === "number" ? path.distance : null,
        timeMs: typeof path.time === "number" ? path.time : null,
        bbox:
          Array.isArray(path.bbox) && path.bbox.length >= 4
            ? (path.bbox as [number, number, number, number])
            : null,
        instructions: Array.isArray(path.instructions)
          ? path.instructions.map((i) => ({
              text: typeof i.text === "string" ? i.text : "",
              distanceM: typeof i.distance === "number" ? i.distance : null,
              timeMs: typeof i.time === "number" ? i.time : null,
              streetName:
                typeof i.street_name === "string" ? i.street_name : null,
            }))
          : [],
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Lỗi gọi VietMap Route" },
      { status: 502 },
    );
  }
}

/**
 * VietMap có thể trả `points` ở nhiều dạng:
 * 1. **String** polyline (Google encoded precision 5) — `points_encoded=true`
 * 2. **GeoJSON LineString** `{ type: 'LineString', coordinates: [[lng,lat], …] }` — `points_encoded=false`
 * 3. **Mảng phẳng** `[[lng,lat], …]` hoặc `[[lat,lng], …]`
 * Hàm sẽ thử lần lượt 1 → 2 → 3.
 */
function extractRouteCoordinatesLngLat(path: {
  points?: unknown;
  points_encoded?: boolean;
}): [number, number][] {
  const raw = path.points;

  if (typeof raw === "string" && raw.trim().length > 0) {
    const decoded = decodeGooglePolylineToLngLat(raw, 5);
    if (decoded.length >= 2) return decoded;
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as { coordinates?: unknown; type?: unknown };
    if (Array.isArray(obj.coordinates)) {
      const fromGeo = normalizeRoutePointsToLngLat(obj.coordinates);
      if (fromGeo.length >= 2) return fromGeo;
    }
  }

  return normalizeRoutePointsToLngLat(raw);
}

/** Chuẩn hoá cặp tọa độ VN → [lng, lat] cho MapLibre (mảng [lon,lat] hoặc [lat,lng]). */
function normalizeRoutePointsToLngLat(points: unknown): [number, number][] {
  if (!Array.isArray(points)) return [];
  const out: [number, number][] = [];
  for (const item of points) {
    if (!Array.isArray(item) || item.length < 2) continue;
    const x = Number(item[0]);
    const y = Number(item[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x > 50 && y < 50) out.push([x, y]);
    else if (y > 50 && x < 50) out.push([y, x]);
    else out.push([x, y]);
  }
  return out;
}
