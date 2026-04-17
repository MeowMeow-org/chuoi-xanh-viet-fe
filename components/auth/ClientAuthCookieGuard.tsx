"use client";

import { useEffect } from "react";

import { AUTH_ACCESS_TOKEN_COOKIE } from "@/services/auth/constants";
import { clearAuthCookies } from "@/services/auth/storage";
import { useAuthStore } from "@/store/useAuthStore";

function readAccessTokenFromDocumentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${AUTH_ACCESS_TOKEN_COOKIE}=`;
  const row = document.cookie.split("; ").find((r) => r.startsWith(prefix));
  if (!row) return null;
  const raw = row.slice(prefix.length);
  const v = decodeURIComponent(raw).trim();
  return v.length > 0 ? v : null;
}

/** Đồng bộ với cookie (nguồn khớp server): logout / tab khác xóa cookie thì ép về login; hỗ trợ bfcache & quay lại. */
export default function ClientAuthCookieGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const enforce = () => {
      if (readAccessTokenFromDocumentCookie()) return;

      useAuthStore.getState().clearAuth();
      void useAuthStore.persist.clearStorage();
      clearAuthCookies();
      window.location.replace("/login");
    };

    enforce();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) enforce();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") enforce();
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", enforce);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", enforce);
    };
  }, []);

  return <>{children}</>;
}
