/**
 * BE (shop.service khi tạo SP từ lô) nối cuối mô tả:
 * `\n\n📍 Địa chỉ: …` và `\n\n🔗 Truy xuất lô: …`
 * — trang chi tiết đã hiển thị địa chỉ + QR riêng, cần gỡ để không lặp.
 */
export function stripSaleUnitAppendedDescription(
  text: string | null | undefined,
): string {
  if (text == null || text === "") return "";
  let s = text.trimEnd();
  s = s.replace(/\n\s*\n(?:📍\s*)?Địa chỉ:\s[\s\S]*$/u, "");
  s = s.replace(/\n\s*\n🔗\s*Truy xuất lô:\s[\s\S]*$/u, "");
  s = s.replace(/\n\s*\nTruy xuất lô:\s*https?:\/\/\S[\s\S]*$/iu, "");
  return s.trimEnd();
}
