/**
 * YouTube Utility functions for CineVenue Movie Trailer & Teaser Management
 * Enforces normalization, strict URL validation, ID extraction, thumbnail generation, and secure embed URLs.
 */

export interface YouTubeValidationResult {
  isValid: boolean;
  videoId: string | null;
  normalizedUrl: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  errorMessage?: string;
}

/**
 * Extracts and validates YouTube Video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - VIDEO_ID (raw 11 character string)
 */
export function parseAndValidateYouTubeUrl(inputUrl: string): YouTubeValidationResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      isValid: false,
      videoId: null,
      normalizedUrl: null,
      embedUrl: null,
      thumbnailUrl: null,
      errorMessage: 'YouTube URL cannot be empty.',
    };
  }

  const trimmed = inputUrl.trim();

  // Reject malicious tags or iframe scripts
  if (/<script|<iframe|javascript:|data:/i.test(trimmed)) {
    return {
      isValid: false,
      videoId: null,
      normalizedUrl: null,
      embedUrl: null,
      thumbnailUrl: null,
      errorMessage: 'Arbitrary HTML, scripts, or iframes are not allowed.',
    };
  }

  // Handle direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    const videoId = trimmed;
    return {
      isValid: true,
      videoId,
      normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
  } catch {
    return {
      isValid: false,
      videoId: null,
      normalizedUrl: null,
      embedUrl: null,
      thumbnailUrl: null,
      errorMessage: 'Malformed or invalid URL structure.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = parsedUrl.pathname;
  let videoId: string | null = null;

  if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
    if (pathname === '/watch') {
      videoId = parsedUrl.searchParams.get('v');
    } else if (pathname.startsWith('/shorts/')) {
      videoId = pathname.split('/')[2];
    } else if (pathname.startsWith('/embed/')) {
      videoId = pathname.split('/')[2];
    } else if (pathname.startsWith('/v/')) {
      videoId = pathname.split('/')[2];
    }
  } else if (hostname === 'youtu.be') {
    // youtu.be/VIDEO_ID
    videoId = pathname.substring(1).split('/')[0].split('?')[0];
  } else {
    return {
      isValid: false,
      videoId: null,
      normalizedUrl: null,
      embedUrl: null,
      thumbnailUrl: null,
      errorMessage: 'Unsupported domain. Only youtube.com and youtu.be are permitted.',
    };
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return {
      isValid: false,
      videoId: null,
      normalizedUrl: null,
      embedUrl: null,
      thumbnailUrl: null,
      errorMessage: 'Could not extract a valid 11-character YouTube video ID.',
    };
  }

  return {
    isValid: true,
    videoId,
    normalizedUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

/**
 * Gets high-quality or max-res YouTube thumbnail URL with fallback
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'hq' | 'maxres' | 'default' = 'hq'): string {
  if (!videoId) return '';
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (quality === 'hq') {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/default.jpg`;
}

/**
 * Safe YouTube Embed URL constructor
 */
export function buildSafeYouTubeEmbedUrl(videoId: string, options: { autoplay?: boolean; rel?: number; modestbranding?: number } = {}): string {
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return '';
  }
  const params = new URLSearchParams({
    autoplay: options.autoplay ? '1' : '0',
    rel: (options.rel ?? 0).toString(),
    modestbranding: (options.modestbranding ?? 1).toString(),
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
