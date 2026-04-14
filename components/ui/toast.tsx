"use client";

import { useEffect, useRef, useState } from "react";

export type ToastType = "success" | "error" | "info";

export const APP_TOAST_EVENT = "cxv-app-toast";

export type ShowToastPayload = {
    message: string;
    type?: ToastType;
    duration?: number;
};

type ToastItem = {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
};

type ToastProps = {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
    duration?: number;
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
};

export function Toast({ id, message, type, onClose, duration = 4000 }: ToastProps) {
    const [progress, setProgress] = useState(100);
    const [isHovered, setIsHovered] = useState(false);
    const hasClosedRef = useRef(false);
    const config = typeConfig[type];

    useEffect(() => {
        if (isHovered) return;

        const stepMs = 50;
        const stepValue = (stepMs / duration) * 100;

        const interval = setInterval(() => {
            setProgress((current) => Math.max(0, current - stepValue));
        }, stepMs);

        return () => clearInterval(interval);
    }, [duration, isHovered]);

    useEffect(() => {
        if (progress > 0 || hasClosedRef.current) return;

        hasClosedRef.current = true;
        onClose(id);
    }, [id, onClose, progress]);

    return (
        <div
            className="ui-toast"
            role="alert"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="ui-toast-body">
                <div className={`ui-toast-icon ${config.iconClass}`}>
                    <span className="ui-toast-icon-text">{config.icon}</span>
                </div>
                <span className="ui-toast-message">{message}</span>
            </div>
            <div className="ui-toast-progress">
                <div
                    className={`ui-toast-progress-bar ${config.progressClass}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export function showAppToast({ message, type = "info", duration = 4000 }: ShowToastPayload) {
    if (typeof window === "undefined") return;

    const detail: ToastItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        type,
        duration,
    };

    window.dispatchEvent(new CustomEvent<ToastItem>(APP_TOAST_EVENT, { detail }));
}

export function ToastViewport() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        const handleToastEvent = (event: Event) => {
            const customEvent = event as CustomEvent<ToastItem>;
            if (!customEvent.detail) return;

            setToasts((current) => [...current, customEvent.detail]);
        };

        window.addEventListener(APP_TOAST_EVENT, handleToastEvent);
        return () => window.removeEventListener(APP_TOAST_EVENT, handleToastEvent);
    }, []);

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-70 flex flex-col gap-3">
            {toasts.map((toast) => (
                <div className="pointer-events-auto" key={toast.id}>
                    <Toast
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={(id) => setToasts((current) => current.filter((item) => item.id !== id))}
                    />
                </div>
            ))}
        </div>
    );
}