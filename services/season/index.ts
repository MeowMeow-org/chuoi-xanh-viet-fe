export type SeasonStatus =
  | "draft"
  | "ready_to_anchor"
  | "anchored"
  | "amended"
  | "failed";

export type AnchorStatus = "pending" | "anchored" | "failed";

export interface SeasonAnchor {
  id: string;
  checkpointNo: number;
  dataHash: string;
  chainNetwork: string | null;
  txHash: string | null;
  txUrl: string | null;
  status: AnchorStatus;
  anchoredAt: string | null;
}

export interface Season {
  id: string;
  farmId: string;
  code: string;
  cropName: string;
  startDate: string;
  harvestStartDate: string | null;
  harvestEndDate: string | null;
  /** API có thể trả số hoặc chuỗi (Decimal JSON). */
  estimatedYield: number | string | null;
  actualYield: number | string | null;
  yieldUnit: string | null;
  status: SeasonStatus;
  sealedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  latestAnchor: SeasonAnchor | null;
}

export interface GetSeasonsQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: SeasonStatus;
  farmId?: string;
}

export interface ChangeSeasonStatusPayload {
  seasonId: string;
  status: SeasonStatus;
}

export interface CreateSeasonPayload {
  farmId: string;
  cropName: string;
  startDate: string;
  /** Bắt buộc — BE dùng để HTX lên lịch kiểm tra trước thu hoạch. */
  harvestStartDate: string;
  harvestEndDate?: string;
  estimatedYield: number;
  actualYield?: number;
  yieldUnit?: string;
}

export interface UpdateSeasonPayload {
  cropName?: string;
  startDate?: string;
  harvestStartDate?: string | null;
  harvestEndDate?: string | null;
  estimatedYield?: number | null;
  actualYield?: number | null;
  yieldUnit?: string;
}
