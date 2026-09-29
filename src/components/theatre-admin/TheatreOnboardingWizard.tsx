import React, { useState } from "react";
import {
  Building2,
  Server,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  Lock,
  Layers,
  Film,
  Calendar,
  DollarSign,
  Ticket,
  QrCode,
  Check,
  Activity,
  Cpu,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Radio,
  Sliders,
  Maximize2
} from "lucide-react";
import { Theatre } from "../../types";

interface TheatreOnboardingWizardProps {
  theatre?: Theatre;
  onComplete?: (data: any) => void;
  onClose?: () => void;
}

export default function TheatreOnboardingWizard({
  theatre,
  onComplete,
  onClose
}: TheatreOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Theatre Details
  const [theatreDetails, setTheatreDetails] = useState({
    theatreName: theatre?.name || "Prasad Multiplex & IMAX",
    city: theatre?.location || "Hyderabad",
    address: "NTR Gardens, Khairatabad",
    contactPerson: "Amarnath Varma",
    contactEmail: "admin@prasadimax.com",
    contactPhone: "+91 98490 12345",
    gstNumber: "36AABCP1234F1Z8",
    fssaiLicense: "13621014000892"
  });

  // Step 2: POS Integration Config
  const [posConfig, setPosConfig] = useState({
    provider: "Vista Cinema Connect",
    integrationType: "API",
    baseApiUrl: "https://connect.vista.co/api/v1",
    theatreId: "VISTA-THEATRE-001",
    siteId: "HYD-NTR-SITE01",
    apiKey: "ak_live_79a8f2190c1f4e",
    apiSecret: "sec_9941bca8921e49102",
    accessToken: "",
    timeoutMs: 5000,
    seatHoldMinutes: 8
  });

  const [showSecret, setShowSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [connectionLog, setConnectionLog] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  // Step 3: Data Synchronization
  const [syncState, setSyncState] = useState<{
    isRunning: boolean;
    progress: number;
    items: {
      id: string;
      label: string;
      icon: any;
      count: string;
      status: "pending" | "syncing" | "synced" | "error";
      details: string;
    }[];
  }>({
    isRunning: false,
    progress: 0,
    items: [
      { id: "theatre", label: "Theatre Profile & Meta", icon: Building2, count: "1 Venue", status: "pending", details: "GPS, Amenities, Geo-fence" },
      { id: "screens", label: "Screens & Auditoriums", icon: Layers, count: "4 Screens", status: "pending", details: "IMAX Laser, Dolby Atmos 4K, Screen 3, Screen 4" },
      { id: "layouts", label: "Seat Layouts & Matrix IDs", icon: Sliders, count: "640 Seats", status: "pending", details: "Rows A–N, Physical Box-Office Seat IDs" },
      { id: "movies", label: "Movies & Censor Ratings", icon: Film, count: "5 Movies", status: "pending", details: "Dune 2, Kalki 2898 AD, Gladiator II, Devara, Avatar" },
      { id: "showtimes", label: "Operational Showtimes & Sessions", icon: Calendar, count: "18 Shows/Day", status: "pending", details: "Session IDs mapped to POS Scheduler" },
      { id: "pricing", label: "Ticket Types & Dynamic Pricing", icon: DollarSign, count: "4 Tiers", status: "pending", details: "Recliner ₹450, Royal ₹350, Club ₹250, Executive ₹150" },
      { id: "availability", label: "Live Seat Availability Hook", icon: Radio, count: "Real-time", status: "pending", details: "Direct sync with Box-Office terminal occupancy" }
    ]
  });

  // Step 4: Interactive Test Booking Sandbox
  const [testBookingState, setTestBookingState] = useState<{
    step1Lock: "idle" | "running" | "passed" | "failed";
    step2Payment: "idle" | "running" | "passed" | "failed";
    step3Booking: "idle" | "running" | "passed" | "failed";
    step4Cancel: "idle" | "running" | "passed" | "failed";
    lockTimer: number;
    posBookingId: string | null;
    cinevenueBookingId: string | null;
    qrPayload: string | null;
    logs: string[];
  }>({
    step1Lock: "idle",
    step2Payment: "idle",
    step3Booking: "idle",
    step4Cancel: "idle",
    lockTimer: 480, // 8 mins in secs
    posBookingId: null,
    cinevenueBookingId: null,
    qrPayload: null,
    logs: []
  });

  // Step 5: Go-Live Readiness
  const [isLive, setIsLive] = useState(false);

  // --- Step 2: Handshake / Connection Test ---
  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    setConnectionLog("Initiating TLS 1.3 handshake with POS endpoint...");
    setLatencyMs(null);

    setTimeout(() => {
      setConnectionLog("Validating API Key & Site Token against " + posConfig.provider + "...");
    }, 600);

    setTimeout(() => {
      const mockLatency = Math.floor(32 + Math.random() * 25);
      setLatencyMs(mockLatency);
      setConnectionStatus("success");
      setConnectionLog(`✓ Connection Established! Handshake confirmed with ${posConfig.provider} (Latency: ${mockLatency}ms). All gateway protocols responding.`);
    }, 1400);
  };

  // --- Step 3: Run Full Data Sync ---
  const handleStartSync = () => {
    setSyncState(prev => ({ ...prev, isRunning: true, progress: 0 }));

    const updatedItems = [...syncState.items];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < updatedItems.length) {
        updatedItems[currentIndex].status = "synced";
        const newProgress = Math.round(((currentIndex + 1) / updatedItems.length) * 100);
        setSyncState(prev => ({
          ...prev,
          progress: newProgress,
          items: [...updatedItems]
        }));
        currentIndex++;
      } else {
        clearInterval(interval);
        setSyncState(prev => ({ ...prev, isRunning: false, progress: 100 }));
      }
    }, 450);
  };

  // --- Step 4: Run Test Operations ---
  const appendLog = (msg: string) => {
    setTestBookingState(prev => ({
      ...prev,
      logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.logs.slice(0, 15)]
    }));
  };

  const handleTestSeatLock = () => {
    setTestBookingState(prev => ({ ...prev, step1Lock: "running" }));
    appendLog("Requesting temporary hold for Screen 1, Seat A1 from " + posConfig.provider + "...");
    setTimeout(() => {
      setTestBookingState(prev => ({
        ...prev,
        step1Lock: "passed",
        lockTimer: 480
      }));
      appendLog("✓ POS Confirmed Seat Lock: Seat A1 locked for 8 minutes (Token: HLD-8921-A1). Duplicate sales prevented.");
    }, 1000);
  };

  const handleTestPayment = () => {
    if (testBookingState.step1Lock !== "passed") return;
    setTestBookingState(prev => ({ ...prev, step2Payment: "running" }));
    appendLog("Customer initiates payment via Razorpay / UPI Gateway (₹450.00)...");
    setTimeout(() => {
      setTestBookingState(prev => ({ ...prev, step2Payment: "passed" }));
      appendLog("✓ Payment Gateway Success: Capture ID pay_RZP_992147 verified. CineVenue backend ready to commit POS booking.");
    }, 1100);
  };

  const handleTestConfirmBooking = () => {
    if (testBookingState.step2Payment !== "passed") return;
    setTestBookingState(prev => ({ ...prev, step3Booking: "running" }));
    appendLog("Transmitting final booking payload to " + posConfig.provider + " Box Office API...");
    setTimeout(() => {
      const posId = `${posConfig.provider.substring(0, 3).toUpperCase()}-BK-${Math.floor(100000 + Math.random() * 900000)}`;
      const cineId = `CV-HYD-${Date.now().toString().slice(-6)}`;
      const qrData = `CINEVENUE:${cineId}|POS:${posId}|SCREEN:1|SEAT:A1|SHOW:19:30`;
      setTestBookingState(prev => ({
        ...prev,
        step3Booking: "passed",
        posBookingId: posId,
        cinevenueBookingId: cineId,
        qrPayload: qrData
      }));
      appendLog(`✓ POS Transaction Finalized! POS Booking ID: ${posId} | CineVenue ID: ${cineId}. Dynamic QR payload generated.`);
    }, 1200);
  };

  const handleTestCancellation = () => {
    if (testBookingState.step3Booking !== "passed") return;
    setTestBookingState(prev => ({ ...prev, step4Cancel: "running" }));
    appendLog(`Sending cancellation request for ${testBookingState.posBookingId} to POS...`);
    setTimeout(() => {
      setTestBookingState(prev => ({
        ...prev,
        step4Cancel: "passed"
      }));
      appendLog(`✓ Cancellation Succeeded: Seat A1 released back to Box Office inventory. Automated refund trigger sent to Gateway.`);
    }, 1000);
  };

  const handleGoLive = () => {
    setIsLive(true);
    if (onComplete) {
      onComplete({
        theatreDetails,
        posConfig,
        status: "LIVE",
        liveAt: new Date().toISOString()
      });
    }
  };

  const allTestsDone =
    testBookingState.step1Lock === "passed" &&
    testBookingState.step2Payment === "passed" &&
    testBookingState.step3Booking === "passed" &&
    testBookingState.step4Cancel === "passed";

  return (
    <div className="bg-[#0e0e11] text-white rounded-2xl border border-white/10 shadow-2xl overflow-hidden max-w-6xl mx-auto my-4 flex flex-col min-h-[750px]">
      {/* Header Bar */}
      <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-r from-black/60 via-[#18181f] to-black/60 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold shadow-lg shadow-gold/10">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Theatre Onboarding & POS Integration
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 border border-gold/40 text-gold font-semibold uppercase tracking-wider">
                Universal Adapter
              </span>
            </h1>
            <p className="text-xs text-white/50">
              5-Step Operational Pipeline for Real-time Cinema Box Office Synchronization
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            Exit Wizard
          </button>
        )}
      </div>

      {/* 5-Step Stepper Navigation */}
      <div className="bg-black/40 px-6 py-3.5 border-b border-white/10 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          {[
            { num: 1, title: "Theatre Details", icon: Building2 },
            { num: 2, title: "POS Integration", icon: Server },
            { num: 3, title: "Data Sync", icon: RefreshCw },
            { num: 4, title: "Test Booking", icon: Play },
            { num: 5, title: "Go Live", icon: ShieldCheck }
          ].map((s, idx) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num || (s.num === 5 && isLive);
            const IconComp = s.icon;
            return (
              <React.Fragment key={s.num}>
                <button
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-gold/20 border border-gold text-gold font-bold shadow-md shadow-gold/10"
                      : isDone
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? "bg-emerald-500 text-black"
                        : isActive
                        ? "bg-gold text-black"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span className="text-xs">{s.title}</span>
                </button>
                {idx < 4 && <div className="h-[1px] flex-1 bg-white/10 mx-2" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        {/* ================= STEP 1: THEATRE DETAILS ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold" />
                Step 1 — Theatre & Entity Details
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Enter your registered cinema entity, location, and regulatory details to register on CineVenue.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Theatre Name *</label>
                <input
                  type="text"
                  value={theatreDetails.theatreName}
                  onChange={e => setTheatreDetails({ ...theatreDetails, theatreName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="e.g. Prasad Multiplex & IMAX"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">City / Region *</label>
                <input
                  type="text"
                  value={theatreDetails.city}
                  onChange={e => setTheatreDetails({ ...theatreDetails, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Full Physical Address *</label>
                <input
                  type="text"
                  value={theatreDetails.address}
                  onChange={e => setTheatreDetails({ ...theatreDetails, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="e.g. NTR Gardens, Khairatabad, Hyderabad, Telangana 500004"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Contact Person *</label>
                <input
                  type="text"
                  value={theatreDetails.contactPerson}
                  onChange={e => setTheatreDetails({ ...theatreDetails, contactPerson: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="Manager / General Manager Name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Contact Phone *</label>
                <input
                  type="text"
                  value={theatreDetails.contactPhone}
                  onChange={e => setTheatreDetails({ ...theatreDetails, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  placeholder="+91 98490 00000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">GST Registration Number *</label>
                <input
                  type="text"
                  value={theatreDetails.gstNumber}
                  onChange={e => setTheatreDetails({ ...theatreDetails, gstNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold font-mono uppercase"
                  placeholder="36AABCP1234F1Z8"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">FSSAI License / Cinema License</label>
                <input
                  type="text"
                  value={theatreDetails.fssaiLicense}
                  onChange={e => setTheatreDetails({ ...theatreDetails, fssaiLicense: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold font-mono"
                  placeholder="13621014000892"
                />
              </div>
            </div>

            <div className="p-4 bg-gold/10 border border-gold/20 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <div className="text-xs text-gold-light/90">
                <span className="font-semibold text-white">Central Cinema Verification:</span> Once saved, CineVenue automatically generates your unique Theatre Partition ID and reserves cloud integration endpoints for your POS.
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: POS INTEGRATION ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-gold" />
                Step 2 — POS Provider Integration & Handshake
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Select your Box Office Point-of-Sale provider and supply secure API credentials for bidirectional synchronization.
              </p>
            </div>

            {/* Provider Picker Cards */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">POS Provider *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "Vista Cinema Connect", name: "Vista Cinema Connect", badge: "Industry Standard", icon: Server },
                  { id: "Veezi Cloud POS", name: "Veezi Cloud POS", badge: "Internet Ticketing", icon: Radio },
                  { id: "PVR INOX Gateway", name: "PVR INOX Gateway", badge: "Enterprise API", icon: Layers },
                  { id: "Generic REST POS", name: "Generic / In-house POS", badge: "Universal REST", icon: Cpu }
                ].map(item => {
                  const selected = posConfig.provider === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        let newUrl = "https://connect.vista.co/api/v1";
                        if (item.id === "Veezi Cloud POS") newUrl = "https://api.veezi.com/v1";
                        if (item.id === "Generic REST POS") newUrl = "https://api.theatrepos.com/v1";
                        if (item.id === "PVR INOX Gateway") newUrl = "https://api.pvrinox.com/ext/v2";
                        setPosConfig({ ...posConfig, provider: item.id, baseApiUrl: newUrl });
                        setConnectionStatus("idle");
                        setConnectionLog(null);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? "bg-gold/20 border-gold shadow-lg shadow-gold/10"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${selected ? "text-gold" : "text-white/60"}`} />
                        {selected && <CheckCircle2 className="w-4 h-4 text-gold" />}
                      </div>
                      <div className="font-bold text-xs text-white">{item.name}</div>
                      <div className="text-[10px] text-white/50 mt-1">{item.badge}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credential Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Integration Type</label>
                <input
                  type="text"
                  disabled
                  value="REST / JSON API (Bidirectional Webhooks)"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Base API URL *</label>
                <input
                  type="text"
                  value={posConfig.baseApiUrl}
                  onChange={e => setPosConfig({ ...posConfig, baseApiUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-gold focus:outline-none"
                  placeholder="https://connect.vista.co/api/v1"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Theatre ID / Cinema Code *</label>
                <input
                  type="text"
                  value={posConfig.theatreId}
                  onChange={e => setPosConfig({ ...posConfig, theatreId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-gold focus:outline-none"
                  placeholder="VISTA-THEATRE-001"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Site ID / Branch ID *</label>
                <input
                  type="text"
                  value={posConfig.siteId}
                  onChange={e => setPosConfig({ ...posConfig, siteId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-gold focus:outline-none"
                  placeholder="HYD-NTR-SITE01"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">API Key / Client ID *</label>
                <input
                  type="text"
                  value={posConfig.apiKey}
                  onChange={e => setPosConfig({ ...posConfig, apiKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-gold focus:outline-none"
                  placeholder="ak_live_..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center justify-between">
                  <span>API Secret / Access Token *</span>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[10px] text-gold hover:underline flex items-center gap-1"
                  >
                    {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showSecret ? "Hide" : "Show"}
                  </button>
                </label>
                <input
                  type={showSecret ? "text" : "password"}
                  value={posConfig.apiSecret}
                  onChange={e => setPosConfig({ ...posConfig, apiSecret: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-mono focus:border-gold focus:outline-none"
                  placeholder="sec_..."
                />
              </div>
            </div>

            {/* Test Connection Button & Result */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gold" />
                  <span className="text-xs font-semibold text-white">Live Handshake Verification</span>
                  {latencyMs && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                      {latencyMs}ms latency
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={connectionStatus === "testing"}
                  className="px-4 py-2 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-black font-bold text-xs rounded-xl shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {connectionStatus === "testing" ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Testing Handshake...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Test Connection
                    </>
                  )}
                </button>
              </div>

              {connectionLog && (
                <div
                  className={`p-3 rounded-lg text-xs font-mono leading-relaxed border ${
                    connectionStatus === "success"
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                  }`}
                >
                  {connectionLog}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: DATA SYNCHRONIZATION ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-gold" />
                  Step 3 — Synchronize Theatre Master Data from POS
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Pull programming, screen geometries, seat categories, and real-time inventory from {posConfig.provider}.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartSync}
                disabled={syncState.isRunning}
                className="px-4 py-2 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-black font-bold text-xs rounded-xl shadow-lg shadow-gold/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState.isRunning ? "animate-spin" : ""}`} />
                {syncState.isRunning ? "Syncing Masters..." : "Run Full Master Sync"}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-white/70">Sync Engine Status</span>
                <span className="text-gold font-bold">{syncState.progress}% Completed</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold via-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${syncState.progress}%` }}
                />
              </div>
            </div>

            {/* Master Data Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {syncState.items.map(item => {
                const Icon = item.icon;
                const isDone = item.status === "synced";
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                      isDone
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{item.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                            isDone
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {isDone ? `✓ ${item.count}` : "Pending"}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-1 truncate">{item.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= STEP 4: INTERACTIVE TEST BOOKING FLOW ================= */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-gold" />
                Step 4 — End-to-End Test Booking Sandbox
              </h2>
              <p className="text-xs text-white/60 mt-1">
                Simulate the entire customer journey: Seat Hold with POS lock $\rightarrow$ Gateway Payment $\rightarrow$ POS Final Confirmation $\rightarrow$ Automated Cancellation.
              </p>
            </div>

            {/* Test Show Card */}
            <div className="p-4 bg-gradient-to-r from-gold/10 via-black to-gold/5 border border-gold/30 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] text-gold uppercase tracking-wider font-bold">Simulated Sandbox Show</div>
                  <div className="text-sm font-bold text-white">Dune: Part Two (4K IMAX Dolby Atmos)</div>
                  <div className="text-xs text-white/60">Screen 1 • Today 7:00 PM • Seat: <span className="text-gold font-bold">A1 (Recliner)</span> • ₹450.00</div>
                </div>
              </div>

              {testBookingState.step1Lock === "passed" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-mono">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>POS Hold: 07:54 Remaining</span>
                </div>
              )}
            </div>

            {/* Step-by-Step Test Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Step 1: Seat Lock */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-white/50">Phase 1</span>
                    {testBookingState.step1Lock === "passed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">1. POS Seat Hold</div>
                  <p className="text-[10px] text-white/50 mt-1">Locks seat A1 on POS box office to prevent double-booking.</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestSeatLock}
                  disabled={testBookingState.step1Lock === "running"}
                  className="w-full py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  {testBookingState.step1Lock === "passed" ? "✓ Hold Verified" : "Test Seat Lock"}
                </button>
              </div>

              {/* Step 2: Payment */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-white/50">Phase 2</span>
                    {testBookingState.step2Payment === "passed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">2. Gateway Capture</div>
                  <p className="text-[10px] text-white/50 mt-1">Captures customer payment via simulated UPI / Razorpay.</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestPayment}
                  disabled={testBookingState.step1Lock !== "passed" || testBookingState.step2Payment === "running"}
                  className="w-full py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  {testBookingState.step2Payment === "passed" ? "✓ Payment Paid" : "Test Payment"}
                </button>
              </div>

              {/* Step 3: POS Confirm */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-white/50">Phase 3</span>
                    {testBookingState.step3Booking === "passed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">3. POS Booking ID</div>
                  <p className="text-[10px] text-white/50 mt-1">Registers transaction in POS & generates linked QR code.</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestConfirmBooking}
                  disabled={testBookingState.step2Payment !== "passed" || testBookingState.step3Booking === "running"}
                  className="w-full py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  {testBookingState.step3Booking === "passed" ? "✓ POS Confirmed" : "Test Confirm"}
                </button>
              </div>

              {/* Step 4: Cancellation */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-white/50">Phase 4</span>
                    {testBookingState.step4Cancel === "passed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold text-white">4. Cancel & Release</div>
                  <p className="text-[10px] text-white/50 mt-1">Tests automatic seat release and refund trigger back to POS.</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestCancellation}
                  disabled={testBookingState.step3Booking !== "passed" || testBookingState.step4Cancel === "running"}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  {testBookingState.step4Cancel === "passed" ? "✓ Seat Released" : "Test Cancellation"}
                </button>
              </div>
            </div>

            {/* Live Terminal / Audit Logs */}
            <div className="p-4 bg-black/80 border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-gold" />
                  Integration Sandbox Audit Stream
                </span>
                <span>{testBookingState.logs.length} events</span>
              </div>
              <div className="h-28 overflow-y-auto space-y-1 font-mono text-xs text-emerald-400 bg-black/50 p-2.5 rounded-lg border border-white/5">
                {testBookingState.logs.length === 0 ? (
                  <span className="text-white/40 italic">Click "Test Seat Lock" to begin end-to-end sandbox execution...</span>
                ) : (
                  testBookingState.logs.map((log, i) => (
                    <div key={i} className="leading-relaxed">{log}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: GO LIVE READINESS ================= */}
        {currentStep === 5 && (
          <div className="space-y-6 max-w-3xl mx-auto animate-fade-in text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold to-emerald-400 p-0.5 mx-auto shadow-xl shadow-gold/20">
              <div className="w-full h-full bg-[#0e0e11] rounded-2xl flex items-center justify-center text-gold">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-wide">
                Integration Verification Matrix
              </h2>
              <p className="text-xs text-white/60 mt-1 max-w-md mx-auto">
                All 7 mission-critical synchronization protocols must report healthy before routing real customer bookings.
              </p>
            </div>

            {/* Checklist Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto">
              {[
                { label: "Connected (TLS 1.3 & API Handshake)", status: "Verified" },
                { label: "Seat Layout & Matrix Sync", status: "Verified" },
                { label: "Showtime & Session ID Sync", status: "Verified" },
                { label: "Dynamic Pricing & Tax Tiers", status: "Verified" },
                { label: "Real-time Live Seat Availability", status: "Active" },
                { label: "POS Seat Lock (5–10 min Timer)", status: "Active" },
                { label: "Dual ID & QR Code Generation", status: "Active" },
                { label: "POS Cancellation & Automated Refund", status: "Active" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between"
                >
                  <span className="text-xs font-medium text-white/90 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {item.label}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    🟢 {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Big Go-Live Button */}
            {!isLive ? (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleGoLive}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-black font-black text-base rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-3 mx-auto cursor-pointer uppercase tracking-wider transition-all transform hover:scale-105"
                >
                  <Zap className="w-5 h-5 fill-black" />
                  ACTIVATE & GO LIVE ON CINEVENUE
                </button>
                <p className="text-[11px] text-white/40 mt-2">
                  Switches theatre routing from Sandbox to Live Customer Booking traffic.
                </p>
              </div>
            ) : (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl max-w-md mx-auto space-y-2">
                <div className="text-emerald-400 font-bold text-base flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  THEATRE IS LIVE & ACTIVE!
                </div>
                <p className="text-xs text-white/70">
                  {theatreDetails.theatreName} is now accepting live ticket reservations synced with {posConfig.provider}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="px-6 py-4 border-t border-white/10 bg-black/60 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous Step
        </button>

        <div className="text-xs text-white/50">
          Step <span className="text-white font-bold">{currentStep}</span> of 5
        </div>

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
            className="px-5 py-2 bg-gradient-to-r from-gold to-gold-light text-black font-bold text-xs rounded-xl shadow-md shadow-gold/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleGoLive}
            className="px-5 py-2 bg-emerald-500 text-black font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            Finish & Verify
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
