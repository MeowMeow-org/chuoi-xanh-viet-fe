import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/query";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chuỗi Xanh Việt",
  description:
    "WebDev Adventure 2026 - Nhóm Meow Meow. Nền tảng truy xuất nguồn gốc nông sản kết hợp AI, nhật ký số, blockchain và gian hàng số, kết nối nông hộ, hợp tác xã và người tiêu dùng.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        beVietnamPro.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <Toaster position="top-right" richColors />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
