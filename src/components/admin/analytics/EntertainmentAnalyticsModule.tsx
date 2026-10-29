import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  Ticket,
  DollarSign,
  Film,
  Calendar,
  Layers,
  Users,
  Download,
  Filter,
  CheckCircle2,
  RefreshCw,
  Search,
  Sparkles,
  Award,
  AlertCircle,
  Clock,
  ChevronRight,
  Landmark,
  Smartphone,
  Eye,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Flame,
  Percent
} from "lucide-react";
import {
  entertainmentAnalyticsService,
  AnalyticsFilter,
  AnalyticsOverviewKPIs,
  MoviePerformanceRecord,
  TheatrePerformanceRecord,
  CityPerformanceRecord,
  EventCategoryPerformance,
  EventPerformanceRecord,
  FinancialAnalyticsBreakdown,
  EngagementAnalytics,
  RankingsData
} from "../../../services/entertainmentAnalyticsService";

type ActiveTab = "overview" | "movies" | "events" | "financials" | "funnel" | "rankings";

export default function EntertainmentAnalyticsModule() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [range, setRange] = useState<AnalyticsFilter["range"]>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedBookingType, setSelectedBookingType] = useState<"ALL" | "MOVIE" | "EVENT">("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Loaded Data States
  const [overview, setOverview] = useState<AnalyticsOverviewKPIs | null>(null);
  const [movieData, setMovieData] = useState<{
    moviesPerformance: MoviePerformanceRecord[];
    theatreBreakdown: TheatrePerformanceRecord[];
    cityBreakdown: CityPerformanceRecord[];
    genrePerformance: any[];
    languagePerformance: any[];
  } | null>(null);

  const [eventData, setEventData] = useState<{
    eventsByCategory: EventCategoryPerformance[];
    eventsList: EventPerformanceRecord[];
    organizerPerformance: any[];
  } | null>(null);

  const [financialData, setFinancialData] = useState<FinancialAnalyticsBreakdown | null>(null);
  const [funnelData, setFunnelData] = useState<EngagementAnalytics | null>(null);
  const [rankingsData, setRankingsData] = useState<RankingsData | null>(null);

  const currentFilter = useMemo<AnalyticsFilter>(() => ({
    range,
    city: selectedCity === "all" ? undefined : selectedCity,
    bookingType: selectedBookingType
  }), [range, selectedCity, selectedBookingType]);

  const loadAllAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ov, mov, ev, fin, fun, rk] = await Promise.all([
        entertainmentAnalyticsService.getOverviewKPIs(currentFilter),
        entertainmentAnalyticsService.getMovieAnalytics(currentFilter),
        entertainmentAnalyticsService.getEventAnalytics(currentFilter),
        entertainmentAnalyticsService.getFinancialAnalytics(currentFilter),
        entertainmentAnalyticsService.getEngagementAndFunnel(currentFilter),
        entertainmentAnalyticsService.getRankings(currentFilter)
      ]);

      setOverview(ov);
      setMovieData(mov);
      setEventData(ev);
      setFinancialData(fin);
      setFunnelData(fun);
      setRankingsData(rk);
    } catch (err: any) {
      console.error("Failed to load analytics", err);
      setError(err?.message || "Failed to load authoritative analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [currentFilter]);

  const formatCurrency = (amt: number | undefined) => {
    if (amt === undefined || isNaN(amt)) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(amt);
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return "0";
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleExportCsv = (reportType: string) => {
    const url = entertainmentAnalyticsService.getExportUrl(reportType, currentFilter);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 text-left">
      {/* 1. Header & Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-gold/15 text-gold border border-gold/30">
              CINEVENUE INTELLIGENCE
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AUDITED FINANCIAL ACCURACY
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Entertainment Analytics
            <Sparkles className="w-5 h-5 text-gold" />
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Real-time authoritative analytics derived from verified bookings, multiplex theatre ticket shares, live entertainment passes, and audience conversion funnels.
          </p>
        </div>

        {/* Global Controls & Refresh */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={loadAllAnalytics}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer"
            title="Refresh authoritative metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gold" : ""}`} />
            <span>Sync</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => handleExportCsv(activeTab === "movies" ? "movies" : activeTab === "events" ? "events" : activeTab === "financials" ? "financials" : "overview")}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-gold/20 hover:bg-gold/30 text-gold hover:text-gold-light text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Multi-Dimensional Filter Bar */}
      <div className="bg-[#121214] border border-white/10 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <Filter className="w-3.5 h-3.5 text-gold" />
            <span>Scope:</span>
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7d", label: "Last 7D" },
              { id: "30d", label: "Last 30D" },
              { id: "this_month", label: "This Month" },
              { id: "last_month", label: "Last Month" }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setRange(p.id as any)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                  range === p.id
                    ? "bg-gold text-black font-bold shadow-sm"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-gold/50 cursor-pointer"
          >
            <option value="all">All Cities</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Chennai">Chennai</option>
            <option value="Vijayawada">Vijayawada</option>
          </select>

          {/* Booking Type Filter */}
          <select
            value={selectedBookingType}
            onChange={(e) => setSelectedBookingType(e.target.value as any)}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none focus:border-gold/50 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="MOVIE">Movies Only</option>
            <option value="EVENT">Events Only</option>
          </select>
        </div>

        {overview?.comparisonPeriods && (
          <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{overview.comparisonPeriods.salesGrowthPercent}% vs Prior Cycle</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={loadAllAnalytics} className="underline hover:text-white cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-1 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: "overview", label: "Overview & KPIs", icon: TrendingUp },
          { id: "movies", label: "Movie Analytics", icon: Film },
          { id: "events", label: "Entertainment Events", icon: Ticket },
          { id: "financials", label: "Financial Reconciliation", icon: DollarSign },
          { id: "funnel", label: "Audience Funnel", icon: Users },
          { id: "rankings", label: "Leaderboards & Rankings", icon: Award }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-gold text-gold bg-gold/10 font-bold"
                  : "border-transparent text-text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-gold" : "text-text-muted"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB 1: OVERVIEW & KPIS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 11 Documented Authoritative KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {/* 1. Confirmed Bookings */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-gold/30 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Confirmed Bookings</span>
              <div className="text-xl md:text-2xl font-bold text-white font-mono">
                {formatNumber(overview?.totalConfirmedBookings)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Excludes failed/pending</span>
            </div>

            {/* 2. Tickets Sold */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-gold/30 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Total Tickets Sold</span>
              <div className="text-xl md:text-2xl font-bold text-gold font-mono">
                {formatNumber(overview?.totalTicketsSold)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Movie seats + Event passes</span>
            </div>

            {/* 3. Gross Ticket Sales */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-gold/30 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Gross Ticket Sales</span>
              <div className="text-xl md:text-2xl font-bold text-white font-mono">
                {formatCurrency(overview?.grossTicketSales)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Total customer ticket base</span>
            </div>

            {/* 4. Net Ticket Sales */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-gold/30 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Net Ticket Sales</span>
              <div className="text-xl md:text-2xl font-bold text-emerald-400 font-mono">
                {formatCurrency(overview?.netTicketSales)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Gross minus refunds</span>
            </div>

            {/* 5. Platform Earnings */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl bg-gradient-to-br from-gold/5 to-transparent border-gold/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gold text-[11px] font-mono font-bold uppercase">Actual Platform Earnings</span>
                <Sparkles className="w-3.5 h-3.5 text-gold" />
              </div>
              <div className="text-xl md:text-2xl font-extrabold text-gold font-mono">
                {formatCurrency(overview?.actualPlatformEarnings)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Fees + 12% movie & 10% event cut</span>
            </div>

            {/* 6. Movie Booking Revenue */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-white/20 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Movie Total Volume</span>
              <div className="text-xl md:text-2xl font-bold text-white font-mono">
                {formatCurrency(overview?.movieBookingRevenue)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Multiplex customer payments</span>
            </div>

            {/* 7. Event Revenue */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-white/20 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Event Total Volume</span>
              <div className="text-xl md:text-2xl font-bold text-white font-mono">
                {formatCurrency(overview?.eventRevenue)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Concerts, comedy & galas</span>
            </div>

            {/* 8. Refunds Processed */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-red-500/30 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Refunds Processed</span>
              <div className="text-xl md:text-2xl font-bold text-red-400 font-mono">
                {formatCurrency(overview?.refundsProcessed)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Fully reconciled returns</span>
            </div>

            {/* 9. Active Bookable Events */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-white/20 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Active Bookable Events</span>
              <div className="text-xl md:text-2xl font-bold text-white font-mono">
                {formatNumber(overview?.activeBookableEvents)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Live published inventory</span>
            </div>

            {/* 10. Booking Conversion Rate */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-emerald-500/30 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Conversion Rate</span>
              <div className="text-xl md:text-2xl font-bold text-emerald-400 font-mono">
                {overview?.bookingConversionRate}%
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Confirmed / Checkout Inits</span>
            </div>

            {/* 11. Verified Attendance */}
            <div className="bg-[#121214] border border-white/10 p-4 rounded-xl hover:border-gold/30 transition">
              <span className="text-text-muted text-[11px] font-mono uppercase block mb-1">Verified Attendance</span>
              <div className="text-xl md:text-2xl font-bold text-gold font-mono">
                {formatNumber(overview?.attendance)}
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Turnstile QR scan verified</span>
            </div>
          </div>

          {/* Volume Breakdown Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visual Revenue Composition */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Revenue Composition Breakdown</span>
                <span className="text-[10px] font-mono text-gold uppercase">Real Settled Fractions</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-muted">Multiplex Cinema Box Office</span>
                    <span className="text-white font-bold">{formatCurrency(overview?.movieBookingRevenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                    <div
                      className="bg-gold h-full rounded-full"
                      style={{
                        width: `${overview?.grossTicketSales ? Math.min(100, Math.round(((overview.movieBookingRevenue) / (overview.movieBookingRevenue + overview.eventRevenue || 1)) * 100)) : 50}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-muted">Live Entertainment & Event Passes</span>
                    <span className="text-white font-bold">{formatCurrency(overview?.eventRevenue)}</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{
                        width: `${overview?.grossTicketSales ? Math.min(100, Math.round(((overview.eventRevenue) / (overview.movieBookingRevenue + overview.eventRevenue || 1)) * 100)) : 50}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-muted">Actual Net Platform Earnings</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(overview?.actualPlatformEarnings)}</span>
                  </div>
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: "24%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Density Breakdown */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Regional Box Office Density</span>
                <span className="text-[10px] font-mono text-gold uppercase">City Volume Split</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {movieData?.cityBreakdown.slice(0, 4).map((c, i) => (
                  <div key={c.city}>
                    <div className="flex justify-between mb-1">
                      <span className="text-text-muted">{c.city}</span>
                      <span className="text-white font-bold">{formatCurrency(c.grossSales)} ({c.ticketsSold} tix)</span>
                    </div>
                    <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i === 0 ? "bg-gold" : i === 1 ? "bg-amber-400" : "bg-white/40"}`}
                        style={{ width: `${Math.max(15, Math.min(100, 100 - i * 22))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: MOVIE ANALYTICS */}
      {activeTab === "movies" && (
        <div className="space-y-6">
          {/* Movies Performance Table */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Movie Title Performance Matrix</h3>
                <p className="text-[11px] text-text-muted">Detailed ticket volumes, average ticket values, occupancy rates, and cancellation frequencies.</p>
              </div>
              <button
                onClick={() => handleExportCsv("movies")}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-gold border border-gold/30 transition cursor-pointer"
              >
                Export Movies CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/50 text-text-muted uppercase text-[10px] border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Movie Title</th>
                    <th className="p-3.5">Language</th>
                    <th className="p-3.5">Genre</th>
                    <th className="p-3.5 text-right">Tickets Sold</th>
                    <th className="p-3.5 text-right">Gross Sales</th>
                    <th className="p-3.5 text-right">Avg Ticket Val</th>
                    <th className="p-3.5 text-right">Occupancy Rate</th>
                    <th className="p-3.5 text-right">Cancellation %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {movieData?.moviesPerformance.map((m) => (
                    <tr key={m.movieTitle} className="hover:bg-white/[0.02] transition">
                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>{m.movieTitle}</span>
                      </td>
                      <td className="p-3.5 text-text-secondary">{m.language}</td>
                      <td className="p-3.5 text-text-muted truncate max-w-[150px]">{m.genre}</td>
                      <td className="p-3.5 text-right text-gold font-bold">{formatNumber(m.ticketsSold)}</td>
                      <td className="p-3.5 text-right text-white font-bold">{formatCurrency(m.grossSales)}</td>
                      <td className="p-3.5 text-right text-text-secondary">{formatCurrency(m.averageTicketValue)}</td>
                      <td className="p-3.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {m.occupancyRate}%
                        </span>
                      </td>
                      <td className="p-3.5 text-right text-text-muted">{m.cancellationRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Theatre Occupancy Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Multiplex Theatre Occupancy Densitometer</span>
                <span className="text-[10px] font-mono text-gold uppercase">Real Seat Density</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                {movieData?.theatreBreakdown.map((t) => (
                  <div key={t.theatreId}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white font-semibold">{t.theatreName} ({t.city})</span>
                      <span className="text-gold font-bold">{t.occupancyRate}% Density</span>
                    </div>
                    <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full"
                        style={{ width: `${t.occupancyRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language & Genre Performance Split */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white">Language Box Office Distribution</h3>
              <div className="space-y-3 font-mono text-xs">
                {movieData?.languagePerformance.map((lp) => (
                  <div key={lp.language}>
                    <div className="flex justify-between mb-1">
                      <span className="text-text-muted">{lp.language}</span>
                      <span className="text-white font-bold">{formatCurrency(lp.grossSales)} ({lp.sharePercent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-black rounded-full overflow-hidden">
                      <div
                        className="bg-gold h-full rounded-full"
                        style={{ width: `${lp.sharePercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: ENTERTAINMENT EVENT ANALYTICS */}
      {activeTab === "events" && (
        <div className="space-y-6">
          {/* Categories Grid (8 supported entertainment categories) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {eventData?.eventsByCategory.map((cat) => (
              <div key={cat.category} className="bg-[#121214] border border-white/10 p-3.5 rounded-xl hover:border-gold/30 transition">
                <span className="text-text-muted text-[10px] font-mono uppercase block mb-1 truncate">{cat.category}</span>
                <div className="text-lg font-bold text-white font-mono">{formatCurrency(cat.grossSales)}</div>
                <div className="flex justify-between items-center text-[10px] text-text-muted mt-2 font-mono">
                  <span>{cat.ticketsSold} Passes</span>
                  <span className="text-emerald-400 font-bold">{cat.conversionRate}% Conv</span>
                </div>
              </div>
            ))}
          </div>

          {/* Events Detail Table */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Live Entertainment Event Ledger</h3>
                <p className="text-[11px] text-text-muted">Concerts, comedy tours, pre-releases, and trailer launches.</p>
              </div>
              <button
                onClick={() => handleExportCsv("events")}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-gold border border-gold/30 transition cursor-pointer"
              >
                Export Events CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/50 text-text-muted uppercase text-[10px] border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Event Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Organizer</th>
                    <th className="p-3.5">City / Venue</th>
                    <th className="p-3.5 text-right">Passes Sold</th>
                    <th className="p-3.5 text-right">Gross Sales</th>
                    <th className="p-3.5 text-right">Net Sales</th>
                    <th className="p-3.5 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {eventData?.eventsList.map((e) => (
                    <tr key={e.eventId} className="hover:bg-white/[0.02] transition">
                      <td className="p-3.5 font-bold text-white flex items-center gap-2">
                        <Ticket className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span>{e.eventTitle}</span>
                      </td>
                      <td className="p-3.5 text-text-secondary">{e.category}</td>
                      <td className="p-3.5 text-text-muted">{e.organizerName}</td>
                      <td className="p-3.5 text-text-muted">{e.city} - {e.venueName}</td>
                      <td className="p-3.5 text-right text-gold font-bold">{formatNumber(e.ticketsSold)}</td>
                      <td className="p-3.5 text-right text-white font-bold">{formatCurrency(e.grossSales)}</td>
                      <td className="p-3.5 text-right text-emerald-400 font-bold">{formatCurrency(e.netSales)}</td>
                      <td className="p-3.5 text-right text-text-secondary">{formatNumber(e.attendance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Organizer Performance Cards */}
          <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Event Organizer Commercial Ledger</span>
              <span className="text-[10px] font-mono text-gold uppercase">90% Net Organizer Share</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {eventData?.organizerPerformance.map((org) => (
                <div key={org.organizerId} className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white">{org.organizerName}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gold">{org.eventsCount} Events</span>
                  </div>
                  <div className="space-y-1 text-text-muted text-[11px]">
                    <div className="flex justify-between">
                      <span>Gross Sales:</span>
                      <span className="text-white font-bold">{formatCurrency(org.grossSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Passes Sold:</span>
                      <span className="text-gold">{formatNumber(org.ticketsSold)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1 text-emerald-400 font-bold">
                      <span>Payout Pending:</span>
                      <span>{formatCurrency(org.payoutPending)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 4: FINANCIAL RECONCILIATION */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          {/* Strict Separation of Liabilities & Earnings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Customer Inflow */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-3">
              <span className="text-[11px] font-mono text-text-muted uppercase block">1. Customer Inflow</span>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Gross Ticket Sales:</span>
                  <span className="text-white font-bold">{formatCurrency(financialData?.grossTicketSales)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>Refunds Processed:</span>
                  <span>- {formatCurrency(financialData?.refundsProcessed)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1 text-emerald-400 font-bold text-sm">
                  <span>Net Ticket Sales:</span>
                  <span>{formatCurrency(financialData?.netTicketSales)}</span>
                </div>
              </div>
            </div>

            {/* 2. CineVenue Earnings */}
            <div className="bg-[#121214] border border-gold/30 bg-gradient-to-br from-gold/5 to-transparent p-5 rounded-2xl space-y-3">
              <span className="text-[11px] font-mono text-gold uppercase block font-bold">2. CineVenue Platform Earnings</span>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Convenience Fees:</span>
                  <span className="text-white font-bold">{formatCurrency(financialData?.convenienceFeesCollected)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">GST Collected (18%):</span>
                  <span className="text-text-secondary">{formatCurrency(financialData?.taxesCollected)}</span>
                </div>
                <div className="flex justify-between border-t border-gold/30 pt-1 text-gold font-extrabold text-sm">
                  <span>Total Platform Net:</span>
                  <span>{formatCurrency(financialData?.platformFeesEarned)}</span>
                </div>
              </div>
            </div>

            {/* 3. Partner Liabilities */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-3">
              <span className="text-[11px] font-mono text-text-muted uppercase block">3. Settlement Liabilities</span>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Theatre Payables (88%):</span>
                  <span className="text-white font-bold">{formatCurrency(financialData?.theatreAmountsPayable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Organizer Payables (90%):</span>
                  <span className="text-white font-bold">{formatCurrency(financialData?.organizerAmountsPayable)}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1 text-amber-400 font-bold text-sm">
                  <span>Pending Settlements:</span>
                  <span>{formatCurrency(financialData?.pendingSettlements)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Ledger Table */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Partner Settlement Audit Ledger</h3>
                <p className="text-[11px] text-text-muted">Reconciled bank transfers and pending payouts.</p>
              </div>
              <button
                onClick={() => handleExportCsv("financials")}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-gold border border-gold/30 transition cursor-pointer"
              >
                Export Financials CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black/50 text-text-muted uppercase text-[10px] border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Settlement ID</th>
                    <th className="p-3.5">Recipient Type</th>
                    <th className="p-3.5">Partner Name</th>
                    <th className="p-3.5">Period</th>
                    <th className="p-3.5 text-right">Gross Sales</th>
                    <th className="p-3.5 text-right">Commission</th>
                    <th className="p-3.5 text-right">Net Payable</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {financialData?.theatresSettlementList.concat(financialData.organizersSettlementList || []).map((s) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-3.5 text-text-secondary">{s.id}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.recipientType === "THEATRE" ? "bg-amber-500/10 text-amber-400" : "bg-purple-500/10 text-purple-400"}`}>
                          {s.recipientType}
                        </span>
                      </td>
                      <td className="p-3.5 text-white font-bold">{s.recipientName}</td>
                      <td className="p-3.5 text-text-muted">{s.periodStart} to {s.periodEnd}</td>
                      <td className="p-3.5 text-right text-text-secondary">{formatCurrency(s.grossSales)}</td>
                      <td className="p-3.5 text-right text-red-400">- {formatCurrency(s.commission)}</td>
                      <td className="p-3.5 text-right text-gold font-bold">{formatCurrency(s.netPayable)}</td>
                      <td className="p-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.status === "PAID" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 5: AUDIENCE FUNNEL & ENGAGEMENT */}
      {activeTab === "funnel" && (
        <div className="space-y-6">
          {/* 6-Stage Booking Funnel Waterfall */}
          <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>6-Stage Booking Conversion Funnel</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h3>
                <p className="text-[11px] text-text-muted">Track customer progression from initial listing view to final confirmed ticket issue.</p>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-text-muted block text-[10px] uppercase">Funnel Efficiency</span>
                <span className="text-emerald-400 font-extrabold text-sm">{overview?.bookingConversionRate}% Overall Conv</span>
              </div>
            </div>

            <div className="space-y-3 font-mono">
              {funnelData?.funnelStages.map((stage) => (
                <div key={stage.stageNumber} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center text-[10px] font-bold">
                        {stage.stageNumber}
                      </span>
                      {stage.stageName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted text-[11px]">
                        Drop-off: <span className="text-red-400">{stage.dropOffRate}%</span>
                      </span>
                      <span className="text-white font-bold min-w-[70px] text-right">
                        {formatNumber(stage.sessionsCount)} sessions
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, stage.conversionRate)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic & Device Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Engagement Metrics */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-3 font-mono text-xs">
              <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">Audience Interaction Signals</h4>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-text-muted">Total Page Views:</span>
                <span className="text-white font-bold">{formatNumber(funnelData?.totalPageViews)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-text-muted">Movie Page Views:</span>
                <span className="text-gold font-bold">{formatNumber(funnelData?.moviePageViews)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-text-muted">Event Page Views:</span>
                <span className="text-purple-400 font-bold">{formatNumber(funnelData?.eventPageViews)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-text-muted">Catalog Search Events:</span>
                <span className="text-text-secondary">{formatNumber(funnelData?.searchEventsCount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/5">
                <span className="text-text-muted">Checkout Abandonment:</span>
                <span className="text-red-400 font-bold">{funnelData?.checkoutAbandonmentRate}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-text-muted">Repeat Customer Rate:</span>
                <span className="text-emerald-400 font-bold">{funnelData?.repeatBookingRate}%</span>
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-3 font-mono text-xs">
              <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">User Device Platforms</h4>
              {funnelData?.deviceBreakdown.map((dev) => (
                <div key={dev.device} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-gold shrink-0" />
                      {dev.device}
                    </span>
                    <span className="text-white font-bold">{dev.percentage}% ({dev.count})</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <div className="bg-gold h-full rounded-full" style={{ width: `${dev.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB 6: LEADERBOARDS & RANKINGS */}
      {activeTab === "rankings" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Movies Leaderboard */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Top Movies by Gross Box Office</span>
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {rankingsData?.topMovies.map((m, idx) => (
                  <div key={m.movieTitle} className="flex justify-between items-center p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? "bg-gold text-black" : "bg-white/10 text-white"}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-white font-bold block">{m.movieTitle}</span>
                        <span className="text-[10px] text-text-muted">{m.language} • {m.ticketsSold} Tickets</span>
                      </div>
                    </div>
                    <span className="text-gold font-bold">{formatCurrency(m.grossSales)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Entertainment Events */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Top Live Entertainment Events</span>
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {rankingsData?.topEvents.map((e, idx) => (
                  <div key={e.eventId} className="flex justify-between items-center p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? "bg-purple-500 text-white" : "bg-white/10 text-white"}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-white font-bold block truncate max-w-[180px]">{e.eventTitle}</span>
                        <span className="text-[10px] text-text-muted">{e.category} • {e.ticketsSold} Passes</span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold">{formatCurrency(e.grossSales)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Theatres */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-gold" />
                <span>Top Performing Multiplexes</span>
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {rankingsData?.topTheatres.map((t, idx) => (
                  <div key={t.theatreId} className="flex justify-between items-center p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-white font-bold block">{t.theatreName}</span>
                        <span className="text-[10px] text-text-muted">{t.city} • {t.occupancyRate}% Occupancy</span>
                      </div>
                    </div>
                    <span className="text-white font-bold">{formatCurrency(t.grossSales)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Cities */}
            <div className="bg-[#121214] border border-white/10 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Top Performing Metro Cities</span>
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {rankingsData?.topCities.map((c, idx) => (
                  <div key={c.city} className="flex justify-between items-center p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-white font-bold">{c.city}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-gold font-bold block">{formatCurrency(c.grossSales)}</span>
                      <span className="text-[10px] text-text-muted">{c.ticketsSold} tix</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
