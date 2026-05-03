import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";
import { toast } from "@/components/ui/toast";
import { clearAuthCookies, saveAuthCookies } from "@/services/auth/storage";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data?.data !== undefined
      ? response.data.data
      : response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const notAuthReqs = !originalRequest.url?.includes("/auth/");
    const is401 = error.response?.status === 401;
    const notRetriedYet = !originalRequest._retry;

    if (is401 && notAuthReqs && notRetriedYet) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
          { refreshToken: useAuthStore.getState().refreshToken },
          { withCredentials: true },
        );

        const newAccessToken: string =
          res.data?.data?.accessToken ?? res.data?.accessToken;
        const newRefreshToken: string =
          res.data?.data?.refreshToken ?? res.data?.refreshToken;

        useAuthStore.getState().setAuth({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: useAuthStore.getState().user,
        });
        saveAuthCookies({
          accessToken: newAccessToken,
          role: useAuthStore.getState().user?.role,
        });

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        clearAuthCookies();
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ?? error.message ?? "Đã có lỗi xảy ra";

    const status = error.response?.status;
    if (
      status === 403 &&
      typeof message === "string" &&
      message.startsWith("Tài khoản đã bị khóa")
    ) {
      useAuthStore.getState().clearAuth();
      clearAuthCookies();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    const isLogoutEndpoint = originalRequest.url?.includes("/auth/logout");

    if (!isLogoutEndpoint) {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

