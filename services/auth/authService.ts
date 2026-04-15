import { axiosInstance } from "@/lib/axios";
import { LoginPayload, AuthResponse, RegisterPayload, User } from "./index";

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
