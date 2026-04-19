/** Gọi public API: https://provinces.open-api.vn (chuẩn hóa địa giới VN) */

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

export type ProvinceWithDistricts = ProvinceListItem & {
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
