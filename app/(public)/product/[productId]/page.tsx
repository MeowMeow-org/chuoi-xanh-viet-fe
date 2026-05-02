"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  MapPin,
  Calendar,
  Share2,
  Heart,
  ChevronLeft,
  CheckCircle2,
  PackageCheck
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
            "h-3 w-3",
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30",
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
    <div className="space-y-4">
      <motion.div
        layoutId="product-main-image"
        className="relative aspect-square overflow-hidden rounded-3xl bg-muted/30 border border-border/40 shadow-sm"
      >
        <AnimatePresence mode="wait">
          {activeImageUrl ? (
            <motion.img
              key={activeImageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              src={activeImageUrl}
              alt={productName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Leaf className="h-12 w-12 text-primary/10" />
            </div>
          )}
        </AnimatePresence>

        {isVerified && (
          <div className="absolute left-4 top-4">
            <Badge className="gap-1.5 bg-background/90 backdrop-blur-md text-primary border-primary/20 h-7 px-2.5 rounded-full hover:bg-background/90 shadow-sm">
              <ShieldCheck className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Đã xác minh</span>
            </Badge>
          </div>
        )}

        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-background/80 backdrop-blur-md border border-border/50 hover:bg-white transition-all">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full h-9 w-9 bg-background/80 backdrop-blur-md border border-border/50 hover:bg-white transition-all">
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </motion.div>

      {galleryImages.length > 0 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 px-1">
          {galleryImages.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActiveImageIndex(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300",
                i === activeImageIndex
                  ? "border-primary ring-4 ring-primary/5 shadow-sm"
                  : "border-border/40 opacity-70 hover:opacity-100 hover:border-primary/30",
              )}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PublicProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const bringToFront = useCartStore((s) => s.bringToFront);
  const setSelectedProductIds = useCartStore((s) => s.setSelectedProductIds);
  const requireAuth = useRequireAuth();
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();
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
      void queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      router.push(`${msgRoute}?c=${conversation.id}`);
    },
  });

  if (isLoading) {
    return (
      <ConsumerLayout>
        <div className="container py-32 flex flex-col items-center justify-center gap-6">
          <div className="h-10 w-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium text-sm tracking-wide">Đang tải nông sản...</p>
        </div>
      </ConsumerLayout>
    );
  }

  if (!product) {
    return (
      <ConsumerLayout>
        <div className="container py-24 text-center space-y-6">
          <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <PackageCheck className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">Sản phẩm không còn hoặc đã gỡ bỏ.</p>
          <Link href="/marketplace">
            <Button variant="outline" className="rounded-full px-8 h-12 font-bold">
              Trở về chợ
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
    bringToFront(product.id);
    toast.success("Đã thêm!", {
      description: `${product.name} x${qty} trong giỏ của bạn.`,
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
    bringToFront(product.id);
    setSelectedProductIds([product.id]);
    router.push("/consumer/cart");
  };

  const messageFarmer = () => {
    if (!requireAuth({ guestMessage: "Đăng nhập để nhắn nông hộ" })) return;
    const peerUserId = product.shop.farm?.ownerUserId;
    if (!peerUserId) {
      toast.error("Không tìm thấy nông hộ gian hàng này");
      return;
    }
    openChatMutation.mutate(peerUserId);
  };

  const quantityStepper = (
    <div className="flex items-center rounded-xl border border-border/60 bg-muted/10 p-0.5 h-9">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-lg hover:bg-background transition-all shrink-0"
        onClick={() => setQty(Math.max(1, qty - 1))}
        disabled={qty <= 1}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-8 text-center text-xs font-black italic">{qty}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-lg hover:bg-background transition-all shrink-0"
        onClick={() => setQty(Math.min(stock || qty + 1, qty + 1))}
        disabled={qty >= stock}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );

  const showBuyingActions = isConsumer || !role;

  return (
    <ConsumerLayout>
      <div className="container max-w-7xl py-6 pb-48">
        {/* Header with Back Button */}
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-muted/30 hover:bg-muted transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest min-w-0">
            <Link href="/marketplace" className="hover:text-primary transition-colors shrink-0">Chợ</Link>
            <div className="h-1 w-1 rounded-full bg-muted-foreground/30 shrink-0" />
            <span className="truncate">{product.name}</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:grid lg:grid-cols-12 lg:gap-14 lg:items-start"
        >
          {/* Gallery Column */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <ProductImageGallery
              productName={product.name}
              imageUrl={product.imageUrl}
              isVerified={product.shop.isVerified}
            />

            <div className="hidden lg:block border border-dashed border-border/60 rounded-3xl p-5 bg-emerald-500/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Cam kết tươi sạch</p>
                  <p className="text-sm font-bold text-foreground/80">Canh tác chuẩn G.A.P, không chất bảo quản</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Column */}
          <div className="mt-8 lg:mt-0 lg:col-span-7 flex flex-col gap-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="h-6 px-2.5 rounded-lg bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-wider">
                    {product.unit || "Nông sản"}
                  </Badge>
                  {certs.length > 0 && certs.map(c => (
                    <Badge key={c} variant="outline" className="h-6 px-2.5 rounded-lg text-[9px] uppercase font-black text-muted-foreground border-border/60">
                      {c}
                    </Badge>
                  ))}
                </div>
                {/* Scaled down font size */}
                <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground/90 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6">
                  <ProductRatingBadge
                    averageRating={product.averageRating}
                    reviewCount={product.reviewCount}
                    size="sm"
                    emptyLabel="Chưa có đánh giá"
                  />
                  <div className="h-4 w-px bg-border/60" />
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    <PackageCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{stock > 0 ? `Còn ${stock} ${unitLabel}` : "Hết hàng"}</span>
                  </div>
                </div>
              </div>

              {/* Price Banner - Refined scaling */}
              <div className="bg-primary/[0.03] border border-primary/10 rounded-2xl md:rounded-[2rem] p-5 md:p-8 flex flex-wrap items-center justify-between gap-4 md:gap-6 relative overflow-hidden">
                <div className="space-y-0.5 md:space-y-1 relative z-10">
                  <p className="text-[8px] md:text-[10px] font-black uppercase text-primary/60 tracking-widest">Giá nông hộ</p>
                  <div className="flex items-baseline gap-1 md:gap-1.5">
                    <span className="text-3xl md:text-5xl font-black text-primary tracking-tighter leading-none">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-xs md:text-base font-black text-primary/60 tracking-tighter">đ</span>
                    <span className="text-[10px] md:text-sm font-bold text-muted-foreground ml-1">/ {unitLabel}</span>
                  </div>
                </div>

                {showBuyingActions && (
                  <div className="flex flex-col gap-3 w-full sm:w-auto relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest sm:hidden">Số lượng</span>
                      <div className="scale-90 md:scale-100 origin-left">
                        {quantityStepper}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8 pt-2">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-6 bg-primary rounded-full" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Thông tin sản phẩm</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 font-medium whitespace-pre-line pl-1">
                    {product.description || "Nhà vườn chưa mô tả chi tiết."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border/40 rounded-2xl p-4 bg-card flex items-start gap-3.5 group hover:border-primary/20 transition-all">
                    <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/5 transition-colors shrink-0">
                      <MapPin className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Canh tác tại</h3>
                      <p className="text-xs font-bold truncate">
                        {product.shop.farm?.province ? `${product.shop.farm.district ? `${product.shop.farm.district}, ` : ""}${product.shop.farm.province}` : "Đang cập nhật"}
                      </p>
                    </div>
                  </div>

                  {product.season && (
                    <div className="border border-border/40 rounded-2xl p-4 bg-card flex items-start gap-3.5 group hover:border-primary/20 transition-all">
                      <div className="p-2.5 bg-muted rounded-xl group-hover:bg-primary/5 transition-colors shrink-0">
                        <Calendar className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Vụ mùa & Chuẩn</h3>
                        <p className="text-xs font-bold truncate">{product.season.cropName} — {product.season.code}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {showBuyingActions && (
                <div className="hidden lg:grid grid-cols-2 gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-full border-primary/30 text-primary hover:bg-primary/[0.03] font-black uppercase tracking-widest text-[10px] gap-2.5 group"
                    onClick={addToCart}
                    disabled={outOfStock}
                  >
                    <ShoppingCart className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                    Cho vào giỏ hàng
                  </Button>
                  <Button
                    size="lg"
                    className="h-14 rounded-full font-black uppercase tracking-[0.2em] text-[10px] gap-2.5 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                    onClick={buyNow}
                    disabled={outOfStock}
                  >
                    <Zap className="h-4 w-4" />
                    Mua ngay
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Shop & Reviews */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-border/30 pt-16">
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-1 w-6 bg-foreground rounded-full" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Chủ vườn</h2>
            </div>

            <Card className="border-none shadow-[0_15px_40px_rgba(0,0,0,0.03)] rounded-[2rem] overflow-hidden bg-card/60 backdrop-blur-sm">
              <CardContent className="p-8 space-y-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-2xl font-black text-white shadow-lg ring-4 ring-primary/5">
                      {shopInitials(product.shop.name)}
                    </div>
                    {product.shop.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-background p-1 rounded-full shadow-md border-2 border-emerald-500">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Link href={`/shop/${product.shop.id}`} className="text-xl font-black hover:text-primary transition-colors block leading-tight">
                      {product.shop.name}
                    </Link>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                      {shopPanel?.updated_at ? `Hoạt động ${formatActivityAgo(shopPanel.updated_at)}` : "Hợp tác lâu năm"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
                  <div className="bg-background/40 p-4 text-center">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Uy tín</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-base font-black text-primary">{shopPanel?.average_rating?.toFixed(1) || "5.0"}</span>
                      <Star className="h-3 w-3 fill-primary text-primary" />
                    </div>
                  </div>
                  <div className="bg-background/40 p-4 text-center">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-50">Sản phẩm</p>
                    <span className="text-base font-black text-primary">{productTotal}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="default"
                    className="h-12 rounded-full font-black uppercase tracking-widest text-[9px] gap-2 shadow-sm"
                    disabled={!chatPeerId || openChatMutation.isPending}
                    onClick={messageFarmer}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Nhắn tin trao đổi
                  </Button>
                  <Link href={`/shop/${product.shop.id}`} className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-full border-border/60 hover:bg-muted font-black uppercase tracking-widest text-[9px] gap-2")}>
                    <Store className="h-3.5 w-3.5" />
                    Ghé thăm gian hàng
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-1 w-6 bg-amber-500 rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Khách hàng nhận xét</h2>
              </div>
              {!productReviewsQuery.isLoading && (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full">
                  {reviewMeta?.total || 0} Nhận xét
                </span>
              )}
            </div>

            <div className="space-y-4">
              {!productReviewsQuery.isLoading && reviewItems.length === 0 && (
                <div className="py-16 text-center space-y-4 border border-dashed border-border/60 rounded-3xl bg-muted/[0.02]">
                  <Star className="h-8 w-8 mx-auto opacity-20" />
                  <p className="text-xs text-muted-foreground font-bold italic">Chưa có đánh giá nào cho sản phẩm này.</p>
                </div>
              )}

              <div className="grid gap-3.5">
                <AnimatePresence mode="popLayout">
                  {reviewItems.map((r) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="border-none shadow-sm rounded-2xl bg-card transition-all hover:bg-muted/[0.03]">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                              {r.reviewer.avatarUrl ? (
                                <img src={r.reviewer.avatarUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-primary font-black uppercase text-[10px]">{(r.reviewer.fullName?.trim()?.[0] ?? "?")}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-bold text-sm tracking-tight">{r.reviewer.fullName || "Người mua ẩn danh"}</span>
                                {r.isVerifiedPurchase && (
                                  <div className="flex items-center gap-1 text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                    <CheckCircle2 className="h-2 w-2" />
                                    Chuẩn sản phẩm
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <ReviewStarsRow rating={r.rating} />
                                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-50">
                                  {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                              {r.comment && (
                                <p className="text-xs leading-relaxed text-foreground/80 font-medium italic pt-1.5">
                                  "{r.comment}"
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action */}
      {showBuyingActions && (
        <div className="fixed bottom-[56px] left-0 right-0 z-50 lg:hidden p-3 md:p-4 bg-background/95 backdrop-blur-xl border-t border-border/20 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <div className="container flex items-center gap-3">
            <div className="shrink-0 bg-muted/40 p-1 rounded-xl origin-left scale-90">
              {quantityStepper}
            </div>
            <Button
              className="flex-1 h-10 rounded-full font-black uppercase tracking-widest shadow-lg shadow-primary/10 text-[9px] gap-2 active:scale-95 transition-transform"
              onClick={buyNow}
              disabled={outOfStock}
            >
              <Zap className="h-3.5 w-3.5" />
              Mua ngay
            </Button>
          </div>
        </div>
      )}
    </ConsumerLayout>
  );
}
