import React, { useState } from "react";
import { 
  Calendar, MapPin, Users, Ticket, CheckCircle2, MessageSquare, Plus, 
  Search, Filter, X, Eye, FileText, Music, DollarSign, Tag, Clock, Send,
  ShieldCheck, Star, Award, Building, Sparkles, MessageCircle, ArrowLeft,
  ChevronLeft, SlidersHorizontal, Maximize2, Minimize2
} from "lucide-react";

import { 
  EventManagementRequest, 
  PublicEvent, 
  ArtistRequest, 
  SponsorshipRequest, 
  EventPortfolioItem,
  VenueRecord,
  ArtistRecord
} from "../../types/productions";

import { 
  INITIAL_VENUES, 
  INITIAL_ARTISTS 
} from "../../data/productionsData";
import { postEventMessage } from "../../services/eventService";
import EventServicePricingManager from "../events/EventServicePricingManager";

interface EventManagementAdminPanelProps {
  eventRequests: EventManagementRequest[];
  onUpdateEventRequests: (requests: EventManagementRequest[]) => void;
  publicEvents: PublicEvent[];
  onUpdatePublicEvents: (events: PublicEvent[]) => void;
  artistRequests: ArtistRequest[];
  onUpdateArtistRequests: (requests: ArtistRequest[]) => void;
  sponsorshipRequests: SponsorshipRequest[];
  onUpdateSponsorshipRequests: (requests: SponsorshipRequest[]) => void;
  portfolioItems: EventPortfolioItem[];
  onUpdatePortfolioItems: (items: EventPortfolioItem[]) => void;
  onBookTickets?: (movieTitle: string) => void;
}

export default function EventManagementAdminPanel({
  eventRequests,
  onUpdateEventRequests,
  publicEvents,
  onUpdatePublicEvents,
  artistRequests,
  onUpdateArtistRequests,
  sponsorshipRequests,
  onUpdateSponsorshipRequests,
  portfolioItems,
  onUpdatePortfolioItems,
  onBookTickets
}: EventManagementAdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "enquiries" | "pricing" | "public_events" | "artists" | "sponsorships" | "venues" | "portfolio"
  >("enquiries");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Venues & Artists
  const [venues] = useState<VenueRecord[]>(INITIAL_VENUES);
  const [artistRoster] = useState<ArtistRecord[]>(INITIAL_ARTISTS);

  // Active Selected Detail Modal State
  const [selectedRequest, setSelectedRequest] = useState<EventManagementRequest | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [requestedInfoInput, setRequestedInfoInput] = useState("");
  const [isRequestingInfoOpen, setIsRequestingInfoOpen] = useState(false);
  const [producerChatInput, setProducerChatInput] = useState("");

  const handleSendProducerReply = async (requestId: string) => {
    if (!producerChatInput.trim()) return;
    const text = producerChatInput.trim();
    setProducerChatInput("");

    await postEventMessage(requestId, {
      text,
      sender: "producer",
      senderName: "CineVenue Executive Producer"
    });

    // Update selectedRequest locally
    if (selectedRequest && (selectedRequest.id === requestId || (selectedRequest as any).requestId === requestId)) {
      setSelectedRequest({
        ...selectedRequest,
        messages: [
          ...(selectedRequest.messages || []),
          {
            id: `msg-${Date.now()}`,
            sender: "producer",
            senderName: "CineVenue Executive Producer",
            text,
            timestamp: new Date().toISOString()
          }
        ]
      });
    }
  };

  // New Public Event Modal
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    title: "",
    category: "Film Event" as PublicEvent["category"],
    eventDate: new Date().toISOString().split("T")[0],
    eventTime: "18:00 IST",
    venueName: "",
    city: "Hyderabad",
    description: "",
    posterImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80",
    status: "Upcoming" as PublicEvent["status"]
  });

  // Action Handlers
  const handleUpdateStatus = (id: string, newStatus: EventManagementRequest["status"]) => {
    const updated = eventRequests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus
        };
      }
      return r;
    });
    onUpdateEventRequests(updated);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const handleAddAdminNote = (id: string) => {
    if (!adminNoteInput.trim()) return;
    const updated = eventRequests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          adminNotes: r.adminNotes 
            ? `${r.adminNotes}\n[Note]: ${adminNoteInput}`
            : `[Note]: ${adminNoteInput}`
        };
      }
      return r;
    });
    onUpdateEventRequests(updated);
    setAdminNoteInput("");
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({
        ...selectedRequest,
        adminNotes: selectedRequest.adminNotes 
          ? `${selectedRequest.adminNotes}\n[Note]: ${adminNoteInput}`
          : `[Note]: ${adminNoteInput}`
      });
    }
  };

  const handleRequestMoreInfo = (id: string) => {
    if (!requestedInfoInput.trim()) return;
    const updated = eventRequests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          additionalInfoPrompt: requestedInfoInput,
          status: "Under Review" as const
        };
      }
      return r;
    });
    onUpdateEventRequests(updated);
    setRequestedInfoInput("");
    setIsRequestingInfoOpen(false);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ 
        ...selectedRequest, 
        additionalInfoPrompt: requestedInfoInput,
        status: "Under Review" 
      });
    }
  };

  const handleCreatePublicEvent = () => {
    if (!newEventForm.title || !newEventForm.venueName) {
      alert("Please fill in event title and venue name.");
      return;
    }
    const created: PublicEvent = {
      id: `EVT-00${publicEvents.length + 1}`,
      title: newEventForm.title,
      category: newEventForm.category || "Film Event",
      date: newEventForm.eventDate || new Date().toISOString().split("T")[0],
      time: newEventForm.eventTime || "18:00 IST",
      venue: newEventForm.venueName,
      city: newEventForm.city || "Hyderabad",
      posterUrl: newEventForm.posterImage,
      coverUrl: newEventForm.posterImage,
      description: newEventForm.description || "Official CineVenue Managed Mega Event.",
      artists: ["S.S. Thaman", "Shreya Ghoshal"],
      startingTicketPrice: 499,
      status: newEventForm.status || "Upcoming",
      isPublished: true,
      organizer: "CineVenue Events"
    };

    onUpdatePublicEvents([created, ...publicEvents]);
    setIsAddEventModalOpen(false);
    alert("🎉 Public CineVenue event published and tickets enabled!");
  };

  const filteredRequests = eventRequests.filter(r => {
    const matchesSearch = !searchQuery || 
      r.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-xs text-white">
      
      {/* Sub-Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11121A] border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
          {[
            { id: "enquiries", label: `Event Requests (${eventRequests.length})`, icon: Calendar },
            { id: "pricing", label: "Service & Equipment Rates", icon: SlidersHorizontal },
            { id: "public_events", label: `Public Events & Tickets (${publicEvents.length})`, icon: Ticket },
            { id: "artists", label: `Artist Bookings (${artistRequests.length})`, icon: Music },
            { id: "sponsorships", label: `Brand Sponsorships (${sponsorshipRequests.length})`, icon: Tag },
            { id: "venues", label: `Venues & Roster (${venues.length})`, icon: MapPin },
            { id: "portfolio", label: `Event Portfolio (${portfolioItems.length})`, icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                  isActive 
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-lg" 
                    : "bg-black/40 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-white/40"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeSubTab === "public_events" && (
          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Publish Event
          </button>
        )}
      </div>

      {/* SUB-TAB 1: EVENT ENQUIRIES */}
      {activeSubTab === "enquiries" && (
        <div className="space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14151E] p-3 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-black/60 border border-white/10 px-3 py-2 rounded-xl">
              <Search className="w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by event title, client name, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Proposal">Proposal</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map(r => (
              <div key={r.id} className="bg-[#11121A] border border-white/10 rounded-2xl p-5 space-y-4 relative hover:border-amber-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                      {r.id}
                    </span>
                    <h4 className="font-serif font-bold text-white text-base mt-1">{r.eventName}</h4>
                    <p className="text-white/60 text-xs">Organizer: <span className="text-gold font-bold">{r.fullName}</span> ({r.email})</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    r.status === "Confirmed" 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}>
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/50 p-3 rounded-xl border border-white/5 text-[11px]">
                  <div>
                    <span className="text-white/40 block">Type & City</span>
                    <span className="font-bold text-white">{r.eventType} ({r.city})</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Event Date</span>
                    <span className="font-bold text-amber-400">{r.preferredDate}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">Budget Range</span>
                    <span className="font-bold text-gold">{r.budgetRange}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-white/50">{r.expectedAudience} Audience Expected</span>
                  <button
                    onClick={() => setSelectedRequest(r)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-[11px] hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Manage Request
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB 2: PUBLIC EVENTS & TICKETING */}
      {activeSubTab === "public_events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publicEvents.map(evt => (
            <div key={evt.id} className="bg-[#11121A] border border-white/10 rounded-2xl p-4 space-y-3 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative h-44 rounded-xl overflow-hidden border border-white/10">
                  <img src={evt.posterUrl} alt={evt.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 border border-amber-500/50 text-amber-400">
                    {evt.status}
                  </span>
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-black/80 text-white">
                    {evt.category}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-white text-base">{evt.title}</h4>
                  <p className="text-white/60 text-xs line-clamp-2 mt-1">{evt.description}</p>
                </div>

                <div className="space-y-1 text-xs text-white/70 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{evt.venue}, {evt.city}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between mt-2">
                <span className="text-gold font-bold">Starts ₹{evt.startingTicketPrice || 499}</span>
                <button
                  onClick={() => {
                    if (onBookTickets) onBookTickets(evt.ticketMovieTitle || evt.title);
                    else alert(`Opening CineVenue Ticketing for ${evt.title}...`);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-wider hover:bg-emerald-400 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Ticket className="w-3 h-3" /> Book Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: ARTIST BOOKINGS */}
      {activeSubTab === "artists" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl overflow-hidden p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4 text-gold" /> Client Artist Booking Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artistRequests.map(art => (
              <div key={art.id} className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-amber-400 font-bold">{art.id}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    {art.status}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm">{art.artistCategory} for {art.eventName}</h4>
                <p className="text-white/60 text-xs">Client: {art.fullName} ({art.phone}) • Budget: <span className="text-gold font-bold">{art.budgetRange}</span></p>
                <p className="text-white/50 text-[11px]">Event Date: {art.eventDate} in {art.location}</p>
                <p className="text-white/70 text-xs italic bg-white/5 p-2 rounded">"{art.requirements}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SPONSORSHIPS */}
      {activeSubTab === "sponsorships" && (
        <div className="bg-[#11121A] border border-white/10 rounded-2xl overflow-hidden p-6 space-y-4">
          <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-gold" /> Event Brand Sponsorship Proposals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsorshipRequests.map(s => (
              <div key={s.id} className="bg-black/50 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{s.eventName}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {s.eventType}
                  </span>
                </div>
                <p className="text-white/60 text-xs">Organizer: {s.fullName} ({s.email}) • Audience: {s.expectedAudience}</p>
                <p className="text-white/60 text-xs">Requirement: <span className="text-gold font-bold">{s.sponsorshipRequirement} ({s.budgetRequirement})</span></p>
                <p className="text-white/70 text-xs bg-white/5 p-2 rounded">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: VENUES & ARTISTS ROSTER */}
      {activeSubTab === "venues" && (
        <div className="space-y-6">
          <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" /> CineVenue Partnered Event Venues
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venues.map(v => (
                <div key={v.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{v.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold">
                      {v.venueType}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs">{v.address}, {v.city}</p>
                  <div className="flex items-center justify-between text-xs text-white/50 pt-1 border-t border-white/5">
                    <span>Capacity: {v.capacity.toLocaleString()} Guests</span>
                    <span className="text-gold font-bold">Contact: {v.contactPerson}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#11121A] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" /> CineVenue Managed Artist Roster
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {artistRoster.map(a => (
                <div key={a.id} className="p-4 bg-black/50 border border-white/10 rounded-xl space-y-2 flex items-center gap-3">
                  <img src={a.photoUrl} alt={a.name} className="w-12 h-12 rounded-full object-cover border border-amber-500/40" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{a.name}</h4>
                    <p className="text-white/60 text-xs">{a.category}</p>
                    <span className="text-gold text-xs font-bold block">Fee: {a.startingFee}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
      {/* SUB-TAB: SERVICE & EQUIPMENT RATE CARDS (GENERATORS, PHOTO, VIDEO, SECURITY, ANCHORS, ETC.) */}
      {activeSubTab === "pricing" && (
        <div className="space-y-6">
          <EventServicePricingManager isAdmin={true} />
        </div>
      )}

      {/* SUB-TAB 6: EVENT PORTFOLIO */}
      {activeSubTab === "portfolio" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map(p => (
            <div key={p.id} className="bg-[#11121A] border border-white/10 rounded-2xl overflow-hidden space-y-3 p-5">
              <img src={p.coverImage} alt={p.title} className="w-full h-48 object-cover rounded-xl border border-white/10" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase">{p.category} • {p.year}</span>
                <h4 className="font-serif font-bold text-white text-base">{p.title}</h4>
                <p className="text-white/60 text-xs">{p.description}</p>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-white/10 pt-3">
                <span className="text-white/50">{p.location}</span>
                <span className="text-emerald-400 font-bold">{p.client || "CineVenue Managed"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL & MANAGEMENT MODAL FOR EVENT REQUEST */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-5xl bg-[#0D0E14] border border-amber-500/40 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] my-auto overflow-hidden">
            
            {/* Modal Header with Back and Close Buttons */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-[#12131C] shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-amber-500/20 text-white hover:text-amber-400 font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
                  title="Go Back to Requests List"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-xs">Back</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {selectedRequest.id}
                    </span>
                    <span className="text-xs text-white/50 hidden sm:inline">• {selectedRequest.eventType}</span>
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-serif font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
                    {selectedRequest.eventName}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Quick Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#141520] p-4 rounded-xl border border-white/10">
                <div>
                  <label className="block text-white/60 text-[11px] font-bold mb-1 uppercase">Update Event Status</label>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleUpdateStatus(selectedRequest.id, e.target.value as any)}
                    className="w-full bg-black/80 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-400 font-bold outline-none cursor-pointer"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Discussion">Discussion</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/60 text-[11px] font-bold mb-1 uppercase">Request Info Action</label>
                  <button
                    onClick={() => setIsRequestingInfoOpen(!isRequestingInfoOpen)}
                    className="w-full py-2 bg-purple-500/20 text-purple-400 border border-purple-500/40 font-bold rounded-xl hover:bg-purple-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" /> Request Additional Info From Client
                  </button>
                </div>
              </div>

              {isRequestingInfoOpen && (
                <div className="bg-purple-950/40 border border-purple-500/50 p-4 rounded-xl space-y-3 animate-fade-in">
                  <h4 className="font-bold text-purple-300 text-xs uppercase">Message to Client ({selectedRequest.fullName})</h4>
                  <textarea
                    rows={2}
                    value={requestedInfoInput}
                    onChange={(e) => setRequestedInfoInput(e.target.value)}
                    placeholder="Specify missing details e.g., Venue choice, Artist preference, Sound budget..."
                    className="w-full bg-black/80 border border-purple-500/40 rounded-xl p-3 text-white text-xs outline-none"
                  />
                  <button
                    onClick={() => handleRequestMoreInfo(selectedRequest.id)}
                    className="px-4 py-2 bg-purple-500 text-black font-extrabold rounded-xl cursor-pointer hover:opacity-90"
                  >
                    Send Information Request
                  </button>
                </div>
              )}

              {/* Event Overview Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-black/40 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-semibold">Client / Organizer</span>
                  <span className="font-bold text-white truncate block">{selectedRequest.fullName}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-semibold">Contact Info</span>
                  <span className="font-bold text-amber-400 truncate block">{selectedRequest.email}</span>
                  <span className="text-white/70 block text-[11px]">{selectedRequest.phone}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-semibold">Date & City</span>
                  <span className="font-bold text-white block">{selectedRequest.preferredDate}</span>
                  <span className="text-white/60 block">{selectedRequest.city}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-semibold">Audience Size</span>
                  <span className="font-bold text-cyan-400">{selectedRequest.expectedAudience}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-semibold">Budget Estimate</span>
                  <span className="font-bold text-gold">{selectedRequest.budgetRange}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase font-semibold">Services</span>
                  <span className="font-bold text-purple-400 line-clamp-2">{selectedRequest.servicesRequired?.join(", ") || "Full Production"}</span>
                </div>
              </div>

              {/* Client Messages & Direct Discussion Thread */}
              <div className="bg-[#0C0D14] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                      Live Client Communications Thread ({selectedRequest.messages?.length || 0} messages)
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Client: {selectedRequest.fullName} ({selectedRequest.email})
                  </span>
                </div>

                {/* Messages container */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(!selectedRequest.messages || selectedRequest.messages.length === 0) ? (
                    <div className="text-center py-6 bg-black/40 rounded-xl border border-white/5 text-gray-400 text-xs">
                      No client messages exchanged yet. Send a greeting or requirement clarification below.
                    </div>
                  ) : (
                    selectedRequest.messages.map((m, idx) => {
                      const isProducer = m.sender === "producer" || m.sender === "admin";
                      return (
                        <div key={m.id || idx} className={`flex flex-col ${isProducer ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400">
                            <span className="font-bold text-gray-200">{m.senderName}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              isProducer ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"
                            }`}>
                              {isProducer ? "Producer / Admin" : "Client"}
                            </span>
                            <span>•</span>
                            <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                            isProducer
                              ? "bg-gradient-to-r from-amber-500/20 to-[#D4AF37]/25 border border-[#D4AF37]/40 text-white rounded-tr-none"
                              : "bg-[#181A26] border border-white/10 text-gray-200 rounded-tl-none"
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Producer Reply Input Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    placeholder={`Reply directly to ${selectedRequest.fullName} in real-time...`}
                    value={producerChatInput}
                    onChange={(e) => setProducerChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendProducerReply(selectedRequest.id);
                    }}
                    className="flex-1 bg-black/80 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    onClick={() => handleSendProducerReply(selectedRequest.id)}
                    className="px-4 py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>

              {/* Internal Admin Note Box */}
              <div className="space-y-2 bg-[#12131C] p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-amber-400 uppercase text-xs">Internal Admin Notes (Confidential)</h4>
                <p className="text-white/60 text-xs italic bg-white/5 p-3 rounded-xl border border-white/5">
                  {selectedRequest.adminNotes || "No internal board notes recorded yet."}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal note..."
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    className="flex-1 bg-black/80 border border-white/10 rounded-xl px-3 py-2 text-white outline-none text-xs"
                  />
                  <button
                    onClick={() => handleAddAdminNote(selectedRequest.id)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl cursor-pointer transition-all shrink-0"
                  >
                    Save Note
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Bottom Footer */}
            <div className="bg-[#12131C] border-t border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Requests</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/50 hidden sm:inline">Status: {selectedRequest.status}</span>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold rounded-xl cursor-pointer transition-all"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* NEW PUBLIC EVENT MODAL */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0D0E14] border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-serif font-bold text-white">Publish New Public Event</h3>
              <button onClick={() => setIsAddEventModalOpen(false)} className="p-2 rounded-full bg-white/10 text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-bold">Event Title</label>
                <input
                  type="text"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  placeholder="e.g. RAMA: Pre-Release Mega Event"
                  className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 mb-1 font-bold">Category</label>
                  <select
                    value={newEventForm.category}
                    onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value as any })}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white font-bold outline-none cursor-pointer"
                  >
                    <option value="Film Event">Film Event</option>
                    <option value="Concert">Concert</option>
                    <option value="Stage Show">Stage Show</option>
                    <option value="Music Festival">Music Festival</option>
                    <option value="Award Function">Award Function</option>
                    <option value="College Fest">College Fest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 mb-1 font-bold">Event Date</label>
                  <input
                    type="date"
                    value={newEventForm.eventDate}
                    onChange={(e) => setNewEventForm({ ...newEventForm, eventDate: e.target.value })}
                    className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Venue & City</label>
                <input
                  type="text"
                  value={newEventForm.venueName}
                  onChange={(e) => setNewEventForm({ ...newEventForm, venueName: e.target.value })}
                  placeholder="e.g. Gachibowli Stadium, Hyderabad"
                  className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-bold">Description</label>
                <textarea
                  rows={3}
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  placeholder="Enter event highlights and chief guest details..."
                  className="w-full bg-black/80 border border-white/20 rounded-xl p-3 text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button onClick={() => setIsAddEventModalOpen(false)} className="px-4 py-2 bg-white/10 text-white rounded-xl cursor-pointer">
                Cancel
              </button>
              <button onClick={handleCreatePublicEvent} className="px-6 py-2 bg-amber-500 text-black font-extrabold rounded-xl cursor-pointer shadow-lg">
                Publish & Enable Tickets
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
