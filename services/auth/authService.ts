import { axiosInstance } from "@/lib/axios";
import { LoginPayload, AuthResponse, RegisterPayload, User } from "./index";
import { useAuthStore } from "@/store/useAuthStore";

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse, AuthResponse>(
      "/auth/login",
      payload,
    );
    console.log(response);
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

  patchMe: async (payload: {
    avatarUrl?: string | null;
    fullName?: string;
    phone?: string;
    zaloUserId?: string | null;
    unlinkTelegram?: boolean;
  }): Promise<User> => {
    return axiosInstance.patch<User, User>("/auth/me", payload);
  },

  /** Nông dân: lấy link t.me/bot?start=… để mở Telegram và bấm Start (BE cần TELEGRAM_BOT_USERNAME + webhook). */
  requestTelegramLink: async (): Promise<{
    deepLink: string;
    expiresInSeconds: number;
  }> => {
    return axiosInstance.post<
      { deepLink: string; expiresInSeconds: number },
      { deepLink: string; expiresInSeconds: number }
    >("/auth/me/telegram-link", {});
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
    confirm_password: string;
  }): Promise<void> => {
    await axiosInstance.post("/auth/me/password", payload);
  },
};
