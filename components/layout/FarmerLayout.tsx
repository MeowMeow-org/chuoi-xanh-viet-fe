"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    Home,
    Mail,
    Menu,
    Leaf,
    MessageCircle,
    Package,
    QrCode,
    ShoppingBag,
    Sprout,
    User,
    Users,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/farmer/seasons", label: "Mùa vụ", icon: Sprout },
    { href: "/farmer/marketplace", label: "Gian hàng", icon: ShoppingBag },
    { href: "/farmer/forum", label: "Diễn đàn", icon: Users },
    { href: "/farmer/ai-assistant", label: "Trợ lý AI", icon: MessageCircle },
    { href: "/farmer/trace", label: "Truy xuất", icon: QrCode },
];

const mobileNavItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/farmer/marketplace", label: "Gian hàng", icon: ShoppingBag },
    { href: "/farmer/forum", label: "Diễn đàn", icon: Users },
    { href: "/farmer/ai-assistant", label: "Trợ lý AI", icon: MessageCircle },
];

const secondaryNav = [
    { href: "/farmer/orders", label: "Đơn hàng", icon: Package },
    { href: "/farmer/messages", label: "Tin nhắn", icon: Mail },
    { href: "/farmer/notifications", label: "Thông báo", icon: Bell },
    { href: "/farmer/profile", label: "Hồ sơ nông trại", icon: User },
];

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const unreadNotifs = 2;

    const isActive = (path: string) => {
        if (path === "/") {
            return pathname === "/";
        }

        return pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[hsl(120,20%,98%)] text-[hsl(150,10%,15%)]">
            <header className="sticky top-0 z-50 border-b border-[hsl(142,14%,88%)] bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
                <div className="mx-auto grid h-14 w-full max-w-screen-2xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-10">
                    <Link href="/" className="flex w-max shrink-0 items-center gap-2 justify-self-start">
                        <span className="rounded-lg bg-[hsl(142,71%,45%)] p-1.5">
                            <Leaf className="h-5 w-5 text-white" />
                        </span>
                        <span className="text-lg font-semibold leading-none whitespace-nowrap text-[hsl(150,10%,22%)]">Chuỗi Xanh Việt</span>
                    </Link>

                    <nav className="hidden items-center gap-0.5 justify-self-center md:flex">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm leading-none transition-colors ${active
                                        ? "bg-[hsl(142,69%,45%)] text-white font-semibold"
                                        : "text-[hsl(150,6%,38%)] font-medium hover:bg-[hsl(120,10%,92%)] hover:text-[hsl(150,10%,18%)]"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-1 justify-self-end">
                        <div className="hidden items-center gap-1 md:flex">
                            <Link href="/farmer/notifications">
                                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                                    <Bell className="h-4 w-4" />
                                    {unreadNotifs > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                            {unreadNotifs}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                            <Link href="/farmer/messages">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/farmer/profile" className="ml-2 flex shrink-0 items-center gap-2 text-sm">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/15">
                                    <User className="h-4 w-4 text-[hsl(142,71%,35%)]" />
                                </span>
                                <span className="font-semibold whitespace-nowrap text-[hsl(150,10%,22%)]">Nguyễn Văn Minh</span>
                            </Link>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="border-t bg-white md:hidden">
                        <div className="mx-auto max-w-6xl space-y-1 px-4 py-3 sm:px-6 lg:px-8">
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
                                            {item.href === "/farmer/notifications" && unreadNotifs > 0 && (
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
                                    <p className="font-semibold">Farmer</p>
                                    <p className="text-sm text-[hsl(150,7%,45%)]">Role: Farmer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1">{children}</main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur md:hidden">
                <div className="flex justify-around py-1">
                    {mobileNavItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={`${item.href}-bottom`}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium transition-colors ${active ? "text-[hsl(142,71%,35%)]" : "text-[hsl(150,7%,45%)]"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="max-w-15 truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
