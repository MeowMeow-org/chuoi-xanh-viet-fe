"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Star, ShieldCheck, MapPin, QrCode } from 'lucide-react';
import { shops, consumerProducts } from '@/data/consumerMockData';

export default function ConsumerShopPage() {
  const { shopId } = useParams();
  const shop = shops.find(s => s.id === shopId);

  if (!shop) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy gian hàng</p>
          <Link href="/consumer/marketplace"><Button variant="outline" className="mt-4">Quay lại chợ</Button></Link>
        </div>
      </ConsumerLayout>
    );
  }

  const shopProducts = consumerProducts.filter(p => p.shopId === shop.id);

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 max-w-4xl space-y-4">
        {/* Shop header */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h1 className="font-bold text-lg">{shop.name}</h1>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {shop.region}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{shop.rating}</span>
                  <span className="text-sm text-muted-foreground">({shop.totalReviews} đánh giá)</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{shop.description}</p>
            <div className="flex gap-2 flex-wrap">
              {shop.certifications.map(c => (
                <Badge key={c} variant="secondary" className="gap-1">
                  <ShieldCheck className="h-3 w-3" /> {c}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Link href="/consumer/messages">
                <Button variant="outline" size="sm">Nhắn tin</Button>
              </Link>
              <Link href={`/consumer/trace`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <QrCode className="h-3.5 w-3.5" /> Truy xuất
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <h2 className="font-bold text-base">Sản phẩm ({shopProducts.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shopProducts.map(product => (
            <Link key={product.id} href={`/consumer/product/${product.id}`}>
              <Card className="hover:border-primary/40 transition-colors h-full">
                <div className="aspect-square bg-muted/50 rounded-t-lg flex items-center justify-center">
                  <Leaf className="h-10 w-10 text-primary/30" />
                </div>
                <CardContent className="p-3 space-y-1.5">
                  <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">· Đã bán {product.soldCount}</span>
                  </div>
                  <p className="text-primary font-bold text-sm">{product.price.toLocaleString('vi-VN')}đ/{product.unit}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ConsumerLayout>
  );
}
