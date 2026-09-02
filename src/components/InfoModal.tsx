import React, { useState, useEffect } from "react";
import { 
  X, BookOpen, Shield, HelpCircle, Phone, Mail, MapPin, Clock, Briefcase, 
  CheckCircle2, FileText, RefreshCw, Cookie, UserCheck, Search, ExternalLink, Printer 
} from "lucide-react";
import CineVenueLogo from "./CineVenueLogo";
import { FooterPagesData, DEFAULT_FOOTER_PAGES_DATA } from "../types";
import { ALL_LEGAL_POLICIES, LegalPolicyDocument } from "../data/legalPolicies";

export type InfoModalType = "about" | "privacy" | "terms" | "refund" | "cookie" | "user-agreement" | "contact" | null;

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: InfoModalType;
  footerPagesData?: FooterPagesData;
}

export default function InfoModal({ 
  isOpen, 
  onClose, 
  type, 
  footerPagesData = DEFAULT_FOOTER_PAGES_DATA 
}: InfoModalProps) {
  const [currentTab, setCurrentTab] = useState<"about" | "privacy" | "terms" | "refund" | "cookie" | "user-agreement" | "contact">("privacy");
  const [modalSearch, setModalSearch] = useState("");

  useEffect(() => {
    if (type) {
      setCurrentTab(type);
      setModalSearch("");
    }
  }, [type]);

  if (!isOpen || !type) return null;

  const data = footerPagesData || DEFAULT_FOOTER_PAGES_DATA;
  const isLegalPolicy = ["privacy", "terms", "refund", "cookie", "user-agreement"].includes(currentTab);
  const activeLegalDoc: LegalPolicyDocument | undefined = isLegalPolicy ? ALL_LEGAL_POLICIES[currentTab] : undefined;

  const filteredSections = activeLegalDoc?.sections.filter(sec => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.content.toLowerCase().includes(q) ||
      sec.bullets?.some(b => b.toLowerCase().includes(q)) ||
      sec.subsections?.some(sub => 
        sub.title.toLowerCase().includes(q) || 
        (sub.content && sub.content.toLowerCase().includes(q)) ||
        (sub.items && sub.items.some(i => i.toLowerCase().includes(q)))
      )
    );
  }) || [];

  const renderContent = () => {
    if (isLegalPolicy && activeLegalDoc) {
      return (
        <div className="space-y-6 text-sm text-text-secondary leading-relaxed font-sans">
          {/* Header Metadata */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <span className="text-[10px] font-mono text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30 font-bold uppercase tracking-wider">
                {activeLegalDoc.badge}
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono text-text-secondary">
                <span>Effective: <strong className="text-white">{activeLegalDoc.effectiveDate}</strong></span>
                <span>•</span>
                <span>Updated: <strong className="text-white">{activeLegalDoc.lastUpdated}</strong></span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-white/90 font-medium leading-relaxed pt-1">
              {activeLegalDoc.summary}
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={`Search in ${activeLegalDoc.title}...`}
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors"
            />
            {modalSearch && (
              <button
                onClick={() => setModalSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Policy Clauses List */}
          <div className="space-y-4">
            {filteredSections.map((sec) => (
              <div
                key={sec.id}
                className="bg-white/[0.02] border border-white/5 hover:border-gold/20 rounded-xl p-4 md:p-5 space-y-3 transition-all"
              >
                <h4 className="text-sm font-bold text-white tracking-wide border-b border-white/5 pb-2">
                  {sec.title}
                </h4>

                {sec.content && (
                  <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                )}

                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {sec.bullets.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-white/80">
                        <span className="text-gold font-bold">✦</span> {b}
                      </li>
                    ))}
                  </ul>
                )}

                {sec.subsections && sec.subsections.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {sec.subsections.map((sub, sIdx) => (
                      <div key={sIdx} className="bg-black/20 border border-white/5 rounded-lg p-3 space-y-2">
                        <h5 className="text-xs font-bold text-gold">{sub.title}</h5>
                        {sub.content && (
                          <p className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line">
                            {sub.content}
                          </p>
                        )}
                        {sub.items && (
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-white/80">
                            {sub.items.map((it, iIdx) => (
                              <li key={iIdx} className="flex items-center gap-1.5">
                                <span className="text-gold">✓</span> {it}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredSections.length === 0 && (
              <div className="text-center py-8 text-xs text-text-secondary">
                No matching clauses found for "{modalSearch}".
              </div>
            )}
          </div>

          {/* Official Privacy & Grievance Contact Card */}
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">Official Grievance & Compliance Desk</span>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs">
                <a href={`mailto:${activeLegalDoc.contact.email}`} className="text-gold font-mono hover:underline">
                  {activeLegalDoc.contact.email}
                </a>
                <span className="text-white/30">•</span>
                <a href={`tel:${activeLegalDoc.contact.phone}`} className="text-white/90 font-mono">
                  {activeLegalDoc.contact.phone}
                </a>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                window.location.href = `/${currentTab === 'user-agreement' ? 'user-agreement' : currentTab === 'refund' ? 'refund-policy' : currentTab === 'cookie' ? 'cookie-policy' : currentTab}`;
              }}
              className="px-3 py-1.5 bg-gold hover:bg-gold-light text-black font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Full Page View</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case "about":
        return (
          <div className="space-y-6 text-sm text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold block mb-1">
                {data.about.subtitle}
              </span>
              <h3 className="text-xl font-bold text-white mb-3">
                {data.about.title}
              </h3>
              <p className="whitespace-pre-line text-white/80 leading-relaxed">
                {data.about.description}
              </p>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gold uppercase tracking-widest">
                What We Offer
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {data.about.whatWeOffer?.map((item, idx) => (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 hover:border-gold/30 transition-all">
                    <h5 className="font-bold text-white text-sm mb-1">{item.title}</h5>
                    <p className="text-xs text-text-secondary">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                <h5 className="text-xs font-bold text-gold uppercase tracking-wider mb-1.5">Our Vision</h5>
                <p className="text-xs text-white/90 italic">{data.about.vision}</p>
              </div>
              <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                <h5 className="text-xs font-bold text-gold uppercase tracking-wider mb-1.5">Our Mission</h5>
                <p className="text-xs text-white/90 italic">{data.about.mission}</p>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6 text-sm text-text-secondary leading-relaxed font-sans">
            <div>
              <span className="text-xs font-mono text-gold uppercase tracking-wider font-bold block mb-1">
                {data.contact.subtitle}
              </span>
              <h3 className="text-xl font-bold text-white mb-2">{data.contact.title}</h3>
              <p className="text-xs text-white/80 leading-relaxed">{data.contact.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Support */}
              <div className="bg-[#0D0D10] border border-gold/30 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <Phone className="w-3.5 h-3.5" /> Customer Support
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase font-bold">Phone</span>
                    <a href={`tel:${data.contact.phone}`} className="text-white font-mono font-bold hover:text-gold transition-colors">
                      {data.contact.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase font-bold">Email</span>
                    <a href={`mailto:${data.contact.email}`} className="text-gold font-mono hover:underline">
                      {data.contact.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block uppercase font-bold">Office Address</span>
                    <span className="text-white/80">{data.contact.office}</span>
                  </div>
                </div>
              </div>

              {/* Business Enquiries */}
              <div className="bg-[#0D0D10] border border-white/10 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
                  <Briefcase className="w-3.5 h-3.5 text-gold" /> Business Enquiries
                </h4>
                <p className="text-[11px] text-text-muted italic">
                  For Theatre Partnerships, Film Production, Event & Celebrity Management, Brand Promotions, Corporate Events & Sponsorships.
                </p>
                <div>
                  <span className="text-[10px] text-text-muted block uppercase font-bold">Business Email</span>
                  <a href={`mailto:${data.contact.businessEmail}`} className="text-gold font-mono font-bold hover:underline">
                    {data.contact.businessEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Support Hours & Response Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                <h5 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <Clock className="w-3.5 h-3.5" /> Support Hours
                </h5>
                <p className="text-xs text-white/80 whitespace-pre-line">{data.contact.supportHours}</p>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                <h5 className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Expected Response Time
                </h5>
                <ul className="text-xs text-white/80 space-y-1 font-mono">
                  {data.contact.responseTimes?.map((res, idx) => (
                    <li key={idx} className="flex items-center gap-1">
                      <span className="text-gold">⚡</span> {res}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getHeaderIcon = () => {
    switch (currentTab) {
      case "about": return <BookOpen className="w-5 h-5 text-gold" />;
      case "privacy": return <Shield className="w-5 h-5 text-gold" />;
      case "terms": return <FileText className="w-5 h-5 text-gold" />;
      case "refund": return <RefreshCw className="w-5 h-5 text-gold" />;
      case "cookie": return <Cookie className="w-5 h-5 text-gold" />;
      case "user-agreement": return <UserCheck className="w-5 h-5 text-gold" />;
      case "contact": return <Phone className="w-5 h-5 text-gold" />;
      default: return null;
    }
  };

  const getHeaderTitle = () => {
    switch (currentTab) {
      case "about": return data.about.title || "About CineVenue";
      case "privacy": return "Privacy Statement";
      case "terms": return "Terms & Conditions";
      case "refund": return "Refund & Cancellation Policy";
      case "cookie": return "Cookie Policy";
      case "user-agreement": return "User Agreement";
      case "contact": return data.contact.title || "Concierge Contact";
      default: return "Information Center";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div 
        className="bg-[#0A0A0E] border border-gold/30 w-full max-w-4xl rounded-2xl relative shadow-2xl overflow-hidden text-left backdrop-blur-md flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white/[0.03] p-4 md:p-6 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {getHeaderIcon()}
            <div>
              <h3 className="font-serif text-lg md:text-2xl font-bold text-white tracking-wide">
                {getHeaderTitle()}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                window.location.href = "/legal";
              }}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-semibold text-text-secondary hover:text-gold hover:border-gold/30 transition-colors"
              title="Open full legal center"
            >
              <span>Legal Center</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#070709] px-4 md:px-6 py-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: "privacy", label: "Privacy Statement", icon: <Shield className="w-3.5 h-3.5" /> },
            { id: "terms", label: "Terms & Conditions", icon: <FileText className="w-3.5 h-3.5" /> },
            { id: "refund", label: "Refund Policy", icon: <RefreshCw className="w-3.5 h-3.5" /> },
            { id: "cookie", label: "Cookie Policy", icon: <Cookie className="w-3.5 h-3.5" /> },
            { id: "user-agreement", label: "User Agreement", icon: <UserCheck className="w-3.5 h-3.5" /> },
            { id: "about", label: "About Us", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: "contact", label: "Contact", icon: <Phone className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isSelected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id as any);
                  setModalSearch("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gold text-black font-bold shadow"
                    : "bg-white/[0.02] text-text-secondary hover:text-white hover:bg-white/[0.06] border border-white/5"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-5 md:p-8 overflow-y-auto custom-scrollbar flex-1">
          {renderContent()}
        </div>

        {/* Info Footer */}
        <div className="bg-white/[0.02] border-t border-white/10 py-3 px-6 flex items-center justify-between text-[10px] font-semibold text-text-secondary uppercase tracking-[0.2em] shrink-0">
          <CineVenueLogo size="sm" />
          <span className="text-gold font-mono font-bold">Official Compliance & Governance Hub</span>
        </div>
      </div>
    </div>
  );
}
