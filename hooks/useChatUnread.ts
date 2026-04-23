"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { connectChatSocketWithToken } from "@/lib/chatSocket";
import { chatService } from "@/services/chat/chatService";

export const CHAT_CONVERSATIONS_QUERY_KEY = ["chat-conversations"] as const;

/** Danh sách hội thoại — dùng chung với trang tin nhắn (cùng query key). */
export function useChatConversationsQuery(enabled = true) {
  return useQuery({
    queryKey: CHAT_CONVERSATIONS_QUERY_KEY,
    queryFn: () => chatService.listConversations(),
    enabled,
    refetchInterval: 15_000,
  });
}

/**
 * Số cuộc có tin chưa đọc + tổng tin chưa đọc; lắng nghe socket để cập nhật badge navbar.
 */
export function useChatUnreadBadge(enabled = true) {
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useChatConversationsQuery(enabled);

  useEffect(() => {
    if (!enabled) return;
    const socket = connectChatSocketWithToken();
    const bump = () => {
      void queryClient.invalidateQueries({ queryKey: CHAT_CONVERSATIONS_QUERY_KEY });
    };
    socket.on("chat:message", bump);
    return () => {
      socket.off("chat:message", bump);
    };
  }, [enabled, queryClient]);

  const chatConversationsWithUnread = conversations.filter(
    (c) => (c.unreadCount ?? 0) > 0,
  ).length;
  const totalUnreadMessages = conversations.reduce(
    (s, c) => s + (c.unreadCount ?? 0),
    0,
  );

  return {
    chatConversationsWithUnread,
    totalUnreadMessages,
    conversations,
  };
}
