import React, { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Calendar,
  Clock,
  Film,
  RefreshCw,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  Users,
  Shield,
  HelpCircle,
  X,
  Ticket,
  Lock,
  Ban,
  Radio,
  ChevronRight
} from "lucide-react";
import { Theatre } from "../../types";
import { theatreOperationsService } from "../../services/theatreOperationsService";

interface SeatLayoutProps {
  theatre: Theatre;
  onUpdateTheatre?: (t: Theatre) => void;
}

interface SeatItem {
  id: string;
  row: string;
  number: string;
  seatCode: string;
  category: "REGULAR" | "PREMIUM" | "RECLINER" | "WHEELCHAIR" | "COMPANION" | "SOFA" | "COUPLE";
  price: number;
  colIndex: number;
  isAisleGap?: boolean;
  isWheelchair?: boolean;
  isCompanion?: boolean;
  isBlocked?: boolean;
  status: "AVAILABLE" | "BOOKED" | "LOCKED" | "BLOCKED" | "UNAVAILABLE" | "UNKNOWN";
  bookingRef?: string;
  bookingSource?: string;
  lastUpdated?: string;
}

interface RowItem {
  row: string;
  category: string;
  price: number;
  seats: SeatItem[];
}

export default function SeatLayout({ theatre }: SeatLayoutProps) {
  // Filter States
  const [screens, setScreens] = useState<any[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<string>("");
  const [shows, setShows] = useState<any[]>([]);
  const [selectedShowId, setSelectedShowId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  // Data States
  const [layoutRows, setLayoutRows] = useState<RowItem[]>([]);
  const [screenType, setScreenType] = useState<string>("DOLBY_ATMOS");
  const [summary, setSummary] = useState<any>(null);
  const [posInfo, setPosInfo] = useState<any>({
    provider: "CineVenue Native",
    status: "STANDALONE",
    lastSync: null
  });

  // UI & Inspector States
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [syncingPos, setSyncingPos] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [selectedSeatDetails, setSelectedSeatDetails] = useState<SeatItem | null>(null);

  // 1. Initial Load: Fetch Screens for this Theatre
  useEffect(() => {
    let isMounted = true;
    async function loadScreens() {
      try {
        setLoading(true);
        const data = await theatreOperationsService.getTheatreScreens(theatre.id);
        if (!isMounted) return;

        if (data.screens && data.screens.length > 0) {
          setScreens(data.screens);
          setSelectedScreenId(data.screens[0].id);
        }
        if (data.theatre?.posIntegration) {
          setPosInfo({
            provider: data.theatre.posIntegration.provider,
            status: data.theatre.posIntegration.status,
            lastSync: data.theatre.posIntegration.lastSync
          });
        }
      } catch (err: any) {
        console.error("Failed to load screens:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadScreens();
    return () => {
      isMounted = false;
    };
  }, [theatre.id]);

  // 2. Load Shows when Screen or Date changes
  useEffect(() => {
    let isMounted = true;
    async function loadShows() {
      if (!selectedScreenId) return;
      try {
        const showList = await theatreOperationsService.getTheatreShowsForDate(
          theatre.id,
          selectedDate,
          selectedScreenId
        );
        if (!isMounted) return;

        setShows(showList);
        if (showList.length > 0) {
          setSelectedShowId(showList[0].id);
        } else {
          setSelectedShowId("");
          // Fallback to static physical screen layout if no show is scheduled
          loadPhysicalScreenLayout(selectedScreenId);
        }
      } catch (err) {
        console.error("Failed to load shows:", err);
      }
    }

    loadShows();
    return () => {
      isMounted = false;
    };
  }, [theatre.id, selectedScreenId, selectedDate]);

  // 3. Fallback: Load Physical Screen Layout when no show is selected
  async function loadPhysicalScreenLayout(screenId: string) {
    try {
      setLoading(true);
      const layout = await theatreOperationsService.getScreenSeatLayout(theatre.id, screenId);
      if (layout) {
        setLayoutRows(layout.rows || []);
        setScreenType(layout.screenType || "DOLBY_ATMOS");
        setSummary({
          showId: "",
          movieTitle: "No Show Scheduled",
          theatreId: String(theatre.id),
          theatreName: theatre.name,
          screenId,
          screenName: layout.screenName,
          showDate: selectedDate,
          showTime: "N/A",
          totalConfiguredSeats: layout.capacity || 0,
          sellableSeats: layout.capacity || 0,
          bookedSeats: 0,
          temporarilyHeldSeats: 0,
          blockedSeats: (layout.rows || []).reduce(
            (acc: number, r: any) => acc + (r.seats?.filter((s: any) => s.isBlocked)?.length || 0),
            0
          ),
          remainingAvailableSeats: layout.capacity || 0,
          occupancyPercentage: 0,
          grossBookingAmount: 0,
          isPosIntegrated: layout.posConnectionStatus === "CONNECTED",
          posProvider: layout.posProvider,
          posConnectionStatus: layout.posConnectionStatus,
          lastSyncedAt: layout.lastSync,
          isStale: false,
          syncWarning: "No movie show scheduled for selected slot. Showing physical screen blueprint."
        });
      }
    } catch (err) {
      console.error("Failed to load physical layout:", err);
    } finally {
      setLoading(false);
    }
  }

  // 4. Load Show-Specific Authoritative Seat Status when Show is selected
  useEffect(() => {
    let isMounted = true;
    async function loadShowStatus() {
      if (!selectedShowId) return;
      try {
        setLoading(true);
        const res = await theatreOperationsService.getShowSeatStatus(theatre.id, selectedShowId);
        if (!isMounted) return;

        if (res.data) {
          setSummary(res.data.summary);
          setLayoutRows(res.data.layout?.rows || []);
          setScreenType(res.data.layout?.screenType || "DOLBY_ATMOS");
          if (res.data.summary.posProvider) {
            setPosInfo({
              provider: res.data.summary.posProvider,
              status: res.data.summary.posConnectionStatus,
              lastSync: res.data.summary.lastSyncedAt
            });
          }
        }
      } catch (err) {
        console.error("Failed to load show seat status:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadShowStatus();
    return () => {
      isMounted = false;
    };
  }, [theatre.id, selectedShowId]);

  // 5. Handle Sync Layout from POS Provider
  const handleSyncLayout = async () => {
    if (!selectedScreenId) return;
    try {
      setSyncingPos(true);
      setSyncMessage(null);
      const res = await theatreOperationsService.syncScreenLayoutFromPos(theatre.id, selectedScreenId);
      setSyncMessage({
        text: res.data?.message || "Seat layout successfully imported from POS provider.",
        type: "success"
      });
      // Refresh layout
      if (selectedShowId) {
        const refreshed = await theatreOperationsService.getShowSeatStatus(theatre.id, selectedShowId);
        if (refreshed.data) {
          setSummary(refreshed.data.summary);
          setLayoutRows(refreshed.data.layout?.rows || []);
        }
      } else {
        await loadPhysicalScreenLayout(selectedScreenId);
      }
    } catch (err: any) {
      setSyncMessage({
        text: err.message || "Failed to synchronize seat layout from POS provider.",
        type: "error"
      });
    } finally {
      setSyncingPos(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // 6. Handle Refresh Live Seat Availability
  const handleRefreshAvailability = async () => {
    if (!selectedShowId) return;
    try {
      setRefreshing(true);
      const res = await theatreOperationsService.refreshShowSeatAvailability(theatre.id, selectedShowId);
      if (res.data) {
        setSummary(res.data.summary);
        setLayoutRows(res.data.layout?.rows || []);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Quick Date Selectors
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const t = new Date(Date.now() + 24 * 3600000);
    return t.toISOString().split("T")[0];
  }, []);

  // Format Helper
  const formatSyncTime = (iso?: string | null) => {
    if (!iso) return "Never";
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 text-left select-none text-text-primary">
      {/* 1. HEADER SECTION & TITLE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">
              Authoritative Inventory System
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-wide mt-1">
            Seat Layout & Show-wise Occupancy
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Original auditorium blueprint mapping, live POS turnstile synchronization, and show-instance seat availability.
          </p>
        </div>

        {/* Integration Status Badge & Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#121215] border border-white/10 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-sm">
            <Cpu className="w-4 h-4 text-gold" />
            <div className="text-[11px] font-mono leading-tight">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{posInfo.provider}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  posInfo.status === "CONNECTED" || posInfo.status === "ONLINE"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : posInfo.status === "TESTING"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-white/10 text-text-muted"
                }`}>
                  {posInfo.status}
                </span>
              </div>
              <span className="text-[10px] text-text-secondary">
                Synced: {formatSyncTime(posInfo.lastSync)}
              </span>
            </div>
          </div>

          <button
            onClick={handleSyncLayout}
            disabled={syncingPos}
            className="px-4 py-2 bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Import original seat layout from POS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingPos ? "animate-spin" : ""}`} />
            <span>{syncingPos ? "Importing..." : "Sync Seat Layout"}</span>
          </button>

          <button
            onClick={handleRefreshAvailability}
            disabled={refreshing || !selectedShowId}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-40"
            title="Refresh show occupancy"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>{refreshing ? "Checking..." : "Live Refresh"}</span>
          </button>
        </div>
      </div>

      {/* SYNC NOTIFICATION BANNER */}
      {syncMessage && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
          syncMessage.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {syncMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{syncMessage.text}</span>
        </div>
      )}

      {/* STALE OR OUTAGE WARNING BANNER */}
      {summary?.syncWarning && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{summary.syncWarning}</span>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400/80 shrink-0">
            Authoritative Isolation Active
          </span>
        </div>
      )}

      {/* 2. TOP FILTER CONTROLS BAR */}
      <div className="bg-[#121215] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Theatre Selector (Authorized locked) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Authorized Theatre
            </label>
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-gold truncate">
              {theatre.name} ({theatre.city})
            </div>
          </div>

          {/* Screen / Auditorium Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-gold" />
              <span>Auditorium / Screen</span>
            </label>
            <select
              value={selectedScreenId}
              onChange={(e) => setSelectedScreenId(e.target.value)}
              className="w-full bg-[#18181C] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-gold cursor-pointer"
            >
              {screens.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#121215]">
                  {s.name} ({s.capacity || s.configuredSeats} Seats)
                </option>
              ))}
            </select>
          </div>

          {/* Show Date Picker */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gold" />
              <span>Show Date</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#18181C] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-gold cursor-pointer"
              />
            </div>
          </div>

          {/* Movie / Show Selector */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-gold" />
              <span>Movie & Showtime Slot</span>
            </label>
            {shows.length > 0 ? (
              <select
                value={selectedShowId}
                onChange={(e) => setSelectedShowId(e.target.value)}
                className="w-full bg-[#18181C] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-gold cursor-pointer"
              >
                {shows.map((sh) => (
                  <option key={sh.id} value={sh.id} className="bg-[#121215]">
                    {sh.timeSlot} — {sh.movieTitle} [{sh.format || "2D"}] ({sh.language || "Native"})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-text-muted italic">
                No shows scheduled on {selectedDate}
              </div>
            )}
          </div>
        </div>

        {/* Date Quick Presets */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <span className="text-[10px] uppercase font-bold text-text-secondary mr-1">Quick Select:</span>
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              selectedDate === todayStr
                ? "bg-gold text-black border-gold"
                : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(tomorrowStr)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              selectedDate === tomorrowStr
                ? "bg-gold text-black border-gold"
                : "bg-white/5 text-text-secondary border-white/10 hover:border-white/20"
            }`}
          >
            Tomorrow
          </button>
        </div>
      </div>

      {/* 3. SHOW BOOKING & OCCUPANCY METRICS SUMMARY */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Total Configured */}
          <div className="bg-[#121215] border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
              Configured Seats
            </span>
            <div className="text-xl font-mono font-bold text-white">
              {summary.totalConfiguredSeats}
            </div>
            <span className="text-[9px] text-text-muted">Total physical count</span>
          </div>

          {/* Sellable Seats */}
          <div className="bg-[#121215] border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
              Sellable Seats
            </span>
            <div className="text-xl font-mono font-bold text-blue-400">
              {summary.sellableSeats}
            </div>
            <span className="text-[9px] text-text-muted">Denominator capacity</span>
          </div>

          {/* Booked / Sold */}
          <div className="bg-[#121215] border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
              Booked / Sold
            </span>
            <div className="text-xl font-mono font-bold text-emerald-400">
              {summary.bookedSeats}
            </div>
            <span className="text-[9px] text-text-muted">Confirmed turnstiles</span>
          </div>

          {/* Temporarily Held */}
          <div className="bg-[#121215] border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
              Held / Locked
            </span>
            <div className="text-xl font-mono font-bold text-amber-400">
              {summary.temporarilyHeldSeats}
            </div>
            <span className="text-[9px] text-text-muted">Active checkout holds</span>
          </div>

          {/* Blocked / Unavailable */}
          <div className="bg-[#121215] border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
              Blocked / Broken
            </span>
            <div className="text-xl font-mono font-bold text-red-400">
              {summary.blockedSeats}
            </div>
            <span className="text-[9px] text-text-muted">Safety / maintenance</span>
          </div>

          {/* Occupancy % */}
          <div className="bg-[#121215] border border-gold/30 rounded-xl p-3.5 space-y-1 shadow-md bg-gold/[0.03]">
            <span className="text-[9px] font-bold uppercase tracking-wider text-gold block">
              Occupancy Rate
            </span>
            <div className="text-xl font-mono font-extrabold text-gold">
              {summary.occupancyPercentage}%
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, summary.occupancyPercentage)}%` }}
              />
            </div>
          </div>

          {/* Gross Box Office Revenue */}
          <div className="bg-[#121215] border border-white/10 rounded-xl p-3.5 space-y-1 shadow-md sm:col-span-1 col-span-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">
              Show Gross
            </span>
            <div className="text-xl font-mono font-bold text-white">
              ₹{Number(summary.grossBookingAmount || 0).toLocaleString("en-IN")}
            </div>
            <span className="text-[9px] text-text-muted">Actual ticket receipts</span>
          </div>
        </div>
      )}

      {/* 4. MAIN AUDITORIUM SEAT MAP RENDERING CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Visual Seating Map */}
        <div className="lg:col-span-3 bg-[#121215] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* CINEMA SCREEN PROJECTION ARC */}
          <div className="w-4/5 mx-auto text-center space-y-2">
            <div className="h-2 w-full bg-gradient-to-b from-gold via-gold/60 to-transparent rounded-t-full shadow-[0_6px_25px_rgba(212,175,55,0.45)]" />
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-gold/80 uppercase">
                {screenType === "IMAX_LASER"
                  ? "IMAX GRAND CURVED LASER SCREEN"
                  : screenType === "VIP_LOUNGE"
                  ? "VIP PRIVATE LOUNGE PROJECTION"
                  : "DOLBY ATMOS 4K HIGH CONTRAST SCREEN"}
              </span>
            </div>
          </div>

          {/* SEAT GRID MATRIX */}
          <div className="w-full overflow-x-auto py-4 flex flex-col items-center space-y-2.5">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-text-muted">
                <RefreshCw className="w-6 h-6 animate-spin text-gold" />
                <span className="text-xs font-mono">Calibrating auditorium blueprint...</span>
              </div>
            ) : layoutRows.length === 0 ? (
              <div className="py-16 text-center text-text-secondary space-y-2">
                <Info className="w-8 h-8 text-gold mx-auto" />
                <p className="text-xs">No seats mapped for this screen yet.</p>
                <button
                  onClick={handleSyncLayout}
                  className="px-4 py-2 bg-gold text-black rounded-lg text-xs font-bold uppercase cursor-pointer"
                >
                  Import Layout
                </button>
              </div>
            ) : (
              layoutRows.map((rowGroup) => {
                return (
                  <div key={rowGroup.row} className="flex items-center gap-2 min-w-max">
                    {/* Left Row Header */}
                    <span className="w-6 text-right font-mono text-xs font-bold text-text-secondary select-none">
                      {rowGroup.row}
                    </span>

                    {/* Seats in Row */}
                    <div className="flex items-center gap-1.5">
                      {rowGroup.seats.map((seat, seatIdx) => {
                        const isSelected = selectedSeatDetails?.seatCode === seat.seatCode;
                        
                        // Status badge styling with accessible text/patterns
                        let btnStyle = "bg-[#18181C] text-text-secondary border-white/10 hover:border-gold hover:text-white";
                        let statusIcon = null;

                        if (seat.status === "BOOKED") {
                          btnStyle = "bg-red-950/70 text-red-300 border-red-500/40 cursor-pointer";
                          statusIcon = "✓";
                        } else if (seat.status === "LOCKED") {
                          btnStyle = "bg-amber-950/70 text-amber-300 border-amber-500/50 animate-pulse";
                          statusIcon = "⏱";
                        } else if (seat.status === "BLOCKED") {
                          btnStyle = "bg-white/5 text-white/30 border-white/5 cursor-not-allowed";
                          statusIcon = "✕";
                        } else if (seat.status === "UNKNOWN") {
                          btnStyle = "bg-purple-950/50 text-purple-300 border-purple-500/30";
                          statusIcon = "?";
                        } else if (seat.isWheelchair) {
                          btnStyle = "bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:border-indigo-400";
                          statusIcon = "♿";
                        } else if (seat.category === "RECLINER") {
                          btnStyle = "bg-amber-900/30 text-amber-200 border-amber-500/30 hover:border-gold";
                        } else if (seat.category === "SOFA") {
                          btnStyle = "bg-pink-950/40 text-pink-300 border-pink-500/30 hover:border-pink-400";
                        }

                        if (isSelected) {
                          btnStyle = "ring-2 ring-gold scale-110 shadow-lg shadow-gold/20 font-extrabold z-10 " + btnStyle;
                        }

                        // Render aisle spacer if this column represents an aisle gap
                        const isPrevSeatFar = seatIdx > 0 && (seat.colIndex - rowGroup.seats[seatIdx - 1].colIndex > 1);

                        return (
                          <React.Fragment key={seat.seatCode}>
                            {isPrevSeatFar && (
                              <div className="w-5 text-center text-[8px] text-white/10 select-none">
                                •
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedSeatDetails(seat)}
                              className={`w-7 h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer border ${btnStyle}`}
                              title={`${seat.seatCode} (${seat.category}) - ${seat.status} - ₹${seat.price}`}
                            >
                              {statusIcon || seat.number}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Right Row Header */}
                    <span className="w-6 text-left font-mono text-xs font-bold text-text-secondary select-none">
                      {rowGroup.row}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* 5. VISUAL STATUS & CATEGORY LEGEND */}
          <div className="w-full border-t border-white/10 pt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] uppercase font-bold text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#18181C] border border-white/20 inline-block" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-950/80 border border-red-500/50 flex items-center justify-center text-[7px] text-red-300">✓</span>
              <span className="text-red-300">Booked / Sold</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-[7px] text-amber-300">⏱</span>
              <span className="text-amber-300">Held (Cart Lock)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[7px] text-white/40">✕</span>
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-center text-[7px] text-indigo-300">♿</span>
              <span className="text-indigo-300">Wheelchair</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-900/40 border border-amber-500/40 inline-block" />
              <span className="text-amber-200">Recliner</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-[7px] text-purple-300">?</span>
              <span className="text-purple-300">Status Unknown</span>
            </div>
          </div>
        </div>

        {/* 6. SEAT DETAILS INSPECTOR PANEL */}
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-gold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Seat Inspector
              </h3>
            </div>
            {selectedSeatDetails && (
              <button
                onClick={() => setSelectedSeatDetails(null)}
                className="text-text-muted hover:text-white p-1 rounded cursor-pointer"
                title="Deselect"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {selectedSeatDetails ? (
            <div className="space-y-4 text-xs">
              {/* Highlight Card */}
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-extrabold text-gold">
                    {selectedSeatDetails.seatCode}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                    selectedSeatDetails.status === "BOOKED"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : selectedSeatDetails.status === "LOCKED"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : selectedSeatDetails.status === "BLOCKED"
                      ? "bg-white/10 text-white/50 border border-white/10"
                      : selectedSeatDetails.status === "UNKNOWN"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {selectedSeatDetails.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-secondary pt-1 border-t border-white/5">
                  <span>Row {selectedSeatDetails.row} · Number {selectedSeatDetails.number}</span>
                  <span className="font-bold text-white">₹{selectedSeatDetails.price}</span>
                </div>
              </div>

              {/* Attributes List */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase">Category:</span>
                  <span className="font-bold text-white uppercase">{selectedSeatDetails.category}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase">Show Slot:</span>
                  <span className="font-bold text-white">{summary?.showTime || "N/A"} ({summary?.showDate})</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase">Feature Film:</span>
                  <span className="font-bold text-gold truncate max-w-[160px]">{summary?.movieTitle || "N/A"}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase">Booking Source:</span>
                  <span className="font-bold text-white">{selectedSeatDetails.bookingSource || "None / Open"}</span>
                </div>

                {selectedSeatDetails.bookingRef && (
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-[10px] text-text-secondary uppercase">Sanitized Ref:</span>
                    <span className="font-mono text-gold font-bold">{selectedSeatDetails.bookingRef}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase">Auditorium:</span>
                  <span className="font-bold text-white">{summary?.screenName}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-[10px] text-text-secondary uppercase">Last Status Check:</span>
                  <span className="font-mono text-[10px] text-text-muted">
                    {selectedSeatDetails.lastUpdated ? formatSyncTime(selectedSeatDetails.lastUpdated) : "Live Memory"}
                  </span>
                </div>
              </div>

              {/* Data Privacy Notice */}
              <div className="p-3 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-gold text-[10px] font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Customer Privacy Protected</span>
                </div>
                <p className="text-[10px] text-text-muted leading-relaxed">
                  Confidential payment credentials, full customer names, and passwords are never displayed in operational staff dashboards.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted space-y-2">
              <Users className="w-8 h-8 text-white/20 mx-auto" />
              <p className="text-xs">Click any seat on the auditorium map to inspect live verification details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
