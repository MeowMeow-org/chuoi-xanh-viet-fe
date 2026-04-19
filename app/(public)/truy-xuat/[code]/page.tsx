"use client";

import { use } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

import ConsumerLayout from "@/components/layout/ConsumerLayout";
import TraceSeasonView from "@/components/trace/TraceSeasonView";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTraceResolveQuery } from "@/hooks/useTrace";

export default function PublicTraceResultPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const decodedCode = decodeURIComponent(code);
  const { data: resolved, isLoading, isError, error } = useTraceResolveQuery(
    decodedCode,
    { publicAccess: true },
  );

  return (
    <ConsumerLayout>
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6 pb-20 sm:px-6 md:pb-10 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/truy-xuat"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 -ml-2",
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Nhập mã khác
          </Link>
        </div>

        <div>
          <h1 className="text-xl font-bold">Truy xuất sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mã: <span className="font-mono">{decodedCode}</span>
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tìm sản phẩm...
          </div>
        )}

        {!isLoading && isError && (
          <Card>
            <CardContent className="space-y-4 p-6 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
              <p className="font-medium">Không tìm thấy mã truy xuất</p>
              <p className="text-sm text-muted-foreground">
                {(error as Error | undefined)?.message ??
                  "Mã không tồn tại hoặc lô bán đã bị vô hiệu hoá."}
              </p>
              <Link
                href="/truy-xuat"
                className={cn(buttonVariants({ variant: "outline" }), "inline-flex")}
              >
                Thử lại
              </Link>
            </CardContent>
          </Card>
        )}

        {!isLoading && resolved && (
          <TraceSeasonView seasonId={resolved.seasonId} publicAccess />
        )}
      </div>
    </ConsumerLayout>
  );
}
