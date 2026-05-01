"use client";

import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  ShieldCheck,
  MapPin,
  QrCode,
  Loader2,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { CertificateBadge } from "@/components/certificate/CertificateBadge";
import { shopService } from "@/services/shop/shopService";
import { chatService } from "@/services/chat/chatService";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/useAuthStore";

const LIMIT = 12;

const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

function buildPageNumbers(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (page > 3) pages.push("...");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
  if (page < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export default function PublicShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requireAuth = useRequireAuth();
  const role = useAuthStore((s) => s.user?.role);
  const queryClient = useQueryClient();

  const page = Number(searchParams.get("page") ?? "1") || 1;

  const setPage = useCallback((p: number) => {
    const params = new URLSearchParams(window.location.search);
    if (p <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname]);

  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => shopService.getShopById(shopId as string),
    enabled: !!shopId,
  });

  const productsQuery = useQuery({
    queryKey: ["shop-products-public", shopId, page],
    queryFn: () =>
      shopService.getPublicProducts({ shopId: shopId as string, page, limit: LIMIT }),
    enabled: !!shopId,
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

  if (shopQuery.isLoading) {
    return (
      <ConsumerLayout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ConsumerLayout>
    );
  }

  const shop = shopQuery.data;
  if (!shop) {
    return (
      <ConsumerLayout>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Không tìm thấy gian hàng</p>
          <Link href="/marketplace">
            <Button variant="outline" className="mt-4">
              Quay lại chợ
            </Button>
          </Link>
        </div>
      </ConsumerLayout>
    );
  }

  const certs = Array.isArray(shop.certifications)
    ? (shop.certifications as string[])
    : [];
  const products = productsQuery.data?.items ?? [];
  const totalPages = productsQuery.data?.meta?.totalPages ?? 1;
  const totalProducts = productsQuery.data?.meta?.total ?? products.length;
  const farmer = shop.farms?.owner_user_id;
  const region =
    shop.farms?.province || shop.farms?.district
      ? `${shop.farms?.district ? shop.farms.district + ", " : ""}${
          shop.farms?.province ?? ""
        }`
      : null;

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = buildPageNumbers(page, totalPages);

  const messageFarmer = () => {
    if (!requireAuth({ guestMessage: "Đăng nhập để nhắn nông hộ" })) return;
    if (!farmer) {
      toast.error("Không tìm thấy nông hộ");
      return;
    }
    openChatMutation.mutate(farmer);
  };

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 max-w-5xl space-y-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {shop.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shop.avatar_url}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Leaf className="h-8 w-8 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h1 className="font-bold text-lg">{shop.name}</h1>
                <ProductRatingBadge
                  averageRating={shop.average_rating}
                  reviewCount={shop.review_count}
                  size="sm"
                  className="block"
                />
                {region && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {region}
                  </div>
                )}
                {shop.is_verified && (
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheck className="h-3 w-3" /> Đã xác minh
                  </Badge>
                )}
              </div>
            </div>
            <CertificateBadge
              badges={shop.badges}
              farmId={shop.farms?.id}
              variant="row"
            />
            {shop.description && (
              <p className="line-clamp-2 min-w-0 w-full break-words text-sm text-muted-foreground">
                {shop.description}
              </p>
            )}
            {certs.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {certs.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1">
                    <ShieldCheck className="h-3 w-3" /> {c}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={messageFarmer}
                disabled={openChatMutation.isPending || !farmer}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Nhắn nông hộ
              </Button>
              <Link href="/truy-xuat">
                <Button variant="outline" size="sm" className="gap-1">
                  <QrCode className="h-3.5 w-3.5" /> Truy xuất
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Products header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base">
            Sản phẩm
            {!productsQuery.isLoading && (
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                ({totalProducts.toLocaleString("vi-VN")})
              </span>
            )}
          </h2>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                Trang{" "}
                <span className="font-semibold text-primary">{page}</span>
                /{totalPages}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Products grid */}
        {productsQuery.isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Chưa có sản phẩm
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ${productsQuery.isFetching ? "opacity-50" : ""}`}>
              {products.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="group hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 h-full overflow-hidden">
                    <div className="aspect-square bg-muted/50 overflow-hidden relative">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/5">
                          <Leaf className="h-10 w-10 text-primary/30" />
                        </div>
                      )}
                      {typeof product.rankScore === "number" &&
                        product.rankScore >= 0.55 && (
                          <div className="absolute left-2 top-2">
                            <Badge
                              variant="secondary"
                              className="gap-0.5 bg-amber-500/95 text-white border-0 text-[10px] px-1.5 py-0 shadow-sm"
                            >
                              <Sparkles className="h-3 w-3" />
                              Nổi bật
                            </Badge>
                          </div>
                        )}
                    </div>
                    <CardContent className="p-3 space-y-1.5">
                      <p className="font-semibold text-sm line-clamp-1">
                        {product.name}
                      </p>
                      <ProductRatingBadge
                        averageRating={product.averageRating}
                        reviewCount={product.reviewCount}
                        size="xs"
                      />
                      <p className="text-primary font-bold text-sm">
                        {formatPrice(product.price)}đ
                        <span className="font-normal text-muted-foreground text-xs">
                          /{product.unit ?? "đơn vị"}
                        </span>
                      </p>
                      {(product.saleUnit || product.stockQty != null) && (
                        <p className="text-[11px] text-muted-foreground">
                          {product.saleUnit && (
                            <span className="font-medium text-foreground/80">
                              {product.saleUnit.shortCode ?? product.saleUnit.code}
                            </span>
                          )}
                          {product.saleUnit && product.stockQty != null && " · "}
                          {product.stockQty != null && (
                            <span>
                              Còn {Number(product.stockQty).toLocaleString("vi-VN")}
                              {product.unit ? ` ${product.unit}` : ""}
                            </span>
                          )}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={p}
                      size="icon"
                      variant={p === page ? "default" : "outline"}
                      className="h-8 w-8 text-sm"
                      onClick={() => goToPage(p as number)}
                    >
                      {p}
                    </Button>
                  ),
                )}
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </ConsumerLayout>
  );
}
