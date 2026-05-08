"use client";

import { useCallback, useEffect, useState } from "react";

const OFFLINE_DIARY_KEY = "chuoi_xanh_offline_diary";

export interface OfflineDiaryEntry {
    id: string;
    seasonId: string;
    taskType: string;
    taskTypeLabel: string;
    description: string;
    photos: string[];
    gpsLat: number;
    gpsLng: number;
    timestamp: string;
    synced: boolean;
}

export function useOfflineStorage() {
    const [pendingEntries, setPendingEntries] = useState<OfflineDiaryEntry[]>(() => {
        if (typeof window === "undefined") {
            return [];
        }

        const stored = window.localStorage.getItem(OFFLINE_DIARY_KEY);
        return stored ? JSON.parse(stored) : [];
    });
    const [isOnline, setIsOnline] = useState(() => {
        if (typeof window === "undefined") {
            return true;
        }

        return window.navigator.onLine;
    });

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const saveEntry = useCallback((entry: OfflineDiaryEntry) => {
        if (typeof window === "undefined") {
            return entry;
        }

        setPendingEntries((current) => {
            const updated = [...current, entry];
            window.localStorage.setItem(OFFLINE_DIARY_KEY, JSON.stringify(updated));
            return updated;
        });

        return entry;
    }, []);

    const syncEntries = useCallback(() => {
        if (typeof window === "undefined" || !isOnline || pendingEntries.length === 0) {
            return;
        }

        const synced = pendingEntries.map((entry) => ({ ...entry, synced: true }));
        setPendingEntries([]);
        window.localStorage.removeItem(OFFLINE_DIARY_KEY);
        return synced;
    }, [isOnline, pendingEntries]);

    const unsyncedCount = pendingEntries.filter((entry) => !entry.synced).length;

    return { pendingEntries, saveEntry, syncEntries, isOnline, unsyncedCount };
}
