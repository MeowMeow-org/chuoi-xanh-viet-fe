"use client";

import { useMemo, useState } from "react";
import { FileText, Loader2, Plus, ShieldCheck } from "lucide-react";

import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useMyFarmsQuery } from "@/hooks/useFarm";
import { useMyFarmCertsQuery } from "@/hooks/useCertificate";
import {
  CERT_TYPE_LABEL,
  type FarmCertStatus,
} from "@/services/certificate";
import { FarmCertUploadDialog } from "@/components/farmer/FarmCertUploadDialog";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types";

function statusColor(
  status: FarmCertStatus,
): "default" | "secondary" | "outline" {
  if (status === "approved") return "default";
  if (status === "pending") return "secondary";
  return "outline";
}

function statusLabel(status: FarmCertStatus): string {
  if (status === "pending") return "Chờ duyệt";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Bị từ chối";
  if (status === "expired") return "Hết hạn";
  return "Đã vô hiệu";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

const LIST_PAGE_SIZE = 5;

export default function FarmerCertificatesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [listPage, setListPage] = useState(1);
  const { farms } = useMyFarmsQuery({ page: 1, limit: 100 });
  const myCertsQuery = useMyFarmCertsQuery({ page: 1, limit: 100 });

  const allItems = useMemo(
    () => myCertsQuery.data?.items ?? [],
    [myCertsQuery.data],
  );
  const archivedCount = useMemo(
    () =>
      allItems.filter((c) => c.status === "expired" || c.status === "revoked")
        .length,
    [allItems],
  );
  const filteredItems = useMemo(
    () =>
      showArchived
        ? allItems
        : allItems.filter(
            (c) => c.status !== "expired" && c.status !== "revoked",
          ),
    [allItems, showArchived],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / LIST_PAGE_SIZE),
  );

  const safePage = Math.min(listPage, totalPages);
  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * LIST_PAGE_SIZE;
    return filteredItems.slice(start, start + LIST_PAGE_SIZE);
  }, [filteredItems, safePage]);

  const listMeta: PaginationMeta = useMemo(
    () => ({
      page: safePage,
      limit: LIST_PAGE_SIZE,
      total: filteredItems.length,
      totalPages,
      previousPage: safePage > 1 ? safePage - 1 : null,
      nextPage: safePage < totalPages ? safePage + 1 : null,
    }),
    [safePage, filteredItems.length, totalPages],
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Chứng chỉ nông trại</h1>
          <p className="text-sm text-muted-foreground">
            Nộp và theo dõi trạng thái VietGAP (và các chứng chỉ khác). Hệ thống
            sẽ chuyển hồ sơ tới HTX phù hợp gần nông trại nhất để xét duyệt.
          </p>
        </div>
        <Button className="gap-1" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Nộp chứng chỉ
        </Button>
        <FarmCertUploadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          farms={farms.map((f) => ({ id: f.id, name: f.name }))}
        />
      </div>

      {archivedCount > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            setShowArchived((v) => !v);
            setListPage(1);
          }}
        >
          {showArchived
            ? `Ẩn chứng chỉ đã hết hạn / vô hiệu (${archivedCount})`
            : `Hiển thị chứng chỉ đã hết hạn / vô hiệu (${archivedCount})`}
        </Button>
      )}

      {myCertsQuery.isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Bạn chưa nộp chứng chỉ nào. Nhấn &quot;Nộp chứng chỉ&quot; để bắt
            đầu.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pagedItems.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {CERT_TYPE_LABEL[c.type]}
                      </span>
                      <Badge variant={statusColor(c.status)}>
                        {statusLabel(c.status)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        title="Ai chịu trách nhiệm xét duyệt hồ sơ (khác với trạng thái «Đã duyệt»)"
                      >
                        HTX xét duyệt
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Nông trại: <b>{c.farm?.name ?? "—"}</b>
                    </p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-xs text-muted-foreground">
                      <dt>Số giấy:</dt>
                      <dd className="text-foreground">
                        {c.certificate_no ?? "—"}
                      </dd>
                      <dt>Đơn vị cấp:</dt>
                      <dd className="text-foreground">{c.issuer ?? "—"}</dd>
                      <dt>Hiệu lực:</dt>
                      <dd className="text-foreground">
                        {formatDate(c.issued_at)} → {formatDate(c.expires_at)}
                      </dd>
                    </dl>
                    {c.reviewer_note?.trim() &&
                      (c.status === "approved" ||
                        c.status === "rejected" ||
                        c.status === "revoked") && (
                        <p
                          className={cn(
                            "rounded-md border px-2.5 py-1.5 text-xs",
                            c.status === "rejected" || c.status === "revoked"
                              ? "border-red-200/90 bg-red-50/80 text-red-800"
                              : "border-[hsl(142,20%,88%)] bg-[hsl(120,30%,98%)] text-foreground",
                          )}
                        >
                          <span className="font-medium text-muted-foreground">
                            {c.status === "approved" &&
                              "Ghi chú từ người duyệt: "}
                            {c.status === "rejected" && "Lý do từ chối: "}
                            {c.status === "revoked" && "Ghi chú thu hồi: "}
                          </span>
                          {c.reviewer_note}
                        </p>
                      )}
                  </div>
                  {c.file_url && (
                    <a
                      href={c.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      Xem file
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {listMeta.totalPages > 1 ? (
            <Pagination
              meta={listMeta}
              onPageChange={(p) =>
                setListPage(Math.min(Math.max(1, p), totalPages))
              }
              className="pt-2"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
