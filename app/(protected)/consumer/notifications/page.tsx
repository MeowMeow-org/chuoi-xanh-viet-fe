"use client";

import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { NotificationsCenter } from "@/components/notifications/NotificationsCenter";

export default function ConsumerNotificationsPage() {
  return (
    <ConsumerLayout>
      <NotificationsCenter variant="consumer" />
    </ConsumerLayout>
  );
}
