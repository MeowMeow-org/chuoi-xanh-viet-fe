"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Search, ShoppingCart, User, Menu, X, Leaf, Bell,
  MessageSquare, Package, QrCode, Users, Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { selectCartCount, useCartStore } from '@/store/useCartStore';

const navItems = [
  { to: '/consumer', label: 'Trang chủ', icon: Home },
  { to: '/consumer/marketplace', label: 'Chợ', icon: Search },
  { to: '/consumer/trace', label: 'Truy xuất', icon: QrCode },
  { to: '/consumer/forum', label: 'Diễn đàn', icon: Users },
  { to: '/consumer/ai', label: 'Trợ lý AI', icon: Bot },
];

const mobileNav = [
  { to: '/consumer', label: 'Trang chủ', icon: Home },
  { to: '/consumer/marketplace', label: 'Chợ', icon: Search },
  { to: '/consumer/cart', label: 'Giỏ hàng', icon: ShoppingCart },
  { to: '/consumer/orders', label: 'Đơn hàng', icon: Package },
  { to: '/consumer/profile', label: 'Tôi', icon: User },
];

const sideNav = [
  { to: '/consumer/orders', label: 'Đơn hàng', icon: Package },
  { to: '/consumer/messages', label: 'Tin nhắn', icon: MessageSquare },
  { to: '/consumer/notifications', label: 'Thông báo', icon: Bell },
  { to: '/consumer/profile', label: 'Tài khoản', icon: User },
];

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Cart count is derived from Zustand store so the badge updates realtime
  // khi có change ở page khác (cart/product/checkout). hasHydrated đảm bảo
  // không bị hydration mismatch giữa SSR (= 0) và CSR (persisted value).
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const cartCountRaw = useCartStore(selectCartCount);
  const cartCount = hasHydrated ? cartCountRaw : 0;
  const user = useAuthStore((s) => s.user);
  const consumerName = user?.fullName || 'Người mua';
  const consumerEmail = user?.email || '';

  const isActive = (path: string) => {
    if (path === '/consumer') return pathname === '/consumer';
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
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/consumer/orders">
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Đơn hàng của tôi">
                  <Package className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/consumer/notifications">
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Thông báo">
                  <Bell className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/consumer/messages">
                <Button variant="ghost" size="icon" className="h-9 w-9" title="Tin nhắn">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/consumer/profile" className="flex items-center gap-2 ml-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{consumerName}</span>
              </Link>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
                    isActive(item.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t my-2 pt-2">
                {sideNav.map(item => (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-t mt-2 pt-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{consumerName}</p>
                  <p className="text-sm text-muted-foreground">{consumerEmail}</p>
                </div>
              </div>
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
        <div className="flex justify-around py-1">
          {mobileNav.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium transition-colors relative ${
                isActive(item.to) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-15">{item.label}</span>
              {item.to === '/consumer/cart' && cartCount > 0 && (
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
