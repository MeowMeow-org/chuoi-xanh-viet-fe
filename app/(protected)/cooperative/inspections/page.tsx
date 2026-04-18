"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  ImagePlus,
  Loader2,
  Sprout,
  Trash2,
  User,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCooperativeMembershipsQuery } from "@/hooks/useCooperativeMemberships";
import {
  useCreateInspectionMutation,
  useInspectionsQuery,
} from "@/hooks/useInspection";
import { useManagedFarmSeasonsQuery } from "@/hooks/useManagedFarm";
import type { InspectionVerdict } from "@/services/inspection";
import type { SeasonStatus } from "@/services/season";
import { uploadService } from "@/services/upload/uploadService";

function getDeviceLocalDateInputValue(date = new Date()): string {
  const tzOffsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

const SEASON_STATUS_LABEL: Record<SeasonStatus, string> = {
  draft: "Nháp",
  ready_to_anchor: "Hoàn thành thu hoạch",
  anchored: "Đã công khai",
  amended: "Đã chỉnh sửa",
  failed: "Thất bại",
};

const VERDICT_META: Record<
  InspectionVerdict,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pass: {
    label: "Đạt",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "bg-green-100 text-green-800",
  },
  needs_work: {
    label: "Cần cải thiện",
    icon: <AlertTriangle className="h-4 w-4" />,
    className: "bg-amber-100 text-amber-800",
  },
  fail: {
    label: "Không đạt",
    icon: <XCircle className="h-4 w-4" />,
    className: "bg-red-100 text-red-800",
  },
};

export default function CooperativeInspectionsPage() {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const { items: memberships, isLoading: loadingFarms } =
    useCooperativeMembershipsQuery({
      status: "approved",
      page: 1,
      limit: 100,
    });

  const uniqueFarms = memberships
    .filter((m) => m.farm)
    .reduce<Record<string, (typeof memberships)[number]>>((acc, m) => {
      if (!acc[m.farm.id]) acc[m.farm.id] = m;
      return acc;
    }, {});
  const farms = Object.values(uniqueFarms);

  // Trường hợp chưa chọn farm
  if (!selectedFarmId) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
        <div>
          <h1 className="text-xl font-bold">Kiểm tra nông hộ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn nông hộ để xem và ghi lại kết quả kiểm tra (inspection) cho từng mùa vụ.
            Inspection sẽ được gộp vào hash khi mùa vụ được neo lên blockchain.
          </p>
        </div>

        {loadingFarms && <SkeletonList />}

        {!loadingFarms && farms.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Chưa có nông hộ nào thuộc HTX. Duyệt các yêu cầu tham gia ở trang
              &quot;Yêu cầu chờ duyệt&quot; trước.
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {farms.map((row) => (
            <button
              key={row.farm.id}
              type="button"
              onClick={() => setSelectedFarmId(row.farm.id)}
              className="text-left"
            >
              <Card className="transition-colors hover:border-[hsl(142,50%,70%)]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sprout className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{row.farm.name}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        <User className="inline h-3 w-3" /> {row.farmer.fullName}
                        <span className="mx-2">·</span>
                        {row.farmer.phone}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[row.farm.ward, row.farm.district, row.farm.province]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Trường hợp đã chọn farm — chọn season hoặc xem inspections
  return (
    <FarmInspectionsPanel
      farmId={selectedFarmId}
      selectedSeasonId={selectedSeasonId}
      onSelectSeason={setSelectedSeasonId}
      onBack={() => {
        setSelectedFarmId(null);
        setSelectedSeasonId(null);
      }}
    />
  );
}

function FarmInspectionsPanel({
  farmId,
  selectedSeasonId,
  onSelectSeason,
  onBack,
}: {
  farmId: string;
  selectedSeasonId: string | null;
  onSelectSeason: (id: string | null) => void;
  onBack: () => void;
}) {
  const { data, isLoading } = useManagedFarmSeasonsQuery(farmId);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách nông hộ
      </button>

      <div>
        <h1 className="text-xl font-bold">{data?.farm?.name ?? "Nông hộ"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chủ hộ: {data?.farm?.owner.fullName ?? "—"} ·{" "}
          {data?.farm?.owner.phone ?? "—"}
        </p>
      </div>

      {isLoading && <SkeletonList />}

      {!isLoading && (data?.seasons.length ?? 0) === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Nông hộ chưa có mùa vụ nào.
          </CardContent>
        </Card>
      )}

      {!isLoading && (data?.seasons.length ?? 0) > 0 && (
        <div className="grid gap-3">
          {data!.seasons.map((s) => (
            <Card
              key={s.id}
              className={`cursor-pointer transition-colors ${
                selectedSeasonId === s.id ? "border-primary" : ""
              }`}
              onClick={() => onSelectSeason(selectedSeasonId === s.id ? null : s.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold">
                        {s.code}
                      </span>
                      <Badge
                        variant={
                          s.status === "anchored" ? "secondary" : "outline"
                        }
                      >
                        {SEASON_STATUS_LABEL[s.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">{s.cropName}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.startDate).toLocaleDateString("vi-VN")}
                      <span className="mx-1">·</span>
                      {s.diaryCount} mục nhật ký
                    </p>
                  </div>
                </div>

                {selectedSeasonId === s.id && (
                  <div
                    className="mt-4 border-t pt-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SeasonInspections seasonId={s.id} seasonStatus={s.status} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SeasonInspections({
  seasonId,
  seasonStatus,
}: {
  seasonId: string;
  seasonStatus: SeasonStatus;
}) {
  type InspectionUploadItem = {
    objectKey: string;
    fileUrl: string;
    mimeType: string | null;
  };

  const { data: inspections, isLoading } = useInspectionsQuery(seasonId);
  const createMutation = useCreateInspectionMutation();
  const [showForm, setShowForm] = useState(false);
  const [verdict, setVerdict] = useState<InspectionVerdict>("pass");
  const [summary, setSummary] = useState("");
  const [eventDate, setEventDate] = useState(() => getDeviceLocalDateInputValue());
  const [images, setImages] = useState<InspectionUploadItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const isLocked = seasonStatus === "anchored";
  const maxImages = 3;

  const handlePickImages = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Chỉ được tối đa ${maxImages} ảnh`);
      return;
    }

    const files = selected.slice(0, remainingSlots);
    setIsUploadingImages(true);
    try {
      const uploaded = await uploadService.uploadImages(files);
      const newItems: InspectionUploadItem[] = uploaded.items.map((item) => ({
        objectKey: item.forumImage.objectKey,
        fileUrl: item.forumImage.url,
        mimeType: "image/*",
      }));
      setImages((prev) => [...prev, ...newItems].slice(0, maxImages));
      toast.success(`Đã tải ${newItems.length} ảnh`);
    } catch (err) {
      const message =
        (err as Error & { response?: { data?: { message?: string } } }).response
          ?.data?.message ?? "Upload ảnh thất bại";
      toast.error(message);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        seasonId,
        verdict,
        summary: summary.trim() || undefined,
        eventDate: new Date(eventDate).toISOString(),
        attachments: images.map((item, idx) => ({
          objectKey: item.objectKey,
          fileUrl: item.fileUrl,
          mimeType: item.mimeType,
          sortOrder: idx,
        })),
      },
      {
        onSuccess: () => {
          toast.success("Đã tạo inspection");
          setSummary("");
          setImages([]);
          setEventDate(getDeviceLocalDateInputValue());
          setShowForm(false);
        },
        onError: (err: Error & { response?: { data?: { message?: string } } }) => {
          toast.error(err.response?.data?.message ?? "Không tạo được inspection");
        },
      },
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Lịch sử kiểm tra</h4>
        {!isLocked && (
          <Button
            type="button"
            size="sm"
            variant={showForm ? "ghost" : "default"}
            onClick={() =>
              setShowForm((v) => {
                const next = !v;
                if (next) {
                  setEventDate(getDeviceLocalDateInputValue());
                  setImages([]);
                }
                return next;
              })
            }
          >
            {showForm ? "Huỷ" : "+ Ghi kiểm tra"}
          </Button>
        )}
      </div>

      {isLocked && (
        <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          Mùa vụ đã neo trên blockchain — không thể thêm inspection nữa. Chủ hộ
          cần chuyển mùa vụ sang trạng thái &quot;Đã chỉnh sửa&quot; để tiếp
          tục.
        </p>
      )}

      {showForm && !isLocked && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border border-dashed bg-muted/30 p-3"
        >
          <div>
            <Label className="mb-1 block">Kết luận *</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(VERDICT_META) as InspectionVerdict[]).map((v) => {
                const meta = VERDICT_META[v];
                const selected = verdict === v;
                return (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setVerdict(v)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? meta.className + " border-transparent"
                        : "bg-white text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {meta.icon}
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
            <div>
              <Label className="mb-1 block">
                Ngày kiểm tra
              </Label>
              <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-sm font-medium">
                {new Date(`${eventDate}T00:00:00`).toLocaleDateString("vi-VN")}
              </div>
            </div>
            <div>
              <Label htmlFor="insp-summary" className="mb-1 block">
                Ghi chú
              </Label>
              <Textarea
                id="insp-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Vườn quản lý tốt, đã kiểm tra phân bón đúng liều lượng..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="mb-1 block">Ảnh kiểm tra (tối đa 3 ảnh)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted">
                {isUploadingImages ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImagePlus className="h-3.5 w-3.5" />
                )}
                {isUploadingImages ? "Đang tải..." : "Chọn ảnh"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePickImages}
                  disabled={isUploadingImages || images.length >= maxImages}
                />
              </label>
              <span className="text-xs text-muted-foreground">
                {images.length}/{maxImages} ảnh
              </span>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={`${img.objectKey}-${idx}`}
                    className="group relative overflow-hidden rounded-md border"
                  >
                    <img
                      src={img.fileUrl}
                      alt={`inspection-${idx + 1}`}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      onClick={() =>
                        setImages((prev) => prev.filter((_, itemIdx) => itemIdx !== idx))
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending || isUploadingImages}
            className="gap-1.5"
          >
            {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Lưu kiểm tra
          </Button>
        </form>
      )}

      {isLoading && (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Đang tải danh sách kiểm tra...
        </p>
      )}

      {!isLoading && (inspections?.length ?? 0) === 0 && (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
          Chưa có kiểm tra nào cho mùa vụ này.
        </p>
      )}

      {!isLoading && inspections && inspections.length > 0 && (
        <div className="space-y-2">
          {inspections.map((insp) => {
            const verdict =
              (insp.extraData?.verdict as InspectionVerdict | undefined) ??
              "pass";
            const meta = VERDICT_META[verdict];
            return (
              <div
                key={insp.id}
                className="flex gap-3 rounded-lg border bg-card p-3"
              >
                <Badge
                  className={`h-min shrink-0 gap-1 border-0 ${meta.className}`}
                >
                  {meta.icon}
                  {meta.label}
                </Badge>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(insp.eventDate).toLocaleDateString("vi-VN")}</span>
                    {insp.inspector && (
                      <>
                        <span>·</span>
                        <span>{insp.inspector.fullName}</span>
                      </>
                    )}
                  </div>
                  {insp.description && (
                    <p className="mt-1 text-sm">{insp.description}</p>
                  )}
                  {insp.attachments.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {insp.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="overflow-hidden rounded-md border"
                        >
                          <img
                            src={att.fileUrl}
                            alt="inspection-attachment"
                            className="h-20 w-full object-cover transition hover:scale-[1.02]"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="h-4 w-48 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-[hsl(120,20%,92%)]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
