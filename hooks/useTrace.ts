"use client";

import { useQuery } from "@tanstack/react-query";

import { traceService } from "@/services/trace/traceService";

export const traceQueryKeys = {
  resolve: (code: string) => ["trace", "resolve", code] as const,
  season: (seasonId: string) => ["trace", "season", seasonId] as const,
  verify: (seasonId: string) => ["trace", "verify", seasonId] as const,
};

export const useTraceResolveQuery = (code: string | undefined) => {
  return useQuery({
    queryKey: code ? traceQueryKeys.resolve(code) : ["trace", "resolve", "none"],
    queryFn: () => traceService.resolve(code as string),
    enabled: Boolean(code),
    retry: false,
  });
};

export const useTraceSeasonQuery = (seasonId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: seasonId ? traceQueryKeys.season(seasonId) : ["trace", "season", "none"],
    queryFn: () => traceService.getSeasonTrace(seasonId as string),
    enabled: Boolean(seasonId) && enabled,
  });
};

export const useTraceVerifyQuery = (seasonId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: seasonId ? traceQueryKeys.verify(seasonId) : ["trace", "verify", "none"],
    queryFn: () => traceService.verify(seasonId as string),
    enabled: Boolean(seasonId) && enabled,
  });
};
