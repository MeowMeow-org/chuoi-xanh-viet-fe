"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "@/services/notification/notificationService";
import { useAuthStore } from "@/store/useAuthStore";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    [
      "notifications",
      "list",
      params?.page ?? 1,
      params?.limit ?? 50,
      params?.unreadOnly ?? false,
    ] as const,
  /** Gọi GET /notification với limit nhỏ chỉ để lấy meta.unreadTotal cho badge */
  unreadSummary: () => ["notifications", "unread-summary"] as const,
};

/** Số thông báo chưa đọc (dùng cho icon chuông trên layout) */
export function useNotificationUnreadCount(options?: { enabled?: boolean }) {
  const hasAccessToken = useAuthStore((s) => Boolean(s.accessToken));
  const enabled = options?.enabled ?? true;
  const queryEnabled = enabled && hasAccessToken;

  return useQuery({
    queryKey: notificationQueryKeys.unreadSummary(),
    queryFn: () => notificationService.list({ page: 1, limit: 1 }),
    select: (res) => res.meta.unreadTotal,
    staleTime: 15_000,
    refetchInterval: queryEnabled ? 120_000 : false,
    enabled: queryEnabled,
  });
}

export function useNotificationsQuery(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}) {
  const hasAccessToken = useAuthStore((s) => Boolean(s.accessToken));
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;
  const unreadOnly = params?.unreadOnly;

  return useQuery({
    queryKey: notificationQueryKeys.list({ page, limit, unreadOnly }),
    queryFn: () => notificationService.list({ page, limit, unreadOnly }),
    enabled: hasAccessToken,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationService.markRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
    },
  });
}
