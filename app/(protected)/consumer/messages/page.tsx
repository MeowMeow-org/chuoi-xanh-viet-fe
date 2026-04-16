"use client";

import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function ConsumerMessagesPage() {
  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Tin nhắn</h1>
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="font-bold text-base">Tính năng đang phát triển</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Bạn sẽ sớm có thể nhắn tin trực tiếp với nông dân để hỏi về sản phẩm, thương lượng giá, và theo dõi đơn hàng.
            </p>
          </CardContent>
        </Card>
      </div>
    </ConsumerLayout>
  );
}
