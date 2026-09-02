import { randomUUID } from "crypto";
import Decimal from "decimal.js";
import { financeDb } from "./finance.db";
import { prisma } from "../../lib/prisma";

export class FinanceService {
  
  // ==========================================
  // CONFIGURATIONS
  // ==========================================

  async getActiveFeeConfig() {
    return financeDb.feeConfigs.find(fc => fc.status === "ACTIVE");
  }

  async getFeeSlabs(feeConfigId: string) {
    return financeDb.feeSlabs.filter(fs => fs.feeConfigId === feeConfigId);
  }

  async getActiveTaxConfig() {
    return financeDb.taxConfigs.find(tc => tc.status === "ACTIVE" && tc.type === "CINEMA_TICKET");
  }

  // ==========================================
  // PRICING ENGINE
  // ==========================================

  async calculatePrice(showId: string, requestedTickets: { seatId: string; price: number }[]) {
    // Note: We use the requested ticket prices as a fallback, but in production we'd verify from DB.
    // We will verify the show and seats.
    const feeConfig = await this.getActiveFeeConfig();
    if (!feeConfig) throw new Error("No active fee configuration");

    const feeSlabs = await this.getFeeSlabs(feeConfig.id);
    const taxConfig = await this.getActiveTaxConfig();

    let ticketSubtotal = new Decimal(0);
    let ticketTax = new Decimal(0);
    let convenienceFee = new Decimal(0);
    let convenienceFeeTax = new Decimal(0);

    for (const ticket of requestedTickets) {
      const price = new Decimal(ticket.price);
      ticketSubtotal = ticketSubtotal.plus(price);

      // Ticket Tax Calculation (tax-inclusive pricing on tickets usually, but we calculate the tax component)
      let currentTicketTaxRate = new Decimal(0);
      if (taxConfig) {
        const matchingRule = taxConfig.rules.find((r: any) => 
          price.gte(r.minPrice || 0) && price.lte(r.maxPrice || 9999999)
        );
        if (matchingRule) {
          currentTicketTaxRate = new Decimal(matchingRule.rate);
        }
      }

      // If price is inclusive of GST: Tax = Price * Rate / (100 + Rate)
      // For calculation let's calculate the tax component assuming inclusive.
      const taxComponent = price.times(currentTicketTaxRate).dividedBy(currentTicketTaxRate.plus(100));
      ticketTax = ticketTax.plus(taxComponent);

      // Convenience Fee Calculation
      if (feeConfig.feeMode === "PER_TICKET") {
        const slab = feeSlabs.find((s: any) => price.gte(s.minPrice) && price.lte(s.maxPrice));
        if (slab) {
          convenienceFee = convenienceFee.plus(new Decimal(slab.fee));
        }
      }
    }

    if (feeConfig.feeMode === "PER_BOOKING") {
      const slab = feeSlabs.find((s: any) => ticketSubtotal.gte(s.minPrice) && ticketSubtotal.lte(s.maxPrice));
      if (slab) {
        convenienceFee = convenienceFee.plus(new Decimal(slab.fee));
      }
    }

    if (feeConfig.taxEnabled) {
      const rate = new Decimal(feeConfig.taxRate);
      convenienceFeeTax = convenienceFee.times(rate).dividedBy(100);
    }

    const total = ticketSubtotal.plus(convenienceFee).plus(convenienceFeeTax);

    return {
      ticketSubtotal: ticketSubtotal.toDecimalPlaces(2).toNumber(),
      ticketTax: ticketTax.toDecimalPlaces(2).toNumber(),
      convenienceFee: convenienceFee.toDecimalPlaces(2).toNumber(),
      convenienceFeeTax: convenienceFeeTax.toDecimalPlaces(2).toNumber(),
      total: total.toDecimalPlaces(2).toNumber(),
      currency: "INR",
      feeConfigVersion: feeConfig.version,
      taxConfigVersion: taxConfig ? taxConfig.version : null
    };
  }

  // ==========================================
  // PAYMENT ORDER
  // ==========================================

  async createPaymentOrder(bookingData: any) {
    // Create the booking record as PENDING
    const pricing = await this.calculatePrice(bookingData.showId, bookingData.tickets);
    
    // We expect amount in minor units (paise) for gateway
    const amountInPaise = new Decimal(pricing.total).times(100).toDecimalPlaces(0).toNumber();

    // Create a PaymentOrder record in financeDb
    const paymentOrder = {
      id: `order_${randomUUID().slice(0, 14)}`,
      bookingId: bookingData.bookingId, // Passed if booking was already created
      amount: amountInPaise,
      currency: pricing.currency,
      status: "CREATED",
      pricingSnapshot: pricing,
      createdAt: new Date()
    };
    financeDb.paymentOrders.push(paymentOrder);

    return {
      orderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      pricing
    };
  }

  // ==========================================
  // WEBHOOK
  // ==========================================

  async processWebhook(gateway: string, payload: any) {
    // Check Idempotency
    const existing = financeDb.paymentWebhooks.find(w => w.eventId === payload.eventId);
    if (existing) {
      return { success: true, message: "Already processed" }; // idempotent
    }

    financeDb.paymentWebhooks.push({
      id: `wh_${randomUUID().slice(0, 8)}`,
      gateway,
      eventId: payload.eventId || randomUUID(),
      payload,
      processedAt: new Date()
    });

    const orderId = payload.payload?.payment?.entity?.order_id || payload.orderId;
    const order = financeDb.paymentOrders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");

    if (payload.event === "payment.captured" || payload.status === "SUCCESS") {
      order.status = "SUCCESS";
      
      // We would confirm the booking here in a real scenario
      // and create a settlement ledger entry
      financeDb.settlementLedgers.push({
        id: `sld_${randomUUID().slice(0, 8)}`,
        orderId: order.id,
        bookingId: order.bookingId,
        type: "BOOKING_CREATED",
        amount: order.pricingSnapshot.total,
        theatreBase: order.pricingSnapshot.ticketSubtotal - order.pricingSnapshot.ticketTax,
        createdAt: new Date()
      });
    }

    return { success: true };
  }
}

export const financeService = new FinanceService();
