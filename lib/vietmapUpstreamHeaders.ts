import type { NextRequest } from "next/server";

/** Header gửi lên maps.vietmap.vn — một số key/domain kiểm tra Referer/UA. */
export function vietmapUpstreamHeaders(req: NextRequest): HeadersInit {
  const ua =
    req.headers.get("user-agent") ??
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36";
  const headers: Record<string, string> = {
    Accept: "*/*",
    "User-Agent": ua,
  };
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const fallbackReferer = `${proto}://${host}/`;

  const referer = req.headers.get("referer") ?? fallbackReferer;
  headers.Referer = referer;

  const origin = req.headers.get("origin") ?? `${proto}://${host}`;
  headers.Origin = origin;

  return headers;
}
