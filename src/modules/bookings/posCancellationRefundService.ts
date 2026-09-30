import { integrationManager } from "../integrations/IntegrationManager";
import { posBookingTransactionService, TransactionRecord } from "./posBookingTransactionService";

export type CancellationStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "CANCELLED"
  | "FAILED"
  | "UNKNOWN";

export type RefundStatusType =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "UNKNOWN";

export interface CancellationRecord {
  cancellationId: string; // e.g. CVCAN-20260930-000001
  bookingId: string;
  posBookingId?: string;
  requestedBy: string;
  requestedAt: Date;
  cancellationStatus: CancellationStatus;
  posCancellationReference?: string;
  refundId?: string;
  refundStatus: RefundStatusType;
  completedAt?: Date;
  error?: string;
  retryCount: number;
}

export interface RefundRecord {
  refundId: string; // e.g. CVREF-CV-20260930-00125
  bookingId: string;
  paymentId: string;
  cancellationId: string;
  refundAmount: number;
  refundStatus: RefundStatusType;
  paymentGatewayRefundId?: string;
  requestedAt: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
}

/**
 * ============================================================================
 * PosCancellationRefundService
 * ============================================================================
 * Idempotent cancellation and refund transaction manager enforcing:
 * - Single cancellation transaction per booking (no duplicate cancellations)
 * - Single stable refund reference per payment (no duplicate refunds)
 * - Independent 5-state lifecycle tracking
 * - Safe timeout handling and query-before-retry
 * - Calculation of totalRefunded vs totalPaid (partial refund protection)
 */
export class PosCancellationRefundService {
  private static instance: PosCancellationRefundService;

  private cancellations: Map<string, CancellationRecord> = new Map(); // keyed by cancellationId and bookingId
  private refunds: Map<string, RefundRecord> = new Map(); // keyed by refundId and bookingId

  public static getInstance(): PosCancellationRefundService {
    if (!PosCancellationRefundService.instance) {
      PosCancellationRefundService.instance = new PosCancellationRefundService();
    }
    return PosCancellationRefundService.instance;
  }

  // --------------------------------------------------------------------------
  // 1. IDEMPOTENT CANCELLATION REQUEST
  // --------------------------------------------------------------------------
  async requestCancellation(params: {
    bookingId: string;
    requestedBy: string;
    reason?: string;
  }): Promise<CancellationRecord> {
    const { bookingId, requestedBy, reason } = params;

    // Check if an existing cancellation record exists for this booking
    const existing = this.cancellations.get(bookingId);
    if (existing) {
      // Idempotency: Return existing cancellation without dispatching a new POS call
      return existing;
    }

    const tx = posBookingTransactionService.getTransaction(bookingId);
    if (!tx) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (tx.bookingStatus !== "CONFIRMED") {
      throw new Error(`Cannot cancel booking: current status is ${tx.bookingStatus}`);
    }

    const cancellationId = `CVCAN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(100000 + Math.random() * 900000)}`;
    const record: CancellationRecord = {
      cancellationId,
      bookingId,
      posBookingId: tx.posBookingId,
      requestedBy,
      requestedAt: new Date(),
      cancellationStatus: "REQUESTED",
      refundStatus: "PENDING",
      retryCount: 0
    };

    this.cancellations.set(cancellationId, record);
    this.cancellations.set(bookingId, record);

    // Transition to Processing
    record.cancellationStatus = "PROCESSING";
    const adapter = integrationManager.getAdapterForTheatre(tx.theatreId);

    try {
      const posResult = await adapter.cancelBooking(bookingId, reason);
      record.cancellationStatus = "CANCELLED";
      record.posCancellationReference = posResult.posRefundId || `POS-CAN-${Date.now()}`;
      record.completedAt = new Date();

      // Update parent transaction state
      tx.bookingStatus = "CANCELLED";
      tx.posStatus = "CANCELLED";
      tx.cancelledAt = new Date();
      tx.auditTrail.push({
        timestamp: new Date().toISOString(),
        step: "CANCELLATION_CONFIRMED",
        message: `Idempotent cancellation ${cancellationId} finalized with POS ref ${record.posCancellationReference}.`
      });

      // Automatically trigger idempotent refund if payment was captured
      if (tx.paymentStatus === "SUCCESS" && tx.paymentId) {
        await this.processRefund({
          bookingId: tx.bookingId,
          paymentId: tx.paymentId,
          cancellationId,
          refundAmount: tx.amount,
          theatreId: tx.theatreId
        });
      }

      return record;
    } catch (err: any) {
      record.cancellationStatus = "FAILED";
      record.error = err.message;
      return record;
    }
  }

  // --------------------------------------------------------------------------
  // 2. IDEMPOTENT REFUND REQUEST WITH PARTIAL REFUND SAFEGUARD
  // --------------------------------------------------------------------------
  async processRefund(params: {
    bookingId: string;
    paymentId: string;
    cancellationId: string;
    refundAmount: number;
    theatreId: string;
  }): Promise<RefundRecord> {
    const { bookingId, paymentId, cancellationId, refundAmount, theatreId } = params;

    // Stable refund idempotency key: CVREF-<bookingId>
    const stableRefundKey = `CVREF-${bookingId}`;
    const existing = this.refunds.get(stableRefundKey) || this.refunds.get(bookingId);
    if (existing) {
      // Idempotency: Return existing refund record without creating duplicate gateway calls
      return existing;
    }

    const tx = posBookingTransactionService.getTransaction(bookingId);
    const totalPaid = tx ? tx.amount : refundAmount;

    // Financial check: verify refund amount does not exceed total paid
    const existingSuccessfulRefunds = Array.from(this.refunds.values())
      .filter(r => r.bookingId === bookingId && r.refundStatus === "SUCCESS")
      .reduce((sum, r) => sum + r.refundAmount, 0);

    if (existingSuccessfulRefunds + refundAmount > totalPaid) {
      throw new Error(`Refund amount ₹${refundAmount} exceeds remaining refundable balance (Total Paid: ₹${totalPaid}, Already Refunded: ₹${existingSuccessfulRefunds})`);
    }

    const refundRecord: RefundRecord = {
      refundId: stableRefundKey,
      bookingId,
      paymentId,
      cancellationId,
      refundAmount,
      refundStatus: "PROCESSING",
      requestedAt: new Date(),
      retryCount: 0
    };

    this.refunds.set(stableRefundKey, refundRecord);
    this.refunds.set(bookingId, refundRecord);

    const adapter = integrationManager.getAdapterForTheatre(theatreId);

    try {
      const refundResult = await adapter.refundBooking(bookingId, refundAmount);
      refundRecord.refundStatus = "SUCCESS";
      refundRecord.paymentGatewayRefundId = refundResult.refundId || `PG-RFD-${Date.now()}`;
      refundRecord.completedAt = new Date();

      // Update parent transaction and cancellation records
      if (tx) {
        tx.refundStatus = "COMPLETED";
        tx.auditTrail.push({
          timestamp: new Date().toISOString(),
          step: "REFUND_SUCCESS",
          message: `Idempotent refund ${stableRefundKey} of ₹${refundAmount} finalized via ${refundRecord.paymentGatewayRefundId}.`
        });
      }

      const canRecord = this.cancellations.get(bookingId);
      if (canRecord) {
        canRecord.refundId = stableRefundKey;
        canRecord.refundStatus = "SUCCESS";
      }

      return refundRecord;
    } catch (err: any) {
      refundRecord.refundStatus = "FAILED";
      refundRecord.error = err.message;

      const canRecord = this.cancellations.get(bookingId);
      if (canRecord) {
        canRecord.refundStatus = "FAILED";
      }

      return refundRecord;
    }
  }

  // --------------------------------------------------------------------------
  // 3. TIMEOUT & STATUS RECOVERY
  // --------------------------------------------------------------------------
  async recoverCancellationTimeout(bookingId: string): Promise<CancellationRecord> {
    const record = this.cancellations.get(bookingId);
    if (!record) throw new Error(`Cancellation for ${bookingId} not found`);

    record.cancellationStatus = "UNKNOWN";
    const tx = posBookingTransactionService.getTransaction(bookingId);
    if (!tx) return record;

    const adapter = integrationManager.getAdapterForTheatre(tx.theatreId);
    const statusCheck = await adapter.getBooking(bookingId);

    if (statusCheck && statusCheck.status === "CANCELLED") {
      record.cancellationStatus = "CANCELLED";
      record.completedAt = new Date();
      tx.bookingStatus = "CANCELLED";
      tx.posStatus = "CANCELLED";
    } else {
      record.cancellationStatus = "FAILED";
    }

    return record;
  }

  // --------------------------------------------------------------------------
  // 4. RESOLVE UNKNOWN REFUND VIA STATUS QUERY
  // --------------------------------------------------------------------------
  async resolveUnknownRefund(refundId: string, gatewayResult: { status: "SUCCESS" | "FAILED"; gatewayRefundId?: string }): Promise<RefundRecord | undefined> {
    const record = this.refunds.get(refundId);
    if (!record) return undefined;

    if (record.refundStatus === "UNKNOWN" || record.refundStatus === "PROCESSING") {
      record.refundStatus = gatewayResult.status;
      if (gatewayResult.status === "SUCCESS") {
        record.completedAt = new Date();
        record.paymentGatewayRefundId = gatewayResult.gatewayRefundId || record.paymentGatewayRefundId;
      }
    }
    return record;
  }

  getCancellation(id: string): CancellationRecord | undefined {
    return this.cancellations.get(id);
  }

  getRefund(id: string): RefundRecord | undefined {
    return this.refunds.get(id);
  }

  getAllCancellations(): CancellationRecord[] {
    return Array.from(new Set(this.cancellations.values()));
  }

  getAllRefunds(): RefundRecord[] {
    return Array.from(new Set(this.refunds.values()));
  }
}

export const posCancellationRefundService = PosCancellationRefundService.getInstance();
