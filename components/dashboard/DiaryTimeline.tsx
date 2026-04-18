"use client";

import { useEffect, useState } from "react";
import { Clock, Hash, MapPin, X } from "lucide-react";

import { useDiariesQuery } from "@/hooks/useDiary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDiaryRecordedAt } from "@/lib/diary-date";
import type { DiaryAttachment } from "@/services/diary";

interface DiaryTimelineProps {
  seasonId?: string;
}

function attachmentThumb(a: DiaryAttachment): string {
  const meta = (a.meta ?? {}) as { thumb?: unknown };
  if (typeof meta.thumb === "string" && meta.thumb.trim()) return meta.thumb;
  return a.fileUrl;
}

const eventTypeLabelMap: Record<string, string> = {
    land_prep: "Làm đất",
    sowing: "Gieo trồng",
    fertilizing: "Bón phân",
    pesticide: "Phun thuốc",
  irrigation: "Tưới nước",
    harvesting: "Thu hoạch",
    packing: "Đóng gói",
  inspection: "Kiểm tra HTX",
  other: "Khác",
};

export default function DiaryTimeline({ seasonId }: DiaryTimelineProps) {
    const { diaries, isLoading, error } = useDiariesQuery({
    seasonId,
    page: 1,
    limit: 5,
  });

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!lightboxUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxUrl]);

  const sorted = [...diaries].sort((a, b) => {
    const ta = new Date(a.serverTimestamp ?? a.createdAt).getTime();
    const tb = new Date(b.serverTimestamp ?? b.createdAt).getTime();
    return tb - ta;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lịch sử nhật ký</CardTitle>
          {seasonId && (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Mùa vụ hiện tại
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
                {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Đang tải nhật ký...
          </p>
                ) : error ? (
                    <p className="py-8 text-center text-sm text-red-600">
                        Không thể tải nhật ký mùa vụ.
                    </p>
        ) : sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Chưa có bản ghi nào.
          </p>
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-primary/20" />

            <div className="space-y-4">
              {sorted.map((entry, index) => {
                const hashSeed = `${entry.id}-${entry.createdAt}`;
                const displayHash = hashSeed
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .slice(0, 14);

                return (
                  <div
                    key={entry.id}
                    className="relative animate-fade-in pl-10"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />

                    <div className="space-y-2 rounded-xl border bg-muted/40 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge className="border border-border bg-white font-semibold text-foreground hover:bg-white">
                          {eventTypeLabelMap[entry.eventType] ?? "Khác"}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs leading-none text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatDiaryRecordedAt(
                            entry.serverTimestamp ?? entry.createdAt,
                          )}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed">
                        {entry.description ?? "Không có mô tả"}
                      </p>

                      {entry.attachments && entry.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {entry.attachments.map((att) => (
                            <button
                              key={att.id}
                              type="button"
                              onClick={() => setLightboxUrl(att.fileUrl)}
                              className="h-16 w-16 overflow-hidden rounded-md border bg-muted transition hover:opacity-85"
                              aria-label="Xem ảnh"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={attachmentThumb(att)}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Mã nông trại: {entry.farmId}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Hash className="h-3 w-3" />
                          {displayHash}...
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxUrl(null);
            }}
            aria-label="Đóng"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt="Ảnh nhật ký"
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Card>
  );
}
