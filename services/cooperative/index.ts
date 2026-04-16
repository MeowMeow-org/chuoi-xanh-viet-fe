export interface CooperativeAccount {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
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
