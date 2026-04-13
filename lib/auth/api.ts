import axios from "axios";

import axiosInstance from "@/lib/axios";
import type {
    AuthUser,
    LoginApiResponse,
    LoginResponseData,
    MyProfileApiResponse,
} from "@/lib/auth/types";

type LoginPayload = {
    email: string;
    password: string;
};

export async function loginWithEmail({ email, password }: LoginPayload): Promise<LoginResponseData> {
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

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const responseMessage =
                (error.response?.data as { message?: string } | undefined)?.message ||
                error.message ||
                "Đăng nhập thất bại. Vui lòng thử lại.";
            throw new Error(responseMessage);
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Đăng nhập thất bại. Vui lòng thử lại.");
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

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const responseMessage =
                (error.response?.data as { message?: string } | undefined)?.message ||
                error.message ||
                "Không thể lấy thông tin tài khoản.";
            throw new Error(responseMessage);
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error("Không thể lấy thông tin tài khoản.");
    }
}