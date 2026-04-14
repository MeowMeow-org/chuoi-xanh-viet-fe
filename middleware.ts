import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ACCESS_TOKEN_COOKIE, AUTH_ROLE_COOKIE } from "@/services/auth/constants";
import { normalizeAuthRole, type AuthRole, type MyProfileApiResponse } from "@/services/auth/types";

const roleRouteMap: Record<AuthRole, string> = {
    admin: "/admin",
    consumer: "/consumer",
    farmer: "/farmer",
};

const protectedRoleRoutes: Array<{ prefix: string; role: AuthRole }> = [
    { prefix: "/admin", role: "admin" },
    { prefix: "/consumer", role: "consumer" },
    { prefix: "/farmer", role: "farmer" },
];

function getRequiredRole(pathname: string): AuthRole | null {
    const matchedRoute = protectedRoleRoutes.find(
        ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    return matchedRoute?.role ?? null;
}

async function getRoleFromMe(accessToken: string): Promise<AuthRole | null> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_SWAGGER_API_ENDPOINT;
    if (!apiBaseUrl) {
        return null;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/v1/api/auth/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        const payload = (await response.json()) as MyProfileApiResponse;
        if (!payload.success || !payload.data?.role) {
            return null;
        }

        return normalizeAuthRole(payload.data.role);
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const requiredRole = getRequiredRole(request.nextUrl.pathname);
    if (!requiredRole) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const cookieRole = normalizeAuthRole(request.cookies.get(AUTH_ROLE_COOKIE)?.value);
    if (cookieRole) {
        if (cookieRole !== requiredRole) {
            return NextResponse.redirect(new URL(roleRouteMap[cookieRole], request.url));
        }

        return NextResponse.next();
    }

    const role = await getRoleFromMe(accessToken);
    if (!role) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (role !== requiredRole) {
        return NextResponse.redirect(new URL(roleRouteMap[role], request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/consumer/:path*", "/farmer/:path*"],
};