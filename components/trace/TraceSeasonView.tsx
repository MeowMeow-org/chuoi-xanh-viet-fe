"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  Hash,
  Leaf,
  Loader2,
  MapPin,
  Sprout,
  User,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  BadgeCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTraceSeasonQuery, useTraceVerifyQuery } from "@/hooks/useTrace";
import { formatDiaryRecordedAt } from "@/lib/diary-date";
import type { TraceDiaryEntry } from "@/services/trace";

const DIARY_EVENT_LABEL: Record<string, { label: string; icon: string }> = {
  land_prep: { label: "Làm đất", icon: "🌾" },
  sowing: { label: "Gieo trồng", icon: "🌱" },
  fertilizing: { label: "Bón phân", icon: "🧪" },
  pesticide: { label: "Phun thuốc", icon: "💧" },
  irrigation: { label: "Tưới nước", icon: "🚿" },
  harvesting: { label: "Thu hoạch", icon: "🧺" },
  packing: { label: "Đóng gói", icon: "📦" },
  inspection: { label: "Kiểm tra HTX", icon: "✅" },
  other: { label: "Khác", icon: "📝" },
};

const VERDICT_LABEL: Record<string, { label: string; className: string }> = {
  pass: { label: "Đạt", className: "bg-green-100 text-green-700" },
  needs_work: {
    label: "Cần cải thiện",
    className: "bg-amber-100 text-amber-700",
  },
  fail: { label: "Không đạt", className: "bg-red-100 text-red-700" },
};

export interface TraceSeasonViewProps {
  seasonId: string;
  headerTitle?: string;
  headerSubtitle?: string;
}

export default function TraceSeasonView({
  seasonId,
  headerTitle,
  headerSubtitle,
}: TraceSeasonViewProps) {
  const { data, isLoading, isError, error } = useTraceSeasonQuery(seasonId);
  const { data: verify, isLoading: verifying } = useTraceVerifyQuery(seasonId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải dữ liệu truy
        xuất...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <p className="font-medium">Không tải được thông tin truy xuất</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {(error as Error | undefined)?.message ??
              "Mã truy xuất không hợp lệ hoặc mùa vụ đã bị xoá."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { season, farm, owner, cooperative, diaries, saleUnits, anchors } =
    data;

  const latestAnchor = anchors[0];
  const sortedDiaries = [...diaries].sort((a, b) => {
    const ta = new Date(a.serverTimestamp ?? a.createdAt).getTime();
    const tb = new Date(b.serverTimestamp ?? b.createdAt).getTime();
    return tb - ta;
  });

  const verifyBadge = (() => {
    if (verifying) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        label: "Đang kiểm chứng...",
        className: "bg-muted text-muted-foreground",
      };
    }
    if (!verify) {
      return null;
    }
    if (verify.match === true) {
      return {
        icon: <ShieldCheck className="h-4 w-4" />,
        label: "Dữ liệu khớp blockchain",
        className: "bg-green-100 text-green-800",
      };
    }
    if (verify.match === false) {
      return {
        icon: <ShieldAlert className="h-4 w-4" />,
        label: "Dữ liệu KHÁC hash on-chain",
        className: "bg-red-100 text-red-800",
      };
    }
    return {
      icon: <ShieldAlert className="h-4 w-4" />,
      label: "Chưa neo on-chain",
      className: "bg-amber-100 text-amber-800",
    };
  })();

  return (
    <div className="space-y-4">
      {(headerTitle || headerSubtitle) && (
        <div>
          {headerTitle && <h1 className="text-xl font-bold">{headerTitle}</h1>}
          {headerSubtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {headerSubtitle}
            </p>
          )}
        </div>
      )}

      {/* Farm */}
      <Card className="border-primary/30">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Leaf className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">{farm.name}</h2>
              {owner && (
                <p className="text-sm font-medium">
                  <User className="mr-1 inline h-3 w-3" />
                  {owner.fullName}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {[farm.ward, farm.district, farm.province]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {farm.inCooperative && (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="h-3 w-3" />
                Thuộc hợp tác xã
              </Badge>
            )}
            {cooperative && (
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" />
                HTX: {cooperative.cooperativeUser.fullName}
              </Badge>
            )}
            {verifyBadge && (
              <Badge className={`gap-1 border-0 ${verifyBadge.className}`}>
                {verifyBadge.icon}
                {verifyBadge.label}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Season */}
      <Card>
        <CardContent className="space-y-2 p-4">
          <h3 className="text-base font-bold">Thông tin mùa vụ</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Mã:</span>{" "}
              <span className="font-mono">{season.code}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cây trồng:</span>{" "}
              {season.cropName}
            </div>
            <div>
              <span className="text-muted-foreground">Ngày bắt đầu:</span>{" "}
              {new Date(season.startDate).toLocaleDateString("vi-VN")}
            </div>
            <div>
              <span className="text-muted-foreground">Diện tích:</span>{" "}
              {farm.areaHa ? `${farm.areaHa} ha` : "—"}
            </div>
            {season.harvestStartDate && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Thu hoạch:</span>{" "}
                {new Date(season.harvestStartDate).toLocaleDateString("vi-VN")}
                {season.harvestEndDate &&
                  ` – ${new Date(season.harvestEndDate).toLocaleDateString("vi-VN")}`}
              </div>
            )}
            {season.actualYield && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Sản lượng:</span>{" "}
                {season.actualYield} {season.yieldUnit ?? ""}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anchor / verify */}
      {latestAnchor && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Neo blockchain</h3>
              <Badge
                variant={
                  latestAnchor.status === "anchored" ? "secondary" : "outline"
                }
                className="gap-1"
              >
                {latestAnchor.status === "anchored" ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
                {latestAnchor.status === "anchored"
                  ? "Đã neo"
                  : latestAnchor.status}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>
                <Hash className="mr-1 inline h-3 w-3" /> Data hash:{" "}
                <span className="break-all font-mono text-foreground">
                  {latestAnchor.dataHash}
                </span>
              </div>
              {verify?.onChainHash &&
                verify.onChainHash !== latestAnchor.dataHash && (
                  <div>
                    <Hash className="mr-1 inline h-3 w-3" /> Hash on-chain:{" "}
                    <span className="break-all font-mono text-red-600">
                      {verify.onChainHash}
                    </span>
                  </div>
                )}
              {latestAnchor.txHash && (
                <div>
                  Tx:{" "}
                  <span className="break-all font-mono text-foreground">
                    {latestAnchor.txHash}
                  </span>
                </div>
              )}
              {latestAnchor.anchoredAt && (
                <div>
                  Thời gian:{" "}
                  {new Date(latestAnchor.anchoredAt).toLocaleString("vi-VN")}
                </div>
              )}
            </div>
            {latestAnchor.txUrl && (
              <a
                href={latestAnchor.txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5",
                )}
              >
                <ExternalLink className="h-3 w-3" />
                Xem trên Etherscan
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sale units */}
      {saleUnits.length > 0 && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <h3 className="text-base font-bold">Lô bán đã phát hành</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {saleUnits.map((u) => (
                <div
                  key={u.id}
                  className="rounded-lg border bg-card p-3 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold">
                      {u.shortCode ?? u.code}
                    </span>
                    <Badge
                      variant={u.status === "active" ? "secondary" : "outline"}
                    >
                      {u.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {u.quantity} {u.unit}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h3 className="text-base font-bold">
            Nhật ký canh tác ({sortedDiaries.length} hoạt động)
          </h3>
          {sortedDiaries.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Chưa có mục nhật ký nào.
            </p>
          )}
          <div>
            {sortedDiaries.map((entry, idx) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                isLast={idx === sortedDiaries.length - 1}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimelineItem({
  entry,
  isLast,
}: {
  entry: TraceDiaryEntry;
  isLast: boolean;
}) {
  const meta = DIARY_EVENT_LABEL[entry.eventType] ?? DIARY_EVENT_LABEL.other;
  const isInspection = entry.eventType === "inspection";
  const verdict =
    isInspection &&
    entry.extraData &&
    typeof entry.extraData === "object" &&
    "verdict" in (entry.extraData as Record<string, unknown>)
      ? ((entry.extraData as { verdict?: string }).verdict ?? null)
      : null;
  const summary =
    isInspection &&
    entry.extraData &&
    typeof entry.extraData === "object" &&
    "summary" in (entry.extraData as Record<string, unknown>)
      ? ((entry.extraData as { summary?: string | null }).summary ?? null)
      : null;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm">
          {meta.icon}
        </div>
        {!isLast && <div className="my-1 w-0.5 flex-1 bg-border" />}
      </div>
      <div className="flex-1 pb-4">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">{meta.label}</span>
          {isInspection && (
            <Badge variant="outline" className="gap-1 text-[10px]">
              <ClipboardCheck className="h-3 w-3" />
              HTX
            </Badge>
          )}
          {verdict && VERDICT_LABEL[verdict] && (
            <Badge
              className={`border-0 text-[10px] ${VERDICT_LABEL[verdict].className}`}
            >
              {VERDICT_LABEL[verdict].label}
            </Badge>
          )}
        </div>
        {(entry.description || summary) && (
          <p className="text-xs text-muted-foreground">
            {entry.description ?? summary}
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-none text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            {formatDiaryRecordedAt(entry.serverTimestamp ?? entry.createdAt)}
          </span>
          {entry.actor && (
            <>
              <span>·</span>
              <Sprout className="h-3 w-3" />
              {entry.actor.fullName}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
