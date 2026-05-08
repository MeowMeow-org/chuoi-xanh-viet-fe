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
  /** Đánh giá sản phẩm này trong đơn (nếu đã có) */
  myReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
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
  /** Code hành chính giao hàng (null cho dữ liệu cũ chưa chuẩn hóa). */
  shippingProvinceCode?: number | null;
  shippingDistrictCode?: number | null;
  shippingWardCode?: number | null;
  shippingProvinceName?: string | null;
  shippingDistrictName?: string | null;
  shippingWardName?: string | null;
  /** Số nhà / đường (không gồm tỉnh-quận-xã). */
  shippingDetail?: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  /** ISO — thời điểm hết hiệu lực link PayOS (đếm ngược); null = dữ liệu cũ hoặc không áp dụng */
  payosLinkExpiresAt?: string | null;
  /** MVP hoa hồng — snapshot khi xác nhận đơn */
  commissionRate?: number | null;
  estimatedCommissionAmount?: number | null;
  estimatedSellerPayout?: number | null;
  estimatedAt?: string | null;
  commissionAmount?: number | null;
  sellerPayout?: number | null;
  settledAt?: string | null;
  shop: OrderShop | null;
  items: OrderItem[];
}

/** Báo cáo GET /order/shop/earnings */
export interface ShopEarningsReport {
  finalizedSellerPayout: number;
  totalGmvFinalized: number;
  totalPlatformCommissionFinalized: number;
  pipelineEstimatedPayout: number;
  pipelineEstimatedCommission: number;
  finalizedOrderCount: number;
  pipelineOrderCount: number;
}

export interface ShopEarningsBucketRow {
  label: string;
  start: string;
  end: string;
  finalizedSellerPayout: number;
  totalGmvFinalized: number;
  platformFeeFinalized: number;
  finalizedOrderCount: number;
}

export interface ShopEarningsPeriodTotals {
  finalizedSellerPayout: number;
  totalGmvFinalized: number;
  platformFeeFinalized: number;
  finalizedOrderCount: number;
}

export interface ShopEarningsBreakdownResponse {
  from: string;
  to: string;
  bucket: "month" | "week" | "day";
  periodTotals: ShopEarningsPeriodTotals;
  buckets: ShopEarningsBucketRow[];
}

export interface ShopEarningsOrdersQuery {
  from: string;
  to: string;
  page?: number;
  limit?: number;
}

/** Hàng GET /order/shop/earnings/by-farm */
export interface ShopEarningsFarmRow {
  farmId: string;
  farmName: string;
  shopId: string | null;
  shopName: string | null;
  finalizedSellerPayout: number;
  totalGmvFinalized: number;
  platformFeeFinalized: number;
  finalizedOrderCount: number;
  pipelineEstimatedPayout: number;
  pipelineOrderCount: number;
}

export interface ShopEarningsByFarmResponse {
  from: string | null;
  to: string | null;
  farms: ShopEarningsFarmRow[];
}

export interface CreateOrderResult extends Order {
  /** Chỉ có khi paymentMethod là payos và tạo link thành công */
  checkoutUrl?: string;
}

/** Trả về sau POST /payos/renew (giống cấu trúc create PayOS) */
export type PayosRenewResult = CreateOrderResult;

export interface PayosResumePayload {
  checkoutUrl?: string;
  qrCode?: string;
  payosStatus?: string;
}

export interface CreateOrderPayload {
  shopId: string;
  items: Array<{ productId: string; qty: number }>;
  shippingName: string;
  shippingPhone: string;
  /** Tự build từ detail+ward+district+province nếu không truyền. */
  shippingAddress?: string;
  shippingProvinceCode?: number | null;
  shippingDistrictCode?: number | null;
  shippingWardCode?: number | null;
  shippingProvinceName?: string;
  shippingDistrictName?: string;
  shippingWardName?: string;
  /** Số nhà / đường (không lặp tỉnh-quận-xã). */
  shippingDetail?: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface GetMyOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
