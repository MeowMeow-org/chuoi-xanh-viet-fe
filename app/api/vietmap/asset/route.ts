import { NextRequest, NextResponse } from "next/server";

import { getVietmapTileApiKey } from "@/lib/vietmapKeys";
import { vietmapUpstreamHeaders } from "@/lib/vietmapUpstreamHeaders";

/**
 * Proxy dự phòng (?u=...) — ưu tiên path proxy. Inject `apikey` server-side.
 */
function isAllowedVietmapHost(hostname: string): boolean {
  return hostname === "maps.vietmap.vn" || hostname.endsWith(".vietmap.vn");
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u")?.trim();
  if (!raw) {
    return NextResponse.json({ message: "Thiếu tham số u" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ message: "URL không hợp lệ" }, { status: 400 });
  }

  if (target.protocol !== "https:" || !isAllowedVietmapHost(target.hostname)) {
    return NextResponse.json({ message: "Host không được phép" }, { status: 403 });
  }

  const tileKey = getVietmapTileApiKey();
  if (!tileKey) {
    return NextResponse.json(
      { message: "Chưa cấu hình VIETMAP_TILE_API_KEY" },
      { status: 503 },
    );
  }

  target.searchParams.delete("apikey");
  target.searchParams.set("apikey", tileKey);

  try {
    const res = await fetch(target.toString(), {
      headers: vietmapUpstreamHeaders(req),
      redirect: "follow",
      cache: "no-store",
    });

    const contentType =
      res.headers.get("content-type") ?? "application/octet-stream";
    const buf = await res.arrayBuffer();

    return new NextResponse(buf, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Không tải được tài nguyên VietMap" },
      { status: 502 },
    );
  }
}
