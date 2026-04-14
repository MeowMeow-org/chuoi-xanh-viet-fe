import axiosInstance from "@/lib/axios";
import {
  normalizeAuthRole,
  type AuthUser,
  type LoginApiResponse,
  type LoginResponseData,
  type MyProfileApiResponse,
  type RegisterApiResponse,
  type RegisterPayload,
} from "@/services/auth/types";

type LoginPayload = {
  email: string;
  password: string;
};

function normalizeAuthSession(data: LoginResponseData): LoginResponseData {
  const normalizedRole = normalizeAuthRole(data.user?.role);
  if (!normalizedRole) {
    throw new Error("Vai trò tài khoản không hợp lệ.");
  }

  return {
    ...data,
    user: {
      ...data.user,
      role: normalizedRole,
    },
  };
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (typeof error === "object" && error !== null) {
    const maybeError = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };

    return maybeError.response?.data?.message || maybeError.message || fallbackMessage;
  }

  return fallbackMessage;
}

export async function loginWithEmail({
  email,
  password,
}: LoginPayload): Promise<LoginResponseData> {
  try {
    const response = await axiosInstance.post<LoginApiResponse, LoginApiResponse>(
      "/v1/api/auth/login",
      {
        email,
        password,
      }
    );

    if (!response.success || !response.data?.accessToken) {
      throw new Error(response.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }

    return normalizeAuthSession(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Đăng nhập thất bại. Vui lòng thử lại."));
  }
}

export async function registerWithEmail({
  email,
  password,
  confirmPassword,
  fullName,
  phone,
}: RegisterPayload): Promise<LoginResponseData> {
  try {
    const response = await axiosInstance.post<RegisterApiResponse, RegisterApiResponse>(
      "/v1/api/auth/register",
      {
        email,
        password,
        confirm_password: confirmPassword,
        full_name: fullName,
        phone,
      }
    );

    if (!response.success || !response.data?.accessToken) {
      throw new Error(response.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
    }

    return normalizeAuthSession(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error, "Đăng ký thất bại. Vui lòng thử lại."));
  }
}

export async function getMyProfile(): Promise<AuthUser> {
  try {
    const response = await axiosInstance.get<MyProfileApiResponse, MyProfileApiResponse>(
      "/v1/api/auth/me"
    );

    if (!response.success || !response.data?.id) {
      throw new Error(response.message || "Không thể lấy thông tin tài khoản.");
    }

    const normalizedRole = normalizeAuthRole(response.data.role);
    if (!normalizedRole) {
      throw new Error("Vai trò tài khoản không hợp lệ.");
    }

    return {
      ...response.data,
      role: normalizedRole,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error, "Không thể lấy thông tin tài khoản."));
  }
}