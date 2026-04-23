"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  FileText,
  Loader2,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  useApproveFarmCertMutation,
  usePendingFarmCertsForAdminQuery,
  useRejectFarmCertMutation,
} from "@/hooks/useCertificate";
import { CERT_TYPE_LABEL, type FarmCertificate } from "@/services/certificate";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export default function AdminCertificatesPage() {
  const searchParams = useSearchParams();
  const highlightFarmCert = searchParams.get("highlightFarmCert");

  return (
    <main className="bg-[hsl(120,20%,98%)] px-4 py-6 text-[hsl(150,10%,15%)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <header className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(142,50%,35%)]">
            Quản trị chứng chỉ
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
            Duyệt chứng chỉ nông hộ độc lập
          </h1>
          <p className="mt-2 text-sm text-[hsl(150,5%,45%)]">
            Admin duyệt chứng chỉ của các nông hộ không thuộc HTX nào. HTX tự
            quản lý chứng chỉ của HTX và duyệt hộ viên của mình.
          </p>
        </header>

        <Tabs defaultValue="pending">
          <TabsList className="mb-3">
            <TabsTrigger value="pending">
              <ShieldCheck className="mr-1 h-4 w-4" />
              Chờ duyệt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <AdminPendingFarmCertsSection
              highlightFarmCertId={highlightFarmCert}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function AdminPendingFarmCertsSection({
  highlightFarmCertId,
}: {
  highlightFarmCertId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = usePendingFarmCertsForAdminQuery({ page: 1, limit: 100 });
  const [rejectTarget, setRejectTarget] = useState<FarmCertificate | null>(
    null,
  );
  const [approveTarget, setApproveTarget] = useState<FarmCertificate | null>(
    null,
  );

  const items = query.data?.items ?? [];

  useEffect(() => {
    if (!highlightFarmCertId || query.isLoading || items.length === 0) return;
    if (!items.some((c) => c.id === highlightFarmCertId)) return;

    const elId = `pending-farm-cert-${highlightFarmCertId}`;
    const t = window.setTimeout(() => {
      const el = document.getElementById(elId);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add(
        "ring-2",
        "ring-[hsl(142,71%,42%)]",
        "ring-offset-2",
        "rounded-xl",
      );
      window.setTimeout(() => {
        el.classList.remove(
          "ring-2",
          "ring-[hsl(142,71%,42%)]",
          "ring-offset-2",
          "rounded-xl",
        );
      }, 2800);
    }, 150);

    const strip = window.setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString());
      if (!p.has("highlightFarmCert")) return;
      p.delete("highlightFarmCert");
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }, 3200);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(strip);
    };
  }, [
    highlightFarmCertId,
    items,
    pathname,
    query.isLoading,
    router,
    searchParams,
  ]);

  return (
    <div className="space-y-2">
      {query.isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Không có hồ sơ chờ duyệt.
          </CardContent>
        </Card>
      ) : (
        items.map((c) => (
          <Card
            key={c.id}
            id={`pending-farm-cert-${c.id}`}
            className="scroll-mt-24"
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="font-semibold">
                      {CERT_TYPE_LABEL[c.type]}
                    </span>
                    <Badge variant="secondary">Chờ duyệt</Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Nông hộ độc lập
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Nông hộ: <b>{c.farm?.users?.full_name ?? "—"}</b> — Nông
                    trại: <b>{c.farm?.name ?? "—"}</b>
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
                    <dt>Địa chỉ:</dt>
                    <dd className="text-foreground">
                      {[c.farm?.ward, c.farm?.district, c.farm?.province]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </dd>
                  </dl>
                </div>
                <div className="flex flex-col items-end gap-1">
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
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => setApproveTarget(c)}
                      className="gap-1"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600"
                      onClick={() => setRejectTarget(c)}
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => !open && setApproveTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          {approveTarget && (
            <AdminApproveForm
              certificate={approveTarget}
              onCancel={() => setApproveTarget(null)}
              onSuccess={() => {
                setApproveTarget(null);
                toast.success("Đã duyệt chứng chỉ");
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          {rejectTarget && (
            <AdminRejectForm
              certificate={rejectTarget}
              onCancel={() => setRejectTarget(null)}
              onSuccess={() => {
                setRejectTarget(null);
                toast.success("Đã từ chối");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminApproveForm({
  certificate,
  onCancel,
  onSuccess,
}: {
  certificate: FarmCertificate;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [note, setNote] = useState("");
  const approveMutation = useApproveFarmCertMutation();

  const handleSubmit = async () => {
    try {
      await approveMutation.mutateAsync({
        certificateId: certificate.id,
        note: note.trim() || undefined,
      });
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể duyệt";
      toast.error(message);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-[hsl(142,71%,40%)]" />
          Duyệt chứng chỉ
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <Label>Ghi chú gửi nông hộ (tùy chọn)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Hồ sơ hợp lệ, chúc mùa vụ tốt…"
          rows={3}
        />
      </div>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={approveMutation.isPending}
          className="gap-1"
        >
          {approveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Xác nhận duyệt
        </Button>
      </DialogFooter>
    </>
  );
}

function AdminRejectForm({
  certificate,
  onCancel,
  onSuccess,
}: {
  certificate: FarmCertificate;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const rejectMutation = useRejectFarmCertMutation();

  const handleSubmit = async () => {
    if (reason.trim().length < 5) {
      toast.error("Vui lòng nhập lý do (tối thiểu 5 ký tự)");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        certificateId: certificate.id,
        reason: reason.trim(),
      });
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể từ chối";
      toast.error(message);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldOff className="h-5 w-5 text-red-600" />
          Từ chối chứng chỉ
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <Label>Lý do từ chối</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: file không rõ ràng, sai thông tin..."
        />
      </div>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={rejectMutation.isPending}
          className="gap-1"
        >
          <Check className="h-4 w-4" />
          Gửi
        </Button>
      </DialogFooter>
    </>
  );
}

