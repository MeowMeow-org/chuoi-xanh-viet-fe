"use client";

import { useEffect, useState } from "react";
import ConsumerLayout from "@/components/layout/ConsumerLayout";
import { ForumPostCard } from "@/components/forum/ForumPostCard";
import { ForumPostImagePicker } from "@/components/forum/ForumPostImagePicker";
import {
  ForumPostListFilters,
  type ForumPostViewMode,
} from "@/components/forum/ForumPostListFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { uploadService } from "@/services/upload/uploadService";
import { ChevronDown, Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function PublicForumPage() {
  const user = useAuthStore((s) => s.user);
  const requireAuth = useRequireAuth();
  const isGuest = !user;

  const [page, setPage] = useState(1);
  const [filterTag, setFilterTag] = useState<ForumLabelSlug | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<ForumLabelSlug[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [postBusy, setPostBusy] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ForumPostViewMode>("current");

  const { data, isLoading, isError, error, refetch } = useForumPostsQuery(
    {
      page,
      limit: 15,
      label: filterTag,
      searchTerm: searchTerm || undefined,
    },
    true,
  );
  const createPost = useCreateForumPostMutation();

  useEffect(() => {
    setPage(1);
  }, [filterTag, searchTerm]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearchTerm(searchDraft.trim());
    }, 320);
    return () => window.clearTimeout(id);
  }, [searchDraft]);

  useEffect(() => {
    if (!showCreate) setImageFiles([]);
  }, [showCreate]);

  const toggleTag = (tag: ForumLabelSlug) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 10) return prev;
      return [...prev, tag];
    });
  };

  const handleToggleCreate = () => {
    if (!showCreate) {
      if (!requireAuth({ guestMessage: "Đăng nhập để tạo bài viết" })) return;
    }
    setShowCreate((v) => !v);
  };

  const createPostSubmit = async () => {
    if (!requireAuth({ guestMessage: "Đăng nhập để tạo bài viết" })) return;
    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng nhập tiêu đề và nội dung");
      return;
    }
    if (selectedTags.length === 0) {
      toast.error("Chọn ít nhất một nhãn");
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
        title: title.trim(),
        content: content.trim(),
        labels: [...selectedTags],
        ...(images?.length ? { images } : {}),
      });
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setImageFiles([]);
      setShowCreate(false);
      toast.success("Đã đăng bài");
    } catch {
      toast.error("Không đăng được bài");
    } finally {
      setPostBusy(false);
    }
  };

  const posts = data?.items ?? [];
  const pagination = data?.pagination;
  const listFiltered = Boolean(filterTag || searchTerm);
  const resetFilters = () => {
    setFilterTag(undefined);
    setSearchDraft("");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <ConsumerLayout>
      <div className="container max-w-6xl space-y-4 py-4 pb-20 md:pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Diễn đàn</h1>
          <Button size="sm" onClick={handleToggleCreate}>
            {showCreate ? "Hủy" : "Tạo bài viết"}
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
          <aside className="md:w-72 md:shrink-0">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-3 text-sm font-bold uppercase tracking-wide md:hidden"
              onClick={() => setMobileFilterOpen((open) => !open)}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  mobileFilterOpen && "rotate-180",
                )}
              />
            </button>

            <div
              className={cn(
                "rounded-lg border border-border bg-card/50 md:sticky md:top-4",
                mobileFilterOpen ? "mt-2 block md:mt-0" : "hidden md:block",
              )}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2 text-sm tracking-wide">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={resetFilters}
                >
                  Đặt lại
                </Button>
              </div>
              <div className="p-4">
                <ForumPostListFilters
                  labelFilter={filterTag}
                  onLabelChange={setFilterTag}
                  searchDraft={searchDraft}
                  onSearchDraftChange={setSearchDraft}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 space-y-4">
            {showCreate && !isGuest && (
              <Card>
                <CardContent className="space-y-3 p-4">
                  <Input
                    placeholder="Tiêu đề bài viết"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={220}
                  />
                  <Textarea
                    placeholder="Nội dung..."
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={20000}
                  />
                  <ForumPostImagePicker
                    files={imageFiles}
                    onFilesChange={setImageFiles}
                  />
                  <div>
                    <p className="mb-2 text-xs text-muted-foreground">
                      Chọn nhãn (bắt buộc, tối đa 10)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {FORUM_LABEL_OPTIONS.map(({ value, label }) => (
                        <Badge
                          key={value}
                          variant={
                            selectedTags.includes(value) ? "default" : "outline"
                          }
                          className={cn(
                            "cursor-pointer text-xs",
                            selectedTags.includes(value) && "hover:bg-primary",
                          )}
                          onClick={() => toggleTag(value)}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => void createPostSubmit()}
                    disabled={
                      postBusy ||
                      createPost.isPending ||
                      !title.trim() ||
                      !content.trim() ||
                      selectedTags.length === 0
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
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="flex justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải…
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
                  ? "Không có bài phù hợp bộ lọc hoặc từ khóa."
                  : "Chưa có bài viết."}
              </p>
            )}

            <div className="space-y-4">
              {posts.map((post) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  allowEditPost
                  viewMode={viewMode}
                  readOnly={isGuest}
                  onRequireAuth={() => {
                    requireAuth({ guestMessage: "Đăng nhập để bình luận" });
                  }}
                />
              ))}
            </div>

            {pagination && (
              <div className="flex justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <span className="flex items-center text-xs text-muted-foreground">
                  {page}/{pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ConsumerLayout>
  );
}

