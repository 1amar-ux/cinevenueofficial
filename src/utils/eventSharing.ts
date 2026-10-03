/**
 * Event Sharing Utility for CineVenue
 * Provides unified cross-platform sharing capabilities:
 * - Canonical public deep links (/events/:id)
 * - Native Web Share API (mobile/desktop browsers)
 * - Direct social shares (WhatsApp, Twitter/X, Facebook, LinkedIn, Email)
 * - Safe clipboard copy with fallback
 */

export interface ShareableEvent {
  id: string;
  title: string;
  date?: string;
  time?: string;
  city?: string;
  venueName?: string;
  description?: string;
}

export function getEventShareUrl(eventId: string): string {
  if (typeof window === 'undefined') return `/events/${eventId}`;
  return `${window.location.origin}/events/${eventId}`;
}

export async function copyEventShareLink(eventId: string): Promise<boolean> {
  const url = getEventShareUrl(eventId);
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback for older browsers or non-secure contexts
  if (typeof document !== 'undefined') {
    try {
      const input = document.createElement('input');
      input.value = url;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.focus();
      input.select();
      const success = document.execCommand('copy');
      document.body.removeChild(input);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}

export async function shareEvent(event: ShareableEvent): Promise<'shared' | 'copied' | 'dismissed' | 'failed'> {
  const url = getEventShareUrl(event.id);
  const title = event.title || 'CineVenue Live Event';
  const text = `Join me at ${title}${event.city ? ` in ${event.city}` : ''}! Secure your entry passes on CineVenue:`;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return 'shared';
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'dismissed';
      }
      // If native sharing fails, fall through to clipboard copy
    }
  }

  const copied = await copyEventShareLink(event.id);
  return copied ? 'copied' : 'failed';
}

export function getWhatsAppShareUrl(event: ShareableEvent): string {
  const url = getEventShareUrl(event.id);
  const text = `🎟️ *${event.title}*\n${event.venueName ? `📍 Venue: ${event.venueName}, ${event.city || ''}\n` : ''}${event.date ? `📅 Date: ${event.date}\n` : ''}Book your official passes now on CineVenue:\n${url}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function getTwitterShareUrl(event: ShareableEvent): string {
  const url = getEventShareUrl(event.id);
  const text = `Check out "${event.title}" on CineVenue! Book your exclusive passes here:`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function getFacebookShareUrl(eventId: string): string {
  const url = getEventShareUrl(eventId);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getEmailShareUrl(event: ShareableEvent): string {
  const url = getEventShareUrl(event.id);
  const subject = `Passes to ${event.title} on CineVenue`;
  const body = `Hi,\n\nI thought you might be interested in attending ${event.title}.\n\nVenue: ${event.venueName || 'Convention Arena'}, ${event.city || ''}\nDate: ${event.date || 'Upcoming'}\n\nYou can view event details and book passes here:\n${url}\n\nSee you there!`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
