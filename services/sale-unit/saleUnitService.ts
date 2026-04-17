import { axiosInstance } from "@/lib/axios";
import type {
  CreateSaleUnitPayload,
  SaleUnit,
  SaleUnitListResponse,
} from "./index";

export const saleUnitService = {
  list: async (seasonId: string): Promise<SaleUnitListResponse> => {
    return axiosInstance.get<SaleUnitListResponse, SaleUnitListResponse>(
      "/sale-unit",
      { params: { seasonId } },
    );
  },

  create: async (payload: CreateSaleUnitPayload): Promise<SaleUnit> => {
    return axiosInstance.post<SaleUnit, SaleUnit>("/sale-unit", payload);
  },

  remove: async (saleUnitId: string): Promise<void> => {
    await axiosInstance.delete(`/sale-unit/${saleUnitId}`);
  },
};
