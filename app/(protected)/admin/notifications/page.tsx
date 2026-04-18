"use client";

import { NotificationsCenter } from "@/components/notifications/NotificationsCenter";

export default function AdminNotificationsPage() {
  return (
    <NotificationsCenter
      variant="admin"
      subtitle="Thông báo hệ thống dành cho quản trị viên."
    />
  );
}
