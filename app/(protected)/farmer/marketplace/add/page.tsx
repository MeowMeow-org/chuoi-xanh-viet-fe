"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useMyShopsQuery } from "@/hooks/useFarmerShop";

/**
 * Legacy route /farmer/marketplace/add — chuyển sang route mới có shopId.
 *
 * - Nếu user có 1 shop → chuyển tới /farmer/marketplace/shops/{shopId}/add (giữ saleUnitId nếu có).
 * - Nếu user có nhiều shop / không có shop → về trang danh sách marketplace.
 */
export default function FarmerMarketplaceAddLegacyRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: shops, isLoading } = useMyShopsQuery();

  useEffect(() => {
    if (isLoading) return;
    const saleUnitId = searchParams.get("saleUnitId");
    const qs = saleUnitId
      ? `?saleUnitId=${encodeURIComponent(saleUnitId)}`
      : "";

    if (shops && shops.length === 1) {
      router.replace(`/farmer/marketplace/shops/${shops[0].id}/add${qs}`);
      return;
    }
    router.replace(`/farmer/marketplace`);
  }, [isLoading, shops, searchParams, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Đang chuyển hướng…
    </div>
  );
}
