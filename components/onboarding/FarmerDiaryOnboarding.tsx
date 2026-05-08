"use client";

import FarmerWorkflowTour from "@/components/onboarding/FarmerWorkflowTour";
import { FARMER_DIARY_ONBOARDING_KEY } from "@/lib/onboarding/farmerKeys";

/**
 * Tour trang nhật ký: tab + form ghi nhật ký (editor).
 */
export default function FarmerDiaryOnboarding() {
  return (
    <FarmerWorkflowTour
      storageKey={FARMER_DIARY_ONBOARDING_KEY}
      openDelayMs={500}
      placement="top"
      steps={[
        {
          targetId: "onboarding-diary-tabs",
          title: "Hai tab: ghi mới và xem lại",
          description:
            "Ghi nhật ký để lưu việc làm đồng. Lịch sử giúp xem lại các bản ghi đã có.",
        },
        {
          targetId: "onboarding-diary-form",
          title: "Trình soạn nhật ký",
          description:
            "Chọn vụ mùa (nếu có), loại công việc, mô tả và ảnh. GPS và thời gian lấy tự động. Cuối cùng bấm Ghi nhật ký.",
        },
      ]}
    />
  );
}
