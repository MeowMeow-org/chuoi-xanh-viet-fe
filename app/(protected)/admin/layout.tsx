import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminShell from "@/components/layout/AdminShell";
import { AUTH_ROLE_COOKIE } from "@/services/auth/constants";
import { normalizeAuthRole } from "@/services/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const role = normalizeAuthRole(cookieStore.get(AUTH_ROLE_COOKIE)?.value);

  if (!role) {
    redirect("/login");
  }

  if (role !== "admin") {
    redirect(`/${role}`);
  }

  return <AdminShell>{children}</AdminShell>;
}
