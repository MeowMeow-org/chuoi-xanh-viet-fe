"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AddressPicker,
  emptyAddressPickerValue,
  type AddressPickerValue,
} from "@/components/address/AddressPicker";
import {
  ShoppingBag,
  CreditCard,
  Banknote,
  Wallet,
  Store,
  Loader2,
  MapPin,
  Phone,
  User,
  StickyNote,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Truck
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import {
  groupCartByShop,
  useCartStore,
} from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { orderService } from "@/services/order/orderService";
import type { PaymentMethod } from "@/services/order";
import { cn } from "@/lib/utils";

const SHIPPING_FEE_PER_SHOP = 15000;

const paymentMethods: Array<{
  id: PaymentMethod;
  label: string;
  hint?: string;
  icon: typeof Banknote;
}> = [
    { id: "cod", label: "Tiền mặt khi nhận (COD)", icon: Banknote },
    {
      id: "vnpay",
      label: "Ví điện tử VNPay",
      hint: "Thẻ ATM, Tài khoản ngân hàng, QR Code",
      icon: CreditCard,
    },
    {
      id: "payos",
      label: "Cổng thanh toán PayOS",
      hint: "Chuyển khoản QR siêu tốc 24/7",
      icon: Wallet,
    },
  ];

export default function ConsumerCheckoutPage() {
  const router = useRouter();
  const allItems = useCartStore((s) => s.items);
  const selectedProductIds = useCartStore((s) => s.selectedProductIds);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clear);
  const removeByShop = useCartStore((s) => s.removeByShop);
  const user = useAuthStore((s) => s.user);

  const items = selectedProductIds.length > 0
    ? allItems.filter((i) => selectedProductIds.includes(i.productId))
    : allItems;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [addressPicker, setAddressPicker] = useState<AddressPickerValue>(
    emptyAddressPickerValue(),
  );
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [ordered, setOrdered] = useState(false);

  const composedShippingAddress = useMemo(() => {
    const parts = [
      addressDetail,
      addressPicker.wardName,
      addressPicker.districtName,
      addressPicker.provinceName,
    ]
      .map((v) => v?.trim())
      .filter((v): v is string => Boolean(v && v.length > 0));
    return parts.join(", ");
  }, [
    addressDetail,
    addressPicker.wardName,
    addressPicker.districtName,
    addressPicker.provinceName,
  ]);

  const groups = groupCartByShop(items);
  const shippingFee = groups.length * SHIPPING_FEE_PER_SHOP;
  const displayName = useMemo(
    () => (name.length > 0 ? name : user?.fullName ?? ""),
    [name, user?.fullName],
  );
  const displayPhone = useMemo(
    () => (phone.length > 0 ? phone : user?.phone ?? ""),
    [phone, user?.phone],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const tasks = groups.map(async (group) => {
        try {
          await orderService.createOrder({
            shopId: group.shopId,
            items: group.items.map((i) => ({
              productId: i.productId,
              qty: i.quantity,
            })),
            shippingName: displayName.trim(),
            shippingPhone: displayPhone.trim(),
            shippingAddress: composedShippingAddress,
            shippingProvinceCode: addressPicker.provinceCode,
            shippingDistrictCode: addressPicker.districtCode,
            shippingWardCode: addressPicker.wardCode,
            shippingProvinceName: addressPicker.provinceName || undefined,
            shippingDistrictName: addressPicker.districtName || undefined,
            shippingWardName: addressPicker.wardName || undefined,
            shippingDetail: addressDetail.trim() || undefined,
            paymentMethod: payment,
            note: note.trim() || undefined,
          });
          return {
            shopId: group.shopId,
            shopName: group.shopName,
            success: true,
          };
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Đặt đơn thất bại";
          return {
            shopId: group.shopId,
            shopName: group.shopName,
            success: false,
            error: msg,
          };
        }
      });
      return Promise.all(tasks);
    },
    onSuccess: async (results) => {
      const failed = results.filter((r) => !r.success);
      const successCount = results.length - failed.length;
      const successGroups = results.filter((r) => r.success);

      if (failed.length === 0) {
        toast.success("Hệ thống đã ghi nhận đơn hàng!", {
          description: `Đã tạo ${successCount} đơn hàng thành công.`,
        });

        // Remove items from cart only for successful orders
        successGroups.forEach((g) => removeByShop(g.shopId));

        if (items.length === allItems.length) {
          clearCart();
        }

        // Add a slight delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 800));
        setOrdered(true);
      } else if (successCount === 0) {
        toast.error("Không thể hoàn tất đặt hàng", {
          description: failed[0]?.error ?? "Vui lòng kiểm tra lại",
        });
      } else {
        toast.warning("Một số đơn hàng gặp sự cố", {
          description: `Đã đặt ${successCount} đơn. Lỗi: ${failed[0]?.shopName}`,
        });

        successGroups.forEach((g) => removeByShop(g.shopId));

        await new Promise((resolve) => setTimeout(resolve, 800));
        setOrdered(true);
      }
    },
  });

  useEffect(() => {
    if (hasHydrated && items.length === 0 && !ordered && !mutation.isPending) {
      router.replace("/consumer/cart");
    }
  }, [hasHydrated, items.length, ordered, router, mutation.isPending]);

  const placeOrder = () => {
    if (!displayName.trim() || !displayPhone.trim()) {
      toast.error("Vui lòng hoàn thiện thông tin giao hàng còn thiếu");
      return;
    }
    if (
      addressPicker.provinceCode == null ||
      addressPicker.districtCode == null ||
      addressPicker.wardCode == null
    ) {
      toast.error("Vui lòng chọn đầy đủ tỉnh/quận/phường");
      return;
    }
    if (!addressDetail.trim()) {
      toast.error("Vui lòng nhập số nhà / đường để shipper dễ tìm");
      return;
    }
    mutation.mutate();
  };

  if (!hasHydrated) {
    return (
      <ConsumerLayout>
        <div className="container py-32 flex flex-col items-center justify-center gap-6">
          <div className="h-10 w-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium text-sm tracking-wide">Đang tải thông tin thanh toán...</p>
        </div>
      </ConsumerLayout>
    );
  }

  return (
    <ConsumerLayout>
      <AnimatePresence mode="wait">
        {!ordered ? (
          <motion.div
            key="checkout-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="container py-6 md:py-10 pb-40 md:pb-12 space-y-6 md:space-y-10 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-muted/30 hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Thanh toán
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              <div className="lg:col-span-7 space-y-10">
                {/* Delivery Info */}
                <section className="space-y-5 md:space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
                      <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                      Thông tin nhận hàng
                    </h2>
                  </div>
                  <Card className="border border-border/40 shadow-sm rounded-3xl bg-card/50 overflow-hidden">
                    <CardContent className="p-5 md:p-8 space-y-5 md:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <Label
                            htmlFor="name"
                            className="text-[11px] font-black uppercase tracking-wider pl-1"
                          >
                            Người nhận hàng
                          </Label>
                          <div className="relative group">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            <Input
                              id="name"
                              className="rounded-2xl pl-11 border-border/80 focus-visible:ring-primary/10 h-11 md:h-12 bg-background font-medium text-sm md:text-base"
                              placeholder="Nhập họ tên..."
                              value={displayName}
                              onChange={(e) => setName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label
                            htmlFor="phone"
                            className="text-[11px] font-black uppercase tracking-wider pl-1"
                          >
                            Số điện thoại
                          </Label>
                          <div className="relative group">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                            <Input
                              id="phone"
                              className="rounded-2xl pl-11 border-border/80 focus-visible:ring-primary/10 h-11 md:h-12 bg-background font-medium text-sm md:text-base"
                              placeholder="Nhập số điện thoại..."
                              value={displayPhone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-black uppercase tracking-wider pl-1">
                          Địa chỉ giao hàng
                        </Label>
                        <AddressPicker
                          value={addressPicker}
                          onChange={setAddressPicker}
                          requiredLevel="ward"
                          triggerClassName="rounded-2xl"
                        />
                        <Input
                          id="address-detail"
                          className="rounded-2xl border-border/80 focus-visible:ring-primary/10 h-11 md:h-12 bg-background font-medium text-sm md:text-base"
                          placeholder="Số nhà, đường (không cần ghi lại tỉnh/quận/xã)"
                          value={addressDetail}
                          onChange={(e) => setAddressDetail(e.target.value)}
                        />
                        {composedShippingAddress && (
                          <p className="text-[11px] text-muted-foreground italic pl-1">
                            Địa chỉ hiển thị: {composedShippingAddress}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2.5 pt-2">
                        <Label
                          htmlFor="note"
                          className="text-[11px] font-black uppercase tracking-wider pl-1"
                        >
                          Ghi chú (tùy chọn)
                        </Label>
                        <div className="relative group">
                          <StickyNote className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="note"
                            className="rounded-2xl pl-11 border-border/80 focus-visible:ring-primary/10 h-11 md:h-12 bg-background font-medium text-sm md:text-base"
                            placeholder="Yêu cầu riêng về đóng gói hoặc giao hàng..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Payment Method */}
                <section className="space-y-5 md:space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
                      <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                      Phương thức thanh toán
                    </h2>
                  </div>
                  <div className="grid gap-2.5 md:gap-3.5">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.id}
                        disabled={mutation.isPending}
                        onClick={() => setPayment(m.id)}
                        className={cn(
                          "group w-full flex items-center gap-4 md:gap-5 p-4 md:p-5 rounded-3xl border transition-all duration-500 text-left relative overflow-hidden",
                          payment === m.id
                            ? "border-primary bg-primary/[0.03] shadow-sm"
                            : "border-border/60 hover:border-primary/30 bg-card/40",
                          mutation.isPending && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div
                          className={cn(
                            "p-3 rounded-2xl transition-all duration-500",
                            payment === m.id
                              ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20"
                              : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                          )}
                        >
                          <m.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <p
                            className={cn(
                              "text-base font-extrabold tracking-tight",
                              payment === m.id ? "text-primary" : "text-foreground/80"
                            )}
                          >
                            {m.label}
                          </p>
                          {m.hint && (
                            <p className="text-[11px] text-muted-foreground/80 font-medium italic">
                              {m.hint}
                            </p>
                          )}
                        </div>
                        <AnimatePresence>
                          {payment === m.id && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="absolute right-6"
                            >
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-5 space-y-10">
                {/* Order Summary Card */}
                <section className="space-y-5 md:space-y-6 sticky top-10">
                  <div className="flex items-center gap-3 px-2">
                    <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/10">
                      <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    </div>
                    <h2 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">
                      Tóm tắt đơn hàng
                    </h2>
                  </div>
                  <Card className="border border-border/40 shadow-sm rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-card/60 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="max-h-[380px] overflow-y-auto p-5 md:p-8 space-y-6 md:space-y-8 scrollbar-hide">
                        {groups.map((group) => {
                          return (
                            <div key={group.shopId} className="space-y-4 md:space-y-5">
                              <div className="flex items-center justify-between pb-2.5 md:pb-3 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                  <Store className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary opacity-60" />
                                  <span className="font-extrabold text-[10px] md:text-xs uppercase tracking-widest">
                                    {group.shopName}
                                  </span>
                                </div>
                                <span className="text-[8px] md:text-[9px] font-black italic text-muted-foreground bg-muted p-1 px-1.5 md:px-2 rounded-md">
                                  {group.items.length} SẢN PHẨM
                                </span>
                              </div>
                              <div className="space-y-3 md:space-y-4">
                                {group.items.map((item) => (
                                  <div
                                    key={item.productId}
                                    className="flex gap-3 md:gap-4 text-xs md:text-sm"
                                  >
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-muted border border-border/30 overflow-hidden shrink-0">
                                      {item.imageUrl && (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.productName}
                                          className="h-full w-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <p className="font-bold truncate text-foreground/90">
                                        {item.productName}
                                      </p>
                                      <div className="flex justify-between items-center mt-0.5">
                                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold">
                                          SL: {item.quantity}
                                        </p>
                                        <p className="font-extrabold text-xs md:text-sm text-foreground/80">
                                          {(item.price * item.quantity).toLocaleString("vi-VN")} đ
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-primary/[0.04] p-6 md:p-10 space-y-4 md:space-y-5 border-t border-primary/10">
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground font-black uppercase opacity-60">
                            <span>Giá trị hàng hóa</span>
                            <span className="text-foreground/70">
                              {subtotal.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground font-black uppercase opacity-60">
                            <span>Vận chuyển ({groups.length} kiện)</span>
                            <span className="text-foreground/70">
                              {shippingFee.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                        </div>
                        <div className="h-px bg-primary/10 my-2" />
                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-xs md:text-sm font-black uppercase text-primary">
                              Tổng đơn hàng
                            </span>
                            <span className="text-2xl md:text-4xl font-black text-primary tracking-tighter leading-none">
                              {(subtotal + shippingFee).toLocaleString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 md:p-8 pt-0 bg-primary/[0.04]">
                        <Button
                          className="w-full h-12 md:h-16 rounded-full text-xs md:text-base font-black active:scale-[0.97] transition-all uppercase tracking-[0.2em] group"
                          onClick={placeOrder}
                          disabled={mutation.isPending}
                        >
                          {mutation.isPending ? (
                            <div className="flex items-center gap-3">
                              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                              <span className="italic">Đang xử lý...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 md:gap-3">
                              <span>Hoàn tất</span>
                              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1.5 transition-transform" />
                            </div>
                          )}
                        </Button>
                        <p className="text-[10px] font-bold text-center mt-4 uppercase italic">
                          An toàn - Bảo mật - Chất lượng nông sản
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="container py-32 text-center space-y-10 max-w-lg mx-auto"
          >
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
                className="h-20 w-20 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/10 flex items-center justify-center mx-auto relative z-10"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 h-20 w-20 rounded-full bg-emerald-500 mx-auto -z-0"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black tracking-tight">Cảm ơn bạn!</h1>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed italic">
                Đơn hàng của bạn đã được chuyển đến nhà vườn. Chúc bạn có những phút giây trọn vẹn
                với nông sản Việt tươi ngon.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/consumer/orders"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "h-13 rounded-full font-bold px-10 shadow-md shadow-primary/10 transition-all hover:shadow-lg"
                )}
              >
                Xem hành trình đơn hàng
              </Link>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-13 rounded-full font-bold text-muted-foreground"
                )}
              >
                Quay về trang chủ
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {mutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <div className="relative">
              <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Truck className="h-7 w-7 text-primary animate-bounce" />
              </div>
            </div>
            <div className="mt-8 text-center space-y-2">
              <h3 className="text-xl font-black uppercase tracking-widest text-primary">
                Đang kết nối nhà vườn
              </h3>
              <p className="text-muted-foreground text-sm font-medium italic">
                Vui lòng đợi trong giây lát, đơn hàng đang được xử lý...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConsumerLayout>
  );
}
