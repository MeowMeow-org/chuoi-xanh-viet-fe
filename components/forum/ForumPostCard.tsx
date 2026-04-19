"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Popconfirm } from "antd";
import { MessageCircle, MoreHorizontal, Send, Trash2, UserRound } from "lucide-react";
import { showAppToast } from "@/components/ui/toast";

import { forumSlugToLabel } from "@/constants/forum-labels";
import {
  FORUM_COMMENT_PAGE_SIZE,
  mergeForumCommentPages,
  useCreateForumCommentMutation,
  useDeleteForumCommentMutation,
  useDeleteForumPostMutation,
  useForumCommentsInfiniteQuery,
  useUpdateForumCommentMutation,
  useUpdateForumPostMutation,
} from "@/hooks/useForum";
import type { ForumPost } from "@/services/forum";
import { uploadService } from "@/services/upload/uploadService";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ForumPostImagePicker } from "@/components/forum/ForumPostImagePicker";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const roleMeta: Record<string, { label: string }> = {
  farmer: { label: "Nông hộ" },
  consumer: { label: "Người mua" },
  cooperative: { label: "Hợp tác xã" },
  admin: { label: "Quản trị" },
};

function roleDisplay(role: string) {
  return roleMeta[role] ?? { label: role };
}

export function ForumPostCard({
  post,
  currentUserId,
  allowEditPost = false,
  readOnly = false,
  onRequireAuth,
}: {
  post: ForumPost;
  currentUserId?: string;
  allowEditPost?: boolean;
  /** Guest mode: ẩn form bình luận, gắn link "Đăng nhập để bình luận". */
  readOnly?: boolean;
  /** Khi readOnly, bấm vào link sẽ gọi hàm này (toast + redirect login) */
  onRequireAuth?: () => void;
}) {
  const [commentDraft, setCommentDraft] = useState("");
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editExistingImages, setEditExistingImages] = useState(post.images);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [commentMenuOpenId, setCommentMenuOpenId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const postMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    data: commentsPages,
    isLoading: commentsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useForumCommentsInfiniteQuery(post.id);
  const createComment = useCreateForumCommentMutation(post.id);
  const updateComment = useUpdateForumCommentMutation(post.id);
  const deleteComment = useDeleteForumCommentMutation(post.id);
  const updatePost = useUpdateForumPostMutation();
  const deletePost = useDeleteForumPostMutation();

  const isPostOwner = Boolean(currentUserId && post.authorUserId === currentUserId);
  const comments = useMemo(
    () => mergeForumCommentPages(commentsPages?.pages),
    [commentsPages?.pages],
  );
  const totalCommentRows =
    commentsPages?.pages?.[0]?.pagination.total ?? post.commentCount;
  const olderRemaining = Math.max(0, totalCommentRows - comments.length);
  const nextCommentChunk = Math.min(FORUM_COMMENT_PAGE_SIZE, olderRemaining);

  const authorRole = roleDisplay(post.author.role);

  const submitComment = () => {
    const t = commentDraft.trim();
    if (!t) return;
    createComment.mutate(t, {
      onSuccess: () => setCommentDraft(""),
    });
  };

  const savePost = async () => {
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!title || !content) return;

    let images = editExistingImages.map((img) => ({
      objectKey: img.objectKey,
      url: img.url,
    }));

    if (editImageFiles.length > 0) {
      const { items } = await uploadService.uploadImages(editImageFiles);
      const mapped = items
        .filter((item) => item.success && item.forumImage)
        .map((item) => item.forumImage);

      if (mapped.length !== editImageFiles.length) {
        throw new Error("Một số ảnh chưa tải lên được. Vui lòng thử lại.");
      }

      images = mapped;
    }

    updatePost.mutate(
      {
        postId: post.id,
        payload: {
          title,
          content,
          labels: [...post.labels],
          images,
        },
      },
      {
        onSuccess: () => {
          setEditingPost(false);
          showAppToast({ message: "Đã cập nhật bài viết", type: "success" });
        },
      },
    );
  };

  const handleDeletePost = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => {
        showAppToast({ message: "Đã xóa bài viết", type: "success" });
      },
    });
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment.mutate(commentId, {
      onSuccess: () => {
        showAppToast({ message: "Đã xóa bình luận", type: "success" });
      },
    });
  };

  useEffect(() => {
    if (!postMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(".ant-popover")) return;
      if (!postMenuRef.current) return;
      if (!postMenuRef.current.contains(target)) {
        setPostMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPostMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [postMenuOpen]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".ant-popover")) return;
      if (!target?.closest("[data-comment-menu]")) {
        setCommentMenuOpenId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex min-w-0 max-w-full items-center gap-1 font-medium text-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(142,30%,90%)] text-[hsl(142,71%,38%)]">
                  <UserRound className="h-3 w-3" />
                </span>
                <span className="truncate" title={post.author.fullName}>
                  {post.author.fullName}
                </span>
              </span>
              <Badge className="h-5 shrink-0 border border-border bg-white text-[10px] text-foreground hover:bg-white">
                {authorRole.label}
              </Badge>
              <span className="shrink-0">
                {new Date(post.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
            {editingPost && allowEditPost && isPostOwner ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="my-0 font-semibold"
                />
              </div>
            ) : (
              <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
            )}
          </div>
          {isPostOwner && (
            <div className="flex shrink-0 gap-1">
              {allowEditPost && !editingPost && (
                <div className="relative" ref={postMenuRef}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    title="Tùy chọn bài viết"
                    aria-label="Tùy chọn bài viết"
                    onClick={() => setPostMenuOpen((v) => !v)}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {postMenuOpen && (
                    <div className="absolute right-0 z-20 mt-1 min-w-28 rounded-md border bg-background p-1 shadow-md">
                      <button
                        type="button"
                        className="flex w-full items-center justify-start rounded-sm px-2 py-1.5 text-xs hover:bg-muted"
                        onClick={() => {
                          setEditTitle(post.title);
                          setEditContent(post.content);
                          setEditExistingImages(post.images);
                          setEditImageFiles([]);
                          setEditingPost(true);
                          setPostMenuOpen(false);
                        }}
                      >
                        Sửa
                      </button>
                      <Popconfirm
                        title="Xóa bài viết này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, loading: deletePost.isPending }}
                        onConfirm={() => {
                          setPostMenuOpen(false);
                          handleDeletePost();
                        }}
                      >
                        <button
                          type="button"
                          className="flex w-full cursor-pointer items-center justify-start rounded-sm px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                          disabled={deletePost.isPending}
                        >
                          Xóa
                        </button>
                      </Popconfirm>
                    </div>
                  )}
                </div>
              )}
              {allowEditPost && editingPost && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => void savePost()}
                    disabled={updatePost.isPending}
                  >
                    Lưu
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setEditingPost(false)}
                  >
                    Hủy
                  </Button>
                </>
              )}
              {!allowEditPost && (
                <Popconfirm
                  title="Xóa bài viết này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true, loading: deletePost.isPending }}
                  onConfirm={handleDeletePost}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 cursor-pointer px-2 text-destructive hover:text-destructive"
                    disabled={deletePost.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Popconfirm>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {editingPost && allowEditPost && isPostOwner ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              className="text-sm"
            />
            {editExistingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Ảnh hiện có</p>
                <div className="flex flex-wrap gap-2">
                  {editExistingImages.map((img, index) => (
                    <div
                      key={img.id}
                      className="relative h-24 w-24 overflow-hidden rounded-md border bg-muted"
                    >
                      <Image
                        src={img.url}
                        alt=""
                        width={96}
                        height={96}
                        preview={false}
                        className="block h-full w-full object-cover"
                        rootClassName="block h-full w-full leading-none"
                        style={{ display: "block", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditExistingImages((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="absolute right-0.5 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm hover:bg-destructive hover:text-white"
                        aria-label="Xóa ảnh cũ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ForumPostImagePicker
              files={editImageFiles}
              onFilesChange={setEditImageFiles}
              className="rounded-lg border border-dashed border-border p-3"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-3">
            <p className="whitespace-pre-line text-sm leading-6">{post.content}</p>
          </div>
        )}

        {!editingPost && post.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Image.PreviewGroup>
              {post.images.map((img) => (
                <div
                  key={img.id}
                  className="h-24 w-24 overflow-hidden rounded-md border bg-muted"
                >
                  <Image
                    src={img.url}
                    alt=""
                    width={96}
                    height={96}
                    className="block h-full w-full object-cover"
                    rootClassName="block h-full w-full leading-none"
                    style={{ display: "block", objectFit: "cover" }}
                  />
                </div>
              ))}
            </Image.PreviewGroup>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {post.labels.map((slug) => (
            <Badge
              key={slug}
              variant="secondary"
              className="text-xs hover:bg-secondary"
            >
              {forumSlugToLabel(slug)}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          {post.commentCount} bình luận
          {commentsLoading && <span className="text-xs">(đang tải…)</span>}
        </div>

        {comments.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            {hasNextPage && (
              <div className="flex justify-center pb-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? "Đang tải…"
                    : `Xem thêm ${nextCommentChunk} bình luận trước đó`}
                </Button>
              </div>
            )}
            {comments.map((comment) => {
              const cr = roleDisplay(comment.author.role);
              const isCommentOwner =
                Boolean(currentUserId) &&
                comment.authorUserId === currentUserId;

              return (
                <div
                  key={comment.id}
                  className="min-w-0 space-y-1 rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
                >
                  <div className="flex min-w-0 w-full items-center gap-2 text-xs">
                    <span className="flex min-w-0 flex-1 items-center gap-1 font-medium">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(142,30%,90%)] text-[hsl(142,71%,38%)]">
                        <UserRound className="h-3 w-3" />
                      </span>
                      <span
                        className="truncate"
                        title={comment.author.fullName}
                      >
                        {comment.author.fullName}
                      </span>
                    </span>
                    <Badge className="h-4 shrink-0 border border-border bg-white text-[10px] hover:bg-white">
                      {cr.label}
                    </Badge>
                    <span className="shrink-0 text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    {isCommentOwner && (
                      <div className="ml-auto flex shrink-0 gap-1">
                        {editingCommentId !== comment.id ? (
                          <div className="relative" data-comment-menu>
                            <button
                              type="button"
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" }),
                                "h-6 w-6 cursor-pointer p-0",
                              )}
                              aria-label="Tùy chọn bình luận"
                              onClick={() =>
                                setCommentMenuOpenId((prev) =>
                                  prev === comment.id ? null : comment.id,
                                )
                              }
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {commentMenuOpenId === comment.id && (
                              <div className="absolute right-0 z-20 mt-1 min-w-24 rounded-md border bg-background p-1 shadow-md">
                                <button
                                  type="button"
                                  className="flex w-full cursor-pointer items-center justify-start rounded-sm px-2 py-1.5 text-xs hover:bg-muted"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentText(comment.content);
                                    setCommentMenuOpenId(null);
                                  }}
                                >
                                  Sửa
                                </button>
                                <Popconfirm
                                  title="Xóa bình luận này?"
                                  okText="Xóa"
                                  cancelText="Hủy"
                                  okButtonProps={{ danger: true, loading: deleteComment.isPending }}
                                  onConfirm={() => {
                                    setCommentMenuOpenId(null);
                                    handleDeleteComment(comment.id);
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="flex w-full cursor-pointer items-center justify-start rounded-sm px-2 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                                    disabled={deleteComment.isPending}
                                  >
                                    Xóa
                                  </button>
                                </Popconfirm>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              className="h-6 text-xs"
                              onClick={() => {
                                const t = editCommentText.trim();
                                if (!t) return;
                                updateComment.mutate(
                                  { commentId: comment.id, content: t },
                                  {
                                    onSuccess: () => {
                                      setEditingCommentId(null);
                                      showAppToast({
                                        message: "Đã cập nhật bình luận",
                                        type: "success",
                                      });
                                    },
                                  },
                                );
                              }}
                              disabled={updateComment.isPending}
                            >
                              Lưu
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={() => setEditingCommentId(null)}
                            >
                              Hủy
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <Textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  ) : (
                    <p className="text-sm leading-6">{comment.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {readOnly ? (
          <button
            type="button"
            onClick={() => onRequireAuth?.()}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4" />
            Đăng nhập để bình luận
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Viết bình luận..."
              className="my-0 h-8 flex-1 text-sm"
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 shrink-0 px-3"
              onClick={() => submitComment()}
              disabled={createComment.isPending || !commentDraft.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
