"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/certificates", label: "Duyệt chứng chỉ", icon: ShieldCheck },
];

const mobileNavItems = [
  { href: "/admin/certificates", label: "Chứng chỉ", icon: ShieldCheck },
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const user = useAuthStore((s) => s.user);
  const displayName = user?.fullName?.trim() || "Admin";
  const { data: unreadNotifs = 0 } = useNotificationUnreadCount();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(120,20%,98%)] text-[hsl(150,10%,15%)]">
      <header className="sticky top-0 z-50 border-b border-[hsl(142,14%,88%)] bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
        <div className="relative mx-auto grid h-14 w-full max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
          <Link
            href="/admin"
            className="flex w-max max-w-[min(100%,14rem)] shrink-0 items-center gap-2 justify-self-start pl-9 sm:max-w-none md:pl-0"
          >
            <Image
              src="/logo.png"
              alt="Chuỗi Xanh Việt"
              width={830}
              height={260}
              sizes="102px"
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="self-end min-w-0 truncate whitespace-nowrap text-lg font-bold leading-none text-[hsl(150,10%,22%)]">
              Chuỗi Xanh Việt
            </span>
            <span className="hidden rounded-full border border-[hsl(142,14%,88%)] bg-[hsl(120,15%,96%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(150,10%,35%)] lg:inline">
              Quản trị
            </span>
          </Link>

          <nav className="hidden min-w-0 items-center gap-0.5 justify-self-center md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm leading-none transition-colors",
                    active
                      ? "bg-[hsl(142,69%,45%)] font-semibold text-white"
                      : "font-medium text-[hsl(150,6%,38%)] hover:bg-[hsl(120,10%,92%)] hover:text-[hsl(150,10%,18%)]",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute right-1 flex items-center gap-1 md:static md:justify-self-end">
            <div className="flex items-center gap-1">
              <NotificationsPopover
                variant="admin"
                viewAllHref="/admin/notifications"
                unreadCount={unreadNotifs}
              />
            </div>
            <div className="group relative ml-2 hidden shrink-0 md:block">
              <div
                className="flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[hsl(120,10%,94%)] focus-visible:ring-2 focus-visible:ring-[hsl(142,71%,45%)] focus-visible:ring-offset-2"
                tabIndex={0}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/15">
                  <User className="h-4 w-4 text-[hsl(142,71%,35%)]" />
                </span>
                <span className="max-w-40 truncate font-semibold text-[hsl(150,10%,22%)]">
                  {displayName}
                </span>
              </div>
              <div
                className="pointer-events-none invisible absolute right-0 top-full z-60 pt-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                role="menu"
              >
                <div className="w-52 rounded-lg border border-[hsl(142,14%,88%)] bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => logout()}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      <div
        className={cn(
          "fixed inset-x-0 top-14 bottom-[57px] z-40 transition-opacity duration-200 md:hidden",
          mobileMenuOpen
            ? "pointer-events-auto bg-black/35 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0",
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={cn(
            "h-full w-[84%] max-w-xs overflow-y-auto border-r bg-white p-3 transition-transform duration-300 ease-out",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={`${item.href}-drawer`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors",
                    active
                      ? "bg-[hsl(142,71%,45%)] text-white"
                      : "text-[hsl(150,7%,45%)] hover:bg-[hsl(120,10%,92%)]",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 flex items-center gap-3 border-t px-4 py-3 pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/15">
                <User className="h-5 w-5 text-[hsl(142,71%,35%)]" />
              </span>
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-[hsl(150,7%,45%)]">Vai trò: Quản trị</p>
              </div>
            </div>

            <div className="border-t px-4 pt-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-lg px-0 py-3 text-left text-base font-medium text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-5 w-5" />
                {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur md:hidden">
        <div className="flex overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={`${item.href}-bottom`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-center transition-colors",
                  active
                    ? "bg-[hsl(142,71%,45%)]/18 text-[hsl(142,71%,30%)] shadow-[inset_0_0_0_1px_hsl(142,50%,80%)]"
                    : "text-[hsl(150,7%,45%)] hover:bg-[hsl(120,12%,96%)]",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    active && "text-[hsl(142,71%,34%)]",
                  )}
                />
                <span
                  className={cn(
                    "w-full text-[10px] leading-tight whitespace-normal",
                    active
                      ? "font-semibold text-[hsl(142,71%,28%)]"
                      : "font-medium",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
