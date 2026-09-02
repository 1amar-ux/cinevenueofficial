import React, { useState, useEffect } from "react";
import { 
  Shield, FileText, RefreshCw, Cookie, UserCheck, Search, ArrowLeft, 
  Printer, CheckCircle, Mail, Phone, MapPin, ExternalLink, ChevronRight, Copy, Check
} from "lucide-react";
import CineVenueLogo from "../components/CineVenueLogo";
import { ALL_LEGAL_POLICIES, LegalPolicyDocument } from "../data/legalPolicies";

interface LegalPoliciesProps {
  initialPolicy?: "privacy" | "terms" | "refund" | "cookie" | "user-agreement";
  onNavigateHome?: () => void;
}

export default function LegalPolicies({ 
  initialPolicy = "privacy",
  onNavigateHome = () => window.location.href = "/"
}: LegalPoliciesProps) {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "refund" | "cookie" | "user-agreement">(initialPolicy);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (initialPolicy && ALL_LEGAL_POLICIES[initialPolicy]) {
      setActiveTab(initialPolicy);
    }
  }, [initialPolicy]);

  const activeDoc: LegalPolicyDocument = ALL_LEGAL_POLICIES[activeTab] || ALL_LEGAL_POLICIES.privacy;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (sectionId: string) => {
    const url = `${window.location.origin}/legal?tab=${activeTab}#${sectionId}`;
    navigator.clipboard.writeText(url);
    setCopiedSectionId(sectionId);
    setTimeout(() => setCopiedSectionId(null), 2000);
  };

  const filteredSections = activeDoc.sections.filter(sec => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = sec.title.toLowerCase().includes(q);
    const matchesContent = sec.content.toLowerCase().includes(q);
    const matchesBullets = sec.bullets?.some(b => b.toLowerCase().includes(q));
    const matchesSub = sec.subsections?.some(sub => 
      sub.title.toLowerCase().includes(q) || 
      (sub.content && sub.content.toLowerCase().includes(q)) ||
      (sub.items && sub.items.some(i => i.toLowerCase().includes(q)))
    );
    return matchesTitle || matchesContent || matchesBullets || matchesSub;
  });

  const tabIcons: Record<string, React.ReactNode> = {
    privacy: <Shield className="w-4 h-4" />,
    terms: <FileText className="w-4 h-4" />,
    refund: <RefreshCw className="w-4 h-4" />,
    cookie: <Cookie className="w-4 h-4" />,
    "user-agreement": <UserCheck className="w-4 h-4" />
  };

  const tabLabels: Record<string, string> = {
    privacy: "Privacy Statement",
    terms: "Terms & Conditions",
    refund: "Refund Policy",
    cookie: "Cookie Policy",
    "user-agreement": "User Agreement"
  };

  return (
    <div className="min-h-screen bg-[#070709] text-text-primary font-sans selection:bg-gold/20 selection:text-gold print:bg-white print:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0D]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-gold transition-colors px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to CineVenue</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-white/10" />
            <CineVenueLogo size="sm" onClick={onNavigateHome} />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-medium transition-all cursor-pointer"
              title="Print official policy document"
            >
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Print Document</span>
            </button>
            <a
              href="mailto:info.cinevenue@gmail.com"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold rounded-lg text-xs font-semibold transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Contact Privacy Officer</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Hero / Header Section */}
        <div className="mb-8 border-b border-white/10 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/30 flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-gold" />
              {activeDoc.badge}
            </span>
            <span className="text-[11px] font-mono text-text-secondary">
              Effective Date: <strong className="text-white">{activeDoc.effectiveDate}</strong>
            </span>
            <span className="text-[11px] text-white/30">•</span>
            <span className="text-[11px] font-mono text-text-secondary">
              Last Updated: <strong className="text-white">{activeDoc.lastUpdated}</strong>
            </span>
          </div>

          <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight mb-2">
            {activeDoc.title}
          </h1>
          <p className="text-sm md:text-base text-text-secondary max-w-3xl leading-relaxed">
            {activeDoc.subtitle}
          </p>
        </div>

        {/* Policy Tab Bar (Scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none border-b border-white/10 print:hidden">
          {(["privacy", "terms", "refund", "cookie", "user-agreement"] as const).map((tabKey) => {
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                onClick={() => {
                  setActiveTab(tabKey);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-gold text-black shadow-lg shadow-gold/20 font-bold"
                    : "bg-white/[0.03] text-text-secondary hover:text-white hover:bg-white/[0.07] border border-white/5"
                }`}
              >
                {tabIcons[tabKey]}
                <span>{tabLabels[tabKey]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sticky Sidebar (Table of Contents & Search) */}
          <aside className="lg:col-span-4 space-y-6 print:hidden">
            {/* Search Input */}
            <div className="bg-[#0D0D11] border border-white/10 rounded-2xl p-4 shadow-xl">
              <label className="text-[10px] font-bold text-gold uppercase tracking-wider block mb-2">
                Search in {tabLabels[activeTab]}
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search keywords, clauses, rights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:border-gold focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-text-muted hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Quick Navigation / Table of Contents */}
            <div className="bg-[#0D0D11] border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Table of Contents</span>
                <span className="text-[10px] font-mono text-gold font-normal">
                  {activeDoc.sections.length} Sections
                </span>
              </h3>

              <div className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {activeDoc.sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-[11px] text-text-secondary hover:text-gold hover:bg-white/[0.02] px-2.5 py-1.5 rounded-lg transition-colors truncate"
                  >
                    {sec.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Official Privacy & Grievance Contact Card */}
            <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Privacy & Grievance Desk
                </h4>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                For questions, data access requests, consent withdrawal, or grievance redressal:
              </p>
              
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                  <a href={`mailto:${activeDoc.contact.email}`} className="text-white hover:text-gold font-mono truncate">
                    {activeDoc.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                  <a href={`tel:${activeDoc.contact.phone.replace(/[^0-9+]/g, '')}`} className="text-white hover:text-gold font-mono">
                    {activeDoc.contact.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2 text-text-secondary">
                  <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                  <span className="text-[11px] text-white/80">{activeDoc.contact.address || "Guntur, Andhra Pradesh, India — 522001"}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Policy Content */}
          <article className="lg:col-span-8 space-y-6">
            {/* Overview / Preamble Callout */}
            <div className="bg-[#0D0D11] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="border-b border-white/10 pb-4">
                <span className="text-[10px] font-mono text-gold font-bold uppercase tracking-widest block mb-1">
                  Official Statement Summary
                </span>
                <p className="text-sm md:text-base text-white/90 leading-relaxed font-medium">
                  {activeDoc.summary}
                </p>
              </div>

              {searchQuery && (
                <div className="bg-gold/10 border border-gold/30 rounded-xl px-4 py-2 text-xs text-gold flex items-center justify-between">
                  <span>Filtered for query: <strong>"{searchQuery}"</strong> ({filteredSections.length} clauses match)</span>
                  <button onClick={() => setSearchQuery("")} className="underline font-bold cursor-pointer">Show All</button>
                </div>
              )}
            </div>

            {/* Sections Listing */}
            <div className="space-y-6">
              {filteredSections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="bg-[#0D0D11] border border-white/10 hover:border-white/20 transition-all rounded-2xl p-6 md:p-8 shadow-lg scroll-mt-24 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
                      {sec.title}
                    </h2>
                    <button
                      onClick={() => handleCopyLink(sec.id)}
                      className="text-text-muted hover:text-gold p-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                      title="Copy link to this section"
                    >
                      {copiedSectionId === sec.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-mono">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline font-mono">Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {sec.content && (
                    <div className="text-xs md:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </div>
                  )}

                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      {sec.bullets.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs text-white/90"
                        >
                          <span className="text-gold font-bold shrink-0">✦</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.subsections && sec.subsections.length > 0 && (
                    <div className="space-y-4 pt-2">
                      {sec.subsections.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-white/[0.02] border border-white/5 rounded-xl p-4 md:p-5 space-y-2.5"
                        >
                          <h3 className="text-xs md:text-sm font-bold text-gold tracking-wide">
                            {sub.title}
                          </h3>

                          {sub.content && (
                            <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                              {sub.content}
                            </p>
                          )}

                          {sub.items && sub.items.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {sub.items.map((item, iIdx) => (
                                <div
                                  key={iIdx}
                                  className="flex items-center gap-2 text-xs text-white/85 bg-white/[0.02] px-2.5 py-1.5 rounded-lg border border-white/5"
                                >
                                  <span className="text-gold text-[10px]">✓</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              {filteredSections.length === 0 && (
                <div className="bg-[#0D0D11] border border-white/10 rounded-2xl p-12 text-center space-y-3">
                  <Search className="w-8 h-8 text-text-muted mx-auto" />
                  <h3 className="text-sm font-bold text-white">No matching policy clauses found</h3>
                  <p className="text-xs text-text-secondary">
                    Try searching with different terms or reset your filter.
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Copyright & Verification Footer */}
            <div className="bg-[#0D0D11] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-3">
                <CineVenueLogo size="sm" />
                <span className="text-[11px]">© 2026 CineVenue. All Rights Reserved.</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold/80">
                Official Compliance Document
              </span>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
