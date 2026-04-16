"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ShieldCheck, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/data/marketplaceData";

export default function FarmerMarketplacePage() {
    const [cartCount] = useState(() => {
        if (typeof window === "undefined") {
            return 0;
        }

        const cart = JSON.parse(window.localStorage.getItem("cart") || "[]");
        return cart.length;
    });

    return (
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Gian hàng</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="relative gap-1.5">
                            <ShoppingCart className="h-4 w-4" />
                            Giỏ hàng
                            {cartCount > 0 && (
                                <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
                                    {cartCount}
                                </Badge>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <Link key={product.id} href={`/farmer/marketplace/${product.id}`}>
                            <Card className="cursor-pointer overflow-hidden transition-colors hover:border-primary/40">
                                <div className="relative flex h-40 items-center justify-center bg-accent">
                                    <span className="text-4xl">
                                        {product.name.includes("Rau")
                                            ? "🥬"
                                            : product.name.includes("Cà")
                                                ? "🍅"
                                                : "🥒"}
                                    </span>

                                    <div className="absolute right-2 top-2 flex gap-1">
                                        {product.verified && (
                                            <Badge className="gap-1 text-xs">
                                                <ShieldCheck className="h-3 w-3" />
                                                Blockchain
                                            </Badge>
                                        )}
                                    </div>

                                    {product.quarantine && (
                                        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 bg-warning/90 px-3 py-1.5 text-xs font-semibold text-warning-foreground">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Đang cách ly thuốc — còn {product.quarantineDaysLeft} ngày
                                        </div>
                                    )}
                                </div>

                                <CardContent className="space-y-3 p-4">
                                    <div>
                                        <h3 className="text-base font-bold">{product.name}</h3>
                                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-lg font-bold text-primary">
                                                {product.price.toLocaleString("vi-VN")}đ
                                            </p>
                                            <p className="text-xs text-muted-foreground">/{product.unit}</p>
                                        </div>
                                        <Badge className={product.stock > 0 ? "bg-secondary text-secondary-foreground hover:bg-secondary" : "bg-destructive text-destructive-foreground hover:bg-destructive"}>
                                            {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
        </div>
    );
}
