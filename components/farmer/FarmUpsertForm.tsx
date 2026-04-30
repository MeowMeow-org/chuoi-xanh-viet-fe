"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Crosshair, Loader2, MapPin } from "lucide-react";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  convertAreaDisplayValue,
  formatHaInputValue,
  parseAreaInputToHa,
  type FarmAreaUnit,
} from "@/lib/farmArea";
import { cn } from "@/lib/utils";
import type { CreateFarmPayload, Farm } from "@/services/farm";
import type { FarmFormValues } from "@/components/farmer/farm-form-types";
import { VietnamAddressFields } from "@/components/farmer/VietnamAddressFields";
import { FancySelect, type FancyOption } from "@/components/ui/fancy-select";

export type { FarmFormValues };

const farmFieldClass =
  "rounded-lg border border-input aria-invalid:border-destructive focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:aria-invalid:ring-destructive/40 aria-invalid:ring-1 aria-invalid:ring-destructive/25";

const farmButtonClass =
  "cursor-pointer focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed";

const AREA_UNIT_OPTIONS: FancyOption[] = [
  { value: "m2", label: "m²" },
  { value: "ha", label: "ha" },
];

export const emptyFarmFormValues = (): FarmFormValues => ({
  name: "",
  areaValue: "",
  areaUnit: "m2",
  province: "",
  district: "",
  ward: "",
  address: "",
  latitude: "",
  longitude: "",
});

export function farmToFormValues(farm: Farm): FarmFormValues {
  const haRaw =
    farm.areaHa != null && farm.areaHa !== "" ? Number(farm.areaHa) : NaN;
  return {
    name: farm.name,
    areaValue: Number.isFinite(haRaw) ? formatHaInputValue(haRaw) : "",
    areaUnit: "ha",
    province: farm.province ?? "",
    district: farm.district ?? "",
    ward: farm.ward ?? "",
    address: farm.address ?? "",
    latitude:
      farm.latitude != null && farm.latitude !== ""
        ? String(farm.latitude)
        : "",
    longitude:
      farm.longitude != null && farm.longitude !== ""
        ? String(farm.longitude)
        : "",
  };
}

function valuesToPayload(values: FarmFormValues): CreateFarmPayload | null {
  const parsed = parseAreaInputToHa(values.areaValue, values.areaUnit);
  if (parsed.error) {
    toast.error(parsed.error);
    return null;
  }
  let areaHa = parsed.ha;
  if (areaHa !== undefined) {
    areaHa = Math.round(areaHa * 1e8) / 1e8;
  }

  const latStr = values.latitude.trim();
  const lngStr = values.longitude.trim();

  if (!latStr || !lngStr) {
    toast.error(
      'Cần có đủ vĩ độ và kinh độ. Bấm "Lấy vị trí điện thoại" hoặc nhập hai số tay.',
    );
    return null;
  }

  const la = Number(latStr);
  const lo = Number(lngStr);
  if (Number.isNaN(la) || Number.isNaN(lo)) {
    toast.error("Hai ô tọa độ phải là số.");
    return null;
  }
  if (la < -90 || la > 90 || lo < -180 || lo > 180) {
    toast.error("Tọa độ không hợp lệ.");
    return null;
  }

  return {
    name: values.name.trim(),
    areaHa,
    province: values.province.trim() || undefined,
    district: values.district.trim() || undefined,
    ward: values.ward.trim() || undefined,
    address: values.address.trim() || undefined,
    latitude: la,
    longitude: lo,
  };
}

type FarmUpsertFormProps = {
  title: string;
  description: string;
  backHref: string;
  defaultValues: FarmFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmitPayload: (payload: CreateFarmPayload) => void;
};

export default function FarmUpsertForm({
  title,
  description,
  backHref,
  defaultValues,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmitPayload,
}: FarmUpsertFormProps) {
  const [geoLoading, setGeoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<FarmFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });
  const areaUnit = useWatch({ control, name: "areaUnit" }) ?? "m2";

  const fillFromAddressSearch = () => {
    toast.info("Tính năng đang được phát triển.");
  };

  const fillFromGeolocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error(
        "Thiết bị không hỗ trợ định vị. Hãy nhập vĩ độ và kinh độ vào hai ô bên dưới.",
      );
      return;
    }

    try {
      const perm = await navigator.permissions?.query({ name: "geolocation" });
      if (perm?.state === "denied") {
        toast.error(
          "Trang đang bị tắt quyền vị trí. Bấm ổ khóa cạnh đường link → Vị trí → Cho phép, hoặc nhập tọa độ tay.",
          { duration: 12_000 },
        );
        return;
      }
    } catch {
      /* ignore */
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", String(pos.coords.latitude), {
          shouldValidate: true,
        });
        setValue("longitude", String(pos.coords.longitude), {
          shouldValidate: true,
        });
        setGeoLoading(false);
        toast.success("Đã lấy vị trí hiện tại.");
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          toast.error(
            "Chưa cho phép vị trí. Bấm ổ khóa cạnh đường link → Cho phép, hoặc nhập tọa độ tay.",
            { duration: 12_000 },
          );
        } else {
          toast.error(
            "Không lấy được GPS. Hãy nhập vĩ độ và kinh độ tay.",
          );
        }
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 60_000 },
    );
  };

  const onSubmit = (values: FarmFormValues) => {
    const payload = valuesToPayload(values);
    if (payload) onSubmitPayload(payload);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex items-start gap-3 sm:gap-4">
        <Link
          href={backHref}
          aria-label="Quay lại"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[hsl(150,12%,38%)] transition hover:bg-[hsl(142,71%,94%)] hover:text-[hsl(142,58%,30%)] active:bg-[hsl(142,71%,90%)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="text-xl font-bold tracking-tight text-[hsl(150,16%,12%)]">
            {title}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-[hsl(150,8%,40%)]">
            {description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin nông trại</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Input
                className={farmFieldClass}
                placeholder="Tên nông trại *"
                aria-invalid={errors.name ? true : undefined}
                {...register("name", {
                  required: "Vui lòng nhập tên nông trại",
                  minLength: {
                    value: 2,
                    message: "Tên nông trại tối thiểu 2 ký tự",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-visible pb-0.5">
                <Input
                  className={cn(
                    farmFieldClass,
                    "h-11 min-h-11 min-w-0 py-0 my-0",
                  )}
                  inputMode="decimal"
                  placeholder={
                    areaUnit === "m2"
                      ? "Diện tích — ví dụ: 2500"
                      : "Diện tích — ví dụ: 0,25"
                  }
                  aria-label="Diện tích (tuỳ chọn)"
                  {...register("areaValue")}
                />
                <FancySelect
                  wrapperClassName="w-21 shrink-0"
                  className="h-11 min-h-11 w-full rounded-lg border-[hsl(142,20%,88%)] bg-[hsl(120,25%,98%)] px-2 py-0 text-sm shadow-sm"
                  listMaxHeightClassName="max-h-48"
                  value={areaUnit}
                  options={AREA_UNIT_OPTIONS}
                  placeholder="Đơn vị"
                  onChange={(v) => {
                    const next = (v === "ha" ? "ha" : "m2") as FarmAreaUnit;
                    const prev = getValues("areaUnit");
                    if (prev === next) return;
                    const raw = getValues("areaValue");
                    setValue(
                      "areaValue",
                      convertAreaDisplayValue(raw, prev, next),
                      { shouldValidate: true },
                    );
                    setValue("areaUnit", next, { shouldValidate: true });
                  }}
                />
              </div>
              <p className="text-xs leading-snug text-[hsl(150,8%,42%)]">
                (1 ha = 10.000
                m²).
              </p>
            </div>

            <VietnamAddressFields
              control={control}
              setValue={setValue}
              fieldClassName={farmFieldClass}
            />

            <Input
              className={farmFieldClass}
              placeholder="Địa chỉ chi tiết (số nhà, đường...)"
              {...register("address")}
            />

            <div className="space-y-3 rounded-xl border border-[hsl(142,20%,88%)] bg-[hsl(120,25%,98%)] p-4">
              <div>
                <p className="text-sm font-semibold text-[hsl(150,16%,18%)]">
                  Tọa độ (bắt buộc)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  size="sm"
                  className={`${farmButtonClass} w-full gap-2 bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]`}
                  disabled={geoLoading}
                  onClick={fillFromAddressSearch}
                >
                  <MapPin className="h-4 w-4" />
                  Tìm từ địa chỉ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`${farmButtonClass} w-full gap-2 border-[hsl(142,35%,38%)] bg-white text-[hsl(142,58%,28%)]`}
                  disabled={geoLoading}
                  onClick={() => void fillFromGeolocation()}
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Crosshair className="h-4 w-4" />
                  )}
                  Lấy vị trí từ thiết bị
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-1">
                  <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
                    Vĩ độ *
                  </label>
                  <Input
                    className={cn(farmFieldClass, "h-11 w-full")}
                    placeholder="Ví dụ: 10.8231"
                    inputMode="decimal"
                    aria-invalid={errors.latitude ? true : undefined}
                    {...register("latitude", {
                      required:
                        "Cần vĩ độ — bấm Lấy vị trí điện thoại hoặc nhập số",
                      validate: (v) => {
                        const t = String(v ?? "").trim();
                        if (!t) return true;
                        const n = Number(t);
                        if (Number.isNaN(n)) return "Nhập số";
                        if (n < -90 || n > 90) return "Từ -90 đến 90";
                        return true;
                      },
                    })}
                  />
                  {errors.latitude && (
                    <p className="text-sm text-red-600">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
                    Kinh độ *
                  </label>
                  <Input
                    className={cn(farmFieldClass, "h-11 w-full")}
                    placeholder="Ví dụ: 106.6297"
                    inputMode="decimal"
                    aria-invalid={errors.longitude ? true : undefined}
                    {...register("longitude", {
                      required:
                        "Cần kinh độ — bấm Lấy vị trí điện thoại hoặc nhập số",
                      validate: (v) => {
                        const t = String(v ?? "").trim();
                        if (!t) return true;
                        const n = Number(t);
                        if (Number.isNaN(n)) return "Nhập số";
                        if (n < -180 || n > 180) return "Từ -180 đến 180";
                        return true;
                      },
                    })}
                  />
                  {errors.longitude && (
                    <p className="text-sm text-red-600">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className={`${farmButtonClass} w-full sm:w-auto sm:min-w-48`}
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPending ? pendingLabel : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

