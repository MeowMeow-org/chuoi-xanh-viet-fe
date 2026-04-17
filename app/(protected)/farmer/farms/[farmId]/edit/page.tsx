"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import FarmUpsertForm, { farmToFormValues } from "@/components/farmer/FarmUpsertForm";
import { Card, CardContent } from "@/components/ui/card";
import { useMyFarmsQuery, useUpdateFarmMutation } from "@/hooks/useFarm";

export default function EditFarmPage() {
  const params = useParams<{ farmId: string }>();
  const farmId = Array.isArray(params.farmId) ? params.farmId[0] : params.farmId;
  const router = useRouter();
  const { farms, isLoading } = useMyFarmsQuery({ page: 1, limit: 100 });
  const updateFarmMutation = useUpdateFarmMutation();

  const farm = useMemo(
    () => (farmId ? farms.find((f) => f.id === farmId) : undefined),
    [farms, farmId],
  );

  if (!farmId) return null;

  if (isLoading && !farm) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-sm text-muted-foreground">Đang tải nông trại...</p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Link
          href="/farmer/farms"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Không tìm thấy nông trại hoặc bạn không có quyền chỉnh sửa.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FarmUpsertForm
      key={`${farm.id}-${farm.updatedAt}`}
      title="Cập nhật nông trại"
      description="Chỉnh thông tin và tọa độ như khi tạo mới. Lưu để áp dụng thay đổi."
      backHref={`/farmer/farms/${farmId}/seasons`}
      defaultValues={farmToFormValues(farm)}
      submitLabel="Lưu thay đổi"
      pendingLabel="Đang lưu..."
      isPending={updateFarmMutation.isPending}
      onSubmitPayload={(payload) =>
        updateFarmMutation.mutate(
          { farmId: farm.id, payload },
          {
            onSuccess: () => {
              toast.success("Đã cập nhật nông trại");
              router.push(`/farmer/farms/${farmId}/seasons`);
            },
            onError: () => {
              toast.error("Không thể cập nhật. Vui lòng thử lại.");
            },
          },
        )
      }
    />
  );
}
