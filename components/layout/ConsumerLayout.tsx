"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  LogIn,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useNotificationUnreadCount } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/useAuthStore";
import { selectCartCount, useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Trang chủ", icon: Home, publicHome: true },
  { to: "/marketplace", label: "Chợ", icon: Search },
  { to: "/forum", label: "Diễn đàn", icon: Users },
  { to: "/consumer/ai", label: "Trợ lý AI", icon: Bot, requireConsumer: true },
];

type MobileNavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  requireAuth?: boolean;
  requireConsumer?: boolean;
};

const mobileNavAuthed: MobileNavItem[] = [
  { to: "/consumer", label: "Trang chủ", icon: Home },
  { to: "/marketplace", label: "Chợ", icon: Search },
  { to: "/consumer/cart", label: "Giỏ hàng", icon: ShoppingCart, requireConsumer: true },
  { to: "/consumer/orders", label: "Đơn hàng", icon: Package, requireConsumer: true },
  { to: "/consumer/profile", label: "Tôi", icon: User, requireAuth: true },
];

const mobileNavGuest: MobileNavItem[] = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/marketplace", label: "Chợ", icon: Search },
  { to: "/forum", label: "Diễn đàn", icon: Users },
  { to: "/login", label: "Đăng nhập", icon: LogIn },
];

const sideNav = [
  { to: "/consumer/orders", label: "Đơn hàng", icon: Package },
  { to: "/consumer/messages", label: "Tin nhắn", icon: MessageSquare },
  { to: "/consumer/notifications", label: "Thông báo", icon: Bell },
  { to: "/consumer/profile", label: "Tài khoản", icon: User },
];

type Role = "consumer" | "farmer" | "cooperative" | "admin";

const ROLE_LABEL: Record<Role, string> = {
  consumer: "Người mua",
  farmer: "Nông hộ",
  cooperative: "Hợp tác xã",
  admin: "Quản trị",
};

const ROLE_HOME: Record<Role, string> = {
  consumer: "/consumer",
  farmer: "/farmer",
  cooperative: "/cooperative",
  admin: "/admin",
};

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const cartCountRaw = useCartStore(selectCartCount);
  const cartCount = hasHydrated ? cartCountRaw : 0;
  const user = useAuthStore((s) => s.user);
  const role = (user?.role as Role | undefined) ?? null;
  const isGuest = !user;
  const isConsumer = role === "consumer";

  // Chỉ gọi API notification khi đã login để tránh 401 cho guest.
  const { data: unreadNotifs = 0 } = useNotificationUnreadCount({
    enabled: !isGuest,
  });
  const consumerName = user?.fullName || "Người mua";
  const consumerEmail = user?.email || "";

  const isActive = (path: string) => {
    if (path === "/consumer") return pathname === "/consumer";
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const headerHome = isConsumer ? "/consumer" : "/";

  /** Redirect protection: lưu URL hiện tại vào ?next= cho các link cần auth. */
  const withNext = (href: string) => {
    const qs = searchParams?.toString();
    const current = qs ? `${pathname}?${qs}` : pathname;
    return `${href}?next=${encodeURIComponent(current)}`;
  };

  const mobileNav = isGuest ? mobileNavGuest : mobileNavAuthed;

  const requireLogin = (label: string) => {
    router.push(withNext("/login"));
    void label;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Banner chế độ công khai khi user KHÁC role consumer đang xem. */}
      {user && !isConsumer && role && (
        <div className="border-b bg-amber-50/80 text-amber-900">
          <div className="container flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
            <p className="min-w-0">
              Bạn đang xem chế độ công khai với vai trò{" "}
              <span className="font-semibold">{ROLE_LABEL[role]}</span>. Các
              chức năng mua hàng chỉ dành cho tài khoản người mua.
            </p>
            <Link
              href={ROLE_HOME[role]}
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1 font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              <ArrowLeftRight className="h-3 w-3" />
              Về trang {ROLE_LABEL[role]}
            </Link>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="container flex h-14 items-center justify-between">
          <Link href={headerHome} className="flex items-center gap-2">
            <span className="gradient-green flex items-center justify-center rounded-lg p-1.5">
              <Leaf className="h-5 w-5 text-white" />
            </span>
            <span className="whitespace-nowrap text-lg font-bold leading-none text-[hsl(150,10%,22%)]">
              Chuỗi Xanh Việt
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems
              .filter((it) => !it.requireConsumer || isConsumer)
              .map((item) => {
                const to = item.publicHome && isConsumer ? "/consumer" : item.to;
                return (
                  <Link
                    key={item.to}
                    href={to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(to)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-1">
              {isConsumer && (
                <>
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
                </>
              )}

              {isGuest && (
                <div className="ml-2 flex items-center gap-2">
                  <Link href={withNext("/consumer/cart")}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9"
                      title="Giỏ hàng (đăng nhập)"
                      onClick={(e) => {
                        e.preventDefault();
                        requireLogin("cart");
                      }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link
                    href={withNext("/login")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold text-foreground hover:bg-accent"
                  >
                    <LogIn className="h-4 w-4" /> Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}

              {user && !isConsumer && role && (
                <Link
                  href={ROLE_HOME[role]}
                  className="ml-2 inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold text-foreground hover:bg-accent"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Về trang {ROLE_LABEL[role]}
                </Link>
              )}

              {user && (
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
                      {isConsumer && (
                        <Link
                          href="/consumer/profile"
                          role="menuitem"
                          className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-accent"
                        >
                          <User className="h-4 w-4 shrink-0" />
                          Hồ sơ tài khoản
                        </Link>
                      )}
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
              )}
            </div>
            <div className="flex items-center gap-0.5 md:hidden">
              {isConsumer && (
                <NotificationsPopover
                  variant="consumer"
                  viewAllHref="/consumer/notifications"
                  unreadCount={unreadNotifs}
                />
              )}
              {isGuest && (
                <Link
                  href={withNext("/login")}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold text-foreground hover:bg-accent"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Đăng nhập
                </Link>
              )}
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

        {menuOpen && (
          <div className="md:hidden border-t bg-card animate-fade-in">
            <div className="container py-3 space-y-1">
              {navItems
                .filter((it) => !it.requireConsumer || isConsumer)
                .map((item) => {
                  const to = item.publicHome && isConsumer ? "/consumer" : item.to;
                  return (
                    <Link
                      key={item.to}
                      href={to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive(to)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              {isConsumer && (
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
                      {item.to === "/consumer/notifications" &&
                        unreadNotifs > 0 && (
                          <span
                            className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                              isActive(item.to)
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/15 text-primary"
                            }`}
                          >
                            {unreadNotifs > 99 ? "99+" : unreadNotifs}
                          </span>
                        )}
                    </Link>
                  ))}
                </div>
              )}
              {user && !isConsumer && role && (
                <Link
                  href={ROLE_HOME[role]}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 mt-2 border-t rounded-lg text-base font-medium text-foreground hover:bg-accent"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                  Về trang {ROLE_LABEL[role]}
                </Link>
              )}
              {user && (
                <>
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
                </>
              )}
              {isGuest && (
                <div className="grid grid-cols-2 gap-2 border-t mt-2 pt-3">
                  <Link
                    href={withNext("/login")}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent"
                  >
                    <LogIn className="h-4 w-4" /> Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur">
        <div className="flex w-full py-1">
          {mobileNav.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;
            const needsLogin =
              (item.requireAuth && isGuest) ||
              (item.requireConsumer && !isConsumer);
            const href = needsLogin ? withNext("/login") : item.to;
            return (
              <Link
                key={item.to}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  if (needsLogin && isGuest) {
                    e.preventDefault();
                    requireLogin(item.label);
                  }
                }}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] leading-tight transition-colors sm:text-xs",
                  active
                    ? "bg-[hsl(142,71%,45%)]/18 text-[hsl(142,71%,30%)] shadow-[inset_0_0_0_1px_hsl(142,50%,80%)]"
                    : "font-medium text-muted-foreground hover:bg-[hsl(120,12%,96%)]",
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
                {item.to === "/consumer/cart" && cartCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] text-destructive-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
