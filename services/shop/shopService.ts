import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";
import type {
  AddProductPayload,
  AvailableSeasonForProduct,
  AvailableSaleUnitForProduct,
  CreateShopPayload,
  GetPublicProductsQuery,
  GetShopsQuery,
  PublicProduct,
  PublicProductDetail,
  ShopSuggestResult,
  ShopSummary,
} from "./index";

type RawProductRow = {
  id: string;
  shop_id: string;
  season_id: string | null;
  sale_unit_id?: string | null;
  name: string;
  description: string | null;
  price: string | number;
  unit: string | null;
  stock_qty: string | number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shops?: {
    id: string;
    farm_id?: string;
    name: string;
    description?: string | null;
    avatar_url?: string | null;
    is_verified: boolean;
    certifications: unknown;
    badges?: import("@/services/certificate").CertificateBadge[];
    average_rating?: number | null;
    review_count?: number;
    farms?: {
      id: string;
      name: string;
      owner_user_id?: string;
      province: string | null;
      district: string | null;
      ward: string | null;
      address?: string | null;
      crop_main?: string | null;
    } | null;
  } | null;
  seasons?: {
    id: string;
    code: string;
    crop_name: string;
    start_date?: string | null;
    harvest_start_date?: string | null;
    harvest_end_date?: string | null;
    status?: string;
  } | null;
  sale_unit?: {
    id: string;
    code: string;
    short_code: string | null;
    qr_url: string;
  } | null;
  average_rating?: number | null;
  review_count?: number;
  rank_score?: number;
};

const parseCertifications = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === "string");
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
};

const mapProduct = (row: RawProductRow): PublicProduct => ({
  id: row.id,
  shopId: row.shop_id,
  seasonId: row.season_id,
  saleUnitId: row.sale_unit_id ?? null,
  name: row.name,
  description: row.description,
  price: row.price,
  unit: row.unit,
  stockQty: row.stock_qty,
  imageUrl: row.image_url,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  shop: row.shops
    ? {
        id: row.shops.id,
        name: row.shops.name,
        description: row.shops.description ?? null,
        avatarUrl: row.shops.avatar_url ?? null,
        isVerified: row.shops.is_verified,
        certifications: parseCertifications(row.shops.certifications),
        badges: row.shops.badges ?? [],
        farmId: row.shops.farm_id,
        farm: row.shops.farms
          ? {
              id: row.shops.farms.id,
              name: row.shops.farms.name,
              ownerUserId: row.shops.farms.owner_user_id,
              province: row.shops.farms.province,
              district: row.shops.farms.district,
              ward: row.shops.farms.ward,
              address: row.shops.farms.address ?? null,
              cropMain: row.shops.farms.crop_main ?? null,
            }
          : null,
        averageRating: row.shops.average_rating ?? null,
        reviewCount: row.shops.review_count ?? 0,
      }
    : null,
  season: row.seasons
    ? {
        id: row.seasons.id,
        code: row.seasons.code,
        cropName: row.seasons.crop_name,
      }
    : null,
  saleUnit: row.sale_unit
    ? {
        id: row.sale_unit.id,
        code: row.sale_unit.code,
        shortCode: row.sale_unit.short_code,
        qrUrl: row.sale_unit.qr_url,
      }
    : null,
  averageRating: row.average_rating ?? null,
  reviewCount: row.review_count ?? 0,
  rankScore: row.rank_score,
});

const mapProductDetail = (row: RawProductRow): PublicProductDetail => {
  const base = mapProduct(row);
  return {
    ...base,
    shop: base.shop as PublicProductDetail["shop"],
    season: row.seasons
      ? {
          id: row.seasons.id,
          code: row.seasons.code,
          cropName: row.seasons.crop_name,
          startDate: row.seasons.start_date ?? null,
          harvestStartDate: row.seasons.harvest_start_date ?? null,
          harvestEndDate: row.seasons.harvest_end_date ?? null,
          status: row.seasons.status ?? "anchored",
        }
      : null,
  };
};

export const shopService = {
  getPublicProducts: async (
    query?: GetPublicProductsQuery,
  ): Promise<PaginatedResponse<PublicProduct>> => {
    const raw = await axiosInstance.get<
      PaginatedResponse<RawProductRow>,
      PaginatedResponse<RawProductRow>
    >("/shop/products", { params: query });
    return { items: raw.items.map(mapProduct), meta: raw.meta };
  },

  getPublicProductById: async (productId: string): Promise<PublicProductDetail> => {
    const raw = await axiosInstance.get<RawProductRow, RawProductRow>(
      `/shop/products/${productId}`,
    );
    return mapProductDetail(raw);
  },

  /** GET /shop — BE: chỉ gian hàng mở cửa; lọc province/district/ward; sắp xếp sao → review → xác minh → mới → số SP. */
  getShops: async (
    query?: GetShopsQuery,
  ): Promise<PaginatedResponse<ShopSummary>> => {
    const raw = await axiosInstance.get<
      PaginatedResponse<ShopSummary>,
      PaginatedResponse<ShopSummary>
    >("/shop", { params: query });
    return raw;
  },

  getShopById: async (shopId: string): Promise<ShopSummary> => {
    const raw = await axiosInstance.get<ShopSummary, ShopSummary>(`/shop/${shopId}`);
    return raw;
  },

  getShopProducts: async (
    shopId: string,
    query?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<PublicProduct>> => {
    const raw = await axiosInstance.get<
      PaginatedResponse<RawProductRow>,
      PaginatedResponse<RawProductRow>
    >(`/shop/${shopId}/products`, { params: query });
    return { items: raw.items.map(mapProduct), meta: raw.meta };
  },

  getMyShops: async (): Promise<ShopSummary[]> => {
    return axiosInstance.get<ShopSummary[], ShopSummary[]>("/shop/mine");
  },

  createShop: async (payload: CreateShopPayload): Promise<ShopSummary> => {
    return axiosInstance.post<ShopSummary, ShopSummary>("/shop", payload);
  },

  suggestShop: async (farmId: string): Promise<ShopSuggestResult> => {
    return axiosInstance.get<ShopSuggestResult, ShopSuggestResult>(
      "/shop/suggest",
      { params: { farm_id: farmId } },
    );
  },

  getAvailableSeasons: async (): Promise<AvailableSeasonForProduct[]> => {
    return axiosInstance.get<
      AvailableSeasonForProduct[],
      AvailableSeasonForProduct[]
    >("/shop/available-seasons");
  },

  getAvailableSaleUnits: async (
    shopId: string,
  ): Promise<AvailableSaleUnitForProduct[]> => {
    return axiosInstance.get<
      AvailableSaleUnitForProduct[],
      AvailableSaleUnitForProduct[]
    >(`/shop/${shopId}/available-sale-units`);
  },

  addProduct: async (
    shopId: string,
    payload: AddProductPayload,
  ): Promise<RawProductRow> => {
    return axiosInstance.post<RawProductRow, RawProductRow>(
      `/shop/${shopId}/products`,
      payload,
    );
  },
};
