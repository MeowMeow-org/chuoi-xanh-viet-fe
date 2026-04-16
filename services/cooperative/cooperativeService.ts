import { axiosInstance } from "@/lib/axios";

import type {
  CooperativeAccount,
  RegisterFarmerApplicantPayload,
} from "@/services/cooperative";

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
};
