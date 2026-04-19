import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[hsl(120,20%,98%)] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 flex items-center justify-center">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[hsl(142,20%,85%)] bg-white p-8 shadow-md ring-1 ring-black/5 sm:p-10">
        <div className="relative mb-2 flex min-h-10 items-center justify-center sm:min-h-11">
          <Link
            href="/"
            className="absolute left-0 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-lg border border-[hsl(142,20%,80%)] px-3 py-1.5 text-xs font-semibold text-[hsl(150,12%,28%)] transition hover:bg-[hsl(120,20%,96%)]"
            aria-label="Về trang chủ"
            title="Về trang chủ"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <p className="rounded-full bg-[hsl(142,71%,45%)]/12 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-[hsl(142,65%,34%)] sm:text-base">
            Chuỗi Xanh Việt
          </p>
        </div>
        <h1 className="mt-2 text-center text-2xl font-extrabold leading-tight text-[hsl(150,16%,12%)]">
          Chào mừng bạn quay trở lại.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-[hsl(150,8%,34%)]">
          Đăng nhập để tiếp tục theo dõi mùa vụ, truy xuất nguồn gốc và quản lý
          gian hàng.
        </p>

        <div className="mt-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-10 text-sm text-[hsl(150,8%,45%)]">
                Đang tải biểu mẫu…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-16 pt-1 text-center text-sm text-[hsl(150,8%,34%)] sm:mt-20">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-semibold text-[hsl(142,65%,34%)] hover:underline"
          >
            Tạo tài khoản mới
          </Link>
        </p>
      </div>
    </main>
  );
}
