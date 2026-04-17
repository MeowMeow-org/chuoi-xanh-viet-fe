export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipping"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "vnpay" | "payos";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  qty: number | string;
  unitPrice: number | string;
  lineTotal: number | string;
  product: {
    id: string;
    name: string;
    unit: string | null;
    imageUrl: string | null;
  };
}

export interface OrderShop {
  id: string;
  name: string;
  isVerified: boolean;
  farm: {
    id: string;
    name: string;
    ownerUserId: string;
    province: string | null;
    district: string | null;
    ward: string | null;
  };
}

export interface Order {
  id: string;
  buyerUserId: string;
  shopId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number | string;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  shop: OrderShop | null;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  shopId: string;
  items: Array<{ productId: string; qty: number }>;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface GetMyOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
