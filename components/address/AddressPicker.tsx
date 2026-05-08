"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { FancySelect, type FancyOption } from "@/components/ui/fancy-select";
import { cn } from "@/lib/utils";
import {
  fetchDistrictWithWards,
  fetchProvinceWithDistricts,
  fetchProvinces,
} from "@/lib/vietnamAddressApi";

const sortVi = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, "vi");

export type AddressPickerValue = {
  provinceCode: number | null;
  districtCode: number | null;
  wardCode: number | null;
  /** Tên snapshot - update đồng bộ với code */
  provinceName: string;
  districtName: string;
  wardName: string;
};

export const emptyAddressPickerValue = (): AddressPickerValue => ({
  provinceCode: null,
  districtCode: null,
  wardCode: null,
  provinceName: "",
  districtName: "",
  wardName: "",
});

type Props = {
  value: AddressPickerValue;
  onChange: (next: AddressPickerValue) => void;
  /** Cấp tối thiểu user phải chọn (dùng cho UX hint, không bắt buộc validate ở component này). */
  requiredLevel?: "province" | "district" | "ward";
  /** Khi true, hiển thị "Tất cả ..." là option mặc định (dùng cho filter). */
  allowEmpty?: boolean;
  /** Thêm class cho 3 trigger select. */
  triggerClassName?: string;
  /** Hiển thị label phía trên select (mặc định bật). */
  showLabels?: boolean;
};

export function AddressPicker({
  value,
  onChange,
  requiredLevel,
  allowEmpty = false,
  triggerClassName,
  showLabels = true,
}: Props) {
  const provincesQuery = useQuery({
    queryKey: ["vn-address", "provinces"],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const provincesSorted = useMemo(
    () => [...(provincesQuery.data ?? [])].sort(sortVi),
    [provincesQuery.data],
  );

  const districtsQuery = useQuery({
    queryKey: ["vn-address", "districts", value.provinceCode],
    queryFn: () => fetchProvinceWithDistricts(value.provinceCode!),
    enabled: value.provinceCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const districtsSorted = useMemo(
    () => [...(districtsQuery.data?.districts ?? [])].sort(sortVi),
    [districtsQuery.data],
  );

  const wardsQuery = useQuery({
    queryKey: ["vn-address", "wards", value.districtCode],
    queryFn: () => fetchDistrictWithWards(value.districtCode!),
    enabled: value.districtCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const wardsSorted = useMemo(
    () => [...(wardsQuery.data?.wards ?? [])].sort(sortVi),
    [wardsQuery.data],
  );

  const provinceOptions: FancyOption[] = useMemo(
    () => provincesSorted.map((p) => ({ value: String(p.code), label: p.name })),
    [provincesSorted],
  );
  const districtOptions: FancyOption[] = useMemo(
    () => districtsSorted.map((d) => ({ value: String(d.code), label: d.name })),
    [districtsSorted],
  );
  const wardOptions: FancyOption[] = useMemo(
    () => wardsSorted.map((w) => ({ value: String(w.code), label: w.name })),
    [wardsSorted],
  );

  const loadingProvinces = provincesQuery.isLoading;
  const loadingDistricts =
    value.provinceCode != null && districtsQuery.isLoading;
  const loadingWards = value.districtCode != null && wardsQuery.isLoading;

  const baseTrigger = cn(
    "h-11 min-h-11 w-full min-w-0 rounded-lg border-[hsl(142,20%,88%)] bg-[hsl(120,25%,98%)] py-2.5 shadow-sm",
    "hover:border-[hsl(142,50%,72%)] hover:bg-[hsl(120,30%,99%)]",
    triggerClassName,
  );

  const handleProvinceChange = (raw: string) => {
    if (!raw) {
      onChange({
        provinceCode: null,
        districtCode: null,
        wardCode: null,
        provinceName: "",
        districtName: "",
        wardName: "",
      });
      return;
    }
    const code = Number(raw);
    const p = provincesSorted.find((x) => x.code === code);
    onChange({
      provinceCode: code,
      districtCode: null,
      wardCode: null,
      provinceName: p?.name ?? "",
      districtName: "",
      wardName: "",
    });
  };

  const handleDistrictChange = (raw: string) => {
    if (!raw) {
      onChange({
        ...value,
        districtCode: null,
        wardCode: null,
        districtName: "",
        wardName: "",
      });
      return;
    }
    const code = Number(raw);
    const d = districtsSorted.find((x) => x.code === code);
    onChange({
      ...value,
      districtCode: code,
      wardCode: null,
      districtName: d?.name ?? "",
      wardName: "",
    });
  };

  const handleWardChange = (raw: string) => {
    if (!raw) {
      onChange({ ...value, wardCode: null, wardName: "" });
      return;
    }
    const code = Number(raw);
    const w = wardsSorted.find((x) => x.code === code);
    onChange({ ...value, wardCode: code, wardName: w?.name ?? "" });
  };

  const provincePlaceholder = loadingProvinces
    ? "Đang tải danh mục…"
    : allowEmpty
      ? "Tất cả tỉnh / thành"
      : "Chọn tỉnh / thành phố";

  const districtPlaceholder =
    value.provinceCode == null
      ? "Chọn tỉnh trước"
      : loadingDistricts
        ? "Đang tải quận/huyện…"
        : allowEmpty
          ? "Tất cả quận / huyện"
          : "Chọn quận / huyện";

  const wardPlaceholder =
    value.districtCode == null
      ? "Chọn quận/huyện trước"
      : loadingWards
        ? "Đang tải phường/xã…"
        : allowEmpty
          ? "Tất cả phường / xã"
          : "Chọn phường / xã";

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-4">
        <div className="min-w-0 w-full space-y-1.5">
          {showLabels && (
            <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
              Tỉnh / Thành phố
              {requiredLevel && <span className="text-destructive"> *</span>}
            </label>
          )}
          <FancySelect
            className={baseTrigger}
            listMaxHeightClassName="max-h-72"
            disabled={loadingProvinces}
            placeholder={provincePlaceholder}
            value={value.provinceCode != null ? String(value.provinceCode) : ""}
            options={provinceOptions}
            onChange={handleProvinceChange}
          />
        </div>

        <div className="min-w-0 w-full space-y-1.5">
          {showLabels && (
            <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
              Quận / Huyện
              {(requiredLevel === "district" || requiredLevel === "ward") && (
                <span className="text-destructive"> *</span>
              )}
            </label>
          )}
          <FancySelect
            className={baseTrigger}
            listMaxHeightClassName="max-h-72"
            disabled={value.provinceCode == null || loadingDistricts}
            placeholder={districtPlaceholder}
            value={value.districtCode != null ? String(value.districtCode) : ""}
            options={districtOptions}
            onChange={handleDistrictChange}
          />
        </div>

        <div className="space-y-1.5">
          {showLabels && (
            <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
              Phường / Xã
              {requiredLevel === "ward" && (
                <span className="text-destructive"> *</span>
              )}
            </label>
          )}
          <FancySelect
            className={baseTrigger}
            listMaxHeightClassName="max-h-80"
            disabled={value.districtCode == null || loadingWards}
            placeholder={wardPlaceholder}
            value={value.wardCode != null ? String(value.wardCode) : ""}
            options={wardOptions}
            onChange={handleWardChange}
          />
        </div>
      </div>

      {provincesQuery.isError && (
        <p className="text-xs text-destructive">
          Không tải được danh mục tỉnh thành. Kiểm tra mạng hoặc thử lại sau.
        </p>
      )}
    </div>
  );
}
