"use client";

import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { farmService } from "@/services/farm/farmService";
import type { CreateFarmPayload, Farm, GetMyFarmsQuery } from "@/services/farm";
import type { PaginationMeta } from "@/types";

export const farmQueryKeys = {
  all: ["farm"] as const,
  myFarms: (query?: GetMyFarmsQuery) => ["farm", "mine", query] as const,
};

export const useMyFarmsQuery = (query?: GetMyFarmsQuery) => {
  const queryResult = useQuery({
    queryKey: farmQueryKeys.myFarms(query),
    queryFn: () => farmService.getMyFarms(query),
    placeholderData: (prev) => prev,
  });

  return {
    ...queryResult,
    farms: (queryResult.data?.items ?? []) as Farm[],
    pagination: queryResult.data?.meta as PaginationMeta | undefined,
  };
};

export const useCreateFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Farm, Error, CreateFarmPayload>({
    mutationFn: (payload) => farmService.createFarm(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmQueryKeys.all });
    },
  });
};
