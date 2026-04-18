"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Leaf,
  MapPin,
  Loader2,
} from "lucide-react";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { shopService } from "@/services/shop/shopService";
import type { PublicProduct, ShopSummary } from "@/services/shop";

const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const formatStock = (stock: number | string | null) => {
  if (stock === null) return 0;
  const num = typeof stock === "string" ? Number(stock) : stock;
  return Number.isFinite(num) ? num : 0;
};

function pickFeaturedProducts(items: PublicProduct[], max: number): PublicProduct[] {
  const inStock = items.filter((p) => formatStock(p.stockQty) > 0);
  const verifiedFirst = [...inStock].sort((a, b) => {
    const av = a.shop?.isVerified ? 1 : 0;
    const bv = b.shop?.isVerified ? 1 : 0;
    return bv - av;
  });
  return verifiedFirst.slice(0, max);
}

export default function ConsumerHomePage() {
  const productsQuery = useQuery({
    queryKey: ["consumer-home-products"],
    queryFn: () =>
      shopService.getPublicProducts({
        page: 1,
        limit: 24,
      }),
  });

  const shopsQuery = useQuery({
    queryKey: ["consumer-home-shops"],
    queryFn: () =>
      shopService.getShops({
        page: 1,
        limit: 12,
      }),
  });

  const featuredProducts = pickFeaturedProducts(
    productsQuery.data?.items ?? [],
    8,
  );
  const featuredShops = (shopsQuery.data?.items ?? [])
    .filter((s) => s.status === "open")
    .slice(0, 3);

  const loadingBlock = (
    <div className="flex justify-center py-12 text-muted-foreground">
      <Loader2 className="h-7 w-7 animate-spin" />
    </div>
  );

  return (
    <ConsumerLayout>
      <div className="pb-20 md:pb-0">
        <section className="gradient-hero">
          <div className="container py-10 md:py-16 text-center space-y-5">
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">
              Rau sạch <span className="text-gradient-green">có nguồn gốc</span>
              <br />
              giao tận nhà bạn
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Quét QR xem nhật ký canh tác. Mua trực tiếp từ nông dân. Minh bạch
              từ ruộng đến bàn ăn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/consumer/marketplace">
                <Button
                  size="lg"
                  className="h-13 px-6 text-base font-bold gap-2 w-full sm:w-auto"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Vào chợ
                </Button>
              </Link>
              <Link href="/consumer/trace">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-6 text-base font-bold gap-2 w-full sm:w-auto"
                >
                  <QrCode className="h-5 w-5" />
                  Quét QR truy xuất
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "Xác minh nguồn gốc" },
              { icon: Leaf, label: "Chuẩn VietGAP" },
              { icon: QrCode, label: "Truy xuất nguồn gốc" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/5 text-center"
              >
                <item.icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Sản phẩm nổi bật</h2>
            <Link
              href="/consumer/marketplace"
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {productsQuery.isLoading ? (
            loadingBlock
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Chưa có sản phẩm trên chợ. Hãy quay lại sau.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {featuredProducts.map((product) => {
                const stock = formatStock(product.stockQty);
                const outOfStock = stock <= 0;
                return (
                  <Link
                    key={product.id}
                    href={`/consumer/product/${product.id}`}
                  >
                    <Card className="hover:border-primary/40 transition-colors h-full">
                      <div className="aspect-square bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center relative">
                        {product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Leaf className="h-10 w-10 text-primary/30" />
                        )}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-t-lg">
                            <span className="font-bold text-muted-foreground text-xs">
                              Hết hàng
                            </span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 space-y-1.5">
                        <p className="font-semibold text-sm line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.shop?.name ?? "Gian hàng"}
                        </p>
                        <ProductRatingBadge
                          averageRating={product.averageRating}
                          reviewCount={product.reviewCount}
                          size="xs"
                          className="block"
                        />
                        {product.shop?.farm?.province && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {product.shop.farm.district
                                ? `${product.shop.farm.district}, `
                                : ""}
                              {product.shop.farm.province}
                            </span>
                          </div>
                        )}
                        <p className="text-primary font-bold text-sm">
                          {formatPrice(product.price)}đ/
                          {product.unit ?? "đơn vị"}
                        </p>
                        {product.shop?.isVerified && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] gap-1 px-1.5 py-0"
                          >
                            <ShieldCheck className="h-3 w-3" /> Đã xác minh
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="container py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Gian hàng gợi ý</h2>
            <Link
              href="/consumer/marketplace"
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {shopsQuery.isLoading ? (
            loadingBlock
          ) : featuredShops.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Chưa có gian hàng.
            </p>
          ) : (
            <div className="space-y-3">
              {featuredShops.map((shop: ShopSummary) => {
                const certs = Array.isArray(shop.certifications)
                  ? (shop.certifications as string[]).filter(
                      (c) => typeof c === "string",
                    )
                  : [];
                return (
                  <Link key={shop.id} href={`/consumer/shop/${shop.id}`}>
                    <Card className="hover:border-primary/40 transition-colors mb-3">
                      <CardContent className="p-4 flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Leaf className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-bold text-sm">{shop.name}</p>
                          <ProductRatingBadge
                            averageRating={shop.average_rating}
                            reviewCount={shop.review_count}
                            size="xs"
                            className="block"
                          />
                          {shop.farms?.province && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {shop.farms.district
                                  ? `${shop.farms.district}, `
                                  : ""}
                                {shop.farms.province}
                              </span>
                            </div>
                          )}
                          {shop.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {shop.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {shop.is_verified && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 gap-1"
                              >
                                <ShieldCheck className="h-3 w-3" />
                                Đã xác minh
                              </Badge>
                            )}
                            {certs.slice(0, 3).map((c) => (
                              <Badge
                                key={c}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </ConsumerLayout>
  );
}
