import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import ClientAuthCookieGuard from "@/components/auth/ClientAuthCookieGuard";
import { AUTH_ACCESS_TOKEN_COOKIE } from "@/services/auth/constants";

/** Luôn đọc cookie theo request — tránh cache layout khiến vẫn vào được sau khi hết phiên. */
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value?.trim();

  if (!accessToken) {
    redirect("/login");
  }

  return <ClientAuthCookieGuard>{children}</ClientAuthCookieGuard>;
}
