import { posBookingTransactionService, TransactionRecord } from "../bookings/posBookingTransactionService";
import { posCancellationRefundService, RefundRecord } from "../bookings/posCancellationRefundService";
import { systemMonitoringService } from "../monitoring/systemMonitoringService";
import { integrationManager } from "../integrations/IntegrationManager";

export type ReconciliationStatus = "MATCHED" | "MISMATCH" | "REQUIRES_REVIEW" | "RESOLVED";

export type DiscrepancyProblemType =
  | "PAYMENT_SUCCESS_POS_FAILED"
  | "PAYMENT_SUCCESS_POS_UNKNOWN"
  | "POS_CONFIRMED_CINEVENUE_PENDING"
  | "CINEVENUE_CONFIRMED_POS_UNKNOWN"
  | "CINEVENUE_CANCELLED_POS_CONFIRMED"
  | "REFUND_SUCCESS_CINEVENUE_PENDING"
  | "REFUND_UNKNOWN"
  | "PAYMENT_AMOUNT_MISMATCH"
  | "POS_AMOUNT_MISMATCH"
  | "WEBHOOK_STATE_CONFLICT"
  | "DUPLICATE_TRANSACTION"
  | "OTHER";

export interface ReconciliationItem {
  id: string;
  bookingId: string;
  paymentId?: string;
  posBookingId?: string;
  refundId?: string;
  status: ReconciliationStatus;
  problemType: DiscrepancyProblemType;
  details: string;
  lastCheckedAt: Date;
  resolvedAt?: Date;
  resolutionAction?: string;
  resolutionActor?: string;
}

export class ReconciliationEngine {
  private static instance: ReconciliationEngine;
  private records: Map<string, ReconciliationItem> = new Map();

  public static getInstance(): ReconciliationEngine {
    if (!ReconciliationEngine.instance) {
      ReconciliationEngine.instance = new ReconciliationEngine();
    }
    return ReconciliationEngine.instance;
  }

  // --------------------------------------------------------------------------
  // 1. RUN 3-WAY RECONCILIATION SCAN
  // --------------------------------------------------------------------------
  async runReconciliationScan(): Promise<{
    scannedCount: number;
    matchedCount: number;
    discrepancyCount: number;
    discrepancies: ReconciliationItem[];
  }> {
    const transactions = posBookingTransactionService.getAllTransactions();
    let matchedCount = 0;
    const newDiscrepancies: ReconciliationItem[] = [];

    for (const tx of transactions) {
      const discrepancy = await this.auditTransaction(tx);
      if (discrepancy) {
        this.records.set(discrepancy.id, discrepancy);
        newDiscrepancies.push(discrepancy);
      } else {
        matchedCount++;
      }
    }

    return {
      scannedCount: transactions.length,
      matchedCount,
      discrepancyCount: newDiscrepancies.length,
      discrepancies: newDiscrepancies
    };
  }

  // --------------------------------------------------------------------------
  // 2. AUDIT SINGLE TRANSACTION AGAINST 6 CORE CASES
  // --------------------------------------------------------------------------
  async auditTransaction(tx: TransactionRecord): Promise<ReconciliationItem | null> {
    const { bookingId, paymentStatus, posStatus, bookingStatus, paymentId, posBookingId } = tx;

    // Case 1: Payment Success, POS Failed
    if (paymentStatus === "SUCCESS" && posStatus === "FAILED") {
      const recId = `REC-PSPF-${bookingId}`;
      const existing = this.records.get(recId);
      if (existing) return existing;

      const item: ReconciliationItem = {
        id: recId,
        bookingId,
        paymentId,
        posBookingId,
        status: "REQUIRES_REVIEW",
        problemType: "PAYMENT_SUCCESS_POS_FAILED",
        details: `Payment was captured for ₹${tx.amount}, but POS booking failed. Refund must be initiated.`,
        lastCheckedAt: new Date()
      };
      systemMonitoringService.recordIncident({
        type: "PAYMENT_POS_MISMATCH",
        severity: "CRITICAL",
        theatreId: tx.theatreId,
        theatreName: "Box Office",
        integrationId: `INT-${tx.theatreId}`,
        description: `Booking ${bookingId}: Payment captured but POS failed. Escalating refund.`
      });
      return item;
    }

    // Case 2: Payment Success, POS Unknown
    if (paymentStatus === "SUCCESS" && (posStatus === "STATUS_UNKNOWN" || posStatus === "POS_PENDING") && (bookingStatus === "POS_PENDING" || bookingStatus === "PAYMENT_SUCCESS")) {
      const recId = `REC-PSPU-${bookingId}`;
      return {
        id: recId,
        bookingId,
        paymentId,
        posBookingId,
        status: "REQUIRES_REVIEW",
        problemType: "PAYMENT_SUCCESS_POS_UNKNOWN",
        details: `Payment confirmed but POS booking status is unknown/pending. Safe status check required.`,
        lastCheckedAt: new Date()
      };
    }

    // Case 3: POS Confirmed, CineVenue Pending
    if (posStatus === "CONFIRMED" && (bookingStatus === "POS_PENDING" || bookingStatus === "PAYMENT_SUCCESS")) {
      const recId = `REC-PCCVP-${bookingId}`;
      return {
        id: recId,
        bookingId,
        paymentId,
        posBookingId,
        status: "REQUIRES_REVIEW",
        problemType: "POS_CONFIRMED_CINEVENUE_PENDING",
        details: `POS confirmed booking but CineVenue booking state is still pending. Safe dual-commit required.`,
        lastCheckedAt: new Date()
      };
    }

    // Case 4: CineVenue Cancelled, POS Confirmed
    if (bookingStatus === "CANCELLED" && posStatus === "CONFIRMED") {
      const recId = `REC-CCPC-${bookingId}`;
      const item: ReconciliationItem = {
        id: recId,
        bookingId,
        paymentId,
        posBookingId,
        status: "REQUIRES_REVIEW",
        problemType: "CINEVENUE_CANCELLED_POS_CONFIRMED",
        details: `CRITICAL: CineVenue booking is marked CANCELLED but POS still shows CONFIRMED! Seat release required.`,
        lastCheckedAt: new Date()
      };
      systemMonitoringService.recordIncident({
        type: "CANCELLATION_STUCK",
        severity: "CRITICAL",
        theatreId: tx.theatreId,
        theatreName: "Box Office",
        integrationId: `INT-${tx.theatreId}`,
        description: `CRITICAL: CineVenue booking ${bookingId} cancelled but POS seats still confirmed.`
      });
      return item;
    }

    return null;
  }

  // --------------------------------------------------------------------------
  // 3. SAFE RECOVERY RESOLUTION ACTIONS (QUERY-BEFORE-RETRY)
  // --------------------------------------------------------------------------
  async resolveCase(params: {
    reconciliationId: string;
    action: "QUERY_POS_STATUS" | "COMMIT_CINEVENUE_BOOKING" | "TRIGGER_REFUND" | "RELEASE_POS_SEATS";
    actor: string;
  }): Promise<{ success: boolean; message: string; record?: ReconciliationItem }> {
    const { reconciliationId, action, actor } = params;
    const item = this.records.get(reconciliationId);
    if (!item) {
      return { success: false, message: `Reconciliation item ${reconciliationId} not found` };
    }

    const tx = posBookingTransactionService.getTransaction(item.bookingId);
    if (!tx) {
      return { success: false, message: `Transaction ${item.bookingId} not found` };
    }

    const adapter = integrationManager.getAdapterForTheatre(tx.theatreId);

    if (action === "QUERY_POS_STATUS") {
      const check = await adapter.getBooking(tx.bookingId);
      if (check && check.status === "CONFIRMED") {
        await posBookingTransactionService.commitPosBooking(tx.transactionId);
        item.status = "RESOLVED";
        item.resolvedAt = new Date();
        item.resolutionAction = "POS status confirmed and attached to CineVenue booking";
        item.resolutionActor = actor;
        return { success: true, message: "POS status confirmed and resolved", record: item };
      }
    }

    if (action === "COMMIT_CINEVENUE_BOOKING" && item.problemType === "POS_CONFIRMED_CINEVENUE_PENDING") {
      await posBookingTransactionService.commitPosBooking(tx.transactionId);
      item.status = "RESOLVED";
      item.resolvedAt = new Date();
      item.resolutionAction = "CineVenue booking confirmed following POS verification";
      item.resolutionActor = actor;
      return { success: true, message: "Booking confirmed successfully", record: item };
    }

    if (action === "TRIGGER_REFUND") {
      if (tx.paymentId) {
        await posCancellationRefundService.processRefund({
          bookingId: tx.bookingId,
          paymentId: tx.paymentId,
          cancellationId: `CVCAN-RECON-${Date.now()}`,
          refundAmount: tx.amount,
          theatreId: tx.theatreId
        });
        item.status = "RESOLVED";
        item.resolvedAt = new Date();
        item.resolutionAction = "Escrow payment refunded following POS failure";
        item.resolutionActor = actor;
        return { success: true, message: "Refund processed successfully", record: item };
      }
    }

    if (action === "RELEASE_POS_SEATS" && item.problemType === "CINEVENUE_CANCELLED_POS_CONFIRMED") {
      await adapter.cancelBooking(tx.bookingId, "Reconciliation cancellation sync");
      tx.posStatus = "CANCELLED";
      item.status = "RESOLVED";
      item.resolvedAt = new Date();
      item.resolutionAction = "POS seats released and synchronized with CineVenue cancellation";
      item.resolutionActor = actor;
      return { success: true, message: "POS seats released successfully", record: item };
    }

    return { success: false, message: "Action could not be applied", record: item };
  }

  getRecords(): ReconciliationItem[] {
    return Array.from(this.records.values());
  }

  getRecord(id: string): ReconciliationItem | undefined {
    return this.records.get(id);
  }
}

export const reconciliationEngine = ReconciliationEngine.getInstance();
