"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useAdminPatchUserStatusMutation,
  useAdminUserQuery,
  useAdminUsersQuery,
} from "@/hooks/useAdmin";
import {
  ADMIN_ROLE_LABEL,
  ADMIN_STATUS_LABEL,
  type AdminAccountStatus,
  type AdminUserListItem,
  type AdminUserRole,
} from "@/services/admin";
import { cn } from "@/lib/utils";

function formatDt(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [qInput, setQInput] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | AdminUserRole>("");
  const [statusFilter, setStatusFilter] = useState<"" | AdminAccountStatus>("");
  const limit = 20;

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(appliedQ.trim() ? { q: appliedQ.trim() } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
    [page, limit, appliedQ, roleFilter, statusFilter],
  );

  const listQuery = useAdminUsersQuery(queryParams);
  const patchStatus = useAdminPatchUserStatusMutation();

  const [detailId, setDetailId] = useState<string | null>(null);
  const detailQuery = useAdminUserQuery(detailId);

  const [confirmTarget, setConfirmTarget] = useState<{
    user: AdminUserListItem;
    nextStatus: "active" | "suspended";
  } | null>(null);

  const applySearch = () => {
    setPage(1);
    setAppliedQ(qInput);
  };

  const items = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;

  return (
    <main className="bg-[hsl(120,20%,98%)] px-4 py-6 text-[hsl(150,10%,15%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(142,50%,35%)]">
            Quản trị
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Người dùng</h1>
          <p className="mt-2 text-sm text-[hsl(150,5%,45%)]">
            Tìm kiếm, lọc theo vai trò và trạng thái. Chỉ có thể đổi giữa hoạt động và đã khóa;
            không thể khóa quản trị viên cuối cùng đang hoạt động.
          </p>
        </header>

        <section className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor="admin-user-q">Tìm theo SĐT, email, tên</Label>
              <div className="flex gap-2">
                <Input
                  id="admin-user-q"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applySearch();
                  }}
                  placeholder="Ví dụ: 09… hoặc tên"
                  className="max-w-md"
                />
                <Button type="button" variant="secondary" onClick={() => applySearch()}>
                  <Search className="mr-1 h-4 w-4" />
                  Tìm
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="space-y-1">
                <Label htmlFor="admin-user-role">Vai trò</Label>
                <Select
                  id="admin-user-role"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as AdminUserRole | "");
                    setPage(1);
                  }}
                  className="w-44"
                >
                  <option value="">Tất cả</option>
                  {(Object.keys(ADMIN_ROLE_LABEL) as AdminUserRole[]).map((r) => (
                    <option key={r} value={r}>
                      {ADMIN_ROLE_LABEL[r]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-user-status">Trạng thái</Label>
                <Select
                  id="admin-user-status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as AdminAccountStatus | "");
                    setPage(1);
                  }}
                  className="w-44"
                >
                  <option value="">Tất cả</option>
                  {(Object.keys(ADMIN_STATUS_LABEL) as AdminAccountStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {ADMIN_STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </section>

        {listQuery.isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(142,71%,40%)]" />
          </div>
        )}

        {listQuery.isError && (
          <p className="text-center text-sm text-red-600">Không tải được danh sách.</p>
        )}

        {!listQuery.isLoading && !listQuery.isError && (
          <div className="overflow-hidden rounded-xl border border-[hsl(142,15%,88%)] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-[hsl(142,15%,92%)] bg-[hsl(120,18%,98%)] text-[hsl(150,6%,38%)]">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Tên</th>
                    <th className="px-3 py-3 font-semibold">SĐT</th>
                    <th className="px-3 py-3 font-semibold">Email</th>
                    <th className="px-3 py-3 font-semibold">Vai trò</th>
                    <th className="px-3 py-3 font-semibold">Trạng thái</th>
                    <th className="px-3 py-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-10 text-center text-[hsl(150,5%,45%)]">
                        Không có người dùng phù hợp.
                      </td>
                    </tr>
                  )}
                  {items.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[hsl(120,12%,96%)] last:border-0 hover:bg-[hsl(120,20%,99%)]"
                    >
                      <td className="px-3 py-3 font-medium">{u.full_name}</td>
                      <td className="px-3 py-3 tabular-nums">{u.phone}</td>
                      <td className="max-w-[200px] truncate px-3 py-3">{u.email ?? "—"}</td>
                      <td className="px-3 py-3">{ADMIN_ROLE_LABEL[u.role]}</td>
                      <td className="px-3 py-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            u.status === "active" && "bg-emerald-50 text-emerald-800",
                            u.status === "suspended" && "bg-red-50 text-red-800",
                            u.status === "pending" && "bg-amber-50 text-amber-900",
                          )}
                        >
                          {ADMIN_STATUS_LABEL[u.status]}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setDetailId(u.id)}
                          >
                            Chi tiết
                          </Button>
                          {u.status === "active" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-red-700 hover:text-red-800"
                              onClick={() => setConfirmTarget({ user: u, nextStatus: "suspended" })}
                            >
                              Khóa
                            </Button>
                          ) : u.status === "suspended" ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8"
                              onClick={() => setConfirmTarget({ user: u, nextStatus: "active" })}
                            >
                              Mở khóa
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[hsl(142,15%,92%)] px-3 py-3 text-sm">
                <span className="text-[hsl(150,5%,45%)]">
                  Trang {meta.page} / {meta.totalPages} — {meta.total} người
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!meta.previousPage}
                    onClick={() => meta.previousPage && setPage(meta.previousPage)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!meta.nextPage}
                    onClick={() => meta.nextPage && setPage(meta.nextPage)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chi tiết người dùng</DialogTitle>
            </DialogHeader>
            {detailQuery.isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[hsl(142,71%,40%)]" />
              </div>
            )}
            {detailQuery.data && (
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-[hsl(150,5%,45%)]">Họ tên</dt>
                  <dd className="font-medium">{detailQuery.data.full_name}</dd>
                </div>
                <div>
                  <dt className="text-[hsl(150,5%,45%)]">SĐT</dt>
                  <dd>{detailQuery.data.phone}</dd>
                </div>
                <div>
                  <dt className="text-[hsl(150,5%,45%)]">Email</dt>
                  <dd>{detailQuery.data.email ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[hsl(150,5%,45%)]">Vai trò</dt>
                  <dd>{ADMIN_ROLE_LABEL[detailQuery.data.role]}</dd>
                </div>
                <div>
                  <dt className="text-[hsl(150,5%,45%)]">Trạng thái</dt>
                  <dd>{ADMIN_STATUS_LABEL[detailQuery.data.status]}</dd>
                </div>
                <div>
                  <dt className="text-[hsl(150,5%,45%)]">Zalo user id</dt>
                  <dd className="break-all">{detailQuery.data.zalo_user_id ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[hsl(150,5%,45%)]">Tạo lúc</dt>
                  <dd>{formatDt(detailQuery.data.created_at)}</dd>
                </div>
              </dl>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!confirmTarget}
          onOpenChange={(o) => !o && setConfirmTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmTarget?.nextStatus === "suspended"
                  ? "Khóa tài khoản?"
                  : "Mở khóa tài khoản?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmTarget &&
                  `${confirmTarget.user.full_name} (${confirmTarget.user.phone}) — trạng thái sau thao tác: ${
                    confirmTarget.nextStatus === "suspended" ? "Đã khóa" : "Hoạt động"
                  }.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <Button
                type="button"
                variant={confirmTarget?.nextStatus === "suspended" ? "destructive" : "default"}
                disabled={patchStatus.isPending}
                onClick={async () => {
                  if (!confirmTarget) return;
                  try {
                    await patchStatus.mutateAsync({
                      userId: confirmTarget.user.id,
                      status: confirmTarget.nextStatus,
                    });
                    setConfirmTarget(null);
                    setDetailId(null);
                  } catch {
                    /* toast from axios */
                  }
                }}
              >
                {patchStatus.isPending ? "Đang cập nhật…" : "Xác nhận"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
