"use client";

import { ShieldCheck } from "lucide-react";

import type { ScanViolation } from "@/services/diary";

import ScanViolationCard from "./ScanViolationCard";

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;

interface ScanViolationListProps {
  violations: ScanViolation[];
  onViewEntries?: (ids: string[]) => void;
}

export default function ScanViolationList({
  violations,
  onViewEntries,
}: ScanViolationListProps) {
  if (violations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <ShieldCheck className="h-10 w-10 text-green-500" />
        <p className="text-sm">Không phát hiện vi phạm nào</p>
      </div>
    );
  }

  const sorted = [...violations].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <div className="space-y-3">
      {sorted.map((v, i) => (
        <ScanViolationCard
          key={`${v.code}-${i}`}
          violation={v}
          onViewEntries={onViewEntries}
        />
      ))}
    </div>
  );
}
