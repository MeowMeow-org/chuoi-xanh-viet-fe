"use client";

import Link from "next/link";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, Store } from "lucide-react";
import {
  groupCartByShop,
  selectCartSubtotal,
  useCartStore,
} from "@/store/useCartStore";

const SHIPPING_FEE_PER_SHOP = 15000;

export default function ConsumerCartPage() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore(selectCartSubtotal);

  if (!hasHydrated) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center text-muted-foreground text-sm">
          Đang tải giỏ hàng...
        </div>
      </ConsumerLayout>
    );
  }

  if (items.length === 0) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center space-y-3 max-w-md mx-auto">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Giỏ hàng trống</p>
          <Link href="/consumer/marketplace">
            <Button variant="outline">Đến chợ mua sắm</Button>
          </Link>
        </div>
      </ConsumerLayout>
    );
  }

  const groups = groupCartByShop(items);
  const shippingFee = groups.length * SHIPPING_FEE_PER_SHOP;

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Giỏ hàng ({items.length})</h1>
        {groups.length > 1 && (
          <p className="text-xs text-muted-foreground">
            Đơn hàng sẽ được tách thành {groups.length} đơn theo từng gian hàng. Phí
            giao hàng tính riêng mỗi đơn.
          </p>
        )}

        <div className="space-y-4">
          {groups.map((group) => {
            const groupSubtotal = group.items.reduce(
              (s, i) => s + i.price * i.quantity,
              0,
            );
            return (
              <div key={group.shopId} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Store className="h-4 w-4 text-primary" />
                  <Link
                    href={`/consumer/shop/${group.shopId}`}
                    className="font-semibold text-sm hover:underline"
                  >
                    {group.shopName}
                  </Link>
                </div>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <Card key={item.productId}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-14 w-14 rounded-md bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/consumer/product/${item.productId}`}
                            className="font-semibold text-sm truncate hover:underline block"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-sm text-primary font-bold">
                            {item.price.toLocaleString("vi-VN")}đ/{item.unit}
                          </p>
                        </div>
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-bold w-20 text-right">
                          {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Tạm tính gian hàng</span>
                  <span>{groupSubtotal.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            );
          })}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-2">
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
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Tổng cộng</span>
              <span className="text-xl text-primary">
                {(subtotal + shippingFee).toLocaleString("vi-VN")}đ
              </span>
            </div>
          </CardContent>
        </Card>

        <Link href="/consumer/checkout">
          <Button className="w-full h-14 text-base font-bold">Thanh toán</Button>
        </Link>
      </div>
    </ConsumerLayout>
  );
}
