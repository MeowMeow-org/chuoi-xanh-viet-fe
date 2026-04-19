"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UseFormSetValue, UseFormWatch } from "react-hook-form";

import { FancySelect, type FancyOption } from "@/components/ui/fancy-select";
import { cn } from "@/lib/utils";
import type { FarmFormValues } from "@/components/farmer/farm-form-types";
import {
  fetchDistrictWithWards,
  fetchProvinceWithDistricts,
  fetchProvinces,
} from "@/lib/vietnamAddressApi";

const sortVi = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, "vi");

type Props = {
  watch: UseFormWatch<FarmFormValues>;
  setValue: UseFormSetValue<FarmFormValues>;
  fieldClassName: string;
};

export function VietnamAddressFields({
  watch,
  setValue,
  fieldClassName,
}: Props) {
  const provinceName = (watch("province") ?? "").trim();
  const districtName = (watch("district") ?? "").trim();
  const wardName = (watch("ward") ?? "").trim();

  const provincesQuery = useQuery({
    queryKey: ["vn-address", "provinces"],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const provincesSorted = useMemo(() => {
    const list = provincesQuery.data ?? [];
    return [...list].sort(sortVi);
  }, [provincesQuery.data]);

  const selectedProvinceCode = useMemo(() => {
    const p = provincesSorted.find((x) => x.name === provinceName);
    return p?.code ?? null;
  }, [provincesSorted, provinceName]);

  const districtsQuery = useQuery({
    queryKey: ["vn-address", "districts", selectedProvinceCode],
    queryFn: () => fetchProvinceWithDistricts(selectedProvinceCode!),
    enabled: selectedProvinceCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const districtsSorted = useMemo(() => {
    const list = districtsQuery.data?.districts ?? [];
    return [...list].sort(sortVi);
  }, [districtsQuery.data]);

  const selectedDistrictCode = useMemo(() => {
    const d = districtsSorted.find((x) => x.name === districtName);
    return d?.code ?? null;
  }, [districtsSorted, districtName]);

  const wardsQuery = useQuery({
    queryKey: ["vn-address", "wards", selectedDistrictCode],
    queryFn: () => fetchDistrictWithWards(selectedDistrictCode!),
    enabled: selectedDistrictCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const wardsSorted = useMemo(() => {
    const list = wardsQuery.data?.wards ?? [];
    return [...list].sort(sortVi);
  }, [wardsQuery.data]);

  const loadingProvinces = provincesQuery.isLoading;
  const loadingDistricts =
    selectedProvinceCode != null && districtsQuery.isLoading;
  const loadingWards = selectedDistrictCode != null && wardsQuery.isLoading;

  const provinceOptions: FancyOption[] = useMemo(
    () =>
      provincesSorted.map((p) => ({
        value: String(p.code),
        label: p.name,
      })),
    [provincesSorted],
  );

  const districtOptions: FancyOption[] = useMemo(
    () =>
      districtsSorted.map((d) => ({
        value: String(d.code),
        label: d.name,
      })),
    [districtsSorted],
  );

  const wardOptions: FancyOption[] = useMemo(
    () =>
      wardsSorted.map((w) => ({
        value: String(w.code),
        label: w.name,
      })),
    [wardsSorted],
  );

  const triggerClass = cn(
    "h-11 min-h-11 w-full min-w-0 rounded-lg border-[hsl(142,20%,88%)] bg-[hsl(120,25%,98%)] py-2.5 shadow-sm",
    "hover:border-[hsl(142,50%,72%)] hover:bg-[hsl(120,30%,99%)]",
    fieldClassName,
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-x-4">
        <div className="min-w-0 w-full space-y-1.5">
          <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
            Tỉnh / Thành phố
          </label>
          <FancySelect
            className={triggerClass}
            listMaxHeightClassName="max-h-72"
            disabled={loadingProvinces}
            placeholder={
              loadingProvinces ? "Đang tải danh mục…" : "Chọn tỉnh / thành phố"
            }
            value={
              selectedProvinceCode != null ? String(selectedProvinceCode) : ""
            }
            options={provinceOptions}
            onChange={(v) => {
              if (!v) {
                setValue("province", "", { shouldValidate: true });
                setValue("district", "", { shouldValidate: true });
                setValue("ward", "", { shouldValidate: true });
                return;
              }
              const code = Number(v);
              const p = provincesSorted.find((x) => x.code === code);
              setValue("province", p?.name ?? "", { shouldValidate: true });
              setValue("district", "", { shouldValidate: true });
              setValue("ward", "", { shouldValidate: true });
            }}
          />
        </div>

        <div className="min-w-0 w-full space-y-1.5">
          <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
            Quận / Huyện
          </label>
          <FancySelect
            className={triggerClass}
            listMaxHeightClassName="max-h-72"
            disabled={selectedProvinceCode == null || loadingDistricts}
            placeholder={
              selectedProvinceCode == null
                ? "Chọn tỉnh trước"
                : loadingDistricts
                  ? "Đang tải quận/huyện…"
                  : "Chọn quận / huyện"
            }
            value={
              selectedDistrictCode != null ? String(selectedDistrictCode) : ""
            }
            options={districtOptions}
            onChange={(v) => {
              if (!v) {
                setValue("district", "", { shouldValidate: true });
                setValue("ward", "", { shouldValidate: true });
                return;
              }
              const code = Number(v);
              const d = districtsSorted.find((x) => x.code === code);
              setValue("district", d?.name ?? "", { shouldValidate: true });
              setValue("ward", "", { shouldValidate: true });
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[hsl(150,10%,35%)]">
            Phường / Xã
          </label>
          <FancySelect
            className={triggerClass}
            listMaxHeightClassName="max-h-80"
            disabled={selectedDistrictCode == null || loadingWards}
            placeholder={
              selectedDistrictCode == null
                ? "Chọn quận/huyện trước"
                : loadingWards
                  ? "Đang tải phường/xã…"
                  : "Chọn phường / xã"
            }
            value={
              wardName && wardsSorted.some((w) => w.name === wardName)
                ? String(wardsSorted.find((w) => w.name === wardName)!.code)
                : ""
            }
            options={wardOptions}
            onChange={(v) => {
              if (!v) {
                setValue("ward", "", { shouldValidate: true });
                return;
              }
              const code = Number(v);
              const w = wardsSorted.find((x) => x.code === code);
              setValue("ward", w?.name ?? "", { shouldValidate: true });
            }}
          />
        </div>
      </div>
      {provinceName &&
        provincesQuery.isSuccess &&
        selectedProvinceCode == null && (
          <p className="text-xs text-amber-700">
            Tỉnh đang lưu (“{provinceName}”) không khớp danh mục — chọn lại tỉnh
            để chuẩn hóa.
          </p>
        )}
      {districtName &&
        districtsQuery.isSuccess &&
        selectedProvinceCode != null &&
        selectedDistrictCode == null && (
          <p className="text-xs text-amber-700">
            Quận/huyện đang lưu (“{districtName}”) không khớp — chọn lại.
          </p>
        )}
      {wardName &&
        wardsQuery.isSuccess &&
        selectedDistrictCode != null &&
        !wardsSorted.some((w) => w.name === wardName) && (
          <p className="text-xs text-amber-700">
            Phường/xã đang lưu (“{wardName}”) không khớp — chọn lại.
          </p>
        )}
      {provincesQuery.isError && (
        <p className="text-xs text-destructive">
          Không tải được danh mục tỉnh thành. Kiểm tra mạng hoặc thử lại sau.
        </p>
      )}
    </div>
  );
}
