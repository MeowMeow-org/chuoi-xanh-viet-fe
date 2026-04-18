"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { reviewService } from "@/services/review/reviewService";
import { cn } from "@/lib/utils";

function StarsRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/35",
          )}
        />
      ))}
    </span>
  );
}

export function FarmerShopReviewsPanel({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const reviewsQuery = useQuery({
    queryKey: ["farmer-shop-reviews", shopId],
    queryFn: () => reviewService.listByShop(shopId, { page: 1, limit: 50 }),
    enabled: !!shopId,
  });

  const reviewItems = reviewsQuery.data?.items ?? [];
  const reviewMeta = reviewsQuery.data?.meta;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Đánh giá theo từng sản phẩm sau khi đơn đã giao ({shopName}).
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[hsl(142,14%,88%)] bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-[hsl(150,10%,22%)]">
          <Star className="h-4 w-4 text-amber-500" />
          Tổng quan
        </div>
        {reviewsQuery.isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[hsl(150,7%,45%)]" />
        ) : reviewMeta ? (
          <span className="text-sm text-[hsl(150,7%,42%)]">
            {reviewMeta.reviewCount > 0 && reviewMeta.averageRating != null
              ? `${reviewMeta.averageRating.toFixed(1)} điểm · ${reviewMeta.reviewCount} đánh giá`
              : "Chưa có đánh giá"}
          </span>
        ) : null}
      </div>

      {reviewsQuery.isError && (
        <p className="text-sm text-red-600">
          Không tải được đánh giá. Thử tải lại trang.
        </p>
      )}

      {!reviewsQuery.isLoading &&
        !reviewsQuery.isError &&
        reviewItems.length === 0 && (
          <Card className="border-[hsl(142,14%,88%)]">
            <CardContent className="py-10 text-center text-sm text-[hsl(150,7%,42%)]">
              Chưa có đánh giá nào. Khi khách hoàn tất đơn và đánh giá từng sản
              phẩm, nội dung sẽ hiển thị tại đây.
            </CardContent>
          </Card>
        )}

      {reviewItems.length > 0 && (
        <div className="space-y-3">
          {reviewItems.map((r) => (
            <Card key={r.id} className="border-[hsl(142,14%,88%)]">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[hsl(142,71%,45%)]/15 text-xs font-semibold text-[hsl(142,71%,35%)]">
                    {r.reviewer.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.reviewer.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (r.reviewer.fullName?.trim()?.[0] ?? "?").toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/consumer/product/${r.product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex max-w-full items-center gap-2 rounded-md border border-[hsl(142,14%,88%)] bg-[hsl(120,22%,97%)] px-2 py-1 text-xs font-medium text-[hsl(150,10%,18%)] hover:bg-[hsl(120,18%,94%)]"
                      >
                        {r.product.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.product.imageUrl}
                            alt=""
                            className="h-7 w-7 shrink-0 rounded object-cover"
                          />
                        ) : null}
                        <span className="truncate">{r.product.name}</span>
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="truncate text-sm font-medium text-[hsl(150,10%,18%)]">
                        {r.reviewer.fullName?.trim() || "Người mua"}
                      </span>
                      {r.isVerifiedPurchase && (
                        <Badge variant="secondary" className="text-[10px]">
                          Đã mua
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StarsRow rating={r.rating} />
                      <span className="text-[11px] text-[hsl(150,7%,45%)]">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    {r.comment ? (
                      <p className="whitespace-pre-wrap break-words text-sm text-[hsl(150,10%,22%)]">
                        {r.comment}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
