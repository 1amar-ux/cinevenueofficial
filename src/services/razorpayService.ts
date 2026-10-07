import apiClient from "./apiClient";

export interface CreateRazorpayOrderRequest {
  bookingId?: string;
  amount: number; // in rupees
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  showId?: string;
  eventId?: string;
  eventTitle?: string;
  tickets?: Array<{ seatId?: string; price: number; name?: string }>;
}

export interface RazorpayOrderData {
  orderId: string;
  order_id: string;
  amount: number; // in paise
  amountInINR: number;
  currency: string;
  keyId: string;
  key_id: string;
  isTestMode: boolean;
  bookingId?: string;
}

export interface RazorpayCheckoutOptions {
  orderData: RazorpayOrderData;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  onSuccess: (paymentResult: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
  }) => void | Promise<void>;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn("Failed to load Razorpay Checkout SDK script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Creates an authorized Razorpay Order on the backend
 */
export async function createRazorpayOrder(params: CreateRazorpayOrderRequest): Promise<RazorpayOrderData> {
  const response = await apiClient.post("/payments/razorpay/create-order", params);
  const data = response.data;

  if (!data || !data.success) {
    throw new Error(data?.message || "Failed to initialize Razorpay payment order.");
  }

  return {
    orderId: data.orderId || data.order_id,
    order_id: data.order_id || data.orderId,
    amount: data.amount,
    amountInINR: data.amountInINR || data.amount / 100,
    currency: data.currency || "INR",
    keyId: data.keyId || data.key_id,
    key_id: data.key_id || data.keyId,
    isTestMode: Boolean(data.isTestMode),
    bookingId: data.bookingId
  };
}

/**
 * Cryptographically verifies Razorpay payment signature on the backend
 */
export async function verifyRazorpayPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  bookingId?: string;
}): Promise<{ success: boolean; message: string; verified: boolean }> {
  const response = await apiClient.post("/payments/razorpay/verify-payment", params);
  return response.data;
}

/**
 * Triggers the official Razorpay Checkout Popup modal (Supports Test Mode & Cards/UPI)
 */
export async function triggerRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error("Razorpay Checkout SDK is unavailable. Please check your internet connection.");
  }

  const { orderData, prefill, notes, onSuccess, onFailure, onDismiss } = options;

  const rzpOptions: any = {
    key: orderData.keyId || orderData.key_id || "rzp_test_TB7njDD8MonAMK",
    amount: orderData.amount, // in paise
    currency: orderData.currency || "INR",
    name: "CineVenue Entertainments",
    description: orderData.isTestMode ? "🎟️ CineVenue Test Mode Checkout" : "🎟️ CineVenue Ticket Checkout",
    image: "/logo.jpg",
    order_id: orderData.orderId,
    prefill: {
      name: prefill?.name || "CineVenue Guest",
      email: prefill?.email || "guest@cinevenue.in",
      contact: prefill?.contact || "9876543210"
    },
    notes: notes || {},
    theme: {
      color: "#D4AF37", // CineVenue Luxury Gold
      backdrop_color: "rgba(0, 0, 0, 0.85)"
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
      confirm_close: true,
      animation: true
    },
    handler: async (response: any) => {
      try {
        await onSuccess({
          razorpay_order_id: response.razorpay_order_id || orderData.orderId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
      } catch (err: any) {
        if (onFailure) onFailure(err);
      }
    }
  };

  const rzpInstance = new (window as any).Razorpay(rzpOptions);

  rzpInstance.on("payment.failed", (response: any) => {
    console.error("Razorpay payment failure:", response.error);
    if (onFailure) {
      onFailure(new Error(response.error?.description || "Payment was rejected or cancelled."));
    }
  });

  rzpInstance.open();
}
