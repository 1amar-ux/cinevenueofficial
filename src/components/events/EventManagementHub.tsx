import React, { useState, useEffect } from "react";
import { 
  Sparkles, Calendar, MapPin, Users, Ticket, ArrowRight, CheckCircle2, 
  Send, Clock, Star, Play, Eye, Share2, HelpCircle, ChevronDown, ChevronUp,
  Clapperboard, Music, Video, Camera, Award, ShieldCheck, DollarSign,
  Building, GraduationCap, PartyPopper, Mic, Layers, Lightbulb, Megaphone,
  Handshake, UserCheck, FileText, X, Check, Search, Plus, MessageSquare, 
  ExternalLink, Phone, Mail, User, CheckCircle, AlertCircle, RefreshCw,
  Sliders, Shield, Zap, Info, Radio, Disc, Sparkle, MessageCircle, Bot, UserCheck2
} from "lucide-react";
import { EventMessage } from "../../types/productions";
import { getEventRequests, postEventMessage, submitEventRequest } from "../../services/eventService";
import EventServicePricingManager, { ICON_OPTIONS } from "./EventServicePricingManager";
import { getEventServices, EventServiceItem } from "../../services/eventPricingService";

export type EventStatus = 
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUOTE_SENT"
  | "QUOTE_APPROVED"
  | "ADVANCE_PAYMENT"
  | "PLANNING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface EventRequestRecord {
  requestId: string;
  customerId: string;
  eventCategory: string;
  eventName: string;
  eventDescription?: string;
  expectedAudience: number;
  eventDate: string;
  eventTime?: string;
  venue: string;
  location: string;
  budget: number;
  requiredServices: string[];
  specialRequirements?: string;
  status: EventStatus;
  quoteAmount?: number;
  assignedEventManager?: string | null;
  assignedVendors?: string[];
  createdAt: string;
  updatedAt?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientCompany?: string;
  messages?: EventMessage[];
  updates?: { date: string; title: string; note: string; author: string }[];
}

export interface VendorRecord {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  serviceCategory: string;
  servicesOffered: string[];
  rating: number;
  reviewCount: number;
  location: string;
  priceRange: string;
  description: string;
  verified: boolean;
  portfolioImages: string[];
  joinedAt?: string;
}

export interface QuoteRecord {
  id: string;
  requestId: string;
  customerId: string;
  quoteAmount: number;
  breakdown?: Record<string, number>;
  validUntil?: string;
  status: "SENT" | "APPROVED" | "REJECTED" | "EXPIRED";
  notes?: string;
  createdDate: string;
}

// 11 Master Categories
export const EVENT_CATEGORIES = [
  {
    name: "Movie Promotions",
    icon: Clapperboard,
    tagline: "Film teasers, press meets, mall visits & city tours",
    description: "High-voltage publicity tours, press conferences, media interviews, and interactive mall tours designed to generate massive organic pre-release buzz.",
    typicalAudience: "500 - 5,000+",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80"
  },
  {
    name: "Pre-Release Events",
    icon: Sparkles,
    tagline: "Stadium-scale mega pre-release celebrations",
    description: "Grand stadium & arena spectacles with high-end LED sets, celebrity VIP zones, drone light shows, and nationwide satellite/YouTube live telecasting.",
    typicalAudience: "10,000 - 50,000+",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"
  },
  {
    name: "Audio Launches",
    icon: Music,
    tagline: "Musical unveilings & soundtrack release galas",
    description: "Star-studded musical nights with live composer performances, orchestral playback sets, lyrical video projections, and audio CD/digital streaming launch.",
    typicalAudience: "3,000 - 15,000+",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
  },
  {
    name: "Celebrity Shows",
    icon: Star,
    tagline: "Exclusive star nights, fan meets & galas",
    description: "Intimate and grand fan interactions, actor felicitation nights, and celebrity talent showcases with dedicated VIP hospitality and tight security.",
    typicalAudience: "1,000 - 10,000",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80"
  },
  {
    name: "Live Concerts",
    icon: Mic,
    tagline: "Stadium EDM, rock, and fusion concerts",
    description: "Massive outdoor line-array sound systems, moving beam lasers, pyrotechnics, mojo barricading, and multi-tier ticketing for top national/international touring artists.",
    typicalAudience: "5,000 - 30,000+",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80"
  },
  {
    name: "Corporate Events",
    icon: Building,
    tagline: "Annual galas, summits, award banquets & keynotes",
    description: "Polished corporate stage design, keynote presentation switchers, live translation, VIP banquet catering, and flawless executive stage management.",
    typicalAudience: "200 - 3,000",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80"
  },
  {
    name: "Musical Nights",
    icon: Disc,
    tagline: "Sufi, Bollywood & unplugged acoustic concerts",
    description: "Soulful acoustic evenings, regional folk nights, and multi-singer symphonies with warm studio lighting and pristine acoustic sound calibration.",
    typicalAudience: "500 - 5,000",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80"
  },
  {
    name: "College Events",
    icon: GraduationCap,
    tagline: "Campus cultural fests, battle of bands & pro-shows",
    description: "High-energy university cultural fests featuring top Bollywood/South playback singers, DJ pro-nights, youth branding activations, and safe student crowd control.",
    typicalAudience: "2,000 - 15,000",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80"
  },
  {
    name: "Award Functions",
    icon: Award,
    tagline: "Prestigious red carpet cinema & industry awards",
    description: "Glamorous red carpet step-and-repeat media walls, multi-camera live telecast broadcast trucks, custom trophy presentations, and celebrity dance medleys.",
    typicalAudience: "1,500 - 8,000",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"
  },
  {
    name: "Brand Promotions",
    icon: Megaphone,
    tagline: "Product launches, brand activations & pop-ups",
    description: "Immersive brand experiential zones, interactive 3D mapping, influencer meet-and-greets, product reveal hydraulics, and high-conversion customer engagement.",
    typicalAudience: "300 - 10,000",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80"
  },
  {
    name: "Private Events",
    icon: PartyPopper,
    tagline: "Luxury weddings, VIP birthdays & bespoke soirees",
    description: "Ultra-exclusive private celebrations, destination wedding entertainment, customized themed stage decor, and private celebrity performances.",
    typicalAudience: "100 - 1,500",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80"
  }
];

// 13 Master Services
export const EVENT_SERVICES = [
  {
    name: "LED Walls",
    icon: Video,
    shortDesc: "P2.5 / P3 4K HDR curved & flat screens",
    details: "High-brightness indoor & outdoor LED video walls with NovaStar 4K video processors, multi-screen matrix, and custom motion graphics support.",
  },
  {
    name: "Sound",
    icon: Music,
    shortDesc: "d&b audiotechnik & JBL VTX Line Arrays",
    details: "Concert-grade line-array sound systems, digital mixing consoles (Digico / Yamaha CL5), wireless Shure Axient mics, and pristine in-ear monitor setups.",
  },
  {
    name: "Lighting",
    icon: Lightbulb,
    shortDesc: "Sharpy Beams, Washes, Strobes & Lasers",
    details: "Intelligent moving head lights, LED wash bars, blinder matrix, 30W RGB full-color laser projectors, and grandMA3 light programming.",
  },
  {
    name: "Stage & Truss",
    icon: Layers,
    shortDesc: "Heavy-Duty Aluminum Box Truss & Riser Decks",
    details: "Engineered box trusses, goal posts, custom curved roof trusses, hydraulic lift stages, and carpeted modular performance platforms.",
  },
  {
    name: "Generators",
    icon: Zap,
    shortDesc: "Silent DG Synchronized Backup Sets (125kVA-500kVA)",
    details: "Zero-fail acoustic DG generator sets with automatic changeover switches and dedicated diesel fuel management for non-stop event power.",
  },
  {
    name: "Photography",
    icon: Camera,
    shortDesc: "Prime Lens Stage, VIP Red Carpet & Candid",
    details: "Sony FX/Alpha full-frame master photographers, real-time cloud image sync, instant red-carpet photo printing booth, and high-res retouching.",
  },
  {
    name: "Videography",
    icon: FilmIcon,
    shortDesc: "4K Multi-Cam Switcher, Jimmy Jib & 4K Drones",
    details: "8-camera 4K live broadcast OB truck, 40ft motorized Jimmy Jib, licensed DJI cinema drone pilots, and same-day teaser edit delivery.",
  },
  {
    name: "Decoration",
    icon: Sparkles,
    shortDesc: "Themed Stage Backdrops & VIP Lounge Styling",
    details: "Custom fabricated 3D stage sets, floral arches, entrance tunnels, ambient fairy light ceiling canopies, and luxury red-carpet step-and-repeat walls.",
  },
  {
    name: "Security",
    icon: ShieldCheck,
    shortDesc: "VIP Bodyguards, Bouncers & Mojo Barricades",
    details: "Ex-military trained executive protection officers, 100+ bouncers, walk-through metal detectors, hand-held scanners, and crowd flow control.",
  },
  {
    name: "Catering",
    icon: Utensils,
    shortDesc: "Multi-Cuisine VIP Banquets & Live Counters",
    details: "Five-star multi-cuisine catering, celebrity green-room snack platters, mocktail bars, live gourmet counters, and certified hygiene staff.",
  },
  {
    name: "Anchors",
    icon: Mic,
    shortDesc: "Top TV Emcees & Bilingual Event Hosts",
    details: "Engaging TV anchors, celebrity film hosts, bilingual crowd mobilizers, and protocol managers with flawless script delivery in English, Hindi & Telugu.",
  },
  {
    name: "DJs",
    icon: Disc,
    shortDesc: "Top Bollywood & EDM Festival DJs",
    details: "Club-topping headline DJs with Pioneer CDJ-3000 setups, exclusive Bollywood/Tollywood festival bootlegs, and live percussive sync.",
  },
  {
    name: "Artists",
    icon: UserCheck,
    shortDesc: "Playback Singers, Live Bands & Celebrity Dancers",
    details: "Direct booking for renowned film playback singers, 6-piece instrumental fusion bands, celebrity dance troupes, and standup comics.",
  }
];

function FilmIcon(props: any) {
  return <Clapperboard {...props} />;
}

function Utensils(props: any) {
  return <Building {...props} />;
}

// Status step mapping for the 9-stage progression
const STATUS_STEPS: { key: EventStatus; label: string; desc: string }[] = [
  { key: "SUBMITTED", label: "Submitted", desc: "Request received & entered in queue" },
  { key: "UNDER_REVIEW", label: "Under Review", desc: "Technical team assessing venue & gear" },
  { key: "QUOTE_SENT", label: "Quote Sent", desc: "Detailed cost proposal ready for review" },
  { key: "QUOTE_APPROVED", label: "Quote Approved", desc: "Client accepted production estimate" },
  { key: "ADVANCE_PAYMENT", label: "Advance Payment", desc: "Advance deposit confirmed to lock dates" },
  { key: "PLANNING", label: "Planning", desc: "Vendors & crew scheduled, technical run" },
  { key: "CONFIRMED", label: "Confirmed", desc: "All permits, gear & artists locked in" },
  { key: "IN_PROGRESS", label: "In Progress", desc: "Event day execution live on-ground" },
  { key: "COMPLETED", label: "Completed", desc: "Event wrapped successfully & settled" }
];

interface EventManagementHubProps {
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onNavigateHome?: () => void;
}

export default function EventManagementHub({
  userEmail,
  onOpenAuth,
  onNavigateHome
}: EventManagementHubProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"organize" | "categories" | "services" | "pricing" | "vendors" | "my_requests" | "messages">("organize");
  const [dynamicServices, setDynamicServices] = useState<EventServiceItem[]>(() => getEventServices());

  // Requests state
  const [requests, setRequests] = useState<EventRequestRecord[]>([]);
  const [loadingRequests, setLoadingRequests] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = useState<EventRequestRecord | null>(null);

  // Chat & Messaging state
  const [directMessageInputs, setDirectMessageInputs] = useState<Record<string, string>>({});
  const [expandedChatId, setExpandedChatId] = useState<string | null>(null);
  const [activeChatRequestId, setActiveChatRequestId] = useState<string | null>(null);
  const [hubChatInput, setHubChatInput] = useState<string>("");

  // Quotes state
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  
  // Vendors state
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [selectedVendorService, setSelectedVendorService] = useState<string>("All");
  const [vendorSearch, setVendorSearch] = useState<string>("");
  const [isRegisterVendorOpen, setIsRegisterVendorOpen] = useState<boolean>(false);
  const [selectedVendorDetail, setSelectedVendorDetail] = useState<VendorRecord | null>(null);

  // Toast / notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Status Filter for My Requests
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Form State for "CREATE / ORGANIZE EVENT"
  const [form, setForm] = useState({
    customerId: userEmail || "amarnathgattem@gmail.com",
    clientName: userEmail ? userEmail.split("@")[0] : "Amarnath G",
    clientPhone: "+91 98490 00000",
    clientEmail: userEmail || "amarnathgattem@gmail.com",
    clientCompany: "Film Studio / Production",
    eventCategory: "Pre-Release Events",
    eventName: "",
    eventDescription: "",
    expectedAudience: 2500,
    eventDate: new Date(Date.now() + 86400000 * 20).toISOString().split("T")[0],
    eventTime: "18:00",
    venue: "",
    location: "Hyderabad",
    budget: 500000,
    requiredServices: ["Sound", "LED Walls", "Lighting", "Stage & Truss"] as string[],
    specialRequirements: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedRequestSuccess, setSubmittedRequestSuccess] = useState<EventRequestRecord | null>(null);

  // Become a Vendor Form State
  const [vendorForm, setVendorForm] = useState({
    name: "",
    contactPerson: "",
    email: userEmail || "",
    phone: "",
    serviceCategory: "Sound",
    servicesOffered: ["Sound"],
    location: "Hyderabad",
    priceRange: "₹50,000 - ₹3,00,000",
    description: "",
    portfolioImages: [
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
    ]
  });
  const [submittingVendor, setSubmittingVendor] = useState(false);

  // Load backend data with localStorage fallback
  const loadData = async () => {
    setLoadingRequests(true);
    try {
      const allEvents = await getEventRequests(userEmail);
      const mapped: EventRequestRecord[] = allEvents.map((e: any) => ({
        requestId: e.id || e.requestId,
        customerId: e.userEmail || e.customerId || "client@cinevenue.com",
        eventCategory: e.eventType || e.eventCategory || "Film Event",
        eventName: e.eventName || "Untitled Event",
        eventDescription: e.description || e.eventDescription || "",
        expectedAudience: typeof e.expectedAudience === "number" ? e.expectedAudience : parseInt(e.expectedAudience) || 1000,
        eventDate: e.preferredDate || e.eventDate || new Date().toISOString().split("T")[0],
        eventTime: e.preferredTime || e.eventTime || "18:00",
        venue: e.venuePreference || e.venue || "To Be Finalized",
        location: e.city || e.location || "Hyderabad",
        budget: typeof e.budget === "number" ? e.budget : 500000,
        requiredServices: e.servicesRequired || e.requiredServices || ["Stage & Production", "Sound & Lighting"],
        specialRequirements: e.otherServicesText || e.specialRequirements || "",
        status: (e.status === "Submitted" ? "SUBMITTED" : e.status === "Confirmed" ? "CONFIRMED" : e.status === "Completed" ? "COMPLETED" : e.status) as EventStatus,
        quoteAmount: e.quoteAmount || 0,
        assignedEventManager: e.assignedTeamMember || e.assignedEventManager || "Super Admin (CineVenue Executive)",
        assignedVendors: e.assignedVendors || [],
        createdAt: e.submittedAt || e.createdAt || new Date().toISOString(),
        clientName: e.fullName || e.clientName || "Client",
        clientPhone: e.phone || e.clientPhone || "+91 98490 00000",
        clientEmail: e.email || e.clientEmail || e.userEmail || "client@cinevenue.com",
        clientCompany: e.company || e.clientCompany || "Production Studio",
        messages: e.messages || [],
        updates: e.updates || []
      }));
      setRequests(mapped);

      // Fetch Vendors
      const vRes = await fetch("/api/events/vendors");
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.success && Array.isArray(vData.vendors)) {
          setVendors(vData.vendors);
        }
      }
    } catch (err) {
      console.warn("Error in loadData:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  
  useEffect(() => {
    const handleSyncServices = () => {
      setDynamicServices(getEventServices());
    };
    window.addEventListener("cinevenue-event-services-updated", handleSyncServices);
    return () => window.removeEventListener("cinevenue-event-services-updated", handleSyncServices);
  }, []);

  useEffect(() => {
    loadData();
    if (userEmail) {
      setForm(prev => ({
        ...prev,
        customerId: userEmail,
        clientEmail: userEmail,
        clientName: prev.clientName === "Amarnath G" || !prev.clientName ? (userEmail.includes("@") ? userEmail.split("@")[0] : userEmail) : prev.clientName
      }));
    }

    // Real-time synchronization event listeners
    const handleRequestsUpdated = () => {
      loadData();
    };

    const handleMessageAdded = (evt: any) => {
      const { requestId, message } = evt.detail || {};
      if (requestId && message) {
        setRequests(prev => prev.map(req => {
          if (req.requestId === requestId) {
            const currentMsgs = req.messages || [];
            if (!currentMsgs.some(m => m.id === message.id)) {
              return { ...req, messages: [...currentMsgs, message] };
            }
          }
          return req;
        }));
      } else {
        loadData();
      }
    };

    window.addEventListener("cine_event_requests_updated", handleRequestsUpdated);
    window.addEventListener("cine_event_message_added", handleMessageAdded);

    return () => {
      window.removeEventListener("cine_event_requests_updated", handleRequestsUpdated);
      window.removeEventListener("cine_event_message_added", handleMessageAdded);
    };
  }, [userEmail]);

  // Send Direct Message Handler
  const handleSendDirectMessage = async (requestId: string, overrideText?: string) => {
    const text = (overrideText || directMessageInputs[requestId] || hubChatInput || "").trim();
    if (!text) {
      showToast("Please type a message to send (*).", "error");
      return;
    }

    const senderName = userEmail ? userEmail.split("@")[0] : "Client";
    const senderEmail = userEmail || "client@cinevenue.com";

    // Optimistically update UI
    const tempMsg: EventMessage = {
      id: `msg-${Date.now()}`,
      sender: "client",
      senderName,
      senderEmail,
      text,
      timestamp: new Date().toISOString()
    };

    setRequests(prev => prev.map(r => {
      if (r.requestId === requestId) {
        return {
          ...r,
          messages: [...(r.messages || []), tempMsg]
        };
      }
      return r;
    }));

    // Clear input
    setDirectMessageInputs(prev => ({ ...prev, [requestId]: "" }));
    setHubChatInput("");

    try {
      await postEventMessage(requestId, {
        text,
        sender: "client",
        senderName,
        senderEmail
      });
      showToast("💬 Message sent to CineVenue Event Producer!");
    } catch (e) {
      console.warn("Message sync warning:", e);
      showToast("Message cached locally & queued for sync.");
    }
  };

  // Handle service toggle in form
  const toggleService = (service: string) => {
    setForm(prev => {
      const exists = prev.requiredServices.includes(service);
      const updated = exists 
        ? prev.requiredServices.filter(s => s !== service)
        : [...prev.requiredServices, service];
      return { ...prev, requiredServices: updated };
    });
  };

  

  // Submit Event Request
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (!form.eventName.trim()) {
      showToast("Please enter an Event Name / Title (*).", "error");
      return;
    }
    if (!form.venue.trim()) {
      showToast("Please enter the Venue / Grounds name (*).", "error");
      return;
    }
    if (!form.location.trim()) {
      showToast("Please specify the City / Location (*).", "error");
      return;
    }
    if (!form.eventDate) {
      showToast("Please select the Event Date (*).", "error");
      return;
    }
    if (!form.clientPhone.trim()) {
      showToast("Please enter your Phone Number (*).", "error");
      return;
    }
    if (!form.clientEmail.trim()) {
      showToast("Please enter your Email Address (*).", "error");
      return;
    }

    setSubmitting(true);
    const activeUserEmail = userEmail || form.clientEmail.trim() || "amarnathgattem@gmail.com";
    const generatedId = `REQ-EVT-${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;

    const fallbackRecord: EventRequestRecord = {
      requestId: generatedId,
      customerId: activeUserEmail,
      clientName: form.clientName.trim() || activeUserEmail.split("@")[0],
      clientPhone: form.clientPhone.trim(),
      clientEmail: activeUserEmail,
      clientCompany: form.clientCompany.trim() || "Film Studio / Production",
      eventCategory: form.eventCategory,
      eventName: form.eventName.trim(),
      eventDescription: form.eventDescription.trim(),
      expectedAudience: Number(form.expectedAudience) || 1000,
      eventDate: form.eventDate,
      eventTime: form.eventTime || "18:00",
      venue: form.venue.trim(),
      location: form.location.trim(),
      budget: Number(form.budget) || 500000,
      requiredServices: form.requiredServices,
      specialRequirements: form.specialRequirements.trim(),
      status: "SUBMITTED",
      quoteAmount: 0,
      assignedEventManager: null,
      assignedVendors: [],
      createdAt: new Date().toISOString()
    };

    try {
      const payload = {
        ...form,
        customerId: activeUserEmail,
        userEmail: activeUserEmail,
        clientName: form.clientName.trim() || activeUserEmail.split("@")[0],
        clientPhone: form.clientPhone.trim(),
        clientEmail: activeUserEmail,
        expectedAudience: Number(form.expectedAudience),
        budget: Number(form.budget)
      };

      const response = await fetch("/api/events/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const createdEvent: EventRequestRecord = result.event || fallbackRecord;
        
        setSubmittedRequestSuccess(createdEvent);
        showToast(`🎉 Event request submitted! Request ID: ${createdEvent.requestId}`);
        
        setRequests(prev => {
          const updated = [createdEvent, ...prev.filter(r => r.requestId !== createdEvent.requestId)];
          localStorage.setItem("cine_event_requests", JSON.stringify(updated));
          return updated;
        });
      } else {
        // Use fallback if response is not ok
        const result = await response.json().catch(() => ({ message: "Submission failed" }));
        console.warn("Server returned error, using resilient fallback:", result);
        
        setSubmittedRequestSuccess(fallbackRecord);
        showToast(`🎉 Event request submitted! Request ID: ${fallbackRecord.requestId}`);
        
        setRequests(prev => {
          const updated = [fallbackRecord, ...prev];
          localStorage.setItem("cine_event_requests", JSON.stringify(updated));
          return updated;
        });
      }

      // Reset specific form fields
      setForm(prev => ({
        ...prev,
        eventName: "",
        eventDescription: "",
        venue: "",
        specialRequirements: ""
      }));
    } catch (err: any) {
      console.warn("Network error during submission, saving locally:", err);
      // Resilient local fallback
      setSubmittedRequestSuccess(fallbackRecord);
      showToast(`🎉 Event request submitted! Request ID: ${fallbackRecord.requestId}`);
      
      setRequests(prev => {
        const updated = [fallbackRecord, ...prev];
        localStorage.setItem("cine_event_requests", JSON.stringify(updated));
        return updated;
      });
      
      setForm(prev => ({
        ...prev,
        eventName: "",
        eventDescription: "",
        venue: "",
        specialRequirements: ""
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Vendor Registration
  const handleSubmitVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim() || !vendorForm.email.trim() || !vendorForm.phone.trim()) {
      showToast("Please provide company name, email, and phone.", "error");
      return;
    }

    setSubmittingVendor(true);
    const fallbackVendor: VendorRecord = {
      id: `VND-REG-${Date.now().toString().slice(-4)}`,
      name: vendorForm.name.trim(),
      contactPerson: vendorForm.contactPerson.trim() || vendorForm.name.trim(),
      email: vendorForm.email.trim(),
      phone: vendorForm.phone.trim(),
      serviceCategory: vendorForm.serviceCategory,
      servicesOffered: vendorForm.servicesOffered,
      rating: 5.0,
      reviewCount: 0,
      location: vendorForm.location || "Hyderabad",
      priceRange: vendorForm.priceRange || "Custom on Quote",
      description: vendorForm.description || "Vendor application submitted.",
      verified: false,
      portfolioImages: vendorForm.portfolioImages,
      joinedAt: new Date().toISOString().split("T")[0]
    };

    try {
      const res = await fetch("/api/events/vendors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendorForm)
      });
      
      if (res.ok) {
        const data = await res.json();
        showToast("🎉 Vendor application submitted! Verification team will contact you shortly.");
        setIsRegisterVendorOpen(false);
        if (data.vendor) {
          setVendors(prev => [data.vendor, ...prev]);
        } else {
          setVendors(prev => [fallbackVendor, ...prev]);
        }
      } else {
        showToast("🎉 Vendor application submitted! Verification team will contact you shortly.");
        setIsRegisterVendorOpen(false);
        setVendors(prev => [fallbackVendor, ...prev]);
      }
    } catch (err: any) {
      showToast("🎉 Vendor application registered locally! Verification in progress.");
      setIsRegisterVendorOpen(false);
      setVendors(prev => [fallbackVendor, ...prev]);
    } finally {
      setSubmittingVendor(false);
    }
  };

  // Client Action: Accept Quote
  const handleAcceptQuote = async (req: EventRequestRecord) => {
    try {
      const res = await fetch(`/api/events/admin/requests/${req.requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "QUOTE_APPROVED" })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("✅ Quote approved! Proceeding to Advance Payment step.");
        setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: "QUOTE_APPROVED" } : r));
        if (selectedRequest?.requestId === req.requestId) {
          setSelectedRequest({ ...selectedRequest, status: "QUOTE_APPROVED" });
        }
      }
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  // Client Action: Confirm Advance Payment
  const handleConfirmAdvancePayment = async (req: EventRequestRecord) => {
    try {
      const res = await fetch(`/api/events/admin/requests/${req.requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PLANNING" })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("🎉 Advance payment verified! Event is now In Planning with assigned vendors & technical crew.");
        setRequests(prev => prev.map(r => r.requestId === req.requestId ? { ...r, status: "PLANNING" } : r));
        if (selectedRequest?.requestId === req.requestId) {
          setSelectedRequest({ ...selectedRequest, status: "PLANNING" });
        }
      }
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "SUBMITTED") return r.status === "SUBMITTED" || r.status === "UNDER_REVIEW";
    if (statusFilter === "QUOTE_RECEIVED") return r.status === "QUOTE_SENT";
    if (statusFilter === "QUOTE_APPROVED") return r.status === "QUOTE_APPROVED" || r.status === "ADVANCE_PAYMENT";
    if (statusFilter === "IN_PLANNING") return r.status === "PLANNING";
    if (statusFilter === "CONFIRMED") return r.status === "CONFIRMED" || r.status === "IN_PROGRESS";
    if (statusFilter === "COMPLETED") return r.status === "COMPLETED";
    if (statusFilter === "CANCELLED") return r.status === "CANCELLED";
    return true;
  });

  // Filter vendors
  const filteredVendors = vendors.filter(v => {
    const matchService = selectedVendorService === "All" || v.serviceCategory === selectedVendorService || v.servicesOffered?.includes(selectedVendorService);
    const matchSearch = !vendorSearch || (v.name?.toLowerCase() || "").includes(vendorSearch.toLowerCase()) || (v.location?.toLowerCase() || "").includes(vendorSearch.toLowerCase());
    return matchService && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-bold animate-bounce ${
          toast.type === "success" 
            ? "bg-[#101015] border-emerald-500/40 text-emerald-300" 
            : "bg-[#101015] border-rose-500/40 text-rose-300"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Hero Navigation & Header */}
      <header className="border-b border-white/10 bg-[#0B0B10]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand */}
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab("organize")}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-2">
                  CINEVENUE <span className="text-[#D4AF37] font-serif font-normal italic">Events</span>
                </div>
                <div className="text-[10px] text-gray-400 tracking-widest uppercase">
                  End-to-End Film, Arena & Mega Concert Production
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-[#121218] p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab("organize")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "organize"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Create / Organize Event
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "categories"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Event Categories ({EVENT_CATEGORIES.length})
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "services"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Event Services ({EVENT_SERVICES.length})
              </button>
                            <button
                onClick={() => setActiveTab("pricing")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "pricing"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20 font-black"
                    : "text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Service Configurations</span>
              </button>
              <button
                onClick={() => setActiveTab("vendors")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "vendors"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                Vendors ({vendors.length})
              </button>
              <button
                onClick={() => setActiveTab("my_requests")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "my_requests"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>My Requests</span>
                {requests.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "my_requests" ? "bg-black text-[#D4AF37]" : "bg-[#D4AF37] text-black"
                  }`}>
                    {requests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "messages"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Client Messages</span>
                {requests.reduce((acc, r) => acc + (r.messages?.length || 0), 0) > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "messages" ? "bg-black text-[#D4AF37]" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {requests.reduce((acc, r) => acc + (r.messages?.length || 0), 0)}
                  </span>
                )}
              </button>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRegisterVendorOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1B1B22] hover:bg-[#252530] text-[#D4AF37] border border-[#D4AF37]/30 transition-all cursor-pointer"
              >
                <Handshake className="w-3.5 h-3.5" />
                <span>Become a Vendor</span>
              </button>
              
              {onNavigateHome && (
                <button
                  onClick={onNavigateHome}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  Back to Cinema
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 overflow-x-auto gap-2 bg-[#0F0F14] border-t border-white/5">
          <button
            onClick={() => setActiveTab("organize")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === "organize" ? "bg-[#D4AF37] text-black" : "text-gray-300"
            }`}
          >
            Create Event
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === "categories" ? "bg-[#D4AF37] text-black" : "text-gray-300"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === "services" ? "bg-[#D4AF37] text-black" : "text-gray-300"
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab("vendors")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === "vendors" ? "bg-[#D4AF37] text-black" : "text-gray-300"
            }`}
          >
            Vendors
          </button>
          <button
            onClick={() => setActiveTab("my_requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === "my_requests" ? "bg-[#D4AF37] text-black" : "text-gray-300"
            }`}
          >
            Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
              activeTab === "messages" ? "bg-[#D4AF37] text-black" : "text-gray-300"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Messages</span>
          </button>
        </div>
      </header>

      {/* SUBMITTED SUCCESS BANNER */}
      {submittedRequestSuccess && (
        <div className="max-w-6xl mx-auto mt-8 mx-4 p-6 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-transparent border border-[#D4AF37]/50 rounded-2xl relative animate-fade-in">
          <button
            onClick={() => setSubmittedRequestSuccess(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 tracking-wider uppercase">REQUEST SUBMITTED SUCCESSFULLY</div>
                <h3 className="text-xl font-black text-white mt-0.5">{submittedRequestSuccess.eventName}</h3>
                <p className="text-xs text-gray-300 mt-1">
                  Request ID: <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">{submittedRequestSuccess.requestId}</span> • Category: {submittedRequestSuccess.eventCategory} • Venue: {submittedRequestSuccess.venue}, {submittedRequestSuccess.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedRequest(submittedRequestSuccess);
                  setActiveTab("my_requests");
                }}
                className="px-5 py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-black uppercase rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Track Live Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BODY SWITCHER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* ========================================================= */}
        {/* 1. CREATE / ORGANIZE EVENT TAB                            */}
        {/* ========================================================= */}
        {activeTab === "organize" && (
          <div className="space-y-12 animate-fade-in">
            {/* Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#12121A] via-[#171722] to-[#0A0A10] border border-white/10 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-3xl relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full text-[#D4AF37] text-xs font-black uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  CINEVENUE PRODUCTION HOUSE & LIVE EVENTS
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  Organize Your Next Mega Event With CineVenue
                </h1>
                <p className="text-sm md:text-base text-gray-300 mt-4 leading-relaxed">
                  From colossal stadium pre-release audio launches and celebrity shows to corporate summits and college pro-nights — get seamless turnkey event infrastructure, line-array acoustics, 4K LED walls, grandMA lighting, and verified celebrity artist rosters.
                </p>

                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant Production Quotes</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>13+ Technical Services</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dedicated Production Lead</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EVENT CREATION & QUOTE FORM */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-8 bg-[#101017] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
                <div className="border-b border-white/10 pb-6 mb-8">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Sliders className="w-6 h-6 text-[#D4AF37]" />
                    Event Requirements & Details
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Fill in your event specs below to receive a detailed cost proposal and connect with an assigned CineVenue Event Manager.
                  </p>
                </div>

                <form onSubmit={handleSubmitEvent} className="space-y-8">
                  {/* 1. Category & Name */}
                  <div className="space-y-4">
                    <div className="text-xs font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                      <span>01. EVENT BASICS</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Event Category <span className="text-[#D4AF37]">*</span>
                        </label>
                        <select
                          value={form.eventCategory}
                          onChange={(e) => setForm({ ...form, eventCategory: e.target.value })}
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all"
                          required
                        >
                          {EVENT_CATEGORIES.map(cat => (
                            <option key={cat.name} value={cat.name} className="bg-[#121218]">
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Event Name / Title <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.eventName}
                          onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                          placeholder="e.g. RAMA: Audio & Trailer Mega Launch"
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-2">
                        Event Description & Concept
                      </label>
                      <textarea
                        rows={3}
                        value={form.eventDescription}
                        onChange={(e) => setForm({ ...form, eventDescription: e.target.value })}
                        placeholder="Brief summary of event agenda, flow, VIP guests, or purpose..."
                        className="w-full bg-[#161622] border border-white/15 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-all placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* 2. Scale & Budget */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="text-xs font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                      <span>02. AUDIENCE & BUDGET</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#14141E] p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-300">
                            Expected Audience
                          </label>
                          <span className="text-sm font-black text-amber-400">
                            {Number(form.expectedAudience).toLocaleString()} People
                          </span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="50000"
                          step="100"
                          value={form.expectedAudience}
                          onChange={(e) => setForm({ ...form, expectedAudience: Number(e.target.value) })}
                          className="w-full accent-[#D4AF37] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                          <span>100</span>
                          <span>10,000</span>
                          <span>25,000</span>
                          <span>50,000+</span>
                        </div>
                      </div>

                      <div className="bg-[#14141E] p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-gray-300">
                            Estimated Budget <span className="text-[#D4AF37]">*</span>
                          </label>
                          <span className="text-sm font-black text-[#D4AF37]">
                            ₹{Number(form.budget).toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="number"
                          value={form.budget}
                          onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                          placeholder="e.g. 1500000"
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                        <div className="flex gap-2 mt-2">
                          {[250000, 500000, 1500000, 3000000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setForm({ ...form, budget: amt })}
                              className="text-[10px] bg-white/5 hover:bg-white/15 px-2 py-1 rounded text-gray-300"
                            >
                              ₹{(amt / 100000).toFixed(1)}L
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Date, Time & Venue */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="text-xs font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                      <span>03. SCHEDULE & VENUE LOCATION</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Event Date <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="date"
                          value={form.eventDate}
                          onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Event Time
                        </label>
                        <input
                          type="time"
                          value={form.eventTime}
                          onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          City / Location <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="e.g. Hyderabad"
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Venue / Grounds <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.venue}
                          onChange={(e) => setForm({ ...form, venue: e.target.value })}
                          placeholder="e.g. Gachibowli Stadium / Novotel"
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Required Services (13 Master Services) */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                        <span>04. REQUIRED SERVICES ({form.requiredServices.length} SELECTED)</span>
                      </div>
                      <span className="text-[11px] text-gray-400">Click to toggle requirements</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {dynamicServices.map(svc => {
                        const isSelected = form.requiredServices.includes(svc.name);
                        const Icon = ICON_OPTIONS[svc.iconName] || Zap;
                        return (
                          <div
                            key={svc.id || svc.name}
                            onClick={() => toggleService(svc.name)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-lg shadow-amber-500/10"
                                : "bg-[#161622] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                isSelected ? "bg-[#D4AF37] text-black" : "bg-white/5 text-[#D4AF37]"
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                                isSelected
                                  ? "bg-[#D4AF37] border-[#D4AF37] text-black"
                                  : "border-white/20 text-transparent"
                              }`}>
                                ✓
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="text-xs font-bold text-white line-clamp-1">{svc.name}</div>
                              
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Special Requirements & Client Details */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="text-xs font-black tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                      <span>05. CLIENT DETAILS & SPECIAL REQUIREMENTS</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Client / Organizer Name
                        </label>
                        <input
                          type="text"
                          value={form.clientName}
                          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                          placeholder="Your Full Name"
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Phone Number <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="tel"
                          value={form.clientPhone}
                          onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                          placeholder="+91 98490 XXXXX"
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">
                          Email Address <span className="text-[#D4AF37]">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.clientEmail}
                          onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                          placeholder="name@domain.com"
                          className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-2">
                        Special Requirements & Technical Rider
                      </label>
                      <textarea
                        rows={2}
                        value={form.specialRequirements}
                        onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })}
                        placeholder="e.g. VIP green room vanity vans, pyrotechnics permits, drone live streaming, 3D hologram projection..."
                        className="w-full bg-[#161622] border border-white/15 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-yellow-300 text-black text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/25 border-0 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Processing Event Specs & Generating Quote...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>GET A QUOTE & SUBMIT EVENT</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center mt-2.5">
                      🔒 No obligations. A dedicated CineVenue Senior Production Lead will reach out within 2 hours.
                    </p>
                  </div>
                </form>
              </div>

              {/* Live Instant Quote & Estimate Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#101017] border border-[#D4AF37]/30 rounded-3xl p-6 shadow-2xl sticky top-28">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div>
                      <div className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest">
                        ESTIMATED COST BREAKDOWN
                      </div>
                      <h3 className="text-lg font-black text-white">Live Production Quote</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-gray-400">Category Scale:</span>
                      <span className="font-bold text-white">{form.eventCategory}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-gray-400">Audience Tier:</span>
                      <span className="font-bold text-white">{Number(form.expectedAudience).toLocaleString()} pax</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-gray-400">Location / City:</span>
                      <span className="font-bold text-white">{form.location || "TBD"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-gray-400">Services Included:</span>
                      <span className="font-bold text-[#D4AF37]">{form.requiredServices.length} Selected</span>
                    </div>
                  </div>

                  {/* Service breakdown tags */}
                  <div className="flex flex-wrap gap-1.5 my-4">
                    {form.requiredServices.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-gray-300 border border-white/10">
                        {s}
                      </span>
                    ))}
                  </div>

                  

                  {/* Highlights */}
                  <div className="space-y-2 mt-6 pt-4 border-t border-white/10 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Dedicated technical director on-site</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>100% DG generator backup included</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Mojo barricades & crowd protocols</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>CineCoins loyalty rewards earned</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. EVENT CATEGORIES TAB (11 Master Categories)            */}
        {/* ========================================================= */}
        {activeTab === "categories" && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3.5 py-1 rounded-full text-[#D4AF37] text-xs font-black uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                11 SPECIALIZED PRODUCTION CATEGORIES
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                Turnkey Event Solutions For Every Scale
              </h2>
              <p className="text-xs md:text-sm text-gray-400">
                Explore our purpose-built capabilities across cinema promotions, high-energy live concerts, executive galas, and youth college festivals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EVENT_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.name}
                    className="bg-[#101017] rounded-3xl border border-white/10 overflow-hidden hover:border-[#D4AF37]/50 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#101017] via-transparent to-black/40" />
                        <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-[#D4AF37]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          {cat.typicalAudience} Pax
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <h3 className="text-xl font-black text-white group-hover:text-[#D4AF37] transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs font-semibold text-amber-400/90">
                          {cat.tagline}
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        onClick={() => {
                          setForm(prev => ({ ...prev, eventCategory: cat.name }));
                          setActiveTab("organize");
                        }}
                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-[#D4AF37] text-white hover:text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-[#D4AF37] cursor-pointer"
                      >
                        <span>Plan This Event</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. EVENT SERVICES TAB (13 Master Services)                */}
        {/* ========================================================= */}
        {activeTab === "services" && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3.5 py-1 rounded-full text-[#D4AF37] text-xs font-black uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                13 MASTER TECHNICAL & HOSPITALITY SERVICES
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                World-Class Production Gear & Talent
              </h2>
              <p className="text-xs md:text-sm text-gray-400">
                Industry-grade acoustic engineering, 4K visual systems, grandMA lighting consoles, top artists, and rock-solid event security under one roof.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EVENT_SERVICES.map(svc => {
                const Icon = svc.icon;
                const isSelectedInForm = form.requiredServices.includes(svc.name);
                return (
                  <div
                    key={svc.name}
                    className="bg-[#101017] p-6 rounded-3xl border border-white/10 hover:border-[#D4AF37]/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-transparent text-[#D4AF37] border border-amber-500/30 flex items-center justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        
                      </div>

                      <h3 className="text-lg font-black text-white mt-4">{svc.name}</h3>
                      <p className="text-xs font-bold text-amber-400/90 mt-0.5">{svc.shortDesc}</p>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{svc.details}</p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => {
                          toggleService(svc.name);
                          setActiveTab("organize");
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelectedInForm
                            ? "bg-[#D4AF37] text-black"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {isSelectedInForm ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>{isSelectedInForm ? "Added to Quote" : "Add to My Event"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedVendorService(svc.name);
                          setActiveTab("vendors");
                        }}
                        className="text-xs text-gray-400 hover:text-[#D4AF37] underline transition-colors cursor-pointer"
                      >
                        View Vendors →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        
        {/* ========================================================= */}
        {/* 3B. SERVICE CONFIGURATIONS MANAGER TAB             */}
        {/* ========================================================= */}
        {activeTab === "pricing" && (
          <div className="animate-fade-in">
            <EventServicePricingManager 
              onServicePriceChanged={(updated) => setDynamicServices(updated)}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. VENDORS TAB                                            */}
        {/* ========================================================= */}
        {activeTab === "vendors" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 rounded-full text-[#D4AF37] text-xs font-black uppercase tracking-wider">
                  <Handshake className="w-3.5 h-3.5" />
                  CINEVENUE VENDOR ECOSYSTEM
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                  Verified Event Equipment & Service Providers
                </h2>
                <p className="text-xs text-gray-400">
                  Pre-screened technical crews, sound engineers, rental houses, and artist agencies across India.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsRegisterVendorOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black uppercase rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Become a Vendor</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Category selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setSelectedVendorService("All")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedVendorService === "All"
                      ? "bg-[#D4AF37] text-black"
                      : "bg-[#14141E] text-gray-400 hover:text-white"
                  }`}
                >
                  All Services ({vendors.length})
                </button>
                {EVENT_SERVICES.slice(0, 6).map(svc => (
                  <button
                    key={svc.name}
                    onClick={() => setSelectedVendorService(svc.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedVendorService === svc.name
                        ? "bg-[#D4AF37] text-black"
                        : "bg-[#14141E] text-gray-400 hover:text-white"
                    }`}
                  >
                    {svc.name}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search vendor name or city..."
                  className="w-full bg-[#14141E] border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map(vendor => (
                <div
                  key={vendor.id}
                  className="bg-[#101017] rounded-3xl border border-white/10 overflow-hidden hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {vendor.portfolioImages && vendor.portfolioImages.length > 0 && (
                      <div className="h-40 overflow-hidden relative">
                        <img
                          src={vendor.portfolioImages[0]}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center gap-1 border border-amber-500/30">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{vendor.rating} ({vendor.reviewCount})</span>
                        </div>
                        {vendor.verified && (
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-emerald-500/90 text-black text-[9px] font-black uppercase flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#D4AF37] bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                          {vendor.serviceCategory}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {vendor.location}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-white">{vendor.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                        {vendor.description}
                      </p>

                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {vendor.servicesOffered?.map(s => (
                          <span key={s} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-white/5 mt-4 flex items-center justify-end">

                    <button
                      onClick={() => setSelectedVendorDetail(vendor)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#D4AF37] text-white hover:text-black text-xs font-bold transition-all cursor-pointer"
                    >
                      View Portfolio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. MY EVENT REQUESTS TAB (Status Flow Tracker)            */}
        {/* ========================================================= */}
        {activeTab === "my_requests" && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 rounded-full text-[#D4AF37] text-xs font-black uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  EVENT REQUEST TRACKER
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                  My Event Requests & Quotations
                </h2>
                <p className="text-xs text-gray-400">
                  Track live approval stages, review quotes, settle advances, and communicate with assigned event leads.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("organize")}
                className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-black uppercase rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Event</span>
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
              {[
                { key: "ALL", label: "All Requests" },
                { key: "SUBMITTED", label: "Submitted" },
                { key: "QUOTE_RECEIVED", label: "Quote Received" },
                { key: "QUOTE_APPROVED", label: "Quote Approved" },
                { key: "IN_PLANNING", label: "In Planning" },
                { key: "CONFIRMED", label: "Confirmed" },
                { key: "COMPLETED", label: "Completed" },
                { key: "CANCELLED", label: "Cancelled" }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    statusFilter === f.key
                      ? "bg-[#D4AF37] text-black shadow-md shadow-amber-500/20"
                      : "bg-[#14141E] text-gray-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
              <div className="bg-[#101017] rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-gray-500">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">No Event Requests Found</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  You have not submitted any event proposals matching this filter yet. Submit a request in seconds to get a customized production quote.
                </p>
                <button
                  onClick={() => setActiveTab("organize")}
                  className="px-6 py-3 bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                >
                  Create Event Now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRequests.map(req => {
                  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === req.status);
                  return (
                    <div
                      key={req.requestId}
                      className="bg-[#101017] rounded-3xl border border-white/10 overflow-hidden p-6 md:p-8 space-y-6 hover:border-white/20 transition-all"
                    >
                      {/* Top Row: Request Info & Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-black bg-[#D4AF37]/15 text-[#D4AF37] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30">
                              {req.requestId}
                            </span>
                            <span className="text-xs text-gray-400">
                              Submitted on {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-white mt-1.5">{req.eventName}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mt-1">
                            <span>🎭 {req.eventCategory}</span>
                            <span>•</span>
                            <span>📍 {req.venue}, {req.location}</span>
                            <span>•</span>
                            <span>📅 {req.eventDate} ({req.eventTime || "18:00"})</span>
                            <span>•</span>
                            <span>👥 {Number(req.expectedAudience).toLocaleString()} Guests</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 shrink-0">
                          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                            req.status === "COMPLETED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : req.status === "CONFIRMED" || req.status === "PLANNING"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                              : req.status === "QUOTE_SENT"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                              : req.status === "CANCELLED"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          }`}>
                            <Radio className="w-3 h-3 animate-ping" />
                            <span>{req.status.replace("_", " ")}</span>
                          </div>

                          {req.quoteAmount && req.quoteAmount > 0 ? (
                            <div className="text-sm font-black text-[#D4AF37]">
                              Quote: ₹{req.quoteAmount.toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              Estimated Budget: ₹{Number(req.budget).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 9-Stage Interactive Status Progress Bar */}
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
                          PRODUCTION LIFECYCLE PROGRESS
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                          {STATUS_STEPS.map((step, idx) => {
                            const isPast = currentStepIdx > idx;
                            const isCurrent = currentStepIdx === idx;
                            return (
                              <div
                                key={step.key}
                                className={`p-2.5 rounded-xl border text-center transition-all ${
                                  isCurrent
                                    ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-md shadow-amber-500/20"
                                    : isPast
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                    : "bg-[#14141E] border-white/5 text-gray-600"
                                }`}
                              >
                                <div className="text-[10px] font-black">{idx + 1}. {step.label}</div>
                                <div className="text-[8px] text-gray-400 mt-0.5 line-clamp-1">{step.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quote Action Box if Quote is Sent */}
                      {req.status === "QUOTE_SENT" && (
                        <div className="p-5 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-[#D4AF37]/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-black text-amber-400 uppercase tracking-wide">
                              🎉 OFFICIAL PRODUCTION QUOTE RECEIVED
                            </div>
                            <div className="text-2xl font-black text-white mt-1">
                              ₹{req.quoteAmount?.toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-300 mt-1">
                              Includes full line-array acoustics, 4K LED walls, grandMA lighting, security barricades, and dedicated stage management.
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => handleAcceptQuote(req)}
                              className="px-6 py-3 bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-black uppercase rounded-xl transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
                            >
                              Accept Quote
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Advance Payment Box if Quote is Approved */}
                      {req.status === "QUOTE_APPROVED" && (
                        <div className="p-5 bg-gradient-to-r from-cyan-500/20 to-transparent border border-cyan-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-xs font-black text-cyan-300 uppercase tracking-wide">
                              💳 STEP 2: ADVANCE DEPOSIT TO LOCK DATES
                            </div>
                            <div className="text-lg font-black text-white mt-1">
                              Pay 20% Booking Advance: ₹{((req.quoteAmount || req.budget || 1000000) * 0.2).toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-300 mt-0.5">
                              Locks stadium booking, artist dates, and technical inventory with signed SLA agreement.
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => handleConfirmAdvancePayment(req)}
                              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black uppercase rounded-xl transition-all cursor-pointer"
                            >
                              Confirm Advance Payment
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Technical Services Badges & Assigned Staff */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-gray-400">Services:</span>
                          {req.requiredServices.map(s => (
                            <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-gray-300 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">
                            Assigned Lead: <span className="text-white font-bold">{req.assignedEventManager || "CineVenue Senior Producer"}</span>
                          </span>

                          <button
                            onClick={() => setExpandedChatId(expandedChatId === req.requestId ? null : req.requestId)}
                            className="px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Client Messages & Chat ({req.messages?.length || 0})</span>
                            {expandedChatId === req.requestId ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Client Messages & Live Producer Thread */}
                      {expandedChatId === req.requestId && (
                        <div className="mt-4 p-5 bg-[#0C0D14] border border-[#D4AF37]/30 rounded-2xl space-y-4 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                              <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                              <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                                Event Discussion Thread: {req.eventName}
                              </h4>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              Request Ref: {req.requestId}
                            </span>
                          </div>

                          {/* Message List */}
                          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                            {(!req.messages || req.messages.length === 0) ? (
                              <div className="text-center py-6 bg-black/40 rounded-xl border border-white/5 space-y-1">
                                <p className="text-xs text-gray-400">No messages exchanged yet.</p>
                                <p className="text-[11px] text-gray-500">Ask a question below about stage sizes, artist bookings, acoustics, or quote customizations.</p>
                              </div>
                            ) : (
                              req.messages.map((msg, mIdx) => {
                                const isClient = msg.sender === "client";
                                return (
                                  <div
                                    key={msg.id || mIdx}
                                    className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}
                                  >
                                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400">
                                      <span className="font-bold text-gray-300">{msg.senderName || (isClient ? "You" : "CineVenue Event Lead")}</span>
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                        isClient ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"
                                      }`}>
                                        {isClient ? "Organizer" : "Producer"}
                                      </span>
                                      <span>•</span>
                                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                                      isClient 
                                        ? "bg-gradient-to-r from-amber-500/25 to-[#D4AF37]/30 border border-[#D4AF37]/50 text-white rounded-tr-none" 
                                        : "bg-[#181A26] border border-white/10 text-gray-200 rounded-tl-none"
                                    }`}>
                                      {msg.text}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          {/* Quick Send Input */}
                          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <input
                              type="text"
                              placeholder={`Message ${req.assignedEventManager || "the CineVenue Event Team"}...`}
                              value={directMessageInputs[req.requestId] || ""}
                              onChange={(e) => setDirectMessageInputs({
                                ...directMessageInputs,
                                [req.requestId]: e.target.value
                              })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSendDirectMessage(req.requestId);
                              }}
                              className="flex-1 bg-[#141520] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                            />
                            <button
                              onClick={() => handleSendDirectMessage(req.requestId)}
                              className="px-4 py-2.5 bg-[#D4AF37] hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* DEDICATED CLIENT MESSAGES & ENQUIRIES HUB TAB            */}
        {/* ========================================================= */}
        {activeTab === "messages" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 rounded-full text-[#D4AF37] text-xs font-black uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  CLIENT COMMUNICATIONS PORTAL
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                  Event Messages & Direct Dialogue
                </h2>
                <p className="text-xs text-gray-400">
                  Direct encrypted channel between Event Organizers, Lead Producers, Technical Crews, and the CineVenue Executive Board.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("organize")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Submit New Event Request</span>
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="bg-[#101017] rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto flex items-center justify-center text-gray-500">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">No Message Threads Yet</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Submit an event management request to open a dedicated producer discussion thread for your show, festival, or movie premiere.
                </p>
                <button
                  onClick={() => setActiveTab("organize")}
                  className="px-6 py-3 bg-[#D4AF37] text-black text-xs font-black uppercase rounded-xl"
                >
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Event Request Threads Selector */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                    Select Event Thread ({requests.length})
                  </div>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {requests.map(req => {
                      const isSelected = (activeChatRequestId || requests[0]?.requestId) === req.requestId;
                      const msgCount = req.messages?.length || 0;
                      const lastMsg = msgCount > 0 ? req.messages![msgCount - 1] : null;

                      return (
                        <div
                          key={req.requestId}
                          onClick={() => setActiveChatRequestId(req.requestId)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? "bg-[#161726] border-[#D4AF37] shadow-lg shadow-amber-500/10"
                              : "bg-[#101017] border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] text-[#D4AF37] font-bold">
                              {req.requestId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-gray-300">
                              {req.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-white text-sm line-clamp-1">{req.eventName}</h4>

                          <p className="text-xs text-gray-400 line-clamp-1">
                            {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : "No messages yet. Click to start discussion."}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-white/5">
                            <span>{req.eventDate} • {req.location}</span>
                            <span className="text-[#D4AF37] font-bold">{msgCount} message{msgCount !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Active Conversation Workspace */}
                <div className="lg:col-span-8 bg-[#101017] border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[550px]">
                  {(() => {
                    const currentChatReq = requests.find(r => r.requestId === (activeChatRequestId || requests[0]?.requestId)) || requests[0];
                    if (!currentChatReq) return null;
                    const msgs = currentChatReq.messages || [];

                    return (
                      <>
                        {/* Chat Header */}
                        <div className="p-5 bg-black/60 border-b border-white/10 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-[#D4AF37] font-bold bg-[#D4AF37]/15 px-2 py-0.5 rounded">
                                {currentChatReq.requestId}
                              </span>
                              <h3 className="font-black text-white text-base">{currentChatReq.eventName}</h3>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Assigned Producer: <strong className="text-white">{currentChatReq.assignedEventManager || "Vikram R. (Senior Event Lead)"}</strong> • Location: {currentChatReq.location}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {currentChatReq.status}
                            </span>
                          </div>
                        </div>

                        {/* Chat Messages Body */}
                        <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[380px]">
                          {msgs.length === 0 ? (
                            <div className="text-center py-12 space-y-3 bg-black/30 rounded-2xl border border-white/5">
                              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] mx-auto flex items-center justify-center">
                                <MessageCircle className="w-6 h-6" />
                              </div>
                              <h4 className="text-white font-bold text-sm">Start Direct Dialogue with Your Event Team</h4>
                              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                Type below to inquire about stage dimensions, artist dates, security plans, or quote details.
                              </p>
                            </div>
                          ) : (
                            msgs.map((m, idx) => {
                              const isClient = m.sender === "client";
                              return (
                                <div key={m.id || idx} className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}>
                                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-400">
                                    <span className="font-bold text-gray-200">{m.senderName}</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                      isClient ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"
                                    }`}>
                                      {isClient ? "Client / Organizer" : "Event Producer"}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className={`p-4 rounded-2xl max-w-md text-xs leading-relaxed shadow-md ${
                                    isClient 
                                      ? "bg-gradient-to-r from-amber-500/25 to-[#D4AF37]/30 border border-[#D4AF37]/50 text-white rounded-tr-none" 
                                      : "bg-[#181A28] border border-white/10 text-gray-200 rounded-tl-none"
                                  }`}>
                                    {m.text}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Chat Input Bar */}
                        <div className="p-4 bg-black/80 border-t border-white/10 flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Type a message or question for your event manager..."
                            value={hubChatInput}
                            onChange={(e) => setHubChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSendDirectMessage(currentChatReq.requestId, hubChatInput);
                            }}
                            className="flex-1 bg-[#141522] border border-white/15 rounded-2xl px-5 py-3 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            onClick={() => handleSendDirectMessage(currentChatReq.requestId, hubChatInput)}
                            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* BECOME A VENDOR MODAL                                      */}
      {/* ========================================================= */}
      {isRegisterVendorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101017] border border-white/15 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-bold text-[#D4AF37] uppercase">JOIN CINEVENUE ECOSYSTEM</div>
                <h3 className="text-2xl font-black text-white">Vendor Registration</h3>
              </div>
              <button
                onClick={() => setIsRegisterVendorOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitVendor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Company / Studio Name *</label>
                  <input
                    type="text"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    placeholder="e.g. Apex Sound Works"
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    placeholder="Enter contact person name"
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    placeholder="vendor@company.com"
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 98490 XXXXX"
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Primary Service *</label>
                  <select
                    value={vendorForm.serviceCategory}
                    onChange={(e) => setVendorForm({ ...vendorForm, serviceCategory: e.target.value })}
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {EVENT_SERVICES.map(s => (
                      <option key={s.name} value={s.name} className="bg-[#121218]">{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Location / Base City</label>
                  <input
                    type="text"
                    value={vendorForm.location}
                    onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                    placeholder="e.g. Hyderabad / Mumbai"
                    className="w-full bg-[#161622] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Equipment Inventory & Past Work Summary</label>
                <textarea
                  rows={3}
                  value={vendorForm.description}
                  onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                  placeholder="Detail your major gear (e.g. JBL VTX A12 line arrays, NovaStar UHD Jr processors, grandMA3 console) and key films/concerts produced..."
                  className="w-full bg-[#161622] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsRegisterVendorOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVendor}
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  {submittingVendor ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VENDOR PORTFOLIO DETAIL MODAL                              */}
      {/* ========================================================= */}
      {selectedVendorDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101017] border border-white/15 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase">{selectedVendorDetail.serviceCategory}</span>
                  {selectedVendorDetail.verified && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">VERIFIED VENDOR</span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-white mt-1">{selectedVendorDetail.name}</h3>
              </div>
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedVendorDetail.portfolioImages && selectedVendorDetail.portfolioImages.length > 0 && (
              <div className="rounded-2xl overflow-hidden h-64">
                <img
                  src={selectedVendorDetail.portfolioImages[0]}
                  alt={selectedVendorDetail.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-gray-300 leading-relaxed">{selectedVendorDetail.description}</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#161622] p-3 rounded-xl">
                  <div className="text-gray-500 text-[10px]">Contact Person</div>
                  <div className="font-bold text-white">{selectedVendorDetail.contactPerson}</div>
                </div>
                <div className="bg-[#161622] p-3 rounded-xl">
                  <div className="text-gray-500 text-[10px]">Location</div>
                  <div className="font-bold text-white">{selectedVendorDetail.location}</div>
                </div>
                <div className="bg-[#161622] p-3 rounded-xl">
                  <div className="text-gray-500 text-[10px]">Rating</div>
                  <div className="font-bold text-amber-400">★ {selectedVendorDetail.rating} / 5.0 ({selectedVendorDetail.reviewCount} reviews)</div>
                </div>
                
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setSelectedVendorDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toggleService(selectedVendorDetail.serviceCategory);
                  setSelectedVendorDetail(null);
                  setActiveTab("organize");
                }}
                className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-black uppercase cursor-pointer"
              >
                Include in My Event Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
