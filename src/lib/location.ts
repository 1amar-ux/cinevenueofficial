import { UserLocation } from '../types';

export interface CityInfo {
  name: string;
  state: string;
  isPopular: boolean;
  landmark: string;
  iconType: 'charminar' | 'gateway' | 'vidhana' | 'indiagate' | 'beach' | 'temple' | 'bridge' | 'building' | 'city';
  lat: number;
  lng: number;
  localities: string[];
  slug: string;
}

export const POPULAR_CITIES: CityInfo[] = [
  {
    name: "Hyderabad",
    state: "Telangana",
    isPopular: true,
    landmark: "Charminar & HITEC City",
    iconType: "charminar",
    lat: 17.3850,
    lng: 78.4867,
    localities: ["Kukatpally", "Banjara Hills", "Gachibowli", "Hitec City", "Madhapur", "Secunderabad", "Jubilee Hills", "Tank Bund", "Ameerpet"],
    slug: "hyderabad"
  },
  {
    name: "Mumbai",
    state: "Maharashtra",
    isPopular: true,
    landmark: "Gateway of India & Bandra",
    iconType: "gateway",
    lat: 19.0760,
    lng: 72.8777,
    localities: ["Bandra", "Andheri", "Juhu", "Colaba", "Powai", "Lower Parel", "Borivali", "Goregaon", "Thane", "Navi Mumbai"],
    slug: "mumbai"
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    isPopular: true,
    landmark: "Vidhana Soudha & Silicon Hub",
    iconType: "vidhana",
    lat: 12.9716,
    lng: 77.5946,
    localities: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "Electronic City", "Jayanagar", "MG Road", "Malleshwaram"],
    slug: "bengaluru"
  },
  {
    name: "Delhi-NCR",
    state: "Delhi",
    isPopular: true,
    landmark: "India Gate & Connaught Place",
    iconType: "indiagate",
    lat: 28.7041,
    lng: 77.1025,
    localities: ["Connaught Place", "Saket", "Noida", "Gurugram", "Vasant Kunj", "Dwarka", "Hauz Khas", "Lajpat Nagar", "Karol Bagh"],
    slug: "delhi-ncr"
  },
  {
    name: "Chennai",
    state: "Tamil Nadu",
    isPopular: true,
    landmark: "Marina Beach & Central",
    iconType: "beach",
    lat: 13.0827,
    lng: 80.2707,
    localities: ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "Mylapore", "Nungambakkam", "OMR", "Royapettah", "Alwarpet"],
    slug: "chennai"
  },
  {
    name: "Vijayawada",
    state: "Andhra Pradesh",
    isPopular: true,
    landmark: "Prakasam Barrage & Kanaka Durga",
    iconType: "temple",
    lat: 16.5062,
    lng: 80.6480,
    localities: ["MG Road", "Trendset Mall", "Benz Circle", "Governorpet", "Bhavanipuram", "One Town", "Gunadala", "Poranki"],
    slug: "vijayawada"
  },
  {
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    isPopular: true,
    landmark: "RK Beach & Dolphin's Nose",
    iconType: "beach",
    lat: 17.6868,
    lng: 83.2185,
    localities: ["Beach Road", "Siripuram", "MVP Colony", "Gajuwaka", "Dwaraka Nagar", "Madhurawada", "Rushikonda"],
    slug: "visakhapatnam"
  },
  {
    name: "Guntur",
    state: "Andhra Pradesh",
    isPopular: true,
    landmark: "Lakshmipuram & Amaravati Hub",
    iconType: "city",
    lat: 16.3067,
    lng: 80.4365,
    localities: ["Lakshmipuram", "Brodipet", "Arundelpet", "Kothapet", "Nallapadu", "Vidya Nagar", "Pattabhipuram"],
    slug: "guntur"
  },
  {
    name: "Pune",
    state: "Maharashtra",
    isPopular: true,
    landmark: "Shaniwar Wada & Koregaon Park",
    iconType: "building",
    lat: 18.5204,
    lng: 73.8567,
    localities: ["Koregaon Park", "Viman Nagar", "Kothrud", "Baner", "Hinjewadi", "Aundh", "FC Road", "Hadapsar"],
    slug: "pune"
  },
  {
    name: "Kolkata",
    state: "West Bengal",
    isPopular: true,
    landmark: "Howrah Bridge & Victoria Memorial",
    iconType: "bridge",
    lat: 22.5726,
    lng: 88.3639,
    localities: ["Park Street", "Salt Lake", "New Town", "Ballygunge", "Alipore", "Dum Dum", "Gariahat", "Howrah"],
    slug: "kolkata"
  },
  {
    name: "Kochi",
    state: "Kerala",
    isPopular: true,
    landmark: "Marine Drive & Fort Kochi",
    iconType: "beach",
    lat: 9.9312,
    lng: 76.2673,
    localities: ["Marine Drive", "Fort Kochi", "Edappally", "Kakkanad", "MG Road", "Palarivattom", "Vyttila"],
    slug: "kochi"
  },
  {
    name: "Ahmedabad",
    state: "Gujarat",
    isPopular: true,
    landmark: "Sabarmati Riverfront & Atal Bridge",
    iconType: "bridge",
    lat: 23.0225,
    lng: 72.5714,
    localities: ["SG Highway", "Vastrapur", "Prahlad Nagar", "Bodakdev", "Maninagar", "Navrangpura", "Satellite"],
    slug: "ahmedabad"
  },
  {
    name: "Chandigarh",
    state: "Punjab / Haryana",
    isPopular: true,
    landmark: "Rock Garden & Sukhna Lake",
    iconType: "building",
    lat: 30.7333,
    lng: 76.7794,
    localities: ["Sector 17", "Sector 35", "Sector 22", "Elante Mall", "Mohali", "Panchkula", "Zirakpur"],
    slug: "chandigarh"
  }
];

export const ALL_INDIAN_CITIES: { name: string; state: string; slug: string }[] = [
  { name: "Agra", state: "Uttar Pradesh", slug: "agra" },
  { name: "Ahmedabad", state: "Gujarat", slug: "ahmedabad" },
  { name: "Ajmer", state: "Rajasthan", slug: "ajmer" },
  { name: "Aligarh", state: "Uttar Pradesh", slug: "aligarh" },
  { name: "Allahabad (Prayagraj)", state: "Uttar Pradesh", slug: "prayagraj" },
  { name: "Amravati", state: "Maharashtra", slug: "amravati" },
  { name: "Amritsar", state: "Punjab", slug: "amritsar" },
  { name: "Anantapur", state: "Andhra Pradesh", slug: "anantapur" },
  { name: "Asansol", state: "West Bengal", slug: "asansol" },
  { name: "Aurangabad", state: "Maharashtra", slug: "aurangabad" },
  { name: "Bareilly", state: "Uttar Pradesh", slug: "bareilly" },
  { name: "Belgaum", state: "Karnataka", slug: "belgaum" },
  { name: "Bengaluru", state: "Karnataka", slug: "bengaluru" },
  { name: "Bhopal", state: "Madhya Pradesh", slug: "bhopal" },
  { name: "Bhubaneswar", state: "Odisha", slug: "bhubaneswar" },
  { name: "Bikaner", state: "Rajasthan", slug: "bikaner" },
  { name: "Chandigarh", state: "Punjab", slug: "chandigarh" },
  { name: "Chennai", state: "Tamil Nadu", slug: "chennai" },
  { name: "Coimbatore", state: "Tamil Nadu", slug: "coimbatore" },
  { name: "Cuttack", state: "Odisha", slug: "cuttack" },
  { name: "Dehradun", state: "Uttarakhand", slug: "dehradun" },
  { name: "Delhi-NCR", state: "Delhi", slug: "delhi-ncr" },
  { name: "Dhanbad", state: "Jharkhand", slug: "dhanbad" },
  { name: "Durgapur", state: "West Bengal", slug: "durgapur" },
  { name: "Faridabad", state: "Haryana", slug: "faridabad" },
  { name: "Ghaziabad", state: "Uttar Pradesh", slug: "ghaziabad" },
  { name: "Gorakhpur", state: "Uttar Pradesh", slug: "gorakhpur" },
  { name: "Guntur", state: "Andhra Pradesh", slug: "guntur" },
  { name: "Gurugram", state: "Haryana", slug: "gurugram" },
  { name: "Guwahati", state: "Assam", slug: "guwahati" },
  { name: "Gwalior", state: "Madhya Pradesh", slug: "gwalior" },
  { name: "Hubli-Dharwad", state: "Karnataka", slug: "hubli" },
  { name: "Hyderabad", state: "Telangana", slug: "hyderabad" },
  { name: "Indore", state: "Madhya Pradesh", slug: "indore" },
  { name: "Jabalpur", state: "Madhya Pradesh", slug: "jabalpur" },
  { name: "Jaipur", state: "Rajasthan", slug: "jaipur" },
  { name: "Jalandhar", state: "Punjab", slug: "jalandhar" },
  { name: "Jamshedpur", state: "Jharkhand", slug: "jamshedpur" },
  { name: "Jodhpur", state: "Rajasthan", slug: "jodhpur" },
  { name: "Kakinada", state: "Andhra Pradesh", slug: "kakinada" },
  { name: "Kannur", state: "Kerala", slug: "kannur" },
  { name: "Kanpur", state: "Uttar Pradesh", slug: "kanpur" },
  { name: "Kochi", state: "Kerala", slug: "kochi" },
  { name: "Kolkata", state: "West Bengal", slug: "kolkata" },
  { name: "Kollam", state: "Kerala", slug: "kollam" },
  { name: "Kota", state: "Rajasthan", slug: "kota" },
  { name: "Kozhikode", state: "Kerala", slug: "kozhikode" },
  { name: "Kurnool", state: "Andhra Pradesh", slug: "kurnool" },
  { name: "Lucknow", state: "Uttar Pradesh", slug: "lucknow" },
  { name: "Ludhiana", state: "Punjab", slug: "ludhiana" },
  { name: "Madurai", state: "Tamil Nadu", slug: "madurai" },
  { name: "Mangalore", state: "Karnataka", slug: "mangalore" },
  { name: "Meerut", state: "Uttar Pradesh", slug: "meerut" },
  { name: "Moradabad", state: "Uttar Pradesh", slug: "moradabad" },
  { name: "Mumbai", state: "Maharashtra", slug: "mumbai" },
  { name: "Mysuru (Mysore)", state: "Karnataka", slug: "mysore" },
  { name: "Nagpur", state: "Maharashtra", slug: "nagpur" },
  { name: "Nanded", state: "Maharashtra", slug: "nanded" },
  { name: "Nashik", state: "Maharashtra", slug: "nashik" },
  { name: "Nellore", state: "Andhra Pradesh", slug: "nellore" },
  { name: "Noida", state: "Uttar Pradesh", slug: "noida" },
  { name: "Patna", state: "Bihar", slug: "patna" },
  { name: "Pondicherry", state: "Puducherry", slug: "pondicherry" },
  { name: "Pune", state: "Maharashtra", slug: "pune" },
  { name: "Raipur", state: "Chhattisgarh", slug: "raipur" },
  { name: "Rajahmundry", state: "Andhra Pradesh", slug: "rajahmundry" },
  { name: "Rajkot", state: "Gujarat", slug: "rajkot" },
  { name: "Ranchi", state: "Jharkhand", slug: "ranchi" },
  { name: "Rourkela", state: "Odisha", slug: "rourkela" },
  { name: "Salem", state: "Tamil Nadu", slug: "salem" },
  { name: "Siliguri", state: "West Bengal", slug: "siliguri" },
  { name: "Solapur", state: "Maharashtra", slug: "solapur" },
  { name: "Srinagar", state: "Jammu and Kashmir", slug: "srinagar" },
  { name: "Surat", state: "Gujarat", slug: "surat" },
  { name: "Thane", state: "Maharashtra", slug: "thane" },
  { name: "Thiruvananthapuram", state: "Kerala", slug: "thiruvananthapuram" },
  { name: "Thrissur", state: "Kerala", slug: "thrissur" },
  { name: "Tiruchirappalli (Trichy)", state: "Tamil Nadu", slug: "trichy" },
  { name: "Tirunelveli", state: "Tamil Nadu", slug: "tirunelveli" },
  { name: "Tirupati", state: "Andhra Pradesh", slug: "tirupati" },
  { name: "Udaipur", state: "Rajasthan", slug: "udaipur" },
  { name: "Ujjain", state: "Madhya Pradesh", slug: "ujjain" },
  { name: "Vadodara", state: "Gujarat", slug: "vadodara" },
  { name: "Varanasi", state: "Uttar Pradesh", slug: "varanasi" },
  { name: "Vellore", state: "Tamil Nadu", slug: "vellore" },
  { name: "Vijayawada", state: "Andhra Pradesh", slug: "vijayawada" },
  { name: "Visakhapatnam", state: "Andhra Pradesh", slug: "visakhapatnam" },
  { name: "Warangal", state: "Telangana", slug: "warangal" }
];

export const CITIES_DATA: Record<string, { lat: number; lng: number }> = {
  "All Cities": { lat: 20.5937, lng: 78.9629 },
  ...Object.fromEntries(POPULAR_CITIES.map(c => [c.name, { lat: c.lat, lng: c.lng }])),
  "Delhi": { lat: 28.7041, lng: 77.1025 },
  "Gurugram": { lat: 28.4595, lng: 77.0266 },
  "Noida": { lat: 28.5355, lng: 77.3910 },
  "Tirupati": { lat: 13.6288, lng: 79.4192 },
  "Warangal": { lat: 17.9689, lng: 79.5941 }
};

export const ALIASES: Record<string, string> = {
  "bezawada": "Vijayawada",
  "vizag": "Visakhapatnam",
  "bengaluru": "Bengaluru",
  "bangalore": "Bengaluru",
  "bombay": "Mumbai",
  "madras": "Chennai",
  "delhi": "Delhi-NCR",
  "ncr": "Delhi-NCR",
  "new delhi": "Delhi-NCR",
  "gurgaon": "Delhi-NCR",
  "calcutta": "Kolkata",
  "cochin": "Kochi",
  "trivandrum": "Thiruvananthapuram",
  "mysore": "Mysuru (Mysore)",
  "trichy": "Tiruchirappalli (Trichy)",
  "prayagraj": "Allahabad (Prayagraj)"
};

// Haversine formula to calculate distance between two points on the earth in km
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
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Finds the nearest supported CineVenue hub from GPS coordinates
 */
export function findNearestCity(lat: number, lng: number): CityInfo {
  let nearest = POPULAR_CITIES[0];
  let minDistance = Infinity;

  POPULAR_CITIES.forEach((city) => {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  });

  return nearest;
}

export function getCoordinates(city: string): { lat: number; lng: number } {
  const normCity = ALIASES[city.toLowerCase()] || city;
  return CITIES_DATA[normCity] || CITIES_DATA["Hyderabad"];
}
