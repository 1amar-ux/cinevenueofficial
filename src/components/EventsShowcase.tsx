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
import { getEvents as getTicketedEvents, getBookings as getEventBookings, isMockOrDuplicateEvent } from "../services/eventBookingService";
import EventBookingModal from "./events/EventBookingModal";
import DigitalTicketPassModal from "./events/DigitalTicketPassModal";
import LiveEventPassCard from "./events/LiveEventPassCard";
import OrganizerEventHub from "./events/OrganizerEventHub";
import CineVenueLiveBanner from "./advertising/CineVenueLiveBanner";
import EventShareModal from "./events/EventShareModal";
import { copyEventShareLink, getEventShareUrl } from "../utils/eventSharing";
import {
  TrendingExperienceItem,
  BrowseLiveCategoryItem,
  getTrendingExperiences,
  getBrowseLiveCategories,
} from "../services/eventHighlightsService";

interface EventsShowcaseProps {
  events: Event[];
  userEmail: string | null;
  onOpenAuth: () => void;
  selectedCity: string;
  setSelectedCity?: (city: string) => void;
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
  setSelectedCity,
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
  // Ticketed Events & Unified Booking State
  const [ticketedEventsList, setTicketedEventsList] = useState<EventItem[]>(() => getTicketedEvents());
  const [bookingModalEvent, setBookingModalEvent] = useState<EventItem | null>(null);
  const [viewingPass, setViewingPass] = useState<EventBookingRecord | null>(null);
  const [showOrganizerHub, setShowOrganizerHub] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All Categories");
  const [selectedEventTypeFilter, setSelectedEventTypeFilter] = useState<'ALL' | 'FREE' | 'PAID' | 'HYBRID'>('ALL');
  const [shareModalEvent, setShareModalEvent] = useState<any | null>(null);

  useEffect(() => {
    setTicketedEventsList(getTicketedEvents());
  }, [events]);

  // Real-time synchronization for events created, updated, or published
  useEffect(() => {
    const handleUpdate = () => {
      setTicketedEventsList(getTicketedEvents());
    };
    window.addEventListener("cine_events_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cine_events_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const safeEvents: Event[] = React.useMemo(() => {
    let deletedIds = new Set<string>();
    if (typeof window !== 'undefined') {
      try {
        const dRaw = localStorage.getItem('cv_deleted_event_ids');
        if (dRaw) deletedIds = new Set(JSON.parse(dRaw));
      } catch {}
    }

    const rawList: Event[] = [];

    // 1. First add events from props (authoritative from App)
    if (Array.isArray(events)) {
      for (const event of events) {
        if (!event || !event.id) continue;
        if (isMockOrDuplicateEvent(event) || deletedIds.has(event.id) || (event as any)._id && deletedIds.has((event as any)._id)) continue;

        rawList.push({
          ...event,
          categories: Array.isArray(event.categories) ? event.categories : [],
          reviews: Array.isArray(event.reviews) ? event.reviews : [],
          isActive: event.isActive !== false,
        });
      }
    }

    // 2. Merge canonical ticketed events (from admin creation & booking service)
    for (const t of ticketedEventsList) {
      if (!t || (!t.id && !(t as any)._id)) continue;
      const tid = t.id || (t as any)._id;
      if (isMockOrDuplicateEvent(t) || deletedIds.has(tid)) continue;

      const lowestPrice = t.ticketTypes && t.ticketTypes.length > 0
        ? Math.min(...t.ticketTypes.map((x: any) => Number(x.price) || 0))
        : (Number(t.price) || 0);

      const isEvtActive = t.isActive !== false && String(t.status || '').toUpperCase() !== 'CANCELLED' && String(t.status || '').toUpperCase() !== 'DRAFT';

      rawList.push({
        id: tid,
        title: t.title || '',
        description: t.description || '',
        venueName: t.venueName || (typeof t.venue === 'string' ? t.venue : t.venue?.name) || 'Convention Arena',
        venueAddress: t.venueAddress || t.venue?.address || '',
        city: t.city || 'Hyderabad',
        date: t.date || '2026-10-25',
        time: t.startTime || t.time || '18:30',
        image: t.bannerUrl || t.posterUrl || t.image || 'https://images.unsplash.com/photo-1540039155732-6762b51333fc?auto=format&fit=crop&q=80&w=800',
        category: t.category || 'Concerts',
        categories: Array.isArray(t.ticketTypes) && t.ticketTypes.length > 0
          ? t.ticketTypes.map((type: any) => ({
              name: type.name || 'Standard',
              price: Number(type.price) || 0,
              availableSeats: Number(type.availableQuantity ?? type.totalQuantity ?? 100),
            }))
          : (t.categories || [{ name: 'General Admission', price: lowestPrice, availableSeats: 100 }]),
        reviews: t.reviews || [],
        featured: true,
        isPaid: t.eventType === 'PAID' || lowestPrice > 0,
        isActive: isEvtActive,
      });
    }

    // 3. Strict Deduplication by ID AND by normalized title to prevent duplicate cards
    const result: Event[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    for (const item of rawList) {
      if (isMockOrDuplicateEvent(item)) continue;
      if (seenIds.has(item.id)) continue;
      const normTitle = (item.title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (normTitle && seenTitles.has(normTitle)) continue;

      seenIds.add(item.id);
      if (normTitle) seenTitles.add(normTitle);
      result.push(item);
    }

    return result;
  }, [events, ticketedEventsList]);

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

  const handleOpenBooking = (evt: Event) => {
    let matched = ticketedEventsList.find(e => e.id === evt.id || (e.title && evt.title && e.title.toLowerCase().trim() === evt.title.toLowerCase().trim()));

    const isFree = evt.isPaid === false || (matched as any)?.eventType === 'FREE' || (!matched && (!evt.categories || evt.categories.length === 0 || evt.categories.every(c => Number(c.price) === 0)));

    const categories = (matched?.ticketTypes && matched.ticketTypes.length > 0)
      ? matched.ticketTypes
      : (evt.categories && evt.categories.length > 0)
      ? evt.categories.map((c, idx) => ({
          id: `TKT-${evt.id}-${idx}`,
          eventId: evt.id,
          name: c.name,
          tier: (c.name.toUpperCase().includes('VIP') ? 'VIP' : c.name.toUpperCase().includes('PREMIUM') ? 'Premium' : 'General') as any,
          description: `${c.name} access pass.`,
          price: Number(c.price ?? 0),
          availableQuantity: Number(c.availableSeats ?? 100),
          soldQuantity: 0,
          maxPerUser: 6,
          minPerUser: 1,
          status: 'Active' as const,
          isRefundable: Number(c.price ?? 0) > 0,
        }))
      : [
          {
            id: `TKT-${evt.id}-DEFAULT`,
            eventId: evt.id,
            name: isFree ? 'Free Admission Pass' : 'General Admission Pass',
            tier: 'General' as const,
            description: isFree ? 'Complimentary RSVP pass with guaranteed entry & QR code.' : 'Standard event pass with full venue access.',
            price: isFree ? 0 : 499,
            availableQuantity: 200,
            soldQuantity: 0,
            maxPerUser: 6,
            minPerUser: 1,
            status: 'Active' as const,
            isRefundable: !isFree,
          }
        ];

    const normalized: EventItem = {
      id: matched?.id || evt.id,
      title: matched?.title || evt.title,
      slug: (matched?.slug || evt.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: matched?.description || evt.description || '',
      category: (matched?.category || evt.category || 'Film Events') as any,
      bannerUrl: matched?.bannerUrl || (matched as any)?.banner?.url || (matched as any)?.posterUrl || evt.image,
      organizer: matched?.organizer || {
        id: 'ORG-MAIN',
        name: 'CineVenue Events',
        email: 'events@cinevenue.in',
        isVerified: true,
      },
      date: matched?.date || evt.date || '2026-10-25',
      startTime: matched?.startTime || evt.time || '07:00 PM',
      venueName: matched?.venueName || (typeof (matched as any)?.venue === 'string' ? (matched as any).venue : (matched as any)?.venue?.name) || evt.venueName || 'Convention Arena',
      venueAddress: matched?.venueAddress || (matched as any)?.venue?.address || evt.venueAddress || '',
      city: matched?.city || (matched as any)?.venue?.city || evt.city || selectedCity,
      seatingType: matched?.seatingType === 'AssignedSeating' ? 'AssignedSeating' : 'GeneralAdmission',
      seatSections: matched?.seatSections,
      ticketTypes: categories as any,
      totalCapacity: matched?.totalCapacity || 500,
      soldCount: matched?.soldCount || 120,
      status: matched?.status || 'Published',
      createdAt: matched?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBookingModalEvent(normalized);
  };

  // Curated Genres & Dynamic Portal Feeds State
  const [selectedGenreFilter, setSelectedGenreFilter] = useState("All Genres");
  const [trendingExperiences, setTrendingExperiences] = useState<TrendingExperienceItem[]>(() => getTrendingExperiences());
  const [browseCategories, setBrowseCategories] = useState<BrowseLiveCategoryItem[]>(() => getBrowseLiveCategories());

  useEffect(() => {
    const handleTrendingUpdate = (e: any) => {
      if (e?.detail) {
        setTrendingExperiences(e.detail);
      } else {
        setTrendingExperiences(getTrendingExperiences());
      }
    };
    const handleCategoriesUpdate = (e: any) => {
      if (e?.detail) {
        setBrowseCategories(e.detail);
      } else {
        setBrowseCategories(getBrowseLiveCategories());
      }
    };
    window.addEventListener("cinevenue:trending_experiences_updated", handleTrendingUpdate);
    window.addEventListener("cinevenue:browse_categories_updated", handleCategoriesUpdate);
    const handleStorage = () => {
      setTrendingExperiences(getTrendingExperiences());
      setBrowseCategories(getBrowseLiveCategories());
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("cinevenue:trending_experiences_updated", handleTrendingUpdate);
      window.removeEventListener("cinevenue:browse_categories_updated", handleCategoriesUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

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
    if (userEmail && !userEmail.toLowerCase().includes("superadmin")) {
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
    const targetEvt = events.find((item) => item.id === eventId) ||
      (selectedEvent && selectedEvent.id === eventId ? selectedEvent : null) ||
      ticketedEventsList.find((item) => item.id === eventId);

    if (targetEvt) {
      setShareModalEvent(targetEvt);
      return;
    }

    // Direct fallback copy
    copyEventShareLink(eventId).then(() => {
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
    // Hide cancelled/draft events or if master event system is off
    const isEventActive = 
      evt.isActive !== false && 
      isEventBookingSystemActive && 
      String((evt as any).status || "").toUpperCase() !== "CANCELLED" && 
      String((evt as any).status || "").toUpperCase() !== "DRAFT";
    if (!isEventActive) {
      return false; // Inactive events should be hidden from customers
    }

    const matchesCity = 
      selectedCity === "All Cities" ||
      selectedCity === "All" ||
      !evt.city ||
      (evt.city || "").toLowerCase() === "all cities" ||
      (evt.city || "").toLowerCase() === "all" ||
      (evt.city || "").toLowerCase() === (selectedCity || "").toLowerCase();

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

    const ticketedMatch = ticketedEventsList.find(te => te.id === evt.id || te.title.toLowerCase() === evt.title.toLowerCase());
    const minPrice = evt.categories && evt.categories.length > 0 ? Math.min(...evt.categories.map(c => c.price)) : 0;
    const effectiveType = ticketedMatch?.eventType || (minPrice === 0 || evt.isPaid === false ? 'FREE' : 'PAID');
    const matchesEventType = selectedEventTypeFilter === 'ALL' || effectiveType === selectedEventTypeFilter;

    return matchesCity && matchesCategory && matchesGenre && matchesSearch && matchesEventType;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedCategory) return;
    if (!bookingName.trim() || !bookingEmail.trim() || !bookingMobileNumber.trim()) {
      alert("Please fill in your name, email, and mobile number to register.");
      return;
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const registrationId = `CV-EVT-2026-${randomSuffix}`;
    const isFree = selectedEvent.isPaid === false;
    const finalQuantity = isFree ? 1 : ticketQuantity;
    const finalPrice = isFree ? 0 : selectedCategory.price;
    const totalPrice = finalPrice * finalQuantity;
    const orderId = isFree ? `CV-FREE-2026-${randomSuffix}` : `CV-ORDER-2026-${randomSuffix}`;

    const newRegistration: EventRegistration = {
      id: registrationId,
      orderId,
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      venueName: selectedEvent.venueName,
      venueAddress: selectedEvent.venueAddress || `${selectedEvent.venueName}, ${selectedEvent.city || 'HITEC City, Hyderabad'}`,
      city: selectedEvent.city,
      bannerUrl: selectedEvent.imageUrl || selectedEvent.bannerUrl,
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
    <section id="exclusive-events" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/5 bg-transparent dark:bg-gradient-to-b dark:from-transparent dark:to-[#0A0A0B]/50 space-y-12">
      
      {/* VIP MEMBER ACCESS BAR (IF NOT LOGGED IN) */}
      {!userEmail && (
        <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#121216] dark:bg-gradient-to-r dark:from-[#D4AF37]/15 dark:via-[#D4AF37]/5 dark:to-[#121216] border border-[#D4AF37]/40 dark:border-[#D4AF37]/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#D4AF37]/15 dark:bg-[#D4AF37]/20 border border-[#D4AF37]/30 dark:border-[#D4AF37]/40 text-[#D4AF37]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-gray-950 dark:text-white uppercase tracking-wider">CineVenue VIP Member Access</h5>
              <p className="text-xs text-gray-600 dark:text-white/80">Sign in to unlock priority seat allocations, VIP passes & instant ticket confirmation across all sub-websites.</p>
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

          <h2 className="font-display text-4xl md:text-5xl font-light tracking-tight text-gray-950 dark:text-text-primary italic">
            Event <span className="text-gold not-italic font-normal">Booking</span>
          </h2>
          <p className="text-xs text-gray-600 dark:text-text-muted mt-2 max-w-xl">
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
            className="w-full bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/20 focus:border-gold dark:focus:border-gold/50 rounded-lg pl-4 pr-10 py-2.5 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none transition-all duration-200 shadow-xs"
            id="event-search-input"
          />
          <Plus className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-text-muted w-4 h-4 rotate-45 pointer-events-none" />
        </div>
      </div>

      {/* LIVE BANNER ADVERTISEMENT PLACEMENT: EVENTS TOP */}
      <div className="w-full mb-6">
        <CineVenueLiveBanner placement="events_top" />
      </div>

       {/* EVENT BOOKING CATEGORIES & QUICK ACTIONS BAR (INTENTIONALLY DARK BRANDED IN BOTH THEMES) */}
      <div className="bg-[#0B0C10] border border-white/15 rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl text-left">
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
                  : "bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 hover:text-white"
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
            className="px-4 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-200 border border-purple-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Organizer Hub & Gate Terminal</span>
          </button>
        </div>
      </div>


      {/* CURATED GENRES & CATEGORIES FILTER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-white/5 text-left">
        <div className="space-y-1">
          <h4 className="font-display text-xl font-light text-gray-950 dark:text-white italic">
            Curated <span className="text-[#D4AF37] not-italic font-normal">Genres</span>
          </h4>
          <p className="text-xs text-gray-600 dark:text-white/50 font-light">
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
                  : "bg-white dark:bg-white/5 text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/10 border-gray-200 dark:border-white/5 shadow-xs"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* EVENT TICKET PASS TYPES FILTER & ACTIVE INVENTORY */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 text-left shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-700 dark:text-white/60 uppercase font-mono tracking-wider flex items-center gap-1.5 mr-2">
            <Ticket className="w-4 h-4 text-gold" /> Filter By Pass Type:
          </span>
          {(['ALL', 'FREE', 'PAID', 'HYBRID'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedEventTypeFilter(type)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                selectedEventTypeFilter === type
                  ? type === 'FREE'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : type === 'HYBRID'
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/40 shadow-sm'
                    : type === 'PAID'
                    ? 'bg-gold/20 text-gold-dim dark:text-gold border border-gold/40 shadow-sm'
                    : 'bg-gray-950 text-white dark:bg-white/20 dark:text-white border border-gray-950 dark:border-white/30 shadow-sm'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 hover:text-gray-950 dark:hover:text-white border border-gray-200 dark:border-white/5'
              }`}
            >
              {type === 'ALL' ? 'All Tiers' : `${type} Passes`}
            </button>
          ))}
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-gray-500 dark:text-white/40 uppercase">
            {filteredEvents.length} Active {filteredEvents.length === 1 ? 'Event' : 'Events'} Available
          </span>
        </div>
      </div>

      {/* EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 rounded-2xl max-w-xl mx-auto backdrop-blur-sm shadow-sm" id="empty-events-state">
          <Calendar className="w-10 h-10 text-text-muted mx-auto mb-4 opacity-40" />
          <p className="text-text-secondary font-medium mb-1">No upcoming events listed in {selectedCity}.</p>
          <p className="text-text-muted text-xs">Switch your city selection or clear the search filter to explore others.</p>
          {selectedCity !== "All Cities" && setSelectedCity && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setSelectedCity("All Cities")}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <span>View Events in All Cities</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="events-showroom-grid">
          {filteredEvents.map((evt) => {
            const ticketedEvt = ticketedEventsList.find(te => te.id === evt.id || te.title.toLowerCase() === evt.title.toLowerCase());
            const minPrice = Math.min(...(evt.categories || []).map(c => c.price));
            const isFreeEvent = ticketedEvt?.eventType === 'FREE' || evt.isPaid === false || minPrice === 0;
            const isHybridEvent = ticketedEvt?.eventType === 'HYBRID';
            const reviews = evt.reviews || [];
            const avgRating = reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : null;

            return (
              <div
                key={evt.id}
                id={`event-card-${evt.id}`}
                className="group bg-white dark:bg-[#0D0D0F] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden hover:border-gold/50 hover:shadow-xl dark:hover:shadow-gold/5 -translate-y-0 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full text-left shadow-sm"
              >
                {/* Image & Badges */}
                <div 
                  onClick={() => {
                    if (evt.comingSoon) setSelectedEvent(evt);
                    else handleOpenBooking(evt);
                  }}
                  className="relative aspect-[16/10] overflow-hidden bg-dark-card/40 cursor-pointer"
                >
                  <img
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badges & Status */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                    <span className="bg-black/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded text-[9px] font-bold text-gold uppercase tracking-wider">
                      {evt.city}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-wider font-mono shadow-md backdrop-blur-md border ${
                      isFreeEvent
                        ? 'bg-emerald-500/90 text-white border-emerald-400'
                        : isHybridEvent
                        ? 'bg-purple-600/90 text-white border-purple-400'
                        : 'bg-black/80 text-gold border-gold/40'
                    }`}>
                      {isFreeEvent ? 'FREE PASS' : isHybridEvent ? 'HYBRID ACCESS' : 'VIP TICKET'}
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
                    <h3 
                      onClick={() => {
                        if (evt.comingSoon) setSelectedEvent(evt);
                        else handleOpenBooking(evt);
                      }}
                      className="font-display text-xl text-gray-950 dark:text-text-primary tracking-wide group-hover:text-gold transition-colors duration-200 cursor-pointer"
                    >
                      {evt.title}
                    </h3>
                    <p className="text-gray-600 dark:text-text-secondary text-xs line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-gray-150 dark:border-white/5 flex items-center justify-between">
                    <div>
                      {evt.comingSoon ? (
                        <div>
                          <span className="text-[9px] text-amber-500 dark:text-amber-400 uppercase tracking-wider block font-semibold font-mono">PRE-REGISTRATION</span>
                          <span className="text-xs font-display font-medium text-amber-600 dark:text-amber-300">
                            Pre-Notify Active
                          </span>
                        </div>
                      ) : isFreeEvent ? (
                        <div>
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-semibold font-mono">100% FREE ADMISSION</span>
                          <span className="text-base font-display font-bold text-emerald-600 dark:text-emerald-400">
                            ₹0 <span className="text-xs text-gray-500 dark:text-text-secondary font-normal">Free RSVP</span>
                          </span>
                        </div>
                      ) : isHybridEvent ? (
                        <div>
                          <span className="text-[9px] text-purple-600 dark:text-purple-400 uppercase tracking-wider block font-semibold font-mono">HYBRID (FREE & VIP)</span>
                          <span className="text-base font-display font-medium text-gray-950 dark:text-text-primary">
                            ₹0 onwards
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[9px] text-gray-500 dark:text-text-muted uppercase tracking-wider block font-mono">PASSES START AT</span>
                          <span className="text-base font-display font-medium text-gray-950 dark:text-text-primary">
                            ₹{minPrice} <span className="text-xs text-gray-500 dark:text-text-secondary">onwards</span>
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 relative">
                      <button
                        type="button"
                        onClick={(e) => handleShareEvent(e, evt.id)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-text-primary hover:text-gold dark:hover:text-gold hover:border-gold/30 rounded-lg transition-all cursor-pointer flex items-center justify-center relative"
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
                            ? "bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-black border border-amber-500/20"
                            : (evt.isActive === false || !isEventBookingSystemActive)
                            ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            : isFreeEvent
                            ? "bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400 font-extrabold shadow-md shadow-emerald-500/20"
                            : "bg-gray-100 hover:bg-gold dark:bg-white/5 dark:hover:bg-gold border border-gray-200 dark:border-white/10 hover:border-gold text-gray-900 dark:text-text-primary hover:text-black dark:hover:text-black"
                        }`}
                      >
                        <span>
                          {evt.comingSoon 
                            ? "Notify Me" 
                            : (evt.isActive === false || !isEventBookingSystemActive) 
                            ? "Booking OFF" 
                            : isFreeEvent
                            ? "Register Free"
                            : isHybridEvent
                            ? "Select Passes"
                            : "Get VIP Pass"}
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

      {/* TRENDING EXPERIENCES, BROWSE CATEGORIES & REGIONAL UPDATES (AI AGENT MOVED TO HOMEPAGE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 border-t border-gray-200 dark:border-white/5 text-left">
        {/* COLUMN 1: TRENDING LIVE EXPERIENCES (ADMIN CONTROLLED) */}
        <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#D4AF37]" /> Trending Live Experiences
            </h5>
            <p className="text-xs text-gray-600 dark:text-white/70 font-light leading-relaxed">
              Ticket demand is currently surging across regional portals. Live feed of active pass bookings over the last 15 minutes.
            </p>
            <div className="space-y-2.5 pt-1">
              {trendingExperiences.filter(item => item.active !== false).map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/5 space-y-1 hover:border-[#D4AF37]/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{item.title}</span>
                    <span className="text-[9px] font-mono text-[#D4AF37] font-semibold">{item.dynamicStat}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-white/50">{item.location}</p>
                </div>
              ))}
              {trendingExperiences.filter(item => item.active !== false).length === 0 && (
                <p className="text-xs text-gray-400 py-4 text-center">No active trending experiences right now.</p>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-150 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real-time portal feed
            </span>
            <span className="font-mono text-[#D4AF37]">Updated every 60s</span>
          </div>
        </div>

        {/* COLUMN 2: BROWSE LIVE CATEGORIES (ADMIN CONTROLLED) */}
        <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Sparkle className="w-4 h-4 text-[#D4AF37]" /> Browse Live Categories
            </h5>
            <p className="text-xs text-gray-600 dark:text-white/70 font-light leading-relaxed">
              Filter and browse high-society event passes based on premium regional categories:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {browseCategories.filter(cat => cat.active !== false).map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.filterTag || cat.name)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    selectedCategoryFilter === (cat.filterTag || cat.name)
                      ? "bg-amber-100/70 dark:bg-[#D4AF37]/20 border-[#D4AF37]"
                      : "bg-gray-50 hover:bg-amber-50/50 dark:bg-white/[0.04] dark:hover:bg-[#D4AF37]/10 border-gray-200 dark:border-white/5 hover:border-[#D4AF37]/30"
                  }`}
                >
                  <span className="text-xs font-medium text-gray-800 dark:text-white/90">{cat.name}</span>
                  <span className="text-[9px] font-mono text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/10 font-bold">{cat.count}</span>
                </div>
              ))}
              {browseCategories.filter(cat => cat.active !== false).length === 0 && (
                <p className="col-span-2 text-xs text-gray-400 py-4 text-center">No categories configured.</p>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-150 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400">
            <span>Click any category to filter</span>
            {selectedCategoryFilter !== "All Categories" && (
              <button
                onClick={() => setSelectedCategoryFilter("All Categories")}
                className="text-[#D4AF37] hover:underline font-semibold cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* COLUMN 3: LIVE REGIONAL BULLETINS & UPDATES */}
        <div className="bg-white dark:bg-[#121216] border border-gray-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-gray-950 dark:text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#D4AF37]" /> Live Regional Updates
            </h5>
            <p className="text-xs text-gray-600 dark:text-white/70 font-light leading-relaxed">
              Official transit advisories, VIP lounge entries, and police clearances across Vijayawada, Guntur, and Hyderabad:
            </p>
            <div className="space-y-2.5 font-mono text-[10px] text-gray-700 dark:text-white/80 leading-relaxed uppercase pt-1">
              <div className="flex items-start gap-2 border-b border-gray-150 dark:border-white/5 pb-2.5">
                <span className="text-rose-400 shrink-0">●</span>
                <p>HYDERABAD METRO EXTRA LATE TRAIN RUNS FOR SUNBURN ARENA ON OCT 12TH.</p>
              </div>
              <div className="flex items-start gap-2 border-b border-gray-150 dark:border-white/5 pb-2.5">
                <span className="text-[#D4AF37] shrink-0">●</span>
                <p>GUNTUR POLICE GRANTS SINGLE-WINDOW CLEARANCE FOR MIDNIGHT OPEN-AIR ACOUSTIC NIGHT.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">●</span>
                <p>PRASADS IMAX ANNOUNCES PRE-RELEASE CELEBRITY VIP LOUNGE ACCESS SLOTS.</p>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-150 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ground dispatch verified
            </span>
            <span className="text-[#D4AF37] font-semibold">City Control Active</span>
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
              className="bg-white dark:bg-[#0D0D10] border border-gray-200 dark:border-white/10 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl text-left my-8"
              id="event-detail-modal"
            >
              {/* Header Cover Banner */}
              <div className="relative aspect-[21/9] md:aspect-[24/8] overflow-hidden bg-dark-card/20">
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                {/* Share Event Button */}
                <button
                  type="button"
                  onClick={(e) => handleShareEvent(e, selectedEvent.id)}
                  className="absolute top-4 right-14 p-2 bg-black/60 hover:bg-gold hover:text-black text-white rounded-full transition-all border border-white/10 cursor-pointer relative"
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
                  className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 hover:bg-gold hover:text-black text-white text-xs font-semibold rounded-lg transition-all border border-white/10 cursor-pointer flex items-center gap-1.5 z-10"
                  id="back-to-events-modal-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Events</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-gold hover:text-black text-white rounded-full transition-all border border-white/10 cursor-pointer"
                  id="close-event-modal-btn"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Banner Content */}
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] block mb-1">
                    EXCLUSIVE EXPERIENCE • {selectedEvent.city}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-wide">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              {/* Layout Content */}
              <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-white/5">
                
                {/* LEFT: INFO & LOGISTICS (3 Cols) */}
                <div className="lg:col-span-3 p-6 md:p-8 space-y-6">
                  
                  {/* METADATA CHIPS */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <span className="text-[9px] text-gray-500 dark:text-text-muted block font-semibold uppercase">DATE</span>
                        <span className="text-xs text-gray-900 dark:text-text-primary font-medium">
                          {new Date(selectedEvent.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <span className="text-[9px] text-gray-500 dark:text-text-muted block font-semibold uppercase">TIMING</span>
                        <span className="text-xs text-gray-900 dark:text-text-primary font-medium">{selectedEvent.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                      <MapPin className="w-5 h-5 text-gold shrink-0" />
                      <div>
                        <span className="text-[9px] text-gray-500 dark:text-text-muted block font-semibold uppercase">VENUE</span>
                        <span className="text-xs text-gray-900 dark:text-text-primary font-medium truncate max-w-[150px] block">{selectedEvent.venueName}</span>
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold">About the Event</h4>
                    <p className="text-gray-600 dark:text-text-secondary text-xs leading-relaxed font-sans text-justify">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* VENUE FULL ADDRESS */}
                  <div className="space-y-1.5 bg-gray-50 dark:bg-white/[0.01] p-4 rounded-xl border border-gray-200 dark:border-white/5 text-xs text-gray-600 dark:text-text-secondary">
                    <div className="flex items-center gap-2 text-gold font-semibold text-[10px] uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-gold" />
                      <span>Venue Details & Access Coordinates</span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-text-primary text-xs">{selectedEvent.venueName}</p>
                    <p className="text-[11px] text-gray-500 dark:text-text-muted font-sans leading-normal">{selectedEvent.venueAddress}</p>
                  </div>

                  {/* REVIEW RATING TOTAL & TABS */}
                  <div className="pt-2 border-t border-gray-200 dark:border-white/5">
                    <div className="flex gap-4 border-b border-gray-200 dark:border-white/5 pb-2">
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
                        <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-4 rounded-xl space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gold block">
                            ✍️ Submit Your Verified Review
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1 text-left">
                              <label className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase">Your Name</label>
                              <input
                                type="text"
                                value={reviewName}
                                onChange={(e) => setReviewName(e.target.value)}
                                placeholder="Enter name"
                                className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-text-primary focus:outline-none focus:border-gold"
                                required
                              />
                            </div>
                            <div className="space-y-1 text-left">
                              <label className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase">Email Address</label>
                              <input
                                type="email"
                                value={reviewEmail}
                                onChange={(e) => setReviewEmail(e.target.value)}
                                placeholder="Enter email"
                                className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-text-primary focus:outline-none focus:border-gold"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase">Rating:</span>
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
                            <label className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase">Review Description</label>
                            <textarea
                              rows={2}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Share your thoughts or booking experience of this luxury event..."
                              className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted/65 focus:outline-none focus:border-gold"
                              required
                            />
                          </div>

                          {reviewFeedback && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{reviewFeedback}</p>
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
                          <div className="text-center py-6 text-gray-500 dark:text-text-muted text-xs font-sans">
                            No reviews have been posted for this event yet. Be the first to share your anticipation!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(selectedEvent.reviews || []).map((rev) => (
                              <div key={rev.id} className="bg-gray-50 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 p-3 rounded-xl space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-semibold">
                                  <span className="text-gray-900 dark:text-text-primary">{rev.userName}</span>
                                  <span className="text-[9px] text-gray-500 dark:text-text-muted">{rev.date}</span>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "text-amber-400 fill-amber-400" : "text-text-muted/40"}`} />
                                  ))}
                                </div>
                                <p className="text-gray-600 dark:text-text-secondary text-xs leading-normal font-sans">{rev.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BOOKING TAB REGISTRATION ACCESS */}
                    {activeModalTab === "booking" && !bookingPass && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl text-xs space-y-2">
                        <div className="flex items-center gap-1 text-gold font-semibold uppercase tracking-wider text-[10px]">
                          <Shield className="w-4 h-4 text-gold" />
                          <span>Secure Registration Pass Access</span>
                        </div>
                        <p className="text-gray-600 dark:text-text-secondary leading-relaxed font-sans text-[11px]">
                          Registration for this event is secured via live digital pass passes. Select your desired pricing tier on the right pane, fill in credentials, and instantly retrieve your Cinema Venue Entry ticket.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: TICKET PRICING & TRANSACTION GATEWAY (2 Cols) */}
                <div className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-between h-full bg-gray-50/70 dark:bg-[#0F0F13]/40">
                  {selectedEvent.comingSoon ? (
                    notifySuccess ? (
                      <div className="space-y-5 animate-fade-in text-center py-10" id="notify-success-container">
                        <CheckCircle2 className="w-12 h-12 text-amber-500 dark:text-amber-400 mx-auto animate-bounce" />
                        <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-widest block font-mono">NOTIFY ME CONFIGURED</span>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-text-primary">Pre-registration Secured!</h4>
                        <div className="p-4 bg-white dark:bg-[#14141A] border border-amber-500/20 rounded-xl text-left text-xs text-gray-600 dark:text-text-secondary leading-relaxed font-sans space-y-2 shadow-xs">
                          <p className="text-[11px] leading-relaxed">{notifySuccess}</p>
                          <p className="text-[10px] text-gray-500 dark:text-text-muted italic">Our system has logged your priority alert. You will be notified instantly once the ticket sales counter goes live.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedEvent(null)}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded text-xs font-bold uppercase tracking-wider cursor-pointer font-sans border-0 shadow-sm"
                        >
                          Close Panel
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 flex flex-col justify-between h-full text-left">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400 border-b border-gray-200 dark:border-white/5 pb-2 flex items-center gap-1.5 font-mono">
                            <Sparkles className="w-3.5 h-3.5" />
                            Pre-Notification Alerts Active
                          </h4>
                          <p className="text-gray-600 dark:text-text-secondary text-[11px] leading-relaxed font-sans">
                            Official ticket bookings for <strong>{selectedEvent.title}</strong> are currently locked but slated to open soon. Pre-register your contact details to unlock immediate alerts as soon as seat allocation commences.
                          </p>

                          <form onSubmit={handleNotifyMeSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase">Full Name</label>
                              <input
                                type="text"
                                value={notifyName}
                                onChange={(e) => setNotifyName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:border-amber-400"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase">Email Address</label>
                              <input
                                type="email"
                                value={notifyEmail}
                                onChange={(e) => setNotifyEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:border-amber-400"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 dark:text-text-muted uppercase">Mobile Number (SMS Alerts)</label>
                              <input
                                type="tel"
                                value={notifyMobile}
                                onChange={(e) => setNotifyMobile(e.target.value)}
                                placeholder="e.g. 9876543210 (Optional)"
                                className="w-full bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted focus:outline-none focus:border-amber-400 font-mono"
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

                      {/* LIVE PASS DESIGN MATCHING ADMIN PANEL PREVIEW */}
                      {bookingPass.status !== "Pending" ? (
                        <div className="flex justify-center w-full">
                          <LiveEventPassCard
                            pass={bookingPass}
                            event={selectedEvent || undefined}
                            showActions={true}
                            onClose={() => {
                              setSelectedEvent(null);
                              setBookingPass(null);
                            }}
                          />
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

                          <button
                            onClick={() => {
                              setSelectedEvent(null);
                              setBookingPass(null);
                            }}
                            className="w-full px-3 py-3 bg-gold hover:bg-gold-light text-black rounded text-xs font-bold uppercase tracking-wider cursor-pointer border-0 mt-4"
                            id="btn-close-pass-modal"
                          >
                            Return to Lobby
                          </button>
                        </div>
                      )}
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
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold border-b border-gray-200 dark:border-white/5 pb-2">
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
                                  : "bg-gray-50 dark:bg-white/[0.01] border-gray-200 dark:border-white/5 hover:border-gold/40 dark:hover:border-white/15"
                              }`}
                              id={`tier-select-btn-${idx}`}
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-gray-900 dark:text-text-primary block">{cat.name}</span>
                                <span className="text-[9px] text-gray-500 dark:text-text-secondary block">
                                  {cat.availableSeats > 0 ? `🟢 ${cat.availableSeats} passes left` : "🔴 Sold Out"}
                                </span>
                              </div>
                              <div className="text-right">
                                {selectedEvent.isPaid === false ? (
                                  <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 block uppercase font-sans">FREE ENTRY</span>
                                ) : (
                                  <>
                                    <span className="text-xs font-mono text-gold font-bold block">₹{cat.price}</span>
                                    <span className="text-[8px] text-gray-500 dark:text-text-muted block">per pass</span>
                                  </>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* QUANTITY AND CONFIRM DETAILS */}
                      {selectedCategory && (
                        <form onSubmit={handleBookingSubmit} className="space-y-4 pt-4 border-t border-gray-200 dark:border-white/5">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-gold">
                            2. Enter Registrant Credentials
                          </h4>

                          {/* Credentials Inputs */}
                          <div className="space-y-3 text-left">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-600 dark:text-text-muted uppercase">Your Full Name</label>
                              <input
                                type="text"
                                value={bookingName}
                                onChange={(e) => setBookingName(e.target.value)}
                                placeholder="e.g. Rohini Deshmukh"
                                className="w-full bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-600 dark:text-text-muted uppercase">Email Address</label>
                              <input
                                type="email"
                                value={bookingEmail}
                                onChange={(e) => setBookingEmail(e.target.value)}
                                placeholder="e.g. rohini@outlook.com"
                                className="w-full bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted/50 focus:outline-none focus:border-gold"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-600 dark:text-text-muted uppercase">Mobile Number</label>
                              <input
                                type="tel"
                                value={bookingMobileNumber}
                                onChange={(e) => setBookingMobileNumber(e.target.value)}
                                placeholder="e.g. 9876543210"
                                className="w-full bg-white dark:bg-white/[0.02] border border-gray-300 dark:border-white/10 rounded px-3 py-2 text-xs text-gray-900 dark:text-text-primary placeholder:text-gray-400 dark:placeholder:text-text-muted/50 focus:outline-none focus:border-gold font-mono"
                                required
                              />
                            </div>

                            {/* Ticket Quantity Selector */}
                            {selectedEvent.isPaid !== false && (
                              <div className="flex items-center justify-between bg-gray-50 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 p-2 rounded-lg">
                                <span className="text-[10px] font-bold text-gray-700 dark:text-text-secondary uppercase font-mono">Quantity Passes</span>
                                <div className="flex items-center gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                    className="w-6 h-6 rounded bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 flex items-center justify-center text-xs text-gray-800 dark:text-text-primary cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs font-bold text-gray-900 dark:text-text-primary w-4 text-center font-mono">{ticketQuantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setTicketQuantity(Math.min(selectedCategory.availableSeats, ticketQuantity + 1))}
                                    className="w-6 h-6 rounded bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 flex items-center justify-center text-xs text-gray-800 dark:text-text-primary cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* GRAND TOTAL PRICING & PAYMENT */}
                          <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-3 rounded-lg flex justify-between items-center text-xs">
                            <span className="text-gray-600 dark:text-text-secondary font-medium">Billed Price:</span>
                            {selectedEvent.isPaid === false ? (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
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

      {/* Share Event Modal */}
      {shareModalEvent && (
        <EventShareModal
          isOpen={!!shareModalEvent}
          onClose={() => setShareModalEvent(null)}
          event={{
            id: shareModalEvent.id,
            title: shareModalEvent.title,
            venueName: shareModalEvent.venueName,
            city: shareModalEvent.city,
            date: shareModalEvent.date,
            description: shareModalEvent.description,
          }}
        />
      )}
    </section>
  );
}
