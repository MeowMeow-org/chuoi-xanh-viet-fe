/** Hiển thị ISO datetime dạng `HH:mm dd/mm/yyyy` (phần giờ lấy 5 ký tự đầu sau T). */
export function formatDateTimeVN(iso: string) {
  const [date, timeWithZone] = iso.split("T");
  const [year, month, day] = date.split("-");
  const time = (timeWithZone ?? "").slice(0, 5);
  return `${time} ${day}/${month}/${year}`;
}
