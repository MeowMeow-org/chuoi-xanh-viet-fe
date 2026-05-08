"use client";

import { toast as sonnerToast } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastCompatOptions = {
  duration?: number;
  description?: string;
  [key: string]: unknown;
};

export type ShowToastPayload = {
  message: string;
  type?: ToastType;
  duration?: number;
  description?: string;
};

const typeConfig: Record<
  ToastType,
  { icon: string; iconClass: string; progressClass: string }
> = {
  success: {
    icon: "✓",
    iconClass: "ui-toast-icon--success",
    progressClass: "ui-toast-progress-bar--success",
  },
  error: {
    icon: "!",
    iconClass: "ui-toast-icon--error",
    progressClass: "ui-toast-progress-bar--error",
  },
  info: {
    icon: "i",
    iconClass: "ui-toast-icon--info",
    progressClass: "ui-toast-progress-bar--info",
  },
  warning: {
    icon: "!",
    iconClass: "ui-toast-icon--warning",
    progressClass: "ui-toast-progress-bar--warning",
  },
};

export function showAppToast({
  message,
  type = "info",
  duration = 4000,
  description,
}: ShowToastPayload) {
  if (typeof window === "undefined") return;
  const config = typeConfig[type];

  sonnerToast.custom(
    () => (
      <div className="ui-toast" role="alert">
        <div className="ui-toast-body">
          <div className={`ui-toast-icon ${config.iconClass}`}>
            <span className="ui-toast-icon-text">{config.icon}</span>
          </div>
          <span className="ui-toast-message">{message}</span>
        </div>
        {description ? (
          <div className="ui-toast-description">{description}</div>
        ) : null}
        <div className="ui-toast-progress">
          <div
            className={`ui-toast-progress-bar ${config.progressClass}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    ),
    {
      duration,
      className: "ui-toast-shell",
    },
  );
}

function normalizeMessage(message: unknown) {
  if (typeof message === "string") return message;
  if (message == null) return "";
  return String(message);
}

export const toast = {
  success: (message: unknown, options?: ToastCompatOptions) => {
    showAppToast({
      message: normalizeMessage(message),
      type: "success",
      duration: options?.duration,
      description: options?.description,
    });
  },
  error: (message: unknown, options?: ToastCompatOptions) => {
    showAppToast({
      message: normalizeMessage(message),
      type: "error",
      duration: options?.duration,
      description: options?.description,
    });
  },
  info: (message: unknown, options?: ToastCompatOptions) => {
    showAppToast({
      message: normalizeMessage(message),
      type: "info",
      duration: options?.duration,
      description: options?.description,
    });
  },
  warning: (message: unknown, options?: ToastCompatOptions) => {
    showAppToast({
      message: normalizeMessage(message),
      type: "warning",
      duration: options?.duration,
      description: options?.description,
    });
  },
  message: (message: unknown, options?: ToastCompatOptions) => {
    showAppToast({
      message: normalizeMessage(message),
      type: "info",
      duration: options?.duration,
      description: options?.description,
    });
  },
};
