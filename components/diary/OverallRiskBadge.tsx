"use client";

import type { ComponentType } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import type { OverallRisk } from "@/services/diary";

const RISK_CONFIG: Record<
  OverallRisk,
  {
    className: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  safe: {
    className: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle2,
    label: "An toàn",
  },
  warning: {
    className: "bg-amber-100 text-amber-700 border-amber-300",
    icon: AlertTriangle,
    label: "Cần lưu ý",
  },
  critical: {
    className: "bg-red-100 text-red-700 border-red-300",
    icon: AlertCircle,
    label: "Vi phạm nghiêm trọng",
  },
};

interface OverallRiskBadgeProps {
  risk: OverallRisk;
  size?: "sm" | "md";
}

export default function OverallRiskBadge({
  risk,
  size = "md",
}: OverallRiskBadgeProps) {
  const { className, icon: Icon, label } = RISK_CONFIG[risk];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"} ${className}`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
      {label}
    </span>
  );
}
