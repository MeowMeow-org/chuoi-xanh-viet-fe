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
import { toast } from "@/components/ui/toast";

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
import { useMyShopsQuery } from "@/hooks/useFarmerShop";
import type { SaleUnit } from "@/services/sale-unit";
import { getSaleUnitTracePublicUrl } from "@/lib/tracePublicUrl";
import { cn } from "@/lib/utils";

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
        Tải QR
      </Button>
    </div>
  );
}

function SaleUnitCard({
  saleUnit,
  onDelete,
  shopId,
  farmId,
}: {
  saleUnit: SaleUnit;
  onDelete: (id: string) => void;
  shopId?: string | null;
  farmId?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const tracePublicUrl = getSaleUnitTracePublicUrl({
    shortCode: saleUnit.shortCode,
    code: saleUnit.code,
    qrUrl: saleUnit.qrUrl,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tracePublicUrl);
      setCopied(true);
      toast.success("Đã copy link truy xuất");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không copy được link");
    }
  };

  const isListed = Boolean(saleUnit.product && saleUnit.product.isActive);

  let badgeLabel: string;
  let badgeClass: string;
  if (saleUnit.status === "disabled") {
    badgeLabel = "Ngừng";
    badgeClass = "bg-gray-100 text-gray-600";
  } else if (saleUnit.status === "sold") {
    badgeLabel = "Đã bán";
    badgeClass = "bg-blue-100 text-blue-800";
  } else if (isListed) {
    badgeLabel = "Đang bán";
    badgeClass = "bg-green-100 text-green-800";
  } else if (saleUnit.product) {
    badgeLabel = "Tạm ẩn";
    badgeClass = "bg-amber-100 text-amber-800";
  } else {
    badgeLabel = "Chưa đăng";
    badgeClass = "bg-slate-100 text-slate-700";
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:gap-4">
      <QrWithDownload
        value={tracePublicUrl}
        label={saleUnit.shortCode ?? saleUnit.code}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold">
                {saleUnit.shortCode ?? "--"}
              </span>
              <Badge className={`border-0 ${badgeClass}`}>
                {badgeLabel}
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
            <span className="min-w-0 flex-1">{tracePublicUrl}</span>
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
            {saleUnit.status === "active" && !saleUnit.product && (
              <Link
                href={
                  shopId
                    ? `/farmer/marketplace/shops/${shopId}/add?saleUnitId=${encodeURIComponent(saleUnit.id)}`
                    : `/farmer/marketplace/new?saleUnitId=${encodeURIComponent(saleUnit.id)}${farmId ? `&farmId=${encodeURIComponent(farmId)}` : ""}`
                }
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "inline-flex h-7 gap-1.5 text-xs no-underline",
                )}
              >
                <Store className="h-3 w-3" />
                {shopId ? "Đăng bán" : "Mở gian hàng & đăng bán"}
              </Link>
            )}
            {saleUnit.status === "active" && saleUnit.product && (
              <Link
                href={
                  shopId
                    ? `/farmer/marketplace/shops/${shopId}`
                    : `/farmer/marketplace`
                }
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "inline-flex h-7 gap-1.5 text-xs no-underline",
                )}
              >
                <Store className="h-3 w-3" />
                Xem gian hàng
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SaleUnitsSection({
  seasonId,
  farmId,
}: {
  seasonId: string;
  farmId?: string | null;
}) {
  const { data, isLoading } = useSaleUnitsQuery(seasonId);
  const createMutation = useCreateSaleUnitMutation();
  const deleteMutation = useDeleteSaleUnitMutation(seasonId);
  const { data: myShops } = useMyShopsQuery();
  const shopForFarm = farmId
    ? (myShops?.find((s) => s.farm_id === farmId) ?? null)
    : null;

  const list = data?.items ?? [];
  const totals = data?.totals;
  const seasonUnit = totals?.yieldUnit ?? "kg";
  const remainingKg = totals?.remainingKg ?? 0;
  const allocatedKg = totals?.allocatedKg ?? 0;
  const actualYieldKg = totals?.actualYieldKg ?? 0;

  const [showForm, setShowForm] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const quantityNum = Number(quantity);
  const quantityInvalid = !Number.isFinite(quantityNum) || quantityNum <= 0;
  const qtyKg = quantityInvalid ? 0 : quantityNum;
  const exceedsRemaining = quantityInvalid ? false : qtyKg > remainingKg + 1e-6;

  const maxInCurrentUnit = remainingKg > 0 ? remainingKg : 0;

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
    const kgQuantity = Number(quantityNum.toFixed(3));
    if (!Number.isFinite(kgQuantity) || kgQuantity <= 0) {
      toast.error("Khối lượng không hợp lệ");
      return;
    }
    createMutation.mutate(
      { seasonId, quantity: kgQuantity, unit: "kg" },
      {
        onSuccess: () => {
          toast.success("Đã tạo lô bán + QR");
          setQuantity("");
          setShowForm(false);
        },
        onError: (
          err: Error & { response?: { data?: { message?: string } } },
        ) => {
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
          onClick={() => setShowForm((v) => !v)}
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
              <p className="text-muted-foreground">Sản lượng</p>
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
            Mỗi lô ghi khối lượng theo kg (tổng mùa {formatKg(actualYieldKg)}{" "}
            kg) để không vượt sản lượng.
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
                Khối lượng lô (kg) *{" "}
                <span className="text-xs text-muted-foreground">
                  (tối đa ~{formatKg(maxInCurrentUnit)} kg)
                </span>
              </Label>
              <Input
                id="su-quantity"
                type="number"
                step="0.01"
                min={0.01}
                max={maxInCurrentUnit > 0 ? maxInCurrentUnit : undefined}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ví dụ: 50"
                className={exceedsRemaining ? "border-red-400" : undefined}
              />
              {exceedsRemaining && (
                <p className="text-xs text-red-600">
                  Vượt quá còn lại ({formatKg(remainingKg)} kg)
                </p>
              )}
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
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
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
          Chưa có lô nào. Tạo lô đầu tiên để có QR truy xuất gắn lên bao bì sản
          phẩm.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((unit) => (
            <SaleUnitCard
              key={unit.id}
              saleUnit={unit}
              onDelete={setDeleteTarget}
              shopId={shopForFarm?.id ?? null}
              farmId={farmId ?? null}
            />
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
              &quot;Ngừng&quot; để giữ lịch sử truy xuất. Nếu chưa có ai quét, lô sẽ bị
              xoá hẳn.
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

