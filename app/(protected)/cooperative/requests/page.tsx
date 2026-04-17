"use client";

import { useState } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/shared/Pagination";
import {
  useApproveMembershipMutation,
  useCooperativeMembershipsQuery,
  useRejectMembershipMutation,
} from "@/hooks/useCooperativeMemberships";

export default function CooperativeRequestsPage() {
  const [page, setPage] = useState(1);
  const { items, pagination, isLoading, error } = useCooperativeMembershipsQuery(
    {
      status: "pending",
      page,
      limit: 6,
    },
  );

  const { mutateAsync: approveAsync, isPending: isApproving } =
    useApproveMembershipMutation();
  const { mutateAsync: rejectAsync, isPending: isRejecting } =
    useRejectMembershipMutation();

  const isBusy = isApproving || isRejecting;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div>
        <h1 className="text-xl font-bold text-[hsl(150,16%,12%)]">Yêu cầu tham gia</h1>
        <p className="mt-1 text-sm text-[hsl(150,8%,40%)]">
          Duyệt hoặc từ chối hồ sơ nông hộ đăng ký vào HTX.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`rq-sk-${i}`}>
              <CardContent className="p-4">
                <div className="h-4 w-56 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                <div className="mt-2 h-3 w-40 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-red-200">
          <CardContent className="p-4 text-sm text-red-600">
            Không tải được danh sách yêu cầu.
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <Inbox className="h-10 w-10 text-[hsl(142,71%,45%)]/50" />
            <p>Không có yêu cầu nào đang chờ.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && items.length > 0 && (
        <>
          <div className="grid gap-3">
            {items.map((row) => (
              <Card key={row.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                          <Inbox className="h-4 w-4 text-[hsl(142,71%,45%)]" />
                        </span>
                        <div>
                          <p className="font-semibold text-[hsl(150,10%,18%)]">
                            {row.farmer.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Nông trại: {row.farm.name}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {row.farmer.email} · {row.farmer.phone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Đăng ký:{" "}
                        {new Date(row.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]"
                        disabled={isBusy}
                        onClick={async () => {
                          try {
                            await approveAsync(row.id);
                            toast.success("Đã duyệt, nông hộ đã gia nhập HTX.");
                          } catch {
                            /* axios interceptor đã toast lỗi */
                          }
                        }}
                      >
                        {isApproving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Duyệt"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[hsl(142,20%,75%)]"
                        disabled={isBusy}
                        onClick={async () => {
                          try {
                            await rejectAsync({ membershipId: row.id });
                            toast.success("Đã từ chối hồ sơ.");
                          } catch {
                            /* axios interceptor đã toast lỗi */
                          }
                        }}
                      >
                        {isRejecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Từ chối"
                        )}
                      </Button>
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
