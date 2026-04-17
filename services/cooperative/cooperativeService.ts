import { axiosInstance } from "@/lib/axios";

import type {
  CooperativeAccount,
  CooperativeMembership,
  GetCooperativeMembershipsQuery,
} from "@/services/cooperative";
import type { PaginatedResponse } from "@/types";

type CooperativeListResponse =
  | CooperativeAccount[]
  | {
      items?: CooperativeAccount[];
      data?: CooperativeAccount[];
    };

export const cooperativeService = {
  getActiveCooperatives: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<CooperativeAccount[]> => {
    const response = await axiosInstance.get<
      CooperativeListResponse,
      CooperativeListResponse
    >("/cooperative/htx", {
      params: { page: params?.page ?? 1, limit: params?.limit ?? 100 },
    });

    const raw = Array.isArray(response)
      ? response
      : response.items ?? response.data ?? [];

    return raw.map((item: CooperativeAccount & { fullName?: string }) => ({
      ...item,
      full_name: item.fullName ?? item.full_name,
    }));
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

  requestJoinCooperative: async (body: {
    cooperative_user_id: string;
    farm_id: string;
  }): Promise<{
    membershipId: string;
    status: string;
    cooperativeUserId: string;
    farmId: string;
  }> => {
    return axiosInstance.post("/cooperative/join-request", body);
  },
};
