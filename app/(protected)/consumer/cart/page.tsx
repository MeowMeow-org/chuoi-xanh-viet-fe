"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  unit: string;
  quantity: number;
  shopName?: string;
}

export default function ConsumerCartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('consumer_cart') || '[]'));
  }, []);

  const updateCart = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem('consumer_cart', JSON.stringify(items));
  };

  const updateQty = (productId: string, delta: number) => {
    updateCart(cart.map(i => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const remove = (productId: string) => {
    updateCart(cart.filter(i => i.productId !== productId));
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = cart.length > 0 ? 15000 : 0;

  if (cart.length === 0) {
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

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Giỏ hàng ({cart.length})</h1>

        <div className="space-y-3">
          {cart.map(item => (
            <Card key={item.productId}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.productName}</p>
                  {item.shopName && <p className="text-xs text-muted-foreground">{item.shopName}</p>}
                  <p className="text-sm text-primary font-bold">{item.price.toLocaleString('vi-VN')}đ/{item.unit}</p>
                </div>
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(item.productId, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQty(item.productId, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm font-bold w-20 text-right">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(item.productId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{total.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phí giao hàng</span>
              <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t">
              <span>Tổng cộng</span>
              <span className="text-xl text-primary">{(total + shippingFee).toLocaleString('vi-VN')}đ</span>
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
