"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/shared/Pagination";
import { useCooperativeMembershipsQuery } from "@/hooks/useCooperativeMemberships";

export default function CooperativeHouseholdsPage() {
  const [page, setPage] = useState(1);
  const { items, pagination, isLoading, error } = useCooperativeMembershipsQuery(
    {
      status: "approved",
      page,
      limit: 8,
    },
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div>
        <h1 className="text-xl font-bold text-[hsl(150,16%,12%)]">Nông hộ trong HTX</h1>
        <p className="mt-1 text-sm text-[hsl(150,8%,40%)]">
          Danh sách hộ đã được duyệt và gắn với hợp tác xã.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={`sk-${i}`}>
              <CardContent className="p-4">
                <div className="h-4 w-48 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-red-200">
          <CardContent className="p-4 text-sm text-red-600">
            Không tải được danh sách. Vui lòng thử lại.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <Users className="h-10 w-10 text-[hsl(142,71%,45%)]/50" />
            <p>Chưa có nông hộ nào được duyệt.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <>
          <div className="grid gap-3">
            {items.map((row) => (
              <Card key={row.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                          <Users className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                        </span>
                        <h2 className="font-semibold text-[hsl(150,10%,18%)]">
                          {row.farmer.fullName}
                        </h2>
                        <Badge className="bg-[hsl(142,71%,45%)]/12 text-[hsl(142,58%,28%)] hover:bg-[hsl(142,71%,45%)]/15">
                          {row.farm.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {row.farmer.email} · {row.farmer.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[row.farm.ward, row.farm.district, row.farm.province]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {pagination && (
            <Pagination
              meta={pagination}
              onPageChange={(next) => {
                if (next < 1 || next > pagination.totalPages) return;
                setPage(next);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
