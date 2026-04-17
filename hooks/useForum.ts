"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { forumService } from "@/services/forum/forumService";
import type {
    CreateForumCommentBody,
    CreateForumPostBody,
    ForumComment,
    ForumPost,
    ForumUploadResponse,
    GetForumCommentsQuery,
    GetForumPostsQuery,
    UpdateForumCommentBody,
    UpdateForumPostBody,
} from "@/services/forum";
import type { PaginationMeta } from "@/types";

export const forumQueryKeys = {
    all: ["forum"] as const,
    list: (query?: GetForumPostsQuery) => ["forum", "list", query] as const,
    comments: (postId: string, query?: GetForumCommentsQuery) =>
        ["forum", "comments", postId, query] as const,
};

const toPaginationMeta = (
    apiPagination:
        | {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        }
        | undefined,
): PaginationMeta | undefined => {
    if (!apiPagination) return undefined;

    return {
        page: apiPagination.page,
        limit: apiPagination.limit,
        total: apiPagination.total,
        totalPages: apiPagination.totalPages,
        previousPage: apiPagination.page > 1 ? apiPagination.page - 1 : null,
        nextPage: apiPagination.page < apiPagination.totalPages ? apiPagination.page + 1 : null,
    };
};

export const useForumPostsQuery = (query?: GetForumPostsQuery) => {
    const queryResult = useQuery({
        queryKey: forumQueryKeys.list(query),
        queryFn: () => forumService.getPosts(query),
        placeholderData: (prev) => prev,
    });

    return {
        ...queryResult,
        posts: (queryResult.data?.items ?? []) as ForumPost[],
        pagination: toPaginationMeta(queryResult.data?.pagination),
    };
};

export const useForumCommentsQuery = (
    postId: string,
    query?: GetForumCommentsQuery,
    enabled = true,
) => {
    const queryResult = useQuery({
        queryKey: forumQueryKeys.comments(postId, query),
        queryFn: () => forumService.getComments(postId, query),
        placeholderData: (prev) => prev,
        enabled: enabled && postId.trim().length > 0,
    });

    return {
        ...queryResult,
        comments: (queryResult.data?.items ?? []) as ForumComment[],
        pagination: toPaginationMeta(queryResult.data?.pagination),
    };
};

export const useCreateForumCommentMutation = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateForumCommentBody) =>
            forumService.createComment(postId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.comments(postId),
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.all,
            });
        },
    });
};

export const useCreateForumPostMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateForumPostBody) => forumService.createPost(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.all,
            });
        },
    });
};

export const useUploadForumImagesMutation = () => {
    return useMutation<ForumUploadResponse, unknown, File[]>({
        mutationFn: (files) => forumService.uploadImages(files),
    });
};

export const useUpdateForumPostMutation = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateForumPostBody) => forumService.updatePost(postId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.all,
            });
        },
    });
};

export const useDeleteForumPostMutation = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => forumService.deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.all,
            });
        },
    });
};

export const useDeleteForumCommentMutation = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentId: string) => forumService.deleteComment(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.comments(postId),
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.all,
            });
        },
    });
};

export const useUpdateForumCommentMutation = (postId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            commentId,
            payload,
        }: {
            commentId: string;
            payload: UpdateForumCommentBody;
        }) => forumService.updateComment(commentId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.comments(postId),
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: forumQueryKeys.all,
            });
        },
    });
};
