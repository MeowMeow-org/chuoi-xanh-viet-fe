"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, Map } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shopService } from "@/services/shop/shopService";
import type { FarmMapPin } from "@/services/shop";
import type { VietMapFarmersPin } from "@/components/maps/VietMapFarmersMap";
import {
  FARMER_MAP_MARKER_UNVERIFIED_COLOR,
  FARMER_MAP_MARKER_VERIFIED_COLOR,
} from "@/components/maps/farmerMapMarkerColors";

const VietMapFarmersMap = dynamic(() => import("./VietMapFarmersMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(60vh,560px)] min-h-[320px] w-full items-center justify-center rounded-lg border border-[hsl(142,18%,88%)] bg-muted text-xs text-muted-foreground">
      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
      Đang tải bản đồ…
    </div>
  ),
});

export type ConsumerFarmersMapDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Lọc theo tỉnh chợ (giống trang chủ) */
  province?: string | null;
};

function toPins(items: FarmMapPin[]): VietMapFarmersPin[] {
  return items.map((row) => {
    const place =
      row.province != null
        ? `${row.district ? `${row.district}, ` : ""}${row.province}`
        : undefined;
    return {
      shopId: row.shop_id,
      shopName: row.shop_name,
      farmName: row.farm_name,
      lat: row.latitude,
      lng: row.longitude,
      placeLabel: place,
      isVerified: row.is_verified,
    };
  });
}

/** Hình ghim minh họa cho chú giải (cùng màu với VietMap Marker) */
function FarmerMapLegendPin({ color }: { color: string }) {
  return (
    <svg
      width={18}
      height={22}
      viewBox="0 0 24 32"
      className="shrink-0 drop-shadow-sm"
      aria-hidden
    >
      <path
        fill={color}
        d="M12 2.5c-4.64 0-8.25 3.74-8.25 8.33 0 6.22 8.25 16.42 8.25 16.42s8.25-10.2 8.25-16.42c0-4.59-3.61-8.33-8.25-8.33z"
      />
      <circle cx="12" cy="10.3" r="3" fill="white" />
    </svg>
  );
}

export default function ConsumerFarmersMapDialog({
  open,
  onOpenChange,
  province,
}: ConsumerFarmersMapDialogProps) {
  const router = useRouter();
  const prevOpenRef = useRef(false);
  const [mapInstanceKey, setMapInstanceKey] = useState(0);

  useLayoutEffect(() => {
    if (open && !prevOpenRef.current) {
      setMapInstanceKey((k) => k + 1);
    }
    prevOpenRef.current = open;
  }, [open]);

  const handleShopNavigate = useCallback(
    (shopId: string) => {
      onOpenChange(false);
      router.push(`/shop/${shopId}`);
    },
    [onOpenChange, router],
  );

  const query = useQuery({
    queryKey: ["farm-map-pins", province ?? "all"],
    queryFn: () =>
      shopService.getFarmMapPins(
        province?.trim()
          ? { province: province.trim() }
          : undefined,
      ),
    enabled: open,
    staleTime: 60_000,
  });

  const pins = useMemo(
    () => (query.data ? toPins(query.data.items) : []),
    [query.data],
  );
  const total = query.data?.total ?? 0;

  const dialogTitle =
    query.isLoading || query.isError
      ? "Bản đồ nông hộ"
      : `Bản đồ nông hộ (${total} nông trại)`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(94vh,900px)] w-[min(94vw,1024px)] max-w-[min(94vw,1024px)] flex-col gap-3 overflow-hidden p-4 sm:max-w-[min(94vw,1024px)]"
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle className="flex items-center gap-2">
            <Map className="size-4 shrink-0 text-primary" aria-hidden />
            {dialogTitle}
          </DialogTitle>
          <div className="space-y-2 pr-0 text-left">
            <p className="text-xs text-muted-foreground">
              {province?.trim()
                ? `Đang lọc theo tỉnh: ${province.trim()}. `
                : "Toàn quốc. "}
              Bấm ghim để xem gian hàng và mở chỉ đường.
            </p>
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs"
              aria-label="Chú giải màu ghim"
            >
              <span className="inline-flex items-center gap-1.5 text-foreground/90">
                <FarmerMapLegendPin color={FARMER_MAP_MARKER_VERIFIED_COLOR} />
                <span>Đã xác minh</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground/90">
                <FarmerMapLegendPin
                  color={FARMER_MAP_MARKER_UNVERIFIED_COLOR}
                />
                <span>Chưa xác minh</span>
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {query.isLoading ? (
            <div className="flex h-[min(60vh,560px)] min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
              Đang tải danh sách…
            </div>
          ) : query.isError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-4 text-sm text-destructive">
              Không tải được dữ liệu bản đồ. Thử lại sau.
            </div>
          ) : total === 0 ? (
            <div className="flex h-[min(60vh,560px)] min-h-[320px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 px-4 text-center text-sm text-muted-foreground">
              <p>Chưa có nông hộ nào ghim tọa độ GPS trên hệ thống.</p>
              <p className="text-xs">
                Nông hộ có thể cập nhật vị trí trại trong mục quản lý gian hàng.
              </p>
            </div>
          ) : (
            open ? (
              <VietMapFarmersMap
                key={mapInstanceKey}
                pins={pins}
                onShopNavigate={handleShopNavigate}
              />
            ) : null
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
