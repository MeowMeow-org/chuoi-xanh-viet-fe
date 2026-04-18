"use client";

import { toast as sonnerToast } from "sonner";

export type ToastType = "success" | "error" | "info";

export type ShowToastPayload = {
  message: string;
  type?: ToastType;
  duration?: number;
};

/** Dùng `toast` từ `sonner` trực tiếp trong component; hàm này cho chỗ gọi kiểu cũ. */
export function showAppToast({
  message,
  type = "info",
  duration = 4000,
}: ShowToastPayload) {
  if (typeof window === "undefined") return;
  const opts = { duration };
  if (type === "success") sonnerToast.success(message, opts);
  else if (type === "error") sonnerToast.error(message, opts);
  else sonnerToast.message(message, opts);
}
