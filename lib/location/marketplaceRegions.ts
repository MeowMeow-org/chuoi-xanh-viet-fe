/** Đồng bộ với `useMarketplaceRegion` — lưu vùng đang chọn / auto-detect */
export const MARKETPLACE_REGION_STORAGE_KEY = "marketplace_region_v1";

/** Cùng danh sách với UI Chợ — gửi `province` xuống BE (contains trên DB) */
export const MARKETPLACE_REGIONS = [
  "Tất cả",
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Đồng Nai",
  "Long An",
] as const;

export type MarketplaceRegion = (typeof MARKETPLACE_REGIONS)[number];

/**
 * Đọc vùng đã lưu (Chợ) → tham số `province` cho GET /shop, GET /shop/products.
 * Trả `undefined` nếu "Tất cả" hoặc chưa có — chỉ gọi trên client.
 */
export function getStoredMarketplaceProvinceForApi(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = sessionStorage.getItem(MARKETPLACE_REGION_STORAGE_KEY);
  if (!v || v === "Tất cả") return undefined;
  if (!MARKETPLACE_REGIONS.includes(v as MarketplaceRegion)) return undefined;
  return v;
}

const ALIASES: { region: Exclude<MarketplaceRegion, "Tất cả">; patterns: RegExp[] }[] = [
  {
    region: "TP. Hồ Chí Minh",
    patterns: [
      /h[ồo]\s*ch[ií]\s*minh/i,
      /ho\s*chi\s*minh/i,
      /th[aà]nh\s*ph[ốo]\s*h[ồo]\s*ch[ií]\s*minh/i,
      /tp\.?\s*hcm/i,
      /tp\.?\s*\.?\s*h[ồo]\s*ch[ií]\s*minh/i,
      /s[àa]i\s*g[òo]n/i,
    ],
  },
  {
    region: "Hà Nội",
    patterns: [/h[àa]\s*n[ộo]i/i, /ha\s*noi/i, /th[àa]nh\s*ph[ốo]\s*h[àa]\s*n[ộo]i/i],
  },
  {
    region: "Đà Nẵng",
    patterns: [/đ[àa]\s*n[ẵa]ng/i, /da\s*nang/i, /th[àa]nh\s*ph[ốo]\s*đ[àa]\s*n[ẵa]ng/i],
  },
  {
    region: "Đồng Nai",
    patterns: [/đ[ồo]ng\s*nai/i, /dong\s*nai/i, /t[ỉi]nh\s*đ[ồo]ng\s*nai/i],
  },
  {
    region: "Long An",
    patterns: [/long\s*an/i, /t[ỉi]nh\s*long\s*an/i],
  },
];

/**
 * Map payload Nominatim reverse (hoặc chuỗi địa chỉ) → một giá trị trong MARKETPLACE_REGIONS (không có "Tất cả").
 */
export function mapGeocodeTextToMarketplaceRegion(text: string): Exclude<MarketplaceRegion, "Tất cả"> | null {
  const n = text.normalize("NFC").toLowerCase();
  for (const { region, patterns } of ALIASES) {
    if (patterns.some((p) => p.test(n))) return region;
  }
  return null;
}

type NominatimAddress = {
  state?: string;
  city?: string;
  county?: string;
  province?: string;
  region?: string;
  town?: string;
  village?: string;
  suburb?: string;
};

export function mapNominatimJsonToMarketplaceRegion(data: {
  display_name?: string;
  address?: NominatimAddress;
}): Exclude<MarketplaceRegion, "Tất cả"> | null {
  const parts: string[] = [];
  if (data.display_name) parts.push(data.display_name);
  const a = data.address;
  if (a) {
    parts.push(
      a.state ?? "",
      a.region ?? "",
      a.province ?? "",
      a.city ?? "",
      a.county ?? "",
      a.town ?? "",
      a.village ?? "",
      a.suburb ?? "",
    );
  }
  const blob = parts.join(" ").trim();
  if (!blob) return null;
  return mapGeocodeTextToMarketplaceRegion(blob);
}
