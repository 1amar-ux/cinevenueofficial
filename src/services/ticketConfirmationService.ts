/**
 * CineVenue Automated Ticket Confirmation Email Dispatch Service
 * Handles instant asynchronous dispatch of branded HTML ticket confirmations
 * for both Movie Bookings and Event Bookings.
 */

import apiClient, { resolveApiBaseUrl } from "./apiClient";

export interface MovieTicketConfirmationData {
  bookingId: string;
  bookingCode?: string;
  movieTitle: string;
  theatreName: string;
  theatreAddress?: string;
  city?: string;
  screenName?: string;
  date: string;
  timeSlot: string;
  seats: string[] | string;
  seatCategory?: string;
  basePrice: number;
  convenienceFee: number;
  gstAmount: number;
  totalPaid: number;
  customerEmail: string;
  customerName?: string;
  paymentMethod?: string;
  posterUrl?: string;
  qrCodeUrl?: string;
}

export interface EventTicketConfirmationData {
  bookingId: string;
  ticketCode?: string;
  eventTitle: string;
  venueName: string;
  venueAddress?: string;
  city?: string;
  date: string;
  time: string;
  seats?: string[] | string;
  seatCategory?: string;
  basePrice: number;
  convenienceFee?: number;
  gstAmount?: number;
  totalPaid: number;
  customerEmail: string;
  customerName?: string;
  paymentMethod?: string;
  posterUrl?: string;
  ticketUrl?: string;
}

class TicketConfirmationService {
  /**
   * Asynchronously dispatch a Movie Ticket confirmation email to the user.
   * Completely non-blocking to ensure smooth instant UI transitions.
   */
  public dispatchMovieConfirmation(data: MovieTicketConfirmationData): Promise<void> {
    if (!data.customerEmail || !data.customerEmail.includes("@")) {
      console.warn("[TicketEmail] Skipped email dispatch: No valid recipient email provided.");
      return Promise.resolve();
    }

    const payload = {
      type: "MOVIE",
      to: data.customerEmail,
      email: data.customerEmail,
      name: data.customerName || "Valued Patron",
      customerName: data.customerName || "Valued Patron",
      bookingId: data.bookingId,
      bookingCode: data.bookingCode || data.bookingId,
      ticketCode: data.bookingCode || data.bookingId,
      movieTitle: data.movieTitle,
      title: data.movieTitle,
      theatreName: data.theatreName,
      venue: data.theatreName,
      theatreAddress: data.theatreAddress,
      venueAddress: data.theatreAddress,
      city: data.city || "Guntur",
      screenName: data.screenName || "Screen 1 (4K Dolby Atmos)",
      date: data.date,
      timeSlot: data.timeSlot,
      time: data.timeSlot,
      seats: Array.isArray(data.seats) ? data.seats.join(", ") : data.seats,
      seatCategory: data.seatCategory || "ELITE",
      category: data.seatCategory || "ELITE",
      basePrice: data.basePrice,
      convenienceFee: data.convenienceFee,
      gstAmount: data.gstAmount,
      totalPaid: data.totalPaid,
      paymentMethod: data.paymentMethod || "UPI Online",
      posterUrl: data.posterUrl,
      qrCodeUrl: data.qrCodeUrl,
    };

    return this.postEmailPayload(payload);
  }

  /**
   * Asynchronously dispatch an Event Pass confirmation email to the user.
   */
  public dispatchEventConfirmation(data: EventTicketConfirmationData): Promise<void> {
    if (!data.customerEmail || !data.customerEmail.includes("@")) {
      console.warn("[TicketEmail] Skipped event email: No valid recipient email provided.");
      return Promise.resolve();
    }

    const payload = {
      type: "EVENT",
      to: data.customerEmail,
      email: data.customerEmail,
      name: data.customerName || "Valued Attendee",
      customerName: data.customerName || "Valued Attendee",
      bookingId: data.bookingId,
      bookingCode: data.ticketCode || data.bookingId,
      ticketCode: data.ticketCode || data.bookingId,
      title: data.eventTitle,
      venue: data.venueName,
      venueAddress: data.venueAddress,
      city: data.city,
      date: data.date,
      time: data.time,
      seats: Array.isArray(data.seats) ? data.seats.join(", ") : data.seats,
      seatCategory: data.seatCategory || "General Pass",
      basePrice: data.basePrice,
      convenienceFee: data.convenienceFee || 0,
      gstAmount: data.gstAmount || 0,
      totalPaid: data.totalPaid,
      paymentMethod: data.paymentMethod || "UPI Online",
      posterUrl: data.posterUrl,
      ticketUrl: data.ticketUrl,
    };

    return this.postEmailPayload(payload);
  }

  private async postEmailPayload(payload: any): Promise<void> {
    try {
      // Primary: Axios apiClient with resolved environment base URL
      await apiClient.post("/notifications/send-ticket-email", payload);
      console.log(`[TicketEmail] Confirmation email successfully queued for ${payload.to} [${payload.bookingId}]`);
    } catch (apiErr) {
      // Secondary fallback: Direct fetch to relative routes
      try {
        const directUrl = `${resolveApiBaseUrl()}/notifications/send-ticket-email`;
        await fetch(directUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        console.log(`[TicketEmail] Fallback dispatch succeeded for ${payload.to}`);
      } catch (fallbackErr) {
        console.warn("[TicketEmail] Background dispatch note:", fallbackErr);
      }
    }
  }
}

export const ticketConfirmationService = new TicketConfirmationService();

