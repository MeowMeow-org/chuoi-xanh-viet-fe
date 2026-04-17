import { axiosInstance } from "@/lib/axios";

import type {
  CooperativeAccount,
  CooperativeMembership,
  GetCooperativeMembershipsQuery,
  RegisterFarmerApplicantPayload,
} from "@/services/cooperative";
import type { PaginatedResponse } from "@/types";

type CooperativeListResponse =
  | CooperativeAccount[]
  | {
      items?: CooperativeAccount[];
      data?: CooperativeAccount[];
    };

export const cooperativeService = {
  getActiveCooperatives: async (): Promise<CooperativeAccount[]> => {
    const response = await axiosInstance.get<
      CooperativeListResponse,
      CooperativeListResponse
    >("/cooperative/htx");

    if (Array.isArray(response)) {
      return response;
    }

    return response.items ?? response.data ?? [];
  },

  registerFarmerApplicant: async (
    payload: RegisterFarmerApplicantPayload,
  ): Promise<unknown> => {
    return axiosInstance.post<unknown, unknown>(
      "/cooperative/register-farmer-applicant",
      payload,
    );
  },

  getMyMemberships: async (
    query?: GetCooperativeMembershipsQuery,
  ): Promise<PaginatedResponse<CooperativeMembership>> => {
    return axiosInstance.get<
      PaginatedResponse<CooperativeMembership>,
      PaginatedResponse<CooperativeMembership>
    >("/cooperative/members", { params: query });
  },

  approveMembership: async (membershipId: string): Promise<void> => {
    await axiosInstance.post<unknown, unknown>(
      `/cooperative/members/${membershipId}/approve`,
      {},
    );
  },

  rejectMembership: async (
    membershipId: string,
    body?: { note?: string },
  ): Promise<void> => {
    await axiosInstance.post<unknown, unknown>(
      `/cooperative/members/${membershipId}/reject`,
      body ?? {},
    );
  },
};
