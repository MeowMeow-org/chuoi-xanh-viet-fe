"use client";

import Link from "next/link";
import { Bot, ShieldCheck, ShoppingCart, Leaf } from "lucide-react";

import ConsumerLayout from "@/components/layout/ConsumerLayout";

export default function HomeClient() {
  return (
    <ConsumerLayout>
      <section className="gradient-hero px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(142,15%,88%)] bg-white px-4 py-1.5 text-sm font-medium text-[hsl(142,50%,25%)]">
              WebDev Adventure 2026 - Nhóm Meow Meow
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[hsl(150,10%,15%)] md:text-5xl">
                <span className="text-gradient-green">Chuỗi Xanh Việt</span>
                <br />
                <span>Nền tảng Truy xuất Nguồn gốc</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-[hsl(150,5%,45%)] md:text-lg">
                Kết nối nhà nông, hợp tác xã và người tiêu dùng qua hệ thống AI
                và Blockchain. Minh bạch từ thao tác canh tác thực tế đến bước
                thanh toán tại gian hàng.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-[hsl(142,71%,45%)] px-8 text-base font-bold text-white!"
              >
                Đăng ký nông hộ
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex h-14 items-center justify-center rounded-xl border border-[hsl(142,15%,88%)] bg-white px-8 text-base font-bold text-[hsl(150,10%,15%)]"
              >
                Mua sản phẩm
              </Link>
            </div>
          </div>

          <div className="dashboard-card self-start rounded-2xl border border-[hsl(142,15%,88%)] p-4 shadow-md lg:max-w-xl lg:justify-self-center">
            <div className="rounded-xl bg-[hsl(142,71%,45%)] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/75">
                Cơ sở lý thuyết
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Leaf,
                    title: "Truy xuất nguồn gốc",
                    desc: "Minh bạch theo mùa vụ và mã QR.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Quản trị chất lượng",
                    desc: "Chuẩn hóa VietGAP & GlobalGAP.",
                  },
                  {
                    icon: ShoppingCart,
                    title: "Sàn thương mại B2C",
                    desc: "Giao dịch trực tiếp, phân quyền bảo mật.",
                  },
                  // {
                  //   icon: Users,
                  //   title: "Kết nối cộng đồng",
                  //   desc: "Không gian hợp tác và chia sẻ kiến thức.",
                  // },
                  {
                    icon: Bot,
                    title: "Trợ lý AI thông minh",
                    desc: "Phân tích dữ liệu và hỗ trợ quyết định.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex min-h-28 flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/18 text-white shadow-sm ring-1 ring-white/20">
                      <item.icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-bold leading-snug text-white sm:text-[15px]">
                        {item.title}
                      </p>
                      <p className="text-xs leading-relaxed text-white/78 sm:text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[hsl(142,15%,90%)] bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(142,50%,30%)]">
              Cách hệ thống hoạt động
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[hsl(150,10%,15%)] md:text-3xl">
              Từ nhà nông đến bàn ăn — minh bạch từng bước
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[hsl(150,5%,45%)]">
              Nhật ký thực địa, kiểm tra HTX, chứng nhận VietGAP và mã lô QR đều
              được neo (anchor) trên blockchain để người mua kiểm chứng độc lập.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {[
              {
                step: "01",
                title: "Nông hộ ghi nhật ký",
                desc: "Ghi từng lần gieo, bón, xịt, tưới. Hệ thống tự gắn GPS, ảnh thực địa và thời gian máy chủ — không thể chỉnh tay.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    <path d="M12 20h9" />
                    <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Hợp tác xã kiểm tra",
                desc: "HTX nhận nhắc lịch tự động (14 ngày / 7 ngày trước thu hoạch) và ghi kết quả Đạt / Cần bổ sung vào mùa vụ.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Phân lô &amp; neo chuỗi",
                desc: "Mỗi lô bán nhận mã CXV-xxx và QR riêng. Hash dữ liệu mùa vụ được anchor lên Sepolia — ai cũng verify được.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3" />
                    <path d="M21 17v4h-4" />
                    <path d="M17 21h-3" />
                  </svg>
                ),
              },
              {
                step: "04",
                title: "Người mua tra cứu",
                desc: "Quét QR trên bao bì hoặc nhập mã tại trang Tra cứu — xem đầy đủ nhật ký, kiểm tra HTX, chứng nhận và tồn kho còn lại.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative flex h-full flex-col gap-3 rounded-2xl border border-[hsl(142,15%,90%)] bg-[hsl(120,22%,97%)] p-5 transition hover:-translate-y-0.5 hover:border-[hsl(142,50%,70%)] hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(142,71%,45%)] text-white shadow-sm">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold tracking-widest text-[hsl(142,50%,55%)]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-tight text-[hsl(150,10%,18%)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[hsl(150,5%,42%)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[hsl(142,35%,75%)] bg-[hsl(120,40%,97%)] px-6 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="text-sm font-bold text-[hsl(142,50%,25%)]">
                Có mã lô trong tay?
              </p>
              <p className="mt-1 text-xs text-[hsl(150,5%,45%)]">
                Nhập mã CXV-xxx hoặc quét QR để xem toàn bộ hành trình của lô hàng —
                không cần đăng nhập.
              </p>
            </div>
            <Link
              href="/truy-xuat"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)] px-6 text-sm font-bold text-white! transition hover:bg-[hsl(142,71%,40%)]"
            >
              Tra cứu ngay
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </ConsumerLayout>
  );
}
