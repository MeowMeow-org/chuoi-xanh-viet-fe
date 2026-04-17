"use client";

import { useQuery } from "@tanstack/react-query";

import { managedFarmService } from "@/services/cooperative/managedFarmService";

export const managedFarmQueryKeys = {
  farmSeasons: (farmId: string) =>
    ["cooperative", "farmSeasons", farmId] as const,
};

export const useManagedFarmSeasonsQuery = (farmId: string | undefined) => {
  return useQuery({
    queryKey: farmId
      ? managedFarmQueryKeys.farmSeasons(farmId)
      : ["cooperative", "farmSeasons", "none"],
    queryFn: () => managedFarmService.getFarmSeasons(farmId as string),
    enabled: Boolean(farmId),
  });
};
