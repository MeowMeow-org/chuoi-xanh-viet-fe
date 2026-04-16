"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

const features = [
  [
    "AI nông nghiệp",
    "Hỏi đáp kỹ thuật, chẩn đoán bệnh cây qua ảnh và gợi ý giá bán dễ hiểu cho nông dân.",
  ],
  [
    "Nhật ký số",
    "Ghi sự kiện canh tác với ảnh, GPS và thời gian để dữ liệu đáng tin hơn ghi chép tay.",
  ],
  [
    "Blockchain + QR",
    "Niêm phong mùa vụ một lần lên chain và truy xuất công khai cho từng lô hàng bằng mã QR.",
  ],
  [
    "Gian hàng số",
    "Đăng ký đơn giản, tự động điền thông tin, quản lý tồn kho realtime, tạm đóng gian hàng khi cách ly thuốc BVTV và thanh toán VNPay.",
  ],
  [
    "Diễn đàn kỹ thuật",
    "Kết nối nông dân, hợp tác xã và chuyên gia để giải đáp vấn đề thực tế ngoài đồng ruộng.",
  ],
  [
    "Mobile-first",
    "Font lớn, nút lớn, thao tác ít bước để phù hợp người dùng điện thoại phổ thông.",
  ],
] as const;

const flow = [
  "Ghi nhật ký thực địa bằng nhận diện thời gian mạng (Server) và tọa độ GPS, hỗ trợ đồng bộ offline.",
  "Niêm phong lịch sử canh tác một lần sau mùa vụ bằng công nghệ Blockchain để đảm bảo bất biến.",
  "Sinh mã QR thông minh cho từng lô hàng, hiển thị bản đồ, ảnh thực địa và nhật ký canh tác.",
  "Kết nối thông tin truy xuất trực tiếp sang gian hàng số và các ví thanh toán (VNPay, PayOS).",
] as const;

const users = [
  "Nông dân và hộ sản xuất nhỏ cần công cụ giảm rào cản số khi bắt đầu đưa nông sản lên sàn.",
  "Hợp tác xã và cán bộ khuyến nông cần công cụ quản lý chất lượng và theo dõi quy chuẩn.",
  "Người tiêu dùng cần nhìn thấy hồ sơ nguồn gốc chân thực, bằng chứng rõ ràng trước khi mua.",
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div
        id="top"
        className="min-h-screen bg-[hsl(120,20%,98%)] text-[hsl(150,10%,15%)]"
      >
        <header className="sticky top-0 z-40 border-b border-[hsl(142,15%,88%)] bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <a href="#top" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(142,71%,45%)] text-white shadow-sm ring-1 ring-black/5">
                <Leaf className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-base font-bold tracking-tight">
                  Chuỗi Xanh Việt
                </span>
                <span className="block text-xs text-[hsl(150,5%,45%)]">
                  Minh bạch từ ruộng đến bàn ăn
                </span>
              </span>
            </a>

            <nav className="hidden items-center gap-6 text-sm font-medium text-[hsl(150,5%,45%)] lg:flex">
              <a href="#tinh-nang">Tính năng</a>
              <a href="#quy-trinh">Quy trình</a>
              <a href="#doi-tuong">Đối tượng</a>
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <Link
                href="/login"
                className="rounded-lg border border-[hsl(142,15%,88%)] bg-white px-4 py-2 text-sm font-semibold text-[hsl(150,10%,15%)]"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[hsl(142,71%,45%)] px-4 py-2 text-sm font-semibold text-white"
              >
                Tạo tài khoản
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(142,15%,88%)] bg-white text-[hsl(150,10%,15%)] lg:hidden"
            >
              {menuOpen ? "×" : "≡"}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-[hsl(142,15%,88%)] bg-white px-4 py-3 lg:hidden">
              <div className="mx-auto max-w-7xl space-y-1">
                <a
                  href="#tinh-nang"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(150,10%,25%)]"
                >
                  Tính năng
                </a>
                <a
                  href="#quy-trinh"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(150,10%,25%)]"
                >
                  Quy trình
                </a>
                <a
                  href="#doi-tuong"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(150,10%,25%)]"
                >
                  Đối tượng
                </a>
                <div className="grid gap-2 pt-2 sm:grid-cols-2">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-[hsl(142,15%,88%)] bg-white px-4 py-2.5 text-sm font-semibold text-[hsl(150,10%,15%)] text-center"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-[hsl(142,71%,45%)] px-4 py-2.5 text-sm font-semibold text-white text-center"
                  >
                    Tạo tài khoản
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        <main>
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
                    Kết nối nhà nông, hợp tác xã và người tiêu dùng qua hệ thống
                    AI và Blockchain. Minh bạch từ thao tác canh tác thực tế đến
                    bước thanh toán tại gian hàng.
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
                    href="/farmer/marketplace"
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
                  <h2 className="mt-2 text-xl font-bold">
                    Mùa vụ rau ăn lá 2026
                  </h2>
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

          <section
            id="tinh-nang"
            className="px-4 py-12 sm:px-6 lg:px-8 md:py-16"
          >
            <div className="mx-auto max-w-7xl">
              <h2 className="text-2xl font-bold text-center mb-8 text-[hsl(150,10%,15%)]">
                Hệ sinh thái toàn diện
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {features.map(([title, description], index) => (
                  <article
                    key={title}
                    className="feature-card rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 hover:border-[hsl(142,71%,65%)] transition-colors"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-[hsl(142,71%,45%)]/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-[hsl(142,71%,45%)]">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[hsl(150,10%,15%)]">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[hsl(150,5%,45%)]">
                      {description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section
            id="quy-trinh"
            className="bg-[hsl(120,10%,95%)] px-4 py-12 sm:px-6 lg:px-8 md:py-16"
          >
            <div className="mx-auto max-w-7xl">
              <h2 className="text-2xl font-bold text-center mb-8 text-[hsl(150,10%,15%)]">
                Lợi ích thiết thực
              </h2>
              <div className="relative mx-auto max-w-4xl px-4 md:px-0">
                <div className="absolute bottom-6 left-9.5 top-6 w-0.5 bg-[hsl(142,15%,88%)] md:left-1/2 md:-ml-px" />

                <div className="space-y-8">
                  {flow.map((step, index) => (
                    <div
                      key={index}
                      className={`relative flex flex-col md:flex-row md:items-center ${
                        index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-1/2 -mt-6 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[hsl(120,10%,95%)] bg-[hsl(142,71%,45%)] text-base font-bold text-white shadow-sm md:left-1/2 md:-ml-6`}
                      >
                        {index + 1}
                      </div>

                      <div
                        className={`ml-16 w-full md:w-[45%] md:ml-0 ${
                          index % 2 === 0
                            ? "md:pr-10 text-left md:text-right"
                            : "md:pl-10 text-left"
                        }`}
                      >
                        <div className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm transition-colors hover:border-[hsl(142,71%,45%)]">
                          <p className="text-sm font-medium leading-relaxed text-[hsl(150,10%,15%)]">
                            {step}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section
            id="doi-tuong"
            className="px-4 py-12 sm:px-6 lg:px-8 md:py-16"
          >
            <div className="mx-auto max-w-7xl">
              <h2 className="text-2xl font-bold text-center mb-8 text-[hsl(150,10%,15%)]">
                Đối tượng sử dụng
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                {users.map((item, index) => (
                  <article
                    key={item}
                    className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5"
                  >
                    <div className="h-12 w-12 rounded-xl bg-[hsl(142,71%,45%)]/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-[hsl(142,71%,45%)]">
                        0{index + 1}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[hsl(150,5%,45%)]">
                      {item}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
