"use client";

import { useState } from 'react';
import ConsumerLayout from '@/components/layout/ConsumerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageSquare, Send, Edit2, Trash2, X } from 'lucide-react';
import { consumerForumPosts, CONSUMER_FORUM_TAGS, currentConsumer, type ForumPostConsumer, type ForumCommentConsumer } from '@/data/consumerMockData';
import { toast } from 'sonner';

const roleBadge: Record<string, { label: string; className: string }> = {
  consumer: { label: 'Người mua', className: 'bg-blue-100 text-blue-800' },
  farmer: { label: 'Nông dân', className: 'bg-green-100 text-green-800' },
  expert: { label: 'Chuyên gia', className: 'bg-purple-100 text-purple-800' },
  extension_officer: { label: 'Khuyến nông', className: 'bg-orange-100 text-orange-800' },
};

export default function ConsumerForumPage() {
  const [posts, setPosts] = useState<ForumPostConsumer[]>(consumerForumPosts);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev);
  };

  const createPost = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    const newPost: ForumPostConsumer = {
      id: `cfpost-${Date.now()}`,
      authorId: currentConsumer.id,
      authorName: currentConsumer.name,
      authorRole: 'consumer',
      title, content, tags: selectedTags,
      createdAt: new Date().toISOString(),
      likes: 0, commentCount: 0, isLiked: false, comments: [],
    };
    setPosts([newPost, ...posts]);
    setTitle(''); setContent(''); setSelectedTags([]); setShowCreate(false);
    toast('Đã đăng bài!');
  };

  const addComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    const newComment: ForumCommentConsumer = {
      id: `ccmt-${Date.now()}`,
      authorId: currentConsumer.id,
      authorName: currentConsumer.name,
      authorRole: 'consumer',
      content: text,
      createdAt: new Date().toISOString(),
      likes: 0, isLiked: false,
    };
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 } : p));
    setCommentText({ ...commentText, [postId]: '' });
  };

  const deletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
    toast('Đã xóa bài viết');
  };

  const deleteComment = (postId: string, commentId: string) => {
    setPosts(posts.map(p => p.id === postId ? {
      ...p, comments: p.comments.filter(c => c.id !== commentId), commentCount: p.commentCount - 1,
    } : p));
  };

  const saveEditPost = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, content: editText, updatedAt: new Date().toISOString() } : p));
    setEditingPost(null);
  };

  const saveEditComment = (postId: string, commentId: string) => {
    setPosts(posts.map(p => p.id === postId ? {
      ...p, comments: p.comments.map(c => c.id === commentId ? { ...c, content: editText, updatedAt: new Date().toISOString() } : c),
    } : p));
    setEditingComment(null);
  };

  const toggleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const filteredPosts = filterTag ? posts.filter(p => p.tags.includes(filterTag)) : posts;

  return (
    <ConsumerLayout>
      <div className="container py-4 pb-20 md:pb-8 space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Diễn đàn</h1>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Hủy' : 'Tạo bài viết'}
          </Button>
        </div>

        {/* Tag filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Button size="sm" variant={!filterTag ? 'secondary' : 'ghost'} className="shrink-0 text-xs" onClick={() => setFilterTag(null)}>
            Tất cả
          </Button>
          {CONSUMER_FORUM_TAGS.slice(0, 8).map(tag => (
            <Button key={tag} size="sm" variant={filterTag === tag ? 'secondary' : 'ghost'} className="shrink-0 text-xs" onClick={() => setFilterTag(tag)}>
              {tag}
            </Button>
          ))}
        </div>

        {/* Create post */}
        {showCreate && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <Input placeholder="Tiêu đề bài viết" value={title} onChange={e => setTitle(e.target.value)} />
              <Textarea placeholder="Nội dung..." rows={4} value={content} onChange={e => setContent(e.target.value)} />
              <div>
                <p className="text-xs text-muted-foreground mb-2">Chọn nhãn (tối đa 3):</p>
                <div className="flex flex-wrap gap-1.5">
                  {CONSUMER_FORUM_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={createPost}>Đăng bài</Button>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const role = roleBadge[post.authorRole];
            const isOwner = post.authorId === currentConsumer.id;

            return (
              <Card key={post.id}>
                <CardContent className="p-4 space-y-3">
                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{post.authorName}</span>
                      <Badge className={`${role.className} text-[10px] px-1.5 py-0`}>{role.label}</Badge>
                      {post.authorBadge && <span className="text-xs text-muted-foreground">{post.authorBadge}</span>}
                    </div>
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingPost(post.id); setEditText(post.content); }}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePost(post.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-base">{post.title}</h3>
                  {editingPost === post.id ? (
                    <div className="space-y-2">
                      <Textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEditPost(post.id)}>Lưu</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>Hủy</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{post.content}</p>
                  )}
                  {post.updatedAt && <span className="text-[10px] text-muted-foreground">(đã chỉnh sửa)</span>}

                  {/* Tags */}
                  <div className="flex gap-1.5 flex-wrap">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] cursor-pointer" onClick={() => setFilterTag(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-1">
                    <button className="flex items-center gap-1 text-sm" onClick={() => toggleLike(post.id)}>
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
                      <span className={post.isLiked ? 'text-destructive' : 'text-muted-foreground'}>{post.likes}</span>
                    </button>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" /> {post.commentCount}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="border-t pt-3 space-y-3">
                      {post.comments.map(c => {
                        const cRole = roleBadge[c.authorRole];
                        const cIsOwner = c.authorId === currentConsumer.id;
                        return (
                          <div key={c.id} className="pl-3 border-l-2 border-primary/20 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{c.authorName}</span>
                              <Badge className={`${cRole.className} text-[10px] px-1.5 py-0`}>{cRole.label}</Badge>
                              {cIsOwner && (
                                <div className="flex gap-1 ml-auto">
                                  <button className="text-muted-foreground hover:text-foreground" onClick={() => { setEditingComment(c.id); setEditText(c.content); }}>
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button className="text-muted-foreground hover:text-destructive" onClick={() => deleteComment(post.id, c.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingComment === c.id ? (
                              <div className="space-y-2">
                                <Textarea value={editText} onChange={e => setEditText(e.target.value)} rows={2} />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => saveEditComment(post.id, c.id)}>Lưu</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>Hủy</Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">{c.content}</p>
                            )}
                            {c.updatedAt && <span className="text-[10px] text-muted-foreground">(đã chỉnh sửa)</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add comment */}
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="Bình luận..."
                      className="text-sm h-9"
                      value={commentText[post.id] || ''}
                      onChange={e => setCommentText({ ...commentText, [post.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                    />
                    <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => addComment(post.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </ConsumerLayout>
  );
}
