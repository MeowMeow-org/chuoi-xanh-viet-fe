"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Loader2, Plus, Store, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import { useMyShopsQuery } from "@/hooks/useFarmerShop";
import { cn } from "@/lib/utils";

export default function FarmerMarketplacePage() {
  const { farms, isLoading: farmsLoading } = useMyFarmsQuery({
    page: 1,
    limit: 100,
  });
  const { data: shops, isLoading: shopsLoading } = useMyShopsQuery();

  const loading = farmsLoading || shopsLoading;

  const farmsWithoutShop = useMemo(() => {
    if (!shops?.length) return farms;
    const taken = new Set(shops.map((s) => s.farm_id));
    return farms.filter((f) => !taken.has(f.id));
  }, [farms, shops]);

  const canOpenMore = farmsWithoutShop.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-24 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">
            Gian hàng của tôi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mỗi nông trại có 1 gian hàng riêng để bán sản phẩm.
          </p>
        </div>
        {canOpenMore && (
          <Link
            href="/farmer/marketplace/new"
            className={cn(
              buttonVariants({ size: "sm" }),
              "inline-flex shrink-0 gap-1.5",
            )}
          >
            <Plus className="h-4 w-4" />
            Mở gian hàng mới
          </Link>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải…
        </div>
      )}

      {!loading && farms.length === 0 && (
        <Card>
          <CardContent className="space-y-3 p-6 text-center text-sm">
            <p className="text-muted-foreground">
              Hiện tại bạn chưa có nông trại nào — hãy tạo nông trại{" "}
              <Link
                href="/farmer/farms/create"
                className={cn(
                  "inline font-semibold text-green-600! underline decoration-green-600/50! underline-offset-[3px]!",
                  "transition-colors hover:text-green-700! hover:decoration-green-700/60!",
                  "focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/35 focus-visible:ring-offset-2",
                )}
              >
                tại đây
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && farms.length > 0 && (shops?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Store className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Chưa có gian hàng nào</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mở gian hàng đầu tiên để bắt đầu đăng sản phẩm.
              </p>
            </div>
            <Link
              href="/farmer/marketplace/new"
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            >
              <Plus className="h-4 w-4" />
              Mở gian hàng
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && shops && shops.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((s) => {
            const coopName =
              s.farms?.cooperative_members?.[0]?.cooperative_user?.full_name ??
              null;
            return (
              <Link
                key={s.id}
                href={`/farmer/marketplace/shops/${s.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                    {s.avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={s.avatar_url}
                        alt={s.farms?.name ?? s.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold group-hover:text-primary">
                      {s.farms?.name ?? s.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {s.name}
                    </p>
                    {coopName && (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Users className="h-3 w-3 shrink-0" />
                        HTX:{" "}
                        <span className="truncate font-medium text-foreground">
                          {coopName}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                {s.description && (
                  <p className="min-w-0 truncate px-4 pb-4 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
