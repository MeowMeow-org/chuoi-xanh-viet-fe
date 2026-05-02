'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Store,
  ChevronUp,
} from 'lucide-react';
import { groupCartByShop, useCartStore } from '@/store/useCartStore';

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

  if (!hasHydrated) {
    return (
      <ConsumerLayout>
        <div className='container py-12 text-center text-muted-foreground text-sm'>
          Đang tải giỏ hàng...
        </div>
      </ConsumerLayout>
    );
  }

  if (items.length === 0) {
    return (
      <ConsumerLayout>
        <div className='container py-12 text-center space-y-3 max-w-md mx-auto'>
          <ShoppingBag className='h-12 w-12 text-muted-foreground mx-auto' />
          <p className='text-muted-foreground'>Giỏ hàng trống</p>
          <Link href='/marketplace'>
            <Button variant='outline'>Đến chợ mua sắm</Button>
          </Link>
        </div>
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
      <div className='container py-4 pb-32 space-y-4 max-w-2xl'>
        <h1 className='text-xl font-bold'>Giỏ hàng ({items.length})</h1>
        {groups.length > 1 && (
          <p className='text-xs text-muted-foreground'>
            Đơn hàng sẽ được tách thành {groups.length} đơn theo từng gian hàng.
            Phí giao hàng tính riêng mỗi đơn.
          </p>
        )}

        <div className='space-y-4'>
          {groups.map((group) => {
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
              <div
                key={group.shopId}
                className='space-y-2'
              >
                <div className='flex items-center gap-2 px-1'>
                  <input
                    type='checkbox'
                    checked={allShopSelected}
                    ref={(el) => {
                      if (el)
                        el.indeterminate = someShopSelected && !allShopSelected;
                    }}
                    onChange={() => handleToggleShop(groupItemIds)}
                    className='h-4 w-4 accent-green-600 cursor-pointer'
                  />
                  <Store className='h-4 w-4 text-primary' />
                  <Link
                    href={`/shop/${group.shopId}`}
                    className='font-semibold text-sm hover:underline'
                  >
                    {group.shopName}
                  </Link>
                </div>
                <div className='space-y-2'>
                  {group.items.map((item) => (
                    <Card key={item.productId}>
                      <CardContent className='p-4 flex items-center gap-3'>
                        <input
                          type='checkbox'
                          checked={selectedProductIds.includes(item.productId)}
                          onChange={() => toggleSelectItem(item.productId)}
                          className='h-4 w-4 accent-green-600 cursor-pointer shrink-0'
                        />
                        <div className='h-14 w-14 rounded-md bg-muted/50 overflow-hidden shrink-0 flex items-center justify-center'>
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className='h-full w-full object-cover'
                              loading='lazy'
                            />
                          ) : null}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <Link
                            href={`/product/${item.productId}`}
                            className='font-semibold text-sm truncate hover:underline block'
                          >
                            {item.productName}
                          </Link>
                          <p className='text-sm text-primary font-bold'>
                            {item.price.toLocaleString('vi-VN')}đ/{item.unit}
                          </p>
                        </div>
                        <div className='flex items-center border rounded-lg'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className='h-3 w-3' />
                          </Button>
                          <span className='w-8 text-center text-sm font-semibold'>
                            {item.quantity}
                          </span>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className='h-3 w-3' />
                          </Button>
                        </div>
                        <p className='text-sm font-bold w-20 text-right'>
                          {(item.price * item.quantity).toLocaleString('vi-VN')}
                          đ
                        </p>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-destructive'
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className='flex justify-between text-xs text-muted-foreground px-1'>
                  <span>Tạm tính gian hàng</span>
                  <span>{groupSubtotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className='fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg'>
        <div className='container max-w-2xl py-3 flex items-center gap-3'>
          <label className='flex items-center gap-2 cursor-pointer select-none shrink-0'>
            <input
              type='checkbox'
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = !isAllSelected && !isNoneSelected;
              }}
              onChange={handleToggleAll}
              className='h-4 w-4 accent-green-600 cursor-pointer'
            />
            <span className='text-sm'>Chọn Tất Cả ({items.length})</span>
          </label>
          <Button
            variant='ghost'
            size='sm'
            className='text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0'
            disabled={isNoneSelected}
            onClick={() => removeItems(selectedProductIds)}
          >
            Xóa
          </Button>

          <div className='flex-1' />

          <div className='relative group text-right shrink-0 cursor-default'>
            {/* Hover detail panel */}
            <div className='absolute bottom-full right-0 mb-2 w-72 bg-background border rounded-lg shadow-xl p-4 space-y-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 z-50'>
              <h3 className='font-semibold text-sm'>Chi tiết thanh toán</h3>
              <div className='border-t' />
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Tổng tiền hàng</span>
                <span>{selectedSubtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>
                  Tổng phí giao hàng ({selectedGroups.length} đơn)
                </span>
                <span>{selectedShippingFee.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className='border-t' />
              <div className='flex justify-between text-sm font-bold'>
                <span>Tổng số tiền</span>
                <span className='text-primary'>
                  {selectedTotal.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <p className='text-xs text-muted-foreground text-right'>
                Số tiền cuối cùng thanh toán
              </p>
            </div>

            <p className='text-sm text-foreground flex items-center justify-end gap-1'>
              Tổng cộng ({selectedQty} sản phẩm):{' '}
              <span className='text-2xl font-extrabold text-primary'>
                {selectedTotal.toLocaleString('vi-VN')}đ
              </span>
              <ChevronUp className='h-4 w-4 text-primary rotate-180 group-hover:rotate-0 transition-transform duration-150' />
            </p>
          </div>

          <Button
            className='h-11 px-6 font-bold shrink-0'
            disabled={isNoneSelected}
            onClick={handleCheckout}
          >
            Thanh Toán
          </Button>
        </div>
      </div>
    </ConsumerLayout>
  );
}
