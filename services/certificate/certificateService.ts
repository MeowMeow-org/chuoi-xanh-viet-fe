import { axiosInstance } from "@/lib/axios";

import type {
  CertType,
  CertificateBadge,
  CoopCertStatus,
  CooperativeCertificate,
  CooperativeCertificateScopeRow,
  CreateCertPayload,
  CreateFarmCertPayload,
  FarmCertStatus,
  FarmCertificate,
} from "./index";
import type { CooperativeMembership } from "@/services/cooperative";
import type { PaginatedResponse, PaginationMeta } from "@/types";

type ListCoopCertQuery = {
  page?: number;
  limit?: number;
  status?: CoopCertStatus;
  type?: CertType;
};

type ListFarmCertQuery = {
  page?: number;
  limit?: number;
  status?: FarmCertStatus;
  farmId?: string;
};

export const certificateService = {
  // Public
  getFarmBadges: async (
    farmId: string,
  ): Promise<{ badges: CertificateBadge[] }> => {
    return axiosInstance.get<
      { badges: CertificateBadge[] },
      { badges: CertificateBadge[] }
    >(`/certificate/farm/${farmId}/badges`);
  },

  // Cooperative (HTX)
  listMyCoopCerts: async (
    query?: ListCoopCertQuery,
  ): Promise<PaginatedResponse<CooperativeCertificate>> => {
    return axiosInstance.get<
      PaginatedResponse<CooperativeCertificate>,
      PaginatedResponse<CooperativeCertificate>
    >("/certificate/cooperative/mine", { params: query });
  },

  createCoopCert: async (
    payload: CreateCertPayload,
  ): Promise<CooperativeCertificate> => {
    return axiosInstance.post("/certificate/cooperative", payload);
  },

  updateCoopCert: async (
    certificateId: string,
    payload: Partial<CreateCertPayload>,
  ): Promise<CooperativeCertificate> => {
    return axiosInstance.patch(
      `/certificate/cooperative/${certificateId}`,
      payload,
    );
  },

  deleteCoopCert: async (certificateId: string): Promise<void> => {
    await axiosInstance.delete(`/certificate/cooperative/${certificateId}`);
  },

  revokeCoopCert: async (
    certificateId: string,
    reason: string,
  ): Promise<CooperativeCertificate> => {
    return axiosInstance.post(
      `/certificate/cooperative/${certificateId}/revoke`,
      { reason },
    );
  },

  listScopeOfCert: async (
    certificateId: string,
    query?: { page?: number; limit?: number; searchTerm?: string },
  ): Promise<{
    items: CooperativeCertificateScopeRow[];
    meta: PaginationMeta;
  }> => {
    return axiosInstance.get(
      `/certificate/cooperative/${certificateId}/scope`,
      { params: query },
    );
  },

  listEligibleMembersForScope: async (
    certificateId: string,
    query?: { page?: number; limit?: number; searchTerm?: string },
  ): Promise<PaginatedResponse<CooperativeMembership>> => {
    return axiosInstance.get(
      `/certificate/cooperative/${certificateId}/eligible-members`,
      { params: query },
    );
  },

  addScopeFarm: async (
    certificateId: string,
    farmId: string,
  ): Promise<CooperativeCertificateScopeRow> => {
    return axiosInstance.post(
      `/certificate/cooperative/${certificateId}/scope`,
      { farm_id: farmId },
    );
  },

  removeScopeFarm: async (
    certificateId: string,
    farmId: string,
  ): Promise<void> => {
    await axiosInstance.delete(
      `/certificate/cooperative/${certificateId}/scope/${farmId}`,
    );
  },

  // Farmer
  createFarmCert: async (
    payload: CreateFarmCertPayload,
  ): Promise<FarmCertificate> => {
    return axiosInstance.post("/certificate/farm", payload);
  },

  listMyFarmCerts: async (
    query?: ListFarmCertQuery,
  ): Promise<PaginatedResponse<FarmCertificate>> => {
    return axiosInstance.get("/certificate/farm/mine", { params: query });
  },

  // Reviewer
  listPendingFarmCertsForCoop: async (query?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FarmCertificate>> => {
    return axiosInstance.get("/certificate/farm/pending/cooperative", {
      params: query,
    });
  },

  approveFarmCert: async (
    certificateId: string,
    body?: { note?: string },
  ): Promise<FarmCertificate> => {
    return axiosInstance.post(
      `/certificate/farm/${certificateId}/approve`,
      body ?? {},
    );
  },

  rejectFarmCert: async (
    certificateId: string,
    reason: string,
  ): Promise<FarmCertificate> => {
    return axiosInstance.post(`/certificate/farm/${certificateId}/reject`, {
      reason,
    });
  },

  revokeFarmCert: async (
    certificateId: string,
    reason: string,
  ): Promise<FarmCertificate> => {
    return axiosInstance.post(`/certificate/farm/${certificateId}/revoke`, {
      reason,
    });
  },
};
