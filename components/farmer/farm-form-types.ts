import type { FarmAreaUnit } from "@/lib/farmArea";

export type { FarmAreaUnit };

/** Form tạo/sửa nông trại — dùng chung cho FarmUpsertForm & VietnamAddressFields */
export type FarmFormValues = {
  name: string;
  /** Số người dùng nhập (theo `areaUnit`) */
  areaValue: string;
  /** m² hoặc ha — khi lưu luôn quy đổi sang ha */
  areaUnit: FarmAreaUnit;
  province: string;
  district: string;
  ward: string;
  address: string;
  latitude: string;
  longitude: string;
};
