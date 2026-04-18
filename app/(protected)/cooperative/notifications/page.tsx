"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  Info,
  Loader2,
  MessageCircle,
  MessageSquare,
  ShoppingBag,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks/useNotifications";
import { formatDateTimeVN } from "@/lib/formatDateTimeVN";
import type { AppNotification } from "@/services/notification";

const typeIcon = {
  order: ShoppingBag,
  message: MessageCircle,
  review: Star,
  system: Info,
  cooperative: Building2,
  forum: MessageSquare,
  default: Bell,
};

export default function CooperativeNotificationsPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useNotificationsQuery({ limit: 50 });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const items: AppNotification[] = data?.items ?? [];
  const unreadTotal = data?.meta.unreadTotal ?? 0;

  const handleOpen = (n: AppNotification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-[hsl(150,16%,12%)]">Thông báo</h1>
            <p className="mt-1 text-sm text-[hsl(150,8%,40%)]">
              Trung tâm thông báo dành cho tài khoản hợp tác xã.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[hsl(150,8%,40%)]">{unreadTotal} mới</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs border-[hsl(142,71%,45%)]/40"
              disabled={unreadTotal === 0 || markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
            >
              Đọc hết
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-[hsl(150,8%,40%)]">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(142,71%,45%)]" />
        </div>
      ) : isError ? (
        <p className="text-center text-sm text-destructive">
          Không tải được thông báo.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Thử lại
          </button>
        </p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
              <Bell className="h-6 w-6 text-[hsl(142,71%,45%)]" />
            </span>
            <p>Chưa có thông báo.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = typeIcon[n.type] ?? typeIcon.default;
            return (
              <Card
                key={n.id}
                role="button"
                tabIndex={0}
                className={`border-[hsl(150,12%,90%)] transition-colors hover:border-[hsl(142,71%,45%)]/35 ${
                  !n.read ? "border-[hsl(142,71%,45%)]/35 bg-[hsl(142,71%,45%)]/5" : ""
                } ${n.link ? "cursor-pointer" : ""}`}
                onClick={() => handleOpen(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpen(n);
                  }
                }}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      !n.read ? "bg-[hsl(142,71%,45%)]/12" : "bg-[hsl(120,20%,94%)]"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        !n.read ? "text-[hsl(142,71%,45%)]" : "text-[hsl(150,7%,45%)]"
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm text-[hsl(150,16%,12%)] ${
                          !n.read ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[hsl(142,71%,45%)]" />
                      )}
                    </div>
                    <p className="text-sm text-[hsl(150,8%,38%)]">{n.content}</p>
                    <p className="text-xs text-[hsl(150,8%,45%)]">
                      {formatDateTimeVN(n.createdAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
