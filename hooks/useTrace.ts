"use client";

import { useQuery } from "@tanstack/react-query";

import { traceService } from "@/services/trace/traceService";

export const traceQueryKeys = {
  resolve: (code: string) => ["trace", "resolve", code] as const,
  resolvePublic: (code: string) => ["trace", "public", "resolve", code] as const,
  season: (seasonId: string) => ["trace", "season", seasonId] as const,
  seasonPublic: (seasonId: string) => ["trace", "public", "season", seasonId] as const,
  verify: (seasonId: string) => ["trace", "verify", seasonId] as const,
  verifyPublic: (seasonId: string) => ["trace", "public", "verify", seasonId] as const,
};

export const useTraceResolveQuery = (
  code: string | undefined,
  options?: { publicAccess?: boolean },
) => {
  const pub = options?.publicAccess ?? false;
  return useQuery({
    queryKey: code
      ? pub
        ? traceQueryKeys.resolvePublic(code)
        : traceQueryKeys.resolve(code)
      : ["trace", "resolve", "none"],
    queryFn: () =>
      pub
        ? traceService.resolvePublic(code as string)
        : traceService.resolve(code as string),
    enabled: Boolean(code),
    retry: false,
  });
};

export const useTraceSeasonQuery = (
  seasonId: string | undefined,
  enabled = true,
  options?: { publicAccess?: boolean },
) => {
  const pub = options?.publicAccess ?? false;
  return useQuery({
    queryKey: seasonId
      ? pub
        ? traceQueryKeys.seasonPublic(seasonId)
        : traceQueryKeys.season(seasonId)
      : ["trace", "season", "none"],
    queryFn: () =>
      pub
        ? traceService.getSeasonTracePublic(seasonId as string)
        : traceService.getSeasonTrace(seasonId as string),
    enabled: Boolean(seasonId) && enabled,
  });
};

export const useTraceVerifyQuery = (
  seasonId: string | undefined,
  enabled = true,
  options?: { publicAccess?: boolean },
) => {
  const pub = options?.publicAccess ?? false;
  return useQuery({
    queryKey: seasonId
      ? pub
        ? traceQueryKeys.verifyPublic(seasonId)
        : traceQueryKeys.verify(seasonId)
      : ["trace", "verify", "none"],
    queryFn: () =>
      pub
        ? traceService.verifyPublic(seasonId as string)
        : traceService.verify(seasonId as string),
    enabled: Boolean(seasonId) && enabled,
  });
};
