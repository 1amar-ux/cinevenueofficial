import { apiClient } from './client';
import { PriceBreakdown, BookingRecord } from '../types/booking';

export const bookingApi = {
  // 1. Authoritative Seat Hold (Server-Side / POS lock)
  lockSeats: async (showId: string, seatIds: string[], theatreId?: string) => {
    const res = await apiClient.post('/bookings/lock-seats', {
      showId,
      seatIds,
      theatreId
    });
    return res.data;
  },

  // 2. Dynamic Price & Fee Calculation with Coupon and CineCoins
  calculatePrice: async (params: {
    showId: string;
    seatIds: string[];
    couponCode?: string;
    cineCoinsToRedeem?: number;
  }): Promise<PriceBreakdown> => {
    const res = await apiClient.post('/bookings/calculate-price', params);
    return res.data?.data || res.data;
  },

  // 3. Create Pending Booking Order
  createPendingBooking: async (params: {
    showId: string;
    seatIds: string[];
    couponCode?: string;
    cineCoinsRedeemed?: number;
  }) => {
    const res = await apiClient.post('/bookings', params);
    return res.data?.data || res.data;
  },

  // 4. Get User Bookings List
  getMyBookings: async (): Promise<BookingRecord[]> => {
    const res = await apiClient.get('/bookings/my');
    return res.data?.data?.bookings || res.data?.bookings || [];
  },

  // 5. Cancel Booking
  cancelBooking: async (bookingId: string, reason?: string) => {
    const res = await apiClient.post('/pos/cancel', { bookingId, reason });
    return res.data;
  }
};

export const paymentApi = {
  createRazorpayOrder: async (params: { showId: string; tickets: { seatId: string; price: number }[] }) => {
    const res = await apiClient.post('/payments/create-order', params);
    return res.data?.data || res.data;
  },

  verifyRazorpayPayment: async (paymentResponse: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    const res = await apiClient.post('/payments/verify', paymentResponse);
    return res.data;
  }
};
