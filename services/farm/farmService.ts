import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";
import { CreateFarmPayload, Farm, GetMyFarmsQuery } from "./index";

export const farmService = {
  getMyFarms: async (
    query?: GetMyFarmsQuery,
  ): Promise<PaginatedResponse<Farm>> => {
    const response = await axiosInstance.get<
      PaginatedResponse<Farm>,
      PaginatedResponse<Farm>
    >("/farm/mine", {
      params: query,
    });
    return response;
  },
  createFarm: async (payload: CreateFarmPayload): Promise<Farm> => {
    const response = await axiosInstance.post<Farm, Farm>("/farm", payload);
    return response;
  },
};
