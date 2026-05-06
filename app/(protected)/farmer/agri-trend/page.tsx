"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart2,
  Bug,
  Clock,
  CloudRain,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Sprout,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAgriTrendQuery, useRefreshAgriTrendMutation } from "@/hooks/useAgriTrend";
import type {
  AgriAlert,
  EvidenceArticle,
  HotCrop,
  MarketSignals,
  TechSpotlightItem,
} from "@/services/agri-trend";
import { formatDateTimeVN } from "@/lib/formatDateTimeVN";
import { cn } from "@/lib/utils";

const REFRESH_COOLDOWN_MS = 5 * 60 * 1000;
const LS_REFRESH_KEY = "agri-trend-last-refresh";

function getCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(LS_REFRESH_KEY);
  if (!stored) return 0;
  const last = parseInt(stored, 10);
  if (isNaN(last)) return 0;
  return Math.max(0, REFRESH_COOLDOWN_MS - (Date.now() - last));
}

function formatCooldown(secs: number): string {
  if (secs <= 0) return "";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function EvidenceLinks({
  items,
  className,
}: {
  items: EvidenceArticle[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <span className="text-[11px] text-muted-foreground">Nguồn:</span>
      {items.map((ev, i) => (
        <a
          key={i}
          href={ev.url}
          target="_blank"
          rel="noopener noreferrer"
          title={ev.title}
          className="inline-flex items-center gap-1 rounded-full border border-[hsl(142,15%,88%)] bg-[hsl(120,10%,98%)] px-2 py-0.5 text-[11px] text-[hsl(150,10%,40%)] transition-colors hover:border-[hsl(142,45%,72%)] hover:bg-[hsl(142,71%,45%)]/8 hover:text-[hsl(142,50%,28%)]"
        >
          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
          <span className="max-w-[100px] truncate">
            {ev.source || ev.title}
          </span>
        </a>
      ))}
    </div>
  );
}

function SentimentBadge({
  sentiment,
}: {
  sentiment: "positive" | "negative" | "neutral";
}) {
  const map = {
    positive: {
      label: "Tích cực",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    negative: {
      label: "Tiêu cực",
      cls: "bg-red-50 text-red-700 border-red-200",
    },
    neutral: {
      label: "Trung tính",
      cls: "bg-gray-50 text-gray-500 border-gray-200",
    },
  };
  const { label, cls } = map[sentiment];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        cls,
      )}
    >
      {label}
    </span>
  );
}

function TrendScoreBar({ score }: { score: number }) {
  const barColor =
    score >= 70
      ? "bg-[hsl(142,71%,45%)]"
      : score >= 40
        ? "bg-amber-400"
        : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(120,10%,92%)]">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs font-bold tabular-nums text-[hsl(150,10%,25%)]">
        {score}
      </span>
    </div>
  );
}

const alertTypeConfig: Record<
  AgriAlert["type"],
  { label: string; Icon: React.ElementType }
> = {
  disease: { label: "Sâu bệnh", Icon: Bug },
  weather: { label: "Thời tiết", Icon: CloudRain },
  price: { label: "Giá cả", Icon: TrendingDown },
  policy: { label: "Chính sách", Icon: FileText },
};

const alertSeverityConfig: Record<
  AgriAlert["severity"],
  { label: string; containerCls: string; textCls: string; badgeCls: string }
> = {
  high: {
    label: "CAO",
    containerCls: "border-red-200 bg-red-50",
    textCls: "text-red-700",
    badgeCls: "bg-red-600 text-white",
  },
  medium: {
    label: "TRUNG BÌNH",
    containerCls: "border-amber-200 bg-amber-50",
    textCls: "text-amber-800",
    badgeCls: "bg-amber-500 text-white",
  },
  low: {
    label: "THẤP",
    containerCls: "border-[hsl(142,15%,88%)] bg-white",
    textCls: "text-[hsl(150,10%,30%)]",
    badgeCls: "bg-gray-400 text-white",
  },
};

// ─── Section components ───────────────────────────────────────────────────────

function HotCropCard({ crop }: { crop: HotCrop }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-[hsl(150,10%,15%)]">{crop.name}</p>
        <SentimentBadge sentiment={crop.sentiment} />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Điểm xu hướng
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            /100
          </span>
        </div>
        <TrendScoreBar score={crop.trendScore} />
      </div>
      <p className="text-sm leading-relaxed text-[hsl(150,10%,25%)]">
        {crop.reason}
      </p>
      <EvidenceLinks items={crop.evidence} className="mt-auto pt-1" />
    </Card>
  );
}

function MarketSignalsSection({ signals }: { signals: MarketSignals }) {
  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(142,71%,45%)]/12">
          <BarChart2 className="h-4 w-4 text-[hsl(142,71%,38%)]" />
        </span>
        <h2 className="font-semibold text-[hsl(150,10%,15%)]">
          Tín hiệu thị trường
        </h2>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Nguồn cung
          </p>
          <p className="text-sm leading-relaxed text-[hsl(150,10%,20%)]">
            {signals.supplyPressure}
          </p>
        </div>

        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Nhu cầu
          </p>
          <p className="text-sm leading-relaxed text-[hsl(150,10%,20%)]">
            {signals.demandSignals}
          </p>
        </div>

        {signals.priceAlerts.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cảnh báo giá
            </p>
            <ul className="space-y-1.5">
              {signals.priceAlerts.map((alert, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span className="text-[hsl(150,10%,20%)]">{alert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <EvidenceLinks items={signals.evidence} />
    </Card>
  );
}

function TechSpotlightSection({ items }: { items: TechSpotlightItem[] }) {
  return (
    <Card className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(142,71%,45%)]/12">
          <Zap className="h-4 w-4 text-[hsl(142,71%,38%)]" />
        </span>
        <h2 className="font-semibold text-[hsl(150,10%,15%)]">
          Công nghệ nổi bật
        </h2>
      </div>

      <div className="flex flex-1 flex-col divide-y divide-[hsl(142,15%,92%)]">
        {items.map((tech, i) => (
          <div key={i} className={cn("flex flex-col gap-2", i > 0 && "pt-4")}>
            <p className="font-medium text-sm text-[hsl(150,10%,15%)]">
              {tech.title}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tech.summary}
            </p>
            <p className="text-sm leading-relaxed text-[hsl(142,50%,30%)]">
              <span className="font-medium">Tác động: </span>
              {tech.impact}
            </p>
            <EvidenceLinks items={tech.evidence} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function AlertItem({ alert }: { alert: AgriAlert }) {
  const { containerCls, textCls, badgeCls, label } =
    alertSeverityConfig[alert.severity];
  const { Icon, label: typeLabel } = alertTypeConfig[alert.type];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        containerCls,
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          alert.severity === "high"
            ? "bg-red-100"
            : alert.severity === "medium"
              ? "bg-amber-100"
              : "bg-gray-100",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            alert.severity === "high"
              ? "text-red-600"
              : alert.severity === "medium"
                ? "text-amber-600"
                : "text-gray-500",
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-xs font-semibold",
              alert.severity === "high"
                ? "text-red-800"
                : alert.severity === "medium"
                  ? "text-amber-900"
                  : "text-[hsl(150,10%,25%)]",
            )}
          >
            {typeLabel}
          </span>
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
              badgeCls,
            )}
          >
            {label}
          </span>
        </div>
        <p className={cn("text-sm leading-relaxed", textCls)}>
          {alert.message}
        </p>
        <EvidenceLinks items={alert.evidence} className="mt-2" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgriTrendPage() {
  const { data, isLoading, isError, refetch } = useAgriTrendQuery();
  const refreshMutation = useRefreshAgriTrendMutation();
  const [cooldownSecs, setCooldownSecs] = useState(0);

  useEffect(() => {
    const tick = () => setCooldownSecs(Math.ceil(getCooldownRemaining() / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleRefresh = async () => {
    await refreshMutation.mutateAsync();
    localStorage.setItem(LS_REFRESH_KEY, String(Date.now()));
    setCooldownSecs(Math.ceil(REFRESH_COOLDOWN_MS / 1000));
  };

  const refreshDisabled = cooldownSecs > 0 || refreshMutation.isPending;

  const highAlerts = data?.alerts.filter((a) => a.severity === "high") ?? [];
  const otherAlerts = data?.alerts.filter((a) => a.severity !== "high") ?? [];

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[hsl(142,15%,88%)] bg-white">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(142,50%,40%)]" />
            <p className="text-sm text-muted-foreground">
              Đang tải xu hướng nông nghiệp…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (isError || !data || !data.generatedAt) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8">
          <AlertTriangle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-red-600">
            Không thể tải dữ liệu xu hướng nông nghiệp.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const cacheIsExpired = new Date(data.cacheExpiresAt) < new Date();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-24 sm:px-6 md:pb-8">

      {/* ── Header ── */}
      <header className="flex flex-col gap-4 rounded-2xl border border-[hsl(142,15%,88%)] bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(142,71%,45%)]/12">
              <TrendingUp className="h-5 w-5 text-[hsl(142,71%,38%)]" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[hsl(150,10%,15%)]">
              Xu hướng Nông nghiệp
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sprout className="h-3.5 w-3.5" />
              {data.totalArticlesAnalyzed} bài báo được phân tích
            </span>
            <span>·</span>
            <span>
              Cập nhật {formatDateTimeVN(data.generatedAt)}
            </span>
            <span>·</span>
            <span
              className={cn(
                "flex items-center gap-1",
                cacheIsExpired && "text-amber-600",
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {cacheIsExpired
                ? "Cache đã hết hạn"
                : `Hết hạn ${formatDateTimeVN(data.cacheExpiresAt)}`}
            </span>
          </div>
        </div>

        <Button
          onClick={() => void handleRefresh()}
          disabled={refreshDisabled}
          size="sm"
          className={cn(
            "shrink-0 gap-2 self-start",
            refreshDisabled
              ? "border border-[hsl(142,15%,88%)] bg-white text-muted-foreground hover:bg-white"
              : "bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]",
          )}
        >
          {refreshMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : cooldownSecs > 0 ? (
            <Clock className="h-4 w-4" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshMutation.isPending
            ? "Đang phân tích…"
            : cooldownSecs > 0
              ? `Chờ ${formatCooldown(cooldownSecs)}`
              : "Làm mới"}
        </Button>
      </header>

      {/* ── AI Summary ── */}
      <div className="overflow-hidden rounded-2xl border border-[hsl(142,15%,88%)] bg-white">
        <div className="flex gap-4 p-5">
          <div className="w-1 shrink-0 rounded-full bg-[hsl(142,71%,45%)]" />
          <p className="text-sm leading-7 text-[hsl(150,10%,20%)]">
            {data.summary}
          </p>
        </div>
      </div>

      {/* ── High-severity alerts ── */}
      {highAlerts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-sm font-semibold text-[hsl(150,10%,15%)]">
              Cảnh báo quan trọng
            </h2>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
              {highAlerts.length}
            </span>
          </div>
          <div className="space-y-3">
            {highAlerts.map((alert, i) => (
              <AlertItem key={i} alert={alert} />
            ))}
          </div>
        </section>
      )}

      {/* ── Hot Crops ── */}
      {data.hotCrops.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-[hsl(142,71%,38%)]" />
            <h2 className="text-sm font-semibold text-[hsl(150,10%,15%)]">
              Cây trồng nổi bật
            </h2>
            <span className="rounded-full bg-[hsl(142,71%,45%)]/12 px-2 py-0.5 text-[11px] font-semibold text-[hsl(142,50%,30%)]">
              {data.hotCrops.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.hotCrops.map((crop, i) => (
              <HotCropCard key={i} crop={crop} />
            ))}
          </div>
        </section>
      )}

      {/* ── Market Signals + Tech Spotlight ── */}
      <div
        className={cn(
          "grid gap-5",
          data.techSpotlight.length > 0 && "lg:grid-cols-2",
        )}
      >
        <MarketSignalsSection signals={data.marketSignals} />
        {data.techSpotlight.length > 0 && (
          <TechSpotlightSection items={data.techSpotlight} />
        )}
      </div>

      {/* ── Medium / Low alerts ── */}
      {otherAlerts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-[hsl(150,10%,15%)]">
              Cảnh báo khác
            </h2>
          </div>
          <div className="space-y-3">
            {otherAlerts.map((alert, i) => (
              <AlertItem key={i} alert={alert} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
