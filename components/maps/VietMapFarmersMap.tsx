"use client";

import { useEffect, useRef } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import { setWorkerUrl } from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

import { isVietmapClientEnabled } from "@/lib/vietmapClientEnabled";
import { PRODUCT_FARM_MAP_VIEWPORT_CLASS } from "@/lib/mapDialogViewport";
import { proxyUrlForVietmapHttpsUrl } from "@/lib/vietmapProxyUrl";
import { cn } from "@/lib/utils";
import {
  FARMER_MAP_MARKER_UNVERIFIED_COLOR,
  FARMER_MAP_MARKER_VERIFIED_COLOR,
} from "@/components/maps/farmerMapMarkerColors";

export type VietMapFarmersPin = {
  shopId: string;
  shopName: string;
  farmName: string;
  lat: number;
  lng: number;
  placeLabel?: string;
  isVerified?: boolean;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function googleMapsDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
}

export type VietMapFarmersMapProps = {
  pins: VietMapFarmersPin[];
  className?: string;
  /** Đóng dialog / dọn map trước khi chuyển trang — tránh WebGL treo sau Back. */
  onShopNavigate?: (shopId: string) => void;
};

export default function VietMapFarmersMap({
  pins,
  className,
  onShopNavigate,
}: VietMapFarmersMapProps) {
  const enabled = isVietmapClientEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<vietmapgl.Marker[]>([]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const valid = pins.filter(
      (p) =>
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        Math.abs(p.lat) <= 90 &&
        Math.abs(p.lng) <= 180,
    );
    if (valid.length === 0) return;

    const container = containerRef.current;
    let cancelled = false;
    let map: vietmapgl.Map | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const tearDown = () => {
      resizeObserver?.disconnect();
      resizeObserver = null;
      for (const m of markersRef.current) {
        try {
          m.remove();
        } catch {
          /* noop */
        }
      }
      markersRef.current = [];
      try {
        map?.remove();
      } catch {
        /* noop */
      }
      map = null;
    };

    const first = valid[0]!;
    const startId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !containerRef.current || containerRef.current !== container)
          return;

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        setWorkerUrl(`${window.location.origin}/vietmap-gl-csp-worker.js`);
        const styleUrl = `${window.location.origin}/api/vietmap/style?v=tm&t=${Date.now()}`;

        map = new vietmapgl.Map({
          container,
          style: styleUrl,
          center: [first.lng, first.lat],
          zoom: valid.length === 1 ? 12 : 6,
          transformRequest: (url: string) => ({
            url: proxyUrlForVietmapHttpsUrl(window.location.origin, url),
          }),
        });

        map.addControl(new vietmapgl.NavigationControl(), "top-right");

        resizeObserver = new ResizeObserver(() => {
          map?.resize();
        });
        resizeObserver.observe(container);

        map.once("load", () => {
          map?.resize();
          if (!map || cancelled) return;

          const origin = window.location.origin;

          for (const p of valid) {
            const marker = new vietmapgl.Marker({
              color: p.isVerified
                ? FARMER_MAP_MARKER_VERIFIED_COLOR
                : FARMER_MAP_MARKER_UNVERIFIED_COLOR,
            })
              .setLngLat([p.lng, p.lat])
              .addTo(map!);

            const loc =
              p.placeLabel?.trim() ||
              [p.farmName, p.shopName].filter(Boolean).join(" · ");
            const shopLinkHtml = onShopNavigate
              ? `<a href="#" data-farm-shop-link="1" data-shop-id="${escapeHtml(p.shopId)}" style="color:${FARMER_MAP_MARKER_VERIFIED_COLOR};font-weight:600;cursor:pointer">Xem gian hàng →</a>`
              : `<a href="${origin}/shop/${encodeURIComponent(p.shopId)}" style="color:${FARMER_MAP_MARKER_VERIFIED_COLOR};font-weight:600">Xem gian hàng →</a>`;
            const directionsUrl = googleMapsDirectionsUrl(p.lat, p.lng);
            const directionsHtml = `<a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="color:#0369a1;font-weight:600">Chỉ đường →</a>`;
            const html = `
<div style="padding:2px 0;min-width:160px;max-width:260px;font-size:12px;line-height:1.35">
  <div style="font-weight:700;margin-bottom:4px">${escapeHtml(p.shopName)}</div>
  ${loc ? `<div style="opacity:.85;margin-bottom:6px">${escapeHtml(loc)}</div>` : ""}
  <div style="display:flex;flex-direction:column;gap:6px">${shopLinkHtml}${directionsHtml}</div>
</div>`;
            const popup = new vietmapgl.Popup({ offset: 20 }).setHTML(html);
            marker.setPopup(popup);
            if (onShopNavigate) {
              popup.on("open", () => {
                const root = popup.getElement();
                const a = root?.querySelector<HTMLAnchorElement>(
                  "a[data-farm-shop-link][data-shop-id]",
                );
                if (!a) return;
                const sid = a.getAttribute("data-shop-id");
                if (!sid) return;
                const onClick = (e: MouseEvent) => {
                  e.preventDefault();
                  onShopNavigate(sid);
                };
                a.addEventListener("click", onClick, { once: true });
              });
            }
            markersRef.current.push(marker);
          }

          if (valid.length === 1) {
            map!.flyTo({
              center: [valid[0]!.lng, valid[0]!.lat],
              zoom: 12,
              duration: 600,
            });
          } else {
            const b = new vietmapgl.LngLatBounds(
              [valid[0]!.lng, valid[0]!.lat],
              [valid[0]!.lng, valid[0]!.lat],
            );
            for (const p of valid) b.extend([p.lng, p.lat]);
            map!.fitBounds(b, { padding: 72, duration: 500, maxZoom: 11 });
          }
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      queueMicrotask(tearDown);
    };
  }, [enabled, pins, onShopNavigate]);

  if (!enabled) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Chưa bật VietMap trên client (
        <code className="text-[10px]">NEXT_PUBLIC_VIETMAP_ENABLED</code>).
      </p>
    );
  }

  if (
    pins.length === 0 ||
    !pins.some(
      (p) =>
        Number.isFinite(p.lat) &&
        Number.isFinite(p.lng) &&
        Math.abs(p.lat) <= 90 &&
        Math.abs(p.lng) <= 180,
    )
  ) {
    return (
      <div
        className={cn(
          PRODUCT_FARM_MAP_VIEWPORT_CLASS,
          "flex items-center justify-center text-xs text-muted-foreground",
          className,
        )}
      >
        Không có điểm hợp lệ để hiển thị.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(PRODUCT_FARM_MAP_VIEWPORT_CLASS, className)}
    />
  );
}
