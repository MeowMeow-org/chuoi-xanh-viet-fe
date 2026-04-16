"use client";

import { BookOpen, MapPin, Phone, ShieldCheck, Sprout, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { currentFarmer, diaryEntries, seasons } from "@/data/mockData";

export default function FarmerProfilePage() {
    const totalEntries = diaryEntries.length;
    const activeSeasons = seasons.filter((season) => season.status === "Đang canh tác").length;
    const firstSeason = seasons[0];

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
                <h1 className="text-xl font-bold">Hồ sơ nông trại</h1>

                <Card className="overflow-hidden">
                    <div className="bg-linear-to-r from-[hsl(142,71%,45%)] to-[hsl(142,65%,50%)] p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
                                {currentFarmer.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{currentFarmer.name}</h2>
                                <p className="text-sm opacity-90">{currentFarmer.farmName}</p>
                            </div>
                        </div>
                    </div>

                    <CardContent className="space-y-4 p-5">
                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(150,7%,45%)]" />
                            <span>{currentFarmer.address}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-[hsl(150,7%,45%)]" />
                            <span>{currentFarmer.phone}</span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-semibold">Chứng nhận</p>
                            <div className="flex flex-wrap gap-2">
                                {currentFarmer.certifications.map((cert) => (
                                    <Badge key={cert} className="gap-1 bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,35%)]">
                                        <ShieldCheck className="h-3 w-3" /> {cert}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-[hsl(142,71%,45%)]/5 p-3">
                            <ShieldCheck className="h-5 w-5 text-[hsl(142,71%,45%)]" />
                            <div>
                                <p className="text-sm font-semibold">Đã xác thực bởi HTX Long Hòa</p>
                                <p className="text-xs text-[hsl(150,7%,45%)]">Xác minh ngày 15/11/2025</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="p-4 text-center">
                            <Sprout className="mx-auto mb-1 h-6 w-6 text-[hsl(142,71%,45%)]" />
                            <p className="text-lg font-bold">{activeSeasons}</p>
                            <p className="text-xs text-[hsl(150,7%,45%)]">Vụ đang canh tác</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <BookOpen className="mx-auto mb-1 h-6 w-6 text-[hsl(142,71%,45%)]" />
                            <p className="text-lg font-bold">{totalEntries}</p>
                            <p className="text-xs text-[hsl(150,7%,45%)]">Bản ghi nhật ký</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 text-center">
                            <Star className="mx-auto mb-1 h-6 w-6 text-[hsl(142,71%,45%)]" />
                            <p className="text-lg font-bold">4.8</p>
                            <p className="text-xs text-[hsl(150,7%,45%)]">Đánh giá TB</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent className="overflow-hidden rounded-lg p-0">
                        <div className="flex h-48 items-center justify-center bg-[hsl(120,20%,95%)]">
                            <div className="space-y-2 text-center">
                                <MapPin className="mx-auto h-8 w-8 text-[hsl(142,71%,45%)]" />
                                <p className="text-sm font-medium">Vị trí trang trại</p>
                                {firstSeason ? (
                                    <p className="font-mono text-xs text-[hsl(150,7%,45%)]">
                                        {firstSeason.gpsLat.toFixed(4)}, {firstSeason.gpsLng.toFixed(4)}
                                    </p>
                                ) : (
                                    <p className="font-mono text-xs text-[hsl(150,7%,45%)]">Chưa có dữ liệu tọa độ</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    <h2 className="text-lg font-bold">Mùa vụ</h2>
                    {seasons.map((season) => (
                        <Card key={season.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-sm font-semibold">{season.name}</p>
                                    <p className="text-xs text-[hsl(150,7%,45%)]">
                                        {season.crop} • {season.area}
                                    </p>
                                </div>
                                <Badge className={season.status === "Đang canh tác" ? "bg-[hsl(142,71%,45%)] text-white" : "bg-[hsl(120,20%,94%)] text-[hsl(150,10%,22%)]"}>
                                    {season.status}
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
        </div>
    );
}
