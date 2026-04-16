"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cooperativeService } from "@/services/cooperative/cooperativeService";
import type { RegisterFarmerApplicantPayload } from "@/services/cooperative";
import { useAuthStore } from "@/store/useAuthStore";

type FarmerApplicantForm = RegisterFarmerApplicantPayload;

export default function RegisterFarmerApplicantPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedCooperativeId, setSelectedCooperativeId] = useState<string>("");

  const { data: cooperatives = [], isLoading: isCooperativeLoading } = useQuery({
    queryKey: ["cooperative", "active-htx"],
    queryFn: cooperativeService.getActiveCooperatives,
  });

  const { mutate: registerApplicant, isPending } = useMutation({
    mutationFn: (payload: RegisterFarmerApplicantPayload) =>
      cooperativeService.registerFarmerApplicant(payload),
    onSuccess: () => {
      toast.success("Đăng ký nông hộ thành công, hồ sơ đang chờ duyệt");
      router.replace("/farmer");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể đăng ký nông hộ");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FarmerApplicantForm>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      full_name: "",
      phone: "",
      password: "",
      confirm_password: "",
      cooperative_user_id: "",
      farm_name: "",
    },
  });

  useEffect(() => {
    reset((current) => ({
      ...current,
      email: user?.email ?? "",
      full_name: user?.fullName ?? "",
      phone: user?.phone ?? "",
    }));
  }, [reset, user?.email, user?.fullName, user?.phone]);

  const onSubmit = (values: FarmerApplicantForm) => {
    if (values.password !== values.confirm_password) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    registerApplicant(values);
  };

  const selectedCooperative = cooperatives.find(
    (item) => item.id === selectedCooperativeId,
  );

  return (
    <main className="min-h-screen bg-[hsl(120,20%,98%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-[hsl(142,20%,85%)] bg-white p-6 shadow-md ring-1 ring-black/5 sm:p-8">
        <div className="mb-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(142,20%,80%)] px-3 py-1.5 text-xs font-semibold text-[hsl(150,12%,28%)] transition hover:bg-[hsl(120,20%,96%)]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-[hsl(150,16%,12%)]">
          Đăng ký nông hộ
        </h1>
        <p className="mt-2 text-sm text-[hsl(150,8%,34%)]">
          Hoàn tất hồ sơ để gửi yêu cầu tham gia hợp tác xã.
        </p>

        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-[hsl(150,14%,20%)]">
            1) Chọn hợp tác xã
          </h2>

          {isCooperativeLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`cooperative-skeleton-${index}`}
                  className="h-14 animate-pulse rounded-xl bg-[hsl(120,20%,94%)]"
                />
              ))}
            </div>
          )}

          {!isCooperativeLoading && cooperatives.length === 0 && (
            <p className="rounded-xl border border-[hsl(142,20%,85%)] bg-[hsl(120,20%,97%)] px-4 py-3 text-sm text-[hsl(150,8%,34%)]">
              Hiện chưa có hợp tác xã khả dụng.
            </p>
          )}

          {!isCooperativeLoading && cooperatives.length > 0 && (
            <div className="space-y-2">
              {cooperatives.map((item) => {
                const isSelected = selectedCooperativeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedCooperativeId(item.id);
                      setValue("cooperative_user_id", item.id, {
                        shouldValidate: true,
                      });
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? "border-[hsl(142,71%,45%)] bg-[hsl(142,71%,45%)]/10"
                        : "border-[hsl(142,20%,85%)] bg-white hover:border-[hsl(142,50%,60%)]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[hsl(150,16%,12%)]">
                      {item.full_name}
                    </p>
                    <p className="text-xs text-[hsl(150,8%,34%)]">
                      Chọn hợp tác xã này
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selectedCooperativeId && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-xl border border-[hsl(142,20%,85%)] bg-[hsl(120,20%,97%)] px-4 py-3 text-sm">
              <p className="font-semibold text-[hsl(150,16%,12%)]">
                2) Điền thông tin đăng ký
              </p>
              <p className="mt-1 text-[hsl(150,8%,34%)]">
                Hợp tác xã đã chọn: {selectedCooperative?.full_name}
              </p>
            </div>

            <input type="hidden" {...register("cooperative_user_id")} />
          <div>
            <Input placeholder="Email" {...register("email", { required: "Vui lòng nhập email" })} />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Input
              placeholder="Họ và tên"
              {...register("full_name", { required: "Vui lòng nhập họ và tên" })}
            />
            {errors.full_name && (
              <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Số điện thoại"
              {...register("phone", { required: "Vui lòng nhập số điện thoại" })}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Input
                type="password"
                placeholder="Mật khẩu"
                {...register("password", { required: "Vui lòng nhập mật khẩu" })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Xác nhận mật khẩu"
                {...register("confirm_password", {
                  required: "Vui lòng xác nhận mật khẩu",
                })}
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              placeholder="Tên nông trại"
              {...register("farm_name", { required: "Vui lòng nhập tên nông trại" })}
            />
            {errors.farm_name && (
              <p className="mt-1 text-sm text-red-600">{errors.farm_name.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Đang gửi..." : "Gửi đăng ký nông hộ"}
          </Button>
          </form>
        )}
      </div>
    </main>
  );
}
