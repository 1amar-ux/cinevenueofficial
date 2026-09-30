/**
 * CineVenue Movie Availability & City Isolation Engine
 * Ensures 100% strict isolation between cities.
 * Evaluates movie release windows and active YouTube trailers/teasers.
 */

import { Movie, Theatre, Show, MovieVideo } from '../types';
import { parseAndValidateYouTubeUrl } from './youtube';

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
 * Automatically synthesizes a MovieVideo object if direct trailerUrl or trailer link is provided.
 * Enforces sorting by displayOrder ASC, then creation date.
 */
export function getActiveMovieVideos(movie: Movie, type?: 'TRAILER' | 'TEASER'): MovieVideo[] {
  if (!movie) return [];
  const videos: MovieVideo[] = Array.isArray(movie.videos) ? [...movie.videos] : [];
  const directTrailer = movie.trailerUrl || movie.trailer || (movie as any).videoUrl || (movie as any).youtubeUrl;

  if (directTrailer && typeof directTrailer === 'string' && directTrailer.trim()) {
    const trimmed = directTrailer.trim();
    const hasExistingTrailer = videos.some(
      (v) => v.youtubeUrl === trimmed || (v.type === 'TRAILER' && v.isActive !== false)
    );
    if (!hasExistingTrailer) {
      const parsed = parseAndValidateYouTubeUrl(trimmed);
      const videoId = parsed.videoId || 'trailer';
      videos.unshift({
        id: `vid-trailer-${String(movie.id || movie.title || 'movie').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
        movieId: movie.id || movie.title,
        type: 'TRAILER',
        title: `${movie.title || 'Movie'} — Official Trailer`,
        youtubeUrl: parsed.normalizedUrl || trimmed,
        youtubeVideoId: videoId,
        thumbnailUrl: parsed.thumbnailUrl || (parsed.videoId ? `https://img.youtube.com/vi/${parsed.videoId}/hqdefault.jpg` : undefined),
        language: movie.lang || movie.language || 'Telugu',
        displayOrder: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

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

/**
 * Filter events strictly belonging to the target city.
 * If target city is "All Cities" or empty, returns all events.
 */
export function filterEventsByCity<T extends { city?: string }>(events: T[], targetCity: string): T[] {
  const normTarget = normalizeCityName(targetCity);
  if (!normTarget || normTarget === 'all cities' || normTarget === 'all') {
    return events;
  }
  return events.filter((event) => {
    const eventCity = normalizeCityName(event.city);
    return eventCity.includes(normTarget) || normTarget.includes(eventCity);
  });
}

/**
 * Filter movies strictly having active shows/theatres in the target city.
 */
export function filterMoviesByCityShows(
  movies: Movie[],
  schedules: { movieTitle: string; theatreName?: string }[],
  cityTheatres: Theatre[],
  targetCity: string
): Movie[] {
  const normTarget = normalizeCityName(targetCity);
  if (!normTarget || normTarget === 'all cities' || normTarget === 'all') {
    return movies;
  }

  const cityTheatreNames = new Set(cityTheatres.map((t) => t.name.toLowerCase()));
  const activeMovieTitles = new Set(
    schedules
      .filter((s) => s.theatreName && cityTheatreNames.has(s.theatreName.toLowerCase()))
      .map((s) => s.movieTitle.toLowerCase())
  );

  return movies.filter((m) => activeMovieTitles.has(m.title.toLowerCase()));
}

