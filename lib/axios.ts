import axios from "axios";
import { clearAuthSession, getAccessToken } from "@/lib/auth/storage";

const API_URL =
  process.env.NEXT_PUBLIC_SWAGGER_API_ENDPOINT;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    if (error?.response?.status === 401) {
      clearAuthSession();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
