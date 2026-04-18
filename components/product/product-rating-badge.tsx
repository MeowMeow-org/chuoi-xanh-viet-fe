"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductRatingBadge({
  averageRating,
  reviewCount,
  className,
  size = "sm",
  emptyLabel = "—",
}: {
  averageRating: number | null | undefined;
  reviewCount?: number | null | undefined;
  className?: string;
  size?: "sm" | "xs";
  /** Hiển thị khi chưa có đánh giá */
  emptyLabel?: string;
}) {
  const count = reviewCount ?? 0;
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";
  const starClass = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";

  if (!count || averageRating == null) {
    return (
      <span
        className={cn(
          textSize,
          "tabular-nums text-muted-foreground",
          className,
        )}
        title="Chưa có đánh giá"
      >
        {emptyLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular-nums text-foreground",
        textSize,
        className,
      )}
      title={`${averageRating.toFixed(1)} sao · ${count} đánh giá`}
    >
      <Star
        className={cn(
          starClass,
          "shrink-0 fill-amber-400 text-amber-400",
        )}
        aria-hidden
      />
      {averageRating.toFixed(1)}
      <span className="font-normal text-muted-foreground">({count})</span>
    </span>
  );
}
