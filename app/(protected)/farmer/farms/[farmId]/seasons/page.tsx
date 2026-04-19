"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  FileText,
  Pencil,
  Plus,
  ShieldCheck,
  Sprout,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/shared/Pagination";
import { useDeleteFarmMutation, useMyFarmsQuery } from "@/hooks/useFarm";
import { useSeasonsQuery } from "@/hooks/useSeason";
import { useMyFarmCertsQuery } from "@/hooks/useCertificate";
import type { SeasonStatus } from "@/services/season";
import {
  CERT_TYPE_LABEL,
  type FarmCertStatus,
} from "@/services/certificate";
import { FarmCertUploadDialog } from "@/components/farmer/FarmCertUploadDialog";

const getStatusLabel = (status: SeasonStatus) => {
  if (status === "draft") return "Nháp";
  if (status === "ready_to_anchor") return "Hoàn thành";
  if (status === "anchored") return "Đã công khai";
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

const getCertStatusLabel = (status: FarmCertStatus) => {
  if (status === "pending") return "Chờ duyệt";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Bị từ chối";
  if (status === "expired") return "Hết hạn";
  return "Đã vô hiệu";
};

const getCertStatusClass = (status: FarmCertStatus) => {
  if (status === "approved") return "bg-[hsl(142,71%,45%)] text-white";
  if (status === "pending") return "bg-amber-100 text-amber-800";
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "expired") return "bg-[hsl(35,80%,92%)] text-[hsl(32,90%,38%)]";
  return "bg-[hsl(120,10%,92%)] text-[hsl(150,10%,25%)]";
};

const formatCertDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
};

function FarmSeasonsPageContent({ farmId }: { farmId: string }) {
  const [page, setPage] = useState(1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [showArchivedCerts, setShowArchivedCerts] = useState(false);
  const deleteFarmMutation = useDeleteFarmMutation();

  const { farms, isLoading: isFarmLoading } = useMyFarmsQuery({
    page: 1,
    limit: 100,
  });
  const farm = useMemo(
    () => farms.find((item) => item.id === farmId),
    [farms, farmId],
  );

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

  const certsQuery = useMyFarmCertsQuery({
    farmId,
    page: 1,
    limit: 50,
  });
  const allCerts = certsQuery.data?.items ?? [];
  const archivedCertCount = useMemo(
    () =>
      allCerts.filter(
        (c) => c.status === "expired" || c.status === "revoked",
      ).length,
    [allCerts],
  );
  const certs = useMemo(
    () =>
      showArchivedCerts
        ? allCerts
        : allCerts.filter(
            (c) => c.status !== "expired" && c.status !== "revoked",
          ),
    [allCerts, showArchivedCerts],
  );

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">{farm?.name ?? "Nông trại"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[farm?.ward, farm?.district, farm?.province]
                .filter(Boolean)
                .join(", ") ||
                farm?.address ||
                "Đang tải thông tin nông trại..."}
            </p>
            <p className="text-xs text-muted-foreground">
              Diện tích: {farm?.areaHa ?? "--"} ha
            </p>
          </div>
          {farm != null && (
            <div className="flex shrink-0 flex-row flex-nowrap items-center justify-end gap-2">
              <Link
                href={`/farmer/farms/${farmId}/edit`}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                Cập nhật
              </Link>
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0 gap-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 shrink-0" aria-hidden />
                Xóa
              </Button>
            </div>
          )}
        </div>
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
                    Bạn đã gửi đơn tham gia. Khi được duyệt, nông trại sẽ gắn
                    với hợp tác xã.
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

      <div className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">Chứng chỉ nông trại</h2>
            <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
              {
                allCerts.filter(
                  (c) => c.status !== "expired" && c.status !== "revoked",
                ).length
              }{" "}
              còn hiệu lực
            </Badge>
          </div>
          {farm != null && (
            <Button
              type="button"
              className="h-9 shrink-0 gap-2 bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]"
              onClick={() => setCertDialogOpen(true)}
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Thêm chứng chỉ
            </Button>
          )}
        </div>

        <div className="mt-3">
          {certsQuery.isLoading ? (
            <div className="grid gap-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`cert-skeleton-${index}`}
                  className="h-16 animate-pulse rounded-lg bg-[hsl(120,20%,94%)]"
                />
              ))}
            </div>
          ) : certs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[hsl(142,15%,85%)] bg-[hsl(120,20%,98%)] p-4 text-sm text-muted-foreground">
              {archivedCertCount > 0 && !showArchivedCerts
                ? `Nông trại hiện không có chứng chỉ còn hiệu lực. Có ${archivedCertCount} chứng chỉ đã hết hạn/vô hiệu.`
                : "Nông trại này chưa có chứng chỉ nào."}
            </div>
          ) : (
            <div className="grid gap-2">
              {certs.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-2 rounded-lg border border-[hsl(142,15%,90%)] bg-white p-3 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                      <span className="font-semibold">
                        {CERT_TYPE_LABEL[c.type]}
                      </span>
                      <Badge className={getCertStatusClass(c.status)}>
                        {getCertStatusLabel(c.status)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {c.approver_scope === "cooperative"
                          ? "HTX duyệt"
                          : "Admin duyệt"}
                      </Badge>
                    </div>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-xs text-muted-foreground">
                      <dt>Số giấy:</dt>
                      <dd className="text-foreground">
                        {c.certificate_no ?? "—"}
                      </dd>
                      <dt>Đơn vị cấp:</dt>
                      <dd className="text-foreground">{c.issuer ?? "—"}</dd>
                      <dt>Hiệu lực:</dt>
                      <dd className="text-foreground">
                        {formatCertDate(c.issued_at)} →{" "}
                        {formatCertDate(c.expires_at)}
                      </dd>
                    </dl>
                    {c.reject_reason && c.status === "rejected" && (
                      <p className="text-xs text-red-600">
                        Lý do từ chối: {c.reject_reason}
                      </p>
                    )}
                  </div>
                  {c.file_url && (
                    <a
                      href={c.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 self-start text-xs text-primary hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      Xem file
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {archivedCertCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowArchivedCerts((v) => !v)}
            >
              {showArchivedCerts
                ? `Ẩn chứng chỉ đã hết hạn / vô hiệu (${archivedCertCount})`
                : `Hiển thị chứng chỉ đã hết hạn / vô hiệu (${archivedCertCount})`}
            </Button>
          )}
        </div>
      </div>

      {farm != null && (
        <FarmCertUploadDialog
          open={certDialogOpen}
          onOpenChange={setCertDialogOpen}
          fixedFarmId={farmId}
          fixedFarmName={farm.name}
        />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa nông trại?</DialogTitle>
            <DialogDescription className="text-left">
              Hành động này không thể hoàn tác. Chỉ xóa được khi trại{" "}
              <strong>chưa có mùa vụ</strong>, <strong>chưa có nhật ký</strong>,{" "}
              <strong>chưa có hồ sơ HTX</strong> (kể cả chờ duyệt) và{" "}
              <strong>chưa tạo gian hàng</strong>. Trang này chỉ liệt kê mùa vụ
              — nếu bạn đã mở Gian hàng hoặc gửi đơn vào hợp tác xã, vẫn không
              xóa được dù chưa có vụ.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteFarmMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteFarmMutation.isPending}
              onClick={() => {
                deleteFarmMutation.mutate(farmId, {
                  onSettled: () => setDeleteOpen(false),
                });
              }}
            >
              {deleteFarmMutation.isPending ? "Đang xóa..." : "Xóa nông trại"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold">Mùa vụ của nông trại</h2>
            {pagination && (
              <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary">
                {pagination.total} vụ
              </Badge>
            )}
          </div>
          {farm != null && (
            <Link
              href={`/farmer/farms/${farmId}/seasons/create`}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[hsl(142,71%,45%)] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[hsl(142,71%,40%)]"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Tạo mùa vụ
            </Link>
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
                            <h3 className="text-base font-semibold">
                              {season.code}
                            </h3>
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
                            {new Date(season.startDate).toLocaleDateString(
                              "vi-VN",
                            )}
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
  const farmId = Array.isArray(params.farmId)
    ? params.farmId[0]
    : params.farmId;
  if (!farmId) return null;
  // Re-mount content when farm changes to naturally reset local pagination.
  return <FarmSeasonsPageContent key={farmId} farmId={farmId} />;
}
