"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, Phone, Store, User } from "lucide-react";
import { toast } from "sonner";
import { orderService } from "@/services/order/orderService";
import type { Order, OrderStatus } from "@/services/order";

const statusMap: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-900" },
  shipping: { label: "Đang giao", color: "bg-violet-100 text-violet-900" },
  delivered: { label: "Đã giao", color: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-900" },
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

function statusActions(order: Order): Array<{
  key: string;
  label: string;
  next: OrderStatus;
  variant: "default" | "outline" | "secondary" | "destructive";
}> {
  switch (order.status) {
    case "pending":
      return [
        {
          key: "confirm",
          label: "Xác nhận đơn",
          next: "confirmed",
          variant: "default",
        },
        {
          key: "cancel",
          label: "Hủy đơn",
          next: "cancelled",
          variant: "destructive",
        },
      ];
    case "confirmed":
      return [
        {
          key: "ship",
          label: "Chuyển đang giao",
          next: "shipping",
          variant: "default",
        },
        {
          key: "cancel",
          label: "Hủy đơn",
          next: "cancelled",
          variant: "destructive",
        },
      ];
    case "shipping":
      return [
        {
          key: "deliver",
          label: "Xác nhận đã giao",
          next: "delivered",
          variant: "default",
        },
      ];
    default:
      return [];
  }
}

export function FarmerShopOrdersPanel() {
  const [activeTab, setActiveTab] = useState<OrderStatus | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["farmer-shop-orders", activeTab],
    queryFn: () =>
      orderService.getShopOrders({
        page: 1,
        limit: 50,
        status: activeTab ?? undefined,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: (_, v) => {
      toast.success(
        v.status === "cancelled"
          ? "Đã hủy đơn và hoàn tồn kho"
          : "Đã cập nhật trạng thái đơn",
      );
      queryClient.invalidateQueries({ queryKey: ["farmer-shop-orders"] });
    },
  });

  const orders: Order[] = data?.items ?? [];

  const runStatus = (order: Order, next: OrderStatus) => {
    if (next === "cancelled") {
      setCancelTarget(order);
      return;
    }
    statusMutation.mutate({ id: order.id, status: next });
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    statusMutation.mutate(
      { id: cancelTarget.id, status: "cancelled" },
      { onSettled: () => setCancelTarget(null) },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Xác nhận, giao hàng và cập nhật trạng thái cho người mua.
      </p>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <Button
            key={t.label}
            size="sm"
            variant={activeTab === t.status ? "default" : "outline"}
            className={`shrink-0 text-xs ${
              activeTab === t.status
                ? "bg-[hsl(142,69%,45%)] hover:bg-[hsl(142,69%,40%)]"
                : "border-[hsl(142,14%,88%)]"
            }`}
            onClick={() => setActiveTab(t.status)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(142,35%,45%)]" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-[hsl(142,14%,88%)]">
          <CardContent className="py-14 text-center text-sm text-[hsl(150,6%,42%)]">
            <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
            Chưa có đơn hàng nào trong mục này.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status];
            const actions = statusActions(order);
            return (
              <Card
                key={order.id}
                className="border-[hsl(142,14%,88%)] shadow-sm"
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-mono text-[11px] text-[hsl(150,6%,45%)]">
                        {order.id}
                      </p>
                      <p className="text-xs text-[hsl(150,6%,42%)]">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </p>
                      {order.shop && (
                        <Link
                          href="/farmer/marketplace?tab=manage"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[hsl(142,58%,32%)] hover:underline"
                        >
                          <Store className="h-3.5 w-3.5" />
                          {order.shop.name}
                        </Link>
                      )}
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>

                  <div className="rounded-lg border border-[hsl(142,14%,92%)] bg-[hsl(120,25%,98%)] p-3 text-sm">
                    <div className="flex items-center gap-2 font-medium text-[hsl(150,10%,22%)]">
                      <User className="h-4 w-4 shrink-0 opacity-70" />
                      {order.shippingName ?? "—"}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[hsl(150,6%,38%)]">
                      <Phone className="h-4 w-4 shrink-0 opacity-70" />
                      {order.shippingPhone ?? "—"}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[hsl(150,6%,38%)]">
                      {order.shippingAddress ?? "—"}
                    </p>
                    {order.note ? (
                      <p className="mt-2 border-t border-[hsl(142,14%,90%)] pt-2 text-xs text-[hsl(150,6%,38%)]">
                        <span className="font-medium text-[hsl(150,10%,28%)]">
                          Ghi chú:{" "}
                        </span>
                        {order.note}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-2 text-sm text-[hsl(150,10%,22%)]"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[hsl(120,15%,94%)]">
                          {item.product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-[hsl(150,6%,42%)]">
                            SL: {formatNumber(item.qty)} ·{" "}
                            {formatNumber(item.lineTotal)}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(142,14%,90%)] pt-3 text-sm">
                    <span className="text-[hsl(150,6%,40%)]">
                      {paymentLabel[order.paymentMethod] ?? order.paymentMethod}{" "}
                      ·{" "}
                      {paymentStatusLabel[order.paymentStatus] ??
                        order.paymentStatus}
                    </span>
                    <span className="font-bold text-[hsl(142,58%,30%)]">
                      {formatNumber(order.totalAmount)}đ
                    </span>
                  </div>

                  {actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {actions.map((a) => (
                        <Button
                          key={a.key}
                          size="sm"
                          variant={a.variant}
                          className={
                            a.variant === "default"
                              ? "bg-[hsl(142,69%,45%)] hover:bg-[hsl(142,69%,40%)]"
                              : undefined
                          }
                          disabled={statusMutation.isPending}
                          onClick={() => runStatus(order, a.next)}
                        >
                          {a.label}
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

      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
            <AlertDialogDescription>
              Số lượng sản phẩm trong đơn sẽ được hoàn lại vào kho. Người mua sẽ
              nhận thông báo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={statusMutation.isPending}
              onClick={confirmCancel}
            >
              {statusMutation.isPending ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
