"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { CreateDiaryPayload, DiaryEntry, GetDiariesQuery } from "@/services/diary";
import { diaryService } from "@/services/diary/diaryService";
import type { PaginationMeta } from "@/types";

export const diaryQueryKeys = {
  all: ["diary"] as const,
  list: (query?: GetDiariesQuery) => ["diary", "list", query] as const,
};

export const useDiariesQuery = (query?: GetDiariesQuery) => {
  const enabled = !query?.seasonId || query.seasonId.trim().length > 0;

  const queryResult = useQuery({
    queryKey: diaryQueryKeys.list(query),
    queryFn: () => diaryService.getDiaries(query),
    placeholderData: (prev) => prev,
    enabled,
  });

  return {
    ...queryResult,
    diaries: (queryResult.data?.items ?? []) as DiaryEntry[],
    pagination: queryResult.data?.meta as PaginationMeta | undefined,
  };
};

export const useCreateDiaryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<DiaryEntry, Error, CreateDiaryPayload>({
    mutationFn: (payload) => diaryService.createDiary(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: diaryQueryKeys.all });
    },
  });
};
