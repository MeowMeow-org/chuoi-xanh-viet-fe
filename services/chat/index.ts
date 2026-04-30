export interface ChatParticipant {
  id: string;
  fullName: string;
  phone: string;
  role: string;
}

export interface ChatConversation {
  id: string;
  participant1UserId: string;
  participant2UserId: string;
  participant1: ChatParticipant;
  participant2: ChatParticipant;
  createdAt: string;
  updatedAt: string;
  /** Tin từ đối phương chưa đọc (theo mốc đã đọc trên server) */
  unreadCount?: number;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  lastMessageSenderUserId?: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
}

export interface ChatMessagesResponse {
  items: ChatMessage[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
