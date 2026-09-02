import React, { useState } from "react";
import { 
  X, Send, Film, FileText, User, Calendar, Megaphone, Handshake, 
  Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Clapperboard, 
  HelpCircle, Star, DollarSign, Building, Phone, Mail, Upload, Clock
} from "lucide-react";

import { 
  FilmProjectApplication, 
  StorySubmission, 
  BrandCampaignRequest, 
  PartnerEnquiry,
  EventManagementRequest,
  ArtistRequest,
  SponsorshipRequest
} from "../../types/productions";

interface ApplicationFormsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFilmApp: () => void;
  onOpenStoryApp: () => void;
  onOpenBrandApp: () => void;
  onOpenPartnerApp: (cat?: PartnerEnquiry["category"]) => void;
  onAddEventRequest: (req: EventManagementRequest) => void;
  onAddArtistRequest: (req: ArtistRequest) => void;
  onAddSponsorshipRequest: (req: SponsorshipRequest) => void;
  userEmail?: string | null;
}

export default function ApplicationFormsHubModal({
  isOpen,
  onClose,
  onOpenFilmApp,
  onOpenStoryApp,
  onOpenBrandApp,
  onOpenPartnerApp,
  onAddEventRequest,
  onAddArtistRequest,
  onAddSponsorshipRequest,
  userEmail
}: ApplicationFormsHubModalProps) {
  if (!isOpen) return null;

  const [activeFormTab, setActiveFormTab] = useState<
    "hub" | "universal" | "event" | "artist" | "sponsorship"
  >("hub");

  // Universal Quick Application State
  const [applicantName, setApplicantName] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantType, setApplicantType] = useState("Filmmaker / Director");
  const [projectTitle, setProjectTitle] = useState("");
  const [category, setCategory] = useState("Film Production & Funding");
  const [description, setDescription] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("₹1 Cr - ₹5 Cr");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Event Request Quick State
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<EventManagementRequest["eventType"]>("Film Event");
  const [eventDate, setEventDate] = useState("");
  const [eventCity, setEventCity] = useState("Hyderabad");
  const [eventVenue, setEventVenue] = useState("Gachibowli Indoor Stadium");
  const [expectedGuests, setExpectedGuests] = useState(5000);
  const [eventBudget, setEventBudget] = useState<EventManagementRequest["budgetRange"]>("₹25 Lakhs+");

  // Artist Request Quick State
  const [artistCategory, setArtistCategory] = useState<ArtistRequest["artistCategory"]>("Actors");
  const [artistEventName, setArtistEventName] = useState("");
  const [artistEventDate, setArtistEventDate] = useState("");
  const [artistLocation, setArtistLocation] = useState("Hyderabad");
  const [artistBudget, setArtistBudget] = useState("₹1,500,000");

  // Sponsorship Request Quick State
  const [sponsorEventName, setSponsorEventName] = useState("");
  const [sponsorEventType, setSponsorEventType] = useState("Movie Premiere & Audio Release");
  const [sponsorRequirement, setSponsorRequirement] = useState("Title Sponsor");
  const [sponsorBudgetReq, setSponsorBudgetReq] = useState("₹5,000,000");

  const handleUniversalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !projectTitle || !description) {
      alert("Please fill in your name, phone, project title, and description.");
      return;
    }

    const appNumber = "APP-" + Math.floor(100000 + Math.random() * 900000);
    setSubmittedId(appNumber);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !applicantName || !applicantPhone) {
      alert("Please enter event title, contact name, and phone number.");
      return;
    }

    const newReq: EventManagementRequest = {
      id: "EVT-" + Math.floor(1000 + Math.random() * 9000),
      userEmail: userEmail || "organizer@cinevenue.com",
      eventName: eventTitle,
      eventType,
      description: description || "Event management required with full stage setup and security.",
      preferredDate: eventDate || "2026-09-15",
      dateFlexibility: "Flexible",
      city: eventCity,
      venuePreference: eventVenue,
      expectedAudience: expectedGuests,
      servicesRequired: ["Event Management", "Stage & Production", "Security"],
      budgetRange: eventBudget,
      fullName: applicantName,
      phone: applicantPhone,
      email: userEmail || "organizer@cinevenue.com",
      submittedAt: new Date().toLocaleDateString(),
      status: "Submitted"
    };

    onAddEventRequest(newReq);
    setSubmittedId(newReq.id);
  };

  const handleArtistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantPhone || !artistEventName) {
      alert("Please enter contact name, phone, and event title.");
      return;
    }

    const newArtistReq: ArtistRequest = {
      id: "ART-" + Math.floor(1000 + Math.random() * 9000),
      userEmail: userEmail || "booker@cinevenue.com",
      fullName: applicantName,
      email: userEmail || "booker@cinevenue.com",
      phone: applicantPhone,
      eventName: artistEventName,
      artistCategory,
      preferredArtist: "Lead Star / Celebrity",
      eventDate: artistEventDate || "2026-10-10",
      location: artistLocation,
      budgetRange: artistBudget,
      requirements: description || "Artist booking request for appearance & live interaction.",
      submittedAt: new Date().toLocaleDateString(),
      status: "Submitted"
    };

    onAddArtistRequest(newArtistReq);
    setSubmittedId(newArtistReq.id);
  };

  const handleSponsorshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorEventName || !applicantName || !applicantPhone) {
      alert("Please enter event name, contact name, and phone.");
      return;
    }

    const newSponsorReq: SponsorshipRequest = {
      id: "SPON-" + Math.floor(1000 + Math.random() * 9000),
      userEmail: userEmail || "sponsor@cinevenue.com",
      fullName: applicantName,
      email: userEmail || "sponsor@cinevenue.com",
      phone: applicantPhone,
      eventName: sponsorEventName,
      eventType: sponsorEventType,
      eventDate: "2026-11-20",
      location: "Hyderabad",
      expectedAudience: "15,000+ Onsite & 2M+ Live Stream",
      sponsorshipRequirement: sponsorRequirement,
      targetBrandCategories: "FMCG, Consumer Tech, Lifestyle",
      budgetRequirement: sponsorBudgetReq,
      description: description || "Sponsorship proposal for brand placement and co-branding.",
      submittedAt: new Date().toLocaleDateString(),
      status: "Received"
    };

    onAddSponsorshipRequest(newSponsorReq);
    setSubmittedId(newSponsorReq.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0C0D12] border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 my-6 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-gold to-yellow-400 p-0.5 flex items-center justify-center shadow-lg shadow-gold/20">
              <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-gold" />
              </div>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                CineVenue Official Portal
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white tracking-tight">
                SUBMISSION & APPLICATION FORMS HUB
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert View */}
        {submittedId ? (
          <div className="p-8 bg-[#11131C] border border-emerald-500/40 rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Application Form Submitted Successfully!</h3>
            <p className="text-sm text-white/70 max-w-lg mx-auto">
              Your application reference ID is <span className="font-mono font-bold text-gold text-base">{submittedId}</span>. Our team will review your application and get in touch within 24-48 hours.
            </p>

            <div className="p-4 bg-black/60 rounded-xl border border-white/10 text-xs text-white/60 font-mono inline-block">
              🔒 Encrypted & Processed under NDA Confidentiality Agreement
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => setSubmittedId(null)}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Submit Another Application
              </button>
              <button
                onClick={onClose}
                className="px-8 py-2.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold rounded-xl text-xs uppercase cursor-pointer shadow-lg shadow-gold/20"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Form Selection Nav */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
              {[
                { id: "hub", label: "Select Application Form", icon: Sparkles },
                { id: "universal", label: "Fast Universal Application", icon: Send },
                { id: "event", label: "Event Booking Request", icon: Calendar },
                { id: "artist", label: "Artist Booking Request", icon: Star },
                { id: "sponsorship", label: "Sponsorship Form", icon: Megaphone }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFormTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black shadow-lg"
                        : "bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-amber-400"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: HUB DIRECTORY */}
            {activeFormTab === "hub" && (
              <div className="space-y-4">
                <p className="text-xs text-white/70 leading-relaxed">
                  Choose the specific application form you wish to submit to CineVenue Productions. All submissions are processed directly by our studio evaluation team under strict NDA confidentiality.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Form 1 */}
                  <div className="p-5 bg-[#12141F] border border-white/10 hover:border-gold/50 rounded-2xl space-y-3 transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                        <Clapperboard className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-gold/10 text-gold text-[10px] font-bold">
                        Full 8-Step Application
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Film Production & Funding Form</h3>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        Comprehensive application for feature films, web series, and short films seeking production backing, co-production, or slate funding.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenFilmApp();
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-gold text-black font-extrabold text-xs uppercase rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Open Film Application Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form 2 */}
                  <div className="p-5 bg-[#12141F] border border-white/10 hover:border-gold/50 rounded-2xl space-y-3 transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                        Fast Script Form
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Script & Story Submission Form</h3>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        Submit loglines, synopses, and pitch decks for script evaluations, writer attachments, and story development rights.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenStoryApp();
                      }}
                      className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase rounded-xl border border-amber-500/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Open Story Submission Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form 3 */}
                  <div className="p-5 bg-[#12141F] border border-white/10 hover:border-gold/50 rounded-2xl space-y-3 transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <User className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">
                        Audition Form
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Casting Call & Talent Audition Form</h3>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        Apply for lead, supporting, character, and debut roles across ongoing CineVenue feature films and web series.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveFormTab("universal");
                        setCategory("Casting Call & Audition");
                      }}
                      className="w-full py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs uppercase rounded-xl border border-purple-500/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Fill Casting Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form 4 */}
                  <div className="p-5 bg-[#12141F] border border-white/10 hover:border-gold/50 rounded-2xl space-y-3 transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-bold">
                        Event Production Form
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Event Management & Venue Form</h3>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        Request CineVenue Event Management for movie audio launches, pre-release galas, fan meets, and press conferences.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveFormTab("event")}
                      className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-xs uppercase rounded-xl border border-cyan-500/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Fill Event Booking Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form 5 */}
                  <div className="p-5 bg-[#12141F] border border-white/10 hover:border-gold/50 rounded-2xl space-y-3 transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Star className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        Celebrity Roster
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Artist & Star Booking Form</h3>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        Book Tollywood lead actors, music directors, playback singers, and anchors for live concerts and brand events.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveFormTab("artist")}
                      className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs uppercase rounded-xl border border-emerald-500/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Fill Artist Booking Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Form 6 */}
                  <div className="p-5 bg-[#12141F] border border-white/10 hover:border-gold/50 rounded-2xl space-y-3 transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">
                        In-Film Placement
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Brand Campaign & Sponsorship Form</h3>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        Submit brand deals, product placement requests, trailer sponsorship, and co-branded promotional partnerships.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenBrandApp();
                      }}
                      className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs uppercase rounded-xl border border-rose-500/40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Open Brand Campaign Form</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: UNIVERSAL FAST FORM */}
            {activeFormTab === "universal" && (
              <form onSubmit={handleUniversalSubmit} className="space-y-4 text-xs">
                <p className="text-white/60">
                  Fill out this fast universal application form to pitch any film project, casting request, story script, or studio query.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Applicant Designation</label>
                    <select
                      value={applicantType}
                      onChange={(e) => setApplicantType(e.target.value)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="Filmmaker / Director">Filmmaker / Director</option>
                      <option value="Screenplay Writer">Screenplay Writer</option>
                      <option value="Independent Producer">Independent Producer</option>
                      <option value="Actor / Performing Artist">Actor / Performing Artist</option>
                      <option value="Event Organizer / Venue Partner">Event Organizer / Venue Partner</option>
                      <option value="Brand Manager / Advertiser">Brand Manager / Advertiser</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Application Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none font-bold text-amber-400 cursor-pointer"
                    >
                      <option value="Film Production & Funding">Film Production & Funding</option>
                      <option value="Co-Production Partnership">Co-Production Partnership</option>
                      <option value="Script & Story Pitch">Script & Story Pitch</option>
                      <option value="Casting Call & Audition">Casting Call & Audition</option>
                      <option value="Event Management & Audio Launch">Event Management & Audio Launch</option>
                      <option value="Brand Sponsorship & Product Placement">Brand Sponsorship & Product Placement</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/70 mb-1 font-bold">Project / Event / Campaign Title *</label>
                    <input
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      placeholder="e.g. Project Rudra / Pre-Release Event / Brand Placement"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Estimated Budget / Fee Requirement</label>
                    <input
                      type="text"
                      value={estimatedBudget}
                      onChange={(e) => setEstimatedBudget(e.target.value)}
                      placeholder="e.g. ₹5 Crores"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Upload Link (Google Drive / Script / Reel)</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/your-pitch-deck"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/70 mb-1 font-bold">Proposal Summary & Key Details *</label>
                    <textarea
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a clear summary of your project logline, story pitch, event requirements, or brand objective..."
                      className="w-full bg-black/80 border border-white/20 rounded-xl p-3 text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("hub")}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-xl cursor-pointer"
                  >
                    Back to Hub
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-gradient-to-r from-amber-500 via-gold to-yellow-400 text-black font-extrabold rounded-xl cursor-pointer shadow-lg shadow-gold/20 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Universal Form</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: EVENT BOOKING FORM */}
            {activeFormTab === "event" && (
              <form onSubmit={handleEventSubmit} className="space-y-4 text-xs">
                <p className="text-white/60">
                  Request CineVenue Event Management for audio launches, premieres, fan meets, and press galas.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Organizer / Client Name *</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Production Company / Organizer"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Event Name / Movie Title *</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="e.g. Project K Pre-Release Gala"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as any)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="Audio Launch / Music Release">Audio Launch / Music Release</option>
                      <option value="Pre-Release Event">Pre-Release Event</option>
                      <option value="Movie Premiere">Movie Premiere</option>
                      <option value="Press Meet & Media Interaction">Press Meet & Media Interaction</option>
                      <option value="Success Meet & Success Celebrations">Success Meet & Success Celebrations</option>
                      <option value="Celebrity Fan Meet & Tour">Celebrity Fan Meet & Tour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Preferred City & Venue</label>
                    <input
                      type="text"
                      value={eventCity}
                      onChange={(e) => setEventCity(e.target.value)}
                      placeholder="e.g. Hyderabad / Vijayawada"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Budget & Expected Guests</label>
                    <input
                      type="text"
                      value={eventBudget}
                      onChange={(e) => setEventBudget(e.target.value as any)}
                      placeholder="e.g. ₹2,500,000 for 5,000 Guests"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/70 mb-1 font-bold">Stage & Special Setup Requirements</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe LED screen requirements, security, bouncers, red carpet, live streaming setup..."
                      className="w-full bg-black/80 border border-white/20 rounded-xl p-3 text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("hub")}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-xl cursor-pointer"
                  >
                    Back to Hub
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-cyan-500 text-black font-extrabold rounded-xl cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Event Form</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: ARTIST BOOKING FORM */}
            {activeFormTab === "artist" && (
              <form onSubmit={handleArtistSubmit} className="space-y-4 text-xs">
                <p className="text-white/60">
                  Submit a request to book Tollywood lead stars, directors, singers, or anchors for events.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Artist Category Required</label>
                    <select
                      value={artistCategory}
                      onChange={(e) => setArtistCategory(e.target.value as any)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="Lead Hero / Actor">Lead Hero / Actor</option>
                      <option value="Lead Heroine / Actress">Lead Heroine / Actress</option>
                      <option value="Film Director">Film Director</option>
                      <option value="Music Director / Composer">Music Director / Composer</option>
                      <option value="Playback Singer / Band">Playback Singer / Band</option>
                      <option value="Celebrity Anchor / Host">Celebrity Anchor / Host</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Event Name & Location *</label>
                    <input
                      type="text"
                      required
                      value={artistEventName}
                      onChange={(e) => setArtistEventName(e.target.value)}
                      placeholder="e.g. Vizag Beach Festival / College Fest"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Fee Budget Offered</label>
                    <input
                      type="text"
                      value={artistBudget}
                      onChange={(e) => setArtistBudget(e.target.value)}
                      placeholder="e.g. ₹1,500,000"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Event Date</label>
                    <input
                      type="date"
                      value={artistEventDate}
                      onChange={(e) => setArtistEventDate(e.target.value)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("hub")}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-xl cursor-pointer"
                  >
                    Back to Hub
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-emerald-500 text-black font-extrabold rounded-xl cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Artist Request</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 5: SPONSORSHIP FORM */}
            {activeFormTab === "sponsorship" && (
              <form onSubmit={handleSponsorshipSubmit} className="space-y-4 text-xs">
                <p className="text-white/60">
                  Submit sponsorship proposals for title sponsorship, powered-by deals, and co-branding.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Brand / Company Name *</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Royal Motors / TechBrand"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Target Movie or Event *</label>
                    <input
                      type="text"
                      required
                      value={sponsorEventName}
                      onChange={(e) => setSponsorEventName(e.target.value)}
                      placeholder="e.g. CineVenue Original Movie 2026"
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-1 font-bold">Sponsorship Tier</label>
                    <select
                      value={sponsorRequirement}
                      onChange={(e) => setSponsorRequirement(e.target.value)}
                      className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2.5 text-white outline-none cursor-pointer"
                    >
                      <option value="Title Sponsor">Title Sponsor</option>
                      <option value="Powered By Sponsor">Powered By Sponsor</option>
                      <option value="Associate Partner">Associate Partner</option>
                      <option value="Official Beverage / Tech Partner">Official Beverage / Tech Partner</option>
                      <option value="In-Film Integration">In-Film Integration</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/70 mb-1 font-bold">Sponsorship Proposal Details</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Specify your branding objectives, desired banner placements, TV ad spots, or actor integration..."
                      className="w-full bg-black/80 border border-white/20 rounded-xl p-3 text-white outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("hub")}
                    className="px-5 py-2.5 bg-white/10 text-white rounded-xl cursor-pointer"
                  >
                    Back to Hub
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-rose-500 text-white font-extrabold rounded-xl cursor-pointer shadow-lg flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Sponsorship Proposal</span>
                  </button>
                </div>
              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
