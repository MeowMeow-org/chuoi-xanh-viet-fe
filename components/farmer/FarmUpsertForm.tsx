"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  convertAreaDisplayValue,
  formatHaInputValue,
  parseAreaInputToHa,
  type FarmAreaUnit,
} from "@/lib/farmArea";
import { cn } from "@/lib/utils";
import type { CreateFarmPayload, Farm } from "@/services/farm";
import type { FarmFormValues } from "@/components/farmer/farm-form-types";
import {
  AddressPicker,
  type AddressPickerValue,
} from "@/components/address/AddressPicker";
import { FancySelect, type FancyOption } from "@/components/ui/fancy-select";
import { findCodesByNames } from "@/lib/vietnamAddressApi";
import { buildGeocodeQuery, geocodeVietnamAddress } from "@/lib/googleGeocode";
import type { VietMapLocationPickerProps } from "@/components/maps/VietMapLocationPicker";

const VietMapLocationPicker = dynamic<VietMapLocationPickerProps>(
  () => import("@/components/maps/VietMapLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] h-[360px] max-h-[55vh] w-full items-center justify-center rounded-xl border border-[hsl(142,20%,88%)] bg-[hsl(140,14%,93%)]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(142,35%,38%)]" />
      </div>
    ),
  },
);

export type { FarmFormValues };

const farmFieldClass =
  "rounded-lg border border-input aria-invalid:border-destructive focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:aria-invalid:ring-destructive/40 aria-invalid:ring-1 aria-invalid:ring-destructive/25";

const farmButtonClass =
  "cursor-pointer focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed";

const AREA_UNIT_OPTIONS: FancyOption[] = [
  { value: "m2", label: "m²" },
  { value: "ha", label: "ha" },
];

type ReverseAdminFields = {
  ward?: string | null;
  district?: string | null;
  province?: string | null;
  detail?: string | null;
};

function extractAdminFromReversePayload(payload: unknown): ReverseAdminFields {
  const data = (payload ?? {}) as {
    name?: string;
    ward?: string;
    district?: string;
    province?: string;
    address?: {
      amenity?: string;
      road?: string;
      house_number?: string;
      pedestrian?: string;
      footway?: string;
      path?: string;
      residential?: string;
      suburb?: string;
      quarter?: string;
      neighbourhood?: string;
      village?: string;
      hamlet?: string;
      city_district?: string;
      county?: string;
      district?: string;
      city?: string;
      town?: string;
      state?: string;
      province?: string;
      "ISO3166-2-lvl4"?: string;
    };
  };

  // Ưu tiên format cũ nếu có, fallback qua dữ liệu OSM address object.
  const address = data.address ?? {};
  const cityLike = address.city ?? address.town ?? null;
  let district =
    data.district ??
    address.city_district ??
    address.county ??
    address.district ??
    null;
  // Nhiều điểm ở HCM trả city="Thành phố Thủ Đức" nhưng không có district/county.
  if (!district && cityLike) district = cityLike;

  let province = data.province ?? address.state ?? address.province ?? null;
  if (!province) {
    // OSM thường trả mã hành chính cấp tỉnh cho HCM ở đây.
    if (address["ISO3166-2-lvl4"] === "VN-SG") {
      province = "Thành phố Hồ Chí Minh";
    } else if (district && cityLike) {
      // Trường hợp đô thị trực thuộc tỉnh/thành: có district + city.
      province = cityLike;
    }
  }

  const roadLike =
    address.road ??
    address.pedestrian ??
    address.footway ??
    address.path ??
    address.residential ??
    null;
  const detail = [address.house_number ?? null, roadLike]
    .map((x) => (x ?? "").trim())
    .filter(Boolean)
    .join(" ");

  return {
    ward:
      data.ward ??
      address.suburb ??
      address.quarter ??
      address.neighbourhood ??
      address.village ??
      address.hamlet ??
      null,
    district,
    province,
    detail: detail || data.name || address.amenity || null,
  };
}

export const emptyFarmFormValues = (): FarmFormValues => ({
  name: "",
  areaValue: "",
  areaUnit: "m2",
  provinceCode: null,
  districtCode: null,
  wardCode: null,
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
    provinceCode: farm.provinceCode ?? null,
    districtCode: farm.districtCode ?? null,
    wardCode: farm.wardCode ?? null,
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
      'Cần có đủ vĩ độ và kinh độ. Hãy chọn địa chỉ bằng dropdown (tự lấy tọa độ) hoặc dùng "Chọn từ bản đồ".',
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
  if (!values.provinceCode || !values.districtCode || !values.wardCode) {
    toast.error("Vui lòng chọn đủ tỉnh/quận/phường của nông trại.");
    return null;
  }
  if (!values.address.trim()) {
    toast.error("Vui lòng nhập số nhà / đường của nông trại.");
    return null;
  }

  return {
    name: values.name.trim(),
    areaHa,
    province: values.province.trim() || undefined,
    district: values.district.trim() || undefined,
    ward: values.ward.trim() || undefined,
    provinceCode: values.provinceCode ?? null,
    districtCode: values.districtCode ?? null,
    wardCode: values.wardCode ?? null,
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
  const [addressMode, setAddressMode] = useState<"dropdown" | "map">("dropdown");
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapDraftLat, setMapDraftLat] = useState("");
  const [mapDraftLng, setMapDraftLng] = useState("");
  const [applyingMap, setApplyingMap] = useState(false);
  const queryClient = useQueryClient();

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
  const watchedLat = useWatch({ control, name: "latitude" }) ?? "";
  const watchedLng = useWatch({ control, name: "longitude" }) ?? "";
  const watchedProvinceCode =
    useWatch({ control, name: "provinceCode" }) ?? null;
  const watchedDistrictCode =
    useWatch({ control, name: "districtCode" }) ?? null;
  const watchedWardCode = useWatch({ control, name: "wardCode" }) ?? null;
  const watchedProvince = useWatch({ control, name: "province" }) ?? "";
  const watchedDistrict = useWatch({ control, name: "district" }) ?? "";
  const watchedWard = useWatch({ control, name: "ward" }) ?? "";
  const watchedAddressDetail = useWatch({ control, name: "address" }) ?? "";

  const addressValue: AddressPickerValue = {
    provinceCode: watchedProvinceCode,
    districtCode: watchedDistrictCode,
    wardCode: watchedWardCode,
    provinceName: watchedProvince,
    districtName: watchedDistrict,
    wardName: watchedWard,
  };

  const handleAddressChange = (next: AddressPickerValue) => {
    setValue("provinceCode", next.provinceCode, { shouldValidate: true });
    setValue("districtCode", next.districtCode, { shouldValidate: true });
    setValue("wardCode", next.wardCode, { shouldValidate: true });
    setValue("province", next.provinceName, { shouldValidate: true });
    setValue("district", next.districtName, { shouldValidate: true });
    setValue("ward", next.wardName, { shouldValidate: true });
  };

  /** Cảnh báo async khi tọa độ trên map có vẻ lệch xã/phường đã chọn.
   *  Im lặng bỏ qua nếu reverse geocode không khả dụng (không có key, lỗi mạng). */
  const lastWarnedKeyRef = useRef<string>("");
  useEffect(() => {
    const lat = Number(String(watchedLat).trim());
    const lng = Number(String(watchedLng).trim());
    const wardName = watchedWard.trim();
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !wardName) return;

    /** Tránh spam toast: chỉ check lại khi tọa độ + ward đổi đáng kể. */
    const key = `${wardName}|${lat.toFixed(4)}|${lng.toFixed(4)}`;
    if (lastWarnedKeyRef.current === key) return;
    lastWarnedKeyRef.current = key;

    const ac = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode/reverse?${new URLSearchParams({
            lat: String(lat),
            lon: String(lng),
          })}`,
          { signal: ac.signal },
        );
        if (!res.ok) return;
        const body = extractAdminFromReversePayload(
          await res.json().catch(() => null),
        );
        if (!body) return;

        const stripPrefix = (s: string) =>
          s
            .replace(/^Tỉnh\s+/u, "")
            .replace(/^Thành phố\s+/u, "")
            .replace(/^Quận\s+/u, "")
            .replace(/^Huyện\s+/u, "")
            .replace(/^Thị xã\s+/u, "")
            .replace(/^Phường\s+/u, "")
            .replace(/^Xã\s+/u, "")
            .trim()
            .toLowerCase();

        const apiWard = stripPrefix(body.ward ?? "");
        const formWardClean = stripPrefix(wardName);
        if (apiWard && formWardClean && apiWard !== formWardClean) {
          toast.warning(
            "Vị trí trên bản đồ có vẻ không khớp xã/phường đã chọn. Kiểm tra lại trước khi lưu.",
          );
        }
      } catch {
        /* Im lặng — endpoint reverse có thể chưa cấu hình. */
      }
    }, 600);

    return () => {
      ac.abort();
      window.clearTimeout(timer);
    };
  }, [watchedLat, watchedLng, watchedWard]);

  const lastAutoGeocodeKeyRef = useRef<string>("");
  useEffect(() => {
    if (addressMode !== "dropdown") return;

    const province = watchedProvince.trim();
    const district = watchedDistrict.trim();
    const ward = watchedWard.trim();
    const detail = watchedAddressDetail.trim();

    // Chỉ auto-geocode khi user đã chọn đủ cấp hành chính.
    if (!province || !district || !ward) return;

    const q = buildGeocodeQuery({
      address: detail,
      ward,
      district,
      province,
    }).trim();
    if (!q) return;

    // Tránh gọi lặp lại cùng một địa chỉ.
    if (lastAutoGeocodeKeyRef.current === q) return;

    const timer = window.setTimeout(async () => {
      lastAutoGeocodeKeyRef.current = q;
      try {
        const params = new URLSearchParams({ q });
        let lat: number | null = null;
        let lng: number | null = null;

        const res = await fetch(`/api/vietmap/geocode?${params.toString()}`);
        if (res.ok) {
          const data = (await res.json()) as { lat?: number; lng?: number };
          const la = Number(data.lat);
          const lo = Number(data.lng);
          if (Number.isFinite(la) && Number.isFinite(lo)) {
            lat = la;
            lng = lo;
          }
        } else if (res.status === 503) {
          const alt = await geocodeVietnamAddress(q);
          if (alt) {
            lat = alt.lat;
            lng = alt.lng;
          }
        }

        // fallback nhẹ cho các trường hợp non-200 khác
        if ((lat == null || lng == null) && res.status !== 503) {
          const alt = await geocodeVietnamAddress(q).catch(() => null);
          if (alt) {
            lat = alt.lat;
            lng = alt.lng;
          }
        }

        if (lat != null && lng != null) {
          setValue("latitude", String(lat), { shouldValidate: true });
          setValue("longitude", String(lng), { shouldValidate: true });
        }
      } catch {
        // Auto-geocode chạy nền: lỗi thì im lặng, user vẫn có thể chọn bằng map/GPS.
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    addressMode,
    watchedProvince,
    watchedDistrict,
    watchedWard,
    watchedAddressDetail,
    setValue,
  ]);

  const applyMapSelection = async () => {
    const lat = Number(mapDraftLat.trim());
    const lng = Number(mapDraftLng.trim());
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error("Vui lòng chọn vị trí trên bản đồ trước khi áp dụng.");
      return;
    }

    setApplyingMap(true);
    try {
        const rv = await fetch(
          `/api/geocode/reverse?${new URLSearchParams({
          lat: String(lat),
            lon: String(lng),
        })}`,
      );
      if (!rv.ok) {
        toast.error("Không đọc được tỉnh/quận/phường từ vị trí bản đồ.");
        return;
      }
      const rev = extractAdminFromReversePayload(
        await rv.json().catch(() => null),
      );
      if (!rev) {
        toast.error("Không đọc được tỉnh/quận/phường từ vị trí bản đồ.");
        return;
      }

      const matched = await findCodesByNames(queryClient, {
        province: rev.province,
        district: rev.district,
        ward: rev.ward,
      });
      if (!matched.provinceCode || !matched.districtCode || !matched.wardCode) {
        toast.error(
          "Vị trí này chưa map được đầy đủ tỉnh/quận/phường chuẩn. Hãy kéo ghim lại hoặc chọn từ dropdown.",
        );
        return;
      }

      setValue("provinceCode", matched.provinceCode, { shouldValidate: true });
      setValue("districtCode", matched.districtCode, { shouldValidate: true });
      setValue("wardCode", matched.wardCode, { shouldValidate: true });
      setValue("province", matched.provinceName ?? "", { shouldValidate: true });
      setValue("district", matched.districtName ?? "", { shouldValidate: true });
      setValue("ward", matched.wardName ?? "", { shouldValidate: true });
      setValue("latitude", String(lat), { shouldValidate: true });
      setValue("longitude", String(lng), { shouldValidate: true });
      const currentAddressDetail = getValues("address")?.trim();
      if (!currentAddressDetail && rev.detail?.trim()) {
        setValue("address", rev.detail.trim(), { shouldValidate: true });
      }
      setMapDialogOpen(false);
      toast.success("Đã áp dụng vị trí bản đồ và đồng bộ tỉnh/quận/phường.");
    } catch {
      toast.error("Không áp dụng được vị trí bản đồ.");
    } finally {
      setApplyingMap(false);
    }
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

            <div className="space-y-3">
              <div className="inline-flex rounded-lg border border-[hsl(142,20%,88%)] bg-white p-1">
                <Button
                  type="button"
                  size="sm"
                  variant={addressMode === "dropdown" ? "default" : "ghost"}
                  className="h-8 px-3"
                  onClick={() => setAddressMode("dropdown")}
                >
                  Chọn từ danh mục
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={addressMode === "map" ? "default" : "ghost"}
                  className="h-8 px-3"
                  onClick={() => setAddressMode("map")}
                >
                  Chọn từ bản đồ
                </Button>
              </div>

              {addressMode === "dropdown" ? (
                <AddressPicker
                  value={addressValue}
                  onChange={handleAddressChange}
                  triggerClassName={farmFieldClass}
                  requiredLevel="ward"
                />
              ) : (
                <div className="rounded-lg border border-[hsl(142,20%,88%)] bg-[hsl(120,25%,98%)] p-3">
                  <p className="text-xs text-[hsl(150,8%,38%)]">
                    Dùng bản đồ để chọn vị trí farm. Khi áp dụng, hệ thống sẽ tự map
                    sang mã tỉnh/quận/phường để lưu DB và phục vụ filter/search.
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[hsl(150,14%,26%)]">
                    <span className="rounded-full bg-white px-2 py-1">
                      {addressValue.wardName || "Chưa có phường/xã"}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1">
                      {addressValue.districtName || "Chưa có quận/huyện"}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1">
                      {addressValue.provinceName || "Chưa có tỉnh/thành"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    className="mt-3 gap-2"
                    onClick={() => {
                      setMapDraftLat(String(getValues("latitude") || ""));
                      setMapDraftLng(String(getValues("longitude") || ""));
                      setMapDialogOpen(true);
                    }}
                  >
                    <MapPin className="h-4 w-4" />
                    Mở bản đồ chọn địa chỉ
                  </Button>
                </div>
              )}
            </div>

            <Input
              className={farmFieldClass}
              placeholder="Số nhà, đường (không cần ghi lại tỉnh/quận/xã)"
              {...register("address")}
            />
            <input type="hidden" {...register("latitude")} />
            <input type="hidden" {...register("longitude")} />
            {(errors.latitude || errors.longitude) && (
              <p className="text-sm text-red-600">
                Cần tọa độ hợp lệ. Hãy chọn địa chỉ bằng dropdown (auto lấy tọa độ) hoặc
                dùng nút &quot;Chọn từ bản đồ&quot;.
              </p>
            )}

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

      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[min(94vw,860px)] max-w-[min(94vw,860px)]! overflow-hidden rounded-3xl border border-[hsl(142,20%,88%)] bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-[hsl(142,20%,90%)] bg-[hsl(120,25%,98%)] px-6 py-5">
            <DialogTitle className="text-lg font-bold text-[hsl(150,16%,18%)]">
              Chọn địa chỉ farm từ bản đồ
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[13px] leading-relaxed">
              Tìm địa điểm hoặc kéo ghim đến đúng vị trí farm rồi bấm Áp dụng.
              Hệ thống sẽ tự map tỉnh/quận/phường chuẩn để lưu DB.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[68vh] overflow-auto px-6 py-5">
            <VietMapLocationPicker
              className="space-y-3 rounded-2xl border border-[hsl(142,20%,88%)] bg-[hsl(120,25%,99%)] p-3"
              latitude={mapDraftLat}
              longitude={mapDraftLng}
              onCoordinateChange={(la, lo) => {
                setMapDraftLat(String(la));
                setMapDraftLng(String(lo));
              }}
            />
            <p className="mt-3 text-xs text-[hsl(150,8%,42%)]">
              Tọa độ đang chọn:{" "}
              <span className="rounded-full bg-[hsl(120,24%,96%)] px-2.5 py-1 font-medium text-[hsl(150,16%,22%)]">
                {mapDraftLat || "—"}, {mapDraftLng || "—"}
              </span>
            </p>
          </div>

          <DialogFooter className="mx-0 mb-0 border-t border-[hsl(142,20%,90%)] bg-[hsl(120,20%,97%)] px-6 py-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setMapDialogOpen(false)}
              disabled={applyingMap}
            >
              Huỷ
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={() => void applyMapSelection()}
              disabled={applyingMap}
            >
              {applyingMap ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang áp dụng...
                </>
              ) : (
                "Áp dụng vị trí này"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

