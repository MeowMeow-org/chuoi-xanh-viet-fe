"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

import FarmUpsertForm, {
  emptyFarmFormValues,
} from "@/components/farmer/FarmUpsertForm";
import FarmerWorkflowTour from "@/components/onboarding/FarmerWorkflowTour";
import { FARMER_FARM_CREATE_ONBOARDING_KEY } from "@/lib/onboarding/farmerKeys";
import { useCreateFarmMutation } from "@/hooks/useFarm";

export default function CreateFarmPage() {
  const router = useRouter();
  const createFarmMutation = useCreateFarmMutation();
  const defaultValues = useMemo(() => emptyFarmFormValues(), []);

  return (
    <>
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
      <FarmerWorkflowTour
        storageKey={FARMER_FARM_CREATE_ONBOARDING_KEY}
        steps={[
          {
            targetId: "onboarding-farm-upsert-intro",
            title: "Khai báo nông trại",
            description:
              "Đặt tên rõ ràng. Diện tích có thể nhập m² hoặc ha. Địa chỉ giúp hệ thống ghim bản đồ và gợi ý hợp tác xã.",
          },
          {
            targetId: "onboarding-farm-upsert-card",
            title: "Biểu mẫu chi tiết",
            description:
              "Chọn tỉnh–huyện–xã, nhập đường/số nhà, kiểm traGPS. Khi đủ thông tin, bấm nút tạo / lưu ở cuối trang.",
          },
        ]}
      />
    </>
  );
}
