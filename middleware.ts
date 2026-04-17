import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_ACCESS_TOKEN_COOKIE } from "@/services/auth/constants";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value?.trim();
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/farmer/:path*",
    "/consumer/:path*",
    "/cooperative/:path*",
    "/admin/:path*",
  ],
};
