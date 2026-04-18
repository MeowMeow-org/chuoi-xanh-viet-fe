"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const FORUM_POST_MAX_IMAGES = 3;

export function ForumPostImagePicker({
  files,
  onFilesChange,
  className,
}: {
  files: File[];
  onFilesChange: (files: File[]) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith("image/"));
    const next = [...files];
    for (const f of incoming) {
      if (next.length >= FORUM_POST_MAX_IMAGES) break;
      next.push(f);
    }
    onFilesChange(next);
  };

  const removeAt = (idx: number) => {
    onFilesChange(files.filter((_, i) => i !== idx));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm text-muted-foreground">
        Ảnh minh họa (tuỳ chọn, tối đa {FORUM_POST_MAX_IMAGES} tấm)
      </p>
      <div className="flex flex-wrap gap-2">
        {previews.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-20 w-20 overflow-hidden rounded-md border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm hover:bg-destructive hover:text-white"
              aria-label="Gỡ ảnh"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {files.length < FORUM_POST_MAX_IMAGES && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-20 w-20 flex-col gap-1 border-dashed p-0 text-muted-foreground"
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[10px] font-medium">Thêm ảnh</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
