// CineVenue Authoritative Revenue & Financial Types
// Single Source of Truth Schema

export interface StandardRevenueMetrics {
  grossBookingValue: number;    // Total gross amount collected from customers for valid bookings (Ticket + Fees + Taxes - Discounts)
  ticketRevenue: number;        // Base ticket value across valid bookings
  convenienceFee: number;       // Platform fees, convenience fees, and booking surcharges collected
  taxCollected: number;         // Total statutory taxes collected (GST on tickets & fees)
  discounts: number;            // Promo code & voucher discounts applied
  cinecoinDiscount: number;     // CineCoin loyalty coin redemptions
  refunds: number;              // Total refund amount issued for cancelled bookings
  platformRevenue: number;      // CineVenue Net Platform Revenue (Platform Fees + Convenience Fees + Commission share)
  theatreSettlement: number;    // Net ticket revenue payable / settled to theatre partners
  netRevenue: number;           // Net platform revenue
  totalBookings: number;        // Total booking records in scope
  confirmedBookings: number;    // Valid confirmed & completed bookings
  cancelledBookings: number;    // Cancelled / refunded bookings
  ticketsSold: number;          // Total count of tickets/seats sold
}

export type RevenueDateRange =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thismonth'
  | 'previousmonth'
  | 'custom'
  | 'all';

export interface RevenueFilterOptions {
  range?: RevenueDateRange;
  startDate?: string;
  endDate?: string;
  theatreName?: string;
  theatreId?: string | number;
  movieTitle?: string;
  movieId?: string;
  city?: string;
  paymentMethod?: string;
}

export interface DailyRevenueTrend {
  date: string;
  label: string;
  grossBookingValue: number;
  platformRevenue: number;
  theatreSettlement: number;
  taxes: number;
  refunds: number;
  bookings: number;
  tickets: number;
}

export interface TheatreRevenuePerformance {
  theatreName: string;
  city: string;
  grossBookingValue: number;
  theatreSettlement: number;
  platformRevenue: number;
  taxes: number;
  bookings: number;
  tickets: number;
  occupancyEstimate?: number;
}

export interface MovieRevenuePerformance {
  movieTitle: string;
  grossBookingValue: number;
  theatreSettlement: number;
  platformRevenue: number;
  bookings: number;
  tickets: number;
  sharePercent: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface AuthoritativeDashboardData {
  metrics: StandardRevenueMetrics;
  dailyTrends: DailyRevenueTrend[];
  theatrePerformance: TheatreRevenuePerformance[];
  moviePerformance: MovieRevenuePerformance[];
  paymentBreakdown: PaymentMethodBreakdown[];
  recentBookings: any[];
  filter: RevenueFilterOptions;
}

export interface FinancialAuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'REFUND_PROCESSED' | 'SETTLEMENT_DISBURSED' | 'FEE_CORRECTION' | 'BOOKING_ADJUSTMENT' | 'MANUAL_REVERSAL';
  bookingId?: string;
  transactionId?: string;
  theatreId?: string | number;
  oldValue: any;
  newValue: any;
  reason: string;
  timestamp: string;
}
