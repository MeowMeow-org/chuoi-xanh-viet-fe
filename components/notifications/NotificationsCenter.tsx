"use client";

import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Info,
  Loader2,
  MessageCircle,
  MessageSquare,
  Package,
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
import { cn } from "@/lib/utils";

const typeIcon: Record<string, LucideIcon> = {
  order: Package,
  message: MessageCircle,
  review: Star,
  system: Info,
  cooperative: Building2,
  forum: MessageSquare,
};

export type NotificationsCenterVariant = "consumer" | "farmer" | "cooperative" | "admin";

export function NotificationsCenter({
  variant = "consumer",
  subtitle,
  className,
}: {
  variant?: NotificationsCenterVariant;
  /** Dòng mô tả dưới tiêu đề (VD: HTX) */
  subtitle?: string | null;
  className?: string;
}) {
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

  const isCoop = variant === "cooperative";
  const isFarmer = variant === "farmer";

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:max-w-3xl md:pb-8 lg:px-8",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Thông báo</h1>
          {subtitle ? (
            <p
              className={cn(
                "mt-1 text-sm",
                isCoop ? "text-[hsl(150,8%,40%)]" : "text-muted-foreground",
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs tabular-nums",
              isCoop ? "text-[hsl(150,8%,40%)]" : "text-muted-foreground",
            )}
          >
            {unreadTotal} {variant === "consumer" ? "chưa đọc" : "mới"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "text-xs",
              isCoop && "border-[hsl(142,71%,45%)]/40",
            )}
            disabled={unreadTotal === 0 || markAllMutation.isPending}
            onClick={() => markAllMutation.mutate()}
          >
            Đọc hết
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div
          className={cn(
            "flex justify-center py-16",
            isCoop ? "text-[hsl(150,8%,40%)]" : "text-muted-foreground",
          )}
        >
          <Loader2
            className={cn(
              "h-8 w-8 animate-spin",
              isCoop && "text-[hsl(142,71%,45%)]",
            )}
          />
        </div>
      ) : isError ? (
        <p className="text-center text-sm text-destructive">
          Không tải được thông báo.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Thử lại
          </button>
        </p>
      ) : items.length === 0 ? (
        isCoop ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(142,71%,45%)]/10">
                <Bell className="h-6 w-6 text-[hsl(142,71%,45%)]" />
              </span>
              <p>Chưa có thông báo.</p>
            </CardContent>
          </Card>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Chưa có thông báo.
          </p>
        )
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = typeIcon[n.type] ?? Bell;
            const unreadStyles =
              isFarmer || isCoop
                ? !n.read
                  ? "border-[hsl(142,71%,45%)]/30 bg-[hsl(142,71%,45%)]/5"
                  : ""
                : !n.read
                  ? "border-primary/30 bg-primary/5"
                  : "";

            return (
              <Card
                key={n.id}
                role="button"
                tabIndex={0}
                className={cn(
                  unreadStyles,
                  n.link ? "cursor-pointer" : "",
                  isCoop &&
                    "border-[hsl(150,12%,90%)] transition-colors hover:border-[hsl(142,71%,45%)]/35",
                  isFarmer &&
                    "transition-colors hover:border-[hsl(142,71%,45%)]/40",
                  !isCoop && !isFarmer && "border-border",
                )}
                onClick={() => handleOpen(n)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpen(n);
                  }
                }}
              >
                <CardContent
                  className={cn(
                    "flex items-start gap-3",
                    isCoop || isFarmer ? "p-4" : "p-3",
                  )}
                >
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center rounded-full",
                      isCoop || isFarmer ? "h-10 w-10" : "h-9 w-9",
                      !n.read
                        ? isCoop || isFarmer
                          ? "bg-[hsl(142,71%,45%)]/10"
                          : "bg-primary/10"
                        : isCoop || isFarmer
                          ? "bg-[hsl(120,20%,94%)]"
                          : "bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isCoop && "h-5 w-5",
                        !n.read
                          ? isCoop || isFarmer
                            ? "text-[hsl(142,71%,45%)]"
                            : "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "text-sm",
                          !n.read ? "font-semibold" : "font-medium",
                          isCoop && "text-[hsl(150,16%,12%)]",
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            isCoop || isFarmer
                              ? "bg-[hsl(142,71%,45%)]"
                              : "bg-primary",
                          )}
                        />
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs",
                        isCoop
                          ? "text-[hsl(150,8%,38%)]"
                          : "text-muted-foreground",
                      )}
                    >
                      {n.content}
                    </p>
                    <p
                      className={cn(
                        "text-[10px]",
                        isCoop
                          ? "text-[hsl(150,8%,45%)]"
                          : "text-muted-foreground",
                      )}
                    >
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
