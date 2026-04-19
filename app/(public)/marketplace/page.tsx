"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ShieldCheck, MapPin, Search, Loader2, SlidersHorizontal } from "lucide-react";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { shopService } from "@/services/shop/shopService";
import type { PublicProductSort } from "@/services/shop";
import {
  MarketplaceLocationFilters,
  type MarketplaceLocationValue,
} from "@/components/marketplace/MarketplaceLocationFilters";

const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const formatStock = (stock: number | string | null) => {
  if (stock === null) return 0;
  const num = typeof stock === "string" ? Number(stock) : stock;
  return Number.isFinite(num) ? num : 0;
};

/** Nhập dạng 25000 hoặc 25.000 — trả về số hoặc undefined */
function parseVnPriceInput(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const normalized = t.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [location, setLocation] = useState<MarketplaceLocationValue>({});
  const [locationFilterKey, setLocationFilterKey] = useState(0);
  const [minPriceStr, setMinPriceStr] = useState("");
  const [maxPriceStr, setMaxPriceStr] = useState("");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");
  const [sort, setSort] = useState<PublicProductSort>("newest");
  const [view, setView] = useState<"products" | "shops">("products");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMinPrice(minPriceStr.trim()), 400);
    return () => clearTimeout(t);
  }, [minPriceStr]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMaxPrice(maxPriceStr.trim()), 400);
    return () => clearTimeout(t);
  }, [maxPriceStr]);

  const productsQuery = useQuery({
    queryKey: [
      "public-products",
      debouncedSearch,
      location.province,
      location.district,
      location.ward,
      sort,
      debouncedMinPrice,
      debouncedMaxPrice,
    ],
    queryFn: () =>
      shopService.getPublicProducts({
        page: 1,
        limit: 40,
        searchTerm: debouncedSearch || undefined,
        province: location.province,
        district: location.district,
        ward: location.ward,
        sort,
        minPrice: parseVnPriceInput(debouncedMinPrice),
        maxPrice: parseVnPriceInput(debouncedMaxPrice),
      }),
    enabled: view === "products",
  });

  const shopsQuery = useQuery({
    queryKey: [
      "public-shops",
      debouncedSearch,
      location.province,
      location.district,
      location.ward,
    ],
    queryFn: () =>
      shopService.getShops({
        page: 1,
        limit: 40,
        searchTerm: debouncedSearch || undefined,
        province: location.province,
        district: location.district,
        ward: location.ward,
      }),
    enabled: view === "shops",
  });

  const products = productsQuery.data?.items ?? [];
  const shops = shopsQuery.data?.items ?? [];

  const resetFilters = () => {
    setLocationFilterKey((k) => k + 1);
    setLocation({});
    setMinPriceStr("");
    setMaxPriceStr("");
    setSort("newest");
  };

  return (
    <ConsumerLayout>
      <div className="container max-w-4xl space-y-4 py-4 pb-20 md:pb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm, gian hàng..."
            className="h-12 pl-10"
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

        <div className="space-y-3 rounded-lg border border-border bg-card/50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              Lọc khu vực &amp; giá
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={resetFilters}
            >
              Đặt lại
            </Button>
          </div>

          <MarketplaceLocationFilters
            key={locationFilterKey}
            onChange={setLocation}
          />

          {view === "products" && (
            <>
              <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="mp-sort" className="text-xs">
                    Sắp xếp giá
                  </Label>
                  <select
                    id="mp-sort"
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value as PublicProductSort)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá thấp → cao</option>
                    <option value="price_desc">Giá cao → thấp</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mp-min" className="text-xs">
                    Giá từ (đ)
                  </Label>
                  <Input
                    id="mp-min"
                    inputMode="numeric"
                    placeholder="0"
                    value={minPriceStr}
                    onChange={(e) => setMinPriceStr(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mp-max" className="text-xs">
                    Giá đến (đ)
                  </Label>
                  <Input
                    id="mp-max"
                    inputMode="numeric"
                    placeholder="Không giới hạn"
                    value={maxPriceStr}
                    onChange={(e) => setMaxPriceStr(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Giá: lọc theo đơn giá niêm yết của sản phẩm.
              </p>
            </>
          )}
        </div>

        {view === "products" && (
          <>
            {productsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Không có sản phẩm phù hợp
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {products.map((product) => {
                  const stock = formatStock(product.stockQty);
                  const outOfStock = stock <= 0;
                  return (
                    <Link key={product.id} href={`/product/${product.id}`}>
                      <Card className="h-full transition-colors hover:border-primary/40">
                        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-t-lg bg-muted/50">
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
                            <div className="absolute inset-0 flex items-center justify-center rounded-t-lg bg-background/60">
                              <span className="font-bold text-muted-foreground">
                                Hết hàng
                              </span>
                            </div>
                          )}
                        </div>
                        <CardContent className="space-y-1.5 p-3">
                          <p className="line-clamp-1 text-sm font-semibold">
                            {product.name}
                          </p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
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
                              {product.shop.farm.ward
                                ? `${product.shop.farm.ward}, `
                                : ""}
                              {product.shop.farm.province}
                            </div>
                          )}
                          <p className="text-sm font-bold text-primary">
                            {formatPrice(product.price)}đ/{product.unit ?? "đơn vị"}
                          </p>
                          {product.shop?.isVerified && (
                            <Badge
                              variant="secondary"
                              className="gap-1 px-1.5 py-0 text-[10px]"
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : shops.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Không có gian hàng phù hợp
              </div>
            ) : (
              <div className="space-y-3">
                {shops.map((shop) => {
                  const certs = Array.isArray(shop.certifications)
                    ? (shop.certifications as string[])
                    : [];
                  return (
                    <Link key={shop.id} href={`/shop/${shop.id}`}>
                      <Card className="mb-3 transition-colors hover:border-primary/40">
                        <CardContent className="flex items-start gap-4 p-4">
                          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                            <Leaf className="h-7 w-7 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-bold">{shop.name}</p>
                            <ProductRatingBadge
                              averageRating={shop.average_rating}
                              reviewCount={shop.review_count}
                              size="xs"
                              className="block"
                            />
                            {shop.farms?.province && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {shop.farms.ward
                                  ? `${shop.farms.ward}, `
                                  : ""}
                                {shop.farms.district
                                  ? `${shop.farms.district}, `
                                  : ""}
                                {shop.farms.province}
                              </div>
                            )}
                            {shop.description && (
                              <p className="line-clamp-2 min-w-0 w-full break-words text-xs text-muted-foreground">
                                {shop.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-2">
                              {shop.is_verified && (
                                <Badge
                                  variant="secondary"
                                  className="gap-1 px-1.5 py-0 text-[10px]"
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  Đã xác minh
                                </Badge>
                              )}
                              {certs.map((c) => (
                                <Badge
                                  key={c}
                                  variant="secondary"
                                  className="px-1.5 py-0 text-[10px]"
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
