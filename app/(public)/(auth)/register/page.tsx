import { Suspense } from 'react';
import Link from 'next/link';

import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className='w-full rounded-2xl border border-[hsl(142,20%,85%)] bg-white/95 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-sm sm:p-8'>
      <Suspense
        fallback={
          <div className='mt-4 text-sm text-[hsl(150,8%,45%)]'>
            Đang tải biểu mẫu…
          </div>
        }
      >
        <RegisterForm />
      </Suspense>

      <p className='mt-4 text-center text-sm text-[hsl(150,8%,34%)]'>
        Đã có tài khoản?{' '}
        <Link
          href='/login'
          className='font-semibold text-[hsl(142,65%,34%)] hover:underline'
        >
          Đăng nhập ngay
        </Link>
      </p>
    </div>
  );
}
