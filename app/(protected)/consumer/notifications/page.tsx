"use client";

import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, MessageSquare, Star } from 'lucide-react';

const notifications = [
  { id: '1', type: 'order', title: 'Đơn hàng đang giao', content: 'Đơn Xà lách lô lô xanh đang được giao đến bạn.', read: false, time: '2 giờ trước' },
  { id: '2', type: 'order', title: 'Đơn hàng đã xác nhận', content: 'Đơn Dưa leo baby + Bí đao xanh đã được nông dân xác nhận.', read: false, time: '1 ngày trước' },
  { id: '3', type: 'message', title: 'Tin nhắn mới', content: 'Nguyễn Văn Minh đã trả lời câu hỏi của bạn trên diễn đàn.', read: true, time: '2 ngày trước' },
  { id: '4', type: 'review', title: 'Đánh giá của bạn đã được đăng', content: 'Cảm ơn bạn đã đánh giá Rau muống hữu cơ!', read: true, time: '5 ngày trước' },
];

const typeIcon: Record<string, typeof Bell> = {
  order: Package,
  message: MessageSquare,
  review: Star,
};

export default function ConsumerNotificationsPage() {
  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Thông báo</h1>
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = typeIcon[n.type] || Bell;
            return (
              <Card key={n.id} className={!n.read ? 'border-primary/30 bg-primary/5' : ''}>
                <CardContent className="p-3 flex items-start gap-3">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-4 w-4 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{n.title}</p>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.content}</p>
                    <p className="text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ConsumerLayout>
  );
}
