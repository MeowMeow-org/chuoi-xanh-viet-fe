export type NotificationType =
  | "order"
  | "message"
  | "review"
  | "system"
  | "cooperative"
  | "forum";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  read: boolean;
  readAt: string | null;
  createdAt: string;
  link?: string;
  actorUserId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

export type NotificationsListMeta = {
  page: number;
  limit: number;
  total: number;
  unreadTotal: number;
  totalPages: number;
  previousPage: number | null;
  nextPage: number | null;
};

export type NotificationsListResponse = {
  items: AppNotification[];
  meta: NotificationsListMeta;
};
