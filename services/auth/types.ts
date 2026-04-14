export type AuthRole = "consumer" | "admin" | "farmer";

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

  return null;
}

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: AuthRole;
  status: string;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type RegisterPayload = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
};

export type LoginApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: LoginResponseData;
};

export type RegisterApiResponse = LoginApiResponse;

export type MyProfileApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: AuthUser;
};

export type RefreshTokenPayload = {
  refreshToken: string;
};

export type RefreshTokenData = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: RefreshTokenData;
};

export type AuthSession = LoginResponseData;