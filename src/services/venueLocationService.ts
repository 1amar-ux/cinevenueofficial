/**
 * CineVenue Venue Location & Calendar Services
 * Provides verified venue navigation (Get Directions) without requiring customer GPS,
 * and standard iCalendar / Google Calendar integration for automated show reminders.
 */

export interface VenueLocationInfo {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export interface BookingCalendarInfo {
  title: string;
  type: "MOVIE" | "EVENT";
  bookingId: string;
  venueName: string;
  venueAddress?: string;
  city?: string;
  dateStr: string; // e.g. "2026-10-21" or "Tomorrow, 21 Oct" or "2026-10-21T18:30:00"
  timeStr: string; // e.g. "06:30 PM" or "18:30"
  durationMinutes?: number; // default 150 min (2.5h) for movies, 180 min (3h) for events
  seats?: string[];
  screen?: string;
}

/**
 * Generate Google Maps navigation URL for a verified venue.
 * Prioritizes exact coordinates; gracefully falls back to complete venue address.
 */
export function getVenueDirectionsUrl(venue: VenueLocationInfo): string {
  const hasCoords =
    typeof venue.latitude === "number" &&
    !isNaN(venue.latitude) &&
    typeof venue.longitude === "number" &&
    !isNaN(venue.longitude) &&
    (venue.latitude !== 0 || venue.longitude !== 0);

  if (hasCoords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;
  }

  const queryParts = [venue.name, venue.address, venue.city, venue.state, "India"]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts)}`;
}

/**
 * Open venue navigation in native maps application (Android / iOS) or web browser.
 * Destination is strictly the verified venue location; user GPS permission is NOT required.
 */
export function openVenueDirections(venue: VenueLocationInfo): void {
  const directionsUrl = getVenueDirectionsUrl(venue);

  // Check if running in Capacitor Native Android/iOS
  const isCapacitor =
    typeof window !== "undefined" &&
    ((window as any).Capacitor?.isNativePlatform?.() ||
      (window as any).Capacitor?.getPlatform?.() === "android" ||
      (window as any).Capacitor?.getPlatform?.() === "ios");

  if (isCapacitor && venue.latitude && venue.longitude) {
    const geoUri = `geo:${venue.latitude},${venue.longitude}?q=${encodeURIComponent(
      venue.name
    )}`;
    window.location.href = geoUri;
    return;
  }

  // Web Browser fallback
  window.open(directionsUrl, "_blank", "noopener,noreferrer");
}

/**
 * Parse date and time into JavaScript Date object.
 */
export function parseBookingDateTime(dateStr: string, timeStr: string): Date {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  // Try parsing ISO or YYYY-MM-DD
  if (dateStr && dateStr.includes("-") && dateStr.length >= 8) {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  } else if (dateStr && /tomorrow/i.test(dateStr)) {
    const d = new Date(now.getTime() + 86400000);
    year = d.getFullYear();
    month = d.getMonth();
    day = d.getDate();
  }

  // Parse time (e.g., "06:30 PM" or "18:30" or "6:00 PM")
  let hours = 18;
  let minutes = 0;

  if (timeStr) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === "PM" && hours < 12) hours += 12;
      if (ampm === "AM" && hours === 12) hours = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, 0);
}

/**
 * Format a Date to UTC string for iCalendar (YYYYMMDDTHHMMSSZ).
 */
function formatIcsDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generate standard .ics (iCalendar) content compatible with Google Calendar,
 * Apple Calendar, Outlook, and Android Calendar providers.
 * Includes automated pre-configured alarms for 24 hours, 3 hours, 1 hour, and 15 minutes.
 */
export function generateIcsCalendarContent(info: BookingCalendarInfo): string {
  const startDate = parseBookingDateTime(info.dateStr, info.timeStr);
  const durationMs = (info.durationMinutes || (info.type === "MOVIE" ? 150 : 180)) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const startFormatted = formatIcsDateTime(startDate);
  const endFormatted = formatIcsDateTime(endDate);
  const stampFormatted = formatIcsDateTime(new Date());

  const fullVenue = [info.venueName, info.venueAddress, info.city].filter(Boolean).join(", ");
  const title = `CineVenue: ${info.title} (${info.type === "MOVIE" ? "Movie" : "Event"})`;
  const seatsText = info.seats && info.seats.length > 0 ? `\\nSeats: ${info.seats.join(", ")}` : "";
  const screenText = info.screen ? `\\nScreen: ${info.screen}` : "";

  const description = `Confirmed ${info.type === "MOVIE" ? "Cinema Ticket" : "Event Pass"} via CineVenue.\\nBooking ID: ${info.bookingId}\\nVenue: ${fullVenue}${screenText}${seatsText}\\nOpen CineVenue app to view your digital ticket and venue directions.`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CineVenue Entertainments//Smart Location & Ticket Reminder System//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:cinevenue-${info.bookingId}@cinevenue.com`,
    `DTSTAMP:${stampFormatted}`,
    `DTSTART:${startFormatted}`,
    `DTEND:${endFormatted}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${fullVenue}`,
    "STATUS:CONFIRMED",
    // Alarm: 24 Hours Before
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:CineVenue Reminder: 24 hours until ${info.title}!`,
    "END:VALARM",
    // Alarm: 3 Hours Before
    "BEGIN:VALARM",
    "TRIGGER:-PT3H",
    "ACTION:DISPLAY",
    `DESCRIPTION:CineVenue Reminder: 3 hours until ${info.title}!`,
    "END:VALARM",
    // Alarm: 1 Hour Before
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    `DESCRIPTION:CineVenue Reminder: 1 hour until ${info.title}! Check directions to ${info.venueName}.`,
    "END:VALARM",
    // Alarm: 15 Minutes Before
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:CineVenue Reminder: 15 minutes until ${info.title} begins!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

/**
 * Trigger download of .ics calendar file for universal cross-platform calendar import.
 */
export function downloadCalendarEvent(info: BookingCalendarInfo): void {
  const icsData = generateIcsCalendarContent(info);
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const filename = `cinevenue-${info.type.toLowerCase()}-${info.bookingId}.ics`;

  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href);
}

/**
 * Open Google Calendar web URL to add the event directly in browser.
 */
export function openGoogleCalendarWeb(info: BookingCalendarInfo): void {
  const startDate = parseBookingDateTime(info.dateStr, info.timeStr);
  const durationMs = (info.durationMinutes || (info.type === "MOVIE" ? 150 : 180)) * 60 * 1000;
  const endDate = new Date(startDate.getTime() + durationMs);

  const startFormatted = formatIcsDateTime(startDate);
  const endFormatted = formatIcsDateTime(endDate);
  const fullVenue = [info.venueName, info.venueAddress, info.city].filter(Boolean).join(", ");
  const title = `CineVenue: ${info.title}`;
  const details = `Confirmed Booking ID: ${info.bookingId}. Venue: ${fullVenue}. Open CineVenue to view your digital ticket.`;

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(
    details
  )}&location=${encodeURIComponent(fullVenue)}`;

  window.open(url, "_blank", "noopener,noreferrer");
}
