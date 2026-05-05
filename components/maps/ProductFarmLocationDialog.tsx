"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ExternalLink, Loader2, MapPin, Navigation } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { PRODUCT_FARM_MAP_VIEWPORT_CLASS } from "@/lib/mapDialogViewport";
import { cn } from "@/lib/utils";

const VietMapPinPreview = dynamic(() => import("./VietMapPinPreview"), {
  ssr: false,
  loading: () => (
    <div
      className={cn(
        PRODUCT_FARM_MAP_VIEWPORT_CLASS,
        "flex items-center justify-center text-xs text-muted-foreground",
      )}
    >
      Đang tải bản đồ…
    </div>
  ),
});

const VietMapRoutePreview = dynamic(() => import("./VietMapRoutePreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin shrink-0" aria-hidden />
      Đang chuẩn bị chỉ đường…
    </div>
  ),
});

export type ProductFarmLocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Địa danh hiển thị (tỉnh/huyện…) */
  placeLabel: string;
  farmLat: number | null;
  farmLng: number | null;
  /** Tên trại / gian hàng — tiêu đề phụ */
  farmName?: string | null;
};

function googleMapsDirUrl(
  destLat: number,
  destLng: number,
  origin?: { lat: number; lng: number } | null,
) {
  const base = "https://www.google.com/maps/dir/?api=1";
  const dest = `&destination=${encodeURIComponent(`${destLat},${destLng}`)}`;
  if (origin && Number.isFinite(origin.lat) && Number.isFinite(origin.lng)) {
    return `${base}&origin=${encodeURIComponent(`${origin.lat},${origin.lng}`)}${dest}`;
  }
  return `${base}${dest}`;
}

function googleMapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function ProductFarmLocationDialog({
  open,
  onOpenChange,
  placeLabel,
  farmLat,
  farmLng,
  farmName,
}: ProductFarmLocationDialogProps) {
  const [directionsMode, setDirectionsMode] = useState(false);
  const [userOrigin, setUserOrigin] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoLoading, setGeoLoading] = useState(false);
  const [vehicle, setVehicle] = useState<"motorcycle" | "car">("motorcycle");

  const hasCoords =
    farmLat != null &&
    farmLng != null &&
    Number.isFinite(farmLat) &&
    Number.isFinite(farmLng);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDirectionsMode(false);
      setUserOrigin(null);
      setGeoLoading(false);
    }
    onOpenChange(next);
  };

  const gmapsHref = useMemo(() => {
    if (hasCoords) {
      return googleMapsDirUrl(farmLat!, farmLng!, directionsMode ? userOrigin : null);
    }
    return googleMapsSearchUrl(placeLabel || "Việt Nam");
  }, [hasCoords, farmLat, farmLng, placeLabel, directionsMode, userOrigin]);

  const requestDirections = () => {
    if (!hasCoords) return;
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        setUserOrigin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setDirectionsMode(true);
      },
      () => {
        setGeoLoading(false);
        toast.error(
          "Không lấy được vị trí của bạn. Bạn có thể mở Google Maps để chỉ đường.",
        );
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  };

  const backToPinOnly = () => {
    setDirectionsMode(false);
    setUserOrigin(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(94vh,900px)] w-[min(94vw,1024px)] max-w-[min(94vw,1024px)] flex-col gap-3 overflow-hidden p-4 sm:max-w-[min(94vw,1024px)]"
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
            Vị trí canh tác
          </DialogTitle>
          <div className="space-y-0.5 text-left text-xs text-muted-foreground">
            {farmName ? (
              <p className="text-foreground text-sm font-semibold">{farmName}</p>
            ) : null}
            <p>{placeLabel || "Đang cập nhật địa điểm."}</p>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {hasCoords && directionsMode && userOrigin ? (
            <div className="flex w-full items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Phương tiện
              </span>
              <Button
                type="button"
                variant={vehicle === "motorcycle" ? "default" : "outline"}
                size="sm"
                className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wide"
                onClick={() => setVehicle("motorcycle")}
              >
                Xe máy
              </Button>
              <Button
                type="button"
                variant={vehicle === "car" ? "default" : "outline"}
                size="sm"
                className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wide"
                onClick={() => setVehicle("car")}
              >
                Ô tô
              </Button>
            </div>
          ) : null}

          {hasCoords && !directionsMode ? (
            <VietMapPinPreview
              lat={farmLat!}
              lng={farmLng!}
              className={PRODUCT_FARM_MAP_VIEWPORT_CLASS}
            />
          ) : null}

          {hasCoords && directionsMode && userOrigin ? (
            <VietMapRoutePreview
              className="w-full"
              mapViewportClassName={PRODUCT_FARM_MAP_VIEWPORT_CLASS}
              originLat={userOrigin.lat}
              originLng={userOrigin.lng}
              destLat={farmLat!}
              destLng={farmLng!}
              vehicle={vehicle}
            />
          ) : null}

          {!hasCoords ? (
            <p className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
              Nông trại chưa ghim tọa độ GPS trên hệ thống. Bạn vẫn có thể mở Google
              Maps để xem khu vực theo địa danh.
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-3">
          {hasCoords && !directionsMode ? (
            <Button
              type="button"
              className="h-10 rounded-full font-bold uppercase tracking-wide text-[10px] gap-2"
              onClick={requestDirections}
              disabled={geoLoading}
            >
              {geoLoading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Navigation className="size-3.5" aria-hidden />
              )}
              Chỉ đường (VietMap)
            </Button>
          ) : null}
          {hasCoords && directionsMode ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full font-bold uppercase tracking-wide text-[10px]"
              onClick={backToPinOnly}
            >
              Chỉ xem vị trí trại
            </Button>
          ) : null}
          <a
            href={gmapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 rounded-full font-bold uppercase tracking-wide text-[10px] gap-2 no-underline",
            )}
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Mở Google Maps
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
