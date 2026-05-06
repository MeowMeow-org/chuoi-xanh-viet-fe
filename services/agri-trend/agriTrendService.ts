import { axiosInstance } from "@/lib/axios";

import type { AgriTrendResponse } from "./index";

export const agriTrendService = {
  getAgriTrend: async (refresh?: boolean): Promise<AgriTrendResponse> => {
    return axiosInstance.get<AgriTrendResponse, AgriTrendResponse>("/agri-trend", {
      params: refresh ? { refresh: true } : undefined,
      timeout: 30000,
    });
  },
};
