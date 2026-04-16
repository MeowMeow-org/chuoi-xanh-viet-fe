"use client";

import { useState } from 'react';
import Link from 'next/link';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, Star, ShieldCheck, MapPin, Search } from 'lucide-react';
import { consumerProducts, shops, PRODUCT_CATEGORIES, REGIONS } from '@/data/consumerMockData';

export default function ConsumerMarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [region, setRegion] = useState('Tất cả');
  const [view, setView] = useState<'products' | 'shops'>('products');

  const filteredProducts = consumerProducts.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Tất cả' || p.category === category;
    const shop = shops.find(s => s.id === p.shopId);
    const matchRegion = region === 'Tất cả' || shop?.region === region;
    return matchSearch && matchCat && matchRegion;
  });

  const filteredShops = shops.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === 'Tất cả' || s.region === region;
    return matchSearch && matchRegion;
  });

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-4xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm sản phẩm, gian hàng..."
            className="pl-10 h-12"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* View toggle */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === 'products' ? 'default' : 'outline'}
            onClick={() => setView('products')}
          >
            Sản phẩm
          </Button>
          <Button
            size="sm"
            variant={view === 'shops' ? 'default' : 'outline'}
            onClick={() => setView('shops')}
          >
            Gian hàng
          </Button>
        </div>

        {/* Filters */}
        {view === 'products' && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {PRODUCT_CATEGORIES.map(c => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? 'secondary' : 'ghost'}
                className="shrink-0 text-xs"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {REGIONS.map(r => (
            <Button
              key={r}
              size="sm"
              variant={region === r ? 'secondary' : 'ghost'}
              className="shrink-0 text-xs"
              onClick={() => setRegion(r)}
            >
              {r}
            </Button>
          ))}
        </div>

        {/* Products grid */}
        {view === 'products' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map(product => {
              const shop = shops.find(s => s.id === product.shopId);
              return (
                <Link key={product.id} href={`/consumer/product/${product.id}`}>
                  <Card className="hover:border-primary/40 transition-colors h-full">
                    <div className="aspect-square bg-muted/50 rounded-t-lg flex items-center justify-center relative">
                      <Leaf className="h-10 w-10 text-primary/30" />
                      {product.quarantine && (
                        <Badge className="absolute top-2 left-2 text-[10px] bg-warning text-warning-foreground">
                          Cách ly {product.quarantineDaysLeft} ngày
                        </Badge>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-t-lg">
                          <span className="font-bold text-muted-foreground">Hết hàng</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{shop?.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{product.rating}</span>
                        <span className="text-xs text-muted-foreground">· Đã bán {product.soldCount}</span>
                      </div>
                      <p className="text-primary font-bold text-sm">{product.price.toLocaleString('vi-VN')}đ/{product.unit}</p>
                      {product.verified && (
                        <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0">
                          <ShieldCheck className="h-3 w-3" /> Xác minh
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Shops list */}
        {view === 'shops' && (
          <div className="space-y-3">
            {filteredShops.map(shop => (
              <Link key={shop.id} href={`/consumer/shop/${shop.id}`}>
                <Card className="hover:border-primary/40 transition-colors mb-3">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Leaf className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-bold text-sm">{shop.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {shop.region}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{shop.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold">{shop.rating}</span>
                          <span className="text-xs text-muted-foreground">({shop.totalReviews})</span>
                        </div>
                        {shop.certifications.map(c => (
                          <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ConsumerLayout>
  );
}
