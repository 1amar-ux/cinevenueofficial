// CineVenue Fee Management & Pricing Engine Types

export type FeeType = 'FIXED' | 'PERCENTAGE';
export type FeeApplyMode = 'PER_TICKET' | 'PER_BOOKING';
export type ApplyMode = FeeApplyMode;
export type FeeScope = 
  | 'GLOBAL' 
  | 'THEATRE' 
  | 'MOVIE' 
  | 'EVENT' 
  | 'CITY' 
  | 'SEAT_CATEGORY' 
  | 'PAYMENT_METHOD';

export type FeeStatus = 'ACTIVE' | 'INACTIVE';
export type RuleStrategy = 'STACK' | 'OVERRIDE' | 'REPLACE';

export type TaxType = 'PERCENTAGE' | 'FIXED';
export type TaxAppliesTo = 
  | 'TICKET' 
  | 'PLATFORM_FEE' 
  | 'CONVENIENCE_FEE' 
  | 'BOOKING_FEE' 
  | 'OTHER_FEE' 
  | 'ALL_FEES';

export interface FeeRule {
  id: string;
  name: string;
  description?: string;
  type: FeeType;
  value: number; // e.g. 18 (fixed) or 5 (%)
  applyMode: FeeApplyMode;
  scope: FeeScope;

  // Conditional Relations
  theatreId?: string;
  theatreName?: string;
  movieId?: string;
  movieTitle?: string;
  eventId?: string;
  eventTitle?: string;
  cityId?: string;
  cityName?: string;
  seatCategoryId?: string;
  seatCategoryName?: string;
  paymentMethod?: string;

  // Tax linkage
  taxApplicable: boolean;
  taxRuleId?: string;
  taxRuleName?: string;

  // Advanced Logic
  priority: number;
  ruleStrategy?: RuleStrategy;
  minAmount?: number;
  maxAmount?: number;
  validFrom?: string;
  validUntil?: string;

  status: FeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaxRule {
  id: string;
  name: string;
  description?: string;
  rate: number; // e.g. 18 for 18% or fixed amount
  type: TaxType;
  appliesTo: TaxAppliesTo;
  status: FeeStatus;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  description?: string;
  type: FeeType;
  value: number;
  applyMode: FeeApplyMode;
  scope: FeeScope;
  couponCode?: string;
  theatreId?: string;
  movieId?: string;
  eventId?: string;
  cityId?: string;
  seatCategoryId?: string;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  status: FeeStatus;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeLine {
  id: string;
  bookingId: string;
  feeRuleId?: string;
  name: string;
  type: FeeType;
  applyMode: FeeApplyMode;
  baseAmount: number;
  quantity: number;
  rate: number;
  amount: number;
  taxAmount: number;
  createdAt: string;
}

export interface TaxLine {
  id: string;
  bookingId: string;
  feeLineId?: string;
  taxRuleId?: string;
  name: string;
  rate: number;
  baseAmount: number;
  amount: number;
  createdAt: string;
}

export interface CalculatedFeeItem {
  ruleId?: string;
  name: string;
  type: FeeType;
  applyMode: FeeApplyMode;
  rate: number;
  amount: number;
  taxAmount: number;
  taxBreakdown?: {
    taxRuleId?: string;
    name: string;
    rate: number;
    amount: number;
  }[];
}

export interface CalculatedTaxItem {
  taxRuleId?: string;
  name: string;
  rate: number;
  baseAmount: number;
  amount: number;
  target: string;
}

export interface CalculatedDiscountItem {
  discountRuleId?: string;
  name: string;
  code?: string;
  amount: number;
}

export interface FeeCalculationContext {
  bookingId?: string;
  ticketAmount: number;
  ticketCount: number;
  seatPrices?: { [seat: string]: number };
  theatreId?: string | number;
  theatreName?: string;
  movieId?: string;
  movieTitle?: string;
  eventId?: string;
  eventTitle?: string;
  cityId?: string;
  cityName?: string;
  seatCategories?: string[];
  paymentMethod?: string;
  couponCode?: string | null;
  customerEmail?: string;
}

export interface FeeCalculationResult {
  ticketAmount: number;
  ticketCount: number;
  fees: CalculatedFeeItem[];
  taxes: CalculatedTaxItem[];
  discounts: CalculatedDiscountItem[];
  platformFeeTotal: number;
  convenienceFeeTotal: number;
  bookingFeeTotal: number;
  otherFeesTotal: number;
  totalFees: number;
  totalTaxes: number;
  totalDiscount: number;
  gatewayCharges: number;
  theatreNetShare: number;
  cineVenueNetRevenue: number;
  totalAmount: number;
}

export interface FeeAuditLog {
  id: string;
  adminEmail: string;
  action: 
    | 'CREATE_FEE_RULE'
    | 'UPDATE_FEE_RULE'
    | 'ACTIVATE_FEE_RULE'
    | 'DEACTIVATE_FEE_RULE'
    | 'DELETE_FEE_RULE'
    | 'CREATE_TAX_RULE'
    | 'UPDATE_TAX_RULE'
    | 'ACTIVATE_TAX_RULE'
    | 'DEACTIVATE_TAX_RULE'
    | 'DELETE_TAX_RULE'
    | 'CREATE_DISCOUNT_RULE'
    | 'UPDATE_DISCOUNT_RULE'
    | 'DELETE_DISCOUNT_RULE';
  feeRuleId?: string;
  ruleName: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}

export interface FeeReportMetrics {
  totalFees: number;
  platformFees: number;
  convenienceFees: number;
  bookingFees: number;
  cancellationFees: number;
  taxes: number;
  gatewayCharges: number;
  discounts: number;
  revenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  theatreWise: { name: string; fees: number; revenue: number; bookings: number }[];
  movieWise: { title: string; fees: number; revenue: number; bookings: number }[];
  cityWise: { city: string; fees: number; revenue: number; bookings: number }[];
  feeTypeBreakdown: { name: string; value: number }[];
}
