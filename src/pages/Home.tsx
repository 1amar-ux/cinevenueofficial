import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import MaintenancePage from "../components/MaintenancePage";
import CineVenueLogo from "../components/CineVenueLogo";
import EventManagementHub from "../components/events/EventManagementHub";
import FilmProductionHub from "../components/film-production/FilmProductionHub";
import { 
  Film, Sparkles, Megaphone, Ticket, Shield, Mail, Phone, Users, 
  MapPin, CheckCircle2, ChevronRight, DollarSign, Award, ArrowRight,
  TrendingUp, BarChart2, Briefcase, Camera, Video, Compass, HelpCircle,
  Share2, ShieldAlert, Sparkle, Calendar, Clock, Activity, MessageSquare, Send,
  Target, FileText, Tv, X, UserCheck, Coins, PlusCircle, ExternalLink, Clapperboard
} from "lucide-react";

type DivisionType = "none" | "live_booking" | "production" | "events" | "promotions";
type SubWebsiteKey = "movieBooking" | "eventBooking" | "filmProduction" | "eventManagement" | "brandPromotion" | "cineCoinsLoyalty";

interface HomeProps {
  userEmail?: string | null;
  onOpenAdmin?: () => void;
  onSendMessage?: (name: string, contact: string, message: string) => void;
  serviceControl?: any;
  setServiceControl?: (val: any) => void;
  onAddServiceProposal?: (proposal: Omit<any, "id" | "submittedAt" | "status">) => void;
  onOpenOrders?: () => void;
  onOpenAuth?: () => void;
}

export default function Home({ userEmail, onOpenAdmin, onSendMessage, serviceControl, setServiceControl, onAddServiceProposal, onOpenOrders, onOpenAuth }: HomeProps) {
  const navigate = useNavigate();
  const [activeDivision, setActiveDivision] = useState<DivisionType>("none");

  // Film Studio Sub-Website states
  const [filmStudioTab, setFilmStudioTab] = useState<'marketplace' | 'films' | 'casting' | 'investors' | 'portfolio' | 'contact'>('marketplace');
  const [auditionModalOpen, setAuditionModalOpen] = useState(false);
  const [selectedCastingTitle, setSelectedCastingTitle] = useState("");
  const [auditionForm, setAuditionForm] = useState({ name: "", phone: "", email: "", age: "", reelUrl: "", bio: "" });
  const [auditionSuccess, setAuditionSuccess] = useState(false);

  const [prodContactForm, setProdContactForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    category: "Script Pitch / Feature Film Proposal",
    synopsis: ""
  });
  const [prodContactSuccess, setProdContactSuccess] = useState(false);

  const [investorPitchForm, setInvestorPitchForm] = useState({
    name: "",
    email: "",
    phone: "",
    fundSize: "₹25 Lakhs - ₹1 Crore",
    message: ""
  });
  const [investorPitchSuccess, setInvestorPitchSuccess] = useState(false);

  // Proposal Modal State
  const [proposalModalKey, setProposalModalKey] = useState<SubWebsiteKey | null>(null);
  const [proposalForm, setProposalForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    projectTitleOrMovie: "",
    budgetOrRequirement: "",
    message: ""
  });
  const [proposalSuccess, setProposalSuccess] = useState(false);

  // Gemini Concierge States
  const [conciergePrompt, setConciergePrompt] = useState("");
  const [conciergeChat, setConciergeChat] = useState<{role: 'user' | 'ai', text: string}[]>(() => [
    { role: 'ai', text: 'Greetings, VIP. I am your CineVenue Elite Concierge, powered by Gemini. Ask me about luxury cinema lounges, high-society concerts, celebrity audio launches, or elite regional events in Hyderabad, Guntur, or Vijayawada.' }
  ]);
  const [conciergeLoading, setConciergeLoading] = useState(false);
  const [conciergeError, setConciergeError] = useState("");

  const handleConciergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergePrompt.trim()) return;

    const userMsg = conciergePrompt.trim();
    setConciergeChat(prev => [...prev, { role: "user", text: userMsg }]);
    setConciergePrompt("");
    setConciergeLoading(true);
    setConciergeError("");

    try {
      const res = await fetch("/api/gemini/concierge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      if (data.success) {
        setConciergeChat(prev => [...prev, { role: "ai", text: data.text }]);
      } else {
        setConciergeError(data.message || "Something went wrong.");
        setConciergeChat(prev => [...prev, { role: "ai", text: `⚠️ Error: ${data.message || "Failed to contact Gemini Concierge."}` }]);
      }
    } catch (err: any) {
      console.error(err);
      setConciergeError("Unable to connect to the server.");
      setConciergeChat(prev => [...prev, { role: "ai", text: "⚠️ Error: Connection to the server failed. Please check your connection." }]);
    } finally {
      setConciergeLoading(false);
    }
  };

  // Concierge Form States
  const [conciergeName, setConciergeName] = useState("");
  const [conciergeContact, setConciergeContact] = useState("");
  const [conciergeMessage, setConciergeMessage] = useState("");
  const [conciergeSubmitted, setConciergeSubmitted] = useState(false);

  // Division-specific states
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryRole, setInquiryRole] = useState("Investor");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Budget Estimation states (Event Management)
  const [stageCapacity, setStageCapacity] = useState("1000");
  const [ledConfig, setLedConfig] = useState("Panoramic LED Arena");
  const [celebrityTier, setCelebrityTier] = useState("A-List Elite");

  // Event Management Sub-Website Portal States
  const [eventPortalTab, setEventPortalTab] = useState<"portfolio" | "gallery" | "quote">("portfolio");
  const [eventQuoteForm, setEventQuoteForm] = useState({
    organizerName: "",
    eventType: "Pre-Release Events",
    audienceSize: "",
    targetCityVenue: "",
    tentativeDate: "",
    contactPhone: "",
    contactEmail: "",
    productionNotes: ""
  });
  const [eventQuoteSubmitted, setEventQuoteSubmitted] = useState(false);
  const [eventQuoteRefId, setEventQuoteRefId] = useState("");
  const [galleryModalItem, setGalleryModalItem] = useState<{ title: string; location: string; image: string } | null>(null);

  // Campaign Calculator states (Brand Promotions)
  const [promoBudget, setPromoBudget] = useState(500000); // INR

  const calculateEventBudget = () => {
    const base = Number(stageCapacity) * 350;
    const ledMultiplier = ledConfig === "Panoramic LED Arena" ? 250000 : ledConfig === "Standard 4K Stage" ? 120000 : 70000;
    const celebCost = celebrityTier === "A-List Elite" ? 1500000 : celebrityTier === "Star Cast" ? 800000 : 300000;
    return base + ledMultiplier + celebCost;
  };

  const calculateReach = () => {
    // 1 INR roughly equates to 3 impressions on digital and PR networks
    const impressions = promoBudget * 4.2;
    const targetFootfall = Math.floor(promoBudget * 0.08);
    const mediaPortals = Math.min(15, Math.floor(promoBudget / 40000) + 2);
    return {
      impressions: Math.floor(impressions).toLocaleString(),
      footfall: targetFootfall.toLocaleString(),
      portals: mediaPortals
    };
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryEmail.trim()) {
      alert("Please fill in your name and email to submit your B2B inquiry.");
      return;
    }
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryName("");
      setInquiryEmail("");
    }, 4000);
  };

  return (
    <div className="bg-[#09090A] min-h-screen text-[#F3F4F6] font-sans selection:bg-[#D4AF37] selection:text-black antialiased">
      
      {/* LUXURY FLOATING NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090A]/90 backdrop-blur-md border-b border-white/10 py-3.5 px-6 md:px-12 flex items-center justify-between">
        <div 
          onClick={() => {
            setActiveDivision("none");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <CineVenueLogo size="md" />
        </div>

        <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-widest font-semibold text-white/80">
          <button
            onClick={() => {
              setActiveDivision("none");
              setTimeout(() => {
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
            className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none text-white/80 font-semibold text-xs tracking-widest uppercase"
          >
            <Ticket className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Booking</span>
          </button>

          <button
            onClick={() => navigate("/events")}
            className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none text-amber-400 font-bold text-xs tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Events</span>
          </button>

          <button
            onClick={() => setProposalModalKey("movieBooking")}
            className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none text-white/80 font-semibold text-xs tracking-widest uppercase"
          >
            <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Proposal</span>
          </button>

          <button
            onClick={() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none text-white/80 font-semibold text-xs tracking-widest uppercase"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Contact</span>
          </button>

          <button
            onClick={() => {
              if (onOpenOrders) {
                onOpenOrders();
              } else {
                navigate("/booking");
              }
            }}
            className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none text-cyan-400 font-semibold text-xs tracking-widest uppercase"
          >
            <Ticket className="w-3.5 h-3.5 text-cyan-400" />
            <span>My Pass</span>
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveDivision("none");
              setTimeout(() => {
                document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
              }, 50);
            }}
            className="bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-lg shadow-[#D4AF37]/10 hover:shadow-[#D4AF37]/20 transition-all cursor-pointer border-none flex items-center gap-1.5"
          >
            <Ticket className="w-4 h-4 text-black" />
            <span>Booking & Sub-Websites (6 Pillars)</span>
          </button>
        </div>
      </header>

      {/* LUXURY CINEMATIC HERO */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="space-y-6 relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase animate-fade-in">
            <Award className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "12s" }} />
            The Standard of Indian Cinema & Entertainment
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-light tracking-tight text-white italic leading-[1.1]">
            Redefining Luxury in <br className="hidden md:inline" />
            <span className="text-[#D4AF37] not-italic font-normal">Cinema & Corporate Entertainment</span>
          </h1>

          <p className="text-sm md:text-base text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
            From premier live movie ticket engines with verified offline-first seat mappings, to major pan-Indian physical film production, celebrity launches, viral media campaigns, and CineCoins rewards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/booking")}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-white/95 text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-black" />
              Book Movie Tickets
            </button>
            <a
              href="#services"
              className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 border border-white/15 text-white hover:border-white/30 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              Explore Business Divisions
            </a>
          </div>
        </div>
      </section>

      {/* THE SIX PILLARS SERVICES GRID */}
      <section id="services" className="py-24 px-6 md:px-12 max-w-[90rem] mx-auto border-t border-white/5 relative">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-[#D4AF37] tracking-[0.4em] uppercase block">Our Corporate Framework</span>
          <h2 className="font-display text-3xl md:text-4xl font-light italic text-white">
            The Core <span className="text-[#D4AF37] not-italic font-normal">Sub-Websites & Pillars</span> of CineVenue
          </h2>
          <p className="text-xs text-white/50 max-w-2xl mx-auto leading-relaxed">
            Operating as an integrated media holding company with six distinct elite sub-website divisions spanning cinema bookings, exclusive live passes, physical production, PR campaigns, and CineCoins loyalty.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Movie Booking */}
          <div className="bg-white/[0.01] border border-white/5 hover:border-[#D4AF37]/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20">
                  <Film className="w-5 h-5" />
                </div>
                
                {/* Live Status Badge */}
                {(serviceControl?.movieBooking?.status ?? true) ? (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest font-mono">
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20 uppercase tracking-widest font-mono">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  Movie Booking
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light min-h-[60px]">
                  Live theatrical catalogs, local seat maps, and VIP multiplex checkout gates across Guntur, Vijayawada, and Hyderabad.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={() => navigate("/booking")}
                className="w-full py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border-none"
              >
                <span>Launch Ticket Engine</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Module 2: Event Booking */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg ${
            activeDivision === "live_booking"
              ? "bg-[#D4AF37]/5 border-[#D4AF37] shadow-[#D4AF37]/5"
              : "bg-white/[0.01] border-white/5 hover:border-white/20"
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <Ticket className="w-5 h-5" />
                </div>
                
                {/* Live Status Badge */}
                {(serviceControl?.eventBooking?.status ?? true) ? (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest font-mono">
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20 uppercase tracking-widest font-mono">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  Exclusive Events & Galas
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light min-h-[60px]">
                  Secure premium entry passes, audio launches, standup comedy sets, and elite VIP musical concert nights.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={() => {
                  setActiveDivision("live_booking");
                  setTimeout(() => document.getElementById("active-showcase")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore Live Events</span>
                <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Module 3: Film Production */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg ${
            activeDivision === "production"
              ? "bg-[#D4AF37]/5 border-[#D4AF37] shadow-[#D4AF37]/5"
              : "bg-white/[0.01] border-white/5 hover:border-amber-500/40"
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
                  <Film className="w-5 h-5 text-gold" />
                </div>
                
                {/* Live Status Badge */}
                {(serviceControl?.filmProduction?.status ?? true) ? (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest font-mono">
                    LIVE • 24 CRAFTS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20 uppercase tracking-widest font-mono">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  Film Production & 24 Crafts
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light min-h-[60px]">
                  Official 24 Crafts marketplace, verified cast & crew hiring, casting calls, deal memos, milestone escrow, and film slate.
                </p>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <button
                onClick={() => navigate("/productions")}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-gold/20 flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open 24 Crafts Marketplace</span>
                <ChevronRight className="w-3.5 h-3.5 text-black" />
              </button>
              <button
                onClick={() => {
                  setActiveDivision("production");
                  setFilmStudioTab("marketplace");
                  setTimeout(() => document.getElementById("active-showcase")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Quick View Studio Division</span>
              </button>
            </div>
          </div>

          {/* Module 4: Event Management */}
          <div className="bg-white/[0.01] border border-white/5 hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                
                {/* Live Status Badge */}
                {(serviceControl?.eventManagement?.status ?? true) ? (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest font-mono">
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20 uppercase tracking-widest font-mono">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  Event Management & Organization
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light min-h-[60px]">
                  Turnkey management for 11 event categories, 13 tech services (LED walls, line arrays, grandMA3, DG sets), vendor directory & instant quote calculator.
                </p>
              </div>
            </div>
            <div className="pt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/events")}
                className="py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md border-none"
              >
                <span>Events Hub</span>
                <ChevronRight className="w-3 h-3 text-black" />
              </button>
              <button
                onClick={() => navigate("/create-event")}
                className="py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all border border-white/10 flex items-center justify-center gap-1 cursor-pointer hover:border-amber-400/50"
              >
                <PlusCircle className="w-3 h-3 text-amber-400" />
                <span>Create Event</span>
              </button>
            </div>
          </div>

          {/* Module 5: Brand & Media Promotions */}
          <div className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg ${
            activeDivision === "promotions"
              ? "bg-[#D4AF37]/5 border-[#D4AF37] shadow-[#D4AF37]/5"
              : "bg-white/[0.01] border-white/5 hover:border-white/20"
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Megaphone className="w-5 h-5" />
                </div>
                
                {/* Live Status Badge */}
                {(serviceControl?.brandPromotion?.status ?? true) ? (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest font-mono">
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20 uppercase tracking-widest font-mono">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  Brand Publicity
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light min-h-[60px]">
                  PR distribution networks, viral campaigns, reach simulators, and display ad allocations.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={() => {
                  setActiveDivision("promotions");
                  setTimeout(() => document.getElementById("active-showcase")?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore Publicity Division</span>
                <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Module 6: CineCoins Loyalty Sub-Website */}
          <div className="bg-white/[0.01] border border-amber-500/30 hover:border-amber-400/70 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                  <Coins className="w-5 h-5" />
                </div>
                
                {/* Live Status Badge */}
                {(serviceControl?.cineCoinsLoyalty?.status ?? true) ? (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 uppercase tracking-widest font-mono">
                    LIVE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full border border-rose-400/20 uppercase tracking-widest font-mono">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-left">
                <h3 className="font-display text-lg font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>CineCoins Loyalty</span>
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light min-h-[60px]">
                  Rewards store catalog, spin wheel, cashback wallet, gamified daily quests & instant coin redemptions.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={() => navigate("/cinecoins")}
                className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md border-none"
              >
                <span>🪙 Launch CineCoins Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC SHOWCASE CONTAINER */}
      <AnimatePresence mode="wait">
        {activeDivision !== "none" && (
          <motion.section
            id="active-showcase"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="py-16 px-6 md:px-12 bg-white/[0.01] border-t border-b border-white/5 max-w-7xl mx-auto"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
                <h3 className="text-sm font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
                  {activeDivision === "live_booking" && "🎟️ Premium Event & Live Bookings"}
                  {activeDivision === "production" && "🎥 Film Production Portfolio"}
                  {activeDivision === "events" && "🎤 Event Management & Budget Configurator"}
                  {activeDivision === "promotions" && "📢 Brand Publicity Reach Estimator"}
                </h3>
              </div>
              <button
                onClick={() => setActiveDivision("none")}
                className="text-xs text-white/50 hover:text-[#D4AF37] transition-colors uppercase font-mono cursor-pointer"
              >
                Close Panel [✕]
              </button>
            </div>

            {/* CASE 0: EVENT BOOKING PILLAR (NEWLY DIVIDED SUB-FEATURES) */}
            {activeDivision === "live_booking" && (serviceControl?.eventBooking?.status === false) && (
              <div className="w-full text-center py-10">
                <MaintenancePage 
                  serviceName="Elite Event Booking"
                  title={serviceControl?.eventBooking?.title || "System Maintenance"}
                  message={serviceControl?.eventBooking?.message || "Our VIP ticket booking servers are undergoing temporary scheduled optimization to support high concurrent booking loads."}
                  expectedTime={serviceControl?.eventBooking?.expectedTime || "2 Hours"}
                  icon="🎟️"
                />
              </div>
            )}

            {activeDivision === "live_booking" && (serviceControl?.eventBooking?.status !== false) && (
              <div className="space-y-12 text-left">
                {/* CURATED GENRES & BROWSE LIVE CATEGORIES (TOP FILTER SECTION) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                  <div className="space-y-1.5">
                    <h4 className="font-display text-2xl font-light text-white italic">
                      Discover <span className="text-[#D4AF37] not-italic font-normal">Live Experiences</span>
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed font-light">
                      Browse vetted VIP concerts, local celebrity galas, and live standup comedies across Andhra Pradesh and Telangana.
                    </p>
                  </div>

                  {/* CURATED GENRES */}
                  <div className="flex flex-wrap gap-2">
                    {["All Genres", "EDM Arenas", "Standup Comedy", "Symphony Tours", "Sufi Nights", "Celebrity Shows"].map((genre, i) => (
                      <button 
                        key={i} 
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                          i === 0 
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                            : "bg-white/5 text-white/70 hover:bg-white/10 border-white/5"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TICKETS & SEARCH (UPCOMING PASSES & TRENDING EXPERIENCES) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* LEFT 2 COLUMNS: UPCOMING PASSES (3 TICKETS) & TRENDING GRID */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" /> Upcoming VIP Passes
                        </h5>
                        <span className="text-[10px] font-mono text-white/40">3 ACTIVE BOX OFFICE PASSES</span>
                      </div>

                      <div className="space-y-4">
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
                            tag: "Tollywood/Bollywood Symphony",
                            icon: "🎻"
                          }
                        ].map((ticket, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-white/[0.01] to-white/[0.03] border border-white/5 hover:border-[#D4AF37]/30 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all relative overflow-hidden group">
                            {/* Left Side: Details */}
                            <div className="flex items-start gap-4 text-left">
                              <span className="text-2xl p-2 rounded-lg bg-white/5 border border-white/5">{ticket.icon}</span>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[9px] font-mono font-bold text-[#D4AF37] uppercase tracking-wider">{ticket.tag}</span>
                                  <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-400/10 border border-rose-400/20 px-1.5 rounded">{ticket.status}</span>
                                </div>
                                <h6 className="font-display text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors">{ticket.title}</h6>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55 font-light">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#D4AF37]" /> {ticket.date}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#D4AF37]" /> {ticket.time}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#D4AF37]" /> {ticket.venue}</span>
                                </div>
                              </div>
                            </div>

                            {/* Dashed Separator on MD+ */}
                            <div className="hidden md:block h-12 border-l border-dashed border-white/10" />

                            {/* Right Side: Action & Price */}
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                              <div className="text-left md:text-right">
                                <span className="text-[10px] text-white/40 block uppercase">Box Office</span>
                                <span className="text-sm font-mono font-semibold text-white">{ticket.pricing}</span>
                              </div>
                              <button 
                                onClick={() => {
                                  alert(`Pass booking for "${ticket.title}" is currently offline. Direct tickets will open shortly on the CineVenue gateway!`);
                                }}
                                className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md"
                              >
                                <span>Secure Pass</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TRENDING LIVE EXPERIENCES & BROWSE LIVE CATEGORIES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-4 text-left">
                        <h5 className="text-xs font-bold text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-[#D4AF37]" /> Trending Live Experiences
                        </h5>
                        <p className="text-xs text-white/50 font-light leading-relaxed">
                          Ticket demand is currently surging across our regional portals. Here is a live feed of active pass bookings over the last 15 minutes.
                        </p>
                        <div className="space-y-3 pt-1">
                          {[
                            { title: "Sufi Symphony Night", location: "Vijayawada Convention Centre", dynamicStat: "🔥 85 passes booked in last 5 min" },
                            { title: "Hyderabad Standup Fest", location: "Shilpakala Hall", dynamicStat: "⚡ 110 tickets secured in last 10 min" }
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

                      <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-4 text-left">
                        <h5 className="text-xs font-bold text-white uppercase tracking-[0.25em] flex items-center gap-1.5">
                          <Sparkle className="w-4 h-4 text-[#D4AF37]" /> Browse Live Categories
                        </h5>
                        <p className="text-xs text-white/50 font-light leading-relaxed">
                          Quickly filter and browse high-society event passes based on premium categories:
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { name: "EDM & DJ Arenas", count: "4 Shows" },
                            { name: "Standup Comedy", count: "6 Shows" },
                            { name: "Symphony Tours", count: "3 Shows" },
                            { name: "VIP Celeb Galas", count: "2 Shows" }
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

                  {/* RIGHT COLUMN: CINEVENUE VICINITY CONCIERGE & LIVE REGIONAL UPDATES */}
                  <div className="space-y-6 flex flex-col justify-between">
                    {/* CINEVENUE VICINITY CONCIERGE */}
                    <div className="bg-gradient-to-b from-white/[0.02] to-white/[0.01] border border-[#D4AF37]/20 p-5 rounded-2xl flex flex-col justify-between h-full space-y-4 shadow-[#D4AF37]/2 text-left">
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
                        <div className="h-64 overflow-y-auto space-y-3 pr-1 text-xs font-light scrollbar-thin">
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
                            <div className="p-3 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 mr-6 space-y-2">
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
                            placeholder="Ask Concierge (e.g. Recommended movie lounges in Guntur?)"
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
                    <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl space-y-2.5 text-left">
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
              </div>
            )}

            {/* CASE 1: FILM PRODUCTION PORTFOLIO */}
            {activeDivision === "production" && (serviceControl?.filmProduction?.status === false) && (
              <div className="w-full text-center py-10">
                <MaintenancePage 
                  serviceName="Film Production"
                  title={serviceControl?.filmProduction?.title || "System Maintenance"}
                  message={serviceControl?.filmProduction?.message || "Our Film Production portal and casting directories are currently undergoing optimization."}
                  expectedTime={serviceControl?.filmProduction?.expectedTime || "1 Hour"}
                  icon="🎥"
                />
              </div>
            )}

            {activeDivision === "production" && (serviceControl?.filmProduction?.status !== false) && (
              <div className="space-y-8 text-left">
                {/* SUB-SITE HEADER & TOP NAV TABS */}
                <div className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D4AF37] to-amber-200 p-0.5 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center">
                        <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                          <Film className="w-6 h-6 text-[#D4AF37]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-xl md:text-2xl font-bold text-white tracking-wide">
                            Cinevenue Film Production Studio
                          </h3>
                          <span className="text-[9px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2 py-0.5 rounded font-mono">
                            FULLSCREEN SUB-SITE
                          </span>
                        </div>
                        <p className="text-xs text-white/50 font-mono mt-0.5">
                          Feature Films · Web Series · Casting Calls · Investors & Pitching · Cinema Equipment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => navigate("/productions")}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-gold/20 flex items-center gap-1.5 hover:opacity-90"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch Full Sub-Website</span>
                      </button>
                      <button 
                        onClick={() => setActiveDivision("none")}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Exit Film Studio</span>
                      </button>
                    </div>
                  </div>

                  {/* NAVIGATION TABS */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {[
                      { id: "marketplace", label: "🌟 24 CRAFTS MARKETPLACE" },
                      { id: "films", label: "🎬 FEATURE & SHORT FILMS" },
                      { id: "casting", label: "🎭 CASTING CALLS" },
                      { id: "investors", label: "💼 INVESTORS & PITCHING" },
                      { id: "portfolio", label: "📷 PRODUCTION PORTFOLIO" },
                      { id: "contact", label: "📩 CONTACT PRODUCTION TEAM" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setFilmStudioTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all cursor-pointer ${
                          filmStudioTab === tab.id
                            ? "bg-gradient-to-r from-amber-500 to-gold text-black shadow-lg shadow-amber-500/20 border border-amber-400 font-black"
                            : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB 0: 24 CRAFTS FILM PRODUCTION MARKETPLACE */}
                {filmStudioTab === "marketplace" && (
                  <div className="animate-fade-in -mx-4 sm:-mx-6">
                    <FilmProductionHub
                      userEmail={userEmail}
                      onOpenAuth={onOpenAuth}
                    />
                  </div>
                )}

                {/* TAB 1: FEATURE & SHORT FILMS */}
                {filmStudioTab === "films" && (
                  <div className="space-y-10 animate-fade-in">
                    {/* TOP 3 CARDS: Feature Films, Short Films, Web Series */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Card 1: Feature Films */}
                      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-6 space-y-5 hover:border-red-500/50 transition-all flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500">
                            <Film className="w-5 h-5" />
                          </div>
                          <h4 className="font-display text-xl font-bold text-white">Feature Films</h4>
                          <p className="text-xs text-white/60 leading-relaxed">
                            Full-scale commercial feature film development, scriptwriting, pre-production, high-end cinema cinematography, and theatrical Pan-India distribution.
                          </p>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-white/5 text-xs text-[#D4AF37] font-semibold">
                          <p className="flex items-center gap-2">✓ High Budget Commercial Cinema</p>
                          <p className="flex items-center gap-2">✓ Pan-India Multi-language Dubs</p>
                          <p className="flex items-center gap-2">✓ Dolby Atmos Post-Production</p>
                        </div>
                      </div>

                      {/* Card 2: Short Films */}
                      <div className="bg-[#0F0F14] border border-red-500/30 rounded-2xl p-6 space-y-5 hover:border-red-500 transition-all flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500">
                            <Video className="w-5 h-5" />
                          </div>
                          <h4 className="font-display text-xl font-bold text-white">Short Films</h4>
                          <p className="text-xs text-white/60 leading-relaxed">
                            Short-format cinematic story-telling, festival circuit submissions, digital OTT streaming placement, and award-winning creative execution.
                          </p>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-white/5 text-xs text-[#D4AF37] font-semibold">
                          <p className="flex items-center gap-2">✓ International Festival Submissions</p>
                          <p className="flex items-center gap-2">✓ Fast Turnaround Production</p>
                          <p className="flex items-center gap-2">✓ Original Creative Concepting</p>
                        </div>
                      </div>

                      {/* Card 3: Web Series */}
                      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-6 space-y-5 hover:border-red-500/50 transition-all flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500">
                            <Tv className="w-5 h-5" />
                          </div>
                          <h4 className="font-display text-xl font-bold text-white">Web Series</h4>
                          <p className="text-xs text-white/60 leading-relaxed">
                            Multi-episode OTT streaming series, episodic writers' rooms, executive production, and seamless delivery for leading digital streaming platforms.
                          </p>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-white/5 text-xs text-[#D4AF37] font-semibold">
                          <p className="flex items-center gap-2">✓ OTT Platform Pitch Decking</p>
                          <p className="flex items-center gap-2">✓ Multi-Season Narrative Arcs</p>
                          <p className="flex items-center gap-2">✓ 4K HDR Color Grading</p>
                        </div>
                      </div>
                    </div>

                    {/* COMPREHENSIVE PRODUCTION SERVICES SECTION */}
                    <div className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
                        <span className="text-xl">🎬</span>
                        <h3 className="font-display text-xl font-bold text-white tracking-wide">
                          Comprehensive Production Services
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Service 1 */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 hover:border-[#D4AF37]/30 transition-all">
                          <div className="flex items-center gap-2 text-white font-bold text-xs">
                            <span>🎥</span>
                            <span>Camera & Lighting</span>
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            ARRI Alexa, RED V-Raptor, Cooke Anamorphic Lenses
                          </p>
                        </div>

                        {/* Service 2 */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 hover:border-[#D4AF37]/30 transition-all">
                          <div className="flex items-center gap-2 text-white font-bold text-xs">
                            <span>✂️</span>
                            <span>Post Production</span>
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            Editing, VFX, CGI Animation, Sound Design
                          </p>
                        </div>

                        {/* Service 3 */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 hover:border-[#D4AF37]/30 transition-all">
                          <div className="flex items-center gap-2 text-white font-bold text-xs">
                            <span>📍</span>
                            <span>Location Scouting</span>
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            Pan-India Picturesque Location Management
                          </p>
                        </div>

                        {/* Service 4 */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 hover:border-[#D4AF37]/30 transition-all">
                          <div className="flex items-center gap-2 text-white font-bold text-xs">
                            <span>📜</span>
                            <span>Film Line Production</span>
                          </div>
                          <p className="text-[11px] text-white/50 leading-relaxed">
                            Legal Permissions, Crew & Catering
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: CASTING CALLS */}
                {filmStudioTab === "casting" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-white">Active CineVenue Casting Calls</h3>
                        <p className="text-xs text-white/50 mt-1">Submit your actor portfolio, headshots, or audition reels for active theatrical productions.</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded border border-[#D4AF37]/30">
                        4 Open Casting Doors
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          id: "cast-1",
                          title: "Lead Male & Female Protagonists",
                          subTitle: "Untitled Action Thriller Feature Film",
                          deadline: "15 August 2026",
                          age: "22 - 32 years",
                          languages: "Telugu, Hindi, Tamil",
                          location: "Hyderabad / Mumbai Studios"
                        },
                        {
                          id: "cast-2",
                          title: "Supporting Character Actors & Antagonists",
                          subTitle: "Pan-India Period Drama Series",
                          deadline: "20 August 2026",
                          age: "30 - 55 years",
                          languages: "Telugu, Kannada, Hindi",
                          location: "Bengaluru / Visakhapatnam"
                        },
                        {
                          id: "cast-3",
                          title: "Child Artists & Teen Dancers",
                          subTitle: "Cinevenue Musical Short Feature",
                          deadline: "25 August 2026",
                          age: "8 - 16 years",
                          languages: "Any Indian Language",
                          location: "Guntur / Vijayawada"
                        },
                        {
                          id: "cast-4",
                          title: "Cameo Appearances & Background Talents",
                          subTitle: "Commercial Brand Launch Ad Campaign",
                          deadline: "30 August 2026",
                          age: "18 - 45 years",
                          languages: "English, Telugu, Hindi",
                          location: "Hyderabad / Chennai"
                        }
                      ].map((item) => (
                        <div key={item.id} className="bg-[#0F0F14] border border-white/10 rounded-2xl p-6 space-y-5 hover:border-red-500/50 transition-all flex flex-col justify-between shadow-xl">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
                                CASTING OPEN
                              </span>
                              <span className="text-white/40 font-mono">Deadline: {item.deadline}</span>
                            </div>

                            <div>
                              <h4 className="font-display text-lg font-bold text-white">{item.title}</h4>
                              <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">{item.subTitle}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60 bg-white/[0.02] p-3 rounded-xl border border-white/5 font-mono">
                              <div><span className="text-white/40">Age:</span> {item.age}</div>
                              <div><span className="text-white/40">Languages:</span> {item.languages}</div>
                              <div className="col-span-2"><span className="text-white/40">Location:</span> {item.location}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedCastingTitle(item.title);
                              setAuditionModalOpen(true);
                              setAuditionSuccess(false);
                            }}
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20"
                          >
                            SUBMIT PORTFOLIO / AUDITION REEL
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: INVESTORS & PITCHING */}
                {filmStudioTab === "investors" && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Header Banner */}
                    <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-2xl">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.3em] block">
                        ✨ FILM FINANCE & CO-PRODUCTION PARTNERSHIP
                      </span>
                      <h3 className="font-display text-3xl font-bold text-white">
                        Invest in High-Yield Commercial Film Projects
                      </h3>
                      <p className="text-xs text-white/60 leading-relaxed max-w-3xl">
                        Cinevenue connects film investors, venture funds, and executive producers with vetted theatrical and OTT film projects. Mitigate risk through structured non-theatrical audio, satellite, and OTT streaming pre-sales.
                      </p>
                    </div>

                    {/* 3 Value Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 space-y-3">
                        <div className="text-3xl">📈</div>
                        <h4 className="font-display text-base font-bold text-white">Risk-Mitigated Slate</h4>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Pre-sale agreements for digital OTT and satellite rights safeguard core capital.
                        </p>
                      </div>

                      <div className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 space-y-3">
                        <div className="text-3xl">⚖️</div>
                        <h4 className="font-display text-base font-bold text-white">Transparent Accounting</h4>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Audited box office tracking, Escrow bank accounts, and quarterly dividend distribution.
                        </p>
                      </div>

                      <div className="bg-[#0A0A0E] border border-white/10 rounded-2xl p-6 space-y-3">
                        <div className="text-3xl">🏆</div>
                        <h4 className="font-display text-base font-bold text-white">Executive Producer Credit</h4>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Full title card recognition, premiere invites, and red-carpet access for co-producers.
                        </p>
                      </div>
                    </div>

                    {/* Investor Pitch Form */}
                    <div className="bg-[#0A0A0E] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 space-y-6">
                      <h4 className="font-display text-xl font-bold text-white flex items-center gap-2">
                        <span>💼</span> Submit Co-Financing / Pitch Request
                      </h4>

                      {investorPitchSuccess ? (
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-center space-y-2">
                          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                          <p className="text-sm font-bold uppercase">Pitch Received Successfully</p>
                          <p className="text-xs text-emerald-300/80">Our executive finance desk will contact you within 24 business hours with prospectus worksheets.</p>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (onAddServiceProposal) {
                              onAddServiceProposal({
                                subWebsiteKey: "filmProduction",
                                subWebsiteName: "Film Production Studio",
                                customerName: investorPitchForm.name,
                                customerEmail: investorPitchForm.email,
                                customerPhone: investorPitchForm.phone,
                                projectTitleOrMovie: "Film Investment Proposal",
                                budgetOrRequirement: investorPitchForm.fundSize,
                                message: investorPitchForm.message
                              });
                            }
                            setInvestorPitchSuccess(true);
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Full Name *</label>
                              <input
                                type="text"
                                required
                                value={investorPitchForm.name}
                                onChange={e => setInvestorPitchForm({...investorPitchForm, name: e.target.value})}
                                placeholder="Enter full name"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Corporate Email *</label>
                              <input
                                type="email"
                                required
                                value={investorPitchForm.email}
                                onChange={e => setInvestorPitchForm({...investorPitchForm, email: e.target.value})}
                                placeholder="investor@company.com"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Contact Phone *</label>
                              <input
                                type="text"
                                required
                                value={investorPitchForm.phone}
                                onChange={e => setInvestorPitchForm({...investorPitchForm, phone: e.target.value})}
                                placeholder="+91 98765 43210"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Investment Commitment Size</label>
                            <select
                              value={investorPitchForm.fundSize}
                              onChange={e => setInvestorPitchForm({...investorPitchForm, fundSize: e.target.value})}
                              className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                            >
                              <option value="₹25 Lakhs - ₹1 Crore">₹25 Lakhs - ₹1 Crore (Co-Producer Tier)</option>
                              <option value="₹1 Crore - ₹5 Crores">₹1 Crore - ₹5 Crores (Executive Producer Tier)</option>
                              <option value="₹5 Crores+">₹5 Crores+ (Lead Slate Financier)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Investment Objectives / Message</label>
                            <textarea
                              rows={3}
                              value={investorPitchForm.message}
                              onChange={e => setInvestorPitchForm({...investorPitchForm, message: e.target.value})}
                              placeholder="Describe your target returns or co-production preferences..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-[#D4AF37] focus:outline-none resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/10"
                          >
                            Submit Investment Pitch Brief
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: PRODUCTION PORTFOLIO */}
                {filmStudioTab === "portfolio" && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="border-b border-white/10 pb-4">
                      <h3 className="font-display text-2xl font-bold text-white">Cinevenue Production Showcase</h3>
                      <p className="text-xs text-white/50 mt-1">Highlights from our past theatrical releases, music video productions, and web series.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Portfolio 1 */}
                      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all shadow-xl group">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&q=80"
                            alt="The Unstoppable Symphony"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider shadow">
                            FEATURE FILM
                          </span>
                        </div>
                        <div className="p-5 space-y-2">
                          <h4 className="font-display text-lg font-bold text-white">The Unstoppable Symphony</h4>
                          <p className="text-xs text-white/60 leading-relaxed">
                            Cinematic musical drama grossing 45 Cr+ theatrical revenue across South India.
                          </p>
                        </div>
                      </div>

                      {/* Portfolio 2 */}
                      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all shadow-xl group">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80"
                            alt="Echoes of the Valley"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider shadow">
                            WEB SERIES (SEASON 1 & 2)
                          </span>
                        </div>
                        <div className="p-5 space-y-2">
                          <h4 className="font-display text-lg font-bold text-white">Echoes of the Valley</h4>
                          <p className="text-xs text-white/60 leading-relaxed">
                            Crime mystery series streamed across 12+ international OTT territories.
                          </p>
                        </div>
                      </div>

                      {/* Portfolio 3 */}
                      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl overflow-hidden hover:border-[#D4AF37]/50 transition-all shadow-xl group">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80"
                            alt="Rhythm of Pan-India"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold uppercase px-2.5 py-0.5 rounded tracking-wider shadow">
                            MUSICAL CONCERT LIVE FILM
                          </span>
                        </div>
                        <div className="p-5 space-y-2">
                          <h4 className="font-display text-lg font-bold text-white">Rhythm of Pan-India</h4>
                          <p className="text-xs text-white/60 leading-relaxed">
                            4K HDR live concert film featuring top Indian playback singers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: CONTACT PRODUCTION TEAM */}
                {filmStudioTab === "contact" && (
                  <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
                    <div className="text-left border-b border-white/10 pb-4">
                      <h3 className="font-display text-2xl font-bold text-white">Contact Cinevenue Production Team</h3>
                      <p className="text-xs text-white/50 mt-1">Submit script pitch decks, line production inquiries, or audition links.</p>
                    </div>

                    <div className="bg-[#0F0F14] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                      {prodContactSuccess ? (
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-center space-y-2">
                          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                          <p className="text-sm font-bold uppercase">Inquiry Delivered Successfully</p>
                          <p className="text-xs text-emerald-300/80">Our physical production officers will dispatch response to your email shortly.</p>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (onAddServiceProposal) {
                              onAddServiceProposal({
                                subWebsiteKey: "filmProduction",
                                subWebsiteName: "Film Production Studio",
                                customerName: prodContactForm.fullName,
                                customerEmail: prodContactForm.email,
                                customerPhone: prodContactForm.phone,
                                projectTitleOrMovie: prodContactForm.category,
                                budgetOrRequirement: "Production Studio Contact Inquiry",
                                message: prodContactForm.synopsis
                              });
                            }
                            setProdContactSuccess(true);
                          }}
                          className="space-y-5"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">FULL NAME *</label>
                              <input
                                type="text"
                                required
                                value={prodContactForm.fullName}
                                onChange={e => setProdContactForm({...prodContactForm, fullName: e.target.value})}
                                placeholder="Enter full name"
                                className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">CONTACT NUMBER *</label>
                              <input
                                type="text"
                                required
                                value={prodContactForm.phone}
                                onChange={e => setProdContactForm({...prodContactForm, phone: e.target.value})}
                                placeholder="+91 98765 43210"
                                className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">EMAIL ADDRESS *</label>
                              <input
                                type="email"
                                required
                                value={prodContactForm.email}
                                onChange={e => setProdContactForm({...prodContactForm, email: e.target.value})}
                                placeholder="producer@studio.com"
                                className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">INQUIRY CATEGORY *</label>
                              <select
                                value={prodContactForm.category}
                                onChange={e => setProdContactForm({...prodContactForm, category: e.target.value})}
                                className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none"
                              >
                                <option value="Script Pitch / Feature Film Proposal">Script Pitch / Feature Film Proposal</option>
                                <option value="Short Film / Web Series Submission">Short Film / Web Series Submission</option>
                                <option value="Line Production Inquiry">Line Production Inquiry</option>
                                <option value="Camera & Equipment Rental">Camera & Equipment Rental</option>
                                <option value="Casting & Actor Audition Link">Casting & Actor Audition Link</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">PROJECT SYNOPSIS / DETAILS *</label>
                            <textarea
                              rows={5}
                              required
                              value={prodContactForm.synopsis}
                              onChange={e => setProdContactForm({...prodContactForm, synopsis: e.target.value})}
                              placeholder="Include logline, genre, budget estimates, or link to drive/vimeo portfolio..."
                              className="w-full bg-[#050508] border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20"
                          >
                            SUBMIT PRODUCTION INQUIRY
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

                {/* AUDITION MODAL */}
                {auditionModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-[#0A0A0E] border border-red-500/30 rounded-2xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl animate-fade-in text-left">
                      <button
                        onClick={() => setAuditionModalOpen(false)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded font-mono">
                          CASTING AUDITION
                        </span>
                        <h3 className="font-display text-xl font-bold text-white">{selectedCastingTitle}</h3>
                        <p className="text-xs text-white/50">Submit headshots, profile bio, and video audition reel link.</p>
                      </div>

                      {auditionSuccess ? (
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-center space-y-2">
                          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                          <p className="text-sm font-bold uppercase">Audition Submitted</p>
                          <p className="text-xs text-emerald-300/80">Our casting director will review your reel and get in touch if shortlisted.</p>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (onAddServiceProposal) {
                              onAddServiceProposal({
                                subWebsiteKey: "filmProduction",
                                subWebsiteName: "Film Production Studio (Casting)",
                                customerName: auditionForm.name,
                                customerEmail: auditionForm.email,
                                customerPhone: auditionForm.phone,
                                projectTitleOrMovie: `Audition for: ${selectedCastingTitle}`,
                                budgetOrRequirement: `Age: ${auditionForm.age} | Reel: ${auditionForm.reelUrl}`,
                                message: auditionForm.bio
                              });
                            }
                            setAuditionSuccess(true);
                          }}
                          className="space-y-4 text-xs"
                        >
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Actor Name *</label>
                            <input
                              type="text"
                              required
                              value={auditionForm.name}
                              onChange={e => setAuditionForm({...auditionForm, name: e.target.value})}
                              placeholder="Enter full name"
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Phone Number *</label>
                              <input
                                type="text"
                                required
                                value={auditionForm.phone}
                                onChange={e => setAuditionForm({...auditionForm, phone: e.target.value})}
                                placeholder="+91 98765 43210"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Email Address *</label>
                              <input
                                type="email"
                                required
                                value={auditionForm.email}
                                onChange={e => setAuditionForm({...auditionForm, email: e.target.value})}
                                placeholder="actor@talent.com"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Age *</label>
                              <input
                                type="text"
                                required
                                value={auditionForm.age}
                                onChange={e => setAuditionForm({...auditionForm, age: e.target.value})}
                                placeholder="e.g. 25"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Reel / YouTube Link *</label>
                              <input
                                type="url"
                                required
                                value={auditionForm.reelUrl}
                                onChange={e => setAuditionForm({...auditionForm, reelUrl: e.target.value})}
                                placeholder="https://youtube.com/..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-white/60 mb-1">Short Experience Bio</label>
                            <textarea
                              rows={2}
                              value={auditionForm.bio}
                              onChange={e => setAuditionForm({...auditionForm, bio: e.target.value})}
                              placeholder="Mention past theatrical plays, ad films, or movie roles..."
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-red-600/20"
                          >
                            SEND AUDITION APPLICATION
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CASE 2: EVENT BUDGET ESTIMATOR */}
            {activeDivision === "events" && (serviceControl?.eventManagement?.status === false) && (
              <div className="w-full text-center py-10">
                <MaintenancePage 
                  serviceName="Event Management"
                  title={serviceControl?.eventManagement?.title || "System Maintenance"}
                  message={serviceControl?.eventManagement?.message || "Our Event Stage and Corporate Gala planning tools are currently undergoing standard security upgrades."}
                  expectedTime={serviceControl?.eventManagement?.expectedTime || "3 Hours"}
                  icon="🎤"
                />
              </div>
            )}

            {activeDivision === "events" && (serviceControl?.eventManagement?.status !== false) && (
              <div className="space-y-8 text-left">
                {/* EVENT MANAGEMENT SUB-WEBSITE HEADER BAR */}
                <div className="bg-[#0B0C10] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                      <CineVenueLogo size="md" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                            Cinevenue Event Management Portal
                          </h2>
                          <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-500/30 rounded-md font-mono">
                            FULLSCREEN SUB-SITE
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-1 font-light">
                          Pre-Release Launches &middot; Audio Meets &middot; Stadium Concerts &middot; Celebrity Management
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                      <button
                        onClick={onOpenAuth}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        <span>Sign In</span>
                      </button>
                      <button
                        onClick={() => setActiveDivision("none")}
                        className="px-4 py-2.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-rose-500/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <X className="w-4 h-4 text-rose-400" />
                        <span>Exit Event Management</span>
                      </button>
                    </div>
                  </div>

                  {/* SUB-SITE NAVIGATION TABS */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    {[
                      { id: "portfolio", label: "EVENT SERVICES PORTFOLIO", icon: "✨ 🎤" },
                      { id: "gallery", label: "EVENT GALLERY", icon: "🖼️ 🖼️" },
                      { id: "quote", label: "REQUEST A CUSTOM QUOTE", icon: "📑 📝" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setEventPortalTab(tab.id as any)}
                        className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                          eventPortalTab === tab.id
                            ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-600/30 border border-red-500 font-extrabold"
                            : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 hover:text-white"
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB 1: EVENT SERVICES PORTFOLIO */}
                {eventPortalTab === "portfolio" && (
                  <div className="space-y-8">
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
                              setEventQuoteForm(prev => ({ ...prev, eventType: item.title }));
                              setEventPortalTab("quote");
                            }}
                            className="pt-4 border-t border-white/5 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer group-hover:translate-x-1"
                          >
                            <span>→ Request Quote</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* B2B ARENA STAGE SETUP CONFIGURATOR */}
                    <div className="mt-12 bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">B2B BUDGET ESTIMATOR</span>
                        <h4 className="font-display text-2xl font-light text-white italic">
                          Arena & Stage Setup <span className="text-[#D4AF37] not-italic font-normal">Configurator</span>
                        </h4>
                        <p className="text-xs text-white/60 leading-relaxed font-light max-w-xl">
                          Calculate instant budget estimates for grand audio launches, press circuits, and stadium galas.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">1. Seating Capacity</label>
                          <select
                            value={stageCapacity}
                            onChange={(e) => setStageCapacity(e.target.value)}
                            className="w-full bg-black border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white focus:outline-none"
                          >
                            <option value="500">500 Attendees (Multiplex Theater)</option>
                            <option value="1200">1,200 Attendees (Large Film Screen)</option>
                            <option value="3000">3,000 Attendees (Arena Concert)</option>
                            <option value="8000">8,000 Attendees (Stadia Mega-Launch)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">2. LED Wall & Stage FX</label>
                          <select
                            value={ledConfig}
                            onChange={(e) => setLedConfig(e.target.value)}
                            className="w-full bg-black border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white focus:outline-none"
                          >
                            <option value="Standard 4K Stage">Standard 4K Backdrop Setup</option>
                            <option value="Panoramic LED Arena">360° Panoramic LED Curved Wall</option>
                            <option value="Minimal Classic Setup">Classic Physical Set & Lighting</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">3. Guest Attendance Tier</label>
                          <select
                            value={celebrityTier}
                            onChange={(e) => setCelebrityTier(e.target.value)}
                            className="w-full bg-black border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white focus:outline-none"
                          >
                            <option value="A-List Elite">Superstars & Elite Critics</option>
                            <option value="Star Cast">Film Main Characters</option>
                            <option value="Director Panel">Technical Panel & Media Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-[#D4AF37] p-5 rounded-r-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left space-y-1">
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest block font-mono">ESTIMATED LAUNCH BUDGET</span>
                          <p className="text-3xl font-display font-bold text-white">
                            ₹{calculateEventBudget().toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-white/40">Includes legal permissions, high-density audio setups, security personnel, and host costs.</p>
                        </div>
                        <button
                          onClick={() => {
                            setEventQuoteForm(prev => ({
                              ...prev,
                              productionNotes: `Budget estimation requirement: Stage Capacity ${stageCapacity}, ${ledConfig}, ${celebrityTier} guests. Estimated budget: ₹${calculateEventBudget().toLocaleString("en-IN")}`
                            }));
                            setEventPortalTab("quote");
                          }}
                          className="px-6 py-3 bg-[#D4AF37] hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center cursor-pointer shadow-lg shadow-amber-500/20"
                        >
                          Book Event Execution
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EVENT GALLERY */}
                {eventPortalTab === "gallery" && (
                  <div className="space-y-8">
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
                              <span>Click to enlarge stage production view</span>
                              <ArrowRight className="w-3 h-3 text-rose-400 group-hover:translate-x-1 transition-transform" />
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: REQUEST A CUSTOM QUOTE FORM */}
                {eventPortalTab === "quote" && (
                  <div className="bg-[#0B0C10] border border-white/10 rounded-2xl p-6 md:p-10 space-y-8 shadow-2xl max-w-4xl mx-auto">
                    <div className="space-y-2 text-left">
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

                    {eventQuoteSubmitted ? (
                      <div className="p-8 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-4">
                        <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-emerald-300">
                            Quote Request Submitted Successfully!
                          </h4>
                          <p className="text-xs text-white/70 max-w-md mx-auto">
                            Thank you, <strong className="text-white">{eventQuoteForm.organizerName || "Organizer"}</strong>. Your event request reference ID is <strong className="text-amber-400 font-mono">{eventQuoteRefId}</strong>.
                          </p>
                        </div>
                        <p className="text-xs text-emerald-400/80 bg-black/40 p-3 rounded-xl inline-block font-mono border border-emerald-500/20">
                          Our Event Line Production Director will contact you at {eventQuoteForm.contactPhone || "your phone"} within 2 hours.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => setEventQuoteSubmitted(false)}
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
                          if (!eventQuoteForm.organizerName || !eventQuoteForm.contactPhone || !eventQuoteForm.contactEmail) {
                            alert("Please fill in all required fields (*).");
                            return;
                          }

                          const refId = `EV-QUOTE-${Math.floor(100000 + Math.random() * 900000)}`;
                          setEventQuoteRefId(refId);

                          if (onAddServiceProposal) {
                            onAddServiceProposal({
                              subWebsiteKey: "eventManagement",
                              subWebsiteName: "Event Management Sub-Website",
                              customerName: eventQuoteForm.organizerName,
                              customerEmail: eventQuoteForm.contactEmail,
                              customerPhone: eventQuoteForm.contactPhone,
                              projectTitleOrMovie: `${eventQuoteForm.eventType} - ${eventQuoteForm.targetCityVenue || "India"}`,
                              budgetOrRequirement: `Audience: ${eventQuoteForm.audienceSize || "Standard"}, Date: ${eventQuoteForm.tentativeDate || "TBD"}`,
                              message: eventQuoteForm.productionNotes || "Event management quote requested."
                            });
                          }

                          setEventQuoteSubmitted(true);
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
                              value={eventQuoteForm.organizerName}
                              onChange={(e) => setEventQuoteForm(prev => ({ ...prev, organizerName: e.target.value }))}
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
                              value={eventQuoteForm.eventType}
                              onChange={(e) => setEventQuoteForm(prev => ({ ...prev, eventType: e.target.value }))}
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
                              value={eventQuoteForm.audienceSize}
                              onChange={(e) => setEventQuoteForm(prev => ({ ...prev, audienceSize: e.target.value }))}
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
                              value={eventQuoteForm.targetCityVenue}
                              onChange={(e) => setEventQuoteForm(prev => ({ ...prev, targetCityVenue: e.target.value }))}
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
                              value={eventQuoteForm.tentativeDate}
                              onChange={(e) => setEventQuoteForm(prev => ({ ...prev, tentativeDate: e.target.value }))}
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
                              value={eventQuoteForm.contactPhone}
                              onChange={(e) => setEventQuoteForm(prev => ({ ...prev, contactPhone: e.target.value }))}
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
                            value={eventQuoteForm.contactEmail}
                            onChange={(e) => setEventQuoteForm(prev => ({ ...prev, contactEmail: e.target.value }))}
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
                            value={eventQuoteForm.productionNotes}
                            onChange={(e) => setEventQuoteForm(prev => ({ ...prev, productionNotes: e.target.value }))}
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
              </div>
            )}

            {/* CASE 3: BRAND & MEDIA AGENCY SUB-WEBSITE */}
            {activeDivision === "promotions" && (serviceControl?.brandPromotion?.status === false) && (
              <div className="w-full text-center py-6">
                <MaintenancePage 
                  serviceName="Brand & Media Agency"
                  title={serviceControl?.brandPromotion?.title || "Brand & Media Agency Temporarily Unavailable"}
                  message={serviceControl?.brandPromotion?.message || "We are upgrading our booking system to provide a faster and smoother experience. Please visit again shortly."}
                  expectedTime={serviceControl?.brandPromotion?.expectedTime || "30 July 2026 06:00 PM"}
                  onBackToHome={() => setActiveDivision("none")}
                />
              </div>
            )}

            {activeDivision === "promotions" && (serviceControl?.brandPromotion?.status !== false) && (
              <div className="space-y-10 text-left">
                {/* BRAND & MEDIA AGENCY HEADER BAR (Matching Image 1) */}
                <div className="bg-[#0B0C10] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <CineVenueLogo size="md" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                            Cinevenue Brand & Media Agency
                          </h2>
                          <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 rounded-md font-mono">
                            FULLSCREEN SUB-SITE
                          </span>
                        </div>
                        <p className="text-xs text-white/50 mt-1 font-light">
                          Digital Marketing &middot; PR Campaigns &middot; Influencer Marketing &middot; Outdoor Billboards &middot; TV Spots
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                      <button
                        onClick={() => setProposalModalKey("brandPromotion")}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border-none"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <Megaphone className="w-4 h-4 text-white" />
                        <span>PROMOTIONAL SERVICES</span>
                      </button>
                      <button
                        onClick={() => setProposalModalKey("brandPromotion")}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>LAUNCH CAMPAIGN / CONTACT US</span>
                      </button>
                      <button
                        onClick={() => setActiveDivision("none")}
                        className="px-4 py-2.5 bg-red-950/30 hover:bg-red-900/50 text-red-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-red-500/20 flex items-center justify-center gap-2 cursor-pointer ml-auto"
                      >
                        <X className="w-4 h-4 text-red-400" />
                        <span>Exit Brand Agency</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 8 BRAND & MEDIA CAPABILITIES GRID (Exact Replica of Image 1) */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest font-mono">
                    PROMOTIONAL SERVICES & MEDIA CAPABILITIES
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      {
                        title: "Digital Marketing",
                        icon: <Target className="w-5 h-5 text-cyan-400" />,
                        description: "Targeted Pan-India Google Ads, Meta Ads, YouTube video ads, and SEO optimization for maximum ROI."
                      },
                      {
                        title: "Social Media Promotions",
                        icon: <Share2 className="w-5 h-5 text-cyan-400" />,
                        description: "Viral reels, trending Twitter/X hashtags, meme marketing, and community management across platforms."
                      },
                      {
                        title: "Influencer Marketing",
                        icon: <Users className="w-5 h-5 text-cyan-400" />,
                        description: "Tie-ups with top movie reviewers, lifestyle vloggers, tech creators, and regional micro-influencers."
                      },
                      {
                        title: "Press Meets & PR Campaigns",
                        icon: <FileText className="w-5 h-5 text-cyan-400" />,
                        description: "Exclusive film journalist meets, press releases in top regional & national daily newspapers."
                      },
                      {
                        title: "Outdoor Advertising",
                        icon: <Megaphone className="w-5 h-5 text-cyan-400" />,
                        description: "Prime metro billboards, multiplex digital standees, LED screen trucks, and bus wrap branding."
                      },
                      {
                        title: "TV & Radio Promotions",
                        icon: <Tv className="w-5 h-5 text-cyan-400" />,
                        description: "Prime-time television commercial spots, FM radio jingle broadcasts, and live RJ shoutouts."
                      },
                      {
                        title: "Celebrity Endorsements",
                        icon: <Award className="w-5 h-5 text-cyan-400" />,
                        description: "Direct brand ambassadorships, star product launches, and video endorsement shoots."
                      },
                      {
                        title: "Media Buying & Planning",
                        icon: <DollarSign className="w-5 h-5 text-cyan-400" />,
                        description: "Strategic media slot purchasing across digital, print, and broadcast channels at optimized rates."
                      }
                    ].map((cap, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0D0E13] border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl p-6 flex flex-col justify-between space-y-4 group transition-all duration-300 hover:bg-[#12141C] shadow-lg hover:shadow-cyan-950/20"
                      >
                        <div className="space-y-3">
                          <div className="w-11 h-11 bg-cyan-950/50 border border-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            {cap.icon}
                          </div>
                          <h4 className="font-bold text-base text-white tracking-tight">{cap.title}</h4>
                          <p className="text-xs text-white/60 leading-relaxed font-light">{cap.description}</p>
                        </div>
                        <button
                          onClick={() => setProposalModalKey("brandPromotion")}
                          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 transition-colors pt-2 bg-transparent border-none cursor-pointer"
                        >
                          <span>&rarr; START CAMPAIGN</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PUBLICITY CALCULATOR & ESTIMATOR */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-6 border-t border-white/10">
                  {/* Columns 1 & 2: Reach estimator and campaign levels */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-2">
                      <h4 className="font-display text-2xl font-light text-white italic">
                        Publicity <span className="text-[#D4AF37] not-italic font-normal">Viral Reach & PR</span> Calculator
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed font-light">
                        Adjust your marketing or film promotions budget slider to dynamically simulate expected reach across top-tier digital networks and physical media channels.
                      </p>
                    </div>

                    {/* Slider Control */}
                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Campaign Allocation</span>
                        <span className="text-lg font-mono font-semibold text-white">
                          ₹{promoBudget.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100000"
                        max="5000000"
                        step="100000"
                        value={promoBudget}
                        onChange={(e) => setPromoBudget(Number(e.target.value))}
                        className="w-full accent-[#D4AF37] bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-white/40 uppercase">
                        <span>₹1 Lakh (Micro Campaign)</span>
                        <span>₹50 Lakhs (Pan-Indian Mass Blast)</span>
                      </div>
                    </div>

                    {/* Reach Output Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-white/40 uppercase block">EXPECTED DIGITAL VIEWS</span>
                        <p className="text-2xl font-display font-semibold text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                          {calculateReach().impressions}
                        </p>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-white/40 uppercase block">DIRECT TICKET CONVERSIONS</span>
                        <p className="text-2xl font-display font-semibold text-[#D4AF37] flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#D4AF37]" />
                          {calculateReach().footfall}
                        </p>
                      </div>
                      <div className="bg-white/[0.01] border border-white/5 p-5 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-white/40 uppercase block">VERIFIED MEDIA OUTLETS</span>
                        <p className="text-2xl font-display font-semibold text-white flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-[#D4AF37]" />
                          {calculateReach().portals} Portals
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Lead Form & Channels list */}
                  <div className="bg-white/[0.02] border border-[#D4AF37]/10 p-6 rounded-2xl space-y-6 h-full text-left">
                    <div className="space-y-4">
                      <h5 className="font-display text-lg font-bold text-white">Target PR Channels</h5>
                      <p className="text-xs text-white/50 leading-relaxed font-light">
                        We offer pre-release theatrical banner placements, and viral PR campaign slots distributed across top-rated news syndicates.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {["Times of India", "Pinkvilla", "GreatAndhra", "Way2News", "Gulte", "Eenadu", "Sakshi"].map((ch, i) => (
                          <span key={i} className="px-2.5 py-1 bg-white/5 rounded text-[9px] font-mono border border-white/5 text-white/70">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 text-center">
                      <button
                        onClick={() => setProposalModalKey("brandPromotion")}
                        className="w-full py-3 bg-[#D4AF37] hover:bg-[#e5be48] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
                      >
                        <span>Inquire for Media Coverage</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* CONTACT US & CONCIERGE MESSAGE SECTIONS */}
      <section id="contact-concierge" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <span className="text-[10px] font-bold text-[#D4AF37] tracking-[0.4em] uppercase block">GET IN TOUCH</span>
          <h2 className="font-display text-4xl font-light italic text-white leading-tight">
            Contact <span className="text-[#D4AF37] not-italic font-normal">Us</span>
          </h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto leading-relaxed">
            Have questions about screen configurations, custom events, corporate bookings, or special billing? Our VIP concierge desk is open 7 days a week.
          </p>
        </div>

        {/* 3-COLUMN CONTACT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Phone */}
          <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-6 flex items-start gap-4 hover:border-[#D4AF37]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase block">CALL US DIRECTLY</span>
              <p className="text-xl font-bold text-white font-mono">+91 84658 70811</p>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                Concierge Desk · Mon – Sun · 8:00 AM – 10:00 PM
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LINES OPEN NOW
              </div>
            </div>
          </div>

          {/* Card 2: Email */}
          <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-6 flex items-start gap-4 hover:border-[#D4AF37]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase block">EMAIL ENQUIRIES</span>
              <p className="text-base font-semibold text-white break-all">info.cinevenue@gmail.com</p>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                Response within 2 hours.
              </p>
              <p className="text-[10px] text-[#D4AF37] font-medium uppercase tracking-wider">
                info.cinevenue@gmail.com — Venue Support
              </p>
            </div>
          </div>

          {/* Card 3: Address */}
          <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-6 flex items-start gap-4 hover:border-[#D4AF37]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="space-y-2 text-left">
              <span className="text-[10px] font-bold text-white/40 tracking-wider uppercase block">HEAD OFFICE</span>
              <p className="text-lg font-bold text-white">Guntur, Andhra Pradesh</p>
              <p className="text-xs text-white/50 leading-relaxed font-light">
                Guntur, Andhra Pradesh, India — 522001
              </p>
              <a
                href="https://maps.google.com/?q=Guntur,Andhra+Pradesh"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-[#D4AF37] hover:text-[#E5C158] font-bold uppercase tracking-wider inline-flex items-center gap-1 mt-1 transition-colors"
              >
                View on Google Map →
              </a>
            </div>
          </div>
        </div>

        {/* SEND A CONCIERGE MESSAGE CARD */}
        <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto text-left relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 mb-8">
            <span className="text-[10px] font-bold text-[#D4AF37] tracking-[0.25em] uppercase block">DIRECT CHANNEL</span>
            <h3 className="font-display text-2xl md:text-3xl font-light italic text-white">
              Send a <span className="text-[#D4AF37] not-italic font-normal">Concierge</span> Message
            </h3>
            <p className="text-xs text-white/50 max-w-xl leading-relaxed">
              Prefer to write? Drop us a prompt query below, and our VIP response coordinators will reach you back instantly.
            </p>
          </div>

          {conciergeSubmitted ? (
            <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-base font-bold uppercase tracking-wider">MESSAGE DELIVERED</p>
              <p className="text-xs text-emerald-300/80 max-w-md mx-auto leading-normal">
                Your direct prompt has been transmitted to our VIP Concierge terminal. A response coordinator will reach you back via phone or email instantly.
              </p>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!conciergeName.trim() || !conciergeContact.trim() || !conciergeMessage.trim()) {
                  alert("Please complete all fields prior to dispatching your message.");
                  return;
                }
                if (onSendMessage) {
                  onSendMessage(conciergeName, conciergeContact, conciergeMessage);
                }
                setConciergeSubmitted(true);
                setConciergeName("");
                setConciergeContact("");
                setConciergeMessage("");
                setTimeout(() => setConciergeSubmitted(false), 5000);
              }} 
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">YOUR FULL NAME</label>
                  <input
                    type="text"
                    required
                    value={conciergeName}
                    onChange={(e) => setConciergeName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#050506] border border-white/10 rounded-xl p-4 text-xs text-white focus:border-[#D4AF37] focus:outline-none transition-all placeholder:text-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">PHONE / EMAIL CONTACT</label>
                  <input
                    type="text"
                    required
                    value={conciergeContact}
                    onChange={(e) => setConciergeContact(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#050506] border border-white/10 rounded-xl p-4 text-xs text-white focus:border-[#D4AF37] focus:outline-none transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">DETAILED INQUIRY MESSAGE</label>
                <textarea
                  required
                  rows={4}
                  value={conciergeMessage}
                  onChange={(e) => setConciergeMessage(e.target.value)}
                  placeholder="Tell us about your custom screening, birthday package, or corporate venue inquiry..."
                  className="w-full bg-[#050506] border border-white/10 rounded-xl p-4 text-xs text-white focus:border-[#D4AF37] focus:outline-none transition-all resize-none placeholder:text-white/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/10 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>DELIVER MESSAGE</span>
              </button>
            </form>
          )}
        </div>
      </section>



      {/* PREMIUM CORPORATE FOOTER */}
      <footer className="bg-[#050506] border-t border-white/5 py-16 px-6 md:px-12 text-white/40 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          
          {/* Left Block */}
          <div className="space-y-4 text-left">
            <CineVenueLogo size="lg" />
            <p className="text-white/70 font-medium text-xs flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>Concierge Direct: +91 84658 70811</span>
            </p>
            <p className="text-white/50 text-xs font-light flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>Guntur, Andhra Pradesh, India — 522001</span>
            </p>
            <p className="pt-4 text-[10px] tracking-wide text-white/40 font-sans">
              © 2026 CineVenue Private Capital. All rights reserved.
            </p>
            <p className="text-[9px] text-[#D4AF37]/70 uppercase tracking-widest font-mono">
              Designed by ATS
            </p>
          </div>

          {/* Right Block */}
          <div className="flex flex-col items-end gap-6 self-stretch md:self-auto text-right">
            <div className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-white/80 font-medium uppercase tracking-wider text-[11px]">
              <a href="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy Statement</a>
              <span>•</span>
              <a href="/terms" className="hover:text-[#D4AF37] transition-colors">Terms & Conditions</a>
              <span>•</span>
              <a href="/refund-policy" className="hover:text-[#D4AF37] transition-colors">Refund Policy</a>
              <span>•</span>
              <a href="/cookie-policy" className="hover:text-[#D4AF37] transition-colors">Cookie Policy</a>
              <span>•</span>
              <a href="/user-agreement" className="hover:text-[#D4AF37] transition-colors">User Agreement</a>
              <span>•</span>
              <a href="#services" className="hover:text-[#D4AF37] transition-colors">About CineVenue</a>
              <span>•</span>
              <a href="#contact-concierge" className="hover:text-[#D4AF37] transition-colors">Concierge Contact</a>
              <span>•</span>
              <a href="#inquiry" className="hover:text-[#D4AF37] text-[#D4AF37] transition-colors font-bold">Host Your Screen</a>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (onOpenAdmin) {
                    onOpenAdmin();
                  } else {
                    navigate("/admin-dashboard");
                  }
                }}
                className="text-white/60 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-semibold text-[11px]"
              >
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                Superadmin Control Terminal
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(window.location.origin);
          alert("Platform Link Copied: Share CineVenue with other luxury film critics!");
        }}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#D4AF37] hover:bg-[#E5C158] text-black shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Share Platform"
      >
        <Share2 className="w-5 h-5 text-black" />
      </button>

      {/* CUSTOMER PROPOSAL SUBMISSION MODAL */}
      {proposalModalKey && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-gold/30 rounded-2xl p-6 md:p-8 max-w-lg w-full relative space-y-6 text-left shadow-2xl">
            <button
              onClick={() => setProposalModalKey(null)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white cursor-pointer bg-white/5 rounded-full"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] block">
                Direct Submission Gateway
              </span>
              <h3 className="text-xl font-bold text-white">
                Submit Proposal for {
                  proposalModalKey === "movieBooking" ? "Movie Booking Division" :
                  proposalModalKey === "eventBooking" ? "Event Booking Division" :
                  proposalModalKey === "filmProduction" ? "Film Production Division" :
                  proposalModalKey === "eventManagement" ? "Event Management Division" :
                  "Brand Publicity Division"
                }
              </h3>
              <p className="text-xs text-text-secondary">
                Your proposal will be transmitted directly to the CineVenue Central Admin Control Hub for instant review and execution.
              </p>
            </div>

            {proposalSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-emerald-300">Proposal Delivered to Admin Panel!</h4>
                <p className="text-xs text-text-secondary">
                  Our division manager has received your inquiry and will contact you via email/phone shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!proposalModalKey) return;
                  const subNames: Record<string, string> = {
                    movieBooking: "Movie Booking Sub-Website",
                    eventBooking: "Event Booking Sub-Website",
                    filmProduction: "Film Production Sub-Website",
                    eventManagement: "Event Management Sub-Website",
                    brandPromotion: "Brand Promotion Sub-Website"
                  };
                  if (onAddServiceProposal) {
                    onAddServiceProposal({
                      subWebsiteKey: proposalModalKey,
                      subWebsiteName: subNames[proposalModalKey] || "CineVenue Sub-Website",
                      customerName: proposalForm.customerName,
                      customerEmail: proposalForm.customerEmail,
                      customerPhone: proposalForm.customerPhone,
                      projectTitleOrMovie: proposalForm.projectTitleOrMovie,
                      budgetOrRequirement: proposalForm.budgetOrRequirement,
                      message: proposalForm.message
                    });
                  }
                  setProposalSuccess(true);
                  setTimeout(() => {
                    setProposalSuccess(false);
                    setProposalModalKey(null);
                    setProposalForm({
                      customerName: "",
                      customerEmail: "",
                      customerPhone: "",
                      projectTitleOrMovie: "",
                      budgetOrRequirement: "",
                      message: ""
                    });
                  }, 2000);
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Your Full Name *</label>
                    <input
                      type="text"
                      value={proposalForm.customerName}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Email Address *</label>
                    <input
                      type="email"
                      value={proposalForm.customerEmail}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="client@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Phone / Mobile *</label>
                    <input
                      type="text"
                      value={proposalForm.customerPhone}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Project / Event Title *</label>
                    <input
                      type="text"
                      value={proposalForm.projectTitleOrMovie}
                      onChange={(e) => setProposalForm(prev => ({ ...prev, projectTitleOrMovie: e.target.value }))}
                      placeholder="e.g. Corporate Premiere Night"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Budget / Scale Requirement</label>
                  <input
                    type="text"
                    value={proposalForm.budgetOrRequirement}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, budgetOrRequirement: e.target.value }))}
                    placeholder="e.g. ₹5,00,000 / 200 VIP Seats / 30-Day Buyout"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-gold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Proposal Details & Scope *</label>
                  <textarea
                    rows={3}
                    value={proposalForm.message}
                    onChange={(e) => setProposalForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your requirements, timeline, and venue preferences..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-gold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gold/20"
                >
                  <Send className="w-4 h-4 text-black" />
                  <span>Send Proposal to Admin Panel</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

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
                    setEventQuoteForm(prev => ({ ...prev, eventType: galleryModalItem.title }));
                    setEventPortalTab("quote");
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

    </div>
  );
}
