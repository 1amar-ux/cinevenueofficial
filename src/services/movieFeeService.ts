import apiClient from "./apiClient";

export interface MovieFeeConfig {
  id: string;
  ticketPrice: number;
  baseCharge: number;
  category: string;
  gstRate: number;
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  enabled: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlobalMovieFeeSettings {
  enabled: boolean;
  defaultGstRate: number;
  defaultFeeApplication: "PER_TICKET" | "PER_BOOKING";
  updatedAt?: string;
  updatedBy?: string;
}

export interface MovieTicketFeeLine {
  ticketPrice: number;
  category: string;
  baseCharge: number;
  gstRate: number;
  gstAmount: number;
  totalFee: number;
  configId?: string;
}

export interface MovieFeeBreakdown {
  ticketCount: number;
  ticketSubtotal: number;
  baseChargeTotal: number;
  convenienceFeeGstTotal: number;
  totalConvenienceFee: number;
  musicianDonationAmount: number;
  discountAmount: number;
  finalPayableAmount: number;
  isFeeEnabled: boolean;
  gstRateApplied: number;
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  feeLines: MovieTicketFeeLine[];
  feeSnapshot: any;
}

// Canonical default table for client fallback
export const FALLBACK_MOVIE_FEES: MovieFeeConfig[] = [
  { id: "MFC-101", ticketPrice: 50, baseCharge: 12.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Budget Tier" },
  { id: "MFC-102", ticketPrice: 84, baseCharge: 14.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Standard Matinee" },
  { id: "MFC-103", ticketPrice: 84, baseCharge: 14.00, category: "SPECIAL", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Morning Show Special" },
  { id: "MFC-104", ticketPrice: 100, baseCharge: 14.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Economy Tier" },
  { id: "MFC-105", ticketPrice: 120, baseCharge: 16.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Regular Silver" },
  { id: "MFC-106", ticketPrice: 125, baseCharge: 16.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Weekday Tier" },
  { id: "MFC-107", ticketPrice: 147, baseCharge: 17.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Standard Prime" },
  { id: "MFC-108", ticketPrice: 147, baseCharge: 17.00, category: "PREMIUM", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Balcony Classic" },
  { id: "MFC-109", ticketPrice: 150, baseCharge: 20.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Gold Class" },
  { id: "MFC-110", ticketPrice: 175, baseCharge: 23.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Executive Tier" },
  { id: "MFC-111", ticketPrice: 177, baseCharge: 23.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Deluxe Tier" },
  { id: "MFC-112", ticketPrice: 200, baseCharge: 25.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "VIP Gold Tier" },
  { id: "MFC-113", ticketPrice: 235, baseCharge: 25.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Weekend Prime" },
  { id: "MFC-114", ticketPrice: 250, baseCharge: 28.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Premium Diamond" },
  { id: "MFC-115", ticketPrice: 295, baseCharge: 28.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Dolby Atmos Tier" },
  { id: "MFC-116", ticketPrice: 350, baseCharge: 34.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "IMAX 2D Tier" },
  { id: "MFC-117", ticketPrice: 470, baseCharge: 36.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "IMAX 3D Laser" },
  { id: "MFC-118", ticketPrice: 708, baseCharge: 36.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Luxury Recliner Suite" }
];

export function calculateLocalMovieFeeFallback(
  tickets: Array<{ price: number; category?: string }>,
  configs: MovieFeeConfig[] = FALLBACK_MOVIE_FEES,
  settings: GlobalMovieFeeSettings = { enabled: true, defaultGstRate: 18.0, defaultFeeApplication: "PER_TICKET" },
  options?: { couponCode?: string; musicianDonation?: boolean }
): MovieFeeBreakdown {
  const activeConfigs = configs.filter((c) => c.enabled);
  const isFeeEnabled = settings.enabled;
  const globalGst = settings.defaultGstRate || 18.0;
  const feeApp = settings.defaultFeeApplication || "PER_TICKET";

  let ticketSubtotal = 0;
  const feeLines: MovieTicketFeeLine[] = [];

  const findMatching = (price: number, cat?: string): MovieFeeConfig | null => {
    if (activeConfigs.length === 0) return null;
    const cleanCat = (cat || "STANDARD").trim().toUpperCase();
    const exact = activeConfigs.find(
      (c) => Number(c.ticketPrice) === price && c.category.toUpperCase() === cleanCat
    );
    if (exact) return exact;

    const priceMatch = activeConfigs.find((c) => Number(c.ticketPrice) === price);
    if (priceMatch) return priceMatch;

    let closest = activeConfigs[0];
    let minDiff = Math.abs(Number(closest.ticketPrice) - price);
    for (const c of activeConfigs) {
      const diff = Math.abs(Number(c.ticketPrice) - price);
      if (diff < minDiff) {
        minDiff = diff;
        closest = c;
      }
    }
    return closest;
  };

  for (const t of tickets) {
    const price = Math.round(Number(t.price || 0) * 100) / 100;
    ticketSubtotal += price;

    if (!isFeeEnabled) {
      feeLines.push({
        ticketPrice: price,
        category: t.category || "STANDARD",
        baseCharge: 0,
        gstRate: globalGst,
        gstAmount: 0,
        totalFee: 0
      });
      continue;
    }

    const match = findMatching(price, t.category);
    const base = match ? Number(match.baseCharge) : 20.00;
    const rate = match && match.gstRate !== undefined ? Number(match.gstRate) : globalGst;
    const gst = Math.round(((base * rate) / 100) * 100) / 100;
    const lineFee = Math.round((base + gst) * 100) / 100;

    feeLines.push({
      ticketPrice: price,
      category: match?.category || t.category || "STANDARD",
      baseCharge: base,
      gstRate: rate,
      gstAmount: gst,
      totalFee: lineFee,
      configId: match?.id
    });
  }

  ticketSubtotal = Math.round(ticketSubtotal * 100) / 100;
  let totalBaseCharge = 0;
  let totalGst = 0;

  if (isFeeEnabled && feeLines.length > 0) {
    if (feeApp === "PER_BOOKING") {
      const highest = [...feeLines].sort((a, b) => b.baseCharge - a.baseCharge)[0];
      totalBaseCharge = highest ? highest.baseCharge : 20.00;
      totalGst = Math.round(((totalBaseCharge * globalGst) / 100) * 100) / 100;
    } else {
      totalBaseCharge = feeLines.reduce((s, l) => s + l.baseCharge, 0);
      totalGst = feeLines.reduce((s, l) => s + l.gstAmount, 0);
    }
  }

  totalBaseCharge = Math.round(totalBaseCharge * 100) / 100;
  totalGst = Math.round(totalGst * 100) / 100;
  const totalConvenienceFee = Math.round((totalBaseCharge + totalGst) * 100) / 100;
  const musicianDonationAmount = options?.musicianDonation ? tickets.length * 1.00 : 0;

  let discountAmount = 0;
  if (options?.couponCode) {
    const code = options.couponCode.trim().toUpperCase();
    if (code === "WELCOME50" && ticketSubtotal >= 200) discountAmount = 50;
    else if (code === "CINE20") discountAmount = Math.min(100, Math.round(ticketSubtotal * 0.2));
    else if (code === "FLAT50" && ticketSubtotal >= 250) discountAmount = 50;
    else if (code === "STUDENT10") discountAmount = Math.round(ticketSubtotal * 0.1);
  }

  const finalPayableAmount = Math.max(
    0,
    Math.round((ticketSubtotal + totalConvenienceFee + musicianDonationAmount - discountAmount) * 100) / 100
  );

  return {
    ticketCount: tickets.length,
    ticketSubtotal,
    baseChargeTotal: totalBaseCharge,
    convenienceFeeGstTotal: totalGst,
    totalConvenienceFee,
    musicianDonationAmount,
    discountAmount,
    finalPayableAmount,
    isFeeEnabled,
    gstRateApplied: globalGst,
    feeApplication: feeApp,
    feeLines,
    feeSnapshot: {
      isFeeEnabled,
      feeApplication: feeApp,
      gstRateApplied: globalGst,
      baseChargeTotal: totalBaseCharge,
      convenienceFeeGstTotal: totalGst,
      totalConvenienceFee,
      ticketSubtotal,
      finalPayableAmount,
      calculatedAt: new Date().toISOString()
    }
  };
}

export const movieFeeClient = {
  // Public/Customer: Get active fees
  async getActiveFees(): Promise<{ configs: MovieFeeConfig[]; globalSettings: GlobalMovieFeeSettings }> {
    try {
      const res = await apiClient.get<any>("/movie-fees");
      if (res.data?.success && Array.isArray(res.data.configs)) {
        return {
          configs: res.data.configs,
          globalSettings: res.data.globalSettings || { enabled: true, defaultGstRate: 18.0, defaultFeeApplication: "PER_TICKET" }
        };
      }
    } catch (e) {
      // Fall back gracefully
    }
    return {
      configs: FALLBACK_MOVIE_FEES,
      globalSettings: { enabled: true, defaultGstRate: 18.0, defaultFeeApplication: "PER_TICKET" }
    };
  },

  // Authoritative price calculation
  async calculatePrice(params: {
    tickets?: Array<{ price: number; category?: string }>;
    showId?: string;
    seatIds?: string[];
    couponCode?: string;
    musicianDonation?: boolean;
  }): Promise<MovieFeeBreakdown> {
    try {
      const res = await apiClient.post<any>("/movie-fees/calculate", params);
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (e) {
      // Fall back to local canonical calculation
    }
    return calculateLocalMovieFeeFallback(
      params.tickets || [{ price: 250, category: "STANDARD" }],
      FALLBACK_MOVIE_FEES,
      { enabled: true, defaultGstRate: 18.0, defaultFeeApplication: "PER_TICKET" },
      { couponCode: params.couponCode, musicianDonation: params.musicianDonation }
    );
  },

  // Super Admin: Fetch all configs, settings, and logs
  async getAdminFees(): Promise<{
    configs: MovieFeeConfig[];
    globalSettings: GlobalMovieFeeSettings;
    auditLogs: any[];
  }> {
    try {
      const res = await apiClient.get<any>("/admin/movie-fees");
      if (res.data?.success) {
        return {
          configs: res.data.configs || [],
          globalSettings: res.data.globalSettings || { enabled: true, defaultGstRate: 18.0, defaultFeeApplication: "PER_TICKET" },
          auditLogs: res.data.auditLogs || []
        };
      }
    } catch (e) {
      // Try alternate mount
      try {
        const res2 = await apiClient.get<any>("/movie-fees/admin/all");
        if (res2.data?.success) {
          return {
            configs: res2.data.configs || [],
            globalSettings: res2.data.globalSettings || { enabled: true, defaultGstRate: 18.0, defaultFeeApplication: "PER_TICKET" },
            auditLogs: res2.data.auditLogs || []
          };
        }
      } catch (e2) {}
    }
    return {
      configs: FALLBACK_MOVIE_FEES,
      globalSettings: { enabled: true, defaultGstRate: 18.0, defaultFeeApplication: "PER_TICKET" },
      auditLogs: []
    };
  },

  // Super Admin: Create fee config
  async createFee(data: {
    ticketPrice: number;
    baseCharge: number;
    category?: string;
    gstRate?: number;
    feeApplication?: "PER_TICKET" | "PER_BOOKING";
    enabled?: boolean;
    description?: string;
  }): Promise<MovieFeeConfig> {
    const res = await apiClient.post<any>("/admin/movie-fees", data);
    if (!res.data?.success) {
      throw new Error(res.data?.error?.message || res.data?.message || "Failed to create fee configuration");
    }
    return res.data.config;
  },

  // Super Admin: Update fee config
  async updateFee(id: string, data: Partial<MovieFeeConfig>): Promise<MovieFeeConfig> {
    const res = await apiClient.put<any>(`/admin/movie-fees/${id}`, data);
    if (!res.data?.success) {
      throw new Error(res.data?.error?.message || res.data?.message || "Failed to update fee configuration");
    }
    return res.data.config;
  },

  // Super Admin: Delete fee config
  async deleteFee(id: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/admin/movie-fees/${id}`);
    if (!res.data?.success) {
      throw new Error(res.data?.error?.message || res.data?.message || "Failed to delete fee configuration");
    }
    return true;
  },

  // Super Admin: Update global settings (enabled toggle, GST rate)
  async updateGlobalSettings(settings: Partial<GlobalMovieFeeSettings>): Promise<GlobalMovieFeeSettings> {
    const res = await apiClient.patch<any>("/admin/movie-fees/settings", settings);
    if (!res.data?.success) {
      throw new Error(res.data?.error?.message || res.data?.message || "Failed to update global settings");
    }
    return res.data.settings;
  },

  // Super Admin: Get audit logs
  async getAuditLogs(): Promise<any[]> {
    try {
      const res = await apiClient.get<any>("/admin/movie-fees/audit-logs");
      if (res.data?.success) return res.data.logs || [];
    } catch (e) {}
    return [];
  }
};
