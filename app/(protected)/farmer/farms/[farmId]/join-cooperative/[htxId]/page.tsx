"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMyFarmsQuery, useRequestCooperativeJoinMutation } from "@/hooks/useFarm";
import { cooperativeService } from "@/services/cooperative/cooperativeService";
import { cooperativeDisplayName } from "@/services/cooperative";
import { useAuthStore } from "@/store/useAuthStore";

const fieldClass =
  "cursor-not-allowed bg-[hsl(120,15%,96%)] text-[hsl(150,10%,22%)] opacity-100";

export default function JoinCooperativeConfirmPage() {
  const params = useParams<{ farmId: string; htxId: string }>();
  const farmId = Array.isArray(params.farmId) ? params.farmId[0] : params.farmId;
  const htxId = Array.isArray(params.htxId) ? params.htxId[0] : params.htxId;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { farms, isLoading: farmsLoading } = useMyFarmsQuery({ page: 1, limit: 100 });
  const farm = useMemo(() => farms.find((f) => f.id === farmId), [farms, farmId]);

  const { data: cooperatives = [] } = useQuery({
    queryKey: ["cooperative", "htx-list", "join"],
    queryFn: () => cooperativeService.getActiveCooperatives({ limit: 100 }),
  });
  const selectedHtx = useMemo(
    () => cooperatives.find((c) => c.id === htxId),
    [cooperatives, htxId],
  );

  const { mutate: submitJoin, isPending } = useRequestCooperativeJoinMutation();

  useEffect(() => {
    if (farmsLoading || !farm) return;
    if (farm.inCooperative) {
      router.replace(`/farmer/farms/${farmId}/seasons`);
    }
  }, [farm, farmId, farmsLoading, router]);

  const addressLine = farm
    ? [farm.ward, farm.district, farm.province].filter(Boolean).join(", ") ||
      farm.address ||
      "—"
    : "—";

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

  if (!selectedHtx) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <p className="text-sm text-muted-foreground">
          Không tìm thấy hợp tác xã này.
        </p>
        <Link
          href={`/farmer/farms/${farmId}/join-cooperative`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <Link
        href={`/farmer/farms/${farmId}/join-cooperative`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Chọn HTX khác
      </Link>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Xác nhận gửi đơn</CardTitle>
          <p className="text-sm text-muted-foreground">
            Hợp tác xã:{" "}
            <strong className="text-[hsl(150,10%,18%)]">
              {cooperativeDisplayName(selectedHtx)}
            </strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-[hsl(150,8%,38%)]">
            Kiểm tra thông tin bên dưới. Các ô chỉ để xem, không chỉnh sửa tại
            bước này.
          </p>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[hsl(150,10%,35%)]">Họ và tên</p>
            <Input
              className={fieldClass}
              disabled
              readOnly
              value={user?.fullName ?? "—"}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-[hsl(150,10%,35%)]">Số điện thoại</p>
            <Input
              className={fieldClass}
              disabled
              readOnly
              value={user?.phone ?? "—"}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-[hsl(150,10%,35%)]">Email</p>
            <Input
              className={fieldClass}
              disabled
              readOnly
              value={user?.email ?? "—"}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-[hsl(150,10%,35%)]">
              Tên nông trại
            </p>
            <Input className={fieldClass} disabled readOnly value={farm.name} />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-[hsl(150,10%,35%)]">Địa chỉ</p>
            <Input className={fieldClass} disabled readOnly value={addressLine} />
          </div>
          {farm.address && addressLine !== farm.address && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[hsl(150,10%,35%)]">
                Địa chỉ chi tiết
              </p>
              <Input
                className={fieldClass}
                disabled
                readOnly
                value={farm.address ?? "—"}
              />
            </div>
          )}

          <Button
            type="button"
            disabled={isPending}
            className="mt-2 w-full bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]"
            onClick={() => {
              submitJoin(
                { cooperative_user_id: htxId, farm_id: farmId },
                {
                  onSuccess: () => {
                    toast.success("Đã gửi đơn. Vui lòng chờ hợp tác xã duyệt.");
                    router.replace(`/farmer/farms/${farmId}/seasons`);
                  },
                },
              );
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi đơn"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
