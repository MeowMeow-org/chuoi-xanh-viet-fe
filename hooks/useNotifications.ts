"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationService } from "@/services/notification/notificationService";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (params?: { page?: number; limit?: number }) =>
    ["notifications", "list", params?.page ?? 1, params?.limit ?? 50] as const,
  /** Gọi GET /notification với limit nhỏ chỉ để lấy meta.unreadTotal cho badge */
  unreadSummary: () => ["notifications", "unread-summary"] as const,
};

/** Số thông báo chưa đọc (dùng cho icon chuông trên layout) */
export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadSummary(),
    queryFn: () => notificationService.list({ page: 1, limit: 1 }),
    select: (res) => res.meta.unreadTotal,
    staleTime: 15_000,
    refetchInterval: 120_000,
  });
}

export function useNotificationsQuery(params?: { page?: number; limit?: number }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 50;

  return useQuery({
    queryKey: notificationQueryKeys.list({ page, limit }),
    queryFn: () => notificationService.list({ page, limit }),
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
