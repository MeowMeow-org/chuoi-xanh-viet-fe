export interface ShopFarmInfo {
  id: string;
  name: string;
  ownerUserId?: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  address?: string | null;
  cropMain?: string | null;
}

export interface ShopInfo {
  id: string;
  name: string;
  description?: string | null;
  isVerified: boolean;
  certifications?: string[] | null;
  farm?: ShopFarmInfo | null;
}

export interface PublicProduct {
  id: string;
  shopId: string;
  seasonId: string | null;
  name: string;
  description: string | null;
  /** BE trả về Decimal dưới dạng string */
  price: number | string;
  unit: string | null;
  stockQty: number | string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shop?: ShopInfo | null;
  season?: {
    id: string;
    code: string;
    cropName: string;
  } | null;
}

export interface PublicProductDetail extends PublicProduct {
  shop: ShopInfo;
  season?: {
    id: string;
    code: string;
    cropName: string;
    startDate: string | null;
    harvestStartDate: string | null;
    harvestEndDate: string | null;
    status: string;
  } | null;
}

export interface GetPublicProductsQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  province?: string;
  shopId?: string;
}

export interface ShopSummary {
  id: string;
  farm_id: string;
  name: string;
  description: string | null;
  status: string;
  is_verified: boolean;
  certifications: unknown;
  created_at: string;
  updated_at: string;
  farms?: {
    id: string;
    name: string;
    province: string | null;
    district: string | null;
    ward: string | null;
    address: string | null;
    owner_user_id: string;
  };
}
