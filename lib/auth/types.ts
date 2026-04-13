export type AuthRole = "consumer" | "admin" | "farmer";

export type AuthUser = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: AuthRole;
    status: string;
};

export type LoginResponseData = {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
};

export type LoginApiResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: LoginResponseData;
};

export type MyProfileApiResponse = {
    success: boolean;
    statusCode: number;
    message: string;
    data: AuthUser;
};

export type AuthSession = LoginResponseData;