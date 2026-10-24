import React, { useState } from 'react';
import { 
  Film, 
  Send, 
  Upload, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  IndianRupee, 
  Sparkles, 
  X, 
  AlertCircle, 
  Clock, 
  Check, 
  Copy,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Clapperboard,
  Video,
  Layers,
  Globe,
  FileText,
  Lock
} from 'lucide-react';
import { Proposal } from '../../types';

interface MovieProductionProposalFormProps {
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (proposal: Proposal) => void;
  onCancel?: () => void;
}

const GENRE_OPTIONS = [
  "Action",
  "Drama",
  "Romance",
  "Comedy",
  "Thriller",
  "Horror",
  "Crime",
  "Science Fiction",
  "Fantasy",
  "Documentary",
  "Animation",
  "Other"
];

const PRODUCTION_TYPE_OPTIONS = [
  "Feature Film",
  "Short Film",
  "Web Series",
  "Documentary",
  "Independent Film",
  "Other"
];

const PROJECT_STAGE_OPTIONS = [
  "Idea / Script Development",
  "Pre-production",
  "Casting",
  "Production / Shooting",
  "Post-production",
  "Completed"
];

const ROLE_OPTIONS = [
  "Director",
  "Producer",
  "Executive Producer",
  "Line Producer",
  "Writer / Screenwriter",
  "Production Manager",
  "Cinematographer",
  "Actor / Lead Cast",
  "Other"
];

const MOVIE_SERVICES = [
  "Film Production Support",
  "Pre-release Event",
  "Audio Launch",
  "Trailer Launch",
  "Press Meet",
  "Success Meet",
  "Celebrity / Artist Coordination",
  "Location and Venue Coordination",
  "Marketing and Promotions",
  "Brand Partnerships and Sponsorships",
  "Other"
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Kerala",
  "Maharashtra",
  "Delhi NCR",
  "Gujarat",
  "West Bengal",
  "Rajasthan",
  "Uttar Pradesh",
  "Punjab",
  "Madhya Pradesh",
  "Odisha",
  "Other"
];

const COMMON_LANGUAGES = [
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "English",
  "Bengali",
  "Marathi",
  "Punjabi",
  "Other"
];

export const MovieProductionProposalForm: React.FC<MovieProductionProposalFormProps> = ({
  userEmail = '',
  userName = '',
  userPhone = '',
  onSuccess,
  onCancel
}) => {
  // Section 1: Project Details State
  const [projectTitle, setProjectTitle] = useState('');
  const [genre, setGenre] = useState('Action');
  const [productionType, setProductionType] = useState('Feature Film');
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [expectedReleaseDate, setExpectedReleaseDate] = useState('');
  const [language, setLanguage] = useState('Telugu');
  const [customLanguage, setCustomLanguage] = useState('');
  const [storyConcept, setStoryConcept] = useState('');
  const [projectStage, setProjectStage] = useState('Idea / Script Development');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [servicesRequired, setServicesRequired] = useState<string[]>([
    'Film Production Support'
  ]);

  // Section 2: Contact Information State
  const [fullName, setFullName] = useState(userName || '');
  const [roleDesignation, setRoleDesignation] = useState('Director');
  const [customRole, setCustomRole] = useState('');
  const [productionHouse, setProductionHouse] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [phone, setPhone] = useState(userPhone || '');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Section 3: Additional Requirements State
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Email' | 'Phone' | 'WhatsApp'>('WhatsApp');
  const [attachments, setAttachments] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Validation & Submission State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedProposal, setSubmittedProposal] = useState<Proposal | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Toggle Services
  const toggleService = (service: string) => {
    setServicesRequired(prev => 
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    );
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: typeof attachments = [];
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png'];

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        alert(`File "${file.name}" has an unsupported format. Please upload PDF, Word document, presentation, or image.`);
        return;
      }
      // 15MB limit
      if (file.size > 15 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 15MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newAttachments.push({
          id: `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          url: reader.result as string,
          uploadedAt: new Date().toISOString()
        });

        if (newAttachments.length === files.length) {
          setAttachments(prev => [...prev, ...newAttachments]);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Project Details
    if (!projectTitle.trim()) {
      newErrors.projectTitle = "Project Title is required.";
    }
    if (!genre) {
      newErrors.genre = "Please select a genre.";
    }
    if (!productionType) {
      newErrors.productionType = "Please select a production type.";
    }
    const finalLang = language === 'Other' ? customLanguage.trim() : language;
    if (!finalLang) {
      newErrors.language = "Please provide the primary language.";
    }
    if (!storyConcept.trim() || storyConcept.trim().length < 10) {
      newErrors.storyConcept = "Project Description / Story Concept must be at least 10 characters.";
    }

    // Contact Information
    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    }
    const finalRole = roleDesignation === 'Other' ? customRole.trim() : roleDesignation;
    if (!finalRole) {
      newErrors.roleDesignation = "Role / Designation is required.";
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    // Indian Mobile Number validation (at least 10 digits)
    const cleanedPhone = phone.replace(/[^0-9]/g, '');
    if (!phone.trim() || cleanedPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }
    if (whatsappNumber.trim()) {
      const cleanedWA = whatsappNumber.replace(/[^0-9]/g, '');
      if (cleanedWA.length < 10) {
        newErrors.whatsappNumber = "WhatsApp number must be at least 10 digits.";
      }
    }
    if (!city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!state.trim()) {
      newErrors.state = "State is required.";
    }

    // Privacy Consent
    if (!consentAgreed) {
      newErrors.consent = "You must agree to the privacy policy to submit your proposal.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      setErrorMessage("Please resolve the highlighted errors before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalLanguage = language === 'Other' ? customLanguage.trim() : language;
      const finalRole = roleDesignation === 'Other' ? customRole.trim() : roleDesignation;

      let parsedBudget: number | undefined = undefined;
      if (estimatedBudget.trim()) {
        const num = parseInt(estimatedBudget.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0) {
          parsedBudget = num;
        }
      }

      const payload = {
        category: 'MOVIE_PRODUCTION',
        customerType: 'Film Production',
        serviceType: 'Film Production',
        projectName: projectTitle.trim(),
        projectTitle: projectTitle.trim(),
        genre,
        productionType,
        expectedStartDate: expectedStartDate || undefined,
        expectedReleaseDate: expectedReleaseDate || undefined,
        language: finalLanguage,
        primaryLanguage: finalLanguage,
        description: storyConcept.trim(),
        storyConcept: storyConcept.trim(),
        projectStage,
        estimatedBudget: parsedBudget,
        servicesRequired,

        fullName: fullName.trim(),
        roleDesignation: finalRole,
        role: finalRole,
        companyName: productionHouse.trim(),
        productionHouse: productionHouse.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        location: `${city.trim()}, ${state.trim()}`,
        websiteUrl: websiteUrl.trim() || undefined,

        additionalRequirements: additionalRequirements.trim() || undefined,
        contactMethod: preferredContactMethod,
        preferredContactMethod,
        attachments,
        consentAgreed: true
      };

      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit proposal. Please check your inputs.");
      }

      const confirmedProposal: Proposal = data.proposal || {
        proposalId: data.referenceId || data.proposalId,
        ...payload,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSubmittedProposal(confirmedProposal);

      // Save to local user proposals registry for Settings and live side preview
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('cinevenue_submitted_proposals');
          const list: Proposal[] = stored ? JSON.parse(stored) : [];
          const updated = [confirmedProposal, ...list.filter(p => p.proposalId !== confirmedProposal.proposalId)];
          localStorage.setItem('cinevenue_submitted_proposals', JSON.stringify(updated));
        } catch (e) {
          console.warn("Could not save to localStorage:", e);
        }
        window.dispatchEvent(new CustomEvent('cinevenue-proposals-updated', { detail: confirmedProposal }));
      }

      if (onSuccess) {
        onSuccess(confirmedProposal);
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage(err.message || "Something went wrong while submitting your proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyProposalId = () => {
    if (!submittedProposal?.proposalId) return;
    navigator.clipboard.writeText(submittedProposal.proposalId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedProposal) {
    return (
      <div className="bg-[#0D0D12] border border-gold/40 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center max-w-3xl mx-auto shadow-2xl relative overflow-hidden" id="movie-proposal-success-box">
        {/* Glow accents */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-xs font-mono font-bold uppercase tracking-widest mb-4">
          <Clapperboard className="w-3.5 h-3.5 text-gold" />
          <span>Movie Proposal Registered</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white uppercase tracking-tight mb-3">
          Proposal Successfully Submitted!
        </h2>
        <p className="text-xs sm:text-sm text-white/70 max-w-xl mx-auto leading-relaxed mb-6">
          Thank you for sharing your movie production proposal with CineVenue Entertainments Pvt Ltd. Our executive production team is reviewing your brief.
        </p>

        {/* Reference ID Pill */}
        <div className="bg-black/60 border border-gold/30 rounded-2xl p-4 sm:p-5 max-w-md mx-auto mb-8 shadow-lg">
          <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-mono mb-1">
            Official Production Reference ID
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-lg sm:text-2xl font-mono font-extrabold text-gold tracking-wider">
              {submittedProposal.proposalId}
            </span>
            <button
              type="button"
              onClick={copyProposalId}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all cursor-pointer"
              title="Copy Reference ID"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {isCopied && (
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Copied to clipboard!</span>
          )}
        </div>

        {/* Proposal Summary Details */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-6 text-left max-w-2xl mx-auto space-y-3 mb-8 text-xs sm:text-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gold font-mono border-b border-white/10 pb-2 flex items-center justify-between">
            <span>Project Submission Summary</span>
            <span className="px-2 py-0.5 rounded bg-gold/10 text-gold text-[10px]">Status: Pending Review</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/80 pt-1">
            <div>
              <span className="text-white/40 block text-[11px]">Project Title:</span>
              <span className="font-bold text-white">{submittedProposal.projectName}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[11px]">Production Type & Genre:</span>
              <span className="font-semibold text-white">{(submittedProposal as any).productionType || 'Feature Film'} • {(submittedProposal as any).genre || 'Action'}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[11px]">Primary Language:</span>
              <span className="font-semibold text-white">{(submittedProposal as any).language || 'Telugu'}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[11px]">Applicant Role:</span>
              <span className="font-semibold text-white">{(submittedProposal as any).roleDesignation || 'Filmmaker'} ({submittedProposal.fullName})</span>
            </div>
            <div>
              <span className="text-white/40 block text-[11px]">Contact Email & Mobile:</span>
              <span className="font-mono text-white/90">{submittedProposal.email} • {submittedProposal.phone}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[11px]">Submission Date:</span>
              <span className="font-mono text-white/90">{new Date(submittedProposal.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        </div>

        {/* Notice: Review status in Settings */}
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 max-w-xl mx-auto text-left text-xs space-y-2 mb-8">
          <div className="font-bold text-amber-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>-- Your submitted proposal forms reviews status will be displayed in settings</span>
          </div>
          <p className="text-white/70 text-[11px] leading-relaxed">
            You can monitor real-time review progress, Directorate feedback notes, and status changes anytime from your CineVenue Account Settings.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = '/settings?section=proposals';
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 border-0"
          >
            <span>Track Review in Settings</span>
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmittedProposal(null);
              setProjectTitle('');
              setStoryConcept('');
              setEstimatedBudget('');
              setAttachments([]);
              setConsentAgreed(false);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/15 transition-all cursor-pointer"
          >
            Submit Another Proposal
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="movie-production-proposal-form">
      {/* CARD BRANDING HEADER */}
      <div className="border-b border-white/10 pb-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-gold uppercase">
          <Clapperboard className="w-4 h-4 text-gold" />
          <span>CINEVENUE ENTERTAINMENTS PVT LTD</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-white uppercase tracking-wide">
          Movie Production Proposal
        </h2>
        <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
          Tell us about your film project. We’re here to support your vision with professional production and entertainment services.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-xs sm:text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">Submission Error</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: PROJECT DETAILS */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-mono font-bold text-xs">
            1
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gold uppercase tracking-wider font-mono">
              Section 1: Project Details
            </h3>
            <p className="text-[11px] text-white/50">Core specifications and creative requirements of your film</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 1. Project Title */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              Project Title <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Project Vaikuntha / Untitled Action Thriller"
              value={projectTitle}
              onChange={(e) => {
                setProjectTitle(e.target.value);
                if (errors.projectTitle) setErrors(prev => ({ ...prev, projectTitle: '' }));
              }}
              className={`w-full bg-white/5 border ${errors.projectTitle ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors`}
            />
            {errors.projectTitle && (
              <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.projectTitle}</span>
              </p>
            )}
          </div>

          {/* 2. Genre */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              Genre <span className="text-gold">*</span>
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#12131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* 3. Production Type */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              Production Type <span className="text-gold">*</span>
            </label>
            <select
              value={productionType}
              onChange={(e) => setProductionType(e.target.value)}
              className="w-full bg-[#12131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            >
              {PRODUCTION_TYPE_OPTIONS.map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>

          {/* 4. Expected Production Start Date */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold/80" />
              <span>Expected Production Start Date</span>
              <span className="text-white/40 text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <input
              type="date"
              value={expectedStartDate}
              onChange={(e) => setExpectedStartDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* 5. Expected Release Date */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold/80" />
              <span>Expected Release Date</span>
              <span className="text-white/40 text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <input
              type="date"
              value={expectedReleaseDate}
              onChange={(e) => setExpectedReleaseDate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* 6. Primary Language */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
                Primary Language <span className="text-gold">*</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#12131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
              >
                {COMMON_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            {language === 'Other' && (
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
                  Specify Language <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Odia / Bhojpuri / French"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            )}
          </div>

          {/* 7. Current Project Stage */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              Current Project Stage
            </label>
            <select
              value={projectStage}
              onChange={(e) => setProjectStage(e.target.value)}
              className="w-full bg-[#12131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            >
              {PROJECT_STAGE_OPTIONS.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 8. Estimated Production Budget */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-gold/80" />
                <span>Estimated Production Budget</span>
              </span>
              <span className="text-gold text-[10px] font-mono">INR (₹)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ₹5,00,00,000 or 50000000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
            />
            <p className="text-[10px] text-white/40 mt-1">Leave empty or specify your approximate scale (Micro, Indie, or Large Budget).</p>
          </div>

          {/* 9. Project Description / Story Concept */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              Project Description / Story Concept <span className="text-gold">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Summarize the core premise, logline, target audience, scale, and vision of your film project..."
              value={storyConcept}
              onChange={(e) => {
                setStoryConcept(e.target.value);
                if (errors.storyConcept) setErrors(prev => ({ ...prev, storyConcept: '' }));
              }}
              className={`w-full bg-white/5 border ${errors.storyConcept ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors leading-relaxed`}
            />
            {errors.storyConcept && (
              <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.storyConcept}</span>
              </p>
            )}
          </div>

          {/* 10. Required Services (Multi-select Checkboxes) */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-white/90 uppercase tracking-wider">
              Required Services <span className="text-white/40 text-[10px] font-normal lowercase">(select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {MOVIE_SERVICES.map((srv) => {
                const isChecked = servicesRequired.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-gold/15 border-gold/60 text-white font-semibold shadow-sm'
                        : 'bg-white/[0.02] border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${
                      isChecked ? 'bg-gold border-gold text-black' : 'border-white/30'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{srv}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: CONTACT INFORMATION */}
      {/* ========================================================================= */}
      <div className="space-y-5 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-mono font-bold text-xs">
            2
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gold uppercase tracking-wider font-mono">
              Section 2: Contact Information
            </h3>
            <p className="text-[11px] text-white/50">Primary contact filmmaker, director, or production house representative</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gold/80" />
              <span>Full Name</span>
              <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. S. S. Rajamouli"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
              }}
              className={`w-full bg-white/5 border ${errors.fullName ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors`}
            />
            {errors.fullName && (
              <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Role / Designation */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              Role / Designation <span className="text-gold">*</span>
            </label>
            <select
              value={roleDesignation}
              onChange={(e) => setRoleDesignation(e.target.value)}
              className="w-full bg-[#12131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {roleDesignation === 'Other' && (
              <input
                type="text"
                placeholder="Specify your role (e.g. Showrunner)"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mt-2 text-sm text-white focus:outline-none focus:border-gold"
              />
            )}
          </div>

          {/* Production House / Company Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gold/80" />
              <span>Production House / Company Name</span>
              <span className="text-white/40 text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mythri Movie Makers / Independent Directorate"
              value={productionHouse}
              onChange={(e) => setProductionHouse(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gold/80" />
              <span>Email Address</span>
              <span className="text-gold">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="filmmaker@production.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              className={`w-full bg-white/5 border ${errors.email ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors`}
            />
            {errors.email && (
              <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gold/80" />
              <span>Mobile Number</span>
              <span className="text-gold">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-gold/90">
                +91
              </span>
              <input
                type="tel"
                required
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                }}
                className={`w-full bg-white/5 border ${errors.phone ? 'border-rose-500' : 'border-white/10'} rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors font-mono`}
              />
            </div>
            {errors.phone && (
              <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <span>WhatsApp Number</span>
              <span className="text-white/40 text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-400">
                +91
              </span>
              <input
                type="tel"
                placeholder="Same as mobile or alternate"
                value={whatsappNumber}
                onChange={(e) => {
                  setWhatsappNumber(e.target.value);
                  if (errors.whatsappNumber) setErrors(prev => ({ ...prev, whatsappNumber: '' }));
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors font-mono"
              />
            </div>
            {errors.whatsappNumber && (
              <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.whatsappNumber}</span>
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold/80" />
              <span>City</span>
              <span className="text-gold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hyderabad / Mumbai / Chennai"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
              }}
              className={`w-full bg-white/5 border ${errors.city ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors`}
            />
            {errors.city && (
              <p className="text-rose-400 text-[11px] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.city}</span>
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              State <span className="text-gold">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (errors.state) setErrors(prev => ({ ...prev, state: '' }));
              }}
              className="w-full bg-[#12131A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Company Website / Portfolio URL */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-gold/80" />
              <span>Company Website / Portfolio URL</span>
              <span className="text-white/40 text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://productionhouse.com / IMDb / Showreel"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: ADDITIONAL REQUIREMENTS & ATTACHMENTS */}
      {/* ========================================================================= */}
      <div className="space-y-5 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <div className="w-7 h-7 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold font-mono font-bold text-xs">
            3
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gold uppercase tracking-wider font-mono">
              Section 3: Additional Requirements
            </h3>
            <p className="text-[11px] text-white/50">Specific deliverables, contact preferences, and supporting material</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Additional Requirements Field */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider">
              Additional Requirements <span className="text-white/40 text-[10px] font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Special equipment needs, target shoot locations, co-producers, specific directorate services required..."
              value={additionalRequirements}
              onChange={(e) => setAdditionalRequirements(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors leading-relaxed"
            />
          </div>

          {/* Preferred Contact Method */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-2 uppercase tracking-wider">
              Preferred Contact Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Email', 'Phone', 'WhatsApp'] as const).map((method) => {
                const isSelected = preferredContactMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContactMethod(method)}
                    className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-gold/20 border-gold text-gold shadow-sm shadow-gold/20'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-gold/80" />
                <span>Attachment Upload</span>
              </span>
              <span className="text-white/40 text-[10px] font-normal">PDF, DOC, DOCX, PPT, PPTX, JPG, PNG (Max 15MB)</span>
            </label>

            <div className="border border-dashed border-white/20 hover:border-gold/50 rounded-2xl p-6 text-center transition-colors bg-white/[0.01]">
              <input
                type="file"
                id="movie-file-upload"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="movie-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white">
                  {isUploading ? "Uploading files..." : "Click to select or drag & drop script, pitch deck, or lookbook"}
                </div>
                <div className="text-[11px] text-white/40">
                  Secure upload • Scanned for integrity • Confidential filmmaker transmission
                </div>
              </label>

              {/* Uploaded Files Chips */}
              {attachments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-2 text-left">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="inline-flex items-center gap-2 bg-white/5 border border-white/15 px-3 py-1.5 rounded-lg text-xs text-white/90"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate max-w-[180px]">{file.name}</span>
                      <span className="text-[10px] text-white/40 font-mono">
                        ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className="text-white/40 hover:text-rose-400 p-0.5 rounded cursor-pointer transition-colors"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Policy & Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={consentAgreed}
                onChange={(e) => {
                  setConsentAgreed(e.target.checked);
                  if (errors.consent) setErrors(prev => ({ ...prev, consent: '' }));
                }}
                className="mt-1 w-4 h-4 rounded border-white/30 text-gold focus:ring-gold bg-black cursor-pointer"
              />
              <span className="text-xs text-white/70 leading-relaxed group-hover:text-white transition-colors">
                I agree to the CineVenue <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-white">Privacy Policy</a> and authorize CineVenue Entertainments Pvt Ltd to review this proposal and contact me regarding film production collaboration.
              </span>
            </label>
            {errors.consent && (
              <p className="text-rose-400 text-[11px] mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.consent}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBMIT BUTTON & SECURITY BADGE */}
      {/* ========================================================================= */}
      <div className="pt-4 space-y-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-2xl hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <Clock className="w-5 h-5 animate-spin text-black" />
              <span>SUBMITTING MOVIE PROPOSAL...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-black stroke-[2.5]" />
              <span>SUBMIT MOVIE PRODUCTION PROPOSAL</span>
            </>
          )}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/40 font-mono text-center">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Encrypted Transmission</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-gold" />
            <span>Protected IP & Story Rights</span>
          </span>
          <span>•</span>
          <span>CineVenue Entertainments Directorate</span>
        </div>
      </div>
    </form>
  );
};

export default MovieProductionProposalForm;
