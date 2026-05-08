"use client";

import type { ComponentType } from "react";
import {
  Ban,
  Clock,
  Search,
  TrendingUp,
  XCircle,
  ArrowLeftRight,
  HelpCircle,
} from "lucide-react";

import type { ScanSeverity, ScanViolation } from "@/services/diary";

const SEVERITY_CONFIG: Record<
  ScanSeverity,
  { className: string; label: string }
> = {
  info: {
    className: "bg-blue-100 text-blue-600 border-blue-200",
    label: "Thông tin",
  },
  warning: {
    className: "bg-amber-100 text-amber-600 border-amber-200",
    label: "Cảnh báo",
  },
  critical: {
    className: "bg-red-100 text-red-700 border-red-200",
    label: "Nghiêm trọng",
  },
};

const CODE_ICON: Record<string, ComponentType<{ className?: string }>> = {
  PHI_VIOLATION: Clock,
  BANNED_PESTICIDE: Ban,
  SEQUENCE_VIOLATION: ArrowLeftRight,
  EXCESSIVE_PESTICIDE_FREQUENCY: TrendingUp,
  SUSPICIOUS_DIARY_PATTERN: Search,
  MISSING_KEY_ACTIVITY: XCircle,
};

interface ScanViolationCardProps {
  violation: ScanViolation;
  onViewEntries?: (ids: string[]) => void;
}

export default function ScanViolationCard({
  violation,
  onViewEntries,
}: ScanViolationCardProps) {
  const { className: severityClass, label: severityLabel } =
    SEVERITY_CONFIG[violation.severity];
  const Icon = CODE_ICON[violation.code] ?? HelpCircle;

  return (
    <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${severityClass}`}
        >
          {severityLabel}
        </span>
        <p className="text-sm font-semibold">{violation.title}</p>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {violation.detail}
      </p>

      {violation.recommendation && (
        <div className="rounded-lg bg-background p-3 text-sm">
          <span className="font-medium">Khuyến nghị: </span>
          {violation.recommendation}
        </div>
      )}

      {violation.relatedEntryIds.length > 0 && onViewEntries && (
        <button
          type="button"
          onClick={() => onViewEntries(violation.relatedEntryIds)}
          className="text-xs text-primary underline-offset-2 hover:underline"
        >
          Xem nhật ký liên quan →
        </button>
      )}
    </div>
  );
}
