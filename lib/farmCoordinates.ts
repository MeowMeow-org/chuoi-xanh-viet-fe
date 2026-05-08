/** Bbox Việt Nam — cùng ý tưởng với ProductFarmLocationDialog (routing / GPS trại). */
const VN_LAT_MIN = 8;
const VN_LAT_MAX = 24;
const VN_LNG_MIN = 102;
const VN_LNG_MAX = 110;

/** Tọa độ dùng được khi lưu nông trại (tránh 0,0 và điểm ngoài VN). */
export function isValidFarmGpsPair(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return (
    lat >= VN_LAT_MIN &&
    lat <= VN_LAT_MAX &&
    lng >= VN_LNG_MIN &&
    lng <= VN_LNG_MAX
  );
}
