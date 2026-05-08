import type { FarmAreaUnit } from "@/lib/farmArea";

export type { FarmAreaUnit };

/** Form tạo/sửa nông trại — dùng chung cho FarmUpsertForm */
export type FarmFormValues = {
  name: string;
  /** Số người dùng nhập (theo `areaUnit`) */
  areaValue: string;
  /** m² hoặc ha — khi lưu luôn quy đổi sang ha */
  areaUnit: FarmAreaUnit;
  /** Code hành chính (chuẩn) — null khi chưa chọn */
  provinceCode: number | null;
  districtCode: number | null;
  wardCode: number | null;
  /** Tên snapshot — đồng bộ với code, dùng để hiển thị/legacy */
  province: string;
  district: string;
  ward: string;
  /** Số nhà / đường (không lặp tỉnh-quận-xã) */
  address: string;
  latitude: string;
  longitude: string;
};
