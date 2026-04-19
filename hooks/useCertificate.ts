"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { certificateService } from "@/services/certificate/certificateService";
import type {
  CertType,
  CoopCertStatus,
  FarmCertStatus,
} from "@/services/certificate";

export const certificateQueryKeys = {
  all: ["certificate"] as const,
  farmBadges: (farmId: string) =>
    ["certificate", "farm-badges", farmId] as const,
  myCoopList: (q?: {
    page?: number;
    limit?: number;
    status?: CoopCertStatus;
    type?: CertType;
  }) => ["certificate", "coop", "mine", q] as const,
  coopScope: (
    certificateId: string,
    q?: { page?: number; limit?: number; searchTerm?: string },
  ) => ["certificate", "coop", "scope", certificateId, q] as const,
  coopEligible: (
    certificateId: string,
    q?: { page?: number; limit?: number; searchTerm?: string },
  ) => ["certificate", "coop", "eligible", certificateId, q] as const,
  myFarmList: (q?: {
    page?: number;
    limit?: number;
    status?: FarmCertStatus;
    farmId?: string;
  }) => ["certificate", "farm", "mine", q] as const,
  pendingForCoop: (q?: { page?: number; limit?: number }) =>
    ["certificate", "farm", "pending", "coop", q] as const,
  pendingForAdmin: (q?: { page?: number; limit?: number }) =>
    ["certificate", "farm", "pending", "admin", q] as const,
};

export const useFarmBadgesQuery = (farmId: string | undefined | null) => {
  return useQuery({
    queryKey: certificateQueryKeys.farmBadges(farmId ?? ""),
    queryFn: () => certificateService.getFarmBadges(farmId as string),
    enabled: !!farmId,
    staleTime: 60 * 1000,
  });
};

export const useMyCoopCertsQuery = (q?: {
  page?: number;
  limit?: number;
  status?: CoopCertStatus;
  type?: CertType;
}) => {
  return useQuery({
    queryKey: certificateQueryKeys.myCoopList(q),
    queryFn: () => certificateService.listMyCoopCerts(q),
    placeholderData: (prev) => prev,
  });
};

export const useCoopCertScopeQuery = (
  certificateId: string | undefined,
  q?: { page?: number; limit?: number; searchTerm?: string },
) => {
  return useQuery({
    queryKey: certificateQueryKeys.coopScope(certificateId ?? "", q),
    queryFn: () =>
      certificateService.listScopeOfCert(certificateId as string, q),
    enabled: !!certificateId,
    placeholderData: (prev) => prev,
  });
};

export const useEligibleMembersForScopeQuery = (
  certificateId: string | undefined,
  q?: { page?: number; limit?: number; searchTerm?: string },
) => {
  return useQuery({
    queryKey: certificateQueryKeys.coopEligible(certificateId ?? "", q),
    queryFn: () =>
      certificateService.listEligibleMembersForScope(
        certificateId as string,
        q,
      ),
    enabled: !!certificateId,
    placeholderData: (prev) => prev,
  });
};

export const useCreateCoopCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: certificateService.createCoopCert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate", "coop"] });
    },
  });
};

export const useUpdateCoopCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      payload,
    }: {
      certificateId: string;
      payload: Parameters<typeof certificateService.updateCoopCert>[1];
    }) => certificateService.updateCoopCert(certificateId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate", "coop"] });
    },
  });
};

export const useDeleteCoopCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: certificateService.deleteCoopCert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate", "coop"] });
    },
  });
};

export const useRevokeCoopCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      reason,
    }: {
      certificateId: string;
      reason: string;
    }) => certificateService.revokeCoopCert(certificateId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate", "coop"] });
    },
  });
};

export const useAddScopeFarmMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      farmId,
    }: {
      certificateId: string;
      farmId: string;
    }) => certificateService.addScopeFarm(certificateId, farmId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["certificate", "coop", "scope", vars.certificateId],
      });
      qc.invalidateQueries({
        queryKey: ["certificate", "coop", "eligible", vars.certificateId],
      });
      qc.invalidateQueries({ queryKey: ["certificate", "farm-badges"] });
    },
  });
};

export const useRemoveScopeFarmMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      farmId,
    }: {
      certificateId: string;
      farmId: string;
    }) => certificateService.removeScopeFarm(certificateId, farmId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["certificate", "coop", "scope", vars.certificateId],
      });
      qc.invalidateQueries({
        queryKey: ["certificate", "coop", "eligible", vars.certificateId],
      });
      qc.invalidateQueries({ queryKey: ["certificate", "farm-badges"] });
    },
  });
};

export const useMyFarmCertsQuery = (q?: {
  page?: number;
  limit?: number;
  status?: FarmCertStatus;
  farmId?: string;
}) => {
  return useQuery({
    queryKey: certificateQueryKeys.myFarmList(q),
    queryFn: () => certificateService.listMyFarmCerts(q),
    placeholderData: (prev) => prev,
  });
};

export const useCreateFarmCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: certificateService.createFarmCert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate", "farm"] });
    },
  });
};

export const usePendingFarmCertsForCoopQuery = (q?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: certificateQueryKeys.pendingForCoop(q),
    queryFn: () => certificateService.listPendingFarmCertsForCoop(q),
    placeholderData: (prev) => prev,
  });
};

export const usePendingFarmCertsForAdminQuery = (q?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: certificateQueryKeys.pendingForAdmin(q),
    queryFn: () => certificateService.listPendingFarmCertsForAdmin(q),
    placeholderData: (prev) => prev,
  });
};

export const useApproveFarmCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: certificateService.approveFarmCert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate"] });
    },
  });
};

export const useRejectFarmCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      reason,
    }: {
      certificateId: string;
      reason: string;
    }) => certificateService.rejectFarmCert(certificateId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate"] });
    },
  });
};

export const useRevokeFarmCertMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      certificateId,
      reason,
    }: {
      certificateId: string;
      reason: string;
    }) => certificateService.revokeFarmCert(certificateId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["certificate"] });
    },
  });
};
