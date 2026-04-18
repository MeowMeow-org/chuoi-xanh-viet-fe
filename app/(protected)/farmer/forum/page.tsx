"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { ForumPostImagePicker } from "@/components/forum/ForumPostImagePicker";
import { ForumPostListFilters } from "@/components/forum/ForumPostListFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FORUM_LABEL_OPTIONS,
  type ForumLabelSlug,
} from "@/constants/forum-labels";
import {
  useCreateForumPostMutation,
  useForumPostsQuery,
} from "@/hooks/useForum";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadService } from "@/services/upload/uploadService";
import { cn } from "@/lib/utils";

export default function FarmerForumPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [labelFilter, setLabelFilter] = useState<ForumLabelSlug | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<ForumLabelSlug[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [postBusy, setPostBusy] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, error, refetch } = useForumPostsQuery(
    {
      page,
      limit: 15,
      label: labelFilter,
      searchTerm: searchTerm || undefined,
    },
    true,
  );
  const createPost = useCreateForumPostMutation();

  useEffect(() => {
    setPage(1);
  }, [labelFilter, searchTerm]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearchTerm(searchDraft.trim());
    }, 320);
    return () => window.clearTimeout(id);
  }, [searchDraft]);

  useEffect(() => {
    if (!dialogOpen) setImageFiles([]);
  }, [dialogOpen]);

  const toggleLabel = (slug: ForumLabelSlug) => {
    setSelectedLabels((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 10) return prev;
      return [...prev, slug];
    });
  };

  const handlePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("Nhập tiêu đề và nội dung");
      return;
    }
    if (selectedLabels.length === 0) {
      toast.error("Chọn ít nhất một nhãn chủ đề");
      return;
    }
    setPostBusy(true);
    try {
      let images:
        | Array<{ objectKey: string; url: string }>
        | undefined;
      if (imageFiles.length > 0) {
        const { items } = await uploadService.uploadImages(imageFiles);
        const mapped = items
          .filter((item) => item.success && item.forumImage)
          .map((item) => item.forumImage);
        if (mapped.length !== imageFiles.length) {
          toast.error("Một số ảnh chưa tải lên được. Vui lòng thử lại.");
          return;
        }
        images = mapped;
      }
      await createPost.mutateAsync({
        title: newTitle.trim(),
        content: newContent.trim(),
        labels: [...selectedLabels],
        ...(images?.length ? { images } : {}),
      });
      toast.success("Đã đăng bài");
      setNewTitle("");
      setNewContent("");
      setSelectedLabels([]);
      setImageFiles([]);
      setDialogOpen(false);
    } catch {
      toast.error("Không đăng được bài — kiểm tra nhãn và thử lại");
    } finally {
      setPostBusy(false);
    }
  };

  const posts = data?.items ?? [];
  const pagination = data?.pagination;
  const listFiltered = Boolean(labelFilter || searchTerm);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-5 py-6 pb-20 sm:px-6 md:pb-8 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Diễn đàn kỹ thuật</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                Đăng bài
              </Button>
            }
          />
          <DialogContent className="sm:max-w-140 rounded-2xl bg-white p-5">
            <DialogHeader className="pr-8">
              <DialogTitle className="text-2xl font-bold text-[hsl(150,10%,15%)]">
                Đăng bài mới
              </DialogTitle>
            </DialogHeader>

            <div className="mt-1 space-y-4">
              <Input
                placeholder="Tiêu đề bài viết"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={220}
                className="flex h-11 w-full rounded-xl border border-[hsl(142,15%,82%)] bg-white px-3 py-2 text-base text-[hsl(150,10%,15%)] placeholder:text-[hsl(150,6%,55%)] ring-offset-background focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)] focus:ring-offset-1"
              />
              <Textarea
                placeholder="Nội dung chi tiết..."
                rows={5}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={20000}
                className="min-h-40 rounded-xl border-[hsl(142,15%,82%)] bg-white px-3 py-2 text-base text-[hsl(150,10%,15%)] placeholder:text-[hsl(150,6%,55%)] focus-visible:ring-[hsl(142,71%,45%)]"
              />
              <ForumPostImagePicker
                files={imageFiles}
                onFilesChange={setImageFiles}
              />
              <div>
                <p className="mb-2 text-sm text-muted-foreground">
                  Nhãn chủ đề (bắt buộc, tối đa 10)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FORUM_LABEL_OPTIONS.map(({ value, label }) => (
                    <Badge
                      key={value}
                      variant={
                        selectedLabels.includes(value) ? "default" : "outline"
                      }
                      className={cn(
                        "cursor-pointer text-xs",
                        selectedLabels.includes(value) && "hover:bg-primary",
                      )}
                      onClick={() => toggleLabel(value)}
                    >
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                className="h-11 w-full text-base font-semibold"
                onClick={() => void handlePost()}
                disabled={
                  postBusy ||
                  createPost.isPending ||
                  !newTitle.trim() ||
                  !newContent.trim() ||
                  selectedLabels.length === 0
                }
              >
                {postBusy || createPost.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng…
                  </>
                ) : (
                  "Đăng bài"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ForumPostListFilters
        labelFilter={labelFilter}
        onLabelChange={setLabelFilter}
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
      />

      {isLoading && (
        <div className="flex justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải bài viết…
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {(error as Error)?.message ?? "Lỗi tải diễn đàn"}
          <Button
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={() => void refetch()}
          >
            Thử lại
          </Button>
        </div>
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {listFiltered
            ? "Không có bài phù hợp bộ lọc hoặc từ khóa. Thử chỉnh lại tìm kiếm hoặc nhãn."
            : "Chưa có bài viết. Hãy đăng bài đầu tiên."}
        </p>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            currentUserId={user?.id}
            allowEditPost={false}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            {page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}
