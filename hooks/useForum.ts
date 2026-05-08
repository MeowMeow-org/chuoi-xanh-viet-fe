"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  CreateForumPostPayload,
  ForumComment,
  ForumCommentsResponse,
  GetForumPostsParams,
  UpdateForumPostPayload,
} from "@/services/forum";
import { forumService } from "@/services/forum/forumService";

/** Số bình luận mỗi lần tải (mới nhất trước, “Xem thêm” nạp thêm một trang). */
export const FORUM_COMMENT_PAGE_SIZE = 3;

export const forumQueryKeys = {
  all: ["forum"] as const,
  posts: (params: GetForumPostsParams) => ["forum", "posts", params] as const,
  post: (id: string) => ["forum", "post", id] as const,
  comments: (postId: string) => ["forum", "comments", postId] as const,
};

/** Gộp các trang `sort=desc` thành một danh sách thời gian tăng dần (cũ → mới). */
export function mergeForumCommentPages(
  pages: ForumCommentsResponse[] | undefined,
): ForumComment[] {
  if (!pages?.length) return [];
  return [...pages]
    .map((p) => [...p.items].reverse())
    .reverse()
    .flat();
}

export function useForumPostsQuery(
  params: GetForumPostsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: forumQueryKeys.posts(params),
    queryFn: () => forumService.getPosts(params),
    enabled,
  });
}

export function useForumCommentsInfiniteQuery(
  postId: string | undefined,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: [
      ...forumQueryKeys.comments(postId ?? ""),
      "infinite",
      FORUM_COMMENT_PAGE_SIZE,
    ] as const,
    queryFn: ({ pageParam }) =>
      forumService.getComments(postId as string, {
        page: pageParam,
        limit: FORUM_COMMENT_PAGE_SIZE,
        sort: "desc",
      }),
    initialPageParam: 1,
    enabled: Boolean(postId) && enabled,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
  });
}

export function useCreateForumPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateForumPostPayload) =>
      forumService.createPost(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
    onError: () => {},
  });
}

export function useUpdateForumPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      payload,
    }: {
      postId: string;
      payload: UpdateForumPostPayload;
    }) => forumService.updatePost(postId, payload),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ["forum", "posts"] });
      void qc.invalidateQueries({ queryKey: forumQueryKeys.post(data.id) });
    },
    onError: () => {},
  });
}

export function useDeleteForumPostMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => forumService.deletePost(postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
    onError: () => {},
  });
}

export function useCreateForumCommentMutation(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      forumService.createComment(postId, content),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: forumQueryKeys.comments(postId),
      });
      void qc.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
    onError: () => {},
  });
}

export function useUpdateForumCommentMutation(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => forumService.updateComment(commentId, content),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: forumQueryKeys.comments(postId),
      });
    },
    onError: () => {},
  });
}

export function useDeleteForumCommentMutation(postId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      forumService.deleteComment(commentId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: forumQueryKeys.comments(postId),
      });
      void qc.invalidateQueries({ queryKey: ["forum", "posts"] });
    },
    onError: () => {},
  });
}
