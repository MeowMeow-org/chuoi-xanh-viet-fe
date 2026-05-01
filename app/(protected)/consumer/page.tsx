"use client";

import Link from "next/link";
import { useState } from "react";
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
  Award,
  Truck,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { shopService } from "@/services/shop/shopService";
import type { PublicProduct, ShopSummary } from "@/services/shop";
import { getStoredMarketplaceProvinceForApi } from "@/lib/location/marketplaceRegions";

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

const STATS = [
  { value: "500+", label: "Nông hộ", icon: Users },
  { value: "1.200+", label: "Sản phẩm", icon: Leaf },
  { value: "30+", label: "Tỉnh thành", icon: MapPin },
  { value: "VietGAP", label: "Chứng nhận", icon: Award },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Xác minh nguồn gốc",
    desc: "Mỗi sản phẩm đều có nhật ký canh tác và chứng nhận minh bạch.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Leaf,
    title: "Chuẩn VietGAP",
    desc: "Nông sản đạt tiêu chuẩn an toàn, không tồn dư hoá chất.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: QrCode,
    title: "Truy xuất nguồn gốc",
    desc: "Quét mã QR để xem toàn bộ hành trình từ ruộng đến bàn ăn.",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: Truck,
    title: "Giao tận nơi",
    desc: "Đặt hàng trực tiếp từ nông dân, giao hàng nhanh toàn quốc.",
    color: "bg-sky-50 text-sky-600",
  },
];

const SHOP_LIMIT = 8;

function buildShopPageNumbers(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (page > 3) pages.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
  if (page < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export default function ConsumerHomePage() {
  const province = getStoredMarketplaceProvinceForApi();
  const [shopPage, setShopPage] = useState(1);

  const productsQuery = useQuery({
    queryKey: ["consumer-home-products", province ?? "all"],
    queryFn: () =>
      shopService.getPublicProducts({
        page: 1,
        limit: 24,
        province,
      }),
  });

  const shopsQuery = useQuery({
    queryKey: ["consumer-home-shops", province ?? "all", shopPage],
    queryFn: () =>
      shopService.getShops({
        page: shopPage,
        limit: SHOP_LIMIT,
        province,
      }),
  });

  const featuredProducts = pickFeaturedProducts(
    productsQuery.data?.items ?? [],
    8,
  );
  const featuredShops = shopsQuery.data?.items ?? [];
  const shopTotalPages = shopsQuery.data?.meta?.totalPages ?? 1;

  const goToShopPage = (p: number) => {
    setShopPage(p);
    document.getElementById("featured-shops")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const shopPageNumbers = buildShopPageNumbers(shopPage, shopTotalPages);

  const loadingBlock = (
    <div className="flex justify-center py-16 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  return (
    <ConsumerLayout>
      <div className="pb-20 md:pb-0">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden gradient-hero border-b border-border/40">
          {/* decorative blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/8 blur-2xl"
          />

          <div className="container relative py-12 md:py-20">
            <div className="flex flex-col md:flex-row md:items-center md:gap-12">
              {/* left — copy */}
              <div className="flex-1 space-y-6 text-center md:text-left">
                <Badge
                  variant="secondary"
                  className="inline-flex gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                >
                  <Leaf className="h-3.5 w-3.5" />
                  Nông sản sạch có truy xuất nguồn gốc
                </Badge>

                <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
                  Rau sạch{" "}
                  <span className="text-gradient-green">có nguồn gốc</span>
                  <br />
                  giao tận nhà bạn
                </h1>

                <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto md:mx-0">
                  Quét QR xem nhật ký canh tác. Mua trực tiếp từ nông dân và
                  nông hộ. Minh bạch từ ruộng đến bàn ăn.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                  <Link href="/marketplace">
                    <Button
                      size="lg"
                      className="h-12 px-7 text-base font-bold gap-2 w-full sm:w-auto shadow-md shadow-primary/20"
                    >
                      <ShoppingBag className="h-5 w-5" />
                      Vào chợ ngay
                    </Button>
                  </Link>
                  <Link href="/truy-xuat">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 px-7 text-base font-bold gap-2 w-full sm:w-auto"
                    >
                      <QrCode className="h-5 w-5" />
                      Quét QR truy xuất
                    </Button>
                  </Link>
                </div>
              </div>

              {/* right — illustration placeholder */}
              <div className="hidden md:flex flex-1 justify-center">
                <div className="relative h-64 w-64">
                  <div className="absolute inset-0 rounded-3xl gradient-green opacity-10" />
                  <div className="absolute inset-4 rounded-2xl border-2 border-primary/20 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6">
                    <div className="h-20 w-20 rounded-2xl gradient-green flex items-center justify-center shadow-lg shadow-primary/30">
                      <Leaf className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-bold text-foreground">Chuỗi Xanh Việt</p>
                      <p className="text-xs text-muted-foreground">Nông sản an toàn • Minh bạch</p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary">Đã xác minh VietGAP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────────── */}
        <section className="border-b border-border/40 bg-white">
          <div className="container py-5">
            <div className="grid grid-cols-4 divide-x divide-border/50">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-2 py-1">
                  <Icon className="h-5 w-5 text-primary mb-0.5" />
                  <span className="text-lg md:text-2xl font-extrabold text-foreground leading-none">
                    {value}
                  </span>
                  <span className="text-[11px] md:text-xs text-muted-foreground font-medium text-center">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature cards ─────────────────────────────────────── */}
        <section className="container py-10 space-y-5">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold">Tại sao chọn Chuỗi Xanh Việt?</h2>
            <p className="text-sm text-muted-foreground">
              Kết nối người tiêu dùng với nông hộ — minh bạch, an toàn, bền vững
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border/60 bg-white p-4 space-y-3 hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured products ─────────────────────────────────── */}
        <section className="bg-muted/30 py-10">
          <div className="container space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Sản phẩm nổi bật</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Được chọn từ nông hộ đã xác minh
                </p>
              </div>
              <Link
                href="/marketplace"
                className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {productsQuery.isLoading ? (
              loadingBlock
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Leaf className="h-12 w-12 text-primary/30 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Chưa có sản phẩm trên chợ. Hãy quay lại sau.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {featuredProducts.map((product) => {
                  const stock = formatStock(product.stockQty);
                  const outOfStock = stock <= 0;
                  return (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <Card className="group hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 h-full overflow-hidden">
                        <div className="aspect-square bg-muted/50 overflow-hidden relative">
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-primary/5">
                              <Leaf className="h-10 w-10 text-primary/25" />
                            </div>
                          )}
                          {outOfStock && (
                            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                              <span className="font-bold text-muted-foreground text-xs bg-white/80 px-2 py-0.5 rounded-full">
                                Hết hàng
                              </span>
                            </div>
                          )}
                          {product.shop?.isVerified && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm">
                                <ShieldCheck className="h-2.5 w-2.5" />
                                Xác minh
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 space-y-1.5">
                          <p className="font-semibold text-sm line-clamp-1 text-foreground">
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
                          <p className="text-primary font-extrabold text-sm pt-0.5">
                            {formatPrice(product.price)}đ
                            <span className="font-normal text-muted-foreground text-xs">
                              /{product.unit ?? "đơn vị"}
                            </span>
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Featured shops ────────────────────────────────────── */}
        <section id="featured-shops" className="container py-10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Gian hàng gợi ý</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nông hộ uy tín, đánh giá cao
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-sm text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {shopsQuery.isLoading ? (
            loadingBlock
          ) : featuredShops.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Leaf className="h-12 w-12 text-primary/30 mx-auto" />
              <p className="text-sm text-muted-foreground">Chưa có gian hàng.</p>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${shopsQuery.isFetching ? "opacity-50" : ""}`}>
                {featuredShops.map((shop: ShopSummary) => {
                  const certs = Array.isArray(shop.certifications)
                    ? (shop.certifications as string[]).filter(
                        (c) => typeof c === "string",
                      )
                    : [];
                  return (
                    <Link key={shop.id} href={`/shop/${shop.id}`}>
                      <Card className="group hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 h-full overflow-hidden">
                        {/* shop banner strip */}
                        <div className="h-16 gradient-green relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                              backgroundSize: "40px 40px",
                            }}
                          />
                          {/* avatar */}
                          <div className="absolute -bottom-5 left-3">
                            <div className="h-12 w-12 rounded-xl border-2 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                              {shop.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={shop.avatar_url}
                                  alt={shop.name}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                                  <Leaf className="h-5 w-5 text-primary" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <CardContent className="pt-7 p-3 space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <p className="font-bold text-sm text-foreground line-clamp-1">
                              {shop.name}
                            </p>
                            {shop.is_verified && (
                              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                            )}
                          </div>

                          <ProductRatingBadge
                            averageRating={shop.average_rating}
                            reviewCount={shop.review_count}
                            size="xs"
                            className="block"
                          />

                          {shop.farms?.province && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
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
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {shop.description}
                            </p>
                          )}

                          {certs.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {certs.slice(0, 2).map((c) => (
                                <Badge
                                  key={c}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {c}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <p className="text-[11px] font-semibold text-primary group-hover:underline pt-0.5">
                            Xem gian hàng →
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {shopTotalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={shopPage <= 1}
                    onClick={() => goToShopPage(shopPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {shopPageNumbers.map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        size="icon"
                        variant={p === shopPage ? "default" : "outline"}
                        className="h-8 w-8 text-sm"
                        onClick={() => goToShopPage(p as number)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    disabled={shopPage >= shopTotalPages}
                    onClick={() => goToShopPage(shopPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Bottom CTA ────────────────────────────────────────── */}
        <section className="border-t border-border/40 gradient-hero py-12">
          <div className="container text-center space-y-4">
            <h2 className="text-xl md:text-2xl font-bold">
              Sẵn sàng mua nông sản sạch?
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Hàng trăm sản phẩm từ nông hộ uy tín đang chờ bạn khám phá.
            </p>
            <Link href="/marketplace">
              <Button size="lg" className="h-12 px-8 font-bold gap-2 shadow-md shadow-primary/20">
                <ShoppingBag className="h-5 w-5" />
                Khám phá chợ nông sản
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </ConsumerLayout>
  );
}
