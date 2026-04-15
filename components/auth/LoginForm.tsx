"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/schemas/authSchema";
import { useLoginMutation } from "@/hooks/useAuth";

export default function LoginForm() {
  const { mutate: login, isPending } = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => login(data);

  return (
    <div className="w-full rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[hsl(150,10%,15%)]">
          Đăng nhập
        </h2>
        <p className="text-sm leading-relaxed text-[hsl(150,5%,45%)]">
          Theo dõi mùa vụ, truy xuất và đơn hàng chỉ trong vài bước.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            autoComplete="username"
            className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-700">{errors.email.message}</p>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 pr-11 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,5%,45%)] hover:text-[hsl(150,10%,20%)]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-700">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)] px-5 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
