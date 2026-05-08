export type AuthRole = "consumer" | "admin" | "farmer" | "cooperative";

export function normalizeAuthRole(role: unknown): AuthRole | null {
  if (typeof role !== "string") {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  if (normalized === "consumer" || normalized === "role_consumer") {
    return "consumer";
  }

  if (normalized === "admin" || normalized === "role_admin") {
    return "admin";
  }

  if (normalized === "farmer" || normalized === "role_farmer") {
    return "farmer";
  }

  if (
    normalized === "cooperative" ||
    normalized === "cooperativ" ||
    normalized === "role_cooperative" ||
    normalized === "role_cooperativ"
  ) {
    return "cooperative";
  }

  return null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface User {
  id: string;
  email: string | null;
  fullName: string;
  phone: string;
  role: string;
  status: string;
  onBoarding?: boolean;
  avatarUrl?: string | null;
  /** Zalo OA — khi có, BE có thể gửi thông báo Zalo */
  zaloUserId?: string | null;
  /** Đã liên kết Telegram qua bot (deep link + Start); không có chat_id thô trên FE */
  telegramLinked?: boolean;
  /** Địa chỉ trụ sở / liên hệ (HTX — hiển thị cho nông dân khi xét chứng chỉ) */
  contactAddress?: string | null;
  /** Trụ sở HTX — đồng bộ với bảng users */
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  provinceCode?: number | null;
  districtCode?: number | null;
  wardCode?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type PatchMePayload = {
  avatarUrl?: string | null;
  fullName?: string;
  phone?: string;
  zaloUserId?: string | null;
  /** Gửi true để hủy liên kết Telegram (BE xóa chat_id) */
  unlinkTelegram?: boolean;
  contactAddress?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  provinceCode?: number | null;
  districtCode?: number | null;
  wardCode?: number | null;
  latitude?: number | null;
  longitude?: number | null;
};

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  confirm_password: string;
  role: "consumer" | "farmer";
}
