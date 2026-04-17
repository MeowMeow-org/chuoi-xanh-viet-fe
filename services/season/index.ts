export type SeasonStatus =
  | "draft"
  | "ready_to_anchor"
  | "anchored"
  | "amended"
  | "failed";

export interface Season {
  id: string;
  farmId: string;
  code: string;
  cropName: string;
  startDate: string;
  harvestStartDate: string | null;
  harvestEndDate: string | null;
  estimatedYield: number | null;
  actualYield: number | null;
  yieldUnit: string | null;
  status: SeasonStatus;
  sealedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetSeasonsQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: SeasonStatus;
  farmId?: string;
}

export interface CreateSeasonPayload {
  farmId: string;
  cropName: string;
  startDate: string;
  harvestStartDate?: string;
  harvestEndDate?: string;
  estimatedYield?: number;
  actualYield?: number;
  yieldUnit?: string;
}
