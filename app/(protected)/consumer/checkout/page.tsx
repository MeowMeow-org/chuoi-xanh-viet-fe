"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  Wallet,
  Store,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  groupCartByShop,
  selectCartSubtotal,
  useCartStore,
} from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService } from "@/services/order/orderService";
import type { PaymentMethod } from "@/services/order";

const SHIPPING_FEE_PER_SHOP = 15000;

const paymentMethods: Array<{
  id: PaymentMethod;
  label: string;
  hint?: string;
  icon: typeof Banknote;
}> = [
  { id: "cod", label: "Thanh toán khi nhận hàng (COD)", icon: Banknote },
  {
    id: "vnpay",
    label: "VNPay",
    hint: "Đang mô phỏng — trạng thái thanh toán sẽ là chờ xử lý",
    icon: CreditCard,
  },
  {
    id: "payos",
    label: "PayOS",
    hint: "Đang mô phỏng — trạng thái thanh toán sẽ là chờ xử lý",
    icon: Wallet,
  },
];

export default function ConsumerCheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clear);
  const removeByShop = useCartStore((s) => s.removeByShop);
  const subtotal = useCartStore(selectCartSubtotal);
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (user) {
      setName((n) => n || user.fullName || "");
      setPhone((p) => p || user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (hasHydrated && items.length === 0 && !ordered) {
      router.replace("/consumer/cart");
    }
  }, [hasHydrated, items.length, ordered, router]);

  const groups = groupCartByShop(items);
  const shippingFee = groups.length * SHIPPING_FEE_PER_SHOP;

  const mutation = useMutation({
    mutationFn: async () => {
      const results: { shopId: string; shopName: string; success: boolean; error?: string }[] = [];
      for (const group of groups) {
        try {
          await orderService.createOrder({
            shopId: group.shopId,
            items: group.items.map((i) => ({
              productId: i.productId,
              qty: i.quantity,
            })),
            shippingName: name.trim(),
            shippingPhone: phone.trim(),
            shippingAddress: address.trim(),
            paymentMethod: payment,
            note: note.trim() || undefined,
          });
          results.push({
            shopId: group.shopId,
            shopName: group.shopName,
            success: true,
          });
          removeByShop(group.shopId);
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Đặt đơn thất bại";
          results.push({
            shopId: group.shopId,
            shopName: group.shopName,
            success: false,
            error: msg,
          });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const failed = results.filter((r) => !r.success);
      const successCount = results.length - failed.length;
      if (failed.length === 0) {
        toast.success("Đặt hàng thành công!", {
          description: `Đã tạo ${successCount} đơn hàng. Nông dân sẽ xác nhận sớm.`,
        });
        setOrdered(true);
        // Defensive clear (should be empty after removeByShop loop).
        clearCart();
      } else if (successCount === 0) {
        toast.error("Không thể đặt hàng", {
          description: failed[0]?.error ?? "Vui lòng thử lại sau",
        });
      } else {
        toast.warning("Một số đơn chưa đặt được", {
          description: `Thành công: ${successCount}. Lỗi: ${failed
            .map((f) => `${f.shopName} (${f.error})`)
            .join(", ")}`,
        });
        setOrdered(true);
      }
    },
  });

  const placeOrder = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên, số điện thoại, địa chỉ");
      return;
    }
    mutation.mutate();
  };

  if (!hasHydrated) {
    return (
      <ConsumerLayout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ConsumerLayout>
    );
  }

  if (ordered) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground text-sm">
            Đơn hàng đã được gửi đến gian hàng. Bạn sẽ nhận thông báo khi nông dân
            xác nhận.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/consumer/orders">
              <Button>Xem đơn hàng</Button>
            </Link>
            <Link href="/consumer/marketplace">
              <Button variant="outline">Tiếp tục mua</Button>
            </Link>
          </div>
        </div>
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Thanh toán</h1>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">Thông tin giao hàng</h2>
            <div className="space-y-2">
              <div>
                <Label htmlFor="name">Họ tên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Địa chỉ giao hàng</Label>
                <Textarea
                  id="address"
                  rows={2}
                  value={address}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Input
                  id="note"
                  placeholder="Ghi chú (không bắt buộc)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">Phương thức thanh toán</h2>
            <div className="space-y-2">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${
                    payment === m.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  <m.icon
                    className={`h-5 w-5 mt-0.5 ${
                      payment === m.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{m.label}</p>
                    {m.hint && (
                      <p className="text-[11px] text-muted-foreground">{m.hint}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">
              Đơn hàng ({items.length} sản phẩm · {groups.length} gian hàng)
            </h2>
            {groups.map((group) => {
              const groupTotal = group.items.reduce(
                (s, i) => s + i.price * i.quantity,
                0,
              );
              return (
                <div key={group.shopId} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{group.shopName}</span>
                  </div>
                  {group.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm py-0.5 pl-6"
                    >
                      <span>
                        {item.productName} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs text-muted-foreground pl-6">
                    <span>Tạm tính + phí ship</span>
                    <span>
                      {(groupTotal + SHIPPING_FEE_PER_SHOP).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Phí giao hàng ({groups.length} đơn)
                </span>
                <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-1">
                <span>Tổng</span>
                <span className="text-primary">
                  {(subtotal + shippingFee).toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full h-14 text-base font-bold"
          onClick={placeOrder}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Đang đặt hàng...
            </>
          ) : (
            <>Đặt hàng · {(subtotal + shippingFee).toLocaleString("vi-VN")}đ</>
          )}
        </Button>
      </div>
    </ConsumerLayout>
  );
}
