"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import { useCreateSeasonMutation } from "@/hooks/useSeason";

/** Cùng chuẩn với FarmUpsertForm / tạo nông trại */
const farmFieldClass =
  "rounded-lg border border-input aria-invalid:border-destructive focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:aria-invalid:ring-destructive/40 aria-invalid:ring-1 aria-invalid:ring-destructive/25";

const farmButtonClass =
  "cursor-pointer focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed";

type FormValues = {
  cropName: string;
  startDate: string;
  harvestStartDate: string;
  harvestEndDate: string;
  estimatedYield: string;
  actualYield: string;
  yieldUnit: string;
};

export default function CreateSeasonPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = Array.isArray(params.farmId)
    ? params.farmId[0]
    : params.farmId;
  const router = useRouter();
  const { farms, isLoading: farmsLoading } = useMyFarmsQuery({
    page: 1,
    limit: 100,
  });
  const createMutation = useCreateSeasonMutation();

  const farm = useMemo(
    () => (farmId ? farms.find((f) => f.id === farmId) : undefined),
    [farms, farmId],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      cropName: "",
      startDate: "",
      harvestStartDate: "",
      harvestEndDate: "",
      estimatedYield: "",
      actualYield: "",
      yieldUnit: "kg",
    },
  });

  if (!farmId) return null;

  if (!farmsLoading && !farm) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link
            href="/farmer/farms"
            aria-label="Quay lại danh sách nông trại"
            className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[hsl(150,12%,38%)] transition hover:bg-[hsl(142,71%,94%)] hover:text-[hsl(142,58%,30%)] active:bg-[hsl(142,71%,90%)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="text-xl font-bold tracking-tight text-[hsl(150,16%,12%)]">
              Không tìm thấy nông trại
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-[hsl(150,8%,40%)]">
              Bạn không có quyền thêm mùa vụ hoặc nông trại không tồn tại.
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-4 text-sm text-[hsl(150,8%,40%)]">
            Quay lại danh sách nông trại để chọn đúng trang trại.
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    const cropName = values.cropName.trim();
    if (!cropName || !values.startDate) {
      toast.error("Vui lòng điền cây trồng và ngày bắt đầu.");
      return;
    }

    const start = values.startDate;
    const hStart = values.harvestStartDate.trim();
    const hEnd = values.harvestEndDate.trim();

    if (hStart && hEnd) {
      const a = new Date(hStart).getTime();
      const b = new Date(hEnd).getTime();
      if (!Number.isNaN(a) && !Number.isNaN(b) && b < a) {
        toast.error(
          "Ngày kết thúc thu hoạch phải sau hoặc cùng ngày bắt đầu thu hoạch.",
        );
        return;
      }
    }

    const est = values.estimatedYield.trim();
    const act = values.actualYield.trim();
    let estimatedYield: number | undefined;
    let actualYield: number | undefined;
    if (est !== "") {
      const n = Number(est);
      if (Number.isNaN(n)) {
        toast.error("Năng suất dự kiến phải là số.");
        return;
      }
      estimatedYield = n;
    }
    if (act !== "") {
      const n = Number(act);
      if (Number.isNaN(n)) {
        toast.error("Năng suất thực tế phải là số.");
        return;
      }
      actualYield = n;
    }

    const yieldUnit = values.yieldUnit.trim() || "kg";

    createMutation.mutate(
      {
        farmId,
        cropName,
        startDate: start,
        harvestStartDate: hStart || undefined,
        harvestEndDate: hEnd || undefined,
        estimatedYield,
        actualYield,
        yieldUnit,
      },
      {
        onSuccess: (season) => {
          toast.success("Đã tạo mùa vụ");
          router.replace(`/farmer/farms/${farmId}/seasons/${season.id}`);
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex items-start gap-3 sm:gap-4">
        <Link
          href={`/farmer/farms/${farmId}/seasons`}
          aria-label="Quay lại danh sách mùa vụ"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[hsl(150,12%,38%)] transition hover:bg-[hsl(142,71%,94%)] hover:text-[hsl(142,58%,30%)] active:bg-[hsl(142,71%,90%)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="text-xl font-bold tracking-tight text-[hsl(150,16%,12%)]">
            Tạo mùa vụ mới
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-[hsl(150,8%,40%)]">
            {farm
              ? `Nông trại: ${farm.name} — mã vụ do hệ thống gán (6 chữ cái + 6 số); bạn chỉ cần cây trồng và thời gian.`
              : "Đang tải thông tin nông trại..."}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin mùa vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              className={farmFieldClass}
              placeholder="Cây trồng / vụ chính * (ví dụ: Rau muống hữu cơ)"
              maxLength={120}
              aria-invalid={errors.cropName ? true : undefined}
              disabled={farmsLoading || !farm}
              {...register("cropName", {
                required: "Nhập tên cây trồng hoặc mô tả vụ",
              })}
            />
            {errors.cropName && (
              <p className="text-sm text-red-600">{errors.cropName.message}</p>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-[hsl(150,10%,35%)]">
                Ngày bắt đầu vụ *
              </p>
              <Input
                type="date"
                className={farmFieldClass}
                aria-invalid={errors.startDate ? true : undefined}
                disabled={farmsLoading || !farm}
                {...register("startDate", { required: "Chọn ngày bắt đầu" })}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-[hsl(142,20%,88%)] bg-[hsl(120,25%,98%)] p-4">
              <div>
                <p className="text-sm font-semibold text-[hsl(150,16%,18%)]">
                  Thu hoạch (tuỳ chọn)
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[hsl(150,8%,38%)]">
                  Có thể bổ sung sau; ngày kết thúc nên sau hoặc trùng ngày bắt
                  đầu thu hoạch.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
                    Bắt đầu thu hoạch
                  </label>
                  <Input
                    type="date"
                    className={farmFieldClass}
                    disabled={farmsLoading || !farm}
                    {...register("harvestStartDate")}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
                    Kết thúc thu hoạch
                  </label>
                  <Input
                    type="date"
                    className={farmFieldClass}
                    disabled={farmsLoading || !farm}
                    {...register("harvestEndDate")}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="estimated-yield"
                  className="block text-xs font-medium text-[hsl(150,10%,35%)]"
                >
                  Năng suất dự kiến{" "}
                  <span className="font-normal text-[hsl(150,8%,45%)]">
                    (tuỳ chọn)
                  </span>
                </label>
                <Input
                  id="estimated-yield"
                  className={farmFieldClass}
                  inputMode="decimal"
                  placeholder="Ví dụ: 1500"
                  disabled={farmsLoading || !farm}
                  {...register("estimatedYield")}
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="actual-yield"
                  className="block text-xs font-medium text-[hsl(150,10%,35%)]"
                >
                  Năng suất thực tế{" "}
                  <span className="font-normal text-[hsl(150,8%,45%)]">
                    (tuỳ chọn)
                  </span>
                </label>
                <Input
                  id="actual-yield"
                  className={farmFieldClass}
                  inputMode="decimal"
                  placeholder="Để trống nếu chưa thu"
                  disabled={farmsLoading || !farm}
                  {...register("actualYield")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="yield-unit"
                className="block text-xs font-medium text-[hsl(150,10%,35%)]"
              >
                Đơn vị tính
              </label>
              <Input
                id="yield-unit"
                className={farmFieldClass}
                placeholder="kg"
                maxLength={20}
                disabled={farmsLoading || !farm}
                {...register("yieldUnit")}
              />
              <p className="text-xs leading-relaxed text-[hsl(150,8%,40%)]">
                Mặc định <span className="font-medium">kg</span> nếu để trống.
              </p>
            </div>

            <Button
              type="submit"
              disabled={farmsLoading || !farm || createMutation.isPending}
              className={`${farmButtonClass} w-full bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)] sm:w-auto`}
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createMutation.isPending ? "Đang tạo..." : "Tạo mùa vụ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
