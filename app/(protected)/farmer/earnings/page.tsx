"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Percent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { orderService } from "@/services/order/orderService";
import type { Order, OrderStatus } from "@/services/order";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString("vi-VN") : "0";

const SHOP_EARNINGS_KEY = "farmer-shop-earnings";

/** Monday 00:00 local của tuần chứa ngày `d` (ISO: thứ Hai là đầu tuần). */
function startOfIsoWeekContaining(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay() || 7;
  x.setDate(x.getDate() - (day - 1));
  return x;
}

/** Chuỗi yyyy-Www cho `input type="week"` từ thứ Hai đầu tuần. */
function mondayToHtmlWeek(monday: Date): string {
  const d = new Date(monday);
  d.setHours(0, 0, 0, 0);
  const thu = new Date(d);
  thu.setDate(d.getDate() + 3);
  const isoYear = thu.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const j4d = jan4.getDay() || 7;
  const w1Mon = new Date(jan4);
  w1Mon.setDate(jan4.getDate() - (j4d - 1));
  w1Mon.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - w1Mon.getTime()) / 86400000);
  const weekNum = Math.floor(diffDays / 7) + 1;
  return `${isoYear}-W${String(weekNum).padStart(2, "0")}`;
}

/** Parse yyyy-Www → thứ Hai 00:00 local (khớp tuần ISO). */
function parseHtmlWeekToMonday(weekVal: string): Date | null {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekVal.trim());
  if (!m) return null;
  const weekYear = Number(m[1]);
  const weekNum = Number(m[2]);
  const jan4 = new Date(weekYear, 0, 4);
  const day = jan4.getDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - (day - 1));
  week1Monday.setHours(0, 0, 0, 0);
  const monday = new Date(week1Monday);
  monday.setDate(week1Monday.getDate() + (weekNum - 1) * 7);
  return monday;
}

/** 00:00 ngày mai (local) — mốc `to` độc quyền cho khoảng [from, to). */
function startOfTomorrowLocal(): Date {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  return t;
}

/** yyyy-MM-dd hôm nay (local) cho max của input date. */
function todayDateInputLocal(): string {
  const n = new Date();
  const y = n.getFullYear();
  const mm = String(n.getMonth() + 1).padStart(2, "0");
  const day = String(n.getDate()).padStart(2, "0");
  return `${y}-${mm}-${day}`;
}

function isoWeekShortLabel(weekVal: string): string {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekVal.trim());
  if (!m) return "";
  return `Tuần ${Number(m[2])} · ${m[1]}`;
}

function shiftWeekInputCapped(weekVal: string, deltaWeeks: number): string {
  const thisMon = startOfIsoWeekContaining(new Date());
  const curMon = parseHtmlWeekToMonday(weekVal);
  if (!curMon) return mondayToHtmlWeek(thisMon);
  const target = new Date(curMon);
  target.setDate(target.getDate() + deltaWeeks * 7);
  if (target.getTime() > thisMon.getTime()) {
    return mondayToHtmlWeek(thisMon);
  }
  return mondayToHtmlWeek(target);
}

/** Giá trị YYYY-MM-DD (local) cho input date — thứ Hai của tuần đang chọn. */
function weekInputToDateValue(weekVal: string): string {
  const mon = parseHtmlWeekToMonday(weekVal);
  const d = mon ?? startOfIsoWeekContaining(new Date());
  const y = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mm}-${day}`;
}

const selectFieldClass = cn(
  "h-8 w-full min-w-0 rounded-sm border border-input bg-background px-2.5 text-sm text-foreground",
  "outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
);

const STATUS_VI: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default function FarmerEarningsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: [SHOP_EARNINGS_KEY],
    queryFn: () => orderService.getShopEarnings(),
  });

  const [periodTab, setPeriodTab] = useState<"year" | "month" | "week">("month");
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [monthInput, setMonthInput] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [weekInput, setWeekInput] = useState(() =>
    mondayToHtmlWeek(startOfIsoWeekContaining(new Date())),
  );

  const currentCalendarYear = new Date().getFullYear();
  const effectiveYear = Math.min(year, currentCalendarYear);

  const yearChoices = useMemo(() => {
    const maxY = currentCalendarYear;
    const start = 2020;
    if (maxY < start) return [maxY];
    return Array.from({ length: maxY - start + 1 }, (_, i) => start + i);
  }, [currentCalendarYear]);

  const monthParts = useMemo(() => {
    const [y, m] = monthInput.split("-").map(Number);
    if (!y || !m)
      return {
        y: currentCalendarYear,
        m: new Date().getMonth() + 1,
      };
    const cap = y === currentCalendarYear ? new Date().getMonth() + 1 : 12;
    return { y, m: Math.min(m, cap) };
  }, [monthInput, currentCalendarYear]);

  const effectiveWeekInput = useMemo(() => {
    const mon = parseHtmlWeekToMonday(weekInput);
    if (!mon) return weekInput;
    const thisMon = startOfIsoWeekContaining(new Date());
    if (mon.getTime() > thisMon.getTime()) return mondayToHtmlWeek(thisMon);
    return weekInput;
  }, [weekInput]);

  const periodArgs = useMemo(() => {
    const capTo = startOfTomorrowLocal();

    if (periodTab === "year") {
      const from = new Date(effectiveYear, 0, 1);
      const yearEnd = new Date(effectiveYear + 1, 0, 1);
      const to =
        yearEnd.getTime() < capTo.getTime() ? yearEnd : capTo;
      if (to.getTime() <= from.getTime()) return null;
      return {
        fromIso: from.toISOString(),
        toIso: to.toISOString(),
        bucket: "month" as const,
        hint: `Trong năm ${effectiveYear}, mỗi dòng là một tháng (tiền đã giao xong). Chỉ tính đến hôm nay.`,
      };
    }
    if (periodTab === "month") {
      const yy = monthParts.y;
      const mm = monthParts.m;
      if (!yy || !mm) return null;
      const from = new Date(yy, mm - 1, 1);
      const monthEnd = new Date(yy, mm, 1);
      const to =
        monthEnd.getTime() < capTo.getTime() ? monthEnd : capTo;
      if (to.getTime() <= from.getTime()) return null;
      return {
        fromIso: from.toISOString(),
        toIso: to.toISOString(),
        bucket: "week" as const,
        hint: `Trong tháng đã chọn, mỗi dòng khoảng 7 ngày (tiền đã giao xong). Chỉ tính đến hôm nay.`,
      };
    }
    const monday = parseHtmlWeekToMonday(effectiveWeekInput);
    if (!monday) return null;
    const weekEnd = new Date(monday);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const to =
      weekEnd.getTime() < capTo.getTime() ? weekEnd : capTo;
    if (to.getTime() <= monday.getTime()) return null;
    return {
      fromIso: monday.toISOString(),
      toIso: to.toISOString(),
      bucket: "day" as const,
      hint: `Trong tuần đã chọn, mỗi dòng một ngày (tiền đã giao xong). Ngày sau hôm nay không hiển thị.`,
    };
  }, [periodTab, effectiveYear, monthParts, effectiveWeekInput]);

  const { data: breakdown, isLoading: bdLoading } = useQuery({
    queryKey: ["shop-earnings-breakdown", periodArgs?.fromIso, periodArgs?.toIso, periodArgs?.bucket],
    queryFn: () =>
      orderService.getShopEarningsBreakdown({
        from: periodArgs!.fromIso,
        to: periodArgs!.toIso,
        bucket: periodArgs!.bucket,
      }),
    enabled: !!periodArgs,
  });

  const { data: ordersInPeriod, isLoading: ordLoading } = useQuery({
    queryKey: ["shop-earnings-orders", periodArgs?.fromIso, periodArgs?.toIso],
    queryFn: () =>
      orderService.getShopEarningsOrders({
        from: periodArgs!.fromIso,
        to: periodArgs!.toIso,
        page: 1,
        limit: 80,
      }),
    enabled: !!periodArgs,
  });

  const { data: byFarm, isLoading: farmLoading } = useQuery({
    queryKey: ["shop-earnings-by-farm", periodArgs?.fromIso, periodArgs?.toIso],
    queryFn: () =>
      orderService.getShopEarningsByFarm({
        from: periodArgs!.fromIso,
        to: periodArgs!.toIso,
      }),
    enabled: !!periodArgs,
  });

  const weekRangeHint = useMemo(() => {
    const mon = parseHtmlWeekToMonday(effectiveWeekInput);
    if (!mon) return "";
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    const short = (d: Date) =>
      d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" });
    if (sun.getTime() > today0.getTime()) {
      return `${short(mon)} → ${short(today0)} (tuần này, báo cáo đến hôm nay)`;
    }
    return `${short(mon)} → ${short(sun)}`;
  }, [effectiveWeekInput]);

  const setMonthParts = (y: number, m: number) => {
    setMonthInput(`${y}-${String(m).padStart(2, "0")}`);
  };

  const maxMonthForYear = (y: number) =>
    y === currentCalendarYear ? new Date().getMonth() + 1 : 12;

  const weekNextDisabled = useMemo(() => {
    const mon = parseHtmlWeekToMonday(effectiveWeekInput);
    if (!mon) return true;
    const thisMon = startOfIsoWeekContaining(new Date());
    return mon.getTime() >= thisMon.getTime();
  }, [effectiveWeekInput]);

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-4 pb-24 md:pb-8">
      <div className="flex items-start gap-2">
        <TrendingUp className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Lợi nhuận</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Số liệu dựa trên đơn hàng của bạn. Khi bạn xác nhận đơn, hệ thống
            hiện mức <strong>dự kiến</strong> còn lại sau khi trừ phí ứng dụng.
            Khi đơn chuyển sang <strong>đã giao</strong>, số tiền được{" "}
            <strong>cập nhật chính thức</strong>.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError || !data ? (
        <p className="py-8 text-center text-sm text-destructive">
          Không tải được báo cáo. Thử lại sau.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border-primary/20 bg-primary/3 shadow-sm">
            <CardContent className="space-y-1.5 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Tiền về túi (đơn đã giao xong)
              </p>
              <p className="text-2xl font-bold text-primary">
                {fmt(data.finalizedSellerPayout)}đ
              </p>
              <p className="text-[11px] text-muted-foreground">
                {data.finalizedOrderCount} đơn đã giao, đã tính số chính thức
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="space-y-1.5 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Dự kiến bạn nhận (đơn đang xử lý)
              </p>
              <p className="text-2xl font-bold">
                {fmt(data.pipelineEstimatedPayout)}đ
              </p>
              <p className="text-[11px] text-muted-foreground">
                {data.pipelineOrderCount} đơn đang xác nhận hoặc đang giao
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="space-y-1.5 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Tổng khách đã thanh toán (đơn đã giao)
              </p>
              <p className="text-lg font-semibold">
                {fmt(data.totalGmvFinalized)}đ
              </p>
              <p className="text-[11px] text-muted-foreground">
                Giá trị đơn trước khi trừ phí ứng dụng
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="space-y-1.5 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Phí ứng dụng đã trừ (đơn đã giao)
              </p>
              <p className="text-lg font-semibold">
                {fmt(data.totalPlatformCommissionFinalized)}đ
              </p>
              <p className="text-[11px] text-muted-foreground">
                Phí dự kiến cho đơn đang xử lý:{" "}
                {fmt(data.pipelineEstimatedCommission)}đ
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0 space-y-1">
              <h2 className="text-base font-semibold">Xem theo tuần / tháng / năm</h2>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Chỉ xem dữ liệu đến hết hôm nay — không chọn kỳ hoặc ngày trong tương lai.
              </p>
            </div>
          </div>
          <Tabs value={periodTab} onValueChange={(v) => setPeriodTab(v as typeof periodTab)}>
            <TabsList className="grid h-11 w-full grid-cols-3 gap-1 rounded-xl bg-[hsl(120,10%,94%)] p-1">
              <TabsTrigger value="week" className="rounded-lg">
                Tuần
              </TabsTrigger>
              <TabsTrigger value="month" className="rounded-lg">
                Tháng
              </TabsTrigger>
              <TabsTrigger value="year" className="rounded-lg">
                Năm
              </TabsTrigger>
            </TabsList>
            <TabsContent value="year" className="space-y-2 pt-4">
              <Label htmlFor="earn-year">Chọn năm</Label>
              <select
                id="earn-year"
                className={cn(selectFieldClass, "max-w-[220px]")}
                value={effectiveYear}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {yearChoices.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </TabsContent>
            <TabsContent value="month" className="space-y-2 pt-4">
              <Label>Chọn tháng</Label>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  className={cn(selectFieldClass, "max-w-[160px]")}
                  value={monthParts.m}
                  onChange={(e) =>
                    setMonthParts(monthParts.y, Number(e.target.value))
                  }
                >
                  {Array.from(
                    { length: maxMonthForYear(monthParts.y) },
                    (_, i) => i + 1,
                  ).map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <select
                  className={cn(selectFieldClass, "max-w-[120px]")}
                  value={monthParts.y}
                  onChange={(e) => {
                    const ny = Number(e.target.value);
                    const cap = maxMonthForYear(ny);
                    setMonthParts(ny, Math.min(monthParts.m, cap));
                  }}
                >
                  {yearChoices.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </TabsContent>
            <TabsContent value="week" className="space-y-3 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <Label htmlFor="earn-week-day">
                    Chọn một ngày trong tuần cần xem
                  </Label>
                  <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
                    Bạn có thể chọn bất kỳ ngày nào (ví dụ hôm nay); hệ thống sẽ lấy cả tuần{" "}
                    <strong>Thứ Hai → Chủ nhật</strong> chứa ngày đó.
                  </p>
                  <Input
                    id="earn-week-day"
                    type="date"
                    className="max-w-[220px]"
                    min="2020-01-01"
                    max={todayDateInputLocal()}
                    value={weekInputToDateValue(effectiveWeekInput)}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (!raw) return;
                      const [yy, mm, dd] = raw.split("-").map(Number);
                      if (!yy || !mm || !dd) return;
                      let picked = new Date(yy, mm - 1, dd);
                      if (Number.isNaN(picked.getTime())) return;
                      const today0 = new Date();
                      today0.setHours(0, 0, 0, 0);
                      const p0 = new Date(picked);
                      p0.setHours(0, 0, 0, 0);
                      if (p0.getTime() > today0.getTime()) {
                        picked = new Date(today0);
                      }
                      setWeekInput(
                        mondayToHtmlWeek(startOfIsoWeekContaining(picked)),
                      );
                    }}
                  />
                  {isoWeekShortLabel(effectiveWeekInput) ? (
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {isoWeekShortLabel(effectiveWeekInput)}
                      </span>{" "}
                      — tham chiếu tuần ISO (có thể khác tuần từ Chủ nhật trên lịch treo tường)
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-lg border border-input bg-muted/30 p-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8"
                    aria-label="Tuần trước"
                    onClick={() =>
                      setWeekInput((w) => shiftWeekInputCapped(w, -1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8"
                    aria-label="Tuần sau"
                    disabled={weekNextDisabled}
                    onClick={() =>
                      setWeekInput((w) => shiftWeekInputCapped(w, 1))
                    }
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
              {weekRangeHint ? (
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    {weekRangeHint}
                  </span>
                  <span>· Khoảng 7 ngày đang báo cáo</span>
                </p>
              ) : null}
            </TabsContent>
          </Tabs>

          {!periodArgs ? (
            <p className="text-sm text-destructive">Chưa chọn đủ ngày tháng.</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">{periodArgs.hint}</p>
              {bdLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : breakdown ? (
                <>
                  <div className="overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-primary/[0.07] via-background to-muted/30 p-5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Tổng trong kỳ
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Chỉ đơn đã giao xong (theo ngày chốt tiền)
                    </p>
                    <div className="mt-5 flex items-baseline gap-2">
                      <Wallet className="mt-1 size-8 shrink-0 text-primary opacity-90" />
                      <div>
                        <p className="text-3xl font-bold tracking-tight text-primary tabular-nums">
                          {fmt(breakdown.periodTotals.finalizedSellerPayout)}đ
                        </p>
                        <p className="text-sm text-muted-foreground">Bạn nhận</p>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                          <CreditCard className="size-3.5 shrink-0" />
                          Khách trả
                        </div>
                        <p className="mt-1 text-base font-semibold tabular-nums">
                          {fmt(breakdown.periodTotals.totalGmvFinalized)}đ
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                          <Percent className="size-3.5 shrink-0" />
                          Phí ứng dụng
                        </div>
                        <p className="mt-1 text-base font-semibold tabular-nums">
                          {fmt(breakdown.periodTotals.platformFeeFinalized)}đ
                        </p>
                      </div>
                      <div className="col-span-2 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 shadow-sm sm:col-span-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                          <TrendingUp className="size-3.5 shrink-0" />
                          Đơn đã giao
                        </div>
                        <p className="mt-1 text-base font-semibold tabular-nums">
                          {breakdown.periodTotals.finalizedOrderCount}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Chi tiết từng đoạn
                    </p>
                    <ul className="max-h-72 space-y-2.5 overflow-y-auto pr-1">
                      {breakdown.buckets.map((b) => {
                        const active =
                          b.finalizedOrderCount > 0 ||
                          b.finalizedSellerPayout > 0;
                        return (
                          <li
                            key={b.start + b.label}
                            className={cn(
                              "rounded-xl border px-4 py-3.5 shadow-sm transition-colors",
                              active
                                ? "border-primary/25 bg-primary/4"
                                : "border-border/70 bg-card",
                            )}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 space-y-1">
                                <p className="font-semibold leading-snug">
                                  {b.label}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Bạn nhận sau phí · chỉ đơn đã chốt trong đoạn
                                  này
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold tabular-nums text-primary">
                                  {fmt(b.finalizedSellerPayout)}đ
                                </p>
                                {b.finalizedOrderCount > 0 ? (
                                  <p className="text-[11px] text-muted-foreground">
                                    {b.finalizedOrderCount} đơn
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-muted-foreground">
                                    —
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/50 pt-3 text-xs sm:grid-cols-3">
                              <div>
                                <p className="text-muted-foreground">Khách trả</p>
                                <p className="font-medium tabular-nums">
                                  {fmt(b.totalGmvFinalized)}đ
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Phí</p>
                                <p className="font-medium tabular-nums">
                                  {fmt(b.platformFeeFinalized)}đ
                                </p>
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                <p className="text-muted-foreground">Đơn</p>
                                <p className="font-medium tabular-nums">
                                  {b.finalizedOrderCount}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">Theo từng nông trại</h2>
          <p className="text-xs text-muted-foreground">
            Cùng kỳ với phần tuần / tháng / năm đã chọn ở trên. Mỗi nông trại gắn một
            gian hàng; tiền đã giao xong lọc theo ngày chốt, dự kiến theo đơn tạo
            trong kỳ (đang xác nhận hoặc đang giao).
          </p>
          {!periodArgs ? (
            <p className="text-sm text-muted-foreground">Chọn kỳ ở phần trên.</p>
          ) : farmLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !byFarm?.farms.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Bạn chưa có nông trại nào.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Nông trại</th>
                    <th className="px-3 py-2 font-medium">Gian hàng</th>
                    <th className="px-3 py-2 text-right font-medium">Bạn nhận (đã giao)</th>
                    <th className="px-3 py-2 text-right font-medium">Khách trả</th>
                    <th className="px-3 py-2 text-right font-medium">Phí</th>
                    <th className="px-3 py-2 text-right font-medium">Đơn đã giao</th>
                    <th className="px-3 py-2 text-right font-medium">Dự kiến</th>
                    <th className="px-3 py-2 text-right font-medium">Đang xử lý</th>
                  </tr>
                </thead>
                <tbody>
                  {byFarm.farms.map((row) => (
                    <tr key={row.farmId} className="border-t">
                      <td className="px-3 py-2 font-medium">{row.farmName}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.shopName ?? (row.shopId ? "—" : "Chưa có gian hàng")}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-primary">
                        {fmt(row.finalizedSellerPayout)}đ
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmt(row.totalGmvFinalized)}đ
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {fmt(row.platformFeeFinalized)}đ
                      </td>
                      <td className="px-3 py-2 text-right">{row.finalizedOrderCount}</td>
                      <td className="px-3 py-2 text-right">
                        {fmt(row.pipelineEstimatedPayout)}đ
                      </td>
                      <td className="px-3 py-2 text-right">{row.pipelineOrderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="space-y-3 p-4">
          <h2 className="text-base font-semibold">Đơn trong kỳ đã chọn</h2>
          <p className="text-xs text-muted-foreground">
            Gồm đơn đã giao xong (theo ngày chốt) và đơn chưa giao nhưng được tạo
            trong kỳ — cột &quot;Bạn nhận&quot; hiển thị số chính thức hoặc dự kiến.
          </p>
          {!periodArgs ? null : ordLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !ordersInPeriod?.items.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Không có đơn nào trong kỳ này.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Mã đơn</th>
                    <th className="px-3 py-2 font-medium">Ngày đặt</th>
                    <th className="px-3 py-2 font-medium">Trạng thái</th>
                    <th className="px-3 py-2 text-right font-medium">Khách trả</th>
                    <th className="px-3 py-2 text-right font-medium">Phí</th>
                    <th className="px-3 py-2 text-right font-medium">Bạn nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersInPeriod.items.map((o: Order) => {
                    const settled = o.settledAt != null;
                    const you = settled
                      ? Number(o.sellerPayout ?? 0)
                      : Number(o.estimatedSellerPayout ?? 0);
                    const fee = settled
                      ? Number(o.commissionAmount ?? 0)
                      : Number(o.estimatedCommissionAmount ?? 0);
                    return (
                      <tr key={o.id} className="border-t">
                        <td className="px-3 py-2 font-mono text-xs">
                          {o.id.slice(0, 8)}…
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {new Date(o.createdAt).toLocaleString("vi-VN")}
                        </td>
                        <td className="px-3 py-2">{STATUS_VI[o.status]}</td>
                        <td className="px-3 py-2 text-right">
                          {fmt(Number(o.totalAmount))}đ
                        </td>
                        <td className="px-3 py-2 text-right text-muted-foreground">
                          {fee > 0 ? `${fmt(fee)}đ` : "—"}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-primary">
                          {you > 0 ? `${fmt(you)}đ` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
