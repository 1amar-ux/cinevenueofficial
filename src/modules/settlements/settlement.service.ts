import { prisma } from "../../lib/prisma";
import Decimal from "decimal.js";

// ==========================================
// 1. GET SALES FROM BOOKING SNAPSHOTS
// ==========================================
export async function getSales(
  theatreId?: string,
  from?: Date,
  to?: Date
) {
  const bookings = await prisma.booking.findMany({
    where: {
      ...(theatreId ? { theatreId } : {}),
      ...(from && to ? {
        createdAt: {
          gte: from,
          lte: to
        }
      } : {}),
      status: "CONFIRMED"
    }
  });

  let gross = new Decimal(0);
  let platformFees = new Decimal(0);
  let convenienceFees = new Decimal(0);
  let taxes = new Decimal(0);
  let discounts = new Decimal(0);
  let gatewayFees = new Decimal(0);

  for (const booking of bookings) {
    gross = gross.plus(booking.ticketAmount.toString());
    platformFees = platformFees.plus(booking.platformFee.toString());
    convenienceFees = convenienceFees.plus(booking.convenienceFee.toString());
    taxes = taxes.plus(booking.taxAmount.toString());
    discounts = discounts.plus(booking.discountAmount.toString());
    gatewayFees = gatewayFees.plus(booking.gatewayFee.toString());
  }

  return {
    theatreId: theatreId || "ALL_THEATRES",
    bookingCount: bookings.length,
    grossSales: gross.toFixed(2),
    platformFees: platformFees.toFixed(2),
    convenienceFees: convenienceFees.toFixed(2),
    taxes: taxes.toFixed(2),
    discounts: discounts.toFixed(2),
    gatewayFees: gatewayFees.toFixed(2),
    netSettlementPayable: gross.minus(platformFees).toFixed(2)
  };
}

// ==========================================
// 2. CALCULATE DYNAMIC COMMISSION
// ==========================================
export async function calculateCommission(
  grossSales: Decimal | number | string,
  commissionRate: Decimal | number | string = 10
) {
  const gross = new Decimal(grossSales);
  const rate = new Decimal(commissionRate);
  return gross.mul(rate).div(100);
}

// ==========================================
// 3. CREATE SETTLEMENT RECORD
// ==========================================
export async function createSettlement(
  theatreId: string,
  from: Date,
  to: Date,
  commissionRate: Decimal | number | string = 10
) {
  const bookings = await prisma.booking.findMany({
    where: {
      theatreId,
      createdAt: {
        gte: from,
        lte: to
      },
      status: "CONFIRMED"
    }
  });

  let gross = new Decimal(0);
  let refunds = new Decimal(0);

  for (const booking of bookings) {
    gross = gross.plus(booking.ticketAmount.toString());
  }

  const commission = gross.mul(new Decimal(commissionRate)).div(100);
  const net = gross.minus(commission).minus(refunds);

  return prisma.settlement.create({
    data: {
      theatreId,
      periodStart: from,
      periodEnd: to,
      grossSales: gross.toFixed(2),
      commission: commission.toFixed(2),
      refunds: refunds.toFixed(2),
      netAmount: net.toFixed(2),
      status: "PENDING"
    }
  });
}

// ==========================================
// 4. GET SETTLEMENTS LIST
// ==========================================
export async function getSettlements(theatreId?: string) {
  return prisma.settlement.findMany({
    where: theatreId ? { theatreId } : undefined,
    orderBy: { createdAt: "desc" }
  });
}

// ==========================================
// 5. GET SETTLEMENT REPORTS
// ==========================================
export async function getSettlementReports(params: {
  theatreId?: string;
  from?: string;
  to?: string;
}) {
  const fromDate = params.from ? new Date(params.from) : new Date(Date.now() - 30 * 86400 * 1000);
  const toDate = params.to ? new Date(params.to) : new Date();

  const salesData = await getSales(params.theatreId, fromDate, toDate);
  const settlements = await getSettlements(params.theatreId);

  return {
    reportGeneratedAt: new Date(),
    period: { from: fromDate, to: toDate },
    sales: salesData,
    settlementHistory: settlements,
    payoutSummary: {
      totalSettled: settlements.reduce((acc, s) => acc + Number(s.netAmount), 0).toFixed(2),
      pendingCount: settlements.filter(s => s.status === "PENDING").length
    }
  };
}
