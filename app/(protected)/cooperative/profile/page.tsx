"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, User as UserIcon } from "lucide-react";

import {
  AddressPicker,
  emptyAddressPickerValue,
  type AddressPickerValue,
} from "@/components/address/AddressPicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePatchMeMutation } from "@/hooks/useAuth";
import { buildGeocodeQuery, geocodeVietnamAddress } from "@/lib/googleGeocode";
import { cn } from "@/lib/utils";
import type { User } from "@/services/auth";
import { useAuthStore } from "@/store/useAuthStore";

const fieldClass =
  "rounded-lg border border-input focus-visible:ring-1 focus-visible:ring-ring/50";

function userToPicker(u: User | null): AddressPickerValue {
  if (!u) return emptyAddressPickerValue();
  return {
    provinceCode: u.provinceCode ?? null,
    districtCode: u.districtCode ?? null,
    wardCode: u.wardCode ?? null,
    provinceName: u.province ?? "",
    districtName: u.district ?? "",
    wardName: u.ward ?? "",
  };
}

export default function CooperativeProfilePage() {
  const user = useAuthStore((s) => s.user);
  const patchMe = usePatchMeMutation();
  const [addr, setAddr] = useState<AddressPickerValue>(() =>
    userToPicker(user),
  );
  const [contactAddress, setContactAddress] = useState(
    () => user?.contactAddress ?? "",
  );
  const [draftLat, setDraftLat] = useState<number | null>(
    () => user?.latitude ?? null,
  );
  const [draftLng, setDraftLng] = useState<number | null>(
    () => user?.longitude ?? null,
  );

  useEffect(() => {
    setAddr(userToPicker(user));
    setContactAddress(user?.contactAddress ?? "");
    setDraftLat(user?.latitude ?? null);
    setDraftLng(user?.longitude ?? null);
  }, [
    user?.id,
    user?.provinceCode,
    user?.districtCode,
    user?.wardCode,
    user?.province,
    user?.district,
    user?.ward,
    user?.contactAddress,
    user?.latitude,
    user?.longitude,
  ]);

  const lastGeoKeyRef = useRef("");
  useEffect(() => {
    const province = addr.provinceName.trim();
    const district = addr.districtName.trim();
    const ward = addr.wardName.trim();
    const detail = contactAddress.trim();
    if (!province || !district || !ward) return;

    const q = buildGeocodeQuery({
      address: detail,
      ward,
      district,
      province,
    }).trim();
    if (!q) return;
    if (lastGeoKeyRef.current === q) return;

    const timer = window.setTimeout(async () => {
      lastGeoKeyRef.current = q;
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

        if ((lat == null || lng == null) && res.status !== 503) {
          const alt = await geocodeVietnamAddress(q).catch(() => null);
          if (alt) {
            lat = alt.lat;
            lng = alt.lng;
          }
        }

        if (lat != null && lng != null) {
          setDraftLat(lat);
          setDraftLng(lng);
        }
      } catch {
        /* Geocode chạy nền */
      }
    }, 450);

    return () => window.clearTimeout(timer);
  }, [
    addr.provinceName,
    addr.districtName,
    addr.wardName,
    contactAddress,
  ]);

  const save = () => {
    const codesMatch =
      user != null &&
      addr.provinceCode === user.provinceCode &&
      addr.districtCode === user.districtCode &&
      addr.wardCode === user.wardCode;

    const latOk =
      draftLat != null && draftLng != null
        ? draftLat
        : codesMatch
          ? (user?.latitude ?? null)
          : null;
    const lngOk =
      draftLat != null && draftLng != null
        ? draftLng
        : codesMatch
          ? (user?.longitude ?? null)
          : null;

    patchMe.mutate({
      province: addr.provinceName.trim() || null,
      district: addr.districtName.trim() || null,
      ward: addr.wardName.trim() || null,
      provinceCode: addr.provinceCode,
      districtCode: addr.districtCode,
      wardCode: addr.wardCode,
      contactAddress: contactAddress.trim() || null,
      latitude:
        typeof latOk === "number" && Number.isFinite(latOk) ? latOk : null,
      longitude:
        typeof lngOk === "number" && Number.isFinite(lngOk) ? lngOk : null,
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div>
        <h1 className="text-xl font-bold text-[hsl(150,16%,12%)]">Hồ sơ HTX</h1>
        <p className="mt-1 text-sm text-[hsl(150,8%,40%)]">
          Địa chỉ trụ sở dùng để hiển thị cho nông dân và phân luồng xét duyệt chứng
          chỉ nông trại (ưu tiên HTX gần địa bàn).
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/15">
            <UserIcon className="h-7 w-7 text-[hsl(142,71%,35%)]" />
          </span>
          <div className="min-w-0 space-y-1 text-sm">
            <p className="text-lg font-semibold text-[hsl(150,10%,18%)]">
              {user?.fullName ?? "—"}
            </p>
            <p className="text-muted-foreground">{user?.email ?? "—"}</p>
            <p className="text-muted-foreground">{user?.phone ?? "—"}</p>
            <p className="text-xs text-[hsl(142,58%,32%)]">
              Vai trò: Hợp tác xã
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-3">
            <AddressPicker
              value={addr}
              onChange={(next) => {
                lastGeoKeyRef.current = "";
                setDraftLat(null);
                setDraftLng(null);
                setAddr(next);
              }}
              triggerClassName={cn(fieldClass, "bg-background")}
              requiredLevel="ward"
            />
            <p className="text-xs text-[hsl(150,8%,42%)]">
              Chọn đủ tỉnh / quận-huyện / phường-xã, nhập số nhà/đường bên dưới — hệ
              thống tự geocode tọa độ trụ sở (VietMap, có fallback).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coop-contact-address">
              Số nhà, đường (không ghi lại tỉnh/quận/xã)
            </Label>
            <Textarea
              id="coop-contact-address"
              rows={4}
              maxLength={500}
              placeholder="Ví dụ: 12/3 Nguyễn Văn Linh — hiển thị cho nông dân; tối đa 500 ký tự"
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              className="resize-y min-h-[100px]"
              autoComplete="street-address"
            />
            <p className="text-xs text-muted-foreground">
              Nội dung này hiển thị trên trang chứng chỉ của nông dân khi HTX của bạn xét duyệt.
            </p>
          </div>

          <Button
            type="button"
            disabled={patchMe.isPending}
            onClick={save}
            className="w-full sm:w-auto"
          >
            {patchMe.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu…
              </>
            ) : (
              "Lưu hồ sơ & địa chỉ"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
