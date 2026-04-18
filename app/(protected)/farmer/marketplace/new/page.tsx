"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FancySelect } from "@/components/ui/fancy-select";
import { Textarea } from "@/components/ui/textarea";
import { useMyFarmsQuery } from "@/hooks/useFarm";
import {
  useCreateShopMutation,
  useMyShopsQuery,
  useSuggestShopMutation,
} from "@/hooks/useFarmerShop";
import { uploadService } from "@/services/upload/uploadService";

export default function FarmerNewShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const farmIdFromUrl = searchParams.get("farmId") ?? "";
  const saleUnitIdFromUrl = searchParams.get("saleUnitId") ?? "";

  const { farms, isLoading: farmsLoading } = useMyFarmsQuery({
    page: 1,
    limit: 100,
  });
  const { data: shops, isLoading: shopsLoading } = useMyShopsQuery();

  const createShop = useCreateShopMutation();
  const suggestShop = useSuggestShopMutation();

  const farmsWithoutShop = useMemo(() => {
    if (!shops?.length) return farms;
    const taken = new Set(shops.map((s) => s.farm_id));
    return farms.filter((f) => !taken.has(f.id));
  }, [farms, shops]);

  const [farmIdState, setFarmIdState] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const farmId = useMemo(() => {
    if (farmIdState) return farmIdState;
    if (farmIdFromUrl && farmsWithoutShop.some((f) => f.id === farmIdFromUrl)) {
      return farmIdFromUrl;
    }
    return farmsWithoutShop[0]?.id ?? "";
  }, [farmIdState, farmIdFromUrl, farmsWithoutShop]);

  const loading = farmsLoading || shopsLoading;

  const handleSuggest = async () => {
    if (!farmId) {
      toast.error("Chọn nông trại để gợi ý");
      return;
    }
    try {
      const s = await suggestShop.mutateAsync(farmId);
      setShopName((s.suggestedName ?? "").slice(0, 180));
      setShopDesc((s.suggestedDescription ?? "").slice(0, 250));
    } catch {
      /* toast trong hook */
    }
  };

  const handleCreate = async () => {
    if (!farmId || !shopName.trim()) {
      toast.error("Chọn trại và nhập tên gian hàng");
      return;
    }

    let avatar_url: string | null | undefined;
    if (avatarFile) {
      try {
        const up = await uploadService.uploadImages([avatarFile]);
        avatar_url = up.items[0]?.url ?? null;
        if (!avatar_url) {
          toast.error("Upload ảnh thất bại");
          return;
        }
      } catch {
        toast.error("Không upload được ảnh đại diện");
        return;
      }
    }

    try {
      const shop = await createShop.mutateAsync({
        farm_id: farmId,
        name: shopName.trim(),
        description: shopDesc.trim() || undefined,
        avatar_url,
      });
      if (saleUnitIdFromUrl) {
        router.replace(
          `/farmer/marketplace/shops/${shop.id}/add?saleUnitId=${encodeURIComponent(saleUnitIdFromUrl)}`,
        );
      } else {
        router.replace(`/farmer/marketplace/shops/${shop.id}`);
      }
    } catch {
      /* toast trong hook */
    }
  };

  const descCount = shopDesc.length;
  const nameCount = shopName.length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 pb-24 sm:px-6 md:pb-10 lg:px-8">
      <div className="mb-5 flex items-start gap-3">
        <Link
          href="/farmer/marketplace"
          aria-label="Quay lại"
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Mở gian hàng mới
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mỗi nông trại có 1 gian hàng riêng để giữ rõ nguồn gốc và câu chuyện
            thương hiệu.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải…
        </div>
      )}

      {!loading && farms.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Bạn chưa có nông trại.{" "}
            <Link
              href="/farmer/farms"
              className="font-medium text-primary underline"
            >
              Tạo nông trại
            </Link>{" "}
            trước khi mở gian hàng.
          </CardContent>
        </Card>
      )}

      {!loading && farms.length > 0 && farmsWithoutShop.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Tất cả nông trại của bạn đã có gian hàng. Quay lại{" "}
            <Link
              href="/farmer/marketplace"
              className="font-medium text-primary underline"
            >
              danh sách gian hàng
            </Link>{" "}
            để quản lý.
          </CardContent>
        </Card>
      )}

      {!loading && farmsWithoutShop.length > 0 && (
        <Card className="overflow-hidden border-primary/20 shadow-sm">
          <div className="border-b bg-linear-to-br from-primary/10 via-primary/5 to-background px-6 py-5">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
              <AvatarUploader
                preview={avatarPreview}
                onPick={() => avatarInputRef.current?.click()}
                onClear={() => setAvatarFile(null)}
              />
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
              <div className="mt-3 min-w-0 flex-1 sm:mt-0">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Gian hàng mới
                </p>
                <p className="mt-1 truncate text-lg font-semibold">
                  {shopName.trim() || "Tên gian hàng của bạn"}
                </p>
                <p className="mt-0.5 line-clamp-2 min-w-0 w-full break-words text-xs text-muted-foreground">
                  {shopDesc.trim() ||
                    "Mô tả ngắn sẽ hiển thị cho người mua trên chợ."}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-5 p-6">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Nông trại <span className="text-destructive">*</span>
              </Label>
              <FancySelect
                value={farmId}
                onChange={(v) => setFarmIdState(v)}
                options={farmsWithoutShop.map((f) => ({
                  value: f.id,
                  label: f.name,
                }))}
                placeholder="Chọn nông trại"
              />
              <p className="text-xs text-muted-foreground">
                Gian hàng sẽ gắn cố định với nông trại này để đảm bảo truy xuất
                nguồn gốc.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="shop-name" className="text-sm font-medium">
                  Tên gian hàng <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  disabled={!farmId || suggestShop.isPending}
                  onClick={() => void handleSuggest()}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                >
                  {suggestShop.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Gợi ý AI
                </button>
              </div>
              <Input
                id="shop-name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="Ví dụ: Rau sạch nhà Lan"
                maxLength={180}
                className="h-10"
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {nameCount}/180
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="shop-desc" className="text-sm font-medium">
                Mô tả
              </Label>
              <Textarea
                id="shop-desc"
                value={shopDesc}
                onChange={(e) => setShopDesc(e.target.value)}
                rows={5}
                maxLength={250}
                placeholder="Giới thiệu ngắn về nguồn gốc, cách canh tác, câu chuyện thương hiệu…"
                className="resize-y"
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {descCount}/250
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Link
                href="/farmer/marketplace"
                className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Huỷ
              </Link>
              <Button
                type="button"
                disabled={createShop.isPending || !shopName.trim() || !farmId}
                onClick={() => void handleCreate()}
                className="h-10 min-w-36 gap-1.5"
              >
                {createShop.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Tạo gian hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AvatarUploader({
  preview,
  onPick,
  onClear,
}: {
  preview: string | null;
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPick}
        className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-primary/30 bg-background shadow-sm transition hover:border-primary/60 hover:shadow-md"
        aria-label="Chọn ảnh đại diện"
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="avatar preview"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
              Đổi ảnh
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Camera className="h-6 w-6" />
            <span className="text-[10px] font-medium">Thêm ảnh</span>
          </div>
        )}
      </button>
      {preview && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Xoá ảnh"
          className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border bg-background text-destructive shadow-sm transition hover:bg-destructive hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
