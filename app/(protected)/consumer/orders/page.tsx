"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/order/orderService";
import type { Order, OrderStatus } from "@/services/order";

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
      toast.success("Đã hủy đơn hàng");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  const orders: Order[] = data?.items ?? [];

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Đơn hàng của tôi</h1>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((t) => (
            <Button
              key={t.label}
              size="sm"
              variant={activeTab === t.status ? "default" : "outline"}
              className="shrink-0 text-xs"
              onClick={() => setActiveTab(t.status)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = statusMap[order.status];
              const total = Number(order.totalAmount) + SHIPPING_FEE;
              const isPending = order.status === "pending";
              return (
                <Card key={order.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate">
                          {order.shop?.name ?? "Gian hàng"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString("vi-VN")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Mã đơn: {order.id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${status.color} text-xs`}>
                          {status.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {paymentLabel[order.paymentMethod] ?? order.paymentMethod}
                          {" · "}
                          {paymentStatusLabel[order.paymentStatus] ??
                            order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="h-10 w-10 rounded-md bg-muted/50 overflow-hidden shrink-0">
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
                          <span className="truncate flex-1">
                            {item.product.name} x{formatNumber(item.qty)}
                          </span>
                          <span className="font-medium shrink-0">
                            {formatNumber(item.lineTotal)}đ
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.shippingAddress && (
                      <p className="text-xs text-muted-foreground">
                        Giao đến: {order.shippingAddress}
                      </p>
                    )}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Tổng (đã gồm ship {SHIPPING_FEE.toLocaleString("vi-VN")}đ)
                      </span>
                      <span className="font-bold text-primary">
                        {total.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {isPending && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive hover:text-destructive"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(order.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {cancelMutation.isPending && cancelMutation.variables === order.id
                          ? "Đang hủy..."
                          : "Hủy đơn"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ConsumerLayout>
  );
}
