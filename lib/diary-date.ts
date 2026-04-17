/**
 * `event_date` trong DB là kiểu DATE (chỉ ngày). API thường trả ISO kiểu
 * `2026-04-17T00:00:00.000Z`. Nếu gọi `toLocaleTimeString` theo giờ máy (VN)
 * sẽ luôn ra 07:00 — trông như “fix cứng” dù không phải.
 */
export function formatDiaryEventDateOnly(iso: string | Date): string {
  const s = typeof iso === "string" ? iso : iso.toISOString();
  const y = s.slice(0, 4);
  const mo = s.slice(5, 7);
  const d = s.slice(8, 10);
  if (
    y.length === 4 &&
    mo.length === 2 &&
    d.length === 2 &&
    /^\d+$/.test(y + mo + d)
  ) {
    return `${Number(d)}/${Number(mo)}/${y}`;
  }
  return new Date(iso).toLocaleDateString("vi-VN", { timeZone: "UTC" });
}

/** Thời điểm thật khi bản ghi được lưu (UTC ISO → giờ máy người xem). */
export function formatDiaryRecordedAt(iso: string | Date): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
