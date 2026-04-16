 "use client";

import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { useParams } from "next/navigation";

import DiaryEntryForm from "@/components/dashboard/DiaryEntryForm";
import DiaryTimeline from "@/components/dashboard/DiaryTimeline";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import { useSeasonDetailQuery } from "@/hooks/useSeason";
import type { SeasonStatus } from "@/services/season";

const getStatusLabel = (status: SeasonStatus) => {
  if (status === "draft") return "Nháp";
  if (status === "ready_to_anchor") return "Sẵn sàng neo";
  if (status === "anchored") return "Đã neo";
  if (status === "amended") return "Đã chỉnh sửa";
  return "Thất bại";
};

export default function SeasonDetailPage() {
  const params = useParams<{ farmId: string; seasonId: string }>();
  const farmId = Array.isArray(params.farmId) ? params.farmId[0] : params.farmId;
  const seasonId = Array.isArray(params.seasonId) ? params.seasonId[0] : params.seasonId;
  const { farms } = useMyFarmsQuery({ page: 1, limit: 100 });
  const { data: season, isLoading } = useSeasonDetailQuery(seasonId);
  const farm = farms.find((item) => item.id === farmId);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <Link
        href={`/farmer/farms/${farmId}/seasons`}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại mùa vụ
      </Link>

      <div className="gradient-green rounded-2xl p-5 text-primary-foreground">
        <p className="text-xs uppercase tracking-wide opacity-85">{farm?.name ?? "Nông trại"}</p>
        <h1 className="mt-1 text-lg font-bold">
          {isLoading ? "Đang tải mùa vụ..." : season?.code ?? "Mùa vụ"}
        </h1>
        <p className="mt-1 text-sm opacity-90">{season?.cropName ?? "--"}</p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs opacity-80">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {season?.startDate
              ? new Date(season.startDate).toLocaleDateString("vi-VN")
              : "--"}
          </span>
        </div>

        <Badge className="mt-2 border-0 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
          {season?.status ? getStatusLabel(season.status) : "Đang cập nhật"}
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
          <DiaryTimeline seasonId={season?.id ?? ""} />
        </TabsContent>

        <TabsContent value="add">
          <DiaryEntryForm initialSeasonId={season?.id ?? ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
