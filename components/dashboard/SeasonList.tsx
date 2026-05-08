import Link from "next/link";
import { Calendar, ChevronRight, MapPin, Ruler } from "lucide-react";

import { diaryEntries, seasons, type Season } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function statusColor(status: string) {
    switch (status) {
        case "Đang canh tác":
            return "bg-primary text-primary-foreground hover:bg-primary";
        case "Đã thu hoạch":
            return "bg-muted text-muted-foreground hover:bg-muted";
        case "Chuẩn bị":
            return "bg-warning text-warning-foreground hover:bg-warning";
        default:
            return "";
    }
}

interface SeasonListProps {
    items?: Season[];
    detailBasePath?: string;
    title?: string;
}

export default function SeasonList({
    items = seasons,
    detailBasePath = "/farmer/farms/seasons",
    title = "Quản lý mùa vụ",
}: SeasonListProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{title}</h2>
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
                    {items.length} vụ
                </Badge>
            </div>

            <div className="grid gap-3">
                {items.map((season) => {
                    const entryCount = diaryEntries.filter((entry) => entry.seasonId === season.id).length;

                    return (
                        <Link key={season.id} href={`${detailBasePath}/${season.id}`}>
                            <Card className="cursor-pointer transition-colors hover:border-primary/40">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-bold">{season.name}</h3>
                                                <Badge className={statusColor(season.status)}>
                                                    {season.status}
                                                </Badge>
                                            </div>

                                            <p className="text-sm font-medium text-primary">{season.crop}</p>

                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {season.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Ruler className="h-3 w-3" />
                                                    {season.area}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(season.startDate).toLocaleDateString("vi-VN")}
                                                </span>
                                            </div>

                                            <p className="text-xs text-muted-foreground">
                                                {entryCount} bản ghi nhật ký
                                            </p>
                                        </div>

                                        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
