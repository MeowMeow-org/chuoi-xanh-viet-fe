/** Hiển thị ISO datetime dạng `HH:mm dd/mm/yyyy` (phần giờ lấy 5 ký tự đầu sau T). */
export function formatDateTimeVN(iso: string) {
  const [date, timeWithZone] = iso.split("T");
  const [year, month, day] = date.split("-");
  const time = (timeWithZone ?? "").slice(0, 5);
  return `${time} ${day}/${month}/${year}`;
}

/** Thời gian tương đối ngắn (VD: "Vừa xong", "3 giờ", "2 ngày") — dùng UI thông báo. */
export function formatRelativeTimeVN(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 60) return "Vừa xong";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} ngày trước`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week} tuần trước`;
  return formatDateTimeVN(iso);
}
