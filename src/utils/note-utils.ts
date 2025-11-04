// Utility to extract phone numbers from text
export const extractPhoneNumber = (text: string): string | null => {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
};

// Utility to create GeoJSON point for SpatiaLite
export const createGeoJSONPoint = (latitude: number, longitude: number): string => {
  return JSON.stringify({
    type: "Point",
    coordinates: [longitude, latitude], // GeoJSON uses [lng, lat] order
  });
};

// Calculate distance between two points in meters using Haversine formula
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Format distance for display
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
};

// Parse GeoJSON location
export const parseGeoJSONLocation = (
  location: any
): { lat: number; lng: number } | null => {
  try {
    const geoJson = typeof location === "string" ? JSON.parse(location) : location;
    if (geoJson.type === "Point" && Array.isArray(geoJson.coordinates)) {
      return {
        lng: geoJson.coordinates[0],
        lat: geoJson.coordinates[1],
      };
    }
  } catch (error) {
    console.error("Error parsing GeoJSON location:", error);
  }
  return null;
};
