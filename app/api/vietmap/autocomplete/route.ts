import { NextRequest, NextResponse } from "next/server";

import { getVietmapGeocodeApiKey } from "@/lib/vietmapKeys";

const USER_AGENT = "ChuoiXanhViet-VietMapAutocomplete/1.0";

type VietmapAutocompleteItem = {
  ref_id?: string;
  display?: string;
};

/**
 * Gợi ý địa chỉ (Autocomplete v4). Key dùng consumer có quyền Auto Complete.
 * @see https://maps.vietmap.vn/docs/map-api/autocomplete-version/autocomplete-v4/
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json(
      { message: "Thiếu q hoặc quá ngắn", suggestions: [] },
      { status: 400 },
    );
  }

  const apiKey = getVietmapGeocodeApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        message:
          "Chưa cấu hình VIETMAP_GEOCODE_API_KEY cho Auto Complete",
        suggestions: [],
      },
      { status: 503 },
    );
  }

  const focusLat = req.nextUrl.searchParams.get("focusLat");
  const focusLon = req.nextUrl.searchParams.get("focusLon");

  try {
    const url = new URL("https://maps.vietmap.vn/api/autocomplete/v4");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("text", q);
    url.searchParams.set("display_type", "5");

    const fl = focusLat != null ? Number(focusLat) : NaN;
    const fo = focusLon != null ? Number(focusLon) : NaN;
    if (Number.isFinite(fl) && Number.isFinite(fo)) {
      url.searchParams.set("focus", `${fl},${fo}`);
    }

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
        { message: "VietMap không trả JSON hợp lệ", suggestions: [] },
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
        { message: msg, suggestions: [] },
        { status: res.status === 401 || res.status === 403 ? 403 : 502 },
      );
    }

    if (!Array.isArray(data)) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = (data as VietmapAutocompleteItem[])
      .map((item) => {
        const refId = typeof item.ref_id === "string" ? item.ref_id.trim() : "";
        const display =
          typeof item.display === "string" && item.display.trim().length > 0
            ? item.display.trim()
            : "";
        if (!refId || !display) return null;
        return { refId, display };
      })
      .filter((x): x is { refId: string; display: string } => x != null)
      .slice(0, 10);

    return NextResponse.json({ suggestions }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Lỗi gọi VietMap Autocomplete", suggestions: [] },
      { status: 502 },
    );
  }
}
