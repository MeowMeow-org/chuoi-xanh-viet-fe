"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";

type Role = "consumer" | "farmer" | "cooperative" | "admin";

type RequireAuthOptions = {
  /** Nếu truyền, chỉ role khớp mới đc xem là hợp lệ. Role khác sẽ toast nhưng KHÔNG redirect (đã login) */
  role?: Role;
  /** Toast khi chưa đăng nhập */
  guestMessage?: string;
  /** Toast khi sai role */
  wrongRoleMessage?: string;
};

/**
 * Trả về hàm guard: gọi trước mỗi action cần auth.
 * - Guest: toast + redirect `/login?next=<currentUrl>`, return false.
 * - Đã login nhưng sai `role` (nếu cấu hình): toast cảnh báo, return false.
 * - Hợp lệ: return true.
 */
export function useRequireAuth(defaultOpts: RequireAuthOptions = {}) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (opts: RequireAuthOptions = {}) => {
      const merged: RequireAuthOptions = { ...defaultOpts, ...opts };
      if (!user) {
        const qs = searchParams?.toString();
        const currentUrl = qs ? `${pathname}?${qs}` : pathname;
        toast.error(merged.guestMessage ?? "Vui lòng đăng nhập để tiếp tục");
        router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
        return false;
      }
      if (merged.role && user.role !== merged.role) {
        toast.error(
          merged.wrongRoleMessage ??
            `Chỉ tài khoản ${merged.role} mới có thể thực hiện thao tác này`,
        );
        return false;
      }
      return true;
    },
    [defaultOpts, pathname, router, searchParams, user],
  );
}
