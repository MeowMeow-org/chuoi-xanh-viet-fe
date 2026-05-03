"use client";

import Link from "next/link";
import { Loader2, ShoppingCart, ShieldCheck, UserPlus, Users } from "lucide-react";

import { useAdminDashboardSummaryQuery } from "@/hooks/useAdmin";
import {
  ADMIN_ROLE_LABEL,
  ADMIN_STATUS_LABEL,
  type AdminUserRole,
} from "@/services/admin";

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default function AdminPage() {
  const { data, isLoading, isError } = useAdminDashboardSummaryQuery();

  return (
    <main className="bg-[hsl(120,20%,98%)] px-4 py-6 text-[hsl(150,10%,15%)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(142,50%,35%)]">
            Không gian quản trị
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Tổng quan</h1>
          <p className="mt-3 text-sm text-[hsl(150,5%,45%)]">
            Số liệu cập nhật từ hệ thống: người dùng, đơn hàng và chứng chỉ chờ duyệt (phạm vi
            admin).
          </p>
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              href="/admin/users"
              className="font-medium text-[hsl(142,71%,38%)] underline-offset-2 hover:underline"
            >
              Quản lý người dùng
            </Link>
            <Link
              href="/admin/broadcast"
              className="font-medium text-[hsl(142,71%,38%)] underline-offset-2 hover:underline"
            >
              Gửi thông báo hệ thống
            </Link>
            <Link
              href="/admin/certificates"
              className="font-medium text-[hsl(142,71%,38%)] underline-offset-2 hover:underline"
            >
              Duyệt chứng chỉ
            </Link>
          </p>
        </header>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[hsl(142,71%,40%)]" />
          </div>
        )}

        {isError && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            Không tải được dữ liệu tổng quan. Vui lòng thử lại sau.
          </div>
        )}

        {data && !isLoading && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[hsl(150,5%,45%)]">
                  <Users className="h-4 w-4" />
                  <p className="text-sm">Tổng người dùng</p>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">{data.users.total}</p>
              </article>
              <article className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[hsl(150,5%,45%)]">
                  <UserPlus className="h-4 w-4" />
                  <p className="text-sm">Người dùng mới (7 ngày)</p>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">{data.last7Days.newUsers}</p>
              </article>
              <article className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[hsl(150,5%,45%)]">
                  <ShoppingCart className="h-4 w-4" />
                  <p className="text-sm">Đơn mới (7 ngày)</p>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">{data.last7Days.newOrders}</p>
              </article>
              <article className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-[hsl(150,5%,45%)]">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-sm">Chứng chỉ farm chờ duyệt (admin)</p>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {data.pendingFarmCertificatesAdminScope}
                </p>
                <Link
                  href="/admin/certificates"
                  className="mt-2 inline-block text-xs font-medium text-[hsl(142,71%,38%)] hover:underline"
                >
                  Mở trang duyệt
                </Link>
              </article>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">Người dùng theo vai trò</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {(
                    Object.entries(data.users.byRole) as [AdminUserRole, number][]
                  ).map(([role, count]) => (
                    <li
                      key={role}
                      className="flex justify-between border-b border-[hsl(120,10%,94%)] py-2 last:border-0"
                    >
                      <span className="text-[hsl(150,5%,45%)]">{ADMIN_ROLE_LABEL[role]}</span>
                      <span className="font-semibold tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold">Người dùng theo trạng thái</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {(
                    Object.entries(data.users.byStatus) as [
                      keyof typeof ADMIN_STATUS_LABEL,
                      number,
                    ][]
                  ).map(([status, count]) => (
                    <li
                      key={status}
                      className="flex justify-between border-b border-[hsl(120,10%,94%)] py-2 last:border-0"
                    >
                      <span className="text-[hsl(150,5%,45%)]">{ADMIN_STATUS_LABEL[status]}</span>
                      <span className="font-semibold tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="rounded-xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold">Đơn hàng theo trạng thái</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(data.orders.byStatus).map(([status, count]) => (
                  <li
                    key={status}
                    className="flex justify-between rounded-lg bg-[hsl(120,15%,97%)] px-3 py-2 text-sm"
                  >
                    <span>{ORDER_STATUS_LABEL[status] ?? status}</span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        <div>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-[hsl(142,71%,45%)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
