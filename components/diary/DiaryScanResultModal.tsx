"use client";

import { Bot } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DiaryScanResult } from "@/services/diary";

import OverallRiskBadge from "./OverallRiskBadge";
import ScanViolationList from "./ScanViolationList";

interface DiaryScanResultModalProps {
  result: DiaryScanResult | null;
  open: boolean;
  onClose: () => void;
  onViewEntries?: (ids: string[]) => void;
}

function formatScanTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = d.toLocaleDateString("vi-VN");
    return `${time} - ${date}`;
  } catch {
    return isoString;
  }
}

export default function DiaryScanResultModal({
  result,
  open,
  onClose,
  onViewEntries,
}: DiaryScanResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Kết quả kiểm tra AI</DialogTitle>
        </DialogHeader>

        {result && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-2 py-2">
              <OverallRiskBadge risk={result.overallRisk} />
              <p className="text-xs text-muted-foreground">
                Kiểm tra lúc: {formatScanTime(result.scannedAt)}
              </p>
            </div>

            {result.overallRisk === "critical" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                ⚠️ Phát hiện vi phạm nghiêm trọng. Cần xử lý trước khi nộp mùa vụ.
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Danh sách vi phạm ({result.violations.length})
              </h3>
              <ScanViolationList
                violations={result.violations}
                onViewEntries={onViewEntries}
              />
            </div>

            <div className="space-y-2 rounded-xl border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-4 w-4" />
                Nhận xét của AI
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.summary}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
