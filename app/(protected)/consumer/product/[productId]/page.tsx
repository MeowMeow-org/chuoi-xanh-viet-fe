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
  QrCode,
  Minus,
  Plus,
  ShoppingCart,
  MapPin,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { shopService } from "@/services/shop/shopService";
import { chatService } from "@/services/chat/chatService";
import { useCartStore } from "@/store/useCartStore";

const formatPrice = (price: number | string) => {
  const num = typeof price === "string" ? Number(price) : price;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const toNumber = (v: number | string | null | undefined) => {
  if (v === null || v === undefined) return 0;
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num : 0;
};

export default function ConsumerProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ["public-product", productId],
    queryFn: () => shopService.getPublicProductById(productId as string),
    enabled: !!productId,
  });

  const openChatMutation = useMutation({
    mutationFn: (peerUserId: string) => chatService.openConversation(peerUserId),
    onSuccess: (conversation) => {
      router.push(`/consumer/messages?c=${conversation.id}`);
    },
  });

  if (isLoading) {
    return (
      <ConsumerLayout>
        <div className="container py-20 flex items-center justify-center">
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
          <Link href="/consumer/marketplace">
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
  const certs = (product.shop.certifications as string[] | null) ?? [];

  const addToCart = () => {
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

  const messageFarmer = () => {
    const peerUserId = product.shop.farm?.ownerUserId;
    if (!peerUserId) {
      toast.error("Không tìm thấy nông dân của gian hàng này");
      return;
    }
    openChatMutation.mutate(peerUserId);
  };

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-24 md:pb-8 max-w-2xl space-y-4">
        <div className="aspect-square bg-muted/50 rounded-xl overflow-hidden flex items-center justify-center relative">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Leaf className="h-16 w-16 text-primary/20" />
          )}
          {product.shop.isVerified && (
            <Badge className="absolute top-3 left-3 gap-1">
              <ShieldCheck className="h-3 w-3" /> Đã xác minh nguồn gốc
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="text-2xl font-extrabold text-primary">
            {formatPrice(product.price)}đ{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {product.unit ?? "đơn vị"}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {outOfStock ? "Hết hàng" : `Còn ${stock.toLocaleString("vi-VN")} ${product.unit ?? ""}`}
          </p>
        </div>

        <Link href={`/consumer/shop/${product.shop.id}`}>
          <Card className="hover:border-primary/40 transition-colors">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{product.shop.name}</p>
                {product.shop.farm?.province && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {product.shop.farm.district
                      ? `${product.shop.farm.district}, `
                      : ""}
                    {product.shop.farm.province}
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-wrap justify-end">
                {certs.map((c) => (
                  <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">
                    {c}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>

        {product.shop.farm?.ownerUserId && (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={messageFarmer}
            disabled={openChatMutation.isPending}
          >
            <MessageSquare className="h-4 w-4" />
            {openChatMutation.isPending ? "Đang mở..." : "Nhắn nông dân"}
          </Button>
        )}

        <Link href="/consumer/trace">
          <Card className="border-primary/30 hover:border-primary/50 transition-colors mt-3">
            <CardContent className="p-3 flex items-center gap-3">
              <QrCode className="h-8 w-8 text-primary" />
              <div>
                <p className="font-bold text-sm">Truy xuất nguồn gốc</p>
                <p className="text-xs text-muted-foreground">
                  Xem nhật ký canh tác, vị trí, chứng nhận
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-4 space-y-2">
            <h3 className="font-bold text-sm">Mô tả sản phẩm</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description ?? "Chưa có mô tả"}
            </p>
          </CardContent>
        </Card>

        {product.season && (
          <Card>
            <CardContent className="p-4 space-y-1">
              <h3 className="font-bold text-sm">Thông tin mùa vụ</h3>
              <p className="text-xs text-muted-foreground">
                Mã: <span className="font-medium text-foreground">{product.season.code}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Cây trồng:{" "}
                <span className="font-medium text-foreground">{product.season.cropName}</span>
              </p>
            </CardContent>
          </Card>
        )}

        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-card border-t p-3 z-40">
          <div className="container max-w-2xl flex items-center gap-3">
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-10 text-center font-bold">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQty(Math.min(stock || qty + 1, qty + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="flex-1 h-12 text-base font-bold gap-2"
              onClick={addToCart}
              disabled={outOfStock}
            >
              <ShoppingCart className="h-5 w-5" />
              {outOfStock ? "Hết hàng" : "Thêm vào giỏ"}
            </Button>
          </div>
        </div>
      </div>
    </ConsumerLayout>
  );
}
