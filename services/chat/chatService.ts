import { axiosInstance } from "@/lib/axios";
import type {
  ChatConversation,
  ChatMessage,
  ChatMessagesResponse,
} from "./index";

export const chatService = {
  listConversations: async (): Promise<ChatConversation[]> => {
    const data = await axiosInstance.get<
      { items: ChatConversation[] },
      { items: ChatConversation[] }
    >("/chat/conversations");
    return data.items;
  },

  openConversation: async (peerUserId: string): Promise<ChatConversation> => {
    const data = await axiosInstance.post<ChatConversation, ChatConversation>(
      "/chat/conversations",
      { peerUserId },
    );
    return data;
  },

  listMessages: async (
    conversationId: string,
    query?: { page?: number; limit?: number },
  ): Promise<ChatMessagesResponse> => {
    const data = await axiosInstance.get<
      ChatMessagesResponse,
      ChatMessagesResponse
    >(`/chat/conversations/${conversationId}/messages`, { params: query });
    return data;
  },

  sendMessage: async (
    conversationId: string,
    content: string,
  ): Promise<ChatMessage> => {
    const data = await axiosInstance.post<ChatMessage, ChatMessage>(
      `/chat/conversations/${conversationId}/messages`,
      { content },
    );
    return data;
  },
};
