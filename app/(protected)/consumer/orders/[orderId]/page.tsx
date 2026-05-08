"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import {
  OrderStarsDisplay,
  ProductReviewDialog,
} from "@/components/consumer/shop-review-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  Package,
  Star,
  XCircle,
  Truck,
  MapPin,
  CreditCard,
  ShoppingBag,
  Calendar,
  Store,
  Phone,
  User,
  ExternalLink,
  MessageSquare,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { orderService } from "@/services/order/orderService";
import type { Order, OrderItem, OrderStatus } from "@/services/order";

const statusMap: Record<OrderStatus, { label: string; color: string; icon: LucideIcon }> = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    icon: Calendar
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: Package
  },
  shipping: {
    label: "Đang giao",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    icon: Truck
  },
  delivered: {
    label: "Đã giao",
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    icon: ShoppingBag
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    icon: XCircle
  },
};

const paymentLabel: Record<string, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  vnpay: "Thanh toán qua VNPay Online",
  payos: "Thanh toán qua PayOS Online",
};

const paymentStatusLabel: Record<string, string> = {
  pending: "Đang chờ thanh toán",
  paid: "Đã hoàn tất thanh toán",
  failed: "Giao dịch thất bại",
  refunded: "Đã hoàn trả tiền",
};

const formatNumber = (v: number | string) => {
  const num = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(num) ? num.toLocaleString("vi-VN") : "0";
};

const SHIPPING_FEE = 15000;

function formatPayosCountdown(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ConsumerOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params.orderId as string;
  const queryClient = useQueryClient();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);
  const [payosQrSrc, setPayosQrSrc] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(orderId),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });

  const resumePayosMutation = useMutation({
    mutationFn: () => orderService.getPayosResume(orderId),
    onSuccess: (payload) => {
      const url = payload.checkoutUrl?.trim();
      if (url) {
        window.location.replace(url);
        return;
      }
      const qr = payload.qrCode?.trim();
      if (qr) {
        const src =
          qr.startsWith("http") || qr.startsWith("data:")
            ? qr
            : `data:image/png;base64,${qr}`;
        setPayosQrSrc(src);
        return;
      }
      toast.error("Không lấy được link hoặc mã QR thanh toán", {
        description: "Vui lòng thử lại sau.",
      });
    },
  });

  const renewPayosMutation = useMutation({
    mutationFn: () => orderService.renewPayosPayment(orderId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      const url = data.checkoutUrl?.trim();
      if (url) {
        window.location.replace(url);
        return;
      }
      toast.error("Không nhận được link thanh toán mới", {
        description: "Vui lòng thử lại sau.",
      });
    },
  });

  useEffect(() => {
    const payosPending =
      order?.paymentMethod === "payos" &&
      order?.paymentStatus === "pending" &&
      order?.status === "pending";
    if (!payosPending || !order?.payosLinkExpiresAt) return;
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [
    order?.paymentMethod,
    order?.paymentStatus,
    order?.status,
    order?.payosLinkExpiresAt,
  ]);

  if (isLoading) {
    return (
      <ConsumerLayout>
        <div className="container py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-muted-foreground animate-pulse">Đang tải thông tin đơn hàng...</p>
        </div>
      </ConsumerLayout>
    );
  }

  if (isError || !order) {
    return (
      <ConsumerLayout>
        <div className="container py-24 max-w-lg mx-auto text-center space-y-6">
          <div className="bg-rose-50 dark:bg-rose-900/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="h-10 w-10 text-rose-500/50" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Không tìm thấy đơn hàng</h2>
            <p className="text-muted-foreground">Có lỗi xảy ra hoặc đơn hàng này không tồn tại trong hệ thống.</p>
          </div>
          <Button
            onClick={() => router.push("/consumer/orders")}
            className="rounded-full px-8"
          >
            Quay lại danh sách
          </Button>
        </div>
      </ConsumerLayout>
    );
  }

  const status = statusMap[order.status];
  const total = Number(order.totalAmount) + SHIPPING_FEE;
  const isPending = order.status === "pending";
  const isDelivered = order.status === "delivered";
  const StatusIcon = status.icon;

  const canResumePayos =
    order.paymentMethod === "payos" &&
    order.paymentStatus === "pending" &&
    isPending;

  const payosExpiresMs = order.payosLinkExpiresAt
    ? new Date(order.payosLinkExpiresAt).getTime()
    : null;
  const payosRemainingSec =
    payosExpiresMs != null
      ? Math.max(0, Math.floor((payosExpiresMs - nowTick) / 1000))
      : null;
  const payosLinkExpiredByClock =
    payosExpiresMs != null && nowTick >= payosExpiresMs;

  return (
    <ConsumerLayout>
      <div className="container py-8 pb-32 max-w-3xl mx-auto space-y-8 px-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-muted/30 hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Chi tiết đơn</h1>
              <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                <span className="text-[10px] md:text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground truncate max-w-[150px] md:max-w-none">
                  #{order.id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={cn("px-3 py-1 md:px-4 md:py-2 text-[10px] md:text-sm font-bold rounded-full border shadow-sm", status.color)}>
              <StatusIcon className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
              {status.label}
            </Badge>
          </div>
        </motion.div>

        <div className="grid gap-6">
          {/* Shop Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
              <div className="bg-primary/5 p-4 md:p-6 flex items-center justify-between border-b border-primary/10">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="bg-white dark:bg-muted p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm border border-primary/10 shrink-0">
                    <Store className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm md:text-lg truncate">{order.shop?.name ?? "Gian hàng"}</h3>
                    <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
                      <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground font-medium">
                        <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>
                {order.shop && (
                  <Link
                    href={`/shop/${order.shop.id}`}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                      "rounded-full gap-1.5 md:gap-2 font-semibold text-[10px] md:text-xs h-8 md:h-9 px-3 md:px-4 shrink-0"
                    )}
                  >
                    Gian hàng
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <CardContent className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Phương thức thanh toán</p>
                      <p className="text-sm font-medium">{paymentLabel[order.paymentMethod] ?? order.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-lg">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Trạng thái thanh toán</p>
                      <p className={cn(
                        "text-sm font-bold",
                        order.paymentStatus === 'paid' ? "text-emerald-600" : "text-amber-600"
                      )}>
                        {paymentStatusLabel[order.paymentStatus] ?? order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>
                {canResumePayos && (
                  <div className="mt-5 pt-5 border-t border-border/60 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Nếu bạn đã thoát khỏi PayOS hoặc chưa thanh toán, dùng các nút bên dưới
                      (cần đăng nhập đúng tài khoản đặt đơn). Link thanh toán có hiệu lực trong{" "}
                      <strong>15 phút</strong> kể từ khi tạo.
                    </p>
                    {order.payosLinkExpiresAt && payosRemainingSec !== null && (
                      <p
                        className={cn(
                          "text-xs font-medium",
                          payosLinkExpiredByClock
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {payosLinkExpiredByClock ? (
                          <>Link thanh toán đã hết hạn — tạo link mới để tiếp tục.</>
                        ) : (
                          <>
                            Còn lại:{" "}
                            <span className="tabular-nums font-mono">
                              {formatPayosCountdown(payosRemainingSec)}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                    {!payosLinkExpiredByClock ? (
                      <Button
                        type="button"
                        className="w-full sm:w-auto rounded-full font-bold gap-2"
                        disabled={
                          resumePayosMutation.isPending || renewPayosMutation.isPending
                        }
                        onClick={() => resumePayosMutation.mutate()}
                      >
                        {resumePayosMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang lấy link thanh toán…
                          </>
                        ) : (
                          <>
                            <Wallet className="h-4 w-4" />
                            Thanh toán PayOS
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto rounded-full font-bold gap-2"
                        disabled={
                          renewPayosMutation.isPending || resumePayosMutation.isPending
                        }
                        onClick={() => renewPayosMutation.mutate()}
                      >
                        {renewPayosMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tạo link mới…
                          </>
                        ) : (
                          <>
                            <Wallet className="h-4 w-4" />
                            Tạo link thanh toán mới
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
              <div className="p-4 md:p-6 border-b bg-muted/20">
                <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                  <Truck className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Thông tin giao hàng
                </h3>
              </div>
              <CardContent className="p-4 md:p-6 grid sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4 md:space-y-6">
                  <div className="flex gap-3 md:gap-4">
                    <div className="bg-muted p-1.5 md:p-2 h-fit rounded-full shrink-0">
                      <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1 min-w-0">
                      <p className="text-[8px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Người nhận</p>
                      <p className="text-sm md:text-base font-semibold truncate">{order.shippingName ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 md:gap-4">
                    <div className="bg-muted p-1.5 md:p-2 h-fit rounded-full shrink-0">
                      <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1 min-w-0">
                      <p className="text-[8px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Số điện thoại</p>
                      <p className="text-sm md:text-base font-semibold truncate">{order.shippingPhone ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 md:space-y-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="flex gap-3 md:gap-4">
                    <div className="bg-muted p-1.5 md:p-2 h-fit rounded-full shrink-0">
                      <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[8px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Địa chỉ nhận</p>
                      <p className="text-sm md:text-base font-semibold leading-relaxed line-clamp-3">{order.shippingAddress ?? "—"}</p>
                    </div>
                  </div>
                  {order.note && (
                    <div className="flex gap-3 md:gap-4">
                      <div className="bg-muted p-1.5 md:p-2 h-fit rounded-full shrink-0">
                        <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        <p className="text-[8px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Ghi chú</p>
                        <p className="text-xs md:text-sm font-medium italic text-muted-foreground line-clamp-2">
                          <q className="font-[inherit] not-italic">{order.note}</q>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Products List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-xl shadow-black/5 overflow-hidden">
              <div className="p-4 md:p-6 border-b bg-muted/20">
                <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Danh sách sản phẩm
                </h3>
              </div>
              <CardContent className="p-0">
                <div className="divide-y">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="group p-4 md:p-6 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="relative h-16 w-16 md:h-24 md:w-24 rounded-xl md:rounded-2xl bg-white dark:bg-muted overflow-hidden shrink-0 shadow-sm border border-border/50">
                          {item.product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote product URLs
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Package className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/20" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col gap-1 md:gap-2">
                          <Link
                            href={`/product/${item.productId}`}
                            className="font-bold text-sm md:text-lg hover:text-primary transition-colors line-clamp-1 leading-tight"
                          >
                            {item.product.name}
                          </Link>
                          <div className="flex items-center gap-3">
                            <div className="text-[10px] md:text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-medium">
                              {formatNumber(item.unitPrice)}đ × {formatNumber(item.qty)} {item.product.unit ?? ""}
                            </div>
                          </div>
                          <div className="sm:hidden mt-1">
                            <span className="text-sm font-black text-primary">
                              {formatNumber(item.lineTotal)}đ
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:block text-right shrink-0">
                          <span className="text-xl font-black text-primary">
                            {formatNumber(item.lineTotal)}đ
                          </span>
                        </div>
                      </div>

                      {isDelivered && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 md:gap-4 sm:pl-28 lg:pl-[120px]">
                          {item.myReview ? (
                            <div className="flex items-center gap-2.5 md:gap-3 bg-emerald-50 dark:bg-emerald-950/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-emerald-100 dark:border-emerald-900/30">
                              <span className="text-[8px] md:text-xs font-bold text-emerald-700 dark:text-emerald-400 shrink-0">Đánh giá của bạn:</span>
                              <div className="scale-75 md:scale-100 origin-left">
                                <OrderStarsDisplay rating={item.myReview.rating} />
                              </div>
                              <button
                                onClick={() => {
                                  setReviewTarget({ order, item });
                                  setReviewOpen(true);
                                }}
                                className="text-[10px] md:text-xs font-bold text-emerald-700 hover:underline border-l border-emerald-200 pl-2.5 md:pl-3 ml-1 shrink-0"
                              >
                                Sửa
                              </button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-2 h-8 md:h-10 px-4 md:px-6 rounded-full bg-primary/10 text-primary border-none hover:bg-primary/20 font-bold text-[10px] md:text-xs"
                              onClick={() => {
                                setReviewTarget({ order, item });
                                setReviewOpen(true);
                              }}
                            >
                              <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-primary" />
                              Đánh giá sản phẩm
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="bg-muted/10 p-6 sm:p-8 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Tạm tính (hàng hóa)</span>
                  <span className="font-bold">{formatNumber(order.totalAmount)}đ</span>
                </div>
                <div className="flex justify-between text-sm pb-4 border-b">
                  <span className="text-muted-foreground font-medium">Phí giao hàng (ước tính)</span>
                  <span className="font-bold text-emerald-600">+{SHIPPING_FEE.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Tổng cộng</span>
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Đã bao gồm các loại thuế phí</span>
                  </div>
                  <span className="text-2xl md:text-4xl font-black tracking-tighter text-primary">
                    {total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-3 md:gap-4 pt-4"
          >
            {isPending && (
              <Button
                variant="ghost"
                size="lg"
                className="rounded-full px-6 md:px-8 h-12 md:h-14 font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all border-none text-xs md:text-base"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                {cancelMutation.isPending ? "Đang hủy..." : "Hủy đơn hàng"}
              </Button>
            )}
            <Link
              href="/consumer/orders"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-full px-6 md:px-8 h-12 md:h-14 font-bold border-2 hover:bg-muted transition-all shadow-sm text-xs md:text-base"
              )}
            >
              Quay lại danh sách
            </Link>
          </motion.div>
        </div>
      </div>

      <ProductReviewDialog
        order={reviewTarget?.order ?? null}
        item={reviewTarget?.item ?? null}
        open={reviewOpen}
        onOpenChange={(open) => {
          setReviewOpen(open);
          if (!open) setReviewTarget(null);
        }}
        queryClient={queryClient}
      />

      <Dialog
        open={payosQrSrc !== null}
        onOpenChange={(open) => {
          if (!open) setPayosQrSrc(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mã QR thanh toán</DialogTitle>
          </DialogHeader>
          {payosQrSrc && (
            // eslint-disable-next-line @next/next/no-img-element -- data URL / PayOS payload
            <img
              src={payosQrSrc}
              alt="Mã QR PayOS"
              className="mx-auto max-h-[min(70vh,360px)] w-auto rounded-lg border"
            />
          )}
        </DialogContent>
      </Dialog>
    </ConsumerLayout>
  );
}


