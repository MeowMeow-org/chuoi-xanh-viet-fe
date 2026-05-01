/**
 * Giải mã Google Polyline encoding (precision 5 — VietMap Route v3).
 * Trả về mảng [lng, lat] cho GeoJSON / MapLibre.
 * @see https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodeGooglePolylineToLngLat(
  encoded: string,
  precision = 5,
): [number, number][] {
  const trimmed = encoded.trim();
  if (!trimmed) return [];

  const coordinates: [number, number][] = [];
  let index = 0;
  const len = trimmed.length;
  let lat = 0;
  let lng = 0;
  const factor = 10 ** precision;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = trimmed.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = trimmed.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
}
