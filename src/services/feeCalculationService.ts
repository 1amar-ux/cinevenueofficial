import Decimal from 'decimal.js';
import {
  FeeRule,
  TaxRule,
  DiscountRule,
  FeeCalculationContext,
  FeeCalculationResult,
  CalculatedFeeItem,
  CalculatedTaxItem,
  CalculatedDiscountItem,
  FeeLine,
  TaxLine
} from '../types/fees';

/**
 * Checks whether a Fee Rule is active and applicable to the given booking context.
 */
export function isRuleApplicable(rule: FeeRule, context: FeeCalculationContext): boolean {
  if (rule.status !== 'ACTIVE') return false;

  const now = new Date();
  if (rule.validFrom) {
    const fromDate = new Date(rule.validFrom);
    if (now < fromDate) return false;
  }
  if (rule.validUntil) {
    const untilDate = new Date(rule.validUntil);
    if (now > untilDate) return false;
  }

  const baseAmt = new Decimal(context.ticketAmount || 0);

  if (rule.minAmount !== undefined && rule.minAmount !== null) {
    if (baseAmt.lessThan(rule.minAmount)) return false;
  }
  if (rule.maxAmount !== undefined && rule.maxAmount !== null) {
    if (baseAmt.greaterThan(rule.maxAmount)) return false;
  }

  // Scope verification
  switch (rule.scope) {
    case 'GLOBAL':
      return true;

    case 'THEATRE':
      if (rule.theatreId && context.theatreId) {
        return String(rule.theatreId).toLowerCase() === String(context.theatreId).toLowerCase();
      }
      if (rule.theatreName && context.theatreName) {
        return rule.theatreName.trim().toLowerCase() === context.theatreName.trim().toLowerCase();
      }
      return false;

    case 'MOVIE':
      if (rule.movieId && context.movieId) {
        return String(rule.movieId).toLowerCase() === String(context.movieId).toLowerCase();
      }
      if (rule.movieTitle && context.movieTitle) {
        return rule.movieTitle.trim().toLowerCase() === context.movieTitle.trim().toLowerCase();
      }
      return false;

    case 'EVENT':
      if (rule.eventId && context.eventId) {
        return String(rule.eventId).toLowerCase() === String(context.eventId).toLowerCase();
      }
      if (rule.eventTitle && context.eventTitle) {
        return rule.eventTitle.trim().toLowerCase() === context.eventTitle.trim().toLowerCase();
      }
      return false;

    case 'CITY':
      if (rule.cityId && context.cityId) {
        return String(rule.cityId).toLowerCase() === String(context.cityId).toLowerCase();
      }
      if (rule.cityName && context.cityName) {
        return rule.cityName.trim().toLowerCase() === context.cityName.trim().toLowerCase();
      }
      return false;

    case 'SEAT_CATEGORY':
      if (rule.seatCategoryId && context.seatCategories && context.seatCategories.length > 0) {
        return context.seatCategories.some(
          cat => cat.toLowerCase() === String(rule.seatCategoryId).toLowerCase()
        );
      }
      return false;

    case 'PAYMENT_METHOD':
      if (rule.paymentMethod && context.paymentMethod) {
        return rule.paymentMethod.toUpperCase() === context.paymentMethod.toUpperCase();
      }
      return false;

    default:
      return true;
  }
}

/**
 * Calculates raw fee amount for a single rule using Decimal arithmetic.
 */
export function calculateRawFee(rule: FeeRule, context: FeeCalculationContext): Decimal {
  if (!isRuleApplicable(rule, context)) {
    return new Decimal(0);
  }

  const value = new Decimal(rule.value || 0);
  const ticketCount = new Decimal(context.ticketCount || 1);
  const baseAmount = new Decimal(context.ticketAmount || 0);

  if (rule.type === 'FIXED') {
    if (rule.applyMode === 'PER_BOOKING') {
      return value;
    }
    if (rule.applyMode === 'PER_TICKET') {
      return value.mul(ticketCount);
    }
  }

  if (rule.type === 'PERCENTAGE') {
    if (rule.applyMode === 'PER_BOOKING' || rule.applyMode === 'PER_TICKET') {
      return baseAmount.mul(value).div(100);
    }
  }

  return new Decimal(0);
}

/**
 * Core Fee Calculation Service for CINEVENUE
 */
export class FeeCalculationService {
  /**
   * Main calculation engine that evaluates all active fee, tax, and discount rules.
   */
  static calculateBookingFees(
    context: FeeCalculationContext,
    feeRules: FeeRule[],
    taxRules: TaxRule[],
    discountRules: DiscountRule[] = []
  ): FeeCalculationResult {
    const baseTicketAmt = new Decimal(context.ticketAmount || 0);
    const ticketCount = context.ticketCount || (context.seatPrices ? Object.keys(context.seatPrices).length : 1);

    const calculatedFees: CalculatedFeeItem[] = [];
    const calculatedTaxes: CalculatedTaxItem[] = [];
    const calculatedDiscounts: CalculatedDiscountItem[] = [];

    // Filter and sort applicable fee rules by priority (highest priority processed first)
    const applicableFeeRules = feeRules
      .filter(rule => isRuleApplicable(rule, context))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Handle strategy (STACK, OVERRIDE, REPLACE)
    let effectiveRules: FeeRule[] = [];
    const hasOverride = applicableFeeRules.find(r => r.ruleStrategy === 'OVERRIDE');
    const hasReplace = applicableFeeRules.find(r => r.ruleStrategy === 'REPLACE');

    if (hasReplace) {
      effectiveRules = [hasReplace];
    } else if (hasOverride) {
      effectiveRules = [hasOverride];
    } else {
      effectiveRules = applicableFeeRules;
    }

    let platformFeeTotal = new Decimal(0);
    let convenienceFeeTotal = new Decimal(0);
    let bookingFeeTotal = new Decimal(0);
    let otherFeesTotal = new Decimal(0);
    let gatewayCharges = new Decimal(0);

    // 1. Calculate each Fee Item
    for (const rule of effectiveRules) {
      const feeAmount = calculateRawFee(rule, context);
      if (feeAmount.lessThanOrEqualTo(0)) continue;

      let feeTaxTotal = new Decimal(0);
      const taxBreakdowns: { taxRuleId?: string; name: string; rate: number; amount: number }[] = [];

      // If rule is tax-applicable, calculate associated taxes
      if (rule.taxApplicable) {
        let matchingTaxes: TaxRule[] = [];

        if (rule.taxRuleId) {
          const matched = taxRules.find(t => t.id === rule.taxRuleId && t.status === 'ACTIVE');
          if (matched) matchingTaxes.push(matched);
        }

        if (matchingTaxes.length === 0) {
          // Find general fee taxes
          matchingTaxes = taxRules.filter(t => 
            t.status === 'ACTIVE' && 
            (t.appliesTo === 'ALL_FEES' || 
             (rule.name.toLowerCase().includes('platform') && t.appliesTo === 'PLATFORM_FEE') ||
             (rule.name.toLowerCase().includes('convenience') && t.appliesTo === 'CONVENIENCE_FEE') ||
             (rule.name.toLowerCase().includes('booking') && t.appliesTo === 'BOOKING_FEE') ||
             t.appliesTo === 'OTHER_FEE')
          );
        }

        for (const taxRule of matchingTaxes) {
          let taxAmt = new Decimal(0);
          const taxRate = new Decimal(taxRule.rate || 0);

          if (taxRule.type === 'PERCENTAGE') {
            taxAmt = feeAmount.mul(taxRate).div(100);
          } else {
            taxAmt = taxRate;
          }

          feeTaxTotal = feeTaxTotal.plus(taxAmt);
          taxBreakdowns.push({
            taxRuleId: taxRule.id,
            name: taxRule.name,
            rate: taxRate.toNumber(),
            amount: Number(taxAmt.toFixed(2))
          });

          // Add to taxes ledger
          calculatedTaxes.push({
            taxRuleId: taxRule.id,
            name: `${taxRule.name} on ${rule.name}`,
            rate: taxRate.toNumber(),
            baseAmount: Number(feeAmount.toFixed(2)),
            amount: Number(taxAmt.toFixed(2)),
            target: rule.name
          });
        }
      }

      const feeItem: CalculatedFeeItem = {
        ruleId: rule.id,
        name: rule.name,
        type: rule.type,
        applyMode: rule.applyMode,
        rate: Number(new Decimal(rule.value).toFixed(2)),
        amount: Number(feeAmount.toFixed(2)),
        taxAmount: Number(feeTaxTotal.toFixed(2)),
        taxBreakdown: taxBreakdowns
      };

      calculatedFees.push(feeItem);

      // Categorize totals
      const nameLower = rule.name.toLowerCase();
      if (rule.scope === 'PAYMENT_METHOD' || nameLower.includes('gateway')) {
        gatewayCharges = gatewayCharges.plus(feeAmount);
      } else if (nameLower.includes('platform')) {
        platformFeeTotal = platformFeeTotal.plus(feeAmount);
      } else if (nameLower.includes('convenience')) {
        convenienceFeeTotal = convenienceFeeTotal.plus(feeAmount);
      } else if (nameLower.includes('booking')) {
        bookingFeeTotal = bookingFeeTotal.plus(feeAmount);
      } else {
        otherFeesTotal = otherFeesTotal.plus(feeAmount);
      }
    }

    // 2. Direct Ticket Taxes (e.g. Entertainment Tax or Ticket GST if configured)
    const directTicketTaxes = taxRules.filter(t => t.status === 'ACTIVE' && t.appliesTo === 'TICKET');
    for (const tRule of directTicketTaxes) {
      let tAmt = new Decimal(0);
      const tRate = new Decimal(tRule.rate || 0);

      if (tRule.type === 'PERCENTAGE') {
        tAmt = baseTicketAmt.mul(tRate).div(100);
      } else {
        tAmt = tRate.mul(ticketCount);
      }

      if (tAmt.greaterThan(0)) {
        calculatedTaxes.push({
          taxRuleId: tRule.id,
          name: tRule.name,
          rate: tRate.toNumber(),
          baseAmount: Number(baseTicketAmt.toFixed(2)),
          amount: Number(tAmt.toFixed(2)),
          target: 'TICKET'
        });
      }
    }

    // 3. Evaluate Discounts
    let totalDiscount = new Decimal(0);
    if (context.couponCode) {
      const normalizedCode = context.couponCode.trim().toUpperCase();
      const matchedDiscount = discountRules.find(d => 
        d.status === 'ACTIVE' && 
        d.couponCode && 
        d.couponCode.trim().toUpperCase() === normalizedCode
      );

      if (matchedDiscount) {
        let discAmount = new Decimal(0);
        const discVal = new Decimal(matchedDiscount.value || 0);

        if (matchedDiscount.type === 'FIXED') {
          discAmount = matchedDiscount.applyMode === 'PER_TICKET' ? discVal.mul(ticketCount) : discVal;
        } else if (matchedDiscount.type === 'PERCENTAGE') {
          discAmount = baseTicketAmt.mul(discVal).div(100);
        }

        if (matchedDiscount.maxDiscount && discAmount.greaterThan(matchedDiscount.maxDiscount)) {
          discAmount = new Decimal(matchedDiscount.maxDiscount);
        }

        if (!matchedDiscount.minAmount || baseTicketAmt.greaterThanOrEqualTo(matchedDiscount.minAmount)) {
          totalDiscount = totalDiscount.plus(discAmount);
          calculatedDiscounts.push({
            discountRuleId: matchedDiscount.id,
            name: matchedDiscount.name,
            code: matchedDiscount.couponCode,
            amount: Number(discAmount.toFixed(2))
          });
        }
      }
    }

    // Summing calculations using Decimal
    const totalFees = platformFeeTotal.plus(convenienceFeeTotal).plus(bookingFeeTotal).plus(otherFeesTotal).plus(gatewayCharges);
    const totalTaxes = calculatedTaxes.reduce((sum, t) => sum.plus(t.amount), new Decimal(0));

    const totalBeforeDiscount = baseTicketAmt.plus(totalFees).plus(totalTaxes);
    const finalAmount = Decimal.max(0, totalBeforeDiscount.minus(totalDiscount));

    // Revenue distribution model
    const theatreNetShare = baseTicketAmt;
    const cineVenueNetRevenue = platformFeeTotal.plus(convenienceFeeTotal).plus(bookingFeeTotal).plus(otherFeesTotal);

    return {
      ticketAmount: Number(baseTicketAmt.toFixed(2)),
      ticketCount,
      fees: calculatedFees,
      taxes: calculatedTaxes,
      discounts: calculatedDiscounts,
      platformFeeTotal: Number(platformFeeTotal.toFixed(2)),
      convenienceFeeTotal: Number(convenienceFeeTotal.toFixed(2)),
      bookingFeeTotal: Number(bookingFeeTotal.toFixed(2)),
      otherFeesTotal: Number(otherFeesTotal.toFixed(2)),
      totalFees: Number(totalFees.toFixed(2)),
      totalTaxes: Number(totalTaxes.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      gatewayCharges: Number(gatewayCharges.toFixed(2)),
      theatreNetShare: Number(theatreNetShare.toFixed(2)),
      cineVenueNetRevenue: Number(cineVenueNetRevenue.toFixed(2)),
      totalAmount: Number(finalAmount.toFixed(2))
    };
  }

  /**
   * Generates durable FeeLine and TaxLine database snapshot records for confirmed bookings.
   */
  static createSnapshotLines(bookingId: string, result: FeeCalculationResult): { feeLines: FeeLine[]; taxLines: TaxLine[] } {
    const feeLines: FeeLine[] = [];
    const taxLines: TaxLine[] = [];

    result.fees.forEach((fee, idx) => {
      const fLineId = `FL-${bookingId.slice(-6)}-${idx + 1}`;
      const feeLine: FeeLine = {
        id: fLineId,
        bookingId,
        feeRuleId: fee.ruleId,
        name: fee.name,
        type: fee.type,
        applyMode: fee.applyMode,
        baseAmount: result.ticketAmount,
        quantity: fee.applyMode === 'PER_TICKET' ? result.ticketCount : 1,
        rate: fee.rate,
        amount: fee.amount,
        taxAmount: fee.taxAmount,
        createdAt: new Date().toISOString()
      };
      feeLines.push(feeLine);

      if (fee.taxBreakdown && fee.taxBreakdown.length > 0) {
        fee.taxBreakdown.forEach((t, tIdx) => {
          taxLines.push({
            id: `TL-${fLineId}-${tIdx + 1}`,
            bookingId,
            feeLineId: fLineId,
            taxRuleId: t.taxRuleId,
            name: t.name,
            rate: t.rate,
            baseAmount: fee.amount,
            amount: t.amount,
            createdAt: new Date().toISOString()
          });
        });
      }
    });

    result.taxes.forEach((tax, tIdx) => {
      if (tax.target === 'TICKET') {
        taxLines.push({
          id: `TL-TKT-${bookingId.slice(-6)}-${tIdx + 1}`,
          bookingId,
          taxRuleId: tax.taxRuleId,
          name: tax.name,
          rate: tax.rate,
          baseAmount: tax.baseAmount,
          amount: tax.amount,
          createdAt: new Date().toISOString()
        });
      }
    });

    return { feeLines, taxLines };
  }
}

export default FeeCalculationService;
