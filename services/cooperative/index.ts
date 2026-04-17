export interface CooperativeAccount {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
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
}

export interface RegisterFarmerApplicantPayload {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone: string;
  cooperative_user_id: string;
  farm_name: string;
}
