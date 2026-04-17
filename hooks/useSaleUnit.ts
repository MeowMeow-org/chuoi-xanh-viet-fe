"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { saleUnitService } from "@/services/sale-unit/saleUnitService";
import type { CreateSaleUnitPayload, SaleUnit } from "@/services/sale-unit";

export const saleUnitQueryKeys = {
  all: ["sale-unit"] as const,
  list: (seasonId: string) => ["sale-unit", "list", seasonId] as const,
};

export const useSaleUnitsQuery = (seasonId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: seasonId ? saleUnitQueryKeys.list(seasonId) : ["sale-unit", "list", "none"],
    queryFn: () => saleUnitService.list(seasonId as string),
    enabled: Boolean(seasonId) && enabled,
  });
};

export const useCreateSaleUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<SaleUnit, Error, CreateSaleUnitPayload>({
    mutationFn: (payload) => saleUnitService.create(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: saleUnitQueryKeys.list(variables.seasonId),
      });
    },
  });
};

export const useDeleteSaleUnitMutation = (seasonId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (saleUnitId) => saleUnitService.remove(saleUnitId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: saleUnitQueryKeys.list(seasonId),
      });
    },
  });
};
