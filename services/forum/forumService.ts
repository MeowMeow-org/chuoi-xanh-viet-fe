import { axiosInstance } from "@/lib/axios";
import type {
  CreateForumPostPayload,
  ForumComment,
  ForumCommentsResponse,
  ForumPost,
  ForumPostsResponse,
  GetForumCommentsParams,
  GetForumPostsParams,
  UpdateForumPostPayload,
} from "./index";

export const forumService = {
  getPosts: async (params?: GetForumPostsParams): Promise<ForumPostsResponse> => {
    return axiosInstance.get<ForumPostsResponse, ForumPostsResponse>(
      "/forum/posts",
      { params },
    );
  },

  getPost: async (postId: string): Promise<ForumPost> => {
    return axiosInstance.get<ForumPost, ForumPost>(`/forum/posts/${postId}`);
  },

  createPost: async (payload: CreateForumPostPayload): Promise<ForumPost> => {
    return axiosInstance.post<ForumPost, ForumPost>("/forum/posts", payload);
  },

  updatePost: async (
    postId: string,
    payload: UpdateForumPostPayload,
  ): Promise<ForumPost> => {
    return axiosInstance.patch<ForumPost, ForumPost>(
      `/forum/posts/${postId}`,
      payload,
    );
  },

  deletePost: async (postId: string): Promise<void> => {
    await axiosInstance.delete(`/forum/posts/${postId}`);
  },

  getComments: async (
    postId: string,
    params?: GetForumCommentsParams,
  ): Promise<ForumCommentsResponse> => {
    return axiosInstance.get<ForumCommentsResponse, ForumCommentsResponse>(
      `/forum/posts/${postId}/comments`,
      { params },
    );
  },

  createComment: async (
    postId: string,
    content: string,
  ): Promise<ForumComment> => {
    return axiosInstance.post<ForumComment, ForumComment>(
      `/forum/posts/${postId}/comments`,
      { content },
    );
  },

  updateComment: async (
    commentId: string,
    content: string,
  ): Promise<ForumComment> => {
    return axiosInstance.patch<ForumComment, ForumComment>(
      `/forum/comments/${commentId}`,
      { content },
    );
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await axiosInstance.delete(`/forum/comments/${commentId}`);
  },
};
