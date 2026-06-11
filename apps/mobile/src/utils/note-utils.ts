// Utility to extract phone numbers from text
export const extractPhoneNumber = (text: string): string | null => {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
};

// Utility to create GeoJSON point for SpatiaLite
export const createGeoJSONPoint = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): string => {
  // return `Point(${longitude} ${latitude})`;
  return `{"type":"Point","coordinates":[${longitude},${latitude}]}`;
};

// Utility to format distance in km or meters
export const formatKillometers = (distanceKm?: number | null): string => {
  // Guard against invalid inputs (null/undefined/NaN/Infinity)
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) {
    return "";
  }

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  } else {
    const km = Math.round(distanceKm * 10) / 10; // Round to 1 decimal
    return `${km} km`;
  }
};





