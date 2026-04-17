"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import { cooperativeService } from "@/services/cooperative/cooperativeService";
import { cooperativeDisplayName } from "@/services/cooperative";

export default function JoinCooperativeListPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = Array.isArray(params.farmId) ? params.farmId[0] : params.farmId;
  const router = useRouter();

  const { farms, isLoading: farmsLoading } = useMyFarmsQuery({ page: 1, limit: 100 });
  const farm = useMemo(() => farms.find((f) => f.id === farmId), [farms, farmId]);

  const { data: cooperatives = [], isLoading: htxLoading } = useQuery({
    queryKey: ["cooperative", "htx-list", "join"],
    queryFn: () => cooperativeService.getActiveCooperatives({ limit: 100 }),
  });

  useEffect(() => {
    if (farmsLoading || !farm) return;
    if (farm.inCooperative) {
      router.replace(`/farmer/farms/${farmId}/seasons`);
    }
  }, [farm, farmId, farmsLoading, router]);

  if (farmsLoading || !farm) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(142,71%,45%)]" />
      </div>
    );
  }

  if (farm.inCooperative) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <Link
        href={`/farmer/farms/${farmId}/seasons`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại mùa vụ
      </Link>

      <div>
        <h1 className="text-xl font-bold text-[hsl(150,16%,12%)]">
          Chọn hợp tác xã
        </h1>
        <p className="mt-1 text-sm text-[hsl(150,8%,40%)]">
          Nông trại <strong>{farm.name}</strong> — chọn HTX và bấm đăng ký để xác nhận
          thông tin và gửi đơn.
        </p>
      </div>

      {htxLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              className="h-16 animate-pulse rounded-xl bg-[hsl(120,20%,94%)]"
            />
          ))}
        </div>
      )}

      {!htxLoading && cooperatives.length === 0 && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Chưa có hợp tác xã khả dụng.
          </CardContent>
        </Card>
      )}

      {!htxLoading &&
        cooperatives.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/12">
                  <Building2 className="h-5 w-5 text-[hsl(142,71%,40%)]" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[hsl(150,10%,18%)]">
                    {cooperativeDisplayName(item)}
                  </p>
                  {item.phone && (
                    <p className="text-xs text-muted-foreground">{item.phone}</p>
                  )}
                </div>
              </div>
              <Button
                asChild
                className="w-full shrink-0 bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)] sm:w-auto"
              >
                <Link href={`/farmer/farms/${farmId}/join-cooperative/${item.id}`}>
                  Đăng ký
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
