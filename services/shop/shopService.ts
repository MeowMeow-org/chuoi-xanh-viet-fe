import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";
import type {
  GetPublicProductsQuery,
  PublicProduct,
  PublicProductDetail,
  ShopSummary,
} from "./index";

type RawProductRow = {
  id: string;
  shop_id: string;
  season_id: string | null;
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
    name: string;
    description?: string | null;
    is_verified: boolean;
    certifications: unknown;
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
        isVerified: row.shops.is_verified,
        certifications: parseCertifications(row.shops.certifications),
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
      }
    : null,
  season: row.seasons
    ? {
        id: row.seasons.id,
        code: row.seasons.code,
        cropName: row.seasons.crop_name,
      }
    : null,
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

  getShops: async (query?: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }): Promise<PaginatedResponse<ShopSummary>> => {
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
};
