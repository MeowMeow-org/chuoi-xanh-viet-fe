import { axiosInstance } from "@/lib/axios";
import type { SeasonStatus } from "@/services/season";

export interface ManagedFarmSeason {
  id: string;
  farmId: string;
  code: string;
  cropName: string;
  startDate: string;
  harvestStartDate: string | null;
  harvestEndDate: string | null;
  status: SeasonStatus;
  sealedAt: string | null;
  createdAt: string;
  updatedAt: string;
  diaryCount: number;
}

export interface ManagedFarmInfo {
  id: string;
  name: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  inCooperative: boolean;
  owner: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
  };
}

export interface ManagedFarmSeasonsResponse {
  farm: ManagedFarmInfo | null;
  seasons: ManagedFarmSeason[];
}

export const managedFarmService = {
  getFarmSeasons: async (farmId: string): Promise<ManagedFarmSeasonsResponse> => {
    return axiosInstance.get<
      ManagedFarmSeasonsResponse,
      ManagedFarmSeasonsResponse
    >(`/cooperative/farms/${farmId}/seasons`);
  },
};
