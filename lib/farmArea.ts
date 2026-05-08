/** Quy đổi diện tích nông trại — lưu DB theo hecta (ha). 1 ha = 10_000 m² */

export type FarmAreaUnit = "m2" | "ha";

const M2_PER_HA = 10_000;

/** Chuỗi hiển thị trong ô nhập khi đơn vị là ha (bỏ số 0 thừa) */
export function formatHaInputValue(ha: number): string {
  if (!Number.isFinite(ha) || ha < 0) return "";
  const s = ha.toFixed(8).replace(/\.?0+$/, "");
  return s;
}

/**
 * Parse ô nhập + đơn vị → số ha để gửi API (luôn dương hoặc null nếu để trống).
 */
export function parseAreaInputToHa(
  raw: string,
  unit: FarmAreaUnit,
): { ha: number | undefined; error?: string } {
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return { ha: undefined };
  const n = Number(t);
  if (Number.isNaN(n)) return { ha: undefined, error: "Diện tích phải là số hợp lệ" };
  if (n <= 0) return { ha: undefined, error: "Diện tích phải lớn hơn 0" };
  if (unit === "m2") {
    return { ha: n / M2_PER_HA };
  }
  return { ha: n };
}

/** Đổi đơn vị hiển thị: giữ nguyên diện tích thực, đổi số trong ô */
export function convertAreaDisplayValue(
  raw: string,
  from: FarmAreaUnit,
  to: FarmAreaUnit,
): string {
  if (from === to) return raw;
  const t = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!t) return "";
  const n = Number(t);
  if (Number.isNaN(n)) return raw;
  if (from === "ha" && to === "m2") {
    return String(Math.round(n * M2_PER_HA));
  }
  if (from === "m2" && to === "ha") {
    return formatHaInputValue(n / M2_PER_HA);
  }
  return raw;
}
