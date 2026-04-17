"use client";

import { useEffect, useState } from "react";
import { Camera, CheckCircle2, Clock, MapPin, Send, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { useCreateDiaryMutation } from "@/hooks/useDiary";
import { OfflineDiaryEntry, useOfflineStorage } from "@/hooks/useOfflineStorage";
import type { CreateDiaryPayload } from "@/services/diary";
import { TASK_TYPES, seasons } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
    const [photos, setPhotos] = useState<string[]>([]);
    const [gps, setGps] = useState<{ lat: number; lng: number } | null>(FALLBACK_GPS);
    const [gpsLoading, setGpsLoading] = useState(() => typeof navigator !== "undefined" && !!navigator.geolocation);
    const [submitting, setSubmitting] = useState(false);
    const { saveEntry, isOnline, unsyncedCount, syncEntries } = useOfflineStorage();
    const createDiary = useCreateDiaryMutation();
    const useApi = Boolean(farmIdProp?.trim());

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

    const handlePhotoCapture = () => {
        const mockPhoto = `photo_${Date.now()}.jpg`;
        setPhotos([...photos, mockPhoto]);
        toast.success("Đã chụp ảnh thành công!");
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
                if (photos.length > 0) extra.localPhotoPlaceholders = photos;

                await createDiary.mutateAsync({
                    seasonId: resolvedSeasonId.trim(),
                    farmId,
                    eventType,
                    eventDate: new Date().toISOString(),
                    description,
                    extraData: Object.keys(extra).length > 0 ? extra : undefined,
                });
                toast.success("Đã ghi nhật ký");
                setTaskType("");
                setDescription("");
                setPhotos([]);
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
            photos,
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
            setPhotos([]);
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
                    <label className="text-sm font-semibold">Ảnh thực địa</label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex h-20 w-20 flex-col gap-1 border-2 border-dashed"
                            onClick={handlePhotoCapture}
                        >
                            <Camera className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Chụp</span>
                        </Button>
                        {photos.map((photo, index) => (
                            <div
                                key={`${photo}-${index}`}
                                className="flex h-20 w-20 items-center justify-center rounded-lg border bg-primary/10"
                            >
                                <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                        ))}
                    </div>
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
                        <>Đang ghi nhật ký...</>
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
