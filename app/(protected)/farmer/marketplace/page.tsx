"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Plus,
  Sparkles,
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
  useCreateShopMutation,
  useMyShopsQuery,
  useShopProductsQuery,
  useSuggestShopMutation,
} from "@/hooks/useFarmerShop";
import type { PublicProduct } from "@/services/shop";
import { cn } from "@/lib/utils";

function formatPrice(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : String(v);
}

export default function FarmerMarketplacePage() {
  const { farms, isLoading: farmsLoading } = useMyFarmsQuery({
    page: 1,
    limit: 100,
  });
  const { data: shops, isLoading: shopsLoading } = useMyShopsQuery();

  const myShop = shops?.[0];
  const { data: productsPage, isLoading: productsLoading } =
    useShopProductsQuery(myShop?.id);

  const createShop = useCreateShopMutation();
  const suggestShop = useSuggestShopMutation();

  const farmsWithoutShop = useMemo(() => {
    if (!shops?.length) return farms;
    const taken = new Set(shops.map((s) => s.farm_id));
    return farms.filter((f) => !taken.has(f.id));
  }, [farms, shops]);

  const [farmIdCreate, setFarmIdCreate] = useState<string>("");
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");

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

  const products: PublicProduct[] = productsPage?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-24 sm:px-6 md:pb-8 lg:px-8">
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
            <Link
              href="/farmer/farms"
              className="font-medium text-primary underline"
            >
              Tạo nông trại
            </Link>{" "}
            trước khi mở gian hàng.
          </CardContent>
        </Card>
      )}

      {!loading && farms.length > 0 && !myShop && farmsWithoutShop.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Mỗi nông trại chỉ một gian hàng — các trại của bạn đã có shop. Liên
            hệ hỗ trợ nếu cần chỉnh sửa.
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
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold">{myShop.name}</h1>
                <p className="truncate text-sm text-muted-foreground">
                  {myShop.farms?.name ?? "Nông trại"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                <Link
                  href="/farmer/marketplace/add"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "inline-flex shrink-0 gap-1.5",
                  )}
                >
                  <Plus className="h-4 w-4" />
                  Thêm sản phẩm
                </Link>
              </div>
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
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Chưa có sản phẩm nào.{" "}
                  <Link
                    href="/farmer/marketplace/add"
                    className="font-medium text-primary underline"
                  >
                    Thêm sản phẩm đầu tiên
                  </Link>
                  .
                </div>
              )}
              {products.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/farmer/marketplace/${p.id}`}
                      className="block rounded-xl border bg-card transition hover:border-primary/40"
                    >
                      <div className="relative h-32 overflow-hidden bg-muted">
                        {p.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
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
                        <p className="mt-1 text-sm text-primary">
                          {formatPrice(p.price)}đ
                          <span className="text-muted-foreground">
                            /{p.unit ?? "đơn vị"}
                          </span>
                        </p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          {p.saleUnit?.shortCode ??
                            p.saleUnit?.code ??
                            p.season?.code ??
                            "—"}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
