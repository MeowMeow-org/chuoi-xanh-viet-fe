import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_ACCESS_TOKEN_COOKIE } from "@/services/auth/constants";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return <>{children}</>;
}
