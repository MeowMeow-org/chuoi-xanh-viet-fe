import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Ruler } from "lucide-react";

import DiaryEntryForm from "@/components/dashboard/DiaryEntryForm";
import DiaryTimeline from "@/components/dashboard/DiaryTimeline";
import FarmerLayout from "@/components/layout/FarmerLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { seasons } from "@/data/mockData";

interface SeasonDetailPageProps {
    params: Promise<{ seasonId: string }>;
}

export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
    const { seasonId } = await params;
    const season = seasons.find((item) => item.id === seasonId);

    if (!season) {
        return (
            <FarmerLayout>
                <div className="mx-auto w-full max-w-6xl px-4 py-8 text-center sm:px-6 lg:px-8">
                    <p className="text-muted-foreground">Không tìm thấy vụ mùa.</p>
                </div>
            </FarmerLayout>
        );
    }

    return (
        <FarmerLayout>
            <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
                <Link
                    href="/farmer/seasons"
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Link>

                <div className="gradient-green rounded-2xl p-5 text-primary-foreground">
                    <h1 className="text-lg font-bold">{season.name}</h1>
                    <p className="mt-1 text-sm opacity-90">{season.crop}</p>

                    <div className="mt-3 flex flex-wrap gap-3 text-xs opacity-80">
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

                    <Badge className="mt-2 border-0 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                        {season.status}
                    </Badge>
                </div>

                <Tabs defaultValue="timeline" className="space-y-4">
                    <TabsList className="grid h-12 w-full grid-cols-2">
                        <TabsTrigger value="timeline" className="text-sm font-semibold">
                            Nhật ký
                        </TabsTrigger>
                        <TabsTrigger value="add" className="text-sm font-semibold">
                            Thêm mới
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="timeline">
                        <DiaryTimeline seasonId={season.id} />
                    </TabsContent>

                    <TabsContent value="add">
                        <DiaryEntryForm initialSeasonId={season.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </FarmerLayout>
    );
}
