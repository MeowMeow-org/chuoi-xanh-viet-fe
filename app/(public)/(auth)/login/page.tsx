import { Suspense } from 'react';
import Link from 'next/link';

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className='w-full rounded-2xl border border-[hsl(142,20%,85%)] bg-white/95 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur-sm'>
      <h1 className='text-2xl font-extrabold leading-tight text-[hsl(150,16%,12%)]'>
        Chào mừng bạn quay trở lại.
      </h1>
      <p className='mt-2 text-sm leading-relaxed text-[hsl(150,8%,34%)]'>
        Đăng nhập để tiếp tục theo dõi mùa vụ, truy xuất nguồn gốc và quản lý
        gian hàng.
      </p>

      <div className='mt-6'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center py-10 text-sm text-[hsl(150,8%,45%)]'>
              Đang tải biểu mẫu…
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      <p className='mt-6 text-center text-sm text-[hsl(150,8%,34%)]'>
        Chưa có tài khoản?{' '}
        <Link
          href='/register'
          className='font-semibold text-[hsl(142,65%,34%)] hover:underline'
        >
          Tạo tài khoản mới
        </Link>
      </p>
    </div>
  );
}
