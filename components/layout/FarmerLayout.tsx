"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Home,
  Menu,
  Leaf,
  LogOut,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  TrendingUp,
  User,
  Users,
  X,
  Package,
} from "lucide-react";

import FarmerShellOnboarding from "@/components/onboarding/FarmerShellOnboarding";
import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useChatUnreadBadge } from "@/hooks/useChatUnread";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/farmer", label: "Tổng quan", icon: Home },
  { href: "/farmer/farms", label: "Nông trại", icon: Sprout },
  { href: "/farmer/marketplace", label: "Gian hàng", icon: ShoppingBag },
  { href: "/farmer/earnings", label: "Lợi nhuận", icon: TrendingUp },
  { href: "/farmer/forum", label: "Diễn đàn", icon: Users },
  { href: "/farmer/agri-trend", label: "Xu hướng", icon: TrendingUp },
  { href: "/farmer/ai-assistant", label: "Trợ lý AI", icon: MessageCircle },
];

const mobileNavItems = [
  { href: "/farmer/farms", label: "Nông trại", icon: Sprout },
  { href: "/farmer/forum", label: "Diễn đàn", icon: Users },
  { href: "/farmer", label: "Tổng quan", icon: Home },
  { href: "/farmer/marketplace", label: "Gian hàng", icon: ShoppingBag },
  { href: "/farmer/ai-assistant", label: "Trợ lý AI", icon: MessageCircle },
];

const secondaryNav = [
  { href: "/farmer/messages", label: "Tin nhắn", icon: MessageCircle },
  { href: "/farmer/notifications", label: "Thông báo", icon: Bell },
  { href: "/farmer/certificates", label: "Chứng chỉ", icon: ShieldCheck },
  { href: "/farmer/profile", label: "Hồ sơ nông trại", icon: User },
];

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: unreadNotifs = 0 } = useNotificationUnreadCount();
  const { chatConversationsWithUnread } = useChatUnreadBadge(true);
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();
  const user = useAuthStore((state) => state.user);

  const isActive = (path: string) => {
    if (path === "/farmer") {
      return pathname === "/farmer";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  useEffect(() => {
    const id = window.setTimeout(() => setMobileMenuOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(120,20%,98%)] text-[hsl(150,10%,15%)]">
      <>
        <header
          id="onboarding-farmer-header"
          className="sticky top-0 z-50 border-b border-[hsl(142,14%,88%)] bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80"
        >
          <div className="relative mx-auto grid h-14 w-full max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
            <Link
              href="/farmer"
              className="flex w-max shrink-0 items-center gap-2 justify-self-start pl-9 md:pl-0"
            >
              <span className="gradient-green flex items-center justify-center rounded-lg p-1.5">
                <Leaf className="h-5 w-5 text-white" />
              </span>
              <span className="whitespace-nowrap text-lg font-bold leading-none text-[hsl(150,10%,22%)]">
                Chuỗi Xanh Việt
              </span>
            </Link>

            <nav
              id="onboarding-farmer-nav-desktop"
              className="hidden items-center gap-0.5 justify-self-center md:flex"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm leading-none transition-colors ${active
                      ? "bg-[hsl(142,71%,45%)]/18 font-semibold shadow-[inset_0_0_0_1px_hsl(142,50%,80%)]"
                      : "text-[hsl(150,6%,38%)] font-medium hover:bg-[hsl(120,10%,92%)] hover:text-[hsl(150,10%,18%)]"
                      }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${active ? "text-[hsl(142,71%,34%)]" : ""}`}
                    />
                    <span
                      className={active ? "text-[hsl(142,71%,34%)]" : ""}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div
              id="onboarding-farmer-actions"
              className="absolute right-1 flex items-center gap-1 md:static md:justify-self-end"
            >
              <div className="flex items-center gap-1">
                <NotificationsPopover
                  variant="farmer"
                  viewAllHref="/farmer/notifications"
                  unreadCount={unreadNotifs}
                />
                <Link href="/farmer/messages" className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                    title="Tin nhắn"
                  >
                    <MessageCircle className="size-5" />
                    {chatConversationsWithUnread > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-semibold text-white tabular-nums">
                        {chatConversationsWithUnread > 99
                          ? "99+"
                          : chatConversationsWithUnread}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/farmer/orders">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Package className="size-5" />
                  </Button>
                </Link>
              </div>
              <div className="group relative ml-2 hidden shrink-0 md:block">
                <div
                  className="flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[hsl(120,10%,94%)] focus-visible:ring-2 focus-visible:ring-[hsl(142,71%,45%)] focus-visible:ring-offset-2"
                  tabIndex={0}
                  aria-haspopup="menu"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[hsl(142,71%,45%)]/15">
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-[hsl(142,71%,35%)]" />
                    )}
                  </span>
                  <span className="max-w-40 truncate font-semibold text-[hsl(150,10%,22%)]">
                    {user?.fullName ?? "Farmer"}
                  </span>
                </div>
                <div
                  className="pointer-events-none invisible absolute right-0 top-full z-60 pt-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                  role="menu"
                >
                  <div className="w-52 rounded-lg border border-[hsl(142,14%,88%)] bg-white py-1 shadow-lg">
                    <Link
                      href="/farmer/profile"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-[hsl(150,10%,22%)] hover:bg-[hsl(120,10%,96%)]"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      Hồ sơ tài khoản
                    </Link>
                    <Link
                      href="/farmer/certificates"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-[hsl(150,10%,22%)] hover:bg-[hsl(120,10%,96%)]"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      Chứng chỉ nông trại
                    </Link>
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
            >
              {mobileMenuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </Button>
          </div>
        </header>

        <main id="onboarding-farmer-main" className="flex-1">
          {children}
        </main>

        <div
          className={cn(
            "fixed inset-x-0 top-14 bottom-14 z-40 transition-opacity duration-200 md:hidden",
            mobileMenuOpen
              ? "pointer-events-auto bg-black/35 opacity-100"
              : "pointer-events-none hidden",
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={`h-full w-[84%] max-w-xs overflow-y-auto border-r bg-white p-3 transition-transform duration-300 ease-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${active
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
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${active
                        ? "bg-[hsl(142,71%,45%)] text-white"
                        : "text-[hsl(150,7%,45%)] hover:bg-[hsl(120,10%,92%)]"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {item.href === "/farmer/messages" &&
                        chatConversationsWithUnread > 0 && (
                          <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-white tabular-nums">
                            {chatConversationsWithUnread > 99
                              ? "99+"
                              : chatConversationsWithUnread}
                          </span>
                        )}
                      {item.href === "/farmer/notifications" &&
                        unreadNotifs > 0 && (
                          <span className="ml-auto rounded-full bg-[hsl(142,71%,45%)] px-1.5 py-0.5 text-[10px] text-white tabular-nums">
                            {unreadNotifs > 99 ? "99+" : unreadNotifs}
                          </span>
                        )}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center gap-3 border-t px-4 py-3 pt-4">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[hsl(142,71%,45%)]/15">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt={user?.fullName ?? "User avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-[hsl(142,71%,35%)]" />
                  )}
                </span>
                <div>
                  <p className="font-semibold">{user?.fullName ?? "Farmer"}</p>
                  <p className="text-sm text-[hsl(150,7%,45%)]">Vai trò: farmer</p>
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

        <nav
          id="onboarding-farmer-bottom-nav"
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur md:hidden"
        >
          <div className="flex w-full justify-around overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const showUnread =
                item.href === "/farmer/notifications" && unreadNotifs > 0;

              return (
                <Link
                  key={`${item.href}-bottom`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] leading-tight transition-colors sm:text-xs",
                    active
                      ? "bg-[hsl(142,71%,45%)]/18 text-[hsl(142,71%,30%)] shadow-[inset_0_0_0_1px_hsl(142,50%,80%)]"
                      : "font-medium text-[hsl(150,7%,45%)] hover:bg-[hsl(120,12%,96%)]",
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
                      "line-clamp-2 w-full min-w-0 text-center wrap-break-word",
                      active
                        ? "font-semibold text-[hsl(142,71%,28%)]"
                        : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                  {showUnread && (
                    <span className="absolute right-0.5 top-0.5 flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-medium text-white tabular-nums">
                      {unreadNotifs > 99 ? "99+" : unreadNotifs}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <FarmerShellOnboarding />
      </>
    </div>
  );
}
