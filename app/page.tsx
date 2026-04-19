"use client";

import Link from "next/link";

import ConsumerLayout from "@/components/layout/ConsumerLayout";

// ConsumerLayout dùng useSearchParams → không prerender được ở build time.
export const dynamic = "force-dynamic";

export default function Home() {
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
                className="inline-flex h-14 items-center justify-center rounded-xl bg-[hsl(142,71%,45%)] px-8 text-base font-bold text-white"
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

          <div className="dashboard-card rounded-2xl border border-[hsl(142,15%,88%)] p-5 shadow-md">
            <div className="rounded-xl bg-[hsl(142,71%,45%)] p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Dashboard Snapshot
              </p>
              <h2 className="mt-2 text-xl font-bold">Mùa vụ rau ăn lá 2026</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-white/70">Nhật ký hôm nay</p>
                  <p className="mt-2 text-2xl font-bold">12 bản ghi</p>
                  <p className="mt-1 text-xs text-white/80">
                    Tự gắn GPS, ảnh thực địa và thời gian máy chủ
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                  <p className="text-sm text-white/70">Truy xuất QR</p>
                  <p className="mt-2 text-2xl font-bold">98%</p>
                  <p className="mt-1 text-xs text-white/80">
                    Lô hàng hiển thị đủ hành trình sản xuất cho người mua
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-white/15 bg-white/10 p-4 text-sm">
                <p className="font-bold text-white">
                  AI hỗ trợ ngay tại ruộng
                </p>
                <p className="mt-1 text-white/80">
                  Gợi ý bệnh nghi ngờ, hướng xử lý và nhắc thời gian cách ly
                  trước khi mở bán.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ConsumerLayout>
  );
}
