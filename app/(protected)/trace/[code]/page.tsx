"use client";

import { use } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import TraceSeasonView from "@/components/trace/TraceSeasonView";
import { Card, CardContent } from "@/components/ui/card";
import { useTraceResolveQuery } from "@/hooks/useTrace";

export default function TraceCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const decodedCode = decodeURIComponent(code);
  const { data: resolved, isLoading, isError, error } =
    useTraceResolveQuery(decodedCode);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 pb-20 sm:px-6 md:pb-10 lg:px-8">
      <div>
        <h1 className="text-xl font-bold">Truy xuất sản phẩm</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Mã: <span className="font-mono">{decodedCode}</span>
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tìm sản
          phẩm...
        </div>
      )}

      {!isLoading && isError && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
            <p className="font-medium">Không tìm thấy mã truy xuất</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {(error as Error | undefined)?.message ??
                "Mã không tồn tại hoặc lô bán đã bị vô hiệu hoá."}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && resolved && (
        <TraceSeasonView seasonId={resolved.seasonId} />
      )}
    </div>
  );
}
