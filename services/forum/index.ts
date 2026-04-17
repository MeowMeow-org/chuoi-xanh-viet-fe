export const FORUM_LABELS = [
    "ky-thuat-trong",
    "phan-bon",
    "sau-benh",
    "tuoi-nuoc",
    "thu-hoach",
    "bao-quan",
    "thi-truong",
    "khac",
] as const;

export type ForumLabel = (typeof FORUM_LABELS)[number];

export interface ForumPostImage {
    id: string;
    objectKey: string;
    url: string;
    sortOrder: number;
}

export interface ForumPostAuthor {
    id: string;
    fullName: string;
    role: string;
}

export interface ForumPost {
    id: string;
    authorUserId: string;
    title: string;
    content: string;
    status: string;
    labels: ForumLabel[];
    images: ForumPostImage[];
    commentCount: number;
    author: ForumPostAuthor;
    createdAt: string;
    updatedAt: string;
}

export interface ForumPostsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ForumPostsResponse {
    items: ForumPost[];
    pagination: ForumPostsPagination;
}

export interface ForumComment {
    id: string;
    postId: string;
    authorUserId: string;
    content: string;
    author: ForumPostAuthor;
    createdAt: string;
    updatedAt: string;
}

export interface ForumCommentsResponse {
    items: ForumComment[];
    pagination: ForumPostsPagination;
}

export interface GetForumPostsQuery {
    page?: number;
    limit?: number;
    searchTerm?: string;
    label?: ForumLabel;
}

export interface GetForumCommentsQuery {
    page?: number;
    limit?: number;
}

export interface CreateForumCommentBody {
    content: string;
}

export interface UpdateForumCommentBody {
    content: string;
}

export interface CreateForumPostImage {
    objectKey: string;
    url: string;
}

export interface CreateForumPostBody {
    title: string;
    content: string;
    labels: ForumLabel[];
    images: CreateForumPostImage[];
}

export interface UpdateForumPostBody {
    title: string;
    content: string;
    labels: ForumLabel[];
    images: CreateForumPostImage[];
    status?: string;
}

export interface ForumUploadItem {
    success: boolean;
    url: string;
    thumb: string;
    id: string;
    size: number;
    aspect_ratio: number;
    forumImage?: CreateForumPostImage;
}

export interface ForumUploadResponse {
    items: ForumUploadItem[];
}
