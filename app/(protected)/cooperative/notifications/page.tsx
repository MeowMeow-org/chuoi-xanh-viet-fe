"use client";

import { Bell } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function CooperativeNotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div>
        <h1 className="text-xl font-bold text-[hsl(150,16%,12%)]">Thông báo</h1>
        <p className="mt-1 text-sm text-[hsl(150,8%,40%)]">
          Trung tâm thông báo dành cho tài khoản hợp tác xã.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
            <Bell className="h-6 w-6 text-[hsl(142,71%,45%)]" />
          </span>
          <p>Chưa có thông báo mới. Tính năng đang được hoàn thiện.</p>
        </CardContent>
      </Card>
    </div>
  );
}
