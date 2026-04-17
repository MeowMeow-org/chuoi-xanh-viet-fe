import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CooperativeShell from "@/components/layout/CooperativeLayout";
import {
  AUTH_ACCESS_TOKEN_COOKIE,
  AUTH_ROLE_COOKIE,
} from "@/services/auth/constants";
import { normalizeAuthRole } from "@/services/auth";

/** Cùng nhóm (protected) đã chặn không cookie access; kiểm tra lại để rõ ràng và tránh lệch role/token. */
export const dynamic = "force-dynamic";

export default async function CooperativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_ACCESS_TOKEN_COOKIE)?.value?.trim();
  const role = normalizeAuthRole(cookieStore.get(AUTH_ROLE_COOKIE)?.value);

  if (!accessToken || !role) {
    redirect("/login");
  }

  if (role !== "cooperative") {
    redirect(`/${role}`);
  }

  return <CooperativeShell>{children}</CooperativeShell>;
}
