import { axiosInstance } from "@/lib/axios";

import type {
  CooperativeAccount,
  CooperativeMembership,
  GetCooperativeMembershipsQuery,
} from "@/services/cooperative";
import type { PaginatedResponse, PaginationMeta } from "@/types";


function mapCooperativeAccount(
  item: CooperativeAccount & { fullName?: string },
): CooperativeAccount {
  return {
    ...item,
    full_name: item.fullName ?? item.full_name,
  };
}

export const cooperativeService = {
  getActiveCooperatives: async (params?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    id?: string;
  }): Promise<PaginatedResponse<CooperativeAccount>> => {
    type HtxListPayload = {
      items: (CooperativeAccount & { fullName?: string })[];
      meta: PaginationMeta;
    };
    /** Interceptor trả về `data` đã unwrap, không phải AxiosResponse. */
    const response = (await axiosInstance.get<HtxListPayload>(
      "/cooperative/htx",
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.searchTerm?.trim()
            ? { searchTerm: params.searchTerm.trim() }
            : {}),
          ...(params?.id ? { id: params.id } : {}),
        },
      },
    )) as unknown as HtxListPayload;

    const items = (response.items ?? []).map(mapCooperativeAccount);
    const meta = response.meta;

    return {
      items,
      meta: meta ?? {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        total: items.length,
        totalPages: items.length > 0 ? 1 : 0,
        previousPage: null,
        nextPage: null,
      },
    };
  },

  getMyMemberships: async (
    query?: GetCooperativeMembershipsQuery,
  ): Promise<PaginatedResponse<CooperativeMembership>> => {
    return axiosInstance.get<
      PaginatedResponse<CooperativeMembership>,
      PaginatedResponse<CooperativeMembership>
    >("/cooperative/members", { params: query });
  },

  approveMembership: async (
    membershipId: string,
    body?: { note?: string },
  ): Promise<void> => {
    await axiosInstance.post<unknown, unknown>(
      `/cooperative/members/${membershipId}/approve`,
      body ?? {},
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
