import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[hsl(120,20%,98%)] px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[hsl(142,20%,85%)] bg-white p-6 shadow-md ring-1 ring-black/5 sm:p-8">
        <div className="relative mb-4 flex min-h-10 items-center justify-center sm:min-h-11">
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
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[hsl(150,16%,12%)]">
          Tạo tài khoản mới.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[hsl(150,8%,34%)]">
          Bắt đầu hành trình truy xuất minh bạch và quản lý mùa vụ trên nền tảng
          số.
        </p>

        <div className="mt-6">
          <Suspense fallback={<div className="text-sm text-muted-foreground">Đang tải biểu mẫu...</div>}>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-sm text-[hsl(150,8%,34%)]">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-[hsl(142,65%,34%)] hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
