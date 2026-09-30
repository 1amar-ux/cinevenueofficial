import { integrationManager } from "../integrations/IntegrationManager";
import { POSIntegration } from "../integrations/interfaces/CinemaAdapter";

export type BookingState =
  | "SELECTION"
  | "SEAT_HELD"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUCCESS"
  | "POS_PENDING"
  | "CONFIRMED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export type PaymentState =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type PosState =
  | "NOT_INITIATED"
  | "HELD"
  | "POS_PENDING"
  | "CONFIRMED"
  | "FAILED"
  | "STATUS_UNKNOWN"
  | "CANCELLED";

export type RefundState =
  | "NONE"
  | "PENDING"
  | "INITIATED"
  | "COMPLETED"
  | "FAILED";

export interface TransactionRecord {
  transactionId: string; // Idempotency key (e.g. CVTX-20260930-000001)
  bookingId: string; // CineVenue Booking ID (e.g. CV-20260930-1092)
  posBookingId?: string; // Box Office POS confirmation ID
  posHoldToken?: string;
  theatreId: string;
  screenId: string;
  movieId: string;
  showId: string;
  userId: string;
  seatIds: string[];
  amount: number;
  paymentId?: string;
  paymentOrderId?: string;
  
  // Independent Status Fields
  bookingStatus: BookingState;
  paymentStatus: PaymentState;
  posStatus: PosState;
  refundStatus: RefundState;

  holdExpiresAt?: Date;
  createdAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  error?: string;
  auditTrail: { timestamp: string; step: string; message: string }[];
}

/**
 * ============================================================================
 * PosBookingTransactionService
 * ============================================================================
 * Authoritative transaction coordinator enforcing CineVenue's distributed
 * booking transaction boundaries and failure recovery policies.
 *
 * Core Rule: PAYMENT_SUCCESS != BOOKING_CONFIRMED
 */
export class PosBookingTransactionService {
  private static instance: PosBookingTransactionService;
  private transactions: Map<string, TransactionRecord> = new Map();
  private processedPaymentIds: Set<string> = new Set();

  public static getInstance(): PosBookingTransactionService {
    if (!PosBookingTransactionService.instance) {
      PosBookingTransactionService.instance = new PosBookingTransactionService();
    }
    return PosBookingTransactionService.instance;
  }

  // --------------------------------------------------------------------------
  // BOUNDARY 1: SEAT AVAILABILITY CHECK
  // --------------------------------------------------------------------------
  async checkAvailability(theatreId: string, showId: string) {
    const adapter = integrationManager.getAdapterForTheatre(theatreId);
    return adapter.getSeatAvailability(showId);
  }

  // --------------------------------------------------------------------------
  // BOUNDARY 2: TEMPORARY SEAT RESERVATION / HOLD
  // --------------------------------------------------------------------------
  async requestSeatHold(params: {
    theatreId: string;
    screenId: string;
    movieId: string;
    showId: string;
    userId: string;
    seatIds: string[];
    amount: number;
  }): Promise<TransactionRecord> {
    const transactionId = `CVTX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingId = `CV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const adapter = integrationManager.getAdapterForTheatre(params.theatreId);
    const holdResult = await adapter.holdSeats(params.showId, params.seatIds, params.userId);

    const record: TransactionRecord = {
      transactionId,
      bookingId,
      posHoldToken: holdResult.holdToken,
      theatreId: params.theatreId,
      screenId: params.screenId,
      movieId: params.movieId,
      showId: params.showId,
      userId: params.userId,
      seatIds: params.seatIds,
      amount: params.amount,
      bookingStatus: "SEAT_HELD",
      paymentStatus: "PENDING",
      posStatus: "HELD",
      refundStatus: "NONE",
      holdExpiresAt: holdResult.lockedUntil,
      createdAt: new Date(),
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          step: "SEAT_HELD",
          message: `POS hold acquired for seats: ${params.seatIds.join(", ")} (Hold Token: ${holdResult.holdToken || "N/A"})`
        }
      ]
    };

    this.transactions.set(transactionId, record);
    this.transactions.set(bookingId, record);
    return record;
  }

  // --------------------------------------------------------------------------
  // BOUNDARY 3: PAYMENT ORDER & VERIFICATION (PAYMENT_SUCCESS != CONFIRMED)
  // --------------------------------------------------------------------------
  async recordPaymentSuccess(params: {
    transactionId: string;
    paymentId: string;
    paymentOrderId?: string;
  }): Promise<TransactionRecord> {
    const record = this.transactions.get(params.transactionId);
    if (!record) throw new Error(`Transaction ${params.transactionId} not found`);

    // Idempotency: Prevent duplicate payment callback processing
    if (this.processedPaymentIds.has(params.paymentId) && record.paymentStatus === "SUCCESS") {
      record.auditTrail.push({
        timestamp: new Date().toISOString(),
        step: "DUPLICATE_PAYMENT_IGNORED",
        message: `Duplicate payment callback for ${params.paymentId} safely ignored.`
      });
      return record;
    }

    // Check Seat Hold Expiry before accepting payment
    if (record.holdExpiresAt && new Date() > record.holdExpiresAt && record.bookingStatus === "SEAT_HELD") {
      record.bookingStatus = "EXPIRED";
      record.paymentStatus = "SUCCESS"; // Payment arrived but hold expired
      record.posStatus = "FAILED";
      record.refundStatus = "PENDING";
      record.auditTrail.push({
        timestamp: new Date().toISOString(),
        step: "HOLD_EXPIRED_DURING_PAYMENT",
        message: "Payment received after seat hold expired. Initiating automatic refund recovery."
      });
      return record;
    }

    record.paymentId = params.paymentId;
    record.paymentOrderId = params.paymentOrderId;
    record.paymentStatus = "SUCCESS";
    record.bookingStatus = "PAYMENT_SUCCESS"; // Explicit intermediate state!
    record.posStatus = "POS_PENDING";
    this.processedPaymentIds.add(params.paymentId);

    record.auditTrail.push({
      timestamp: new Date().toISOString(),
      step: "PAYMENT_SUCCESS",
      message: `Gateway payment ${params.paymentId} confirmed. Ready for POS booking commit.`
    });

    return record;
  }

  // --------------------------------------------------------------------------
  // BOUNDARY 4: REAL POS BOOKING COMMIT & FINAL CONFIRMATION
  // --------------------------------------------------------------------------
  async commitPosBooking(transactionId: string): Promise<TransactionRecord> {
    const record = this.transactions.get(transactionId);
    if (!record) throw new Error(`Transaction ${transactionId} not found`);

    if (record.paymentStatus !== "SUCCESS") {
      throw new Error(`Cannot commit POS booking: Payment status is ${record.paymentStatus}`);
    }

    // If already confirmed, return existing state (Idempotency)
    if (record.bookingStatus === "CONFIRMED" && record.posBookingId) {
      return record;
    }

    const adapter = integrationManager.getAdapterForTheatre(record.theatreId);

    try {
      record.bookingStatus = "POS_PENDING";
      record.posStatus = "POS_PENDING";

      const posResult = await adapter.createBooking({
        bookingId: record.bookingId,
        theatreId: record.theatreId,
        screenId: record.screenId,
        movieId: record.movieId,
        showId: record.showId,
        userId: record.userId,
        seatIds: record.seatIds,
        amount: record.amount,
        holdToken: record.posHoldToken
      });

      if (!posResult || !posResult.posBookingId) {
        throw new Error("POS returned empty booking response");
      }

      // Final Commit Point: POS Confirmed + CineVenue Confirmed
      record.posBookingId = posResult.posBookingId;
      record.posStatus = "CONFIRMED";
      record.bookingStatus = "CONFIRMED";
      record.confirmedAt = new Date();

      record.auditTrail.push({
        timestamp: new Date().toISOString(),
        step: "POS_CONFIRMED",
        message: `POS booking finalized with Box Office ID: ${posResult.posBookingId}. Ticket confirmed.`
      });

      return record;
    } catch (err: any) {
      // ----------------------------------------------------------------------
      // FAILURE RECOVERY: Payment Successful + POS Booking Failed
      // ----------------------------------------------------------------------
      record.bookingStatus = "FAILED";
      record.posStatus = "FAILED";
      record.refundStatus = "PENDING"; // Trigger automatic refund
      record.error = err.message || "POS booking transaction declined";

      record.auditTrail.push({
        timestamp: new Date().toISOString(),
        step: "POS_BOOKING_FAILED",
        message: `POS declined booking (${err.message}). Payment retained in escrow; auto-refund marked PENDING.`
      });

      // Release any stale hold if possible
      try {
        await adapter.releaseSeats(record.showId, record.seatIds, record.posHoldToken);
      } catch (releaseErr) {
        // Log release attempt
      }

      return record;
    }
  }

  // --------------------------------------------------------------------------
  // BOUNDARY 5: POS TIMEOUT & IDEMPOTENT STATUS VERIFICATION
  // --------------------------------------------------------------------------
  async handlePosTimeout(transactionId: string): Promise<TransactionRecord> {
    const record = this.transactions.get(transactionId);
    if (!record) throw new Error(`Transaction ${transactionId} not found`);

    record.posStatus = "STATUS_UNKNOWN";
    record.auditTrail.push({
      timestamp: new Date().toISOString(),
      step: "POS_TIMEOUT",
      message: "POS response timed out. Initiating status check before attempting safe retry."
    });

    const adapter = integrationManager.getAdapterForTheatre(record.theatreId);
    try {
      const statusCheck = await adapter.getBooking(record.bookingId);
      if (statusCheck && statusCheck.status === "CONFIRMED") {
        record.posBookingId = statusCheck.posBookingId;
        record.posStatus = "CONFIRMED";
        record.bookingStatus = "CONFIRMED";
        record.confirmedAt = new Date();
        record.auditTrail.push({
          timestamp: new Date().toISOString(),
          step: "POS_STATUS_RECOVERED",
          message: `POS status check confirmed original booking (${record.posBookingId}).`
        });
      } else {
        record.bookingStatus = "FAILED";
        record.posStatus = "FAILED";
        record.refundStatus = "PENDING";
        record.auditTrail.push({
          timestamp: new Date().toISOString(),
          step: "POS_NOT_FOUND_REFUNDING",
          message: "POS status check confirmed booking was not recorded. Refund initiated."
        });
      }
    } catch (checkErr: any) {
      record.error = "POS status inquiry unreachable";
    }

    return record;
  }

  // --------------------------------------------------------------------------
  // BOUNDARY 6: CANCELLATION & SEAT RELEASE TRANSACTION
  // --------------------------------------------------------------------------
  async cancelBooking(bookingId: string, reason?: string): Promise<TransactionRecord> {
    const record = this.transactions.get(bookingId);
    if (!record) throw new Error(`Booking ${bookingId} not found`);

    if (record.bookingStatus === "CANCELLED") {
      return record;
    }

    const adapter = integrationManager.getAdapterForTheatre(record.theatreId);
    const cancelResult = await adapter.cancelBooking(bookingId, reason);

    record.bookingStatus = "CANCELLED";
    record.posStatus = "CANCELLED";
    record.cancelledAt = new Date();
    record.refundStatus = "PENDING";

    record.auditTrail.push({
      timestamp: new Date().toISOString(),
      step: "CANCELLED",
      message: `POS cancellation verified (Refund ID: ${cancelResult.posRefundId || "N/A"}). Seats released.`
    });

    // Execute Refund
    const refundResult = await adapter.refundBooking(bookingId, record.amount);
    record.refundStatus = "COMPLETED";
    record.auditTrail.push({
      timestamp: new Date().toISOString(),
      step: "REFUND_COMPLETED",
      message: `Full refund of ₹${record.amount} processed (Refund Ref: ${refundResult.refundId}).`
    });

    return record;
  }

  // --------------------------------------------------------------------------
  // LOOKUP & QUERY
  // --------------------------------------------------------------------------
  getTransaction(id: string): TransactionRecord | undefined {
    return this.transactions.get(id);
  }

  getAllTransactions(): TransactionRecord[] {
    return Array.from(new Set(this.transactions.values()));
  }
}

export const posBookingTransactionService = PosBookingTransactionService.getInstance();
