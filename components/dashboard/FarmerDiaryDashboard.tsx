"use client";

import { useState } from "react";
import { AlertTriangle, BookOpen, ShieldCheck, Sprout } from "lucide-react";

import DiaryEntryForm from "@/components/dashboard/DiaryEntryForm";
import DiaryTimeline from "@/components/dashboard/DiaryTimeline";
import { currentFarmer, diaryEntries, seasons } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const REFERENCE_TIME = new Date("2026-04-16T00:00:00+07:00").getTime();

export default function FarmerDiaryDashboard() {
    const [selectedSeason] = useState(seasons[0]?.id || "");

    const totalEntries = diaryEntries.length;
    const activeSeasons = seasons.filter((season) => season.status === "Đang canh tác").length;
    const lastSpray = diaryEntries.find((entry) => entry.taskTypeLabel === "Phun thuốc");
    const daysSinceSpray = lastSpray
        ? Math.floor((REFERENCE_TIME - new Date(lastSpray.timestamp).getTime()) / 86400000)
        : null;

    const stats = [
        { label: "Bản ghi nhật ký", value: totalEntries, icon: BookOpen, color: "text-primary" },
        { label: "Vụ đang canh tác", value: activeSeasons, icon: Sprout, color: "text-primary" },
        { label: "Chứng nhận", value: currentFarmer.certifications.length, icon: ShieldCheck, color: "text-primary" },
        {
            label: "Ngày sau phun thuốc",
            value: daysSinceSpray !== null ? `${daysSinceSpray} ngày` : "N/A",
            icon: AlertTriangle,
            color: daysSinceSpray !== null && daysSinceSpray < 7 ? "text-warning" : "text-primary",
        },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
            <div className="gradient-green rounded-2xl p-5 text-primary-foreground">
                <h1 className="text-xl font-bold">Xin chào, {currentFarmer.name}!</h1>
                <p className="mt-1 text-sm opacity-90">
                    {currentFarmer.farmName} • {currentFarmer.certifications.join(", ")}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={stat.label}>
                            <CardContent className="flex items-center gap-3 p-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-lg font-bold leading-tight">{stat.value}</p>
                                    <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Tabs defaultValue="diary" className="space-y-4">
                <TabsList className="grid h-12 w-full grid-cols-2">
                    <TabsTrigger value="diary" className="text-sm font-semibold">
                        Ghi nhật ký
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-sm font-semibold">
                        Lịch sử
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="diary" className="mt-0">
                    <DiaryEntryForm initialSeasonId={selectedSeason} />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <DiaryTimeline />
                </TabsContent>
            </Tabs>
        </div>
    );
}
