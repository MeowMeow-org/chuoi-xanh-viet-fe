"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
    AlertCircle,
    Award,
    MessageCircle,
    Plus,
    Send,
    Shield,
    Sprout,
    ThumbsUp,
} from "lucide-react";

import FarmerLayout from "@/components/layout/FarmerLayout";
import { forumPosts, type ForumPost } from "@/data/forumData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const roleLabel: Record<string, { label: string; icon: LucideIcon }> = {
    farmer: { label: "Nông dân", icon: Sprout },
    expert: { label: "Chuyên gia", icon: Award },
    extension_officer: { label: "Cán bộ khuyến nông", icon: Shield },
};

export default function FarmerForumPage() {
    const [posts, setPosts] = useState<ForumPost[]>(forumPosts);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newTags, setNewTags] = useState("");
    const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
    const [dialogOpen, setDialogOpen] = useState(false);

    const handlePost = () => {
        if (!newTitle.trim() || !newContent.trim()) {
            return;
        }

        const post: ForumPost = {
            id: `post-${Date.now()}`,
            authorId: "farmer-001",
            authorName: "Nguyễn Văn Minh",
            authorRole: "farmer",
            authorBadge: "Nông dân tích cực",
            title: newTitle.trim(),
            content: newContent.trim(),
            tags: newTags.split(",").map((tag) => tag.trim()).filter(Boolean),
            createdAt: new Date().toISOString(),
            likes: 0,
            comments: [],
            isEscalated: false,
        };

        setPosts([post, ...posts]);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        setDialogOpen(false);
    };

    const handleComment = (postId: string) => {
        const text = commentInputs[postId];
        if (!text?.trim()) {
            return;
        }

        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) {
                    return post;
                }

                return {
                    ...post,
                    comments: [
                        ...post.comments,
                        {
                            id: `cmt-${Date.now()}`,
                            authorId: "farmer-001",
                            authorName: "Nguyễn Văn Minh",
                            authorRole: "farmer",
                            content: text.trim(),
                            createdAt: new Date().toISOString(),
                            likes: 0,
                        },
                    ],
                };
            })
        );

        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    };

    const handleLike = (postId: string) => {
        setPosts((prev) =>
            prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post))
        );
    };

    return (
        <FarmerLayout>
            <div className="mx-auto w-full max-w-5xl space-y-5 px-5 py-6 pb-20 sm:px-6 md:pb-8 lg:px-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">Diễn đàn kỹ thuật</h1>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger
                            render={
                                <Button className="gap-1.5">
                                    <Plus className="h-4 w-4" />
                                    Đăng bài
                                </Button>
                            }
                        />
                        <DialogContent className="sm:max-w-140 rounded-2xl bg-white p-5">
                            <DialogHeader className="pr-8">
                                <DialogTitle className="text-2xl font-bold text-[hsl(150,10%,15%)]">Đăng bài mới</DialogTitle>
                            </DialogHeader>

                            <div className="mt-1 space-y-4">
                                <input
                                    placeholder="Tiêu đề bài viết"
                                    value={newTitle}
                                    onChange={(event) => setNewTitle(event.target.value)}
                                    className="flex h-11 w-full rounded-xl border border-[hsl(142,15%,82%)] bg-white px-3 py-2 text-base text-[hsl(150,10%,15%)] placeholder:text-[hsl(150,6%,55%)] ring-offset-background focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)] focus:ring-offset-1"
                                />
                                <Textarea
                                    placeholder="Nội dung chi tiết..."
                                    rows={5}
                                    value={newContent}
                                    onChange={(event) => setNewContent(event.target.value)}
                                    className="min-h-40 rounded-xl border-[hsl(142,15%,82%)] bg-white px-3 py-2 text-base text-[hsl(150,10%,15%)] placeholder:text-[hsl(150,6%,55%)] focus-visible:ring-[hsl(142,71%,45%)]"
                                />
                                <input
                                    placeholder="Thẻ (phân cách bằng dấu phẩy)"
                                    value={newTags}
                                    onChange={(event) => setNewTags(event.target.value)}
                                    className="flex h-11 w-full rounded-xl border border-[hsl(142,15%,82%)] bg-white px-3 py-2 text-base text-[hsl(150,10%,15%)] placeholder:text-[hsl(150,6%,55%)] ring-offset-background focus:outline-none focus:ring-2 focus:ring-[hsl(142,71%,45%)] focus:ring-offset-1"
                                />
                                <Button
                                    className="h-11 w-full text-base font-semibold"
                                    onClick={handlePost}
                                    disabled={!newTitle.trim() || !newContent.trim()}
                                >
                                    Đăng bài
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    {posts.map((post) => {
                        const role = roleLabel[post.authorRole];
                        const RoleIcon = role.icon;

                        return (
                            <Card key={post.id} className={post.isEscalated ? "border-warning/50" : ""}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 space-y-1">
                                            <CardTitle className="text-base leading-snug">{post.title}</CardTitle>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 font-medium text-foreground">
                                                    <RoleIcon className="h-3 w-3 text-primary" />
                                                    {post.authorName}
                                                </span>
                                                <Badge className="h-5 border border-border bg-white text-[10px] text-foreground hover:bg-white">
                                                    {role.label}
                                                </Badge>
                                                {post.authorBadge && (
                                                    <Badge className="h-5 bg-secondary text-[10px] text-secondary-foreground hover:bg-secondary">
                                                        {post.authorBadge}
                                                    </Badge>
                                                )}
                                                <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                                            </div>
                                        </div>

                                        {post.isEscalated && (
                                            <Badge className="shrink-0 gap-1 border border-warning bg-white text-warning hover:bg-white">
                                                <AlertCircle className="h-3 w-3" />
                                                Cần chuyên gia
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    <p className="whitespace-pre-line text-sm">{post.content}</p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {post.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                className="bg-secondary text-xs text-secondary-foreground hover:bg-secondary"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <button
                                            type="button"
                                            onClick={() => handleLike(post.id)}
                                            className="flex items-center gap-1 transition-colors hover:text-primary"
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            {post.likes}
                                        </button>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="h-4 w-4" />
                                            {post.comments.length}
                                        </span>
                                    </div>

                                    {post.comments.length > 0 && (
                                        <div className="space-y-3 border-t pt-3">
                                            {post.comments.map((comment) => {
                                                const commentRole = roleLabel[comment.authorRole];
                                                const CommentRoleIcon = commentRole.icon;

                                                return (
                                                    <div
                                                        key={comment.id}
                                                        className="space-y-1 border-l-2 border-primary/20 pl-3"
                                                    >
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <span className="flex items-center gap-1 font-medium">
                                                                <CommentRoleIcon className="h-3 w-3 text-primary" />
                                                                {comment.authorName}
                                                            </span>
                                                            <Badge className="h-4 border border-border bg-white text-[10px] text-foreground hover:bg-white">
                                                                {commentRole.label}
                                                            </Badge>
                                                            <span className="text-muted-foreground">
                                                                {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{comment.content}</p>
                                                        <button
                                                            type="button"
                                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                                                        >
                                                            <ThumbsUp className="h-3 w-3" />
                                                            {comment.likes}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            placeholder="Viết bình luận..."
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            value={commentInputs[post.id] || ""}
                                            onChange={(event) =>
                                                setCommentInputs((prev) => ({
                                                    ...prev,
                                                    [post.id]: event.target.value,
                                                }))
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    handleComment(post.id);
                                                }
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-9 px-3"
                                            onClick={() => handleComment(post.id)}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </FarmerLayout>
    );
}
