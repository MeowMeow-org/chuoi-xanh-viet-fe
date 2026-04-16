import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";

import { GetSeasonsQuery, Season } from "./index";

export const seasonService = {
  getSeasons: async (
    query?: GetSeasonsQuery,
  ): Promise<PaginatedResponse<Season>> => {
    const response = await axiosInstance.get<
      PaginatedResponse<Season>,
      PaginatedResponse<Season>
    >("/season", {
      params: query,
    });
    return response;
  },

  getSeasonDetail: async (seasonId: string): Promise<Season> => {
    const response = await axiosInstance.get<Season, Season>(`/season/${seasonId}`);
    return response;
  },
};
