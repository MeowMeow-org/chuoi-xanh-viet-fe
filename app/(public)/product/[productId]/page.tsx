"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Leaf,
  ShieldCheck,
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  MessageSquare,
  Zap,
  Store,
  Star,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { shopService } from "@/services/shop/shopService";
import { reviewService } from "@/services/review/reviewService";
import { chatService } from "@/services/chat/chatService";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import type { ShopReview } from "@/services/review";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/useAuthStore";

const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const toNumber = (v: number | string | null | undefined) => {
  if (v === null || v === undefined) return 0;
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num : 0;
};

function shopInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

function formatJoinedAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  if (years >= 1) return `${years} năm trước`;
  const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000));
  if (months >= 1) return `${months} tháng trước`;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days >= 1) return `${days} ngày trước`;
  return "Gần đây";
}

function formatActivityAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatJoinedAgo(iso);
}

function ReviewStarsRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/35",
          )}
        />
      ))}
    </span>
  );
}

function ProductImageGallery({
  productName,
  imageUrl,
  isVerified,
}: {
  productName: string;
  imageUrl: string | null;
  isVerified: boolean;
}) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryImages = useMemo(
    () => (imageUrl ? [imageUrl] : []),
    [imageUrl],
  );
  const activeImageUrl = galleryImages[activeImageIndex] ?? null;

  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted/50 lg:rounded-2xl">
        {activeImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImageUrl}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Leaf className="h-16 w-16 text-primary/20" />
          </div>
        )}
        {isVerified && (
          <Badge className="absolute left-3 top-3 gap-1">
            <ShieldCheck className="h-3 w-3" /> Đã xác minh nguồn gốc
          </Badge>
        )}
      </div>
      {galleryImages.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {galleryImages.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActiveImageIndex(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-muted/30 transition",
                i === activeImageIndex
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default function PublicProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const requireAuth = useRequireAuth();
  const role = useAuthStore((s) => s.user?.role);
  const isConsumer = role === "consumer";

  const { data: product, isLoading } = useQuery({
    queryKey: ["public-product", productId],
    queryFn: () => shopService.getPublicProductById(productId as string),
    enabled: !!productId,
  });

  const shopId = product?.shop?.id;

  const shopDetailQuery = useQuery({
    queryKey: ["consumer-product-shop-panel", shopId],
    queryFn: () => shopService.getShopById(shopId as string),
    enabled: !!shopId,
  });

  const shopProductsMetaQuery = useQuery({
    queryKey: ["consumer-product-shop-products-meta", shopId],
    queryFn: () => shopService.getPublicProducts({ shopId: shopId as string, limit: 1 }),
    enabled: !!shopId,
  });

  const productReviewsQuery = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () =>
      reviewService.listByProduct(productId as string, { page: 1, limit: 30 }),
    enabled: !!productId,
  });

  const openChatMutation = useMutation({
    mutationFn: (peerUserId: string) => chatService.openConversation(peerUserId),
    onSuccess: (conversation) => {
      const msgRoute =
        role === "farmer"
          ? "/farmer/messages"
          : role === "cooperative"
            ? "/cooperative/messages"
            : "/consumer/messages";
      router.push(`${msgRoute}?c=${conversation.id}`);
    },
  });

  if (isLoading) {
    return (
      <ConsumerLayout>
        <div className="container flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ConsumerLayout>
    );
  }

  if (!product) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
          <Link href="/marketplace">
            <Button variant="outline" className="mt-4">
              Quay lại chợ
            </Button>
          </Link>
        </div>
      </ConsumerLayout>
    );
  }

  const stock = toNumber(product.stockQty);
  const outOfStock = stock <= 0;
  const unitLabel = product.unit ?? "đơn vị";
  const certs = (product.shop.certifications as string[] | null) ?? [];
  const shopPanel = shopDetailQuery.data;
  const reviewMeta = productReviewsQuery.data?.meta;
  const reviewItems: ShopReview[] = productReviewsQuery.data?.items ?? [];
  const productTotal = shopProductsMetaQuery.data?.meta.total ?? 0;
  const chatPeerId = product.shop.farm?.ownerUserId;

  const addToCart = () => {
    if (
      !requireAuth({
        role: "consumer",
        guestMessage: "Đăng nhập để thêm vào giỏ hàng",
        wrongRoleMessage: "Chỉ tài khoản người mua mới có thể đặt hàng",
      })
    )
      return;
    if (!product.shop) return;
    addItem(
      {
        productId: product.id,
        productName: product.name,
        price: Number(product.price),
        unit: product.unit ?? "đơn vị",
        shopId: product.shop.id,
        shopName: product.shop.name,
        stockQty: stock,
        imageUrl: product.imageUrl,
      },
      qty,
    );
    toast.success("Đã thêm vào giỏ hàng", {
      description: `${product.name} x${qty}`,
    });
  };

  const buyNow = () => {
    if (
      !requireAuth({
        role: "consumer",
        guestMessage: "Đăng nhập để mua hàng",
        wrongRoleMessage: "Chỉ tài khoản người mua mới có thể mua hàng",
      })
    )
      return;
    if (!product.shop || outOfStock) return;
    addItem(
      {
        productId: product.id,
        productName: product.name,
        price: Number(product.price),
        unit: product.unit ?? "đơn vị",
        shopId: product.shop.id,
        shopName: product.shop.name,
        stockQty: stock,
        imageUrl: product.imageUrl,
      },
      qty,
    );
    toast.success("Đã thêm vào giỏ hàng", {
      description: `${product.name} x${qty}`,
    });
    router.push("/consumer/cart");
  };

  const messageFarmer = () => {
    if (!requireAuth({ guestMessage: "Đăng nhập để nhắn nông hộ" })) return;
    const peerUserId = product.shop.farm?.ownerUserId;
    if (!peerUserId) {
      toast.error("Không tìm thấy nông hộ của gian hàng này");
      return;
    }
    openChatMutation.mutate(peerUserId);
  };

  const quantityStepper = (
    <div className="flex items-center rounded-lg border bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={() => setQty(Math.max(1, qty - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-10 text-center text-sm font-bold">{qty}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
        onClick={() => setQty(Math.min(stock || qty + 1, qty + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  const quantityRowDesktop = (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Số lượng</span>
      {quantityStepper}
      <span
        className={cn(
          "text-sm font-semibold",
          outOfStock ? "text-destructive" : "text-primary",
        )}
      >
        {outOfStock ? "Hết hàng" : "Còn hàng"}
      </span>
    </div>
  );

  // Non-consumer đã login: ẩn nút mua (vì vô nghĩa với họ).
  const showBuyingActions = isConsumer || !role; // guest: hiện để dẫn login

  return (
    <ConsumerLayout>
      <div className="container max-w-2xl py-4 pb-24 lg:max-w-6xl lg:pb-8">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
          <div className="lg:col-span-5 lg:sticky lg:top-20 lg:self-start">
            <ProductImageGallery
              key={String(productId)}
              productName={product.name}
              imageUrl={product.imageUrl}
              isVerified={product.shop.isVerified}
            />
          </div>

          <div className="mt-4 space-y-4 lg:col-span-7 lg:mt-0">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <h1 className="text-xl font-bold leading-snug lg:text-2xl lg:leading-tight">
                  {product.name}
                </h1>
                <ProductRatingBadge
                  averageRating={product.averageRating}
                  reviewCount={product.reviewCount}
                  size="sm"
                  emptyLabel="Sản phẩm này chưa có đánh giá"
                />
              </div>
              <Card>
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-sm font-bold">Mô tả sản phẩm</h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {product.description ?? "Chưa có mô tả"}
                  </p>
                </CardContent>
              </Card>
              {product.season && (
                <Card>
                  <CardContent className="space-y-1 p-4">
                    <h3 className="text-sm font-bold">Thông tin mùa vụ &amp; lô</h3>
                    <p className="text-xs text-muted-foreground">
                      Mã mùa:{" "}
                      <span className="font-medium text-foreground">
                        {product.season.code}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cây trồng:{" "}
                      <span className="font-medium text-foreground">
                        {product.season.cropName}
                      </span>
                    </p>
                    {product.saleUnit && (
                      <p className="text-xs text-muted-foreground">
                        Lô bán:{" "}
                        <span className="font-semibold text-primary">
                          {product.saleUnit.shortCode ?? product.saleUnit.code}
                        </span>{" "}
                        ·{" "}
                        <span className="font-medium text-foreground">
                          {outOfStock
                            ? "đã bán hết"
                            : `còn ${stock.toLocaleString("vi-VN")} ${unitLabel}`}
                        </span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              <div className="flex w-full flex-col justify-center gap-0.5 rounded-xl border border-[hsl(142,20%,88%)] bg-[hsl(120,22%,97%)] px-4 py-2.5">
                <p className="m-0 text-2xl font-extrabold leading-none text-primary lg:text-3xl lg:leading-none">
                  {formatPrice(product.price)}đ{" "}
                  <span className="text-sm font-normal leading-none text-muted-foreground">
                    / {unitLabel}
                  </span>
                </p>
                <p className="m-0 text-sm leading-none text-muted-foreground">
                  {outOfStock
                    ? "Hết hàng"
                    : `Còn ${stock.toLocaleString("vi-VN")} ${unitLabel}`}
                </p>
              </div>
            </div>

            {showBuyingActions && (
              <div className="hidden space-y-4 pt-4 lg:block">
                {quantityRowDesktop}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="h-12 flex-1 gap-2 border-primary text-primary hover:bg-primary/5"
                    onClick={addToCart}
                    disabled={outOfStock}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    className="h-12 flex-1 gap-2 text-base font-bold"
                    onClick={buyNow}
                    disabled={outOfStock}
                  >
                    <Zap className="h-5 w-5" />
                    Mua ngay
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-[hsl(142,18%,88%)] bg-[hsl(120,18%,98%)] p-3 lg:p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="flex min-w-0 flex-col gap-2.5 lg:min-w-0 lg:pr-2">
              <div className="flex items-start gap-2.5">
                <div className="relative mt-0.5 shrink-0">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                    aria-hidden
                  >
                    {shopInitials(product.shop.name)}
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <Link
                    href={`/shop/${product.shop.id}`}
                    className="text-sm font-bold leading-tight text-foreground underline-offset-2 hover:text-primary hover:underline"
                  >
                    {product.shop.name}
                  </Link>
                  <p className="text-[11px] leading-tight text-muted-foreground">
                    {shopPanel?.updated_at ? (
                      <>
                        Hoạt động{" "}
                        <span className="font-medium text-foreground/80">
                          {formatActivityAgo(shopPanel.updated_at)}
                        </span>
                      </>
                    ) : (
                      "Gian hàng Chuỗi Xanh Việt"
                    )}
                  </p>
                  {(shopPanel?.description || product.shop.description) && (
                    <p
                      className="line-clamp-1 min-w-0 text-xs leading-snug text-muted-foreground"
                      title={
                        (shopPanel?.description ?? product.shop.description) ||
                        undefined
                      }
                    >
                      {shopPanel?.description ?? product.shop.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                    {product.shop.farm?.province && (
                      <span>
                        <span className="text-foreground/90">Khu vực:</span>{" "}
                        {product.shop.farm.district
                          ? `${product.shop.farm.district}, `
                          : ""}
                        {product.shop.farm.province}
                      </span>
                    )}
                    {certs.length > 0 &&
                      certs.map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="px-1 py-0 text-[10px] font-normal leading-tight"
                        >
                          {c}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <div className="ml-[calc(2.75rem+0.625rem)] flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="inline-flex h-8 flex-row items-center justify-center gap-2 border border-primary/50 bg-primary/10 px-3 text-xs leading-none text-primary hover:bg-primary/15"
                  disabled={!chatPeerId || openChatMutation.isPending}
                  onClick={messageFarmer}
                >
                  <MessageSquare
                    className="size-3.5 shrink-0"
                    aria-hidden
                  />
                  <span className="leading-none">
                    {openChatMutation.isPending ? "Đang mở..." : "Chat ngay"}
                  </span>
                </Button>
                <Link
                  href={`/shop/${product.shop.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "inline-flex h-8 flex-row items-center justify-center gap-2 px-3 text-xs leading-none no-underline",
                  )}
                >
                  <Store className="size-3.5 shrink-0" aria-hidden />
                  <span className="leading-none">Xem gian hàng</span>
                </Link>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 border-t border-[hsl(142,18%,88%)] pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="grid w-full grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 sm:gap-x-8">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Đánh giá (gian hàng)
                  </p>
                  <p className="mt-1 text-base font-bold tabular-nums text-primary sm:text-lg">
                    {product.shop.reviewCount != null &&
                    product.shop.reviewCount > 0
                      ? product.shop.reviewCount.toLocaleString("vi-VN")
                      : "0"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Điểm TB (gian hàng)
                  </p>
                  <p className="mt-1 text-base font-bold tabular-nums text-primary sm:text-lg">
                    {product.shop.reviewCount != null &&
                    product.shop.reviewCount > 0 &&
                    product.shop.averageRating != null
                      ? product.shop.averageRating.toFixed(1)
                      : "0.0"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Sản phẩm</p>
                  <p className="mt-1 text-base font-bold tabular-nums text-primary sm:text-lg">
                    {shopProductsMetaQuery.isLoading
                      ? "…"
                      : productTotal.toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Tham gia</p>
                  <p className="mt-1 text-base font-bold leading-snug text-primary sm:text-lg">
                    {shopPanel?.created_at
                      ? formatJoinedAgo(shopPanel.created_at)
                      : "—"}
                  </p>
                </div>
              </div>
              {product.shop.isVerified && (
                <Badge
                  variant="secondary"
                  className="w-fit gap-1.5 px-2 py-0.5 text-xs leading-none"
                >
                  <ShieldCheck className="size-3 shrink-0" aria-hidden />
                  <span className="leading-none">Đã xác minh</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <section
          className="mt-8 space-y-3 border-t border-[hsl(142,18%,88%)] pt-6"
          aria-labelledby="product-reviews-heading"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="product-reviews-heading"
              className="text-base font-bold text-foreground flex items-center gap-2"
            >
              <Star className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
              Đánh giá từ người mua
            </h2>
            {productReviewsQuery.isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : productReviewsQuery.isError ? null : reviewMeta &&
              reviewMeta.reviewCount > 0 ? (
              <span className="text-xs text-muted-foreground">
                {reviewMeta.averageRating != null
                  ? `${reviewMeta.averageRating.toFixed(1)} sao · `
                  : ""}
                {reviewMeta.reviewCount.toLocaleString("vi-VN")} nhận xét
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Sản phẩm này chưa có đánh giá
              </span>
            )}
          </div>

          {productReviewsQuery.isError && (
            <p className="text-sm text-muted-foreground">
              Không tải được đánh giá. Thử tải lại trang.
            </p>
          )}

          {!productReviewsQuery.isLoading &&
            !productReviewsQuery.isError &&
            reviewItems.length === 0 && (
              <p className="text-sm text-muted-foreground py-2 rounded-lg border border-dashed bg-muted/20 px-3">
                Sản phẩm này chưa có đánh giá. Sau khi mua và nhận hàng, bạn có
                thể đánh giá trong mục đơn hàng.
              </p>
            )}

          {reviewItems.length > 0 && (
            <ul className="space-y-2 list-none p-0 m-0">
              {reviewItems.map((r) => (
                <li key={r.id}>
                  <Card className="border-[hsl(142,18%,88%)]">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {r.reviewer.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={r.reviewer.avatarUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (r.reviewer.fullName?.trim()?.[0] ?? "?").toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="font-medium text-sm truncate">
                              {r.reviewer.fullName?.trim() || "Người mua"}
                            </span>
                            {r.isVerifiedPurchase && (
                              <Badge variant="secondary" className="text-[10px]">
                                Đã mua
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <ReviewStarsRow rating={r.rating} />
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(r.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </div>
                          {r.comment ? (
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                              {r.comment}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          {reviewMeta && reviewMeta.totalPages > 1 && (
            <p className="text-xs text-muted-foreground">
              Đang hiển thị {reviewItems.length} /{" "}
              {reviewMeta.total.toLocaleString("vi-VN")} đánh giá.
            </p>
          )}
        </section>
      </div>

      {showBuyingActions && (
        <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card p-3 md:bottom-0 lg:hidden">
          <div className="container flex max-w-2xl items-center gap-3">
            {quantityStepper}
            <Button
              className="h-12 flex-1 gap-2 text-base font-bold"
              onClick={addToCart}
              disabled={outOfStock}
            >
              <ShoppingCart className="h-5 w-5" />
              {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
            </Button>
          </div>
        </div>
      )}
    </ConsumerLayout>
  );
}

