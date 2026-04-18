"use client";

import Link from "next/link";
import { Leaf, LogOut } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const user = useAuthStore((s) => s.user);
  const { data: unreadNotifs = 0 } = useNotificationUnreadCount();

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(120,20%,98%)] text-[hsl(150,10%,15%)]">
      <header className="sticky top-0 z-50 border-b border-[hsl(142,14%,88%)] bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
        <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="rounded-lg bg-[hsl(142,71%,45%)] p-1.5">
              <Leaf className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-semibold text-[hsl(150,10%,22%)]">
              Quản trị
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <NotificationsPopover
              variant="admin"
              viewAllHref="/admin/notifications"
              unreadCount={unreadNotifs}
              triggerClassName="h-9 w-9"
            />
            <span className="hidden text-sm font-medium text-[hsl(150,10%,22%)] sm:inline">
              {user?.fullName?.trim() || "Admin"}
            </span>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => logout()}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs",
              )}
            >
              <LogOut className="h-3.5 w-3.5" />
              {isLoggingOut ? "…" : "Đăng xuất"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
