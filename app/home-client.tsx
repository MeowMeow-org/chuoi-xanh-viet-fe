'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle2, QrCode } from 'lucide-react';

import ConsumerLayout from '@/components/layout/ConsumerLayout';

function FadeIn({
  children,
  className,
  delay = 0,
  from = 'bottom',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: 'bottom' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translate = {
    bottom: 'translateY(28px)',
    left: 'translateX(-24px)',
    right: 'translateX(24px)',
  }[from];

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : translate,
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const logEntries = [
  {
    date: '28 thg 4, 2026',
    action: 'Bón phân NPK (lần 3)',
    location: 'Bảo Lộc, Lâm Đồng',
    badge: 'Đạt chuẩn',
  },
  {
    date: '22 thg 4, 2026',
    action: 'Phun thuốc BVTV',
    location: 'Bảo Lộc, Lâm Đồng',
    badge: 'Trong giới hạn',
  },
  {
    date: '15 thg 4, 2026',
    action: 'Gieo hạt Arabica',
    location: 'Bảo Lộc, Lâm Đồng',
    badge: 'Ghi nhận',
  },
];

const steps = [
  {
    n: '01',
    title: 'Nhà nông ghi nhật ký',
    desc: 'Mỗi lần gieo, bón, tưới, xịt đều được ghi kèm GPS và ảnh thực địa. Thời gian do máy chủ cấp — không ai chỉnh được tay.',
  },
  {
    n: '02',
    title: 'Hợp tác xã kiểm tra',
    desc: 'HTX nhận nhắc lịch tự động trước mỗi đợt thu hoạch. Kết quả Đạt / Cần bổ sung ghi thẳng vào mùa vụ.',
  },
  {
    n: '03',
    title: 'Lô hàng lên blockchain',
    desc: 'Mỗi lô nhận mã CXV-xxx và QR riêng. Hash dữ liệu được anchor lên Sepolia — bất kỳ ai cũng verify được.',
  },
  {
    n: '04',
    title: 'Người mua xác minh',
    desc: 'Quét QR trên bao bì để xem đầy đủ nhật ký canh tác, kết quả kiểm tra HTX, chứng nhận VietGAP và tồn kho.',
  },
];

export default function HomeClient() {
  return (
    <ConsumerLayout>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className='relative overflow-hidden bg-gradient-to-b from-[hsl(142,22%,96%)] to-white'>
        {/* Watermark vegetables */}
        <img
          src='/icons/carot.png'
          alt=''
          aria-hidden
          width={208}
          height={208}
          className='pointer-events-none select-none absolute -left-10 -top-4 -rotate-12 opacity-[0.055] blur-[0.5px]'
        />

        <img
          src='/icons/bo.png'
          alt=''
          aria-hidden
          width={256}
          height={256}
          className='pointer-events-none select-none absolute -left-6 bottom-8 rotate-6 opacity-[0.05] blur-[0.5px]'
        />

        <img
          src='/icons/cam.png'
          alt=''
          aria-hidden
          width={224}
          height={224}
          className='pointer-events-none select-none absolute -right-8 -top-6 rotate-12 opacity-[0.055] blur-[0.5px]'
        />

        <img
          src='/icons/catim.png'
          alt=''
          aria-hidden
          width={176}
          height={176}
          className='pointer-events-none select-none absolute -right-4 bottom-4 -rotate-8 opacity-[0.05] blur-[0.5px]'
        />

        <div className='mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20'>
          <div className='grid items-start gap-14 lg:grid-cols-[1fr_400px] lg:gap-20'>
            {/* Left */}
            <FadeIn
              from='left'
              className='flex flex-col gap-7 lg:pt-6'
            >
              <p className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(142,45%,40%)]'>
                WebDev Adventure 2026 · Nhóm Meow Meow
              </p>

              <h1 className='text-[2.6rem] font-extrabold leading-[1.1] tracking-tight text-[hsl(150,10%,11%)] sm:text-5xl lg:text-[3.2rem]'>
                Nông sản Việt —<br />
                <span className='text-gradient-green'>minh bạch</span> từ đất
                <br />
                đến tay bạn.
              </h1>

              <p className='max-w-[420px] text-[17px] leading-[1.8] text-[hsl(150,5%,45%)]'>
                Chuỗi Xanh Việt kết nối nhà nông, hợp tác xã và người tiêu dùng
                qua hệ thống truy xuất nguồn gốc dựa trên AI và blockchain.
              </p>

              <div className='flex flex-wrap gap-3'>
                <Link
                  href='/register'
                  className='inline-flex h-11 items-center justify-center rounded-xl bg-[hsl(142,62%,41%)] px-6 text-sm font-semibold text-white! transition-colors hover:bg-[hsl(142,62%,37%)]'
                >
                  Đăng ký tham gia
                </Link>
                <Link
                  href='/marketplace'
                  className='inline-flex h-11 items-center justify-center rounded-xl border border-[hsl(142,15%,86%)] bg-white px-6 text-sm font-semibold text-[hsl(150,10%,20%)] transition hover:border-[hsl(142,35%,72%)] hover:bg-[hsl(142,15%,97%)]'
                >
                  Xem sản phẩm
                </Link>
              </div>
            </FadeIn>

            {/* Right — realistic crop-log mockup */}
            <FadeIn
              from='right'
              delay={160}
              className='relative'
            >
              <div className='absolute -inset-4 -z-10 rounded-3xl bg-[hsl(142,30%,88%)]/40 blur-2xl' />
              <div className='overflow-hidden rounded-2xl border border-[hsl(142,14%,89%)] bg-white shadow-md shadow-[hsl(142,20%,50%)]/8'>
                {/* Header */}
                <div className='flex items-center justify-between border-b border-[hsl(142,10%,93%)] px-4 py-3.5'>
                  <div>
                    <p className='text-[13px] font-semibold text-[hsl(150,10%,18%)]'>
                      Nhật ký canh tác
                    </p>
                    <p className='text-[11px] text-[hsl(150,5%,54%)]'>
                      Lô CXV-2412 · Cà phê Arabica
                    </p>
                  </div>
                  <span className='flex items-center gap-1.5 rounded-full bg-[hsl(142,38%,93%)] px-2.5 py-1 text-[11px] font-semibold text-[hsl(142,52%,31%)]'>
                    <span className='h-1.5 w-1.5 rounded-full bg-[hsl(142,62%,41%)]' />
                    Đang canh tác
                  </span>
                </div>

                {/* Entries */}
                <div className='divide-y divide-[hsl(142,8%,95%)]'>
                  {logEntries.map((entry, i) => (
                    <div
                      key={i}
                      className='flex items-start gap-3 px-4 py-3.5'
                    >
                      <div className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(142,32%,94%)]'>
                        <CheckCircle2 className='h-3.5 w-3.5 text-[hsl(142,58%,40%)]' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-2'>
                          <p className='truncate text-[13px] font-semibold text-[hsl(150,10%,17%)]'>
                            {entry.action}
                          </p>
                          <span className='shrink-0 rounded-full bg-[hsl(142,32%,93%)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(142,52%,31%)]'>
                            {entry.badge}
                          </span>
                        </div>
                        <div className='mt-0.5 flex items-center gap-1.5 text-[11px] text-[hsl(150,5%,54%)]'>
                          <span>{entry.date}</span>
                          <span className='text-[hsl(150,5%,72%)]'>·</span>
                          <MapPin className='h-2.5 w-2.5 shrink-0' />
                          <span>{entry.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer — blockchain anchor */}
                <div className='flex items-center gap-3 border-t border-[hsl(142,10%,93%)] bg-[hsl(142,18%,97%)] px-4 py-3.5'>
                  <div className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[hsl(150,10%,18%)]'>
                    <QrCode className='h-5 w-5 text-white' />
                  </div>
                  <div>
                    <p className='text-[12px] font-semibold text-[hsl(150,10%,18%)]'>
                      Xác minh trên Sepolia
                    </p>
                    <p className='text-[11px] tabular-nums text-[hsl(150,5%,52%)]'>
                      Hash 0x7f3a…c92d · Neo 28/04/2026
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className='border-t border-[hsl(142,10%,92%)] bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24'>
        <div className='mx-auto max-w-5xl'>
          <div className='grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20'>
            <FadeIn
              from='left'
              className='lg:pt-1'
            >
              <h2 className='text-2xl font-extrabold tracking-tight text-[hsl(150,10%,11%)] md:text-3xl'>
                Hành trình của một lô hàng
              </h2>
              <p className='mt-3 text-sm leading-relaxed text-[hsl(150,5%,48%)]'>
                Từ khi hạt giống gieo xuống đến khi lên kệ — mọi bước đều được
                ghi lại và ai cũng kiểm chứng được.
              </p>

              <Link
                href='/truy-xuat'
                className='mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[hsl(142,55%,36%)] transition hover:text-[hsl(142,55%,30%)]'
              >
                <QrCode className='h-3.5 w-3.5' />
                Tra cứu lô hàng
                <ArrowRight className='h-3.5 w-3.5' />
              </Link>
            </FadeIn>

            <div className='relative'>
              <div className='absolute left-[15px] top-3 bottom-6 w-px bg-[hsl(142,18%,90%)]' />

              <div className='space-y-8'>
                {steps.map((step, idx) => (
                  <FadeIn
                    key={step.n}
                    delay={idx * 110}
                    className='flex gap-5'
                  >
                    {/* Number */}
                    <div className='relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-[hsl(142,62%,41%)] shadow-sm'>
                      <span className='text-[10px] font-bold leading-none text-white'>
                        {step.n}
                      </span>
                    </div>
                    {/* Content */}
                    <div className='pt-0.5 pb-2'>
                      <h3 className='text-[15px] font-bold text-[hsl(150,10%,15%)]'>
                        {step.title}
                      </h3>
                      <p className='mt-1.5 text-sm leading-relaxed text-[hsl(150,5%,48%)]'>
                        {step.desc}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='border-t border-[hsl(142,10%,92%)] bg-[hsl(142,22%,96%)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20'>
        <div className='mx-auto max-w-5xl'>
          <FadeIn className='grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16'>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(142,45%,40%)]'>
                Bắt đầu miễn phí
              </p>
              <h2 className='mt-3 text-2xl font-extrabold tracking-tight text-[hsl(150,10%,11%)] md:text-3xl'>
                Tham gia xây dựng nông nghiệp
                <br className='hidden sm:block' /> minh bạch hơn.
              </h2>
              <p className='mt-3 max-w-lg text-base leading-relaxed text-[hsl(150,5%,46%)]'>
                Dù bạn là nông hộ muốn ghi nhật ký, HTX cần quản lý chứng nhận,
                hay người mua muốn biết rõ nguồn gốc — Chuỗi Xanh Việt có chỗ
                cho bạn.
              </p>
            </div>

            <div className='flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col'>
              <Link
                href='/register'
                className='inline-flex h-11 items-center justify-center rounded-xl bg-[hsl(142,62%,41%)] px-7 text-sm font-semibold text-white! transition-colors hover:bg-[hsl(142,62%,37%)]'
              >
                Đăng ký miễn phí
              </Link>
              <Link
                href='/marketplace'
                className='inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[hsl(142,18%,82%)] bg-white px-7 text-sm font-semibold text-[hsl(150,10%,20%)] transition hover:border-[hsl(142,38%,68%)]'
              >
                Khám phá sản phẩm
                <ArrowRight className='h-3.5 w-3.5' />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </ConsumerLayout>
  );
}
