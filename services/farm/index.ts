export interface Farm {
  id: string;
  ownerUserId: string;
  name: string;
  areaHa: number | string;
  cropMain: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  address: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  inCooperative: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetMyFarmsQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
}

export interface CreateFarmPayload {
  name: string;
  areaHa?: number;
  cropMain?: string;
  province?: string;
  district?: string;
  ward?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  inCooperative?: boolean;
}
