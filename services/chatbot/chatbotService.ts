import { axiosInstance } from "@/lib/axios";

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ChatbotUsage = {
  promptTokens?: number;
  completionTokens?: number;
};

export type ChatbotChatResult = {
  reply: string | null;
  usage?: ChatbotUsage;
};

export type ChatbotMarketSource = { title: string; url: string };

export type ChatbotMarketResult = {
  advice: string | null;
  /** Câu hỏi thực tế đã xử lý (message hoặc crop) */
  message?: string;
  crop: string | null;
  region: string | null;
  sources: ChatbotMarketSource[];
  usage?: ChatbotUsage;
};

export type ChatbotDiagnoseResult = {
  diagnosis: string | null;
  usage?: ChatbotUsage;
};

const AI_TIMEOUT_MS = 120_000;

export const chatbotService = {
  chat: async (
    message: string,
    conversationHistory: ConversationTurn[] = [],
  ): Promise<ChatbotChatResult> => {
    return axiosInstance.post<ChatbotChatResult, ChatbotChatResult>(
      "/chatbot/chat",
      { message, conversationHistory },
      { timeout: AI_TIMEOUT_MS },
    );
  },

  market: async (
    /** Nội dung chat — ưu tiên */
    message: string,
    opts?: { crop?: string; region?: string },
    conversationHistory: ConversationTurn[] = [],
  ): Promise<ChatbotMarketResult> => {
    return axiosInstance.post<ChatbotMarketResult, ChatbotMarketResult>(
      "/chatbot/market",
      {
        message: message.trim(),
        ...(opts?.crop?.trim() ? { crop: opts.crop.trim() } : {}),
        ...(opts?.region?.trim() ? { region: opts.region.trim() } : {}),
        conversationHistory,
      },
      { timeout: AI_TIMEOUT_MS },
    );
  },

  diagnose: async (
    image: File,
    note?: string,
  ): Promise<ChatbotDiagnoseResult> => {
    const formData = new FormData();
    formData.append("image", image);
    if (note?.trim()) formData.append("note", note.trim());

    return axiosInstance.post<ChatbotDiagnoseResult, ChatbotDiagnoseResult>(
      "/chatbot/diagnose",
      formData,
      {
        timeout: AI_TIMEOUT_MS,
        transformRequest: [
          (data, headers) => {
            if (typeof FormData !== "undefined" && data instanceof FormData) {
              delete headers["Content-Type"];
            }
            return data;
          },
        ],
      },
    );
  },
};
