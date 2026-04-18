"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Info,
  Loader2,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Package,
  Star,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from "@/hooks/useNotifications";
import { formatRelativeTimeVN } from "@/lib/formatDateTimeVN";
import type { AppNotification } from "@/services/notification";
import { cn } from "@/lib/utils";

import type { NotificationsCenterVariant } from "./NotificationsCenter";

const typeIcon: Record<string, LucideIcon> = {
  order: Package,
  message: MessageCircle,
  review: Star,
  system: Info,
  cooperative: Building2,
  forum: MessageSquare,
};

type TabKey = "all" | "unread";

export function NotificationsPopover({
  variant = "consumer",
  viewAllHref,
  unreadCount,
  triggerClassName,
}: {
  variant?: NotificationsCenterVariant;
  viewAllHref: string;
  unreadCount: number;
  /** className cho nút chuông (kích thước / hover) */
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("all");
  const rootRef = useRef<HTMLDivElement>(null);

  const isCoop = variant === "cooperative";
  const isFarmer = variant === "farmer";
  const isAdmin = variant === "admin";

  const { data, isLoading, isError, refetch } = useNotificationsQuery({
    limit: 25,
    unreadOnly: tab === "unread",
  });
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const items: AppNotification[] = data?.items ?? [];
  const unreadTotal = data?.meta.unreadTotal ?? 0;

  useEffect(() => {
    if (!open) return;
    void refetch();
  }, [open, tab, refetch]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleOpenItem = (n: AppNotification) => {
    if (!n.read) {
      markReadMutation.mutate(n.id);
    }
    setOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const tabBtn = (key: TabKey, label: string) => (
    <button
      type="button"
      key={key}
      onClick={() => setTab(key)}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        tab === key
          ? isCoop || isFarmer || isAdmin
            ? "bg-[hsl(142,71%,45%)] text-white"
            : "bg-primary text-primary-foreground"
          : isCoop || isFarmer || isAdmin
            ? "text-[hsl(150,7%,45%)] hover:bg-[hsl(120,10%,94%)]"
            : "text-muted-foreground hover:bg-muted",
      )}
    >
      {label}
    </button>
  );

  return (
    <div ref={rootRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Thông báo"
        className={cn("relative h-9 w-9", triggerClassName)}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className={cn(isCoop || isFarmer || isAdmin ? "size-5" : "h-4 w-4")} />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute flex min-h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-medium tabular-nums",
              isCoop || isFarmer || isAdmin
                ? "-right-0.5 -top-0.5 bg-red-500 text-white"
                : "-top-0.5 -right-0.5 bg-destructive text-destructive-foreground",
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 z-[100] mt-1.5 flex max-h-[min(70vh,28rem)] w-[min(calc(100vw-1rem),24rem)] flex-col overflow-hidden rounded-xl border shadow-lg sm:w-[22.5rem]",
            isCoop || isFarmer || isAdmin
              ? "border-[hsl(142,14%,88%)] bg-white"
              : "border-border bg-popover text-popover-foreground",
          )}
          role="dialog"
          aria-label="Thông báo"
        >
          <div
            className={cn(
              "flex shrink-0 items-start justify-between gap-2 border-b px-3 py-2.5",
              isCoop || isFarmer || isAdmin
                ? "border-[hsl(142,14%,88%)]"
                : "border-border",
            )}
          >
            <div>
              <h2
                className={cn(
                  "text-base font-bold leading-tight",
                  isCoop || isFarmer || isAdmin
                    ? "text-[hsl(150,10%,15%)]"
                    : "text-foreground",
                )}
              >
                Thông báo
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tabBtn("all", "Tất cả")}
                {tabBtn("unread", "Chưa đọc")}
              </div>
            </div>
            <Link
              href={viewAllHref}
              title="Mở trang thông báo đầy đủ"
              onClick={() => setOpen(false)}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-8 w-8 shrink-0",
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Link>
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2 text-xs",
              isCoop || isFarmer || isAdmin
                ? "border-[hsl(142,14%,88%)] text-[hsl(150,7%,42%)]"
                : "border-border text-muted-foreground",
            )}
          >
            <span>Trước đó</span>
            <Link
              href={viewAllHref}
              className={cn(
                "font-medium hover:underline",
                isCoop || isFarmer || isAdmin
                  ? "text-[hsl(142,71%,38%)]"
                  : "text-primary",
              )}
              onClick={() => setOpen(false)}
            >
              Xem tất cả
            </Link>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div
                className={cn(
                  "flex justify-center py-12",
                  isCoop || isFarmer || isAdmin
                    ? "text-[hsl(150,8%,40%)]"
                    : "text-muted-foreground",
                )}
              >
                <Loader2
                  className={cn(
                    "h-7 w-7 animate-spin",
                    (isCoop || isFarmer || isAdmin) && "text-[hsl(142,71%,45%)]",
                  )}
                />
              </div>
            ) : isError ? (
              <p className="px-3 py-8 text-center text-sm text-destructive">
                Không tải được.{" "}
                <button type="button" className="underline" onClick={() => refetch()}>
                  Thử lại
                </button>
              </p>
            ) : items.length === 0 ? (
              <div
                className={cn(
                  "flex flex-col items-center gap-2 px-4 py-10 text-center text-sm",
                  isCoop || isFarmer || isAdmin
                    ? "text-[hsl(150,7%,45%)]"
                    : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    isCoop || isFarmer || isAdmin
                      ? "bg-[hsl(142,71%,45%)]/10"
                      : "bg-primary/10",
                  )}
                >
                  <Bell
                    className={cn(
                      "h-5 w-5",
                      isCoop || isFarmer || isAdmin
                        ? "text-[hsl(142,71%,45%)]"
                        : "text-primary",
                    )}
                  />
                </span>
                <p>{tab === "unread" ? "Không có thông báo chưa đọc." : "Chưa có thông báo."}</p>
              </div>
            ) : (
              <ul className="divide-y">
                {items.map((n) => {
                  const Icon = typeIcon[n.type] ?? Bell;
                  const unreadRow =
                    !n.read &&
                    (isCoop || isFarmer || isAdmin
                      ? "bg-[hsl(142,71%,45%)]/[0.06]"
                      : "bg-primary/[0.06]");
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full gap-3 px-3 py-2.5 text-left transition-colors",
                          unreadRow,
                          n.link ? "cursor-pointer" : "cursor-default",
                          isCoop || isFarmer || isAdmin
                            ? "hover:bg-[hsl(120,10%,97%)]"
                            : "hover:bg-muted/60",
                        )}
                        onClick={() => handleOpenItem(n)}
                      >
                        <div
                          className={cn(
                            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                            !n.read
                              ? isCoop || isFarmer || isAdmin
                                ? "bg-[hsl(142,71%,45%)]/12"
                                : "bg-primary/12"
                              : isCoop || isFarmer || isAdmin
                                ? "bg-[hsl(120,20%,94%)]"
                                : "bg-muted",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              !n.read
                                ? isCoop || isFarmer || isAdmin
                                  ? "text-[hsl(142,71%,40%)]"
                                  : "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "line-clamp-2 text-sm leading-snug",
                              !n.read ? "font-semibold" : "font-medium",
                              isCoop || isFarmer || isAdmin
                                ? "text-[hsl(150,10%,15%)]"
                                : "text-foreground",
                            )}
                          >
                            {n.title}
                          </p>
                          {n.content ? (
                            <p
                              className={cn(
                                "mt-0.5 line-clamp-2 text-xs",
                                isCoop || isFarmer || isAdmin
                                  ? "text-[hsl(150,7%,42%)]"
                                  : "text-muted-foreground",
                              )}
                            >
                              {n.content}
                            </p>
                          ) : null}
                          <p
                            className={cn(
                              "mt-1 text-[10px]",
                              isCoop || isFarmer || isAdmin
                                ? "text-[hsl(150,8%,48%)]"
                                : "text-muted-foreground",
                            )}
                          >
                            {formatRelativeTimeVN(n.createdAt)}
                          </p>
                        </div>
                        {!n.read ? (
                          <span
                            className={cn(
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                              isCoop || isFarmer || isAdmin
                                ? "bg-[hsl(217,91%,55%)]"
                                : "bg-primary",
                            )}
                            aria-hidden
                          />
                        ) : (
                          <span className="w-2 shrink-0" aria-hidden />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center justify-between gap-2 border-t px-3 py-2",
              isCoop || isFarmer || isAdmin
                ? "border-[hsl(142,14%,88%)] bg-[hsl(120,20%,99%)]"
                : "border-border bg-muted/30",
            )}
          >
            <span
              className={cn(
                "text-[11px] tabular-nums",
                isCoop || isFarmer || isAdmin
                  ? "text-[hsl(150,7%,45%)]"
                  : "text-muted-foreground",
              )}
            >
              {unreadTotal} chưa đọc
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-7 text-[11px]",
                (isCoop || isFarmer || isAdmin) && "border-[hsl(142,71%,45%)]/40",
              )}
              disabled={unreadTotal === 0 || markAllMutation.isPending}
              onClick={() => markAllMutation.mutate()}
            >
              Đọc hết
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
