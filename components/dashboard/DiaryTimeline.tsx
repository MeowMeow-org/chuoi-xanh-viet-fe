import { Clock, Hash, MapPin } from "lucide-react";

import { diaryEntries, seasons } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DiaryTimelineProps {
    seasonId?: string;
}

export default function DiaryTimeline({ seasonId }: DiaryTimelineProps) {
    const entries = seasonId
        ? diaryEntries.filter((entry) => entry.seasonId === seasonId)
        : diaryEntries;

    const sorted = [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const season = seasonId ? seasons.find((item) => item.id === seasonId) : null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Lịch sử nhật ký</CardTitle>
                    {season && (
                        <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                            {season.crop}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {sorted.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        Chưa có bản ghi nào.
                    </p>
                ) : (
                    <div className="relative">
                        <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-primary/20" />

                        <div className="space-y-4">
                            {sorted.map((entry, index) => {
                                const date = new Date(entry.timestamp);

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
                                                    {entry.taskTypeLabel}
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

                                            <p className="text-sm leading-relaxed">{entry.description}</p>

                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {entry.gpsLat.toFixed(4)}, {entry.gpsLng.toFixed(4)}
                                                </span>
                                                <span className="flex items-center gap-1 font-mono">
                                                    <Hash className="h-3 w-3" />
                                                    {entry.blockchainHash.slice(0, 14)}...
                                                </span>
                                                {entry.synced && (
                                                    <Badge className="h-5 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                                        Đã xác thực
                                                    </Badge>
                                                )}
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
