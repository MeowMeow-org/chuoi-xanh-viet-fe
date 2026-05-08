"use client";

import { useState } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/shared/Pagination";
import {
  useApproveMembershipMutation,
  useCooperativeMembershipsQuery,
  useRejectMembershipMutation,
} from "@/hooks/useCooperativeMemberships";
import type { CooperativeMembership } from "@/services/cooperative";

export default function CooperativeRequestsPage() {
  const [page, setPage] = useState(1);
  const { items, pagination, isLoading, error } = useCooperativeMembershipsQuery(
    {
      status: "pending",
      page,
      limit: 6,
    },
  );

  const [approveRow, setApproveRow] = useState<CooperativeMembership | null>(null);
  const [approveNote, setApproveNote] = useState("");
  const [rejectRow, setRejectRow] = useState<CooperativeMembership | null>(null);
  const [rejectNote, setRejectNote] = useState("");

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
          Duyệt hoặc từ chối hồ sơ nông hộ đăng ký vào HTX. Có thể thêm ghi chú gửi
          kèm thông báo cho nông hộ.
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
                        className="bg-[hsl(142,71%,45%)] text-white! hover:bg-[hsl(142,71%,40%)] hover:text-white!"
                        disabled={isBusy}
                        onClick={() => {
                          setApproveNote("");
                          setApproveRow(row);
                        }}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[hsl(142,20%,75%)]"
                        disabled={isBusy}
                        onClick={() => {
                          setRejectNote("");
                          setRejectRow(row);
                        }}
                      >
                        Từ chối
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

      <Dialog
        open={!!approveRow}
        onOpenChange={(o) => {
          if (!o) {
            setApproveRow(null);
            setApproveNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duyệt tham gia HTX</DialogTitle>
          </DialogHeader>
          {approveRow && (
            <>
              <p className="text-sm text-muted-foreground">
                <strong>{approveRow.farmer.fullName}</strong> — {approveRow.farm.name}
              </p>
              <div className="space-y-2">
                <Label htmlFor="approve-note">Ghi chú gửi nông hộ (tùy chọn)</Label>
                <Textarea
                  id="approve-note"
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  placeholder="Ví dụ: Chào mừng hộ gia nhập, vui lòng cập nhật nhật ký mùa vụ…"
                  rows={3}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setApproveRow(null);
                    setApproveNote("");
                  }}
                  disabled={isApproving}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  className="bg-[hsl(142,71%,45%)] text-white! hover:bg-[hsl(142,71%,40%)]"
                  disabled={isApproving}
                  onClick={async () => {
                    try {
                      await approveAsync({
                        membershipId: approveRow.id,
                        note: approveNote.trim() || undefined,
                      });
                      toast.success("Đã duyệt, nông hộ đã gia nhập HTX.");
                      setApproveRow(null);
                      setApproveNote("");
                    } catch {
                      /* axios interceptor đã toast lỗi */
                    }
                  }}
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Xác nhận duyệt"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectRow}
        onOpenChange={(o) => {
          if (!o) {
            setRejectRow(null);
            setRejectNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu</DialogTitle>
          </DialogHeader>
          {rejectRow && (
            <>
              <p className="text-sm text-muted-foreground">
                <strong>{rejectRow.farmer.fullName}</strong> — {rejectRow.farm.name}
              </p>
              <div className="space-y-2">
                <Label htmlFor="reject-note">Lý do từ chối</Label>
                <Textarea
                  id="reject-note"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Bắt buộc — ghi rõ lý do (tối thiểu 5 ký tự)…"
                  rows={4}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRejectRow(null);
                    setRejectNote("");
                  }}
                  disabled={isRejecting}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isRejecting}
                  onClick={async () => {
                    if (rejectNote.trim().length < 5) {
                      toast.error("Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự).");
                      return;
                    }
                    try {
                      await rejectAsync({
                        membershipId: rejectRow.id,
                        note: rejectNote.trim(),
                      });
                      toast.success("Đã từ chối hồ sơ.");
                      setRejectRow(null);
                      setRejectNote("");
                    } catch {
                      /* axios interceptor đã toast lỗi */
                    }
                  }}
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Gửi từ chối"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
