import React, { useState, useEffect } from "react";
import { 
  Calendar, MapPin, Clock, Ticket, Star, Plus, ChevronRight, Info, Sparkles, 
  Share2, Award, CheckCircle2, MessageSquare, PlusCircle, X, FileText, Printer, Shield, ArrowLeft,
  Download, Mail, Power, ToggleLeft, ToggleRight, Send, Activity, ArrowRight, Sparkle, UserCheck, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Event, EventCategory, EventReview, EventRegistration, NotifyMeRequest } from "../types";
import MaintenancePage from "./MaintenancePage";

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

  // Sub-Site Portal Tabs & Quote Request State
  const [eventShowcaseTab, setEventShowcaseTab] = useState<"portfolio" | "gallery" | "quote" | "passes">("portfolio");
  const [quoteFormState, setQuoteFormState] = useState({
    organizerName: "",
    eventType: "Pre-Release Events",
    audienceSize: "",
    targetCityVenue: "",
    tentativeDate: "",
    contactPhone: "",
    contactEmail: userEmail || "",
    productionNotes: ""
  });
  const [quoteFormSuccess, setQuoteFormSuccess] = useState(false);
  const [quoteRefId, setQuoteRefId] = useState("");
  const [galleryModalItem, setGalleryModalItem] = useState<{ title: string; location: string; image: string } | null>(null);

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
    const matchesSearch = !searchQuery ||
      (evt.title || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (evt.description || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (evt.venueName || "").toLowerCase().includes((searchQuery || "").toLowerCase()) ||
      (evt.city || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    return matchesCity && matchesSearch;
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
      paymentMethod: isFree ? "Free Access Pass" : "Razorpay Secure Gateway",
      bookingDate: new Date().toLocaleDateString("en-IN") + ", " + new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
      organizerApproved: isFree ? true : false,
      superadminApproved: isFree ? true : false,
    };

    onBookEvent(newRegistration);
    setBookingPass(newRegistration);
    
    // Decrement capacity simulation (non-blocking visual aid)
    selectedCategory.availableSeats = Math.max(0, selectedCategory.availableSeats - finalQuantity);
  };

  const [downloadingPass, setDownloadingPass] = useState(false);
  const [emailingPass, setEmailingPass] = useState(false);

  const handleDownloadPass = () => {
    if (!bookingPass) return;
    setDownloadingPass(true);
    setActionSuccessMessage(null);
    setTimeout(() => {
      setDownloadingPass(false);
      
      const ticketContent = `
==================================================
              CINEVENUE EVENT PASS
==================================================
Pass Code  : ${bookingPass.id}
Event      : ${bookingPass.eventTitle}
Category   : ${bookingPass.categoryName} Class Pass
Venue      : ${bookingPass.venueName}
Date       : ${bookingPass.date}
Time       : ${bookingPass.time}
Holder     : ${bookingPass.userName}
Email      : ${bookingPass.userEmail}
Mobile     : ${bookingPass.mobileNumber}
Qty        : ${bookingPass.quantity}x
Total Price: ₹${bookingPass.totalPrice}
Status     : ${bookingPass.status}
Gateway    : ${bookingPass.paymentMethod}
Booking DT : ${bookingPass.bookingDate}

Thank you for choosing CineVenue Elite Concierge.
Please keep this copy secure and show it at the venue gates.
==================================================
`;
      const blob = new Blob([ticketContent.trim()], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cinevenue-pass-${bookingPass.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setActionSuccessMessage(`📥 Pass ${bookingPass.id} has been downloaded to your device as a text ticket!`);
    }, 800);
  };

  const handleEmailPass = () => {
    if (!bookingPass) return;
    setEmailingPass(true);
    setActionSuccessMessage(null);
    setTimeout(() => {
      setEmailingPass(false);
      setActionSuccessMessage(`✉ VIP Ticket details have been officially dispatched to your email: ${bookingPass.userEmail}!`);
    }, 800);
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
            Exclusive <span className="text-gold not-italic font-normal">Cinematic Events</span> & Galas
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

      {/* SUB-SITE NAVIGATION TABS (PORTFOLIO, GALLERY, REQUEST QUOTE, UPCOMING PASSES) */}
      <div className="bg-[#0B0C10] border border-white/10 rounded-2xl p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 shadow-xl text-left">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "portfolio", label: "EVENT SERVICES PORTFOLIO", icon: "✨ 🎤" },
            { id: "gallery", label: "EVENT GALLERY", icon: "🖼️ 🖼️" },
            { id: "quote", label: "REQUEST A CUSTOM QUOTE", icon: "📑 📝" },
            { id: "passes", label: "UPCOMING PASSES & CONCERTS", icon: "🎟️ 🎪" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setEventShowcaseTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                eventShowcaseTab === tab.id
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/30 border border-red-500 font-extrabold"
                  : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 hover:text-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-lg">
          FULL-SPECTRUM EVENT MANAGEMENT
        </span>
      </div>

      {/* TAB 1: EVENT SERVICES PORTFOLIO */}
      {eventShowcaseTab === "portfolio" && (
        <div className="space-y-8 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-widest font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Comprehensive Production Services</span>
            </div>
            <h3 className="font-display text-3xl font-light text-white italic">
              Full-Spectrum <span className="text-[#D4AF37] not-italic font-normal">Event Management</span> Services
            </h3>
            <p className="text-xs text-white/60 font-light max-w-2xl">
              From movie pre-release events to stadium concerts and corporate galas. We handle turnkey execution across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: "pre_release",
                title: "Pre-Release Events",
                icon: "🎬",
                description: "Grand scale audio & trailer launches in stadium venues with LED stage setups & VIP security."
              },
              {
                id: "audio_launches",
                title: "Audio Launches",
                icon: "🎵",
                description: "Live music releases featuring top composers, orchestra performances, and star cast interactions."
              },
              {
                id: "movie_promotions",
                title: "Movie Promotions",
                icon: "📣",
                description: "Pan-India city tours, mall visits, college flashmobs, and press conference management."
              },
              {
                id: "success_meets",
                title: "Success Meets",
                icon: "🏆",
                description: "Celebratory star nights, shield distribution, media Q&A, and red carpet photo calls."
              },
              {
                id: "celebrity_shows",
                title: "Celebrity Shows",
                icon: "⭐",
                description: "Exclusive star dance performances, celebrity meets, comedy nights, and fan park events."
              },
              {
                id: "live_concerts",
                title: "Live Concerts",
                icon: "🎤",
                description: "Massive stadium concerts, international tour logistics, line array audio & light show production."
              },
              {
                id: "musical_nights",
                title: "Musical Nights",
                icon: "🎶",
                description: "Intimate playback singer evenings, classical fusion concerts, and unplugged acoustic sessions."
              },
              {
                id: "corporate_events",
                title: "Corporate Events",
                icon: "🏢",
                description: "Annual general meetings, product unveilings, award ceremonies, and team retreats."
              },
              {
                id: "college_fests",
                title: "College Fests",
                icon: "🎓",
                description: "Campus pro-nights, battle of the bands, star headliner concerts, and youth cultural festivals."
              },
              {
                id: "brand_activations",
                title: "Brand Activations",
                icon: "🏷️",
                description: "Experiential marketing booths, interactive VR setups, and promotional pop-up installations."
              },
              {
                id: "wedding_entertainment",
                title: "Wedding Entertainment",
                icon: "💍",
                description: "Royal sangeet choreography, celebrity guest appearances, and bespoke musical band bookings."
              }
            ].map((item) => (
              <div
                key={item.id}
                className="bg-[#0D0E13] border border-white/10 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setQuoteFormState(prev => ({ ...prev, eventType: item.title }));
                    setEventShowcaseTab("quote");
                  }}
                  className="pt-4 border-t border-white/5 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer group-hover:translate-x-1"
                >
                  <span>→ Request Quote</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: EVENT GALLERY */}
      {eventShowcaseTab === "gallery" && (
        <div className="space-y-8 text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono uppercase tracking-widest font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Production Portfolio Showcase</span>
            </div>
            <h3 className="font-display text-3xl font-light text-white italic">
              Cinevenue <span className="text-rose-400 not-italic font-normal">Live Event Gallery</span>
            </h3>
            <p className="text-xs text-white/60 font-light max-w-2xl">
              Glance at our stadium setups, stage lighting setups, and star-studded gatherings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: "gal_1",
                title: "Grand Pre-Release Event",
                location: "📍 Hyderabad Stadium",
                image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80"
              },
              {
                id: "gal_2",
                title: "Live Star Concert Arena",
                location: "📍 Bengaluru Beach Ground",
                image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80"
              },
              {
                id: "gal_3",
                title: "Audio Launch Light Show",
                location: "📍 Chennai Trade Centre",
                image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80"
              },
              {
                id: "gal_4",
                title: "Success Meet Star Gala",
                location: "📍 Vijayawada Convention Hall",
                image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80"
              },
              {
                id: "gal_5",
                title: "College Cultural Pro-Night",
                location: "📍 Vizag Campus Ground",
                image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1000&q=80"
              },
              {
                id: "gal_6",
                title: "Corporate Award Ceremony",
                location: "📍 HITEX Exhibition Centre, Hyderabad",
                image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"
              }
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setGalleryModalItem(item)}
                className="group relative bg-[#0D0E13] border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-rose-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10"
              >
                <div className="h-56 w-full overflow-hidden relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <span className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 rounded-lg border border-amber-500/30 font-mono">
                    {item.location}
                  </span>
                </div>

                <div className="p-5 space-y-2 relative z-10">
                  <h4 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-white/50 flex items-center gap-1">
                    <span>Click to view stage setup photo</span>
                    <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REQUEST A CUSTOM QUOTE FORM */}
      {eventShowcaseTab === "quote" && (
        <div className="bg-[#0B0C10] border border-white/10 rounded-2xl p-6 md:p-10 space-y-8 shadow-2xl max-w-4xl mx-auto text-left">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-widest font-bold">
              <FileText className="w-4 h-4" />
              <span>Direct B2B Inquiry Portal</span>
            </div>
            <h3 className="font-display text-3xl font-bold text-white">
              Request Event Management Quote
            </h3>
            <p className="text-xs text-white/60 font-light">
              Fill in your event details to receive a customized proposal and budget estimation.
            </p>
          </div>

          {quoteFormSuccess ? (
            <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-emerald-300">
                  Quote Request Submitted Successfully!
                </h4>
                <p className="text-xs text-white/70 max-w-md mx-auto">
                  Thank you, <strong className="text-white">{quoteFormState.organizerName || "Organizer"}</strong>. Your event request reference ID is <strong className="text-amber-400 font-mono">{quoteRefId}</strong>.
                </p>
              </div>
              <p className="text-xs text-emerald-400/80 bg-black/40 p-3 rounded-xl inline-block font-mono border border-emerald-500/20">
                Our Event Line Production Director will contact you at {quoteFormState.contactPhone || "your phone"} within 2 hours.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setQuoteFormSuccess(false)}
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!quoteFormState.organizerName || !quoteFormState.contactPhone || !quoteFormState.contactEmail) {
                  alert("Please fill in all required fields (*).");
                  return;
                }

                const refId = `EV-QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;
                setQuoteRefId(refId);
                setQuoteFormSuccess(true);
              }}
              className="space-y-6 text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ORGANIZER NAME / COMPANY */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                    ORGANIZER NAME / COMPANY <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteFormState.organizerName}
                    onChange={(e) => setQuoteFormState(prev => ({ ...prev, organizerName: e.target.value }))}
                    placeholder="e.g. Production Company"
                    className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all"
                  />
                </div>

                {/* EVENT TYPE Dropdown */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                    EVENT TYPE <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={quoteFormState.eventType}
                    onChange={(e) => setQuoteFormState(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none transition-all"
                  >
                    <option value="Pre-Release Events">Pre-Release Events</option>
                    <option value="Audio Launches">Audio Launches</option>
                    <option value="Movie Promotions">Movie Promotions</option>
                    <option value="Success Meets">Success Meets</option>
                    <option value="Celebrity Shows">Celebrity Shows</option>
                    <option value="Live Concerts">Live Concerts</option>
                    <option value="Musical Nights">Musical Nights</option>
                    <option value="Corporate Events">Corporate Events</option>
                    <option value="College Fests">College Fests</option>
                    <option value="Brand Activations">Brand Activations</option>
                    <option value="Wedding Entertainment">Wedding Entertainment</option>
                  </select>
                </div>

                {/* EXPECTED AUDIENCE SIZE */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                    EXPECTED AUDIENCE SIZE
                  </label>
                  <input
                    type="text"
                    value={quoteFormState.audienceSize}
                    onChange={(e) => setQuoteFormState(prev => ({ ...prev, audienceSize: e.target.value }))}
                    placeholder="e.g. 10,000 People"
                    className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all"
                  />
                </div>

                {/* TARGET CITY / VENUE */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                    TARGET CITY / VENUE
                  </label>
                  <input
                    type="text"
                    value={quoteFormState.targetCityVenue}
                    onChange={(e) => setQuoteFormState(prev => ({ ...prev, targetCityVenue: e.target.value }))}
                    placeholder="e.g. Gachibowli Stadium, Hyderabad"
                    className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all"
                  />
                </div>

                {/* TENTATIVE DATE */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                    TENTATIVE DATE
                  </label>
                  <input
                    type="text"
                    value={quoteFormState.tentativeDate}
                    onChange={(e) => setQuoteFormState(prev => ({ ...prev, tentativeDate: e.target.value }))}
                    placeholder="e.g. 20 September 2026"
                    className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all"
                  />
                </div>

                {/* CONTACT PHONE */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                    CONTACT PHONE <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={quoteFormState.contactPhone}
                    onChange={(e) => setQuoteFormState(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* CONTACT EMAIL */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                  CONTACT EMAIL <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={quoteFormState.contactEmail}
                  onChange={(e) => setQuoteFormState(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="events@company.com"
                  className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all font-mono"
                />
              </div>

              {/* SPECIFIC REQUIREMENTS / PRODUCTION NOTES */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-white/80 uppercase tracking-wider block">
                  SPECIFIC REQUIREMENTS / PRODUCTION NOTES
                </label>
                <textarea
                  rows={4}
                  value={quoteFormState.productionNotes}
                  onChange={(e) => setQuoteFormState(prev => ({ ...prev, productionNotes: e.target.value }))}
                  placeholder="Specify requirements for LED screens, stage dimensions, VIP celebrity security, fireworks, line array sound, or audio release setups..."
                  className="w-full bg-black/60 border border-white/15 focus:border-red-500 rounded-xl p-4 text-xs text-white placeholder:text-white/30 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-5 h-5 text-white" />
                <span>🚀 SUBMIT QUOTE REQUEST</span>
              </button>
            </form>
          )}
        </div>
      )}

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
                    if (!userEmail) {
                      onOpenAuth();
                    } else {
                      alert(`Pass booking for "${ticket.title}" initiated! Complete payment in your VIP dashboard.`);
                    }
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
                        onClick={() => setSelectedEvent(evt)}
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
                                <span>{downloadingPass ? "Downloading..." : "Download Pass"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleEmailPass}
                                disabled={emailingPass}
                                className="px-3 py-2.5 bg-blue-500/15 hover:bg-blue-500 text-white hover:text-black rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-blue-500/20 disabled:opacity-50 transition-all"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>{emailingPass ? "Sending Email..." : "Mail to Me"}</span>
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

      {/* GALLERY LIGHTBOX MODAL */}
      {galleryModalItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#0D0E13] border border-white/20 rounded-2xl overflow-hidden shadow-2xl space-y-4 text-left p-6">
            <button
              onClick={() => setGalleryModalItem(null)}
              className="absolute top-4 right-4 z-20 p-2.5 bg-black/80 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-[60vh] max-h-[500px] w-full rounded-xl overflow-hidden relative">
              <img
                src={galleryModalItem.image}
                alt={galleryModalItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-bold">{galleryModalItem.title}</h3>
                  <p className="text-xs text-amber-300 font-mono mt-0.5">{galleryModalItem.location}</p>
                </div>
                <button
                  onClick={() => {
                    setGalleryModalItem(null);
                    setQuoteFormState(prev => ({ ...prev, eventType: galleryModalItem.title }));
                    setEventShowcaseTab("quote");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:from-red-500 hover:to-rose-500 transition-all cursor-pointer shadow-lg"
                >
                  Book Stage Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
