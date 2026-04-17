"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cooperativeService } from "@/services/cooperative/cooperativeService";
import type {
  CooperativeMembership,
  GetCooperativeMembershipsQuery,
} from "@/services/cooperative";
import type { PaginationMeta } from "@/types";

export const cooperativeMembershipQueryKeys = {
  all: ["cooperative-memberships"] as const,
  list: (query?: GetCooperativeMembershipsQuery) =>
    ["cooperative-memberships", "list", query] as const,
};

export const useCooperativeMembershipsQuery = (
  query?: GetCooperativeMembershipsQuery,
) => {
  const queryResult = useQuery({
    queryKey: cooperativeMembershipQueryKeys.list(query),
    queryFn: () => cooperativeService.getMyMemberships(query),
    placeholderData: (prev) => prev,
  });

  return {
    ...queryResult,
    items: (queryResult.data?.items ?? []) as CooperativeMembership[],
    pagination: queryResult.data?.meta as PaginationMeta | undefined,
  };
};

export const useApproveMembershipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (membershipId: string) =>
      cooperativeService.approveMembership(membershipId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cooperativeMembershipQueryKeys.all,
      });
    },
  });
};

export const useRejectMembershipMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      membershipId,
      note,
    }: {
      membershipId: string;
      note?: string;
    }) => cooperativeService.rejectMembership(membershipId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: cooperativeMembershipQueryKeys.all,
      });
    },
  });
};
