/**
 * CineVenue Cashfree Payments SDK Integration Service
 *
 * Provides dynamic SDK loading, drop checkout initiation, and server-side verification.
 */

declare global {
  interface Window {
    Cashfree?: (config: { mode: "sandbox" | "production" }) => any;
  }
}

let cashfreeSdkPromise: Promise<any> | null = null;

/**
 * Load Cashfree JS SDK v3 asynchronously
 */
export function loadCashfreeSdk(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cashfree SDK can only be loaded in a browser context."));
  }

  if (window.Cashfree) {
    return Promise.resolve(window.Cashfree);
  }

  if (cashfreeSdkPromise) {
    return cashfreeSdkPromise;
  }

  cashfreeSdkPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.Cashfree));
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Cashfree SDK script.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error("Cashfree SDK script loaded but window.Cashfree is unavailable."));
      }
    };
    script.onerror = () => {
      reject(new Error("Network error loading Cashfree SDK."));
    };
    document.head.appendChild(script);
  });

  return cashfreeSdkPromise;
}

export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  orderId: string;
  environment?: "TEST" | "PROD";
  redirectTarget?: "_modal" | "_self";
  onSuccess?: (data: any) => void;
  onFailure?: (data: any) => void;
  onClose?: () => void;
}

/**
 * Initiate Cashfree Drop Modal Checkout
 */
export async function triggerCashfreeCheckout(options: CashfreeCheckoutOptions): Promise<any> {
  const isProd = options.environment === "PROD";
  const mode = isProd ? "production" : "sandbox";

  // If this is a sandbox simulation session (e.g. offline dev mode without live credentials)
  if (options.paymentSessionId.startsWith("session_sim_")) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const simulatedResult = {
          paymentDetails: {
            orderId: options.orderId,
            paymentStatus: "SUCCESS",
            isSimulated: true
          }
        };
        if (options.onSuccess) options.onSuccess(simulatedResult);
        resolve(simulatedResult);
      }, 1000);
    });
  }

  try {
    const CashfreeFactory = await loadCashfreeSdk();
    const cashfree = CashfreeFactory({ mode });

    return new Promise((resolve, reject) => {
      cashfree.checkout({
        paymentSessionId: options.paymentSessionId,
        redirectTarget: options.redirectTarget || "_modal"
      }).then((result: any) => {
        if (result?.error) {
          if (options.onFailure) options.onFailure(result.error);
          reject(result.error);
        } else if (result?.paymentDetails) {
          if (options.onSuccess) options.onSuccess(result);
          resolve(result);
        } else {
          resolve(result);
        }
      }).catch((err: any) => {
        if (options.onFailure) options.onFailure(err);
        reject(err);
      });
    });
  } catch (err: any) {
    console.warn("Cashfree SDK launch notice:", err.message);
    throw err;
  }
}

/**
 * Create Cashfree Order for Movie Booking
 */
export async function createMovieBookingCashfreeOrder(params: {
  bookingId?: string;
  amount?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  showId?: string;
  tickets?: any[];
}): Promise<any> {
  const token = localStorage.getItem("token") || localStorage.getItem("cine_auth_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/v1/payments/cashfree/create-order", {
    method: "POST",
    headers,
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || data?.message || "Failed to create Cashfree payment order");
  }

  return data.data;
}

/**
 * Verify Cashfree Payment for Movie Booking
 */
export async function verifyMovieBookingCashfreePayment(params: {
  bookingId?: string;
  orderId: string;
}): Promise<any> {
  const token = localStorage.getItem("token") || localStorage.getItem("cine_auth_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/v1/payments/cashfree/verify", {
    method: "POST",
    headers,
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || data?.message || "Failed to verify Cashfree payment");
  }

  return data.data;
}

/**
 * Create Cashfree Order for Event Ticket Booking
 */
export async function createEventBookingCashfreeOrder(params: {
  eventId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  ticketCount: number;
}): Promise<any> {
  const token = localStorage.getItem("token") || localStorage.getItem("cine_auth_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/v1/payments/cashfree/create-order", {
    method: "POST",
    headers,
    body: JSON.stringify({
      bookingId: `EVT_${params.eventId}_${Date.now()}`.substring(0, 45),
      amount: params.amount,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      showId: params.eventId,
      tickets: [{ price: params.amount }]
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || data?.message || "Failed to create Cashfree order for event");
  }

  return data.data;
}

/**
 * Verify Cashfree Payment for Event Ticket Booking
 */
export async function verifyEventBookingCashfreePayment(params: {
  orderId: string;
  bookingId?: string;
}): Promise<any> {
  const token = localStorage.getItem("token") || localStorage.getItem("cine_auth_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("/api/v1/payments/cashfree/verify", {
    method: "POST",
    headers,
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || data?.message || "Failed to verify Cashfree payment for event");
  }

  return data.data;
}

/**
 * Create Cashfree Order for 24-Hour Live Banner Campaign
 */
export async function createAdvertisingCashfreeOrder(campaignId: string): Promise<any> {
  const res = await fetch(`/api/v1/advertising/campaigns/${campaignId}/cashfree-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || data?.message || "Failed to initiate Cashfree payment for campaign");
  }

  return data.data;
}

/**
 * Verify Cashfree Payment for 24-Hour Live Banner Campaign
 */
export async function verifyAdvertisingCashfreePayment(params: {
  campaignId: string;
  orderId: string;
}): Promise<any> {
  const res = await fetch("/api/v1/advertising/payment/cashfree/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || data?.message || "Cashfree payment verification failed");
  }

  return data.data;
}
