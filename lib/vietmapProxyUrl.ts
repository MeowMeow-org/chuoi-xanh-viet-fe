/**
 * Trả URL proxy same-origin cho mọi tài nguyên VietMap GL (tile/sprite/glyph/style…).
 *
 * - Giữ nguyên template `{z}`, `{fontstack}` trong path (không qua `URL.pathname` đã encode).
 * - **Xóa `apikey` ra khỏi query** — proxy server-side sẽ tự inject key tile, tránh lộ key ra client.
 */
export function proxyUrlForVietmapHttpsUrl(origin: string, url: string): string {
  if (!url.startsWith("https://")) return url;

  const bare = url.slice("https://".length);
  const slash = bare.indexOf("/");
  const hostnameRaw = slash === -1 ? bare : bare.slice(0, slash);
  const pathAndQueryRaw = slash === -1 ? "/" : bare.slice(slash);

  if (!/^([a-z0-9-]+\.)*vietmap\.vn$/i.test(hostnameRaw)) {
    return url;
  }

  const qIdx = pathAndQueryRaw.indexOf("?");
  const path = qIdx === -1 ? pathAndQueryRaw : pathAndQueryRaw.slice(0, qIdx);
  const queryRaw = qIdx === -1 ? "" : pathAndQueryRaw.slice(qIdx + 1);
  const queryClean = queryRaw
    .split("&")
    .filter((p) => p.length > 0 && !/^apikey=/i.test(p))
    .join("&");
  const pathAndQuery = queryClean ? `${path}?${queryClean}` : path;

  const hostSeg = encodeURIComponent(hostnameRaw);
  return `${origin}/api/vietmap/proxy-vietmap/${hostSeg}${pathAndQuery}`;
}
