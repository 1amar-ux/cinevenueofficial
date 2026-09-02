import React, { useState } from "react";
import {
  X,
  LayoutDashboard,
  Landmark,
  Layers,
  Sliders,
  Film,
  CalendarRange,
  Ticket,
  PieChart,
  Sparkles,
  Tag,
  Users,
  Settings,
  QrCode,
  ArrowLeft,
  Copy,
  Check,
  LogOut,
  ChevronRight,
  Database
} from "lucide-react";
import { Movie, Theatre, Booking, MovieSchedule } from "../types";

// Import newly created modular sub-pages
import DashboardSubpage from "../pages/theatre-admin/Dashboard";
import TheatreProfileSubpage from "../pages/theatre-admin/TheatreProfile";
import ScreensSubpage from "../pages/theatre-admin/Screens";
import SeatLayoutSubpage from "../pages/theatre-admin/SeatLayout";
import MoviesSubpage from "../pages/theatre-admin/Movies";
import ShowsSubpage from "../pages/theatre-admin/Shows";
import BookingsSubpage from "../pages/theatre-admin/Bookings";
import ReportsSubpage from "../pages/theatre-admin/Reports";
import FoodSubpage from "../pages/theatre-admin/Food";
import CouponsSubpage from "../pages/theatre-admin/Coupons";
import StaffSubpage from "../pages/theatre-admin/Staff";
import SettingsSubpage from "../pages/theatre-admin/Settings";
import QRScannerSubpage from "../pages/theatre-admin/QRScanner";

interface TheatreManagerDashboardProps {
  theatreId: number;
  theatres: Theatre[];
  bookings: Booking[];
  schedules: MovieSchedule[];
  movies: Movie[];
  onClose: () => void;
  onScheduleShow: (newSchedule: MovieSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  onSettleVenueBookings: (theatreName: string) => void;
  onUpdateTheatre: (theatre: Theatre) => void;
}

export default function TheatreManagerDashboard({
  theatreId,
  theatres,
  bookings,
  schedules,
  movies,
  onClose,
  onScheduleShow,
  onDeleteSchedule,
  onSettleVenueBookings,
  onUpdateTheatre
}: TheatreManagerDashboardProps) {
  const theatre = theatres.find((t) => t.id === theatreId);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!theatre) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-red-500">Theatre Not Found</h2>
          <p className="text-text-secondary text-sm">
            The theatre with ID #{theatreId} does not exist in the active regional database.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider rounded transition-colors cursor-pointer border-0"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Navigation Items Config
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Theatre Profile", icon: Landmark },
    { id: "screens", label: "Screens", icon: Layers },
    { id: "seat-layout", label: "Seat Layout", icon: Sliders },
    { id: "movies", label: "Movies", icon: Film },
    { id: "shows", label: "Shows", icon: CalendarRange },
    { id: "bookings", label: "Bookings", icon: Ticket },
    { id: "food", label: "Food & Beverages", icon: Sparkles },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "reports", label: "Reports", icon: PieChart },
    { id: "staff", label: "Staff", icon: Users },
    { id: "qr-scanner", label: "QR Scanner", icon: QrCode },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  // Copy shareable link to clipboard
  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?theatreId=${theatre.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Dynamically render current page tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardSubpage
            theatre={theatre}
            bookings={bookings}
            schedules={schedules}
            movies={movies}
          />
        );
      case "profile":
        return (
          <TheatreProfileSubpage
            theatre={theatre}
            onUpdateTheatre={onUpdateTheatre}
          />
        );
      case "screens":
        return <ScreensSubpage theatreId={theatreId} />;
      case "seat-layout":
        return (
          <SeatLayoutSubpage
            theatre={theatre}
            onUpdateTheatre={onUpdateTheatre}
          />
        );
      case "movies":
        return <MoviesSubpage movies={movies} />;
      case "shows":
        return (
          <ShowsSubpage
            theatreName={theatre.name}
            schedules={schedules}
            movies={movies}
            onScheduleShow={onScheduleShow}
            onDeleteSchedule={onDeleteSchedule}
          />
        );
      case "bookings":
        return <BookingsSubpage theatreName={theatre.name} bookings={bookings} />;
      case "reports":
        return <ReportsSubpage theatre={theatre} bookings={bookings} />;
      case "food":
        return <FoodSubpage theatreId={theatreId} />;
      case "coupons":
        return <CouponsSubpage theatreId={theatreId} />;
      case "staff":
        return <StaffSubpage theatreId={theatreId} />;
      case "qr-scanner":
        return <QRScannerSubpage theatreName={theatre.name} bookings={bookings} />;
      case "settings":
        return (
          <SettingsSubpage
            theatre={theatre}
            onUpdateTheatre={onUpdateTheatre}
          />
        );
      default:
        return (
          <div className="text-center py-12 text-text-muted">
            Section under active construction.
          </div>
        );
    }
  };

  return (
    <div id="theatre-manager-portal" className="fixed inset-0 z-50 bg-[#0A0A0B] flex overflow-hidden text-left font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#121215] border-r border-white/5 flex flex-col justify-between shrink-0 hidden md:flex select-none">
        
        {/* UPPER PART: Identity & Links */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="p-6 border-b border-white/5 space-y-1.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
              <span className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">Partner Portal</span>
            </div>
            <h2 className="text-sm font-display font-bold text-text-primary tracking-wide truncate">
              {theatre.name}
            </h2>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 flex-1">
            {navigationItems.map((item) => {
              const active = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${
                    active
                      ? "bg-gold/15 text-gold"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${active ? "text-gold" : "text-text-muted"}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-gold" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* LOWER PART: Footer exit operations */}
        <div className="p-4 border-t border-white/5 space-y-2 shrink-0">
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-gold/30 hover:bg-white/[0.08] text-text-primary text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-gold" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-text-muted" />
                <span>Copy Shareable URL</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-0 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* SYSTEM STATUS HEAD BAR */}
        <header className="bg-[#121215] border-b border-white/5 h-16 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex md:hidden items-center justify-center p-2 rounded-xl bg-white/5 text-text-secondary hover:text-text-primary cursor-pointer border-0"
              title="Logout"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold font-mono">
                CONNECTED
              </span>
              <span className="text-xs text-text-secondary font-medium hidden sm:inline">
                / {navigationItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick mobile dropdown / tab switcher */}
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="md:hidden bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-text-primary text-xs cursor-pointer focus:outline-none"
            >
              {navigationItems.map((n) => (
                <option key={n.id} value={n.id} className="bg-[#0A0A0B]">
                  {n.label}
                </option>
              ))}
            </select>

            <span className="text-[11px] font-mono text-text-muted hidden lg:inline">
              Venue ID: #{theatre.id}
            </span>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              title="Close Workspace and Return"
            >
              <X className="w-3.5 h-3.5 text-text-muted" />
              <span>Close Workspace</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT LAYOUT */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0B] p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
