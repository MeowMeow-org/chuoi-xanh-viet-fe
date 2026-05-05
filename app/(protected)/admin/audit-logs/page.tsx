"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Pagination } from "@/components/shared/Pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FancySelect } from "@/components/ui/fancy-select";
import { useAdminAuditLogsQuery } from "@/hooks/useAdmin";

const PAGE_SIZE = 20;

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "success", label: "Thành công" },
  { value: "failed", label: "Thất bại" },
];

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN");
}

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [module, setModule] = useState("");
  const [keyword, setKeyword] = useState("");

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status: (status || undefined) as "success" | "failed" | undefined,
      module: module.trim() || undefined,
      q: keyword.trim() || undefined,
    }),
    [keyword, module, page, status],
  );

  const query = useAdminAuditLogsQuery(queryParams);
  const items = query.data?.items ?? [];
  const meta = query.data?.meta;

  return (
    <main className="bg-[hsl(120,20%,98%)] px-4 py-6 text-[hsl(150,10%,15%)] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <header className="rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">Audit Logs</h1>
          <p className="mt-2 text-sm text-[hsl(150,5%,45%)]">
            Theo dõi hành vi quan trọng trên toàn hệ thống: ai thao tác gì, trên
            thực thể nào, tại thời điểm nào.
          </p>
        </header>

        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <FancySelect
                value={status}
                onChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
                options={statusOptions}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Module</Label>
              <Input
                value={module}
                onChange={(e) => {
                  setModule(e.target.value);
                  setPage(1);
                }}
                placeholder="auth, certificate, cooperative..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Từ khóa</Label>
              <Input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="action, entity, path..."
              />
            </div>
          </CardContent>
        </Card>

        {query.isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Không có bản ghi audit phù hợp.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((log) => (
              <Card key={log.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={log.status === "success" ? "default" : "outline"}>
                      {log.status === "success" ? "Thành công" : "Thất bại"}
                    </Badge>
                    <Badge variant="outline">{log.module}</Badge>
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <p className="text-sm">
                    Actor:{" "}
                    <b>{log.actor?.full_name ?? log.actor_user_id ?? "system"}</b>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {log.method ?? "—"} {log.path ?? "—"} {log.entity_type ?? ""}{" "}
                    {log.entity_id ?? ""}
                  </p>
                  {log.error_message ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                      {log.error_message}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}

            {meta ? (
              <Pagination
                meta={meta}
                onPageChange={(nextPage) => setPage(nextPage)}
                className="pt-2"
              />
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
