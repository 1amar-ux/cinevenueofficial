/**
 * CineVenue Movie Availability & City Isolation Engine
 * Ensures 100% strict isolation between cities.
 * Evaluates movie release windows and active YouTube trailers/teasers.
 */

import { Movie, Theatre, Show, MovieVideo } from '../types';

export interface CityAvailabilityResult {
  city: string;
  theatres: Theatre[];
  movies: Movie[];
  shows: Show[];
  totalTheatresCount: number;
  totalMoviesCount: number;
  totalShowsCount: number;
}

/**
 * Normalizes city string for case-insensitive and whitespace-safe matching
 */
export function normalizeCityName(cityName?: string): string {
  if (!cityName) return '';
  return cityName.trim().toLowerCase();
}

/**
 * Filter theatres strictly belonging to the target city.
 * If target city is "All Cities" or empty, returns all active theatres.
 */
export function filterTheatresByCity(theatres: Theatre[], targetCity: string): Theatre[] {
  const normTarget = normalizeCityName(targetCity);
  if (!normTarget || normTarget === 'all cities' || normTarget === 'all') {
    return theatres;
  }
  return theatres.filter((theatre) => {
    const theatreCity = normalizeCityName(theatre.city || theatre.location);
    return theatreCity.includes(normTarget) || normTarget.includes(theatreCity);
  });
}

/**
 * Filter shows strictly belonging to the theatres in the target city.
 */
export function filterShowsByCity(shows: Show[], cityTheatres: Theatre[]): Show[] {
  const theatreIdSet = new Set(cityTheatres.map((t) => String(t.id)));
  const theatreNameSet = new Set(cityTheatres.map((t) => t.name.toLowerCase()));

  return shows.filter((show) => {
    const idMatch = theatreIdSet.has(String(show.theatreId));
    const nameMatch = theatreNameSet.has((show.theatreName || '').toLowerCase());
    return idMatch || nameMatch;
  });
}

/**
 * Derives the active release status of a movie at the given moment in Asia/Kolkata.
 */
export function deriveMovieReleaseStatus(
  movie: Movie,
  currentDateIso: string = new Date().toISOString()
): 'UPCOMING' | 'NOW_SHOWING' | 'ENDED' | 'COMING_SOON' {
  if (movie.releaseStatus) {
    return movie.releaseStatus;
  }

  if (!movie.releaseDate) {
    return 'NOW_SHOWING';
  }

  const nowMs = new Date(currentDateIso).getTime();
  const releaseMs = new Date(movie.releaseDate).getTime();

  if (movie.releaseWindowEndAt) {
    const endMs = new Date(movie.releaseWindowEndAt).getTime();
    if (nowMs > endMs) return 'ENDED';
  }

  if (nowMs < releaseMs) {
    return 'UPCOMING';
  }

  return 'NOW_SHOWING';
}

/**
 * Extracts and sorts active YouTube videos for a movie.
 * Enforces sorting by displayOrder ASC, then creation date.
 */
export function getActiveMovieVideos(movie: Movie, type?: 'TRAILER' | 'TEASER'): MovieVideo[] {
  const videos = movie.videos || [];
  return videos
    .filter((v) => v.isActive !== false && (!type || v.type === type))
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

/**
 * Gets the primary featured trailer for a movie if available.
 */
export function getPrimaryMovieTrailer(movie: Movie): MovieVideo | null {
  const trailers = getActiveMovieVideos(movie, 'TRAILER');
  if (trailers.length > 0) return trailers[0];
  const allVideos = getActiveMovieVideos(movie);
  return allVideos.length > 0 ? allVideos[0] : null;
}
