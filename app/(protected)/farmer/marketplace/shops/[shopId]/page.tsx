"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Plus,
  Store,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useMyShopsQuery,
  useShopProductsQuery,
} from "@/hooks/useFarmerShop";
import type { PublicProduct } from "@/services/shop";
import { cn } from "@/lib/utils";

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
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
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
                          shop.farms.cooperative_members[0].cooperative_user
                            .full_name
                        }
                      </span>
                    </p>
                  )}
                  {shop.description && (
                    <p className="mt-2 line-clamp-2 min-w-0 w-full break-words text-sm text-muted-foreground">
                      {shop.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                <Link
                  href={`/consumer/shop/${shop.id}`}
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
