"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  RefreshCw,
  Star,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import type { AiReviewSummary } from "@/services/review";
import { reviewService } from "@/services/review/reviewService";
import { cn } from "@/lib/utils";

// ─── Star display ────────────────────────────────────────────────────────────

function StarsRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/35",
          )}
        />
      ))}
    </span>
  );
}

// ─── Sentiment badge ─────────────────────────────────────────────────────────

function SentimentBadge({
  sentiment,
}: {
  sentiment: AiReviewSummary["overallSentiment"];
}) {
  const map = {
    positive: {
      label: "Tích cực",
      className: "bg-green-100 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    negative: {
      label: "Tiêu cực",
      className: "bg-red-100 text-red-700 border-red-200",
      dot: "bg-red-500",
    },
    mixed: {
      label: "Hỗn hợp",
      className: "bg-amber-100 text-amber-700 border-amber-200",
      dot: "bg-amber-400",
    },
  } as const;
  const cfg = map[sentiment];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Section list (hides when empty) ─────────────────────────────────────────

function SummarySection({
  icon,
  title,
  items,
  itemClassName,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  itemClassName?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-[hsl(150,10%,22%)]">
        {icon}
        {title}
      </div>
      <ul className="space-y-1 pl-1">
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              "flex items-start gap-2 text-sm text-[hsl(150,10%,28%)]",
              itemClassName,
            )}
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── AI Summary card ─────────────────────────────────────────────────────────

function AiSummaryCard({
  summary,
  onReanalyze,
  isAnalyzing,
}: {
  summary: AiReviewSummary;
  onReanalyze: () => void;
  isAnalyzing: boolean;
}) {
  const analyzedAt = new Date(summary.analyzedAt).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="border-[hsl(142,14%,88%)]">
      <CardContent className="space-y-4 p-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(150,10%,18%)]">
              <Bot className="h-4 w-4 text-[hsl(142,71%,40%)]" />
              Báo cáo AI
            </div>
            <p className="text-xs text-[hsl(150,7%,45%)]">
              Phân tích {summary.analyzedCount} đánh giá
              {summary.ignoredCount > 0
                ? ` · bỏ qua ${summary.ignoredCount} spam`
                : ""}
              {summary.averageRating != null
                ? ` · ★ ${summary.averageRating.toFixed(1)}`
                : ""}
              {" · "}
              Cập nhật {analyzedAt}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 text-xs"
            onClick={onReanalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Phân tích lại
          </Button>
        </div>

        <div className="border-t pt-3 space-y-4">
          {/* Overall sentiment + summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(150,10%,22%)]">
              <Zap className="h-4 w-4 text-[hsl(142,71%,40%)]" />
              Tổng quan
            </div>
            <SentimentBadge sentiment={summary.overallSentiment} />
            <p className="text-sm leading-relaxed text-[hsl(150,10%,28%)]">
              {summary.summary}
            </p>
          </div>

          <SummarySection
            icon={<ThumbsUp className="h-4 w-4 text-green-600" />}
            title="Điểm khách khen"
            items={summary.positivePoints}
          />
          <SummarySection
            icon={<ThumbsDown className="h-4 w-4 text-red-500" />}
            title="Điểm cần cải thiện"
            items={summary.negativePoints}
          />
          <SummarySection
            icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
            title="Góp ý từ khách"
            items={summary.suggestions}
          />
          <SummarySection
            icon={<CheckCircle2 className="h-4 w-4 text-[hsl(142,71%,40%)]" />}
            title="Việc nên làm ngay"
            items={summary.actionItems}
            itemClassName="font-medium"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── AI Summary section (loading / empty / result) ───────────────────────────

function ShopAiSummarySection({ shopId }: { shopId: string }) {
  const qc = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["shop-ai-summary", shopId],
    queryFn: () => reviewService.getShopSummary(shopId),
    retry: (failureCount, error) => {
      // 404 = no report yet — don't retry
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => reviewService.analyzeShopSummary(shopId),
    onSuccess: (data) => {
      qc.setQueryData(["shop-ai-summary", shopId], data);
      toast.success("Phân tích hoàn tất!");
    },
    onError: () => {},
  });

  const has404 =
    (summaryQuery.error as { response?: { status?: number } } | null)?.response
      ?.status === 404;
  const hasSummary = !!summaryQuery.data;
  const isLoading = summaryQuery.isLoading;
  const isAnalyzing = analyzeMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[hsl(150,10%,22%)]">
        <Bot className="h-4 w-4 text-[hsl(142,71%,40%)]" />
        Phân tích AI
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-[hsl(142,14%,88%)] bg-white px-4 py-4 text-sm text-[hsl(150,7%,45%)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải báo cáo…
        </div>
      )}

      {isAnalyzing && (
        <Card className="border-[hsl(142,14%,88%)] bg-[hsl(120,22%,97%)]">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(142,71%,40%)]" />
            <p className="text-sm font-medium text-[hsl(150,10%,22%)]">
              Đang phân tích…
            </p>
            <p className="text-xs text-[hsl(150,7%,45%)]">
              AI đang đọc các đánh giá, vui lòng chờ trong giây lát (3–10 giây).
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isAnalyzing && (has404 || summaryQuery.isError) && !hasSummary && (
        <Card className="border-[hsl(142,14%,88%)]">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Bot className="h-8 w-8 text-[hsl(142,71%,40%)]/60" />
            <div>
              <p className="text-sm font-medium text-[hsl(150,10%,22%)]">
                Chưa có báo cáo phân tích
              </p>
              <p className="mt-1 text-xs text-[hsl(150,7%,45%)]">
                Nhấn &quot;Phân tích ngay&quot; để AI tổng hợp tất cả đánh giá của khách hàng.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 bg-[hsl(142,69%,45%)] hover:bg-[hsl(142,69%,40%)]"
              onClick={() => analyzeMutation.mutate()}
              disabled={isAnalyzing}
            >
              <Zap className="h-3.5 w-3.5" />
              Phân tích ngay
            </Button>
          </CardContent>
        </Card>
      )}

      {!isAnalyzing && hasSummary && (
        <AiSummaryCard
          summary={summaryQuery.data!}
          onReanalyze={() => analyzeMutation.mutate()}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export function FarmerShopReviewsPanel({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const [page, setPage] = useState(1);

  const reviewsQuery = useQuery({
    queryKey: ["farmer-shop-reviews", shopId, page],
    queryFn: () =>
      reviewService.listByShop(shopId, { page, limit: PAGE_SIZE }),
    enabled: !!shopId,
  });

  const reviewItems = reviewsQuery.data?.items ?? [];
  const reviewMeta = reviewsQuery.data?.meta;
  const totalPages = reviewMeta?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <ShopAiSummarySection shopId={shopId} />

      <div className="border-t pt-2" />

      {/* Reviews list header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[hsl(142,14%,88%)] bg-white px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[hsl(150,10%,22%)]">
            <Star className="h-4 w-4 text-amber-500" />
            Đánh giá khách hàng ({shopName})
          </div>
          {reviewsQuery.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[hsl(150,7%,45%)]" />
          ) : reviewMeta ? (
            <span className="text-sm text-[hsl(150,7%,42%)]">
              {reviewMeta.reviewCount > 0 && reviewMeta.averageRating != null
                ? `★ ${reviewMeta.averageRating.toFixed(1)} · ${reviewMeta.reviewCount} đánh giá`
                : "Chưa có đánh giá"}
            </span>
          ) : null}
        </div>

        {reviewsQuery.isError && (
          <p className="text-sm text-red-600">
            Không tải được đánh giá. Thử tải lại trang.
          </p>
        )}

        {!reviewsQuery.isLoading &&
          !reviewsQuery.isError &&
          reviewItems.length === 0 && (
            <Card className="border-[hsl(142,14%,88%)]">
              <CardContent className="py-10 text-center text-sm text-[hsl(150,7%,42%)]">
                Chưa có đánh giá nào. Khi khách hoàn tất đơn và đánh giá từng sản
                phẩm, nội dung sẽ hiển thị tại đây.
              </CardContent>
            </Card>
          )}

        {reviewItems.length > 0 && (
          <>
            <div className="space-y-3">
              {reviewItems.map((r) => (
                <Card key={r.id} className="border-[hsl(142,14%,88%)]">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[hsl(142,71%,45%)]/15 text-xs font-semibold text-[hsl(142,71%,35%)]">
                        {r.reviewer.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.reviewer.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          (r.reviewer.fullName?.trim()?.[0] ?? "?").toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/product/${r.product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-full items-center gap-2 rounded-md border border-[hsl(142,14%,88%)] bg-[hsl(120,22%,97%)] px-2 py-1 text-xs font-medium text-[hsl(150,10%,18%)] hover:bg-[hsl(120,18%,94%)]"
                          >
                            {r.product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={r.product.imageUrl}
                                alt=""
                                className="h-7 w-7 shrink-0 rounded object-cover"
                              />
                            ) : null}
                            <span className="truncate">{r.product.name}</span>
                          </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="truncate text-sm font-medium text-[hsl(150,10%,18%)]">
                            {r.reviewer.fullName?.trim() || "Người mua"}
                          </span>
                          {r.isVerifiedPurchase && (
                            <Badge variant="secondary" className="text-[10px]">
                              Đã mua
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StarsRow rating={r.rating} />
                          <span className="text-[11px] text-[hsl(150,7%,45%)]">
                            {new Date(r.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        {r.comment ? (
                          <p className="whitespace-pre-wrap break-words text-sm text-[hsl(150,10%,22%)]">
                            {r.comment}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={page <= 1 || reviewsQuery.isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Trang trước"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-[hsl(150,7%,45%)]">
                  {page} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={page >= totalPages || reviewsQuery.isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Trang sau"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Warning for no reviews needed for AI analysis */}
      {!reviewsQuery.isLoading && reviewItems.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-2 p-4">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-700">
              Gian hàng chưa có đánh giá nào. Cần có ít nhất 1 đánh giá thực
              chất để AI có thể phân tích.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
