"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Trash2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import DiaryEntryForm from "@/components/dashboard/DiaryEntryForm";
import DiaryTimeline from "@/components/dashboard/DiaryTimeline";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import { useDeleteSeasonMutation, useSeasonDetailQuery } from "@/hooks/useSeason";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  /** `?hideAddDiary=1` hoặc `true`: chỉ xem nhật ký, ẩn tab tạo mới. Mặc định: vẫn có tab ghi nhật ký. */
  const hideAddDiary =
    searchParams.get("hideAddDiary") === "1" || searchParams.get("hideAddDiary") === "true";
  const farmId = Array.isArray(params.farmId) ? params.farmId[0] : params.farmId;
  const seasonId = Array.isArray(params.seasonId) ? params.seasonId[0] : params.seasonId;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailQueryEnabled, setDetailQueryEnabled] = useState(true);
  const [seasonTab, setSeasonTab] = useState<"timeline" | "add">("timeline");
  const { farms } = useMyFarmsQuery({ page: 1, limit: 100 });
  const { data: season, isLoading } = useSeasonDetailQuery(seasonId, {
    enabled: detailQueryEnabled,
  });
  const deleteSeason = useDeleteSeasonMutation();
  const farm = farms.find((item) => item.id === farmId);

  const handleConfirmDelete = () => {
    if (!seasonId) return;
    setDetailQueryEnabled(false);
    deleteSeason.mutate(seasonId, {
      onSuccess: () => {
        toast.success("Đã xóa mùa vụ");
        setDeleteOpen(false);
        router.replace(`/farmer/farms/${farmId}/seasons`);
      },
      onError: () => {
        setDetailQueryEnabled(true);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <Link
        href={`/farmer/farms/${farmId}/seasons`}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại mùa vụ
      </Link>

      <div className="gradient-green relative rounded-2xl p-5 text-primary-foreground">
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
            {season?.status ? getStatusLabel(season.status) : "Đang cập nhật"}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            disabled={!seasonId || isLoading}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Xóa mùa vụ
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mùa vụ?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mùa vụ đã neo hoặc đã có nhật ký, sản phẩm, đơn vị bán
              liên quan sẽ không thể xóa — hệ thống sẽ báo lỗi cụ thể nếu vậy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteSeason.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteSeason.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs
        value={hideAddDiary ? "timeline" : seasonTab}
        onValueChange={(v) => {
          if (hideAddDiary) return;
          if (v === "timeline" || v === "add") setSeasonTab(v);
        }}
        className="space-y-4"
      >
        <TabsList className={`grid h-12 w-full ${hideAddDiary ? "grid-cols-1" : "grid-cols-2"}`}>
          <TabsTrigger value="timeline" className="text-sm font-semibold">
            Nhật ký
          </TabsTrigger>
          {!hideAddDiary && (
            <TabsTrigger value="add" className="text-sm font-semibold">
              Thêm mới
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="timeline">
          <DiaryTimeline seasonId={season?.id} />
        </TabsContent>

        {!hideAddDiary && (
          <TabsContent value="add">
            {season ? (
              <DiaryEntryForm
                farmId={season.farmId}
                initialSeasonId={season.id}
                seasonSummary={`${season.code} · ${season.cropName}`}
                onDiaryCreated={() => setSeasonTab("timeline")}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Đang tải mùa vụ để ghi nhật ký...
              </p>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
