"use client";

import { Clock, Hash, Leaf, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentFarmer, diaryEntries, seasons } from "@/data/mockData";

function formatDateDDMMYYYY(iso: string) {
    const [year, month, day] = iso.slice(0, 10).split("-");
    return `${day}/${month}/${year}`;
}

export default function FarmerTracePage() {
    const season = seasons[0];
    const entries = diaryEntries.filter((entry) => entry.seasonId === season.id);
    const sorted = [...entries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
                <h1 className="text-xl font-bold">Cổng Truy xuất Nguồn gốc</h1>

                <Card className="border-[hsl(142,71%,45%)]/30">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Thông tin sản phẩm</CardTitle>
                            <div className="flex gap-1">
                                {currentFarmer.certifications.map((cert) => (
                                    <Badge key={cert} className="gap-1 bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,35%)]">
                                        <Leaf className="h-3 w-3" /> {cert}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-[hsl(150,7%,45%)]">Sản phẩm</p>
                                <p className="font-semibold">{season.crop}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[hsl(150,7%,45%)]">Nông dân</p>
                                <p className="font-semibold">{currentFarmer.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[hsl(150,7%,45%)]">Trang trại</p>
                                <p className="font-semibold">{currentFarmer.farmName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-[hsl(150,7%,45%)]">Diện tích</p>
                                <p className="font-semibold">{season.area}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="overflow-hidden rounded-lg p-0">
                        <div className="flex h-48 items-center justify-center bg-[hsl(120,20%,95%)]">
                            <div className="space-y-2 text-center">
                                <MapPin className="mx-auto h-8 w-8 text-[hsl(142,71%,45%)]" />
                                <p className="text-sm font-medium">Vị trí trang trại</p>
                                <p className="font-mono text-xs text-[hsl(150,7%,45%)]">
                                    {season.gpsLat.toFixed(4)}, {season.gpsLng.toFixed(4)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <h2 className="text-lg font-bold">Hành trình Blockchain</h2>

                <div className="relative">
                    <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-[hsl(142,71%,45%)]/20" />
                    <div className="space-y-3">
                        {sorted.map((entry, index) => {
                            return (
                                <div
                                    key={entry.id}
                                    className="animate-in fade-in-0 slide-in-from-bottom-2 relative pl-10 duration-300"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <div className="absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 border-white bg-[hsl(142,71%,45%)]" />
                                    <div className="space-y-1.5 rounded-xl border border-[hsl(142,15%,88%)] bg-white p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-1">
                                            <Badge className="border border-[hsl(142,15%,88%)] bg-white text-[hsl(150,10%,18%)] hover:bg-white">
                                                {entry.taskTypeLabel}
                                            </Badge>
                                            <span className="flex items-center gap-1 text-xs text-[hsl(150,7%,45%)]">
                                                <Clock className="h-3 w-3" />
                                                {formatDateDDMMYYYY(entry.timestamp)}
                                            </span>
                                        </div>

                                        <p className="text-sm text-[hsl(150,10%,18%)]">{entry.description}</p>

                                        <div className="flex w-fit items-center gap-1 rounded bg-[hsl(120,20%,96%)] px-2 py-1 font-mono text-xs text-[hsl(150,7%,45%)]">
                                            <Hash className="h-3 w-3" />
                                            {entry.blockchainHash}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
        </div>
    );
}
