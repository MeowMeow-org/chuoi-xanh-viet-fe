"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  mapNominatimJsonToMarketplaceRegion,
  type MarketplaceRegion,
  MARKETPLACE_REGIONS,
  MARKETPLACE_REGION_STORAGE_KEY,
} from "@/lib/location/marketplaceRegions";

const TOUCHED_KEY = "marketplace_region_touched_v1";

export type LocationDetectStatus =
  | "idle"
  | "detecting"
  | "detected"
  | "unmapped"
  | "denied"
  | "unsupported"
  | "error";

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 300000,
    });
  });
}

/**
 * Vùng lọc Chợ: đọc/ghi sessionStorage; tự geolocation → reverse geocode nếu user chưa chọn tay và chưa có vùng đã lưu (khác "Tất cả").
 */
export function useMarketplaceRegion() {
  const [region, setRegionState] = useState<MarketplaceRegion>("Tất cả");
  const [hydrated, setHydrated] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationDetectStatus>("idle");
  const geoStartedRef = useRef(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(MARKETPLACE_REGION_STORAGE_KEY);
    if (saved && MARKETPLACE_REGIONS.includes(saved as MarketplaceRegion)) {
      setRegionState(saved as MarketplaceRegion);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(MARKETPLACE_REGION_STORAGE_KEY, region);
  }, [region, hydrated]);

  const setRegion = useCallback((r: MarketplaceRegion) => {
    setRegionState(r);
    sessionStorage.setItem(TOUCHED_KEY, "1");
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (geoStartedRef.current) return;
    if (sessionStorage.getItem(TOUCHED_KEY) === "1") {
      setLocationStatus("idle");
      return;
    }
    const saved = sessionStorage.getItem(MARKETPLACE_REGION_STORAGE_KEY);
    if (saved && saved !== "Tất cả") {
      setLocationStatus("idle");
      return;
    }

    geoStartedRef.current = true;
    let cancelled = false;

    (async () => {
      setLocationStatus("detecting");
      try {
        const pos = await getCurrentPosition();
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `/api/geocode/reverse?lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}`,
        );
        if (!res.ok) {
          setLocationStatus("error");
          return;
        }
        const json = (await res.json()) as Parameters<typeof mapNominatimJsonToMarketplaceRegion>[0];
        const mapped = mapNominatimJsonToMarketplaceRegion(json);
        if (cancelled) return;
        if (sessionStorage.getItem(TOUCHED_KEY) === "1") {
          setLocationStatus("idle");
          return;
        }
        if (mapped && MARKETPLACE_REGIONS.includes(mapped)) {
          setRegionState(mapped);
          setLocationStatus("detected");
        } else {
          setLocationStatus("unmapped");
        }
      } catch (e: unknown) {
        if (cancelled) return;
        const err = e as { code?: number; message?: string };
        if (err.message === "unsupported") setLocationStatus("unsupported");
        else if (err.code === 1) setLocationStatus("denied");
        else setLocationStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  return {
    region,
    setRegion,
    locationStatus,
    regions: MARKETPLACE_REGIONS,
  };
}
