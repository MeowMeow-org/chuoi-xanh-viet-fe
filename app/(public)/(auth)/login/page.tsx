import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[hsl(120,20%,98%)] px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[hsl(142,20%,85%)] bg-white p-6 shadow-md ring-1 ring-black/5 sm:p-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(142,20%,80%)] px-3 py-1.5 text-xs font-semibold text-[hsl(150,12%,28%)] transition hover:bg-[hsl(120,20%,96%)]"
            aria-label="Về trang chủ"
            title="Về trang chủ"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="inline-flex rounded-full bg-[hsl(142,71%,45%)]/12 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[hsl(142,65%,34%)]">
          Chuỗi Xanh Việt
        </p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[hsl(150,16%,12%)]">
          Chào mừng bạn quay trở lại.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[hsl(150,8%,34%)]">
          Đăng nhập để tiếp tục theo dõi mùa vụ, truy xuất nguồn gốc và quản lý
          gian hàng.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-sm text-[hsl(150,8%,34%)]">
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
