import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  Upload, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Users, 
  IndianRupee, 
  Sparkles, 
  X, 
  AlertCircle, 
  Clock, 
  Check, 
  Copy,
  ChevronRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { 
  ProposalCustomerType, 
  ProposalServiceType, 
  ProposalContactMethod, 
  ProposalAttachment,
  Proposal
} from '../../types';

interface ProposalSubmitFormProps {
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  onSuccess?: (proposal: Proposal) => void;
  onCancel?: () => void;
  isOpenAsModal?: boolean;
}

const CUSTOMER_TYPES: ProposalCustomerType[] = [
  'Individual',
  'Brand / Company',
  'Film Production',
  'Event Organizer',
  'Theatre / Multiplex',
  'Advertising / Marketing Agency',
  'Other'
];

const SERVICE_TYPES: ProposalServiceType[] = [
  'Movie Promotion',
  'Audio Launch',
  'Pre-Release Event',
  'Celebrity Event',
  'Live Concert',
  'Corporate Event',
  'Private Event',
  'Brand Promotion',
  'Digital / Social Media Promotion',
  'Film Production',
  'Movie / Event Ticketing',
  'Theatre / Venue Requirement',
  'Partnership / Collaboration',
  'Other'
];

const AVAILABLE_SERVICES = [
  "Venue Booking & Liaison",
  "LED Mega Walls & Video Rigging",
  "d&b Arena Sound & Acoustic Tuning",
  "Robotic & Laser Lighting Show",
  "Stage & German Truss Setup",
  "Celebrity VIP Security & Bouncers",
  "4K Drone & Satellite Telecast",
  "On-Screen Multiplex Advertisements",
  "Lobby Standees & Digital Kiosks",
  "Digital & Social Media PR Campaign",
  "Ticketing Gate & RFID Entry Scanner",
  "Hospitality & Green Room Catering"
];

export const ProposalSubmitForm: React.FC<ProposalSubmitFormProps> = ({
  userEmail = '',
  userName = '',
  userPhone = '',
  onSuccess,
  onCancel,
  isOpenAsModal = false
}) => {
  // Form State
  const [customerType, setCustomerType] = useState<ProposalCustomerType>('Brand / Company');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState(userPhone || '');
  const [email, setEmail] = useState(userEmail || '');
  const [city, setCity] = useState('Hyderabad');
  const [contactMethod, setContactMethod] = useState<ProposalContactMethod>('WhatsApp');
  
  const [serviceType, setServiceType] = useState<ProposalServiceType>('Pre-Release Event');
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('Hyderabad');
  const [preferredDate, setPreferredDate] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState<string>('');
  const [estimatedBudget, setEstimatedBudget] = useState<string>('');
  const [servicesRequired, setServicesRequired] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  // Attachments State
  const [attachments, setAttachments] = useState<ProposalAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedProposal, setSubmittedProposal] = useState<Proposal | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Toggle service checkbox
  const toggleService = (srv: string) => {
    setServicesRequired(prev => 
      prev.includes(srv) ? prev.filter(s => s !== srv) : [...prev, srv]
    );
  };

  // Handle File Upload (Drag & Drop / Input)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments: ProposalAttachment[] = [];

    Array.from(files).forEach((file) => {
      // 15MB limit
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 15MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newAttachments.push({
          id: `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Client validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 8) {
      setErrorMessage("Please enter a valid phone number with at least 8 digits.");
      return;
    }
    if (!projectName.trim()) {
      setErrorMessage("Please enter the project or event name.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Please provide a detailed description (minimum 10 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerType,
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        city: city.trim(),
        contactMethod,
        serviceType,
        projectName: projectName.trim(),
        location: location.trim() || city.trim(),
        preferredDate: preferredDate || undefined,
        expectedAttendees: expectedAttendees ? parseInt(expectedAttendees, 10) : undefined,
        estimatedBudget: estimatedBudget ? parseInt(estimatedBudget.replace(/[^0-9]/g, ''), 10) : undefined,
        servicesRequired,
        description: description.trim(),
        attachments
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

      setSubmittedProposal(data.proposal || {
        proposalId: data.referenceId || data.proposalId,
        ...payload,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (onSuccess) {
        onSuccess(data.proposal);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferenceId = () => {
    if (!submittedProposal?.proposalId) return;
    navigator.clipboard.writeText(submittedProposal.proposalId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // SUCCESS CONFIRMATION MODAL / SCREEN
  if (submittedProposal) {
    return (
      <div className="bg-[#0f1015] border border-gold/30 rounded-2xl p-6 sm:p-10 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden" id="proposal-success-box">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <span className="px-3 py-1 bg-gold/10 border border-gold/30 text-gold text-xs font-mono font-bold rounded-full uppercase tracking-wider">
          Proposal Received
        </span>

        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-4 mb-2">
          Thank you for contacting CineVenue!
        </h2>
        <p className="text-sm text-text-secondary max-w-lg mx-auto mb-8">
          Our specialized production and event directorate has received your project briefing. Our team will review your requirements and connect with you shortly.
        </p>

        {/* Reference Box */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-5 mb-8 text-left max-w-md mx-auto">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1">
            Unique Proposal Reference ID
          </p>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-lg font-bold text-gold tracking-wide">
              {submittedProposal.proposalId}
            </span>
            <button
              onClick={copyReferenceId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-gold/20 text-white hover:text-gold border border-white/10 hover:border-gold/40 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Next Steps List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-8 text-left max-w-lg mx-auto space-y-3">
          <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold" />
            <span>What Happens Next?</span>
          </p>
          <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside">
            <li>Our Event Specialist will verify venue availability and technical riders.</li>
            <li>You will receive a phone briefing or WhatsApp consultation on <span className="text-white font-medium">{submittedProposal.phone}</span>.</li>
            <li>A tailored itemized quotation will be prepared and delivered to your portal & email.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setSubmittedProposal(null);
              setProjectName('');
              setDescription('');
              setServicesRequired([]);
              setAttachments([]);
              if (onCancel) onCancel();
            }}
            className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-gold/20 cursor-pointer"
          >
            Done
          </button>
          <button
            onClick={() => {
              setSubmittedProposal(null);
              setProjectName('');
              setDescription('');
              setServicesRequired([]);
              setAttachments([]);
            }}
            className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/10 transition-all cursor-pointer"
          >
            Submit Another Proposal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0c0d12] border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl relative ${isOpenAsModal ? 'max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto' : 'w-full'}`} id="proposal-submission-container">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>CineVenue Event & Production Directorate</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Submit a Proposal
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl">
            Partner with CineVenue for star-studded pre-releases, audio launches, brand campaigns, concert infrastructure, or multiplex screen advertising.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8" id="submit-proposal-form">
        {/* STEP 1: WHO ARE YOU? */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-3">
            1. Who Are You? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {CUSTOMER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCustomerType(type)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                  customerType === type
                    ? 'bg-gold/15 border-gold text-gold shadow-sm shadow-gold/20 font-bold'
                    : 'bg-white/[0.03] border-white/10 text-text-secondary hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: CUSTOMER CONTACT DETAILS */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-3">
            2. Customer & Organization Details <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Company / Organization / Production Banner
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Mythri Movie Makers / Nexus Global"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98490 88776"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                City / Region <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Vijayawada, Vizag, Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Preferred Contact Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['WhatsApp', 'Phone', 'Email', 'Any'] as ProposalContactMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setContactMethod(method)}
                    className={`py-2 rounded-xl text-xs font-semibold text-center border cursor-pointer ${
                      contactMethod === method
                        ? 'bg-gold/20 border-gold text-gold'
                        : 'bg-white/5 border-white/10 text-text-secondary hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: WHAT DO YOU NEED? (SERVICE TYPE) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-3">
            3. What Service Do You Need? <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {SERVICE_TYPES.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => setServiceType(service)}
                className={`p-3 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between cursor-pointer ${
                  serviceType === service
                    ? 'bg-gold/15 border-gold text-gold font-bold shadow-sm shadow-gold/20'
                    : 'bg-white/[0.03] border-white/10 text-text-secondary hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>{service}</span>
                {serviceType === service && <Check className="w-3.5 h-3.5 text-gold shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* STEP 4: PROJECT & LOGISTICAL SPECIFICATIONS */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-3">
            4. Project & Logistical Details <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Project / Event Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mega Star Film Audio Launch & 4K Live Broadcast"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Event Location / Preferred Venue <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Gachibowli Stadium / PVR Forum / Open Grounds"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Preferred Date / Target Timeline
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Expected Number of Attendees
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
                Estimated Budget (₹ INR)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 25,00,000"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Specific Services Checklist */}
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-text-secondary mb-2">
              Select Specific Required Infrastructure (Optional):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_SERVICES.map((srv) => {
                const isSelected = servicesRequired.includes(srv);
                return (
                  <button
                    key={srv}
                    type="button"
                    onClick={() => toggleService(srv)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border text-left cursor-pointer ${
                      isSelected
                        ? 'bg-gold/10 border-gold/40 text-gold font-medium'
                        : 'bg-white/[0.02] border-white/5 text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? 'bg-gold border-gold text-black' : 'border-white/20'}`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{srv}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 5: DETAILED PROJECT BRIEF */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-2">
            5. Project Brief & Scope <span className="text-red-400">*</span>
          </label>
          <p className="text-[11px] text-text-muted mb-2">
            Describe the event agenda, celebrity appearances, special equipment needs, ticketing requirements, or brand promotional deliverables.
          </p>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide all essential details so our executive team can quote accurately..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-gold leading-relaxed"
          />
          <div className="flex justify-between items-center text-[10px] text-text-muted mt-1">
            <span>Minimum 10 characters</span>
            <span>{description.length} characters</span>
          </div>
        </div>

        {/* STEP 6: ATTACHMENTS */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gold mb-2">
            6. Supporting Files & Pitch Decks (Optional)
          </label>
          <p className="text-[11px] text-text-muted mb-3">
            Upload PDF proposals, concept decks, stage diagrams, artist riders, or event posters (Max 15MB each).
          </p>

          <div className="border-2 border-dashed border-white/10 hover:border-gold/40 rounded-xl p-6 text-center transition-all bg-white/[0.01]">
            <input
              type="file"
              id="proposal-file-upload"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="proposal-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white">
                {isUploading ? "Uploading files..." : "Click to browse or drag & drop files here"}
              </p>
              <p className="text-[10px] text-text-muted">
                PDF, Word DOC, PNG, JPG up to 15MB
              </p>
            </label>
          </div>

          {/* Uploaded List */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-white truncate max-w-xs">{att.name}</span>
                    <span className="text-[10px] text-text-muted">
                      ({(att.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-text-muted hover:text-red-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON & FOOTER */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted transmission & NDAs honored for unreleased films</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/10 text-xs font-semibold text-text-secondary hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-gold/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Brief...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Proposal</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
