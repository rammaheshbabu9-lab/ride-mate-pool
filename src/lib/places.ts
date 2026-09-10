/**
 * Lightweight offline place directory for the MVP.
 *
 * This is intentionally a pluggable module: swap `searchPlaces` for a
 * Google Places / Mapbox geocoding call later without touching the UI.
 */
export type Place = {
  name: string;
  city: string;
  lat: number;
  lng: number;
};

export const PLACES: Place[] = [
  { name: "Vijayanagar", city: "Bengaluru", lat: 12.9719, lng: 77.5376 },
  { name: "Hebbal", city: "Bengaluru", lat: 13.0358, lng: 77.597 },
  { name: "Koramangala", city: "Bengaluru", lat: 12.9352, lng: 77.6245 },
  { name: "Indiranagar", city: "Bengaluru", lat: 12.9784, lng: 77.6408 },
  { name: "Whitefield", city: "Bengaluru", lat: 12.9698, lng: 77.7499 },
  { name: "HSR Layout", city: "Bengaluru", lat: 12.9121, lng: 77.6446 },
  { name: "Majestic Bus Stand", city: "Bengaluru", lat: 12.9774, lng: 77.5713 },
  { name: "Electronic City", city: "Bengaluru", lat: 12.8452, lng: 77.6602 },
  { name: "Kempegowda Airport", city: "Bengaluru", lat: 13.1986, lng: 77.7066 },
  { name: "Connaught Place", city: "Delhi", lat: 28.6315, lng: 77.2167 },
  { name: "Saket", city: "Delhi", lat: 28.5245, lng: 77.2066 },
  { name: "Dwarka Sector 21", city: "Delhi", lat: 28.5522, lng: 77.0583 },
  { name: "Noida Sector 62", city: "Delhi", lat: 28.6274, lng: 77.3648 },
  { name: "Andheri East", city: "Mumbai", lat: 19.1136, lng: 72.8697 },
  { name: "Bandra West", city: "Mumbai", lat: 19.0596, lng: 72.8295 },
  { name: "Powai", city: "Mumbai", lat: 19.1176, lng: 72.906 },
  { name: "Dadar", city: "Mumbai", lat: 19.0176, lng: 72.8562 },
  { name: "Hitec City", city: "Hyderabad", lat: 17.4435, lng: 78.3772 },
  { name: "Gachibowli", city: "Hyderabad", lat: 17.4401, lng: 78.3489 },
  { name: "Secunderabad", city: "Hyderabad", lat: 17.4399, lng: 78.4983 },
  { name: "T Nagar", city: "Chennai", lat: 13.0418, lng: 80.2341 },
  { name: "Velachery", city: "Chennai", lat: 12.9755, lng: 80.2207 },
  { name: "Anna Nagar", city: "Chennai", lat: 13.0878, lng: 80.2101 },
  { name: "Salt Lake Sector V", city: "Kolkata", lat: 22.5697, lng: 88.4324 },
  { name: "Howrah Station", city: "Kolkata", lat: 22.5839, lng: 88.3425 },
  { name: "Kothrud", city: "Pune", lat: 18.5074, lng: 73.8077 },
  { name: "Hinjewadi", city: "Pune", lat: 18.5913, lng: 73.7389 },
];

export const CITIES = Array.from(new Set(PLACES.map((p) => p.city))).sort();

export function searchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return PLACES.slice(0, limit);
  return PLACES.filter(
    (p) => p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q),
  ).slice(0, limit);
}

/** Nearest known area to a coordinate — used to label the GPS position. */
export function nearestPlace(lat: number, lng: number): Place {
  let best = PLACES[0]!;
  let bestD = Number.POSITIVE_INFINITY;
  for (const p of PLACES) {
    const d = haversineKm(lat, lng, p.lat, p.lng);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
