'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Leaf,
  ShieldCheck,
  MapPin,
  Search,
  Loader2,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductRatingBadge } from '@/components/product/product-rating-badge';
import { shopService } from '@/services/shop/shopService';
import type { PublicProductSort } from '@/services/shop';
import {
  MarketplaceLocationFilters,
  type MarketplaceLocationValue,
} from '@/components/marketplace/MarketplaceLocationFilters';

const formatPrice = (price: number | string) => {
  const num = typeof price === 'string' ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString('vi-VN') : '0';
};

const formatStock = (stock: number | string | null) => {
  if (stock === null) return 0;
  const num = typeof stock === 'string' ? Number(stock) : stock;
  return Number.isFinite(num) ? num : 0;
};

/** Nhập dạng 25000 hoặc 25.000 — trả về số hoặc undefined */
function parseVnPriceInput(s: string): number | undefined {
  const t = s.trim();
  if (!t) return undefined;
  const normalized = t.replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [location, setLocation] = useState<MarketplaceLocationValue>({});
  const [locationFilterKey, setLocationFilterKey] = useState(0);
  const [minPriceStr, setMinPriceStr] = useState('');
  const [maxPriceStr, setMaxPriceStr] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [sort, setSort] = useState<PublicProductSort>('newest');
  const [view, setView] = useState<'products' | 'shops'>('products');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const setPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(window.location.search);
      if (p <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(p));
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMinPrice(minPriceStr.trim()), 400);
    return () => clearTimeout(t);
  }, [minPriceStr]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMaxPrice(maxPriceStr.trim()), 400);
    return () => clearTimeout(t);
  }, [maxPriceStr]);

  const LIMIT = 20;

  const productsQuery = useQuery({
    queryKey: [
      'public-products',
      debouncedSearch,
      location.province,
      location.district,
      location.ward,
      sort,
      debouncedMinPrice,
      debouncedMaxPrice,
      page,
    ],
    queryFn: () =>
      shopService.getPublicProducts({
        page,
        limit: LIMIT,
        searchTerm: debouncedSearch || undefined,
        province: location.province,
        district: location.district,
        ward: location.ward,
        sort,
        minPrice: parseVnPriceInput(debouncedMinPrice),
        maxPrice: parseVnPriceInput(debouncedMaxPrice),
      }),
    enabled: view === 'products',
  });

  const shopsQuery = useQuery({
    queryKey: [
      'public-shops',
      debouncedSearch,
      location.province,
      location.district,
      location.ward,
      page,
    ],
    queryFn: () =>
      shopService.getShops({
        page,
        limit: LIMIT,
        searchTerm: debouncedSearch || undefined,
        province: location.province,
        district: location.district,
        ward: location.ward,
      }),
    enabled: view === 'shops',
  });

  const products = productsQuery.data?.items ?? [];
  const shops = shopsQuery.data?.items ?? [];
  const totalPages =
    view === 'products'
      ? (productsQuery.data?.meta.totalPages ?? 1)
      : (shopsQuery.data?.meta.totalPages ?? 1);
  const isLoading =
    view === 'products' ? productsQuery.isLoading : shopsQuery.isLoading;
  const isFetching =
    view === 'products' ? productsQuery.isFetching : shopsQuery.isFetching;

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = (() => {
    const total = totalPages;
    if (total <= 7)
      return Array.from({ length: total }, (_, i) => i + 1) as (
        | number
        | '...'
      )[];
    const pages: (number | '...')[] = [1];
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++)
      pages.push(i);
    if (page < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  })();

  const locationRef = useRef<MarketplaceLocationValue>({});
  const handleLocationChange = useCallback(
    (val: MarketplaceLocationValue) => {
      const prev = locationRef.current;
      const changed =
        prev.province !== val.province ||
        prev.district !== val.district ||
        prev.ward !== val.ward;
      locationRef.current = val;
      setLocation(val);
      if (changed) setPage(1);
    },
    [setPage],
  );

  const resetFilters = () => {
    setLocationFilterKey((k) => k + 1);
    setLocation({});
    setMinPriceStr('');
    setMaxPriceStr('');
    setSort('newest');
    setPage(1);
  };

  return (
    <ConsumerLayout>
      <div className='container max-w-6xl py-4 pb-20 md:pb-8'>
        {/* Search bar */}
        <div className='relative mb-4'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Tìm sản phẩm, gian hàng...'
            className='h-12 pl-10'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* View tabs */}
        <div className='mb-4 flex gap-2'>
          <Button
            size='sm'
            variant={view === 'products' ? 'default' : 'outline'}
            onClick={() => {
              setView('products');
              setPage(1);
            }}
          >
            Sản phẩm
          </Button>
          <Button
            size='sm'
            variant={view === 'shops' ? 'default' : 'outline'}
            onClick={() => {
              setView('shops');
              setPage(1);
            }}
          >
            Gian hàng
          </Button>
        </div>

        {/* Two-column layout */}
        <div className='flex flex-col gap-4 md:flex-row md:items-start md:gap-5'>
          {/* Filter sidebar */}
          <aside className='md:w-55 md:shrink-0'>
            {/* Mobile toggle */}
            <button
              type='button'
              className='flex w-full items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-3 text-sm font-bold uppercase tracking-wide md:hidden'
              onClick={() => setMobileFilterOpen((o) => !o)}
            >
              <span className='flex items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4' />
                Bộ lọc
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  mobileFilterOpen && 'rotate-180',
                )}
              />
            </button>

            {/* Filter panel */}
            <div
              className={cn(
                'rounded-lg border border-border bg-card/50 md:sticky md:top-4',
                mobileFilterOpen ? 'mt-2 block md:mt-0' : 'hidden md:block',
              )}
            >
              <div className='flex items-center justify-between border-b border-border px-4 py-3'>
                <div className='flex items-center gap-2 text-sm tracking-wide'>
                  <SlidersHorizontal className='h-4 w-4' />
                  Bộ lọc
                </div>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs text-muted-foreground'
                  onClick={resetFilters}
                >
                  Đặt lại
                </Button>
              </div>

              <div className='divide-y divide-border px-4'>
                <MarketplaceLocationFilters
                  key={locationFilterKey}
                  onChange={handleLocationChange}
                />

                {view === 'products' && (
                  <div className='py-3'>
                    <p className='mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                      Khoảng giá
                    </p>
                    <div className='flex items-center gap-2'>
                      <Input
                        id='mp-min'
                        inputMode='numeric'
                        placeholder='Từ'
                        value={minPriceStr}
                        onChange={(e) => {
                          setMinPriceStr(e.target.value);
                          setPage(1);
                        }}
                        className='h-9 rounded-md px-3 py-2 text-sm'
                      />
                      <span className='shrink-0 text-muted-foreground'>—</span>
                      <Input
                        id='mp-max'
                        inputMode='numeric'
                        placeholder='Đến'
                        value={maxPriceStr}
                        onChange={(e) => {
                          setMaxPriceStr(e.target.value);
                          setPage(1);
                        }}
                        className='h-9 rounded-md px-3 py-2 text-sm'
                      />
                    </div>
                    <p className='mt-1.5 text-[11px] text-muted-foreground'>
                      Đơn vị: đồng (đ)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className='min-w-0 flex-1 space-y-4'>
            {/* Sort tabs + mini pagination */}
            {view === 'products' && (
              <div className='flex flex-wrap items-center gap-1.5'>
                <span className='flex shrink-0 items-center gap-1 text-sm text-muted-foreground'>
                  <ArrowUpDown className='h-3.5 w-3.5' />
                  Sắp xếp theo
                </span>
                {(
                  [
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'price_asc', label: 'Giá tăng dần' },
                    { value: 'price_desc', label: 'Giá giảm dần' },
                  ] as const
                ).map(({ value, label }) => (
                  <Button
                    key={value}
                    size='sm'
                    variant={sort === value ? 'default' : 'outline'}
                    onClick={() => {
                      setSort(value as PublicProductSort);
                      setPage(1);
                    }}
                    className='h-8 rounded px-3 text-xs'
                  >
                    {label}
                  </Button>
                ))}
                {totalPages > 1 && (
                  <div className='ml-auto flex items-center gap-1'>
                    <span className='text-sm'>
                      <span className='font-semibold text-primary'>{page}</span>
                      <span className='text-muted-foreground'>
                        /{totalPages}
                      </span>
                    </span>
                    <Button
                      size='icon'
                      variant='outline'
                      className='h-7 w-7'
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      <ChevronLeft className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      size='icon'
                      variant='outline'
                      className='h-7 w-7'
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                    >
                      <ChevronRight className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Products */}
            {view === 'products' && (
              <>
                {isLoading ? (
                  <div className='flex items-center justify-center py-12'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                ) : products.length === 0 ? (
                  <div className='py-12 text-center text-sm text-muted-foreground'>
                    Không có sản phẩm phù hợp
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
                        isFetching && 'opacity-50',
                      )}
                    >
                      {products.map((product) => {
                        const stock = formatStock(product.stockQty);
                        const outOfStock = stock <= 0;
                        return (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                          >
                            <Card className='h-full transition-colors hover:border-primary/40'>
                              <div className='relative flex aspect-square items-center justify-center overflow-hidden rounded-t-lg bg-muted/50'>
                                {product.imageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className='h-full w-full object-cover'
                                    loading='lazy'
                                  />
                                ) : (
                                  <Leaf className='h-10 w-10 text-primary/30' />
                                )}
                                {typeof product.rankScore === 'number' &&
                                  product.rankScore >= 0.55 && (
                                    <div className='absolute left-2 top-2'>
                                      <Badge
                                        variant='secondary'
                                        className='gap-0.5 border-0 bg-amber-500/95 px-1.5 py-0 text-[10px] text-white shadow-sm'
                                      >
                                        <Sparkles className='h-3 w-3' />
                                        Nổi bật
                                      </Badge>
                                    </div>
                                  )}
                                {outOfStock && (
                                  <div className='absolute inset-0 flex items-center justify-center rounded-t-lg bg-background/60'>
                                    <span className='font-bold text-muted-foreground'>
                                      Hết hàng
                                    </span>
                                  </div>
                                )}
                              </div>
                              <CardContent className='space-y-1.5 p-3'>
                                <p className='line-clamp-1 text-sm font-semibold'>
                                  {product.name}
                                </p>
                                <p className='line-clamp-1 text-xs text-muted-foreground'>
                                  {product.shop?.name}
                                </p>
                                <ProductRatingBadge
                                  averageRating={product.averageRating}
                                  reviewCount={product.reviewCount}
                                  size='xs'
                                  className='block'
                                />
                                {product.shop?.farm?.province && (
                                  <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                                    <MapPin className='h-3 w-3' />
                                    {product.shop.farm.district
                                      ? `${product.shop.farm.district}, `
                                      : ''}
                                    {product.shop.farm.ward
                                      ? `${product.shop.farm.ward}, `
                                      : ''}
                                    {product.shop.farm.province}
                                  </div>
                                )}
                                <p className='text-sm font-bold text-primary'>
                                  {formatPrice(product.price)}đ/
                                  {product.unit ?? 'đơn vị'}
                                </p>
                                {product.shop?.isVerified && (
                                  <Badge
                                    variant='secondary'
                                    className='gap-1 px-1.5 py-0 text-[10px]'
                                  >
                                    <ShieldCheck className='h-3 w-3' /> Xác minh
                                  </Badge>
                                )}
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                    {totalPages > 1 && (
                      <div className='flex items-center justify-center gap-1 pt-4'>
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8'
                          disabled={page <= 1}
                          onClick={() => goToPage(page - 1)}
                        >
                          <ChevronLeft className='h-4 w-4' />
                        </Button>
                        {pageNumbers.map((p, i) =>
                          p === '...' ? (
                            <span
                              key={`ellipsis-${i}`}
                              className='px-1 text-sm text-muted-foreground'
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={p}
                              size='icon'
                              variant={p === page ? 'default' : 'outline'}
                              className='h-8 w-8 text-sm'
                              onClick={() => goToPage(p as number)}
                            >
                              {p}
                            </Button>
                          ),
                        )}
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8'
                          disabled={page >= totalPages}
                          onClick={() => goToPage(page + 1)}
                        >
                          <ChevronRight className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Shops */}
            {view === 'shops' && (
              <>
                {isLoading ? (
                  <div className='flex items-center justify-center py-12'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                ) : shops.length === 0 ? (
                  <div className='py-12 text-center text-sm text-muted-foreground'>
                    Không có gian hàng phù hợp
                  </div>
                ) : (
                  <div className={cn('space-y-3', isFetching && 'opacity-50')}>
                    {shops.map((shop) => {
                      const certs = Array.isArray(shop.certifications)
                        ? (shop.certifications as string[])
                        : [];
                      return (
                        <Link
                          key={shop.id}
                          href={`/shop/${shop.id}`}
                        >
                          <Card className='mb-3 transition-colors hover:border-primary/40'>
                            <CardContent className='flex items-start gap-4 p-4'>
                              <div className='relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10'>
                                {shop.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={shop.avatar_url}
                                    alt={shop.name}
                                    className='h-full w-full object-cover'
                                    loading='lazy'
                                  />
                                ) : (
                                  <Leaf className='h-7 w-7 text-primary' />
                                )}
                              </div>
                              <div className='min-w-0 flex-1 space-y-1'>
                                <p className='text-sm font-bold'>{shop.name}</p>
                                <ProductRatingBadge
                                  averageRating={shop.average_rating}
                                  reviewCount={shop.review_count}
                                  size='xs'
                                  className='block'
                                />
                                {shop.farms?.province && (
                                  <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                    <MapPin className='h-3 w-3' />
                                    {shop.farms.ward
                                      ? `${shop.farms.ward}, `
                                      : ''}
                                    {shop.farms.district
                                      ? `${shop.farms.district}, `
                                      : ''}
                                    {shop.farms.province}
                                  </div>
                                )}
                                {shop.description && (
                                  <p className='line-clamp-2 min-w-0 w-full wrap-break-word text-xs text-muted-foreground'>
                                    {shop.description}
                                  </p>
                                )}
                                <div className='flex flex-wrap items-center gap-2'>
                                  {shop.is_verified && (
                                    <Badge
                                      variant='secondary'
                                      className='gap-1 px-1.5 py-0 text-[10px]'
                                    >
                                      <ShieldCheck className='h-3 w-3' />
                                      Đã xác minh
                                    </Badge>
                                  )}
                                  {certs.map((c) => (
                                    <Badge
                                      key={c}
                                      variant='secondary'
                                      className='px-1.5 py-0 text-[10px]'
                                    >
                                      {c}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ConsumerLayout>
  );
}
