"use client";

import { useQuery } from "@tanstack/react-query";

import type { GetSeasonsQuery, Season } from "@/services/season";
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

export const useSeasonDetailQuery = (seasonId: string) => {
  return useQuery({
    queryKey: seasonQueryKeys.detail(seasonId),
    queryFn: () => seasonService.getSeasonDetail(seasonId),
    enabled: !!seasonId,
  });
};
