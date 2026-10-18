import React, { useState, useId } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  Music,
  Star,
  Award,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Info
} from "lucide-react";
import {
  ENTERTAINMENT_CATEGORIES,
  REQUIRED_SERVICES_LIST,
  EntertainmentCategoryKey,
  EventProposalRecord
} from "../../types/entertainmentEvent";
import { submitEventProposal } from "../../services/entertainmentEventService";

interface EventProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposalSubmitted?: (proposal: EventProposalRecord) => void;
  defaultCategory?: EntertainmentCategoryKey;
}

export default function EventProposalModal({
  isOpen,
  onClose,
  onProposalSubmitted,
  defaultCategory = "movie_promotions"
}: EventProposalModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<EventProposalRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  // Section A: Event Information
  const [selectedCategory, setSelectedCategory] = useState<EntertainmentCategoryKey>(defaultCategory);
  const activeCategoryDef = ENTERTAINMENT_CATEGORIES.find(c => c.key === selectedCategory) || ENTERTAINMENT_CATEGORIES[0];
  const [eventType, setEventType] = useState<string>(activeCategoryDef.eventTypes[0]);
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [alternativeDate, setAlternativeDate] = useState("");
  const [preferredCity, setPreferredCity] = useState("Hyderabad");
  const [preferredVenue, setPreferredVenue] = useState("");
  const [expectedAudience, setExpectedAudience] = useState<number>(5000);
  const [expectedDurationHours, setExpectedDurationHours] = useState<number>(4);
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [ticketPriceRange, setTicketPriceRange] = useState("");

  // Section B: Organizer Information
  const [organizerType, setOrganizerType] = useState<EventProposalRecord["organizerType"]>("Production House");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobile, setMobile] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialMediaUrl, setSocialMediaUrl] = useState("");

  // Section C: Conditional Details
  const isFilmCategory = selectedCategory === "movie_promotions" || selectedCategory === "film_industry";
  const [isFilmRelated, setIsFilmRelated] = useState<boolean>(isFilmCategory);
  // Film specific
  const [movieTitle, setMovieTitle] = useState("");
  const [productionHouseName, setProductionHouseName] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [producerName, setProducerName] = useState("");
  const [leadActors, setLeadActors] = useState("");
  const [musicDirector, setMusicDirector] = useState("");
  const [singersGuests, setSingersGuests] = useState("");
  const [celebrityAttendanceStatus, setCelebrityAttendanceStatus] = useState<EventProposalRecord["celebrityAttendanceStatus"]>("In Discussion");

  // Music / Live specific
  const [artistNames, setArtistNames] = useState("");
  const [performanceType, setPerformanceType] = useState("Live Vocal & Orchestra");
  const [performersCount, setPerformersCount] = useState<number>(10);
  const [performanceDurationMins, setPerformanceDurationMins] = useState<number>(180);
  const [technicalRiderNotes, setTechnicalRiderNotes] = useState("");

  // Section D: Services Required
  const [servicesRequired, setServicesRequired] = useState<string[]>([
    "Complete Event Planning and Management",
    "Stage Setup",
    "LED Screens",
    "Sound Systems",
    "Lighting",
    "Truss and Production Equipment",
    "Security and Crowd Management"
  ]);

  // Section E: Budget and Requirements
  const [isQuotRequestedWithoutBudget, setIsQuotRequestedWithoutBudget] = useState(false);
  const [estimatedBudget, setEstimatedBudget] = useState<number>(2500000);
  const [budgetFlexibility, setBudgetFlexibility] = useState<EventProposalRecord["budgetFlexibility"]>("Flexible Budget");
  const [servicesBudget, setServicesBudget] = useState<number | undefined>(undefined);
  const [sponsorshipRequirements, setSponsorshipRequirements] = useState("");
  const [expectedDeliverables, setExpectedDeliverables] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; url: string; uploadedAt: string }[]>([]);

  if (!isOpen) return null;

  const handleCategoryChange = (key: EntertainmentCategoryKey) => {
    setSelectedCategory(key);
    const def = ENTERTAINMENT_CATEGORIES.find(c => c.key === key);
    if (def && def.eventTypes.length > 0) {
      setEventType(def.eventTypes[0]);
    }
    if (key === "movie_promotions" || key === "film_industry") {
      setIsFilmRelated(true);
    } else {
      setIsFilmRelated(false);
    }
  };

  const toggleService = (srv: string) => {
    if (servicesRequired.includes(srv)) {
      setServicesRequired(servicesRequired.filter(s => s !== srv));
    } else {
      setServicesRequired([...servicesRequired, srv]);
    }
  };

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!eventName.trim()) {
        setErrorMessage("Please enter the Event or Movie Name.");
        return false;
      }
      if (!preferredDate) {
        setErrorMessage("Please select a preferred event date.");
        return false;
      }
      if (!preferredCity.trim()) {
        setErrorMessage("Please specify the preferred city.");
        return false;
      }
    } else if (step === 2) {
      if (!companyName.trim()) {
        setErrorMessage("Please enter your Company / Organization / Production name.");
        return false;
      }
      if (!contactPerson.trim()) {
        setErrorMessage("Please enter the contact person's full name.");
        return false;
      }
      if (!mobile.trim() || mobile.trim() === "+91" || mobile.length < 10) {
        setErrorMessage("Please provide a valid contact mobile number with country code.");
        return false;
      }
      if (!email.trim() || !email.includes("@")) {
        setErrorMessage("Please enter a valid email address for proposal dispatch.");
        return false;
      }
    } else if (step === 4) {
      if (servicesRequired.length === 0) {
        setErrorMessage("Please select at least one required service.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((currentStep + 1) as any);
      }
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as any);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 20 * 1024 * 1024) {
      alert("File size exceeds 20MB limit. Please upload a smaller brief or presentation.");
      return;
    }
    const newDoc = {
      name: file.name,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString()
    };
    setAttachments([...attachments, newDoc]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: Omit<EventProposalRecord, "id" | "referenceId" | "createdAt" | "updatedAt" | "status" | "internalNotes" | "followUps" | "isConvertedToEvent"> = {
        category: selectedCategory,
        eventType,
        eventName: eventName.trim(),
        eventDescription: eventDescription.trim(),
        preferredDate,
        alternativeDate: alternativeDate || undefined,
        preferredCity,
        preferredVenue: preferredVenue.trim() || "To Be Finalized",
        expectedAudience: Number(expectedAudience) || 1000,
        expectedDurationHours: Number(expectedDurationHours) || 4,
        isPaidEvent,
        ticketPriceRange: isPaidEvent ? ticketPriceRange : undefined,

        organizerType,
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        officeAddress: officeAddress.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        socialMediaUrl: socialMediaUrl.trim() || undefined,

        isFilmRelated,
        movieTitle: isFilmRelated ? (movieTitle.trim() || eventName) : undefined,
        productionHouseName: isFilmRelated ? (productionHouseName.trim() || companyName) : undefined,
        directorName: isFilmRelated ? directorName.trim() : undefined,
        producerName: isFilmRelated ? producerName.trim() : undefined,
        leadActors: isFilmRelated ? leadActors.trim() : undefined,
        musicDirector: isFilmRelated ? musicDirector.trim() : undefined,
        singersGuests: isFilmRelated ? singersGuests.trim() : undefined,
        celebrityAttendanceStatus: isFilmRelated ? celebrityAttendanceStatus : undefined,

        artistNames: !isFilmRelated ? artistNames.trim() : undefined,
        performanceType: !isFilmRelated ? performanceType : undefined,
        performersCount: !isFilmRelated ? Number(performersCount) : undefined,
        performanceDurationMins: !isFilmRelated ? Number(performanceDurationMins) : undefined,
        technicalRiderNotes: technicalRiderNotes.trim() || undefined,

        servicesRequired,

        estimatedBudget: isQuotRequestedWithoutBudget ? 0 : Number(estimatedBudget) || 0,
        isQuotRequestedWithoutBudget,
        budgetFlexibility: isQuotRequestedWithoutBudget ? "Awaiting Quotation" : budgetFlexibility,
        servicesBudget: servicesBudget ? Number(servicesBudget) : undefined,
        sponsorshipRequirements: sponsorshipRequirements.trim() || undefined,
        expectedDeliverables: expectedDeliverables.trim() || undefined,
        specialRequirements: specialRequirements.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
        attachments
      };

      const result = await submitEventProposal(payload);
      if (result.success && result.proposal) {
        setSubmitSuccess(result.proposal);
        if (onProposalSubmitted) {
          onProposalSubmitted(result.proposal);
        }
      } else {
        setErrorMessage(result.message || "Failed to submit proposal. Please verify your details.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected network error occurred while submitting your proposal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#0D0D12] border-2 border-gold/40 rounded-2xl shadow-2xl shadow-gold/10 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#171722] via-[#101018] to-[#171722] border-b border-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/50 flex items-center justify-center text-gold shadow-md">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-gold uppercase px-2 py-0.5 rounded bg-gold/10 border border-gold/30">
                  CINEVENUE
                </span>
                <span className="text-[11px] text-zinc-400">Turnkey Event Planning & Production</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                Submit an Event Proposal
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {submitSuccess ? (
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-2xl font-black text-white">Proposal Successfully Submitted!</h3>
              <p className="text-sm text-zinc-300">
                Your event proposal has been routed to the Senior Event Management Directorate at CineVenue.
              </p>
            </div>

            <div className="p-5 bg-gradient-to-b from-[#181824] to-[#101018] border border-gold/40 rounded-xl max-w-md mx-auto text-left space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Proposal Reference ID:</span>
                <span className="font-mono font-bold text-gold text-sm">{submitSuccess.referenceId}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Event Title:</span>
                <span className="font-semibold text-white">{submitSuccess.eventName}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Category & Type:</span>
                <span className="text-zinc-200">{submitSuccess.eventType}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Preferred Date & City:</span>
                <span className="text-zinc-200">{submitSuccess.preferredDate} ({submitSuccess.preferredCity})</span>
              </div>
            </div>

            <div className="text-xs text-zinc-400 max-w-md mx-auto">
              A formal confirmation notice has been sent to <span className="text-gold font-semibold">{submitSuccess.email}</span>. A dedicated Event Manager will review technical requirements and furnish a branded quotation within 24 hours.
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-black font-bold text-sm tracking-wide shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Steps Progress Tabs */}
            <div className="grid grid-cols-5 text-center border-b border-zinc-800 bg-[#12121A] text-xs">
              {[
                { step: 1, label: "Event Info" },
                { step: 2, label: "Organizer" },
                { step: 3, label: "Cast & Details" },
                { step: 4, label: "Services" },
                { step: 5, label: "Budget & Notes" },
              ].map(s => (
                <div
                  key={s.step}
                  onClick={() => {
                    if (s.step < currentStep) setCurrentStep(s.step as any);
                  }}
                  className={`py-3 px-1 border-b-2 transition-all cursor-pointer ${
                    currentStep === s.step
                      ? "border-gold text-gold font-bold bg-gold/5"
                      : currentStep > s.step
                      ? "border-emerald-500/60 text-emerald-400 font-medium"
                      : "border-transparent text-zinc-500"
                  }`}
                >
                  <span className="hidden md:inline">Step {s.step}: </span>
                  {s.label}
                </div>
              ))}
            </div>

            {/* Error Notice */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

              {/* STEP 1: EVENT INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gold" />
                      Section A: Entertainment Event Information
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Select your entertainment category and core event parameters.
                    </p>
                  </div>

                  {/* 5 Entertainment Categories */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                      Select Entertainment Category *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {ENTERTAINMENT_CATEGORIES.map(cat => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => handleCategoryChange(cat.key)}
                          className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                            selectedCategory === cat.key
                              ? "bg-gold/15 border-gold shadow-md text-white"
                              : "bg-[#14141E] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-white flex items-center justify-between">
                              <span>{cat.name}</span>
                              {selectedCategory === cat.key && <Check className="w-4 h-4 text-gold" />}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{cat.tagline}</div>
                          </div>
                          <span className="text-[10px] text-gold/80 mt-2 font-mono">{cat.eventTypes.length} event types</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Event Type Dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Specific Event Type *
                      </label>
                      <select
                        value={eventType}
                        onChange={e => setEventType(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                      >
                        {activeCategoryDef.eventTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Event or Movie Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hari Hara Veera Mallu Pre-Release"
                        value={eventName}
                        onChange={e => setEventName(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Event Brief & Vision
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the target audience, format, special stage concepts or key program flow..."
                      value={eventDescription}
                      onChange={e => setEventDescription(e.target.value)}
                      className="w-full bg-[#161622] border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold resize-none"
                    />
                  </div>

                  {/* Dates, Venue & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={e => setPreferredDate(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Alternative Date
                      </label>
                      <input
                        type="date"
                        value={alternativeDate}
                        onChange={e => setAlternativeDate(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Preferred City *
                      </label>
                      <select
                        value={preferredCity}
                        onChange={e => setPreferredCity(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      >
                        {["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Visakhapatnam", "Vijayawada", "Kochi", "Delhi-NCR", "Other"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Venue Preference
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. LB Stadium / Indoor Arena"
                        value={preferredVenue}
                        onChange={e => setPreferredVenue(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  {/* Audience, Duration & Ticketing */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Expected Audience Size
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={500}
                        value={expectedAudience}
                        onChange={e => setExpectedAudience(Number(e.target.value))}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Event Duration (Hours)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={expectedDurationHours}
                        onChange={e => setExpectedDurationHours(Number(e.target.value))}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Event Admission
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPaidEvent(false)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                            !isPaidEvent
                              ? "bg-gold/20 border-gold text-gold"
                              : "bg-[#161622] border-zinc-700 text-zinc-400"
                          }`}
                        >
                          Free / Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPaidEvent(true)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                            isPaidEvent
                              ? "bg-gold/20 border-gold text-gold"
                              : "bg-[#161622] border-zinc-700 text-zinc-400"
                          }`}
                        >
                          Ticketed
                        </button>
                      </div>
                    </div>
                  </div>

                  {isPaidEvent && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Expected Ticket Price Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹499 - ₹4,999 (VIP & General)"
                        value={ticketPriceRange}
                        onChange={e => setTicketPriceRange(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: ORGANIZER INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Building className="w-4 h-4 text-gold" />
                      Section B: Organizer & Contact Information
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Official credentials for production houses, artist management or entertainment organizations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Organizer Entity Type *
                      </label>
                      <select
                        value={organizerType}
                        onChange={e => setOrganizerType(e.target.value as any)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                      >
                        <option value="Production House">Production House (Cinema Studio)</option>
                        <option value="Artist Management">Artist Management Company</option>
                        <option value="Event Organizer">Professional Event Organization</option>
                        <option value="Entertainment Organization">Entertainment / Media Network</option>
                        <option value="Individual Producer">Individual Producer / Promoter</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Organization / Production Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mythri Movie Makers / Live Nation"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Primary Contact Person *
                      </label>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={contactPerson}
                        onChange={e => setContactPerson(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Mobile Number with Country Code *
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98490 00000"
                        value={mobile}
                        onChange={e => setMobile(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Official Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="events@yourstudio.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Office / Registered Address (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Suite, Street, City, State, PIN"
                      value={officeAddress}
                      onChange={e => setOfficeAddress(e.target.value)}
                      className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Official Website (Optional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Social Handles / Page Link (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Instagram / X / YouTube handle"
                        value={socialMediaUrl}
                        onChange={e => setSocialMediaUrl(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: MOVIE, ARTIST & PERFORMER DETAILS (CONDITIONAL) */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Star className="w-4 h-4 text-gold" />
                      Section C: Movie, Artist & Talent Details
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Tailored to film releases or live music artists. Only relevant fields are required.
                    </p>
                  </div>

                  {/* Toggle between Film Specific or Music/Live Specific */}
                  <div className="flex gap-4 p-2 bg-[#12121A] border border-zinc-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIsFilmRelated(true)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                        isFilmRelated
                          ? "bg-gold text-black shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Clapperboard className="w-4 h-4" />
                      Film & Cinema Launch
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFilmRelated(false)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                        !isFilmRelated
                          ? "bg-gold text-black shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      Live Concert / Stage Talent
                    </button>
                  </div>

                  {/* FILM SPECIFIC FIELDS */}
                  {isFilmRelated ? (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Feature Film Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Hari Hara Veera Mallu"
                            value={movieTitle}
                            onChange={e => setMovieTitle(e.target.value)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Production House Banner
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Mega Surya Productions"
                            value={productionHouseName}
                            onChange={e => setProductionHouseName(e.target.value)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Director & Producer
                          </label>
                          <input
                            type="text"
                            placeholder="Director & Producer names"
                            value={directorName}
                            onChange={e => setDirectorName(e.target.value)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Lead Cast (Hero, Heroine & Key Stars)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Pawan Kalyan, Nidhhi Agerwal, Bobby Deol"
                            value={leadActors}
                            onChange={e => setLeadActors(e.target.value)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Music Director & Playback Singers
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. M. M. Keeravani, Shreya Ghoshal"
                            value={musicDirector}
                            onChange={e => setMusicDirector(e.target.value)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Star Attendance Confirmation Status
                          </label>
                          <select
                            value={celebrityAttendanceStatus}
                            onChange={e => setCelebrityAttendanceStatus(e.target.value as any)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          >
                            <option value="Confirmed">Confirmed Attendance</option>
                            <option value="Invited & Awaiting">Invited & Awaiting Schedule</option>
                            <option value="In Discussion">In Discussion with Management</option>
                            <option value="Open to Suggestion">Open to CineVenue Suggestion</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* MUSIC & LIVE ENTERTAINMENT SPECIFIC FIELDS */
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Headline Artist / Band Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Anirudh Ravichander / Sid Sriram"
                            value={artistNames}
                            onChange={e => setArtistNames(e.target.value)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Performance Type
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Full Live Band / Stand-Up Comedy / Symphony"
                            value={performanceType}
                            onChange={e => setPerformanceType(e.target.value)}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Performers & Musicians Count
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={performersCount}
                            onChange={e => setPerformersCount(Number(e.target.value))}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                            Performance Duration (Minutes)
                          </label>
                          <input
                            type="number"
                            min={30}
                            step={15}
                            value={performanceDurationMins}
                            onChange={e => setPerformanceDurationMins(Number(e.target.value))}
                            className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                          Technical Rider / Acoustic Requirements
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Specific mixer consoles, in-ear monitor setups, backline gear, microphone preferences..."
                          value={technicalRiderNotes}
                          onChange={e => setTechnicalRiderNotes(e.target.value)}
                          className="w-full bg-[#161622] border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: SERVICES REQUIRED (22 SERVICES) */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gold" />
                      Section D: Production & Management Services Required
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Check all services you require CineVenue to engineer, manage or supply.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {REQUIRED_SERVICES_LIST.map(srv => {
                      const isChecked = servicesRequired.includes(srv);
                      return (
                        <div
                          key={srv}
                          onClick={() => toggleService(srv)}
                          className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                            isChecked
                              ? "bg-gold/15 border-gold text-white font-bold"
                              : "bg-[#14141E] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <span>{srv}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked ? "bg-gold border-gold text-black" : "border-zinc-700 bg-zinc-900"
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: BUDGET & DELIVERABLES */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gold" />
                      Section E: Budget, Deliverables & Quotation
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Specify budget range or request an itemized CineVenue quotation.
                    </p>
                  </div>

                  {/* "I need a quotation from CineVenue" Checkbox */}
                  <div
                    onClick={() => setIsQuotRequestedWithoutBudget(!isQuotRequestedWithoutBudget)}
                    className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-[#151522] to-amber-950/20 border border-gold/40 cursor-pointer flex items-center justify-between shadow-md"
                  >
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold" />
                        I need an itemized quotation from CineVenue
                      </div>
                      <div className="text-xs text-zinc-400">
                        Check this if you do not have a fixed budget and would like CineVenue engineers to propose an optimized estimate.
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isQuotRequestedWithoutBudget ? "bg-gold border-gold text-black" : "border-zinc-600 bg-zinc-900"
                    }`}>
                      {isQuotRequestedWithoutBudget && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  {!isQuotRequestedWithoutBudget && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                          Estimated Total Budget (INR)
                        </label>
                        <input
                          type="number"
                          step={100000}
                          value={estimatedBudget}
                          onChange={e => setEstimatedBudget(Number(e.target.value))}
                          className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold font-mono"
                        />
                        <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                          ₹{Number(estimatedBudget || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                          Budget Flexibility
                        </label>
                        <select
                          value={budgetFlexibility}
                          onChange={e => setBudgetFlexibility(e.target.value as any)}
                          className="w-full bg-[#161622] border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                        >
                          <option value="Exact Budget">Strict / Exact Budget</option>
                          <option value="Flexible Budget">Flexible Budget (±20%)</option>
                          <option value="Awaiting Quotation">Awaiting Best Market Proposal</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Expected Deliverables & Deliverable Highlights
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. 40ft Jimmy Jib, 8-Camera 4K Live Broadcast setup, drone coverage, 50 VIP security guards..."
                        value={expectedDeliverables}
                        onChange={e => setExpectedDeliverables(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Special Requirements / Security / Artist Hospitality
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Dedicated vanity vans, green room AC, police bandobast, celebrity convoy escort..."
                        value={specialRequirements}
                        onChange={e => setSpecialRequirements(e.target.value)}
                        className="w-full bg-[#161622] border border-zinc-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-gold resize-none"
                      />
                    </div>
                  </div>

                  {/* Attachment Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Upload Event Brief / Technical Rider / Reference Poster (PDF, Images up to 20MB)
                    </label>
                    <label className="border-2 border-dashed border-zinc-700 hover:border-gold/60 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-[#14141E] transition-all">
                      <Upload className="w-6 h-6 text-gold mb-2" />
                      <span className="text-xs text-zinc-300 font-medium">Click to upload proposal brief, deck, or technical rider</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Supported: PDF, DOCX, PNG, JPG (Max 20MB)</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                    </label>

                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                            <span className="truncate max-w-sm">{att.name}</span>
                            <span className="text-emerald-400 font-bold text-[10px]">Attached</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-gold/20"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-7 py-3 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold text-black font-extrabold text-sm tracking-wide shadow-xl shadow-gold/25 transition-all flex items-center gap-2 ${
                        isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {isSubmitting ? "Submitting Proposal..." : "Submit Event Proposal"}
                    </button>
                  )}
                </div>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
}
