import { axiosInstance } from "@/lib/axios";
import { LoginPayload, AuthResponse, RegisterPayload, User } from "./index";
import { useAuthStore } from "@/store/useAuthStore";

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
    const { refreshToken } = useAuthStore.getState();
    await axiosInstance.post<void, void>("/auth/logout", {
      refreshToken,
    });
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User, User>("/auth/me");
    return response;
  },

  patchMe: async (payload: { avatarUrl: string | null }): Promise<User> => {
    return axiosInstance.patch<User, User>("/auth/me", payload);
  },
};
