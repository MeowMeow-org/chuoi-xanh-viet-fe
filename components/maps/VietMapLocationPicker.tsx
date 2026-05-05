"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import vietmapgl from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import { setWorkerUrl } from "@vietmap/vietmap-gl-js/dist/vietmap-gl";
import "@vietmap/vietmap-gl-js/dist/vietmap-gl.css";
import { Loader2, Search } from "lucide-react";

import { VIETMAP_DEFAULT_CENTER } from "@/lib/vietmapStyle";
import { isVietmapClientEnabled } from "@/lib/vietmapClientEnabled";
import { geocodeVietnamAddress } from "@/lib/googleGeocode";
import { proxyUrlForVietmapHttpsUrl } from "@/lib/vietmapProxyUrl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export type VietMapLocationPickerProps = {
  latitude: string;
  longitude: string;
  onCoordinateChange: (lat: number, lng: number) => void;
  className?: string;
};

function parseCoord(s: string): number | null {
  const n = Number(String(s ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

export default function VietMapLocationPicker({
  latitude,
  longitude,
  onCoordinateChange,
  className,
}: VietMapLocationPickerProps) {
  const enabled = isVietmapClientEnabled();

  const [placeQuery, setPlaceQuery] = useState("");
  const [placeSearching, setPlaceSearching] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    { refId: string; display: string }[]
  >([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<vietmapgl.Map | null>(null);
  const markerRef = useRef<vietmapgl.Marker | null>(null);
  const loadedRef = useRef(false);
  const latStrRef = useRef(latitude);
  const lngStrRef = useRef(longitude);

  const suggestAbortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latStrRef.current = latitude;
    lngStrRef.current = longitude;
  }, [latitude, longitude]);

  const emitPick = useCallback(
    (lat: number, lng: number) => {
      onCoordinateChange(lat, lng);
    },
    [onCoordinateChange],
  );

  const moveMapTo = useCallback(
    (lat: number, lng: number, label?: string) => {
      const map = mapRef.current;
      const marker = markerRef.current;
      if (!map || !marker || !loadedRef.current) {
        toast.error("Đợi bản đồ tải xong rồi thử lại.");
        return false;
      }
      marker.setLngLat([lng, lat]);
      map.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1200,
      });
      emitPick(lat, lng);
      toast.success(
        label ? `Đã ghim: ${label}` : "Đã cập nhật vị trí từ tìm kiếm.",
      );
      return true;
    },
    [emitPick],
  );

  const searchPlaceOnMap = useCallback(async () => {
    const q = placeQuery.trim();
    if (q.length < 2) {
      setPlaceError("Nhập ít nhất 2 ký tự để tìm.");
      return;
    }

    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || !loadedRef.current) {
      toast.error("Đợi bản đồ tải xong rồi thử lại.");
      return;
    }

    setSuggestOpen(false);
    setSuggestions([]);
    setHighlightIdx(-1);
    setPlaceError(null);
    setPlaceSearching(true);

    try {
      // Ưu tiên luồng autocomplete -> place detail để giảm trường hợp nhảy sai điểm.
      // Không dùng focusLat/focusLon ở bước tìm text để tránh kéo kết quả về tọa độ cũ.
      const acRes = await fetch(`/api/vietmap/autocomplete?${new URLSearchParams({ q })}`);
      const acBody = (await acRes.json().catch(() => ({}))) as {
        suggestions?: { refId: string; display: string }[];
      };
      const acList = Array.isArray(acBody.suggestions) ? acBody.suggestions : [];
      if (acList.length > 0) {
        const first = acList[0];
        const placeRes = await fetch(
          `/api/vietmap/place?${new URLSearchParams({ refId: first.refId })}`,
        );
        const placeBody = (await placeRes.json().catch(() => ({}))) as {
          lat?: number;
          lng?: number;
          formattedAddress?: string;
        };
        const pLat = Number(placeBody.lat);
        const pLng = Number(placeBody.lng);
        if (placeRes.ok && Number.isFinite(pLat) && Number.isFinite(pLng)) {
          moveMapTo(pLat, pLng, placeBody.formattedAddress ?? first.display);
          return;
        }
      }

      const params = new URLSearchParams({ q });

      let lat: number;
      let lng: number;
      let label: string | undefined;

      const res = await fetch(`/api/vietmap/geocode?${params.toString()}`);
      const body = await res.json().catch(() => ({})) as {
        lat?: number;
        lng?: number;
        formattedAddress?: string;
        message?: string;
      };

      if (res.ok) {
        lat = Number(body.lat);
        lng = Number(body.lng);
        label = body.formattedAddress;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          const alt = await geocodeVietnamAddress(q);
          if (!alt) {
            setPlaceError("Không lấy được tọa độ.");
            return;
          }
          lat = alt.lat;
          lng = alt.lng;
          label = alt.formattedAddress;
        }
      } else if (res.status === 503) {
        const alt = await geocodeVietnamAddress(q);
        if (!alt) {
          toast.error(
            body.message?.trim() ||
              "Chưa cấu hình geocode VietMap hoặc không tìm thấy (Google/OSM).",
          );
          return;
        }
        lat = alt.lat;
        lng = alt.lng;
        label = alt.formattedAddress;
      } else {
        const alt = await geocodeVietnamAddress(q).catch(() => null);
        if (alt) {
          lat = alt.lat;
          lng = alt.lng;
          label = alt.formattedAddress;
        } else {
          setPlaceError(
            typeof body.message === "string" && body.message.trim().length > 0
              ? body.message.trim()
              : "Không tìm thấy địa điểm.",
          );
          return;
        }
      }

      moveMapTo(lat, lng, label);
    } catch {
      toast.error("Không gọi được dịch vụ tìm địa điểm.");
    } finally {
      setPlaceSearching(false);
    }
  }, [moveMapTo, placeQuery]);

  const pickSuggestion = useCallback(
    async (refId: string, display: string) => {
      setSuggestOpen(false);
      setSuggestions([]);
      setHighlightIdx(-1);
      setPlaceQuery(display);
      setPlaceError(null);

      const map = mapRef.current;
      const marker = markerRef.current;
      if (!map || !marker || !loadedRef.current) {
        toast.error("Đợi bản đồ tải xong rồi thử lại.");
        return;
      }

      setPlaceSearching(true);
      try {
        const res = await fetch(
          `/api/vietmap/place?${new URLSearchParams({ refId })}`,
        );
        const body = (await res.json().catch(() => ({}))) as {
          lat?: number;
          lng?: number;
          formattedAddress?: string;
          message?: string;
        };

        if (res.ok) {
          const lat = Number(body.lat);
          const lng = Number(body.lng);
          const label = body.formattedAddress ?? display;
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            moveMapTo(lat, lng, label);
            return;
          }
        }

        const alt = await geocodeVietnamAddress(display).catch(() => null);
        if (alt) {
          moveMapTo(alt.lat, alt.lng, alt.formattedAddress);
        } else {
          toast.error(
            typeof body.message === "string" && body.message.trim().length > 0
              ? body.message.trim()
              : "Không lấy được tọa độ cho gợi ý này.",
          );
        }
      } catch {
        const alt = await geocodeVietnamAddress(display).catch(() => null);
        if (alt) {
          moveMapTo(alt.lat, alt.lng, alt.formattedAddress);
        } else {
          toast.error("Không gọi được dịch vụ địa điểm.");
        }
      } finally {
        setPlaceSearching(false);
      }
    },
    [moveMapTo],
  );

  useEffect(() => {
    const q = placeQuery.trim();
    suggestAbortRef.current?.abort();
    suggestAbortRef.current = null;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (q.length < 2) {
      queueMicrotask(() => {
        setSuggestions([]);
        setSuggestOpen(false);
        setHighlightIdx(-1);
      });
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      const ac = new AbortController();
      suggestAbortRef.current = ac;

      const params = new URLSearchParams({ q });

      void (async () => {
        try {
          const res = await fetch(`/api/vietmap/autocomplete?${params}`, {
            signal: ac.signal,
          });
          const body = (await res.json().catch(() => ({
            suggestions: [],
          }))) as { suggestions?: { refId: string; display: string }[] };
          if (ac.signal.aborted) return;
          const list = Array.isArray(body.suggestions) ? body.suggestions : [];
          setSuggestions(list);
          setSuggestOpen(list.length > 0);
          setHighlightIdx(list.length > 0 ? 0 : -1);
        } catch {
          if (ac.signal.aborted) return;
          setSuggestions([]);
          setSuggestOpen(false);
          setHighlightIdx(-1);
        }
      })();
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      suggestAbortRef.current?.abort();
      suggestAbortRef.current = null;
    };
  }, [placeQuery]);

  useEffect(() => {
    if (!suggestOpen) return;

    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setSuggestOpen(false);
    };

    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [suggestOpen]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

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
        /* đã gỡ khỏi map */
      }
      marker = null;
      try {
        map?.remove();
      } catch {
        /* AbortError khi chuyển trang nhanh */
      }
      map = null;
    };

    /* Đợi layout sau dynamic import — tránh canvas/ghim “bay” khi container chưa có chiều cao thật. */
    const startId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || !containerRef.current || containerRef.current !== container)
          return;

        setWorkerUrl(`${window.location.origin}/vietmap-gl-csp-worker.js`);

        const styleUrl = `${window.location.origin}/api/vietmap/style?v=tm&t=${Date.now()}`;

        map = new vietmapgl.Map({
          container,
          style: styleUrl,
          center: VIETMAP_DEFAULT_CENTER,
          zoom: 6,
          transformRequest: (url: string) => ({
            url: proxyUrlForVietmapHttpsUrl(window.location.origin, url),
          }),
        });

        map.addControl(new vietmapgl.NavigationControl(), "top-right");

        resizeObserver = new ResizeObserver(() => {
          map?.resize();
        });
        resizeObserver.observe(container);

        marker = new vietmapgl.Marker({
          color: "#15803d",
          draggable: true,
        });

        map.once("load", () => {
          map?.resize();
          loadedRef.current = true;
          const lat = parseCoord(latStrRef.current);
          const lng = parseCoord(lngStrRef.current);
          if (lat != null && lng != null) {
            marker!.setLngLat([lng, lat]);
            map!.jumpTo({ center: [lng, lat], zoom: 15 });
          } else {
            marker!.setLngLat(VIETMAP_DEFAULT_CENTER);
            // Mở popup map lần đầu (chưa có tọa độ) vẫn zoom gần để user thấy đường xá ngay.
            map!.jumpTo({ center: VIETMAP_DEFAULT_CENTER, zoom: 13 });
          }
          marker!.addTo(map!);
          mapRef.current = map;
          markerRef.current = marker;

          marker!.on("dragend", () => {
            const ll = marker!.getLngLat();
            emitPick(ll.lat, ll.lng);
          });

          map!.on("click", (e) => {
            const ll = e.lngLat;
            marker!.setLngLat(ll);
            emitPick(ll.lat, ll.lng);
          });
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      loadedRef.current = false;
      mapRef.current = null;
      markerRef.current = null;
      queueMicrotask(tearDown);
    };
  }, [enabled, emitPick]);

  useEffect(() => {
    if (!loadedRef.current) return;
    const marker = markerRef.current;
    if (!marker) return;
    const lat = parseCoord(latitude);
    const lng = parseCoord(longitude);
    if (lat == null || lng == null) return;
    const cur = marker.getLngLat();
    const same =
      Math.abs(cur.lat - lat) < 1e-6 && Math.abs(cur.lng - lng) < 1e-6;
    if (same) return;
    marker.setLngLat([lng, lat]);
  }, [latitude, longitude]);

  if (!enabled) {
    return (
      <div
        className={cn(
          "flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[hsl(142,20%,78%)] bg-[hsl(120,25%,98%)] px-4 py-8 text-center text-sm text-[hsl(150,8%,40%)]",
          className,
        )}
      >
        <p className="font-medium text-[hsl(150,16%,22%)]">
          Chưa bật bản đồ VietMap
        </p>
        <p>
          Thêm{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            NEXT_PUBLIC_VIETMAP_ENABLED=1
          </code>{" "}
          và cấu hình{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            VIETMAP_TILE_API_KEY
          </code>{" "}
          /{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            VIETMAP_GEOCODE_API_KEY
          </code>{" "}
          ở <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code>,
          lấy key tại{" "}
          <a
            className="text-primary underline underline-offset-2"
            href="https://maps.vietmap.vn/docs/"
            target="_blank"
            rel="noreferrer"
          >
            VietMap Console
          </a>
          , rồi khởi động lại dev server.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative isolate z-0 w-full min-w-0 space-y-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div ref={wrapRef} className="relative min-w-0 flex-1">
          <Input
            className="h-10 rounded-lg border-[hsl(142,20%,88%)] bg-white text-sm shadow-sm sm:min-w-0 sm:w-full"
            placeholder="Tìm địa điểm (đường, phường, quận, tỉnh…)"
            value={placeQuery}
            disabled={placeSearching}
            autoComplete="off"
            aria-expanded={suggestOpen}
            aria-controls="vietmap-place-suggestions"
            aria-autocomplete="list"
            aria-invalid={placeError ? true : undefined}
            onChange={(e) => {
              setPlaceQuery(e.target.value);
              if (placeError) setPlaceError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (suggestOpen) {
                  e.preventDefault();
                  setSuggestOpen(false);
                }
                return;
              }

              if (suggestOpen && suggestions.length > 0) {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setHighlightIdx((i) => {
                    const base = i < 0 ? -1 : i;
                    return Math.min(suggestions.length - 1, base + 1);
                  });
                  return;
                }
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setHighlightIdx((i) => Math.max(0, i - 1));
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                  const idx =
                    highlightIdx >= 0 && highlightIdx < suggestions.length
                      ? highlightIdx
                      : 0;
                  const s = suggestions[idx];
                  if (s) void pickSuggestion(s.refId, s.display);
                  return;
                }
              }

              if (e.key === "Enter") {
                e.preventDefault();
                void searchPlaceOnMap();
              }
            }}
          />
          {suggestOpen && suggestions.length > 0 && (
            <ul
              id="vietmap-place-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-[hsl(142,20%,88%)] bg-white py-1 shadow-lg"
            >
              {suggestions.map((s, i) => (
                <li
                  key={`${s.refId}-${i}`}
                  role="option"
                  aria-selected={i === highlightIdx}
                  className={cn(
                    "cursor-pointer px-3 py-2 text-sm text-[hsl(150,16%,22%)]",
                    i === highlightIdx && "bg-[hsl(142,71%,94%)]",
                  )}
                  onMouseDown={(ev) => {
                    ev.preventDefault();
                    void pickSuggestion(s.refId, s.display);
                  }}
                  onMouseEnter={() => setHighlightIdx(i)}
                >
                  {s.display}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-10 shrink-0 gap-2 border border-[hsl(142,35%,38%)] bg-[hsl(142,71%,45%)] px-4 text-white hover:bg-[hsl(142,71%,40%)] sm:h-auto sm:self-stretch"
          disabled={placeSearching}
          onClick={() => void searchPlaceOnMap()}
        >
          {placeSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Search className="h-4 w-4" aria-hidden />
          )}
          Tìm trên bản đồ
        </Button>
      </div>
      {placeError && (
        <p className="text-xs text-red-600">{placeError}</p>
      )}
      <div
        ref={containerRef}
        className="relative isolate min-h-[280px] h-[360px] max-h-[55vh] w-full overflow-hidden rounded-xl border border-[hsl(142,20%,88%)] bg-[hsl(140,14%,93%)]"
      />
      <p className="text-xs text-[hsl(150,8%,42%)]">
        Gõ địa chỉ để xem gợi ý (chọn trong danh sách), hoặc bấm &quot;Tìm trên bản đồ&quot; /
        Enter để tìm theo text; có thể bấm trên bản đồ hoặc kéo ghim để chỉnh tọa độ.
      </p>
    </div>
  );
}
