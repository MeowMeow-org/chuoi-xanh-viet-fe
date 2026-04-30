"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

import FarmUpsertForm, {
  emptyFarmFormValues,
} from "@/components/farmer/FarmUpsertForm";
import { useCreateFarmMutation } from "@/hooks/useFarm";

export default function CreateFarmPage() {
  const router = useRouter();
  const createFarmMutation = useCreateFarmMutation();
  const defaultValues = useMemo(() => emptyFarmFormValues(), []);

  return (
    <FarmUpsertForm
      title="Tạo nông trại mới"
      description="Ghi đủ địa chỉ (tỉnh, huyện, xã, đường). Bấm Lấy vị trí điện thoại hoặc nhập tọa độ tay — để lưu đúng điểm trên bản đồ."
      backHref="/farmer/farms"
      defaultValues={defaultValues}
      submitLabel="Tạo nông trại"
      pendingLabel="Đang tạo..."
      isPending={createFarmMutation.isPending}
      onSubmitPayload={(payload) =>
        createFarmMutation.mutate(payload, {
          onSuccess: () => {
            toast.success("Tạo nông trại thành công");
            router.push("/farmer/farms");
          },
          onError: () => {
            toast.error("Không thể tạo nông trại. Vui lòng thử lại.");
          },
        })
      }
    />
  );
}
