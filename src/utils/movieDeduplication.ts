import { Movie } from "../types";

/**
 * Normalizes movie titles for duplicate detection (lowercase, trim, stripped of punctuation).
 */
export function normalizeMovieTitle(title?: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Checks if a movie record is a dummy, mock, or invalid placeholder entry.
 */
export function isMockOrDuplicateMovie(movie?: Partial<Movie> | null): boolean {
  if (!movie) return true;
  const rawTitle = (movie.title || "").trim();
  if (!rawTitle) return true;

  const lower = rawTitle.toLowerCase();
  if (
    lower === "example" ||
    lower.startsWith("example") ||
    lower.startsWith("test movie") ||
    lower.startsWith("sample movie") ||
    lower === "dummy" ||
    lower === "movie title" ||
    lower.includes("placeholder")
  ) {
    return true;
  }

  return false;
}

/**
 * Intelligently merges two movie records representing the same film,
 * retaining the richest metadata (cast, crew, high-res posters, reviews, formats).
 */
export function mergeMovieDetails(base: Movie, incoming: Movie): Movie {
  // Prefer descriptive poster/banner over generic fallback
  const poster =
    incoming.poster && !incoming.poster.includes("placeholder")
      ? incoming.poster
      : base.poster || base.img || incoming.img || "";

  const banner =
    incoming.banner && !incoming.banner.includes("placeholder")
      ? incoming.banner
      : base.banner || incoming.poster || base.poster || "";

  const img = poster || base.img || incoming.img || "";

  // Cast members: retain richest list
  const castMembers =
    Array.isArray(incoming.castMembers) && incoming.castMembers.length > (base.castMembers?.length || 0)
      ? incoming.castMembers
      : base.castMembers || incoming.castMembers;

  const crewMembers =
    Array.isArray(incoming.crewMembers) && incoming.crewMembers.length > (base.crewMembers?.length || 0)
      ? incoming.crewMembers
      : base.crewMembers || incoming.crewMembers;

  // Formats: union of unique formats
  const rawFormats = [...(base.formats || []), ...(incoming.formats || [])];
  const formats = Array.from(new Set(rawFormats.filter(Boolean)));

  // Additional Languages: union of unique languages
  const rawLangs = [
    ...(base.additionalLanguages || []),
    ...(incoming.additionalLanguages || [])
  ];
  const additionalLanguages = Array.from(
    new Set(rawLangs.filter((l) => l && l.toLowerCase() !== (base.lang || incoming.lang || "").toLowerCase()))
  );

  // Reviews: union deduplicated by ID
  const reviewMap = new Map<string, any>();
  (base.reviews || []).forEach((r) => r && r.id && reviewMap.set(r.id, r));
  (incoming.reviews || []).forEach((r) => r && r.id && reviewMap.set(r.id, r));
  const reviews = Array.from(reviewMap.values());

  // Offers: union deduplicated by ID
  const offerMap = new Map<string, any>();
  (base.offers || []).forEach((o) => o && o.id && offerMap.set(o.id, o));
  (incoming.offers || []).forEach((o) => o && o.id && offerMap.set(o.id, o));
  const offers = Array.from(offerMap.values());

  // ID: keep stable string or numeric id
  const id = base.id || incoming.id || `mov_${normalizeMovieTitle(base.title || incoming.title)}`;

  return {
    ...base,
    ...incoming,
    id,
    title: base.title || incoming.title,
    img,
    poster,
    banner,
    description: (base.description && base.description.length >= (incoming.description?.length || 0))
      ? base.description
      : (incoming.description || base.description || ""),
    genre: incoming.genre || base.genre || "Action",
    lang: incoming.lang || base.lang || "Telugu",
    langKey: (incoming.langKey || base.langKey || incoming.lang || base.lang || "telugu").toLowerCase(),
    additionalLanguages: additionalLanguages.length > 0 ? additionalLanguages : undefined,
    duration: incoming.duration || base.duration || "2h 30m",
    releaseYear: incoming.releaseYear || base.releaseYear || 2026,
    releaseDate: incoming.releaseDate || base.releaseDate || "2026-10-09",
    rating: String(incoming.rating || base.rating || "9.0"),
    votes: incoming.votes || base.votes || "2.5K+ Votes",
    formats: formats.length > 0 ? formats : ["2D"],
    trailerUrl: incoming.trailerUrl || base.trailerUrl || "https://www.youtube.com/watch?v=bC36d8e3bb0",
    castMembers,
    crewMembers,
    actors: (Array.isArray(incoming.actors) && incoming.actors.length > 0)
      ? incoming.actors
      : base.actors || (castMembers ? castMembers.map((c) => c.name) : []),
    director: incoming.director || base.director || (crewMembers ? crewMembers.find((c) => c.role?.toLowerCase() === "director")?.name : ""),
    reviews: reviews.length > 0 ? reviews : undefined,
    offers: offers.length > 0 ? offers : undefined,
    isActive: base.isActive !== false && incoming.isActive !== false,
  };
}

/**
 * Authoritative movie list deduplicator.
 * Removes mock/dummy entries, identifies duplicate movies by normalized title and ID,
 * and merges them cleanly without losing metadata.
 */
export function deduplicateMovies(movies: Movie[] = []): Movie[] {
  if (!Array.isArray(movies) || movies.length === 0) return [];

  const titleMap = new Map<string, Movie>();
  const idMap = new Map<string | number, string>(); // maps id -> normTitle

  for (const item of movies) {
    if (!item || isMockOrDuplicateMovie(item)) continue;

    const normTitle = normalizeMovieTitle(item.title);
    if (!normTitle) continue;

    // Check if we already have an entry with this normalized title or matching ID
    const existingKey = titleMap.has(normTitle)
      ? normTitle
      : (item.id && idMap.has(item.id) ? idMap.get(item.id) : null);

    if (existingKey && titleMap.has(existingKey)) {
      const existing = titleMap.get(existingKey)!;
      const merged = mergeMovieDetails(existing, item);
      titleMap.set(existingKey, merged);
      if (item.id) idMap.set(item.id, existingKey);
    } else {
      const movieWithId: Movie = {
        ...item,
        id: item.id || `mov_${normTitle}`,
      };
      titleMap.set(normTitle, movieWithId);
      if (movieWithId.id) {
        idMap.set(movieWithId.id, normTitle);
      }
    }
  }

  return Array.from(titleMap.values());
}

/**
 * Safely scrubs duplicate and mock movies from localStorage ("cine_movies").
 * Returns the cleaned, deduplicated array.
 */
export function scrubStoredMovies(): Movie[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem("cine_movies");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const cleaned = deduplicateMovies(parsed);
    localStorage.setItem("cine_movies", JSON.stringify(cleaned));
    return cleaned;
  } catch (err) {
    console.warn("[scrubStoredMovies] Failed to clean stored movies:", err);
    return [];
  }
}
