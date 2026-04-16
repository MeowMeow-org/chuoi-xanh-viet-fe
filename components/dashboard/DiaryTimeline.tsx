"use client";

import { Clock, Hash, MapPin } from "lucide-react";

import { useDiariesQuery } from "@/hooks/useDiary";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DiaryTimelineProps {
  seasonId?: string;
}

const eventTypeLabelMap: Record<string, string> = {
    land_prep: "Làm đất",
    sowing: "Gieo trồng",
    fertilizing: "Bón phân",
    pesticide: "Phun thuốc",
  irrigation: "Tưới nước",
    harvesting: "Thu hoạch",
    packing: "Đóng gói",
  other: "Khác",
};

export default function DiaryTimeline({ seasonId }: DiaryTimelineProps) {
    const { diaries, isLoading, error } = useDiariesQuery({
    seasonId,
    page: 1,
    limit: 5,
  });

  const sorted = [...diaries].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  );

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
                const date = new Date(entry.eventDate);
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
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {date.toLocaleDateString("vi-VN")}{" "}
                          {date.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-sm leading-relaxed">
                        {entry.description ?? "Không có mô tả"}
                      </p>

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
    </Card>
  );
}
