/**
 * Decodes an encoded polyline string (Google / OpenRouteService format)
 * into an array of [latitude, longitude] pairs.
 * 
 * @param {string} encoded - The encoded polyline string
 * @param {number} precision - Decimal precision (default 5 for OpenRouteService/Google)
 * @returns {Array<[number, number]>} Array of [lat, lng] coordinates
 */
export function decodePolyline(encoded, precision = 5) {
  if (!encoded || typeof encoded !== 'string') {
    return [];
  }

  const factor = Math.pow(10, precision);
  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let byte = null;
    let shift = 0;
    let result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
}

export default decodePolyline;
