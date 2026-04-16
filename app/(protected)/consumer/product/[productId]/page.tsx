"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Star, ShieldCheck, QrCode, Minus, Plus, ShoppingCart, MapPin } from 'lucide-react';
import { consumerProducts, shops } from '@/data/consumerMockData';
import { reviews } from '@/data/marketplaceData';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ConsumerProductPage() {
  const { productId } = useParams();
  const product = consumerProducts.find(p => p.id === productId);
  const shop = product ? shops.find(s => s.id === product.shopId) : null;
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
          <Link href="/consumer/marketplace"><Button variant="outline" className="mt-4">Quay lại chợ</Button></Link>
        </div>
      </ConsumerLayout>
    );
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('consumer_cart') || '[]');
    const existing = cart.find((i: any) => i.productId === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ productId: product.id, productName: product.name, price: product.price, unit: product.unit, quantity: qty, shopName: shop?.name });
    }
    localStorage.setItem('consumer_cart', JSON.stringify(cart));
    toast('Đã thêm vào giỏ hàng!', { description: `${product.name} x${qty}` });
  };

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-24 md:pb-8 max-w-2xl space-y-4">
        {/* Image */}
        <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center relative">
          <Leaf className="h-16 w-16 text-primary/20" />
          {product.verified && (
            <Badge className="absolute top-3 left-3 gap-1">
              <ShieldCheck className="h-3 w-3" /> Đã xác minh nguồn gốc
            </Badge>
          )}
          {product.quarantine && (
            <Badge className="absolute top-3 right-3 bg-warning text-warning-foreground">
              Cách ly {product.quarantineDaysLeft} ngày
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="text-2xl font-extrabold text-primary">{product.price.toLocaleString('vi-VN')}đ <span className="text-sm font-normal text-muted-foreground">/ {product.unit}</span></p>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount} đánh giá)</span>
            </div>
            <span className="text-muted-foreground">· Đã bán {product.soldCount}</span>
          </div>
          <p className="text-sm text-muted-foreground">Còn {product.stock} sản phẩm</p>
        </div>

        {/* Shop info */}
        {shop && (
          <Link href={`/consumer/shop/${shop.id}`}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{shop.name}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {shop.region}
                  </div>
                </div>
                <div className="flex gap-1">
                  {shop.certifications.map(c => (
                    <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* QR trace */}
        <Link href="/consumer/trace">
          <Card className="border-primary/30 hover:border-primary/50 transition-colors mt-3">
            <CardContent className="p-3 flex items-center gap-3">
              <QrCode className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold text-sm">Truy xuất nguồn gốc</p>
                <p className="text-xs text-muted-foreground">Xem nhật ký canh tác, vị trí, chứng nhận</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Description */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-bold text-sm">Mô tả sản phẩm</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </CardContent>
        </Card>

        {/* Reviews preview */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-bold text-sm">Đánh giá ({product.reviewCount})</h3>
            {reviews.slice(0, 2).map(r => (
              <div key={r.id} className="border-t pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{r.userName}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Add to cart - sticky */}
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-card border-t p-3 z-40">
          <div className="container max-w-2xl flex items-center gap-3">
            <div className="flex items-center border rounded-lg">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(qty + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1 h-12 text-base font-bold gap-2"
              onClick={addToCart}
              disabled={product.stock === 0 || product.quarantine}
            >
              <ShoppingCart className="h-5 w-5" />
              {product.quarantine ? 'Đang cách ly' : product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  );
}
