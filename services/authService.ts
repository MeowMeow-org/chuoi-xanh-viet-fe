import { axiosInstance } from "@/lib/axios";

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

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse, AuthResponse>(
      "/auth/login",
      payload,
    );
    return response;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse, AuthResponse>(
      "/auth/register",
      payload,
    );
    return response;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User, User>("/auth/me");
    return response;
  },
};
