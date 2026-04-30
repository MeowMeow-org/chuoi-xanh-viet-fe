"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";

import type { AddProductPayload, CreateShopPayload } from "@/services/shop";
import { shopService } from "@/services/shop/shopService";

export const farmerShopKeys = {
  mine: ["shop", "mine"] as const,
  availableSeasons: ["shop", "available-seasons"] as const,
  availableSaleUnits: (shopId: string) =>
    ["shop", shopId, "available-sale-units"] as const,
  shopProducts: (shopId: string) => ["shop", shopId, "products"] as const,
};

export const useMyShopsQuery = () => {
  return useQuery({
    queryKey: farmerShopKeys.mine,
    queryFn: () => shopService.getMyShops(),
  });
};

export const useAvailableSeasonsQuery = (enabled = true) => {
  return useQuery({
    queryKey: farmerShopKeys.availableSeasons,
    queryFn: () => shopService.getAvailableSeasons(),
    enabled,
  });
};

export const useAvailableSaleUnitsQuery = (
  shopId: string | undefined,
  enabled = true,
) => {
  return useQuery({
    queryKey: farmerShopKeys.availableSaleUnits(shopId ?? ""),
    queryFn: () => shopService.getAvailableSaleUnits(shopId!),
    enabled: !!shopId && enabled,
  });
};

export const useShopProductsQuery = (
  shopId: string | undefined,
  enabled = true,
) => {
  return useQuery({
    queryKey: farmerShopKeys.shopProducts(shopId ?? ""),
    queryFn: () => shopService.getShopProducts(shopId!, { limit: 60 }),
    enabled: !!shopId && enabled,
  });
};

export const useCreateShopMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateShopPayload) => shopService.createShop(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: farmerShopKeys.mine });
      toast.success("Đã tạo gian hàng");
    },
    onError: () => {},
  });
};

export const useSuggestShopMutation = () => {
  return useMutation({
    mutationFn: (farmId: string) => shopService.suggestShop(farmId),
    onError: () => {},
  });
};

export const useSuggestProductListingMutation = () => {
  return useMutation({
    mutationFn: ({
      shopId,
      saleUnitId,
    }: {
      shopId: string;
      saleUnitId: string;
    }) => shopService.suggestProductListing(shopId, saleUnitId),
    onError: () => {},
  });
};

export const useAddProductMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      shopId,
      payload,
    }: {
      shopId: string;
      payload: AddProductPayload;
    }) => shopService.addProduct(shopId, payload),
    onSuccess: (_data, { shopId }) => {
      void qc.invalidateQueries({
        queryKey: farmerShopKeys.shopProducts(shopId),
      });
      void qc.invalidateQueries({
        queryKey: farmerShopKeys.availableSaleUnits(shopId),
      });
      void qc.invalidateQueries({
        queryKey: ["shop-products-public", shopId],
      });
      toast.success("Đã thêm sản phẩm");
    },
    onError: () => {},
  });
};
