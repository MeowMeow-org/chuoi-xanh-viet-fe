"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Pagination } from "@/components/shared/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddScopeFarmMutation,
  useCoopCertScopeQuery,
  useEligibleMembersForScopeQuery,
  useMyCoopCertsQuery,
  useRemoveScopeFarmMutation,
} from "@/hooks/useCertificate";
import { CERT_TYPE_LABEL } from "@/services/certificate";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 100;

function useDebouncedValue<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function CoopCertThuaHuongPage() {
  const params = useParams();
  const certificateId =
    typeof params.certificateId === "string" ? params.certificateId : "";

  const certsQuery = useMyCoopCertsQuery({ page: 1, limit: 100 });
  const cert = useMemo(
    () => certsQuery.data?.items.find((c) => c.id === certificateId),
    [certsQuery.data, certificateId],
  );

  const [appliedPage, setAppliedPage] = useState(1);
  const [appliedSearchRaw, setAppliedSearchRaw] = useState("");
  const appliedSearch = useDebouncedValue(appliedSearchRaw, 350);

  const [eligiblePage, setEligiblePage] = useState(1);
  const [eligibleSearchRaw, setEligibleSearchRaw] = useState("");
  const eligibleSearch = useDebouncedValue(eligibleSearchRaw, 350);

  useEffect(() => {
    setAppliedPage(1);
  }, [appliedSearch]);
  useEffect(() => {
    setEligiblePage(1);
  }, [eligibleSearch]);

  const scopeQuery = useCoopCertScopeQuery(certificateId, {
    page: appliedPage,
    limit: PAGE_SIZE,
    searchTerm: appliedSearch.trim() || undefined,
  });

  const eligibleQuery = useEligibleMembersForScopeQuery(certificateId, {
    page: eligiblePage,
    limit: PAGE_SIZE,
    searchTerm: eligibleSearch.trim() || undefined,
  });

  const addMutation = useAddScopeFarmMutation();
  const removeMutation = useRemoveScopeFarmMutation();

  const handleAdd = async (farmId: string) => {
    try {
      await addMutation.mutateAsync({ certificateId, farmId });
      toast.success("Đã thêm nông hộ vào danh sách thừa hưởng");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể thêm";
      toast.error(message);
    }
  };

  const handleRemove = async (farmId: string) => {
    try {
      await removeMutation.mutateAsync({ certificateId, farmId });
      toast.success("Đã gỡ nông hộ khỏi danh sách thừa hưởng");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể gỡ";
      toast.error(message);
    }
  };

  const scopeItems = scopeQuery.data?.items ?? [];
  const scopeMeta = scopeQuery.data?.meta;
  const eligibleItems = eligibleQuery.data?.items ?? [];
  const eligibleMeta = eligibleQuery.data?.meta;

  const unknownCert =
    !certsQuery.isLoading && certificateId && cert == null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div className="flex flex-wrap items-start gap-4">
        <Link
          href="/cooperative/certificates"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition hover:bg-[hsl(120,10%,96%)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Chứng chỉ HTX
        </Link>
      </div>

      {unknownCert ? (
        <div className="rounded-xl border border-dashed border-[hsl(142,20%,85%)] bg-[hsl(120,30%,99%)] p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Không tìm thấy chứng chỉ này trong danh sách của HTX.
          </p>
          <Link
            href="/cooperative/certificates"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Quay lại
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(142,50%,35%)]">
              Danh sách thừa hưởng
            </p>
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-[hsl(150,10%,16%)]">
              <ShieldCheck className="h-7 w-7 shrink-0 text-[hsl(142,71%,40%)]" />
              <span>Thừa hưởng chứng chỉ</span>
            </h1>
            {certsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Đang tải…</p>
            ) : cert ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">
                  {CERT_TYPE_LABEL[cert.type] ?? cert.type}
                </span>
                {cert.certificate_no ? (
                  <span className="text-muted-foreground">
                    {" "}
                    · Số giấy: {cert.certificate_no}
                  </span>
                ) : null}
                . Chỉ các nông hộ được chọn mới hiển thị badge từ chứng chỉ HTX
                này.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border border-[hsl(142,15%,90%)] bg-[hsl(120,30%,99%)]/90 shadow-sm",
              )}
            >
              <div className="border-b border-[hsl(142,14%,92%)] px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Đã áp dụng
                  <span className="ml-1.5 tabular-nums font-normal text-muted-foreground">
                    ({scopeMeta?.total ?? scopeItems.length})
                  </span>
                </h2>
                <div className="mt-3 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên trại, địa chỉ…"
                      value={appliedSearchRaw}
                      onChange={(e) => setAppliedSearchRaw(e.target.value)}
                      className="h-9 pl-8"
                      aria-label="Tìm trong danh sách đã áp dụng"
                    />
                  </div>
                </div>
              </div>
              <div className="min-h-[min(50vh,28rem)] p-3">
                {scopeQuery.isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : scopeItems.length === 0 ? (
                  <p className="px-2 py-10 text-center text-sm text-muted-foreground">
                    {appliedSearch.trim()
                      ? "Không có kết quả khớp tìm kiếm."
                      : "Chưa có nông hộ nào trong danh sách thừa hưởng."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {scopeItems.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-transparent bg-white px-3 py-2.5 text-sm shadow-sm ring-1 ring-[hsl(142,14%,92%)] transition hover:ring-[hsl(142,40%,82%)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{row.farm.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {row.farm.users?.full_name ?? (
                              <span className="italic">Chưa rõ chủ hộ</span>
                            )}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 shrink-0 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => handleRemove(row.farm_id)}
                          disabled={removeMutation.isPending}
                          aria-label="Gỡ khỏi danh sách thừa hưởng"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {scopeMeta && scopeMeta.totalPages > 1 ? (
                <div className="border-t border-[hsl(142,14%,92%)] px-2 py-3">
                  <Pagination
                    meta={scopeMeta}
                    onPageChange={setAppliedPage}
                    className="justify-center"
                  />
                </div>
              ) : null}
            </section>

            <section
              className={cn(
                "flex flex-col overflow-hidden rounded-xl border border-[hsl(142,15%,90%)] bg-[hsl(120,30%,99%)]/90 shadow-sm",
              )}
            >
              <div className="border-b border-[hsl(142,14%,92%)] px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Có thể thêm
                  <span className="ml-1.5 tabular-nums font-normal text-muted-foreground">
                    ({eligibleMeta?.total ?? eligibleItems.length})
                  </span>
                </h2>
                <div className="mt-3 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên trại, địa chỉ, chủ hộ…"
                      value={eligibleSearchRaw}
                      onChange={(e) => setEligibleSearchRaw(e.target.value)}
                      className="h-9 pl-8"
                      aria-label="Tìm nông hộ có thể thêm"
                    />
                  </div>
                </div>
              </div>
              <div className="min-h-[min(50vh,28rem)] p-3">
                {eligibleQuery.isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : eligibleItems.length === 0 ? (
                  <p className="px-2 py-10 text-center text-sm text-muted-foreground">
                    {eligibleSearch.trim()
                      ? "Không có kết quả khớp tìm kiếm."
                      : "Tất cả nông hộ đã được thêm hoặc chưa có nông hộ được duyệt."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {eligibleItems.map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-transparent bg-white px-3 py-2.5 text-sm shadow-sm ring-1 ring-[hsl(142,14%,92%)] transition hover:ring-[hsl(142,40%,82%)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{m.farm.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {[m.farm.ward, m.farm.district, m.farm.province]
                              .filter(Boolean)
                              .join(", ") || (
                              <span className="italic">Chưa có địa chỉ</span>
                            )}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 shrink-0 border-[hsl(142,25%,82%)] p-0"
                          onClick={() => handleAdd(m.farm.id)}
                          disabled={addMutation.isPending}
                          aria-label="Thêm vào danh sách thừa hưởng"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {eligibleMeta && eligibleMeta.totalPages > 1 ? (
                <div className="border-t border-[hsl(142,14%,92%)] px-2 py-3">
                  <Pagination
                    meta={eligibleMeta}
                    onPageChange={setEligiblePage}
                    className="justify-center"
                  />
                </div>
              ) : null}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
