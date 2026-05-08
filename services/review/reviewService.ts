import { axiosInstance } from "@/lib/axios";
import type {
  CreateShopReviewPayload,
  ListShopReviewsQuery,
  ShopReview,
  ShopReviewsResponse,
  UpdateShopReviewPayload,
} from "./index";

export const reviewService = {
  createShopReview: async (
    payload: CreateShopReviewPayload,
  ): Promise<ShopReview> => {
    return axiosInstance.post<ShopReview, ShopReview>("/review", {
      order_id: payload.orderId,
      product_id: payload.productId,
      rating: payload.rating,
      comment: payload.comment,
    });
  },

  listByShop: async (
    shopId: string,
    query?: ListShopReviewsQuery,
  ): Promise<ShopReviewsResponse> => {
    return axiosInstance.get<ShopReviewsResponse, ShopReviewsResponse>(
      `/review/shop/${shopId}`,
      { params: query },
    );
  },

  listByProduct: async (
    productId: string,
    query?: ListShopReviewsQuery,
  ): Promise<ShopReviewsResponse> => {
    return axiosInstance.get<ShopReviewsResponse, ShopReviewsResponse>(
      `/review/product/${productId}`,
      { params: query },
    );
  },

  updateShopReview: async (
    reviewId: string,
    payload: UpdateShopReviewPayload,
  ): Promise<ShopReview> => {
    return axiosInstance.patch<ShopReview, ShopReview>(
      `/review/${reviewId}`,
      payload,
    );
  },
};
