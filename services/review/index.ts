import type { PaginationMeta } from "@/types";

export interface ShopReviewReviewer {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface ShopReviewProductRef {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface ShopReview {
  id: string;
  userId: string;
  orderId: string;
  shopId: string;
  productId: string;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  reviewer: ShopReviewReviewer;
  product: ShopReviewProductRef;
}

export interface ShopReviewsMeta extends PaginationMeta {
  averageRating: number | null;
  reviewCount: number;
}

export interface ShopReviewsResponse {
  items: ShopReview[];
  meta: ShopReviewsMeta;
}

export interface CreateShopReviewPayload {
  orderId: string;
  productId: string;
  rating: number;
  comment?: string | null;
}

export interface UpdateShopReviewPayload {
  rating?: number;
  comment?: string | null;
}

export interface ListShopReviewsQuery {
  page?: number;
  limit?: number;
}
