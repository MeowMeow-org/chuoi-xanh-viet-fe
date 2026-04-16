"use client";

import Link from 'next/link';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, ShoppingBag, Star, ArrowRight, ShieldCheck, Leaf, MapPin } from 'lucide-react';
import { consumerProducts, shops } from '@/data/consumerMockData';

export default function ConsumerHomePage() {
  const featuredProducts = consumerProducts.filter(p => p.verified && p.stock > 0).slice(0, 4);
  const featuredShops = shops.slice(0, 3);

  return (
    <ConsumerLayout>
      <div className="pb-20 md:pb-0">
        {/* Hero */}
        <section className="gradient-hero">
          <div className="container py-10 md:py-16 text-center space-y-5">
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight tracking-tight">
              Rau sạch <span className="text-gradient-green">có nguồn gốc</span>
              <br />giao tận nhà bạn
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
              Quét QR xem nhật ký canh tác. Mua trực tiếp từ nông dân. Minh bạch từ ruộng đến bàn ăn.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/consumer/marketplace">
                <Button size="lg" className="h-13 px-6 text-base font-bold gap-2 w-full sm:w-auto">
                  <ShoppingBag className="h-5 w-5" />
                  Vào chợ
                </Button>
              </Link>
              <Link href="/consumer/trace">
                <Button size="lg" variant="outline" className="h-13 px-6 text-base font-bold gap-2 w-full sm:w-auto">
                  <QrCode className="h-5 w-5" />
                  Quét QR truy xuất
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust badges */}
        <section className="container py-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: 'Xác minh nguồn gốc' },
              { icon: Leaf, label: 'Chuẩn VietGAP' },
              { icon: QrCode, label: 'Truy xuất Blockchain' },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/5 text-center">
                <item.icon className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="container py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Sản phẩm nổi bật</h2>
            <Link href="/consumer/marketplace" className="text-sm text-primary font-medium flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featuredProducts.map(product => {
              const shop = shops.find(s => s.id === product.shopId);
              return (
                <Link key={product.id} href={`/consumer/product/${product.id}`}>
                  <Card className="hover:border-primary/40 transition-colors h-full">
                    <div className="aspect-square bg-muted/50 rounded-t-lg flex items-center justify-center">
                      <Leaf className="h-10 w-10 text-primary/30" />
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{shop?.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                      </div>
                      <p className="text-primary font-bold text-sm">{product.price.toLocaleString('vi-VN')}đ/{product.unit}</p>
                      {product.verified && (
                        <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                          <ShieldCheck className="h-3 w-3" /> Đã xác minh
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured shops */}
        <section className="container py-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Gian hàng uy tín</h2>
            <Link href="/consumer/marketplace" className="text-sm text-primary font-medium flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {featuredShops.map(shop => (
              <Link key={shop.id} href={`/consumer/shop/${shop.id}`}>
                <Card className="hover:border-primary/40 transition-colors mb-3">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Leaf className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-bold text-sm">{shop.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {shop.region}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold">{shop.rating}</span>
                          <span className="text-xs text-muted-foreground">({shop.totalReviews})</span>
                        </div>
                        <div className="flex gap-1">
                          {shop.certifications.map(c => (
                            <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ConsumerLayout>
  );
}
