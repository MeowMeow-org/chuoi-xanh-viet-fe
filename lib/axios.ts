import axios from "axios";
import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthSession } from "@/services/auth/storage";
import { refreshToken as refreshTokenApi } from "@/services/auth/api";

const API_URL =
  process.env.NEXT_PUBLIC_SWAGGER_API_ENDPOINT;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onError: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onError(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const originalRequest = error?.config;

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onSuccess: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            onError: (err: Error) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        clearAuthSession();
        isRefreshing = false;
        processQueue(new Error("No refresh token available"), null);
        return Promise.reject(error);
      }

      return refreshTokenApi({ refreshToken: refreshTokenValue })
        .then((response) => {
          const currentSession = {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            user: (() => {
              // Get current user from storage to maintain user info
              const storedSession = localStorage.getItem("chuoi-xanh-viet-auth");
              if (storedSession) {
                try {
                  const parsed = JSON.parse(storedSession);
                  return parsed.user;
                } catch {
                  return null;
                }
              }
              return null;
            })(),
          };

          if (currentSession.user) {
            saveAuthSession(currentSession);
          }

          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          processQueue(null, response.accessToken);
          isRefreshing = false;

          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          clearAuthSession();
          processQueue(new Error("Token refresh failed"), null);
          isRefreshing = false;
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
