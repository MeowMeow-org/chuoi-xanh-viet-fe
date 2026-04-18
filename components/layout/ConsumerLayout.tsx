"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Leaf,
  Bell,
  MessageSquare,
  Package,
  Users,
  Bot,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { selectCartCount, useCartStore } from "@/store/useCartStore";

const navItems = [
  { to: "/consumer", label: "Trang chủ", icon: Home },
  { to: "/consumer/marketplace", label: "Chợ", icon: Search },
  { to: "/consumer/forum", label: "Diễn đàn", icon: Users },
  { to: "/consumer/ai", label: "Trợ lý AI", icon: Bot },
];

const mobileNav = [
  { to: "/consumer", label: "Trang chủ", icon: Home },
  { to: "/consumer/marketplace", label: "Chợ", icon: Search },
  { to: "/consumer/cart", label: "Giỏ hàng", icon: ShoppingCart },
  { to: "/consumer/orders", label: "Đơn hàng", icon: Package },
  { to: "/consumer/profile", label: "Tôi", icon: User },
];

const sideNav = [
  { to: "/consumer/orders", label: "Đơn hàng", icon: Package },
  { to: "/consumer/messages", label: "Tin nhắn", icon: MessageSquare },
  { to: "/consumer/notifications", label: "Thông báo", icon: Bell },
  { to: "/consumer/profile", label: "Tài khoản", icon: User },
];

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  // Cart count is derived from Zustand store so the badge updates realtime
  // khi có change ở page khác (cart/product/checkout). hasHydrated đảm bảo
  // không bị hydration mismatch giữa SSR (= 0) và CSR (persisted value).
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const cartCountRaw = useCartStore(selectCartCount);
  const cartCount = hasHydrated ? cartCountRaw : 0;
  const user = useAuthStore((s) => s.user);
  const consumerName = user?.fullName || "Người mua";
  const consumerEmail = user?.email || "";
  const { data: unreadNotifs = 0 } = useNotificationUnreadCount();

  const isActive = (path: string) => {
    if (path === "/consumer") return pathname === "/consumer";
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/consumer" className="flex items-center gap-2">
            <div className="gradient-green rounded-lg p-1.5">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Chuỗi Xanh Việt</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-1">
              <Link href="/consumer/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/consumer/orders">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Đơn hàng của tôi"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </Link>
              <NotificationsPopover
                variant="consumer"
                viewAllHref="/consumer/notifications"
                unreadCount={unreadNotifs}
              />
              <Link href="/consumer/messages">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Tin nhắn"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <div className="group relative ml-2 shrink-0">
                <div
                  className="flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  tabIndex={0}
                  aria-haspopup="menu"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="max-w-[10rem] truncate text-sm font-medium">
                    {consumerName}
                  </span>
                </div>
                <div
                  className="pointer-events-none invisible absolute right-0 top-full z-[60] pt-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                  role="menu"
                >
                  <div className="w-52 rounded-lg border bg-popover py-1 text-popover-foreground shadow-md">
                    <Link
                      href="/consumer/profile"
                      role="menuitem"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <User className="h-4 w-4 shrink-0" />
                      Hồ sơ tài khoản
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => logout()}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      {isLoggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 md:hidden">
              <NotificationsPopover
                variant="consumer"
                viewAllHref="/consumer/notifications"
                unreadCount={unreadNotifs}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-card animate-fade-in">
            <div className="container py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.to)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t my-2 pt-2">
                {sideNav.map((item) => (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.to)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    {item.to === '/consumer/notifications' && unreadNotifs > 0 && (
                      <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${isActive(item.to) ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/15 text-primary'}`}>
                        {unreadNotifs > 99 ? '99+' : unreadNotifs}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-t mt-2 pt-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{consumerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {consumerEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/5 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60 border-t"
              >
                <LogOut className="h-5 w-5" />
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-accent rounded-lg text-sm"
              >
                Đổi vai trò
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur">
        <div className="flex w-full py-1">
          {mobileNav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium leading-tight transition-colors sm:text-xs ${
                isActive(item.to) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="line-clamp-2 w-full min-w-0 text-center wrap-break-word">
                {item.label}
              </span>
              {item.to === "/consumer/cart" && cartCount > 0 && (
                <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
