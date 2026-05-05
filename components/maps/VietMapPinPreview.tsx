"use client";

import { useEffect, useRef } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import { setWorkerUrl } from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";

import { VIETMAP_DEFAULT_CENTER } from "@/lib/vietmapStyle";
import { isVietmapClientEnabled } from "@/lib/vietmapClientEnabled";
import { MAP_DIALOG_VIEWPORT_CLASS } from "@/lib/mapDialogViewport";
import { proxyUrlForVietmapHttpsUrl } from "@/lib/vietmapProxyUrl";
import { cn } from "@/lib/utils";

export type VietMapPinPreviewProps = {
  lat: number;
  lng: number;
  markerColor?: string;
  className?: string;
};

export default function VietMapPinPreview({
  lat,
  lng,
  markerColor = "#15803d",
  className,
}: VietMapPinPreviewProps) {
  const enabled = isVietmapClientEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const markerRef = useRef<vietmapgl.Marker | null>(null);

  useEffect(() => {
    if (
      !enabled ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      !containerRef.current
    ) {
      return;
    }

    const container = containerRef.current;
    let cancelled = false;
    let map: vietmapgl.Map | null = null;
    let marker: vietmapgl.Marker | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const tearDown = () => {
      resizeObserver?.disconnect();
      resizeObserver = null;
      try {
        marker?.remove();
      } catch {
        /* noop */
      }
      marker = null;
      try {
        map?.remove();
      } catch {
        /* noop */
      }
      map = null;
      mapRef.current = null;
      markerRef.current = null;
    };

    const startId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !containerRef.current || containerRef.current !== container)
          return;

        setWorkerUrl(`${window.location.origin}/vietmap-gl-csp-worker.js`);

        const styleUrl = `${window.location.origin}/api/vietmap/style?v=tm&t=${Date.now()}`;

        map = new vietmapgl.Map({
          container,
          style: styleUrl,
          center: Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : VIETMAP_DEFAULT_CENTER,
          zoom: 14,
          transformRequest: (url: string) => ({
            url: proxyUrlForVietmapHttpsUrl(window.location.origin, url),
          }),
        });

        map.addControl(new vietmapgl.NavigationControl(), "top-right");

        resizeObserver = new ResizeObserver(() => {
          map?.resize();
        });
        resizeObserver.observe(container);

        marker = new vietmapgl.Marker({ color: markerColor }).setLngLat([lng, lat]);

        map.once("load", () => {
          map?.resize();
          if (!map || cancelled) return;
          marker!.setLngLat([lng, lat]);
          marker!.addTo(map);
          map.jumpTo({ center: [lng, lat], zoom: 14 });
          mapRef.current = map;
          markerRef.current = marker;
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      queueMicrotask(tearDown);
    };
  }, [enabled, lat, lng, markerColor]);

  if (!enabled) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Chưa bật VietMap trên client (
        <code className="text-[10px]">NEXT_PUBLIC_VIETMAP_ENABLED</code>).
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(MAP_DIALOG_VIEWPORT_CLASS, className)}
    />
  );
}
