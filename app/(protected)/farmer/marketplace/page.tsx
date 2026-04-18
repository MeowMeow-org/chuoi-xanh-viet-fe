"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Package,
  Plus,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import {
  useAddProductMutation,
  useAvailableSaleUnitsQuery,
  useCreateShopMutation,
  useMyShopsQuery,
  useShopProductsQuery,
  useSuggestShopMutation,
} from "@/hooks/useFarmerShop";
import { uploadService } from "@/services/upload/uploadService";
import type { PublicProduct } from "@/services/shop";
import { FarmerShopOrdersPanel } from "@/components/farmer/farmer-shop-orders-panel";
import { FarmerShopReviewsPanel } from "@/components/farmer/farmer-shop-reviews-panel";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { cn } from "@/lib/utils";

type ShopTab = "manage" | "orders" | "reviews";

function formatPrice(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : String(v);
}

export default function FarmerMarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopTab: ShopTab = (() => {
    const t = searchParams.get("tab");
    if (t === "orders" || t === "reviews") return t;
    return "manage";
  })();

  const setShopTab = (t: ShopTab) => {
    if (t === "manage") {
      router.replace("/farmer/marketplace", { scroll: false });
    } else {
      router.replace(`/farmer/marketplace?tab=${t}`, { scroll: false });
    }
  };
  const { farms, isLoading: farmsLoading } = useMyFarmsQuery({
    page: 1,
    limit: 100,
  });
  const { data: shops, isLoading: shopsLoading } = useMyShopsQuery();

  const myShop = shops?.[0];
  const { data: productsPage, isLoading: productsLoading } =
    useShopProductsQuery(myShop?.id);

  const { data: saleUnits, isLoading: saleUnitsLoading } =
    useAvailableSaleUnitsQuery(myShop?.id, !!myShop);

  const createShop = useCreateShopMutation();
  const suggestShop = useSuggestShopMutation();
  const addProduct = useAddProductMutation();

  const farmsWithoutShop = useMemo(() => {
    if (!shops?.length) return farms;
    const taken = new Set(shops.map((s) => s.farm_id));
    return farms.filter((f) => !taken.has(f.id));
  }, [farms, shops]);

  const [farmIdCreate, setFarmIdCreate] = useState<string>("");
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");

  const urlSaleUnitId = searchParams.get("saleUnitId") ?? "";
  const [userPickedSaleUnitId, setUserPickedSaleUnitId] = useState<string | null>(
    null,
  );
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);

  const canonicalFromUrl = useMemo(() => {
    if (!saleUnits?.length) return "";
    if (urlSaleUnitId && saleUnits.some((u) => u.id === urlSaleUnitId)) {
      return urlSaleUnitId;
    }
    return "";
  }, [saleUnits, urlSaleUnitId]);

  const prodSaleUnitId = userPickedSaleUnitId ?? canonicalFromUrl;

  const selectedSaleUnit = useMemo(
    () => saleUnits?.find((u) => u.id === prodSaleUnitId),
    [saleUnits, prodSaleUnitId],
  );

  /* Khi query `saleUnitId` đổi (deep link khác), bỏ override tay để URL là nguồn đúng. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset override khi URL đổi; không derive được thuần render
    setUserPickedSaleUnitId(null);
  }, [urlSaleUnitId]);

  const loading = farmsLoading || shopsLoading;

  const farmIdForNewShop = farmIdCreate || farmsWithoutShop[0]?.id || "";

  const handleSuggest = async () => {
    const fid = farmIdForNewShop;
    if (!fid) {
      toast.error("Chọn nông trại để gợi ý");
      return;
    }
    try {
      const s = await suggestShop.mutateAsync(fid);
      setShopName(s.suggestedName ?? "");
      setShopDesc(s.suggestedDescription ?? "");
    } catch {
      /* toast in hook */
    }
  };

  const handleCreateShop = () => {
    const fid = farmIdForNewShop;
    if (!fid || !shopName.trim()) {
      toast.error("Chọn trại và nhập tên gian hàng");
      return;
    }
    createShop.mutate(
      {
        farm_id: fid,
        name: shopName.trim(),
        description: shopDesc.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShopName("");
          setShopDesc("");
          setFarmIdCreate("");
        },
      },
    );
  };

  const handleAddProduct = async () => {
    if (!myShop?.id) return;
    if (!prodSaleUnitId) {
      toast.error("Chọn lô đã phân (có QR) để đăng bán");
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
          description: prodDesc.trim() || undefined,
          price,
          image_url,
        },
      },
      {
        onSuccess: () => {
          setProdDesc("");
          setProdPrice("");
          setProdImageFile(null);
          setUserPickedSaleUnitId(null);
          router.replace("/farmer/marketplace", { scroll: false });
        },
      },
    );
  };

  const products: PublicProduct[] = productsPage?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-24 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Gian hàng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo cửa hàng theo nông trại; mỗi sản phẩm chợ phải gắn một lô đã
            phân (QR) — hiển thị trên chợ cho người mua.
          </p>
        </div>
        <Link
          href="/consumer/cart"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          Giỏ mua (người mua)
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải…
        </div>
      )}

      {!loading && farms.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Bạn chưa có nông trại.{" "}
            <Link href="/farmer/farms" className="font-medium text-primary underline">
              Tạo nông trại
            </Link>{" "}
            trước khi mở gian hàng.
          </CardContent>
        </Card>
      )}

      {!loading && farms.length > 0 && !myShop && farmsWithoutShop.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Mỗi nông trại chỉ một gian hàng — các trại của bạn đã có shop. Liên hệ
            hỗ trợ nếu cần chỉnh sửa.
          </CardContent>
        </Card>
      )}

      {!loading && farms.length > 0 && !myShop && farmsWithoutShop.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4" />
              Mở gian hàng mới
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nông trại</Label>
              <select
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                )}
                value={farmIdForNewShop}
                onChange={(e) => setFarmIdCreate(e.target.value)}
              >
                {farmsWithoutShop.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                disabled={!farmIdForNewShop || suggestShop.isPending}
                onClick={() => void handleSuggest()}
              >
                {suggestShop.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Gợi ý AI
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-name">Tên gian hàng</Label>
              <Input
                id="shop-name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Ví dụ: Rau sạch nhà Lan"
                maxLength={180}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-desc">Mô tả</Label>
              <Textarea
                id="shop-desc"
                value={shopDesc}
                onChange={(e) => setShopDesc(e.target.value)}
                rows={3}
                placeholder="Giới thiệu ngắn…"
              />
            </div>
            <Button
              type="button"
              disabled={createShop.isPending || !shopName.trim()}
              onClick={handleCreateShop}
              className="gap-1.5"
            >
              {createShop.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Tạo gian hàng
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && myShop && (
        <>
          {shops && shops.length > 1 && (
            <p className="text-xs text-amber-800">
              Bạn có {shops.length} gian hàng; trang này đang quản lý gian đầu
              tiên ({myShop.name}).
            </p>
          )}
          <Card className="border-primary/25">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">{myShop.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {myShop.farms?.name ?? "Nông trại"} ·{" "}
                  {[myShop.farms?.ward, myShop.farms?.district, myShop.farms?.province]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
                {myShop.description && (
                  <p className="mt-2 text-sm">{myShop.description}</p>
                )}
              </div>
              <Link
                href={`/consumer/shop/${myShop.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "inline-flex shrink-0 gap-1.5",
                )}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Xem trang công khai
              </Link>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={shopTab === "manage" ? "default" : "outline"}
              className={
                shopTab === "manage"
                  ? "bg-[hsl(142,69%,45%)] hover:bg-[hsl(142,69%,40%)]"
                  : "border-[hsl(142,14%,88%)]"
              }
              onClick={() => setShopTab("manage")}
            >
              <Store className="h-4 w-4" />
              Sản phẩm & đăng bán
            </Button>
            <Button
              type="button"
              size="sm"
              variant={shopTab === "orders" ? "default" : "outline"}
              className={
                shopTab === "orders"
                  ? "bg-[hsl(142,69%,45%)] hover:bg-[hsl(142,69%,40%)]"
                  : "border-[hsl(142,14%,88%)]"
              }
              onClick={() => setShopTab("orders")}
            >
              <Package className="h-4 w-4" />
              Đơn hàng
            </Button>
            <Button
              type="button"
              size="sm"
              variant={shopTab === "reviews" ? "default" : "outline"}
              className={
                shopTab === "reviews"
                  ? "bg-[hsl(142,69%,45%)] hover:bg-[hsl(142,69%,40%)]"
                  : "border-[hsl(142,14%,88%)]"
              }
              onClick={() => setShopTab("reviews")}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  shopTab === "reviews" ? "text-white" : "text-amber-500",
                )}
              />
              Đánh giá
            </Button>
          </div>

          {shopTab === "orders" && <FarmerShopOrdersPanel />}

          {shopTab === "reviews" && (
            <FarmerShopReviewsPanel shopId={myShop.id} shopName={myShop.name} />
          )}

          {shopTab === "manage" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thêm sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Lô đã phân (QR) *</Label>
                  <select
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
                    )}
                    value={prodSaleUnitId}
                    onChange={(e) =>
                      setUserPickedSaleUnitId(e.target.value || null)
                    }
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
                      Chưa có lô nào sẵn sàng đăng bán. Vào mùa vụ đã neo, tạo
                      lô & QR trước — hoặc các lô đã được đăng hết.
                    </p>
                  )}
                </div>
                {selectedSaleUnit && (
                  <div className="space-y-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
                    <p className="font-medium text-foreground">
                      Tên hiển thị mặc định: Lô{" "}
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
                  <Label htmlFor="p-price">Giá (VNĐ) *</Label>
                  <Input
                    id="p-price"
                    inputMode="decimal"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-desc">Mô tả thêm (tuỳ chọn)</Label>
                  <Textarea
                    id="p-desc"
                    rows={2}
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
                <Button
                  type="button"
                  disabled={
                    addProduct.isPending || !prodSaleUnitId || saleUnitsLoading
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Sản phẩm đang bán ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsLoading && (
                  <p className="text-sm text-muted-foreground">Đang tải…</p>
                )}
                {!productsLoading && products.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Chưa có sản phẩm nào.
                  </p>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/farmer/marketplace/${p.id}`}
                      className="block rounded-xl border bg-card transition hover:border-primary/40"
                    >
                      <div className="relative h-32 overflow-hidden bg-muted">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">
                            🌱
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold leading-tight">{p.name}</p>
                        <div className="mt-1">
                          <ProductRatingBadge
                            averageRating={p.averageRating}
                            reviewCount={p.reviewCount}
                            size="xs"
                          />
                        </div>
                        <p className="mt-1 text-sm text-primary">
                          {formatPrice(p.price)}đ
                          <span className="text-muted-foreground">
                            /{p.unit ?? "đơn vị"}
                          </span>
                        </p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          {p.saleUnit?.shortCode ?? p.saleUnit?.code ?? p.season?.code ?? "—"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </>
      )}
    </div>
  );
}
