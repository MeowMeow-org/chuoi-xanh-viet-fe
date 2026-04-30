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
  address?: string;
  latitude?: number;
  longitude?: number;
  inCooperative?: boolean;
}
