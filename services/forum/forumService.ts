import { axiosInstance } from "@/lib/axios";

import type {
    CreateForumCommentBody,
    CreateForumPostBody,
    ForumComment,
    ForumCommentsResponse,
    ForumPostsResponse,
    ForumUploadResponse,
    GetForumCommentsQuery,
    GetForumPostsQuery,
    ForumPost,
    UpdateForumCommentBody,
    UpdateForumPostBody,
} from "./index";

export const forumService = {
    getPosts: async (query?: GetForumPostsQuery): Promise<ForumPostsResponse> => {
        const response = await axiosInstance.get<ForumPostsResponse, ForumPostsResponse>(
            "/forum/posts",
            {
                params: query,
            },
        );
        return response;
    },

    getComments: async (
        postId: string,
        query?: GetForumCommentsQuery,
    ): Promise<ForumCommentsResponse> => {
        const response = await axiosInstance.get<ForumCommentsResponse, ForumCommentsResponse>(
            `/forum/posts/${postId}/comments`,
            {
                params: query,
            },
        );
        return response;
    },

    createComment: async (
        postId: string,
        payload: CreateForumCommentBody,
    ): Promise<ForumComment> => {
        const response = await axiosInstance.post<ForumComment, ForumComment>(
            `/forum/posts/${postId}/comments`,
            payload,
        );
        return response;
    },

    updateComment: async (
        commentId: string,
        payload: UpdateForumCommentBody,
    ): Promise<ForumComment> => {
        const response = await axiosInstance.patch<ForumComment, ForumComment>(
            `/forum/comments/${commentId}`,
            payload,
        );
        return response;
    },

    createPost: async (payload: CreateForumPostBody): Promise<ForumPost> => {
        const response = await axiosInstance.post<ForumPost, ForumPost>(
            "/forum/posts",
            payload,
        );
        return response;
    },

    updatePost: async (
        postId: string,
        payload: UpdateForumPostBody,
    ): Promise<ForumPost> => {
        const response = await axiosInstance.patch<ForumPost, ForumPost>(
            `/forum/posts/${postId}`,
            payload,
        );
        return response;
    },

    deletePost: async (postId: string): Promise<unknown> => {
        const response = await axiosInstance.delete<unknown, unknown>(`/forum/posts/${postId}`);
        return response;
    },

    deleteComment: async (commentId: string): Promise<unknown> => {
        const response = await axiosInstance.delete<unknown, unknown>(`/forum/comments/${commentId}`);
        return response;
    },

    uploadImages: async (files: File[]): Promise<ForumUploadResponse> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("images", file);
        });

        const response = await axiosInstance.post<ForumUploadResponse, ForumUploadResponse>(
            "/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
        return response;
    },
};
