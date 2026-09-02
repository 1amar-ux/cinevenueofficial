import React, { useState } from "react";
import { X, Send, Megaphone, CheckCircle2, ShieldCheck, Building2 } from "lucide-react";
import { BrandCampaignRequest } from "../../types/productions";

interface BrandCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCampaign: (request: BrandCampaignRequest) => void;
}

export default function BrandCampaignModal({
  isOpen,
  onClose,
  onSubmitCampaign
}: BrandCampaignModalProps) {
  if (!isOpen) return null;

  const [brandName, setBrandName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [campaignType, setCampaignType] = useState<BrandCampaignRequest["campaignType"]>("Movie Placement");
  const [targetAudience, setTargetAudience] = useState("");
  const [location, setLocation] = useState("Pan-India / South Multiplexes");
  const [budgetRange, setBudgetRange] = useState("₹25 Lakhs - ₹50 Lakhs");
  const [duration, setDuration] = useState("3 Months");
  const [requirements, setRequirements] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !contactPerson || !email || !phone) {
      alert("Please fill in your company name, contact person, email, and phone.");
      return;
    }

    const newId = "BRAND-" + Math.floor(100 + Math.random() * 900);
    const campaign: BrandCampaignRequest = {
      id: newId,
      brandName,
      contactPerson,
      email,
      phone,
      campaignType,
      targetAudience,
      location,
      budgetRange,
      duration,
      requirements,
      submittedAt: new Date().toLocaleDateString(),
      status: "Received"
    };

    onSubmitCampaign(campaign);
    setSubmittedId(newId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F0F12] border border-amber-500/30 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedId ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-2xl font-serif font-bold text-white">Campaign Request Received!</h2>
            <p className="text-sm text-white/70 max-w-md mx-auto">
              Your proposal for <strong className="text-gold">{brandName}</strong> has been assigned to a CineVenue Brand Studio Strategist.
            </p>
            <div className="bg-black/60 border border-white/10 p-4 rounded-xl inline-block text-xs font-mono">
              Campaign Brief Ref: <span className="text-amber-400 font-bold">{submittedId}</span>
            </div>
            <p className="text-xs text-white/50">Our brand integration desk will share a custom proposal deck within 24 business hours.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gold text-black font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-amber-400"
            >
              Close Window
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase">
                  CineVenue Brand Studio
                </span>
                <span className="text-xs text-white/60 font-mono">Entertainment Marketing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                Start a Brand Campaign with CineVenue
              </h2>
              <p className="text-xs text-white/60">
                Put your brand directly in front of millions of cinemagoers, event attendees, and digital entertainment fans.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Company / Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. OnePlus India"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Your name & designation"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Business Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-bold mb-1">Campaign Service *</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value as any)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  >
                    <option value="Movie Placement">In-Movie Product Placement</option>
                    <option value="Event Sponsorship">Concert / Premieres Sponsorship</option>
                    <option value="Digital Campaign">App / Website Digital Takeover</option>
                    <option value="Celebrity Endorsement">Celebrity Brand Endorsement</option>
                    <option value="Content Production">Custom Brand Film / Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-bold mb-1">Budget Range</label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                  >
                    <option value="Under ₹10 Lakhs">Under ₹10 Lakhs</option>
                    <option value="₹10 Lakhs - ₹25 Lakhs">₹10 Lakhs - ₹25 Lakhs</option>
                    <option value="₹25 Lakhs - ₹50 Lakhs">₹25 Lakhs - ₹50 Lakhs</option>
                    <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                    <option value="₹1 Crore+">₹1 Crore+ (360° Omnichannel Campaign)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 font-bold mb-1">Target Audience & Key Campaign Goals</label>
                <textarea
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe your target demographics, product launch timing, and expectations..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:border-gold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 shadow-lg shadow-gold/10 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Megaphone className="w-4 h-4" />
                <span>Submit Brand Campaign Request</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
