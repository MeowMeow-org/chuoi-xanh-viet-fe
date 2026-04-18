"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, ShieldCheck, MapPin, Search, Loader2 } from "lucide-react";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { shopService } from "@/services/shop/shopService";

const REGIONS = [
  "Tất cả",
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Đồng Nai",
  "Long An",
];

const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const formatStock = (stock: number | string | null) => {
  if (stock === null) return 0;
  const num = typeof stock === "string" ? Number(stock) : stock;
  return Number.isFinite(num) ? num : 0;
};

export default function ConsumerMarketplacePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [region, setRegion] = useState("Tất cả");
  const [view, setView] = useState<"products" | "shops">("products");

  // Debounce search input (simple)
  useMemo(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const productsQuery = useQuery({
    queryKey: ["public-products", debouncedSearch, region],
    queryFn: () =>
      shopService.getPublicProducts({
        page: 1,
        limit: 40,
        searchTerm: debouncedSearch || undefined,
        province: region === "Tất cả" ? undefined : region,
      }),
    enabled: view === "products",
  });

  const shopsQuery = useQuery({
    queryKey: ["public-shops", debouncedSearch],
    queryFn: () =>
      shopService.getShops({
        page: 1,
        limit: 40,
        searchTerm: debouncedSearch || undefined,
      }),
    enabled: view === "shops",
  });

  const products = productsQuery.data?.items ?? [];
  const shops = shopsQuery.data?.items ?? [];

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-4xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm, gian hàng..."
            className="pl-10 h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "products" ? "default" : "outline"}
            onClick={() => setView("products")}
          >
            Sản phẩm
          </Button>
          <Button
            size="sm"
            variant={view === "shops" ? "default" : "outline"}
            onClick={() => setView("shops")}
          >
            Gian hàng
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {REGIONS.map((r) => (
            <Button
              key={r}
              size="sm"
              variant={region === r ? "secondary" : "ghost"}
              className="shrink-0 text-xs"
              onClick={() => setRegion(r)}
            >
              {r}
            </Button>
          ))}
        </div>

        {view === "products" && (
          <>
            {productsQuery.isLoading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Không có sản phẩm phù hợp
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((product) => {
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
                              <span className="font-bold text-muted-foreground">
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
                            {product.shop?.name}
                          </p>
                          <ProductRatingBadge
                            averageRating={product.averageRating}
                            reviewCount={product.reviewCount}
                            size="xs"
                            className="block"
                          />
                          {product.shop?.farm?.province && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {product.shop.farm.district
                                ? `${product.shop.farm.district}, `
                                : ""}
                              {product.shop.farm.province}
                            </div>
                          )}
                          <p className="text-primary font-bold text-sm">
                            {formatPrice(product.price)}đ/{product.unit ?? "đơn vị"}
                          </p>
                          {product.shop?.isVerified && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] gap-1 px-1.5 py-0"
                            >
                              <ShieldCheck className="h-3 w-3" /> Xác minh
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {view === "shops" && (
          <>
            {shopsQuery.isLoading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : shops.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Không có gian hàng phù hợp
              </div>
            ) : (
              <div className="space-y-3">
                {shops.map((shop) => {
                  const certs = Array.isArray(shop.certifications)
                    ? (shop.certifications as string[])
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
                                <MapPin className="h-3 w-3" />
                                {shop.farms.district
                                  ? `${shop.farms.district}, `
                                  : ""}
                                {shop.farms.province}
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
                              {certs.map((c) => (
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
          </>
        )}
      </div>
    </ConsumerLayout>
  );
}
