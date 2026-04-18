import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";

import type {
  AddDiaryAttachmentPayload,
  CreateDiaryPayload,
  DiaryAttachment,
  DiaryEntry,
  GetDiariesQuery,
} from "./index";

export const diaryService = {
  getDiaries: async (
    query?: GetDiariesQuery,
  ): Promise<PaginatedResponse<DiaryEntry>> => {
    const response = await axiosInstance.get<
      PaginatedResponse<DiaryEntry>,
      PaginatedResponse<DiaryEntry>
    >("/diary", {
      params: query,
    });
    return response;
  },

  getDiaryDetail: async (diaryId: string): Promise<DiaryEntry> => {
    return axiosInstance.get<DiaryEntry, DiaryEntry>(`/diary/${diaryId}`);
  },

  createDiary: async (payload: CreateDiaryPayload): Promise<DiaryEntry> => {
    return axiosInstance.post<DiaryEntry, DiaryEntry>("/diary", payload);
  },

  deleteDiary: async (diaryId: string): Promise<void> => {
    await axiosInstance.delete(`/diary/${diaryId}`);
  },

  addAttachment: async (
    diaryId: string,
    payload: AddDiaryAttachmentPayload,
  ): Promise<DiaryAttachment> => {
    return axiosInstance.post<DiaryAttachment, DiaryAttachment>(
      `/diary/${diaryId}/attachments`,
      payload,
    );
  },

  deleteAttachment: async (
    diaryId: string,
    attachmentId: string,
  ): Promise<void> => {
    await axiosInstance.delete(
      `/diary/${diaryId}/attachments/${attachmentId}`,
    );
  },
};
