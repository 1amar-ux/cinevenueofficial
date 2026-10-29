export interface AnalyticsFilter {
  range?: "all" | "today" | "yesterday" | "7d" | "30d" | "this_month" | "last_month" | "custom";
  startDate?: string;
  endDate?: string;
  city?: string;
  bookingType?: "ALL" | "MOVIE" | "EVENT";
  theatreId?: string;
  theatreName?: string;
  organizerId?: string;
  movieTitle?: string;
  genre?: string;
  language?: string;
  eventCategory?: string;
}

export interface AnalyticsOverviewKPIs {
  totalConfirmedBookings: number;
  totalTicketsSold: number;
  grossTicketSales: number;
  netTicketSales: number;
  actualPlatformEarnings: number;
  movieBookingRevenue: number;
  eventRevenue: number;
  refundsProcessed: number;
  activeBookableEvents: number;
  bookingConversionRate: number;
  attendance: number;
  comparisonPeriods?: {
    priorConfirmedBookings: number;
    priorGrossSales: number;
    salesGrowthPercent: number;
  };
}

export interface MoviePerformanceRecord {
  movieTitle: string;
  genre: string;
  language: string;
  ticketsSold: number;
  grossSales: number;
  bookingsCount: number;
  averageTicketValue: number;
  cancellationRate: number;
  occupancyRate: number;
}

export interface TheatrePerformanceRecord {
  theatreId: string;
  theatreName: string;
  city: string;
  bookingsCount: number;
  ticketsSold: number;
  grossSales: number;
  occupancyRate: number;
}

export interface CityPerformanceRecord {
  city: string;
  bookingsCount: number;
  ticketsSold: number;
  grossSales: number;
}

export interface EventCategoryPerformance {
  category: string;
  eventsCount: number;
  bookingsCount: number;
  ticketsSold: number;
  grossSales: number;
  conversionRate: number;
}

export interface EventPerformanceRecord {
  eventId: string;
  eventTitle: string;
  category: string;
  organizerName: string;
  venueName: string;
  city: string;
  eventDate: string;
  ticketsSold: number;
  grossSales: number;
  netSales: number;
  attendance: number;
  cancellationRate: number;
}

export interface FinancialAnalyticsBreakdown {
  grossTicketSales: number;
  refundsProcessed: number;
  netTicketSales: number;
  platformFeesEarned: number;
  convenienceFeesCollected: number;
  gatewayCharges: number;
  taxesCollected: number;
  theatreAmountsPayable: number;
  organizerAmountsPayable: number;
  settledAmounts: number;
  pendingSettlements: number;
  theatresSettlementList: any[];
  organizersSettlementList: any[];
}

export interface FunnelStage {
  stageNumber: number;
  stageName: string;
  sessionsCount: number;
  dropOffRate: number;
  conversionRate: number;
}

export interface EngagementAnalytics {
  funnelStages: FunnelStage[];
  moviePageViews: number;
  eventPageViews: number;
  totalPageViews: number;
  searchEventsCount: number;
  checkoutAbandonmentRate: number;
  repeatBookingRate: number;
  deviceBreakdown: Array<{ device: string; count: number; percentage: number }>;
}

export interface RankingsData {
  topMovies: MoviePerformanceRecord[];
  topEvents: EventPerformanceRecord[];
  topTheatres: TheatrePerformanceRecord[];
  topOrganizers: any[];
  topCities: CityPerformanceRecord[];
  topCategories: EventCategoryPerformance[];
}

const API_BASE = "/api/v1/admin/analytics";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token") || localStorage.getItem("cine_auth_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function buildQuery(filter: AnalyticsFilter): string {
  const params = new URLSearchParams();
  Object.entries(filter).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "" && v !== "all") {
      params.append(k, String(v));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const entertainmentAnalyticsService = {
  async getOverviewKPIs(filter: AnalyticsFilter = {}): Promise<AnalyticsOverviewKPIs> {
    const res = await fetch(`${API_BASE}/overview${buildQuery(filter)}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch overview");
    return json.data;
  },

  async getMovieAnalytics(filter: AnalyticsFilter = {}) {
    const res = await fetch(`${API_BASE}/movies${buildQuery(filter)}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch movie analytics");
    return json.data;
  },

  async getEventAnalytics(filter: AnalyticsFilter = {}) {
    const res = await fetch(`${API_BASE}/events${buildQuery(filter)}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch event analytics");
    return json.data;
  },

  async getFinancialAnalytics(filter: AnalyticsFilter = {}): Promise<FinancialAnalyticsBreakdown> {
    const res = await fetch(`${API_BASE}/financials${buildQuery(filter)}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch financial analytics");
    return json.data;
  },

  async getEngagementAndFunnel(filter: AnalyticsFilter = {}): Promise<EngagementAnalytics> {
    const res = await fetch(`${API_BASE}/funnel${buildQuery(filter)}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch funnel analytics");
    return json.data;
  },

  async getRankings(filter: AnalyticsFilter = {}): Promise<RankingsData> {
    const res = await fetch(`${API_BASE}/rankings${buildQuery(filter)}`, {
      headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to fetch rankings");
    return json.data;
  },

  async trackEvent(payload: {
    eventType: string;
    entityType: string;
    entityId?: string;
    entityTitle?: string;
    category?: string;
    city?: string;
  }) {
    try {
      await fetch(`${API_BASE}/events/track`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Non-blocking telemetry
    }
  },

  getExportUrl(reportType: string, filter: AnalyticsFilter = {}): string {
    const params = new URLSearchParams();
    params.append("reportType", reportType);
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "all") {
        params.append(k, String(v));
      }
    });
    return `${API_BASE}/export/csv?${params.toString()}`;
  }
};
