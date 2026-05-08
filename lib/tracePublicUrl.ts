const DEFAULT_PUBLIC_SITE = "https://chuoixanhviet.site";

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Mã dùng trong path /truy-xuat/[code] (ưu tiên short_code in trên bao bì). */
export function getSaleUnitTraceSlug(saleUnit: {
  shortCode: string | null;
  code: string;
}): string {
  const s = saleUnit.shortCode?.trim();
  if (s && s.length > 0) return s;
  return saleUnit.code.trim();
}

/**
 * URL truy xuất hiển thị cho khách (QR, chia sẻ).
 * – Ghi đè bằng NEXT_PUBLIC_SITE_URL khi dev (vd http://localhost:3000).
 * – Mặc định: https://chuoixanhviet.site/truy-xuat/…
 */
export function getSaleUnitTracePublicUrl(saleUnit: {
  shortCode: string | null;
  code: string;
  qrUrl?: string;
}): string {
  const slug = encodeURIComponent(getSaleUnitTraceSlug(saleUnit));

  const fromEnv =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string"
      ? stripTrailingSlashes(process.env.NEXT_PUBLIC_SITE_URL.trim())
      : "";
  if (fromEnv.length > 0) {
    return `${fromEnv}/truy-xuat/${slug}`;
  }

  const raw = saleUnit.qrUrl?.trim() ?? "";
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const u = new URL(raw);
      const path = u.pathname.replace(/\/+$/, "") || u.pathname;
      if (path.startsWith("/truy-xuat/")) {
        return `${DEFAULT_PUBLIC_SITE}${path}`;
      }
    }
  } catch {
    /* bỏ qua URL lỗi */
  }

  return `${DEFAULT_PUBLIC_SITE}/truy-xuat/${slug}`;
}
