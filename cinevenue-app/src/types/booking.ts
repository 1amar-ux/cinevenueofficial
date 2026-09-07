export interface PriceBreakdown {
  ticketSubtotal: number;
  convenienceFee: number;
  platformFee: number;
  ticketTax: number;
  convenienceFeeTax: number;
  totalTaxes: number;
  discountAmount: number;
  cineCoinsRedeemed: number;
  cineCoinsDiscount: number;
  total: number;
}

export interface BookingRecord {
  id: string;
  bookingNumber: string;
  posBookingId?: string;
  posReferenceNumber?: string;
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  theatreId: string;
  theatreName: string;
  screenName: string;
  showTime: string;
  showDate: string;
  seats: string[];
  totalAmount: number;
  status: 'PENDING' | 'SEAT_HELD' | 'PAYMENT_PENDING' | 'PAYMENT_RECEIVED_BOOKING_PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUND_PENDING' | 'REFUNDED' | 'FAILED' | 'EXPIRED';
  posStatus?: string;
  paymentMethod?: string;
  paymentId?: string;
  qrCodeData?: string;
  createdAt: string;
}
