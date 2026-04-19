"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FancySelect } from "@/components/ui/fancy-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateFarmCertMutation } from "@/hooks/useCertificate";
import { uploadService } from "@/services/upload/uploadService";
import { type CertType } from "@/services/certificate";

type FarmOption = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nếu truyền vào thì form sẽ khoá ở nông trại này và ẩn ô chọn. */
  fixedFarmId?: string;
  /** Dùng khi cho user chọn nông trại (không truyền `fixedFarmId`). */
  farms?: FarmOption[];
  /** Tên nông trại hiển thị read-only khi dùng `fixedFarmId`. */
  fixedFarmName?: string;
  onSuccess?: () => void;
};

const CERT_TYPE_OPTIONS: Array<{ value: CertType; label: string }> = [
  { value: "vietgap", label: "VietGAP" },
  { value: "globalgap", label: "GlobalGAP" },
  { value: "organic", label: "Hữu cơ" },
  { value: "other", label: "Khác" },
];

export function FarmCertUploadDialog({
  open,
  onOpenChange,
  fixedFarmId,
  farms = [],
  fixedFarmName,
  onSuccess,
}: Props) {
  const [farmId, setFarmId] = useState<string>(fixedFarmId ?? farms[0]?.id ?? "");
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

  const resetForm = () => {
    setType("vietgap");
    setCertNo("");
    setIssuer("");
    setIssuedAt("");
    setExpiresAt("");
    setFile(null);
    if (!fixedFarmId) {
      setFarmId(farms[0]?.id ?? "");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const effectiveFarmId = fixedFarmId ?? farmId;
    if (!effectiveFarmId) {
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
        farm_id: effectiveFarmId,
        type,
        certificate_no: certNo.trim() || null,
        issuer: issuer.trim() || null,
        issued_at: issuedAt || null,
        expires_at: expiresAt || null,
        file_url: fileUrl,
      });

      toast.success("Đã nộp chứng chỉ, vui lòng chờ duyệt");
      resetForm();
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể nộp chứng chỉ";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-primary" />
            Nộp chứng chỉ mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {fixedFarmId ? (
            <div className="space-y-1.5">
              <Label>Nông trại</Label>
              <div className="flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-foreground">
                {fixedFarmName ?? "—"}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label>Nông trại</Label>
              <FancySelect
                value={farmId}
                onChange={setFarmId}
                options={farmOptions}
                placeholder="Chọn nông trại"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Loại chứng chỉ</Label>
            <FancySelect
              value={type}
              onChange={(v) => setType(v as CertType)}
              options={CERT_TYPE_OPTIONS}
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
      </DialogContent>
    </Dialog>
  );
}
