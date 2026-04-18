"use client";

import { useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@/services/order";
import { reviewService } from "@/services/review/reviewService";

export function OrderStarsDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label="Chọn số sao">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="rounded-md p-0.5 hover:bg-muted"
          onClick={() => onChange(n)}
        >
          <Star
            className={cn(
              "h-8 w-8 transition-colors",
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/50",
            )}
          />
        </button>
      ))}
    </div>
  );
}

function ProductReviewDialogBody({
  order,
  item,
  queryClient,
  onOpenChange,
}: {
  order: Order;
  item: OrderItem;
  queryClient: QueryClient;
  onOpenChange: (open: boolean) => void;
}) {
  const [reviewRating, setReviewRating] = useState(
    () => item.myReview?.rating ?? 5,
  );
  const [reviewComment, setReviewComment] = useState(
    () => item.myReview?.comment ?? "",
  );

  const reviewMutation = useMutation({
    mutationFn: async ({
      rating,
      comment,
    }: {
      rating: number;
      comment: string;
    }) => {
      const trimmed =
        comment.trim().length > 0 ? comment.trim().slice(0, 2000) : null;
      if (item.myReview) {
        return reviewService.updateShopReview(item.myReview.id, {
          rating,
          comment: trimmed,
        });
      }
      return reviewService.createShopReview({
        orderId: order.id,
        productId: item.productId,
        rating,
        comment: trimmed,
      });
    },
    onSuccess: () => {
      toast.success(
        item.myReview ? "Đã cập nhật đánh giá" : "Đã gửi đánh giá",
      );
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({
        queryKey: ["farmer-shop-reviews", order.shopId],
      });
      queryClient.invalidateQueries({
        queryKey: ["product-reviews", item.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["order", order.id] });
      queryClient.invalidateQueries({
        queryKey: ["public-product", item.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["public-products"] });
      queryClient.invalidateQueries({
        queryKey: ["shop-products-public", order.shopId],
      });
      queryClient.invalidateQueries({ queryKey: ["shop", order.shopId] });
      queryClient.invalidateQueries({ queryKey: ["public-shops"] });
      queryClient.invalidateQueries({ queryKey: ["consumer-home-shops"] });
      queryClient.invalidateQueries({
        queryKey: ["consumer-product-shop-panel", order.shopId],
      });
      queryClient.invalidateQueries({ queryKey: ["consumer-home-products"] });
      queryClient.invalidateQueries({
        queryKey: ["shop", order.shopId, "products"],
      });
      queryClient.invalidateQueries({
        queryKey: ["farmer-product", item.productId],
      });
      onOpenChange(false);
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {item.myReview ? "Sửa đánh giá sản phẩm" : "Đánh giá sản phẩm"}
        </DialogTitle>
        <DialogDescription>
          {item.product.name} — mỗi sản phẩm trong đơn đã giao có thể đánh giá
          một lần. Phản hồi giúp nông dân cải thiện chất lượng.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-1">
        <div className="space-y-2">
          <Label>Số sao (1–5)</Label>
          <StarInput value={reviewRating} onChange={setReviewRating} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product-review-comment">Nhận xét (tuỳ chọn)</Label>
          <Textarea
            id="product-review-comment"
            placeholder="Chia sẻ trải nghiệm với sản phẩm này..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={4}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-[11px] text-muted-foreground text-right">
            {reviewComment.length}/2000
          </p>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={reviewMutation.isPending}
        >
          Huỷ
        </Button>
        <Button
          disabled={
            reviewMutation.isPending || reviewRating < 1 || reviewRating > 5
          }
          onClick={() => {
            reviewMutation.mutate({
              rating: reviewRating,
              comment: reviewComment,
            });
          }}
        >
          {reviewMutation.isPending
            ? "Đang gửi..."
            : item.myReview
              ? "Cập nhật"
              : "Gửi đánh giá"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function ProductReviewDialog({
  order,
  item,
  open,
  onOpenChange,
  queryClient,
}: {
  order: Order | null;
  item: OrderItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryClient: QueryClient;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {order && item && open ? (
          <ProductReviewDialogBody
            key={`${order.id}-${item.productId}`}
            order={order}
            item={item}
            queryClient={queryClient}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Dùng ProductReviewDialog */
export const ShopReviewDialog = ProductReviewDialog;
