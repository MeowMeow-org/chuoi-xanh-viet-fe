"use client";

import { User } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";

export default function CooperativeProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div>
        <h1 className="text-xl font-bold text-[hsl(150,16%,12%)]">Hồ sơ HTX</h1>
        <p className="mt-1 text-sm text-[hsl(150,8%,40%)]">
          Thông tin tài khoản đăng nhập.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/15">
            <User className="h-7 w-7 text-[hsl(142,71%,35%)]" />
          </span>
          <div className="min-w-0 space-y-1 text-sm">
            <p className="text-lg font-semibold text-[hsl(150,10%,18%)]">
              {user?.fullName ?? "—"}
            </p>
            <p className="text-muted-foreground">{user?.email ?? "—"}</p>
            <p className="text-muted-foreground">{user?.phone ?? "—"}</p>
            <p className="text-xs text-[hsl(142,58%,32%)]">
              Vai trò: Hợp tác xã
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
