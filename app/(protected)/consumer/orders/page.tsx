"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
  Package, 
  Loader2, 
  XCircle, 
  Star, 
  ChevronRight, 
  ShoppingBag, 
  Calendar,
  CreditCard,
  MapPin,
  Store
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { orderService } from "@/services/order/orderService";
import type { Order, OrderStatus } from "@/services/order";

const statusMap: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { 
    label: "Chờ xác nhận", 
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: Calendar
  },
  confirmed: { 
    label: "Đã xác nhận", 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: Package
  },
  shipping: { 
    label: "Đang giao", 
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    icon: Loader2
  },
  delivered: { 
    label: "Đã giao", 
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: ShoppingBag
  },
  cancelled: { 
    label: "Đã hủy", 
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    icon: XCircle
  },
};

const paymentLabel: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng",
  vnpay: "VNPay Online",
  payos: "PayOS Online",
};

const paymentStatusLabel: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

const tabs: Array<{ label: string; status: OrderStatus | null }> = [
  { label: "Tất cả", status: null },
  { label: "Chờ xác nhận", status: "pending" },
  { label: "Đang giao", status: "shipping" },
  { label: "Đã giao", status: "delivered" },
  { label: "Đã hủy", status: "cancelled" },
];

const formatNumber = (v: number | string) => {
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const SHIPPING_FEE = 15000;

export default function ConsumerOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    order: Order;
    item: Order["items"][number];
  } | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders", activeTab],
    queryFn: () =>
      orderService.getMyOrders({
        page: 1,
        limit: 50,
        status: activeTab ?? undefined,
      }),
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  const orders: Order[] = data?.items ?? [];

  return (
    <ConsumerLayout>
      <div className="container py-8 pb-24 md:pb-12 max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Đơn hàng của tôi
          </h1>
          <p className="text-muted-foreground text-sm">
            Quản lý và theo dõi trạng thái các đơn hàng của bạn
          </p>
        </div>

        <div className="relative sticky top-0 z-10 bg-background/80 backdrop-blur-md py-2 -mx-4 px-4 border-b">
          <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((t) => {
              const isActive = activeTab === t.status;
              return (
                <button
                  key={t.label}
                  onClick={() => setActiveTab(t.status)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
            <p className="text-muted-foreground animate-pulse">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/5"
          >
            <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              Bạn chưa có đơn hàng nào trong mục này. Bắt đầu mua sắm ngay để ủng hộ nông dân nhé!
            </p>
            <Link 
              href="/"
              className={cn(buttonVariants({ variant: "default" }), "rounded-full px-8")}
            >
              Khám phá sản phẩm
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {orders.map((order, index) => {
                const status = statusMap[order.status];
                const total = Number(order.totalAmount) + SHIPPING_FEE;
                const isPending = order.status === "pending";
                const isDelivered = order.status === "delivered";
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden border-none shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                              <Store className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold text-lg leading-tight">
                                {order.shop?.name ?? "Gian hàng"}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.createdAt).toLocaleString("vi-VN", {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 text-right">
                            <Badge className={cn("px-3 py-1 text-xs font-semibold rounded-full border shadow-sm", status.color)}>
                              <StatusIcon className="h-3 w-3 mr-1.5" />
                              {status.label}
                            </Badge>
                            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                              ID: #{order.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="group flex gap-4 p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/10"
                            >
                              <div className="relative h-20 w-20 rounded-xl bg-white dark:bg-muted overflow-hidden shrink-0 shadow-sm border border-border/50">
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-muted/20">
                                    <Package className="h-8 w-8 text-muted-foreground/30" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <div>
                                  <h5 className="font-semibold text-sm line-clamp-1">{item.product.name}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Số lượng: <span className="font-medium text-foreground">{formatNumber(item.qty)}</span>
                                  </p>
                                </div>
                                <div className="flex items-center justify-between mt-auto">
                                  <span className="text-sm font-bold text-primary">
                                    {formatNumber(item.lineTotal)}đ
                                  </span>
                                  {isDelivered && (
                                    <div className="flex items-center gap-2">
                                      {item.myReview ? (
                                        <div className="flex items-center gap-1.5">
                                          <OrderStarsDisplay rating={item.myReview.rating} />
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 px-2 text-xs hover:bg-primary/5 hover:text-primary"
                                            onClick={() => {
                                              setReviewTarget({ order, item });
                                              setReviewOpen(true);
                                            }}
                                          >
                                            Sửa
                                          </Button>
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="secondary"
                                          className="h-7 gap-1 text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-full"
                                          onClick={() => {
                                            setReviewTarget({ order, item });
                                            setReviewOpen(true);
                                          }}
                                        >
                                          <Star className="h-3 w-3 fill-primary" />
                                          Đánh giá
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 pt-6 border-t space-y-4">
                          <div className="flex flex-col gap-2">
                            {order.shippingAddress && (
                              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">Giao đến: {order.shippingAddress}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CreditCard className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {paymentLabel[order.paymentMethod] ?? order.paymentMethod}
                                <span className={cn(
                                  "ml-2 px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-tight",
                                  order.paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                                )}>
                                  {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between">
                            <div className="space-y-0.5">
                              <span className="text-xs text-muted-foreground">Tổng thanh toán</span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-black text-primary">
                                  {total.toLocaleString("vi-VN")}đ
                                </span>
                                <span className="text-[10px] text-muted-foreground italic">
                                  (Phí ship: {SHIPPING_FEE.toLocaleString("vi-VN")}đ)
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {isPending && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-10 px-4 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                  disabled={cancelMutation.isPending}
                                  onClick={() => cancelMutation.mutate(order.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  {cancelMutation.isPending &&
                                  cancelMutation.variables === order.id
                                    ? "Đang hủy..."
                                    : "Hủy đơn hàng"}
                                </Button>
                              )}
                              <Link
                                href={`/consumer/orders/${order.id}`}
                                className={cn(
                                  buttonVariants({ variant: "outline", size: "sm" }),
                                  "h-10 px-5 gap-2 text-xs font-bold rounded-full border-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                                )}
                              >
                                Xem chi tiết
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
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


