"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { useRegisterMutation } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/schemas/authSchema";

export default function RegisterForm() {
  const searchParams = useSearchParams();
  const { mutate: registerUser, isPending } = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => registerUser(data);

  useEffect(() => {
    const intent = searchParams.get("intent");
    if (intent === "farmer-applicant") {
      window.sessionStorage.setItem("register_intent", "farmer-applicant");
      return;
    }

    window.sessionStorage.removeItem("register_intent");
  }, [searchParams]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Họ và tên"
            autoComplete="name"
            className="w-full rounded-xl border border-[hsl(142,20%,80%)] bg-white px-4 py-3 text-sm text-[hsl(150,16%,12%)] placeholder:text-[hsl(150,6%,55%)] outline-none focus:border-[hsl(142,71%,45%)] focus:ring-2 focus:ring-[hsl(142,71%,45%)]/20"
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
            className="w-full rounded-xl border border-[hsl(142,20%,80%)] bg-white px-4 py-3 text-sm text-[hsl(150,16%,12%)] placeholder:text-[hsl(150,6%,55%)] outline-none focus:border-[hsl(142,71%,45%)] focus:ring-2 focus:ring-[hsl(142,71%,45%)]/20"
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
            className="w-full rounded-xl border border-[hsl(142,20%,80%)] bg-white px-4 py-3 text-sm text-[hsl(150,16%,12%)] placeholder:text-[hsl(150,6%,55%)] outline-none focus:border-[hsl(142,71%,45%)] focus:ring-2 focus:ring-[hsl(142,71%,45%)]/20"
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
              className="w-full rounded-xl border border-[hsl(142,20%,80%)] bg-white px-4 py-3 pr-11 text-sm text-[hsl(150,16%,12%)] placeholder:text-[hsl(150,6%,55%)] outline-none focus:border-[hsl(142,71%,45%)] focus:ring-2 focus:ring-[hsl(142,71%,45%)]/20"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,8%,40%)] hover:text-[hsl(150,14%,20%)]"
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
              className="w-full rounded-xl border border-[hsl(142,20%,80%)] bg-white px-4 py-3 pr-11 text-sm text-[hsl(150,16%,12%)] placeholder:text-[hsl(150,6%,55%)] outline-none focus:border-[hsl(142,71%,45%)] focus:ring-2 focus:ring-[hsl(142,71%,45%)]/20"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(150,8%,40%)] hover:text-[hsl(150,14%,20%)]"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[hsl(142,71%,40%)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </div>
    </form>
  );
}
