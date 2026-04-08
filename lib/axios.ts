import axios from "axios";

// Cấu hình URL cơ bản của backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptors nếu cần (ví dụ để gắn token vào request)
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Xử lý lỗi chung (chẳng hạn 401 thì xóa auth state)
    return Promise.reject(error);
  }
);

export default axiosInstance;
