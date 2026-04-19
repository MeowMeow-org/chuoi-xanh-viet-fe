"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

import { cooperativeService } from "@/services/cooperative/cooperativeService";
import { farmService } from "@/services/farm/farmService";
import type {
  CreateFarmPayload,
  Farm,
  GetMyFarmsQuery,
} from "@/services/farm";
import { seasonQueryKeys } from "@/hooks/useSeason";
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

export const useUpdateFarmMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Farm,
    Error,
    { farmId: string; payload: CreateFarmPayload }
  >({
    mutationFn: ({ farmId, payload }) =>
      farmService.updateFarm(farmId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmQueryKeys.all });
    },
  });
};

export const useDeleteFarmMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, string>({
    mutationFn: (farmId) => farmService.deleteFarm(farmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: seasonQueryKeys.all });
      router.replace("/farmer/farms");
      toast.success("Đã xóa nông trại");
    },
  });
};

export const useRequestCooperativeJoinMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { cooperative_user_id: string; farm_id: string }) =>
      cooperativeService.requestJoinCooperative(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmQueryKeys.all });
    },
  });
};

