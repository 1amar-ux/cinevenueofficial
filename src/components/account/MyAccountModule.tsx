import React, { useState } from "react";
import { 
  User, Ticket, Calendar, Film, Wallet, Coins, Bell, Settings, 
  QrCode, Clock, ShieldCheck, Download, Trash2, CheckCircle, 
  AlertCircle, ChevronRight, LogOut, ArrowRight, Sparkles
} from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";
import { 
  Booking, EventRegistration, CastingApplication, 
  CineCoinsUserWallet, CineCoinsTransaction 
} from "../../types";
import { CustomerProposalsView } from "../proposals/CustomerProposalsView";

interface MyAccountModuleProps {
  userEmail: string | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  bookings: Booking[];
  eventRegistrations: EventRegistration[];
  castingApplications: CastingApplication[];
  onAddCastingApplication: (app: CastingApplication) => void;
  userWallet: CineCoinsUserWallet;
  transactions: CineCoinsTransaction[];
  onOpenCineCoins: () => void;
  onClose?: () => void;
}

export default function MyAccountModule({
  userEmail,
  onLogout,
  onOpenAuth,
  bookings = [],
  eventRegistrations = [],
  castingApplications = [],
  onAddCastingApplication,
  userWallet,
  transactions = [],
  onOpenCineCoins,
  onClose
}: MyAccountModuleProps) {
  const [activeTab, setActiveTab] = useState<
    "bookings" | "events" | "casting" | "wallet" | "cinecoins" | "proposals" | "notifications" | "settings"
  >("bookings");

  const [selectedBookingForQR, setSelectedBookingForQR] = useState<Booking | null>(null);

  // New Audition Application Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [roleApplied, setRoleApplied] = useState("Lead Actor / Actress");
  const [expYears, setExpYears] = useState("2");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Settings Form State
  const [profileName, setProfileName] = useState(userEmail ? userEmail.split("@")[0] : "CineVenue Member");
  const [profilePhone, setProfilePhone] = useState("+91 98765 43210");
  const [profileDob, setProfileDob] = useState("1998-05-15");
  const [isSavedSettings, setIsSavedSettings] = useState(false);

  // User-specific filtering
  const myBookings = bookings.filter(b => b.userEmail?.toLowerCase() === userEmail?.toLowerCase());
  const myEvents = eventRegistrations.filter(r => r.userEmail?.toLowerCase() === userEmail?.toLowerCase());
  const myAuditions = castingApplications.filter(c => c.userEmail?.toLowerCase() === userEmail?.toLowerCase());

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center p-6 font-sans">
        <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto text-gold text-2xl">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">My Account Portal</h2>
            <p className="text-xs text-text-secondary">
              Please log in to view your booked movie tickets, event passes, audition status, and CineCoins wallet.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer border-0 shadow-lg shadow-gold/10"
          >
            Log In / Sign Up
          </button>
        </div>
      </div>
    );
  }

  const handleApplyCastingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone) return;

    const newApp: CastingApplication = {
      id: "CAST-" + Math.floor(1000 + Math.random() * 9000),
      userEmail: userEmail,
      userName: applicantName,
      phone: applicantPhone,
      roleApplied: roleApplied,
      experienceYears: parseInt(expYears) || 0,
      portfolioUrl: portfolioUrl || "https://portfolio.cinevenue.com/actor",
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=70",
      submittedDate: new Date().toLocaleDateString(),
      status: "Under Review"
    };

    onAddCastingApplication(newApp);
    setShowApplyModal(false);
    setApplicantName("");
    setApplicantPhone("");
    alert("✓ Audition Application Submitted successfully! Our casting director will review your profile.");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedSettings(true);
    setTimeout(() => setIsSavedSettings(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-text-primary font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CineVenueLogo size="md" onClick={() => window.location.href = "/"} />
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest hidden sm:block">
              My Account Sub-Website
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCineCoins}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-gold/20 border border-gold/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-gold hover:bg-gold hover:text-black transition-all cursor-pointer"
            >
              <span>🪙 {userWallet.balanceCoins} CC</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-text-muted border border-white/10 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Account Nav Subtabs */}
        <div className="max-w-7xl mx-auto mt-4 pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold uppercase tracking-wider text-text-secondary">
          {[
            { id: "bookings", label: "My Bookings", icon: "🎟️", count: myBookings.length },
            { id: "events", label: "My Events", icon: "🎪", count: myEvents.length },
            { id: "casting", label: "My Casting Auditions", icon: "🎬", count: myAuditions.length },
            { id: "proposals", label: "My Proposals & Quotes", icon: "📋" },
            { id: "wallet", label: "My Wallet", icon: "💳" },
            { id: "cinecoins", label: "My CineCoins", icon: "🪙" },
            { id: "notifications", label: "Notifications", icon: "🔔" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer border-0 ${
                activeTab === item.id
                  ? "bg-gold text-black font-extrabold shadow-lg shadow-gold/15"
                  : "hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === item.id ? "bg-black/20 text-black" : "bg-gold/20 text-gold"
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

        {/* 1. MY BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🎟️ My Movie Bookings ({myBookings.length})
                </h2>
                <p className="text-xs text-text-secondary mt-1">View active digital QR passes and seat reservations.</p>
              </div>

              <button
                onClick={() => window.location.href = "/#now-showing"}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-0"
              >
                + Book New Movie
              </button>
            </div>

            {myBookings.length === 0 ? (
              <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-12 text-center space-y-3">
                <Ticket className="w-12 h-12 text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-white">No Movie Bookings Found</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">You haven't booked any movie tickets yet. Browse our now showing releases!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myBookings.map((b) => (
                  <div key={b.id} className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 space-y-4 relative overflow-hidden hover:border-gold/30 transition-all shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-gold uppercase bg-gold/10 px-2.5 py-0.5 rounded border border-gold/20">
                          ID: {b.id}
                        </span>
                        <h3 className="text-lg font-black text-white mt-2">{b.movieTitle}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">📍 {b.theatreName}</p>
                      </div>

                      <button
                        onClick={() => setSelectedBookingForQR(b)}
                        className="p-2.5 bg-white/5 hover:bg-gold hover:text-black text-gold rounded-xl border border-white/10 transition-colors"
                        title="View Digital QR Pass"
                      >
                        <QrCode className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
                      <div>
                        <span className="text-[9px] text-text-muted font-bold uppercase block">Show Date</span>
                        <span className="text-white font-mono font-bold">{b.date}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted font-bold uppercase block">Time Slot</span>
                        <span className="text-white font-mono font-bold">{b.timeSlot}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted font-bold uppercase block">Seats</span>
                        <span className="text-gold font-mono font-extrabold">{b.seats.join(", ")}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-text-muted">Total Paid: <strong className="text-white">₹{b.totalPrice}</strong></span>
                      <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                        b.status === "Settled" || b.status === "Confirmed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        ✓ {b.status || "Confirmed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. MY EVENTS TAB */}
        {activeTab === "events" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🎪 My Event Registrations ({myEvents.length})
                </h2>
                <p className="text-xs text-text-secondary mt-1">Live concerts, comedy shows, and festival passes.</p>
              </div>

              <button
                onClick={() => window.location.href = "/#events"}
                className="px-4 py-2 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-0"
              >
                + Browse Events
              </button>
            </div>

            {myEvents.length === 0 ? (
              <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-12 text-center space-y-3">
                <Calendar className="w-12 h-12 text-text-muted mx-auto" />
                <h3 className="text-base font-bold text-white">No Event Passes Registered</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">Explore live music concerts, standup comedy shows, and stage events on CineVenue.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myEvents.map((r) => (
                  <div key={r.id} className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-gold/30 transition-all shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                          {r.categoryName} Pass
                        </span>
                        <h3 className="text-lg font-black text-white mt-2">{r.eventTitle}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">📍 {r.venueName}, {r.city}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs">
                      <div>
                        <span className="text-[9px] text-text-muted font-bold uppercase block">Date & Time</span>
                        <span className="text-white font-mono font-bold">{r.eventDate} • {r.eventTime}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-text-muted font-bold uppercase block">Pass Count</span>
                        <span className="text-cyan-400 font-mono font-extrabold">{r.quantity} Tickets</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-text-muted">Total Paid: <strong className="text-white">₹{r.totalPrice}</strong></span>
                      <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded font-bold uppercase text-[10px]">
                        ✓ Confirmed Pass
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MY CASTING AUDITIONS TAB */}
        {activeTab === "casting" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🎬 Film Production Auditions & Casting Portal
                </h2>
                <p className="text-xs text-text-secondary mt-1">Submit your actor profile for upcoming feature films produced by CineVenue.</p>
              </div>

              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-0 shadow-lg"
              >
                + Submit New Audition Profile
              </button>
            </div>

            {myAuditions.length === 0 ? (
              <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-12 text-center space-y-4">
                <Film className="w-12 h-12 text-gold mx-auto opacity-50" />
                <h3 className="text-base font-bold text-white">No Casting Applications Submitted Yet</h3>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  Are you an aspiring actor, director, or technician? Submit your portfolio to get shortlisted for upcoming film projects.
                </p>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="px-6 py-2.5 bg-gold text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer border-0"
                >
                  Apply for Auditions Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myAuditions.map((app) => (
                  <div key={app.id} className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 space-y-4 hover:border-gold/30 transition-all shadow-xl">
                    <div className="flex items-start gap-4">
                      <img src={app.photoUrl} alt={app.userName} className="w-16 h-16 rounded-xl object-cover border border-amber-500/30" />
                      <div>
                        <span className="text-[10px] font-mono font-bold text-gold uppercase bg-gold/10 px-2.5 py-0.5 rounded">
                          {app.roleApplied}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1">{app.userName}</h3>
                        <p className="text-xs text-text-muted">Submitted: {app.submittedDate} • {app.experienceYears} Years Exp.</p>
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs flex justify-between items-center">
                      <span className="text-text-muted">Casting Status:</span>
                      <span className={`px-2.5 py-0.5 rounded font-black text-[10px] uppercase ${
                        app.status === "Selected" ? "bg-emerald-500/20 text-emerald-400" :
                        app.status === "Shortlisted" ? "bg-amber-500/20 text-amber-400" : "bg-sky-500/20 text-sky-400"
                      }`}>
                        ● {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. MY WALLET TAB */}
        {activeTab === "wallet" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                💳 My CineVenue Digital Wallet
              </h2>
              <p className="text-xs text-text-secondary">Cash refund balances and CineCoins wallet synchronization.</p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Cash Refund Balance</span>
                  <span className="text-2xl font-black text-white font-mono">₹0.00 INR</span>
                </div>
                <div className="bg-gradient-to-r from-amber-500/20 to-gold/20 border border-gold/40 rounded-xl p-4">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">CineCoins Equivalent</span>
                  <span className="text-2xl font-black text-gold font-mono">₹{(userWallet.balanceCoins * 0.10).toFixed(2)} INR</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⚙️ User Profile & Preferences
              </h2>

              {isSavedSettings && (
                <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl font-bold text-center">
                  ✓ Profile preferences updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div>
                  <label className="text-text-muted font-bold uppercase block mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-text-muted font-bold uppercase block mb-1">Registered Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3 text-text-muted cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-text-muted font-bold uppercase block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="text-text-muted font-bold uppercase block mb-1">Date of Birth (For Birthday CC Rewards)</label>
                  <input
                    type="date"
                    value={profileDob}
                    onChange={(e) => setProfileDob(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-light text-black font-extrabold uppercase tracking-wider rounded-xl cursor-pointer border-0 mt-4 shadow-lg shadow-gold/10"
                >
                  Save Profile Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PROPOSALS & QUOTATIONS TAB */}
        {activeTab === "proposals" && (
          <div className="space-y-6 animate-fade-in">
            <CustomerProposalsView 
              userEmail={userEmail}
              userName={profileName}
              userPhone={profilePhone}
            />
          </div>
        )}

      </main>

      {/* CASTING AUDITION SUBMIT MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0F0F12] border border-gold/40 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-white">🎬 Submit Film Casting Application</h3>
            <p className="text-xs text-text-secondary">Provide your acting credentials to get reviewed by CineVenue producers.</p>

            <form onSubmit={handleApplyCastingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-text-muted font-bold uppercase block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-gold"
                />
              </div>

              <div>
                <label className="text-text-muted font-bold uppercase block mb-1">Mobile Contact</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-gold"
                />
              </div>

              <div>
                <label className="text-text-muted font-bold uppercase block mb-1">Role Applied For</label>
                <select
                  value={roleApplied}
                  onChange={(e) => setRoleApplied(e.target.value)}
                  className="w-full bg-[#18181D] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                >
                  <option value="Lead Actor / Actress">Lead Actor / Actress</option>
                  <option value="Supporting Character">Supporting Character</option>
                  <option value="Film Director / Assistant">Film Director / Assistant</option>
                  <option value="Cinematographer / Camera">Cinematographer / Camera</option>
                  <option value="Music Composer / Singer">Music Composer / Singer</option>
                </select>
              </div>

              <div>
                <label className="text-text-muted font-bold uppercase block mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={expYears}
                  onChange={(e) => setExpYears(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-text-muted font-bold uppercase block mb-1">Headshot Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-black font-extrabold uppercase rounded-xl"
                >
                  Submit Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKET QR MODAL */}
      {selectedBookingForQR && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0F0F12] border border-gold/40 w-full max-w-sm rounded-2xl p-6 text-center space-y-4 relative shadow-2xl">
            <button
              onClick={() => setSelectedBookingForQR(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              ✕
            </button>

            <CineVenueLogo size="sm" />
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">{selectedBookingForQR.movieTitle}</h3>
              <p className="text-xs text-text-muted">{selectedBookingForQR.theatreName}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center shadow-inner">
              <QrCode className="w-36 h-36 text-black" />
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs font-mono space-y-1 text-left">
              <div className="flex justify-between"><span className="text-text-muted">Seats:</span><span className="text-gold font-bold">{selectedBookingForQR.seats.join(", ")}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Date:</span><span className="text-white">{selectedBookingForQR.date}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">Slot:</span><span className="text-white">{selectedBookingForQR.timeSlot}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
