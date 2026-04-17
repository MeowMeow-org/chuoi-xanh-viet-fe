"use client";

import { QRCodeCanvas } from "qrcode.react";
import {
  Copy,
  Download,
  Loader2,
  Package,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";

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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateSaleUnitMutation,
  useDeleteSaleUnitMutation,
  useSaleUnitsQuery,
} from "@/hooks/useSaleUnit";
import type { SaleUnit } from "@/services/sale-unit";
import { cn } from "@/lib/utils";

type LotUnit = "tấn" | "kg" | "g";

const LOT_UNIT_OPTIONS: { value: LotUnit; label: string }[] = [
  { value: "tấn", label: "tấn" },
  { value: "kg", label: "kg" },
  { value: "g", label: "gam" },
];

function lotQtyToKg(q: number, u: LotUnit): number {
  if (u === "tấn") return q * 1000;
  if (u === "kg") return q;
  return q * 0.001;
}

function formatKg(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return n >= 100 || Number.isInteger(n)
    ? n.toLocaleString("vi-VN", { maximumFractionDigits: 2 })
    : n.toLocaleString("vi-VN", { maximumFractionDigits: 4 });
}

function QrWithDownload({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const handleDownload = () => {
    const canvas = ref.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${label}.png`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-lg border bg-white p-2">
        <QRCodeCanvas
          ref={ref}
          value={value}
          size={140}
          level="M"
          includeMargin={false}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-1.5"
      >
        <Download className="h-3.5 w-3.5" />
        Tải PNG
      </Button>
    </div>
  );
}

function SaleUnitCard({
  saleUnit,
  onDelete,
}: {
  saleUnit: SaleUnit;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(saleUnit.qrUrl);
      setCopied(true);
      toast.success("Đã copy link truy xuất");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không copy được link");
    }
  };

  const statusBadge = {
    active: "bg-green-100 text-green-800",
    sold: "bg-blue-100 text-blue-800",
    disabled: "bg-gray-100 text-gray-600",
  } as const;

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:gap-4">
      <QrWithDownload value={saleUnit.qrUrl} label={saleUnit.shortCode ?? saleUnit.code} />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold">
                {saleUnit.shortCode ?? "--"}
              </span>
              <Badge
                className={`border-0 ${statusBadge[saleUnit.status] ?? "bg-gray-100"}`}
              >
                {saleUnit.status === "active"
                  ? "Đang bán"
                  : saleUnit.status === "sold"
                    ? "Đã bán"
                    : "Ngừng"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {saleUnit.quantity}{" "}
              {saleUnit.unit === "g" ? "gam" : saleUnit.unit}
              <span className="mx-2">·</span>
              {new Date(saleUnit.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(saleUnit.id)}
            title="Xoá / ngừng lô này"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-1 space-y-1 text-xs">
          <div className="flex items-start gap-1.5 break-all rounded-md bg-muted/50 p-2 font-mono">
            <span className="text-muted-foreground">URL: </span>
            <span className="min-w-0 flex-1">{saleUnit.qrUrl}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-7 gap-1.5 text-xs"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Đã copy!" : "Copy link"}
            </Button>
            {saleUnit.status === "active" && (
              <Link
                href={`/farmer/marketplace?saleUnitId=${encodeURIComponent(saleUnit.id)}`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "inline-flex h-7 gap-1.5 text-xs no-underline",
                )}
              >
                <Store className="h-3 w-3" />
                Đăng bán
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SaleUnitsSection({ seasonId }: { seasonId: string }) {
  const { data, isLoading } = useSaleUnitsQuery(seasonId);
  const createMutation = useCreateSaleUnitMutation();
  const deleteMutation = useDeleteSaleUnitMutation(seasonId);

  const list = data?.items ?? [];
  const totals = data?.totals;
  const seasonUnit = totals?.yieldUnit ?? "kg";
  const remainingKg = totals?.remainingKg ?? 0;
  const allocatedKg = totals?.allocatedKg ?? 0;
  const actualYieldKg = totals?.actualYieldKg ?? 0;

  const [showForm, setShowForm] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [lotUnit, setLotUnit] = useState<LotUnit>("kg");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const quantityNum = Number(quantity);
  const quantityInvalid = !Number.isFinite(quantityNum) || quantityNum <= 0;
  const qtyKg =
    quantityInvalid ? 0 : lotQtyToKg(quantityNum, lotUnit);
  const exceedsRemaining =
    quantityInvalid ? false : qtyKg > remainingKg + 1e-6;

  const maxInCurrentUnit =
    remainingKg > 0
      ? lotUnit === "tấn"
        ? remainingKg / 1000
        : lotUnit === "kg"
          ? remainingKg
          : remainingKg / 0.001
      : 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (quantityInvalid) {
      toast.error("Số lượng phải > 0");
      return;
    }
    if (exceedsRemaining) {
      toast.error(
        `Vượt quá khối lượng còn lại (còn ${formatKg(remainingKg)} kg quy đổi)`,
      );
      return;
    }
    createMutation.mutate(
      { seasonId, quantity: quantityNum, unit: lotUnit },
      {
        onSuccess: () => {
          toast.success("Đã tạo lô bán + QR");
          setQuantity("");
          setShowForm(false);
        },
        onError: (err: Error & { response?: { data?: { message?: string } } }) => {
          toast.error(err.response?.data?.message ?? "Không tạo được lô bán");
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Đã ngừng lô bán");
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error("Không xoá được lô bán");
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <h3 className="text-base font-semibold">Lô bán & QR truy xuất</h3>
          <Badge variant="outline" className="text-xs">
            {list.length}
          </Badge>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            setShowForm((v) => {
              const next = !v;
              if (next) setLotUnit("kg");
              return next;
            })
          }
          className="gap-1.5"
          disabled={!isLoading && remainingKg <= 0}
        >
          <Plus className="h-4 w-4" />
          Tạo lô mới
        </Button>
      </div>

      {totals && (
        <div className="space-y-1.5">
          <div className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/30 p-3 text-center text-xs">
            <div>
              <p className="text-muted-foreground">Sản lượng thu hoạch</p>
              <p className="mt-0.5 text-base font-semibold">
                {totals.actualYield} {seasonUnit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Đã phân bổ (kg)</p>
              <p className="mt-0.5 text-base font-semibold text-blue-600">
                {formatKg(allocatedKg)} kg
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Còn lại (kg)</p>
              <p
                className={`mt-0.5 text-base font-semibold ${
                  remainingKg <= 0 ? "text-red-600" : "text-green-700"
                }`}
              >
                {formatKg(remainingKg)} kg
              </p>
            </div>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            Mỗi lô chọn tấn / kg / gam; hệ thống quy đổi về kg (
            {formatKg(actualYieldKg)} kg = tổng mùa) để không vượt sản lượng.
          </p>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-xl border border-dashed bg-muted/30 p-4"
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="su-quantity">
                Khối lượng lô *{" "}
                <span className="text-xs text-muted-foreground">
                  (tối đa ~{formatKg(maxInCurrentUnit)}{" "}
                  {LOT_UNIT_OPTIONS.find((o) => o.value === lotUnit)?.label})
                </span>
              </Label>
              <Input
                id="su-quantity"
                type="number"
                step={lotUnit === "g" ? 1 : "0.01"}
                min={lotUnit === "g" ? 1 : 0.01}
                max={maxInCurrentUnit > 0 ? maxInCurrentUnit : undefined}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={
                  lotUnit === "tấn"
                    ? "Ví dụ: 0.05"
                    : lotUnit === "g"
                      ? "Ví dụ: 500"
                      : "Ví dụ: 50"
                }
                className={exceedsRemaining ? "border-red-400" : undefined}
              />
              {exceedsRemaining && (
                <p className="text-xs text-red-600">
                  Vượt quá còn lại ({formatKg(remainingKg)} kg quy đổi)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Đơn vị lô</Label>
              <div className="flex flex-wrap gap-2">
                {LOT_UNIT_OPTIONS.map((opt) => {
                  const selected = lotUnit === opt.value;
                  return (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      className="min-w-13 rounded-full"
                      onClick={() => setLotUnit(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Chỉ ba đơn vị này; so sánh với sản lượng mùa qua quy đổi kg.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={
                createMutation.isPending || quantityInvalid || exceedsRemaining
              }
              className="gap-1.5"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Tạo lô + sinh QR
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Đang tải danh sách lô bán...
        </p>
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
          Chưa có lô nào. Tạo lô đầu tiên để có QR truy xuất gắn lên bao bì sản phẩm.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((unit) => (
            <SaleUnitCard key={unit.id} saleUnit={unit} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá / ngừng lô bán?</AlertDialogTitle>
            <AlertDialogDescription>
              Nếu lô đã có người quét QR, hệ thống sẽ chỉ chuyển sang trạng thái
              "Ngừng" để giữ lịch sử truy xuất. Nếu chưa có ai quét, lô sẽ bị xoá hẳn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
