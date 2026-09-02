import React, { useState } from "react";
import { 
  Sparkles, Calendar, MapPin, Users, Ticket, ArrowRight, CheckCircle2, 
  Send, Clock, Star, Play, Eye, Share2, HelpCircle, ChevronDown, ChevronUp,
  Clapperboard, Music, Video, Camera, Award, ShieldCheck, DollarSign,
  Building, GraduationCap, PartyPopper, Mic, Layers, Lightbulb, Megaphone,
  Handshake, UserCheck, FileText, X, Check, Search, Plus, MessageSquare, ExternalLink, MessageCircle
} from "lucide-react";

import { 
  EventManagementRequest, 
  PublicEvent, 
  ArtistRequest, 
  SponsorshipRequest, 
  EventPortfolioItem 
} from "../../types/productions";

interface EventManagementSectionProps {
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onBookTickets?: (movieTitle: string) => void;
  requests: EventManagementRequest[];
  onSubmitRequest: (req: EventManagementRequest) => void;
  onUpdateUserRequestResponse?: (id: string, text: string) => void;
  onSendMessage?: (requestId: string, text: string, senderRole?: "client" | "producer") => void;
  publicEvents: PublicEvent[];
  artistRequests: ArtistRequest[];
  onSubmitArtistRequest: (req: ArtistRequest) => void;
  sponsorshipRequests: SponsorshipRequest[];
  onSubmitSponsorshipRequest: (req: SponsorshipRequest) => void;
  portfolioItems: EventPortfolioItem[];
}

export default function EventManagementSection({
  userEmail,
  onOpenAuth,
  onBookTickets,
  requests,
  onSubmitRequest,
  onUpdateUserRequestResponse,
  onSendMessage,
  publicEvents,
  artistRequests,
  onSubmitArtistRequest,
  sponsorshipRequests,
  onSubmitSponsorshipRequest,
  portfolioItems
}: EventManagementSectionProps) {

  // Modals & Active State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isMyRequestsModalOpen, setIsMyRequestsModalOpen] = useState(false);
  const [selectedUserRequest, setSelectedUserRequest] = useState<EventManagementRequest | null>(null);
  const [activePublicEvent, setActivePublicEvent] = useState<PublicEvent | null>(null);
  const [activePortfolioItem, setActivePortfolioItem] = useState<EventPortfolioItem | null>(null);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isSponsorshipModalOpen, setIsSponsorshipModalOpen] = useState(false);
  const [clientChatInput, setClientChatInput] = useState("");
  
  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendClientChat = async (requestId: string) => {
    if (!clientChatInput.trim()) return;
    const text = clientChatInput.trim();
    setClientChatInput("");

    if (onSendMessage) {
      onSendMessage(requestId, text, "client");
    }

    if (selectedUserRequest && (selectedUserRequest.id === requestId || (selectedUserRequest as any).requestId === requestId)) {
      setSelectedUserRequest({
        ...selectedUserRequest,
        messages: [
          ...(selectedUserRequest.messages || []),
          {
            id: `msg-${Date.now()}`,
            sender: "client",
            senderName: userEmail ? userEmail.split("@")[0] : "Client",
            senderEmail: userEmail || undefined,
            text,
            timestamp: new Date().toISOString()
          }
        ]
      });
    }

    showToast("Message sent to CineVenue Event Team!");
  };

  // Portfolio Filter
  const [portfolioCategory, setPortfolioCategory] = useState<string>("All");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // PLAN YOUR EVENT MULTI-STEP FORM STATE
  const [step, setStep] = useState<number>(1);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "Film Event" as EventManagementRequest["eventType"],
    description: "",
    preferredDate: "",
    dateFlexibility: "Exact" as "Exact" | "Flexible",
    preferredTime: "18:00",
    city: "Hyderabad",
    venuePreference: "",
    expectedAudience: "5000",
    servicesRequired: [
      "Event Planning",
      "Venue Management",
      "Stage & Production",
      "Sound & Lighting",
      "Ticketing"
    ] as string[],
    otherServicesText: "",
    budgetRange: "₹5–10 Lakhs" as EventManagementRequest["budgetRange"],
    fullName: userEmail ? userEmail.split("@")[0] : "",
    phone: "",
    email: userEmail || "",
    company: ""
  });

  // Additional info response state for user requests
  const [userResponseText, setUserResponseText] = useState("");

  const handleServiceToggle = (service: string) => {
    if (formData.servicesRequired.includes(service)) {
      setFormData({
        ...formData,
        servicesRequired: formData.servicesRequired.filter(s => s !== service)
      });
    } else {
      setFormData({
        ...formData,
        servicesRequired: [...formData.servicesRequired, service]
      });
    }
  };

  const handlePlanFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CVE-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReq: EventManagementRequest = {
      id: newId,
      userEmail: userEmail || formData.email || "guest@cinevenue.com",
      eventName: formData.eventName || "Untitled CineVenue Event",
      eventType: formData.eventType,
      description: formData.description,
      preferredDate: formData.preferredDate || "2026-11-15",
      dateFlexibility: formData.dateFlexibility,
      preferredTime: formData.preferredTime,
      city: formData.city || "Hyderabad",
      venuePreference: formData.venuePreference,
      expectedAudience: formData.expectedAudience,
      servicesRequired: formData.servicesRequired,
      otherServicesText: formData.otherServicesText,
      budgetRange: formData.budgetRange,
      fullName: formData.fullName || "Valued Client",
      phone: formData.phone || "+91 98765 43210",
      email: formData.email || "client@cinevenue.com",
      company: formData.company,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "Submitted",
      updates: [
        {
          date: new Date().toISOString().split("T")[0],
          title: "Request Submitted",
          note: "Your event management request has been received by CineVenue Productions team.",
          author: "System"
        }
      ]
    };

    onSubmitRequest(newReq);
    setCreatedRequestId(newId);
    setStep(6); // Success screen
  };

  // ARTIST REQUEST FORM STATE
  const [artistForm, setArtistForm] = useState({
    eventName: "",
    artistCategory: "Singers" as ArtistRequest["artistCategory"],
    preferredArtist: "",
    eventDate: "",
    location: "Hyderabad",
    budgetRange: "₹10 Lakhs - ₹25 Lakhs",
    requirements: "",
    fullName: userEmail ? userEmail.split("@")[0] : "",
    phone: "",
    email: userEmail || ""
  });

  const handleArtistFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newArtReq: ArtistRequest = {
      id: `ART-${Math.floor(1000 + Math.random() * 9000)}`,
      userEmail: userEmail || artistForm.email,
      eventName: artistForm.eventName || "My Event",
      artistCategory: artistForm.artistCategory,
      preferredArtist: artistForm.preferredArtist || "Requested Performer",
      eventDate: artistForm.eventDate || "2026-11-20",
      location: artistForm.location,
      budgetRange: artistForm.budgetRange,
      requirements: artistForm.requirements,
      fullName: artistForm.fullName,
      phone: artistForm.phone,
      email: artistForm.email,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "Submitted"
    };
    onSubmitArtistRequest(newArtReq);
    setIsArtistModalOpen(false);
    showToast("🎤 Artist request submitted! Our talent manager will reach out shortly.");
  };

  // SPONSORSHIP REQUEST FORM STATE
  const [sponForm, setSponForm] = useState({
    eventName: "",
    eventType: "Concert",
    eventDate: "",
    location: "Hyderabad",
    expectedAudience: "10,000+",
    sponsorshipRequirement: "Title Sponsor / Co-Sponsor",
    targetBrandCategories: "Automotive, Tech, Beverages, Fashion",
    budgetRequirement: "₹15 Lakhs+",
    description: "",
    fullName: userEmail ? userEmail.split("@")[0] : "",
    phone: "",
    email: userEmail || ""
  });

  const handleSponFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSponReq: SponsorshipRequest = {
      id: `SPON-${Math.floor(1000 + Math.random() * 9000)}`,
      userEmail: userEmail || sponForm.email,
      eventName: sponForm.eventName || "My Event",
      eventType: sponForm.eventType,
      eventDate: sponForm.eventDate || "2026-12-01",
      location: sponForm.location,
      expectedAudience: sponForm.expectedAudience,
      sponsorshipRequirement: sponForm.sponsorshipRequirement,
      targetBrandCategories: sponForm.targetBrandCategories,
      budgetRequirement: sponForm.budgetRequirement,
      description: sponForm.description,
      fullName: sponForm.fullName,
      phone: sponForm.phone,
      email: sponForm.email,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "Received"
    };
    onSubmitSponsorshipRequest(newSponReq);
    setIsSponsorshipModalOpen(false);
    showToast("🤝 Sponsorship support request submitted to CineVenue Brand Desk.");
  };

  // Filtered portfolio
  const filteredPortfolio = portfolioItems.filter(item => {
    if (portfolioCategory === "All") return true;
    return item.category === portfolioCategory;
  });

  // User's requests
  const userRequests = userEmail 
    ? requests.filter(r => r.userEmail.toLowerCase() === userEmail.toLowerCase())
    : requests;

  const ALL_SERVICES_CHECKBOXES = [
    "Event Planning", "Venue Management", "Artist Management", 
    "Stage & Production", "Sound & Lighting", "LED Screens", 
    "Marketing & Promotion", "Sponsorship", "Ticketing", 
    "Security", "Photography", "Videography", 
    "Celebrity Management", "Guest/VIP Management", "Complete Event Management", "Other"
  ];

  const EVENT_CATEGORIES = [
    {
      title: "🎬 FILM EVENTS",
      items: ["Movie premieres", "Pre-release events", "Audio launches", "Trailer launches", "Press meets", "Success meets", "Celebrity events", "Film promotional events"],
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
      typeKey: "Film Event"
    },
    {
      title: "🎤 ENTERTAINMENT EVENTS",
      items: ["Concerts", "Live performances", "DJ nights", "Stage shows", "Music festivals", "Cultural festivals"],
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      typeKey: "Entertainment Event"
    },
    {
      title: "🏢 CORPORATE EVENTS",
      items: ["Corporate events", "Conferences", "Product launches", "Award functions", "Team events", "Brand activations"],
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
      typeKey: "Corporate Event"
    },
    {
      title: "🎓 COLLEGE & YOUTH EVENTS",
      items: ["College festivals", "Cultural programs", "Celebrity appearances", "Competitions", "DJ events", "Youth festivals"],
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
      typeKey: "College & Youth Event"
    },
    {
      title: "🎪 PRIVATE & CUSTOM EVENTS",
      items: ["Private celebrations", "Special occasions", "Custom events", "Other event requirements"],
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      typeKey: "Private & Custom Event"
    }
  ];

  const COMPLETE_SOLUTIONS = [
    { icon: Lightbulb, title: "💡 Concept & Planning", desc: "Event concept development, planning and execution strategy." },
    { icon: Building, title: "🏟️ Venue Management", desc: "Venue selection, coordination, setup and management." },
    { icon: Mic, title: "🎤 Artist Management", desc: "Artists, celebrities, singers, DJs, dancers, anchors, speakers and performers." },
    { icon: Clapperboard, title: "🎬 Event Production", desc: "Stage, sound, lighting, LED screens, technical production and backstage management." },
    { icon: Layers, title: "🎨 Creative & Design", desc: "Posters, invitations, stage branding, event identity and digital creatives." },
    { icon: Megaphone, title: "📢 Marketing & Promotion", desc: "Social media campaigns, influencers, media promotion, digital marketing and promotional content." },
    { icon: Handshake, title: "🤝 Sponsorship & Brand Integration", desc: "Help connect events with suitable sponsorship and brand opportunities." },
    { icon: Ticket, title: "🎟️ Ticketing", desc: "Integrated CineVenue event ticketing system for instant QR access & live sales tracking." },
    { icon: UserCheck, title: "👥 Guest & VIP Management", desc: "Invitations, VIP handling, guest management and check-in support." },
    { icon: Camera, title: "📸 Media Production", desc: "Photography, videography, reels, BTS and event aftermovies." }
  ];

  const FAQS = [
    { q: "What types of events does CineVenue manage?", a: "CineVenue Productions manages film premieres, audio launches, live music concerts, corporate conferences, college cultural festivals, award functions, and private custom celebrations." },
    { q: "Can CineVenue manage the complete event?", a: "Yes! We offer 360-degree turnkey event management from initial concept and venue sourcing to artist booking, stage production, marketing, and ticketing." },
    { q: "Can CineVenue arrange artists?", a: "Our extensive talent network connects you directly with A-list actors, playback singers, international DJs, bands, dancers, anchors, and celebrity influencers." },
    { q: "Can CineVenue help find a venue?", a: "Yes, we partner with top stadiums, auditoriums, convention centers, 5-star hotels, and outdoor grounds across major cities." },
    { q: "Can CineVenue provide stage and technical production?", a: "We provide state-of-the-art L-Acoustics sound, 8K curved LED stage walls, intelligent lighting arrays, pyrotechnics, and drone light shows." },
    { q: "Can CineVenue promote my event?", a: "We leverage CineVenue's media network, influencer partnerships, social channels, and in-theatre multiplex screens to maximize attendance." },
    { q: "Can CineVenue arrange sponsorship opportunities?", a: "Yes! CineVenue Brand Studio connects prominent corporate brands with event opportunities for co-branding, stall spaces, and title sponsorships." },
    { q: "Can CineVenue sell tickets?", a: "Directly through the existing CineVenue ticketing engine! Audiences can discover your event and purchase seats with QR check-in integration." },
    { q: "How early should I contact CineVenue?", a: "For large arena events or college fests, we recommend contacting us 4–8 weeks in advance. For corporate or private events, 2–4 weeks is ideal." },
    { q: "Can I request a customized event package?", a: "Absolutely. You can select specific services like artist booking or stage production, or choose complete turnkey management." }
  ];

  return (
    <div id="event-management-subsite" className="min-h-screen bg-[#060608] text-white font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black py-20 px-6 border-b border-white/10">
        
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80" 
            alt="CineVenue Events" 
            className="w-full h-full object-cover object-center opacity-30 scale-105 animate-pulse"
            style={{ animationDuration: "14s" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/80 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/80 border border-gold/50 text-gold text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-gold/10">
            <PartyPopper className="w-4 h-4 text-gold" />
            <span>CINEVENUE PRODUCTIONS • EVENT MANAGEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-serif tracking-tight text-white leading-tight uppercase">
            YOUR EVENT. OUR PRODUCTION. <span className="bg-gradient-to-r from-amber-400 via-gold to-yellow-300 bg-clip-text text-transparent">YOUR MOMENT.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl font-light text-white/90 max-w-3xl mx-auto leading-relaxed font-sans">
            From concept to execution, CineVenue Productions creates and manages memorable events with professional production, entertainment, technology, branding and audience experiences.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setStep(1);
                setIsPlanModalOpen(true);
              }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 shadow-2xl shadow-gold/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4.5 h-4.5 fill-current" />
              <span>PLAN YOUR EVENT</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("discover-events");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-widest transition-all border border-white/20 cursor-pointer flex items-center gap-2 backdrop-blur-md"
            >
              <Ticket className="w-4.5 h-4.5 text-gold" />
              <span>EXPLORE OUR EVENTS</span>
            </button>

            <button
              onClick={() => setIsMyRequestsModalOpen(true)}
              className="px-6 py-4 rounded-xl bg-black/70 hover:bg-black/90 text-gold font-bold text-xs uppercase tracking-widest transition-all border border-gold/40 cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>MY EVENT REQUESTS ({userRequests.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. EVENTS WE MANAGE */}
      <section className="py-20 px-6 bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
              <Clapperboard className="w-3.5 h-3.5" /> Versatile Event Categories
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
              EVENTS WE MANAGE
            </h2>
            <p className="text-sm text-white/60 leading-relaxed font-sans">
              From high-octane movie audio launches to 50,000-guest music festivals and corporate leadership summits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {EVENT_CATEGORIES.map((cat, idx) => (
              <div 
                key={idx}
                className="bg-[#12131A] border border-white/10 hover:border-gold/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12131A] via-transparent to-black/60" />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-gold/30 text-gold font-bold text-xs">
                      {cat.title}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <ul className="grid grid-cols-2 gap-2 text-xs text-white/80">
                      {cat.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, eventType: cat.typeKey as any });
                      setStep(1);
                      setIsPlanModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-wider transition-all border border-white/15 cursor-pointer flex items-center justify-center gap-2 group-hover:bg-gold group-hover:text-black"
                  >
                    <span>PLAN {cat.typeKey.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. COMPLETE EVENT SOLUTIONS */}
      <section className="py-20 px-6 bg-[#070709] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" /> Turnkey Production Services
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
              COMPLETE EVENT SOLUTIONS
            </h2>
            <p className="text-sm text-white/60 leading-relaxed font-sans">
              End-to-end expertise delivering flawless audio-visual production, guest logistics, and ticketing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {COMPLETE_SOLUTIONS.map((sol, idx) => {
              const IconComp = sol.icon;
              return (
                <div 
                  key={idx}
                  className="bg-[#101117] border border-white/10 hover:border-gold/50 rounded-2xl p-5 space-y-3 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-gold/5 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-gold/20 border border-gold/40 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-white leading-snug">{sol.title}</h3>
                  <p className="text-[11px] text-white/60 leading-relaxed">{sol.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DISCOVER CINEVENUE EVENTS (PUBLIC EVENTS) */}
      <section id="discover-events" className="py-20 px-6 bg-[#0C0D12] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
                <Ticket className="w-3.5 h-3.5" /> Public Attendance
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
                DISCOVER CINEVENUE EVENTS
              </h2>
              <p className="text-sm text-white/60 font-sans">
                Book tickets for public concerts, movie premieres, audio launches & festivals directly through CineVenue.
              </p>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setIsPlanModalOpen(true);
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-gold/20 self-start md:self-auto flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>ORGANIZE YOUR OWN EVENT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publicEvents.map((evt) => (
              <div 
                key={evt.id}
                className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/15 group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={evt.coverUrl || evt.posterUrl} 
                      alt={evt.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14151D] via-transparent to-black/60" />
                    
                    <div className="absolute top-4 left-4 bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                      {evt.category}
                    </div>

                    {evt.startingTicketPrice && (
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-gold/40 text-gold px-3 py-1 rounded-full text-xs font-extrabold">
                        From ₹{evt.startingTicketPrice}
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-gold transition-colors leading-snug">
                      {evt.title}
                    </h3>

                    <div className="space-y-2 text-xs text-white/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gold shrink-0" />
                        <span>{evt.date} • {evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="truncate">{evt.venue}, {evt.city}</span>
                      </div>
                      {evt.artists && evt.artists.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">Featuring: {evt.artists.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <button
                    onClick={() => setActivePublicEvent(evt)}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/15 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-gold" />
                    <span>VIEW DETAILS</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onBookTickets) {
                        onBookTickets(evt.ticketMovieTitle || evt.title);
                      } else {
                        showToast(`🎟️ Opening CineVenue Ticketing for ${evt.title}...`);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-gold text-black text-xs font-extrabold uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-md shadow-gold/20 flex items-center justify-center gap-1.5"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>BOOK TICKETS</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ARTISTS & ENTERTAINMENT ("MAKE YOUR EVENT UNFORGETTABLE") */}
      <section className="py-20 px-6 bg-[#070709] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                <Mic className="w-3.5 h-3.5" /> Celebrity & Talent Booking
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
                MAKE YOUR EVENT UNFORGETTABLE
              </h2>
              <p className="text-sm text-white/60 font-sans">
                Book A-list actors, top playback singers, international DJs, bands, comedians & speakers.
              </p>
            </div>

            <button
              onClick={() => setIsArtistModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 self-start md:self-auto flex items-center gap-2 shrink-0"
            >
              <Mic className="w-4 h-4" />
              <span>REQUEST AN ARTIST</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: "Actors", icon: Clapperboard, count: "150+ Celebrities" },
              { title: "Singers", icon: Mic, count: "80+ Playback Singers" },
              { title: "DJs", icon: Music, count: "40+ Club & EDM DJs" },
              { title: "Bands", icon: Music, count: "25+ Live Bands" },
              { title: "Dancers", icon: Users, count: "50+ Troupes" },
              { title: "Anchors", icon: Mic, count: "60+ Celebrity MCs" },
              { title: "Comedians", icon: PartyPopper, count: "30+ Standup Artists" },
              { title: "Influencers", icon: Megaphone, count: "200+ Digital Creators" },
              { title: "Speakers", icon: Users, count: "45+ Keynote Speakers" },
              { title: "Other Performers", icon: Sparkles, count: "Magicians & Illusionists" }
            ].map((cat, i) => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={i} 
                  onClick={() => {
                    setArtistForm({ ...artistForm, artistCategory: cat.title as any });
                    setIsArtistModalOpen(true);
                  }}
                  className="bg-[#101117] border border-white/10 hover:border-emerald-500/50 rounded-2xl p-5 space-y-2 cursor-pointer transition-all hover:-translate-y-1 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-serif font-bold text-white group-hover:text-emerald-400 transition-colors">{cat.title}</h4>
                  <p className="text-[10px] text-white/50">{cat.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. SPONSORSHIP ("LOOKING FOR EVENT SPONSORS?") */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#0D0E14] via-[#08090D] to-black border-b border-white/10">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-amber-500/10 via-gold/10 to-yellow-500/10 border border-gold/30 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-[10px] font-bold uppercase tracking-widest">
              <Handshake className="w-3.5 h-3.5" /> Brand Partnerships
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight uppercase">
              LOOKING FOR EVENT SPONSORS?
            </h2>
            <p className="text-sm text-white/80 leading-relaxed font-sans">
              CineVenue Brand Studio helps connect high-potential events, college festivals, and concerts with suitable brand sponsors, corporate partners, and beverage sponsors.
            </p>
          </div>

          <button
            onClick={() => setIsSponsorshipModalOpen(true)}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 shadow-2xl shadow-gold/25 transition-all cursor-pointer shrink-0 flex items-center gap-2"
          >
            <Handshake className="w-4.5 h-4.5 fill-current" />
            <span>REQUEST SPONSORSHIP SUPPORT</span>
          </button>
        </div>
      </section>

      {/* 7. EVENT PORTFOLIO */}
      <section className="py-20 px-6 bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" /> Track Record
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
                OUR EVENT PORTFOLIO
              </h2>
              <p className="text-sm text-white/60 font-sans">
                Explore iconic concerts, movie pre-releases, and corporate summits produced by CineVenue.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {["All", "Concerts", "Film Events", "Corporate Events", "College Events", "Brand Events", "Festivals", "Celebrity Events"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPortfolioCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    portfolioCategory === cat 
                      ? "bg-gold text-black shadow-md shadow-gold/20" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPortfolio.map((item) => (
              <div 
                key={item.id}
                onClick={() => setActivePortfolioItem(item)}
                className="bg-[#14151D] border border-white/10 hover:border-gold/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gold/10 group flex flex-col sm:flex-row"
              >
                <div className="sm:w-1/2 h-56 sm:h-auto relative overflow-hidden">
                  <img 
                    src={item.coverImage} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-gold border border-gold/30">
                    {item.year} • {item.category}
                  </div>
                </div>

                <div className="sm:w-1/2 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-gold transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">{item.location}</p>
                    <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                    <span className="text-white/50">{item.artists?.length || 0} Featured Artists</span>
                    <span className="text-gold font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      VIEW CASE STUDY <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. EVENT GALLERY */}
      <section className="py-20 px-6 bg-[#070709] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
              <Camera className="w-3.5 h-3.5" /> Visual Showcase
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
              EVENT GALLERY & HIGHLIGHTS
            </h2>
            <p className="text-sm text-white/60 leading-relaxed font-sans">
              High-resolution moments, drone aftermovies & behind-the-scenes production stills.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
              "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
              "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
              "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80"
            ].map((imgUrl, idx) => (
              <div key={idx} className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer border border-white/10 hover:border-gold/50">
                <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-gold/40 flex items-center justify-center text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. WHY CINEVENUE */}
      <section className="py-20 px-6 bg-[#0B0C10] border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
              WHY CINEVENUE EVENT MANAGEMENT
            </h2>
            <p className="text-sm text-white/60 leading-relaxed font-sans">
              Trusted by major film production houses, global corporations, and top universities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "COMPLETE EVENT SOLUTIONS", desc: "From concept development and venue sourcing to stage lighting, artists, and live broadcasting." },
              { title: "ENTERTAINMENT NETWORK", desc: "Direct access to top cinema stars, singers, DJs, anchors, and international performers." },
              { title: "PROFESSIONAL PRODUCTION", desc: "State-of-the-art 8K LED walls, L-Acoustics audio rigs, drone shows, and pyrotechnics." },
              { title: "EVENT PROMOTION", desc: "Multi-channel marketing through multiplex screens, influencers, and digital media campaigns." },
              { title: "BRAND CONNECTIONS", desc: "CineVenue Brand Studio matches events with prominent corporate sponsors." },
              { title: "INTEGRATED TICKETING", desc: "Seamless ticket sales, QR entry validation, and real-time revenue analytics." }
            ].map((pillar, i) => (
              <div key={i} className="bg-[#12131A] border border-white/10 rounded-2xl p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-xs">
                  0{i + 1}
                </div>
                <h3 className="text-base font-serif font-bold text-white">{pillar.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed font-sans">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ SECTION */}
      <section className="py-20 px-6 bg-[#070709] border-b border-white/10">
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold uppercase tracking-widest">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight uppercase">
              EVENT MANAGEMENT FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-[#12131A] border border-white/10 rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-serif font-bold text-sm text-white flex items-center justify-between gap-4 cursor-pointer hover:text-gold transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gold shrink-0" /> : <ChevronDown className="w-5 h-5 text-white/50 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-white/70 leading-relaxed border-t border-white/5 pt-3 font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. CONTACT CTA */}
      <section className="py-20 px-6 bg-gradient-to-t from-black via-[#0A0B0E] to-[#070709] text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight uppercase">
            HAVE AN EVENT IN MIND?
          </h2>
          <p className="text-lg text-gold font-serif font-bold">
            Let's build it together.
          </p>
          <p className="text-xs text-white/60 max-w-xl mx-auto leading-relaxed">
            Contact CineVenue Productions today for a custom event proposal, venue consultation, or artist booking quote.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setStep(1);
                setIsPlanModalOpen(true);
              }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 shadow-2xl shadow-gold/25 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4.5 h-4.5 fill-current" />
              <span>PLAN YOUR EVENT</span>
            </button>

            <a
              href="mailto:events@cinevenue.com"
              className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-widest transition-all border border-white/20 cursor-pointer flex items-center gap-2"
            >
              <FileText className="w-4.5 h-4.5 text-gold" />
              <span>CONTACT CINEVENUE</span>
            </a>
          </div>
        </div>
      </section>


      {/* ================= MODALS & DRAWERS ================= */}

      {/* 1. PLAN YOUR EVENT MULTI-STEP FORM MODAL */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111219] border border-gold/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-black via-[#14151E] to-black border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" /> PLAN YOUR EVENT — CINEVENUE PRODUCTIONS
                </h3>
                <p className="text-xs text-white/50">Submit your event requirements for expert consultation</p>
              </div>
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Indicator */}
            {step < 6 && (
              <div className="bg-[#0B0C10] px-6 py-3 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white/60">
                <span className={step >= 1 ? "text-gold" : ""}>1. Details</span>
                <span>→</span>
                <span className={step >= 2 ? "text-gold" : ""}>2. Services</span>
                <span>→</span>
                <span className={step >= 3 ? "text-gold" : ""}>3. Budget</span>
                <span>→</span>
                <span className={step >= 4 ? "text-gold" : ""}>4. Contact</span>
                <span>→</span>
                <span className={step >= 5 ? "text-gold" : ""}>5. Summary</span>
              </div>
            )}

            {/* Modal Content / Form Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* STEP 1: EVENT DETAILS */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-base font-serif font-bold text-gold uppercase">STEP 1 — EVENT DETAILS</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Event Name *</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Annual Alumni Gala 2026"
                        value={formData.eventName}
                        onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Event Type *</label>
                      <select
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value as any })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none"
                      >
                        <option value="Film Event">🎬 Film Event (Premiere, Audio Launch, Trailer)</option>
                        <option value="Entertainment Event">🎤 Entertainment Event (Concert, DJ Night)</option>
                        <option value="Corporate Event">🏢 Corporate Event (Summit, Launch, Gala)</option>
                        <option value="College & Youth Event">🎓 College & Youth Event (Fest, Contest)</option>
                        <option value="Private & Custom Event">🎪 Private & Custom Event</option>
                        <option value="Other">Other Event Requirement</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="text-white/80 font-bold">Event Description / Vision</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what you want to achieve with this event..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-[#1A1C28] border border-white/15 rounded-xl p-3 text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Preferred Date *</label>
                      <input 
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Date Flexibility</label>
                      <select
                        value={formData.dateFlexibility}
                        onChange={(e) => setFormData({ ...formData, dateFlexibility: e.target.value as any })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                      >
                        <option value="Exact">Exact Date Required</option>
                        <option value="Flexible">Flexible Date Range</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Preferred Time</label>
                      <input 
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">City *</label>
                      <input 
                        type="text"
                        placeholder="e.g. Hyderabad, Bengaluru"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Preferred Venue / Location</label>
                      <input 
                        type="text"
                        placeholder="e.g. HICC, LB Stadium, Campus"
                        value={formData.venuePreference}
                        onChange={(e) => setFormData({ ...formData, venuePreference: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Expected Audience Size</label>
                      <input 
                        type="text"
                        placeholder="e.g. 5,000 guests"
                        value={formData.expectedAudience}
                        onChange={(e) => setFormData({ ...formData, expectedAudience: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-gold text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>NEXT: SERVICES</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: EVENT REQUIREMENTS */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-base font-serif font-bold text-gold uppercase">STEP 2 — EVENT REQUIREMENTS</h4>
                  <p className="text-xs text-white/60">Select all services you require from CineVenue Productions:</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {ALL_SERVICES_CHECKBOXES.map((srv) => {
                      const isChecked = formData.servicesRequired.includes(srv);
                      return (
                        <div
                          key={srv}
                          onClick={() => handleServiceToggle(srv)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                            isChecked 
                              ? "bg-gold/20 border-gold text-gold font-bold" 
                              : "bg-[#1A1C28] border-white/10 text-white/70 hover:border-white/30"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isChecked ? "bg-gold text-black" : "border border-white/40"}`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{srv}</span>
                        </div>
                      );
                    })}
                  </div>

                  {formData.servicesRequired.includes("Other") && (
                    <div className="space-y-1.5 text-xs pt-2">
                      <label className="text-white/80 font-bold">Specify Other Requirement</label>
                      <input 
                        type="text"
                        placeholder="Detail any custom requirements..."
                        value={formData.otherServicesText}
                        onChange={(e) => setFormData({ ...formData, otherServicesText: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
                    >
                      BACK
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-gold text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>NEXT: BUDGET</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: BUDGET */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-base font-serif font-bold text-gold uppercase">STEP 3 — APPROXIMATE BUDGET</h4>
                  <p className="text-xs text-white/60">Select an estimated budget range for your event:</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      "Under ₹1 Lakh",
                      "₹1–5 Lakhs",
                      "₹5–10 Lakhs",
                      "₹10–25 Lakhs",
                      "₹25 Lakhs+",
                      "I want to discuss the budget"
                    ].map((bOption) => {
                      const isSelected = formData.budgetRange === bOption;
                      return (
                        <div
                          key={bOption}
                          onClick={() => setFormData({ ...formData, budgetRange: bOption as any })}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? "bg-gold/20 border-gold text-gold font-bold" 
                              : "bg-[#1A1C28] border-white/10 text-white/70 hover:border-white/30"
                          }`}
                        >
                          <span>{bOption}</span>
                          <div className={`w-4 h-4 rounded-full border ${isSelected ? "bg-gold border-gold" : "border-white/40"}`} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
                    >
                      BACK
                    </button>
                    <button
                      onClick={() => setStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-gold text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>NEXT: CONTACT DETAILS</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: CONTACT DETAILS */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-base font-serif font-bold text-gold uppercase">STEP 4 — CONTACT DETAILS</h4>
                  <p className="text-xs text-white/60">Provide your contact details for our event producer to reach you:</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Full Name *</label>
                      <input 
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Phone Number *</label>
                      <input 
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Email Address *</label>
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-white/80 font-bold">Company / Organization</label>
                      <input 
                        type="text"
                        placeholder="e.g. Student Council / Brand Co"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
                    >
                      BACK
                    </button>
                    <button
                      onClick={() => setStep(5)}
                      className="px-6 py-2.5 rounded-xl bg-gold text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>REVIEW SUMMARY</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: FINAL REQUEST SUMMARY */}
              {step === 5 && (
                <div className="space-y-6">
                  <h4 className="text-base font-serif font-bold text-gold uppercase">STEP 5 — YOUR EVENT REQUEST SUMMARY</h4>
                  
                  <div className="bg-[#1A1C28] border border-white/10 rounded-2xl p-6 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-white/80">
                      <div><span className="text-white/40">Event Name:</span> <strong className="text-white">{formData.eventName || "N/A"}</strong></div>
                      <div><span className="text-white/40">Type:</span> <strong className="text-gold">{formData.eventType}</strong></div>
                      <div><span className="text-white/40">Date:</span> <strong className="text-white">{formData.preferredDate} ({formData.dateFlexibility})</strong></div>
                      <div><span className="text-white/40">Location:</span> <strong className="text-white">{formData.city} ({formData.venuePreference || "TBD"})</strong></div>
                      <div><span className="text-white/40">Audience:</span> <strong className="text-white">{formData.expectedAudience}</strong></div>
                      <div><span className="text-white/40">Budget:</span> <strong className="text-emerald-400">{formData.budgetRange}</strong></div>
                      <div><span className="text-white/40">Contact:</span> <strong className="text-white">{formData.fullName} ({formData.phone})</strong></div>
                      <div><span className="text-white/40">Email:</span> <strong className="text-white">{formData.email}</strong></div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <span className="text-white/40 block mb-1">Requested Services ({formData.servicesRequired.length}):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.servicesRequired.map(s => (
                          <span key={s} className="bg-gold/20 text-gold px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(4)}
                      className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer"
                    >
                      EDIT DETAILS
                    </button>
                    <button
                      onClick={handlePlanFormSubmit}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 shadow-xl shadow-gold/20 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-4 h-4 fill-current" />
                      <span>SUBMIT EVENT REQUEST</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: REQUEST SUCCESS SCREEN */}
              {step === 6 && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                    🎉
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white uppercase">
                    EVENT REQUEST RECEIVED
                  </h3>

                  <p className="text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                    Your event request has been successfully submitted to <strong>CineVenue Productions</strong>.
                  </p>

                  <div className="inline-block bg-black/60 border border-gold/40 text-gold px-6 py-2.5 rounded-xl font-mono text-sm font-bold tracking-widest">
                    Request ID: {createdRequestId}
                  </div>

                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    Our event management team will review your requirements and contact you regarding the next steps.
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button
                      onClick={() => {
                        setIsPlanModalOpen(false);
                        setIsMyRequestsModalOpen(true);
                      }}
                      className="px-6 py-3 rounded-xl bg-gold text-black font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all cursor-pointer"
                    >
                      VIEW MY REQUEST
                    </button>

                    <button
                      onClick={() => setIsPlanModalOpen(false)}
                      className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer"
                    >
                      BACK TO EVENT MANAGEMENT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MY EVENT REQUESTS MODAL */}
      {isMyRequestsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111219] border border-gold/40 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
            
            <div className="bg-black border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" /> MY EVENT REQUESTS
                </h3>
                <p className="text-xs text-white/50">Track your event proposals, statuses, and team updates</p>
              </div>
              <button 
                onClick={() => setIsMyRequestsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {userRequests.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-sm text-white/60">You have not submitted any event management requests yet.</p>
                  <button
                    onClick={() => {
                      setIsMyRequestsModalOpen(false);
                      setStep(1);
                      setIsPlanModalOpen(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gold text-black text-xs font-extrabold uppercase tracking-wider"
                  >
                    PLAN YOUR FIRST EVENT
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userRequests.map((req) => (
                    <div 
                      key={req.id}
                      onClick={() => setSelectedUserRequest(req)}
                      className="bg-[#181924] border border-white/10 hover:border-gold/50 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-1 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gold font-bold">{req.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                          {req.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-serif font-bold text-white">{req.eventName}</h4>

                      <div className="text-xs text-white/60 space-y-1">
                        <div>Type: <span className="text-white">{req.eventType}</span></div>
                        <div>Date: <span className="text-white">{req.preferredDate}</span></div>
                        <div>Submitted: <span className="text-white">{req.submittedAt}</span></div>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gold font-bold">
                        <span>View Details & Timeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. USER EVENT REQUEST DETAILS MODAL */}
      {selectedUserRequest && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#12131C] border border-gold/50 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
            
            <div className="bg-black border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-gold font-bold">{selectedUserRequest.id}</span>
                <h3 className="text-lg font-serif font-bold text-white uppercase">{selectedUserRequest.eventName}</h3>
              </div>
              <button 
                onClick={() => setSelectedUserRequest(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-xs text-white/80">
              {/* Status Pipeline Tracker */}
              <div className="bg-[#1A1C28] p-4 rounded-xl space-y-2">
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-wider block">STATUS TRACKER</span>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  {[
                    "Submitted", "Under Review", "Discussion", 
                    "Proposal", "Confirmed", "Planning", "Event Day", "Completed"
                  ].map((st, i) => {
                    const isCurrent = selectedUserRequest.status === st;
                    return (
                      <div key={st} className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold ${isCurrent ? "bg-gold text-black" : "bg-white/10 text-white/50"}`}>
                          {st}
                        </span>
                        {i < 7 && <span className="text-white/20">→</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Additional Information Required Box */}
              {selectedUserRequest.additionalInfoPrompt && (
                <div className="bg-amber-500/15 border border-amber-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                    <HelpCircle className="w-4 h-4" /> Additional Information Required By CineVenue Team
                  </div>
                  <p className="text-white text-xs">{selectedUserRequest.additionalInfoPrompt}</p>

                  <div className="space-y-2 pt-2">
                    <textarea 
                      rows={3}
                      placeholder="Type your response here..."
                      value={userResponseText}
                      onChange={(e) => setUserResponseText(e.target.value)}
                      className="w-full bg-black/60 border border-white/20 rounded-xl p-3 text-white focus:border-gold outline-none text-xs"
                    />
                    <button
                      onClick={() => {
                        if (onUpdateUserRequestResponse) {
                          onUpdateUserRequestResponse(selectedUserRequest.id, userResponseText);
                          showToast("Response sent to CineVenue event admin!");
                          setSelectedUserRequest(null);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-gold text-black font-extrabold text-xs uppercase cursor-pointer"
                    >
                      SUBMIT RESPONSE
                    </button>
                  </div>
                </div>
              )}

              {/* Event Information */}
              <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
                <div>Event Type: <strong className="text-white">{selectedUserRequest.eventType}</strong></div>
                <div>Preferred Date: <strong className="text-white">{selectedUserRequest.preferredDate}</strong></div>
                <div>Location: <strong className="text-white">{selectedUserRequest.city} ({selectedUserRequest.venuePreference || "TBD"})</strong></div>
                <div>Expected Audience: <strong className="text-white">{selectedUserRequest.expectedAudience}</strong></div>
                <div>Budget Range: <strong className="text-emerald-400">{selectedUserRequest.budgetRange}</strong></div>
                <div>Assigned Lead: <strong className="text-gold">{selectedUserRequest.assignedTeamMember || "CineVenue Event Desk"}</strong></div>
              </div>

              {/* Requested Services */}
              <div className="space-y-2">
                <span className="font-bold text-white uppercase tracking-wider block">Requested Services</span>
                <div className="flex flex-wrap gap-2">
                  {selectedUserRequest.servicesRequired.map(s => (
                    <span key={s} className="bg-white/10 border border-white/15 px-3 py-1 rounded-full text-[11px] text-white">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Client Messages & Producer Communication Thread */}
              <div className="bg-[#0D0E16] border border-[#D4AF37]/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gold" />
                    <span className="font-bold text-white text-xs uppercase tracking-wide">
                      Event Discussion Thread ({selectedUserRequest.messages?.length || 0} messages)
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50">
                    Lead: {selectedUserRequest.assignedTeamMember || "CineVenue Event Lead"}
                  </span>
                </div>

                {/* Messages Container */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(!selectedUserRequest.messages || selectedUserRequest.messages.length === 0) ? (
                    <div className="text-center py-4 bg-black/40 rounded-lg border border-white/5 text-white/50 text-[11px]">
                      No messages exchanged yet. Send a question or update to the event production team below.
                    </div>
                  ) : (
                    selectedUserRequest.messages.map((m, idx) => {
                      const isClient = m.sender === "client";
                      return (
                        <div key={m.id || idx} className={`flex flex-col ${isClient ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-1.5 mb-0.5 text-[9px] text-white/40">
                            <span className="font-bold text-white/80">{m.senderName || (isClient ? "You" : "Event Producer")}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                              isClient ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"
                            }`}>
                              {isClient ? "Client" : "CineVenue Producer"}
                            </span>
                            <span>•</span>
                            <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div className={`p-2.5 rounded-xl max-w-sm text-xs leading-relaxed ${
                            isClient
                              ? "bg-gradient-to-r from-amber-500/25 to-[#D4AF37]/30 border border-[#D4AF37]/50 text-white rounded-tr-none"
                              : "bg-[#181A26] border border-white/10 text-white/90 rounded-tl-none"
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Input Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    placeholder="Type a message or question for your event manager..."
                    value={clientChatInput}
                    onChange={(e) => setClientChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendClientChat(selectedUserRequest.id);
                    }}
                    className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-gold"
                  />
                  <button
                    onClick={() => handleSendClientChat(selectedUserRequest.id)}
                    className="px-4 py-2 bg-gold hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* CineVenue Team Updates */}
              {selectedUserRequest.updates && selectedUserRequest.updates.length > 0 && (
                <div className="space-y-3">
                  <span className="font-bold text-white uppercase tracking-wider block">CineVenue Team Updates</span>
                  <div className="space-y-2">
                    {selectedUserRequest.updates.map((u, idx) => (
                      <div key={idx} className="bg-[#1A1C28] p-3 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gold font-bold">
                          <span>{u.title}</span>
                          <span>{u.date}</span>
                        </div>
                        <p className="text-xs text-white/80">{u.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. PUBLIC EVENT DETAILS MODAL */}
      {activePublicEvent && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111219] border border-gold/50 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8">
            
            <div className="relative h-72">
              <img 
                src={activePublicEvent.coverUrl || activePublicEvent.posterUrl} 
                alt={activePublicEvent.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111219] via-[#111219]/60 to-transparent" />
              
              <button 
                onClick={() => setActivePublicEvent(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/80 text-white flex items-center justify-center cursor-pointer border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {activePublicEvent.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">{activePublicEvent.title}</h2>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-white/80 bg-black/50 p-4 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold shrink-0" />
                  <div>
                    <span className="text-white/40 block">Date & Time</span>
                    <strong>{activePublicEvent.date} • {activePublicEvent.time}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-white/40 block">Venue</span>
                    <strong>{activePublicEvent.venue}, {activePublicEvent.city}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-white/40 block">Starting Price</span>
                    <strong>₹{activePublicEvent.startingTicketPrice || 499}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-white/80 leading-relaxed font-sans">
                <h4 className="font-serif font-bold text-sm text-gold uppercase">About The Event</h4>
                <p>{activePublicEvent.description}</p>
              </div>

              {activePublicEvent.artists && activePublicEvent.artists.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-sm text-gold uppercase">Featured Performing Artists</h4>
                  <div className="flex flex-wrap gap-2">
                    {activePublicEvent.artists.map(art => (
                      <span key={art} className="bg-gold/10 border border-gold/30 text-gold px-3 py-1 rounded-full font-bold">
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activePublicEvent.highlights && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-serif font-bold text-sm text-gold uppercase">Event Highlights</h4>
                  <ul className="grid grid-cols-2 gap-2 text-white/80">
                    {activePublicEvent.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast("🔗 Event share link copied to clipboard!");
                  }}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/15 cursor-pointer flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-gold" />
                  <span>SHARE EVENT</span>
                </button>

                <button
                  onClick={() => {
                    if (onBookTickets) {
                      onBookTickets(activePublicEvent.ticketMovieTitle || activePublicEvent.title);
                    } else {
                      showToast(`🎟️ Connecting to CineVenue ticketing system for ${activePublicEvent.title}`);
                    }
                  }}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-gold/20 cursor-pointer flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4 fill-current" />
                  <span>BOOK TICKETS NOW</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. PORTFOLIO CASE STUDY DETAILS MODAL */}
      {activePortfolioItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111219] border border-gold/50 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
            
            <div className="bg-black p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-gold font-bold uppercase">{activePortfolioItem.category} • {activePortfolioItem.year}</span>
                <h3 className="text-xl font-serif font-bold text-white">{activePortfolioItem.title}</h3>
              </div>
              <button 
                onClick={() => setActivePortfolioItem(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-xs text-white/80">
              <img src={activePortfolioItem.coverImage} alt={activePortfolioItem.title} className="w-full h-64 object-cover rounded-xl border border-white/10" />

              <div className="space-y-2">
                <h4 className="font-serif font-bold text-sm text-gold uppercase">Case Study & Services</h4>
                <p className="leading-relaxed">{activePortfolioItem.description}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-white uppercase block">Services Provided By CineVenue:</span>
                <div className="flex flex-wrap gap-2">
                  {activePortfolioItem.servicesProvided.map(s => (
                    <span key={s} className="bg-gold/20 text-gold px-3 py-1 rounded-full font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ARTIST REQUEST MODAL */}
      {isArtistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111219] border border-emerald-500/50 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-black p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-emerald-400 uppercase flex items-center gap-2">
                <Mic className="w-5 h-5" /> REQUEST AN ARTIST / CELEBRITY
              </h3>
              <button onClick={() => setIsArtistModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleArtistFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-white/80 font-bold">Event Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Annual Youth Concert 2026"
                  value={artistForm.eventName}
                  onChange={e => setArtistForm({...artistForm, eventName: e.target.value})}
                  className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-emerald-400 outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Artist Category</label>
                  <select 
                    value={artistForm.artistCategory}
                    onChange={e => setArtistForm({...artistForm, artistCategory: e.target.value as any})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-emerald-400 outline-none"
                  >
                    {["Actors", "Singers", "DJs", "Bands", "Dancers", "Anchors", "Comedians", "Influencers", "Speakers", "Other"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Preferred Artist Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sunidhi Chauhan / Anirudh"
                    value={artistForm.preferredArtist}
                    onChange={e => setArtistForm({...artistForm, preferredArtist: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-emerald-400 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Event Date</label>
                  <input 
                    type="date" 
                    value={artistForm.eventDate}
                    onChange={e => setArtistForm({...artistForm, eventDate: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-3 py-2.5 text-white focus:border-emerald-400 outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Budget Range</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ₹10 Lakhs - ₹25 Lakhs"
                    value={artistForm.budgetRange}
                    onChange={e => setArtistForm({...artistForm, budgetRange: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-emerald-400 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={artistForm.fullName}
                    onChange={e => setArtistForm({...artistForm, fullName: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-emerald-400 outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Phone *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+91 98765 43210"
                    value={artistForm.phone}
                    onChange={e => setArtistForm({...artistForm, phone: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-emerald-400 outline-none" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs uppercase cursor-pointer">
                  SUBMIT ARTIST REQUEST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. SPONSORSHIP SUPPORT MODAL */}
      {isSponsorshipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111219] border border-gold/50 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="bg-black p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-gold uppercase flex items-center gap-2">
                <Handshake className="w-5 h-5 text-gold" /> REQUEST SPONSORSHIP SUPPORT
              </h3>
              <button onClick={() => setIsSponsorshipModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSponFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-white/80 font-bold">Event Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. ELAN Fest 2026"
                  value={sponForm.eventName}
                  onChange={e => setSponForm({...sponForm, eventName: e.target.value})}
                  className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Expected Audience</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 15,000+ Students"
                    value={sponForm.expectedAudience}
                    onChange={e => setSponForm({...sponForm, expectedAudience: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Target Brand Categories</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tech, Beverages, Fashion"
                    value={sponForm.targetBrandCategories}
                    onChange={e => setSponForm({...sponForm, targetBrandCategories: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Contact Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={sponForm.fullName}
                    onChange={e => setSponForm({...sponForm, fullName: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/80 font-bold">Phone Number *</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+91 98765 43210"
                    value={sponForm.phone}
                    onChange={e => setSponForm({...sponForm, phone: e.target.value})}
                    className="w-full bg-[#1A1C28] border border-white/15 rounded-xl px-4 py-2.5 text-white focus:border-gold outline-none" 
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-gold text-black font-extrabold text-xs uppercase cursor-pointer">
                  SUBMIT SPONSORSHIP REQUEST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
