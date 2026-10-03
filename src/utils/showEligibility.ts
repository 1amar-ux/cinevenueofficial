/**
 * CineVenue Canonical Show Status & Booking Eligibility Engine
 * Evaluates show lifecycle (SCHEDULED | STARTED | COMPLETED | CANCELLED)
 * Evaluates real-time booking eligibility independently with 26 canonical blocking reasons.
 * All date-time evaluations are timezone-safe and pegged to Asia/Kolkata (IST = UTC+5:30).
 */

import { Show, Movie, Theatre, Screen, ShowStatus, BookingBlockedReason } from '../types';

export interface ShowEligibilityResult {
  showId: string;
  showStatus: ShowStatus;
  bookingEligible: boolean;
  blockedReason: BookingBlockedReason;
  reasonMessage: string;
  calculatedShowStartAt: string;
  calculatedShowEndAt: string;
}

export interface ShowEvaluationContext {
  currentTime?: Date | string; // Defaults to now
  movie?: Movie | null;
  theatre?: Theatre | null;
  screen?: Screen | null;
  selectedCity?: string;
}

/**
 * Normalizes date (YYYY-MM-DD) and time (HH:mm) into an ISO string in Asia/Kolkata timezone (+05:30).
 * Handles midnight crossing if isNextDay = true.
 */
export function buildKolkataDateTime(dateStr: string, timeStr: string, isNextDay: boolean = false): string {
  // Clean date YYYY-MM-DD
  const dateParts = dateStr.split('-').map((v) => parseInt(v, 10));
  let year = dateParts[0];
  let month = dateParts[1] - 1; // 0-indexed
  let day = dateParts[2];

  if (isNextDay) {
    const temp = new Date(Date.UTC(year, month, day + 1));
    year = temp.getUTCFullYear();
    month = temp.getUTCMonth();
    day = temp.getUTCDate();
  }

  const timeParts = timeStr.split(':').map((v) => parseInt(v, 10));
  const hours = timeParts[0] || 0;
  const minutes = timeParts[1] || 0;

  // Format to standard ISO string with +05:30 offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${year}-${pad(month + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00+05:30`;
}

/**
 * Calculates start and end timestamps for a show, correctly rolling over midnight shows
 * (e.g. 23:30 to 02:15 rolls end date to next calendar day).
 */
export function calculateShowBoundaryTimestamps(showDate: string, startTime: string, endTime: string): { showStartAt: string; showEndAt: string } {
  const startAt = buildKolkataDateTime(showDate, startTime, false);
  
  // Check if end time is numerically <= start time (e.g. 01:30 <= 23:00 means overnight)
  const [sH, sM] = startTime.split(':').map(Number);
  const [eH, eM] = endTime.split(':').map(Number);
  const isOvernight = eH * 60 + eM <= sH * 60 + sM;

  const endAt = buildKolkataDateTime(showDate, endTime, isOvernight);
  return { showStartAt: startAt, showEndAt: endAt };
}

/**
 * Pure Canonical Evaluator for Show Booking Eligibility adhering to priority order of the 26 reasons.
 */
export function evaluateShowBookingEligibility(
  show: Show,
  context: ShowEvaluationContext = {}
): ShowEligibilityResult {
  const now = context.currentTime ? new Date(context.currentTime).getTime() : Date.now();

  // Calculate or verify start/end timestamps
  const { showStartAt, showEndAt } = calculateShowBoundaryTimestamps(
    show.showDate,
    show.showStartTime,
    show.showEndTime
  );

  const startMs = new Date(showStartAt).getTime();
  const endMs = new Date(showEndAt).getTime();

  // 1. Check Movie existence and state
  if (context.movie === null && !show.movieTitle) {
    return {
      showId: show.id,
      showStatus: show.showStatus,
      bookingEligible: false,
      blockedReason: 'MOVIE_NOT_FOUND',
      reasonMessage: 'The associated movie could not be found.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  if (context.movie && context.movie.isActive === false) {
    return {
      showId: show.id,
      showStatus: show.showStatus,
      bookingEligible: false,
      blockedReason: 'MOVIE_INACTIVE',
      reasonMessage: 'The movie is currently inactive.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  if (context.movie?.releaseDate) {
    const movieReleaseMs = new Date(context.movie.releaseDate).getTime();
    const showDateMs = new Date(show.showDate).getTime();
    if (showDateMs < movieReleaseMs && !context.movie.advanceBookingEnabled) {
      return {
        showId: show.id,
        showStatus: show.showStatus,
        bookingEligible: false,
        blockedReason: 'MOVIE_NOT_RELEASED',
        reasonMessage: 'The movie has not been released yet for this show date.',
        calculatedShowStartAt: showStartAt,
        calculatedShowEndAt: showEndAt,
      };
    }
  }

  // 2. Check Theatre existence, active state, and city match
  if (context.theatre && context.theatre.features && context.theatre.name === '') {
    return {
      showId: show.id,
      showStatus: show.showStatus,
      bookingEligible: false,
      blockedReason: 'THEATRE_NOT_FOUND',
      reasonMessage: 'Theatre venue not found.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  if (context.selectedCity && context.theatre?.city) {
    if (context.selectedCity.toLowerCase() !== 'all cities' && 
        context.theatre.city.toLowerCase() !== context.selectedCity.toLowerCase()) {
      return {
        showId: show.id,
        showStatus: show.showStatus,
        bookingEligible: false,
        blockedReason: 'THEATRE_CITY_MISMATCH',
        reasonMessage: `Theatre is in ${context.theatre.city}, not selected city ${context.selectedCity}.`,
        calculatedShowStartAt: showStartAt,
        calculatedShowEndAt: showEndAt,
      };
    }
  }

  // 3. Check Screen maintenance
  if (context.screen && context.screen.isActive === false) {
    return {
      showId: show.id,
      showStatus: show.showStatus,
      bookingEligible: false,
      blockedReason: 'SCREEN_UNDER_MAINTENANCE',
      reasonMessage: 'Screen is currently undergoing maintenance.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  // 4. Check Show Status canonical lifecycle
  if (show.showStatus === 'CANCELLED' || show.isActive === false) {
    return {
      showId: show.id,
      showStatus: 'CANCELLED',
      bookingEligible: false,
      blockedReason: 'SHOW_CANCELLED',
      reasonMessage: show.cancellationReason || 'This show has been cancelled.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  if (show.showStatus === 'COMPLETED' || now >= endMs) {
    return {
      showId: show.id,
      showStatus: 'COMPLETED',
      bookingEligible: false,
      blockedReason: 'SHOW_COMPLETED',
      reasonMessage: 'This show has concluded.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  if (show.showStatus === 'STARTED' || now >= startMs) {
    return {
      showId: show.id,
      showStatus: 'STARTED',
      bookingEligible: false,
      blockedReason: 'SHOW_STARTED',
      reasonMessage: 'The show has already started. Bookings are closed.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  // 5. Check Admin booking lock
  if (show.adminBookingDisabled) {
    return {
      showId: show.id,
      showStatus: show.showStatus,
      bookingEligible: false,
      blockedReason: 'ADMIN_BOOKING_DISABLED',
      reasonMessage: 'Bookings are temporarily disabled by the theatre administrator.',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  // 6. Check Booking Window (bookingOpenAt / bookingCloseAt)
  if (show.bookingOpenAt) {
    const openMs = new Date(show.bookingOpenAt).getTime();
    if (now < openMs) {
      return {
        showId: show.id,
        showStatus: show.showStatus,
        bookingEligible: false,
        blockedReason: 'BOOKING_NOT_OPEN',
        reasonMessage: `Bookings open on ${new Date(show.bookingOpenAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
        calculatedShowStartAt: showStartAt,
        calculatedShowEndAt: showEndAt,
      };
    }
  }

  if (show.bookingCloseAt) {
    const closeMs = new Date(show.bookingCloseAt).getTime();
    if (now >= closeMs) {
      return {
        showId: show.id,
        showStatus: show.showStatus,
        bookingEligible: false,
        blockedReason: 'BOOKING_WINDOW_CLOSED',
        reasonMessage: 'The booking window for this show has closed.',
        calculatedShowStartAt: showStartAt,
        calculatedShowEndAt: showEndAt,
      };
    }
  }

  // 7. Check Seat Inventory (House Full)
  if (show.availableSeats <= 0) {
    return {
      showId: show.id,
      showStatus: show.showStatus,
      bookingEligible: false,
      blockedReason: 'HOUSE_FULL',
      reasonMessage: 'All seats for this show are booked (House Full).',
      calculatedShowStartAt: showStartAt,
      calculatedShowEndAt: showEndAt,
    };
  }

  // All 11 mandatory conditions passed
  return {
    showId: show.id,
    showStatus: 'SCHEDULED',
    bookingEligible: true,
    blockedReason: 'NONE',
    reasonMessage: 'Eligible for booking.',
    calculatedShowStartAt: showStartAt,
    calculatedShowEndAt: showEndAt,
  };
}

// Canonical alias for tests and external consumers
export const checkShowBookingEligibility = evaluateShowBookingEligibility;

