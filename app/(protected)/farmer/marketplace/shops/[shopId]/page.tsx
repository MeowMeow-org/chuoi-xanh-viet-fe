"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useMemo } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Package,
  Plus,
  Star,
  Store,
  Users,
} from "lucide-react";

import { CertificateBadge } from "@/components/certificate/CertificateBadge";
import { FarmerShopOrdersPanel } from "@/components/farmer/farmer-shop-orders-panel";
import { FarmerShopReviewsPanel } from "@/components/farmer/farmer-shop-reviews-panel";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyShopsQuery, useShopProductsQuery } from "@/hooks/useFarmerShop";
import type { PublicProduct } from "@/services/shop";
import { cn } from "@/lib/utils";

type ShopTab = "manage" | "orders" | "reviews";

function formatPrice(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : String(v);
}

export default function FarmerShopDetailPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const shopTab: ShopTab = (() => {
    const t = searchParams.get("tab");
    if (t === "orders" || t === "reviews") return t;
    return "manage";
  })();

  const setShopTab = (t: ShopTab) => {
    if (t === "manage") {
      router.replace(`/farmer/marketplace/shops/${shopId}`, { scroll: false });
    } else {
      router.replace(`/farmer/marketplace/shops/${shopId}?tab=${t}`, {
        scroll: false,
      });
    }
  };

  const { data: shops, isLoading: shopsLoading } = useMyShopsQuery();
  const shop = useMemo(
    () => shops?.find((s) => s.id === shopId),
    [shops, shopId],
  );

  const { data: productsPage, isLoading: productsLoading } =
    useShopProductsQuery(shop?.id);

  const loading = shopsLoading;
  const products: PublicProduct[] = productsPage?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-24 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex items-center gap-2">
        <Link
          href="/farmer/marketplace"
          aria-label="Danh sách gian hàng"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-muted-foreground">Gian hàng</span>
      </div>

      {loading && (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải…
        </div>
      )}

      {!loading && !shop && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Không tìm thấy gian hàng này, hoặc không thuộc quyền quản lý của
            bạn.{" "}
            <Link
              href="/farmer/marketplace"
              className="font-medium text-primary underline"
            >
              Quay lại danh sách
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && shop && (
        <>
          <Card className="border-primary/25">
            <CardContent className="flex flex-col gap-4 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                    {shop.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={shop.avatar_url}
                        alt={shop.farms?.name ?? shop.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-7 w-7 text-muted-foreground" />
                    )}
                    <CertificateBadge
                      badges={shop.badges}
                      farmId={shop.farms?.id}
                      variant="corner"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-xl font-bold">
                      {shop.farms?.name ?? shop.name}
                    </h1>
                    <p className="truncate text-xs text-muted-foreground">
                      Tên gian hàng: {shop.name}
                    </p>
                    {shop.farms?.cooperative_members?.[0]?.cooperative_user
                      ?.full_name && (
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <Users className="h-3 w-3 shrink-0" />
                        HTX:{" "}
                        <span className="truncate font-medium text-foreground">
                          {
                            shop.farms.cooperative_members[0]
                              .cooperative_user.full_name
                          }
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <Link
                    href={`/shop/${shop.id}`}
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
                    href={`/farmer/marketplace/shops/${shop.id}/add`}
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "inline-flex shrink-0 gap-1.5",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm sản phẩm
                  </Link>
                </div>
              </div>
              {shop.description ? (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Giới thiệu gian hàng
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground wrap-break-word">
                    {shop.description}
                  </p>
                </div>
              ) : null}
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
            <FarmerShopReviewsPanel shopId={shop.id} shopName={shop.name} />
          )}

          {shopTab === "manage" && (
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
                      href={`/farmer/marketplace/shops/${shop.id}/add`}
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
                          <Badge
                            variant="secondary"
                            className="mt-2 text-[10px]"
                          >
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
          )}
        </>
      )}
    </div>
  );
}
