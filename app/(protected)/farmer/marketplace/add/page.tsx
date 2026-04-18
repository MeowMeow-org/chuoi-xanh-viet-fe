"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddProductMutation,
  useAvailableSaleUnitsQuery,
  useMyShopsQuery,
} from "@/hooks/useFarmerShop";
import { uploadService } from "@/services/upload/uploadService";
import { cn } from "@/lib/utils";

export default function FarmerAddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: shops, isLoading: shopsLoading } = useMyShopsQuery();
  const myShop = shops?.[0];

  const { data: saleUnits, isLoading: saleUnitsLoading } =
    useAvailableSaleUnitsQuery(myShop?.id, !!myShop);
  const addProduct = useAddProductMutation();

  const [prodSaleUnitId, setProdSaleUnitId] = useState("");
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);

  const selectedSaleUnit = useMemo(
    () => saleUnits?.find((u) => u.id === prodSaleUnitId),
    [saleUnits, prodSaleUnitId],
  );

  useEffect(() => {
    const fromUrl = searchParams.get("saleUnitId");
    if (!fromUrl || !saleUnits?.length) return;
    if (saleUnits.some((u) => u.id === fromUrl)) {
      setProdSaleUnitId(fromUrl);
    }
  }, [searchParams, saleUnits]);

  const handleAddProduct = async () => {
    if (!myShop?.id) return;
    if (!prodSaleUnitId) {
      toast.error("Chọn lô đã phân (có QR) để đăng bán");
      return;
    }
    if (!prodName.trim()) {
      toast.error("Nhập tên sản phẩm hiển thị trên chợ");
      return;
    }
    const price = Number(prodPrice.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Giá phải là số dương");
      return;
    }

    let image_url: string | null | undefined;
    if (prodImageFile) {
      try {
        const up = await uploadService.uploadImages([prodImageFile]);
        const url = up.items[0]?.url;
        if (!url) {
          toast.error("Upload ảnh thất bại");
          return;
        }
        image_url = url;
      } catch {
        toast.error("Không upload được ảnh");
        return;
      }
    }

    addProduct.mutate(
      {
        shopId: myShop.id,
        payload: {
          sale_unit_id: prodSaleUnitId,
          name: prodName.trim(),
          description: prodDesc.trim() || undefined,
          price,
          image_url,
        },
      },
      {
        onSuccess: () => {
          toast.success("Đã thêm sản phẩm");
          router.replace("/farmer/marketplace");
        },
      },
    );
  };

  const loading = shopsLoading;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-24 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex items-start gap-3">
        <Link
          href="/farmer/marketplace"
          aria-label="Quay lại gian hàng"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="text-xl font-bold tracking-tight">Thêm sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn một lô QR đã phân, đặt tên hiển thị và giá để đăng bán trên chợ.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải…
        </div>
      )}

      {!loading && !myShop && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Bạn chưa có gian hàng.{" "}
            <Link
              href="/farmer/marketplace"
              className="font-medium text-primary underline"
            >
              Mở gian hàng trước
            </Link>{" "}
            rồi quay lại thêm sản phẩm.
          </CardContent>
        </Card>
      )}

      {!loading && myShop && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Gian hàng: <span className="font-semibold">{myShop.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Lô đã phân (QR) *</Label>
              <select
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
                )}
                value={prodSaleUnitId}
                onChange={(e) => setProdSaleUnitId(e.target.value)}
                disabled={saleUnitsLoading}
              >
                <option value="">
                  {saleUnitsLoading ? "Đang tải…" : "Chọn lô bán"}
                </option>
                {(saleUnits ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.short_code ?? u.code} · {u.quantity}{" "}
                    {u.unit === "g" ? "gam" : u.unit} · {u.seasons.code}
                  </option>
                ))}
              </select>
              {(saleUnits?.length ?? 0) === 0 && !saleUnitsLoading && (
                <p className="text-xs text-amber-700">
                  Chưa có lô nào sẵn sàng đăng bán. Vào mùa vụ đã công khai, tạo
                  lô & QR trước — hoặc các lô đã được đăng hết.
                </p>
              )}
            </div>

            {selectedSaleUnit && (
              <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">
                  Mã lô / QR:{" "}
                  {selectedSaleUnit.short_code ?? selectedSaleUnit.code}
                </p>
                <p className="text-muted-foreground">
                  {selectedSaleUnit.quantity}{" "}
                  {selectedSaleUnit.unit === "g"
                    ? "gam"
                    : selectedSaleUnit.unit}{" "}
                  · {selectedSaleUnit.seasons.crop_name} (
                  {selectedSaleUnit.seasons.code})
                </p>
                <p className="break-all text-xs text-muted-foreground">
                  Truy xuất: {selectedSaleUnit.qr_url}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="p-name">Tên sản phẩm (hiển thị trên chợ) *</Label>
              <Input
                id="p-name"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                maxLength={180}
                placeholder={
                  selectedSaleUnit
                    ? `Ví dụ: ${selectedSaleUnit.seasons.crop_name} — ghi rõ cách bán`
                    : "Ví dụ: Cỏ 3 lá tươi"
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-price">Giá (VNĐ) *</Label>
              <Input
                id="p-price"
                inputMode="decimal"
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                placeholder="Ví dụ: 25000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-desc">Mô tả thêm (tuỳ chọn)</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Ghi chú cho người mua…"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-img">Ảnh (tuỳ chọn)</Label>
              <Input
                id="p-img"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setProdImageFile(e.target.files?.[0] ?? null)
                }
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                disabled={
                  addProduct.isPending ||
                  !prodSaleUnitId ||
                  !prodName.trim() ||
                  saleUnitsLoading
                }
                onClick={() => void handleAddProduct()}
                className="gap-1.5"
              >
                {addProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Thêm sản phẩm
              </Button>
              <Link
                href="/farmer/marketplace"
                className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Huỷ
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
