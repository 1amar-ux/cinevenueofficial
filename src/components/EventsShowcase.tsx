import React, { useState, useEffect } from "react";
import { 
  Calendar, MapPin, Clock, Ticket, Star, Plus, ChevronRight, Info, Sparkles, 
  Share2, Award, CheckCircle2, MessageSquare, PlusCircle, X, FileText, Printer, Shield, ArrowLeft,
  Download, Mail, Power, ToggleLeft, ToggleRight, Send, Activity, ArrowRight, Sparkle, UserCheck, Lock,
  QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Event, EventCategory, EventReview, EventRegistration, NotifyMeRequest } from "../types";
import MaintenancePage from "./MaintenancePage";
import { generateAndDownloadEventPassPdf, sendEventPassToEmail } from "../utils/eventPassPdf";
import type { EventItem, EventBookingRecord } from "../types/eventBooking";
import { getEvents as getTicketedEvents, getBookings as getEventBookings } from "../services/eventBookingService";
import EventBookingModal from "./events/EventBookingModal";
import DigitalTicketPassModal from "./events/DigitalTicketPassModal";
import OrganizerEventHub from "./events/OrganizerEventHub";
import CineVenueLiveBanner from "./advertising/CineVenueLiveBanner";

interface EventsShowcaseProps {
  events: Event[];
  userEmail: string | null;
  onOpenAuth: () => void;
  selectedCity: string;
  onBookEvent: (registration: EventRegistration) => void;
  onAddReview: (eventId: string, review: EventReview) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifyMeRequests?: NotifyMeRequest[];
  onAddNotifyMeRequest?: (eventId: string, eventTitle: string, email: string, name: string, mobile?: string) => void;
  isEventBookingSystemActive?: boolean;
  onToggleEventSystemActive?: (active: boolean) => void;
  onToggleEventBookingStatus?: (eventId: string) => void;
  userWallet?: any;
  onUpdateWallet?: (updatedWallet: any) => void;
}

export default function EventsShowcase({
  events = [],
  userEmail,
  onOpenAuth,
  selectedCity,
  onBookEvent,
  onAddReview,
  searchQuery,
  setSearchQuery,
  notifyMeRequests = [],
  onAddNotifyMeRequest,
  isEventBookingSystemActive = true,
  onToggleEventSystemActive,
  onToggleEventBookingStatus,
  userWallet,
  onUpdateWallet,
}: EventsShowcaseProps) {
  const safeEvents = Array.isArray(events)
    ? events.map((event) => ({
        ...event,
        categories: Array.isArray(event.categories) ? event.categories : [],
        reviews: Array.isArray(event.reviews) ? event.reviews : [],
      }))
    : [];
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"booking" | "reviews">("booking");
  
  // Booking Form State
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState(userEmail || "");
  const [bookingMobileNumber, setBookingMobileNumber] = useState("");

  // Review Form State
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState(userEmail || "");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Booking Pass State (shown after booking success)
  const [bookingPass, setBookingPass] = useState<EventRegistration | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Pre-notification & Sharing State
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const [notifyName, setNotifyName] = useState("");
  const [notifyEmail, setNotifyEmail] = useState(userEmail || "");
  const [notifyMobile, setNotifyMobile] = useState("");
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  // Ticketed Events & Unified Booking State
  const [ticketedEventsList, setTicketedEventsList] = useState<EventItem[]>(() => getTicketedEvents());
  const [bookingModalEvent, setBookingModalEvent] = useState<EventItem | null>(null);
  const [viewingPass, setViewingPass] = useState<EventBookingRecord | null>(null);
  const [showOrganizerHub, setShowOrganizerHub] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All Categories");

  const handleOpenBooking = (evt: Event) => {
    let matched = ticketedEventsList.find(e => e.id === evt.id || e.title.toLowerCase() === evt.title.toLowerCase());
    if (!matched) {
      matched = {
        id: evt.id,
        title: evt.title,
        slug: evt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: evt.description,
        category: (evt.categories?.[0]?.name?.includes('Concert') ? 'Concerts' : 'Film Events') as any,
        bannerUrl: evt.image,
        organizer: {
          id: 'ORG-MAIN',
          name: 'CineVenue Events',
          email: 'events@cinevenue.in',
          isVerified: true,
        },
        date: evt.date || '2026-10-25',
        startTime: evt.time || '07:00 PM',
        venueName: evt.venueName,
        venueAddress: evt.venueAddress,
        city: evt.city || selectedCity,
        seatingType: 'GeneralAdmission',
        ticketTypes: evt.categories && evt.categories.length > 0 ? evt.categories.map((c, idx) => ({
          id: `TKT-${evt.id}-${idx}`,
          eventId: evt.id,
          name: c.name,
          tier: (idx === 0 ? 'General' : idx === 1 ? 'Premium' : 'VIP') as any,
          description: `${c.name} admission pass.`,
          price: c.price,
          availableQuantity: c.availableSeats || 100,
          soldQuantity: 0,
          maxPerUser: 6,
          minPerUser: 1,
          status: 'Active',
          isRefundable: true,
        })) : [
          {
            id: `TKT-${evt.id}-GEN`,
            eventId: evt.id,
            name: 'General Admission',
            tier: 'General',
            description: 'Standard event pass.',
            price: 499,
            availableQuantity: 200,
            soldQuantity: 0,
            maxPerUser: 6,
            minPerUser: 1,
            status: 'Active',
            isRefundable: true,
          }
        ],
        totalCapacity: 500,
        soldCount: 120,
        status: 'Published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    setBookingModalEvent(matched);
  };

  // Curated Genres & Concierge State
  const [selectedGenreFilter, setSelectedGenreFilter] = useState("All Genres");
  const [conciergePrompt, setConciergePrompt] = useState("");
  const [conciergeLoading, setConciergeLoading] = useState(false);
  const [conciergeChat, setConciergeChat] = useState<{ role: "user" | "model"; text: string }[]>([
    {
      role: "model",
      text: "Welcome to CineVenue Vicinity Concierge! Ask me about upcoming VIP concerts, theater acoustic specs, or valet parking in Guntur, Vijayawada, and Hyderabad."
    }
  ]);

  const handleConciergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergePrompt.trim() || conciergeLoading) return;

    const userQuery = conciergePrompt.trim();
    setConciergePrompt("");
    setConciergeChat(prev => [...prev, { role: "user", text: userQuery }]);
    setConciergeLoading(true);

    try {
      const res = await fetch("/api/gemini/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userQuery, city: selectedCity })
      });
      if (res.ok) {
        const data = await res.json();
        setConciergeChat(prev => [...prev, { role: "model", text: data.response || data.text || `For ${selectedCity}, we recommend securing VIP passes early for acoustic excellence!` }]);
      } else {
        setConciergeChat(prev => [...prev, { role: "model", text: `I found top VIP experiences in ${selectedCity}: Sunburn Arena, Zakir Khan Comedy, and Arijit Singh Symphony Tour. Passes are selling fast!` }]);
      }
    } catch (err) {
      setConciergeChat(prev => [...prev, { role: "model", text: `For ${selectedCity}, we recommend reserving passes early at Prasads IMAX and Vijayawada Convention Hall for acoustic excellence.` }]);
    } finally {
      setConciergeLoading(false);
    }
  };

  // Deep Link Listener for Shared Event Links
  useEffect(() => {
    const handleHashAndQuery = () => {
      const params = new URLSearchParams(window.location.search);
      const eventQuery = params.get("event");
      const eventHash = window.location.hash;
      let targetEventId = "";

      if (eventQuery) {
        targetEventId = eventQuery;
      } else if (eventHash && eventHash.startsWith("#event-")) {
        targetEventId = eventHash.replace("#event-", "");
      }

      if (targetEventId) {
        const found = safeEvents.find(e => e.id === targetEventId);
        if (found) {
          setSelectedEvent(found);
          // Scroll to the events showcase section
          const section = document.getElementById("exclusive-events");
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    if (safeEvents.length > 0) {
      handleHashAndQuery();
    }

    window.addEventListener("hashchange", handleHashAndQuery);
    return () => {
      window.removeEventListener("hashchange", handleHashAndQuery);
    };
  }, [safeEvents]);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (userEmail) {
      setBookingEmail(userEmail);
      setReviewEmail(userEmail);
      setNotifyEmail(userEmail);
      // Try to extract name from email prefix
      const prefix = userEmail.split("@")[0];
      const cleanName = prefix.charAt(0).toUpperCase() + prefix.slice(1).replace(/[^a-zA-Z]/g, " ");
      setBookingName(cleanName);
      setReviewName(cleanName);
      setNotifyName(cleanName);
    } else {
      setBookingEmail("");
      setReviewEmail("");
      setNotifyEmail("");
      setBookingName("");
      setReviewName("");
      setNotifyName("");
    }
  }, [userEmail]);

  // Sync default category when event changes
  useEffect(() => {
    if (selectedEvent && (selectedEvent.categories || []).length > 0) {
      setSelectedCategory(selectedEvent.categories[0]);
      setTicketQuantity(1);
      setBookingPass(null);
      setReviewFeedback(null);
      setReviewComment("");
      setNotifySuccess(null);
      setActiveModalTab("booking");
    }
  }, [selectedEvent]);

  // Handle share event
  const handleShareEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?event=${eventId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedEventId(eventId);
      setTimeout(() => setCopiedEventId(null), 2000);
    }).catch(() => {
      const tempInput = document.createElement("input");
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      setCopiedEventId(eventId);
      setTimeout(() => setCopiedEventId(null), 2000);
    });
  };

  // Handle Notify Me Submit
  const handleNotifyMeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !onAddNotifyMeRequest) return;
    if (!notifyName.trim() || !notifyEmail.trim()) {
      alert("Please enter your name and email to receive alerts.");
      return;
    }

    onAddNotifyMeRequest(selectedEvent.id, selectedEvent.title, notifyEmail, notifyName, notifyMobile);
    setNotifySuccess(`🎉 Success! You have successfully pre-registered for notifications on ${selectedEvent.title}. You will receive a priority mobile & email alert as soon as bookings go live!`);
    
    // Clear form
    setNotifyMobile("");
  };

  // Filter events based on selected city and search query
  const filteredEvents = safeEvents.filter((evt) => {
    // Hide disabled events or if master event system is off
    const isEventActive = evt.isActive !== false && isEventBookingSystemActive;
    if (!isEventActive) {
      return false; // Inactive events should be hidden from customers
    }

    const matchesCity = selectedCity === "All Cities" || (evt.city || "").toLowerCase() === (selectedCity || "").toLowerCase();
    const matchesCategory = selectedCategoryFilter === "All Categories" ||
      (evt.categories || []).some(c => c.name.toLowerCase().includes(selectedCategoryFilter.toLowerCase())) ||
      (evt.title || "").toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
      (evt.description || "").toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    const matchesGenre = selectedGenreFilter === "All Genres" ||
      (evt.title || "").toLowerCase().includes(selectedGenreFilter.toLowerCase()) ||
      (evt.description || "").toLowerCase().includes(selectedGenreFilter.toLowerCase());
    const matchesSearch = !searchQuery ||
      (evt.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (evt.description || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (evt.venueName || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (evt.city || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    return matchesCity && matchesCategory && matchesGenre && matchesSearch;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedCategory) return;
    if (!bookingName.trim() || !bookingEmail.trim() || !bookingMobileNumber.trim()) {
      alert("Please fill in your name, email, and mobile number to register.");
      return;
    }

    const registrationId = `EV-REG-${Math.floor(100000 + Math.random() * 900000)}`;
    const isFree = selectedEvent.isPaid === false;
    const finalQuantity = isFree ? 1 : ticketQuantity;
    const finalPrice = isFree ? 0 : selectedCategory.price;
    const totalPrice = finalPrice * finalQuantity;

    const newRegistration: EventRegistration = {
      id: registrationId,
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      venueName: selectedEvent.venueName,
      date: selectedEvent.date,
      time: selectedEvent.time,
      userName: bookingName,
      userEmail: bookingEmail,
      mobileNumber: bookingMobileNumber.trim(),
      categoryName: selectedCategory.name,
      ticketPrice: finalPrice,
      quantity: finalQuantity,
      totalPrice: totalPrice,
      status: isFree ? "Confirmed" : "Pending",
      paymentMethod: isFree ? "Free Access Pass" : "Cashfree Secure Gateway",
      bookingDate: new Date().toLocaleDateString("en-IN") + ", " + new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
      organizerApproved: isFree ? true : false,
      superadminApproved: isFree ? true : false,
    };

    onBookEvent(newRegistration);
    setBookingPass(newRegistration);
    
    // Automatically generate and download PDF pass + dispatch to user email
    generateAndDownloadEventPassPdf(newRegistration);
    sendEventPassToEmail(newRegistration);
    
    // Decrement capacity simulation (non-blocking visual aid)
    selectedCategory.availableSeats = Math.max(0, selectedCategory.availableSeats - finalQuantity);
  };

  const [downloadingPass, setDownloadingPass] = useState(false);
  const [emailingPass, setEmailingPass] = useState(false);

  const handleDownloadPass = () => {
    if (!bookingPass) return;
    setDownloadingPass(true);
    setActionSuccessMessage(null);
    generateAndDownloadEventPassPdf(bookingPass);
    setTimeout(() => {
      setDownloadingPass(false);
      setActionSuccessMessage(`📥 Official PDF pass ${bookingPass.id} has been generated and downloaded to your device!`);
    }, 600);
  };

  const handleEmailPass = async () => {
    if (!bookingPass) return;
    setEmailingPass(true);
    setActionSuccessMessage(null);
    const res = await sendEventPassToEmail(bookingPass);
    setEmailingPass(false);
    setActionSuccessMessage(`✉ ${res.message}`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!reviewName.trim() || !reviewComment.trim()) {
      alert("Please provide both name and comment.");
      return;
    }

    const newReview: EventReview = {
      id: `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      userName: reviewName,
      userEmail: reviewEmail,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString("en-IN") + ", " + new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
    };

    onAddReview(selectedEvent.id, newReview);
    
    // Update local state copy to immediately show in UI
    selectedEvent.reviews = [newReview, ...selectedEvent.reviews];

    setReviewComment("");
    setReviewFeedback("Thank you! Your verified review has been submitted successfully.");
    setTimeout(() => setReviewFeedback(null), 4000);
  };

  const handlePrintPass = () => {
    window.print();
  };

  if (isEventBookingSystemActive === false) {
    return (
      <section id="exclusive-events" className="py-20 px-6 max-w-7xl mx-auto">
        <MaintenancePage
          serviceName="Event Booking"
          title="Event Booking Temporarily Unavailable"
          message={"Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon."}
          expectedTime="31 July 2026 10:00 AM"
          icon="🎟️"
        />
      </section>
    );
  }

  return (
    <section id="exclusive-events" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5 bg-gradient-to-b from-transparent to-[#0A0A0B]/50 space-y-12">
      
      {/* VIP MEMBER ACCESS BAR (IF NOT LOGGED IN) */}
      {!userEmail && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-transparent border border-[#D4AF37]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">CineVenue VIP Member Access</h5>
              <p className="text-xs text-white/70">Sign in to unlock priority seat allocations, VIP passes & instant ticket confirmation across all sub-websites.</p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-5 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            Sign In / Join Club
          </button>
        </div>
      )}

      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="text-left">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
              Event Booking Pillar
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-text-primary italic">
            Event <span className="text-gold not-italic font-normal">Booking</span>
          </h2>
          <p className="text-xs text-text-muted mt-2 max-w-xl">
            Register for celebrity meetups, custom fan-premieres, and immersive concerts occurring live in high-end theater venues near you.
          </p>
        </div>

        {/* Search Input Filter for Events */}
        <div className="relative w-full lg:max-w-xs">
          <input
            type="text"
            placeholder="Search events, venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold/50 rounded-lg pl-4 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-all duration-200"
            id="event-search-input"
          />
          <Plus className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 rotate-45" />
        </div>
      </div>

      {/* LIVE BANNER ADVERTISEMENT PLACEMENT: EVENTS TOP */}
      <div className="w-full mb-6">
        <CineVenueLiveBanner placement="events_top" />
      </div>

       {/* EVENT BOOKING CATEGORIES & QUICK ACTIONS BAR */}
      <div className="bg-[#0B0C10] border border-white/10 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl text-left">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "All Categories", label: "ALL EVENTS", icon: "🎟️" },
            { id: "Concerts", label: "CONCERTS", icon: "⚡" },
            { id: "Stand-up Comedy", label: "STAND-UP COMEDY", icon: "🎤" },
            { id: "Film Events", label: "FILM GALAS", icon: "🎬" },
            { id: "Workshops", label: "WORKSHOPS", icon: "📚" },
            { id: "Cultural Events", label: "CULTURAL", icon: "🎻" },
            { id: "Sports Events", label: "SPORTS", icon: "🏸" },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategoryFilter === cat.id
                  ? "bg-gold text-black shadow-lg shadow-gold/20 font-black"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 hover:text-white"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowOrganizerHub(true)}
            className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Organizer Hub & Gate Terminal</span>
          </button>
        </div>
      </div>


      {/* CURATED GENRES & CATEGORIES FILTER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5 text-left">
        <div className="space-y-1">
          <h4 className="font-display text-xl font-light text-white italic">
            Curated <span className="text-[#D4AF37] not-italic font-normal">Genres</span>
          </h4>
          <p className="text-xs text-white/50 font-light">
            Browse vetted VIP concerts, local celebrity galas, and live standup comedies across Andhra Pradesh and Telangana.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All Genres", "EDM Arenas", "Standup Comedy", "Symphony Tours", "Sufi Nights", "Celebrity Shows"].map((genre, i) => (
            <button 
              key={i}
              onClick={() => setSelectedGenreFilter(genre)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                selectedGenreFilter === genre
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-md font-extrabold" 
                  : "bg-white/5 text-white/70 hover:bg-white/10 border-white/5"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* UPCOMING VIP PASSES */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Upcoming VIP Passes
          </h5>
          <span className="text-[10px] font-mono text-white/40">3 ACTIVE BOX OFFICE PASSES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: "evt_1",
              title: "Sunburn Arena ft. Alan Walker",
              date: "Saturday, Oct 12, 2026",
              time: "06:00 PM onwards",
              venue: "Gachibowli Stadium, Hyderabad",
              pricing: "Starts at ₹1,499",
              status: "SELLING FAST",
              tag: "EDM / Mega Concert",
              icon: "⚡"
            },
            {
              id: "evt_2",
              title: "Zakir Khan Live Comedy Special",
              date: "Friday, Nov 02, 2026",
              time: "08:00 PM onwards",
              venue: "Shilpakala Vedika, Hyderabad",
              pricing: "Starts at ₹799",
              status: "LIMIT SLOTS",
              tag: "Standup Comedy",
              icon: "🎤"
            },
            {
              id: "evt_3",
              title: "Arijit Singh Premium Symphony Tour",
              date: "Sunday, Dec 20, 2026",
              time: "07:00 PM onwards",
              venue: "Guntur Club Arena, Guntur",
              pricing: "Starts at ₹2,499",
              status: "VIP ACCESS ONLY",
              tag: "Symphony Tour",
              icon: "🎻"
            }
          ].map((ticket, idx) => (
            <div key={idx} className="bg-gradient-to-b from-white/[0.03] to-black/40 border border-white/10 hover:border-[#D4AF37]/50 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all group relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 rounded-lg bg-white/5 border border-white/5">{ticket.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[9px] font-mono font-bold text-[#D4AF37] uppercase">{ticket.tag}</span>
                    <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-1.5 py-0.5 rounded">{ticket.status}</span>
                  </div>
                </div>
                <h6 className="font-display text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors">{ticket.title}</h6>
                <div className="space-y-1 text-xs text-white/60 font-light">
                  <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> {ticket.date}</p>
                  <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {ticket.time}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {ticket.venue}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-white/40 block uppercase">Box Office</span>
                  <span className="text-xs font-mono font-bold text-white">{ticket.pricing}</span>
                </div>
                <button
                  onClick={() => {
                    const matched = ticketedEventsList.find(e => e.title.toLowerCase().includes(ticket.title.toLowerCase().split(' ')[0])) || ticketedEventsList[0];
                    setBookingModalEvent(matched);
                  }}
                  className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <span>Secure Pass</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl max-w-xl mx-auto backdrop-blur-sm" id="empty-events-state">
          <Calendar className="w-10 h-10 text-text-muted mx-auto mb-4 opacity-40" />
          <p className="text-text-secondary font-medium mb-1">No upcoming events listed in {selectedCity}.</p>
          <p className="text-text-muted text-xs">Switch your city selection or clear the search filter to explore others.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="events-showroom-grid">
          {filteredEvents.map((evt) => {
            const minPrice = Math.min(...(evt.categories || []).map(c => c.price));
            const reviews = evt.reviews || [];
            const avgRating = reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : null;

            return (
              <div
                key={evt.id}
                id={`event-card-${evt.id}`}
                className="group bg-[#0D0D0F] border border-white/5 rounded-xl overflow-hidden hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5 -translate-y-0 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full text-left"
              >
                {/* Image & Badges */}
                <div className="relative aspect-[16/10] overflow-hidden bg-dark-card/40">
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0F] via-transparent to-transparent" />
                  
                  {/* Badges & Status */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                    <span className="bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded text-[9px] font-bold text-gold uppercase tracking-wider">
                      {evt.city}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  {avgRating && (
                    <div className="absolute top-14 right-4 bg-gold text-black font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                      <Star className="w-3 h-3 fill-black" />
                      <span>{avgRating}</span>
                    </div>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-gold uppercase tracking-widest block font-mono">
                      {new Date(evt.date).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' })} • {evt.time}
                    </span>
                    <h3 className="font-display text-xl text-text-primary tracking-wide group-hover:text-gold transition-colors duration-200">
                      {evt.title}
                    </h3>
                    <p className="text-text-secondary text-xs line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between">
                    <div>
                      {evt.comingSoon ? (
                        <div>
                          <span className="text-[9px] text-amber-400 uppercase tracking-wider block font-semibold font-mono">PRE-REGISTRATION</span>
                          <span className="text-xs font-display font-medium text-amber-300">
                            Pre-Notify Active
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[9px] text-text-muted uppercase tracking-wider block font-mono">PASSES START AT</span>
                          <span className="text-base font-display font-medium text-text-primary">
                            ₹{minPrice} <span className="text-xs text-text-secondary">onwards</span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 relative">
                      <button
                        type="button"
                        onClick={(e) => handleShareEvent(e, evt.id)}
                        className="p-2 bg-white/5 border border-white/10 text-text-primary hover:text-gold hover:border-gold/30 rounded-lg transition-all cursor-pointer flex items-center justify-center relative"
                        title="Share Event Link"
                      >
                        <Share2 className="w-4 h-4" />
                        {copiedEventId === evt.id && (
                          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black border border-white/15 text-[9px] text-gold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50 animate-fade-in">
                            Link Copied!
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        id={`btn-view-event-${evt.id}`}
                        onClick={() => {
                          if (evt.comingSoon) {
                            setSelectedEvent(evt);
                          } else {
                            handleOpenBooking(evt);
                          }
                        }}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                          evt.comingSoon
                            ? "bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20"
                            : (evt.isActive === false || !isEventBookingSystemActive)
                            ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-white/5 group-hover:bg-gold border border-white/10 group-hover:border-gold text-text-primary group-hover:text-black"
                        }`}
                      >
                        <span>
                          {evt.comingSoon 
                            ? "Notify Me" 
                            : (evt.isActive === false || !isEventBookingSystemActive) 
                            ? "Booking OFF" 
                            : "Get Passes"}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRENDING EXPERIENCES, BROWSE CATEGORIES, GEMINI CONCIERGE & REGIONAL UPDATES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/5 text-left">
        {/* LEFT 2 COLUMNS: TRENDING EXPERIENCES & BROWSE CATEGORIES */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TRENDING LIVE EXPERIENCES */}
            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-4">
              <h5 className="text-xs font-bold text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#D4AF37]" /> Trending Live Experiences
              </h5>
              <p className="text-xs text-white/50 font-light leading-relaxed">
                Ticket demand is currently surging across our regional portals. Here is a live feed of active pass bookings over the last 15 minutes.
              </p>
              <div className="space-y-3 pt-1">
                {[
                  { title: "Sufi Symphony Night", location: "Vijayawada Convention Centre", dynamicStat: "🔥 85 passes booked in last 5 min" },
                  { title: "Hyderabad Standup Fest", location: "Shilpakala Hall", dynamicStat: "⚡ 110 tickets secured in last 10 min" },
                  { title: "Alan Walker Sunburn Arena", location: "Gachibowli Stadium", dynamicStat: "🔥 320 VIP passes sold in last 1 hr" }
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[9px] font-mono text-[#D4AF37] font-semibold">{item.dynamicStat}</span>
                    </div>
                    <p className="text-[10px] text-white/40">{item.location}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* BROWSE LIVE CATEGORIES */}
            <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-4">
              <h5 className="text-xs font-bold text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-[#D4AF37]" /> Browse Live Categories
              </h5>
              <p className="text-xs text-white/50 font-light leading-relaxed">
                Filter and browse high-society event passes based on premium regional categories:
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { name: "EDM & DJ Arenas", count: "4 Shows" },
                  { name: "Standup Comedy", count: "6 Shows" },
                  { name: "Symphony Tours", count: "3 Shows" },
                  { name: "VIP Celeb Galas", count: "2 Shows" },
                  { name: "Fan-Premieres", count: "5 Shows" },
                  { name: "Sufi Evenings", count: "3 Shows" }
                ].map((cat, i) => (
                  <div key={i} className="p-2.5 rounded bg-white/5 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/30 border border-white/5 flex items-center justify-between transition-all cursor-pointer">
                    <span className="text-xs font-medium text-white/80">{cat.name}</span>
                    <span className="text-[9px] font-mono text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 font-bold">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CINEVENUE VICINITY CONCIERGE & REGIONAL UPDATES */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* CINEVENUE VICINITY CONCIERGE */}
          <div className="bg-gradient-to-b from-white/[0.02] to-white/[0.01] border border-[#D4AF37]/20 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-[#D4AF37]/2">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h5 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                  <span className="font-cinevenue normal-case text-sm tracking-normal">
                    <span className="text-white">Cine</span>
                    <span className="text-[#D4AF37]">Venue</span>
                  </span> Vicinity Concierge
                </h5>
                <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 text-[8px] font-mono font-bold rounded-full uppercase tracking-wider">
                  AI Agent
                </span>
              </div>

              {/* Chat Messages */}
              <div className="h-56 overflow-y-auto space-y-3 pr-1 text-xs font-light scrollbar-thin">
                {conciergeChat.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-xl leading-relaxed space-y-1 ${
                      msg.role === "user" 
                        ? "bg-white/5 border border-white/5 text-white/90 text-right ml-6" 
                        : "bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-white/90 mr-6"
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 block pb-0.5 text-left">
                      {msg.role === "user" ? "You (VIP Guest)" : "CineVenue Concierge Agent"}
                    </span>
                    <p className="whitespace-pre-line text-left">{msg.text}</p>
                  </div>
                ))}

                {conciergeLoading && (
                  <div className="p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 mr-6 space-y-2 text-left">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 block">CineVenue Concierge Agent</span>
                    <div className="flex items-center gap-2 text-white/60 font-mono text-[10px]">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-ping" />
                      Querying venue database...
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleConciergeSubmit} className="space-y-2 pt-2 border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask Concierge (e.g. VIP lounges in Guntur?)"
                  value={conciergePrompt}
                  onChange={(e) => setConciergePrompt(e.target.value)}
                  disabled={conciergeLoading}
                  className="w-full pl-3 pr-10 py-2.5 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-xs text-white placeholder-white/40 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all disabled:opacity-55"
                />
                <button 
                  type="submit"
                  disabled={conciergeLoading || !conciergePrompt.trim()}
                  className="absolute right-2 top-1.5 p-1.5 text-[#D4AF37] hover:text-white disabled:text-white/25 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* LIVE REGIONAL UPDATES */}
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2.5">
            <h5 className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Live Regional Updates
            </h5>
            <div className="space-y-2 font-mono text-[9px] text-white/50 leading-relaxed uppercase">
              <div className="flex items-start gap-1.5 border-b border-white/5 pb-1.5">
                <span className="text-rose-400">●</span>
                <p>HYDERABAD METRO EXTRA LATE TRAIN RUNS FOR SUNBURN ARENA ON OCT 12TH.</p>
              </div>
              <div className="flex items-start gap-1.5 border-b border-white/5 pb-1.5">
                <span className="text-[#D4AF37]">●</span>
                <p>GUNTUR POLICE GRANTS SINGLE-WINDOW CLEARANCE FOR MIDNIGHT OPEN-AIR ACOUSTIC NIGHT.</p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">●</span>
                <p>PRASADS IMAX ANNOUNCES PRE-RELEASE CELEBRITY VIP LOUNGE ACCESS SLOTS.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVENT DETAILED DIALOG MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" id="event-detail-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#0D0D10] border border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl text-left my-8"
              id="event-detail-modal"
            >
              {/* Header Cover Banner */}
              <div className="relative aspect-[21/9] md:aspect-[24/8] overflow-hidden bg-dark-card/20">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D10] via-[#0D0D10]/50 to-black/45" />
                
                {/* Share Event Button */}
                <button
                  type="button"
                  onClick={(e) => handleShareEvent(e, selectedEvent.id)}
                  className="absolute top-4 right-14 p-2 bg-black/60 hover:bg-gold hover:text-black text-text-primary rounded-full transition-all border border-white/10 cursor-pointer relative"
                  title="Share Event Link"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedEventId === selectedEvent.id && (
                    <span className="absolute right-0 top-full mt-2 bg-black border border-white/15 text-[9px] text-gold px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-fade-in font-sans">
                      Link Copied!
                    </span>
                  )}
                </button>

                {/* Back to Events Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 hover:bg-gold hover:text-black text-text-primary text-xs font-semibold rounded-lg transition-all border border-white/10 cursor-pointer flex items-center gap-1.5 z-10"
                  id="back-to-events-modal-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Events</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-gold hover:text-black text-text-primary rounded-full transition-all border border-white/10 cursor-pointer"
                  id="close-event-modal-btn"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Banner Content */}
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] block mb-1">
                    EXCLUSIVE EXPERIENCE • {selectedEvent.city}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display font-medium text-text-primary tracking-wide">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              {/* Layout Content */}
              <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                
                {/* LEFT: INFO & LOGISTICS (3 Cols) */}
                <div className="lg:col-span-3 p-6 md:p-8 space-y-6">
                  
                  {/* METADATA CHIPS */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <span className="text-[9px] text-text-muted block font-semibold uppercase">DATE</span>
                        <span className="text-xs text-text-primary font-medium">
                          {new Date(selectedEvent.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <span className="text-[9px] text-text-muted block font-semibold uppercase">TIMING</span>
                        <span className="text-xs text-text-primary font-medium">{selectedEvent.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                      <MapPin className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <span className="text-[9px] text-text-muted block font-semibold uppercase">VENUE</span>
                        <span className="text-xs text-text-primary font-medium truncate max-w-[150px] block">{selectedEvent.venueName}</span>
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold">About the Event</h4>
                    <p className="text-text-secondary text-xs leading-relaxed font-sans text-justify">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* VENUE FULL ADDRESS */}
                  <div className="space-y-1.5 bg-white/[0.01] p-4 rounded-xl border border-white/5 text-xs text-text-secondary">
                    <div className="flex items-center gap-2 text-gold font-semibold text-[10px] uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-gold" />
                      <span>Venue Details & Access Coordinates</span>
                    </div>
                    <p className="font-medium text-text-primary text-xs">{selectedEvent.venueName}</p>
                    <p className="text-[11px] text-text-muted font-sans leading-normal">{selectedEvent.venueAddress}</p>
                  </div>

                  {/* REVIEW RATING TOTAL & TABS */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="flex gap-4 border-b border-white/5 pb-2">
                      <button
                        onClick={() => setActiveModalTab("booking")}
                        className={`pb-2 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                          activeModalTab === "booking" ? "text-gold" : "text-text-muted"
                        }`}
                      >
                        Book Passes
                        {activeModalTab === "booking" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                      </button>

                      <button
                        onClick={() => setActiveModalTab("reviews")}
                        className={`pb-2 text-xs font-bold uppercase tracking-wider relative cursor-pointer flex items-center gap-1.5 ${
                          activeModalTab === "reviews" ? "text-gold" : "text-text-muted"
                        }`}
                      >
                        <span>Verified Reviews ({(selectedEvent.reviews || []).length})</span>
                        {activeModalTab === "reviews" && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                      </button>
                    </div>

                    {/* REVIEWS TAB VIEW */}
                    {activeModalTab === "reviews" && (
                      <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        
                        {/* SUBMIT REVIEW FORM */}
                        <form onSubmit={handleReviewSubmit} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                            ✍️ Submit Your Verified Review
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1 text-left">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Your Name</label>
                              <input
                                type="text"
                                value={reviewName}
                                onChange={(e) => setReviewName(e.target.value)}
                                placeholder="Enter name"
                                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                                required
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Email Address</label>
                              <input
                                type="email"
                                value={reviewEmail}
                                onChange={(e) => setReviewEmail(e.target.value)}
                                placeholder="Enter email"
                                className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-bold text-text-muted uppercase">Rating:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setReviewRating(star)}
                                  className="p-0.5 cursor-pointer bg-transparent border-0 text-amber-400 hover:scale-110 transition-transform"
                                >
                                  <Star className={`w-4 h-4 ${star <= reviewRating ? "fill-amber-400" : "text-text-muted"}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-text-muted uppercase">Review Description</label>
                            <textarea
                              rows={2}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Share your thoughts or booking experience of this luxury event..."
                              className="w-full bg-black/40 border border-white/10 rounded px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-muted/65 focus:outline-none focus:border-gold"
                              required
                            />
                          </div>

                          {reviewFeedback && (
                            <p className="text-[10px] text-emerald-400 font-semibold">{reviewFeedback}</p>
                          )}

                          <button
                            type="submit"
                            className="px-3.5 py-1.5 bg-gold hover:bg-gold-light text-black text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer"
                          >
                            Submit Review
                          </button>
                        </form>

                        {/* REVIEWS LIST */}
                        {(selectedEvent.reviews || []).length === 0 ? (
                          <div className="text-center py-6 text-text-muted text-xs font-sans">
                            No reviews have been posted for this event yet. Be the first to share your anticipation!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(selectedEvent.reviews || []).map((rev) => (
                              <div key={rev.id} className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold">
                                  <span className="text-text-primary">{rev.userName}</span>
                                  <span className="text-[9px] text-text-muted">{rev.date}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-text-muted/40"}`} />
                                  ))}
                                </div>
                                <p className="text-text-secondary text-xs leading-normal font-sans">{rev.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BOOKING TAB REGISTRATION ACCESS */}
                    {activeModalTab === "booking" && !bookingPass && (
                      <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-2">
                        <div className="flex items-center gap-1 text-gold font-semibold uppercase tracking-wider text-[10px]">
                          <Shield className="w-4 h-4 text-gold" />
                          <span>Secure Registration Pass Access</span>
                        </div>
                        <p className="text-text-secondary leading-relaxed font-sans text-[11px]">
                          Registration for this event is secured via live digital pass passes. Select your desired pricing tier on the right pane, fill in credentials, and instantly retrieve your Cinema Venue Entry ticket.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: TICKET PRICING & TRANSACTION GATEWAY (2 Cols) */}
                <div className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-between h-full bg-[#0F0F13]/40">
                  {selectedEvent.comingSoon ? (
                    notifySuccess ? (
                      <div className="space-y-5 animate-fade-in text-center py-10" id="notify-success-container">
                        <CheckCircle2 className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block font-mono">NOTIFY ME CONFIGURED</span>
                        <h4 className="text-sm font-semibold text-text-primary">Pre-registration Secured!</h4>
                        <div className="p-4 bg-[#14141A] border border-amber-500/10 rounded-xl text-left text-xs text-text-secondary leading-relaxed font-sans space-y-2">
                          <p className="text-[11px] leading-relaxed">{notifySuccess}</p>
                          <p className="text-[10px] text-text-muted italic">Our system has logged your priority alert. You will be notified instantly once the ticket sales counter goes live.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(null)}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded text-xs font-bold uppercase tracking-wider cursor-pointer font-sans border-0"
                        >
                          Close Panel
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 flex flex-col justify-between h-full text-left">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 border-b border-white/5 pb-2 flex items-center gap-1.5 font-mono">
                            <Sparkles className="w-3.5 h-3.5" />
                            Pre-Notification Alerts Active
                          </h4>
                          <p className="text-text-secondary text-[11px] leading-relaxed font-sans">
                            Official ticket bookings for <strong>{selectedEvent.title}</strong> are currently locked but slated to open soon. Pre-register your contact details to unlock immediate alerts as soon as seat allocation commences.
                          </p>

                          <form onSubmit={handleNotifyMeSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Full Name</label>
                              <input
                                type="text"
                                value={notifyName}
                                onChange={(e) => setNotifyName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-amber-400"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Email Address</label>
                              <input
                                type="email"
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-amber-400"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Mobile Number (SMS Alerts)</label>
                              <input
                                type="tel"
                                value={notifyMobile}
                                onChange={(e) => setNotifyMobile(e.target.value)}
                                placeholder="e.g. 9876543210 (Optional)"
                                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-amber-400 font-mono"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black border-0 shadow-lg shadow-amber-500/10 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                            >
                              🔔 Pre-Register for Alerts
                            </button>
                          </form>
                        </div>
                      </div>
                    )
                  ) : bookingPass ? (
                    <div className="space-y-5 animate-fade-in text-center" id="ticket-pass-container">
                      <div className="flex flex-col items-center gap-2 mb-2">
                        {bookingPass.status === "Pending" ? (
                          <>
                            <Clock className="w-12 h-12 text-amber-400 animate-pulse" />
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">REQUEST SUBMITTED</span>
                            <h4 className="text-sm font-semibold text-text-primary">Paid Event Booking Request Sent!</h4>
                            <p className="text-[11px] text-text-secondary max-w-sm mx-auto">
                              Your request details have been delivered to the admin portal. Your seat is reserved as <strong className="text-amber-400">Pending</strong> awaiting admin verification.
                            </p>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">PASS SECURED</span>
                            <h4 className="text-sm font-semibold text-text-primary">Your CineVenue digital event pass is confirmed!</h4>
                          </>
                        )}
                      </div>

                      {/* RETRO TICKET STUB */}
                      {bookingPass.status !== "Pending" ? (
                        <div className="bg-[#14141A] border border-white/10 rounded-xl overflow-hidden relative shadow-lg text-left" id="retro-ticket-stub">
                          {/* Decorative dotted lines split */}
                          <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-[10px] text-gold font-bold font-mono tracking-widest">CINEVENUE GALA PASS</span>
                              <span className="text-[10px] text-text-muted font-mono">{bookingPass.id}</span>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[8px] text-text-muted block font-semibold uppercase">EVENT TITLE</span>
                              <p className="text-xs font-semibold text-text-primary font-display">{bookingPass.eventTitle}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div>
                                <span className="text-[8px] text-text-muted block font-semibold uppercase">VENUE</span>
                                <p className="text-[11px] font-semibold text-text-primary truncate">{bookingPass.venueName}</p>
                              </div>
                              <div>
                                <span className="text-[8px] text-text-muted block font-semibold uppercase">DATE & TIME</span>
                                <p className="text-[11px] font-semibold text-text-primary">{bookingPass.date} • {bookingPass.time}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t border-dashed border-white/10 pt-3">
                              <div>
                                <span className="text-[8px] text-text-muted block font-semibold uppercase">REGISTRANT</span>
                                <p className="text-[11px] text-text-primary font-medium">{bookingPass.userName}</p>
                                {bookingPass.mobileNumber && (
                                  <p className="text-[9px] text-gold/80 font-mono mt-0.5">📱 {bookingPass.mobileNumber}</p>
                                )}
                              </div>
                              <div>
                                <span className="text-[8px] text-text-muted block font-semibold uppercase">CATEGORY</span>
                                <p className="text-[11px] text-gold font-bold">{bookingPass.categoryName} (x{bookingPass.quantity})</p>
                                <span className={`inline-block px-1.5 py-0.5 mt-1 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  bookingPass.status === 'Cancelled'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {bookingPass.status || 'Confirmed'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Receipt stub */}
                          <div className="bg-gold/5 border-t border-dashed border-white/10 px-4 py-3 flex justify-between items-center">
                            <div>
                              <span className="text-[8px] text-text-muted block font-semibold uppercase">GRAND TOTAL (SECURED)</span>
                              {bookingPass.totalPrice === 0 ? (
                                <p className="text-xs font-bold text-emerald-400 uppercase">COMPLIMENTARY PASS</p>
                              ) : (
                                <p className="text-sm font-bold text-gold font-mono">₹{bookingPass.totalPrice}</p>
                              )}
                            </div>
                            
                            {/* Simulated mini barcode */}
                            <div className="flex flex-col items-center">
                              <div className="flex gap-0.5 h-6 items-end select-none">
                                {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3].map((w, i) => (
                                  <div key={i} className="bg-text-secondary w-[2px]" style={{ height: `${w * 5}px` }} />
                                ))}
                              </div>
                              <span className="text-[7px] text-text-muted font-mono mt-1">VERIFIED REGISTRATION</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#14141A] border border-amber-500/10 rounded-xl p-5 text-left space-y-4">
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block border-b border-white/5 pb-2">
                            📝 DUAL APPROVAL PROTOCOL
                          </span>
                          <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                            <p>To preserve elite experience standards and seat premium splits, paid bookings must be approved by:</p>
                            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-text-muted">
                              <li>The Event Organizer (<span className="text-amber-400">Awaiting response</span>)</li>
                              <li>The CineVenue Superadmin (<span className="text-amber-400">Awaiting response</span>)</li>
                            </ul>
                            <p className="text-[11.5px] border-t border-white/5 pt-2 text-text-muted">
                              No passes or gate barcodes are generated at this stage. Once both parties approve your order, your pass will instantly unlock under your <strong className="text-gold">Orders & Passes</strong> tab.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* DOWNLOAD, MAIL & CLOSE OPTIONS */}
                      <div className="flex flex-col gap-2.5 w-full mt-4">
                        {/* Success Feedback Banner */}
                        {actionSuccessMessage && (
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] leading-relaxed text-center font-medium animate-fade-in">
                            {actionSuccessMessage}
                          </div>
                        )}

                        {bookingPass.status !== "Pending" ? (
                          <>
                            {/* Download & Mail Row (Always active for all booked passes) */}
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <button
                                type="button"
                                onClick={handleDownloadPass}
                                disabled={downloadingPass}
                                className="px-3 py-2.5 bg-emerald-500/15 hover:bg-emerald-500 text-white hover:text-black rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/20 disabled:opacity-50 transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{downloadingPass ? "Generating PDF..." : "Download PDF Pass"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleEmailPass}
                                disabled={emailingPass}
                                className="px-3 py-2.5 bg-blue-500/15 hover:bg-blue-500 text-white hover:text-black rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/20 disabled:opacity-50 transition-all"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{emailingPass ? "Dispatching..." : "Send to Email"}</span>
                              </button>
                            </div>

                            <div className="flex gap-2 w-full">
                              <button
                                onClick={handlePrintPass}
                                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-text-primary rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                                id="btn-print-event-pass"
                              >
                                <Printer className="w-4 h-4 text-gold" />
                                <span>Print Ticket</span>
                              </button>
                              <button
                                onClick={() => setSelectedEvent(null)}
                                className="flex-1 px-3 py-2 bg-gold hover:bg-gold-light text-black rounded text-xs font-bold uppercase tracking-wider cursor-pointer border-0"
                                id="btn-close-pass-modal"
                              >
                                Return to Lobby
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => setSelectedEvent(null)}
                            className="w-full px-3 py-3 bg-gold hover:bg-gold-light text-black rounded text-xs font-bold uppercase tracking-wider cursor-pointer border-0"
                            id="btn-close-pass-modal"
                          >
                            Return to Lobby
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (selectedEvent.isActive === false || !isEventBookingSystemActive) ? (
                    <div className="space-y-6 flex flex-col justify-center items-center h-full text-center p-6 bg-rose-950/20 border border-rose-500/30 rounded-xl">
                      <Power className="w-12 h-12 text-rose-400 animate-pulse" />
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest font-mono">BOOKING STATUS: OFF</span>
                      <h4 className="text-base font-semibold text-text-primary">Event Booking Turned OFF</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {!isEventBookingSystemActive
                          ? "The master event booking system is currently toggled OFF by Super Administrators."
                          : "Bookings for this specific event are currently turned OFF by Platform Administrators."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 flex flex-col justify-between h-full">
                      
                      {/* PRICING SELECTOR */}
                      <div className="space-y-4 text-left">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold border-b border-white/5 pb-2">
                          1. Select Ticket Category & Tier
                        </h4>

                        <div className="space-y-2">
                          {(selectedEvent.categories || []).map((cat, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                selectedCategory?.name === cat.name
                                  ? "bg-gold/10 border-gold"
                                  : "bg-white/[0.01] border-white/5 hover:border-white/15"
                              }`}
                              id={`tier-select-btn-${idx}`}
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-text-primary block">{cat.name}</span>
                                <span className="text-[9px] text-text-secondary block">
                                  {cat.availableSeats > 0 ? `🟢 ${cat.availableSeats} passes left` : "🔴 Sold Out"}
                                </span>
                              </div>
                              <div className="text-right">
                                {selectedEvent.isPaid === false ? (
                                  <span className="text-xs font-bold text-emerald-400 block uppercase font-sans">FREE ENTRY</span>
                                ) : (
                                  <>
                                    <span className="text-xs font-mono text-gold font-bold block">₹{cat.price}</span>
                                    <span className="text-[8px] text-text-muted block">per pass</span>
                                  </>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* QUANTITY AND CONFIRM DETAILS */}
                      {selectedCategory && (
                        <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-white/5">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold">
                            2. Enter Registrant Credentials
                          </h4>

                          {/* Credentials Inputs */}
                          <div className="space-y-3 text-left">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Your Full Name</label>
                              <input
                                type="text"
                                value={bookingName}
                                onChange={(e) => setBookingName(e.target.value)}
                                placeholder="e.g. Rohini Deshmukh"
                                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Email Address</label>
                              <input
                                type="email"
                                value={bookingEmail}
                                onChange={(e) => setBookingEmail(e.target.value)}
                                placeholder="e.g. rohini@outlook.com"
                                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-text-muted uppercase">Mobile Number</label>
                              <input
                                type="tel"
                                value={bookingMobileNumber}
                                onChange={(e) => setBookingMobileNumber(e.target.value)}
                                placeholder="e.g. 9876543210"
                                className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold font-mono"
                                required
                              />
                            </div>

                            {/* Ticket Quantity Selector */}
                            {selectedEvent.isPaid !== false && (
                              <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                                <span className="text-[10px] font-bold text-text-secondary uppercase font-mono">Quantity Passes</span>
                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xs text-text-primary cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold text-text-primary w-4 text-center font-mono">{ticketQuantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setTicketQuantity(Math.min(selectedCategory.availableSeats, ticketQuantity + 1))}
                                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-xs text-text-primary cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* GRAND TOTAL PRICING & PAYMENT */}
                          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex justify-between items-center text-xs">
                            <span className="text-text-secondary font-medium">Billed Price:</span>
                            {selectedEvent.isPaid === false ? (
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                                FREE PASS (No Payment Required)
                              </span>
                            ) : (
                              <span className="text-base font-bold text-gold font-mono">
                                ₹{(selectedCategory.price * ticketQuantity).toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Submit Booking trigger button */}
                          {(() => {
                            const isEventActive = (selectedEvent.isActive as boolean | undefined) !== false && isEventBookingSystemActive;
                            return (
                              <button
                                type="submit"
                                disabled={selectedCategory.availableSeats === 0 || !isEventActive}
                                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider border-0 ${
                                  !isEventActive
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed opacity-60 pointer-events-none"
                                    : selectedCategory.availableSeats === 0
                                    ? "bg-white/5 text-text-muted cursor-not-allowed opacity-50"
                                    : "bg-gold hover:bg-gold-light text-black cursor-pointer shadow-lg shadow-gold/10 hover:shadow-gold/20 transition-all"
                                }`}
                                id="btn-confirm-event-registration"
                              >
                                {!isEventActive
                                  ? "Booking Turned OFF"
                                  : selectedCategory.availableSeats === 0
                                  ? "Sold Out"
                                  : "Register & Get Pass"}
                              </button>
                            );
                          })()}
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UNIFIED EVENT BOOKING MODAL */}
      {bookingModalEvent && (
        <EventBookingModal
          event={bookingModalEvent}
          userEmail={userEmail}
          userWallet={userWallet}
          onUpdateWallet={onUpdateWallet}
          onClose={() => setBookingModalEvent(null)}
          onBookingSuccess={(booking) => {
            setBookingModalEvent(null);
            setViewingPass(booking);
          }}
        />
      )}

      {/* DIGITAL TICKET PASS MODAL */}
      {viewingPass && (
        <DigitalTicketPassModal
          booking={viewingPass}
          onClose={() => setViewingPass(null)}
        />
      )}

      {/* ORGANIZER & GATE CHECK-IN TERMINAL */}
      {showOrganizerHub && (
        <OrganizerEventHub
          userEmail={userEmail}
          onClose={() => setShowOrganizerHub(false)}
        />
      )}
    </section>
  );
}
