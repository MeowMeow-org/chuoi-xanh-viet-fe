"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Award, MessageCircle, Send, Shield, Sprout, Store, Trash2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const roleMeta: Record<string, { label: string; icon: LucideIcon }> = {
  farmer: { label: "Nông hộ", icon: Sprout },
  consumer: { label: "Người mua", icon: Store },
  cooperative: { label: "Hợp tác xã", icon: Shield },
  admin: { label: "Quản trị", icon: Award },
};

function roleDisplay(role: string) {
  return roleMeta[role] ?? { label: role, icon: MessageCircle };
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

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
  const AuthorIcon = authorRole.icon;

  const submitComment = () => {
    const t = commentDraft.trim();
    if (!t) return;
    createComment.mutate(t, {
      onSuccess: () => setCommentDraft(""),
    });
  };

  const savePost = () => {
    const title = editTitle.trim();
    const content = editContent.trim();
    if (!title || !content) return;
    updatePost.mutate(
      { postId: post.id, payload: { title, content } },
      { onSuccess: () => setEditingPost(false) },
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            {editingPost && allowEditPost && isPostOwner ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="font-semibold"
                />
              </div>
            ) : (
              <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
            )}
            <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="flex min-w-0 max-w-full items-center gap-1 font-medium text-foreground">
                <AuthorIcon className="h-3 w-3 shrink-0 text-primary" />
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
          </div>
          {isPostOwner && (
            <div className="flex shrink-0 gap-1">
              {allowEditPost && !editingPost && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setEditTitle(post.title);
                    setEditContent(post.content);
                    setEditingPost(true);
                  }}
                >
                  Sửa
                </Button>
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Xóa bài viết này?")) {
                    deletePost.mutate(post.id);
                  }
                }}
                disabled={deletePost.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {editingPost && allowEditPost && isPostOwner ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={5}
            className="text-sm"
          />
        ) : (
          <p className="whitespace-pre-line text-sm">{post.content}</p>
        )}

        {post.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.images.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-md border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-24 w-24 object-cover"
                />
              </a>
            ))}
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
              const CIcon = cr.icon;
              const isCommentOwner =
                Boolean(currentUserId) &&
                comment.authorUserId === currentUserId;

              return (
                <div
                  key={comment.id}
                  className="min-w-0 space-y-1 border-l-2 border-primary/20 pl-3"
                >
                  <div className="flex min-w-0 w-full items-center gap-2 text-xs">
                    <span className="flex min-w-0 flex-1 items-center gap-1 font-medium">
                      <CIcon className="h-3 w-3 shrink-0 text-primary" />
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
                          <>
                            <button
                              type="button"
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" }),
                                "h-6 px-2 text-xs",
                              )}
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditCommentText(comment.content);
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="text-xs text-destructive hover:underline"
                              onClick={() => {
                                if (confirm("Xóa bình luận?")) {
                                  deleteComment.mutate(comment.id);
                                }
                              }}
                            >
                              Xóa
                            </button>
                          </>
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
                                    onSuccess: () => setEditingCommentId(null),
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
                    <p className="text-sm">{comment.content}</p>
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
          <div className="flex gap-2">
            <Input
              placeholder="Viết bình luận..."
              className="h-9 text-sm"
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
              className="h-9 shrink-0 px-3"
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
