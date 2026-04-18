"use client";

import Link from "next/link";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Loader2, Package, ShoppingBag, Sprout, Tags } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import { farmerShopKeys, useMyShopsQuery } from "@/hooks/useFarmerShop";
import { orderService } from "@/services/order/orderService";
import { shopService } from "@/services/shop/shopService";
import { cn } from "@/lib/utils";

const DASHBOARD_KEYS = {
  orderTotal: ["farmer-dashboard", "orders-total"] as const,
};

export default function FarmerPage() {
  const { pagination: farmMeta, isLoading: farmsLoading } = useMyFarmsQuery({
    page: 1,
    limit: 1,
  });
  const { data: shops = [], isLoading: shopsLoading } = useMyShopsQuery();

  const ordersQuery = useQuery({
    queryKey: DASHBOARD_KEYS.orderTotal,
    queryFn: () => orderService.getShopOrders({ page: 1, limit: 1 }),
  });

  const productMetaQueries = useQueries({
    queries: shops.map((shop) => ({
      queryKey: [...farmerShopKeys.shopProducts(shop.id), "count-only"],
      queryFn: () => shopService.getShopProducts(shop.id, { page: 1, limit: 1 }),
      enabled: shops.length > 0,
    })),
  });

  const farmCount = farmMeta?.total ?? 0;
  const shopCount = shops.length;
  const orderCount = ordersQuery.data?.meta.total ?? 0;
  const productCount = productMetaQueries.reduce(
    (sum, q) => sum + (q.data?.meta.total ?? 0),
    0,
  );

  const productsLoading =
    shops.length > 0 && productMetaQueries.some((q) => q.isLoading);

  const loading =
    farmsLoading || shopsLoading || ordersQuery.isLoading || productsLoading;

  const cards = [
    {
      href: "/farmer/farms",
      label: "Nông trại",
      value: farmCount,
      icon: Sprout,
      hint: "Quản lý nông trại",
    },
    {
      href: "/farmer/marketplace",
      label: "Gian hàng",
      value: shopCount,
      icon: ShoppingBag,
      hint: "Gian hàng đang có",
    },
    {
      href: "/farmer/orders",
      label: "Đơn hàng",
      value: orderCount,
      icon: Package,
      hint: "Tất cả đơn từ khách",
    },
    {
      href: "/farmer/marketplace",
      label: "Sản phẩm",
      value: productCount,
      icon: Tags,
      hint: "Tổng SKU trên các gian hàng",
    },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-24 md:pb-8 sm:px-6 lg:px-8">
      <header className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-[hsl(150,10%,15%)]">
          Tổng quan
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhanh số liệu nông trại, gian hàng, đơn hàng và sản phẩm của bạn.
        </p>
      </header>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-[hsl(142,15%,88%)] bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(142,50%,40%)]" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.label} href={c.href} className="group block">
                <Card
                  className={cn(
                    "h-full border-[hsl(142,15%,88%)] bg-white shadow-sm transition-all",
                    "hover:border-[hsl(142,45%,72%)] hover:shadow-md",
                  )}
                >
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {c.label}
                      </span>
                      <span className="rounded-lg bg-[hsl(142,71%,45%)]/12 p-2 text-[hsl(142,71%,38%)] transition-colors group-hover:bg-[hsl(142,71%,45%)]/20">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="text-3xl font-bold tabular-nums tracking-tight text-[hsl(150,10%,15%)]">
                      {c.value.toLocaleString("vi-VN")}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.hint}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
