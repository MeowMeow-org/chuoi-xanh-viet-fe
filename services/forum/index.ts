import type { ForumLabelSlug } from "@/constants/forum-labels";

export interface ForumAuthor {
  id: string;
  fullName: string;
  role: string;
}

export interface ForumPostImage {
  id: string;
  objectKey: string;
  url: string;
  sortOrder: number;
}

export interface ForumPost {
  id: string;
  authorUserId: string;
  title: string;
  content: string;
  status: string;
  labels: string[];
  images: ForumPostImage[];
  commentCount: number;
  author: ForumAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorUserId: string;
  content: string;
  author: ForumAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ForumPostsResponse {
  items: ForumPost[];
  pagination: ForumPagination;
}

export interface ForumCommentsResponse {
  items: ForumComment[];
  pagination: ForumPagination;
}

export interface GetForumPostsParams {
  page?: number;
  limit?: number;
  label?: ForumLabelSlug;
  searchTerm?: string;
}

export interface CreateForumPostPayload {
  title: string;
  content: string;
  labels: string[];
  images?: Array<{ objectKey: string; url: string }>;
}

export interface UpdateForumPostPayload {
  title?: string;
  content?: string;
  labels?: string[];
  images?: Array<{ objectKey: string; url: string }>;
}

export interface GetForumCommentsParams {
  page?: number;
  limit?: number;
  /** `desc`: mới nhất trước (phân trang từ cuối thread). `asc`: mặc định BE. */
  sort?: "asc" | "desc";
}
