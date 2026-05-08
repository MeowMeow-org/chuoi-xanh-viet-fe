"use client";

import { useMemo } from "react";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Sprout } from "lucide-react";

import { useMyFarmsQuery } from "@/hooks/useFarm";
import { Card, CardContent } from "@/components/ui/card";
import FarmerWorkflowTour from "@/components/onboarding/FarmerWorkflowTour";
import { FARMER_FARMS_LIST_ONBOARDING_KEY } from "@/lib/onboarding/farmerKeys";
import { Pagination } from "@/components/shared/Pagination";

export default function FarmerFarmsPage() {
  const [page, setPage] = useState(1);
  const { farms, pagination, isLoading, error } = useMyFarmsQuery({
    page,
    limit: 5,
  });

  const normalizedFarms = useMemo(
    () =>
      farms.map((farm) => ({
        id: farm.id,
        name: farm.name,
        inCooperative: farm.inCooperative,
        cooperativeMembershipStatus: farm.cooperativeMembershipStatus ?? null,
        cooperativeName: farm.cooperativeName ?? null,
        location:
          [farm.ward, farm.district, farm.province]
            .filter(Boolean)
            .join(", ") ||
          farm.address ||
          "Chưa cập nhật địa chỉ",
        area:
          farm.areaHa !== null && farm.areaHa !== undefined
            ? `${farm.areaHa} ha`
            : "Chưa cập nhật diện tích",
      })),
    [farms],
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div id="onboarding-farms-header" className="space-y-1">
        <h1 className="text-xl font-bold">Nông trại</h1>

        <p className="text-sm text-muted-foreground">
          Danh sách nông trại thuộc tài khoản của bạn.
        </p>
      </div>

      <Link
        id="onboarding-farms-add-card"
        href="/farmer/farms/create"
        className="block"
      >
        <Card className="cursor-pointer border-2 border-dashed border-[hsl(142,20%,80%)] bg-[hsl(120,20%,97%)] transition-colors hover:border-[hsl(142,50%,60%)]">
          <CardContent className="flex items-center justify-center gap-2 p-6 text-[hsl(150,8%,34%)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
              <Plus className="h-5 w-5 text-[hsl(142,71%,45%)]" />
            </span>
            <div className="text-sm">
              <p className="font-semibold">Thêm nông trại mới</p>
              <p className="text-xs text-muted-foreground">
                Nhấn để mở trang tạo nông trại
              </p>
            </div>
          </CardContent>
        </Card>
      </Link>

      <div id="onboarding-farms-list" className="space-y-4">
        {isLoading && (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`farm-skeleton-${index}`}>
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-[hsl(120,20%,92%)]" />
                    <div className="space-y-2">
                      <div className="h-4 w-44 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                      <div className="h-3 w-56 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                      <div className="h-3 w-28 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                    </div>
                  </div>
                  <div className="h-5 w-5 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="border-red-200">
            <CardContent className="p-4 text-sm text-red-600">
              Không thể tải danh sách nông trại. Vui lòng thử lại.
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && normalizedFarms.length === 0 && (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Bạn chưa có nông trại nào.
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && normalizedFarms.length > 0 && (
          <>
            <div className="grid gap-3">
              {normalizedFarms.map((farm) => (
                <Link
                  key={farm.id}
                  href={`/farmer/farms/${farm.id}/seasons`}
                  className="block"
                >
                  <Card className="rounded-2xl border-[hsl(142,15%,88%)] transition-colors hover:border-primary/40">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                          <Sprout className="h-5 w-5 text-[hsl(142,71%,45%)]" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold">{farm.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {farm.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Diện tích: {farm.area}
                          </p>
                          {(farm.inCooperative ||
                            farm.cooperativeMembershipStatus === "approved") && (
                            <div className="mt-0.5 flex flex-col gap-0.5 text-xs leading-snug sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
                              <span className="shrink-0 font-semibold text-[hsl(142,58%,28%)]">
                                Đã tham gia
                              </span>
                              {farm.cooperativeName ? (
                                <span className="min-w-0 max-w-full wrap-break-word font-medium text-[hsl(150,10%,22%)]">
                                  {farm.cooperativeName}
                                </span>
                              ) : null}
                            </div>
                          )}
                          {!farm.inCooperative &&
                            farm.cooperativeMembershipStatus !== "approved" &&
                            farm.cooperativeMembershipStatus === "pending" && (
                              <p className="mt-0.5 text-xs font-semibold text-[hsl(210,75%,38%)]">
                                Đang chờ hợp tác xã duyệt yêu cầu
                              </p>
                            )}
                          {!farm.inCooperative &&
                            farm.cooperativeMembershipStatus !== "approved" &&
                            farm.cooperativeMembershipStatus !== "pending" && (
                              <p className="mt-0.5 text-xs font-medium text-[hsl(32,90%,38%)]">
                                Chưa tham gia hợp tác xã
                              </p>
                            )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination && (
              <Pagination
                meta={pagination}
                onPageChange={(nextPage) => {
                  if (nextPage < 1 || nextPage > pagination.totalPages) return;
                  setPage(nextPage);
                }}
                className="pt-2"
              />
            )}
          </>
        )}
      </div>

      <FarmerWorkflowTour
        storageKey={FARMER_FARMS_LIST_ONBOARDING_KEY}
        steps={[
          {
            targetId: "onboarding-farms-header",
            title: "Quản lý nông trại",
            description:
              "Đây là nơi xem tất cả nông trại của bạn. Mỗi trại có địa chỉ, diện tích và có thể gắn hợp tác xã.",
          },
          {
            targetId: "onboarding-farms-add-card",
            title: "Thêm nông trại mới",
            description:
              "Bấm vào ô nét đứt để mở màn hình khai báo tên, diện tích, địa chỉ và vị trí bản đồ.",
          },
          {
            targetId: "onboarding-farms-list",
            title: "Danh sách hoặc bước tiếp theo",
            description:
              "Khi đã có nông trại, chạm vào thẻ để vào trang mùa vụ và nhật ký. Nếu chưa có, hãy dùng ô Thêm nông trại ở bước trước.",
          },
        ]}
      />
    </div>
  );
}
