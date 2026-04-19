"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Check,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FancySelect } from "@/components/ui/fancy-select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  useApproveFarmCertMutation,
  useCreateCoopCertMutation,
  useDeleteCoopCertMutation,
  useMyCoopCertsQuery,
  usePendingFarmCertsForCoopQuery,
  useRejectFarmCertMutation,
} from "@/hooks/useCertificate";
import { uploadService } from "@/services/upload/uploadService";
import {
  CERT_TYPE_LABEL,
  type CertType,
  type CooperativeCertificate,
  type FarmCertificate,
} from "@/services/certificate";
import { cn } from "@/lib/utils";
import {
  coopCertCreateSchema,
  type CoopCertCreateFormValues,
} from "@/schemas/certificateSchema";

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("vi-VN");
}

function FieldValue({ value }: { value: string | null | undefined }) {
  const t = value?.trim();
  if (!t) {
    return (
      <span className="text-muted-foreground/75 italic">Chưa cập nhật</span>
    );
  }
  return <span className="text-foreground">{t}</span>;
}

/** Hai nút footer thẻ chứng chỉ HTX: cùng cỡ chữ (ghi đè text-sm của Button) */
const coopCertFooterActionText =
  "min-h-10 w-full justify-center px-3 py-2.5 !text-[13px] !font-medium !leading-[1.35] tracking-normal";

export default function CooperativeCertificatesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(142,50%,35%)]">
          Hợp tác xã
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(150,10%,16%)]">
          Chứng chỉ HTX
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Quản lý chứng chỉ cấp cho HTX và danh sách nông hộ được thừa hưởng
          chứng chỉ. Đồng thời duyệt hồ sơ chứng chỉ do nông hộ thành viên tự
          nộp.
        </p>
      </div>

      <Tabs defaultValue="coop-certs">
        <TabsList className="mb-4 w-full justify-start sm:w-auto">
          <TabsTrigger value="coop-certs">Chứng chỉ của HTX</TabsTrigger>
          <TabsTrigger value="pending">Duyệt hộ viên</TabsTrigger>
        </TabsList>

        <TabsContent value="coop-certs">
          <CoopCertsSection />
        </TabsContent>

        <TabsContent value="pending">
          <PendingFarmCertsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CoopCertsSection() {
  const [createOpen, setCreateOpen] = useState(false);
  const [certToDelete, setCertToDelete] =
    useState<CooperativeCertificate | null>(null);

  const listQuery = useMyCoopCertsQuery({ page: 1, limit: 100 });
  const items = listQuery.data?.items ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={
              <Button className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" />
                Thêm chứng chỉ HTX
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <CoopCertCreateForm
              open={createOpen}
              onSuccess={() => {
                setCreateOpen(false);
                toast.success("Đã thêm chứng chỉ HTX");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {listQuery.isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-[hsl(142,20%,88%)] bg-[hsl(120,30%,99%)]/80">
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground">
              HTX chưa đăng ký chứng chỉ nào. Thêm chứng chỉ để thiết lập danh
              sách thừa hưởng cho nông hộ thành viên.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <Card
              key={c.id}
              className="overflow-hidden border-[hsl(142,15%,88%)] bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        c.status === "active"
                          ? "bg-[hsl(142,71%,45%)]/12"
                          : "bg-muted/60",
                      )}
                    >
                      <ShieldCheck
                        className={cn(
                          "h-5 w-5",
                          c.status === "active"
                            ? "text-[hsl(142,71%,38%)]"
                            : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        <h3 className="text-base font-semibold leading-tight tracking-tight text-[hsl(150,10%,18%)]">
                          {CERT_TYPE_LABEL[c.type]}
                        </h3>
                        <Badge
                          variant={
                            c.status === "active" ? "default" : "outline"
                          }
                          className="h-6 px-2 text-[11px] font-medium"
                        >
                          {c.status === "active"
                            ? "Hiệu lực"
                            : c.status === "expired"
                              ? "Hết hạn"
                              : "Đã thu hồi"}
                        </Badge>
                        <span className="inline-flex items-center rounded-full border border-[hsl(142,18%,88%)] bg-[hsl(120,25%,97%)] px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                          {c._count?.scope ?? 0} nông hộ
                        </span>
                      </div>
                      {c.revoke_reason && (
                        <p className="rounded-md border border-red-200/80 bg-red-50/80 px-2.5 py-1.5 text-xs text-red-700">
                          <span className="font-medium">Lý do thu hồi: </span>
                          {c.revoke_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {c.file_url && (
                    <a
                      href={c.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-[hsl(142,18%,88%)] bg-[hsl(120,25%,99%)] px-3 py-2 text-xs font-medium text-[hsl(142,71%,32%)] transition-colors hover:border-[hsl(142,50%,70%)] hover:bg-[hsl(142,71%,45%)]/8 sm:py-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Xem file
                    </a>
                  )}
                </div>

                <div className="grid gap-px bg-[hsl(142,14%,92%)] sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: "Số giấy",
                      node: <FieldValue value={c.certificate_no} />,
                    },
                    {
                      label: "Đơn vị cấp",
                      node: <FieldValue value={c.issuer} />,
                    },
                    {
                      label: "Ngày cấp",
                      node: (
                        <span className="text-sm tabular-nums text-foreground">
                          {formatDate(c.issued_at) ?? (
                            <span className="text-muted-foreground/75 italic">
                              Chưa cập nhật
                            </span>
                          )}
                        </span>
                      ),
                    },
                    {
                      label: "Hiệu lực đến",
                      node: (
                        <span className="text-sm tabular-nums text-foreground">
                          {formatDate(c.expires_at) ?? (
                            <span className="text-muted-foreground/75 italic">
                              Chưa cập nhật
                            </span>
                          )}
                        </span>
                      ),
                    },
                  ].map((cell) => (
                    <div
                      key={cell.label}
                      className="bg-[hsl(120,30%,99%)] px-4 py-3 sm:min-h-17"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {cell.label}
                      </p>
                      <div className="mt-1">{cell.node}</div>
                    </div>
                  ))}
                </div>

                <div className="flex w-full flex-col gap-2 border-t border-[hsl(142,14%,92%)] bg-white px-4 py-2.5">
                  <Link
                    href={`/cooperative/certificates/${c.id}/thua-huong`}
                    className={cn(
                      "inline-flex items-center rounded-lg border border-[hsl(142,25%,82%)] bg-background text-center text-foreground transition hover:bg-[hsl(142,71%,45%)]/8",
                      coopCertFooterActionText,
                    )}
                  >
                    Danh sách thừa hưởng
                  </Link>
                  {c.status === "active" && (
                    <Button
                      variant="outline"
                      className={cn(
                        "h-auto gap-2 border-red-200/90 text-red-600 hover:bg-red-50 [&_svg]:!h-[13px] [&_svg]:!w-[13px] [&_svg]:!min-h-[13px] [&_svg]:!min-w-[13px]",
                        coopCertFooterActionText,
                      )}
                      onClick={() => setCertToDelete(c)}
                    >
                      <Trash2 className="!h-[13px] !w-[13px] shrink-0" aria-hidden />
                      Gỡ chứng chỉ
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!certToDelete}
        onOpenChange={(open) => !open && setCertToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          {certToDelete && (
            <DeleteCoopCertDialog
              certificate={certToDelete}
              onClose={() => setCertToDelete(null)}
              onDeleted={() => {
                setCertToDelete(null);
                toast.success("Đã gỡ chứng chỉ");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const coopCertCreateDefaults: CoopCertCreateFormValues = {
  type: "vietgap",
  certificate_no: "",
  issuer: "",
  issued_at: "",
  expires_at: "",
  file: undefined,
};

function CoopCertCreateForm({
  open,
  onSuccess,
}: {
  open: boolean;
  onSuccess: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const createMutation = useCreateCoopCertMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoopCertCreateFormValues>({
    resolver: zodResolver(coopCertCreateSchema),
    defaultValues: coopCertCreateDefaults,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset(coopCertCreateDefaults);
    }
  }, [open, reset]);

  const typeOptions = useMemo(
    () => [
      { value: "vietgap", label: "VietGAP" },
      { value: "globalgap", label: "GlobalGAP" },
      { value: "organic", label: "Hữu cơ" },
      { value: "other", label: "Khác" },
    ],
    [],
  );

  const onSubmit = async (data: CoopCertCreateFormValues) => {
    const file = data.file;
    if (!(file instanceof File)) return;
    try {
      setUploading(true);
      const up = await uploadService.uploadDocuments([file]);
      const fileUrl = up.items[0]?.url;
      if (!fileUrl) throw new Error("Không lấy được URL file");
      await createMutation.mutateAsync({
        type: data.type as CertType,
        certificate_no: data.certificate_no.trim() || null,
        issuer: data.issuer.trim() || null,
        issued_at: data.issued_at || null,
        expires_at: data.expires_at || null,
        file_url: fileUrl,
      });
      reset(coopCertCreateDefaults);
      onSuccess();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể thêm chứng chỉ";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const errText = "text-sm text-destructive";

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          Thêm chứng chỉ HTX
        </DialogTitle>
      </DialogHeader>
      <form
        className="space-y-3"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="space-y-1.5">
          <Label htmlFor="coop-cert-type">Loại chứng chỉ</Label>
          <div
            className={cn(
              errors.type && "rounded-md ring-2 ring-destructive ring-offset-1",
            )}
          >
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <FancySelect
                  value={field.value}
                  onChange={field.onChange}
                  options={typeOptions}
                />
              )}
            />
          </div>
          {errors.type ? (
            <p className={errText} role="alert">
              {errors.type.message}
            </p>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="coop-cert-no">Số giấy</Label>
            <Input
              id="coop-cert-no"
              autoComplete="off"
              aria-invalid={!!errors.certificate_no}
              {...register("certificate_no")}
            />
            {errors.certificate_no ? (
              <p className={errText} role="alert">
                {errors.certificate_no.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coop-cert-issuer">Đơn vị cấp</Label>
            <Input
              id="coop-cert-issuer"
              autoComplete="organization"
              aria-invalid={!!errors.issuer}
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
            <Label htmlFor="coop-cert-issued">Ngày cấp</Label>
            <Input
              id="coop-cert-issued"
              type="date"
              aria-invalid={!!errors.issued_at}
              {...register("issued_at")}
            />
            {errors.issued_at ? (
              <p className={errText} role="alert">
                {errors.issued_at.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coop-cert-expires">Hiệu lực đến</Label>
            <Input
              id="coop-cert-expires"
              type="date"
              aria-invalid={!!errors.expires_at}
              {...register("expires_at")}
            />
            {errors.expires_at ? (
              <p className={errText} role="alert">
                {errors.expires_at.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="coop-cert-file">File (PDF / ảnh)</Label>
          <Controller
            name="file"
            control={control}
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <Input
                id="coop-cert-file"
                ref={ref}
                name={name}
                onBlur={onBlur}
                type="file"
                accept="application/pdf,image/*"
                aria-invalid={!!errors.file}
                onChange={(e) => {
                  onChange(e.target.files?.[0]);
                }}
              />
            )}
          />
          {errors.file ? (
            <p className={errText} role="alert">
              {errors.file.message}
            </p>
          ) : null}
        </div>
        <DialogFooter className="pt-1 sm:justify-stretch">
          <Button
            type="submit"
            disabled={uploading}
            className="w-full gap-1 sm:w-auto"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Lưu
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function DeleteCoopCertDialog({
  certificate,
  onClose,
  onDeleted,
}: {
  certificate: CooperativeCertificate;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const deleteMutation = useDeleteCoopCertMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(certificate.id);
      onDeleted();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể gỡ chứng chỉ";
      toast.error(message);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Gỡ chứng chỉ HTX</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Gỡ sẽ <span className="font-medium text-foreground">xóa vĩnh viễn</span>{" "}
          chứng chỉ này và{" "}
          <span className="font-medium text-foreground">
            toàn bộ danh sách thừa hưởng
          </span>{" "}
          đã gán. Thao tác dành cho HTX khi nhập sai hoặc không còn dùng bản
          ghi này. Thu hồi có lý do (giữ lịch sử) do quản trị viên thực hiện.
        </p>
      </div>
      <DialogFooter className="gap-2 sm:justify-end">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={deleteMutation.isPending}
        >
          Hủy
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="gap-1"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Gỡ chứng chỉ
        </Button>
      </DialogFooter>
    </>
  );
}

function PendingFarmCertsSection() {
  const query = usePendingFarmCertsForCoopQuery({ page: 1, limit: 100 });
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
    <div className="space-y-3">
      {query.isLoading ? (
        <div className="py-12 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-[hsl(142,20%,88%)] bg-[hsl(120,30%,99%)]/80">
          <CardContent className="p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Không có hồ sơ chờ duyệt.
            </p>
          </CardContent>
        </Card>
      ) : (
        items.map((c) => (
          <Card
            key={c.id}
            className="overflow-hidden border-[hsl(142,15%,88%)] bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <CardContent className="p-0">
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="flex min-w-0 flex-1 gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                    <ShieldCheck className="h-5 w-5 text-amber-700/90" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <h3 className="text-base font-semibold leading-tight tracking-tight text-[hsl(150,10%,18%)]">
                        {CERT_TYPE_LABEL[c.type]}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="h-6 px-2 text-[11px] font-medium"
                      >
                        Chờ duyệt
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/90">
                        {c.farm?.users?.full_name ?? "—"}
                      </span>
                      <span className="mx-1.5 text-muted-foreground/60">·</span>
                      <span>{c.farm?.name ?? "Nông trại"}</span>
                    </p>
                  </div>
                </div>
                {c.file_url && (
                  <a
                    href={c.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-[hsl(142,18%,88%)] bg-[hsl(120,25%,99%)] px-3 py-2 text-xs font-medium text-[hsl(142,71%,32%)] transition-colors hover:border-[hsl(142,50%,70%)] hover:bg-[hsl(142,71%,45%)]/8 sm:py-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Xem file
                  </a>
                )}
              </div>

              <div className="grid gap-px bg-[hsl(142,14%,92%)] sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Số giấy",
                    node: <FieldValue value={c.certificate_no} />,
                  },
                  {
                    label: "Đơn vị cấp",
                    node: <FieldValue value={c.issuer} />,
                  },
                  {
                    label: "Ngày cấp",
                    node: (
                      <span className="text-sm tabular-nums text-foreground">
                        {formatDate(c.issued_at) ?? (
                          <span className="text-muted-foreground/75 italic">
                            Chưa cập nhật
                          </span>
                        )}
                      </span>
                    ),
                  },
                  {
                    label: "Hiệu lực đến",
                    node: (
                      <span className="text-sm tabular-nums text-foreground">
                        {formatDate(c.expires_at) ?? (
                          <span className="text-muted-foreground/75 italic">
                            Chưa cập nhật
                          </span>
                        )}
                      </span>
                    ),
                  },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    className="bg-[hsl(120,30%,99%)] px-4 py-3 sm:min-h-17"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {cell.label}
                    </p>
                    <div className="mt-1">{cell.node}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[hsl(142,14%,92%)] px-4 py-2.5">
                <Button
                  size="sm"
                  className="h-9 gap-1.5 text-[13px] font-medium"
                  onClick={() => handleApprove(c.id)}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Duyệt
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 border-red-200/90 text-[13px] font-medium text-red-600 hover:bg-red-50"
                  onClick={() => setRejectTarget(c)}
                >
                  <UserX className="h-3.5 w-3.5" />
                  Từ chối
                </Button>
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
            <RejectForm
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

function RejectForm({
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
        <DialogTitle>Từ chối chứng chỉ</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <Label>Lý do từ chối</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ghi rõ lý do để nông hộ điều chỉnh..."
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

