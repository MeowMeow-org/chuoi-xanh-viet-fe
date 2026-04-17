import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";
import { CreateFarmPayload, Farm, GetMyFarmsQuery } from "./index";

/** Backend expects snake_case on POST /farm */
function toCreateFarmBody(payload: CreateFarmPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: payload.name,
  };
  if (payload.areaHa !== undefined) body.area_ha = payload.areaHa;
  if (payload.cropMain !== undefined) body.crop_main = payload.cropMain;
  if (payload.province !== undefined) body.province = payload.province;
  if (payload.district !== undefined) body.district = payload.district;
  if (payload.ward !== undefined) body.ward = payload.ward;
  if (payload.address !== undefined) body.address = payload.address;
  if (payload.latitude !== undefined) body.latitude = payload.latitude;
  if (payload.longitude !== undefined) body.longitude = payload.longitude;
  if (payload.inCooperative !== undefined)
    body.in_cooperative = payload.inCooperative;
  return body;
}

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
    const response = await axiosInstance.post<Farm, Farm>(
      "/farm",
      toCreateFarmBody(payload),
    );
    return response;
  },

  updateFarm: async (
    farmId: string,
    payload: CreateFarmPayload,
  ): Promise<Farm> => {
    const response = await axiosInstance.patch<Farm, Farm>(
      `/farm/${farmId}`,
      toCreateFarmBody(payload),
    );
    return response;
  },

  deleteFarm: async (farmId: string): Promise<void> => {
    await axiosInstance.delete(`/farm/${farmId}`);
  },
};
