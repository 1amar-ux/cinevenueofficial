import { UserLocation } from '../types';

export const CITIES_DATA: Record<string, { lat: number; lng: number }> = {
  "All Cities": { lat: 20.5937, lng: 78.9629 }, // Center of India
  "Vijayawada": { lat: 16.5062, lng: 80.6480 },
  "Guntur": { lat: 16.3067, lng: 80.4365 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Visakhapatnam": { lat: 17.6868, lng: 83.2185 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Bengaluru": { lat: 12.9716, lng: 77.5946 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Delhi": { lat: 28.7041, lng: 77.1025 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 }
};

export const ALIASES: Record<string, string> = {
  "bezawada": "Vijayawada",
  "vizag": "Visakhapatnam",
  "bengaluru": "Bengaluru",
  "bangalore": "Bengaluru",
  "bombay": "Mumbai",
  "madras": "Chennai"
};

// Haversine formula to calculate distance between two points on the earth
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export function findNearestCity(lat: number, lng: number): string {
  let nearestCity = "Hyderabad";
  let minDistance = Infinity;

  Object.entries(CITIES_DATA).forEach(([city, coords]) => {
    if (city === "All Cities") return;
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  return nearestCity;
}

export function getCoordinates(city: string): { lat: number; lng: number } {
  const normCity = ALIASES[city.toLowerCase()] || city;
  return CITIES_DATA[normCity] || CITIES_DATA["Hyderabad"];
}
