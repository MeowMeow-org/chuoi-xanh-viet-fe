"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  Loader2,
  MessageCircle,
  MessageSquare,
  Package,
  Star,
} from "lucide-react";

import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks/useNotifications";
import { formatDateTimeVN } from "@/lib/formatDateTimeVN";
import type { AppNotification } from "@/services/notification";

const typeIcon: Record<string, typeof Bell> = {
  order: Package,
  message: MessageCircle,
  review: Star,
  system: Bell,
  cooperative: Building2,
  forum: MessageSquare,
};

export default function ConsumerNotificationsPage() {
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
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold">Thông báo</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{unreadTotal} chưa đọc</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={unreadTotal === 0 || markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
            >
              Đọc hết
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-center text-sm text-destructive">
            Không tải được thông báo.{" "}
            <button type="button" className="underline" onClick={() => refetch()}>
              Thử lại
            </button>
          </p>
        ) : (
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">Chưa có thông báo.</p>
            ) : (
              items.map((n) => {
                const Icon = typeIcon[n.type] || Bell;
                return (
                  <Card
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    className={`${!n.read ? "border-primary/30 bg-primary/5" : ""} ${
                      n.link ? "cursor-pointer" : ""
                    }`}
                    onClick={() => handleOpen(n)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleOpen(n);
                      }
                    }}
                  >
                    <CardContent className="p-3 flex items-start gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                          !n.read ? "bg-primary/10" : "bg-muted"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            !n.read ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{n.title}</p>
                          {!n.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{n.content}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDateTimeVN(n.createdAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </ConsumerLayout>
  );
}
