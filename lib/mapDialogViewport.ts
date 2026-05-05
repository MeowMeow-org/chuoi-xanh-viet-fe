/**
 * Khung bản đồ trong dialog chi tiết sản phẩm (xem đích / chỉ đường VietMap / iframe Google).
 * Một class để hai chế độ có cùng kích thước.
 */
export const MAP_DIALOG_VIEWPORT_CLASS =
  "relative h-[min(58vh,520px)] min-h-[300px] w-full shrink-0 overflow-hidden rounded-lg border border-[hsl(142,18%,88%)] bg-muted";

/**
 * Dialog vị trí trại (chi tiết sản phẩm): cùng kích thước cho xem ghim và chỉ đường.
 * Chiều cao đủ lớn nhưng vẫn chừa chỗ cho header + nút trong cùng khung nhìn.
 */
export const PRODUCT_FARM_MAP_VIEWPORT_CLASS =
  "relative w-full h-[min(60vh,560px)] min-h-[320px] shrink-0 overflow-hidden rounded-lg border border-[hsl(142,18%,88%)] bg-muted";
