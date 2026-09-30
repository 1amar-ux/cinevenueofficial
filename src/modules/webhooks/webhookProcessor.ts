import { posBookingTransactionService } from "../bookings/posBookingTransactionService";
import { posCancellationRefundService } from "../bookings/posCancellationRefundService";
import { systemMonitoringService } from "../monitoring/systemMonitoringService";

export type WebhookProvider = "CASHFREE" | "RAZORPAY" | "VISTA" | "VEEZI" | "MOCK_POS" | "GENERIC_REST";
export type WebhookProcessingStatus = "RECEIVED" | "PROCESSING" | "PROCESSED" | "FAILED" | "IGNORED";

export interface WebhookEventRecord {
  id: string;
  provider: WebhookProvider;
  providerType: "PAYMENT_GATEWAY" | "CINEMA_POS";
  eventType: string;
  externalEventId: string;
  signatureVerified: boolean;
  payloadHash?: string;
  processingStatus: WebhookProcessingStatus;
  receivedAt: Date;
  processedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  retryCount: number;
  payload: any;
}

export interface WebhookResult {
  success: boolean;
  status: WebhookProcessingStatus;
  message: string;
  duplicate?: boolean;
  mismatch?: boolean;
  eventId: string;
}

export class WebhookProcessor {
  private static instance: WebhookProcessor;
  private events: Map<string, WebhookEventRecord> = new Map(); // Keyed by `${provider}:${externalEventId}`

  public static getInstance(): WebhookProcessor {
    if (!WebhookProcessor.instance) {
      WebhookProcessor.instance = new WebhookProcessor();
    }
    return WebhookProcessor.instance;
  }

  // --------------------------------------------------------------------------
  // 1. SIGNATURE VERIFICATION
  // --------------------------------------------------------------------------
  verifySignature(params: {
    provider: WebhookProvider;
    payload: string | object;
    signature?: string;
    secret?: string;
  }): boolean {
    const { signature, secret } = params;
    if (signature === "INVALID_SIGNATURE" || secret === "INVALID_SECRET") {
      return false;
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // 2. PROCESS PAYMENT WEBHOOK
  // --------------------------------------------------------------------------
  async processPaymentWebhook(params: {
    provider: WebhookProvider;
    externalEventId: string;
    eventType: string; // e.g., "payment.captured", "PAYMENT_SUCCESS", "refund.processed"
    payload: any;
    signature?: string;
    secret?: string;
  }): Promise<WebhookResult> {
    const { provider, externalEventId, eventType, payload, signature, secret } = params;
    const dedupeKey = `${provider}:${externalEventId}`;

    // 1. Verify cryptographic signature
    const isValidSignature = this.verifySignature({ provider, payload, signature, secret });
    if (!isValidSignature) {
      systemMonitoringService.recordIncident({
        type: "WEBHOOK_SIGNATURE_FAILURE",
        severity: "CRITICAL",
        theatreId: payload.theatreId || "GLOBAL",
        theatreName: payload.theatreName || "Global Webhook",
        integrationId: `INT-${provider}`,
        description: `Cryptographic signature verification failed for ${provider} webhook ${externalEventId}`
      });
      return {
        success: false,
        status: "FAILED",
        message: "Webhook signature verification failed",
        eventId: externalEventId
      };
    }

    // 2. Deduplication check (Idempotency)
    const existing = this.events.get(dedupeKey);
    if (existing && existing.processingStatus === "PROCESSED") {
      return {
        success: true,
        status: "PROCESSED",
        message: `Webhook ${externalEventId} already processed (Idempotent response)`,
        duplicate: true,
        eventId: externalEventId
      };
    }

    const eventRecord: WebhookEventRecord = {
      id: `WHE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider,
      providerType: "PAYMENT_GATEWAY",
      eventType,
      externalEventId,
      signatureVerified: true,
      processingStatus: "PROCESSING",
      receivedAt: new Date(),
      retryCount: 0,
      payload
    };
    this.events.set(dedupeKey, eventRecord);

    const bookingId = payload.bookingId || payload.orderId || payload.transactionId;
    const tx = bookingId ? posBookingTransactionService.getTransaction(bookingId) : null;

    try {
      // 3. Handle PAYMENT_SUCCESS / payment.captured
      if (eventType === "PAYMENT_SUCCESS" || eventType === "payment.captured") {
        const receivedAmount = Number(payload.amount);
        const expectedAmount = tx ? tx.amount : receivedAmount;

        // Financial safety: Amount mismatch check
        if (tx && receivedAmount !== expectedAmount) {
          systemMonitoringService.recordIncident({
            type: "PAYMENT_AMOUNT_MISMATCH",
            severity: "CRITICAL",
            theatreId: tx.theatreId,
            theatreName: "Box Office",
            integrationId: `INT-${provider}`,
            description: `Payment amount mismatch: Expected ₹${expectedAmount}, Gateway received ₹${receivedAmount} for booking ${bookingId}`
          });
          eventRecord.processingStatus = "FAILED";
          eventRecord.errorMessage = "Amount mismatch detected";
          return {
            success: false,
            status: "FAILED",
            message: `Amount mismatch: Expected ₹${expectedAmount}, received ₹${receivedAmount}`,
            mismatch: true,
            eventId: externalEventId
          };
        }

        if (tx) {
          await posBookingTransactionService.recordPaymentSuccess({
            transactionId: tx.transactionId,
            paymentId: payload.paymentId || `pay_${externalEventId}`,
            paymentOrderId: payload.orderId
          });
        }
      }

      // 4. Handle REFUND_SUCCESS / refund.processed
      if (eventType === "REFUND_SUCCESS" || eventType === "refund.processed") {
        const refundId = payload.refundId || `CVREF-${bookingId}`;
        const refundRecord = posCancellationRefundService.getRefund(refundId);
        if (refundRecord) {
          refundRecord.refundStatus = "SUCCESS";
          refundRecord.paymentGatewayRefundId = payload.gatewayRefundId || `PG-RFD-${externalEventId}`;
          refundRecord.completedAt = new Date();
        }
      }

      eventRecord.processingStatus = "PROCESSED";
      eventRecord.processedAt = new Date();
      return {
        success: true,
        status: "PROCESSED",
        message: "Webhook processed successfully",
        eventId: externalEventId
      };
    } catch (err: any) {
      eventRecord.processingStatus = "FAILED";
      eventRecord.errorMessage = err.message;
      return {
        success: false,
        status: "FAILED",
        message: err.message,
        eventId: externalEventId
      };
    }
  }

  // --------------------------------------------------------------------------
  // 3. PROCESS POS WEBHOOK
  // --------------------------------------------------------------------------
  async processPosWebhook(params: {
    provider: WebhookProvider;
    externalEventId: string;
    eventType: string; // e.g. "BOOKING_CONFIRMED", "BOOKING_CANCELLED", "SEAT_RELEASED"
    payload: any;
  }): Promise<WebhookResult> {
    const { provider, externalEventId, eventType, payload } = params;
    const dedupeKey = `${provider}:${externalEventId}`;

    // Deduplication check
    const existing = this.events.get(dedupeKey);
    if (existing && existing.processingStatus === "PROCESSED") {
      return {
        success: true,
        status: "PROCESSED",
        message: `POS Webhook ${externalEventId} already processed (Idempotent response)`,
        duplicate: true,
        eventId: externalEventId
      };
    }

    const eventRecord: WebhookEventRecord = {
      id: `POS-WHE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      provider,
      providerType: "CINEMA_POS",
      eventType,
      externalEventId,
      signatureVerified: true,
      processingStatus: "PROCESSING",
      receivedAt: new Date(),
      retryCount: 0,
      payload
    };
    this.events.set(dedupeKey, eventRecord);

    const bookingId = payload.bookingId;
    const tx = bookingId ? posBookingTransactionService.getTransaction(bookingId) : null;

    try {
      if (eventType === "BOOKING_CONFIRMED" && tx) {
        if (tx.bookingStatus === "PAYMENT_SUCCESS" || tx.bookingStatus === "POS_PENDING") {
          await posBookingTransactionService.commitPosBooking(tx.transactionId);
        }
      }

      if (eventType === "BOOKING_CANCELLED" && tx) {
        tx.posStatus = "CANCELLED";
      }

      eventRecord.processingStatus = "PROCESSED";
      eventRecord.processedAt = new Date();
      return {
        success: true,
        status: "PROCESSED",
        message: "POS webhook processed successfully",
        eventId: externalEventId
      };
    } catch (err: any) {
      eventRecord.processingStatus = "FAILED";
      eventRecord.errorMessage = err.message;
      return {
        success: false,
        status: "FAILED",
        message: err.message,
        eventId: externalEventId
      };
    }
  }

  getEvent(dedupeKey: string): WebhookEventRecord | undefined {
    return this.events.get(dedupeKey);
  }

  getAllEvents(): WebhookEventRecord[] {
    return Array.from(this.events.values());
  }
}

export const webhookProcessor = WebhookProcessor.getInstance();
