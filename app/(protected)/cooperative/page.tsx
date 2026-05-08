"use client";

import Link from "next/link";
import { Inbox, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { cooperativeMembershipQueryKeys } from "@/hooks/useCooperativeMemberships";
import { cooperativeService } from "@/services/cooperative/cooperativeService";

export default function CooperativeDashboardPage() {
  const { data: pendingMeta } = useQuery({
    queryKey: [...cooperativeMembershipQueryKeys.all, "count", "pending"],
    queryFn: () =>
      cooperativeService.getMyMemberships({
        status: "pending",
        page: 1,
        limit: 1,
      }),
  });

  const { data: approvedMeta } = useQuery({
    queryKey: [...cooperativeMembershipQueryKeys.all, "count", "approved"],
    queryFn: () =>
      cooperativeService.getMyMemberships({
        status: "approved",
        page: 1,
        limit: 1,
      }),
  });

  const pendingCount = pendingMeta?.meta.total ?? 0;
  const householdCount = approvedMeta?.meta.total ?? 0;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <header className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[hsl(142,50%,35%)]">
          Hợp tác xã
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Tổng quan
        </h1>
        <p className="mt-2 text-sm text-[hsl(150,5%,45%)]">
          Theo dõi nông hộ thuộc HTX và xử lý hồ sơ đăng ký chờ duyệt.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/cooperative/households"
          className="group rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm transition-colors hover:border-[hsl(142,50%,70%)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[hsl(150,5%,45%)]">Nông hộ trong HTX</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-[hsl(150,10%,18%)]">
                {householdCount}
              </p>
              <p className="mt-2 text-xs font-medium text-[hsl(142,58%,32%)]">
                Xem danh sách →
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(142,71%,45%)]/12 text-[hsl(142,71%,40%)] transition group-hover:bg-[hsl(142,71%,45%)]/20">
              <Users className="h-5 w-5" />
            </span>
          </div>
        </Link>

        <Link
          href="/cooperative/requests"
          className="group rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-5 shadow-sm transition-colors hover:border-[hsl(142,50%,70%)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[hsl(150,5%,45%)]">Yêu cầu chờ duyệt</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-[hsl(150,10%,18%)]">
                {pendingCount}
              </p>
              <p className="mt-2 text-xs font-medium text-[hsl(142,58%,32%)]">
                Xử lý hồ sơ →
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(142,71%,45%)]/12 text-[hsl(142,71%,40%)] transition group-hover:bg-[hsl(142,71%,45%)]/20">
              <Inbox className="h-5 w-5" />
            </span>
          </div>
        </Link>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-[hsl(142,20%,80%)] bg-white px-4 py-2 text-sm font-semibold text-[hsl(150,10%,22%)] transition hover:bg-[hsl(120,20%,96%)]"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
