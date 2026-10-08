import apiClient from "./apiClient";

export interface CreateRazorpayOrderRequest {
  bookingId?: string;
  amount: number; // in rupees or paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
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
  orderData?: RazorpayOrderData;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  preferredMethod?: 'upi' | 'card' | 'netbanking' | 'wallet' | string;
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

  const resolvedOrderId = options.orderId || orderData?.orderId || orderData?.order_id || "";
  const resolvedKey = options.keyId || orderData?.keyId || orderData?.key_id || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_TkyaAeNaWcbJho";
  const resolvedAmount = options.amount !== undefined ? options.amount : (orderData?.amount || 0);
  const resolvedCurrency = options.currency || orderData?.currency || "INR";
  const resolvedName = options.name || "CineVenue Entertainments";
  const resolvedDesc = options.description || (orderData?.isTestMode ? "🎟️ CineVenue Test Mode Checkout" : "🎟️ CineVenue Ticket Checkout");

  const logoUrl = typeof window !== "undefined"
    ? `${window.location.origin}/logo.jpg`
    : "https://www.cinevenue.com/logo.jpg";

  const rzpOptions: any = {
    key: resolvedKey,
    amount: resolvedAmount, // in paise
    currency: resolvedCurrency,
    name: resolvedName,
    description: resolvedDesc,
    image: logoUrl,
    order_id: resolvedOrderId,
    prefill: {
      name: prefill?.name || "CineVenue Guest",
      email: prefill?.email || "guest@cinevenue.in",
      contact: prefill?.contact || "9876543210",
      method: options.preferredMethod === 'card' ? 'card' : 'upi'
    },
    notes: {
      ...(notes || {}),
      ...(options.preferredMethod ? { preferred_channel: options.preferredMethod } : {})
    },
    config: {
      display: {
        blocks: {
          upi: {
            name: "Pay using UPI (Google Pay, PhonePe, Paytm, QR)",
            instruments: [
              { method: "upi" }
            ]
          },
          other: {
            name: "Cards, NetBanking & Wallets",
            instruments: [
              { method: "card" },
              { method: "netbanking" },
              { method: "wallet" }
            ]
          }
        },
        sequence: options.preferredMethod === 'card'
          ? ["block.other", "block.upi"]
          : ["block.upi", "block.other"],
        preferences: {
          show_default_blocks: true
        }
      }
    },
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
          razorpay_order_id: response.razorpay_order_id || resolvedOrderId,
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

/**
 * Standard Razorpay Web Checkout Integration Flow:
 * 1. Calls backend POST /api/create-order
 * 2. Opens official Razorpay modal with returned order_id
 * 3. On success, sends { razorpay_order_id, razorpay_payment_id, razorpay_signature } to backend POST /api/verify-payment
 */
export async function standardRazorpayCheckout(params: {
  amount: number; // in paise (e.g. 50000 for ₹500)
  currency?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess?: (verifyData: any) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error("Unable to load Razorpay Checkout SDK. Please verify your connection.");
  }

  // 1. Call Backend to Create Order (POST /api/create-order)
  const orderRes = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: params.amount,
      currency: params.currency || "INR",
      receipt: `rcpt_${Date.now()}`
    })
  });

  const orderData = await orderRes.json();
  if (!orderRes.ok || !orderData.success) {
    throw new Error(orderData.message || "Failed to create order on server.");
  }

  const key = orderData.key_id || orderData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "";

  // 2. Open Razorpay Checkout Modal
  const options = {
    key,
    amount: orderData.amount,
    currency: orderData.currency || "INR",
    name: params.name || "CineVenue",
    description: params.description || "Secure Checkout",
    order_id: orderData.order_id,
    prefill: params.prefill || {},
    theme: { color: "#D4AF37" },
    modal: {
      ondismiss: () => {
        if (params.onDismiss) params.onDismiss();
      }
    },
    handler: async (response: any) => {
      // 3. Verify Payment on Backend (POST /api/verify-payment)
      try {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          })
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.message || "Payment verification failed.");
        }

        if (params.onSuccess) params.onSuccess(verifyData);
      } catch (vErr: any) {
        if (params.onFailure) params.onFailure(vErr);
      }
    }
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.on("payment.failed", (errResponse: any) => {
    if (params.onFailure) {
      params.onFailure(new Error(errResponse.error?.description || "Payment failed"));
    }
  });
  rzp.open();
}
