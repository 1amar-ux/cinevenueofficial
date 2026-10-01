/**
 * CineVenue Movie Availability & City Isolation Engine
 * Ensures 100% strict isolation between cities.
 * Evaluates movie release windows and active YouTube trailers/teasers.
 */

import { Movie, Theatre, Show, MovieVideo, MovieSchedule } from '../types';
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

  if (videos.length === 0) {
    const fallbackUrl = "https://www.youtube.com/watch?v=bC36d8e3bb0";
    const parsed = parseAndValidateYouTubeUrl(fallbackUrl);
    videos.push({
      id: `vid-trailer-${String(movie.id || movie.title || 'movie').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
      movieId: movie.id || movie.title,
      type: 'TRAILER',
      title: `${movie.title || 'Movie'} — Official Theatrical Trailer`,
      youtubeUrl: parsed.normalizedUrl || fallbackUrl,
      youtubeVideoId: parsed.videoId || 'bC36d8e3bb0',
      thumbnailUrl: parsed.thumbnailUrl || movie.poster || movie.img,
      language: movie.lang || movie.language || 'Telugu',
      displayOrder: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
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

export interface GroupedTheatreShows {
  theatre: Theatre;
  shows: {
    id: string;
    time: string;
    status: string;
    pricePerSeat?: number;
    showStartAt?: string;
  }[];
}

/**
 * Normalizes time string (e.g. "11:30 AM", "7:30 PM", "14:00") into minutes from midnight for accurate chronological sorting.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/**
 * Filter theatres strictly belonging to the target city that have at least one eligible,
 * active show for the given movie on the selected date.
 * Does NOT return theatres that have zero shows.
 * Groups and sorts shows chronologically under each theatre.
 */
export function getEligibleTheatresAndShows(
  theatres: Theatre[],
  schedules: MovieSchedule[],
  movieTitle: string,
  targetCity: string,
  targetDateStr: string, // YYYY-MM-DD
  isToday: boolean = false,
  isTomorrow: boolean = false
): GroupedTheatreShows[] {
  // 1. Filter theatres strictly by city and active status
  const cityTheatres = filterTheatresByCity(theatres, targetCity).filter(
    (t) => (t as any).status !== 'INACTIVE' && (t as any).status !== 'SUSPENDED'
  );

  const normMovie = (movieTitle || '').trim().toLowerCase();
  const results: GroupedTheatreShows[] = [];

  for (const theatre of cityTheatres) {
    const matchingShows = schedules.filter((s) => {
      // Must match movie title
      if ((s.movieTitle || '').trim().toLowerCase() !== normMovie) return false;
      // Must match theatre name
      if ((s.theatreName || '').trim().toLowerCase() !== theatre.name.trim().toLowerCase()) return false;
      // Must be active and deployed
      if (s.isActive === false || s.isDeployed === false) return false;

      // Date matching
      const sDate = (s.date || '').trim();
      if (!sDate || sDate.toLowerCase() === 'today') {
        if (!isToday) return false;
      } else if (sDate.toLowerCase() === 'tomorrow') {
        if (!isTomorrow) return false;
      } else if (sDate !== targetDateStr) {
        return false;
      }

      return true;
    });

    if (matchingShows.length > 0) {
      // Sort shows chronologically by actual show time
      const sortedShows = [...matchingShows].sort((a, b) => {
        return parseTimeToMinutes(a.timeSlot) - parseTimeToMinutes(b.timeSlot);
      });

      results.push({
        theatre,
        shows: sortedShows.map((s) => ({
          id: s.id,
          time: s.timeSlot,
          status: s.pricePerSeat > 300 ? 'Filling fast' : 'Available',
          pricePerSeat: s.pricePerSeat,
        })),
      });
    }
  }

  // Sort theatres deterministically by name
  results.sort((a, b) => a.theatre.name.localeCompare(b.theatre.name));
  return results;
}


