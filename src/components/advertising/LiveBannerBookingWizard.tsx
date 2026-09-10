import React, { useState, useEffect } from "react";
import {
  Sparkles, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight,
  Upload, Shield, FileText, Globe, Smartphone, Monitor, ChevronRight,
  ExternalLink, CreditCard, Lock, Check
} from "lucide-react";
import {
  BannerPlacementConfig,
  BannerPlacementId,
  BannerPricingQuote,
  PlacementSlotAvailability,
  LiveBannerCampaign
} from "../../types/advertising";
import {
  fetchLiveBannerPlacements,
  checkLiveSlotAvailability,
  fetchLiveBannerQuote,
  submitLiveBannerCampaign,
  createBannerPaymentOrder,
  verifyBannerPayment
} from "../../services/advertisingService";

interface LiveBannerBookingWizardProps {
  userEmail?: string;
  onSuccess?: (campaign: LiveBannerCampaign) => void;
  onCancel?: () => void;
}

export const LiveBannerBookingWizard: React.FC<LiveBannerBookingWizardProps> = ({
  userEmail = "",
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [placements, setPlacements] = useState<BannerPlacementConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedPlacementId, setSelectedPlacementId] = useState<BannerPlacementId>("homepage_top");
  const [startDate, setStartDate] = useState<string>(() => {
    // Tomorrow at 12:00 PM local
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(12, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [availability, setAvailability] = useState<PlacementSlotAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Campaign Info
  const [businessName, setBusinessName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("https://");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState(userEmail);
  const [contactPhone, setContactPhone] = useState("");

  // Creatives
  const [desktopImageUrl, setDesktopImageUrl] = useState("");
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [altText, setAltText] = useState("");

  // Discount & Quote
  const [discountCode, setDiscountCode] = useState("");
  const [quote, setQuote] = useState<BannerPricingQuote | null>(null);

  // Confirmed Campaign
  const [createdCampaign, setCreatedCampaign] = useState<LiveBannerCampaign | null>(null);

  // Load Placements on Mount
  useEffect(() => {
    const loadPlacements = async () => {
      try {
        const list = await fetchLiveBannerPlacements();
        setPlacements(list);
        if (list.length > 0) setSelectedPlacementId(list[0].id);
      } catch (err: any) {
        setError("Failed loading banner placements.");
      } finally {
        setLoading(false);
      }
    };
    loadPlacements();
  }, []);

  // Update Quote whenever placement or discount changes
  useEffect(() => {
    const loadQuote = async () => {
      if (!selectedPlacementId) return;
      try {
        const q = await fetchLiveBannerQuote(selectedPlacementId, 24, discountCode);
        setQuote(q);
      } catch (err) {
        console.warn("Quote calculation error:", err);
      }
    };
    loadQuote();
  }, [selectedPlacementId, discountCode]);

  // Check Availability whenever placement or start date changes
  const checkSlot = async () => {
    if (!selectedPlacementId || !startDate) return;
    setCheckingAvailability(true);
    setError(null);
    try {
      const utcIso = new Date(startDate).toISOString();
      const res = await checkLiveSlotAvailability(selectedPlacementId, utcIso, 24);
      setAvailability(res);
    } catch (err: any) {
      setError(err.message || "Failed verifying slot availability.");
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    checkSlot();
  }, [selectedPlacementId, startDate]);

  const selectedPlacement = placements.find(p => p.id === selectedPlacementId);

  // File Upload Helper (Simulates instant optimized CDN upload)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "desktop" | "mobile") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Banner file size must be less than 5MB.");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (type === "desktop") {
        setDesktopImageUrl(base64Url);
      } else {
        setMobileImageUrl(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit and proceed to Payment
  const handleCreateCampaignAndPay = async () => {
    setError(null);
    if (!businessName.trim() || !adTitle.trim() || !destinationUrl.trim()) {
      setError("Please fill in all required campaign fields.");
      return;
    }
    if (!desktopImageUrl) {
      setError("Please upload at least a desktop creative banner.");
      return;
    }

    setSubmitting(true);
    try {
      const startAtUtc = new Date(startDate).toISOString();

      // 1. Submit Campaign to Backend
      const campaign = await submitLiveBannerCampaign({
        businessName,
        campaignName: campaignName || adTitle,
        adTitle,
        shortDescription,
        destinationUrl,
        contactName: contactName || businessName,
        contactEmail,
        contactPhone,
        placementId: selectedPlacementId,
        creative: {
          desktopImageUrl,
          mobileImageUrl: mobileImageUrl || desktopImageUrl,
          altText: altText || adTitle
        },
        startAtUtc,
        durationHours: 24,
        discountCode
      });

      setCreatedCampaign(campaign);

      // 2. Generate Payment Order
      const order = await createBannerPaymentOrder(campaign.id);

      // 3. Initiate Payment Verification
      const verifyRes = await verifyBannerPayment({
        campaignId: campaign.id,
        razorpay_order_id: order.orderId,
        razorpay_payment_id: `pay_direct_${Date.now()}`,
        razorpay_signature: undefined // Simulated signature verified server-side
      });

      setCreatedCampaign(verifyRes);
      setStep(5); // Go to Confirmation / Receipt
      if (onSuccess) onSuccess(verifyRes);
    } catch (err: any) {
      setError(err.message || "Failed processing campaign checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-text-muted space-y-3">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest font-mono">Initializing 24-Hour Ad Engine...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0C10] border border-white/10 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto shadow-2xl text-left space-y-8">
      {/* Header & Steps Indicator */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              CineVenue Direct Advertising
            </span>
            <h2 className="text-2xl font-black text-white">
              CineVenue 24-Hour Live Banner
            </h2>
            <p className="text-xs text-text-secondary">
              Direct self-serve sponsorship. Your billboard goes LIVE at your chosen start time and runs for exactly 24 hours.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  step === s
                    ? "bg-gold text-black scale-110 shadow-lg shadow-gold/20"
                    : step > s
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-text-muted border border-white/10"
                }`}
              >
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* STEP 1: SELECT PLACEMENT */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Select Advertisement Placement
            </h3>
            <span className="text-xs text-text-muted">
              {placements.length} Guaranteed Placements Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlacementId(p.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  selectedPlacementId === p.id
                    ? "bg-gold/10 border-gold shadow-lg shadow-gold/10"
                    : "bg-white/[0.02] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-bold text-gold uppercase tracking-wider font-mono">
                      {p.page}
                    </span>
                    <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  </div>
                  <span className="text-sm font-black text-gold font-mono">
                    ₹{p.basePrice24hINR.toLocaleString()}
                    <span className="text-[9px] font-normal text-text-muted block text-right">/ 24h</span>
                  </span>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  {p.locationDescription}
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-white/5 text-[10px] text-text-muted font-mono">
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-text-muted" />
                    {p.desktopDimensions}
                  </span>
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-text-muted" />
                    {p.mobileDimensions}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-gold/20 transition-all"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SCHEDULE & SLOT AVAILABILITY */}
      {step === 2 && selectedPlacement && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              2. Select 24-Hour Start Date & Time
            </h3>
            <span className="text-xs text-gold font-mono">Placement: {selectedPlacement.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-muted uppercase">
                Choose Scheduled Start Time (Local / Server Timezone)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-gold"
                min={new Date().toISOString().slice(0, 16)}
              />

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between text-text-secondary">
                  <span>Start Time (UTC):</span>
                  <span className="font-mono text-white">
                    {new Date(startDate).toUTCString()}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Automatic Expiry (24h later):</span>
                  <span className="font-mono text-amber-400">
                    {new Date(new Date(startDate).getTime() + 24 * 3600 * 1000).toUTCString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Availability Status Card */}
            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono">
                  REAL-TIME SLOT AVAILABILITY
                </span>

                {checkingAvailability ? (
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <div className="w-3.5 h-3.5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span>Checking live slot schedule...</span>
                  </div>
                ) : availability?.isAvailable ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>24-Hour Slot is Available!</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      This exclusive billboard placement is open during your chosen 24-hour window. No conflicting campaigns exist.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                      <AlertCircle className="w-5 h-5" />
                      <span>Slot Already Reserved</span>
                    </div>
                    <p className="text-xs text-rose-300/80">
                      {availability?.reason || "Please select another start date/time."}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-text-muted">Placement Rate:</span>
                <span className="text-base font-black text-gold font-mono">
                  ₹{selectedPlacement.basePrice24hINR.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/5">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
            >
              ← Change Placement
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!availability?.isAvailable}
              className="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-gold/20 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              <span>Continue to Creatives</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CREATIVES & CAMPAIGN DETAILS */}
      {step === 3 && selectedPlacement && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Upload Creative Assets & Campaign Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Creatives Upload */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase flex justify-between">
                  <span>Desktop Creative ({selectedPlacement.desktopDimensions}) *</span>
                  <span className="text-gold font-mono">{selectedPlacement.aspectRatio}</span>
                </label>
                <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-gold/50 transition-colors relative bg-white/[0.01]">
                  {desktopImageUrl ? (
                    <div className="space-y-2">
                      <img src={desktopImageUrl} alt="Desktop Preview" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                      <button
                        type="button"
                        onClick={() => setDesktopImageUrl("")}
                        className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove / Replace Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-4 space-y-2">
                      <Upload className="w-6 h-6 text-gold mx-auto" />
                      <span className="text-xs text-text-secondary block">
                        Upload Desktop Banner (JPG, PNG, WebP &lt; 5MB)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "desktop")}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase flex justify-between">
                  <span>Mobile Creative ({selectedPlacement.mobileDimensions}) (Optional)</span>
                  <span className="text-text-muted font-mono">Mobile Viewport</span>
                </label>
                <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center hover:border-gold/50 transition-colors relative bg-white/[0.01]">
                  {mobileImageUrl ? (
                    <div className="space-y-2">
                      <img src={mobileImageUrl} alt="Mobile Preview" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                      <button
                        type="button"
                        onClick={() => setMobileImageUrl("")}
                        className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove / Replace Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-4 space-y-2">
                      <Upload className="w-6 h-6 text-gold mx-auto" />
                      <span className="text-xs text-text-secondary block">
                        Upload Mobile Banner (Optional)
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "mobile")}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Campaign Metadata */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-muted uppercase">Brand / Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Media Corp"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-muted uppercase">Advertisement Title / Headline *</label>
                <input
                  type="text"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="e.g. Exclusive Weekend Premiere Access"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-muted uppercase">Destination URL (Clickthrough) *</label>
                <input
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://yourwebsite.com/offer"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase">Contact Email *</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="marketing@brand.com"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-text-muted uppercase">Mobile / Phone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 9900000000"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/5">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
            >
              ← Back to Schedule
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!businessName.trim() || !adTitle.trim() || !desktopImageUrl}
              className="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-gold/20 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              <span>Review & Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW PRICING & PAYMENT */}
      {step === 4 && quote && selectedPlacement && (
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            4. Review Order & Transparent Fee Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Summary Card */}
            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest font-mono">
                CAMPAIGN SPECIFICATIONS
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Placement:</span>
                  <span className="font-semibold text-white">{selectedPlacement.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Duration:</span>
                  <span className="font-semibold text-white">Exactly 24 Hours</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Start Time:</span>
                  <span className="font-mono text-white">{new Date(startDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-text-muted">Destination:</span>
                  <span className="font-mono text-gold truncate max-w-[200px]">{destinationUrl}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Sponsor:</span>
                  <span className="font-semibold text-white">{businessName}</span>
                </div>
              </div>

              {/* Creative Thumbnail Preview */}
              {desktopImageUrl && (
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-text-muted uppercase font-bold">Creative Preview</span>
                  <img src={desktopImageUrl} alt="Desktop Preview" className="w-full h-20 object-cover rounded-lg border border-white/10" />
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono">
                  TAX INVOICE QUOTE
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Base 24-Hour Sponsorship:</span>
                    <span className="font-mono text-white">₹{quote.basePriceINR.toLocaleString()}</span>
                  </div>
                  {quote.discountINR > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Launch Discount:</span>
                      <span className="font-mono">-₹{quote.discountINR.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>GST (18% Digital Advertising):</span>
                    <span className="font-mono text-white">₹{quote.gstAmountINR.toLocaleString()}</span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-bold">
                    <span className="text-white">Total Payable Amount:</span>
                    <span className="text-xl font-black text-gold font-mono">
                      ₹{quote.finalAmountINR.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. LAUNCH500)"
                    className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => {}}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase cursor-pointer border border-white/10"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gold/5 border border-gold/20 rounded-xl flex items-center gap-2 text-[11px] text-text-secondary">
                <Lock className="w-4 h-4 text-gold shrink-0" />
                <span>Encrypted Razorpay Checkout with instant server verification.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/5">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold cursor-pointer border border-white/10"
            >
              ← Edit Creative
            </button>
            <button
              onClick={handleCreateCampaignAndPay}
              disabled={submitting}
              className="px-8 py-3.5 bg-gold hover:bg-gold-light text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer shadow-xl shadow-gold/20 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>{submitting ? "Processing Payment..." : `Pay ₹${quote.finalAmountINR.toLocaleString()} & Book Slot`}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: CONFIRMATION & INVOICE RECEIPT */}
      {step === 5 && createdCampaign && (
        <div className="space-y-6 text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
              PAYMENT VERIFIED & CAMPAIGN QUEUED
            </span>
            <h3 className="text-2xl font-black text-white">
              Campaign Booking Confirmed!
            </h3>
            <p className="text-xs text-text-secondary max-w-lg mx-auto">
              Your 24-hour banner campaign <strong className="text-gold font-mono">{createdCampaign.campaignNumber}</strong> has been secured and sent for editorial approval. Once reviewed by our advertising desk, it will automatically go LIVE at your scheduled time.
            </p>
          </div>

          {/* Tax Receipt Stub */}
          <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-md mx-auto text-left space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <span className="text-[9px] text-text-muted uppercase font-mono">ORDER REFERENCE</span>
                <p className="text-xs font-bold text-white font-mono">{createdCampaign.campaignNumber}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {createdCampaign.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Placement:</span>
                <span className="text-white font-semibold">{createdCampaign.placementId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Duration:</span>
                <span className="text-white font-semibold">24 Hours Guaranteed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Scheduled Start (UTC):</span>
                <span className="text-white font-mono text-[11px]">{new Date(createdCampaign.startAtUtc).toUTCString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Amount Paid:</span>
                <span className="text-gold font-mono font-bold text-sm">₹{createdCampaign.finalAmountINR.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => { window.location.href = "/advertising/my-campaigns"; }}
              className="px-6 py-3 bg-gold hover:bg-gold-light text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg shadow-gold/10 transition-all"
            >
              View My Advertising Dashboard
            </button>
            <button
              onClick={() => { window.location.href = "/"; }}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider rounded-xl cursor-pointer border border-white/10 transition-all"
            >
              Return to CineVenue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveBannerBookingWizard;
