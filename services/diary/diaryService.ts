import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";

import type { DiaryEntry, GetDiariesQuery } from "./index";

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
};
