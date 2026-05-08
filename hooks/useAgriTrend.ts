"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AgriTrendResponse } from "@/services/agri-trend";
import { agriTrendService } from "@/services/agri-trend/agriTrendService";

export const agriTrendKeys = {
  all: ["agri-trend"] as const,
};

export const useAgriTrendQuery = () => {
  return useQuery({
    queryKey: agriTrendKeys.all,
    queryFn: () => agriTrendService.getAgriTrend(),
    staleTime: 60 * 60 * 1000,
  });
};

export const useRefreshAgriTrendMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<AgriTrendResponse, Error, void>({
    mutationFn: () => agriTrendService.getAgriTrend(true),
    onSuccess: (data) => {
      queryClient.setQueryData(agriTrendKeys.all, data);
    },
  });
};
