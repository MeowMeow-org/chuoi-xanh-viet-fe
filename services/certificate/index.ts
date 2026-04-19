export type CertType = "vietgap" | "globalgap" | "organic" | "other";

export type CoopCertStatus = "active" | "revoked" | "expired";
export type FarmCertStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked"
  | "expired";
export type FarmCertApproverScope = "cooperative" | "admin";

export interface CertificateBadgeSourceOwn {
  kind: "own";
  certificateId: string;
  certificateNo: string | null;
  issuer: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  fileUrl: string;
}

export interface CertificateBadgeSourceCooperative {
  kind: "cooperative";
  certificateId: string;
  cooperativeUserId: string;
  cooperativeName: string | null;
  certificateNo: string | null;
  issuer: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  fileUrl: string;
}

export type CertificateBadgeSource =
  | CertificateBadgeSourceOwn
  | CertificateBadgeSourceCooperative;

export interface CertificateBadge {
  type: CertType;
  active: boolean;
  sources: CertificateBadgeSource[];
}

export interface CooperativeCertificate {
  id: string;
  cooperative_user_id: string;
  type: CertType;
  certificate_no: string | null;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
  file_url: string;
  status: CoopCertStatus;
  revoked_by: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  created_at: string;
  updated_at: string;
  _count?: { scope: number };
}

export interface FarmCertificate {
  id: string;
  farm_id: string;
  type: CertType;
  certificate_no: string | null;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
  file_url: string;
  status: FarmCertStatus;
  approver_scope: FarmCertApproverScope;
  reviewer_cooperative_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
  farm?: {
    id: string;
    name: string;
    province?: string | null;
    district?: string | null;
    ward?: string | null;
    users?: { id: string; full_name: string } | null;
  };
  reviewer_cooperative?: { id: string; full_name: string } | null;
  reviewer_user?: { id: string; full_name: string; role?: string } | null;
}

export interface CooperativeCertificateScopeRow {
  id: string;
  certificate_id: string;
  farm_id: string;
  added_by: string | null;
  added_at: string;
  farm: {
    id: string;
    name: string;
    province: string | null;
    district: string | null;
    ward: string | null;
    owner_user_id: string;
    users: { id: string; full_name: string } | null;
  };
}

export interface CreateCertPayload {
  type: CertType;
  certificate_no?: string | null;
  issuer?: string | null;
  issued_at?: string | null;
  expires_at?: string | null;
  file_url: string;
}

export type CreateFarmCertPayload = CreateCertPayload & { farm_id: string };

export const CERT_TYPE_LABEL: Record<CertType, string> = {
  vietgap: "VietGAP",
  globalgap: "GlobalGAP",
  organic: "Hữu cơ",
  other: "Khác",
};
