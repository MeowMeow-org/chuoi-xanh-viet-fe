"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  Info,
  Loader2,
  MessageCircle,
  MessageSquare,
  ShoppingBag,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
};

export default function FarmerNotificationsPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useNotificationsQuery({ limit: 50 });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const notifs: AppNotification[] = data?.items ?? [];
  const unreadTotal = data?.meta.unreadTotal ?? 0;

  const handleOpen = (noti: AppNotification) => {
    if (!noti.read) {
      markReadMutation.mutate(noti.id);
    }
    if (noti.link) {
      router.push(noti.link);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Thông báo</h1>
        <div className="flex items-center gap-2">
          <Badge className="bg-[hsl(120,20%,95%)] text-[hsl(150,10%,22%)]">
            {unreadTotal} mới
          </Badge>
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
      ) : notifs.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-12">Chưa có thông báo.</p>
      ) : (
        <div className="space-y-2">
          {notifs.map((noti) => {
            const Icon = typeIcon[noti.type] ?? Info;

            return (
              <Card
                key={noti.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpen(noti)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpen(noti);
                  }
                }}
                className={`transition-colors hover:border-[hsl(142,71%,45%)]/40 ${
                  !noti.read
                    ? "border-[hsl(142,71%,45%)]/30 bg-[hsl(142,71%,45%)]/5"
                    : ""
                } ${noti.link ? "cursor-pointer" : ""}`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      !noti.read ? "bg-[hsl(142,71%,45%)]/10" : "bg-[hsl(120,20%,94%)]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        !noti.read ? "text-[hsl(142,71%,45%)]" : "text-[hsl(150,7%,45%)]"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!noti.read ? "font-semibold" : "font-medium"}`}>
                        {noti.title}
                      </p>
                      {!noti.read && (
                        <div className="h-2 w-2 shrink-0 rounded-full bg-[hsl(142,71%,45%)]" />
                      )}
                    </div>

                    <p className="text-sm text-[hsl(150,7%,45%)]">{noti.content}</p>
                    <p className="mt-1 text-xs text-[hsl(150,7%,45%)]">
                      {formatDateTimeVN(noti.createdAt)}
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
