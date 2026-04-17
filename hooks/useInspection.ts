"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { inspectionService } from "@/services/inspection/inspectionService";
import type { CreateInspectionPayload, InspectionEntry } from "@/services/inspection";

export const inspectionQueryKeys = {
  all: ["inspection"] as const,
  list: (seasonId: string) => ["inspection", "list", seasonId] as const,
};

export const useInspectionsQuery = (seasonId: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: seasonId ? inspectionQueryKeys.list(seasonId) : ["inspection", "list", "none"],
    queryFn: () => inspectionService.list(seasonId as string),
    enabled: Boolean(seasonId) && enabled,
  });
};

export const useCreateInspectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<InspectionEntry, Error, CreateInspectionPayload>({
    mutationFn: (payload) => inspectionService.create(payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.list(variables.seasonId),
      });
    },
  });
};

export const useDeleteInspectionMutation = (seasonId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (inspectionId) => inspectionService.remove(inspectionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.list(seasonId),
      });
    },
  });
};
