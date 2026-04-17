"use client";

import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { Image as AntdImage, Popconfirm } from "antd";
import {
    ImagePlus,
    Loader2,
    MessageCircle,
    Pencil,
    Plus,
    Search,
    Sprout,
    Trash2,
    X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Pagination } from "@/components/shared/Pagination";
import {
    useCreateForumPostMutation,
    useCreateForumCommentMutation,
    useDeleteForumCommentMutation,
    useDeleteForumPostMutation,
    useForumCommentsQuery,
    useForumPostsQuery,
    useUpdateForumCommentMutation,
    useUpdateForumPostMutation,
    useUploadForumImagesMutation,
} from "@/hooks/useForum";
import { FORUM_LABELS, type ForumLabel, type ForumPost } from "@/services/forum";
import { useAuthStore } from "@/store/useAuthStore";

const ROLE_LABEL: Record<string, string> = {
    farmer: "Nông dân",
    expert: "Chuyên gia",
    extension_officer: "Cán bộ khuyến nông",
};

const LABEL_LABELS: Record<ForumLabel, string> = {
    "ky-thuat-trong": "Kỹ thuật trồng",
    "phan-bon": "Phân bón",
    "sau-benh": "Sâu bệnh",
    "tuoi-nuoc": "Tưới nước",
    "thu-hoach": "Thu hoạch",
    "bao-quan": "Bảo quản",
    "thi-truong": "Thị trường",
    khac: "Khác",
};

const getSafeImageSrc = (rawUrl: string | undefined): string | null => {
    if (!rawUrl) return null;

    if (rawUrl.startsWith("/")) {
        return rawUrl;
    }

    try {
        const parsed = new URL(rawUrl);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return rawUrl;
        }
        return null;
    } catch {
        return null;
    }
};

const COMMENTS_LIMIT = 20;

interface FarmerForumPostCardProps {
    post: ForumPost;
    currentUserId?: string;
}

function FarmerForumPostCard({ post, currentUserId }: FarmerForumPostCardProps) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentsPage, setCommentsPage] = useState(1);
    const [commentInput, setCommentInput] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(post.title);
    const [editContent, setEditContent] = useState(post.content);
    const [editLabels, setEditLabels] = useState<ForumLabel[]>(post.labels);
    const [editExistingImages, setEditExistingImages] = useState(
        post.images.map((image) => ({ objectKey: image.objectKey, url: image.url })),
    );
    const [editNewFiles, setEditNewFiles] = useState<File[]>([]);

    const { comments, pagination, isLoading, isFetching, isError, refetch } = useForumCommentsQuery(
        post.id,
        {
            page: commentsPage,
            limit: COMMENTS_LIMIT,
        },
        isCommentsOpen,
    );
    const createCommentMutation = useCreateForumCommentMutation(post.id);
    const updateCommentMutation = useUpdateForumCommentMutation(post.id);
    const deleteCommentMutation = useDeleteForumCommentMutation(post.id);
    const updatePostMutation = useUpdateForumPostMutation(post.id);
    const deletePostMutation = useDeleteForumPostMutation(post.id);
    const uploadImagesMutation = useUploadForumImagesMutation();

    const roleLabel = ROLE_LABEL[post.author.role] ?? post.author.role;
    const isOwner = currentUserId === post.authorUserId;
    const isUpdatingPost = updatePostMutation.isPending || uploadImagesMutation.isPending;
    const isDeletingPost = deletePostMutation.isPending;
    const validImageSources = post.images
        .map((image) => getSafeImageSrc(image.url))
        .filter((src): src is string => Boolean(src));
    const visibleImageSources = validImageSources.slice(0, 3);
    const editPreviewUrls = useMemo(
        () => editNewFiles.map((file) => URL.createObjectURL(file)),
        [editNewFiles],
    );

    useEffect(() => {
        return () => {
            editPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [editPreviewUrls]);

    const toggleComments = () => {
        setIsCommentsOpen((prev) => {
            const next = !prev;
            if (next) {
                setCommentsPage(1);
            }
            return next;
        });
    };

    const startEditing = () => {
        setEditTitle(post.title);
        setEditContent(post.content);
        setEditLabels(post.labels);
        setEditExistingImages(post.images.map((image) => ({ objectKey: image.objectKey, url: image.url })));
        setEditNewFiles([]);
        setIsEditing(true);
    };

    const toggleEditLabel = (nextLabel: ForumLabel) => {
        setEditLabels((prev) =>
            prev.includes(nextLabel)
                ? prev.filter((labelItem) => labelItem !== nextLabel)
                : [...prev, nextLabel],
        );
    };

    const handleSelectEditFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList) {
            return;
        }

        const allowed = Math.max(0, 3 - editExistingImages.length - editNewFiles.length);
        const files = Array.from(fileList)
            .filter((file) => file.type.startsWith("image/"))
            .slice(0, allowed);

        if (files.length > 0) {
            setEditNewFiles((prev) => [...prev, ...files]);
        }
        event.target.value = "";
    };

    const handleRemoveEditExistingImage = (index: number) => {
        setEditExistingImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleRemoveEditNewFile = (index: number) => {
        setEditNewFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const handleUpdatePost = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            toast.error("Vui lòng nhập tiêu đề và nội dung bài viết");
            return;
        }

        try {
            let uploadedImages: Array<{ objectKey: string; url: string }> = [];
            if (editNewFiles.length > 0) {
                const uploadResult = await uploadImagesMutation.mutateAsync(editNewFiles);
                uploadedImages = uploadResult.items
                    .map((item) => item.forumImage)
                    .filter((forumImage): forumImage is { objectKey: string; url: string } =>
                        Boolean(forumImage?.objectKey && forumImage?.url),
                    );
            }

            await updatePostMutation.mutateAsync({
                title: editTitle.trim(),
                content: editContent.trim(),
                labels: editLabels,
                images: [...editExistingImages, ...uploadedImages],
            });

            toast.success("Đã cập nhật bài viết");
            setIsEditing(false);
            setEditNewFiles([]);
        } catch {
            // Error toast is already handled globally by axios interceptor.
        }
    };

    const handleSubmitComment = async () => {
        const content = commentInput.trim();
        if (!content) {
            return;
        }

        await createCommentMutation.mutateAsync({ content });
        setCommentInput("");

        if (!isCommentsOpen) {
            setIsCommentsOpen(true);
        }
        setCommentsPage(1);
    };

    const handleDeletePost = async () => {
        try {
            await deletePostMutation.mutateAsync();
            toast.success("Đã xóa bài viết");
        } catch {
            // Error toast is already handled globally by axios interceptor.
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await deleteCommentMutation.mutateAsync(commentId);
            toast.success("Đã xóa bình luận");
        } catch {
            // Error toast is already handled globally by axios interceptor.
        }
    };

    const startEditingComment = (commentId: string, content: string) => {
        setEditingCommentId(commentId);
        setEditingCommentContent(content);
    };

    const cancelEditingComment = () => {
        setEditingCommentId(null);
        setEditingCommentContent("");
    };

    const handleUpdateComment = async (commentId: string) => {
        const content = editingCommentContent.trim();
        if (!content) {
            toast.error("Nội dung bình luận không được để trống");
            return;
        }

        try {
            await updateCommentMutation.mutateAsync({
                commentId,
                payload: { content },
            });
            toast.success("Đã cập nhật bình luận");
            cancelEditingComment();
        } catch {
            // Error toast is already handled globally by axios interceptor.
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium text-foreground">
                                <Sprout className="h-3 w-3 text-primary" />
                                {post.author.fullName}
                            </span>
                            <Badge className="h-5 border border-border bg-white text-[10px] text-foreground hover:bg-white">
                                {roleLabel}
                            </Badge>
                            <span>
                                {new Date(post.createdAt).toLocaleString("vi-VN")}
                            </span>
                        </div>
                        <CardTitle className="text-lg font-semibold leading-snug">{post.title}</CardTitle>
                    </div>

                    {isOwner && !isEditing && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={startEditing}
                                disabled={isDeletingPost}
                                className="h-8 px-3"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Chỉnh sửa
                            </Button>
                            <Popconfirm
                                title="Xóa bài viết"
                                description="Bạn có chắc muốn xóa bài viết này?"
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true, loading: isDeletingPost }}
                                onConfirm={() => void handleDeletePost()}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isDeletingPost}
                                    className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    {isDeletingPost ? (
                                        <span className="flex items-center gap-1">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            Đang xóa
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Xóa
                                        </span>
                                    )}
                                </Button>
                            </Popconfirm>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {isEditing ? (
                    <div className="space-y-3">
                        <div className="grid gap-4">
                            <Input
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                placeholder="Tiêu đề bài viết"
                                className="h-11 px-4 my-0!"
                            />
                            <textarea
                                value={editContent}
                                onChange={(event) => setEditContent(event.target.value)}
                                rows={4}
                                placeholder="Nội dung bài viết"
                                className="flex min-h-24 w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-[hsl(150,7%,45%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Nhãn bài viết</p>
                            <div className="flex flex-wrap gap-2">
                                {FORUM_LABELS.map((labelItem) => {
                                    const isActive = editLabels.includes(labelItem);

                                    return (
                                        <Button
                                            key={`${post.id}-edit-${labelItem}`}
                                            type="button"
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => toggleEditLabel(labelItem)}
                                        >
                                            {LABEL_LABELS[labelItem]}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Ảnh bài viết</p>

                            {editExistingImages.length > 0 && (
                                <AntdImage.PreviewGroup>
                                    <div className="grid grid-cols-3 gap-2">
                                        {editExistingImages.map((image, index) => (
                                            <div key={`${image.objectKey}-${index}`} className="relative overflow-hidden rounded-md border">
                                                <AntdImage
                                                    src={image.url}
                                                    alt={`existing-${index + 1}`}
                                                    className="forum-ant-image"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1 text-white"
                                                    onClick={() => handleRemoveEditExistingImage(index)}
                                                    aria-label="Xóa ảnh hiện có"
                                                    disabled={isUpdatingPost}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </AntdImage.PreviewGroup>
                            )}

                            {editPreviewUrls.length > 0 && (
                                <AntdImage.PreviewGroup>
                                    <div className="grid grid-cols-3 gap-2">
                                        {editPreviewUrls.map((previewUrl, index) => (
                                            <div key={previewUrl} className="relative overflow-hidden rounded-md border">
                                                <AntdImage
                                                    src={previewUrl}
                                                    alt={`new-${index + 1}`}
                                                    className="forum-ant-image"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1 text-white"
                                                    onClick={() => handleRemoveEditNewFile(index)}
                                                    aria-label="Xóa ảnh mới"
                                                    disabled={isUpdatingPost}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </AntdImage.PreviewGroup>
                            )}

                            {editExistingImages.length + editNewFiles.length < 3 && (
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <ImagePlus className="h-4 w-4" />
                                    Thêm ảnh
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleSelectEditFiles}
                                        disabled={isUpdatingPost}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isUpdatingPost}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                onClick={() => void handleUpdatePost()}
                                disabled={isUpdatingPost || !editTitle.trim() || !editContent.trim()}
                            >
                                {isUpdatingPost ? (
                                    <span className="flex items-center gap-1">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Đang lưu
                                    </span>
                                ) : (
                                    "Lưu cập nhật"
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="whitespace-pre-line text-sm text-muted-foreground">{post.content}</p>

                        <div className="flex flex-wrap gap-1.5">
                            {post.labels.map((tag) => (
                                <Badge
                                    key={tag}
                                    className="bg-secondary text-xs text-secondary-foreground hover:bg-secondary"
                                >
                                    {LABEL_LABELS[tag]}
                                </Badge>
                            ))}
                        </div>

                        {visibleImageSources.length > 0 && (
                            <div className="space-y-2">
                                <AntdImage.PreviewGroup>
                                    <div className="grid grid-cols-3 gap-2">
                                        {visibleImageSources.map((imageSrc, index) => (
                                            <AntdImage
                                                key={`${post.id}-${imageSrc}`}
                                                src={imageSrc}
                                                alt={`${post.title} - ${index + 1}`}
                                                className="forum-ant-image"
                                            />
                                        ))}
                                    </div>
                                </AntdImage.PreviewGroup>
                                {validImageSources.length > 3 && (
                                    <p className="text-xs text-muted-foreground">
                                        +{validImageSources.length - 3} ảnh khác
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button
                        type="button"
                        onClick={toggleComments}
                        className="flex items-center gap-1 transition-colors hover:text-primary"
                    >
                        <MessageCircle className="h-4 w-4" />
                        {post.commentCount} bình luận
                    </button>
                    <span className="text-xs text-muted-foreground">{post.status}</span>
                    {isFetching && isCommentsOpen && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Đang tải bình luận
                        </span>
                    )}
                </div>

                {isCommentsOpen && (
                    <div className="space-y-3 border-t pt-3">
                        <div className="grid gap-3">
                            <Input
                                value={commentInput}
                                onChange={(event) => setCommentInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !createCommentMutation.isPending) {
                                        void handleSubmitComment();
                                    }
                                }}
                                placeholder="Viết bình luận..."
                                className="h-11 px-4 my-0!"
                            />
                            <div className="flex items-center justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => void handleSubmitComment()}
                                    disabled={createCommentMutation.isPending || commentInput.trim().length === 0}
                                    className="h-10 px-4"
                                >
                                    {createCommentMutation.isPending ? (
                                        <span className="flex items-center gap-1">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Đang gửi
                                        </span>
                                    ) : (
                                        "Gửi bình luận"
                                    )}
                                </Button>
                            </div>
                        </div>

                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
                        ) : isError ? (
                            <div className="space-y-2">
                                <p className="text-sm text-destructive">Không tải được bình luận.</p>
                                <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                                    Thử lại
                                </Button>
                            </div>
                        ) : comments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Bài viết chưa có bình luận nào.</p>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {comments.map((comment) => {
                                        const commentRoleLabel =
                                            ROLE_LABEL[comment.author.role] ?? comment.author.role;
                                        const canDeleteComment = currentUserId === comment.authorUserId;
                                        const isEditingThisComment = editingCommentId === comment.id;

                                        return (
                                            <div key={comment.id} className="rounded-lg border bg-muted/25 p-3">
                                                <div className="space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground">
                                                            {comment.author.fullName}
                                                        </span>
                                                        <Badge className="h-5 border border-border bg-white text-[10px] text-foreground hover:bg-white">
                                                            {commentRoleLabel}
                                                        </Badge>
                                                        <span>
                                                            {new Date(comment.createdAt).toLocaleString("vi-VN")}
                                                        </span>
                                                        {canDeleteComment && (
                                                            <div className="ml-auto flex items-center gap-1">
                                                                {!isEditingThisComment && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 px-3"
                                                                        onClick={() =>
                                                                            startEditingComment(comment.id, comment.content)
                                                                        }
                                                                        disabled={updateCommentMutation.isPending}
                                                                    >
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                        Sửa
                                                                    </Button>
                                                                )}
                                                                <Popconfirm
                                                                    title="Xóa bình luận"
                                                                    description="Bạn có chắc muốn xóa bình luận này?"
                                                                    okText="Xóa"
                                                                    cancelText="Hủy"
                                                                    okButtonProps={{
                                                                        danger: true,
                                                                        loading: deleteCommentMutation.isPending,
                                                                    }}
                                                                    onConfirm={() => void handleDeleteComment(comment.id)}
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                        disabled={deleteCommentMutation.isPending}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        Xóa
                                                                    </Button>
                                                                </Popconfirm>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isEditingThisComment ? (
                                                        <div className="flex flex-col gap-3">
                                                            <Input
                                                                value={editingCommentContent}
                                                                onChange={(event) =>
                                                                    setEditingCommentContent(event.target.value)
                                                                }
                                                                onKeyDown={(event) => {
                                                                    if (event.key === "Enter" && !updateCommentMutation.isPending) {
                                                                        void handleUpdateComment(comment.id);
                                                                    }
                                                                }}
                                                                className="h-10 px-3"
                                                            />
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={cancelEditingComment}
                                                                    disabled={updateCommentMutation.isPending}
                                                                >
                                                                    Hủy
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={() => void handleUpdateComment(comment.id)}
                                                                    disabled={updateCommentMutation.isPending}
                                                                >
                                                                    {updateCommentMutation.isPending ? (
                                                                        <span className="flex items-center gap-1">
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                            Đang lưu
                                                                        </span>
                                                                    ) : (
                                                                        "Lưu"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm whitespace-pre-line">{comment.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {pagination && (
                                    <Pagination
                                        meta={pagination}
                                        onPageChange={(nextPage) => setCommentsPage(nextPage)}
                                        className="pt-1"
                                    />
                                )}
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function FarmerForumPage() {
    const currentUserId = useAuthStore((state) => state.user?.id);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [searchInput, setSearchInput] = useState("");
    const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
    const [label, setLabel] = useState<ForumLabel | undefined>(undefined);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createTitle, setCreateTitle] = useState("");
    const [createContent, setCreateContent] = useState("");
    const [createLabels, setCreateLabels] = useState<ForumLabel[]>([]);
    const [createFiles, setCreateFiles] = useState<File[]>([]);

    const createPostMutation = useCreateForumPostMutation();
    const uploadImagesMutation = useUploadForumImagesMutation();

    const isCreatingPost = createPostMutation.isPending || uploadImagesMutation.isPending;

    const query = useMemo(
        () => ({
            page,
            limit,
            searchTerm,
            label,
        }),
        [page, limit, searchTerm, label],
    );

    const { posts, pagination, isLoading, isFetching, isError, refetch } = useForumPostsQuery(query);

    const previewUrls = useMemo(
        () => createFiles.map((file) => URL.createObjectURL(file)),
        [createFiles],
    );

    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleSearch = () => {
        setPage(1);
        const nextTerm = searchInput.trim();
        setSearchTerm(nextTerm.length > 0 ? nextTerm : undefined);
    };

    const toggleCreateLabel = (nextLabel: ForumLabel) => {
        setCreateLabels((prev) =>
            prev.includes(nextLabel)
                ? prev.filter((labelItem) => labelItem !== nextLabel)
                : [...prev, nextLabel],
        );
    };

    const handleSelectCreateFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (!fileList) {
            return;
        }

        const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
        const merged = [...createFiles, ...files].slice(0, 3);
        setCreateFiles(merged);
        event.target.value = "";
    };

    const handleRemoveCreateFile = (index: number) => {
        setCreateFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    };

    const resetCreateForm = () => {
        setCreateTitle("");
        setCreateContent("");
        setCreateLabels([]);
        setCreateFiles([]);
    };

    const handleCreatePost = async () => {
        if (!createTitle.trim() || !createContent.trim()) {
            toast.error("Vui lòng nhập tiêu đề và nội dung bài viết");
            return;
        }

        try {
            let imagesPayload: Array<{ objectKey: string; url: string }> = [];

            if (createFiles.length > 0) {
                const uploadResult = await uploadImagesMutation.mutateAsync(createFiles);
                imagesPayload = uploadResult.items
                    .map((item) => item.forumImage)
                    .filter((forumImage): forumImage is { objectKey: string; url: string } =>
                        Boolean(forumImage?.objectKey && forumImage?.url),
                    );
            }

            await createPostMutation.mutateAsync({
                title: createTitle.trim(),
                content: createContent.trim(),
                labels: createLabels,
                images: imagesPayload,
            });

            toast.success("Đã tạo bài viết mới");
            resetCreateForm();
            setIsCreateOpen(false);
            setPage(1);
        } catch {
            // Error toast is already handled globally by axios interceptor.
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl space-y-5 px-5 py-6 pb-20 sm:px-6 md:pb-8 lg:px-6">
            <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="text-xl font-bold">Diễn đàn kỹ thuật</h1>
                    <Button
                        type="button"
                        onClick={() => setIsCreateOpen((prev) => !prev)}
                        className="gap-1"
                    >
                        {isCreateOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {isCreateOpen ? "Đóng" : "Tạo bài mới"}
                    </Button>
                    {isFetching && !isLoading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang cập nhật...
                        </div>
                    )}
                </div>

                {isCreateOpen && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tạo bài viết mới</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4">
                                <Input
                                    value={createTitle}
                                    onChange={(event) => setCreateTitle(event.target.value)}
                                    placeholder="Tiêu đề bài viết"
                                    className="h-11 px-4 my-0!"
                                />

                                <textarea
                                    value={createContent}
                                    onChange={(event) => setCreateContent(event.target.value)}
                                    rows={5}
                                    placeholder="Nội dung bài viết"
                                    className="flex min-h-30 w-full rounded-md border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-[hsl(150,7%,45%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Nhãn bài viết</p>
                                <div className="flex flex-wrap gap-2">
                                    {FORUM_LABELS.map((labelItem) => {
                                        const isActive = createLabels.includes(labelItem);

                                        return (
                                            <Button
                                                key={labelItem}
                                                type="button"
                                                variant={isActive ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleCreateLabel(labelItem)}
                                            >
                                                {LABEL_LABELS[labelItem]}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Hình ảnh (tối đa 3 ảnh)</p>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <ImagePlus className="h-4 w-4" />
                                    Chọn ảnh
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleSelectCreateFiles}
                                        disabled={isCreatingPost || createFiles.length >= 3}
                                    />
                                </label>

                                {previewUrls.length > 0 && (
                                    <AntdImage.PreviewGroup>
                                        <div className="grid grid-cols-3 gap-2">
                                            {previewUrls.map((previewUrl, index) => (
                                                <div key={previewUrl} className="relative overflow-hidden rounded-md border">
                                                    <AntdImage
                                                        src={previewUrl}
                                                        alt={`preview-${index + 1}`}
                                                        className="forum-ant-image"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute right-1 top-1 z-10 rounded-full bg-black/60 p-1 text-white"
                                                        onClick={() => handleRemoveCreateFile(index)}
                                                        aria-label="Xóa ảnh"
                                                        disabled={isCreatingPost}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </AntdImage.PreviewGroup>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        resetCreateForm();
                                        setIsCreateOpen(false);
                                    }}
                                    disabled={isCreatingPost}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => void handleCreatePost()}
                                    disabled={isCreatingPost || !createTitle.trim() || !createContent.trim()}
                                >
                                    {isCreatingPost ? (
                                        <span className="flex items-center gap-1">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Đang tạo bài
                                        </span>
                                    ) : (
                                        "Đăng bài"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardContent className="space-y-3 p-4">
                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            handleSearch();
                                        }
                                    }}
                                    placeholder="Tìm theo tiêu đề hoặc nội dung"
                                    className="pl-9"
                                />
                            </div>
                            <Button type="button" onClick={handleSearch}>Tìm</Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <Select
                                value={label ?? ""}
                                onChange={(event) => {
                                    setPage(1);
                                    const value = event.target.value;
                                    setLabel(value ? (value as ForumLabel) : undefined);
                                }}
                            >
                                <option value="">Tất cả nhãn</option>
                                {FORUM_LABELS.map((item) => (
                                    <option key={item} value={item}>
                                        {LABEL_LABELS[item]}
                                    </option>
                                ))}
                            </Select>

                            <Select
                                value={String(limit)}
                                onChange={(event) => {
                                    setPage(1);
                                    setLimit(Number(event.target.value));
                                }}
                            >
                                <option value="10">10 bài/trang</option>
                                <option value="20">20 bài/trang</option>
                                <option value="50">50 bài/trang</option>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-10 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải bài viết...
                    </CardContent>
                </Card>
            ) : isError ? (
                <Card>
                    <CardContent className="space-y-3 py-8 text-center">
                        <p className="text-sm text-destructive">Không tải được danh sách bài viết.</p>
                        <Button type="button" variant="outline" onClick={() => refetch()}>
                            Thử lại
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {posts.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                Chưa có bài viết nào phù hợp bộ lọc hiện tại.
                            </CardContent>
                        </Card>
                    )}

                    {posts.map((post) => {
                        return <FarmerForumPostCard key={post.id} post={post} currentUserId={currentUserId} />;
                    })}

                    {pagination && (
                        <Pagination
                            meta={pagination}
                            onPageChange={(nextPage) => setPage(nextPage)}
                            className="pt-2"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
