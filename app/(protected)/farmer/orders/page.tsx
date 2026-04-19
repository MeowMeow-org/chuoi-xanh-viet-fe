"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Truck } from "lucide-react";
import { toast } from "@/components/ui/toast";
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
  { label: "Đã xác nhận", status: "confirmed" },
  { label: "Đang giao", status: "shipping" },
  { label: "Đã giao", status: "delivered" },
  { label: "Đã hủy", status: "cancelled" },
];

const formatNumber = (v: number | string) => {
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const SHIPPING_FEE = 15000;

const SHOP_ORDERS_KEY = "farmer-shop-orders";

function nextActionsFor(status: OrderStatus): Array<{
  next: OrderStatus;
  label: string;
  variant: "default" | "outline" | "destructive";
}> {
  switch (status) {
    case "pending":
      return [
        { next: "confirmed", label: "Xác nhận", variant: "default" },
        { next: "cancelled", label: "Hủy đơn", variant: "destructive" },
      ];
    case "confirmed":
      return [
        { next: "shipping", label: "Giao hàng", variant: "default" },
        { next: "cancelled", label: "Hủy đơn", variant: "destructive" },
      ];
    case "shipping":
      return [{ next: "delivered", label: "Đã giao", variant: "default" }];
    default:
      return [];
  }
}

export default function FarmerOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [SHOP_ORDERS_KEY, activeTab],
    queryFn: () =>
      orderService.getShopOrders({
        page: 1,
        limit: 50,
        status: activeTab ?? undefined,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái đơn");
      queryClient.invalidateQueries({ queryKey: [SHOP_ORDERS_KEY] });
    },
  });

  const orders: Order[] = data?.items ?? [];

  return (
    <div className="container mx-auto max-w-2xl space-y-4 px-4 py-4 pb-24 md:pb-8">
      <div className="flex items-start gap-2">
        <Truck className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Đơn hàng gian hàng</h1>
          <p className="text-sm text-muted-foreground">
            Đơn từ khách mua tại các gian hàng của bạn.
          </p>
        </div>
      </div>

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
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-12 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = statusMap[order.status];
            const total = Number(order.totalAmount) + SHIPPING_FEE;
            const actions = nextActionsFor(order.status);
            return (
              <Card key={order.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
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
                      <span className="text-right text-[11px] text-muted-foreground">
                        {paymentLabel[order.paymentMethod] ??
                          order.paymentMethod}
                        {" · "}
                        {paymentStatusLabel[order.paymentStatus] ??
                          order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {(order.shippingName || order.shippingPhone) && (
                    <p className="text-xs text-muted-foreground">
                      Khách:{" "}
                      {[order.shippingName, order.shippingPhone]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {order.shippingAddress && (
                    <p className="text-xs text-muted-foreground">
                      Giao đến: {order.shippingAddress}
                    </p>
                  )}

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted/50">
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
                        <span className="flex-1 truncate">
                          {item.product.name} x{formatNumber(item.qty)}
                        </span>
                        <span className="shrink-0 font-medium">
                          {formatNumber(item.lineTotal)}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm text-muted-foreground">
                      Tổng (đã gồm ship{" "}
                      {SHIPPING_FEE.toLocaleString("vi-VN")}
                      đ)
                    </span>
                    <span className="font-bold text-primary">
                      {total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {actions.map((a) => (
                        <Button
                          key={a.next}
                          size="sm"
                          variant={a.variant}
                          disabled={statusMutation.isPending}
                          onClick={() =>
                            statusMutation.mutate({
                              orderId: order.id,
                              status: a.next,
                            })
                          }
                        >
                          {statusMutation.isPending &&
                          statusMutation.variables?.orderId === order.id
                            ? "Đang xử lý..."
                            : a.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

