/**
 * CineVenue Client Centralized Pricing & Convenience Fee Service
 * Communicates with backend /api/v1/pricing endpoints.
 * Provides caching, real-time sync, local fallback calculation, and change notifications.
 */

import apiClient from "./apiClient";

export interface ConvenienceFeeSlab {
  id: string;
  configId?: string;
  minPrice: number;
  maxPrice: number | null;
  feeAmount: number;
  feeType: "FIXED" | "PERCENTAGE";
  applyTo: "BOTH" | "MOVIES" | "EVENTS";
  category: string;
  enabled: boolean;
  orderIndex: number;
  description?: string | null;
}

export interface PricingConfig {
  id: string;
  enabled: boolean;
  calculationType: "SLAB" | "FIXED" | "PERCENTAGE";
  fixedAmount: number;
  percentageRate: number;
  applyTo: "BOTH" | "MOVIES" | "EVENTS";
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  gstEnabled: boolean;
  gstPercentage: number;
  taxMethod: "EXCLUSIVE" | "INCLUSIVE";
  displayTaxSeparately: boolean;
  eventFeeCalculationType?: "SLAB" | "FIXED" | "PERCENTAGE" | null;
  eventFixedAmount?: number | null;
  eventPercentageRate?: number | null;
  version: number;
  updatedAt: string;
  updatedBy: string;
  slabs: ConvenienceFeeSlab[];
}

export interface PricingCalculationResult {
  itemType: "MOVIE" | "EVENT";
  ticketCount: number;
  baseTicketAmount: number;
  ticketSubtotal: number;
  baseConvenienceFee: number;
  convenienceFeeGstTotal: number;
  totalConvenienceFee: number;
  convenienceFee: number;
  taxAmount: number;
  gstRate: number;
  taxMethod: "EXCLUSIVE" | "INCLUSIVE";
  displayTaxSeparately: boolean;
  discountAmount: number;
  couponDiscount: number;
  cineCoinsDiscount: number;
  musicianDonationAmount: number;
  otherCharges: number;
  finalPayableAmount: number;
  totalAmount: number;
  isFeeEnabled: boolean;
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  calculationType: "SLAB" | "FIXED" | "PERCENTAGE";
  pricingVersion: number;
  feeLines: Array<{
    ticketPrice: number;
    category: string;
    baseCharge: number;
    gstRate: number;
    gstAmount: number;
    totalFee: number;
    slabId?: string;
    slabDescription?: string;
  }>;
  feeSnapshot: any;
}

export const DEFAULT_CLIENT_SLABS: ConvenienceFeeSlab[] = [
  { id: "SLAB-1", minPrice: 1, maxPrice: 49, feeAmount: 10, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 0, description: "Budget (₹1–₹49)" },
  { id: "SLAB-2", minPrice: 50, maxPrice: 99, feeAmount: 12, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 1, description: "Economy (₹50–₹99)" },
  { id: "SLAB-3", minPrice: 100, maxPrice: 199, feeAmount: 16, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 2, description: "Prime (₹100–₹199)" },
  { id: "SLAB-4", minPrice: 200, maxPrice: 499, feeAmount: 25, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 3, description: "Premium Gold (₹200–₹499)" },
  { id: "SLAB-5", minPrice: 500, maxPrice: null, feeAmount: 35, feeType: "FIXED", applyTo: "BOTH", category: "STANDARD", enabled: true, orderIndex: 4, description: "VIP / Recliner (₹500+)" },
];

export const DEFAULT_CLIENT_CONFIG: PricingConfig = {
  id: "global_pricing_config",
  enabled: true,
  calculationType: "SLAB",
  fixedAmount: 15.00,
  percentageRate: 10.00,
  applyTo: "BOTH",
  feeApplication: "PER_TICKET",
  gstEnabled: true,
  gstPercentage: 18.00,
  taxMethod: "EXCLUSIVE",
  displayTaxSeparately: true,
  eventFeeCalculationType: "SLAB",
  eventFixedAmount: 20.00,
  eventPercentageRate: 10.00,
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: "System Default",
  slabs: DEFAULT_CLIENT_SLABS
};

type PricingUpdateListener = (config: PricingConfig) => void;

class CentralizedPricingClient {
  private cachedConfig: PricingConfig = { ...DEFAULT_CLIENT_CONFIG };
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 10000; // 10 seconds cache TTL for high freshness
  private listeners: Set<PricingUpdateListener> = new Set();
  private currentAbortController: AbortController | null = null;
  private latestRequestSeq: number = 0;

  constructor() {
    this.refreshConfig();
  }

  public subscribe(listener: PricingUpdateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => {
      try { fn(this.cachedConfig); } catch (e) { }
    });
  }

  public async refreshConfig(): Promise<PricingConfig> {
    try {
      const res = await apiClient.get<any>("/pricing/config");
      if (res.data?.success && res.data.config) {
        this.cachedConfig = res.data.config;
        this.lastFetchTime = Date.now();
        this.notifyListeners();
        return this.cachedConfig;
      }
    } catch (err: any) {
      // Fallback
    }
    return this.cachedConfig;
  }

  public async getConfig(forceRefresh: boolean = false): Promise<PricingConfig> {
    if (forceRefresh || Date.now() - this.lastFetchTime > this.CACHE_TTL_MS) {
      return this.refreshConfig();
    }
    return this.cachedConfig;
  }

  public getCachedConfigSync(): PricingConfig {
    return this.cachedConfig;
  }

  public async updateConfig(updates: Partial<PricingConfig>): Promise<PricingConfig> {
    const res = await apiClient.put<any>("/pricing/config", updates);
    if (res.data?.success && res.data.config) {
      this.cachedConfig = res.data.config;
      this.lastFetchTime = Date.now();
      this.notifyListeners();
      return this.cachedConfig;
    }
    throw new Error(res.data?.error?.message || "Failed to update pricing configuration");
  }

  public async addSlab(slab: Omit<ConvenienceFeeSlab, "id">): Promise<PricingConfig> {
    const res = await apiClient.post<any>("/pricing/slabs", slab);
    if (res.data?.success && res.data.config) {
      this.cachedConfig = res.data.config;
      this.lastFetchTime = Date.now();
      this.notifyListeners();
      return this.cachedConfig;
    }
    throw new Error(res.data?.error?.message || "Failed to add price slab");
  }

  public async updateSlab(id: string, updates: Partial<ConvenienceFeeSlab>): Promise<PricingConfig> {
    const res = await apiClient.put<any>(`/pricing/slabs/${id}`, updates);
    if (res.data?.success && res.data.config) {
      this.cachedConfig = res.data.config;
      this.lastFetchTime = Date.now();
      this.notifyListeners();
      return this.cachedConfig;
    }
    throw new Error(res.data?.error?.message || "Failed to update price slab");
  }

  public async deleteSlab(id: string): Promise<PricingConfig> {
    const res = await apiClient.delete<any>(`/pricing/slabs/${id}`);
    if (res.data?.success && res.data.config) {
      this.cachedConfig = res.data.config;
      this.lastFetchTime = Date.now();
      this.notifyListeners();
      return this.cachedConfig;
    }
    throw new Error(res.data?.error?.message || "Failed to delete price slab");
  }

  public async getAuditLogs(): Promise<any[]> {
    try {
      const res = await apiClient.get<any>("/pricing/audit-logs");
      if (res.data?.success && Array.isArray(res.data.logs)) {
        return res.data.logs;
      }
    } catch (e) { }
    return [];
  }

  /**
   * Authoritative price calculation:
   * Requests backend POST /pricing/calculate for zero-trust accuracy.
   * Employs AbortController and request sequencing to prevent race conditions.
   * Throws an error on calculation failure rather than silently using fallback estimates.
   */
  public async calculatePrice(params: {
    itemType?: "MOVIE" | "EVENT";
    tickets?: Array<{ price: number; category?: string }> | number[];
    ticketPrice?: number;
    quantity?: number;
    couponCode?: string;
    cineCoinsToRedeem?: number;
    musicianDonation?: boolean;
    otherCharges?: number;
    paymentMethod?: string;
  }): Promise<PricingCalculationResult> {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.currentAbortController = new AbortController();
    const seq = ++this.latestRequestSeq;

    try {
      const res = await apiClient.post<any>("/pricing/calculate", params, {
        signal: this.currentAbortController.signal
      });

      if (seq !== this.latestRequestSeq) {
        throw new Error("STALE_PRICING_RESPONSE");
      }

      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
      throw new Error(res.data?.message || "Failed to calculate pricing from server");
    } catch (err: any) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED" || err.message === "STALE_PRICING_RESPONSE") {
        throw err;
      }
      // Log and re-throw so the UI can accurately present the error state
      console.error("[CentralizedPricingClient] Calculation failed:", err?.message || err);
      throw err;
    }
  }

  /**
   * Exact client-side synchronous calculation matching backend logic.
   * Ensures instant UI reactivity while adhering to the central config.
   */
  public calculateLocalFallback(params: {
    itemType?: "MOVIE" | "EVENT";
    tickets?: Array<{ price: number; category?: string }> | number[];
    ticketPrice?: number;
    quantity?: number;
    couponCode?: string;
    cineCoinsToRedeem?: number;
    musicianDonation?: boolean;
    otherCharges?: number;
  }, customConfig?: PricingConfig): PricingCalculationResult {
    const config = customConfig || this.cachedConfig;
    const itemType = params.itemType === "EVENT" ? "EVENT" : "MOVIE";

    let ticketItems: Array<{ price: number; category: string }> = [];
    if (Array.isArray(params.tickets) && params.tickets.length > 0) {
      ticketItems = params.tickets.map((t) => {
        if (typeof t === "number") return { price: t, category: "STANDARD" };
        return { price: Number(t.price || 0), category: (t.category || "STANDARD").toUpperCase() };
      });
    } else if (params.ticketPrice !== undefined) {
      const qty = Math.max(1, Number(params.quantity || 1));
      for (let i = 0; i < qty; i++) {
        ticketItems.push({ price: Number(params.ticketPrice), category: "STANDARD" });
      }
    } else {
      ticketItems = [{ price: 150, category: "STANDARD" }];
    }

    const ticketCount = ticketItems.length;
    const ticketSubtotal = Math.round(ticketItems.reduce((acc, t) => acc + t.price, 0) * 100) / 100;

    const isGlobalEnabled = Boolean(config.enabled);
    const scopeApplies =
      config.applyTo === "BOTH" ||
      (itemType === "MOVIE" && config.applyTo === "MOVIES") ||
      (itemType === "EVENT" && config.applyTo === "EVENTS");
    const isFeeEnabled = isGlobalEnabled && scopeApplies && ticketSubtotal > 0;

    let calcType = config.calculationType || "SLAB";
    let fixedAmt = config.fixedAmount;
    let pctRate = config.percentageRate;

    if (itemType === "EVENT" && config.eventFeeCalculationType) {
      calcType = config.eventFeeCalculationType;
      if (config.eventFixedAmount !== null && config.eventFixedAmount !== undefined) fixedAmt = config.eventFixedAmount;
      if (config.eventPercentageRate !== null && config.eventPercentageRate !== undefined) pctRate = config.eventPercentageRate;
    }

    const feeApp = config.feeApplication === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET";
    const gstRate = config.gstEnabled ? Number(config.gstPercentage || 18.0) : 0;
    const taxMethod = config.taxMethod || "EXCLUSIVE";

    const feeLines: any[] = [];
    let baseChargeTotal = 0;
    let gstTotal = 0;

    if (isFeeEnabled) {
      if (calcType === "FIXED") {
        const count = feeApp === "PER_TICKET" ? ticketCount : 1;
        baseChargeTotal = Math.round(fixedAmt * count * 100) / 100;
        gstTotal = gstRate > 0 ? Math.round(baseChargeTotal * (gstRate / 100) * 100) / 100 : 0;

        ticketItems.forEach((t) => {
          const perTicketBase = feeApp === "PER_TICKET" ? fixedAmt : Math.round((fixedAmt / ticketCount) * 100) / 100;
          const perTicketGst = gstRate > 0 ? Math.round(perTicketBase * (gstRate / 100) * 100) / 100 : 0;
          feeLines.push({
            ticketPrice: t.price,
            category: t.category,
            baseCharge: perTicketBase,
            gstRate,
            gstAmount: perTicketGst,
            totalFee: Math.round((perTicketBase + perTicketGst) * 100) / 100,
            slabDescription: `Fixed Fee (${feeApp === "PER_TICKET" ? "₹" + fixedAmt + "/ticket" : "₹" + fixedAmt + "/booking"})`
          });
        });
      } else if (calcType === "PERCENTAGE") {
        baseChargeTotal = Math.round(ticketSubtotal * (pctRate / 100) * 100) / 100;
        gstTotal = gstRate > 0 ? Math.round(baseChargeTotal * (gstRate / 100) * 100) / 100 : 0;

        ticketItems.forEach((t) => {
          const perTicketBase = Math.round(t.price * (pctRate / 100) * 100) / 100;
          const perTicketGst = gstRate > 0 ? Math.round(perTicketBase * (gstRate / 100) * 100) / 100 : 0;
          feeLines.push({
            ticketPrice: t.price,
            category: t.category,
            baseCharge: perTicketBase,
            gstRate,
            gstAmount: perTicketGst,
            totalFee: Math.round((perTicketBase + perTicketGst) * 100) / 100,
            slabDescription: `Percentage Fee (${pctRate}%)`
          });
        });
      } else {
        // SLAB
        const targetScope = itemType === "MOVIE" ? "MOVIES" : "EVENTS";
        const availableSlabs = (config.slabs || []).filter(
          (s) => s.enabled && (s.applyTo === "BOTH" || s.applyTo === targetScope)
        );

        if (feeApp === "PER_TICKET") {
          ticketItems.forEach((t) => {
            const matchingSlab = availableSlabs.find((s) => {
              const minMatch = t.price >= Number(s.minPrice);
              const maxMatch = s.maxPrice === null || s.maxPrice === undefined || t.price <= Number(s.maxPrice);
              return minMatch && maxMatch;
            });

            let tBase = fixedAmt;
            let slabDesc = `Default Fee (₹${fixedAmt})`;
            let sId = undefined;

            if (matchingSlab) {
              sId = matchingSlab.id;
              slabDesc = matchingSlab.description || `Slab ₹${matchingSlab.minPrice} - ${matchingSlab.maxPrice ? '₹' + matchingSlab.maxPrice : 'Above'}`;
              if (matchingSlab.feeType === "PERCENTAGE") {
                tBase = Math.round(t.price * (Number(matchingSlab.feeAmount) / 100) * 100) / 100;
              } else {
                tBase = Number(matchingSlab.feeAmount);
              }
            }

            const tGst = gstRate > 0 ? Math.round(tBase * (gstRate / 100) * 100) / 100 : 0;
            baseChargeTotal += tBase;
            gstTotal += tGst;

            feeLines.push({
              ticketPrice: t.price,
              category: t.category,
              baseCharge: tBase,
              gstRate,
              gstAmount: tGst,
              totalFee: Math.round((tBase + tGst) * 100) / 100,
              slabId: sId,
              slabDescription: slabDesc
            });
          });
        } else {
          const avgPrice = ticketCount > 0 ? ticketSubtotal / ticketCount : 0;
          const matchingSlab = availableSlabs.find((s) => {
            const minMatch = avgPrice >= Number(s.minPrice);
            const maxMatch = s.maxPrice === null || s.maxPrice === undefined || avgPrice <= Number(s.maxPrice);
            return minMatch && maxMatch;
          });

          baseChargeTotal = matchingSlab
            ? (matchingSlab.feeType === "PERCENTAGE" ? Math.round(ticketSubtotal * (Number(matchingSlab.feeAmount) / 100) * 100) / 100 : Number(matchingSlab.feeAmount))
            : fixedAmt;
          gstTotal = gstRate > 0 ? Math.round(baseChargeTotal * (gstRate / 100) * 100) / 100 : 0;

          feeLines.push({
            ticketPrice: ticketSubtotal,
            category: "ORDER_BOOKING",
            baseCharge: baseChargeTotal,
            gstRate,
            gstAmount: gstTotal,
            totalFee: Math.round((baseChargeTotal + gstTotal) * 100) / 100,
            slabId: matchingSlab?.id,
            slabDescription: matchingSlab?.description || `Booking Flat Fee (₹${baseChargeTotal})`
          });
        }
      }
    }

    baseChargeTotal = Math.round(baseChargeTotal * 100) / 100;
    gstTotal = Math.round(gstTotal * 100) / 100;
    const totalConvenienceFee = Math.round((baseChargeTotal + gstTotal) * 100) / 100;

    let couponDiscount = 0;
    if (params.couponCode) {
      const code = params.couponCode.trim().toUpperCase();
      if (code === "WELCOME50" || code === "FLAT50") couponDiscount = Math.min(ticketSubtotal, 50);
      else if (code === "CINE20" || code === "CINEEVENT20") couponDiscount = Math.round(ticketSubtotal * 0.20 * 100) / 100;
      else if (code === "STUDENT10") couponDiscount = Math.round(ticketSubtotal * 0.10 * 100) / 100;
      else if (code === "FIRSTPASS100") couponDiscount = Math.min(ticketSubtotal, 100);
      else if (code === "VIPGALA300") couponDiscount = Math.min(ticketSubtotal, 300);
    }

    let cineCoinsDiscount = 0;
    if (params.cineCoinsToRedeem && Number(params.cineCoinsToRedeem) > 0) {
      const maxAllowed = Math.round(ticketSubtotal * 0.20 * 100) / 100;
      cineCoinsDiscount = Math.min(Number(params.cineCoinsToRedeem), maxAllowed);
    }

    const discountAmount = Math.round((couponDiscount + cineCoinsDiscount) * 100) / 100;
    const musicianDonationAmount = params.musicianDonation ? ticketCount * 1.00 : 0;
    const otherCharges = Math.round(((params.otherCharges || 0) + musicianDonationAmount) * 100) / 100;

    const rawTotal = ticketSubtotal + totalConvenienceFee + otherCharges - discountAmount;
    const finalPayableAmount = Math.max(0, Math.round(rawTotal * 100) / 100);

    return {
      itemType,
      ticketCount,
      baseTicketAmount: ticketSubtotal,
      ticketSubtotal,
      baseConvenienceFee: baseChargeTotal,
      convenienceFeeGstTotal: gstTotal,
      totalConvenienceFee,
      convenienceFee: totalConvenienceFee,
      taxAmount: gstTotal,
      gstRate,
      taxMethod,
      displayTaxSeparately: Boolean(config.displayTaxSeparately),
      discountAmount,
      couponDiscount,
      cineCoinsDiscount,
      musicianDonationAmount,
      otherCharges,
      finalPayableAmount,
      totalAmount: finalPayableAmount,
      isFeeEnabled,
      feeApplication: feeApp,
      calculationType: calcType,
      pricingVersion: config.version || 1,
      feeLines,
      feeSnapshot: {
        pricingVersion: config.version || 1,
        itemType,
        ticketCount,
        baseTicketAmount: ticketSubtotal,
        baseConvenienceFee: baseChargeTotal,
        convenienceFeeGstTotal: gstTotal,
        totalConvenienceFee,
        taxMethod,
        gstRate,
        discountAmount,
        musicianDonationAmount,
        otherCharges,
        finalPayableAmount,
        isFeeEnabled,
        feeApplication: feeApp,
        calculationType: calcType,
        feeLines,
        calculatedAt: new Date().toISOString()
      }
    };
  }

  public async validatePrice(claimedAmount: number, params: any): Promise<boolean> {
    try {
      const res = await apiClient.post<any>("/pricing/validate", {
        claimedAmount,
        ...params
      });
      return Boolean(res.data?.isValid);
    } catch (e) {
      const local = this.calculateLocalFallback(params);
      return Math.abs(claimedAmount - local.finalPayableAmount) <= 0.05;
    }
  }
}

export const centralizedPricingClient = new CentralizedPricingClient();

