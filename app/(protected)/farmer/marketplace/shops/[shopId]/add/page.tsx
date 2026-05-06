"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FancySelect } from "@/components/ui/fancy-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddProductMutation,
  useAvailableSaleUnitsQuery,
  useMyShopsQuery,
  useSuggestProductListingMutation,
} from "@/hooks/useFarmerShop";
import { uploadService } from "@/services/upload/uploadService";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type AddProductFormValues = {
  saleUnitId: string;
  name: string;
  description: string;
  price: string;
  image: File | null;
};

export default function FarmerShopAddProductPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: shops, isLoading: shopsLoading } = useMyShopsQuery();
  const shop = useMemo(
    () => shops?.find((s) => s.id === shopId),
    [shops, shopId],
  );

  const { data: saleUnits, isLoading: saleUnitsLoading } =
    useAvailableSaleUnitsQuery(shop?.id, !!shop);
  const addProduct = useAddProductMutation();
  const suggestListing = useSuggestProductListingMutation();

  const [prodImageFile, setProdImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<AddProductFormValues>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      saleUnitId: "",
      name: "",
      description: "",
      price: "",
      image: null,
    },
  });

  const saleUnitOptions = useMemo(
    () =>
      (saleUnits ?? []).map((u) => ({
        value: u.id,
        label: `${u.short_code ?? u.code} · ${u.quantity} ${u.unit === "g" ? "gam" : u.unit} · ${u.seasons.code}`,
      })),
    [saleUnits],
  );

  const saleUnitIdFromUrl = useMemo(() => {
    const fromUrl = searchParams.get("saleUnitId");
    if (!fromUrl || !saleUnits?.length) return "";
    return saleUnits.some((u) => u.id === fromUrl) ? fromUrl : "";
  }, [searchParams, saleUnits]);

  const watchedSaleUnitId = watch("saleUnitId");
  const watchedName = watch("name");
  const watchedDesc = watch("description");

  useEffect(() => {
    if (!watchedSaleUnitId && saleUnitIdFromUrl) {
      setValue("saleUnitId", saleUnitIdFromUrl, { shouldValidate: true });
    }
  }, [watchedSaleUnitId, saleUnitIdFromUrl, setValue]);

  const effectiveSaleUnitId = watchedSaleUnitId || saleUnitIdFromUrl;

  const selectedSaleUnit = useMemo(
    () => saleUnits?.find((u) => u.id === effectiveSaleUnitId),
    [saleUnits, effectiveSaleUnitId],
  );

  const imagePreview = useMemo(
    () => (prodImageFile ? URL.createObjectURL(prodImageFile) : null),
    [prodImageFile],
  );

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const nameCount = watchedName.length;
  const descCount = watchedDesc.length;

  const handleImageFileChange = (file: File | null) => {
    setProdImageFile(file);
    setValue("image", file, { shouldValidate: true });
    clearErrors("image");
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("image", {
        type: "validate",
        message: "Ảnh chỉ hỗ trợ JPG, PNG hoặc WEBP.",
      });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("image", {
        type: "validate",
        message: `Dung lượng ảnh tối đa ${MAX_IMAGE_SIZE_MB}MB.`,
      });
    }
  };

  const handleSuggestListing = async () => {
    if (!shop?.id) return;
    const saleUnitId = watch("saleUnitId") || saleUnitIdFromUrl;
    if (!saleUnitId) {
      toast.error("Chọn lô đã phân (có QR) để gợi ý");
      return;
    }
    try {
      const s = await suggestListing.mutateAsync({
        shopId: shop.id,
        saleUnitId,
      });
      setValue("description", (s.suggestedDescription ?? "").slice(0, 250));
      const p = s.suggestedPriceVnd;
      setValue(
        "price",
        typeof p === "number" && Number.isFinite(p)
          ? String(Number.isInteger(p) ? p : Math.round(p * 100) / 100)
          : "",
      );
    } catch {
      /* toast từ axios */
    }
  };

  const handleAddProduct = async (values: AddProductFormValues) => {
    if (!shop?.id) return;
    const saleUnitId = values.saleUnitId || saleUnitIdFromUrl;
    if (!saleUnitId) {
      setError("saleUnitId", {
        type: "required",
        message: "Vui lòng chọn lô đã phân (có QR).",
      });
      return;
    }
    const price = Number(values.price.trim().replace(",", "."));

    let image_url: string | null | undefined;
    if (prodImageFile) {
      try {
        const up = await uploadService.uploadImages([prodImageFile]);
        const url = up.items[0]?.url;
        if (!url) {
          toast.error("Upload ảnh thất bại");
          return;
        }
        image_url = url;
      } catch {
        toast.error("Không upload được ảnh");
        return;
      }
    }

    addProduct.mutate(
      {
        shopId: shop.id,
        payload: {
          sale_unit_id: saleUnitId,
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          price,
          image_url,
        },
      },
      {
        onSuccess: () => {
          router.replace(`/farmer/marketplace/shops/${shop.id}`);
        },
      },
    );
  };

  const loading = shopsLoading;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4 pb-24 sm:px-6 md:pb-10 lg:px-8">
      <div className="mb-5 flex items-start gap-3">
        <Link
          href={`/farmer/marketplace/shops/${shopId}`}
          aria-label="Quay lại gian hàng"
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Thêm sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn lô QR đã phân của nông trại thuộc gian hàng, đặt tên hiển thị và
            giá để đăng bán.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải…
        </div>
      )}

      {!loading && !shop && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Không tìm thấy gian hàng.{" "}
            <Link
              href="/farmer/marketplace"
              className="font-medium text-primary underline"
            >
              Quay lại danh sách
            </Link>
          </CardContent>
        </Card>
      )}

      {!loading && shop && (
        <Card className="overflow-hidden border-primary/20 shadow-sm">
          <div className="border-b bg-linear-to-br from-primary/10 via-primary/5 to-background px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Gian hàng
            </p>
            <p className="mt-1 text-lg font-semibold">
              {shop.farms?.name ?? shop.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {shop.name}
            </p>
          </div>

          <CardContent className="p-6">
            <form
              className="space-y-5"
              onSubmit={handleSubmit(handleAddProduct, () => {
                toast.error("Vui lòng kiểm tra các trường đang báo lỗi");
              })}
            >
              <input
                type="hidden"
                {...register("saleUnitId", {
                  required: "Vui lòng chọn lô đã phân (có QR).",
                })}
              />
              <input type="hidden" {...register("image")} />
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Lô đã phân (QR) <span className="text-destructive">*</span>
              </Label>
              <FancySelect
                value={effectiveSaleUnitId}
                onChange={(next) => {
                  setValue("saleUnitId", next, { shouldValidate: true });
                  clearErrors("saleUnitId");
                }}
                options={saleUnitOptions}
                placeholder={
                  saleUnitsLoading ? "Đang tải…" : "Chọn lô bán"
                }
                disabled={saleUnitsLoading}
              />
              {errors.saleUnitId?.message && (
                <p className="text-xs text-destructive">
                  {errors.saleUnitId.message}
                </p>
              )}
              {(saleUnits?.length ?? 0) === 0 && !saleUnitsLoading && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                  Chưa có lô nào sẵn sàng đăng bán cho{" "}
                  <span className="font-medium">
                    {shop.farms?.name ?? "—"}
                  </span>
                  . Tạo lô QR mới ở mùa vụ đã công khai, hoặc các lô đã được
                  đăng hết.{" "}
                  <Link
                    href={`/farmer/farms/${shop.farm_id}/seasons`}
                    className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Đi tới mùa vụ và phân lô
                  </Link>
                  .
                </p>
              )}
            </div>

            {selectedSaleUnit && (
              <div className="space-y-2 rounded-xl border border-primary/20 bg-muted/40 p-4 text-sm">
                <p className="font-semibold text-foreground">
                  {selectedSaleUnit.short_code ?? selectedSaleUnit.code}
                </p>
                <p className="text-muted-foreground">
                  {selectedSaleUnit.quantity}{" "}
                  {selectedSaleUnit.unit === "g"
                    ? "gam"
                    : selectedSaleUnit.unit}{" "}
                  · {selectedSaleUnit.seasons.crop_name} (
                  {selectedSaleUnit.seasons.code})
                </p>
                <p className="break-all text-xs text-muted-foreground">
                  Truy xuất: {selectedSaleUnit.qr_url}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="p-name" className="text-sm font-medium">
                Tên sản phẩm (hiển thị trên chợ){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="p-name"
                {...register("name", {
                  required: "Vui lòng nhập tên sản phẩm.",
                  validate: (v) =>
                    v.trim().length >= 2 ||
                    "Tên sản phẩm cần ít nhất 2 ký tự.",
                })}
                maxLength={180}
                className="h-10"
                placeholder={
                  selectedSaleUnit
                    ? `Ví dụ: ${selectedSaleUnit.seasons.crop_name} — ghi rõ cách bán`
                    : "Ví dụ: Cỏ 3 lá tươi"
                }
              />
              {errors.name?.message && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
              <p className="text-right text-[11px] text-muted-foreground">
                {nameCount}/180
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="p-price" className="text-sm font-medium">
                  Giá (VNĐ) <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  disabled={
                    !effectiveSaleUnitId ||
                    suggestListing.isPending ||
                    saleUnitsLoading
                  }
                  onClick={() => void handleSuggestListing()}
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                >
                  {suggestListing.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Gợi ý AI
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Gợi ý điền mô tả cho người mua và giá theo đơn vị lô (vd. đ/kg).
              </p>
              <Input
                id="p-price"
                inputMode="decimal"
                {...register("price", {
                  required: "Vui lòng nhập giá bán.",
                  validate: (v) => {
                    const n = Number(v.trim().replace(",", "."));
                    if (!Number.isFinite(n) || n <= 0) {
                      return "Giá phải là số dương hợp lệ.";
                    }
                    return true;
                  },
                })}
                placeholder="Ví dụ: 25000"
                className="h-10"
              />
              {errors.price?.message && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p-desc" className="text-sm font-medium">
                Mô tả thêm (tuỳ chọn)
              </Label>
              <Textarea
                id="p-desc"
                rows={4}
                maxLength={250}
                {...register("description")}
                placeholder="Ghi chú cho người mua…"
                className="resize-y min-h-[100px]"
              />
              <p className="text-right text-[11px] text-muted-foreground">
                {descCount}/250
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Ảnh (tuỳ chọn)</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="group relative flex aspect-video w-full max-w-[220px] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-primary/30 bg-background shadow-sm transition hover:border-primary/55 hover:shadow-md"
                  aria-label="Chọn ảnh sản phẩm"
                >
                  {imagePreview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
                        Đổi ảnh
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 px-4 py-6 text-muted-foreground">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-center text-xs font-medium">
                        Nhấn để chọn ảnh
                      </span>
                    </div>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleImageFileChange(e.target.files?.[0] ?? null)
                  }
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    Ảnh hiển thị trên chợ. Hỗ trợ JPG/PNG/WEBP, tối đa 5MB.
                  </p>
                  {errors.image?.message && (
                    <p className="text-xs text-destructive">{errors.image.message}</p>
                  )}
                  {prodImageFile && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-xs text-foreground">
                        {prodImageFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-destructive hover:text-destructive"
                        onClick={() => {
                          setProdImageFile(null);
                          clearErrors("image");
                          setValue("image", null, { shouldValidate: true });
                          if (imageInputRef.current)
                            imageInputRef.current.value = "";
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Gỡ ảnh
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Link
                href={`/farmer/marketplace/shops/${shopId}`}
                className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Huỷ
              </Link>
              <Button
                type="submit"
                disabled={
                  addProduct.isPending ||
                  !effectiveSaleUnitId ||
                  !watchedName.trim() ||
                  saleUnitsLoading
                }
                className="h-10 min-w-36 gap-1.5"
              >
                {addProduct.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Thêm sản phẩm
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

