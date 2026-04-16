"use client";

import { useState } from 'react';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, MapPin, Phone, Mail, Lock, LogOut, Plus, Trash2 } from 'lucide-react';
import { currentConsumer } from '@/data/consumerMockData';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ConsumerProfilePage() {
  const [name, setName] = useState(currentConsumer.name);
  const [phone, setPhone] = useState(currentConsumer.phone);
  const [email, setEmail] = useState(currentConsumer.email);
  const [addresses, setAddresses] = useState(currentConsumer.addresses);
  const [newAddress, setNewAddress] = useState('');

  const saveProfile = () => {
    toast('Đã lưu thông tin!');
  };

  const addAddress = () => {
    if (!newAddress.trim()) return;
    setAddresses([...addresses, { id: `addr-${Date.now()}`, label: 'Mới', fullAddress: newAddress, isDefault: false }]);
    setNewAddress('');
  };

  const removeAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
  };

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Tài khoản</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg">{name}</p>
            <p className="text-sm text-muted-foreground">Người tiêu dùng</p>
          </div>
        </div>

        {/* Personal info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">Thông tin cá nhân</h2>
            <div className="space-y-2">
              <div>
                <Label htmlFor="name">Họ tên</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" className="pl-10" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" className="pl-10" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            </div>
            <Button onClick={saveProfile}>Lưu thay đổi</Button>
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">Địa chỉ giao hàng</h2>
            {addresses.map(addr => (
              <div key={addr.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{addr.label}</span>
                    {addr.isDefault && <span className="text-[10px] text-primary font-medium">Mặc định</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{addr.fullAddress}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive shrink-0" onClick={() => removeAddress(addr.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input placeholder="Nhập địa chỉ mới..." value={newAddress} onChange={e => setNewAddress(e.target.value)} />
              <Button variant="outline" size="icon" onClick={addAddress}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="font-bold text-base">Đổi mật khẩu</h2>
            <div className="space-y-2">
              <div>
                <Label>Mật khẩu hiện tại</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" className="pl-10" placeholder="••••••" />
                </div>
              </div>
              <div>
                <Label>Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" className="pl-10" placeholder="••••••" />
                </div>
              </div>
            </div>
            <Button variant="outline">Cập nhật mật khẩu</Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              Đổi vai trò
            </Button>
          </Link>
          <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" /> Đăng xuất
          </Button>
        </div>
      </div>
    </ConsumerLayout>
  );
}
