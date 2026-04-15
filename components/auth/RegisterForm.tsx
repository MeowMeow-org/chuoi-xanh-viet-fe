"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useRegisterMutation } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/schemas/authSchema";

export default function RegisterForm() {
  const { mutate: registerUser, isPending } = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => registerUser(data);

  return (
    <div className="w-full rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[hsl(150,10%,15%)]">Đăng ký</h2>
        <p className="text-sm leading-relaxed text-[hsl(150,5%,45%)]">
          Tạo tài khoản để bắt đầu hành trình truy xuất minh bạch.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Họ và tên"
            autoComplete="name"
            className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
            {...register("full_name")}
          />
          {errors.full_name && (
            <p className="text-sm text-red-700">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-700">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <input
            type="tel"
            placeholder="Số điện thoại"
            autoComplete="tel"
            className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-red-700">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 pr-11 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,5%,45%)] hover:text-[hsl(150,10%,20%)]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-700">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              autoComplete="new-password"
              className="w-full rounded-xl border border-[hsl(142,15%,88%)] bg-[hsl(120,20%,98%)] px-4 py-3 pr-11 text-sm outline-none focus:border-[hsl(142,71%,45%)] focus:bg-white"
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              aria-label={
                showConfirmPassword
                  ? "Ẩn xác nhận mật khẩu"
                  : "Hiện xác nhận mật khẩu"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,5%,45%)] hover:text-[hsl(150,10%,20%)]"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-sm text-red-700">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)] px-5 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
}
