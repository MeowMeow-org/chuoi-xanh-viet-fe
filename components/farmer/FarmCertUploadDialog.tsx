"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, type SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Loader2, Upload } from "lucide-react";

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
import { toast } from "@/components/ui/toast";

import { useCreateFarmCertMutation } from "@/hooks/useCertificate";
import { uploadService } from "@/services/upload/uploadService";
import {
  farmCertUploadDefaults,
  farmCertUploadFormSchema,
  type FarmCertUploadFormValues,
} from "@/schemas/certificateSchema";
import { cn } from "@/lib/utils";
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

const errText = "text-xs text-destructive";

export function FarmCertUploadDialog({
  open,
  onOpenChange,
  fixedFarmId,
  farms = [],
  fixedFarmName,
  onSuccess,
}: Props) {
  const [farmId, setFarmId] = useState<string>(
    fixedFarmId ?? farms[0]?.id ?? "",
  );
  const [type, setType] = useState<CertType>("vietgap");
  const [uploading, setUploading] = useState(false);

  const createMutation = useCreateFarmCertMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FarmCertUploadFormValues>({
    resolver: zodResolver(farmCertUploadFormSchema),
    defaultValues: farmCertUploadDefaults,
    mode: "onBlur",
    /** Sau khi có lỗi / đổi giá trị (đặc biệt file): validate lại ngay, không chờ blur chỗ khác */
    reValidateMode: "onChange",
  });

  const farmOptions = useMemo(
    () => farms.map((f) => ({ value: f.id, label: f.name })),
    [farms],
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset(farmCertUploadDefaults);
      setType("vietgap");
      if (!fixedFarmId) setFarmId(farms[0]?.id ?? "");
    }
    onOpenChange(next);
  };

  const onInvalid: SubmitErrorHandler<FarmCertUploadFormValues> = (errs) => {
    const msg =
      errs.expiresAt?.message ??
      errs.issuedAt?.message ??
      errs.certNo?.message ??
      errs.issuer?.message ??
      errs.file?.message;
    if (msg) toast.error(String(msg));
  };

  const onSubmit = async (data: FarmCertUploadFormValues) => {
    const effectiveFarmId = fixedFarmId ?? farmId;
    if (!effectiveFarmId) {
      toast.error("Vui lòng chọn nông trại");
      return;
    }

    const certFile = data.file;
    if (!(certFile instanceof File)) {
      toast.error("Thiếu file chứng chỉ");
      return;
    }

    try {
      setUploading(true);
      const up = await uploadService.uploadDocuments([certFile]);
      const fileUrl = up.items[0]?.url;
      if (!fileUrl) throw new Error("Không lấy được URL file");

      await createMutation.mutateAsync({
        farm_id: effectiveFarmId,
        type,
        certificate_no: data.certNo.trim(),
        issuer: data.issuer.trim(),
        issued_at: data.issuedAt,
        expires_at: data.expiresAt,
        file_url: fileUrl,
      });

      toast.success("Đã nộp chứng chỉ, vui lòng chờ duyệt");
      onSuccess?.();
      handleOpenChange(false);
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

        <form
          className="space-y-3"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
        >
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
              <Label htmlFor="farm-cert-no">Số giấy</Label>
              <Input
                id="farm-cert-no"
                autoComplete="off"
                placeholder="VD: VG-0001/2025"
                aria-invalid={!!errors.certNo}
                className={cn(errors.certNo && "border-destructive")}
                {...register("certNo")}
              />
              {errors.certNo ? (
                <p className={errText} role="alert">
                  {errors.certNo.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="farm-cert-issuer">Đơn vị cấp</Label>
              <Input
                id="farm-cert-issuer"
                autoComplete="organization"
                placeholder="TT Kỹ thuật..."
                aria-invalid={!!errors.issuer}
                className={cn(errors.issuer && "border-destructive")}
                {...register("issuer")}
              />
              {errors.issuer ? (
                <p className={errText} role="alert">
                  {errors.issuer.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="farm-cert-issued">Ngày cấp</Label>
              <Input
                id="farm-cert-issued"
                type="date"
                aria-invalid={!!errors.issuedAt}
                className={cn(errors.issuedAt && "border-destructive")}
                {...register("issuedAt", { deps: ["expiresAt"] })}
              />
              {errors.issuedAt ? (
                <p className={errText} role="alert">
                  {errors.issuedAt.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="farm-cert-expires">Hiệu lực đến</Label>
              <Input
                id="farm-cert-expires"
                type="date"
                aria-invalid={!!errors.expiresAt}
                className={cn(errors.expiresAt && "border-destructive")}
                {...register("expiresAt", { deps: ["issuedAt"] })}
              />
              {errors.expiresAt ? (
                <p className={errText} role="alert">
                  {errors.expiresAt.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="farm-cert-file">File (PDF / ảnh)</Label>
            <Controller
              name="file"
              control={control}
              render={({ field: { name, ref } }) => (
                <Input
                  id="farm-cert-file"
                  ref={ref}
                  name={name}
                  type="file"
                  accept="application/pdf,image/*"
                  aria-invalid={!!errors.file}
                  className={cn(errors.file && "border-destructive")}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setValue("file", f, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                />
              )}
            />
            {errors.file ? (
              <p className={errText} role="alert">
                {errors.file.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tối đa 15 MB. Định dạng: PDF hoặc ảnh (JPEG, PNG, WebP, GIF).
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={uploading}
              className="gap-1"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Nộp chứng chỉ
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
