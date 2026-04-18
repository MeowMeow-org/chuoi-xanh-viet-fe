"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyShopsQuery } from "@/hooks/useFarmerShop";
import { cn } from "@/lib/utils";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { shopService } from "@/services/shop/shopService";

function formatPrice(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n.toLocaleString("vi-VN") : String(v);
}

export default function FarmerProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const { data: shops } = useMyShopsQuery();

  const productQuery = useQuery({
    queryKey: ["farmer-product", productId],
    queryFn: () => shopService.getPublicProductById(productId),
    enabled: !!productId,
  });

  const myShopIds = new Set((shops ?? []).map((s) => s.id));
  const isMine =
    productQuery.data != null && myShopIds.has(productQuery.data.shopId);

  if (productQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center px-4 py-12 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải sản phẩm…
      </div>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
        <Link
          href="/farmer/marketplace"
          className={cn(
            buttonVariants({ variant: "link" }),
            "mt-4 inline-flex gap-1",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại gian hàng
        </Link>
      </div>
    );
  }

  const p = productQuery.data;

  if (!isMine) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <p className="text-sm text-amber-800">
          Sản phẩm này không thuộc gian hàng của bạn.
        </p>
        <Link
          href="/farmer/marketplace"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <Link
        href="/farmer/marketplace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Gian hàng
      </Link>

      <div className="relative overflow-hidden rounded-xl bg-muted">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt=""
            className="max-h-72 w-full object-cover"
          />
        ) : (
          <div className="flex h-56 items-center justify-center text-5xl">
            🌱
          </div>
        )}
      </div>

      <div>
        <h1 className="text-xl font-bold">{p.name}</h1>
        <div className="mt-1.5">
          <ProductRatingBadge
            averageRating={p.averageRating}
            reviewCount={p.reviewCount}
            size="sm"
            emptyLabel="Chưa có đánh giá"
          />
        </div>
        <p className="mt-2 text-2xl font-semibold text-primary">
          {formatPrice(p.price)}đ
          <span className="text-base font-normal text-muted-foreground">
            /{p.unit ?? "đơn vị"}
          </span>
        </p>
        {p.season && (
          <Badge variant="secondary" className="mt-2">
            Mùa: {p.season.code} · {p.season.cropName}
          </Badge>
        )}
      </div>

      {p.description && (
        <Card>
          <CardContent className="p-4 text-sm whitespace-pre-wrap text-muted-foreground">
            {p.description}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/consumer/product/${p.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Xem như người mua
        </Link>
        {p.shop && (
          <Link
            href={`/consumer/shop/${p.shop.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
            )}
          >
            Trang shop
          </Link>
        )}
      </div>
    </div>
  );
}
