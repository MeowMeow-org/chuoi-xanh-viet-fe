"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Loader2, Phone, Sprout, User } from "lucide-react";
import { toast } from "@/components/ui/toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeQuery, usePatchMeMutation } from "@/hooks/useAuth";
import { uploadService } from "@/services/upload/uploadService";

export default function FarmerProfilePage() {
  const { data: me, isLoading } = useMeQuery();
  const patchMe = usePatchMeMutation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadImages([file]);
      const url = res.items[0]?.url;
      if (!url) throw new Error("No URL");
      patchMe.mutate({ avatarUrl: url });
    } catch {
      toast.error("Không upload hoặc cập nhật ảnh được");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (isLoading || !me) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center px-4 py-12 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải hồ sơ…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-4 pb-20 sm:px-6 md:pb-8 lg:px-8">
      <h1 className="text-xl font-bold">Hồ sơ tài khoản</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-full border object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  void handleAvatarFile(e.target.files?.[0] ?? null)
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading || patchMe.isPending}
                onClick={() => fileRef.current?.click()}
              >
                {uploading || patchMe.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Đổi ảnh đại diện
              </Button>
              {me.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  disabled={patchMe.isPending}
                  onClick={() => patchMe.mutate({ avatarUrl: null })}
                >
                  Xóa ảnh
                </Button>
              )}
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold">{me.fullName}</p>
            <p className="text-sm text-muted-foreground">{me.email}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{me.phone}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Vai trò: <span className="font-medium">{me.role}</span> · Trạng
            thái: {me.status}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sprout className="h-4 w-4" />
            Nông trại & mùa vụ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Quản lý trại, mùa vụ và nhật ký trong mục{" "}
            <Link href="/farmer/farms" className="font-medium text-primary underline">
              Nông trại
            </Link>
            .
          </p>
          <p className="text-muted-foreground">
            Gian hàng:{" "}
            <Link
              href="/farmer/marketplace"
              className="font-medium text-primary underline"
            >
              Gian hàng
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

