"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

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

/** Cùng chuẩn với nhập sản lượng mùa vụ / lô bán (BE quy đổi kg). */
const MASS_UNIT_OPTIONS = [
  { value: "tấn", label: "tấn" },
  { value: "kg", label: "kg" },
  { value: "gam", label: "gam" },
] as const;

function normalizeMassUnit(s: string): string {
  return s.trim().toLowerCase();
}

/** `YYYY-MM-DD` từ input type=date → UTC midnight của ngày đó (tránh lệch múi giờ). */
function utcDayFromYmd(ymd: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
    return null;
  return Date.UTC(y, mo - 1, d);
}

type FormValues = {
  cropName: string;
  startDate: string;
  expectedHarvestDate: string;
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      cropName: "",
      startDate: "",
      expectedHarvestDate: "",
      estimatedYield: "",
      actualYield: "",
      yieldUnit: "kg",
    },
  });

  const yieldUnitWatch = watch("yieldUnit");

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
    const hExpected = values.expectedHarvestDate.trim();

    const tSeason = utcDayFromYmd(start);
    if (tSeason == null) {
      toast.error("Ngày bắt đầu mùa vụ không hợp lệ.");
      return;
    }
    if (hExpected) {
      const tH = utcDayFromYmd(hExpected);
      if (tH != null && tH < tSeason) {
        toast.error(
          "Ngày thu hoạch dự kiến không được trước ngày bắt đầu mùa vụ.",
        );
        return;
      }
    }

    const estimatedYield = Number(values.estimatedYield.trim());
    const act = values.actualYield.trim();
    let actualYield: number | undefined;
    if (act !== "") {
      const n = Number(act);
      if (Number.isNaN(n)) {
        toast.error("Năng suất thực tế phải là số.");
        return;
      }
      actualYield = n;
    }

    const yieldUnit =
      values.yieldUnit.trim().length > 0 ? values.yieldUnit.trim() : "kg";

    createMutation.mutate(
      {
        farmId,
        cropName,
        startDate: start,
        harvestStartDate: hExpected || undefined,
        estimatedYield,
        ...(actualYield !== undefined ? { actualYield } : {}),
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
              ? `Nông trại: ${farm.name} — mã vụ do hệ thống gán (6 chữ cái + 6 số); cần cây trồng, ngày bắt đầu và năng suất dự kiến.`
              : "Đang tải thông tin nông trại..."}
          </p>
          {farm && (
            <p className="mt-2 text-sm leading-relaxed text-[hsl(150,8%,40%)]">
              <span className="font-semibold text-[hsl(150,12%,22%)]">
                Cây trồng chính{" "}
              </span>
              <span className="text-[hsl(150,10%,28%)]">
                {farm.cropMain?.trim()
                  ? farm.cropMain.trim()
                  : "— chưa khai báo trên hồ sơ trại"}
              </span>
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin mùa vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1">
              <Input
                className={farmFieldClass}
                placeholder="Cây trồng / vụ chính"
                maxLength={120}
                aria-invalid={errors.cropName ? true : undefined}
                disabled={farmsLoading || !farm}
                {...register("cropName", {
                  required: "Nhập cây trồng / vụ chính",
                })}
              />
              <p className="text-xs leading-relaxed text-[hsl(150,8%,40%)]">
                Một mùa vụ chỉ ghi <span className="font-medium">một loại cây</span>.
              </p>
            </div>
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
              <div className="space-y-1">
                <label
                  htmlFor="expected-harvest"
                  className="block text-sm font-semibold text-[hsl(150,16%,18%)]"
                >
                  Ngày thu hoạch dự kiến{" "}
                  <span className="font-normal text-[hsl(150,8%,40%)]">
                    (tuỳ chọn)
                  </span>
                </label>
                <p className="text-xs leading-relaxed text-[hsl(150,8%,38%)]">
                  Không được trước ngày bắt đầu vụ.
                </p>
                <Input
                  id="expected-harvest"
                  type="date"
                  className={farmFieldClass}
                  disabled={farmsLoading || !farm}
                  {...register("expectedHarvestDate")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="estimated-yield"
                  className="block text-xs font-medium text-[hsl(150,10%,35%)]"
                >
                  Năng suất dự kiến *
                </label>
                <Input
                  id="estimated-yield"
                  className={farmFieldClass}
                  inputMode="decimal"
                  placeholder="Ví dụ: 1500"
                  aria-invalid={errors.estimatedYield ? true : undefined}
                  disabled={farmsLoading || !farm}
                  {...register("estimatedYield", {
                    required: "Nhập năng suất dự kiến",
                    validate: (v) => {
                      const t = String(v ?? "").trim();
                      if (!t) return "Nhập năng suất dự kiến";
                      const n = Number(t);
                      if (Number.isNaN(n))
                        return "Năng suất dự kiến phải là số";
                      if (n <= 0)
                        return "Năng suất dự kiến phải lớn hơn 0";
                      return true;
                    },
                  })}
                />
                {errors.estimatedYield && (
                  <p className="text-sm text-red-600">
                    {errors.estimatedYield.message}
                  </p>
                )}
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

            <div className="space-y-2">
              <p className="text-xs font-medium text-[hsl(150,10%,35%)]">
                Đơn vị tính
              </p>
              <div className="flex flex-wrap gap-2">
                {MASS_UNIT_OPTIONS.map((opt) => {
                  const selected =
                    normalizeMassUnit(yieldUnitWatch) ===
                    normalizeMassUnit(opt.value);
                  return (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      className="min-w-13 rounded-full"
                      disabled={farmsLoading || !farm}
                      onClick={() =>
                        setValue("yieldUnit", opt.value, { shouldDirty: true })
                      }
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs leading-relaxed text-[hsl(150,8%,40%)]">
                Áp dụng cho cả năng suất dự kiến và năng suất thực tế.
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

