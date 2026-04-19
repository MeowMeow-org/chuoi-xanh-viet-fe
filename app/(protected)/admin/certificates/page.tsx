"use client";

import { useState } from "react";
import {
  Check,
  FileText,
  Loader2,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

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
            <AdminPendingFarmCertsSection />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function AdminPendingFarmCertsSection() {
  const query = usePendingFarmCertsForAdminQuery({ page: 1, limit: 100 });
  const [rejectTarget, setRejectTarget] = useState<FarmCertificate | null>(
    null,
  );
  const approveMutation = useApproveFarmCertMutation();

  const items = query.data?.items ?? [];

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Đã duyệt chứng chỉ");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể duyệt";
      toast.error(message);
    }
  };

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
          <Card key={c.id}>
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
                      onClick={() => handleApprove(c.id)}
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
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          {rejectTarget && (
            <AdminRejectForm
              certificate={rejectTarget}
              onDone={() => {
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

function AdminRejectForm({
  certificate,
  onDone,
}: {
  certificate: FarmCertificate;
  onDone: () => void;
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
      onDone();
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
      <DialogFooter>
        <Button
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
