"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Inbox,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { href: "/cooperative", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/cooperative/households", label: "Nông hộ", icon: Users },
  { href: "/cooperative/requests", label: "Yêu cầu", icon: Inbox },
];

const mobileNavItems = [
  { href: "/cooperative/households", label: "Nông hộ", icon: Users },
  { href: "/cooperative", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/cooperative/requests", label: "Yêu cầu", icon: Inbox },
];

const secondaryNav = [
  { href: "/cooperative/notifications", label: "Thông báo", icon: Bell },
  { href: "/cooperative/profile", label: "Hồ sơ HTX", icon: User },
];

export default function CooperativeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const displayName = user?.fullName?.trim() || "Hợp tác xã";
  const unreadNotifs = 0;
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const isActive = (path: string) => {
    if (path === "/cooperative") {
      return pathname === "/cooperative";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(120,20%,98%)] text-[hsl(150,10%,15%)]">
      <header className="sticky top-0 z-50 border-b border-[hsl(142,14%,88%)] bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
        <div className="relative mx-auto grid h-14 w-full max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
          <Link
            href="/cooperative"
            className="flex w-max shrink-0 items-center gap-2 justify-self-start pl-9 md:pl-0"
          >
            <span className="rounded-lg bg-[hsl(142,71%,45%)] p-1.5">
              <Leaf className="h-5 w-5 text-white" />
            </span>
            <span className="whitespace-nowrap text-lg font-semibold leading-none text-[hsl(150,10%,22%)]">
              Chuỗi Xanh Việt
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 justify-self-center md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm leading-none transition-colors ${
                    active
                      ? "bg-[hsl(142,69%,45%)] font-semibold text-white"
                      : "font-medium text-[hsl(150,6%,38%)] hover:bg-[hsl(120,10%,92%)] hover:text-[hsl(150,10%,18%)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="absolute right-1 flex items-center gap-1 md:static md:justify-self-end">
            <div className="flex items-center gap-1">
              <Link href="/cooperative/notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9"
                >
                  <Bell className="size-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {unreadNotifs}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
            <div className="hidden items-center gap-1 md:flex">
              <Link
                href="/cooperative/profile"
                className="ml-2 flex shrink-0 items-center gap-2 text-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/15">
                  <User className="h-4 w-4 text-[hsl(142,71%,35%)]" />
                </span>
                <span className="whitespace-nowrap font-semibold text-[hsl(150,10%,22%)]">
                  {displayName}
                </span>
              </Link>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <div
        className={`fixed inset-x-0 top-14 bottom-[57px] z-40 transition-opacity duration-200 md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto bg-black/35 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`h-full w-[84%] max-w-xs overflow-y-auto border-r bg-white p-3 transition-transform duration-300 ease-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={`${item.href}-mobile`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                    active
                      ? "bg-[hsl(142,71%,45%)] text-white"
                      : "text-[hsl(150,7%,45%)] hover:bg-[hsl(120,10%,92%)]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="my-2 border-t pt-2">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={`${item.href}-secondary`}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      active
                        ? "bg-[hsl(142,71%,45%)] text-white"
                        : "text-[hsl(150,7%,45%)] hover:bg-[hsl(120,10%,92%)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                    {item.href === "/cooperative/notifications" &&
                      unreadNotifs > 0 && (
                        <span className="ml-auto rounded-full bg-[hsl(142,71%,45%)] px-1.5 py-0.5 text-[10px] text-white">
                          {unreadNotifs}
                        </span>
                      )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 flex items-center gap-3 border-t px-4 py-3 pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/15">
                <User className="h-5 w-5 text-[hsl(142,71%,35%)]" />
              </span>
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-[hsl(150,7%,45%)]">Vai trò: HTX</p>
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
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur md:hidden">
        <div className="flex py-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={`${item.href}-bottom`}
                href={item.href}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-center transition-colors ${
                  active
                    ? "text-[hsl(142,71%,35%)]"
                    : "text-[hsl(150,7%,45%)]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="w-full text-[11px] font-medium leading-tight whitespace-normal">
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
