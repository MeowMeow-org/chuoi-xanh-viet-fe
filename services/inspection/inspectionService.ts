import { axiosInstance } from "@/lib/axios";
import type { CreateInspectionPayload, InspectionEntry } from "./index";

export const inspectionService = {
  list: async (seasonId: string): Promise<InspectionEntry[]> => {
    return axiosInstance.get<InspectionEntry[], InspectionEntry[]>("/inspection", {
      params: { seasonId },
    });
  },

  create: async (payload: CreateInspectionPayload): Promise<InspectionEntry> => {
    return axiosInstance.post<InspectionEntry, InspectionEntry>(
      "/inspection",
      payload,
    );
  },

  remove: async (inspectionId: string): Promise<void> => {
    await axiosInstance.delete(`/inspection/${inspectionId}`);
  },
};
