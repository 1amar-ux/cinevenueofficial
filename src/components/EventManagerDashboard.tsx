import React, { useState, useEffect } from "react";
import { X, CalendarRange, PlusCircle, Trash2, MapPin, DollarSign, Users, Ticket, Copy, Check, LayoutDashboard, Landmark, Sparkles, ArrowLeft, Clock, Activity, FileText, Settings, Plus, Percent } from "lucide-react";
import { Event, EventOrganizer, EventRegistration, EventCategory } from "../types";

interface EventManagerDashboardProps {
  organizerId: string;
  eventOrganizers: EventOrganizer[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  onClose: () => void;
  onAddEvent: (newEvent: Event) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEventOrganizer: (organizer: EventOrganizer) => void;
  onUpdateEventRegistrationStatus?: (regId: string, status: 'Confirmed' | 'Cancelled' | 'ApprovedByOrganizer' | 'ApprovedBySuperAdmin' | 'DeclinedByOrganizer' | 'DeclinedBySuperAdmin') => void;
}

export default function EventManagerDashboard({
  organizerId,
  eventOrganizers,
  events,
  eventRegistrations,
  onClose,
  onAddEvent,
  onDeleteEvent,
  onUpdateEventOrganizer,
  onUpdateEventRegistrationStatus
}: EventManagerDashboardProps) {
  const organizer = eventOrganizers.find((o) => o.id === organizerId);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "publish" | "registrations" | "events_list" | "payout_settings">("overview");

  // Form states for creating event
  const [evtTitle, setEvtTitle] = useState("");
  const [evtDescription, setEvtDescription] = useState("");
  const [evtVenueName, setEvtVenueName] = useState("");
  const [evtVenueAddress, setEvtVenueAddress] = useState("");
  const [evtCity, setEvtCity] = useState("Mumbai");
  const [evtDate, setEvtDate] = useState("2026-07-25");
  const [evtTime, setEvtTime] = useState("06:00 PM");
  const [evtImage, setEvtImage] = useState("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80");
  const [evtCategories, setEvtCategories] = useState<EventCategory[]>([
    { name: "General Admission", price: 499, availableSeats: 250 },
    { name: "VIP Experience", price: 1499, availableSeats: 50 }
  ]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatPrice, setNewCatPrice] = useState("499");
  const [newCatSeats, setNewCatSeats] = useState("100");
  const [evtFeatured, setEvtFeatured] = useState(false);
  const [evtIsPaid, setEvtIsPaid] = useState<boolean>(true);
  const [evtSuccess, setEvtSuccess] = useState(false);

  // Search registrations state
  const [regSearch, setRegSearch] = useState("");

  // Editing Bank details state
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankRouting, setBankRouting] = useState("");
  const [commissionSplit, setCommissionSplit] = useState("");

  useEffect(() => {
    if (organizer) {
      setBankRouting(organizer.bankRouting);
      setCommissionSplit(String(organizer.commissionPercent));
    }
  }, [organizer]);

  if (!organizer) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-red-500">Organizer Workspace Not Found</h2>
          <p className="text-text-secondary text-sm">
            The independent event organizer profile with ID #{organizerId} does not exist in the active platform registry.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase tracking-wider rounded transition-colors cursor-pointer border-0"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Filter events and registrations for this organizer
  const organizerEvents = events.filter((e) => e.organizerId === organizer.id);
  const organizerEventIds = new Set(organizerEvents.map((e) => e.id));
  const organizerRegs = eventRegistrations.filter((r) => organizerEventIds.has(r.eventId));

  // Metrics
  const grossRevenue = organizerRegs.reduce((sum, r) => sum + r.totalPrice, 0);
  const commissionPercent = organizer.commissionPercent;
  const platformFee = grossRevenue * (commissionPercent / 100);
  const netOrganizerEarnings = grossRevenue - platformFee;
  const totalTicketsSold = organizerRegs.reduce((sum, r) => sum + r.quantity, 0);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?organizerId=${organizer.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddCategoryRow = () => {
    if (!newCatName.trim()) return;
    setEvtCategories([
      ...evtCategories,
      {
        name: newCatName.trim(),
        price: evtIsPaid ? (Number(newCatPrice) || 0) : 0,
        availableSeats: Number(newCatSeats) || 100
      }
    ]);
    setNewCatName("");
    setNewCatPrice("499");
    setNewCatSeats("100");
  };

  const handleRemoveCategoryRow = (index: number) => {
    setEvtCategories(evtCategories.filter((_, i) => i !== index));
  };

  const handlePublishEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim() || !evtVenueName.trim() || !evtVenueAddress.trim()) {
      alert("Please fill in event title, venue name, and address.");
      return;
    }

    const newEventId = "EVT-" + Math.floor(1000 + Math.random() * 9000);
    const newEvent: Event = {
      id: newEventId,
      title: evtTitle.trim(),
      description: evtDescription.trim(),
      venueName: evtVenueName.trim(),
      venueAddress: evtVenueAddress.trim(),
      city: evtCity,
      date: evtDate,
      time: evtTime,
      image: evtImage,
      categories: evtCategories.map(cat => ({
        ...cat,
        price: evtIsPaid ? cat.price : 0
      })),
      reviews: [],
      featured: evtFeatured,
      organizerId: organizer.id,
      isPaid: evtIsPaid
    };

    onAddEvent(newEvent);
    setEvtSuccess(true);
    setTimeout(() => {
      setEvtSuccess(false);
      setActiveTab("events_list");
    }, 2000);

    // Reset Form
    setEvtTitle("");
    setEvtDescription("");
    setEvtVenueName("");
    setEvtVenueAddress("");
    setEvtFeatured(false);
    setEvtIsPaid(true);
    setEvtCategories([
      { name: "General Admission", price: 499, availableSeats: 250 },
      { name: "VIP Experience", price: 1499, availableSeats: 50 }
    ]);
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEventOrganizer({
      ...organizer,
      bankRouting: bankRouting || organizer.bankRouting,
      commissionPercent: commissionSplit === "" ? organizer.commissionPercent : Number(commissionSplit)
    });
    setIsEditingBank(false);
    alert("Financial settings and split commissions updated successfully!");
  };

  // Filter registrations by search term
  const filteredRegs = organizerRegs.filter((reg) => {
    const q = regSearch.toLowerCase();
    return (
      reg.userName.toLowerCase().includes(q) ||
      reg.userEmail.toLowerCase().includes(q) ||
      reg.eventTitle.toLowerCase().includes(q) ||
      reg.id.toLowerCase().includes(q)
    );
  });

  return (
    <div id="event-manager-dashboard-overlay" className="fixed inset-0 z-50 bg-[#0A0A0B] overflow-y-auto text-left flex flex-col">
      {/* TOP HEADER STATUS BAR */}
      <div className="bg-[#121214] border-b border-white/5 py-4 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors cursor-pointer border-0"
            title="Exit Organizer Portal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-gold/10 text-gold border border-gold/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">
                Independent Organizer Workspace
              </span>
              <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
              <span className="text-[10px] text-gold font-mono">LIVE EVENTS CONSOLE</span>
            </div>
            <h1 className="font-display text-lg md:text-xl text-text-primary tracking-wide mt-1">
              {organizer.name} Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCopyLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-gold text-black hover:bg-gold-light text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-sans border-0 shadow-lg shadow-gold/10"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Copied Workspace URL</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* SIDE NAV BAR */}
        <aside className="w-full lg:w-64 bg-[#0F0F11] border-r border-white/5 p-6 space-y-6 shrink-0">
          <div className="flex items-center gap-4 border-b border-white/5 pb-5">
            <img 
              src={organizer.avatar || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"} 
              alt={organizer.name} 
              className="w-12 h-12 rounded-full object-cover border border-white/10"
            />
            <div>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Assigned Organizer</p>
              <h3 className="text-text-primary font-bold text-sm truncate w-36">{organizer.name}</h3>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-all ${
                activeTab === "overview" 
                  ? "bg-gold/10 text-gold border-l-2 border-gold font-bold" 
                  : "bg-transparent text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Workspace Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("publish")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-all ${
                activeTab === "publish" 
                  ? "bg-gold/10 text-gold border-l-2 border-gold font-bold" 
                  : "bg-transparent text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Experience</span>
            </button>

            <button
              onClick={() => setActiveTab("events_list")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-all ${
                activeTab === "events_list" 
                  ? "bg-gold/10 text-gold border-l-2 border-gold font-bold" 
                  : "bg-transparent text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarRange className="w-4 h-4" />
                <span>Active Experiences</span>
              </div>
              <span className="text-[10px] bg-white/5 border border-white/10 text-text-secondary px-2 py-0.5 rounded-full font-mono">
                {organizerEvents.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("registrations")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-all ${
                activeTab === "registrations" 
                  ? "bg-gold/10 text-gold border-l-2 border-gold font-bold" 
                  : "bg-transparent text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4" />
                <span>Ticket Registrations</span>
              </div>
              <span className="text-[10px] bg-white/5 border border-white/10 text-text-secondary px-2 py-0.5 rounded-full font-mono">
                {organizerRegs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("payout_settings")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-all ${
                activeTab === "payout_settings" 
                  ? "bg-gold/10 text-gold border-l-2 border-gold font-bold" 
                  : "bg-transparent text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Payout Configuration</span>
            </button>
          </nav>

          {/* Quick Ledger summary */}
          <div className="border-t border-white/5 pt-5 space-y-4 text-xs">
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Commissions Contract</p>
              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Platform Share:</span>
                  <span className="font-bold text-gold">{organizer.commissionPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Your Split:</span>
                  <span className="font-bold text-emerald-400">{100 - organizer.commissionPercent}%</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">Secure Routing IFSC</p>
              <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-center justify-between font-mono text-[10px] text-text-secondary">
                <span>{organizer.bankRouting}</span>
                <span className="text-[8px] bg-emerald-400/15 border border-emerald-400/25 text-emerald-400 px-1.5 py-0.5 rounded font-sans uppercase">ACTIVE</span>
              </div>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="flex-1 p-6 md:p-10 space-y-10 overflow-x-hidden">
          {/* ======================= OVERVIEW TAB ======================= */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary tracking-wide font-display">Workspace Dashboard Overview</h2>
                <p className="text-xs text-text-secondary mt-1">Analyze live performance indicators, ticket pass revenue splits, and guest registrations.</p>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Gross Event Sales</span>
                    <DollarSign className="w-4 h-4 text-gold" />
                  </div>
                  <p className="text-2xl font-bold text-text-primary font-display">₹{grossRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">Total live registration tickets</p>
                </div>

                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Platform Split Share</span>
                    <Percent className="w-4 h-4 text-gold" />
                  </div>
                  <p className="text-2xl font-bold text-gold font-display">₹{platformFee.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">Based on {commissionPercent}% split rate</p>
                </div>

                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Net Partner Earnings</span>
                    <Landmark className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400 font-display">₹{netOrganizerEarnings.toLocaleString()}</p>
                  <p className="text-[10px] text-text-muted">Withdrawn straight to IFSC {organizer.bankRouting}</p>
                </div>

                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-text-secondary">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ticket Passes Claimed</span>
                    <Ticket className="w-4 h-4 text-gold" />
                  </div>
                  <p className="text-2xl font-bold text-text-primary font-display">{totalTicketsSold}</p>
                  <p className="text-[10px] text-text-muted">Across {organizerEvents.length} live experiences</p>
                </div>
              </div>

              {/* SPLIT BENTO LAYOUT */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Experiences List */}
                <div className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-gold" /> Live Experiences Overview
                    </h3>
                    <button 
                      onClick={() => setActiveTab("publish")}
                      className="text-xs text-gold hover:underline bg-transparent border-0 cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3 h-3" /> New Experience
                    </button>
                  </div>

                  {organizerEvents.length === 0 ? (
                    <div className="py-12 text-center text-text-muted space-y-3">
                      <Sparkles className="w-8 h-8 text-white/10 mx-auto" />
                      <p className="text-xs">No experiences published yet under this workspace.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-text-secondary border-b border-white/5 uppercase text-[9px] font-bold tracking-wider">
                            <th className="pb-3">Experience Image & Title</th>
                            <th className="pb-3">City & Venue</th>
                            <th className="pb-3">Date & Time</th>
                            <th className="pb-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {organizerEvents.slice(0, 5).map((evt) => (
                            <tr key={evt.id} className="hover:bg-white/[0.01]">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img src={evt.image} alt={evt.title} className="w-10 h-10 object-cover rounded border border-white/10" />
                                  <div>
                                    <p className="font-bold text-text-primary leading-tight">{evt.title}</p>
                                    <span className="text-[9px] text-text-muted bg-white/5 border border-white/10 px-1.5 py-0.5 rounded mt-1 inline-block uppercase font-mono">{evt.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <p className="text-text-primary">{evt.venueName}</p>
                                <span className="text-[10px] text-text-secondary">📍 {evt.city}</span>
                              </td>
                              <td className="py-3 text-text-secondary font-mono">
                                <p>{evt.date}</p>
                                <p className="text-[10px] text-text-muted">{evt.time}</p>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to unpublish the experience "${evt.title}"?`)) {
                                      onDeleteEvent(evt.id);
                                    }
                                  }}
                                  className="p-1.5 rounded hover:bg-red-500/10 text-text-secondary hover:text-red-400 cursor-pointer border-0"
                                  title="Unpublish Experience"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Financial overview / bank info */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-5">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                    <Landmark className="w-4 h-4 text-gold" /> Settled Split Accounts
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-black/30 border border-white/5 p-4 rounded-lg space-y-3">
                      <div>
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Withdrawing Routing IFSC</span>
                        <p className="font-mono text-sm text-text-primary mt-1 font-semibold">{organizer.bankRouting}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Account Status</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[10px] text-emerald-400 font-bold uppercase">Direct-to-Bank Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gold/5 border border-gold/10 p-4 rounded-lg space-y-2">
                      <h4 className="text-[10px] font-bold text-gold uppercase tracking-wider">Live Split Calculation</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        Ticket pass booking deposits are processed via split routers. The {100 - commissionPercent}% net value is instantly routed to your IFSC profile routing gate.
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("payout_settings")}
                      className="w-full py-2 bg-white/5 hover:bg-white/10 text-gold hover:text-gold-light text-xs font-bold uppercase tracking-wider rounded border border-white/10 cursor-pointer transition-colors"
                    >
                      Configure Financials
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= PUBLISH EXPERIENCE TAB ======================= */}
          {activeTab === "publish" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary tracking-wide font-display">Publish New Experience Pass</h2>
                <p className="text-xs text-text-secondary mt-1">Onboard high-contrast visual event banners, define pricing classes, and publish live seat inventories.</p>
              </div>

              {evtSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm font-semibold flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-gold animate-bounce" />
                  <span>Experience published successfully! Redirecting to Active Experiences...</span>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* FORM COLUMN */}
                <form onSubmit={handlePublishEventSubmit} className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Experience Title</label>
                      <input 
                        type="text"
                        value={evtTitle}
                        onChange={(e) => setEvtTitle(e.target.value)}
                        placeholder="e.g. Royal Standup Night with Rohan"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Experience Banner URL</label>
                      <input 
                        type="text"
                        value={evtImage}
                        onChange={(e) => setEvtImage(e.target.value)}
                        placeholder="Banner image HTTPS URL..."
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Description of Event Experience</label>
                    <textarea 
                      value={evtDescription}
                      onChange={(e) => setEvtDescription(e.target.value)}
                      placeholder="An exclusive cinematic show, live concert, or private comedy play experience..."
                      className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold h-20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Sub-Location Venue Name</label>
                      <input 
                        type="text"
                        value={evtVenueName}
                        onChange={(e) => setEvtVenueName(e.target.value)}
                        placeholder="e.g. CineVenue VIP Lounge, Forum Mall"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Full Sub-Location Address</label>
                      <input 
                        type="text"
                        value={evtVenueAddress}
                        onChange={(e) => setEvtVenueAddress(e.target.value)}
                        placeholder="e.g. 3rd Floor, Bannerghatta Road"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">City</label>
                      <select 
                        value={evtCity}
                        onChange={(e) => setEvtCity(e.target.value)}
                        className="w-full bg-[#121215] border border-white/10 rounded-md p-2.5 text-xs text-text-primary focus:outline-none cursor-pointer"
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kochi">Kochi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Launch Date</label>
                      <input 
                        type="date"
                        value={evtDate}
                        onChange={(e) => setEvtDate(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Opening Time</label>
                      <input 
                        type="text"
                        value={evtTime}
                        onChange={(e) => setEvtTime(e.target.value)}
                        placeholder="e.g. 06:00 PM"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Spotlight Flag</label>
                      <div className="flex items-center gap-3 h-10">
                        <button
                          type="button"
                          onClick={() => setEvtFeatured(!evtFeatured)}
                          className={`flex items-center gap-2 text-xs font-bold py-1.5 px-3 rounded-lg border cursor-pointer transition-all ${
                            evtFeatured ? "bg-gold/15 border-gold text-gold" : "border-white/10 text-text-secondary"
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Featured Live Experience</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EVENT ENTRY TYPE SELECTOR */}
                  <div className="space-y-1.5 text-left bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                    <label className="text-[10px] font-bold text-gold uppercase tracking-wider block">Event Entry Type</label>
                    <div className="flex gap-6 mt-1">
                      <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                        <input
                          type="radio"
                          name="org-event-type"
                          checked={evtIsPaid}
                          onChange={() => {
                            setEvtIsPaid(true);
                            setEvtCategories([
                              { name: "General Admission", price: 499, availableSeats: 250 },
                              { name: "VIP Experience", price: 1499, availableSeats: 50 }
                            ]);
                          }}
                          className="text-gold focus:ring-gold accent-gold"
                        />
                        <span>Paid Event</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                        <input
                          type="radio"
                          name="org-event-type"
                          checked={!evtIsPaid}
                          onChange={() => {
                            setEvtIsPaid(false);
                            setEvtCategories([
                              { name: "Free General Entry Pass", price: 0, availableSeats: 250 }
                            ]);
                          }}
                          className="text-gold focus:ring-gold accent-gold"
                        />
                        <span className="text-emerald-400 font-semibold">Free Event</span>
                      </label>
                    </div>
                  </div>

                  {/* PRICING CLASSES GRID */}
                  <div className="border-t border-white/5 pt-6 space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Ticket Class Configurations</label>
                      <span className="text-[10px] text-text-muted font-mono">{evtCategories.length} Classes Added</span>
                    </div>

                    {/* Table of existing categories */}
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-text-secondary border-b border-white/5 font-semibold uppercase text-[9px] tracking-wider">
                            <th className="pb-2">Class Classification</th>
                            <th className="pb-2">Price Per Ticket (₹)</th>
                            <th className="pb-2">Maximum Capacity</th>
                            <th className="pb-2 text-right">Delete</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {evtCategories.map((cat, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.01]">
                              <td className="py-2.5 font-bold text-text-primary">{cat.name}</td>
                              <td className="py-2.5 font-mono text-gold font-bold">
                                {evtIsPaid ? `₹${cat.price}` : "FREE"}
                              </td>
                              <td className="py-2.5 font-mono">{cat.availableSeats} Seats</td>
                              <td className="py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCategoryRow(idx)}
                                  className="text-red-400 hover:text-red-300 p-1 bg-transparent border-0 cursor-pointer"
                                  disabled={evtCategories.length <= 1}
                                  title="Remove Class"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Form to add a new category row */}
                    <div className={`grid grid-cols-1 ${evtIsPaid ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl items-end`}>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-text-secondary uppercase">Class Name</label>
                        <input 
                          type="text"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. VIP Front Sofa"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none"
                        />
                      </div>

                      {evtIsPaid && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-text-secondary uppercase">Price (₹)</label>
                          <input 
                            type="number"
                            value={newCatPrice}
                            onChange={(e) => setNewCatPrice(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none font-mono"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5 flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-[9px] font-bold text-text-secondary uppercase">Available Inventory</label>
                          <input 
                            type="number"
                            value={newCatSeats}
                            onChange={(e) => setNewCatSeats(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCategoryRow}
                          className="py-1.5 px-3 bg-gold text-black rounded text-[11px] font-bold uppercase cursor-pointer border-0 h-9 shrink-0 flex items-center justify-center"
                        >
                          + Class
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5"
                  >
                    Publish Experience & Active Seats
                  </button>
                </form>

                {/* PREVIEW COLUMN */}
                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold block border-b border-white/5 pb-2">
                      👁️ Experience Card Preview
                    </span>

                    <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm mx-auto text-left flex flex-col shadow-xl transition-all">
                      <div className="h-44 relative bg-[#1A1A1E]">
                        <img src={evtImage} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 left-2.5 bg-black/80 border border-white/10 text-text-secondary text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">
                          📍 {evtCity}
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-display text-lg font-bold text-text-primary tracking-wide mb-1">
                            {evtTitle || "Your Experience Title..."}
                          </h3>
                          <p className="text-[11px] text-text-secondary leading-normal mb-3 line-clamp-2">
                            {evtDescription || "Experience description details appear here..."}
                          </p>

                          <div className="text-[11px] text-text-secondary space-y-1">
                            <p className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span className="truncate">{evtVenueName || "Venue Name..."}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                              <span>{evtDate} · {evtTime}</span>
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {evtCategories.map((c, i) => (
                              <span key={i} className="text-[8px] font-bold text-text-muted border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {c.name} · ₹{c.price}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                          <div>
                            <div className="font-display text-xs font-bold text-text-secondary">Hosted by</div>
                            <div className="text-[10px] text-gold font-bold uppercase tracking-wider">{organizer.name}</div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================= ACTIVE EXPERIENCES TAB ======================= */}
          {activeTab === "events_list" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary tracking-wide font-display">Active Experience Passes Catalog</h2>
                <p className="text-xs text-text-secondary mt-1">Manage active tickets, edit live listings, or unpublish expired inventories.</p>
              </div>

              {organizerEvents.length === 0 ? (
                <div className="bg-[#0F0F11] border border-white/5 p-12 text-center rounded-xl text-text-muted space-y-4">
                  <CalendarRange className="w-12 h-12 text-white/5 mx-auto" />
                  <div>
                    <h3 className="font-bold text-text-primary uppercase text-sm tracking-wide">No Live Experiences</h3>
                    <p className="text-xs mt-1">You haven't published any experiences yet under this workspace.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("publish")}
                    className="px-5 py-2 bg-gold text-black hover:bg-gold-light text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0"
                  >
                    Publish First Experience
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {organizerEvents.map((evt) => {
                    const ticketCount = organizerRegs.filter((r) => r.eventId === evt.id).reduce((sum, r) => sum + r.quantity, 0);
                    const eventSales = organizerRegs.filter((r) => r.eventId === evt.id).reduce((sum, r) => sum + r.totalPrice, 0);
                    return (
                      <div key={evt.id} className="bg-[#0F0F11] border border-white/5 rounded-xl overflow-hidden text-left flex flex-col justify-between hover:border-gold/20 transition-all">
                        <div className="h-32 relative">
                          <img src={evt.image} alt="" className="w-full h-full object-cover" />
                          <div className="absolute top-2.5 left-2.5 bg-black/80 border border-white/10 text-text-secondary text-[10px] px-2 py-0.5 rounded-full">
                            📍 {evt.city}
                          </div>
                        </div>

                        <div className="p-5 flex-1 space-y-4 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h3 className="font-display font-bold text-text-primary tracking-wide text-sm">{evt.title}</h3>
                            <p className="text-[10px] text-text-muted">{evt.venueName}</p>
                            <p className="text-[10px] text-text-secondary font-mono">{evt.date} · {evt.time}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 bg-black/40 border border-white/5 p-3 rounded-lg text-xs">
                            <div>
                              <p className="text-text-muted uppercase text-[8px] font-bold tracking-wider">Tickets Booked</p>
                              <p className="font-bold font-mono text-text-primary">{ticketCount}</p>
                            </div>
                            <div>
                              <p className="text-text-muted uppercase text-[8px] font-bold tracking-wider">Experience Sales</p>
                              <p className="font-bold font-mono text-gold">₹{eventSales.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ID: <span className="text-gold font-mono">{evt.id}</span></span>
                              {evt.isPaid === false ? (
                                <span className="text-[8px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Free</span>
                              ) : (
                                <span className="text-[8px] font-bold bg-gold/10 border border-gold/20 text-gold px-1.5 py-0.5 rounded uppercase tracking-wider">Paid</span>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to unpublish "${evt.title}"? This will stop ticket booking.`)) {
                                  onDeleteEvent(evt.id);
                                }
                              }}
                              className="px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black font-semibold text-[10px] uppercase cursor-pointer border border-red-500/20 flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Unpublish</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================= REGISTRATIONS LEDGER TAB ======================= */}
          {activeTab === "registrations" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary tracking-wide font-display">User Event Registrations Ledger</h2>
                <p className="text-xs text-text-secondary mt-1">Audit guest passes, process entries, and track settlement splits in real-time.</p>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0F0F11] border border-white/5 p-4 rounded-xl">
                <input 
                  type="text"
                  placeholder="Search ledger by guest name, email, event title, or Booking ID..."
                  value={regSearch}
                  onChange={(e) => setRegSearch(e.target.value)}
                  className="w-full md:w-96 bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                />
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Ledger entries: {filteredRegs.length} total</span>
              </div>

              {filteredRegs.length === 0 ? (
                <div className="bg-[#0F0F11] border border-white/5 p-12 text-center rounded-xl text-text-muted">
                  <Ticket className="w-10 h-10 text-white/5 mx-auto mb-3" />
                  <p className="text-xs">No registration ledger entries found matching your criteria.</p>
                </div>
              ) : (
                <div className="bg-[#0F0F11] border border-white/5 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider bg-white/[0.01]">
                          <th className="p-4">Receipt ID</th>
                          <th className="p-4">Guest Experience</th>
                          <th className="p-4">Guest Profile</th>
                          <th className="p-4">Ticket Class</th>
                          <th className="p-4">Qty</th>
                          <th className="p-4">Total Price</th>
                          <th className="p-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredRegs.map((reg) => (
                          <tr key={reg.id} className="hover:bg-white/[0.01]">
                            <td className="p-4 font-mono font-bold text-gold">{reg.id}</td>
                            <td className="p-4">
                              <p className="font-bold text-text-primary">{reg.eventTitle}</p>
                              <span className="text-[9px] text-text-muted">📍 {reg.venueName}</span>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-text-primary">{reg.userName}</p>
                              <span className="text-[10px] text-text-secondary font-mono">{reg.userEmail}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 font-bold uppercase text-[9px] text-text-secondary">
                                {reg.categoryName}
                              </span>
                            </td>
                            <td className="p-4 font-mono">{reg.quantity}</td>
                            <td className="p-4 font-mono font-bold text-gold">₹{reg.totalPrice.toLocaleString()}</td>
                            <td className="p-4 text-right space-y-1.5">
                              {/* Overall Status Badge */}
                              <div>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider ${
                                  reg.status === 'Cancelled'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : reg.status === 'Pending'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {reg.status || 'Confirmed'}
                                </span>
                              </div>

                              {/* Paid Event Dual-Approval Tracker */}
                              {reg.ticketPrice > 0 && (
                                <div className="space-y-0.5 mt-1.5 text-right flex flex-col items-end">
                                  <div className="flex gap-2 text-[9px]">
                                    <span className="text-text-muted font-semibold">Organizer Approval:</span>
                                    {reg.organizerApproved ? (
                                      <span className="text-emerald-400 font-bold">✓ Approved</span>
                                    ) : reg.status === 'Cancelled' ? (
                                      <span className="text-red-400 font-bold">✗ N/A</span>
                                    ) : (
                                      <span className="text-amber-400 font-bold">⏳ Pending</span>
                                    )}
                                  </div>
                                  <div className="flex gap-2 text-[9px]">
                                    <span className="text-text-muted font-semibold">Superadmin Approval:</span>
                                    {reg.superadminApproved ? (
                                      <span className="text-emerald-400 font-bold">✓ Approved</span>
                                    ) : reg.status === 'Cancelled' ? (
                                      <span className="text-red-400 font-bold">✗ N/A</span>
                                    ) : (
                                      <span className="text-amber-400 font-bold">⏳ Pending</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons for Organizer */}
                              {reg.status === 'Pending' && reg.ticketPrice > 0 && !reg.organizerApproved && onUpdateEventRegistrationStatus && (
                                <div className="flex gap-1 justify-end mt-2">
                                  <button
                                    onClick={() => onUpdateEventRegistrationStatus(reg.id, 'ApprovedByOrganizer')}
                                    className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-white hover:text-black rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-500/20 cursor-pointer transition-colors"
                                    title="Approve registration request as Organizer"
                                  >
                                    ✓ Approve
                                  </button>
                                  <button
                                    onClick={() => onUpdateEventRegistrationStatus(reg.id, 'DeclinedByOrganizer')}
                                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500 text-white hover:text-black rounded text-[9px] font-bold uppercase tracking-wider border border-red-500/20 cursor-pointer transition-colors"
                                    title="Decline/Cancel request as Organizer"
                                  >
                                    ✗ Decline
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= PAYOUT CONFIGURATION TAB ======================= */}
          {activeTab === "payout_settings" && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary tracking-wide font-display">Payout Configuration & Split Settings</h2>
                <p className="text-xs text-text-secondary mt-1">Configure direct-to-bank routing details, IFSC routing, and commissions splits.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Bank updates form */}
                <div className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-6">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-white/5 pb-3">Update Bank Account Specs</h3>

                  <form onSubmit={handleSaveBankDetails} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Direct Routing IFSC Key</label>
                      <input 
                        type="text"
                        value={bankRouting}
                        onChange={(e) => setBankRouting(e.target.value)}
                        placeholder="IFSC800999"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2.5 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Contractual Commission Share ({commissionSplit}%)</label>
                        <span className="text-gold font-mono font-bold">Organizer Share: {100 - (Number(commissionSplit) || 15)}%</span>
                      </div>
                      <input 
                        type="range"
                        min="5"
                        max="80"
                        value={commissionSplit}
                        onChange={(e) => setCommissionSplit(e.target.value)}
                        className="w-full accent-gold bg-white/10 h-2 rounded cursor-pointer mt-2"
                        disabled
                      />
                      <p className="text-[9px] text-text-muted mt-1">Note: Contract split percentage is locked by the Super Admin to guarantee platform split integrity.</p>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5"
                    >
                      Save Financial Configuration
                    </button>
                  </form>
                </div>

                {/* Splitting explanation card */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sparkles className="w-4 h-4 text-gold animate-pulse" /> Financial Gate Specs
                  </h3>

                  <div className="text-xs text-text-secondary space-y-4 leading-relaxed">
                    <p>
                      Each experience registration is processed on a centralized payments engine. 
                    </p>
                    <p>
                      Your verified splits of **{100 - commissionPercent}%** is automatically pushed straight to IFSC: **{organizer.bankRouting}** on periodic payouts.
                    </p>
                    <div className="border border-white/5 bg-black/30 p-3 rounded-lg text-center space-y-1 font-mono text-[10px]">
                      <p className="text-text-muted uppercase">Verified Bank IFSC Gate</p>
                      <p className="text-gold font-bold text-sm">{organizer.bankRouting}</p>
                      <p className="text-emerald-400 font-bold uppercase text-[8px] tracking-wide mt-1">● VERIFIED ONLINE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
