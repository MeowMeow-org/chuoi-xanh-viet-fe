export interface CooperativeAccount {
  id: string;
  /** API trả camelCase */
  fullName?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  contactAddress?: string | null;
}

export function cooperativeDisplayName(c: CooperativeAccount): string {
  return c.fullName ?? c.full_name ?? "—";
}

export type CooperativeMembershipStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "removed";

export interface CooperativeMembershipFarmer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export interface CooperativeMembershipFarm {
  id: string;
  name: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  inCooperative: boolean;
}

export interface CooperativeMembership {
  id: string;
  status: CooperativeMembershipStatus;
  createdAt: string;
  verifiedAt: string | null;
  note: string | null;
  farmer: CooperativeMembershipFarmer;
  farm: CooperativeMembershipFarm;
}

export interface GetCooperativeMembershipsQuery {
  page?: number;
  limit?: number;
  status?: CooperativeMembershipStatus;
  /** Tìm theo tên trại, địa chỉ, chủ hộ, email */
  searchTerm?: string;
}

