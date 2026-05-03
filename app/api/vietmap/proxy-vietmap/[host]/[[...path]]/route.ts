import { NextRequest, NextResponse } from "next/server";

import { getVietmapTileApiKey } from "@/lib/vietmapKeys";
import { vietmapUpstreamHeaders } from "@/lib/vietmapUpstreamHeaders";

function isAllowedVietmapHost(hostname: string): boolean {
  return /^([a-z0-9-]+\.)*vietmap\.vn$/i.test(hostname);
}

/**
 * Proxy template URL của VietMap GL (tiles/sprite/glyphs/...). Server inject `apikey`
 * từ `VIETMAP_TILE_API_KEY` — bỏ qua mọi `apikey` do client truyền lên.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ host: string; path?: string[] }> },
) {
  const { host, path = [] } = await ctx.params;
  const hostname = decodeURIComponent(host);

  if (!isAllowedVietmapHost(hostname)) {
    return NextResponse.json({ message: "Host không được phép" }, { status: 403 });
  }
  if (path.some((seg) => seg.includes(".."))) {
    return NextResponse.json({ message: "Đường dẫn không hợp lệ" }, { status: 400 });
  }

  const rest =
    path.length > 0
      ? "/" +
        path
          .map((p) => {
            try {
              return decodeURIComponent(p);
            } catch {
              return p;
            }
          })
          .join("/")
      : "";

  const tileKey = getVietmapTileApiKey();
  if (!tileKey) {
    return NextResponse.json(
      { message: "Chưa cấu hình VIETMAP_TILE_API_KEY" },
      { status: 503 },
    );
  }

  const target = new URL(`https://${hostname}${rest}`);
  for (const [k, v] of req.nextUrl.searchParams.entries()) {
    if (k.toLowerCase() === "apikey") continue;
    target.searchParams.set(k, v);
  }
  target.searchParams.set("apikey", tileKey);

  try {
    const res = await fetch(target.toString(), {
      headers: vietmapUpstreamHeaders(req),
      redirect: "follow",
      cache: "no-store",
    });

    const upstreamCt = res.headers.get("content-type");
    const pathname = rest;

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const snippet = text.slice(0, 500);
      console.warn(
        `[vietmap-proxy] ${res.status} ${res.statusText} ${target.pathname}${target.search.replace(tileKey, "***")} -> ${snippet}`,
      );
      return new NextResponse(text, {
        status: res.status,
        headers: {
          "Content-Type": upstreamCt ?? "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Vietmap-Upstream-Status": String(res.status),
        },
      });
    }

    const buf = await res.arrayBuffer();

    /* Nếu upstream trả body lạ (ví dụ JSON error nhưng status 200), ghi log để chẩn đoán. */
    if (pathname.endsWith(".pbf")) {
      const bytes = new Uint8Array(buf, 0, Math.min(buf.byteLength, 8));
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(" ");
      const ctLower = (upstreamCt ?? "").toLowerCase();
      const looksJson = ctLower.includes("json") || ctLower.includes("html");
      if (buf.byteLength === 0 || looksJson) {
        const snippet = looksJson
          ? new TextDecoder().decode(new Uint8Array(buf, 0, Math.min(buf.byteLength, 300)))
          : "";
        console.warn(
          `[vietmap-proxy] tile bất thường ${pathname} ct=${upstreamCt} bytes=${buf.byteLength} hex=${hex} body=${snippet}`,
        );
      } else if (process.env.VIETMAP_PROXY_DEBUG === "1") {
        console.log(
          `[vietmap-proxy] tile ${pathname} ct=${upstreamCt} bytes=${buf.byteLength} hex=${hex}`,
        );
      }
    }

    const ct =
      upstreamCt ??
      (pathname.endsWith(".pbf")
        ? "application/x-protobuf"
        : pathname.endsWith(".png")
          ? "image/png"
          : pathname.endsWith(".json")
            ? "application/json"
            : "application/octet-stream");

    return new NextResponse(buf, {
      status: res.status,
      headers: {
        "Content-Type": ct,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    console.error("[vietmap-proxy] fetch error", err);
    return NextResponse.json(
      { message: "Không proxy được VietMap" },
      { status: 502 },
    );
  }
}
