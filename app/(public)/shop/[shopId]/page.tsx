"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
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
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { ProductRatingBadge } from "@/components/product/product-rating-badge";
import { CertificateBadge } from "@/components/certificate/CertificateBadge";
import { shopService } from "@/services/shop/shopService";
import { chatService } from "@/services/chat/chatService";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/useAuthStore";

const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

export default function PublicShopPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const role = useAuthStore((s) => s.user?.role);

  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => shopService.getShopById(shopId as string),
    enabled: !!shopId,
  });

  const productsQuery = useQuery({
    queryKey: ["shop-products-public", shopId],
    queryFn: () =>
      shopService.getPublicProducts({ shopId: shopId as string, limit: 60 }),
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
  const farmer = shop.farms?.owner_user_id;
  const region =
    shop.farms?.province || shop.farms?.district
      ? `${shop.farms?.district ? shop.farms.district + ", " : ""}${
          shop.farms?.province ?? ""
        }`
      : null;

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
      <div className="container py-4 pb-20 md:pb-8 max-w-4xl space-y-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Leaf className="h-8 w-8 text-primary" />
                <CertificateBadge
                  badges={shop.badges}
                  farmId={shop.farms?.id}
                  variant="corner"
                />
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
              <Link href={`/consumer/trace`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <QrCode className="h-3.5 w-3.5" /> Truy xuất
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <h2 className="font-bold text-base">Sản phẩm ({products.length})</h2>
        {productsQuery.isLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Chưa có sản phẩm
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="hover:border-primary/40 transition-colors h-full">
                  <div className="aspect-square bg-muted/50 rounded-t-lg overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Leaf className="h-10 w-10 text-primary/30" />
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
                      {formatPrice(product.price)}đ/{product.unit ?? "đơn vị"}
                    </p>
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

