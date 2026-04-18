import { axiosInstance } from "@/lib/axios";
import type { NotificationsListResponse } from "./index";

export const notificationService = {
  list: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    return axiosInstance.get<NotificationsListResponse, NotificationsListResponse>(
      "/notification",
      {
        params: {
          page: params?.page,
          limit: params?.limit,
          unread_only:
            params?.unreadOnly === true
              ? "true"
              : params?.unreadOnly === false
                ? "false"
                : undefined,
        },
      },
    );
  },

  markRead: async (notificationId: string) => {
    await axiosInstance.patch(`/notification/${notificationId}/read`, {});
  },

  markAllRead: async () => {
    await axiosInstance.patch("/notification/read-all", {});
  },
};
