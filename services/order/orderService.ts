import { axiosInstance } from "@/lib/axios";
import type { PaginatedResponse } from "@/types";
import type {
  CreateOrderPayload,
  GetMyOrdersQuery,
  Order,
  OrderStatus,
  CreateOrderResult,
  PayosResumePayload,
} from "./index";

function toCreateOrderBody(payload: CreateOrderPayload): Record<string, unknown> {
  return {
    shop_id: payload.shopId,
    items: payload.items.map((i) => ({ product_id: i.productId, qty: i.qty })),
    shipping_name: payload.shippingName,
    shipping_phone: payload.shippingPhone,
    shipping_address: payload.shippingAddress,
    payment_method: payload.paymentMethod,
    note: payload.note,
  };
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
