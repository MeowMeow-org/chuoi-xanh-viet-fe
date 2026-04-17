"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Crosshair, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buildGeocodeQuery, geocodeVietnamAddress } from "@/lib/googleGeocode";
import type { CreateFarmPayload, Farm } from "@/services/farm";

const farmFieldClass =
  "rounded-lg border border-input aria-invalid:border-destructive focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:aria-invalid:ring-destructive/40 aria-invalid:ring-1 aria-invalid:ring-destructive/25";

const farmButtonClass =
  "cursor-pointer focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed";

export type FarmFormValues = {
  name: string;
  areaHa: string;
  cropMain: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  latitude: string;
  longitude: string;
};

export const emptyFarmFormValues = (): FarmFormValues => ({
  name: "",
  areaHa: "",
  cropMain: "",
  province: "",
  district: "",
  ward: "",
  address: "",
  latitude: "",
  longitude: "",
});

export function farmToFormValues(farm: Farm): FarmFormValues {
  return {
    name: farm.name,
    areaHa:
      farm.areaHa != null && farm.areaHa !== "" ? String(farm.areaHa) : "",
    cropMain: farm.cropMain ?? "",
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
  const normalizedArea = values.areaHa.trim();
  const areaHa = normalizedArea ? Number(normalizedArea) : undefined;

  if (areaHa !== undefined && Number.isNaN(areaHa)) {
    toast.error("Diện tích phải là số hợp lệ");
    return null;
  }

  const latStr = values.latitude.trim();
  const lngStr = values.longitude.trim();

  if (!latStr || !lngStr) {
    toast.error(
      'Cần có tọa độ. Bấm "Tìm từ địa chỉ" hoặc "Lấy vị trí điện thoại", hoặc nhập hai số tay.',
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
    cropMain: values.cropMain.trim() || undefined,
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FarmFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
  });

  const fillFromGoogleGeocode = async () => {
    const v = getValues();
    const query = buildGeocodeQuery({
      address: v.address,
      ward: v.ward,
      district: v.district,
      province: v.province,
    });

    if (query.length < 8) {
      toast.error(
        "Hãy ghi rõ địa chỉ: ít nhất đường/xã và tỉnh, rồi bấm tìm lại.",
      );
      return;
    }

    setGoogleLoading(true);
    try {
      const result = await geocodeVietnamAddress(query);
      if (result == null) {
        toast.error(
          "Google không tìm thấy địa chỉ này. Kiểm tra chính tả hoặc ghi đầy đủ hơn.",
        );
        return;
      }
      setValue("latitude", String(result.lat), { shouldValidate: true });
      setValue("longitude", String(result.lng), { shouldValidate: true });
      toast.success(
        result.formattedAddress
          ? `Đã lấy tọa độ: ${result.formattedAddress}`
          : "Đã điền kinh độ và vĩ độ.",
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "MISSING_GOOGLE_KEY") {
        toast.error(
          "Chưa có khóa Google Maps. Thêm NEXT_PUBLIC_GOOGLE_MAPS_API_KEY vào file cấu hình (xem hướng dẫn Geocoding API).",
          { duration: 10_000 },
        );
      } else if (msg === "GOOGLE_DENIED") {
        toast.error(
          "Google từ chối yêu cầu: kiểm tra đã bật Geocoding API, thanh toán trên Cloud, và khóa đúng hạn chế.",
          { duration: 10_000 },
        );
      } else {
        toast.error(
          "Không tra được địa chỉ lúc này. Thử lại sau hoặc dùng nút lấy vị trí điện thoại.",
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const fillFromGeolocation = async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error(
        "Điện thoại không bật được định vị. Hãy dùng nút tìm theo địa chỉ ở trên.",
      );
      return;
    }

    try {
      const perm = await navigator.permissions?.query({ name: "geolocation" });
      if (perm?.state === "denied") {
        toast.error(
          "Trang đang bị tắt quyền vị trí. Bấm ổ khóa cạnh đường link → Vị trí → Cho phép, hoặc dùng nút tìm theo địa chỉ.",
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
            "Chưa cho phép vị trí. Bấm ổ khóa cạnh đường link → Cho phép, hoặc dùng nút tìm theo địa chỉ.",
            { duration: 12_000 },
          );
        } else {
          toast.error(
            "Không lấy được GPS. Hãy bấm tìm tọa độ theo địa chỉ đã nhập.",
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                className={farmFieldClass}
                placeholder="Diện tích (ha)"
                {...register("areaHa")}
              />
              <Input
                className={farmFieldClass}
                placeholder="Cây trồng chính"
                {...register("cropMain")}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                className={farmFieldClass}
                placeholder="Tỉnh/Thành"
                {...register("province")}
              />
              <Input
                className={farmFieldClass}
                placeholder="Quận/Huyện"
                {...register("district")}
              />
              <Input
                className={farmFieldClass}
                placeholder="Phường/Xã"
                {...register("ward")}
              />
            </div>

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
                <p className="mt-1 text-sm leading-relaxed text-[hsl(150,8%,38%)]">
                  Bước 1: Ghi đủ địa chỉ ở trên. Bước 2: Bấm{" "}
                  <strong className="font-semibold text-[hsl(150,12%,28%)]">
                    Tìm từ địa chỉ
                  </strong>{" "}
                  — Google sẽ điền hai số bên dưới. Nếu không được, bấm lấy vị
                  trí điện thoại hoặc nhập hai số tay (nhờ con cháu lấy trên bản
                  đồ).
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  className={`${farmButtonClass} w-full gap-2 bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)] sm:w-auto`}
                  disabled={googleLoading || geoLoading}
                  onClick={() => void fillFromGoogleGeocode()}
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  Tìm từ địa chỉ (Google)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`${farmButtonClass} w-full gap-2 border-[hsl(142,35%,38%)] bg-white text-[hsl(142,58%,28%)] sm:w-auto`}
                  disabled={geoLoading || googleLoading}
                  onClick={() => void fillFromGeolocation()}
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Crosshair className="h-4 w-4" />
                  )}
                  Lấy vị trí điện thoại
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
                    Vĩ độ *
                  </label>
                  <Input
                    className={farmFieldClass}
                    placeholder="Ví dụ: 10.8231"
                    inputMode="decimal"
                    aria-invalid={errors.latitude ? true : undefined}
                    {...register("latitude", {
                      required: "Cần vĩ độ — dùng nút Tìm từ địa chỉ",
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
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
                    Kinh độ *
                  </label>
                  <Input
                    className={farmFieldClass}
                    placeholder="Ví dụ: 106.6297"
                    inputMode="decimal"
                    aria-invalid={errors.longitude ? true : undefined}
                    {...register("longitude", {
                      required: "Cần kinh độ — dùng nút Tìm từ địa chỉ",
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

            <Button
              type="submit"
              disabled={isPending}
              className={`${farmButtonClass} w-full sm:w-auto`}
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending ? pendingLabel : submitLabel}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
