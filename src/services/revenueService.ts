import Decimal from 'decimal.js';
import {
  StandardRevenueMetrics,
  RevenueFilterOptions,
  DailyRevenueTrend,
  TheatreRevenuePerformance,
  MovieRevenuePerformance,
  PaymentMethodBreakdown,
  AuthoritativeDashboardData,
  FinancialAuditLog
} from '../types/revenue';

/**
 * Standard Date Range Filter Helper
 */
export function isDateWithinFilter(dateInput: string | Date | undefined, options?: RevenueFilterOptions): boolean {
  if (!options || !options.range || options.range === 'all') {
    return true;
  }

  if (!dateInput) return true;

  const targetDate = new Date(dateInput);
  if (isNaN(targetDate.getTime())) return true;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (options.range) {
    case 'today':
      return targetDate >= todayStart && targetDate <= todayEnd;

    case 'yesterday': {
      const yestStart = new Date(todayStart);
      yestStart.setDate(yestStart.getDate() - 1);
      const yestEnd = new Date(todayEnd);
      yestEnd.setDate(yestEnd.getDate() - 1);
      return targetDate >= yestStart && targetDate <= yestEnd;
    }

    case 'last7days': {
      const sevenDaysAgo = new Date(todayStart);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      return targetDate >= sevenDaysAgo && targetDate <= todayEnd;
    }

    case 'last30days': {
      const thirtyDaysAgo = new Date(todayStart);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      return targetDate >= thirtyDaysAgo && targetDate <= todayEnd;
    }

    case 'thismonth': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return targetDate >= monthStart && targetDate <= todayEnd;
    }

    case 'previousmonth': {
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return targetDate >= prevMonthStart && targetDate <= prevMonthEnd;
    }

    case 'custom': {
      if (options.startDate) {
        const start = new Date(options.startDate);
        if (!isNaN(start.getTime()) && targetDate < start) return false;
      }
      if (options.endDate) {
        const end = new Date(options.endDate);
        if (!isNaN(end.getTime()) && targetDate > end) return false;
      }
      return true;
    }

    default:
      return true;
  }
}

/**
 * Filter bookings by dimension and date range
 */
export function filterBookings(bookings: any[], options?: RevenueFilterOptions): any[] {
  if (!Array.isArray(bookings)) return [];

  return bookings.filter(b => {
    // Date filter (check createdAt first, fallback to date field)
    const bookingDate = b.createdAt || b.date;
    if (!isDateWithinFilter(bookingDate, options)) {
      return false;
    }

    // Theatre filter
    if (options?.theatreName && b.theatreName) {
      if (b.theatreName.trim().toLowerCase() !== options.theatreName.trim().toLowerCase()) {
        return false;
      }
    }
    if (options?.theatreId !== undefined && options?.theatreId !== null && b.theatreId !== undefined) {
      if (String(b.theatreId) !== String(options.theatreId)) {
        return false;
      }
    }

    // Movie filter
    if (options?.movieTitle && b.movieTitle) {
      if (b.movieTitle.trim().toLowerCase() !== options.movieTitle.trim().toLowerCase()) {
        return false;
      }
    }

    // City filter
    if (options?.city && b.city) {
      if (b.city.trim().toLowerCase() !== options.city.trim().toLowerCase()) {
        return false;
      }
    }

    // Payment method filter
    if (options?.paymentMethod && b.paymentMethod) {
      if (!b.paymentMethod.toUpperCase().includes(options.paymentMethod.toUpperCase())) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Centralized Authoritative Revenue Calculation Service
 * ONE source of truth across Dashboard, Reports, Analytics, Bookings, and Settlements.
 */
export function calculateRevenueMetrics(
  bookings: any[],
  options?: RevenueFilterOptions
): StandardRevenueMetrics {
  const filtered = filterBookings(bookings, options);

  let grossBookingValue = new Decimal(0);
  let ticketRevenue = new Decimal(0);
  let convenienceFee = new Decimal(0);
  let taxCollected = new Decimal(0);
  let discounts = new Decimal(0);
  let cinecoinDiscount = new Decimal(0);
  let refunds = new Decimal(0);
  let platformRevenue = new Decimal(0);
  let theatreSettlement = new Decimal(0);
  let ticketsSold = 0;

  let confirmedCount = 0;
  let cancelledCount = 0;

  filtered.forEach(b => {
    const isCancelled = b.status === 'Cancelled' || b.ticketStatus === 'CANCELLED' || b.ticketStatus === 'REFUNDED';
    const isFailed = b.status === 'Failed' || b.paymentStatus === 'FAILED' || b.status === 'Pending_Payment';

    if (isFailed) {
      // Failed attempts contribute ₹0 to revenue metrics
      return;
    }

    // Calculate base ticket amount
    let ticketAmt = new Decimal(0);
    if (b.ticketAmount !== undefined && b.ticketAmount !== null) {
      ticketAmt = new Decimal(b.ticketAmount);
    } else if (b.seatPrices && typeof b.seatPrices === 'object') {
      const sumPrices = Object.values(b.seatPrices).reduce((acc: number, p: any) => acc + (Number(p) || 0), 0);
      ticketAmt = new Decimal(Number(sumPrices) || 0);
    } else {
      ticketAmt = new Decimal(b.totalPrice || b.totalAmount || 0);
    }

    // Calculate fees
    const pFee = new Decimal(b.platformFee || 0);
    const cFee = new Decimal(b.convenienceFee || 0);
    const bFee = new Decimal(b.bookingFee || 0);
    const oFee = new Decimal(b.otherFeeAmount || 0);
    const totalFees = b.totalFees !== undefined ? new Decimal(b.totalFees) : pFee.plus(cFee).plus(bFee).plus(oFee);

    // Calculate taxes
    const taxAmt = new Decimal(b.taxAmount !== undefined ? b.taxAmount : (b.taxes || b.platformFeeGst || 0));

    // Calculate discounts
    const discAmt = new Decimal(b.discountAmount !== undefined ? b.discountAmount : (b.discount || 0));
    const coinAmt = new Decimal(b.cinecoinDiscount !== undefined ? b.cinecoinDiscount : (b.coinsRedeemed || 0));

    // Customer Paid Total
    const customerPaid = b.totalPrice !== undefined 
      ? new Decimal(b.totalPrice) 
      : (b.totalAmount !== undefined ? new Decimal(b.totalAmount) : ticketAmt.plus(totalFees).plus(taxAmt).minus(discAmt).minus(coinAmt));

    // Ticket count
    const tCount = Array.isArray(b.seats) 
      ? b.seats.length 
      : (typeof b.seats === 'string' ? b.seats.split(',').filter(Boolean).length : 1);

    if (isCancelled) {
      cancelledCount += 1;
      const refundAmt = new Decimal(b.refundAmount || customerPaid.mul(0.9));
      refunds = refunds.plus(refundAmt);
      return;
    }

    // Valid Confirmed Booking
    confirmedCount += 1;
    ticketsSold += tCount;

    grossBookingValue = grossBookingValue.plus(customerPaid);
    ticketRevenue = ticketRevenue.plus(ticketAmt);
    convenienceFee = convenienceFee.plus(totalFees);
    taxCollected = taxCollected.plus(taxAmt);
    discounts = discounts.plus(discAmt);
    cinecoinDiscount = cinecoinDiscount.plus(coinAmt);

    // Standard CineVenue Commission model:
    // Theatre receives base ticket value minus 12% standard platform commission (or custom theatreShare if pre-calculated)
    let tShare = new Decimal(0);
    if (b.theatreShare !== undefined && b.theatreShare !== null) {
      tShare = new Decimal(b.theatreShare);
    } else {
      tShare = ticketAmt.mul(0.88); // 88% to theatre, 12% commission to CineVenue
    }
    theatreSettlement = theatreSettlement.plus(tShare);

    // Platform Net Revenue = Platform & Convenience Fees + Platform 12% commission on ticket value
    const platformCommission = ticketAmt.minus(tShare);
    const pRev = totalFees.plus(platformCommission);
    platformRevenue = platformRevenue.plus(pRev);
  });

  const netRevenue = platformRevenue;

  return {
    grossBookingValue: Number(grossBookingValue.toFixed(2)),
    ticketRevenue: Number(ticketRevenue.toFixed(2)),
    convenienceFee: Number(convenienceFee.toFixed(2)),
    taxCollected: Number(taxCollected.toFixed(2)),
    discounts: Number(discounts.toFixed(2)),
    cinecoinDiscount: Number(cinecoinDiscount.toFixed(2)),
    refunds: Number(refunds.toFixed(2)),
    platformRevenue: Number(platformRevenue.toFixed(2)),
    theatreSettlement: Number(theatreSettlement.toFixed(2)),
    netRevenue: Number(netRevenue.toFixed(2)),
    totalBookings: filtered.length,
    confirmedBookings: confirmedCount,
    cancelledBookings: cancelledCount,
    ticketsSold
  };
}

/**
 * Generate authoritative aggregated dashboard data for charts and breakdowns
 */
export function generateAuthoritativeDashboardData(
  bookings: any[],
  options: RevenueFilterOptions = { range: 'last7days' }
): AuthoritativeDashboardData {
  const metrics = calculateRevenueMetrics(bookings, options);
  const filtered = filterBookings(bookings, options);

  // 1. Daily Trends (Last 7 days or current window)
  const dailyMap = new Map<string, {
    gross: Decimal;
    platform: Decimal;
    theatre: Decimal;
    tax: Decimal;
    refund: Decimal;
    bookings: number;
    tickets: number;
  }>();

  // Initialize last 7 days keys
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailyMap.set(dateStr, {
      gross: new Decimal(0),
      platform: new Decimal(0),
      theatre: new Decimal(0),
      tax: new Decimal(0),
      refund: new Decimal(0),
      bookings: 0,
      tickets: 0
    });
  }

  filtered.forEach(b => {
    const rawDate = b.createdAt || b.date || new Date().toISOString();
    const dateStr = new Date(rawDate).toISOString().split('T')[0];
    
    let entry = dailyMap.get(dateStr);
    if (!entry) {
      entry = {
        gross: new Decimal(0),
        platform: new Decimal(0),
        theatre: new Decimal(0),
        tax: new Decimal(0),
        refund: new Decimal(0),
        bookings: 0,
        tickets: 0
      };
      dailyMap.set(dateStr, entry);
    }

    const isCancelled = b.status === 'Cancelled' || b.ticketStatus === 'CANCELLED';
    const isFailed = b.status === 'Failed' || b.paymentStatus === 'FAILED';
    if (isFailed) return;

    entry.bookings += 1;

    if (isCancelled) {
      const refundAmt = new Decimal(b.refundAmount || (b.totalPrice ? b.totalPrice * 0.9 : 0));
      entry.refund = entry.refund.plus(refundAmt);
      return;
    }

    const totalPaid = new Decimal(b.totalPrice || b.totalAmount || 0);
    const ticketAmt = new Decimal(b.ticketAmount || totalPaid);
    const pFee = new Decimal(b.platformFee || 0);
    const cFee = new Decimal(b.convenienceFee || 0);
    const fees = b.totalFees !== undefined ? new Decimal(b.totalFees) : pFee.plus(cFee);
    const tShare = b.theatreShare !== undefined ? new Decimal(b.theatreShare) : ticketAmt.mul(0.88);
    const pRev = fees.plus(ticketAmt.minus(tShare));
    const tax = new Decimal(b.taxAmount || b.taxes || 0);
    const tix = Array.isArray(b.seats) ? b.seats.length : 1;

    entry.gross = entry.gross.plus(totalPaid);
    entry.theatre = entry.theatre.plus(tShare);
    entry.platform = entry.platform.plus(pRev);
    entry.tax = entry.tax.plus(tax);
    entry.tickets += tix;
  });

  const dailyTrends: DailyRevenueTrend[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, data]) => {
      const d = new Date(dateStr);
      const label = isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        label,
        grossBookingValue: Number(data.gross.toFixed(2)),
        platformRevenue: Number(data.platform.toFixed(2)),
        theatreSettlement: Number(data.theatre.toFixed(2)),
        taxes: Number(data.tax.toFixed(2)),
        refunds: Number(data.refund.toFixed(2)),
        bookings: data.bookings,
        tickets: data.tickets
      };
    });

  // 2. Theatre Performance
  const theatreMap = new Map<string, {
    theatreName: string;
    city: string;
    gross: Decimal;
    theatreShare: Decimal;
    platform: Decimal;
    taxes: Decimal;
    bookings: number;
    tickets: number;
  }>();

  filtered.forEach(b => {
    if (b.status === 'Cancelled' || b.status === 'Failed') return;
    const tName = b.theatreName || 'Partner Multiplex';
    const city = b.city || 'Hyderabad';

    let tData = theatreMap.get(tName);
    if (!tData) {
      tData = {
        theatreName: tName,
        city,
        gross: new Decimal(0),
        theatreShare: new Decimal(0),
        platform: new Decimal(0),
        taxes: new Decimal(0),
        bookings: 0,
        tickets: 0
      };
      theatreMap.set(tName, tData);
    }

    const totalPaid = new Decimal(b.totalPrice || b.totalAmount || 0);
    const ticketAmt = new Decimal(b.ticketAmount || totalPaid);
    const fees = new Decimal(b.totalFees || (b.platformFee || 0) + (b.convenienceFee || 0));
    const tShare = b.theatreShare !== undefined ? new Decimal(b.theatreShare) : ticketAmt.mul(0.88);
    const pRev = fees.plus(ticketAmt.minus(tShare));
    const tax = new Decimal(b.taxAmount || b.taxes || 0);
    const tix = Array.isArray(b.seats) ? b.seats.length : 1;

    tData.gross = tData.gross.plus(totalPaid);
    tData.theatreShare = tData.theatreShare.plus(tShare);
    tData.platform = tData.platform.plus(pRev);
    tData.taxes = tData.taxes.plus(tax);
    tData.bookings += 1;
    tData.tickets += tix;
  });

  const theatrePerformance: TheatreRevenuePerformance[] = Array.from(theatreMap.values()).map(t => ({
    theatreName: t.theatreName,
    city: t.city,
    grossBookingValue: Number(t.gross.toFixed(2)),
    theatreSettlement: Number(t.theatreShare.toFixed(2)),
    platformRevenue: Number(t.platform.toFixed(2)),
    taxes: Number(t.taxes.toFixed(2)),
    bookings: t.bookings,
    tickets: t.tickets
  }));

  // 3. Movie Performance
  const movieMap = new Map<string, {
    movieTitle: string;
    gross: Decimal;
    theatreShare: Decimal;
    platform: Decimal;
    bookings: number;
    tickets: number;
  }>();

  filtered.forEach(b => {
    if (b.status === 'Cancelled' || b.status === 'Failed') return;
    const mTitle = b.movieTitle || 'General Screening';

    let mData = movieMap.get(mTitle);
    if (!mData) {
      mData = {
        movieTitle: mTitle,
        gross: new Decimal(0),
        theatreShare: new Decimal(0),
        platform: new Decimal(0),
        bookings: 0,
        tickets: 0
      };
      movieMap.set(mTitle, mData);
    }

    const totalPaid = new Decimal(b.totalPrice || b.totalAmount || 0);
    const ticketAmt = new Decimal(b.ticketAmount || totalPaid);
    const fees = new Decimal(b.totalFees || (b.platformFee || 0) + (b.convenienceFee || 0));
    const tShare = b.theatreShare !== undefined ? new Decimal(b.theatreShare) : ticketAmt.mul(0.88);
    const pRev = fees.plus(ticketAmt.minus(tShare));
    const tix = Array.isArray(b.seats) ? b.seats.length : 1;

    mData.gross = mData.gross.plus(totalPaid);
    mData.theatreShare = mData.theatreShare.plus(tShare);
    mData.platform = mData.platform.plus(pRev);
    mData.bookings += 1;
    mData.tickets += tix;
  });

  const totalMovieGross = Array.from(movieMap.values()).reduce((sum, m) => sum.plus(m.gross), new Decimal(0));
  const moviePerformance: MovieRevenuePerformance[] = Array.from(movieMap.values()).map(m => {
    const share = totalMovieGross.greaterThan(0) ? m.gross.div(totalMovieGross).mul(100).toNumber() : 0;
    return {
      movieTitle: m.movieTitle,
      grossBookingValue: Number(m.gross.toFixed(2)),
      theatreSettlement: Number(m.theatreShare.toFixed(2)),
      platformRevenue: Number(m.platform.toFixed(2)),
      bookings: m.bookings,
      tickets: m.tickets,
      sharePercent: Math.round(share)
    };
  });

  // 4. Payment Method Breakdown
  const paymentMap = new Map<string, { amount: Decimal; count: number }>();
  filtered.forEach(b => {
    if (b.status === 'Cancelled' || b.status === 'Failed') return;
    const pm = (b.paymentMethod || 'UPI').toUpperCase();
    const cur = paymentMap.get(pm) || { amount: new Decimal(0), count: 0 };
    cur.amount = cur.amount.plus(new Decimal(b.totalPrice || b.totalAmount || 0));
    cur.count += 1;
    paymentMap.set(pm, cur);
  });

  const totalPaymentAmt = Array.from(paymentMap.values()).reduce((sum, p) => sum.plus(p.amount), new Decimal(0));
  const paymentBreakdown: PaymentMethodBreakdown[] = Array.from(paymentMap.entries()).map(([method, data]) => {
    const pct = totalPaymentAmt.greaterThan(0) ? data.amount.div(totalPaymentAmt).mul(100).toNumber() : 0;
    return {
      method,
      amount: Number(data.amount.toFixed(2)),
      count: data.count,
      percentage: Math.round(pct)
    };
  });

  // 5. Recent bookings
  const recentBookings = [...filtered].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date || 0).getTime();
    const dateB = new Date(b.createdAt || b.date || 0).getTime();
    return dateB - dateA;
  }).slice(0, 15);

  return {
    metrics,
    dailyTrends,
    theatrePerformance,
    moviePerformance,
    paymentBreakdown,
    recentBookings,
    filter: options
  };
}

/**
 * Client API callers
 */
export async function fetchServerRevenueMetrics(options?: RevenueFilterOptions): Promise<StandardRevenueMetrics> {
  const params = new URLSearchParams();
  if (options?.range) params.append('range', options.range);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.theatreName) params.append('theatreName', options.theatreName);
  if (options?.movieTitle) params.append('movieTitle', options.movieTitle);
  if (options?.city) params.append('city', options.city);

  try {
    const res = await fetch(`/api/admin/revenue/metrics?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.metrics) {
        return data.metrics;
      }
    }
  } catch (err) {
    console.error("Failed to fetch server revenue metrics, using local calculation fallback:", err);
  }

  // Fallback to local storage calculation
  const saved = localStorage.getItem("cine_bookings");
  const bookings = saved ? JSON.parse(saved) : [];
  return calculateRevenueMetrics(bookings, options);
}

export async function fetchServerDashboardStats(options?: RevenueFilterOptions): Promise<AuthoritativeDashboardData> {
  const params = new URLSearchParams();
  if (options?.range) params.append('range', options.range);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);
  if (options?.theatreName) params.append('theatreName', options.theatreName);
  if (options?.movieTitle) params.append('movieTitle', options.movieTitle);
  if (options?.city) params.append('city', options.city);

  try {
    const res = await fetch(`/api/admin/dashboard/stats?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.dashboard) {
        return data.dashboard;
      }
    }
  } catch (err) {
    console.error("Failed to fetch server dashboard stats, using local calculation fallback:", err);
  }

  const saved = localStorage.getItem("cine_bookings");
  const bookings = saved ? JSON.parse(saved) : [];
  return generateAuthoritativeDashboardData(bookings, options);
}

export default {
  calculateRevenueMetrics,
  generateAuthoritativeDashboardData,
  filterBookings,
  isDateWithinFilter,
  fetchServerRevenueMetrics,
  fetchServerDashboardStats
};
