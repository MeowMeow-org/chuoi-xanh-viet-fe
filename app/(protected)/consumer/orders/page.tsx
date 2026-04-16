"use client";

import { useState } from 'react';
import Link from 'next/link';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Star, Camera } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { consumerOrders } from '@/data/consumerMockData';
import { toast } from 'sonner';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const tabs = ['Tất cả', 'Chờ xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'];
const tabToStatus: Record<string, string | null> = {
  'Tất cả': null, 'Chờ xác nhận': 'pending', 'Đang giao': 'shipping', 'Đã giao': 'delivered', 'Đã hủy': 'cancelled',
};

export default function ConsumerOrdersPage() {
  const [tab, setTab] = useState('Tất cả');
  const [reviewingOrder, setReviewingOrder] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const filtered = consumerOrders.filter(o => {
    const statusFilter = tabToStatus[tab];
    if (!statusFilter) return true;
    return o.status === statusFilter;
  });

  const submitReview = () => {
    toast('Cảm ơn bạn!', { description: 'Đánh giá đã được gửi thành công.' });
    setReviewingOrder(null);
    setComment('');
    setRating(5);
  };

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Đơn hàng của tôi</h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map(t => (
            <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} className="shrink-0 text-xs" onClick={() => setTab(t)}>
              {t}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const status = statusMap[order.status];
              return (
                <Card key={order.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm">{order.shopName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <Badge className={`${status.color} text-xs`}>{status.label}</Badge>
                    </div>
                    {order.items.map(item => (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span>{item.productName} x{item.quantity}</span>
                        <span className="font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Tổng ({order.paymentMethod})</span>
                      <span className="font-bold text-primary">{(order.total + order.shippingFee).toLocaleString('vi-VN')}đ</span>
                    </div>
                    {order.canReview && order.status === 'delivered' && reviewingOrder !== order.id && (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => setReviewingOrder(order.id)}>
                        <Star className="h-3.5 w-3.5" /> Đánh giá
                      </Button>
                    )}

                    {/* Review form */}
                    {reviewingOrder === order.id && (
                      <div className="border-t pt-3 space-y-3">
                        <p className="font-bold text-sm">Đánh giá đơn hàng</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setRating(s)}>
                              <Star className={`h-6 w-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                            </button>
                          ))}
                        </div>
                        <Textarea placeholder="Nhận xét về sản phẩm..." rows={2} value={comment} onChange={e => setComment(e.target.value)} />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Camera className="h-3.5 w-3.5" /> Thêm ảnh
                          </Button>
                          <Button size="sm" onClick={submitReview}>Gửi đánh giá</Button>
                          <Button size="sm" variant="ghost" onClick={() => setReviewingOrder(null)}>Hủy</Button>
                        </div>
                      </div>
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
