"use client";

import { useEffect, useState } from "react";

type AuthView = "login" | "register";

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
    "Đồng bộ nguồn gốc, tồn kho, đơn hàng và đánh giá sản phẩm trong một luồng bán hàng.",
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
  "Ghi nhật ký thực địa bằng mẫu có sẵn, thêm ảnh và dữ liệu cần thiết.",
  "Đồng bộ dữ liệu thành hồ sơ mùa vụ có bằng chứng thời gian và vị trí.",
  "Niêm phong lịch sử canh tác lên blockchain để tạo bằng chứng số bất biến.",
  "Sinh QR cho từng lô hàng và đẩy sang gian hàng để người mua kiểm chứng trước khi đặt.",
] as const;

const users = [
  "Nông dân cần giảm rào cản số khi bắt đầu bán hàng trực tuyến.",
  "Hợp tác xã cần công cụ xác minh, quản lý hội viên và chất lượng mùa vụ.",
  "Người tiêu dùng cần nhìn thấy nguồn gốc rõ ràng trước khi mua nông sản.",
] as const;

function AuthModal({
  open,
  view,
  onClose,
  onChange,
}: {
  open: boolean;
  view: AuthView;
  onClose: () => void;
  onChange: (view: AuthView) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(8,24,18,0.68)] px-4 py-6 backdrop-blur-sm">
      <div className="auth-modal w-full max-w-4xl overflow-hidden rounded-4xl border border-white/60 bg-white shadow-[0_35px_120px_rgba(16,74,47,0.28)]">
        <div className="grid lg:grid-cols-[1fr_0.95fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(145deg,#14532d,_#1f7a43_58%,_#b9f56a_160%)] p-8 text-white sm:p-10">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 h-10 w-10 rounded-full border border-white/20 bg-white/10 text-lg"
            >
              ×
            </button>
            <p className="text-sm uppercase tracking-[0.28em] text-white/70">
              Chuỗi Xanh Việt
            </p>
            <h2 className="mt-5 max-w-md text-3xl font-semibold leading-tight sm:text-4xl">
              {view === "login"
                ? "Quay lại để tiếp tục mùa vụ và gian hàng của bạn."
                : "Tạo tài khoản để bắt đầu một hành trình truy xuất minh bạch."}
            </h2>
            <div className="mt-8 grid gap-3 text-sm text-white/85">
              <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                Đăng nhập bằng email hoặc số điện thoại
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                Quản lý nhật ký, truy xuất và đơn hàng trong cùng một nơi
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                Luồng dùng đơn giản cho người mới chuyển đổi số
              </div>
            </div>
          </div>

          <div className="bg-[#fcfdf8] p-6 sm:p-8 lg:p-10">
            <div className="inline-flex rounded-full bg-[#e8f3e4] p-1 text-sm font-medium text-[#2a4d35]">
              <button
                type="button"
                onClick={() => onChange("login")}
                className={`rounded-full px-4 py-2 ${view === "login" ? "bg-white shadow-sm" : "opacity-75"}`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => onChange("register")}
                className={`rounded-full px-4 py-2 ${view === "register" ? "bg-white shadow-sm" : "opacity-75"}`}
              >
                Đăng ký
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-2xl font-semibold text-[#163323]">
                {view === "login" ? "Đăng nhập vào nền tảng" : "Tạo tài khoản mới"}
              </h3>
              <p className="text-sm leading-6 text-[#587062]">
                {view === "login"
                  ? "Theo dõi mùa vụ, truy xuất và đơn hàng chỉ trong vài bước."
                  : "Bắt đầu số hóa mùa vụ với trải nghiệm tối ưu cho nông dân, hợp tác xã và người mua."}
              </p>
            </div>

            <form className="mt-8 space-y-4">
              {view === "register" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    className="w-full rounded-2xl border border-[#d6e5d4] bg-white px-4 py-3 outline-none focus:border-[#2f8d53]"
                  />
                  <select className="w-full rounded-2xl border border-[#d6e5d4] bg-white px-4 py-3 outline-none focus:border-[#2f8d53]">
                    <option>Nông dân</option>
                    <option>Hợp tác xã</option>
                    <option>Người tiêu dùng</option>
                  </select>
                </div>
              )}
              <input
                type={view === "login" ? "text" : "email"}
                placeholder={view === "login" ? "Email hoặc số điện thoại" : "Email"}
                className="w-full rounded-2xl border border-[#d6e5d4] bg-white px-4 py-3 outline-none focus:border-[#2f8d53]"
              />
              {view === "register" && (
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  className="w-full rounded-2xl border border-[#d6e5d4] bg-white px-4 py-3 outline-none focus:border-[#2f8d53]"
                />
              )}
              <input
                type="password"
                placeholder="Mật khẩu"
                className="w-full rounded-2xl border border-[#d6e5d4] bg-white px-4 py-3 outline-none focus:border-[#2f8d53]"
              />
              {view === "register" && (
                <input
                  type="text"
                  placeholder="Tên nông trại hoặc gian hàng"
                  className="w-full rounded-2xl border border-[#d6e5d4] bg-white px-4 py-3 outline-none focus:border-[#2f8d53]"
                />
              )}
              <button
                type="submit"
                className="w-full rounded-full bg-[#153f2a] px-5 py-3.5 text-sm font-semibold text-white"
              >
                {view === "login" ? "Tiếp tục vào hệ thống" : "Tạo tài khoản và bắt đầu"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("register");

  useEffect(() => {
    document.body.style.overflow = authOpen ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setAuthOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [authOpen]);

  const openAuth = (view: AuthView) => {
    setAuthView(view);
    setAuthOpen(true);
    setMenuOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbf0_0%,#eef8e8_18%,#fffef9_42%,#f7faf4_100%)] text-[#183123]">
        <header className="sticky top-0 z-40 border-b border-white/45 bg-[rgba(247,252,244,0.76)] backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <a href="#top" className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#123d28,#2f8d53_55%,#bbf266)] text-lg font-semibold text-white">
                CX
              </span>
              <span>
                <span className="block text-base font-semibold tracking-tight sm:text-lg">
                  Chuỗi Xanh Việt
                </span>
                <span className="block text-xs uppercase tracking-[0.24em] text-[#658070]">
                  Minh bạch từ ruộng đến bàn ăn
                </span>
              </span>
            </a>

            <nav className="hidden items-center gap-7 text-sm font-medium text-[#4d695a] lg:flex">
              <a href="#tinh-nang">Tính năng</a>
              <a href="#quy-trinh">Quy trình</a>
              <a href="#doi-tuong">Đối tượng</a>
              <a href="#cta">Bắt đầu</a>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="rounded-full border border-[#cfe0cc] bg-white px-5 py-2.5 text-sm font-semibold text-[#153f2a]"
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => openAuth("register")}
                className="rounded-full bg-[#153f2a] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Tạo tài khoản
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbead8] bg-white text-[#153f2a] lg:hidden"
            >
              {menuOpen ? "×" : "≡"}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-[#dcead8] bg-[rgba(252,254,250,0.98)] px-4 py-4 lg:hidden">
              <div className="mx-auto max-w-7xl space-y-2">
                <a
                  href="#tinh-nang"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#244533]"
                >
                  Tính năng
                </a>
                <a
                  href="#quy-trinh"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#244533]"
                >
                  Quy trình
                </a>
                <a
                  href="#doi-tuong"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-semibold text-[#244533]"
                >
                  Đối tượng
                </a>
                <div className="grid gap-2 pt-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="rounded-full border border-[#cfe0cc] bg-white px-4 py-3 text-sm font-semibold text-[#153f2a]"
                  >
                    Đăng nhập
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("register")}
                    className="rounded-full bg-[#153f2a] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Tạo tài khoản
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        <main id="top">
          <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
            <div className="hero-orb hero-orb-left" />
            <div className="hero-orb hero-orb-right" />
            <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative z-10 space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe5c8] bg-white/80 px-4 py-2 text-sm font-medium text-[#356043]">
                  Nền tảng nông nghiệp minh bạch cho người trồng và người mua
                </div>
                <div className="space-y-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#6a8a72]">
                    WebDev Adventure 2026
                  </p>
                  <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#132d20] sm:text-5xl lg:text-7xl">
                    Chuỗi Xanh Việt kết nối{" "}
                    <span className="text-gradient-green">nhật ký số, blockchain và gian hàng</span>{" "}
                    trong một hành trình mua bán đáng tin hơn.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-[#526c5d] sm:text-lg">
                    Landing này bám đúng 5 nhóm chức năng lõi từ brief: AI chatbot, nhật ký
                    sản xuất số, blockchain và QR truy xuất, gian hàng nông sản số, cùng
                    diễn đàn kỹ thuật cộng đồng.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openAuth("register")}
                    className="rounded-full bg-[#153f2a] px-6 py-4 text-sm font-semibold text-white"
                  >
                    Bắt đầu số hóa mùa vụ
                  </button>
                  <a
                    href="#tinh-nang"
                    className="rounded-full border border-[#cfe0cc] bg-white px-6 py-4 text-center text-sm font-semibold text-[#153f2a]"
                  >
                    Xem hệ sinh thái
                  </a>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[28px] border border-white/65 bg-white/80 p-5 shadow-[0_16px_48px_rgba(17,53,35,0.08)]">
                    <p className="text-2xl font-semibold text-[#153f2a]">5 trụ cột</p>
                    <p className="mt-2 text-sm leading-6 text-[#5a7264]">
                      AI, nhật ký số, blockchain, gian hàng và diễn đàn kỹ thuật.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/65 bg-white/80 p-5 shadow-[0_16px_48px_rgba(17,53,35,0.08)]">
                    <p className="text-2xl font-semibold text-[#153f2a]">1 lần niêm phong</p>
                    <p className="mt-2 text-sm leading-6 text-[#5a7264]">
                      Ghi toàn bộ mùa vụ lên blockchain để tạo bằng chứng số.
                    </p>
                  </div>
                  <div className="rounded-[28px] border border-white/65 bg-white/80 p-5 shadow-[0_16px_48px_rgba(17,53,35,0.08)]">
                    <p className="text-2xl font-semibold text-[#153f2a]">Mobile-first</p>
                    <p className="mt-2 text-sm leading-6 text-[#5a7264]">
                      Font lớn, nút lớn, thao tác ít bước trên điện thoại.
                    </p>
                  </div>
                </div>
              </div>

              <div className="dashboard-card relative overflow-hidden rounded-[34px] border border-white/60 p-4 shadow-[0_35px_80px_rgba(21,63,42,0.16)] sm:p-5">
                <div className="rounded-[28px] bg-[#133826] p-5 text-white sm:p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                    Dashboard Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Mùa vụ rau ăn lá 2026</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/12 bg-white/8 p-4">
                      <p className="text-sm text-white/60">Nhật ký hôm nay</p>
                      <p className="mt-3 text-3xl font-semibold">12 bản ghi</p>
                      <p className="mt-2 text-sm text-[#d3e6d5]">
                        Tự gắn GPS, ảnh thực địa và thời gian máy chủ
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/12 bg-[linear-gradient(145deg,rgba(188,242,104,0.22),rgba(255,255,255,0.08))] p-4">
                      <p className="text-sm text-white/70">Truy xuất QR</p>
                      <p className="mt-3 text-3xl font-semibold">98%</p>
                      <p className="mt-2 text-sm text-[#dff4cc]">
                        Lô hàng hiển thị đủ hành trình sản xuất cho người mua
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[26px] border border-white/10 bg-white/6 p-4 text-sm text-white/82">
                    <p className="font-medium text-white">AI hỗ trợ ngay tại ruộng</p>
                    <p className="mt-3">
                      Gợi ý bệnh nghi ngờ, hướng xử lý và nhắc thời gian cách ly trước khi
                      mở bán.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="tinh-nang" className="px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6a8a72]">
                  Hệ sinh thái cốt lõi
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#143522] sm:text-5xl">
                  Từ brief PDF và style demo React, landing này kể lại giá trị sản phẩm theo
                  hướng rõ ràng hơn.
                </h2>
              </div>
              <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {features.map(([title, description], index) => (
                  <article
                    key={title}
                    className="feature-card rounded-[30px] border border-white/75 bg-white/80 p-6 shadow-[0_18px_50px_rgba(17,53,35,0.08)]"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#eaf6df,#d5f065)] text-sm font-semibold text-[#17452d]">
                      0{index + 1}
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-[#143522]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#587062]">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="quy-trinh" className="px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6a8a72]">
                  Luồng giá trị
                </p>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#143522] sm:text-5xl">
                  Từ một bản ghi tại ruộng đến một quyết định mua hàng có niềm tin.
                </h2>
                <p className="max-w-xl text-base leading-8 text-[#556f61]">
                  Phần này bám sát logic sản phẩm trong brief và giúp người xem hiểu rất
                  nhanh hệ thống hoạt động như thế nào.
                </p>
              </div>
              <div className="grid gap-5">
                {flow.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-[30px] border border-[#dce9d8] bg-[linear-gradient(180deg,#ffffff,#f6faf1)] p-6 shadow-[0_18px_44px_rgba(17,53,35,0.06)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#153f2a] text-lg font-semibold text-white">
                        0{index + 1}
                      </div>
                      <p className="pt-1 text-base leading-8 text-[#2d4937]">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="doi-tuong" className="px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6a8a72]">
                Đối tượng sử dụng
              </p>
              <h2 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.03em] text-[#143522] sm:text-5xl">
                Một landing nhưng nói đúng nhu cầu của ba nhóm người dùng chính.
              </h2>
              <div className="mt-12 grid gap-5 lg:grid-cols-3">
                {users.map((item, index) => (
                  <article
                    key={item}
                    className="rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_16px_44px_rgba(17,53,35,0.06)]"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf7e8] text-sm font-semibold text-[#1c6c3f]">
                      0{index + 1}
                    </div>
                    <p className="mt-5 text-sm leading-7 text-[#587062]">{item}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="cta" className="px-4 pb-24 pt-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl rounded-[38px] border border-[#d8e7d5] bg-white px-6 py-10 shadow-[0_24px_70px_rgba(17,53,35,0.08)] sm:px-8 lg:px-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6a8a72]">
                    Call to action
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#143522] sm:text-5xl">
                    Sẵn sàng biến dữ liệu sản xuất thành lợi thế cạnh tranh?
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[#556f61]">
                    Tạo tài khoản để bắt đầu dựng hồ sơ nông trại, ghi nhật ký mùa vụ và
                    chuẩn bị cho các route chi tiết ở vòng sau.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <button
                    type="button"
                    onClick={() => openAuth("register")}
                    className="rounded-full bg-[#153f2a] px-6 py-4 text-sm font-semibold text-white"
                  >
                    Mở modal đăng ký
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="rounded-full border border-[#cfe0cc] bg-[#f8fbf5] px-6 py-4 text-sm font-semibold text-[#153f2a]"
                  >
                    Tôi đã có tài khoản
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <AuthModal
        open={authOpen}
        view={authView}
        onClose={() => setAuthOpen(false)}
        onChange={setAuthView}
      />
    </>
  );
}


