"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import {
  OrderStarsDisplay,
  ProductReviewDialog,
} from "@/components/consumer/shop-review-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  Package,
  Star,
  XCircle,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { orderService } from "@/services/order/orderService";
import type { Order, OrderItem, OrderStatus } from "@/services/order";

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

const paymentLabel: Record<string, string> = {
  cod: "COD",
  vnpay: "VNPay",
  payos: "PayOS",
};

const paymentStatusLabel: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  refunded: "Đã hoàn tiền",
};

const formatNumber = (v: number | string) => {
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const SHIPPING_FEE = 15000;

export default function ConsumerOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params.orderId as string;
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  if (isLoading) {
    return (
      <ConsumerLayout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ConsumerLayout>
    );
  }

  if (isError || !order) {
    return (
      <ConsumerLayout>
        <div className="container py-12 max-w-lg mx-auto text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Không tìm thấy đơn hàng.</p>
          <Link
            href="/consumer/orders"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Quay lại danh sách
          </Link>
        </div>
      </ConsumerLayout>
    );
  }

  const status = statusMap[order.status];
  const total = Number(order.totalAmount) + SHIPPING_FEE;
  const isPending = order.status === "pending";
  const isDelivered = order.status === "delivered";

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 max-w-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => router.push("/consumer/orders")}
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">Chi tiết đơn hàng</h1>
            <p className="text-xs text-muted-foreground truncate">
              Mã: {order.id}
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {order.shop?.name ?? "Gian hàng"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Thanh toán: {paymentLabel[order.paymentMethod] ?? order.paymentMethod}{" "}
              · {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
            </p>
            {order.shop && (
              <Link
                href={`/shop/${order.shop.id}`}
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "h-auto p-0 text-sm",
                )}
              >
                Xem gian hàng
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">Giao hàng</h2>
            <dl className="text-sm space-y-1 text-muted-foreground">
              <div>
                <dt className="text-xs font-medium text-foreground">Người nhận</dt>
                <dd>{order.shippingName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-foreground">Điện thoại</dt>
                <dd>{order.shippingPhone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-foreground">Địa chỉ</dt>
                <dd>{order.shippingAddress ?? "—"}</dd>
              </div>
              {order.note ? (
                <div>
                  <dt className="text-xs font-medium text-foreground">Ghi chú</dt>
                  <dd className="whitespace-pre-wrap">{order.note}</dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">Sản phẩm</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="space-y-2 border-b border-border/60 pb-3 text-sm last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-muted/50 overflow-hidden shrink-0">
                      {item.product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.productId}`}
                        className="font-medium hover:underline line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(item.unitPrice)}đ × {formatNumber(item.qty)}{" "}
                        {item.product.unit ?? ""}
                      </p>
                    </div>
                    <span className="font-semibold shrink-0">
                      {formatNumber(item.lineTotal)}đ
                    </span>
                  </div>
                  {isDelivered && (
                    <div className="flex flex-wrap items-center gap-2 pl-[3.75rem]">
                      {item.myReview ? (
                        <>
                          <span className="text-xs text-muted-foreground">
                            Đánh giá:
                          </span>
                          <OrderStarsDisplay rating={item.myReview.rating} />
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs"
                            onClick={() => {
                              setReviewTarget({ order, item });
                              setReviewOpen(true);
                            }}
                          >
                            Sửa đánh giá
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1 h-8 text-xs"
                          onClick={() => {
                            setReviewTarget({ order, item });
                            setReviewOpen(true);
                          }}
                        >
                          <Star className="h-3.5 w-3.5" />
                          Đánh giá sản phẩm
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatNumber(order.totalAmount)}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phí giao hàng (ước tính)</span>
              <span>{SHIPPING_FEE.toLocaleString("vi-VN")}đ</span>
            </div>
            <div className="flex justify-between font-bold text-primary pt-1">
              <span>Tổng</span>
              <span>{total.toLocaleString("vi-VN")}đ</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {isPending && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              <XCircle className="h-4 w-4 mr-1" />
              {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn"}
            </Button>
          )}
        </div>
      </div>

      <ProductReviewDialog
        order={reviewTarget?.order ?? null}
        item={reviewTarget?.item ?? null}
        open={reviewOpen}
        onOpenChange={(open) => {
          setReviewOpen(open);
          if (!open) setReviewTarget(null);
        }}
        queryClient={queryClient}
      />
    </ConsumerLayout>
  );
}

