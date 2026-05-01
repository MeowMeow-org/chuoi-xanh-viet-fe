'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, MapPin, Shield, QrCode } from 'lucide-react';

const features = [
  { icon: QrCode, text: 'Quét mã QR để truy xuất ngay' },
  { icon: Shield, text: 'Dữ liệu được lưu trên blockchain Sepolia' },
  { icon: MapPin, text: 'Bản đồ nguồn gốc theo vùng địa lý' },
];

const footerLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/marketplace', label: 'Chợ nông sản' },
  { href: '/forum', label: 'Diễn đàn' },
  { href: '/truy-xuat', label: 'Truy xuất nguồn gốc' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageLabel = pathname === '/login' ? 'Đăng nhập' : 'Đăng ký';

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* ── Header ── */}
      <header className='flex h-[60px] shrink-0 items-center border-b border-[hsl(142,15%,88%)] bg-white px-6 shadow-sm'>
        <Link
          href='/'
          className='flex items-center gap-2 text-[hsl(150,16%,12%)] transition hover:opacity-75'
        >
          <Leaf className='h-6 w-6 text-[hsl(142,65%,38%)]' />
          <span className='text-[17px] font-extrabold tracking-tight'>
            Chuỗi Xanh Việt
          </span>
        </Link>
        <div className='mx-5 h-6 w-px bg-[hsl(142,15%,80%)]' />
        <span className='text-[17px] font-semibold text-[hsl(142,65%,34%)]'>
          {pageLabel}
        </span>
      </header>

      {/* ── Main ── */}
      <main className='relative flex flex-1 items-center overflow-y-auto'>
        {/* Background image */}
        <div className='absolute inset-0'>
          <Image
            src='/images/bg-01.jpg'
            alt=''
            fill
            className='pointer-events-none object-cover'
            priority
          />
          <div className='absolute inset-0 bg-black/30' />
        </div>

        <div className='relative z-10 mx-auto flex w-full max-w-6xl items-center justify-end px-4 py-8 sm:px-8'>
          {/* Left branding — desktop only */}
          <div className='mr-12 hidden flex-1 flex-col gap-6 text-white lg:flex'>
            <div>
              <p className='mb-2 text-sm font-semibold uppercase tracking-widest text-[hsl(142,60%,72%)]'>
                Nền tảng nông nghiệp minh bạch
              </p>
              <h1 className='text-4xl font-extrabold leading-tight drop-shadow-md'>
                Truy xuất nguồn gốc
                <br />
                từ vườn đến bàn ăn.
              </h1>
            </div>
            <p className='max-w-sm text-base leading-relaxed text-white/80'>
              Kết nối nông hộ, hợp tác xã và người tiêu dùng — mọi lô hàng đều
              minh bạch và có thể xác minh.
            </p>
            <div className='mt-1 flex flex-col gap-3'>
              {features.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className='flex items-center gap-3 text-sm text-white/90'
                >
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15'>
                    <Icon className='h-4 w-4' />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className='w-full max-w-sm shrink-0 sm:max-w-md lg:w-[420px] lg:max-w-none'>
            {children}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className='shrink-0 border-t border-[hsl(142,15%,88%)] bg-[hsl(150,10%,97%)] px-6 py-4'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs text-[hsl(150,8%,42%)]'>
          <div className='flex flex-wrap items-center gap-x-5 gap-y-2'>
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className='transition hover:text-[hsl(142,55%,34%)]'
              >
                {label}
              </Link>
            ))}
          </div>
          <p>© 2026 Chuỗi Xanh Việt. Nền tảng nông nghiệp minh bạch.</p>
        </div>
      </footer>
    </div>
  );
}
