import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Bell,
  MapPin,
  Moon,
  Sun,
  Laptop,
  Globe,
  Shield,
  HelpCircle,
  Info,
  LogOut,
  Check,
  ChevronRight,
  Lock,
  Key,
  Mail,
  Phone,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Ticket,
  Smartphone,
  Eye,
  Copy
} from "lucide-react";
import CineVenueLogo from "../components/CineVenueLogo";
import { useTheme, ThemeMode } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import LocationSelector from "../components/location/LocationSelector";
import { APP_CONFIG, getAppRuntimePlatform } from "../config/appVersion";

interface SettingsPageProps {
  selectedCity?: string;
  setSelectedCity?: (city: string) => void;
  onOpenAuth?: (mode?: "signin" | "signup" | "forgot") => void;
}

interface NotificationPrefs {
  bookingConfirmations: boolean;
  eventReminders: boolean;
  promotions: boolean;
  newReleases: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  bookingConfirmations: true,
  eventReminders: true,
  promotions: false,
  newReleases: true,
  emailAlerts: true,
  smsAlerts: true,
};

export default function SettingsPage({
  selectedCity: propCity,
  setSelectedCity: propSetCity,
  onOpenAuth,
}: SettingsPageProps) {
  const navigate = useNavigate();
  const { themeMode, setThemeMode } = useTheme();
  const { user, isAuthenticated, logout, forgotPassword } = useContext(AuthContext);

  // Active Section / Tab
  const [activeSection, setActiveSection] = useState<
    "account" | "notifications" | "location" | "appearance" | "language" | "privacy" | "support" | "about"
  >("account");

  // City state
  const [currentCity, setCurrentCity] = useState<string>(() => {
    return propCity || localStorage.getItem("cine_selected_city") || "All Cities";
  });
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  // Profile Form state
  const [displayName, setDisplayName] = useState<string>(() => {
    return user?.name || localStorage.getItem("cine_user_name") || "";
  });
  const [mobileNumber, setMobileNumber] = useState<string>(() => {
    return user?.mobile || localStorage.getItem("cine_user_mobile") || "";
  });
  const [dob, setDob] = useState<string>(() => {
    return localStorage.getItem("cine_user_dob") || "";
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Password reset modal state
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState(user?.email || "");
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [resetMessage, setResetMessage] = useState("");

  // Sign out confirmation modal
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Account deletion modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "success">("idle");

  // Notification Preferences state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(() => {
    try {
      const stored = localStorage.getItem("cv_user_notification_preferences");
      if (stored) return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_NOTIFICATION_PREFS;
  });
  const [notifToast, setNotifToast] = useState(false);

  // Copy toast for support details
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (propCity && propCity !== currentCity) {
      setCurrentCity(propCity);
    }
  }, [propCity]);

  useEffect(() => {
    if (user?.name && !displayName) {
      setDisplayName(user.name);
    }
    if (user?.mobile && !mobileNumber) {
      setMobileNumber(user.mobile);
    }
  }, [user]);

  const handleCityChange = (newCity: string) => {
    setCurrentCity(newCity);
    localStorage.setItem("cine_selected_city", newCity);
    localStorage.setItem("cine_user_location", newCity);
    if (propSetCity) {
      propSetCity(newCity);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cine_user_name", displayName);
    localStorage.setItem("cine_user_mobile", mobileNumber);
    if (dob) localStorage.setItem("cine_user_dob", dob);
    setProfileSuccessMsg("Profile information saved successfully.");
    setTimeout(() => setProfileSuccessMsg(""), 3500);
  };

  const handleToggleNotif = (key: keyof NotificationPrefs) => {
    setNotifPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("cv_user_notification_preferences", JSON.stringify(updated));
      return updated;
    });
    setNotifToast(true);
    setTimeout(() => setNotifToast(false), 2500);
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmailInput) return;
    setResetStatus("loading");
    setResetMessage("");
    try {
      await forgotPassword(resetEmailInput);
      setResetStatus("success");
      setResetMessage(`Password reset link sent to ${resetEmailInput}. Check your inbox.`);
    } catch (err: any) {
      setResetStatus("error");
      setResetMessage(err?.response?.data?.message || err?.message || "Failed to dispatch reset link. Please try again.");
    }
  };

  const handleConfirmLogout = async () => {
    setIsSignOutModalOpen(false);
    await logout();
    navigate("/");
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toUpperCase() !== "DELETE") return;
    setDeleteStatus("success");
    setTimeout(async () => {
      setIsDeleteModalOpen(false);
      setDeleteConfirmationText("");
      localStorage.removeItem("cine_user_email");
      localStorage.removeItem("cine_user_name");
      localStorage.removeItem("cine_user_mobile");
      localStorage.removeItem("cine_user_dob");
      localStorage.removeItem("cv_user_notification_preferences");
      await logout();
      navigate("/");
    }, 2000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopyFeedback(`${label} copied!`);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const sections = [
    { id: "account", label: "Account & Profile", icon: User, desc: "Personal info, credentials, login" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Ticket alerts, reminders, promos" },
    { id: "location", label: "Location & City", icon: MapPin, desc: "Preferred cinema city, GPS" },
    { id: "appearance", label: "Appearance", icon: Moon, desc: "Theme modes, display preferences" },
    { id: "language", label: "Language", icon: Globe, desc: "Regional UI & audio preferences" },
    { id: "privacy", label: "Privacy & Security", icon: Shield, desc: "Permissions, policies, data rights" },
    { id: "support", label: "Help & Support", icon: HelpCircle, desc: "Concierge contact, FAQs, policies" },
    { id: "about", label: "About CineVenue", icon: Info, desc: `App v${APP_CONFIG.version}, build, legal` },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F3F4F6] font-sans flex flex-col selection:bg-gold selection:text-black">
      {/* Top Header with Safe Area Inset Support */}
      <header className="sticky top-0 z-30 bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-white/10 pt-[max(env(safe-area-inset-top),0px)] shadow-lg shadow-black/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="p-2 -ml-2 rounded-xl text-white/80 hover:text-gold hover:bg-white/5 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-white/10"
              title="Go back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-cinevenue text-lg sm:text-xl font-bold tracking-wider text-white">
                Settings
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
                Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer hover:opacity-85 transition-opacity"
              title="Return to Home"
            >
              <CineVenueLogo size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* User Identity Hero Banner */}
        <div className="bg-gradient-to-r from-[#121215] to-[#18181C] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40 flex items-center justify-center text-gold font-bold text-xl shadow-inner shrink-0">
              {user?.name ? (
                user.name.substring(0, 2).toUpperCase()
              ) : user?.email ? (
                user.email.substring(0, 2).toUpperCase()
              ) : (
                <User className="w-7 h-7 text-gold" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  {user?.name || displayName || "CineVenue Guest User"}
                </h1>
                {isAuthenticated ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    <Check className="w-3 h-3" />
                    VERIFIED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                    GUEST
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary truncate max-w-md">
                {user?.email || "Sign in to unlock movie rewards, CineCoins, and cloud ticket pass sync."}
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                if (onOpenAuth) onOpenAuth("signin");
                else navigate("/login");
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-gold/20 cursor-pointer border-none shrink-0"
            >
              Sign In / Register
            </button>
          )}
        </div>

        {/* Desktop/Tablet Horizontal Category Pills & Mobile Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {sections.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? "bg-gold text-black border-gold shadow-md shadow-gold/15"
                    : "bg-[#121215] text-text-secondary border-white/5 hover:border-white/20 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-gold"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Section View Container */}
        <div className="bg-[#121215] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl space-y-6">

          {/* 1. ACCOUNT & PROFILE */}
          {activeSection === "account" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-gold" />
                  Account & Profile Information
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Manage your personal details, verified mobile, and security credentials.
                </p>
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-text-secondary mb-1.5">
                      Full Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Amarnath Reddy"
                      className="w-full bg-[#18181C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-text-secondary mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || "Not signed in"}
                        disabled
                        className="w-full bg-[#141418] border border-white/5 rounded-xl px-4 py-2.5 text-sm text-text-muted cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                        Primary
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-text-secondary mb-1.5">
                      Contact Mobile (+91)
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#18181C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                    />
                    <p className="text-[10px] text-text-muted mt-1">Used for instant SMS ticket delivery at the cinema box office.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-text-secondary mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-[#18181C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                    />
                    <p className="text-[10px] text-text-muted mt-1">Qualifies your account for annual CineCoins birthday rewards.</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-gold/20 cursor-pointer border-none"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>

              {/* Password & Security Actions */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Password & Security Credentials
                </h3>
                <div className="bg-[#18181C] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/20">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Password & Authentication</h4>
                      <p className="text-xs text-text-secondary">
                        {isAuthenticated
                          ? "Securely update your password or request a reset link to your email."
                          : "Log in with email or Google to manage security settings."}
                      </p>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmailInput(user?.email || "");
                        setResetStatus("idle");
                        setResetMessage("");
                        setIsResetPasswordModalOpen(true);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gold border border-gold/30 hover:border-gold rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                    >
                      Reset / Change Password
                    </button>
                  )}
                </div>
              </div>

              {/* Sign Out Action */}
              {isAuthenticated && (
                <div className="border-t border-white/10 pt-5">
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                        <LogOut className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Sign Out from Device</h4>
                        <p className="text-xs text-text-secondary">
                          Safely disconnect this device from your CineVenue account session.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsSignOutModalOpen(true)}
                      className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gold" />
                  Notification & Alert Preferences
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Choose how and when CineVenue contacts you about movie tickets and passes.
                </p>
              </div>

              {notifToast && (
                <div className="p-3 bg-gold/15 border border-gold/30 text-amber-200 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span>Notification preferences updated and saved.</span>
                </div>
              )}

              <div className="space-y-3">
                {[
                  {
                    key: "bookingConfirmations",
                    title: "Booking Confirmations & Digital Passes",
                    desc: "Receive instant booking confirmation receipts and barcode/QR access links.",
                  },
                  {
                    key: "eventReminders",
                    title: "Movie & Live Event Reminders",
                    desc: "Timely alerts 2 hours prior to scheduled showtimes to ensure smooth entry.",
                  },
                  {
                    key: "newReleases",
                    title: "Advance Booking & Trailer Drops",
                    desc: "Be the first to know when tickets go live for highly anticipated releases.",
                  },
                  {
                    key: "promotions",
                    title: "Exclusive Offers & Brand Discounts",
                    desc: "Special concession vouchers, premiere invites, and partner bank offers.",
                  },
                  {
                    key: "smsAlerts",
                    title: "SMS & Box Office Mobile Dispatch",
                    desc: "Offline-first SMS pass backup sent directly to your registered mobile number.",
                  },
                  {
                    key: "emailAlerts",
                    title: "PDF Ticket Email Dispatches",
                    desc: "Automated high-definition printable PDF ticket copies sent to your email.",
                  },
                ].map(({ key, title, desc }) => {
                  const isEnabled = notifPrefs[key as keyof NotificationPrefs];
                  return (
                    <div
                      key={key}
                      onClick={() => handleToggleNotif(key as keyof NotificationPrefs)}
                      className="bg-[#18181C] border border-white/5 hover:border-white/15 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-white">{title}</h4>
                        <p className="text-xs text-text-secondary">{desc}</p>
                      </div>

                      <div
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                          isEnabled ? "bg-gold" : "bg-white/10"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-black transition-transform ${
                            isEnabled ? "translate-x-6" : "translate-x-0 bg-white/40"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. LOCATION & CITY */}
          {activeSection === "location" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gold" />
                  Location & Preferred City
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Customize the default city used for theatre discovery, showtimes, and event passes.
                </p>
              </div>

              <div className="bg-[#18181C] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-muted">
                      Currently Active City
                    </span>
                    <h3 className="text-xl font-black text-white flex items-center gap-2 mt-1">
                      <span>📍</span>
                      <span>{currentCity}</span>
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      Theatres and showtimes on the home and booking tabs are customized for this location.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLocationSelectorOpen(true)}
                    className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-gold/20 cursor-pointer border-none shrink-0"
                  >
                    Change City
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    Device GPS Location Detection
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    CineVenue only queries GPS when you tap "Detect My Location" in the city selector. Your coordinates are never tracked in the background.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    Manual City Override
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    If location permissions are denied, you can select any of our verified cities across Andhra Pradesh, Telangana, Karnataka, and Tamil Nadu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. APPEARANCE */}
          {activeSection === "appearance" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Moon className="w-5 h-5 text-gold" />
                  Appearance & Theme
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Tailor your CineVenue visual experience. Preferences apply instantly and persist across sessions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    mode: "dark" as ThemeMode,
                    title: "Dark Obsidian",
                    desc: "CineVenue signature deep black and warm gold aesthetics.",
                    icon: Moon,
                  },
                  {
                    mode: "light" as ThemeMode,
                    title: "Light Daylight",
                    desc: "Clean, high-contrast light theme for bright outdoor reading.",
                    icon: Sun,
                  },
                  {
                    mode: "system" as ThemeMode,
                    title: "System Default",
                    desc: "Automatically adapts based on your mobile or operating system theme.",
                    icon: Laptop,
                  },
                ].map(({ mode, title, desc, icon: Icon }) => {
                  const isSelected = themeMode === mode;
                  return (
                    <div
                      key={mode}
                      onClick={() => setThemeMode(mode)}
                      className={`rounded-2xl p-5 border transition-all cursor-pointer relative flex flex-col justify-between gap-4 ${
                        isSelected
                          ? "bg-gold/10 border-gold shadow-lg shadow-gold/15"
                          : "bg-[#18181C] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl border ${
                          isSelected ? "bg-gold text-black border-gold" : "bg-white/5 text-white border-white/10"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="p-1 rounded-full bg-gold text-black">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">{title}</h3>
                        <p className="text-xs text-text-secondary mt-1">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. LANGUAGE */}
          {activeSection === "language" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gold" />
                  Language & Regional Settings
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Active application language and regional cinema audio tracks.
                </p>
              </div>

              <div className="bg-[#18181C] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">English (India)</h3>
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">
                        Active Default
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      The core CineVenue application UI, ticketing workflow, and payment gateway are formatted in English (India).
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-gold text-black shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Movie & Event Audio Track Selection
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Regional language preferences (Telugu, Hindi, Tamil, Kannada, Malayalam, English) are chosen per screening during movie seat booking. Subtitle availability is indicated on the showtime badges.
                </p>
              </div>
            </div>
          )}

          {/* 6. PRIVACY & SECURITY */}
          {activeSection === "privacy" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gold" />
                  Privacy, Security & Data Protection
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Compliant with the Digital Personal Data Protection (DPDP) Act of India.
                </p>
              </div>

              {/* Legal Documentation Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "Privacy Policy", path: "/privacy", desc: "Data collection, storage & encryption" },
                  { title: "Terms & Conditions", path: "/terms", desc: "User rights, booking conditions" },
                  { title: "Refund & Cancellation Policy", path: "/refund-policy", desc: "Ticket refund eligibility" },
                  { title: "User Agreement", path: "/user-agreement", desc: "Acceptable use and platform guidelines" },
                ].map(({ title, path, desc }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => navigate(path)}
                    className="p-4 rounded-xl bg-[#18181C] border border-white/5 hover:border-gold/30 flex items-center justify-between text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-gold transition-colors">{title}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-gold transition-colors shrink-0" />
                  </button>
                ))}
              </div>

              {/* Device Permissions Overview */}
              <div className="p-5 rounded-xl bg-[#18181C] border border-white/5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gold" />
                  Native Device Permissions
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
                    <div>
                      <span className="font-bold text-white">Camera Access</span>
                      <p className="text-text-muted text-[11px]">Used for scanning digital ticket QR passes at organizers' checkpoints.</p>
                    </div>
                    <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">On Demand</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5">
                    <div>
                      <span className="font-bold text-white">Location Services</span>
                      <p className="text-text-muted text-[11px]">Used strictly to identify nearby cinema theatres upon user prompt.</p>
                    </div>
                    <span className="text-[10px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">On Demand</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <span className="font-bold text-white">Local Storage & Documents</span>
                      <p className="text-text-muted text-[11px]">Stores non-sensitive device themes and offline PDF receipts safely.</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Active</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="border border-red-500/20 rounded-xl p-5 bg-red-500/5 space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Account Data Management</h3>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  If you wish to remove your saved preferences and sign out from all device sessions, you can proceed below. Under the DPDP Act 2023, you can also request full database erasure by emailing our data protection officer at <span className="text-gold font-mono">support@cinevenue.com</span>.
                </p>
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmationText("");
                      setDeleteStatus("idle");
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Delete Account Data
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 7. HELP & SUPPORT */}
          {activeSection === "support" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gold" />
                  Customer Help & Concierge Support
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Connect with the verified CineVenue support team for ticketing, refund, or partner inquiries.
                </p>
              </div>

              {copyFeedback && (
                <div className="p-3 bg-gold/15 border border-gold/30 text-amber-200 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-gold shrink-0" />
                  <span>{copyFeedback}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Support */}
                <div className="bg-[#18181C] border border-white/5 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/20">
                      <Mail className="w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(APP_CONFIG.supportEmail, "Support email")}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer border-none"
                      title="Copy email address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-muted">
                      Support Email Dispatch
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{APP_CONFIG.supportEmail}</h3>
                    <p className="text-xs text-text-secondary mt-1">Response time: Within 2 to 4 business hours.</p>
                  </div>
                  <a
                    href={`mailto:${APP_CONFIG.supportEmail}?subject=CineVenue%20Customer%20Support`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-light"
                  >
                    <span>Compose Email</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Telephone Support */}
                <div className="bg-[#18181C] border border-white/5 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/20">
                      <Phone className="w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(APP_CONFIG.supportPhone, "Concierge phone")}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors cursor-pointer border-none"
                      title="Copy phone number"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-muted">
                      Direct Concierge Line
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{APP_CONFIG.supportPhone}</h3>
                    <p className="text-xs text-text-secondary mt-1">Available 09:00 AM – 11:00 PM IST daily.</p>
                  </div>
                  <a
                    href={`tel:${APP_CONFIG.supportPhone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-light"
                  >
                    <span>Place Call</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Head Office Address */}
              <div className="bg-[#18181C] border border-white/5 rounded-xl p-5 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Registered Corporate Office</h4>
                  <p className="text-xs text-text-secondary font-mono">{APP_CONFIG.companyName}</p>
                  <p className="text-xs text-text-secondary">{APP_CONFIG.headquarters}</p>
                </div>
              </div>
            </div>
          )}

          {/* 8. ABOUT CINEVENUE */}
          {activeSection === "about" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-gold" />
                  About CineVenue
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  Application specifications, release builds, and corporate identity.
                </p>
              </div>

              <div className="bg-[#18181C] border border-white/10 rounded-2xl p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <CineVenueLogo size="lg" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {APP_CONFIG.appName}
                  </h3>
                  <p className="text-xs text-text-secondary font-mono">
                    {APP_CONFIG.companyName}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-text-muted font-bold uppercase block">App Version</span>
                    <span className="text-white font-mono font-bold">{APP_CONFIG.version}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-text-muted font-bold uppercase block">Build Code</span>
                    <span className="text-gold font-mono font-bold">{APP_CONFIG.buildNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-text-muted font-bold uppercase block">Runtime</span>
                    <span className="text-white font-mono font-bold">{getAppRuntimePlatform()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-text-muted font-bold uppercase block">Security</span>
                    <span className="text-emerald-400 font-mono font-bold">256-bit SSL</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#18181C] border border-white/5 text-xs">
                <span className="text-text-secondary">Application Package Identifier</span>
                <span className="font-mono text-gold font-bold">{APP_CONFIG.packageId}</span>
              </div>

              <div className="text-center text-xs text-text-muted pt-2 space-y-1">
                <p>© 2026 {APP_CONFIG.companyName}. All rights reserved.</p>
                <p className="text-[10px] uppercase font-mono tracking-widest text-gold/70">Engineered with Luxury & Precision</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* LOCATION SELECTOR MODAL REUSE */}
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        selectedCity={currentCity}
        setSelectedCity={handleCityChange}
      />

      {/* PASSWORD RESET MODAL */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121215] border border-gold/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-gold" />
                Reset Security Credentials
              </h3>
              <p className="text-xs text-text-secondary">
                We will dispatch a secure, encrypted one-time password reset link to your verified email.
              </p>
            </div>

            {resetStatus === "success" && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium">
                {resetMessage}
              </div>
            )}

            {resetStatus === "error" && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-xl font-medium">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleSendPasswordReset} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-text-secondary mb-1">
                  Recipient Account Email
                </label>
                <input
                  type="email"
                  required
                  value={resetEmailInput}
                  onChange={(e) => setResetEmailInput(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#18181C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetStatus === "loading"}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider cursor-pointer border-none shadow-md shadow-gold/20"
                >
                  {resetStatus === "loading" ? "Dispatching..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIGN OUT CONFIRMATION MODAL */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121215] border border-white/20 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Confirm Sign Out</h3>
              <p className="text-xs text-text-secondary">
                Are you sure you want to end your current CineVenue session on this device?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSignOutModalOpen(false)}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider cursor-pointer border-none shadow-md shadow-red-500/20"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#121215] border border-red-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Account Data</h3>
                <p className="text-xs text-red-300">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              This action will reset your device preferences, cached profile credentials, and sign you out permanently. To confirm, please type <span className="text-white font-mono font-bold bg-red-500/20 px-1.5 py-0.5 rounded">DELETE</span> below:
            </p>

            {deleteStatus === "success" && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium">
                Account data cleared successfully. Redirecting to home...
              </div>
            )}

            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder='Type "DELETE" to confirm'
              className="w-full bg-[#18181C] border border-red-500/30 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmationText.trim().toUpperCase() !== "DELETE" || deleteStatus === "success"}
                onClick={handleConfirmDeleteAccount}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider cursor-pointer border-none shadow-md shadow-red-500/20"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
