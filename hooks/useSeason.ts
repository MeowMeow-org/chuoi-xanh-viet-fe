"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  ChangeSeasonStatusPayload,
  CreateSeasonPayload,
  GetSeasonsQuery,
  Season,
  UpdateSeasonPayload,
} from "@/services/season";
import { seasonService } from "@/services/season/seasonService";
import type { PaginationMeta } from "@/types";

export const seasonQueryKeys = {
  all: ["season"] as const,
  list: (query?: GetSeasonsQuery) => ["season", "list", query] as const,
  detail: (seasonId: string) => ["season", "detail", seasonId] as const,
};

export const useSeasonsQuery = (query?: GetSeasonsQuery) => {
  const queryResult = useQuery({
    queryKey: seasonQueryKeys.list(query),
    queryFn: () => seasonService.getSeasons(query),
    placeholderData: (prev) => prev,
  });

  return {
    ...queryResult,
    seasons: (queryResult.data?.items ?? []) as Season[],
    pagination: queryResult.data?.meta as PaginationMeta | undefined,
  };
};

export const useSeasonDetailQuery = (
  seasonId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: seasonQueryKeys.detail(seasonId),
    queryFn: () => seasonService.getSeasonDetail(seasonId),
    enabled: !!seasonId && (options?.enabled ?? true),
  });
};

export const useCreateSeasonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Season, Error, CreateSeasonPayload>({
    mutationFn: (payload) => seasonService.createSeason(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonQueryKeys.all });
    },
  });
};

export const useChangeSeasonStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Season, Error, ChangeSeasonStatusPayload>({
    mutationFn: (payload) => seasonService.changeSeasonStatus(payload),
    onSuccess: (updatedSeason) => {
      queryClient.setQueryData(
        seasonQueryKeys.detail(updatedSeason.id),
        updatedSeason,
      );
      void queryClient.invalidateQueries({ queryKey: ["season", "list"] });
    },
  });
};

export const useUpdateSeasonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Season, Error, { seasonId: string; payload: UpdateSeasonPayload }>({
    mutationFn: ({ seasonId, payload }) =>
      seasonService.updateSeason(seasonId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(seasonQueryKeys.detail(updated.id), updated);
      void queryClient.invalidateQueries({ queryKey: ["season", "list"] });
    },
  });
};

export const useDeleteSeasonMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (seasonId) => seasonService.deleteSeason(seasonId),
    onSuccess: async (_, seasonId) => {
      await queryClient.cancelQueries({ queryKey: seasonQueryKeys.detail(seasonId) });
      queryClient.removeQueries({ queryKey: seasonQueryKeys.detail(seasonId) });
      await queryClient.invalidateQueries({ queryKey: ["season", "list"] });
    },
  });
};
