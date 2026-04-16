"use client";

import Link from "next/link";
import { use, useState } from "react";
import {
    AlertTriangle,
    Minus,
    Plus,
    QrCode,
    ShieldCheck,
    ShoppingCart,
    Star,
    User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { currentFarmer } from "@/data/mockData";
import { products, reviews } from "@/data/marketplaceData";

interface ProductDetailPageProps {
    params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { productId } = use(params);
    const product = products.find((item) => item.id === productId);
    const productReviews = reviews.filter((item) => item.productId === productId);
    const [quantity, setQuantity] = useState(1);

    if (!product) {
        return (
            <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center sm:px-6 lg:px-8">
                <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
            </div>
        );
    }

    const avgRating = productReviews.length
        ? (productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length).toFixed(1)
        : "Chưa có";

    const addToCart = () => {
        const cart = JSON.parse(window.localStorage.getItem("cart") || "[]");
        const existing = cart.find((item: { productId: string }) => item.productId === product.id);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                productId: product.id,
                productName: product.name,
                price: product.price,
                unit: product.unit,
                quantity,
            });
        }

        window.localStorage.setItem("cart", JSON.stringify(cart));
        toast.success("Đã thêm vào giỏ hàng", {
            description: `${product.name} x${quantity}`,
        });
    };

    return (
        <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8">
                <div className="relative flex h-56 items-center justify-center rounded-xl bg-accent">
                    <span className="text-6xl">
                        {product.name.includes("Rau") ? "🥬" : product.name.includes("Cà") ? "🍅" : "🥒"}
                    </span>

                    {product.verified && (
                        <Badge className="absolute right-3 top-3 gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Blockchain
                        </Badge>
                    )}

                    {product.quarantine && (
                        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 rounded-b-xl bg-warning/90 px-3 py-2 text-sm font-semibold text-warning-foreground">
                            <AlertTriangle className="h-4 w-4" />
                            Đang cách ly thuốc — còn {product.quarantineDaysLeft} ngày
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-bold">{product.name}</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-primary">
                            {product.price.toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-sm text-muted-foreground">/{product.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={product.stock > 0 ? "bg-secondary text-secondary-foreground hover:bg-secondary" : "bg-destructive text-destructive-foreground hover:bg-destructive"}>
                            {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                            {avgRating} ({productReviews.length} đánh giá)
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                </div>

                <Link href="/farmer/profile">
                    <Card className="transition-colors hover:border-primary/40">
                        <CardContent className="flex items-center gap-3 p-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{currentFarmer.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{currentFarmer.farmName}</p>
                            </div>
                            <div className="flex gap-1">
                                {currentFarmer.certifications.map((certification) => (
                                    <Badge key={certification} className="border border-border bg-white text-[10px] text-foreground hover:bg-white">
                                        {certification}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold">{quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        className="h-12 flex-1 gap-2 font-semibold"
                        disabled={product.stock === 0 || product.quarantine}
                        onClick={addToCart}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        {product.quarantine ? "Đang cách ly" : product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                    </Button>

                    <Button variant="outline" size="icon" className="h-12 w-12">
                        <QrCode className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-bold">Đánh giá ({productReviews.length})</h2>

                    {productReviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Chưa có đánh giá nào</p>
                    ) : (
                        productReviews.map((review) => (
                            <Card key={review.id}>
                                <CardContent className="space-y-2 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">{review.userName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                                        </span>
                                    </div>

                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={`${review.id}-${index}`}
                                                className={`h-4 w-4 ${index < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                                            />
                                        ))}
                                    </div>

                                    <p className="text-sm">{review.comment}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
        </div>
    );
}
