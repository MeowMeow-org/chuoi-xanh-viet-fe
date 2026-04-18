"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    Camera,
    Clock,
    ImagePlus,
    Loader2,
    MapPin,
    Send,
    Wifi,
    WifiOff,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateDiaryMutation } from "@/hooks/useDiary";
import { OfflineDiaryEntry, useOfflineStorage } from "@/hooks/useOfflineStorage";
import type { CreateDiaryPayload } from "@/services/diary";
import { diaryService } from "@/services/diary/diaryService";
import { uploadService } from "@/services/upload/uploadService";
import { TASK_TYPES, seasons } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE = 12 * 1024 * 1024;

interface DiaryEntryFormProps {
    /** Có thì gửi `POST /diary` (trang mùa vụ thật). Không có → lưu offline như trước (dashboard mock). */
    farmId?: string;
    initialSeasonId?: string;
    /**
     * Khi có giá trị: form gắn với đúng một mùa vụ — ẩn dropdown, dùng `initialSeasonId`.
     * (Trang chi tiết mùa vụ truyền mã + cây trồng; dashboard mock không truyền → vẫn có dropdown.)
     */
    seasonSummary?: string;
    /** Gọi sau khi tạo nhật ký qua API thành công (vd. chuyển tab “Nhật ký”). */
    onDiaryCreated?: () => void;
}

const FALLBACK_GPS = { lat: 10.4114, lng: 106.9572 };

export default function DiaryEntryForm({
    farmId: farmIdProp,
    initialSeasonId = "",
    seasonSummary,
    onDiaryCreated,
}: DiaryEntryFormProps) {
    const seasonLocked = seasonSummary != null && seasonSummary.trim() !== "";
    const [selectedSeason, setSelectedSeason] = useState(() =>
        seasonLocked ? "" : initialSeasonId || seasons[0]?.id || "",
    );
    const resolvedSeasonId = seasonLocked ? initialSeasonId : selectedSeason;
    const [taskType, setTaskType] = useState("");
    const [description, setDescription] = useState("");
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const [gps, setGps] = useState<{ lat: number; lng: number } | null>(FALLBACK_GPS);
    const [gpsLoading, setGpsLoading] = useState(() => typeof navigator !== "undefined" && !!navigator.geolocation);
    const [submitting, setSubmitting] = useState(false);
    const { saveEntry, isOnline, unsyncedCount, syncEntries } = useOfflineStorage();
    const createDiary = useCreateDiaryMutation();
    const useApi = Boolean(farmIdProp?.trim());
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const photoPreviews = useMemo(
        () => photoFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
        [photoFiles],
    );

    useEffect(() => {
        return () => {
            photoPreviews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [photoPreviews]);

    useEffect(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGps({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setGpsLoading(false);
            },
            () => {
                setGps(FALLBACK_GPS);
                setGpsLoading(false);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    useEffect(() => {
        if (isOnline && unsyncedCount > 0) {
            const synced = syncEntries();
            if (synced) {
                toast.success(`Đã đồng bộ ${synced.length} bản ghi lên hệ thống!`);
            }
        }
    }, [isOnline, syncEntries, unsyncedCount]);

    const addPhotos = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const incoming = Array.from(files);
        const remaining = MAX_PHOTOS - photoFiles.length;
        if (remaining <= 0) {
            toast.error(`Tối đa ${MAX_PHOTOS} ảnh / nhật ký.`);
            return;
        }
        const valid: File[] = [];
        for (const f of incoming.slice(0, remaining)) {
            if (!f.type.startsWith("image/")) {
                toast.error(`Tệp "${f.name}" không phải ảnh.`);
                continue;
            }
            if (f.size > MAX_PHOTO_SIZE) {
                toast.error(`Ảnh "${f.name}" vượt 12MB.`);
                continue;
            }
            valid.push(f);
        }
        if (valid.length === 0) return;
        setPhotoFiles((prev) => [...prev, ...valid]);
        if (incoming.length > remaining) {
            toast.warning(`Chỉ thêm được ${remaining} ảnh (giới hạn ${MAX_PHOTOS}).`);
        }
    };

    const removePhotoAt = (index: number) => {
        setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!taskType || !description || !resolvedSeasonId.trim()) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const taskLabel = TASK_TYPES.find((type) => type.value === taskType)?.label || taskType;
        const eventType = taskType as CreateDiaryPayload["eventType"];

        if (useApi) {
            const farmId = farmIdProp!.trim();
            setSubmitting(true);
            try {
                const extra: Record<string, unknown> = {};
                if (gps) extra.gps = { lat: gps.lat, lng: gps.lng };

                const diary = await createDiary.mutateAsync({
                    seasonId: resolvedSeasonId.trim(),
                    farmId,
                    eventType,
                    eventDate: new Date().toISOString(),
                    description,
                    extraData: Object.keys(extra).length > 0 ? extra : undefined,
                });

                if (photoFiles.length > 0) {
                    try {
                        const { items } = await uploadService.uploadImages(photoFiles);
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            await diaryService.addAttachment(diary.id, {
                                fileUrl: item.url,
                                mimeType: photoFiles[i]?.type || null,
                                sortOrder: i,
                                meta: {
                                    imageId: item.id,
                                    thumb: item.thumb || null,
                                    size: item.size,
                                    aspectRatio: item.aspect_ratio,
                                    ...(gps ? { gps: { lat: gps.lat, lng: gps.lng } } : {}),
                                },
                            });
                        }
                    } catch (err) {
                        // Rollback: xoá diary vừa tạo để tránh nhật ký không ảnh
                        await diaryService.deleteDiary(diary.id).catch(() => {});
                        const msg =
                            err instanceof Error && err.message
                                ? err.message
                                : "Không tải được ảnh. Nhật ký đã bị huỷ, vui lòng thử lại.";
                        toast.error(msg);
                        return;
                    }
                }

                toast.success("Đã ghi nhật ký");
                setTaskType("");
                setDescription("");
                setPhotoFiles([]);
                onDiaryCreated?.();
            } finally {
                setSubmitting(false);
            }
            return;
        }

        setSubmitting(true);
        const entry: OfflineDiaryEntry = {
            id: `diary-${Date.now()}`,
            seasonId: resolvedSeasonId,
            taskType,
            taskTypeLabel: taskLabel,
            description,
            photos: photoFiles.map((f) => f.name),
            gpsLat: gps?.lat || 0,
            gpsLng: gps?.lng || 0,
            timestamp: new Date().toISOString(),
            synced: isOnline,
        };

        saveEntry(entry);

        setTimeout(() => {
            setSubmitting(false);

            if (isOnline) {
                toast.success("Đã ghi nhật ký và lưu lên Blockchain!", {
                    description: "Dữ liệu được xác thực và không thể chỉnh sửa.",
                });
            } else {
                toast.warning("Đã lưu offline! Sẽ tự đồng bộ khi có mạng.", {
                    description: `Hiện có ${unsyncedCount + 1} bản ghi chờ đồng bộ.`,
                });
            }

            setTaskType("");
            setDescription("");
            setPhotoFiles([]);
        }, 800);
    };

    const currentTimestamp = new Date().toLocaleString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    const activeSeason = seasons.find((season) => season.id === selectedSeason);

    return (
        <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">Ghi nhật ký sản xuất</CardTitle>
                    <Badge
                        className={`gap-1 ${isOnline
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            }`}
                    >
                        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                        {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
                    </Badge>
                </div>
                {unsyncedCount > 0 && (
                    <p className="mt-1 text-sm font-medium text-warning">
                        {unsyncedCount} bản ghi đang chờ đồng bộ
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
                {!seasonLocked && (
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Vụ mùa</label>
                        <Select
                            value={selectedSeason}
                            onChange={(event) => setSelectedSeason(event.target.value)}
                            className="h-12 text-base"
                        >
                            <option value="">Chọn vụ mùa</option>
                            {seasons.filter((season) => season.status !== "Đã thu hoạch").map((season) => (
                                <option key={season.id} value={season.id}>
                                    {season.name} - {season.crop}
                                </option>
                            ))}
                        </Select>
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Loại công việc</label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {TASK_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setTaskType(type.value)}
                                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm font-medium transition-all ${taskType === type.value
                                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                                    }`}
                            >
                                <span className="text-2xl">{type.icon}</span>
                                <span className="text-center text-xs leading-tight">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold">Mô tả chi tiết</label>
                    <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="VD: Bón phân NPK 16-16-8, liều lượng 30kg/1000m²..."
                        className="min-h-[100px] resize-none text-base"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold">
                        Ảnh thực địa{" "}
                        <span className="font-normal text-muted-foreground">
                            (tối đa {MAX_PHOTOS})
                        </span>
                    </label>
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                            addPhotos(e.target.files);
                            e.target.value = "";
                        }}
                    />
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            addPhotos(e.target.files);
                            e.target.value = "";
                        }}
                    />
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex h-20 w-20 flex-col gap-1 border-2 border-dashed"
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={photoFiles.length >= MAX_PHOTOS || submitting}
                        >
                            <Camera className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Chụp</span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex h-20 w-20 flex-col gap-1 border-2 border-dashed"
                            onClick={() => galleryInputRef.current?.click()}
                            disabled={photoFiles.length >= MAX_PHOTOS || submitting}
                        >
                            <ImagePlus className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Thư viện</span>
                        </Button>
                        {photoPreviews.map((preview, index) => (
                            <div
                                key={preview.url}
                                className="group relative h-20 w-20 overflow-hidden rounded-lg border bg-muted"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={preview.url}
                                    alt={`Ảnh ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePhotoAt(index)}
                                    disabled={submitting}
                                    aria-label="Xoá ảnh"
                                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white shadow transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {useApi && photoFiles.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Ảnh sẽ được tải lên và đính kèm vào nhật ký sau khi lưu.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/50 p-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Vị trí GPS (tự động)</p>
                            <p className="font-mono text-xs font-medium">
                                {gpsLoading ? "Đang lấy..." : gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : "Không khả dụng"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 shrink-0 text-primary" />
                        <div>
                            <p className="text-xs text-muted-foreground">Thời gian (tự động)</p>
                            <p className="text-xs font-medium">{currentTimestamp}</p>
                        </div>
                    </div>
                </div>

                {seasonLocked && seasonSummary ? (
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Mùa vụ:</span> {seasonSummary}
                    </p>
                ) : (
                    !seasonLocked &&
                    activeSeason && (
                        <p className="text-xs text-muted-foreground">
                            {activeSeason.location} · {activeSeason.crop} · {activeSeason.area}
                        </p>
                    )
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={
                        submitting ||
                        createDiary.isPending ||
                        !taskType ||
                        !description ||
                        !resolvedSeasonId.trim() ||
                        (seasonLocked && !initialSeasonId) ||
                        (useApi && !farmIdProp?.trim())
                    }
                    className="h-14 w-full gap-2 text-lg font-bold"
                    size="lg"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Đang ghi nhật ký...
                        </>
                    ) : (
                        <>
                            <Send className="h-5 w-5" />
                            Ghi nhật ký
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
