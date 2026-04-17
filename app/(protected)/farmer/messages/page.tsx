"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, MessageSquare, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { chatService } from "@/services/chat/chatService";
import type { ChatConversation, ChatMessage } from "@/services/chat";
import { useAuthStore } from "@/store/useAuthStore";
import { connectChatSocketWithToken } from "@/lib/chatSocket";

const getPeer = (conv: ChatConversation, meId: string | null | undefined) => {
  if (!meId) return conv.participant1;
  return conv.participant1.id === meId ? conv.participant2 : conv.participant1;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  return sameDay
    ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function FarmerMessagesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? null;

  const selectedId = searchParams.get("chat");
  const [composerValue, setComposerValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: () => chatService.listConversations(),
    refetchInterval: 15_000,
  });

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", selectedId],
    queryFn: () => chatService.listMessages(selectedId as string, { limit: 100 }),
    enabled: !!selectedId,
    refetchInterval: selectedId ? 6_000 : false,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage(selectedId as string, content),
    onSuccess: (msg) => {
      setComposerValue("");
      queryClient.setQueryData<
        Awaited<ReturnType<typeof chatService.listMessages>>
      >(["chat-messages", selectedId], (old) => {
        if (!old) return old;
        if (old.items.some((m) => m.id === msg.id)) return old;
        return {
          ...old,
          items: [...old.items, msg],
          meta: { ...old.meta, total: old.meta.total + 1 },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });

  const conversations = conversationsQuery.data ?? [];
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  );
  const messages: ChatMessage[] = messagesQuery.data?.items ?? [];

  useEffect(() => {
    if (!selectedId) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, messages.length]);

  useEffect(() => {
    if (!selectedId) return;
    const socket = connectChatSocketWithToken();
    const onMessage = (msg: ChatMessage) => {
      if (msg.conversationId !== selectedId) return;
      queryClient.setQueryData<
        Awaited<ReturnType<typeof chatService.listMessages>>
      >(["chat-messages", selectedId], (old) => {
        if (!old) {
          return {
            items: [msg],
            meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
          };
        }
        if (old.items.some((m) => m.id === msg.id)) return old;
        const total = old.meta.total + 1;
        return {
          ...old,
          items: [...old.items, msg],
          meta: {
            ...old.meta,
            total,
            totalPages: Math.max(1, Math.ceil(total / old.meta.limit)),
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    };

    socket.emit("chat:join", { conversationId: selectedId });
    socket.on("chat:message", onMessage);
    return () => {
      socket.emit("chat:leave", { conversationId: selectedId });
      socket.off("chat:message", onMessage);
    };
  }, [selectedId, queryClient]);

  const handleSelect = (id: string) => {
    router.replace(`/farmer/messages?chat=${id}`);
  };

  const handleBack = () => {
    router.replace("/farmer/messages");
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = composerValue.trim();
    if (!trimmed || !selectedId || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  return (
    <div className="container py-4 pb-20 md:pb-8 max-w-5xl">
      <h1 className="text-xl font-bold mb-3">Tin nhắn</h1>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] h-[calc(100vh-220px)] min-h-[500px]">
          <aside
            className={`border-r bg-card ${
              selectedId ? "hidden md:block" : "block"
            }`}
          >
            <div className="p-3 border-b">
              <p className="text-sm font-semibold">
                Cuộc trò chuyện ({conversations.length})
              </p>
            </div>
            <div className="overflow-y-auto h-[calc(100%-49px)]">
              {conversationsQuery.isLoading ? (
                <div className="py-10 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground px-4">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chưa có cuộc trò chuyện nào.</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const peer = getPeer(conv, userId);
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelect(conv.id)}
                      className={`w-full text-left flex items-start gap-3 px-3 py-3 border-b hover:bg-accent transition-colors ${
                        conv.id === selectedId ? "bg-accent" : ""
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className="font-medium text-sm truncate">
                            {peer.fullName ?? "Người dùng"}
                          </p>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatTime(conv.updatedAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate capitalize">
                          {peer.role}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <section
            className={`flex flex-col ${selectedId ? "flex" : "hidden md:flex"}`}
          >
            {selectedConversation ? (
              <>
                <header className="border-b p-3 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {getPeer(selectedConversation, userId).fullName ?? "Người dùng"}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {getPeer(selectedConversation, userId).role}
                    </p>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
                  {messagesQuery.isLoading ? (
                    <div className="py-10 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Chưa có tin nhắn. Gửi lời chào đầu tiên đi!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const mine = msg.senderUserId === userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                              mine
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <p
                              className={`text-[10px] mt-0.5 ${
                                mine
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="border-t p-2 flex items-center gap-2"
                >
                  <Input
                    value={composerValue}
                    onChange={(e) => setComposerValue(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={sendMutation.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!composerValue.trim() || sendMutation.isPending}
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Chọn một cuộc trò chuyện để bắt đầu
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </Card>
    </div>
  );
}
