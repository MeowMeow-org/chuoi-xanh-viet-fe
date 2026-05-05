export type CooperativeMembershipStatusApi =
  | "pending"
  | "approved"
  | "rejected"
  | "removed";

export interface Farm {
  id: string;
  ownerUserId: string;
  name: string;
  areaHa: number | string;
  cropMain: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  /** Code hành chính chuẩn theo provinces.open-api.vn (null = dữ liệu cũ chưa chuẩn hóa). */
  provinceCode: number | null;
  districtCode: number | null;
  wardCode: number | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  inCooperative: boolean;
  /** Có trên GET /farm/mine: trạng thái đơn gia nhập HTX (một bản ghi / nông trại). */
  cooperativeMembershipStatus?: CooperativeMembershipStatusApi | null;
  /** Tên HTX (full_name) khi có bản ghi cooperative_members. */
  cooperativeName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetMyFarmsQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface CreateFarmPayload {
  name: string;
  areaHa?: number;
  province?: string;
  district?: string;
  ward?: string;
  /** Code hành chính theo provinces.open-api.vn — gửi kèm với name để BE lưu cả hai. */
  provinceCode?: number | null;
  districtCode?: number | null;
  wardCode?: number | null;
  address?: string;
  latitude?: number;
  longitude?: number;
  inCooperative?: boolean;
}
