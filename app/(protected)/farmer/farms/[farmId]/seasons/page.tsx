"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, ChevronRight, Sprout } from "lucide-react";
import { useParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/Pagination";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import { useSeasonsQuery } from "@/hooks/useSeason";
import type { SeasonStatus } from "@/services/season";

const getStatusLabel = (status: SeasonStatus) => {
  if (status === "draft") return "Nháp";
  if (status === "ready_to_anchor") return "Sẵn sàng neo";
  if (status === "anchored") return "Đã neo";
  if (status === "amended") return "Đã chỉnh sửa";
  return "Thất bại";
};

const getStatusClass = (status: SeasonStatus) => {
  if (status === "anchored") {
    return "bg-[hsl(142,71%,45%)] text-white";
  }
  if (status === "ready_to_anchor") {
    return "bg-[hsl(142,71%,45%)]/10 text-[hsl(142,71%,35%)]";
  }
  if (status === "draft" || status === "amended") {
    return "bg-[hsl(120,20%,94%)] text-[hsl(150,10%,22%)]";
  }
  return "bg-red-100 text-red-700";
};

function FarmSeasonsPageContent({ farmId }: { farmId: string }) {
  const [page, setPage] = useState(1);

  const { farms, isLoading: isFarmLoading } = useMyFarmsQuery({ page: 1, limit: 100 });
  const farm = useMemo(() => farms.find((item) => item.id === farmId), [farms, farmId]);

  const {
    seasons,
    pagination,
    isLoading: isSeasonLoading,
    error,
  } = useSeasonsQuery({
    farmId,
    page,
    limit: 6,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <Link
        href="/farmer/farms"
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách nông trại
      </Link>

      <div className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-4">
        <h1 className="text-xl font-bold">{farm?.name ?? "Nông trại"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {[farm?.ward, farm?.district, farm?.province].filter(Boolean).join(", ") ||
            farm?.address ||
            "Đang tải thông tin nông trại..."}
        </p>
        <p className="text-xs text-muted-foreground">
          Diện tích: {farm?.areaHa ?? "--"} ha
        </p>
        {farm != null &&
          (farm.inCooperative ||
            farm.cooperativeMembershipStatus === "approved") && (
            <div className="mt-3 border-t border-[hsl(142,15%,92%)] pt-3">
              <div className="flex flex-col gap-1 text-sm leading-snug sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
                <span className="shrink-0 font-semibold text-[hsl(142,58%,28%)]">
                  Đã tham gia
                </span>
                {farm.cooperativeName ? (
                  <span className="min-w-0 max-w-full wrap-break-word font-medium text-[hsl(150,10%,22%)]">
                    {farm.cooperativeName}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        {farm != null &&
          !farm.inCooperative &&
          farm.cooperativeMembershipStatus !== "approved" && (
          <div className="mt-3 border-t border-[hsl(142,15%,92%)] pt-3">
            {farm.cooperativeMembershipStatus === "pending" ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[hsl(210,75%,38%)]">
                  Đang chờ hợp tác xã duyệt yêu cầu
                </p>
                <p className="text-xs text-muted-foreground">
                  Bạn đã gửi đơn tham gia. Khi được duyệt, nông trại sẽ gắn với
                  hợp tác xã.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs text-[hsl(32,90%,38%)]">
                  Nông trại chưa gắn với hợp tác xã.
                </p>
                <Link
                  href={`/farmer/farms/${farmId}/join-cooperative`}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[hsl(142,35%,38%)] bg-[hsl(142,71%,96%)] px-3 py-2 text-sm font-semibold text-[hsl(142,58%,28%)] transition hover:bg-[hsl(142,71%,90%)]"
                >
                  <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                  Tham gia hợp tác xã
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Mùa vụ của nông trại</h2>
          {pagination && (
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
              {pagination.total} vụ
            </Badge>
          )}
        </div>

        {(isFarmLoading || isSeasonLoading) && (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`season-skeleton-${index}`}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                    <div className="h-3 w-24 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                    <div className="h-3 w-52 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isSeasonLoading && error && (
          <Card className="border-red-200">
            <CardContent className="p-4 text-sm text-red-600">
              Không thể tải danh sách mùa vụ. Vui lòng thử lại.
            </CardContent>
          </Card>
        )}

        {!isSeasonLoading && !error && seasons.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Nông trại này chưa có mùa vụ nào.
            </CardContent>
          </Card>
        )}

        {!isSeasonLoading && !error && seasons.length > 0 && (
          <>
            <div className="grid gap-3">
              {seasons.map((season) => (
                <Link
                  key={season.id}
                  href={`/farmer/farms/${farmId}/seasons/${season.id}`}
                  className="block"
                >
                  <Card className="cursor-pointer transition-colors hover:border-primary/40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                              <Sprout className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                            </span>
                            <h3 className="text-base font-semibold">{season.code}</h3>
                            <Badge className={getStatusClass(season.status)}>
                              {getStatusLabel(season.status)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-[hsl(150,10%,22%)]">
                            {season.cropName}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Bắt đầu:{" "}
                            {new Date(season.startDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>

                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination && (
              <Pagination
                meta={pagination}
                onPageChange={(nextPage: number) => {
                  if (nextPage < 1 || nextPage > pagination.totalPages) return;
                  setPage(nextPage);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function FarmSeasonsPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = Array.isArray(params.farmId) ? params.farmId[0] : params.farmId;
  if (!farmId) return null;
  // Re-mount content when farm changes to naturally reset local pagination.
  return <FarmSeasonsPageContent key={farmId} farmId={farmId} />;
}
