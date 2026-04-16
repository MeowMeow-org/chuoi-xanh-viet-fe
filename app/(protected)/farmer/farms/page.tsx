"use client";

import { useMemo } from "react";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Sprout } from "lucide-react";

import { useMyFarmsQuery } from "@/hooks/useFarm";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/shared/Pagination";

export default function FarmerFarmsPage() {
  const [page, setPage] = useState(1);
  const { farms, pagination, isLoading, error } = useMyFarmsQuery({
    page,
    limit: 5,
  });

  const normalizedFarms = useMemo(
    () =>
      farms.map((farm) => ({
        id: farm.id,
        name: farm.name,
        location:
          [farm.ward, farm.district, farm.province]
            .filter(Boolean)
            .join(", ") ||
          farm.address ||
          "Chưa cập nhật địa chỉ",
        area:
          farm.areaHa !== null && farm.areaHa !== undefined
            ? `${farm.areaHa} ha`
            : "Chưa cập nhật diện tích",
      })),
    [farms],
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <h1 className="text-xl font-bold">Nông trại</h1>

      <p className="text-sm text-muted-foreground">
        Danh sách nông trại thuộc tài khoản của bạn.
      </p>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={`farm-skeleton-${index}`}>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-[hsl(120,20%,92%)]" />
                  <div className="space-y-2">
                    <div className="h-4 w-44 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                    <div className="h-3 w-56 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                    <div className="h-3 w-28 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                  </div>
                </div>
                <div className="h-5 w-5 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-200">
          <CardContent className="p-4 text-sm text-red-600">
            Không thể tải danh sách nông trại. Vui lòng thử lại.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && normalizedFarms.length === 0 && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Bạn chưa có nông trại nào.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && normalizedFarms.length > 0 && (
        <>
          <div className="grid gap-3">
            {normalizedFarms.map((farm) => (
              <Link
                key={farm.id}
                href={`/farmer/farms/${farm.id}/seasons`}
                className="block"
              >
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                        <Sprout className="h-5 w-5 text-[hsl(142,71%,45%)]" />
                      </span>
                      <div>
                        <p className="text-base font-semibold">{farm.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {farm.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Diện tích: {farm.area}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination && (
            <Pagination
              meta={pagination}
              onPageChange={(nextPage) => {
                if (nextPage < 1 || nextPage > pagination.totalPages) return;
                setPage(nextPage);
              }}
              className="pt-2"
            />
          )}
        </>
      )}

      {!isLoading && !error && (
        <Link href="/farmer/farms/create" className="block">
          <Card className="cursor-pointer border-2 border-dashed border-[hsl(142,20%,80%)] bg-[hsl(120,20%,97%)] transition-colors hover:border-[hsl(142,50%,60%)]">
            <CardContent className="flex items-center justify-center gap-2 p-6 text-[hsl(150,8%,34%)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                <Plus className="h-5 w-5 text-[hsl(142,71%,45%)]" />
              </span>
              <div className="text-sm">
                <p className="font-semibold">Thêm nông trại mới</p>
                <p className="text-xs text-muted-foreground">
                  Nhấn để mở trang tạo nông trại
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}
    </div>
  );
}
