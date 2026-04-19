"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FancySelect } from "@/components/ui/fancy-select";

import { useMyFarmsQuery } from "@/hooks/useFarm";
import {
  useCreateFarmCertMutation,
  useMyFarmCertsQuery,
} from "@/hooks/useCertificate";
import { uploadService } from "@/services/upload/uploadService";
import { CERT_TYPE_LABEL, type CertType } from "@/services/certificate";

function statusColor(
  status: "pending" | "approved" | "rejected" | "revoked",
): "default" | "secondary" | "outline" {
  if (status === "approved") return "default";
  if (status === "pending") return "secondary";
  return "outline";
}

function statusLabel(
  status: "pending" | "approved" | "rejected" | "revoked",
): string {
  if (status === "pending") return "Chờ duyệt";
  if (status === "approved") return "Đã duyệt";
  if (status === "rejected") return "Bị từ chối";
  return "Đã vô hiệu";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN");
}

export default function FarmerCertificatesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { farms } = useMyFarmsQuery({ page: 1, limit: 100 });
  const myCertsQuery = useMyFarmCertsQuery({ page: 1, limit: 100 });

  const items = myCertsQuery.data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Chứng chỉ nông trại</h1>
          <p className="text-sm text-muted-foreground">
            Nộp và theo dõi trạng thái VietGAP (và các chứng chỉ khác). Nếu
            nông trại đã thuộc HTX, HTX sẽ là người duyệt. Nông hộ độc lập
            sẽ do quản trị viên duyệt.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Nộp chứng chỉ
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <FarmCertUploadForm
              farms={farms.map((f) => ({ id: f.id, name: f.name }))}
              onSuccess={() => {
                setDialogOpen(false);
                toast.success("Đã nộp chứng chỉ, vui lòng chờ duyệt");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {myCertsQuery.isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Bạn chưa nộp chứng chỉ nào. Nhấn &quot;Nộp chứng chỉ&quot; để bắt
            đầu.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((c) => (
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
                      <Badge variant="outline" className="text-[10px]">
                        {c.approver_scope === "cooperative"
                          ? "HTX duyệt"
                          : "Admin duyệt"}
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
                        {formatDate(c.issued_at)} →{" "}
                        {formatDate(c.expires_at)}
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
        </div>
      )}
    </div>
  );
}

function FarmCertUploadForm({
  farms,
  onSuccess,
}: {
  farms: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}) {
  const [farmId, setFarmId] = useState(farms[0]?.id ?? "");
  const [type, setType] = useState<CertType>("vietgap");
  const [certNo, setCertNo] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const createMutation = useCreateFarmCertMutation();
  const farmOptions = useMemo(
    () => farms.map((f) => ({ value: f.id, label: f.name })),
    [farms],
  );
  const typeOptions = useMemo(
    () => [
      { value: "vietgap", label: "VietGAP" },
      { value: "globalgap", label: "GlobalGAP" },
      { value: "organic", label: "Hữu cơ" },
      { value: "other", label: "Khác" },
    ],
    [],
  );

  const handleSubmit = async () => {
    if (!farmId) {
      toast.error("Vui lòng chọn nông trại");
      return;
    }
    if (!file) {
      toast.error("Vui lòng tải lên file chứng chỉ");
      return;
    }

    try {
      setUploading(true);
      const up = await uploadService.uploadDocuments([file]);
      const fileUrl = up.items[0]?.url;
      if (!fileUrl) throw new Error("Không lấy được URL file");

      await createMutation.mutateAsync({
        farm_id: farmId,
        type,
        certificate_no: certNo || null,
        issuer: issuer || null,
        issued_at: issuedAt || null,
        expires_at: expiresAt || null,
        file_url: fileUrl,
      });
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể nộp chứng chỉ";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          Nộp chứng chỉ mới
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>Nông trại</Label>
          <FancySelect
            value={farmId}
            onChange={setFarmId}
            options={farmOptions}
            placeholder="Chọn nông trại"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Loại chứng chỉ</Label>
          <FancySelect
            value={type}
            onChange={(v) => setType(v as CertType)}
            options={typeOptions}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label>Số giấy</Label>
            <Input
              value={certNo}
              onChange={(e) => setCertNo(e.target.value)}
              placeholder="VD: VG-0001/2025"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Đơn vị cấp</Label>
            <Input
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="TT Kỹ thuật..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label>Ngày cấp</Label>
            <Input
              type="date"
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Hiệu lực đến</Label>
            <Input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>File (PDF / ảnh)</Label>
          <Input
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} disabled={uploading} className="gap-1">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Nộp chứng chỉ
        </Button>
      </DialogFooter>
    </>
  );
}
