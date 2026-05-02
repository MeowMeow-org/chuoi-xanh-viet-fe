'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Store,
  ChevronUp,
  Package,
  Info,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { groupCartByShop, useCartStore } from '@/store/useCartStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const SHIPPING_FEE_PER_SHOP = 15000;

export default function ConsumerCartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const removeItems = (ids: string[]) => ids.forEach(removeItem);
  const selectedProductIds = useCartStore((s) => s.selectedProductIds);
  const toggleSelectItem = useCartStore((s) => s.toggleSelectItem);
  const setSelectedProductIds = useCartStore((s) => s.setSelectedProductIds);
  const [isSummaryExpand, setIsSummaryExpand] = useState(false);

  if (!hasHydrated) {
    return (
      <ConsumerLayout>
        <div className='container py-32 flex flex-col items-center justify-center gap-6'>
          <div className='h-10 w-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin' />
          <p className='text-muted-foreground font-medium text-sm tracking-wide'>Đang chuẩn bị giỏ hàng của bạn...</p>
        </div>
      </ConsumerLayout>
    );
  }

  if (items.length === 0) {
    return (
      <ConsumerLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className='container py-32 text-center space-y-8 max-w-lg mx-auto'
        >
          <div className='bg-primary/[0.03] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 border border-primary/5'>
            <ShoppingBag className='h-10 w-10 text-primary/30' />
          </div>
          <div className='space-y-3'>
            <h2 className='text-3xl font-extrabold tracking-tight'>Giỏ hàng của bạn đang trống</h2>
            <p className='text-muted-foreground max-w-xs mx-auto text-sm leading-relaxed'>
              Khám phá chợ nông sản ngay để ủng hộ nông dân và nhận những thực phẩm tươi sạch nhất nhé!
            </p>
          </div>
          <Link href='/marketplace' className={cn(buttonVariants({ variant: 'default' }), "rounded-full px-10 h-12 font-bold shadow-md shadow-primary/10 hover:shadow-lg transition-all")}>
            Khám phá chợ ngay
          </Link>
        </motion.div>
      </ConsumerLayout>
    );
  }

  const groups = groupCartByShop(items);
  const allIds = items.map((i) => i.productId);
  const isAllSelected =
    allIds.length > 0 && allIds.every((id) => selectedProductIds.includes(id));
  const isNoneSelected = selectedProductIds.length === 0;

  const selectedItems = items.filter((i) =>
    selectedProductIds.includes(i.productId),
  );
  const selectedSubtotal = selectedItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0,
  );
  const selectedGroups = groupCartByShop(selectedItems);
  const selectedShippingFee = selectedGroups.length * SHIPPING_FEE_PER_SHOP;
  const selectedTotal = selectedSubtotal + selectedShippingFee;
  const selectedQty = selectedItems.reduce((s, i) => s + i.quantity, 0);

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(allIds);
    }
  };

  const handleToggleShop = (shopItemIds: string[]) => {
    const allShopSelected = shopItemIds.every((id) =>
      selectedProductIds.includes(id),
    );
    if (allShopSelected) {
      setSelectedProductIds(
        selectedProductIds.filter((id) => !shopItemIds.includes(id)),
      );
    } else {
      const merged = Array.from(
        new Set([...selectedProductIds, ...shopItemIds]),
      );
      setSelectedProductIds(merged);
    }
  };

  const handleCheckout = () => {
    if (isNoneSelected) return;
    router.push('/consumer/checkout');
  };

  return (
    <ConsumerLayout>
      <div className='container py-10 pb-44 space-y-10 max-w-4xl mx-auto'>
        <div className='flex flex-col gap-3'>
          <div className='flex items-end justify-between'>
            <h1 className='text-4xl font-black tracking-tight text-foreground/90'>
              Giỏ hàng
            </h1>
            <span className='text-sm font-bold bg-primary/5 text-primary px-3 py-1 rounded-lg border border-primary/10'>
              {items.length} món
            </span>
          </div>
          {groups.length > 1 && (
            <div className='flex items-start gap-3 bg-muted/30 p-3.5 rounded-2xl border border-border/50 text-muted-foreground'>
              <AlertCircle className='h-4 w-4 mt-0.5 shrink-0 text-amber-500' />
              <p className='text-xs font-medium leading-relaxed'>
                Đơn hàng sẽ được tách thành <span className='font-bold text-foreground'>{groups.length} kiện</span> theo từng gian hàng. <br className='hidden sm:block' /> Phí giao hàng tính riêng cho mỗi kiện giúp nông hộ vận chuyển tốt nhất.
              </p>
            </div>
          )}
        </div>

        <div className='grid gap-10'>
          <AnimatePresence mode='popLayout'>
            {groups.map((group, index) => {
              const groupItemIds = group.items.map((i) => i.productId);
              const allShopSelected = groupItemIds.every((id) =>
                selectedProductIds.includes(id),
              );
              const someShopSelected = groupItemIds.some((id) =>
                selectedProductIds.includes(id),
              );
              const groupSubtotal = group.items.reduce(
                (s, i) => s + i.price * i.quantity,
                0,
              );

              return (
                <motion.div
                  key={group.shopId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className='space-y-4'
                >
                  <div className='flex items-center justify-between px-2 bg-muted/40 rounded-xl p-2.5 border border-transparent hover:border-border/50 transition-colors'>
                    <div className='flex items-center gap-4'>
                      <label className='flex items-center gap-3 cursor-pointer select-none'>
                        <div
                          onClick={() => handleToggleShop(groupItemIds)}
                          className={cn(
                            "w-5 h-5 rounded-md border transition-all flex items-center justify-center",
                            allShopSelected ? "bg-primary border-primary" : someShopSelected ? "bg-primary/40 border-primary" : "border-muted-foreground/20 bg-background"
                          )}
                        >
                          {allShopSelected && <CheckCircle2 className='h-3.5 w-3.5 text-white' />}
                          {someShopSelected && !allShopSelected && <Minus className='h-3 w-3 text-white stroke-[3px]' />}
                        </div>
                        <div className='flex items-center gap-2 group'>
                          <Store className='h-4 w-4 text-primary' />
                          <Link
                            href={`/shop/${group.shopId}`}
                            className='font-extrabold text-sm hover:text-primary transition-colors'
                          >
                            {group.shopName}
                          </Link>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className='grid gap-2 border-l border-border/50 ml-4.5 pl-6'>
                    <AnimatePresence mode='popLayout'>
                      {group.items.map((item) => (
                        <motion.div
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                        >
                          <div className='p-4 flex flex-wrap sm:flex-nowrap items-center gap-5 transition-all'>
                            <div
                              onClick={() => toggleSelectItem(item.productId)}
                              className={cn(
                                "w-5 h-5 rounded-full border transition-all flex items-center justify-center cursor-pointer shrink-0",
                                selectedProductIds.includes(item.productId) ? "bg-primary border-primary" : "border-muted-foreground/20 bg-background hover:border-primary/50"
                              )}
                            >
                              {selectedProductIds.includes(item.productId) && <CheckCircle2 className='h-3.5 w-3.5 text-white stroke-[3px]' />}
                            </div>

                            <div className='relative h-20 w-20 rounded-2xl bg-muted border border-border/40 overflow-hidden shrink-0 group'>
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-700'
                                  loading='lazy'
                                />
                              ) : (
                                <div className='h-full w-full flex items-center justify-center'>
                                  <Package className='h-8 w-8 text-muted-foreground/10' />
                                </div>
                              )}
                            </div>

                            <div className='flex-1 min-w-0 py-1'>
                              <Link
                                href={`/product/${item.productId}`}
                                className='font-bold text-lg hover:text-primary transition-colors line-clamp-1 block'
                              >
                                {item.productName}
                              </Link>
                              <div className='flex items-center gap-3 mt-1.5'>
                                <p className='text-sm text-primary font-black uppercase tracking-tighter'>
                                  {item.price.toLocaleString('vi-VN')} đ
                                  <span className='text-muted-foreground font-normal ml-1 lowercase'>/ {item.unit}</span>
                                </p>
                              </div>
                            </div>

                            <div className='flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-start border-t sm:border-none pt-4 sm:pt-0'>
                              <div className='flex items-center border border-border/50 rounded-full h-10 p-1 bg-muted/20'>
                                <button
                                  onClick={() => updateQuantity(item.productId, -1)}
                                  className='h-8 w-8 flex items-center justify-center rounded-full hover:bg-background transition-all text-muted-foreground hover:text-foreground disabled:opacity-20'
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className='h-3.5 w-3.5' />
                                </button>
                                <span className='w-10 text-center text-sm font-black'>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.productId, 1)}
                                  className='h-8 w-8 flex items-center justify-center rounded-full hover:bg-background transition-all text-muted-foreground hover:text-foreground'
                                >
                                  <Plus className='h-3.5 w-3.5' />
                                </button>
                              </div>

                              <div className='flex flex-col items-end min-w-[120px] shrink-0'>
                                <p className='text-xl font-black text-foreground tracking-tight'>
                                  {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                </p>
                                <button
                                  onClick={() => removeItem(item.productId)}
                                  className='flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-rose-500 transition-colors uppercase tracking-widest'
                                >
                                  <Trash2 className='h-3 w-3' /> Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className='flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] pt-4 px-2 border-t border-dashed border-border/60 mt-2'>
                    <span>Tạm tính cửa hàng</span>
                    <span className='text-foreground'>{groupSubtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Elegant Checkout Bar */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/30 mb-[env(safe-area-inset-bottom)] pb-2'>
        <div className='container max-w-5xl py-5 sm:py-7 relative'>
          {/* Refined Summary View */}
          <AnimatePresence>
            {isSummaryExpand && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className='absolute bottom-full left-0 right-0 bg-background border border-border/50 rounded-[2rem] shadow-[0_-20px_50px_rgba(0,0,0,0.05)] p-8 sm:p-10 space-y-8 mx-4 mb-4'
              >
                <div className='flex items-center justify-between'>
                  <h3 className='text-2xl font-black italic'>Chi tiết thanh toán</h3>
                  <button onClick={() => setIsSummaryExpand(false)} className='p-2.5 bg-muted rounded-full hover:bg-muted/80 transition-colors'>
                    <X className='h-5 w-5 text-muted-foreground' />
                  </button>
                </div>
                <div className='space-y-6'>
                  <div className='flex justify-between items-center px-2'>
                    <span className='text-muted-foreground font-medium text-sm'>Tiền hàng ({selectedQty} sản phẩm)</span>
                    <span className='font-extrabold'>{selectedSubtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className='flex justify-between items-center px-2'>
                    <div className='space-y-1'>
                      <span className='text-muted-foreground font-medium text-sm block'>
                        Phí vận chuyển
                      </span>
                      <span className='text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest'>
                        {selectedGroups.length} kiện từ {selectedGroups.length} nhà vườn
                      </span>
                    </div>
                    <span className='font-extrabold text-primary'>+ {selectedShippingFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className='h-px bg-dashed-border bg-border/40 my-2' />
                  <div className='flex justify-between items-center px-2'>
                    <div className='space-y-1'>
                      <span className='text-xl font-black text-primary uppercase'>Tổng thanh toán</span>
                      <p className='text-[11px] text-muted-foreground italic font-medium'>Đã bao gồm thuế và phí dịch vụ</p>
                    </div>
                    <span className='text-4xl font-black text-primary tracking-tighter'>
                      {selectedTotal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>

                {selectedGroups.length > 1 && (
                  <div className='bg-primary/[0.02] p-5 rounded-3xl border border-primary/10 flex gap-4 items-center'>
                    <Info className='h-5 w-5 text-primary shrink-0' />
                    <p className='text-xs text-primary/80 font-medium leading-relaxed italic'>
                      Đơn hàng được gửi trực tiếp từ <span className='font-black'>{selectedGroups.length} nhà vườn</span> để đảm bảo độ tươi ngon nhất.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className='flex flex-wrap items-center gap-6 sm:gap-12'>
            <div className='flex items-center gap-8 shrink-0'>
              <label className='flex items-center gap-3 cursor-pointer select-none group'>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    handleToggleAll();
                  }}
                  className={cn(
                    "w-6 h-6 rounded-lg border transition-all flex items-center justify-center",
                    isAllSelected ? "bg-primary border-primary" : !isNoneSelected ? "bg-primary/30 border-primary" : "border-muted-foreground/20 bg-background group-hover:border-primary/50"
                  )}
                >
                  {isAllSelected && <CheckCircle2 className='h-4 w-4 text-white stroke-[3px]' />}
                  {!isAllSelected && !isNoneSelected && <Minus className='h-4 w-4 text-white stroke-[3px]' />}
                </div>
                <div className='flex flex-col'>
                  <span className='text-sm font-black uppercase tracking-tight text-foreground/80'>Tất cả</span>
                  <p className='text-[10px] text-muted-foreground font-bold tracking-widest'>{items.length} món trong túi</p>
                </div>
              </label>

              {!isNoneSelected && (
                <button
                  onClick={() => removeItems(selectedProductIds)}
                  className='text-[10px] font-black text-rose-500/80 hover:text-rose-600 transition-colors uppercase tracking-[0.2em] pl-8 border-l border-border/40 h-10 flex items-center'
                >
                  GỠ BỎ ({selectedItems.length})
                </button>
              )}
            </div>

            <div className='flex-1' />

            <div className='flex items-center gap-10'>
              <div
                className='flex flex-col items-end cursor-pointer select-none'
                onClick={() => setIsSummaryExpand(!isSummaryExpand)}
              >
                <div className='flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity'>
                  <span className='text-[10px] font-black uppercase tracking-widest hidden sm:block'>Xem chi tiết</span>
                  <ChevronUp className={cn('h-3.5 w-3.5 text-primary transition-transform duration-500', isSummaryExpand ? 'rotate-180' : 'rotate-0')} />
                </div>
                <div className='flex items-baseline gap-1'>
                  <span className='text-3xl font-black text-primary tracking-tighter'>
                    {selectedTotal.toLocaleString('vi-VN')}
                  </span>
                  <span className='text-sm font-black text-primary tracking-tighter'>đ</span>
                </div>
              </div>

              <Button
                size='lg'
                className='h-14 px-12 sm:px-16 rounded-full font-black text-base shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-white disabled:opacity-40 disabled:scale-100 uppercase tracking-widest'
                disabled={isNoneSelected}
                onClick={handleCheckout}
              >
                Tiếp tục đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  );
}

// Re-defining XCircle if not imported
const XCircle = ({ className, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);
