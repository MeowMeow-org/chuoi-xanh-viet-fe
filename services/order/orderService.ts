import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";
import type {
  CreateOrderPayload,
  GetMyOrdersQuery,
  Order,
  OrderStatus,
  CreateOrderResult,
  PayosResumePayload,
  PayosRenewResult,
} from "./index";

function toCreateOrderBody(payload: CreateOrderPayload): Record<string, unknown> {
  const body: Record<string, unknown> = {
    shop_id: payload.shopId,
    items: payload.items.map((i) => ({ product_id: i.productId, qty: i.qty })),
    shipping_name: payload.shippingName,
    shipping_phone: payload.shippingPhone,
    payment_method: payload.paymentMethod,
    note: payload.note,
  };
  if (payload.shippingAddress !== undefined)
    body.shipping_address = payload.shippingAddress;
  if (payload.shippingProvinceCode !== undefined)
    body.shipping_province_code = payload.shippingProvinceCode;
  if (payload.shippingDistrictCode !== undefined)
    body.shipping_district_code = payload.shippingDistrictCode;
  if (payload.shippingWardCode !== undefined)
    body.shipping_ward_code = payload.shippingWardCode;
  if (payload.shippingProvinceName !== undefined)
    body.shipping_province_name = payload.shippingProvinceName;
  if (payload.shippingDistrictName !== undefined)
    body.shipping_district_name = payload.shippingDistrictName;
  if (payload.shippingWardName !== undefined)
    body.shipping_ward_name = payload.shippingWardName;
  if (payload.shippingDetail !== undefined)
    body.shipping_detail = payload.shippingDetail;
  return body;
}

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<CreateOrderResult> => {
    const data = await axiosInstance.post<CreateOrderResult, CreateOrderResult>(
      "/order",
      toCreateOrderBody(payload),
    );
    return data;
  },

  getMyOrders: async (
    query?: GetMyOrdersQuery,
  ): Promise<PaginatedResponse<Order>> => {
    const data = await axiosInstance.get<
      PaginatedResponse<Order>,
      PaginatedResponse<Order>
    >("/order/mine", { params: query });
    return data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const data = await axiosInstance.get<Order, Order>(`/order/${orderId}`);
    return data;
  },

  getPayosResume: async (orderId: string): Promise<PayosResumePayload> => {
    const data = await axiosInstance.get<
      PayosResumePayload,
      PayosResumePayload
    >(`/order/${orderId}/payos/resume`);
    return data;
  },

  renewPayosPayment: async (orderId: string): Promise<PayosRenewResult> => {
    const data = await axiosInstance.post<PayosRenewResult, PayosRenewResult>(
      `/order/${orderId}/payos/renew`,
    );
    return data;
  },

  cancelOrder: async (orderId: string): Promise<Order> => {
    const data = await axiosInstance.patch<Order, Order>(
      `/order/${orderId}/cancel`,
    );
    return data;
  },

  updateOrderStatus: async (
    orderId: string,
    status: OrderStatus,
  ): Promise<Order> => {
    const data = await axiosInstance.patch<Order, Order>(
      `/order/${orderId}/status`,
      { status },
    );
    return data;
  },

  getShopOrders: async (
    query?: GetMyOrdersQuery,
  ): Promise<PaginatedResponse<Order>> => {
    const data = await axiosInstance.get<
      PaginatedResponse<Order>,
      PaginatedResponse<Order>
    >("/order/shop", { params: query });
    return data;
  },
};
