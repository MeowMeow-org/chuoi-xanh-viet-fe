"use client";

import { useEffect, useRef, useState } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import { setWorkerUrl } from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import { Loader2 } from "lucide-react";

import { VIETMAP_DEFAULT_CENTER } from "@/lib/vietmapStyle";
import { isVietmapClientEnabled } from "@/lib/vietmapClientEnabled";
import { MAP_DIALOG_VIEWPORT_CLASS } from "@/lib/mapDialogViewport";
import { proxyUrlForVietmapHttpsUrl } from "@/lib/vietmapProxyUrl";
import { cn } from "@/lib/utils";

const ROUTE_SOURCE_ID = "consumer-route-line";
const ROUTE_LAYER_ID = "consumer-route-line-layer";

export type VietMapRoutePreviewProps = {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  vehicle?: "car" | "motorcycle";
  className?: string;
  /** Khung canvas bản đồ (mặc định MAP_DIALOG_VIEWPORT_CLASS). */
  mapViewportClassName?: string;
};

type RoutePayload = {
  coordinates: [number, number][];
  distanceM: number | null;
  timeMs: number | null;
  bbox: [number, number, number, number] | null;
  instructions: Array<{
    text: string;
    distanceM: number | null;
    timeMs: number | null;
    streetName: string | null;
  }>;
};

export default function VietMapRoutePreview({
  originLat,
  originLng,
  destLat,
  destLng,
  vehicle = "motorcycle",
  className,
  mapViewportClassName,
}: VietMapRoutePreviewProps) {
  const enabled = isVietmapClientEnabled();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const markersRef = useRef<vietmapgl.Marker[]>([]);

  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [route, setRoute] = useState<RoutePayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();

    async function loadRoute() {
      setRouteLoading(true);
      setRouteError(null);
      setRoute(null);
      try {
        if (
          !Number.isFinite(originLat) ||
          !Number.isFinite(originLng) ||
          !Number.isFinite(destLat) ||
          !Number.isFinite(destLng)
        ) {
          throw new Error("Thiếu tọa độ điểm xuất phát hoặc đích.");
        }
        if (originLat === 0 && originLng === 0) {
          throw new Error(
            "Vị trí của bạn chưa hợp lệ (0,0). Hãy bật định vị chính xác hơn hoặc mở Google Maps.",
          );
        }
        if (destLat === 0 && destLng === 0) {
          throw new Error(
            "Trại chưa có tọa độ GPS hợp lệ trên hệ thống (thường là 0,0). Vui lòng nông hộ cập nhật/ghim lại vị trí trại.",
          );
        }

        const dLat = Math.abs(originLat - destLat);
        const dLng = Math.abs(originLng - destLng);
        if (dLat < 1e-5 && dLng < 1e-5) {
          throw new Error(
            "Hai điểm gần như trùng nhau — không cần chỉ đường.",
          );
        }

        const params = new URLSearchParams({
          originLat: String(originLat),
          originLng: String(originLng),
          destLat: String(destLat),
          destLng: String(destLng),
          vehicle,
        });
        const res = await fetch(`/api/vietmap/route?${params}`, {
          signal: ac.signal,
        });
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
          coordinates?: [number, number][];
          distanceM?: number | null;
          timeMs?: number | null;
          bbox?: [number, number, number, number] | null;
          instructions?: RoutePayload["instructions"];
        };
        if (!res.ok) {
          throw new Error(
            typeof body.message === "string" && body.message.trim()
              ? body.message.trim()
              : "Không lấy được lộ trình.",
          );
        }
        if (
          !Array.isArray(body.coordinates) ||
          body.coordinates.length < 2 ||
          cancelled
        ) {
          throw new Error("Dữ liệu lộ trình không hợp lệ.");
        }
        setRoute({
          coordinates: body.coordinates,
          distanceM:
            typeof body.distanceM === "number" ? body.distanceM : null,
          timeMs: typeof body.timeMs === "number" ? body.timeMs : null,
          bbox:
            Array.isArray(body.bbox) && body.bbox.length >= 4
              ? body.bbox
              : null,
          instructions: Array.isArray(body.instructions)
            ? body.instructions
            : [],
        });
      } catch (e) {
        if (cancelled || ac.signal.aborted) return;
        setRouteError(e instanceof Error ? e.message : "Lỗi tải lộ trình.");
      } finally {
        if (!cancelled && !ac.signal.aborted) setRouteLoading(false);
      }
    }

    void loadRoute();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [originLat, originLng, destLat, destLng, vehicle]);

  useEffect(() => {
    if (!enabled || !route?.coordinates?.length || !containerRef.current) {
      return;
    }

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
      mapRef.current = null;
    };

    const coords = route.coordinates;
    const mid = coords[Math.floor(coords.length / 2)] ?? VIETMAP_DEFAULT_CENTER;

    const startId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !containerRef.current || containerRef.current !== container)
          return;

        setWorkerUrl(`${window.location.origin}/vietmap-gl-csp-worker.js`);

        const styleUrl = `${window.location.origin}/api/vietmap/style?v=tm&t=${Date.now()}`;

        map = new vietmapgl.Map({
          container,
          style: styleUrl,
          center: mid,
          zoom: 11,
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

          const geojson = {
            type: "Feature" as const,
            properties: {} as Record<string, unknown>,
            geometry: {
              type: "LineString" as const,
              coordinates: coords,
            },
          };

          map.addSource(ROUTE_SOURCE_ID, {
            type: "geojson",
            data: geojson,
          });

          map.addLayer({
            id: ROUTE_LAYER_ID,
            type: "line",
            source: ROUTE_SOURCE_ID,
            layout: {
              "line-cap": "round",
              "line-join": "round",
            },
            paint: {
              "line-color": "#15803d",
              "line-width": 5,
              "line-opacity": 0.92,
            },
          });

          const mk = (lng: number, lat: number, color: string) =>
            new vietmapgl.Marker({ color }).setLngLat([lng, lat]).addTo(map!);

          markersRef.current = [
            mk(originLng, originLat, "#2563eb"),
            mk(destLng, destLat, "#ea580c"),
          ];

          const bb = route.bbox;
          if (
            bb &&
            bb.length >= 4 &&
            bb.every((n) => typeof n === "number" && Number.isFinite(n))
          ) {
            map.fitBounds(
              [
                [bb[0], bb[1]],
                [bb[2], bb[3]],
              ],
              { padding: 52, duration: 500, maxZoom: 15 },
            );
          } else {
            const b = new vietmapgl.LngLatBounds(coords[0], coords[0]);
            for (const c of coords) b.extend(c);
            map.fitBounds(b, { padding: 52, duration: 500, maxZoom: 15 });
          }

          mapRef.current = map;
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      queueMicrotask(tearDown);
    };
  }, [
    enabled,
    route,
    originLat,
    originLng,
    destLat,
    destLng,
  ]);

  if (!enabled) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Chưa bật VietMap trên client (
        <code className="text-[10px]">NEXT_PUBLIC_VIETMAP_ENABLED</code>) nên
        không hiển thị lộ trình VietMap.
      </p>
    );
  }

  const distKm =
    route?.distanceM != null && Number.isFinite(route.distanceM)
      ? (route.distanceM / 1000).toFixed(1)
      : null;
  const etaMin =
    route?.timeMs != null && Number.isFinite(route.timeMs)
      ? Math.max(1, Math.round(route.timeMs / 60000))
      : null;

  return (
    <div className={cn("space-y-2", className)}>
      {(routeLoading || routeError) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {routeLoading && (
            <Loader2 className="size-3.5 animate-spin shrink-0" aria-hidden />
          )}
          {routeError ? (
            <span className="text-destructive">{routeError}</span>
          ) : (
            <span>Đang tính lộ trình VietMap…</span>
          )}
        </div>
      )}
      {!routeError && route && distKm != null && etaMin != null && (
        <p className="text-xs font-medium text-foreground">
          Ước tính: ~{distKm} km · ~{etaMin} phút (
          {vehicle === "motorcycle" ? "xe máy" : "ô tô"})
        </p>
      )}
      {!routeError && (
        <div
          ref={containerRef}
          className={cn(mapViewportClassName ?? MAP_DIALOG_VIEWPORT_CLASS)}
        />
      )}
      {!routeLoading && route && route.instructions.length > 0 && (
        <div className="max-h-36 overflow-y-auto rounded-lg border border-[hsl(142,18%,88%)] bg-[hsl(120,22%,98%)] px-3 py-2">
          <p className="mb-1 text-[11px] font-semibold text-foreground">
            Gợi ý lộ trình
          </p>
          <ol className="m-0 list-decimal space-y-1 pl-4 text-[11px] text-muted-foreground">
            {route.instructions.map((step, i) => (
              <li key={`${i}-${step.text}`}>
                <span className="text-foreground">{step.text}</span>
                {step.distanceM != null && step.distanceM > 0 ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · {Math.round(step.distanceM)} m
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
