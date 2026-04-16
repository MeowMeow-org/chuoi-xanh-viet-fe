"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShoppingBag, CreditCard, Banknote, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { currentConsumer } from '@/data/consumerMockData';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  unit: string;
  quantity: number;
  shopName?: string;
}

const paymentMethods = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Banknote },
  { id: 'vnpay', label: 'VNPay', icon: CreditCard },
  { id: 'payos', label: 'PayOS', icon: Wallet },
];

export default function ConsumerCheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState(currentConsumer.addresses[0]?.fullAddress || '');
  const [phone, setPhone] = useState(currentConsumer.phone);
  const [name, setName] = useState(currentConsumer.name);
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState('cod');
  const [ordered, setOrdered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('consumer_cart') || '[]');
    if (saved.length === 0) router.push('/consumer/cart');
    setCart(saved);
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = 15000;

  const placeOrder = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    localStorage.setItem('consumer_cart', '[]');
    setOrdered(true);
    toast('Đặt hàng thành công!', { description: 'Nông dân sẽ xác nhận đơn hàng của bạn.' });
  };

  if (ordered) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Đặt hàng thành công!</h1>
          <p className="text-muted-foreground text-sm">Đơn hàng đã được gửi. Bạn sẽ nhận thông báo khi nông dân xác nhận.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/consumer/orders"><Button>Xem đơn hàng</Button></Link>
            <Link href="/consumer/marketplace"><Button variant="outline">Tiếp tục mua</Button></Link>
          </div>
        </div>
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Thanh toán</h1>

        {/* Delivery info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">Thông tin giao hàng</h2>
            <div className="space-y-2">
              <div>
                <Label htmlFor="name">Họ tên</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address">Địa chỉ giao hàng</Label>
                <Textarea id="address" rows={2} value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="note">Ghi chú</Label>
                <Input id="note" placeholder="Ghi chú (không bắt buộc)" value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">Phương thức thanh toán</h2>
            <div className="space-y-2">
              {paymentMethods.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    payment === m.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                  }`}
                >
                  <m.icon className={`h-5 w-5 ${payment === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order summary */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="font-bold text-base">Đơn hàng ({cart.length} sản phẩm)</h2>
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between text-sm py-1">
                <span>{item.productName} x{item.quantity}</span>
                <span className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-1">
                <span>Tổng</span>
                <span className="text-primary">{(total + shippingFee).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-14 text-base font-bold" onClick={placeOrder}>
          Đặt hàng · {(total + shippingFee).toLocaleString('vi-VN')}đ
        </Button>
      </div>
    </ConsumerLayout>
  );
}
