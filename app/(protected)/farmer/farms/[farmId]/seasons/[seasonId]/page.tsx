"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
  Save,
  Scale,
  Trash2,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

import DiaryEntryForm from "@/components/dashboard/DiaryEntryForm";
import DiaryTimeline from "@/components/dashboard/DiaryTimeline";
import SaleUnitsSection from "@/components/dashboard/SaleUnitsSection";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import {
  useChangeSeasonStatusMutation,
  useDeleteSeasonMutation,
  useSeasonDetailQuery,
  useUpdateSeasonMutation,
} from "@/hooks/useSeason";
import type { SeasonStatus } from "@/services/season";

/** Decimal / JSON từ BE thường là string — không dùng Number.isFinite trực tiếp. */
function parseSeasonActualYield(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? n : null;
}

const STATUS_LABEL: Record<SeasonStatus, string> = {
  draft: "Nháp",
  ready_to_anchor: "Hoàn thành thu hoạch",
  anchored: "Đã công khai",
  amended: "Đã chỉnh sửa",
  failed: "Thất bại",
};

const STATUS_BADGE_CLASS: Record<SeasonStatus, string> = {
  draft:
    "border-0 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20",
  ready_to_anchor:
    "border-0 bg-yellow-400/30 text-yellow-100 hover:bg-yellow-400/30",
  anchored: "border-0 bg-green-400/30 text-green-100 hover:bg-green-400/30",
  amended: "border-0 bg-orange-400/30 text-orange-100 hover:bg-orange-400/30",
  failed: "border-0 bg-red-400/30 text-red-100 hover:bg-red-400/30",
};

/** Trả về trạng thái kế tiếp muốn hiển thị nút, cùng label. */
const NEXT_STATUS: Partial<
  Record<SeasonStatus, { to: SeasonStatus; label: string }>
> = {
  draft: { to: "ready_to_anchor", label: "Hoàn thành thu hoạch" },
  ready_to_anchor: { to: "anchored", label: "Đăng nhật ký" },
  amended: { to: "ready_to_anchor", label: "Hoàn thành thu hoạch lại" },
  failed: { to: "draft", label: "Khôi phục nháp" },
};

export default function SeasonDetailPage() {
  const params = useParams<{ farmId: string; seasonId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  /** `?hideAddDiary=1` hoặc `true`: chỉ xem nhật ký, ẩn tab tạo mới. */
  const hideAddDiary =
    searchParams.get("hideAddDiary") === "1" ||
    searchParams.get("hideAddDiary") === "true";
  const farmId = Array.isArray(params.farmId)
    ? params.farmId[0]
    : params.farmId;
  const seasonId = Array.isArray(params.seasonId)
    ? params.seasonId[0]
    : params.seasonId;

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [anchorOpen, setAnchorOpen] = useState(false);
  const [detailQueryEnabled, setDetailQueryEnabled] = useState(true);
  const [seasonTab, setSeasonTab] = useState<"timeline" | "add" | "sale-units">(
    "timeline",
  );

  const { farms } = useMyFarmsQuery({ page: 1, limit: 100 });
  const { data: season, isLoading } = useSeasonDetailQuery(seasonId, {
    enabled: detailQueryEnabled,
  });
  const deleteSeason = useDeleteSeasonMutation();
  const changeStatus = useChangeSeasonStatusMutation();
  const updateSeason = useUpdateSeasonMutation();
  const farm = farms.find((item) => item.id === farmId);

  const currentStatus = season?.status;
  const nextStep = currentStatus ? NEXT_STATUS[currentStatus] : undefined;
  const isAnchoring = changeStatus.isPending;

  const actualYield = parseSeasonActualYield(season?.actualYield);
  const yieldUnitRaw = season?.yieldUnit?.trim() ?? "";
  const yieldMissing =
    actualYield == null || actualYield <= 0 || yieldUnitRaw.length === 0;
  const canEditYield = currentStatus === "draft" || currentStatus === "amended";
  const needsYieldBeforeAnchor =
    yieldMissing &&
    (currentStatus === "draft" ||
      currentStatus === "amended" ||
      currentStatus === "ready_to_anchor");

  const handleConfirmDelete = () => {
    if (!seasonId) return;
    setDetailQueryEnabled(false);
    deleteSeason.mutate(seasonId, {
      onSuccess: () => {
        toast.success("Đã xóa mùa vụ");
        setDeleteOpen(false);
        router.replace(`/farmer/farms/${farmId}/seasons`);
      },
      onError: () => {
        setDetailQueryEnabled(true);
      },
    });
  };

  const handleChangeStatus = (to: SeasonStatus) => {
    if (!seasonId) return;
    // Chặn chuyển sang ready_to_anchor / anchored khi chưa có actual_yield
    // (BE cũng kiểm, đây chỉ là UX để báo sớm trước khi call API).
    if ((to === "ready_to_anchor" || to === "anchored") && yieldMissing) {
      toast.error(
        "Cần nhập sản lượng thực tế (actual_yield) và đơn vị trước khi neo mùa vụ",
      );
      return;
    }
    if (to === "anchored") {
      setAnchorOpen(true);
      return;
    }
    changeStatus.mutate(
      { seasonId, status: to },
      {
        onSuccess: () => toast.success(`Đã chuyển sang: ${STATUS_LABEL[to]}`),
      },
    );
  };

  const handleConfirmAnchor = () => {
    if (!seasonId) return;
    changeStatus.mutate(
      { seasonId, status: "anchored" },
      {
        onSuccess: () => {
          setAnchorOpen(false);
          toast.success("Đã neo thành công lên Sepolia!");
        },
      },
    );
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <Link
        href={`/farmer/farms/${farmId}/seasons`}
        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại mùa vụ
      </Link>

      {/* Season header card */}
      <div className="gradient-green relative rounded-2xl p-5 text-primary-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide opacity-85">
              {farm?.name ?? "Nông trại"}
            </p>
            <h1 className="mt-1 text-lg font-bold">
              #{isLoading ? "Đang tải mùa vụ..." : (season?.code ?? "Mùa vụ")}
            </h1>
            <p className="mt-1 text-sm opacity-90">
              <span className="opacity-80">Cây trồng chính: </span>
              {season?.cropName ?? "—"}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs opacity-80">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {season?.startDate
                  ? new Date(season.startDate).toLocaleDateString("vi-VN")
                  : "--"}
              </span>
            </div>
          </div>
          <Badge
            className={`shrink-0 ${
              currentStatus
                ? STATUS_BADGE_CLASS[currentStatus]
                : "border-0 bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
            }`}
          >
            {currentStatus ? STATUS_LABEL[currentStatus] : "Đang cập nhật"}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {/* Next-step button */}
          {nextStep && !isLoading && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              disabled={isAnchoring}
              onClick={() => handleChangeStatus(nextStep.to)}
            >
              {isAnchoring && nextStep.to === "anchored" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang neo...
                </>
              ) : (
                <>
                  {nextStep.label}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            disabled={!seasonId || isLoading}
            onClick={() => setDeleteOpen(true)}
            aria-label="Xóa mùa vụ"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </Button>
        </div>

        {/* Anchor info — hiển thị khi đã neo */}
        {season?.status === "anchored" && season.latestAnchor && (
          <div className="mt-4 rounded-xl bg-primary-foreground/10 p-3 text-xs">
            <div className="mb-1 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-300" />
              Đã neo lên Sepolia Testnet
            </div>
            <div className="space-y-0.5 opacity-90">
              <p>
                <span className="opacity-70">Hash: </span>
                <span className="font-mono">
                  {season.latestAnchor.dataHash.slice(0, 16)}…
                </span>
              </p>
              {season.latestAnchor.txHash && (
                <p>
                  <span className="opacity-70">TX: </span>
                  <span className="font-mono">
                    {season.latestAnchor.txHash.slice(0, 16)}…
                  </span>
                </p>
              )}
            </div>
            {season.latestAnchor.txUrl && (
              <a
                href={season.latestAnchor.txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1 text-green-200 underline-offset-2 hover:underline"
              >
                Xem trên Etherscan
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Yield summary + quick editor */}
      {season && (
        <YieldCard
          actualYield={actualYield}
          seasonYieldUnit={yieldUnitRaw}
          yieldMissing={yieldMissing}
          editable={canEditYield}
          showWarning={needsYieldBeforeAnchor}
          isSaving={updateSeason.isPending}
          onSave={(value, unit) =>
            updateSeason.mutate(
              {
                seasonId: seasonId!,
                payload: { actualYield: value, yieldUnit: unit },
              },
              {
                onSuccess: () => toast.success("Đã cập nhật sản lượng"),
                onError: (
                  err: Error & { response?: { data?: { message?: string } } },
                ) =>
                  toast.error(
                    err.response?.data?.message ?? "Cập nhật không thành công",
                  ),
              },
            )
          }
        />
      )}

      {/* Confirm delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mùa vụ?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mùa vụ đã neo hoặc đã có nhật
              ký, sản phẩm, đơn vị bán liên quan sẽ không thể xóa — hệ thống sẽ
              báo lỗi cụ thể nếu vậy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteSeason.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteSeason.isPending ? "Đang xóa..." : "Xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm anchor dialog */}
      <AlertDialog open={anchorOpen} onOpenChange={setAnchorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Neo mùa vụ lên blockchain?</AlertDialogTitle>
            <AlertDialogDescription>
              Toàn bộ dữ liệu nhật ký sẽ được hash và ghi lên Sepolia testnet.
              Sau khi neo, mùa vụ không thể chỉnh sửa thêm (trừ khi chuyển sang
              trạng thái &quot;Đã chỉnh sửa&quot;). Quá trình có thể mất vài giây.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAnchoring}>Hủy</AlertDialogCancel>
            <Button
              type="button"
              disabled={isAnchoring}
              onClick={handleConfirmAnchor}
            >
              {isAnchoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang neo...
                </>
              ) : (
                "Đăng nhật ký"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs
        value={hideAddDiary && seasonTab === "add" ? "timeline" : seasonTab}
        onValueChange={(v) => {
          if (v === "timeline" || v === "add" || v === "sale-units") {
            if (hideAddDiary && v === "add") return;
            setSeasonTab(v);
          }
        }}
        className="space-y-4"
      >
        {(() => {
          const showAnchored = season?.status === "anchored";
          const colCount = (hideAddDiary ? 1 : 2) + (showAnchored ? 1 : 0);
          const gridClass =
            colCount === 1
              ? "grid-cols-1"
              : colCount === 2
                ? "grid-cols-2"
                : "grid-cols-3";
          return (
            <TabsList className={`grid h-12 w-full ${gridClass}`}>
              <TabsTrigger value="timeline" className="text-sm font-semibold">
                Nhật ký
              </TabsTrigger>
              {!hideAddDiary && (
                <TabsTrigger value="add" className="text-sm font-semibold">
                  Thêm mới
                </TabsTrigger>
              )}
              {showAnchored && (
                <TabsTrigger
                  value="sale-units"
                  className="text-sm font-semibold"
                >
                  Lô bán
                </TabsTrigger>
              )}
            </TabsList>
          );
        })()}

        <TabsContent value="timeline">
          <DiaryTimeline seasonId={season?.id} />
        </TabsContent>

        {!hideAddDiary && (
          <TabsContent value="add">
            {season ? (
              <DiaryEntryForm
                farmId={season.farmId}
                initialSeasonId={season.id}
                seasonSummary={`${season.code} · ${season.cropName}`}
                onDiaryCreated={() => setSeasonTab("timeline")}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Đang tải mùa vụ để ghi nhật ký...
              </p>
            )}
          </TabsContent>
        )}

        {season?.status === "anchored" && (
          <TabsContent value="sale-units">
            {season && (
              <SaleUnitsSection
                seasonId={season.id}
                farmId={season.farmId}
              />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

const MASS_UNIT_OPTIONS = [
  { value: "tấn", label: "tấn" },
  { value: "kg", label: "kg" },
  { value: "gam", label: "gam" },
] as const;

function normalizeMassUnit(s: string): string {
  return s.trim().toLowerCase();
}

function formatYieldUnitLabel(u: string): string {
  const t = u.trim().toLowerCase();
  if (t === "g") return "gam";
  return u.trim();
}

function YieldCard({
  actualYield,
  seasonYieldUnit,
  yieldMissing,
  editable,
  showWarning,
  isSaving,
  onSave,
}: {
  actualYield: number | null;
  /** Đơn vị đã lưu trên mùa vụ (tạo vụ / chỉnh sửa). Có giá trị → khóa, không đổi khi nhập actual. */
  seasonYieldUnit: string;
  yieldMissing: boolean;
  editable: boolean;
  showWarning: boolean;
  isSaving: boolean;
  onSave: (value: number, unit: string) => void;
}) {
  const unitInDb = seasonYieldUnit.trim();
  const unitLocked = unitInDb.length > 0;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    actualYield != null ? String(actualYield) : "",
  );
  const [unit, setUnit] = useState(() => unitInDb || "kg");

  const handleSave = () => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Sản lượng phải > 0");
      return;
    }
    const u = unitLocked ? unitInDb : unit.trim();
    if (u.length === 0) {
      toast.error("Chọn đơn vị sản lượng");
      return;
    }
    onSave(n, u);
    setEditing(false);
  };

  const displayUnit = unitLocked
    ? formatYieldUnitLabel(unitInDb)
    : editing
      ? formatYieldUnitLabel(unit)
      : formatYieldUnitLabel(unitInDb || "kg");

  return (
    <div
      className={`rounded-2xl border p-4 ${
        showWarning
          ? "border-amber-300 bg-amber-50"
          : yieldMissing
            ? "border-muted bg-muted/20"
            : "border-green-200 bg-green-50/40"
      }`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex items-center gap-2">
          {showWarning ? (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          ) : (
            <Scale className="h-5 w-5 text-primary" />
          )}
          <div>
            <p className="text-sm font-semibold">Sản lượng thực tế</p>
            <p className="text-xs text-muted-foreground">
              Dữ liệu bắt buộc trước khi neo. Dùng làm trần cho tổng các lô bán
              tạo từ mùa vụ này.
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {!editing && (
            <div className="text-right">
              <p className="text-lg font-bold">
                {actualYield != null ? actualYield : "—"}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {unitLocked || actualYield != null ? displayUnit : "—"}
                </span>
              </p>
              {yieldMissing && (
                <p className="text-xs text-amber-700">Chưa nhập</p>
              )}
            </div>
          )}
          {editable && !editing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setValue(actualYield != null ? String(actualYield) : "");
                setUnit(unitInDb || "kg");
                setEditing(true);
              }}
            >
              {yieldMissing ? "Nhập ngay" : "Sửa"}
            </Button>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-3 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="actual-yield-input">Sản lượng</Label>
            <Input
              id="actual-yield-input"
              type="number"
              step="0.01"
              min="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ví dụ: 1200"
            />
          </div>
          <div className="space-y-2">
            <Label>Đơn vị</Label>
            {unitLocked ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {formatYieldUnitLabel(unitInDb)}
                </span>
                {" — "}
                Theo đơn vị đã chọn khi tạo mùa vụ (chỉ sửa được số lượng).
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {MASS_UNIT_OPTIONS.map((opt) => {
                  const selected =
                    normalizeMassUnit(unit) === normalizeMassUnit(opt.value);
                  return (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      className="min-w-13 rounded-full"
                      onClick={() => setUnit(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={isSaving}
            >
              Hủy
            </Button>
          </div>
        </div>
      )}

      {showWarning && !editing && (
        <p className="mt-3 text-xs text-amber-700">
          Bạn cần nhập sản lượng thực tế trước khi chuyển sang trạng thái &quot;Sẵn
          sàng neo&quot; hoặc neo lên blockchain.
        </p>
      )}

      {!editable && !editing && !yieldMissing && (
        <p className="mt-2 text-xs text-muted-foreground">
          Mùa vụ đã seal — không thể chỉnh sản lượng trừ khi chuyển sang &quot;Đã
          chỉnh sửa&quot;.
        </p>
      )}
    </div>
  );
}

