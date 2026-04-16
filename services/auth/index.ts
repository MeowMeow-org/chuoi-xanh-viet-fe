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
  email: string;
  fullName: string;
  phone: string;
  role: string;
  status: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  confirm_password: string;
}
