"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { FancySelect, type FancyOption } from "@/components/ui/fancy-select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  fetchDistrictWithWards,
  fetchProvinceWithDistricts,
  fetchProvinces,
} from "@/lib/vietnamAddressApi";

const sortVi = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name, "vi");

export type MarketplaceLocationValue = {
  province?: string;
  district?: string;
  ward?: string;
};

type Props = {
  onChange: (v: MarketplaceLocationValue) => void;
  className?: string;
};

export function MarketplaceLocationFilters({
  onChange,
  className,
}: Props) {
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [wardCode, setWardCode] = useState<number | null>(null);

  const provincesQuery = useQuery({
    queryKey: ["vn-address", "provinces"],
    queryFn: fetchProvinces,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const provincesSorted = useMemo(() => {
    const list = provincesQuery.data ?? [];
    return [...list].sort(sortVi);
  }, [provincesQuery.data]);

  const districtsQuery = useQuery({
    queryKey: ["vn-address", "districts", provinceCode],
    queryFn: () => fetchProvinceWithDistricts(provinceCode!),
    enabled: provinceCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const districtsSorted = useMemo(() => {
    const list = districtsQuery.data?.districts ?? [];
    return [...list].sort(sortVi);
  }, [districtsQuery.data]);

  const wardsQuery = useQuery({
    queryKey: ["vn-address", "wards", districtCode],
    queryFn: () => fetchDistrictWithWards(districtCode!),
    enabled: districtCode != null,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const wardsSorted = useMemo(() => {
    const list = wardsQuery.data?.wards ?? [];
    return [...list].sort(sortVi);
  }, [wardsQuery.data]);

  const filterPayload = useMemo((): MarketplaceLocationValue => {
    const province =
      provinceCode != null
        ? provincesSorted.find((p) => p.code === provinceCode)?.name
        : undefined;
    const district =
      districtCode != null
        ? districtsSorted.find((d) => d.code === districtCode)?.name
        : undefined;
    const ward =
      wardCode != null
        ? wardsSorted.find((w) => w.code === wardCode)?.name
        : undefined;
    const out: MarketplaceLocationValue = {};
    if (province) out.province = province;
    if (district) out.district = district;
    if (ward) out.ward = ward;
    return out;
  }, [
    provinceCode,
    districtCode,
    wardCode,
    provincesSorted,
    districtsSorted,
    wardsSorted,
  ]);

  useEffect(() => {
    onChange(filterPayload);
  }, [filterPayload, onChange]);

  const loadingProvinces = provincesQuery.isLoading;
  const loadingDistricts =
    provinceCode != null && districtsQuery.isLoading;
  const loadingWards = districtCode != null && wardsQuery.isLoading;

  const provinceOptions: FancyOption[] = useMemo(
    () => [
      { value: "", label: "Tất cả tỉnh/thành" },
      ...provincesSorted.map((p) => ({
        value: String(p.code),
        label: p.name,
      })),
    ],
    [provincesSorted],
  );

  const districtOptions: FancyOption[] = useMemo(
    () => [
      { value: "", label: "Tất cả quận/huyện" },
      ...districtsSorted.map((d) => ({
        value: String(d.code),
        label: d.name,
      })),
    ],
    [districtsSorted],
  );

  const wardOptions: FancyOption[] = useMemo(
    () => [
      { value: "", label: "Tất cả phường/xã" },
      ...wardsSorted.map((w) => ({
        value: String(w.code),
        label: w.name,
      })),
    ],
    [wardsSorted],
  );

  const triggerClass = cn(
    "h-10 min-h-10 rounded-md border border-input bg-background py-2 text-sm shadow-sm",
    "hover:bg-accent/50",
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <Label className="text-xs">Tỉnh / Thành phố</Label>
        <FancySelect
          className={triggerClass}
          listMaxHeightClassName="max-h-72"
          disabled={loadingProvinces}
          placeholder={
            loadingProvinces ? "Đang tải…" : "Chọn tỉnh / thành phố"
          }
          value={provinceCode != null ? String(provinceCode) : ""}
          options={provinceOptions}
          onChange={(v) => {
            if (!v) {
              setProvinceCode(null);
              setDistrictCode(null);
              setWardCode(null);
              return;
            }
            setProvinceCode(Number(v));
            setDistrictCode(null);
            setWardCode(null);
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Quận / Huyện</Label>
          <FancySelect
            className={triggerClass}
            listMaxHeightClassName="max-h-72"
            disabled={provinceCode == null || loadingDistricts}
            placeholder={
              provinceCode == null
                ? "Chọn tỉnh trước"
                : loadingDistricts
                  ? "Đang tải…"
                  : "Chọn quận / huyện"
            }
            value={districtCode != null ? String(districtCode) : ""}
            options={districtOptions}
            onChange={(v) => {
              if (!v) {
                setDistrictCode(null);
                setWardCode(null);
                return;
              }
              setDistrictCode(Number(v));
              setWardCode(null);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Phường / Xã</Label>
          <FancySelect
            className={triggerClass}
            listMaxHeightClassName="max-h-80"
            disabled={districtCode == null || loadingWards}
            placeholder={
              districtCode == null
                ? "Chọn quận/huyện trước"
                : loadingWards
                  ? "Đang tải…"
                  : "Chọn phường / xã"
            }
            value={wardCode != null ? String(wardCode) : ""}
            options={wardOptions}
            onChange={(v) => {
              if (!v) {
                setWardCode(null);
                return;
              }
              setWardCode(Number(v));
            }}
          />
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Danh mục theo dữ liệu mở provinces.open-api.vn — trùng với form địa chỉ
        nông trại để lọc khớp dữ liệu đã lưu.
      </p>

      {provincesQuery.isError && (
        <p className="text-xs text-destructive">
          Không tải được danh mục tỉnh thành. Kiểm tra mạng hoặc thử lại sau.
        </p>
      )}
    </div>
  );
}
