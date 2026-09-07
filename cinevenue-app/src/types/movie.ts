export interface Movie {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  languages: string[];
  formats: string[]; // 2D, 3D, IMAX, 4DX
  genres: string[];
  certification?: string; // U, UA, A
  releaseDate?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  rating?: number;
  votesCount?: number;
  status: 'NOW_SHOWING' | 'UPCOMING' | 'ARCHIVED';
  cast?: { name: string; role: string; avatarUrl?: string }[];
  crew?: { name: string; designation: string; avatarUrl?: string }[];
}

export interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  amenities?: string[];
  integrationType?: 'CINEVENUE_MANAGED' | 'EXTERNAL_API' | 'POS_INTEGRATION' | 'MANUAL';
  distanceKm?: number;
}

export interface ShowSchedule {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  screenName: string;
  startTime: string; // ISO or "7:30 PM"
  endTime?: string;
  date: string;
  pricePerSeat: number;
  format?: string;
  language?: string;
  availableSeatsCount?: number;
  totalSeatsCount?: number;
  fillingStatus?: 'AVAILABLE' | 'FILLING_FAST' | 'ALMOST_FULL' | 'SOLD_OUT';
}

export interface SeatInfo {
  id: string;
  seatNumber: string;
  row: string;
  column: number;
  tier: 'SILVER' | 'GOLD' | 'PREMIUM' | 'VIP' | 'RECLINER' | 'WHEELCHAIR';
  price: number;
  status: 'AVAILABLE' | 'SELECTED' | 'BLOCKED' | 'SOLD' | 'HELD';
}
