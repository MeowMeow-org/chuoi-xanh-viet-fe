import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { AUTH_ACCESS_TOKEN_COOKIE } from '@/services/auth/constants';

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value?.trim();
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

/**
 * Các path PUBLIC (không cần login) — không đưa vào matcher:
 * - "/" (landing), "/login", "/register"
 * - "/marketplace", "/shop/:id", "/product/:id", "/forum", "/truy-xuat", "/truy-xuat/:code"
 *
 * Các path còn lại dưới đây bắt buộc login. Role check được thực hiện ở từng
 * layout.tsx tương ứng (vd `(protected)/farmer/layout.tsx`).
 */
export const config = {
  matcher: [
    '/farmer/:path*',
    '/consumer/:path*',
    '/cooperative/:path*',
    '/admin/:path*',
    '/trace/:path*',
  ],
};
