"use client";

import { useState } from "react";
import Link from "next/link";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Lock,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  useChangePasswordMutation,
  useLogoutMutation,
  useMeQuery,
  usePatchMeMutation,
} from "@/hooks/useAuth";

export default function ConsumerProfilePage() {
  const { data: me, isLoading: meLoading, isError } = useMeQuery();
  const patchMutation = usePatchMeMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [phoneOverride, setPhoneOverride] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const name = nameOverride ?? me?.fullName ?? "";
  const phone = phoneOverride ?? me?.phone ?? "";

  const saveProfile = () => {
    if (!me) return;
    const nextName = name.trim();
    const nextPhone = phone.trim();
    if (!nextName || !nextPhone) return;
    const payload: { fullName?: string; phone?: string } = {};
    if (nextName !== me.fullName) payload.fullName = nextName;
    if (nextPhone !== me.phone) payload.phone = nextPhone;
    if (Object.keys(payload).length === 0) return;
    patchMutation.mutate(payload, {
      onSuccess: () => {
        setNameOverride(null);
        setPhoneOverride(null);
      },
    });
  };

  const submitPassword = () => {
    const c = currentPassword.trim();
    const n = newPassword.trim();
    const cf = confirmPassword.trim();
    if (!c || !n || !cf) return;
    if (n !== cf) return;
    changePasswordMutation.mutate(
      {
        currentPassword: c,
        newPassword: n,
        confirm_password: cf,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold">Tài khoản</h1>

        {meLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError || !me ? (
          <p className="text-sm text-destructive text-center py-8">
            Không tải được hồ sơ. Vui lòng đăng nhập lại.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{me.fullName}</p>
                <p className="text-sm text-muted-foreground">Người tiêu dùng</p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="font-bold text-base">Thông tin cá nhân</h2>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name">Họ tên</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setNameOverride(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-10"
                        value={phone}
                        onChange={(e) => setPhoneOverride(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        className="pl-10 bg-muted/50"
                        value={me.email ?? ""}
                        readOnly
                        aria-readonly
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Đổi email cần hỗ trợ từ quản trị hoặc luồng riêng.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={saveProfile}
                  disabled={
                    patchMutation.isPending ||
                    !name.trim() ||
                    !phone.trim() ||
                    (name.trim() === me.fullName &&
                      phone.trim() === me.phone)
                  }
                >
                  {patchMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <h2 className="font-bold text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ giao hàng
                </h2>
                <p className="text-sm text-muted-foreground">
                  Địa chỉ nhận hàng được nhập khi bạn đặt đơn (thanh toán). Hệ
                  thống chưa lưu sổ địa chỉ trên tài khoản.
                </p>
                <Link
                  href="/consumer/orders"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Xem đơn hàng đã giao
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h2 className="font-bold text-base">Đổi mật khẩu</h2>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="cur-pw">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cur-pw"
                        type="password"
                        className="pl-10"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="new-pw">Mật khẩu mới</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-pw"
                        type="password"
                        className="pl-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cf-pw">Nhập lại mật khẩu mới</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cf-pw"
                        type="password"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={submitPassword}
                  disabled={
                    changePasswordMutation.isPending ||
                    !currentPassword.trim() ||
                    !newPassword.trim() ||
                    newPassword !== confirmPassword
                  }
                >
                  {changePasswordMutation.isPending
                    ? "Đang cập nhật..."
                    : "Cập nhật mật khẩu"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Link href="/">
                <Button variant="outline" className="w-full gap-2">
                  Đổi vai trò
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full gap-2 text-destructive hover:text-destructive"
                onClick={() => logout()}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </Button>
            </div>
          </>
        )}
      </div>
    </ConsumerLayout>
  );
}
