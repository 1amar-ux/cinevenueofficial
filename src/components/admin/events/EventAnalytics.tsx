import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Activity, Ticket, DollarSign, RefreshCw } from 'lucide-react';
import { entertainmentAnalyticsService, EventPerformanceRecord, EventCategoryPerformance } from '../../../services/entertainmentAnalyticsService';

export default function EventAnalytics() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [eventsList, setEventsList] = useState<EventPerformanceRecord[]>([]);
  const [categories, setCategories] = useState<EventCategoryPerformance[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [kpiRes, evRes] = await Promise.all([
        entertainmentAnalyticsService.getOverviewKPIs({ bookingType: "EVENT" }),
        entertainmentAnalyticsService.getEventAnalytics({ bookingType: "EVENT" })
      ]);
      setKpis(kpiRes);
      setEventsList(evRes.eventsList || []);
      setCategories(evRes.eventsByCategory || []);
    } catch (e) {
      console.error("Failed to load event analytics", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amt: number | undefined) => {
    if (amt === undefined) return "₹0.00";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amt);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Real KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs font-semibold uppercase">Event Passes Sold</span>
            <Ticket className="w-4 h-4 text-gold" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{kpis?.totalTicketsSold || 0}</span>
          <span className="text-[10px] text-text-muted mt-1">Confirmed registrations</span>
        </div>

        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs font-semibold uppercase">Gross Ticket Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{formatCurrency(kpis?.grossTicketSales)}</span>
          <span className="text-[10px] text-text-muted mt-1">Total customer value</span>
        </div>

        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs font-semibold uppercase">Verified Attendance</span>
            <Users className="w-4 h-4 text-gold" />
          </div>
          <span className="text-2xl font-bold text-gold font-mono">{kpis?.attendance || 0}</span>
          <span className="text-[10px] text-text-muted mt-1">QR scan check-ins</span>
        </div>

        <div className="bg-[#111113] p-5 rounded-2xl border border-white/5 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-secondary text-xs font-semibold uppercase">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white font-mono">{kpis?.bookingConversionRate || 0}%</span>
          <span className="text-[10px] text-text-muted mt-1">Pass checkout completion</span>
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="bg-[#111113] border border-white/5 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex justify-between items-center">
          <span>Entertainment Categories Box Office</span>
          <button onClick={loadData} className="text-text-muted hover:text-white cursor-pointer" title="Refresh">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-gold" : ""}`} />
          </button>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {categories.map((c) => (
            <div key={c.category} className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-text-muted text-[10px] block truncate">{c.category}</span>
              <span className="text-white font-bold block mt-1">{formatCurrency(c.grossSales)}</span>
              <span className="text-[10px] text-gold">{c.ticketsSold} passes</span>
            </div>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#111113] border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">Event Performance Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/50 text-text-muted uppercase text-[10px] border-b border-white/5">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Venue / City</th>
                <th className="p-3 text-right">Passes</th>
                <th className="p-3 text-right">Gross Sales</th>
                <th className="p-3 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {eventsList.map((e) => (
                <tr key={e.eventId} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-bold text-white">{e.eventTitle}</td>
                  <td className="p-3 text-text-secondary">{e.category}</td>
                  <td className="p-3 text-text-muted">{e.venueName}, {e.city}</td>
                  <td className="p-3 text-right text-gold font-bold">{e.ticketsSold}</td>
                  <td className="p-3 text-right text-white font-bold">{formatCurrency(e.grossSales)}</td>
                  <td className="p-3 text-right text-text-secondary">{e.attendance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
