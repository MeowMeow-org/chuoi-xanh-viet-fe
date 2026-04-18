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
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => login(data);

  const inputBase =
    "w-full rounded-xl border border-[hsl(142,20%,80%)] bg-white py-3.5 text-sm text-[hsl(150,16%,12%)] placeholder:text-[hsl(150,6%,55%)] outline-none transition focus:border-[hsl(142,71%,45%)] focus:ring-2 focus:ring-[hsl(142,71%,45%)]/20";

  const errorSlotBase =
    "min-h-[1.25rem] w-full text-sm leading-tight text-red-600";

  return (
    <form className="flex flex-col gap-1.5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1.5">
        <input
          type="email"
          placeholder="Email"
          autoComplete="username"
          className={`${inputBase} px-5`}
          {...register("email")}
        />
        <div className={`${errorSlotBase} pl-5`} aria-live="polite">
          {errors.email ? (
            <p className="m-0" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            autoComplete="current-password"
            className={`${inputBase} pl-6 pr-12`}
            {...register("password")}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[hsl(150,8%,40%)] transition hover:bg-[hsl(120,20%,96%)] hover:text-[hsl(150,14%,20%)]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className={`${errorSlotBase} pl-6`} aria-live="polite">
          {errors.password ? (
            <p className="m-0" role="alert">
              {errors.password.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(142,71%,45%)] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[hsl(142,71%,40%)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
