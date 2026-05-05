/** Gọi public API: https://provinces.open-api.vn (chuẩn hóa địa giới VN) */
import type { QueryClient } from "@tanstack/react-query";

export const VIETNAM_PROVINCES_API_BASE = "https://provinces.open-api.vn/api";

export type ProvinceListItem = {
  code: number;
  name: string;
  division_type?: string;
  codename?: string;
  phone_code?: number;
  districts?: unknown[];
};

export type DistrictItem = {
  code: number;
  name: string;
  province_code: number;
  division_type?: string;
  codename?: string;
};

export type WardItem = {
  code: number;
  name: string;
  district_code: number;
  division_type?: string;
  codename?: string;
};

export type ProvinceWithDistricts = Omit<ProvinceListItem, "districts"> & {
  districts: DistrictItem[];
};

export type DistrictWithWards = DistrictItem & {
  wards: WardItem[];
};

async function jsonFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Địa chỉ VN: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/** Danh sách tỉnh/thành (nhẹ, không kèm quận/huyện đầy đủ) */
export async function fetchProvinces(): Promise<ProvinceListItem[]> {
  const url = `${VIETNAM_PROVINCES_API_BASE}/p/`;
  return jsonFetch<ProvinceListItem[]>(url);
}

/** Một tỉnh + toàn bộ quận/huyện */
export async function fetchProvinceWithDistricts(
  provinceCode: number,
): Promise<ProvinceWithDistricts> {
  const url = `${VIETNAM_PROVINCES_API_BASE}/p/${provinceCode}?depth=2`;
  return jsonFetch<ProvinceWithDistricts>(url);
}

/** Một quận/huyện + toàn bộ phường/xã */
export async function fetchDistrictWithWards(
  districtCode: number,
): Promise<DistrictWithWards> {
  const url = `${VIETNAM_PROVINCES_API_BASE}/d/${districtCode}?depth=2`;
  return jsonFetch<DistrictWithWards>(url);
}

/**
 * Tra tên theo code, ưu tiên dùng dữ liệu cache trong react-query cho 3 query keys
 *  - ["vn-address","provinces"]
 *  - ["vn-address","districts", provinceCode]
 *  - ["vn-address","wards", districtCode]
 *
 * Nếu cache chưa có, fetch (và sẽ tự cache lại nhờ react-query nếu component khác đang dùng).
 * Trả về undefined cho cấp nào không match.
 */
export type AddressNameLookup = {
  provinceName?: string;
  districtName?: string;
  wardName?: string;
};

export type AddressCodeLookup = {
  provinceCode?: number;
  districtCode?: number;
  wardCode?: number;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
};

function normalizeVietnamAdminName(raw: string | null | undefined): string {
  if (!raw) return "";
  const normalized = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\btp\.\s*/gu, "thanh pho ")
    .replace(/\btp\s+/gu, "thanh pho ")
    .replace(/\bt\.?\s*/gu, "tinh ")
    .replace(/\bhcm\b/gu, "ho chi minh")
    .replace(/\bhn\b/gu, "ha noi")
    .replace(/^tinh\s+/u, "")
    .replace(/^thanh pho\s+/u, "")
    .replace(/^quan\s+/u, "")
    .replace(/^huyen\s+/u, "")
    .replace(/^thi xa\s+/u, "")
    .replace(/^phuong\s+/u, "")
    .replace(/^xa\s+/u, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
}

function tokenSet(s: string): Set<string> {
  return new Set(s.split(" ").map((x) => x.trim()).filter(Boolean));
}

function fuzzyPickByName<T>(
  items: T[],
  getName: (item: T) => string,
  targetNorm: string,
): T | undefined {
  if (!targetNorm) return undefined;
  const targetTokens = tokenSet(targetNorm);

  let best: { item: T; score: number } | undefined;
  for (const it of items) {
    const candNorm = normalizeVietnamAdminName(getName(it));
    if (!candNorm) continue;
    if (candNorm === targetNorm) return it;

    let score = 0;
    if (candNorm.includes(targetNorm) || targetNorm.includes(candNorm)) score += 3;

    const candTokens = tokenSet(candNorm);
    let overlap = 0;
    for (const tk of targetTokens) {
      if (candTokens.has(tk)) overlap += 1;
    }
    // Ưu tiên số token overlap nhiều và tên gần độ dài target.
    score += overlap * 2 - Math.abs(candNorm.length - targetNorm.length) * 0.02;

    if (!best || score > best.score) best = { item: it, score };
  }

  // Ngưỡng thấp để tránh match nhầm quá xa.
  return best && best.score >= 2 ? best.item : undefined;
}

export async function getNamesByCodes(
  qc: QueryClient,
  codes: {
    provinceCode?: number | null;
    districtCode?: number | null;
    wardCode?: number | null;
  },
): Promise<AddressNameLookup> {
  const out: AddressNameLookup = {};
  if (codes.provinceCode == null) return out;

  const provinces = await qc.fetchQuery<ProvinceListItem[]>({
    queryKey: ["vn-address", "provinces"],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });
  out.provinceName = provinces.find(
    (p) => p.code === codes.provinceCode,
  )?.name;

  if (codes.districtCode == null) return out;
  const districtsParent = await qc.fetchQuery<ProvinceWithDistricts>({
    queryKey: ["vn-address", "districts", codes.provinceCode],
    queryFn: () => fetchProvinceWithDistricts(codes.provinceCode!),
    staleTime: 1000 * 60 * 60 * 24,
  });
  out.districtName = districtsParent.districts.find(
    (d) => d.code === codes.districtCode,
  )?.name;

  if (codes.wardCode == null) return out;
  const wardsParent = await qc.fetchQuery<DistrictWithWards>({
    queryKey: ["vn-address", "wards", codes.districtCode],
    queryFn: () => fetchDistrictWithWards(codes.districtCode!),
    staleTime: 1000 * 60 * 60 * 24,
  });
  out.wardName = wardsParent.wards.find((w) => w.code === codes.wardCode)?.name;
  return out;
}

/**
 * Map tên hành chính (từ reverse geocode / text) sang code chuẩn provinces.open-api.vn.
 * Trả undefined nếu không xác định được theo thứ bậc tỉnh -> huyện -> xã.
 */
export async function findCodesByNames(
  qc: QueryClient,
  names: {
    province?: string | null;
    district?: string | null;
    ward?: string | null;
  },
): Promise<AddressCodeLookup> {
  const provinceNorm = normalizeVietnamAdminName(names.province);
  const districtNorm = normalizeVietnamAdminName(names.district);
  const wardNorm = normalizeVietnamAdminName(names.ward);
  if (!provinceNorm) return {};

  const provinces = await qc.fetchQuery<ProvinceListItem[]>({
    queryKey: ["vn-address", "provinces"],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });
  const province = fuzzyPickByName(provinces, (p) => p.name, provinceNorm);
  if (!province) return {};

  const out: AddressCodeLookup = {
    provinceCode: province.code,
    provinceName: province.name,
  };
  if (!districtNorm) return out;

  const districtsParent = await qc.fetchQuery<ProvinceWithDistricts>({
    queryKey: ["vn-address", "districts", province.code],
    queryFn: () => fetchProvinceWithDistricts(province.code),
    staleTime: 1000 * 60 * 60 * 24,
  });
  const district = fuzzyPickByName(
    districtsParent.districts,
    (d) => d.name,
    districtNorm,
  );
  if (!district) return out;

  out.districtCode = district.code;
  out.districtName = district.name;
  if (!wardNorm) return out;

  const wardsParent = await qc.fetchQuery<DistrictWithWards>({
    queryKey: ["vn-address", "wards", district.code],
    queryFn: () => fetchDistrictWithWards(district.code),
    staleTime: 1000 * 60 * 60 * 24,
  });
  const ward = fuzzyPickByName(wardsParent.wards, (w) => w.name, wardNorm);
  if (!ward) return out;

  out.wardCode = ward.code;
  out.wardName = ward.name;
  return out;
}
