import { axiosInstance } from "@/lib/axios";
import type {
  TraceResolveResult,
  TraceSeasonDetail,
  TraceVerifyResult,
} from "./index";

export const traceService = {
  resolve: async (code: string): Promise<TraceResolveResult> => {
    return axiosInstance.get<TraceResolveResult, TraceResolveResult>(
      `/trace/resolve/${encodeURIComponent(code)}`,
    );
  },

  /** Tra cứu không cần đăng nhập (trang /truy-xuat). */
  resolvePublic: async (code: string): Promise<TraceResolveResult> => {
    return axiosInstance.get<TraceResolveResult, TraceResolveResult>(
      `/trace/public/resolve/${encodeURIComponent(code)}`,
    );
  },

  getSeasonTrace: async (seasonId: string): Promise<TraceSeasonDetail> => {
    return axiosInstance.get<TraceSeasonDetail, TraceSeasonDetail>(
      `/trace/season/${seasonId}`,
    );
  },

  getSeasonTracePublic: async (seasonId: string): Promise<TraceSeasonDetail> => {
    return axiosInstance.get<TraceSeasonDetail, TraceSeasonDetail>(
      `/trace/public/season/${seasonId}`,
    );
  },

  verify: async (seasonId: string): Promise<TraceVerifyResult> => {
    return axiosInstance.get<TraceVerifyResult, TraceVerifyResult>(
      `/trace/verify/${seasonId}`,
    );
  },

  verifyPublic: async (seasonId: string): Promise<TraceVerifyResult> => {
    return axiosInstance.get<TraceVerifyResult, TraceVerifyResult>(
      `/trace/public/verify/${seasonId}`,
    );
  },
};
