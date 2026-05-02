"use client";

import { useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Star, MessageSquare, Send, X, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { motion } from "framer-motion";

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
            "h-3 w-3 sm:h-3.5 sm:w-3.5",
            i <= rating
              ? "fill-amber-400 text-amber-400 stroke-[2.5px]"
              : "text-muted-foreground/30 stroke-[1.5px]",
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
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Chọn số sao">
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button
          key={n}
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(null)}
          className="relative outline-none group"
          onClick={() => onChange(n)}
        >
          <Star
            className={cn(
              "h-10 w-10 transition-all duration-300",
              n <= (hovered ?? value)
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                : "text-muted-foreground/30",
            )}
          />
          {n === value && (
             <motion.div 
               layoutId="activeStar"
               className="absolute inset-0 bg-amber-400/10 rounded-full -m-2 z-[-1]"
             />
          )}
        </motion.button>
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
        item.myReview ? "Đã cập nhật đánh giá thành công" : "Đã gửi đánh giá thành công",
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
      <DialogHeader className="space-y-4">
        <DialogTitle className="text-2xl font-bold text-center">
          {item.myReview ? "Chỉnh sửa đánh giá" : "Đánh giá sản phẩm"}
        </DialogTitle>
        <div className="flex flex-col items-center gap-4 py-2 border-y border-border/50">
           <div className="h-20 w-20 rounded-2xl bg-muted overflow-hidden shadow-sm">
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
              ) : <Star className="h-10 w-10 m-5 text-muted-foreground/30" />}
           </div>
           <div className="text-center">
              <h4 className="font-bold text-sm leading-tight">{item.product.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">Từ cửa hàng: <span className="font-semibold">{order.shop?.name}</span></p>
           </div>
        </div>
        <DialogDescription className="text-center px-4">
          Hãy chia sẻ trải nghiệm thực tế của bạn để giúp nhà vườn cải thiện và hỗ trợ những người mua khác nhé.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-8 py-6">
        <div className="space-y-4">
          <Label className="text-sm font-bold uppercase tracking-widest text-center block text-muted-foreground">
            Bạn đánh giá mấy sao?
          </Label>
          <StarInput value={reviewRating} onChange={setReviewRating} />
          <div className="text-center">
             <span className={cn(
               "text-xs font-bold px-3 py-1 rounded-full",
               reviewRating >= 4 ? "bg-emerald-100 text-emerald-700" : 
               reviewRating === 3 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
             )}>
                {reviewRating === 5 ? "Rất hài lòng 😍" : 
                 reviewRating === 4 ? "Hài lòng 😊" : 
                 reviewRating === 3 ? "Bình thường 😐" :
                 reviewRating === 2 ? "Không hài lòng ☹️" : "Rất tệ 😡"}
             </span>
          </div>
        </div>

        <div className="space-y-3 px-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <Label htmlFor="product-review-comment" className="text-sm font-bold">Nhận xét chi tiết</Label>
          </div>
          <div className="relative">
            <Textarea
              id="product-review-comment"
              placeholder="Sản phẩm tươi ngon, đóng gói kỹ..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              maxLength={2000}
              className="resize-none rounded-2xl border-2 focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/40 pr-10"
            />
            {reviewComment.length > 0 && (
              <button 
                onClick={() => setReviewComment("")}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <p className="text-muted-foreground italic">Phản hồi của bạn rất quan trọng với chúng tôi</p>
            <p className={cn(
              "font-medium",
              reviewComment.length > 1900 ? "text-rose-500" : "text-muted-foreground"
            )}>
              {reviewComment.length}/2000
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-center gap-3 pt-4">
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={reviewMutation.isPending}
          className="rounded-full px-8 font-bold"
        >
          Để sau
        </Button>
        <Button
          className="rounded-full px-10 font-bold shadow-lg shadow-primary/20 gap-2"
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
          {reviewMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : <Send className="h-4 w-4" />}
          {item.myReview ? "Cập nhật ngay" : "Gửi đánh giá"}
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
      <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-6 sm:p-8 overflow-hidden">
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
