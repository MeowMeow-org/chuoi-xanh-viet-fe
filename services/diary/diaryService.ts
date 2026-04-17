import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";

import type { CreateDiaryPayload, DiaryEntry, GetDiariesQuery } from "./index";

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

  createDiary: async (payload: CreateDiaryPayload): Promise<DiaryEntry> => {
    return axiosInstance.post<DiaryEntry, DiaryEntry>("/diary", payload);
  },
};
