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
  avatarUrl?: string | null;
  isVerified: boolean;
  certifications?: string[] | null;
  /** Danh sách chứng chỉ còn hiệu lực (VietGAP…), BE tính sẵn */
  badges?: import("@/services/certificate").CertificateBadge[];
  farm?: ShopFarmInfo | null;
  farmId?: string;
  /** Tổng hợp mọi đánh giá SP thuộc gian hàng (BE) */
  averageRating?: number | null;
  reviewCount?: number;
}

export interface PublicProduct {
  id: string;
  shopId: string;
  seasonId: string | null;
  saleUnitId?: string | null;
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
  saleUnit?: {
    id: string;
    code: string;
    shortCode: string | null;
    qrUrl: string;
  } | null;
  /** Tổng hợp từ shop_reviews (BE) */
  averageRating?: number | null;
  reviewCount?: number;
  /** Điểm xếp hạng 0–1 (freshness + rating + scan), BE */
  rankScore?: number;
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

export interface ShopCooperativeSummary {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

/** GET /shop (danh sách công khai): BE chỉ trả gian hàng `status: open` (đã sắp xếp). */
export interface ShopSummary {
  id: string;
  farm_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  status: string;
  is_verified: boolean;
  certifications: unknown;
  /** Badge chứng chỉ còn hiệu lực (VietGAP…), BE tính sẵn */
  badges?: import("@/services/certificate").CertificateBadge[];
  created_at: string;
  updated_at: string;
  /** Trung bình sao trên mọi đánh giá SP của gian hàng */
  average_rating?: number | null;
  review_count?: number;
  farms?: {
    id: string;
    name: string;
    province?: string | null;
    district?: string | null;
    ward?: string | null;
    address?: string | null;
    owner_user_id?: string;
    /** BE GET /shop/mine trả kèm: ['approved'] member của farm này (tối đa 1). */
    cooperative_members?: Array<{
      cooperative_user: ShopCooperativeSummary;
    }>;
  };
}

export interface ShopSuggestResult {
  suggestedName: string;
  suggestedDescription: string;
}

export interface AvailableSeasonForProduct {
  id: string;
  code: string;
  crop_name: string;
  actual_yield: unknown;
  yield_unit: string | null;
  status: string;
  farms: {
    id: string;
    name: string;
    province: string | null;
    district: string | null;
    address: string | null;
  };
}

/** Lô đã phân có thể đăng lên gian hàng (BE GET .../available-sale-units) */
export interface AvailableSaleUnitForProduct {
  id: string;
  code: string;
  short_code: string | null;
  quantity: string | number;
  unit: string;
  qr_url: string;
  status: string;
  created_at: string;
  seasons: {
    id: string;
    code: string;
    crop_name: string;
  };
}

export interface CreateShopPayload {
  farm_id: string;
  name: string;
  description?: string;
  avatar_url?: string | null;
}

export interface AddProductPayload {
  sale_unit_id: string;
  name?: string;
  description?: string;
  price: number;
  unit?: string;
  stock_qty?: number;
  image_url?: string | null;
}
