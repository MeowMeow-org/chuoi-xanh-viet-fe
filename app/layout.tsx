import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/query";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chuỗi Xanh Việt | Landing Page",
  description:
    "WebDev Adventure 2026 - Nhóm Meow Meow. Nền tảng truy xuất nguồn gốc nông sản kết hợp AI, nhật ký số, blockchain và gian hàng số, kết nối nông dân, hợp tác xã và người tiêu dùng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={cn("h-full", "antialiased", beVietnamPro.variable, geistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
