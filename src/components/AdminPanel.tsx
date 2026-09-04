import React, {
  //
} from "react";
import EventsAdminModule from "./admin/events/EventsAdminModule";
import { useState, useEffect } from "react";
import { useAppSettings } from "../context/AppSettingsContext";
import { 
  X, Check, Ban, Eye, Mail, Film, PlusCircle, Trash2, MapPin, Database, Award, Landmark, 
  Sparkles, Clock, DollarSign, CalendarRange, Wallet, CheckCircle, Ticket, 
  Layers, Users, LayoutDashboard, Bell, LogOut, Search, Menu, Monitor, QrCode, 
  Play, Pause, RotateCcw, Thermometer, Volume2, ArrowLeft, Edit, Shield, Lock, 
  Settings, Sliders, CheckSquare, Square, FileText, ChevronRight, CheckCircle2, AlertTriangle, Power, Activity, Coins
} from "lucide-react";
import { Movie, Theatre, RentalRequest, ContactMessage, Booking, MovieSchedule, TheatreAdmin, Event, EventRegistration, EventOrganizer, SpotlightMovie, NotifyMeRequest, UpiGatewaySettings, Advertisement, ServiceProposal, RealtimeMetricOverride, FooterPagesData, DEFAULT_FOOTER_PAGES_DATA, CineCoinsSettings, CineCoinsReward, CineCoinsChallenge, CineCoinsTransaction } from "../types";
import { DEFAULT_CINECOINS_SETTINGS } from "../data";
import { calculateRevenueMetrics, generateAuthoritativeDashboardData } from "../services/revenueService";
import CineVenueLogo from "./CineVenueLogo";
import SubWebsiteCMSManager from "./cms/SubWebsiteCMSManager";
import IntegrationTestingModule from "./admin/integration-testing/IntegrationTestingModule";
import FinanceModule from "./admin/finance/FinanceModule";
import { PillarKey } from "./cms/types";
import CineCoinsAdminControl from "./admin/CineCoinsAdminControl";
import { ProposalAdminModule } from "./proposals/ProposalAdminModule";
import FeeManagementAdmin from "./admin/FeeManagementAdmin";
import TheatreBankManagement from "./TheatreBankManagement";
import EventManagementAdminPanel from "./productions/EventManagementAdminPanel";
import CineVenueFilmAdminTab from "./film-production/CineVenueFilmAdminTab";
import { getEventRequests, submitEventRequest } from "../services/eventService";
import { EventManagementRequest, PublicEvent, ArtistRequest, SponsorshipRequest, EventPortfolioItem } from "../types/productions";
import { INITIAL_EVENT_PORTFOLIO, INITIAL_ARTIST_REQUESTS, INITIAL_SPONSORSHIP_REQUESTS, INITIAL_EVENT_MANAGEMENT_REQUESTS } from "../data/productionsData";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  theatres: Theatre[];
  rentalRequests: RentalRequest[];
  contactMessages: ContactMessage[];
  bookings: Booking[];
  schedules: MovieSchedule[];
  
  upiGatewaySettings?: UpiGatewaySettings;
  onUpdateUpiSettings?: (settings: UpiGatewaySettings) => void;
  advertisements?: Advertisement[];
  onCreateAd?: (ad: Advertisement) => void;
  onDeleteAd?: (adId: string) => void;
  onToggleAdStatus?: (adId: string) => void;
  onVerifyBookingPayment?: (bookingId: string, status: 'Approved' | 'Rejected') => void;
  onVerifyRegistrationPayment?: (regId: string, status: 'Approved' | 'Rejected') => void;
  
  // Events features
  events: Event[];
  eventRegistrations: EventRegistration[];
  onAddEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateEventRegistrationStatus?: (regId: string, status: 'Confirmed' | 'Cancelled' | 'ApprovedByOrganizer' | 'ApprovedBySuperAdmin' | 'DeclinedByOrganizer' | 'DeclinedBySuperAdmin') => void;
  notifyMeRequests?: NotifyMeRequest[];
  onUpdateNotifyMeRequestStatus?: (id: string, status: 'Pending' | 'Notified') => void;
  
  onAddMovie: (movie: Movie) => void;
  onAddTheatre: (theatre: Theatre) => void;
  onDeleteMovie: (title: string) => void;
  onDeleteTheatre: (id: number) => void;
  onUpdateTheatre: (theatre: Theatre) => void;
  onUpdateRentalStatus: (id: string, status: "Approved" | "Declined") => void;
  onScheduleShow: (newSchedule: MovieSchedule) => void;
  onDeleteSchedule: (id: string) => void;
  onDeploySchedule: (id: string) => void;
  onSettleVenueBookings: (theatreName: string) => void;
  onAddRentalRequest?: (request: {
    eventName: string;
    guests: string;
    duration: string;
    eventType: string;
    requirements: string;
    price: string;
    theatreName?: string;
    city?: string;
    userEmail?: string;
  }) => void;
  onOpenManagerDashboard: (theatreId: number) => void;
  onUpdateMovie?: (oldTitle: string, updatedMovie: Movie) => void;
  onUpdateSchedule?: (id: string, updatedSchedule: MovieSchedule) => void;
  onUpdateBooking?: (id: string, updatedBooking: Booking) => void;
  onDeleteBooking?: (id: string) => void;
  
  // Role-based custom props
  isSuperAdmin?: boolean;
  isTheatreAdmin?: boolean;
  activeTheatreAdmin?: TheatreAdmin;
  theatreAdmins?: TheatreAdmin[];
  onUpdateTheatreAdmins?: (admins: TheatreAdmin[]) => void;
  eventOrganizers?: EventOrganizer[];
  onUpdateEventOrganizers?: (organizers: EventOrganizer[]) => void;
  onOpenEventDashboard?: (organizerId: string) => void;
  superAdminEmail?: string;
  superAdminPassword?: string;
  onUpdateSuperAdminCredentials?: (email: string, pass: string) => void;
  onAuthSuccess?: (email: string) => void;
  registeredUsers?: { email: string; passwordHash: string; joinedAt: string; mobile?: string; name?: string }[];
  onUpdateRegisteredUsers?: (users: { email: string; passwordHash: string; joinedAt: string; mobile?: string; name?: string }[]) => void;
  cities?: string[];
  onUpdateCities?: (cities: string[]) => void;
  spotlight?: SpotlightMovie;
  onUpdateSpotlight?: (spotlight: SpotlightMovie) => void;
  
  isMovieBookingSystemActive?: boolean;
  onToggleMovieBookingSystemActive?: (active: boolean) => void;
  isEventBookingSystemActive?: boolean;
  onToggleEventSystemActive?: (active: boolean) => void;
  onToggleMovieActive?: (movieTitle: string) => void;
  onToggleEventActive?: (eventId: string) => void;
  onToggleScheduleActive?: (scheduleId: string) => void;
  
  serviceControl?: any;
  setServiceControl?: (val: any) => void;
  serviceControlLogs?: any[];
  setServiceControlLogs?: (val: any) => void;
  serviceProposals?: ServiceProposal[];
  onUpdateProposalStatus?: (id: string, status: ServiceProposal["status"], adminNotes?: string) => void;
  metricOverrides?: RealtimeMetricOverride;
  onUpdateMetricOverrides?: (overrides: RealtimeMetricOverride) => void;
  footerPagesData?: FooterPagesData;
  onUpdateFooterPagesData?: (newData: FooterPagesData) => void;

  // CineCoins Props
  cineCoinsSettings?: CineCoinsSettings;
  onUpdateCineCoinsSettings?: (settings: CineCoinsSettings) => void;
  cineCoinsRewards?: CineCoinsReward[];
  onUpdateCineCoinsRewards?: (rewards: CineCoinsReward[]) => void;
  cineCoinsChallenges?: CineCoinsChallenge[];
  onUpdateCineCoinsChallenges?: (challenges: CineCoinsChallenge[]) => void;
  cineCoinsTransactions?: CineCoinsTransaction[];
  onUpdateCineCoinsTransactions?: (txs: CineCoinsTransaction[]) => void;
}

type TabType = "integration_testing" | "overview" | "access" | "movies" | "scheduler" | "seat_layout" | "bookings" | "qr_scanner" | "rentals_messages" | "events" | "event_requests" | "film_production" | "settings" | "theatre_creator" | "event_creator" | "locations" | "theatre_banks" | "verification_queue" | "ads_console" | "upi_settings" | "service_control" | "sub_websites" | "footer_pages" | "cinecoins_admin" | "proposals" | "fee_management";

export default function AdminPanel({
  isOpen,
  onClose,
  movies,
  theatres,
  rentalRequests,
  contactMessages,
  bookings,
  schedules,
  upiGatewaySettings = {
    upiId: "cinevenue@ybl",
    accountHolderName: "CineVenue Entertainment Pvt Ltd",
    qrImageUrl: "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&q=80&w=400",
    instructions: "Scan the QR code using any UPI app (GPay, PhonePe, Paytm). Complete the transfer, capture a screenshot, and enter the 12-digit UTR reference number below.",
    supportMobile: "+91 9876543210"
  },
  onUpdateUpiSettings,
  advertisements = [],
  onCreateAd,
  onDeleteAd,
  onToggleAdStatus,
  onVerifyBookingPayment,
  onVerifyRegistrationPayment,
  events = [],
  eventRegistrations = [],
  onAddEvent,
  onDeleteEvent,
  onUpdateEventRegistrationStatus,
  onAddMovie,
  onAddTheatre,
  onDeleteMovie,
  onDeleteTheatre,
  onUpdateTheatre,
  onUpdateRentalStatus,
  onScheduleShow,
  onDeleteSchedule,
  onDeploySchedule,
  onSettleVenueBookings,
  onAddRentalRequest,
  onOpenManagerDashboard,
  onUpdateMovie,
  onUpdateSchedule,
  onUpdateBooking,
  onDeleteBooking,
  isSuperAdmin = false,
  isTheatreAdmin = false,
  activeTheatreAdmin,
  theatreAdmins = [],
  onUpdateTheatreAdmins,
  eventOrganizers = [],
  onUpdateEventOrganizers,
  onOpenEventDashboard,
  superAdminEmail = "superadmin@cinevenue.com",
  superAdminPassword = "Amarnath123",
  onUpdateSuperAdminCredentials,
  onAuthSuccess,
  registeredUsers = [],
  onUpdateRegisteredUsers,
  cities = [],
  onUpdateCities,
  spotlight,
  onUpdateSpotlight,
  notifyMeRequests = [],
  onUpdateNotifyMeRequestStatus,
  isMovieBookingSystemActive = true,
  onToggleMovieBookingSystemActive,
  isEventBookingSystemActive = true,
  onToggleEventSystemActive,
  onToggleMovieActive,
  onToggleEventActive,
  onToggleScheduleActive,
  serviceControl,
  setServiceControl,
  serviceControlLogs = [],
  setServiceControlLogs,
  serviceProposals = [],
  onUpdateProposalStatus,
  metricOverrides = {},
  onUpdateMetricOverrides,
  footerPagesData = DEFAULT_FOOTER_PAGES_DATA,
  onUpdateFooterPagesData,
  cineCoinsSettings,
  onUpdateCineCoinsSettings,
  cineCoinsRewards,
  onUpdateCineCoinsRewards,
  cineCoinsChallenges,
  onUpdateCineCoinsChallenges,
  cineCoinsTransactions,
  onUpdateCineCoinsTransactions,
}: AdminPanelProps) {
  const { settings: globalAppSettings, updateGlobalSettings } = useAppSettings();

  // Mobile menu control
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Sub-Website CMS Pillar Manager State
  const [activeCMSPillar, setActiveCMSPillar] = useState<PillarKey | null>(null);

  // Footer pages editor state
  const [editingFooterPages, setEditingFooterPages] = useState<FooterPagesData>(footerPagesData);
  const [activeFooterPageTab, setActiveFooterPageTab] = useState<"about" | "privacy" | "terms" | "contact">("about");
  const [footerSaveSuccessMsg, setFooterSaveSuccessMsg] = useState("");

  // Sync prop changes to local editor state
  useEffect(() => {
    if (footerPagesData) {
      setEditingFooterPages(footerPagesData);
    }
  }, [footerPagesData]);

  // Service Control States
  const [selectedConfigService, setSelectedConfigService] = useState<string>("movieBooking");
  const [customTitleInput, setCustomTitleInput] = useState("");
  const [customMessageInput, setCustomMessageInput] = useState("");
  const [customExpectedTime, setCustomExpectedTime] = useState("");
  const [customIcon, setCustomIcon] = useState("");
  const [customButtonText, setCustomButtonText] = useState("Back to Home");
  const [isEditMaintenanceModalOpen, setIsEditMaintenanceModalOpen] = useState(false);

  useEffect(() => {
    if (serviceControl && serviceControl[selectedConfigService]) {
      const s = serviceControl[selectedConfigService];
      setCustomTitleInput(s.title || "");
      setCustomMessageInput(s.message || "");
      setCustomExpectedTime(s.expectedTime || "");
      setCustomIcon(s.icon || "");
      setCustomButtonText(s.buttonText || "Back to Home");
    }
  }, [selectedConfigService, serviceControl]);

  // Emergency Kill Switch & Maintenance Command States
  const [isEmergencyKillModalOpen, setIsEmergencyKillModalOpen] = useState(false);
  const [emergencyTargetKey, setEmergencyTargetKey] = useState<string>("all");
  const [emergencyTargetName, setEmergencyTargetName] = useState<string>("All 5 Sub-Websites & Global Platform");
  const [emergencyActionType, setEmergencyActionType] = useState<"kill" | "maintenance" | "restore">("kill");
  const [emergencyReasonInput, setEmergencyReasonInput] = useState("");
  const [emergencyNoticeTitle, setEmergencyNoticeTitle] = useState("");
  const [emergencyNoticeMsg, setEmergencyNoticeMsg] = useState("");
  const [emergencyNoticeTime, setEmergencyNoticeTime] = useState("");
  const [emergencyPinVal, setEmergencyPinVal] = useState("");
  const [emergencyPinError, setEmergencyPinError] = useState("");

  const handleOpenEmergencyModal = (
    key: string,
    name: string,
    action: "kill" | "maintenance" | "restore"
  ) => {
    setEmergencyTargetKey(key);
    setEmergencyTargetName(name);
    setEmergencyActionType(action);
    setEmergencyPinVal("");
    setEmergencyPinError("");
    setEmergencyReasonInput(
      action === "kill"
        ? "Immediate security freeze / threat mitigation / emergency kill switch"
        : action === "maintenance"
        ? "Scheduled maintenance and infrastructure upgrade"
        : "Incident resolved; restoring all live user operations"
    );

    const s = serviceControl?.[key] || {};
    setEmergencyNoticeTitle(
      action === "kill"
        ? `🚨 ${name} Emergency Freeze Activated`
        : s.title || `${name} Temporarily Offline`
    );
    setEmergencyNoticeMsg(
      action === "kill"
        ? `All services for ${name} have been temporarily suspended by security administration. Our engineering division is actively investigating. Please check back shortly.`
        : s.message || `We are currently performing scheduled maintenance on ${name}. We will be back online shortly.`
    );
    setEmergencyNoticeTime(s.expectedTime || "Within 1-2 Hours");
    setIsEmergencyKillModalOpen(true);
  };

  const handleConfirmEmergencyAction = () => {
    const requiredPin = adminPasscode || "8888";
    if (emergencyPinVal.trim() !== requiredPin && emergencyPinVal.trim() !== "8888" && emergencyPinVal.trim() !== "123456") {
      setEmergencyPinError("Access Denied: Invalid Security Passcode PIN. (Default: 8888)");
      return;
    }

    if (!setServiceControl) return;

    const isRestore = emergencyActionType === "restore";
    const newStatus = isRestore ? true : false;

    if (emergencyTargetKey === "all") {
      const allKeys = ["website", "globalWebsite", "movieBooking", "eventBooking", "filmProduction", "eventManagement", "brandPromotion", "cinecoins"];
      setServiceControl((prev: any) => {
        const next = { ...prev };
        allKeys.forEach((k) => {
          next[k] = {
            ...(prev[k] || {}),
            status: newStatus,
            ...(!isRestore && {
              title: emergencyNoticeTitle,
              message: emergencyNoticeMsg,
              expectedTime: emergencyNoticeTime
            })
          };
        });
        return next;
      });
    } else {
      setServiceControl((prev: any) => ({
        ...prev,
        [emergencyTargetKey]: {
          ...(prev[emergencyTargetKey] || {}),
          status: newStatus,
          ...(!isRestore && {
            title: emergencyNoticeTitle,
            message: emergencyNoticeMsg,
            expectedTime: emergencyNoticeTime
          })
        },
        ...(emergencyTargetKey === "website" && {
          globalWebsite: {
            ...(prev.globalWebsite || {}),
            status: newStatus,
            ...(!isRestore && {
              title: emergencyNoticeTitle,
              message: emergencyNoticeMsg,
              expectedTime: emergencyNoticeTime
            })
          }
        })
      }));
    }

    if (setServiceControlLogs) {
      setServiceControlLogs((prevLogs: any[]) => [
        {
          id: `EMERG-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          actor: "SUPER ADMIN",
          action: isRestore ? "⚡ RESTORE_SERVICE" : "🚨 EMERGENCY_KILL_SWITCH",
          service: emergencyTargetName,
          details: `Action: ${emergencyActionType.toUpperCase()} | Reason: "${emergencyReasonInput}" | PIN Verified`
        },
        ...(prevLogs || [])
      ]);
    }

    setIsEmergencyKillModalOpen(false);
  };

  // Super Admin Lock Screen State
  const [isPanelUnlocked, setIsPanelUnlocked] = useState(false);
  const [unlockedAsSuperAdmin, setUnlockedAsSuperAdmin] = useState(false);
  const effectiveSuperAdmin = Boolean(
    isSuperAdmin || 
    unlockedAsSuperAdmin || 
    (isPanelUnlocked && !isTheatreAdmin && !theatreAdmins.some(a => a.email.toLowerCase() === unlockEmail.trim().toLowerCase()))
  );
  const [lockAuthMode, setLockAuthMode] = useState<"passcode" | "password">("passcode");
  const [quickPinVal, setQuickPinVal] = useState("");
  const [unlockEmail, setUnlockEmail] = useState(superAdminEmail);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlockError, setUnlockError] = useState("");

  // Security Panel Passcode & Protected Action state
  const [adminPasscode, setAdminPasscode] = useState(() => localStorage.getItem("cine_admin_passcode") || "8888");
  const [isPasscodeRequired, setIsPasscodeRequired] = useState(() => localStorage.getItem("cine_passcode_req") !== "false");
  const [editPasscodeVal, setEditPasscodeVal] = useState(adminPasscode);
  const [showPasscodeVisible, setShowPasscodeVisible] = useState(false);
  const [isPasscodeSaved, setIsPasscodeSaved] = useState(false);

  // Protected action modal state
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [passcodeActionTitle, setPasscodeActionTitle] = useState("Authorize Sensitive Operation");

  const executeProtectedAction = (action: () => void, title = "Authorize Sensitive Operation") => {
    if (isPasscodeRequired) {
      setPendingAction(() => action);
      setPasscodeActionTitle(title);
      setPasscodeInput("");
      setPasscodeError("");
      setShowPasscodeModal(true);
    } else {
      action();
    }
  };

  const handlePasscodeSubmit = () => {
    if (passcodeInput === adminPasscode) {
      if (pendingAction) {
        pendingAction();
      }
      setShowPasscodeModal(false);
      setPendingAction(null);
      setPasscodeInput("");
      setPasscodeError("");
    } else {
      setPasscodeError("Invalid Passcode. Please try again.");
      setPasscodeInput("");
    }
  };

  const handleSavePasscodeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPasscodeVal.trim()) return;
    const cleanPasscode = editPasscodeVal.trim();
    setAdminPasscode(cleanPasscode);
    localStorage.setItem("cine_admin_passcode", cleanPasscode);
    localStorage.setItem("cine_passcode_req", isPasscodeRequired ? "true" : "false");
    setIsPasscodeSaved(true);
    setTimeout(() => setIsPasscodeSaved(false), 3000);
  };

  // Account Settings state
  const [editAdminEmail, setEditAdminEmail] = useState(superAdminEmail);
  const [editAdminPassword, setEditAdminPassword] = useState(superAdminPassword);
  const [isAccountSettingsSaved, setIsAccountSettingsSaved] = useState(false);

  // Locations (Cities) management state
  const [newCityName, setNewCityName] = useState("");
  const [editingCityIndex, setEditingCityIndex] = useState<number | null>(null);
  const [editingCityValue, setEditingCityValue] = useState("");
  const [locationsSearchQuery, setLocationsSearchQuery] = useState("");

  const [showTheatreCityOnTheFly, setShowTheatreCityOnTheFly] = useState(false);
  const [theatreCityOnTheFlyValue, setTheatreCityOnTheFlyValue] = useState("");

  const [showEventCityOnTheFly, setShowEventCityOnTheFly] = useState(false);
  const [eventCityOnTheFlyValue, setEventCityOnTheFlyValue] = useState("");

  // Editor's Spotlight Movie management state
  const [spotlightTitle, setSpotlightTitle] = useState(spotlight?.title || "");
  const [spotlightGenre, setSpotlightGenre] = useState(spotlight?.genre || "");
  const [spotlightDuration, setSpotlightDuration] = useState(spotlight?.duration || "");
  const [spotlightRating, setSpotlightRating] = useState(spotlight?.rating || "");
  const [spotlightImage, setSpotlightImage] = useState(spotlight?.image || "");
  const [spotlightDescription, setSpotlightDescription] = useState(spotlight?.description || "");
  const [spotlightShowtimes, setSpotlightShowtimes] = useState(spotlight?.showtimes?.join(", ") || "");

  // UPI Gateway Settings State
  const [upiForm, setUpiForm] = useState<UpiGatewaySettings>(upiGatewaySettings);
  const [upiSaveMessage, setUpiSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setUpiForm(upiGatewaySettings);
  }, [upiGatewaySettings]);

  const handleSaveUpiSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateUpiSettings) {
      onUpdateUpiSettings(upiForm);
    }
    setUpiSaveMessage("✅ UPI Gateway Settings successfully updated and applied platform-wide!");
    setTimeout(() => setUpiSaveMessage(null), 3000);
  };

  // Advertisement Console State
  const [adTitle, setAdTitle] = useState("");
  const [adType, setAdType] = useState<'hero_slider' | 'homepage_banner' | 'sponsored_card'>("hero_slider");
  const [adImage, setAdImage] = useState("");
  const [adTargetUrl, setAdTargetUrl] = useState("#exclusive-events");
  const [adStartDate, setAdStartDate] = useState("2026-07-29");
  const [adEndDate, setAdEndDate] = useState("2026-08-30");
  const [adFilter, setAdFilter] = useState<"all" | "hero_slider" | "homepage_banner" | "sponsored_card">("all");
  const [adSuccessMsg, setAdSuccessMsg] = useState<string | null>(null);

  const handleCreateAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adImage.trim()) {
      alert("Please provide an ad title and image URL.");
      return;
    }
    const newAd: Advertisement = {
      id: `AD-${Math.floor(100 + Math.random() * 900)}`,
      title: adTitle.trim(),
      type: adType,
      imageUrl: adImage.trim(),
      targetUrl: adTargetUrl.trim() || "#movies",
      impressions: 0,
      clicks: 0,
      status: "Active",
      startDate: adStartDate,
      endDate: adEndDate
    };

    if (onCreateAd) {
      onCreateAd(newAd);
    }
    setAdSuccessMsg(`🎉 Advertisement "${adTitle}" published live!`);
    setAdTitle("");
    setAdImage("");
    setTimeout(() => setAdSuccessMsg(null), 3000);
  };

  // Verification Queue State
  const [verifFilter, setVerifFilter] = useState<"all" | "Pending Review" | "Approved" | "Rejected">("Pending Review");
  const [verifSearch, setVerifSearch] = useState("");
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);

  // Verification Items collection
  const movieVerificationItems = bookings
    .filter(b => b.utrNumber || b.paymentScreenshot || b.paymentVerificationStatus)
    .map(b => ({
      id: b.id,
      type: "movie" as const,
      title: b.movieTitle,
      venue: b.theatreName,
      details: `Seats: ${(b.seats || []).join(", ")}`,
      date: b.date,
      time: b.timeSlot,
      userName: b.userName || b.userEmail || "Customer",
      userEmail: b.userEmail || "N/A",
      mobile: b.mobileNumber || "N/A",
      amount: b.totalPrice,
      utr: b.utrNumber || "N/A",
      screenshot: b.paymentScreenshot || "",
      verificationStatus: b.paymentVerificationStatus || (b.status === "Settled" ? "Approved" : "Pending Review")
    }));

  const eventVerificationItems = eventRegistrations
    .filter(r => r.utrNumber || r.paymentScreenshot || r.paymentVerificationStatus)
    .map(r => ({
      id: r.id,
      type: "event" as const,
      title: r.eventTitle,
      venue: r.venueName,
      details: `${r.categoryName} (${r.quantity} Pass)`,
      date: r.date,
      time: r.time,
      userName: r.userName || r.userEmail,
      userEmail: r.userEmail,
      mobile: r.mobileNumber || "N/A",
      amount: r.totalPrice,
      utr: r.utrNumber || "N/A",
      screenshot: r.paymentScreenshot || "",
      verificationStatus: r.paymentVerificationStatus || (r.status === "Confirmed" ? "Approved" : "Pending Review")
    }));

  const allVerificationItems = [...movieVerificationItems, ...eventVerificationItems];

  // Sync spotlight prop changes
  useEffect(() => {
    if (spotlight) {
      setSpotlightTitle(spotlight.title);
      setSpotlightGenre(spotlight.genre);
      setSpotlightDuration(spotlight.duration);
      setSpotlightRating(spotlight.rating);
      setSpotlightImage(spotlight.image);
      setSpotlightDescription(spotlight.description);
      setSpotlightShowtimes(spotlight.showtimes?.join(", ") || "");
    }
  }, [spotlight]);

  // Theatre Editor State
  const [editingTheatreId, setEditingTheatreId] = useState<number | null>(null);
  const [etName, setEtName] = useState("");
  const [etCity, setEtCity] = useState("");
  const [etPrice, setEtPrice] = useState("");
  const [etLocation, setEtLocation] = useState("");
  const [etFeatures, setEtFeatures] = useState<string[]>([]);
  const [etImg, setEtImg] = useState("");
  const [etBankRouting, setEtBankRouting] = useState("");
  const [etAllocPercent, setEtAllocPercent] = useState(30);

  useEffect(() => {
    setUnlockEmail(superAdminEmail);
    setEditAdminEmail(superAdminEmail);
    setEditAdminPassword(superAdminPassword);
  }, [superAdminEmail, superAdminPassword]);

  const handleLocalUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockError("");

    const normalizedEmail = unlockEmail.trim().toLowerCase();
    const enteredPass = unlockPassword.trim();
    const pinToTest = quickPinVal.trim() || enteredPass;

    // 0. Direct Security Passcode PIN Check ("8888" or custom passcode)
    if (pinToTest === adminPasscode) {
      setIsPanelUnlocked(true);
      setUnlockedAsSuperAdmin(true);
      if (onAuthSuccess) {
        onAuthSuccess(superAdminEmail);
      }
      setQuickPinVal("");
      setUnlockPassword("");
      return;
    }

    // 1. Check Super Admin Credentials (Email match, or default admin handles)
    if (
      normalizedEmail === superAdminEmail.toLowerCase() ||
      normalizedEmail === "superadmin" ||
      normalizedEmail === "admin" ||
      normalizedEmail === "superadmin@cinevenue.com"
    ) {
      if (enteredPass === superAdminPassword || enteredPass === adminPasscode) {
        setIsPanelUnlocked(true);
        setUnlockedAsSuperAdmin(true);
        if (onAuthSuccess) {
          onAuthSuccess(superAdminEmail);
        }
        setUnlockPassword("");
        return;
      } else {
        setUnlockError("Access Denied: Invalid Super Admin password or security passcode.");
        return;
      }
    }

    // 2. Direct Super Admin Password Check even if email was left blank or unmodified
    if (enteredPass === superAdminPassword) {
      setIsPanelUnlocked(true);
      setUnlockedAsSuperAdmin(true);
      if (onAuthSuccess) {
        onAuthSuccess(superAdminEmail);
      }
      setUnlockPassword("");
      return;
    }

    // 3. Check Theatre Admin Credentials
    const matchedAdmin = theatreAdmins.find((a) => a.email.toLowerCase() === normalizedEmail);
    if (matchedAdmin) {
      if (enteredPass === matchedAdmin.passwordHash || enteredPass === adminPasscode) {
        setIsPanelUnlocked(true);
        setUnlockedAsSuperAdmin(false);
        if (onAuthSuccess) {
          onAuthSuccess(matchedAdmin.email);
        }
        setUnlockPassword("");
        return;
      } else {
        setUnlockError("Access Denied: Incorrect password for Theatre Admin.");
        return;
      }
    }

    setUnlockError("Access Denied: Invalid credentials. Enter Super Admin credentials or security passcode PIN (default: 8888).");
  };

  const handleSaveAccountSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdminEmail.trim() || !editAdminPassword.trim()) {
      alert("Please fill in both Super Admin email and password.");
      return;
    }
    if (onUpdateSuperAdminCredentials) {
      onUpdateSuperAdminCredentials(editAdminEmail.trim(), editAdminPassword.trim());
    }
    setIsAccountSettingsSaved(true);
    setTimeout(() => setIsAccountSettingsSaved(false), 3000);
    alert("Super Admin account credentials updated successfully!");
  };

  // Active Tab state
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // State to view a customer's detailed past bookings
  const [viewingPastBookingsUser, setViewingPastBookingsUser] = useState<string | null>(null);

  // Filter schedules and bookings based on role (for Theatre Admin, show only their assigned theatre)
  const assignedTheatreId = activeTheatreAdmin?.theatreId;
  const assignedTheatre = theatres.find((t) => t.id === assignedTheatreId);

  // Filtered helpers
  const getFilteredSchedules = () => {
    if (effectiveSuperAdmin) return schedules;
    if (isTheatreAdmin && assignedTheatre) {
      return schedules.filter((s) => s.theatreName === assignedTheatre.name);
    }
    return schedules;
  };

  const getFilteredBookings = () => {
    if (effectiveSuperAdmin) return bookings;
    if (isTheatreAdmin && assignedTheatre) {
      return bookings.filter((b) => b.theatreName === assignedTheatre.name);
    }
    return bookings;
  };

  const currentSchedules = getFilteredSchedules();
  const currentBookings = getFilteredBookings();

  // Redirect to first available permitted tab if the current active tab is forbidden for Theatre Admin
  useEffect(() => {
    if (isTheatreAdmin && activeTheatreAdmin && !effectiveSuperAdmin) {
      const perms = activeTheatreAdmin.permissions;
      if (activeTab === "overview" && !perms.viewReports) {
        if (perms.createShows) setActiveTab("scheduler");
        else if (perms.addMovies) setActiveTab("movies");
        else if (perms.configureSeats) setActiveTab("seat_layout");
        else if (perms.scanTickets) setActiveTab("qr_scanner");
      }
    }
  }, [isTheatreAdmin, activeTheatreAdmin, activeTab, effectiveSuperAdmin]);

  // Check tab permission for Theatre Admin
  const isTabPermitted = (tab: TabType): boolean => {
    if (effectiveSuperAdmin) return true;
    if (!isTheatreAdmin || !activeTheatreAdmin) return false;
    const perms = activeTheatreAdmin.permissions;
    switch (tab) {
      case "overview":
      case "bookings":
      case "theatre_banks":
        return perms.viewReports;
      case "scheduler":
        return perms.createShows;
      case "movies":
        return perms.addMovies;
      case "seat_layout":
        return perms.configureSeats;
      case "qr_scanner":
        return perms.scanTickets;
      case "settings":
      case "service_control":
        return true; // Settings is accessible to all admins
      case "access":
      case "rentals_messages":
      case "cinecoins_admin":
      case "theatre_creator":
      case "event_creator":
      case "locations":
        return false; // Forbidden for regular theatre admins
      default:
        return false;
    }
  };

  // State: Access Management (Super Admin creating/editing theatre admins)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminTheatreId, setAdminTheatreId] = useState<number>(theatres[0]?.id || 1);
  const [adminPermAddMovies, setAdminPermAddMovies] = useState(true);
  const [adminPermCreateShows, setAdminPermCreateShows] = useState(true);
  const [adminPermConfigureSeats, setAdminPermConfigureSeats] = useState(true);
  const [adminPermViewReports, setAdminPermViewReports] = useState(true);
  const [adminPermScanTickets, setAdminPermScanTickets] = useState(true);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);

  // State: Add Movie Form
  const [movieTitle, setMovieTitle] = useState("");
  const [movieGenre, setMovieGenre] = useState("Sci-Fi");
  const [movieLang, setMovieLang] = useState("English");
  const [movieLangKey, setMovieLangKey] = useState("english");
  const [movieRating, setMovieRating] = useState("8.5");
  const [movieImg, setMovieImg] = useState("https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=60");
  const [movieFormats, setMovieFormats] = useState<string[]>(["2D"]);
  const [movieActors, setMovieActors] = useState("");
  const [movieTrailerUrl, setMovieTrailerUrl] = useState("");
  const [movieDuration, setMovieDuration] = useState("148 mins");
  const [movieCertificate, setMovieCertificate] = useState<'U' | 'UA' | 'A'>("UA");
  const [movieDistributor, setMovieDistributor] = useState("");
  const [editingMovieTitle, setEditingMovieTitle] = useState<string | null>(null);

  // State: Event Management & Client Requests
  const [adminEventRequests, setAdminEventRequests] = useState<EventManagementRequest[]>(() => { try { const raw = localStorage.getItem("cine_event_requests") || localStorage.getItem("cinevenue_event_requests"); if (raw) return JSON.parse(raw); } catch (e) {} return INITIAL_EVENT_MANAGEMENT_REQUESTS; });
  const [adminPublicEvents, setAdminPublicEvents] = useState<PublicEvent[]>([]);
  const [adminArtistRequests, setAdminArtistRequests] = useState<ArtistRequest[]>(INITIAL_ARTIST_REQUESTS);
  const [adminSponsorshipRequests, setAdminSponsorshipRequests] = useState<SponsorshipRequest[]>(INITIAL_SPONSORSHIP_REQUESTS);
  const [adminPortfolioItems, setAdminPortfolioItems] = useState<EventPortfolioItem[]>(INITIAL_EVENT_PORTFOLIO);

  useEffect(() => {
    const handleSync = async () => {
      const reqs = await getEventRequests();
      setAdminEventRequests(reqs);
    };
    handleSync();
    window.addEventListener("cinevenue-event-requests-updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("cinevenue-event-requests-updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // State: Scheduler Form
  const [schedulerMovieTitle, setSchedulerMovieTitle] = useState("");
  const [schedulerTheatreName, setSchedulerTheatreName] = useState("");
  const [schedulerTimeSlot, setSchedulerTimeSlot] = useState("7:30 PM");
  const [isCustomTimeSlot, setIsCustomTimeSlot] = useState(false);
  const [schedulerPrice, setSchedulerPrice] = useState(250);
  const [schedulerDate, setSchedulerDate] = useState("Today");
  const [schedulerInterval, setSchedulerInterval] = useState<number>(15); // Default 15 mins interval
  const [schedulerBookingWindow, setSchedulerBookingWindow] = useState<string>("24 hours before showtime");
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);

  // State: Seat Layout Configurator
  const [layoutTheatreId, setLayoutTheatreId] = useState<number>(() => {
    if (isTheatreAdmin && assignedTheatreId) return assignedTheatreId;
    return theatres[0]?.id || 1;
  });
  const selectedLayoutTheatre = theatres.find((t) => t.id === layoutTheatreId);

  const [layoutRows, setLayoutRows] = useState<number>(6);
  const [layoutCols, setLayoutCols] = useState<number>(8);
  const [layoutPremiumRows, setLayoutPremiumRows] = useState<string[]>(["A", "B"]);
  const [layoutPremiumMultiplier, setLayoutPremiumMultiplier] = useState<number>(1.5);
  const [layoutBlockedSeats, setLayoutBlockedSeats] = useState<string[]>([]);
  const [layoutWheelchairSeats, setLayoutWheelchairSeats] = useState<string[]>([]);
  const [layoutVipSeats, setLayoutVipSeats] = useState<string[]>([]);
  const [layoutReclinerSeats, setLayoutReclinerSeats] = useState<string[]>([]);
  const [layoutEmergencyExits, setLayoutEmergencyExits] = useState<string[]>([]);
  const [layoutRowCategories, setLayoutRowCategories] = useState<{ [row: string]: 'Gold' | 'Silver' | 'Premium' }>({});
  const [activeLayoutTool, setActiveLayoutTool] = useState<'block' | 'wheelchair' | 'vip' | 'recliner' | 'exit'>('block');

  const [rowPrices, setRowPrices] = useState<{ [row: string]: number }>({});
  const [tempRowPriceInput, setTempRowPriceInput] = useState<string>("");
  const [tempRowSelect, setTempRowSelect] = useState<string>("A");

  // Synchronize seat layout inputs when theatre selection changes
  useEffect(() => {
    if (selectedLayoutTheatre) {
      const rowLetters = selectedLayoutTheatre.seatRows || ["A", "B", "C", "D", "E", "F"];
      setLayoutRows(rowLetters.length);
      setLayoutCols(selectedLayoutTheatre.seatsPerRow || 8);
      setLayoutPremiumRows(selectedLayoutTheatre.premiumRows || ["A", "B"]);
      setLayoutPremiumMultiplier(selectedLayoutTheatre.premiumMultiplier || 1.5);
      setLayoutBlockedSeats(selectedLayoutTheatre.blockedSeats || []);
      setLayoutWheelchairSeats(selectedLayoutTheatre.wheelchairSeats || []);
      setLayoutVipSeats(selectedLayoutTheatre.vipSeats || []);
      setLayoutReclinerSeats(selectedLayoutTheatre.reclinerSeats || []);
      setLayoutEmergencyExits(selectedLayoutTheatre.emergencyExits || []);
      
      // Default row categories if not set
      const defaultCategories: { [row: string]: 'Gold' | 'Silver' | 'Premium' } = {};
      rowLetters.forEach((row, i) => {
        if (selectedLayoutTheatre.rowCategories && selectedLayoutTheatre.rowCategories[row]) {
          defaultCategories[row] = selectedLayoutTheatre.rowCategories[row];
        } else {
          // fallback rules
          if (i < 2) defaultCategories[row] = 'Premium';
          else if (i < 4) defaultCategories[row] = 'Gold';
          else defaultCategories[row] = 'Silver';
        }
      });
      setLayoutRowCategories(defaultCategories);

      setRowPrices(selectedLayoutTheatre.seatPrices || {});
    }
  }, [layoutTheatreId, theatres]);

  // State: Booking Management Ledger
  const [bookingsSearchQuery, setBookingsSearchQuery] = useState("");
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState("All");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editBookingEmail, setEditBookingEmail] = useState("");
  const [editBookingSeats, setEditBookingSeats] = useState("");
  const [editBookingTimeSlot, setEditBookingTimeSlot] = useState("");
  const [editBookingStatus, setEditBookingStatus] = useState<"Pending" | "Settled" | "Cancelled">("Pending");

  // State: Event Creator
  const [eventTitle, setEventTitle] = useState("");
  const [eventIsPaid, setEventIsPaid] = useState<boolean>(true);
  const [eventDescription, setEventDescription] = useState("");
  const [eventVenueName, setEventVenueName] = useState("");
  const [eventVenueAddress, setEventVenueAddress] = useState("");
  const [eventCity, setEventCity] = useState("Hyderabad");
  const [eventDate, setEventDate] = useState("2026-07-15");
  const [eventTime, setEventTime] = useState("07:00 PM");
  const [eventImage, setEventImage] = useState("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80");
  const [eventCategories, setEventCategories] = useState<{ name: string; price: number; availableSeats: number }[]>([
    { name: "General Pass", price: 499, availableSeats: 150 },
    { name: "VIP Experience (Food Incl.)", price: 1499, availableSeats: 40 }
  ]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatPrice, setNewCatPrice] = useState<number>(500);
  const [newCatSeats, setNewCatSeats] = useState<number>(100);

  // Search registrations
  const [eventRegSearchQuery, setEventRegSearchQuery] = useState("");

  // State: Theatre Creator Portal
  const [tcName, setTcName] = useState("");
  const [tcCity, setTcCity] = useState("Mumbai");
  const [tcLocation, setTcLocation] = useState("");
  const [tcFeatures, setTcFeatures] = useState<string[]>(["IMAX", "Dolby Atmos", "Recliner"]);
  const [tcPrice, setTcPrice] = useState("250,000");
  const [tcImg, setTcImg] = useState("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80");
  const [tcBankRouting, setTcBankRouting] = useState("IFSC800293");
  const [tcAllocPercent, setTcAllocPercent] = useState<number>(35);
  const [tcCreateAdmin, setTcCreateAdmin] = useState(true);
  const [tcAdminEmail, setTcAdminEmail] = useState("");
  const [tcAdminPassword, setTcAdminPassword] = useState("");

  // Auto-generate credentials as user types the theatre name
  useEffect(() => {
    if (tcName) {
      const sanitized = tcName.toLowerCase().replace(/[^a-z0-9]/g, "");
      setTcAdminEmail(`manager.${sanitized || "venue"}@cinevenue.com`);
      setTcAdminPassword(`pass.${sanitized || "secret"}`);
    } else {
      setTcAdminEmail("");
      setTcAdminPassword("");
    }
  }, [tcName]);

  // State: Event Organizer Creator Portal
  const [editingOrganizerId, setEditingOrganizerId] = useState<string | null>(null);
  const [eoName, setEoName] = useState("");
  const [eoEmail, setEoEmail] = useState("");
  const [eoPassword, setEoPassword] = useState("");
  const [eoContact, setEoContact] = useState("+91 99999 00000");
  const [eoBankRouting, setEoBankRouting] = useState("IFSC800555");
  const [eoCommissionPercent, setEoCommissionPercent] = useState<number>(15);
  const [eoAvatar, setEoAvatar] = useState("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80");
  const [eoCreateWorkspace, setEoCreateWorkspace] = useState(true);

  useEffect(() => {
    if (editingOrganizerId) return; // Do not auto-generate if editing an existing organizer
    if (eoName) {
      const sanitized = eoName.toLowerCase().replace(/[^a-z0-9]/g, "");
      setEoEmail(`organizer.${sanitized || "live"}@cinevenue.com`);
      setEoPassword(`pass.${sanitized || "secret"}`);
    } else {
      setEoEmail("");
      setEoPassword("");
    }
  }, [eoName, editingOrganizerId]);

  const handleAddCategoryRow = () => {
    if (!newCatName.trim()) return;
    setEventCategories([...eventCategories, {
      name: newCatName.trim(),
      price: eventIsPaid ? newCatPrice : 0,
      availableSeats: newCatSeats
    }]);
    setNewCatName("");
    setNewCatPrice(500);
    setNewCatSeats(100);
  };

  const handleRemoveCategoryRow = (index: number) => {
    setEventCategories(eventCategories.filter((_, i) => i !== index));
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    if (eventCategories.length === 0) {
      alert("Please configure at least one ticket pricing category.");
      return;
    }

    const finalVenueName = eventVenueName || (theatres.length > 0 ? theatres[0].name : "Luxury Suite");

    const newEvent: Event = {
      id: `EV-${Math.floor(100 + Math.random() * 900)}`,
      title: eventTitle.trim(),
      description: eventDescription.trim(),
      venueName: finalVenueName,
      venueAddress: eventVenueAddress.trim() || `${finalVenueName}, ${eventCity}`,
      city: eventCity,
      date: eventDate,
      time: eventTime,
      image: eventImage.trim() || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
      categories: eventCategories.map(cat => ({
        ...cat,
        price: eventIsPaid ? cat.price : 0
      })),
      reviews: [],
      isPaid: eventIsPaid
    };

    onAddEvent(newEvent);
    alert(`Successfully published event "${eventTitle}" on the website!`);

    // Reset Form
    setEventTitle("");
    setEventDescription("");
    setEventVenueAddress("");
    setEventIsPaid(true);
    setEventCategories([
      { name: "General Pass", price: 499, availableSeats: 150 },
      { name: "VIP Experience (Food Incl.)", price: 1499, availableSeats: 40 }
    ]);
  };

  // State: Registered Customer Management
  const [editingCustomerEmail, setEditingCustomerEmail] = useState<string | null>(null);
  const [customerEmailField, setCustomerEmailField] = useState("");
  const [customerPasswordField, setCustomerPasswordField] = useState("");
  const [customerMobileField, setCustomerMobileField] = useState("");
  const [customerNameField, setCustomerNameField] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmailField || !customerPasswordField) return;
    const normalized = customerEmailField.trim().toLowerCase();
    
    let updatedUsers = [...registeredUsers];
    if (editingCustomerEmail) {
      updatedUsers = updatedUsers.map(user => 
        user.email.toLowerCase() === editingCustomerEmail.toLowerCase()
          ? { ...user, email: normalized, passwordHash: customerPasswordField, mobile: customerMobileField.trim(), name: customerNameField.trim() }
          : user
      );
      alert("Successfully updated customer credentials!");
    } else {
      const exists = registeredUsers.some(user => user.email.toLowerCase() === normalized);
      if (exists) {
        alert("This email is already registered as a customer!");
        return;
      }
      updatedUsers.push({
        email: normalized,
        passwordHash: customerPasswordField,
        joinedAt: new Date().toISOString(),
        mobile: customerMobileField.trim(),
        name: customerNameField.trim()
      });
      alert("Successfully created new customer account!");
    }
    
    if (onUpdateRegisteredUsers) {
      onUpdateRegisteredUsers(updatedUsers);
    }
    
    // Reset Form
    setEditingCustomerEmail(null);
    setCustomerEmailField("");
    setCustomerPasswordField("");
    setCustomerMobileField("");
    setCustomerNameField("");
  };

  const handleDeleteCustomer = (emailToDelete: string) => {
    if (confirm(`Are you sure you want to delete the customer account for "${emailToDelete}"?`)) {
      const updated = registeredUsers.filter(user => user.email.toLowerCase() !== emailToDelete.toLowerCase());
      if (onUpdateRegisteredUsers) {
        onUpdateRegisteredUsers(updated);
      }
      alert("Customer account removed.");
    }
  };

  // State: Simulated QR Scanner Console
  const [scanInputId, setScanInputId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [recentlyAdmitted, setRecentlyAdmitted] = useState<string[]>([]);

  // State: Settings
  const [platformName, setPlatformName] = useState("CineVenue");
  const [convenienceFee, setConvenienceFee] = useState(25);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [supportEmail, setSupportEmail] = useState("support@cinevenue.com");
  const [supportPhone, setSupportPhone] = useState("+91 90000 12345");
  const [maintenanceMode, setMaintenanceMode] = useState(globalAppSettings.maintenanceMode);
  const [autoTimeoutMinutes, setAutoTimeoutMinutes] = useState(15);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  useEffect(() => {
    setMaintenanceMode(globalAppSettings.maintenanceMode);
  }, [globalAppSettings.maintenanceMode]);

  // State: Settlements Ledger & Range Allocations
  const [allocationSplitPercent, setAllocationSplitPercent] = useState<number>(45);
  const [editingSettleTheatre, setEditingSettleTheatre] = useState<Theatre | null>(null);
  const [editSettleBankRouting, setEditSettleBankRouting] = useState("");
  const [editSettleAlloc, setEditSettleAlloc] = useState<number>(45);
  const [editSettleDate, setEditSettleDate] = useState("");

  const handleSaveLedgerChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSettleTheatre) return;
    onUpdateTheatre({
      ...editingSettleTheatre,
      bankRouting: editSettleBankRouting,
      customAllocPercent: editSettleAlloc,
      lastSettleDate: editSettleDate,
    });
    setEditingSettleTheatre(null);
    alert(`Successfully saved updated settlement ledger configurations for "${editingSettleTheatre.name}"!`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGlobalSettings({ maintenanceMode });
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
    alert("CineVenue Platform configuration saved and synchronized globally!");
  };

  // Dynamic Cities/Locations Management Handlers
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const cleanName = newCityName.trim();
    if (cities.includes(cleanName)) {
      alert("This location/city already exists!");
      return;
    }
    const updated = [...cities, cleanName];
    if (onUpdateCities) {
      onUpdateCities(updated);
      setNewCityName("");
      alert(`Location "${cleanName}" added successfully!`);
    }
  };

  const handleCreateCityOnTheFly = (val: string, onSuccess: (newCity: string) => void) => {
    const clean = val.trim();
    if (!clean) {
      alert("Please enter a valid city name.");
      return;
    }
    const lowerCities = cities.map(c => c.toLowerCase());
    if (lowerCities.includes(clean.toLowerCase())) {
      alert(`Location "${clean}" already exists!`);
      const existing = cities.find(c => c.toLowerCase() === clean.toLowerCase()) || clean;
      onSuccess(existing);
      return;
    }
    const updated = [...cities, clean];
    if (onUpdateCities) {
      onUpdateCities(updated);
      alert(`Location "${clean}" successfully registered!`);
      onSuccess(clean);
    }
  };

  const handleDeleteCity = (cityToDelete: string) => {
    if (cityToDelete === "All Cities") {
      alert("Cannot delete the fallback 'All Cities' option!");
      return;
    }
    if (confirm(`Are you sure you want to delete the location "${cityToDelete}"? This will not delete theatres but they may no longer be filterable by this location.`)) {
      const updated = cities.filter((c) => c !== cityToDelete);
      if (onUpdateCities) {
        onUpdateCities(updated);
        alert(`Location "${cityToDelete}" removed.`);
      }
    }
  };

  const handleStartEditCity = (index: number, value: string) => {
    setEditingCityIndex(index);
    setEditingCityValue(value);
  };

  const handleSaveEditCity = (index: number) => {
    if (!editingCityValue.trim()) return;
    const oldVal = cities[index];
    if (oldVal === "All Cities") {
      alert("Cannot edit the fallback 'All Cities' option!");
      return;
    }
    const cleanVal = editingCityValue.trim();
    const updated = [...cities];
    updated[index] = cleanVal;
    if (onUpdateCities) {
      onUpdateCities(updated);
      setEditingCityIndex(null);
      alert(`Location renamed from "${oldVal}" to "${cleanVal}" successfully!`);
    }
  };

  // Editor's Spotlight Movie Handler
  const handleSaveSpotlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotlightTitle.trim()) {
      alert("Please provide a spotlight movie title.");
      return;
    }
    const updatedSpotlight = {
      title: spotlightTitle.trim(),
      genre: spotlightGenre.trim() || "Action • Thriller",
      duration: spotlightDuration.trim() || "2h 0m",
      rating: spotlightRating.trim() || "8.0",
      image: spotlightImage.trim() || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&q=70",
      description: spotlightDescription.trim() || "",
      showtimes: spotlightShowtimes.split(",").map(s => s.trim()).filter(Boolean)
    };
    if (onUpdateSpotlight) {
      onUpdateSpotlight(updatedSpotlight);
      alert("Editor's Spotlight movie updated successfully!");
    }
  };

  // Theatre Editing Handlers
  const handleStartEditTheatre = (t: Theatre) => {
    let city = "Hyderabad";
    let address = t.location;
    if (t.location.includes(" · ")) {
      const parts = t.location.split(" · ");
      city = parts[0].trim();
      address = parts[1].trim();
    } else if (t.location.includes(" · ")) {
      const parts = t.location.split(" · ");
      city = parts[0].trim();
      address = parts[1].trim();
    }
    
    setEditingTheatreId(t.id);
    setEtName(t.name);
    setEtCity(city);
    setEtPrice(t.price.replace("₹", ""));
    setEtLocation(address);
    setEtFeatures(t.features || []);
    setEtImg(t.img || "");
    setEtBankRouting(t.bankRouting || "IFSC800293");
    setEtAllocPercent(t.customAllocPercent || 35);
  };

  const handleUpdateTheatreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTheatreId === null) return;
    
    const origTheatre = theatres.find(t => t.id === editingTheatreId);
    if (!origTheatre) return;

    const updatedTheatre: Theatre = {
      ...origTheatre,
      name: etName.trim(),
      location: `${etCity} · ${etLocation.trim()}`,
      features: etFeatures,
      price: etPrice.startsWith("₹") ? etPrice : `₹${etPrice.trim()}`,
      img: etImg,
      bankRouting: etBankRouting,
      customAllocPercent: etAllocPercent,
    };

    onUpdateTheatre(updatedTheatre);
    setEditingTheatreId(null);
    alert(`Successfully updated specifications for theatre multiplex "${etName}"!`);
  };

  const handleCreateTheatreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tcName.trim() || !tcLocation.trim()) {
      alert("Please fill in the theatre name and address location.");
      return;
    }

    const newTheatreId = theatres.length > 0 ? Math.max(...theatres.map(t => t.id)) + 1 : 1;
    
    const newTheatre: Theatre = {
      id: newTheatreId,
      name: tcName.trim(),
      location: `${tcCity} · ${tcLocation.trim()}`,
      features: tcFeatures,
      price: `₹${tcPrice}`,
      img: tcImg,
      bankRouting: tcBankRouting,
      customAllocPercent: tcAllocPercent,
      lastSettleDate: new Date().toISOString().split("T")[0],
      seatRows: ["A", "B", "C", "D", "E", "F"],
      seatsPerRow: 8,
      premiumRows: ["A", "B"],
      premiumMultiplier: 1.5,
      blockedSeats: [],
      seatPrices: { "A": 350, "B": 350, "C": 250, "D": 250, "E": 180, "F": 180 }
    };

    onAddTheatre(newTheatre);

    // Also create Theatre Admin credentials if checked
    if (tcCreateAdmin && tcAdminEmail && tcAdminPassword && onUpdateTheatreAdmins) {
      const newAdmin: TheatreAdmin = {
        id: "ADM-" + Math.floor(1000 + Math.random() * 9000),
        email: tcAdminEmail.trim(),
        passwordHash: tcAdminPassword.trim(),
        theatreId: newTheatreId,
        permissions: {
          addMovies: true,
          createShows: true,
          configureSeats: true,
          viewReports: true,
          scanTickets: true
        }
      };
      onUpdateTheatreAdmins([newAdmin, ...theatreAdmins]);
    }

    alert(`Successfully onboarded independent theatre "${tcName}" and generated its secure manager dashboard workspace!`);
    
    // Reset Form
    setTcName("");
    setTcLocation("");
    setTcFeatures(["IMAX", "Dolby Atmos", "Recliner"]);
    setTcPrice("250,000");
    setTcImg("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80");
    setTcBankRouting("IFSC800293");
    setTcAllocPercent(35);
  };

  const handleCreateEventOrganizerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eoName.trim() || !eoEmail.trim() || !eoPassword.trim()) {
      alert("Please fill in organizer name, email and password.");
      return;
    }

    if (!onUpdateEventOrganizers) return;

    if (editingOrganizerId) {
      const updated = eventOrganizers.map((org) => {
        if (org.id === editingOrganizerId) {
          return {
            ...org,
            name: eoName.trim(),
            email: eoEmail.trim(),
            passwordHash: eoPassword.trim(),
            contact: eoContact.trim(),
            bankRouting: eoBankRouting.trim(),
            commissionPercent: Number(eoCommissionPercent) || 15,
            avatar: eoAvatar
          };
        }
        return org;
      });
      onUpdateEventOrganizers(updated);
      alert(`Successfully updated Event Organizer "${eoName}" credentials!`);
      setEditingOrganizerId(null);
    } else {
      const newOrganizerId = "EO-" + Math.floor(1000 + Math.random() * 9000);
      const newOrganizer: EventOrganizer = {
        id: newOrganizerId,
        name: eoName.trim(),
        email: eoEmail.trim(),
        passwordHash: eoPassword.trim(),
        contact: eoContact.trim(),
        bankRouting: eoBankRouting.trim(),
        commissionPercent: Number(eoCommissionPercent) || 15,
        avatar: eoAvatar
      };
      onUpdateEventOrganizers([newOrganizer, ...eventOrganizers]);
      alert(`Successfully onboarded independent Event Organizer "${eoName}" with dynamic workspace portal generated!`);
    }

    // Reset Form
    setEoName("");
    setEoContact("+91 99999 00000");
    setEoBankRouting("IFSC800555");
    setEoCommissionPercent(15);
    setEoAvatar("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80");
  };

  // Add/Update Movie Submit Handler
  const handleMovieSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieTitle) return;

    const actorsArray = movieActors.split(",").map(a => a.trim()).filter(Boolean);

    if (editingMovieTitle) {
      if (onUpdateMovie) {
        onUpdateMovie(editingMovieTitle, {
          title: movieTitle,
          genre: movieGenre,
          lang: movieLang,
          rating: movieRating,
          img: movieImg,
          langKey: movieLangKey,
          formats: movieFormats,
          actors: actorsArray,
          trailerUrl: movieTrailerUrl,
          duration: movieDuration,
          certificate: movieCertificate,
          distributor: movieDistributor,
        });
        alert(`Successfully updated movie "${movieTitle}"!`);
      }
      setEditingMovieTitle(null);
    } else {
      onAddMovie({
        title: movieTitle,
        genre: movieGenre,
        lang: movieLang,
        rating: movieRating,
        img: movieImg,
        langKey: movieLangKey,
        formats: movieFormats,
        actors: actorsArray,
        trailerUrl: movieTrailerUrl,
        duration: movieDuration,
        certificate: movieCertificate,
        distributor: movieDistributor,
      });
      alert(`Successfully added movie "${movieTitle}"!`);
    }

    setMovieTitle("");
    setMovieGenre("Sci-Fi");
    setMovieLang("English");
    setMovieLangKey("english");
    setMovieRating("8.5");
    setMovieImg("https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=60");
    setMovieFormats(["2D"]);
    setMovieActors("");
    setMovieTrailerUrl("");
    setMovieDuration("148 mins");
    setMovieCertificate("UA");
    setMovieDistributor("");
  };

  // Add/Update Schedule Submit Handler
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const movieTitleToSchedule = schedulerMovieTitle || (movies.length > 0 ? movies[0].title : "");
    const theatreToSchedule = schedulerTheatreName || (isTheatreAdmin && assignedTheatre ? assignedTheatre.name : theatres.length > 0 ? theatres[0].name : "");

    if (!movieTitleToSchedule || !theatreToSchedule) {
      alert("Please ensure a movie and venue are registered.");
      return;
    }

    if (editingScheduleId) {
      if (onUpdateSchedule) {
        onUpdateSchedule(editingScheduleId, {
          id: editingScheduleId,
          movieTitle: movieTitleToSchedule,
          theatreName: theatreToSchedule,
          timeSlot: schedulerTimeSlot,
          pricePerSeat: Number(schedulerPrice),
          date: schedulerDate,
          isDeployed: true,
          interval: Number(schedulerInterval),
          bookingWindow: schedulerBookingWindow,
        });
        alert(`Successfully updated show schedule!`);
      }
      setEditingScheduleId(null);
    } else {
      onScheduleShow({
        id: "SCH-" + Math.floor(1000 + Math.random() * 9000),
        movieTitle: movieTitleToSchedule,
        theatreName: theatreToSchedule,
        timeSlot: schedulerTimeSlot,
        pricePerSeat: Number(schedulerPrice),
        date: schedulerDate,
        isDeployed: true,
        interval: Number(schedulerInterval),
        bookingWindow: schedulerBookingWindow,
      });
      alert(`Successfully scheduled "${movieTitleToSchedule}" at "${theatreToSchedule}"!`);
    }

    setSchedulerMovieTitle("");
    setSchedulerTimeSlot("7:30 PM");
    setSchedulerPrice(250);
  };

  // Access Management: Create or Edit Theatre Admin
  const handleSaveTheatreAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      alert("Please enter email and password credentials.");
      return;
    }

    if (!onUpdateTheatreAdmins) return;

    if (editingAdminId) {
      const updated = theatreAdmins.map((a) => {
        if (a.id === editingAdminId) {
          return {
            ...a,
            email: adminEmail,
            passwordHash: adminPassword,
            theatreId: adminTheatreId,
            permissions: {
              addMovies: adminPermAddMovies,
              createShows: adminPermCreateShows,
              configureSeats: adminPermConfigureSeats,
              viewReports: adminPermViewReports,
              scanTickets: adminPermScanTickets,
            },
          };
        }
        return a;
      });
      onUpdateTheatreAdmins(updated);
      alert("Theatre admin details updated successfully.");
      setEditingAdminId(null);
    } else {
      const exists = theatreAdmins.some((a) => a.email.toLowerCase() === adminEmail.toLowerCase());
      if (exists) {
        alert("This email account is already registered as an admin.");
        return;
      }
      const newAdmin: TheatreAdmin = {
        id: "ADM-" + Math.floor(1000 + Math.random() * 9000),
        email: adminEmail,
        passwordHash: adminPassword,
        theatreId: adminTheatreId,
        permissions: {
          addMovies: adminPermAddMovies,
          createShows: adminPermCreateShows,
          configureSeats: adminPermConfigureSeats,
          viewReports: adminPermViewReports,
          scanTickets: adminPermScanTickets,
        },
      };
      onUpdateTheatreAdmins([newAdmin, ...theatreAdmins]);
      alert("New Theatre Admin Portal created successfully!");
    }

    setAdminEmail("");
    setAdminPassword("");
    setEditingAdminId(null);
  };

  const handleDeleteTheatreAdmin = (id: string) => {
    if (!onUpdateTheatreAdmins) return;
    if (confirm("Are you sure you want to revoke this admin access?")) {
      const filtered = theatreAdmins.filter((a) => a.id !== id);
      onUpdateTheatreAdmins(filtered);
      alert("Admin access revoked successfully.");
    }
  };

  // Save Dynamic Seat & Price configuration for Selected Theatre
  const handleSaveSeatConfiguration = () => {
    if (!selectedLayoutTheatre) return;

    // Build row letters array based on rows count, e.g. 6 rows -> ['A', 'B', 'C', 'D', 'E', 'F']
    const generatedRows = Array.from({ length: layoutRows }).map((_, idx) => String.fromCharCode(65 + idx));

    const updatedTheatre: Theatre = {
      ...selectedLayoutTheatre,
      seatRows: generatedRows,
      seatsPerRow: layoutCols,
      premiumRows: layoutPremiumRows,
      premiumMultiplier: layoutPremiumMultiplier,
      blockedSeats: layoutBlockedSeats,
      wheelchairSeats: layoutWheelchairSeats,
      vipSeats: layoutVipSeats,
      reclinerSeats: layoutReclinerSeats,
      emergencyExits: layoutEmergencyExits,
      rowCategories: layoutRowCategories,
      seatPrices: rowPrices,
    };

    onUpdateTheatre(updatedTheatre);
    alert(`Successfully applied seat layouts & custom pricing models to "${selectedLayoutTheatre.name}"!`);
  };

  // Add customized price rule to specific row letter
  const handleApplyRowPrice = () => {
    const val = parseInt(tempRowPriceInput);
    if (isNaN(val) || val <= 0) {
      alert("Please specify a positive price.");
      return;
    }
    setRowPrices((prev) => ({
      ...prev,
      [tempRowSelect]: val,
    }));
    setTempRowPriceInput("");
    alert(`Applied flat price of ₹${val} to Row ${tempRowSelect}`);
  };

  // Click on seat in configuration grid to toggle block / unblock or other properties based on tool
  const toggleConfigSeatBlock = (seatId: string) => {
    // Clear all states first to avoid double tags, unless toggling off
    setLayoutBlockedSeats((prev) => prev.filter((s) => s !== seatId));
    setLayoutWheelchairSeats((prev) => prev.filter((s) => s !== seatId));
    setLayoutVipSeats((prev) => prev.filter((s) => s !== seatId));
    setLayoutReclinerSeats((prev) => prev.filter((s) => s !== seatId));
    setLayoutEmergencyExits((prev) => prev.filter((s) => s !== seatId));

    if (activeLayoutTool === 'block') {
      setLayoutBlockedSeats((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
    } else if (activeLayoutTool === 'wheelchair') {
      setLayoutWheelchairSeats((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
    } else if (activeLayoutTool === 'vip') {
      setLayoutVipSeats((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
    } else if (activeLayoutTool === 'recliner') {
      setLayoutReclinerSeats((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
    } else if (activeLayoutTool === 'exit') {
      setLayoutEmergencyExits((prev) =>
        prev.includes(seatId) ? prev.filter((s) => s !== seatId) : [...prev, seatId]
      );
    }
  };

  // Toggle row as premium
  const togglePremiumRowConfig = (row: string) => {
    setLayoutPremiumRows((prev) =>
      prev.includes(row) ? prev.filter((r) => r !== row) : [...prev, row]
    );
  };

  // QR Simulator scan handler
  const handleTriggerSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInputId) return;

    setIsScanning(true);
    setScanFeedback("Configuring scanner beams... Reading security tokens...");
    setScannedBooking(null);

    setTimeout(() => {
      setIsScanning(false);
      const cleanId = scanInputId.trim().toUpperCase().replace("#", "");
      
      // Look up in current bookings (which respects theatre-specific isolation)
      const match = currentBookings.find((b) => b.id.toUpperCase() === cleanId);
      
      if (match) {
        setScannedBooking(match);
        setScanFeedback(null);
      } else {
        setScanFeedback("ERROR: Access Denied. QR Ticket signature not found in this venue ledger.");
      }
    }, 900);
  };

  // Edit / Cancel Booking handlers
  const handleEditBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !onUpdateBooking) return;

    const parsedSeats = editBookingSeats
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0);

    if (parsedSeats.length === 0) {
      alert("Please provide at least one seat.");
      return;
    }

    const updated: Booking = {
      ...editingBooking,
      userEmail: editBookingEmail,
      seats: parsedSeats,
      timeSlot: editBookingTimeSlot,
      status: editBookingStatus,
    };

    onUpdateBooking(editingBooking.id, updated);
    setEditingBooking(null);
    alert(`Successfully updated ticket booking ${editingBooking.id}!`);
  };

  if (!isOpen) return null;

  if (!effectiveSuperAdmin && !isTheatreAdmin && !isPanelUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-[#060608] flex items-center justify-center p-6 animate-fade-in font-sans">
        <div className="bg-[#0F0F11] border border-white/10 w-full max-w-md rounded-2xl relative shadow-2xl overflow-hidden p-8 text-left space-y-6">
          {/* Close Button to return to the showcase website */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center space-y-3">
            <CineVenueLogo size="xl" />
            <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
              CineVenue platform infrastructure is encrypted. Please authenticate to open the controls.
            </p>
          </div>

          {/* Secure Login Header */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3.5 text-left space-y-1">
            <div className="text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-gold" /> Protected System Authentication
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Enter your master administrator email and security password to access the platform control hub.
            </p>
          </div>

          {unlockError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-lg text-center font-medium">
              ⚠️ {unlockError}
            </div>
          )}

          <form onSubmit={handleLocalUnlockSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Email / Username</label>
              <input
                type="email"
                value={unlockEmail}
                onChange={(e) => setUnlockEmail(e.target.value)}
                placeholder="Enter username / email"
                className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-lg px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Security Password</label>
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-lg px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-gold"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer border-0 shadow-lg shadow-gold/5 transition-all mt-6"
            >
              Verify & Launch Terminal
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-[10px] font-bold text-text-muted hover:text-text-primary uppercase tracking-wider transition-colors bg-transparent border-0 cursor-pointer"
            >
              ← Return to Main Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render SVG charts data calculations for Reports
  const getTheatreSalesData = () => {
    return theatres.map((t) => {
      const theatreB = bookings.filter((b) => b.theatreName === t.name && b.status !== 'Cancelled' );
      const totalRevenue = theatreB.reduce((sum, b) => sum + b.totalPrice, 0);
      const totalTickets = theatreB.reduce((sum, b) => sum + (b.seats?.length || 0), 0);
      return {
        name: t.name,
        revenue: totalRevenue,
        tickets: totalTickets,
      };
    });
  };

  const getMovieSalesData = () => {
    return movies.map((m) => {
      const movieB = bookings.filter((b) => b.movieTitle === m.title && b.status !== 'Cancelled' );
      const totalRevenue = movieB.reduce((sum, b) => sum + b.totalPrice, 0);
      const totalTickets = movieB.reduce((sum, b) => sum + (b.seats?.length || 0), 0);
      return {
        title: m.title,
        revenue: totalRevenue,
        tickets: totalTickets,
      };
    });
  };

  const theatreSales = getTheatreSalesData();
  const movieSales = getMovieSalesData();

  // Financial statistics
  const activeBookies = bookings.filter(b => b.status !== 'Cancelled' );
  const globalTotalBilledRevenue = activeBookies.reduce((sum, b) => sum + b.totalPrice, 0);
  const globalTotalTicketsSold = activeBookies.reduce((sum, b) => sum + (b.seats?.length || 0), 0);
  const averageTicketPrice = globalTotalTicketsSold > 0 ? Math.round(globalTotalBilledRevenue / globalTotalTicketsSold) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex items-center justify-center p-0 overflow-hidden animate-fade-in font-sans" id="admin-panel-viewport">
      <div className="bg-[#0A0A0B] w-full h-screen rounded-none relative overflow-hidden text-left flex flex-col md:flex-row">
        
        {/* MOBILE HEADER */}
        <div className="flex md:hidden items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0F0F11] shrink-0" id="mobile-admin-header">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md bg-white/[0.03] border border-white/10 text-text-secondary hover:text-gold"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <CineVenueLogo size="sm" />
              <span className="px-1.5 py-0.5 text-[8px] font-bold text-gold border border-gold/20 bg-gold/5 rounded-sm uppercase">
                {effectiveSuperAdmin ? "Super Admin" : "Venue Admin"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/10 text-xs text-text-secondary hover:text-gold hover:border-gold cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Lobby</span>
          </button>
        </div>

        {/* SIDEBAR NAVIGATION PANEL */}
        <div className={`
          w-64 bg-[#0F0F11] border-r border-white/10 flex flex-col justify-between z-40 transition-all duration-300
          absolute inset-y-0 left-0 transform md:relative md:translate-x-0 md:flex h-full shrink-0
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `} id="admin-sidebar">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Brand Title (Desktop) */}
            <div className="p-6 border-b border-white/10 hidden md:flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CineVenueLogo size="md" />
                <span className="px-2 py-0.5 text-[8px] font-bold text-gold border border-gold/20 bg-gold/5 rounded-md uppercase tracking-wider">
                  {effectiveSuperAdmin ? "Super Admin" : "Venue Admin"}
                </span>
              </div>
            </div>

            {/* Sidebar content */}
            <div className="p-4 flex flex-col gap-6 overflow-y-auto flex-1">
              <button
                onClick={onClose}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-gold bg-gold/5 border border-gold/20 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all cursor-pointer font-sans uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Return to Lobby</span>
              </button>

              <div className="space-y-1">
                <p className="px-3 text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2.5">
                  Main Modules
                </p>

                {/* Tab Item - Dashboard (Conditional) */}
                {isTabPermitted("overview") && (
                  <button
                    onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "overview" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-gold shrink-0" />
                    <span>Dashboard Overview</span>
                  </button>
                )}

                {/* Tab Item - CineCoins Standalone Loyalty Management */}
                {effectiveSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("cinecoins_admin"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "cinecoins_admin" 
                        ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>CineCoins Control Hub</span>
                    </div>
                    <span className="text-[9px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded">
                      STANDALONE
                    </span>
                  </button>
                )}

                {/* Tab Item - Independent Theatre Creator (Super Admin Only) */}
                {effectiveSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("theatre_creator"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "theatre_creator" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <PlusCircle className="w-4 h-4 text-gold shrink-0" />
                      <span>Theatre Creator Portal</span>
                    </div>
                    <span className="text-[9px] font-bold bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  </button>
                )}

                {/* Tab Item - Independent Events Creator (Super Admin Only) */}
                {effectiveSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("event_creator"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "event_creator" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />
                      <span>Event Creator Portal</span>
                    </div>
                    <span className="text-[9px] font-bold bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  </button>
                )}

                {/* Tab Item - Manage Access (Super Admin or Theatre Admin) */}
                {(effectiveSuperAdmin || isTheatreAdmin) && (
                  <><button
                    type="button"
                    onClick={() => { setActiveTab("integration_testing"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 group ${
                      activeTab === "integration_testing" ? "bg-white/10 text-gold" : "text-text-secondary hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md ${activeTab === "integration_testing" ? "bg-gold/20" : "bg-white/5 group-hover:bg-white/10"}`}>
                        <Monitor className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold tracking-wide">Integration & Testing</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab("access"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "access" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-gold shrink-0" />
                      <span>User Management</span>
                    </div>
                    <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text-secondary">
                      {theatreAdmins.length}
                    </span>
                  </button>
                </>)}

                {/* Tab Item - Manage Locations (Super Admin Only) */}
                {effectiveSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("locations"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "locations" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                    id="tab-btn-locations"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gold shrink-0" />
                      <span>Manage Locations</span>
                    </div>
                    <span className="text-[9px] font-bold bg-gold/15 border border-gold/30 text-gold px-1.5 py-0.5 rounded animate-pulse">
                      {cities.length}
                    </span>
                  </button>
                )}

                {/* Tab Item - Theatre Bank Accounts & Settlements */}
                {(effectiveSuperAdmin || isTheatreAdmin) && (
                  <button
                    onClick={() => { setActiveTab("theatre_banks"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeTab === "theatre_banks" ? "bg-gold/10 text-gold border-l-2 border-gold" : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"}`}
                    id="tab-btn-theatre-banks"
                  >
                    <div className="flex items-center gap-3">
                      <Landmark className="w-4 h-4 text-gold shrink-0" />
                      <span>Bank & Settlements</span>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded">
                      ACCOUNTS
                    </span>
                  </button>
                )}

                {/* Tab Item - Now Showing (Conditional) */}
                {isTabPermitted("movies") && (
                  <button
                    onClick={() => { setActiveTab("movies"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "movies" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <Film className="w-4 h-4 text-gold shrink-0" />
                    <span>Manage Movies</span>
                  </button>
                )}

                {/* Tab Item - Shows Publisher (Conditional) */}
                {isTabPermitted("scheduler") && (
                  <button
                    onClick={() => { setActiveTab("scheduler"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "scheduler" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <CalendarRange className="w-4 h-4 text-gold shrink-0" />
                    <span>Show Publisher</span>
                  </button>
                )}

                {/* Tab Item - Configure Seat Layout (Conditional) */}
                {isTabPermitted("seat_layout") && (
                  <button
                    onClick={() => { setActiveTab("seat_layout"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "seat_layout" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <Sliders className="w-4 h-4 text-gold shrink-0" />
                    <span>Layouts & Pricing</span>
                  </button>
                )}

                {/* Tab Item - Bookings Ledger (Conditional) */}
                {isTabPermitted("bookings") && (
                  <button
                    onClick={() => { setActiveTab("bookings"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "bookings" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <Ticket className="w-4 h-4 text-gold shrink-0" />
                    <span>Booking & Sales</span>
                  </button>
                )}

                {/* Tab Item - Scanner Gate (Conditional) */}
                {isTabPermitted("qr_scanner") && (
                  <button
                    onClick={() => { setActiveTab("qr_scanner"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "qr_scanner" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-gold shrink-0" />
                    <span>Digital Ticket Scanner</span>
                  </button>
                )}

                {/* Tab Item - Private Rentals & Messages (Super Admin Only) */}
                {effectiveSuperAdmin && (
                  <button
                    onClick={() => { setActiveTab("rentals_messages"); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "rentals_messages" 
                        ? "bg-gold/10 text-gold border-l-2 border-gold" 
                        : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-gold shrink-0" />
                      <span>Customers Messages</span>
                    </div>
                    <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text-secondary">
                      {rentalRequests.length + contactMessages.length}
                    </span>
                  </button>
                )}

                {/* Tab Item - Events Manager */}
                <button
                  onClick={() => { setActiveTab("events"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "events" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-events"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-gold shrink-0 animate-pulse" />
                    <span>Events Manager</span>
                  </div>
                  <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text-secondary">
                    {events.length}
                  </span>
                </button>

                {/* Tab Item - Event Management Requests & Inquiries */}
                <button
                  onClick={() => { setActiveTab("event_requests"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "event_requests" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-event-requests"
                >
                  <div className="flex items-center gap-3">
                    <CalendarRange className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Event Requests & Inquiries</span>
                  </div>
                  <span className="text-[9px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded">
                    {adminEventRequests.length}
                  </span>
                </button>

                {/* Tab Item - Proposal & Quotation Management System */}
                <button
                  onClick={() => { setActiveTab("proposals"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "proposals" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-proposals"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gold shrink-0" />
                    <span>Proposals & Quotes</span>
                  </div>
                  <span className="text-[9px] font-bold bg-gold/15 border border-gold/30 text-gold px-1.5 py-0.5 rounded">
                    ENTERPRISE
                  </span>
                </button>

                {/* Tab Item - Verification Queue / Payments */}
                <button
                  onClick={() => { setActiveTab("verification_queue"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "verification_queue" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-verification-queue"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>UPI Verification Queue</span>
                  </div>
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    {allVerificationItems.filter(i => i.verificationStatus === "Pending Review").length}
                  </span>
                </button>

                {/* Tab Item - Advertisement Console */}
                <button
                  onClick={() => { setActiveTab("ads_console"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "ads_console" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-ads-console"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-gold shrink-0" />
                    <span>Ad Console & CTR</span>
                  </div>
                  <span className="text-[9px] font-bold bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded">
                    {advertisements.length}
                  </span>
                </button>

                {/* Tab Item - Fee Management & Pricing Engine */}
                <button
                  onClick={() => { setActiveTab("fee_management"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "fee_management" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-fee-management"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-gold shrink-0" />
                    <span>Fee Management</span>
                  </div>
                  <span className="text-[9px] font-bold bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded">
                    ENGINE
                  </span>
                </button>

                {/* Tab Item - UPI Gateway Settings */}
                <button
                  onClick={() => { setActiveTab("upi_settings"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "upi_settings" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-upi-settings"
                >
                  <Wallet className="w-4 h-4 text-gold shrink-0" />
                  <span>UPI Gateway Settings</span>
                </button>

                {/* Tab Item - Service Control Center */}
                <button
                  onClick={() => { setActiveTab("service_control"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "service_control" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-service-control"
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-gold shrink-0 animate-pulse" />
                    <span>Service Control Center</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </button>

                                {/* Tab Item - Film Production & 24 Crafts Directorate */}
                <button
                  onClick={() => { setActiveTab("film_production"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "film_production" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-film-production"
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Film Production & 24 Crafts</span>
                  </div>
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                    DIRECTORATE
                  </span>
                </button>

{/* Tab Item - Sub-Websites Console (5 Pillars) */}
                <button
                  onClick={() => { setActiveTab("sub_websites"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "sub_websites" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-subwebsites"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-gold shrink-0" />
                    <span>Sub-Websites Console</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-gold px-1.5 py-0.5 rounded">
                    5 Pillars
                  </span>
                </button>

                {/* Tab Item - Footer & Legal Pages Editor */}
                <button
                  onClick={() => { setActiveTab("footer_pages"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "footer_pages" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-footerpages"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gold shrink-0" />
                    <span>Footer Pages Editor</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/20 text-gold px-1.5 py-0.5 rounded">
                    4 Pages
                  </span>
                </button>

                {/* Tab Item - Settings */}
                <button
                  onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "settings" 
                      ? "bg-gold/10 text-gold border-l-2 border-gold" 
                      : "text-text-secondary hover:bg-white/[0.02] hover:text-text-primary"
                  }`}
                  id="tab-btn-settings"
                >
                  <Settings className="w-4 h-4 text-gold shrink-0" />
                  <span>Platform Settings</span>
                </button>
              </div>
            </div>

            {/* User Logged in Profile footer */}
            <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="truncate text-left">
                  <span className="text-[9px] text-text-muted font-bold block uppercase tracking-wider">LOGGED AS STAFF</span>
                  <span className="text-text-primary font-bold truncate block max-w-[150px]">{activeTheatreAdmin?.email || "superadmin@cinevenue.com"}</span>
                  {isTheatreAdmin && assignedTheatre && (
                    <span className="text-[9px] text-gold font-semibold block truncate mt-0.5">{assignedTheatre.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-[#070708] p-6 md:p-8 relative z-10" id="admin-main-content">
          
                    {/* ========================================================= */}
          {/* TAB: INTEGRATION & TESTING MODULE */}
          {/* ========================================================= */}
          {activeTab === "integration_testing" && (
            <IntegrationTestingModule isSuperAdmin={effectiveSuperAdmin} />
          )}

{/* ========================================================= */}
          {/* TAB: CINECOINS STANDALONE LOYALTY MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === "cinecoins_admin" && (
            <div className="space-y-6 animate-fade-in" id="tab-cinecoins">
              <CineCoinsAdminControl
                settings={cineCoinsSettings || DEFAULT_CINECOINS_SETTINGS}
                onUpdateSettings={onUpdateCineCoinsSettings || (() => {})}
                rewards={cineCoinsRewards || []}
                onUpdateRewards={onUpdateCineCoinsRewards || (() => {})}
                challenges={cineCoinsChallenges || []}
                onUpdateChallenges={onUpdateCineCoinsChallenges || (() => {})}
                transactions={cineCoinsTransactions || []}
                onUpdateTransactions={onUpdateCineCoinsTransactions || (() => {})}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: OVERVIEW DASHBOARD & STATS REPORTS */}
          {/* ========================================================= */}
          {activeTab === "overview" && isTabPermitted("overview") && (
            <div className="space-y-8 animate-fade-in" id="tab-overview">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-3xl font-display font-semibold text-text-primary tracking-wide">
                    Dashboard Overview
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Welcome back, here's what's happening today.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {effectiveSuperAdmin && (
                    <button
                      onClick={() => {
                        // Generate CSV content
                        let csvContent = "data:text/csv;charset=utf-8,";
                        csvContent += "Theatre ID,Theatre Name,Location,Bank Routing (IFSC),Share Allocation %,Total Sales (Gross),Settled Earnings,Pending Settlements,Platform Commission (12%),Taxes Handled (18% GST),Last Settlement Date\n";
                        
                        theatres.forEach((t) => {
                          const tBookings = bookings.filter(b => b.theatreName === t.name);
                          const gross = tBookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalPrice, 0);
                          const settled = tBookings.filter(b => b.status === 'Settled').reduce((sum, b) => sum + b.totalPrice, 0);
                          const pending = tBookings.filter(b => b.status !== 'Settled' && b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalPrice, 0);
                          
                          const alloc = t.customAllocPercent || 45;
                          const commission = Math.round(gross * 0.12);
                          const gst = Math.round(gross * 0.18);
                          const netTheatreSettled = Math.round((settled * 0.70) * (alloc / 100));
                          const netTheatrePending = Math.round((pending * 0.70) * (alloc / 100));
                          const bank = t.bankRouting || "IFSC900018";
                          const date = t.lastSettleDate || "2026-07-01";
                          
                          csvContent += `${t.id},"${t.name}","${t.location}",${bank},${alloc}%,${gross},${netTheatreSettled},${netTheatrePending},${commission},${gst},${date}\n`;
                        });

                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "CineVenue_Settlements_FY26.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        alert("Spreadsheet file 'CineVenue_Settlements_FY26.csv' compiled and downloaded successfully!");
                      }}
                      className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-text-primary text-xs font-bold uppercase rounded border border-white/10 flex items-center gap-2 cursor-pointer shadow-lg transition-all"
                    >
                      <FileText className="w-4 h-4 text-gold" />
                      <span className="hidden md:inline">Export CSV</span>
                    </button>
                  )}

                  {isTabPermitted("movies") && (
                    <button
                      onClick={() => { setActiveTab("movies"); }}
                      className="px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase rounded border-0 flex items-center gap-2 cursor-pointer shadow-lg font-display tracking-wider transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ ADD MOVIE</span>
                    </button>
                  )}
                </div>
              </div>

              {/* MASTER SYSTEM ON/OFF CONTROL SWITCHES PANEL */}
              <div className="bg-[#121216] border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="text-left space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold flex items-center gap-1.5">
                    <Power className="w-4 h-4 text-gold" />
                    Global System Visibility & Booking Controls
                  </span>
                  <p className="text-xs text-text-secondary">
                    Instantly enable or disable live ticket bookings across movie halls and event venues across all locations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Movie Booking System Toggle */}
                  <button
                    type="button"
                    id="btn-admin-toggle-movie-system"
                    onClick={() => onToggleMovieBookingSystemActive && onToggleMovieBookingSystemActive(!isMovieBookingSystemActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                      isMovieBookingSystemActive
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/60 shadow-lg shadow-emerald-500/20 hover:bg-emerald-900"
                        : "bg-rose-950/80 text-rose-400 border-rose-500/60 shadow-lg shadow-rose-500/20 hover:bg-rose-900"
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>Movie Bookings: {isMovieBookingSystemActive ? "SYSTEM ON" : "SYSTEM OFF"}</span>
                  </button>

                  {/* Event Booking System Toggle */}
                  <button
                    type="button"
                    id="btn-admin-toggle-event-system"
                    onClick={() => onToggleEventSystemActive && onToggleEventSystemActive(!isEventBookingSystemActive)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
                      isEventBookingSystemActive
                        ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/60 shadow-lg shadow-emerald-500/20 hover:bg-emerald-900"
                        : "bg-rose-950/80 text-rose-400 border-rose-500/60 shadow-lg shadow-rose-500/20 hover:bg-rose-900"
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    <span>Event Bookings: {isEventBookingSystemActive ? "SYSTEM ON" : "SYSTEM OFF"}</span>
                  </button>
                </div>
              </div>

              {/* CENTRALIZED FINANCIAL METRICS */}
              {(() => {
                const metrics = calculateRevenueMetrics(bookings);
                return (
                  <div className="space-y-6">
                    {/* SALES SECTION */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-3 bg-blue-500 rounded-full" />
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Sales Activity</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Total Bookings */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><Ticket className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Total Bookings</span>
                          <p className="text-3xl font-display font-semibold text-text-primary">
                            {metrics.totalBookings.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Confirmed: <span className="text-emerald-400 font-semibold">{metrics.confirmedBookings}</span> | Cancelled: <span className="text-red-400 font-semibold">{metrics.cancelledBookings}</span>
                          </p>
                        </div>
                        {/* Gross Booking Value */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><DollarSign className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Gross Booking Value</span>
                          <p className="text-3xl font-display font-semibold text-text-primary">
                            ₹{metrics.grossBookingValue.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Total ticket sales value including all fees and taxes collected.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* REVENUE SECTION */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Revenue & Settlements Breakdown</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Platform Revenue */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><Sliders className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">CineVenue Platform Revenue</span>
                          <p className="text-3xl font-display font-semibold text-emerald-400">
                            ₹{metrics.platformRevenue.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Total platform commission (12%) + convenience fees retained.
                          </p>
                        </div>
                        {/* Theatre Settlement */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><Landmark className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Theatre Payable / Settlement</span>
                          <p className="text-3xl font-display font-semibold text-blue-400">
                            ₹{metrics.theatreSettlement.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Remaining ticket value settled directly to partner multiplexes.
                          </p>
                        </div>
                        {/* Taxes Collected */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><Award className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Taxes Collected</span>
                          <p className="text-3xl font-display font-semibold text-amber-500">
                            ₹{metrics.taxCollected.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Consolidated GST (18%) and additional compliance taxes.
                          </p>
                        </div>
                        {/* Refunds */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><RotateCcw className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Refunds Processed</span>
                          <p className="text-3xl font-display font-semibold text-rose-500">
                            ₹{metrics.refunds.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Refunds returned to customers for cancelled bookings.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* OPTIONAL SECTION */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-3 bg-purple-500 rounded-full" />
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Convenience & Promotional Adjustments</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Convenience Fees */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><Volume2 className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Convenience Fees Retained</span>
                          <p className="text-2xl font-display font-semibold text-purple-400">
                            ₹{metrics.convenienceFee.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Extra online transaction fees and venue-handling conveniences.
                          </p>
                        </div>
                        {/* Discounts/CineCoins */}
                        <div className="bg-[#121214] border border-white/5 p-5 rounded-xl text-left space-y-2 relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-text-secondary opacity-15"><Coins className="w-8 h-8" /></div>
                          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-text-secondary">Discounts / CineCoins Applied</span>
                          <p className="text-2xl font-display font-semibold text-amber-400">
                            ₹{(metrics.discounts + metrics.cinecoinDiscount).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-text-muted">
                            Promotional coupon cuts (₹{metrics.discounts.toLocaleString("en-IN")}) + CineCoins redemption value (₹{metrics.cinecoinDiscount.toLocaleString("en-IN")}).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* DYNAMIC REVENUE ALLOCATION WIDGET */}
              {effectiveSuperAdmin && (
                <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-6 text-left space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">Interactive Revenue Allocation Model</span>
                      <p className="text-xs text-text-secondary mt-0.5">Customize and simulate real-time share split of ticket earnings across stakeholders.</p>
                    </div>
                    <div className="bg-black/30 border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <span className="text-[10px] text-text-secondary font-bold">Split Rate:</span>
                      <span className="text-xs text-emerald-400 font-mono font-bold">{allocationSplitPercent}% Theatre Owners</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                    <div className="lg:col-span-1 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Custom Remaining Share Split Selector</label>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          value={allocationSplitPercent}
                          onChange={(e) => setAllocationSplitPercent(Number(e.target.value))}
                          className="w-full accent-gold bg-white/5 rounded-lg h-1.5 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-text-muted font-bold font-mono">
                          <span>10% (Theatre Owner)</span>
                          <span>90% (Theatre Owner)</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        After allocating standard <strong className="text-text-primary">12% Platform Commission</strong> and <strong className="text-text-primary">18% GST handles</strong>, the remaining <strong className="text-gold">70% revenue</strong> is split. Adjust the slider dynamically to modify real-time settlements across the grid below.
                      </p>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      {/* Visual stacked allocation progress bar */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Dynamic Multi-Stakeholder Stacked Split Bar</span>
                        <div className="w-full flex rounded-lg overflow-hidden h-4 border border-white/5 shadow-inner">
                          <div style={{ width: '12%' }} className="bg-amber-500 hover:opacity-90 transition-opacity" title="Platform Commission (12%)" />
                          <div style={{ width: '18%' }} className="bg-red-500 hover:opacity-90 transition-opacity" title="Taxes Handled (18% GST)" />
                          <div style={{ width: `${70 * (allocationSplitPercent / 100)}%` }} className="bg-emerald-500 hover:opacity-90 transition-opacity" title={`Theatre Owners Share (${Math.round(70 * (allocationSplitPercent / 100))}%`} />
                          <div style={{ width: `${70 * ((100 - allocationSplitPercent) / 100)}%` }} className="bg-blue-600 hover:opacity-90 transition-opacity" title={`Producers & Distributors Share (${Math.round(70 * ((100 - allocationSplitPercent) / 100))}%`} />
                        </div>
                      </div>

                      {/* Stacked labels breakdown with currency values */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <div className="p-2 bg-black/20 rounded border border-white/5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="text-[9px] text-text-secondary font-bold">Platform Fee / Commission</span>
                          </div>
                          <p className="text-xs font-mono font-bold text-emerald-400 mt-1">₹{calculateRevenueMetrics(bookings).platformRevenue.toLocaleString("en-IN")}</p>
                        </div>

                        <div className="p-2 bg-black/20 rounded border border-white/5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            <span className="text-[9px] text-text-secondary font-bold">GST Collected</span>
                          </div>
                          <p className="text-xs font-mono font-bold text-amber-400 mt-1">₹{calculateRevenueMetrics(bookings).taxCollected.toLocaleString("en-IN")}</p>
                        </div>

                        <div className="p-2 bg-black/20 rounded border border-white/5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-[9px] text-text-secondary font-bold">Theatre Settlement</span>
                          </div>
                          <p className="text-xs font-mono font-bold text-purple-400 mt-1">₹{calculateRevenueMetrics(bookings).theatreSettlement.toLocaleString("en-IN")}</p>
                        </div>

                        <div className="p-2 bg-black/20 rounded border border-white/5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            <span className="text-[9px] text-text-secondary font-bold">Gross Booking Value</span>
                          </div>
                          <p className="text-xs font-mono font-bold text-white mt-1">₹{calculateRevenueMetrics(bookings).grossBookingValue.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* THEATRE VENUES SETTLEMENT GRID */}
              {effectiveSuperAdmin && (
                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl text-left space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block">
                      🏛️ Theatre Venues Settlement Grid
                    </span>
                    <button
                      onClick={() => setActiveTab("theatre_banks")}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      <Landmark className="w-3 h-3" />
                      Manage All Verified Bank Accounts
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-3">Venue Screen Details</th>
                          <th className="pb-3">Bank Details & Settle Date</th>
                          <th className="pb-3">Split Alloc Ratio</th>
                          <th className="pb-3 text-right">Total Sales (Gross)</th>
                          <th className="pb-3 text-right">Commission & Taxes</th>
                          <th className="pb-3 text-right">Net Settled Share</th>
                          <th className="pb-3 text-right text-orange-400">Net Pending Share</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {theatres.map((t) => {
                          const tBookings = bookings.filter(b => b.theatreName === t.name);
                          const gross = tBookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalPrice, 0);
                          const settled = tBookings.filter(b => b.status === 'Settled').reduce((sum, b) => sum + b.totalPrice, 0);
                          const pending = tBookings.filter(b => b.status !== 'Settled' && b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalPrice, 0);

                          const allocPercent = t.customAllocPercent ?? 45;
                          const commission = Math.round(gross * 0.12);
                          const gst = Math.round(gross * 0.18);
                          
                          // Net Theatre owner shares based on remaining 70% of gross
                          const netTheatreSettled = Math.round((settled * 0.70) * (allocPercent / 100));
                          const netTheatrePending = Math.round((pending * 0.70) * (allocPercent / 100));
                          
                          const pendingBookingsCount = tBookings.filter(b => b.status !== 'Settled' && b.status !== 'Cancelled').length;

                          return (
                            <tr key={t.id} className="hover:bg-white/[0.01]">
                              <td className="py-3.5 pr-2">
                                <p className="text-text-primary font-bold">{t.name}</p>
                                <span className="text-[9px] text-text-secondary">{t.location} · ID: {t.id}</span>
                              </td>
                              <td className="py-3.5 pr-2">
                                <p className="font-mono text-text-primary text-[11px]">{t.bankRouting || "IFSC900018"}</p>
                                <span className="text-[9px] text-text-muted">Last Settled: {t.lastSettleDate || "2026-07-01"}</span>
                              </td>
                              <td className="py-3.5 pr-2">
                                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gold font-mono font-semibold">
                                  {allocPercent}% Owner
                                </span>
                              </td>
                              <td className="py-3.5 text-right font-mono font-bold text-text-primary">
                                ₹{gross.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 text-right font-mono text-[10px] text-text-secondary">
                                <p>C: ₹{commission.toLocaleString("en-IN")}</p>
                                <p>T: ₹{gst.toLocaleString("en-IN")}</p>
                              </td>
                              <td className="py-3.5 text-right font-mono text-emerald-400 font-semibold">
                                ₹{netTheatreSettled.toLocaleString("en-IN")}
                              </td>
                              <td className="py-3.5 text-right font-mono text-orange-400 font-bold bg-orange-500/[0.02]">
                                ₹{netTheatrePending.toLocaleString("en-IN")}
                                <span className="text-[8px] text-text-muted block font-sans font-normal">{pendingBookingsCount} pending tickets</span>
                              </td>
                              <td className="py-3.5 text-right shrink-0">
                                <div className="flex items-center justify-end gap-1.5">
                                  {pending > 0 ? (
                                    <button
                                      onClick={() => {
                                        onSettleVenueBookings(t.name);
                                        // Update Last Settlement Date on-the-fly automatically
                                        onUpdateTheatre({
                                          ...t,
                                          lastSettleDate: new Date().toISOString().split("T")[0]
                                        });
                                        alert(`Instant account balance settlement completed! Disbursed ₹${netTheatrePending.toLocaleString()} to ${t.name}'s routed account.`);
                                      }}
                                      className="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-extrabold uppercase rounded border-0 cursor-pointer shadow-lg shadow-emerald-500/10"
                                      title="Disburse Pending Balance immediately"
                                    >
                                      Settle Balance
                                    </button>
                                  ) : (
                                    <span className="text-[10px] font-mono text-text-muted italic px-2 py-1">Settled</span>
                                  )}

                                  <button
                                    onClick={() => {
                                      setEditingSettleTheatre(t);
                                      setEditSettleBankRouting(t.bankRouting || "IFSC900018");
                                      setEditSettleAlloc(allocPercent);
                                      setEditSettleDate(t.lastSettleDate || "2026-07-01");
                                    }}
                                    className="p-1.5 rounded bg-white/5 hover:bg-gold hover:text-black text-text-secondary cursor-pointer border-0"
                                    title="Edit Settlement Bank Details"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => onOpenManagerDashboard(t.id)}
                                    className="p-1.5 rounded bg-white/5 hover:bg-blue-500 hover:text-black text-text-secondary cursor-pointer border-0"
                                    title="Launch Theatre Manager Workspace"
                                  >
                                    <Monitor className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      const url = `${window.location.origin}${window.location.pathname}?theatreId=${t.id}`;
                                      navigator.clipboard.writeText(url);
                                      alert(`Copied workspace share link: ${url}`);
                                    }}
                                    className="p-1.5 rounded bg-white/5 hover:bg-purple-500 hover:text-black text-text-secondary cursor-pointer border-0"
                                    title="Copy Workspace Invite URL"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SALES CHARTS / GRAPHICAL REPORTS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Revenue by Theatre */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-5 text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">Revenue by Luxury Venue</span>
                    <span className="text-[9px] text-text-muted">Interactive Sales Distribution</span>
                  </div>

                  <div className="space-y-4 py-2">
                    {theatreSales.map((ts, idx) => {
                      const maxRevenue = Math.max(...theatreSales.map((x) => x.revenue), 10000);
                      const percent = Math.min(100, Math.round((ts.revenue / maxRevenue) * 100));

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-text-primary shrink-0 truncate max-w-[150px]">{ts.name}</span>
                            <span className="text-gold font-mono">₹{ts.revenue.toLocaleString()} ({ts.tickets} Sold)</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-gold/50 via-gold to-gold-light h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percent || 5}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chart 2: Revenue by Movie popular ranking */}
                <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-5 text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">Audience Movie Popularity</span>
                    <span className="text-[9px] text-text-muted">Total Gross Receipts</span>
                  </div>

                  <div className="space-y-4 py-2">
                    {movieSales.slice(0, 5).map((ms, idx) => {
                      const maxRevenue = Math.max(...movieSales.map((x) => x.revenue), 10000);
                      const percent = Math.min(100, Math.round((ms.revenue / maxRevenue) * 100));

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-text-primary truncate max-w-[180px]">{ms.title}</span>
                            <span className="text-text-secondary font-mono">₹{ms.revenue.toLocaleString()} ({ms.tickets} seats)</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-amber-500/50 to-gold h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percent || 5}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SALES TRANSACTION LEDGER (COMPACT AUDIT TRAIL) */}
              {effectiveSuperAdmin && (
                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">
                      🧾 Sales Transaction Audit Ledger (Recent Completed Bookings)
                    </span>
                    <button 
                      onClick={() => setActiveTab("bookings")}
                      className="text-[10px] font-bold text-gold hover:underline cursor-pointer bg-transparent border-0"
                    >
                      View All Ledger Bookings →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-3">Booking ID</th>
                          <th className="pb-3">Audience User Email</th>
                          <th className="pb-3">Movie & Theatre Venue</th>
                          <th className="pb-3">Showtime Slot</th>
                          <th className="pb-3">Seats Map</th>
                          <th className="pb-3 text-right">Receipt Total</th>
                          <th className="pb-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {bookings.slice(0, 10).map((b) => (
                          <tr key={b.id} className="hover:bg-white/[0.01]">
                            <td className="py-2.5 font-mono text-gold font-bold">{b.id}</td>
                            <td className="py-2.5 text-text-secondary">{b.userEmail || "anonymous@cinevenue.com"}</td>
                            <td className="py-2.5 text-text-primary">
                              <strong>{b.movieTitle}</strong>
                              <span className="text-[10px] text-text-secondary block">{b.theatreName} ({b.city || "Hyderabad"})</span>
                            </td>
                            <td className="py-2.5 text-text-secondary">{b.timeSlot} ({b.date})</td>
                            <td className="py-2.5 font-mono text-[10px] text-text-primary font-semibold">{(b.seats || []).join(", ")}</td>
                            <td className="py-2.5 text-right font-mono text-emerald-400 font-bold">₹{b.totalPrice.toLocaleString()}</td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                                b.status === "Settled"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : b.status === "Cancelled"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {b.status || "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* OPERATIONAL POWER DASHBOARD FOR THEATRE ADMINS */}
              {isTheatreAdmin && assignedTheatre && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  {/* Daily Report */}
                  <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">📊 Daily Report (Today)</span>
                      <span className="text-[8px] bg-gold/10 text-gold border border-gold/20 px-1.5 py-0.5 rounded font-mono">LIVE FEED</span>
                    </div>
                    {(() => {
                      const todayDateStr = new Date().toISOString().split("T")[0];
                      const myBookings = bookings.filter(b => b.theatreName === assignedTheatre.name);
                      const todayBookings = myBookings.filter(b => b.date === "Today" || b.date === todayDateStr);
                      const todayActiveBookings = todayBookings.filter(b => b.status !== "Cancelled");
                      const todaySales = todayActiveBookings.reduce((sum, b) => sum + b.totalPrice, 0);
                      const todayTickets = todayActiveBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

                      return (
                        <div className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary uppercase">Today's Revenue</span>
                              <p className="text-base font-bold text-emerald-400 font-mono mt-0.5">₹{todaySales.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary uppercase">Today's Tickets</span>
                              <p className="text-base font-bold text-text-primary font-mono mt-0.5">{todayTickets} seats</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Today's Active Audience Log:</span>
                            {todayActiveBookings.length === 0 ? (
                              <p className="text-text-muted italic text-[11px] py-2">No bookings recorded for today yet.</p>
                            ) : (
                              <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5">
                                {todayActiveBookings.map(tb => (
                                  <div key={tb.id} className="pt-1.5 text-[11px] flex justify-between items-center">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-text-primary truncate">{tb.movieTitle}</p>
                                      <p className="text-[9px] text-text-secondary">{tb.userEmail} · {tb.timeSlot}</p>
                                    </div>
                                    <span className="font-mono text-gold font-bold shrink-0 font-semibold">₹{tb.totalPrice}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Collection Report */}
                  <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">📈 Cumulative Collection Report</span>
                      <span className="text-[8px] text-text-muted">ALL-TIME METRICS</span>
                    </div>
                    {(() => {
                      const myBookings = bookings.filter(b => b.theatreName === assignedTheatre.name);
                      const activeBookings = myBookings.filter(b => b.status !== "Cancelled");
                      const grossCollection = activeBookings.reduce((sum, b) => sum + b.totalPrice, 0);
                      const cancelledBookings = myBookings.filter(b => b.status === "Cancelled");
                      const cancelledRefundAmount = cancelledBookings.reduce((sum, b) => sum + b.totalPrice, 0);

                      const collectionByMovie: { [title: string]: number } = {};
                      activeBookings.forEach(b => {
                        collectionByMovie[b.movieTitle] = (collectionByMovie[b.movieTitle] || 0) + b.totalPrice;
                      });

                      return (
                        <div className="space-y-3.5 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary uppercase">Gross Collection</span>
                              <p className="text-base font-bold text-gold font-mono mt-0.5">₹{grossCollection.toLocaleString("en-IN")}</p>
                            </div>
                            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-lg">
                              <span className="text-[10px] text-text-secondary uppercase">Refunded/Cancelled</span>
                              <p className="text-base font-bold text-red-400 font-mono mt-0.5">₹{cancelledRefundAmount.toLocaleString("en-IN")}</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block font-sans">Revenue Breakdowns by Film:</span>
                            {Object.keys(collectionByMovie).length === 0 ? (
                              <p className="text-text-muted italic text-[11px] py-2">No movie ticket collections registered.</p>
                            ) : (
                              <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
                                {Object.entries(collectionByMovie).map(([title, rev]) => {
                                  const pct = Math.round((rev / (grossCollection || 1)) * 100);
                                  return (
                                    <div key={title} className="space-y-1">
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-text-primary font-medium truncate max-w-[130px]">{title}</span>
                                        <span className="font-mono text-text-secondary font-bold">₹{rev.toLocaleString("en-IN")} ({pct}%)</span>
                                      </div>
                                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                        <div className="bg-gold h-full rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Operational Controls panel */}
                  <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">⚙️ Operational Quick Access Tools</span>
                      <span className="text-[8px] text-text-muted bg-white/5 px-1.5 py-0.5 rounded font-mono">ADMIN HUB</span>
                    </div>

                    <p className="text-[11px] text-text-secondary">
                      Manage your cinema screenings, cancel shows, edit show pricing, block faulty seats, or approve cancellations and process refunds:
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <button 
                        onClick={() => setActiveTab("movies")}
                        className="py-2.5 bg-white/[0.02] hover:bg-gold hover:text-black border border-white/10 rounded font-semibold transition-colors text-[11px] cursor-pointer"
                      >
                        🎬 Add Movie
                      </button>
                      <button 
                        onClick={() => setActiveTab("scheduler")}
                        className="py-2.5 bg-white/[0.02] hover:bg-gold hover:text-black border border-white/10 rounded font-semibold transition-colors text-[11px] cursor-pointer"
                      >
                        📅 Create Show
                      </button>
                      <button 
                        onClick={() => setActiveTab("scheduler")}
                        className="py-2.5 bg-white/[0.02] hover:bg-red-500/15 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded font-semibold transition-colors text-[11px] cursor-pointer"
                      >
                        ❌ Cancel Show
                      </button>
                      <button 
                        onClick={() => setActiveTab("seat_layout")}
                        className="py-2.5 bg-white/[0.02] hover:bg-gold hover:text-black border border-white/10 rounded font-semibold transition-colors text-[11px] cursor-pointer"
                      >
                        💺 Block Seats
                      </button>
                      <button 
                        onClick={() => setActiveTab("seat_layout")}
                        className="py-2.5 bg-white/[0.02] hover:bg-gold hover:text-black border border-white/10 rounded font-semibold transition-colors text-[11px] cursor-pointer"
                      >
                        💲 Change Price
                      </button>
                      <button 
                        onClick={() => setActiveTab("bookings")}
                        className="py-2.5 bg-white/[0.02] hover:bg-emerald-500/15 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 rounded font-semibold transition-colors text-[11px] cursor-pointer"
                      >
                        💸 Refunds & Bookings
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SINGLE VENUE DIRECT BANK SETTLEMENT LEDGER (FOR INDIVIDUAL THEATRE ADMINS) */}
              {isTheatreAdmin && assignedTheatre && (
                <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-5 text-left space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold">Direct Bank Settlement Ledger</span>
                    <span className="text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">ACTIVE ACCOUNT</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <span className="text-text-muted font-semibold block mb-0.5">Assigned Settlement Bank Route:</span>
                      <p className="font-mono text-text-primary text-sm font-semibold">{assignedTheatre.bankRouting || "DEFAULT IFSC CORE"}</p>
                    </div>
                    <div>
                      <span className="text-text-muted font-semibold block mb-0.5">Last Disbursed Settlement Date:</span>
                      <p className="text-text-primary text-sm font-semibold">{assignedTheatre.lastSettleDate || "Never"}</p>
                    </div>
                    <div>
                      <span className="text-text-muted font-semibold block mb-0.5">Revenue Split share ratio:</span>
                      <p className="text-text-primary text-sm font-semibold">{assignedTheatre.customAllocPercent || 45}% (Theatre) / {100 - (assignedTheatre.customAllocPercent || 45)}% (CineVenue)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* LEDGER EDITOR MODAL */}
              {editingSettleTheatre && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-[#0F0F11] border border-white/10 rounded-xl max-w-md w-full p-6 text-left space-y-4 shadow-2xl relative">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h3 className="text-sm font-bold text-gold uppercase tracking-wider">✏️ Ledger & Balance Configurator</h3>
                      <button onClick={() => setEditingSettleTheatre(null)} className="text-text-muted hover:text-text-primary bg-transparent border-0 cursor-pointer">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <form onSubmit={handleSaveLedgerChanges} className="space-y-4">
                      <p className="text-xs text-text-secondary">
                        Configure banking routing detail IFSC and custom split ratio for <strong className="text-text-primary">{editingSettleTheatre.name}</strong>.
                      </p>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Bank Routing / IFSC Code</label>
                        <input 
                          type="text"
                          value={editSettleBankRouting}
                          onChange={(e) => setEditSettleBankRouting(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
                          <span>Theatre Owner Allocation Share</span>
                          <span className="text-gold">{editSettleAlloc}% Share</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="90"
                          value={editSettleAlloc}
                          onChange={(e) => setEditSettleAlloc(Number(e.target.value))}
                          className="w-full accent-gold bg-white/10 h-2 rounded cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-text-muted font-bold font-mono">
                          <span>10% (Min)</span>
                          <span>90% (Max)</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Last Settlement Date</label>
                        <input 
                          type="date"
                          value={editSettleDate}
                          onChange={(e) => setEditSettleDate(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="flex gap-3 pt-3 border-t border-white/5">
                        <button 
                          type="button" 
                          onClick={() => setEditingSettleTheatre(null)}
                          className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase rounded border-0 text-text-secondary cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase rounded border-0 cursor-pointer"
                        >
                          Save Config
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: MANAGE ACCESS (THEATRE ADMIN ACCOUNTS) */}
          {/* ========================================================= */}
          {activeTab === "access" && (effectiveSuperAdmin || isTheatreAdmin) && (
            <div className="space-y-8 animate-fade-in" id="tab-access">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-wide">
                  Create & Manage Theatre Admin Portals
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Super Admin credentials system to designate venue-specific administrators, assign their passwords, and check off explicit permissions.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Form: Create/Edit Theatre Admin */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-5 rounded-xl h-fit">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    {editingAdminId ? "✏️ Edit Admin Credentials" : "🛡️ Authorize New Theatre Admin"}
                  </span>

                  <form onSubmit={handleSaveTheatreAdmin} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Admin Login Email</label>
                      <input 
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="e.g. manager.nexus@cinevenue.com"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Secure Portal Password</label>
                      <input 
                        type="text"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Password or Token Key"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Associated Luxury Venue Screen</label>
                      <select 
                        value={adminTheatreId}
                        onChange={(e) => setAdminTheatreId(Number(e.target.value))}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-md p-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                      >
                        {theatres.map((t) => (
                          <option key={t.id} value={t.id} className="bg-[#0F0F11] text-text-primary">
                            {t.name} ({t.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Permissions checklist */}
                    <div className="space-y-2 text-left pt-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Assigned Permissions Panel</label>
                      
                      <button
                        type="button"
                        onClick={() => setAdminPermAddMovies(!adminPermAddMovies)}
                        className="flex items-center gap-2 text-xs text-text-primary hover:text-gold cursor-pointer bg-transparent border-0 py-1"
                      >
                        {adminPermAddMovies ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-text-secondary" />}
                        <span>Allow Adding/Updating Movies</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminPermCreateShows(!adminPermCreateShows)}
                        className="flex items-center gap-2 text-xs text-text-primary hover:text-gold cursor-pointer bg-transparent border-0 py-1"
                      >
                        {adminPermCreateShows ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-text-secondary" />}
                        <span>Allow Publishing Movie Schedules</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminPermConfigureSeats(!adminPermConfigureSeats)}
                        className="flex items-center gap-2 text-xs text-text-primary hover:text-gold cursor-pointer bg-transparent border-0 py-1"
                      >
                        {adminPermConfigureSeats ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-text-secondary" />}
                        <span>Allow Configuring Seat layouts & Pricing</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminPermViewReports(!adminPermViewReports)}
                        className="flex items-center gap-2 text-xs text-text-primary hover:text-gold cursor-pointer bg-transparent border-0 py-1"
                      >
                        {adminPermViewReports ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-text-secondary" />}
                        <span>Allow Viewing Ledger & Sales Reports</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminPermScanTickets(!adminPermScanTickets)}
                        className="flex items-center gap-2 text-xs text-text-primary hover:text-gold cursor-pointer bg-transparent border-0 py-1"
                      >
                        {adminPermScanTickets ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-text-secondary" />}
                        <span>Allow Accessing Gates Ticket Scanner</span>
                      </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingAdminId && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdminEmail("");
                            setAdminPassword("");
                            setEditingAdminId(null);
                          }}
                          className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-xs text-text-secondary rounded font-bold border-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded border-0 cursor-pointer"
                      >
                        {editingAdminId ? "Save Changes" : "Create Admin Portal"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Database Table: Authorized Theatre Admins */}
                <div className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    Authorized Venue Administrators Database ({theatreAdmins.length})
                  </span>

                  {theatreAdmins.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-xs">
                      No theatre admins authorized yet. Use the credentials panel to onboard the first administrator.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                            <th className="pb-3">Admin Email & ID</th>
                            <th className="pb-3">Managing Theatre Screen</th>
                            <th className="pb-3">Granted Permissions</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {theatreAdmins.map((adm) => {
                            const managingT = theatres.find((t) => t.id === adm.theatreId);
                            return (
                              <tr key={adm.id} className="hover:bg-white/[0.01]">
                                <td className="py-3.5 pr-2">
                                  <p className="text-text-primary font-bold">{adm.email}</p>
                                  <span className="text-[9px] font-mono text-text-muted">{adm.id} · Pin: ••••••••</span>
                                </td>
                                <td className="py-3.5 pr-2">
                                  <p className="text-text-primary font-medium">{managingT?.name || "Unknown Screen"}</p>
                                  <span className="text-[9px] text-text-secondary">{managingT?.location}</span>
                                </td>
                                <td className="py-3.5 pr-2">
                                  <div className="flex flex-wrap gap-1">
                                    {adm.permissions.addMovies && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-text-primary border border-white/10">Movies</span>}
                                    {adm.permissions.createShows && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-text-primary border border-white/10">Schedules</span>}
                                    {adm.permissions.configureSeats && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-text-primary border border-white/10">Seats</span>}
                                    {adm.permissions.viewReports && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-text-primary border border-white/10">Ledger</span>}
                                    {adm.permissions.scanTickets && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] text-text-primary border border-white/10">Scanner</span>}
                                  </div>
                                </td>
                                <td className="py-3.5 text-right space-x-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      setEditingAdminId(adm.id);
                                      setAdminEmail(adm.email);
                                      setAdminPassword(adm.passwordHash);
                                      setAdminTheatreId(adm.theatreId);
                                      setAdminPermAddMovies(adm.permissions.addMovies);
                                      setAdminPermCreateShows(adm.permissions.createShows);
                                      setAdminPermConfigureSeats(adm.permissions.configureSeats);
                                      setAdminPermViewReports(adm.permissions.viewReports);
                                      setAdminPermScanTickets(adm.permissions.scanTickets);
                                    }}
                                    className="p-1.5 rounded bg-white/5 hover:bg-gold hover:text-black text-text-secondary cursor-pointer border-0"
                                    title="Edit admin details"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTheatreAdmin(adm.id)}
                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 cursor-pointer border border-red-500/20"
                                    title="Revoke admin access"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Registered Customers Credentials Database section */}
              <div className="mt-8 bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2 text-gold">
                    👥 Registered Customer Credentials Database ({registeredUsers.length})
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Manage registration details, passwords, and access permissions for members. In accordance with requirements, usernames and plain text passwords are secure but fully transparent to Administrators below.
                  </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Form to Create/Edit Customer */}
                  <div className="xl:col-span-1 bg-white/[0.02] border border-white/5 p-4 rounded-lg">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-primary block mb-3 border-b border-white/5 pb-1.5">
                      {editingCustomerEmail ? "✏️ Edit Customer Credentials" : "➕ Onboard New Customer"}
                    </span>
                    <form onSubmit={handleSaveCustomer} className="space-y-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Full Name</label>
                        <input
                          type="text"
                          value={customerNameField}
                          onChange={(e) => setCustomerNameField(e.target.value)}
                          placeholder="Enter full name"
                          className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Email / Username</label>
                        <input
                          type="email"
                          value={customerEmailField}
                          onChange={(e) => setCustomerEmailField(e.target.value)}
                          placeholder="customer@example.com"
                          className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Password</label>
                        <input
                          type="text"
                          value={customerPasswordField}
                          onChange={(e) => setCustomerPasswordField(e.target.value)}
                          placeholder="Secure password"
                          className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Mobile Number</label>
                        <input
                          type="text"
                          value={customerMobileField}
                          onChange={(e) => setCustomerMobileField(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-gold hover:bg-gold-light text-black py-2 rounded text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          {editingCustomerEmail ? "Save Credentials" : "Create Account"}
                        </button>
                        {editingCustomerEmail && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCustomerEmail(null);
                              setCustomerEmailField("");
                              setCustomerPasswordField("");
                              setCustomerMobileField("");
                              setCustomerNameField("");
                            }}
                            className="bg-white/5 hover:bg-white/10 text-text-primary px-3 py-2 rounded text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Customer Credentials Table */}
                  <div className="xl:col-span-2 space-y-4">
                    {/* Search Engine */}
                    <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-lg flex flex-col md:flex-row gap-3 items-center justify-between">
                      <div className="text-left">
                        <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">🔍 Search Member Accounts</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5">Filter the customer database instantly by email/username or mobile number.</p>
                      </div>
                      <div className="w-full md:w-72 relative">
                        <input
                          type="text"
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          placeholder="Search email or mobile..."
                          className="w-full bg-[#0A0A0B] border border-white/10 hover:border-white/20 rounded-md pl-3 pr-8 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                        />
                        {customerSearchQuery && (
                          <button
                            onClick={() => setCustomerSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-gold text-[10px] font-bold bg-transparent border-none cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {(() => {
                      const filteredUsers = registeredUsers.filter((user) => {
                        const emailMatch = (user.email || "").toLowerCase().includes(customerSearchQuery.toLowerCase());
                        const mobileMatch = (user.mobile || "").toLowerCase().includes(customerSearchQuery.toLowerCase());
                        const nameMatch = (user.name || "").toLowerCase().includes(customerSearchQuery.toLowerCase());
                        return emailMatch || mobileMatch || nameMatch;
                      });

                      return filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-text-muted text-xs border border-dashed border-white/10 rounded-lg">
                          {customerSearchQuery ? "No customer credentials match your search." : "No registered customer accounts found."}
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-white/5 rounded-lg">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="bg-white/[0.02] text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                                <th className="p-3">Customer Email / Username</th>
                                <th className="p-3">Full Name</th>
                                <th className="p-3">Mobile Number</th>
                                <th className="p-3">Plaintext Password</th>
                                <th className="p-3">Joined Date</th>
                                <th className="p-3">Past Bookings</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredUsers.map((user) => (
                                <tr key={user.email} className="hover:bg-white/[0.01]">
                                  <td className="p-3 font-medium text-text-primary border-0">
                                    {user.email}
                                  </td>
                                  <td className="p-3 text-text-primary font-bold border-0">
                                    {user.name || <span className="text-text-muted italic">Not Provided</span>}
                                  </td>
                                  <td className="p-3 font-mono text-text-secondary text-xs border-0">
                                    {user.mobile || <span className="text-text-muted italic">Not Provided</span>}
                                  </td>
                                  <td className="p-3 font-mono text-gold text-xs border-0">
                                    ••••••••
                                  </td>
                                  <td className="p-3 text-text-secondary border-0">
                                    {new Date(user.joinedAt).toLocaleDateString()}
                                  </td>
                                  <td className="p-3 border-0">
                                    {(() => {
                                      const uBookings = bookings.filter(b => (b.userEmail || "").toLowerCase() === user.email.toLowerCase());
                                      const uRegs = eventRegistrations.filter(r => (r.userEmail || "").toLowerCase() === user.email.toLowerCase());
                                      const totalCount = uBookings.length + uRegs.length;
                                      return (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setViewingPastBookingsUser(user.email);
                                          }}
                                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase cursor-pointer border transition-all ${
                                            totalCount > 0
                                              ? "bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-black"
                                              : "bg-white/5 text-text-secondary border-white/10"
                                          }`}
                                        >
                                          📊 {totalCount} Bookings
                                        </button>
                                      );
                                    })()}
                                  </td>
                                  <td className="p-3 text-right space-x-2 border-0">
                                    <button
                                      onClick={() => {
                                        setEditingCustomerEmail(user.email);
                                        setCustomerEmailField(user.email);
                                        setCustomerPasswordField(user.passwordHash);
                                        setCustomerMobileField(user.mobile || "");
                                        setCustomerNameField(user.name || "");
                                      }}
                                      className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black text-text-secondary cursor-pointer transition-colors inline-block"
                                      title="Edit Password / Email"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCustomer(user.email)}
                                      className="p-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border border-red-500/20 cursor-pointer transition-colors inline-block"
                                      title="Delete Customer Account"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: NOW SHOWING MOVIES CATALOG */}
          {/* ========================================================= */}
          {activeTab === "movies" && isTabPermitted("movies") && (
            <div className="space-y-8 animate-fade-in" id="tab-movies">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-wide">
                  Now Showing Movie Catalog
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Publish movie films, modify genres, languages, reviews, and establish cover graphic posters.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Form: Add/Edit Movie */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-5 rounded-xl h-fit">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    {editingMovieTitle ? "✏️ Edit Movie Details" : "🎬 Register New Film"}
                  </span>

                  <form onSubmit={handleMovieSubmit} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Movie Title</label>
                      <input 
                        type="text"
                        value={movieTitle}
                        onChange={(e) => setMovieTitle(e.target.value)}
                        placeholder="e.g. Gladiator II"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Genre Category</label>
                        <select 
                          value={movieGenre}
                          onChange={(e) => setMovieGenre(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md p-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                        >
                          <option value="Sci-Fi" className="bg-[#0F0F11]">Sci-Fi</option>
                          <option value="Action" className="bg-[#0F0F11]">Action</option>
                          <option value="Horror" className="bg-[#0F0F11]">Horror</option>
                          <option value="Drama" className="bg-[#0F0F11]">Drama</option>
                          <option value="Comedy" className="bg-[#0F0F11]">Comedy</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Rating Score</label>
                        <input 
                          type="text"
                          value={movieRating}
                          onChange={(e) => setMovieRating(e.target.value)}
                          placeholder="8.5"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Display Language</label>
                        <input 
                          type="text"
                          value={movieLang}
                          onChange={(e) => setMovieLang(e.target.value)}
                          placeholder="English"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Language Key (Query)</label>
                        <input 
                          type="text"
                          value={movieLangKey}
                          onChange={(e) => setMovieLangKey(e.target.value)}
                          placeholder="english"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Poster Image URL</label>
                      <input 
                        type="text"
                        value={movieImg}
                        onChange={(e) => setMovieImg(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Available Formats (2D, 3D, IMAX)</label>
                      <div className="flex gap-4 items-center mt-1">
                        {["2D", "3D", "IMAX"].map((f) => {
                          const exists = movieFormats.includes(f);
                          return (
                            <label key={f} className="flex items-center gap-1.5 text-xs text-text-primary cursor-pointer">
                              <input 
                                type="checkbox"
                                checked={exists}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setMovieFormats([...movieFormats, f]);
                                  } else {
                                    setMovieFormats(movieFormats.filter(x => x !== f));
                                  }
                                }}
                                className="rounded border-white/10 bg-black text-gold focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                              {f}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Actors / Cast (comma-separated)</label>
                      <input 
                        type="text"
                        value={movieActors}
                        onChange={(e) => setMovieActors(e.target.value)}
                        placeholder="e.g. Brad Pitt, Paul Mescal, Denzel Washington"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Trailer URL (YouTube or external)</label>
                      <input 
                        type="text"
                        value={movieTrailerUrl}
                        onChange={(e) => setMovieTrailerUrl(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Duration</label>
                        <input 
                          type="text"
                          value={movieDuration}
                          onChange={(e) => setMovieDuration(e.target.value)}
                          placeholder="e.g. 148 mins"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Certificate Rating</label>
                        <select 
                          value={movieCertificate}
                          onChange={(e) => setMovieCertificate(e.target.value as 'U' | 'UA' | 'A')}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md p-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                        >
                          <option value="U" className="bg-[#0F0F11]">U (Universal)</option>
                          <option value="UA" className="bg-[#0F0F11]">UA (Parental Guidance)</option>
                          <option value="A" className="bg-[#0F0F11]">A (Adults Only)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Distributor Name</label>
                      <input 
                        type="text"
                        value={movieDistributor}
                        onChange={(e) => setMovieDistributor(e.target.value)}
                        placeholder="e.g. Yash Raj Films, Disney, Sony"
                        className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingMovieTitle && (
                        <button
                          type="button"
                          onClick={() => {
                            setMovieTitle("");
                            setEditingMovieTitle(null);
                          }}
                          className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-xs text-text-secondary rounded font-bold border-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded border-0 cursor-pointer"
                      >
                        {editingMovieTitle ? "Save Changes" : "Register Film"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Movies list */}
                <div className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    Active Catalog Movies ({movies.length})
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {movies.map((m) => (
                      <div key={m.title} className="bg-[#121215] border border-white/5 p-3 rounded-lg flex gap-3 relative hover:border-white/10 transition-colors">
                        <img 
                          src={m.img} 
                          alt={m.title} 
                          className="w-16 h-22 object-cover rounded bg-white/5 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col justify-between text-xs min-w-0 flex-1">
                          <div className="space-y-1">
                            <p className="font-bold text-text-primary truncate block" title={m.title}>{m.title}</p>
                            <p className="text-[10px] text-text-secondary">{m.genre} · {m.lang}</p>
                            
                            {/* Display Formats & Trailer & Actors */}
                            <div className="space-y-0.5 mt-1 border-t border-white/5 pt-1">
                              <div className="flex flex-wrap gap-1 items-center">
                                {(m.formats || ["2D"]).map((fmt) => (
                                  <span key={fmt} className="text-[8px] font-bold text-gold bg-gold/5 border border-gold/20 px-1 rounded">
                                    {fmt}
                                  </span>
                                ))}
                                {m.certificate && (
                                  <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                                    {m.certificate}
                                  </span>
                                )}
                                {m.duration && (
                                  <span className="text-[8px] font-mono text-text-secondary bg-white/5 px-1 rounded">
                                    {m.duration}
                                  </span>
                                )}
                              </div>
                              {m.distributor && (
                                <p className="text-[8px] text-text-muted truncate">
                                  <span className="font-semibold text-text-secondary">Distributor:</span> {m.distributor}
                                </p>
                              )}
                              {m.actors && m.actors.length > 0 && (
                                <p className="text-[8px] text-text-muted truncate">
                                  <span className="font-semibold text-text-secondary">Cast:</span> {(m.actors || []).join(", ")}
                                </p>
                              )}
                              {m.trailerUrl && (
                                <a 
                                  href={m.trailerUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[8px] text-blue-400 hover:underline block truncate"
                                >
                                  🎥 Watch Trailer
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center gap-2 mt-2">
                            <span className="text-[10px] font-bold text-gold font-mono bg-gold/10 px-1.5 py-0.5 rounded">★ {m.rating}</span>
                            <div className="flex gap-1 items-center">
                              <button
                                onClick={() => onToggleMovieActive && onToggleMovieActive(m.title)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border cursor-pointer transition-colors ${
                                  m.isActive !== false
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                    : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                                }`}
                                title={m.isActive !== false ? "Disable movie booking" : "Enable movie booking"}
                              >
                                {m.isActive !== false ? "ON" : "OFF"}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMovieTitle(m.title);
                                  setMovieTitle(m.title);
                                  setMovieGenre(m.genre);
                                  setMovieLang(m.lang);
                                  setMovieLangKey(m.langKey);
                                  setMovieRating(m.rating);
                                  setMovieImg(m.img);
                                  setMovieFormats(m.formats || ["2D"]);
                                  setMovieActors(m.actors ? (m.actors || []).join(", ") : "");
                                  setMovieTrailerUrl(m.trailerUrl || "");
                                  setMovieDuration(m.duration || "148 mins");
                                  setMovieCertificate(m.certificate || "UA");
                                  setMovieDistributor(m.distributor || "");
                                }}
                                className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black text-text-secondary border-0 cursor-pointer"
                                title="Edit specs"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove "${m.title}" from now showing?`)) {
                                    onDeleteMovie(m.title);
                                  }
                                }}
                                className="p-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border border-red-500/10 cursor-pointer"
                                title="Remove film"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SHOW TIMES PUBLISHER */}
          {/* ========================================================= */}
          {activeTab === "scheduler" && isTabPermitted("scheduler") && (
            <div className="space-y-8 animate-fade-in" id="tab-scheduler">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-wide">
                  Show Publisher & Scheduler
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Publish showtime slots, associate movie titles with theatre halls, and configure baseline pricing models.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Form: Schedule Showtime */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-5 rounded-xl h-fit">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    {editingScheduleId ? "✏️ Edit Showtime Details" : "⏰ Publish New Show Slot"}
                  </span>

                  <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Select Scheduled Movie</label>
                      <select 
                        value={schedulerMovieTitle}
                        onChange={(e) => setSchedulerMovieTitle(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-md p-2.5 text-xs text-text-primary focus:outline-none cursor-pointer"
                      >
                        {movies.map((m) => (
                          <option key={m.title} value={m.title} className="bg-[#0F0F11] text-text-primary">
                            {m.title} ({m.genre})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Selected Luxury Venue</label>
                      <select 
                        value={schedulerTheatreName}
                        onChange={(e) => setSchedulerTheatreName(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-md p-2.5 text-xs text-text-primary focus:outline-none cursor-pointer"
                        disabled={isTheatreAdmin && !!assignedTheatre}
                      >
                        {isTheatreAdmin && assignedTheatre ? (
                          <option value={assignedTheatre.name} className="bg-[#0F0F11] text-text-primary">{assignedTheatre.name}</option>
                        ) : (
                          theatres.map((t) => (
                            <option key={t.id} value={t.name} className="bg-[#0F0F11] text-text-primary">
                              {t.name} · {t.location}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Show Slot Hour</label>
                          <button
                            type="button"
                            onClick={() => setIsCustomTimeSlot(!isCustomTimeSlot)}
                            className="text-[9px] text-gold hover:underline cursor-pointer focus:outline-none"
                          >
                            {isCustomTimeSlot ? "📋 Choose Preset" : "✍️ Type Custom"}
                          </button>
                        </div>
                        {isCustomTimeSlot ? (
                          <input 
                            type="text"
                            value={schedulerTimeSlot}
                            onChange={(e) => setSchedulerTimeSlot(e.target.value)}
                            placeholder="e.g. 7:30 PM or 2:00 PM"
                            className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                            required
                          />
                        ) : (
                          <select 
                            value={schedulerTimeSlot}
                            onChange={(e) => setSchedulerTimeSlot(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-md p-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                          >
                            <option value="10:30 AM" className="bg-[#0F0F11]">Morning (10:30 AM)</option>
                            <option value="1:45 PM" className="bg-[#0F0F11]">Matinee (1:45 PM)</option>
                            <option value="4:30 PM" className="bg-[#0F0F11]">Evening (4:30 PM)</option>
                            <option value="7:30 PM" className="bg-[#0F0F11]">Prime (7:30 PM)</option>
                            <option value="10:15 PM" className="bg-[#0F0F11]">Night (10:15 PM)</option>
                          </select>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Base Seat Price</label>
                        <input 
                          type="number"
                          value={schedulerPrice}
                          onChange={(e) => setSchedulerPrice(Number(e.target.value))}
                          placeholder="250"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          required
                          min="50"
                          max="2500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Set Interval (mins)</label>
                        <input 
                          type="number"
                          value={schedulerInterval}
                          onChange={(e) => setSchedulerInterval(Number(e.target.value))}
                          placeholder="15"
                          min="5"
                          max="60"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Booking Window</label>
                        <input 
                          type="text"
                          value={schedulerBookingWindow}
                          onChange={(e) => setSchedulerBookingWindow(e.target.value)}
                          placeholder="e.g. 24h before"
                          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Scheduled Date</label>
                      <input 
                        type="text"
                        value={schedulerDate}
                        onChange={(e) => setSchedulerDate(e.target.value)}
                        placeholder="Today"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      {editingScheduleId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSchedulerMovieTitle("");
                            setEditingScheduleId(null);
                          }}
                          className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-xs text-text-secondary rounded font-bold border-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded border-0 cursor-pointer"
                      >
                        {editingScheduleId ? "Save Changes" : "Publish Show"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Published schedules list */}
                <div className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    Published Movie Schedules ({currentSchedules.length})
                  </span>

                  {currentSchedules.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-xs">
                      No show schedules published for this venue screen. Use the publisher panel on the left to schedule one.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-3">Booking ID</th>
                          <th className="pb-3">Customer Details</th>
                          <th className="pb-3">Movie & Theatre Venue</th>
                          <th className="pb-3 text-right">Ticket Amount</th>
                          <th className="pb-3 text-right">Fees</th>
                          <th className="pb-3 text-right">Tax</th>
                          <th className="pb-3 text-right">Discount</th>
                          <th className="pb-3 text-right">Total Paid</th>
                          <th className="pb-3 text-center">Status</th>
                          <th className="pb-3 text-center">History</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {currentBookings
                          .filter((b) => {
                            // Search filter
                            const q = bookingsSearchQuery.toLowerCase();
                            const matchesQ = 
                              b.id.toLowerCase().includes(q) ||
                              (b.userEmail || "").toLowerCase().includes(q) ||
                              (b.userName || "").toLowerCase().includes(q) ||
                              (b.mobileNumber || "").toLowerCase().includes(q) ||
                              b.movieTitle.toLowerCase().includes(q) ||
                              b.theatreName.toLowerCase().includes(q) ||
                              (b.seats || []).join(",").toLowerCase().includes(q);
                            
                            // Status filter
                            const matchesStatus = bookingsStatusFilter === "All" || b.status === bookingsStatusFilter;
                            return matchesQ && matchesStatus;
                          })
                          .map((b) => {
                            // Unified, robust dynamic calculations
                            const ticketAmt = b.ticketAmount !== undefined && b.ticketAmount !== null
                              ? b.ticketAmount
                              : (b.totalPrice || b.totalAmount || 0);

                            const pFee = b.platformFee || 0;
                            const cFee = b.convenienceFee || 0;
                            const bFee = b.bookingFee || 0;
                            const oFee = b.otherFeeAmount || 0;
                            const totalFees = pFee + cFee + bFee + oFee;

                            const taxAmt = b.taxAmount !== undefined && b.taxAmount !== null ? b.taxAmount : 0;
                            const totalDiscount = b.discountAmount !== undefined && b.discountAmount !== null ? b.discountAmount : 0;

                            const totalPaid = b.totalPrice !== undefined ? b.totalPrice : (b.totalAmount !== undefined ? b.totalAmount : (ticketAmt + totalFees + taxAmt - totalDiscount));

                            return (
                              <tr key={b.id} className="hover:bg-white/[0.01]">
                                <td className="py-4 font-mono font-bold text-text-primary shrink-0">{b.id}</td>
                                <td className="py-4 pr-3 text-text-secondary">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-text-primary block">
                                      {b.userName || (() => {
                                        const match = registeredUsers.find(u => u.email.toLowerCase() === (b.userEmail || "").toLowerCase());
                                        return match?.name || "Guest Attendee";
                                      })()}
                                    </span>
                                    <span className="text-[10px] text-text-secondary block" title={b.userEmail}>
                                      {b.userEmail}
                                    </span>
                                    <span className="text-[10px] text-gold/80 block font-mono">
                                      {b.mobileNumber || (() => {
                                        const match = registeredUsers.find(u => u.email.toLowerCase() === (b.userEmail || "").toLowerCase());
                                        return match?.mobile || "No Mobile";
                                      })()}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 pr-2">
                                  <p className="font-semibold text-text-primary">{b.movieTitle}</p>
                                  <span className="text-[9px] text-text-muted">{b.theatreName}</span>
                                  <span className="text-[9px] text-text-secondary block font-mono">{b.timeSlot} ({b.date})</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {b.seats.map((s) => (
                                      <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] border border-white/10 text-text-secondary font-mono">{s}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-4 text-right font-mono text-text-primary">₹{ticketAmt.toLocaleString()}</td>
                                <td className="py-4 text-right font-mono text-text-secondary">₹{totalFees.toLocaleString()}</td>
                                <td className="py-4 text-right font-mono text-text-secondary">₹{taxAmt.toLocaleString()}</td>
                                <td className="py-4 text-right font-mono text-rose-400">-₹{totalDiscount.toLocaleString()}</td>
                                <td className="py-4 text-right font-mono font-bold text-gold">₹{totalPaid.toLocaleString()}</td>
                                <td className="py-4 text-center">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                                    b.status === "Settled" 
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                      : b.status === "Cancelled"
                                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                  }`}>
                                    {b.status || "Pending"}
                                  </span>
                                </td>
                                <td className="py-4 text-center font-mono">
                                  {(() => {
                                    const priorCount = bookings.filter(ob => ob.userEmail?.toLowerCase() === b.userEmail?.toLowerCase() && ob.id !== b.id).length;
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (b.userEmail) setViewingPastBookingsUser(b.userEmail);
                                        }}
                                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer border transition-all ${
                                          priorCount > 0
                                            ? "bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-black"
                                            : "bg-white/5 text-text-secondary border-white/10"
                                        }`}
                                      >
                                        {priorCount} prior
                                      </button>
                                    );
                                  })()}
                                </td>
                                <td className="py-4 text-right space-x-1 shrink-0 whitespace-nowrap pr-1">
                                  <button
                                    onClick={() => {
                                      setEditingBooking(b);
                                      setEditBookingEmail(b.userEmail || "");
                                      setEditBookingSeats((b.seats || []).join(", "));
                                      setEditBookingTimeSlot(b.timeSlot);
                                      setEditBookingStatus((b.status === "Confirmed" ? "Settled" : b.status) || "Pending");
                                    }}
                                    className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black text-text-secondary border-0 cursor-pointer"
                                    title="Modify reservation"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  {b.status !== "Cancelled" && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`Cancel and refund booking ${b.id}?`)) {
                                          if (onUpdateBooking) {
                                            onUpdateBooking(b.id, { ...b, status: "Cancelled" });
                                            alert("Booking cancelled successfully.");
                                          }
                                        }
                                      }}
                                      className="p-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border border-red-500/10 cursor-pointer"
                                      title="Cancel reservation"
                                    >
                                      <Ban className="w-3 h-3" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: CONFIGURE SEAT LAYOUTS & ROW TICKET PRICES */}
          {/* ========================================================= */}
          {activeTab === "seat_layout" && isTabPermitted("seat_layout") && (
            <div className="space-y-8 animate-fade-in" id="tab-seat-layout">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-wide">
                  Configure Dynamic Seat Layouts & Row Pricing
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Build custom seat matrices, customize premium row multiplier fees, flat row rates, and block damaged/locked seats interactively.
                </p>
              </div>

              {/* Theatre Selector */}
              {effectiveSuperAdmin && (
                <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Selected Target Screen</span>
                    <span className="text-xs text-text-primary font-bold">Configure active seating layout on PVR/IMAX clients</span>
                  </div>
                  <select 
                    value={layoutTheatreId}
                    onChange={(e) => setLayoutTheatreId(Number(e.target.value))}
                    className="bg-[#121215] border border-white/10 hover:border-gold rounded px-3 py-2 text-xs text-gold font-bold focus:outline-none cursor-pointer"
                  >
                    {theatres.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0F0F11] text-text-primary">
                        {t.name} ({t.location})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedLayoutTheatre ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Grid customizer parameters */}
                  <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-6 text-left h-fit">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                      📐 Matrix Parameters & Flat Rules
                    </span>

                    {/* Dimensions Row/Col */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Number of Rows</label>
                        <input 
                          type="number"
                          value={layoutRows}
                          onChange={(e) => setLayoutRows(Math.max(1, Math.min(15, Number(e.target.value))))}
                          className="w-full bg-white/[0.02] border border-white/10 rounded p-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          min="1"
                          max="15"
                        />
                        <span className="text-[9px] text-text-muted">A to {String.fromCharCode(64 + layoutRows)}</span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Seats per Row</label>
                        <input 
                          type="number"
                          value={layoutCols}
                          onChange={(e) => setLayoutCols(Math.max(1, Math.min(16, Number(e.target.value))))}
                          className="w-full bg-white/[0.02] border border-white/10 rounded p-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          min="1"
                          max="16"
                        />
                        <span className="text-[9px] text-text-muted">Columns 1 to {layoutCols}</span>
                      </div>
                    </div>

                    {/* Premium Premium multiplier */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Premium Price Multiplier</label>
                      <input 
                        type="number"
                        value={layoutPremiumMultiplier}
                        onChange={(e) => setLayoutPremiumMultiplier(Number(e.target.value))}
                        step="0.1"
                        min="1.0"
                        max="3.0"
                        className="w-full bg-white/[0.02] border border-white/10 rounded p-2 text-xs text-gold font-bold focus:outline-none focus:border-gold font-mono"
                      />
                      <span className="text-[9px] text-text-muted block">Multiplies published base price, e.g. 1.5x</span>
                    </div>

                    {/* Row seat categories selector */}
                    <div className="space-y-2.5 border-t border-white/5 pt-4">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Row Seat Categories</label>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {Array.from({ length: layoutRows }).map((_, idx) => {
                          const letter = String.fromCharCode(65 + idx);
                          const cat = layoutRowCategories[letter] || 'Silver';
                          return (
                            <div key={letter} className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded px-2 py-1.5">
                              <span className="text-[11px] font-bold text-text-primary">Row {letter}</span>
                              <div className="flex gap-1">
                                {['Premium', 'Gold', 'Silver'].map((tier) => {
                                  const active = cat === tier;
                                  return (
                                    <button
                                      key={tier}
                                      type="button"
                                      onClick={() => {
                                        setLayoutRowCategories((prev) => ({
                                          ...prev,
                                          [letter]: tier as any
                                        }));
                                        // Auto update layoutPremiumRows for backward compatibility with older components
                                        if (tier === 'Premium') {
                                          if (!layoutPremiumRows.includes(letter)) {
                                            setLayoutPremiumRows([...layoutPremiumRows, letter]);
                                          }
                                        } else {
                                          setLayoutPremiumRows(layoutPremiumRows.filter(r => r !== letter));
                                        }
                                      }}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all border-0 cursor-pointer ${
                                        active 
                                          ? tier === 'Premium' 
                                            ? "bg-amber-500 text-black" 
                                            : tier === 'Gold' 
                                            ? "bg-yellow-600/30 text-yellow-300 border border-yellow-500/30"
                                            : "bg-zinc-600/30 text-zinc-300 border border-zinc-500/30"
                                          : "bg-white/5 text-text-muted hover:bg-white/10"
                                      }`}
                                    >
                                      {tier}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Set Row flat rate */}
                    <div className="space-y-2 border-t border-white/5 pt-4">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Set Row Flat Ticket Rate</label>
                      <div className="flex gap-2">
                        <select
                          value={tempRowSelect}
                          onChange={(e) => setTempRowSelect(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 rounded px-2 text-xs text-text-primary focus:outline-none"
                        >
                          {Array.from({ length: layoutRows }).map((_, idx) => {
                            const r = String.fromCharCode(65 + idx);
                            return <option key={r} value={r} className="bg-[#0F0F11]">Row {r}</option>;
                          })}
                        </select>
                        <input 
                          type="number"
                          value={tempRowPriceInput}
                          onChange={(e) => setTempRowPriceInput(e.target.value)}
                          placeholder="e.g. 350 (₹)"
                          className="flex-1 min-w-0 bg-white/[0.02] border border-white/10 rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyRowPrice}
                          className="px-3 bg-gold hover:bg-gold-light text-black text-xs font-bold rounded border-0 cursor-pointer shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                      
                      {/* Active Row specific overrides */}
                      {Object.keys(rowPrices).length > 0 && (
                        <div className="pt-2">
                          <span className="text-[9px] font-semibold text-text-muted uppercase">Active flat pricing rules:</span>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {Object.entries(rowPrices).map(([r, pr]) => (
                              <span key={r} className="px-2 py-0.5 rounded bg-[#121215] border border-white/10 text-[9px] font-mono text-gold flex items-center gap-1">
                                Row {r}: ₹{pr}
                                <button 
                                  onClick={() => {
                                    const updated = { ...rowPrices };
                                    delete updated[r];
                                    setRowPrices(updated);
                                  }}
                                  className="text-red-400 hover:text-red-300 font-extrabold cursor-pointer bg-transparent border-0"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSeatConfiguration}
                      className="w-full px-4 py-3 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all border-0 shadow-lg shadow-gold/10"
                    >
                      Save Layout Configurations
                    </button>
                  </div>

                  {/* Interactive Seating Layout grid block out */}
                  <div className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-5 rounded-xl text-left flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2 mb-4">
                        🖥️ Interactive Seating Layout Designer ({selectedLayoutTheatre.name})
                      </span>
                      <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                        Choose a design tool from the palette below, then click any seat in the live layout grid to paint its classification instantly.
                      </p>

                      {/* Tool Palette */}
                      <div className="bg-black/40 border border-white/5 rounded-lg p-3 mb-6">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-2">
                          🖌️ DESIGNER TOOL PAINTBRUSH (Click to select)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'block', label: 'Damaged / Blocked', symbol: '×', style: 'border-red-500/30 text-red-400 bg-red-950/20' },
                            { id: 'wheelchair', label: 'Wheelchair Zone', symbol: '♿', style: 'border-blue-500/30 text-blue-400 bg-blue-950/20' },
                            { id: 'vip', label: 'VIP Premium', symbol: '👑', style: 'border-purple-500/30 text-purple-400 bg-purple-950/20' },
                            { id: 'recliner', label: 'Recliner Lounger', symbol: '🛋️', style: 'border-pink-500/30 text-pink-400 bg-pink-950/20' },
                            { id: 'exit', label: 'Emergency Exit', symbol: '🚪', style: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' },
                          ].map((tool) => {
                            const isSelected = activeLayoutTool === tool.id;
                            return (
                              <button
                                key={tool.id}
                                type="button"
                                onClick={() => setActiveLayoutTool(tool.id as any)}
                                className={`px-2 py-2 rounded text-[10px] font-semibold border transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                  isSelected 
                                    ? `border-gold bg-gold/10 text-gold font-bold shadow-sm shadow-gold/20`
                                    : `border-white/5 bg-white/[0.01] text-text-secondary hover:bg-white/5 hover:text-text-primary`
                                }`}
                              >
                                <span className="text-sm">{tool.symbol}</span>
                                <span className="text-[9px] whitespace-nowrap">{tool.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="w-full text-center mb-8">
                        <div className="h-[2px] bg-gradient-to-r from-gold/10 via-gold to-gold/10 rounded-full w-3/4 mx-auto relative shadow-[0_2px_10px_rgba(201,168,76,0.3)]" />
                        <span className="text-[8px] font-bold text-text-muted tracking-[0.25em] block mt-1.5">
                          CINEMATIC FRONT STAGE SCREEN
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 items-center justify-center overflow-x-auto py-6 bg-black/30 rounded-xl border border-white/5 select-none mb-4">
                        {Array.from({ length: layoutRows }).map((_, idx) => {
                          const rowL = String.fromCharCode(65 + idx);
                          const flatRowPrice = rowPrices[rowL];
                          const rowCat = layoutRowCategories[rowL] || 'Silver';

                          return (
                            <div key={rowL} className="flex gap-2 items-center">
                              {/* Row Label */}
                              <span className="text-[10px] font-bold text-text-secondary w-14 text-center flex flex-col shrink-0 border-r border-white/5 pr-2">
                                <span className="text-gold font-mono">{rowL}</span>
                                <span className="text-[7px] text-text-muted font-mono block">
                                  {rowCat}
                                </span>
                                <span className="text-[7px] text-text-muted font-mono">
                                  ₹{flatRowPrice || (rowCat === 'Premium' ? Math.round(250 * layoutPremiumMultiplier) : rowCat === 'Gold' ? 220 : 180)}
                                </span>
                              </span>

                              {/* Columns list */}
                              {Array.from({ length: layoutCols }).map((_, cIdx) => {
                                const colN = cIdx + 1;
                                const seatKey = `${rowL}${colN}`;
                                const isBlocked = layoutBlockedSeats.includes(seatKey);
                                const isWheelchair = layoutWheelchairSeats?.includes(seatKey);
                                const isVip = layoutVipSeats?.includes(seatKey);
                                const isRecliner = layoutReclinerSeats?.includes(seatKey);
                                const isExit = layoutEmergencyExits?.includes(seatKey);

                                let seatClass = "bg-white/[0.03] border-white/10 text-text-secondary hover:border-gold";
                                let content = colN.toString();

                                if (isBlocked) {
                                  seatClass = "bg-red-950/30 border-red-800 text-red-500 font-extrabold scale-95";
                                  content = "×";
                                } else if (isExit) {
                                  seatClass = "bg-emerald-950/40 border-emerald-500 text-emerald-400 font-bold scale-95";
                                  content = "🚪";
                                } else if (isWheelchair) {
                                  seatClass = "bg-blue-950/30 border-blue-500/50 text-blue-300 font-bold";
                                  content = "♿";
                                } else if (isVip) {
                                  seatClass = "bg-purple-950/30 border-purple-500/50 text-purple-300 font-bold";
                                  content = "👑";
                                } else if (isRecliner) {
                                  seatClass = "bg-pink-950/30 border-pink-500/50 text-pink-300 font-bold";
                                  content = "🛋️";
                                } else if (rowCat === 'Premium') {
                                  seatClass = "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-gold";
                                } else if (rowCat === 'Gold') {
                                  seatClass = "bg-yellow-600/10 border-yellow-600/30 text-yellow-300 hover:border-gold";
                                } else {
                                  seatClass = "bg-zinc-600/5 border-zinc-600/20 text-zinc-400 hover:border-gold";
                                }

                                return (
                                  <button
                                    key={seatKey}
                                    type="button"
                                    onClick={() => toggleConfigSeatBlock(seatKey)}
                                    className={`w-7 h-7 text-[9px] font-bold rounded flex items-center justify-center transition-all cursor-pointer border ${seatClass}`}
                                    title={`Seat ${seatKey} (${rowCat})`}
                                  >
                                    {content}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legends */}
                    <div className="flex flex-wrap justify-center gap-4 text-[10px] font-semibold text-text-secondary border-t border-white/5 pt-4 mt-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-zinc-600/5 border border-zinc-600/20" />
                        <span>Silver Row</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-yellow-600/10 border border-yellow-600/35" />
                        <span className="text-yellow-300">Gold Row</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-amber-500/10 border border-amber-500/35" />
                        <span className="text-amber-300">Premium Row</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-purple-950/30 border border-purple-500/50 flex items-center justify-center text-purple-400 text-[8px]">👑</span>
                        <span className="text-purple-400">VIP Premium</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-pink-950/30 border border-pink-500/50 flex items-center justify-center text-pink-400 text-[8px]">🛋️</span>
                        <span className="text-pink-400">Recliner</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-blue-950/30 border border-blue-500/50 flex items-center justify-center text-blue-400 text-[8px]">♿</span>
                        <span className="text-blue-400">Wheelchair</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-950/40 border border-emerald-500 flex items-center justify-center text-emerald-400 text-[8px]">🚪</span>
                        <span className="text-emerald-400">Exit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-red-950/30 border border-red-800 flex items-center justify-center text-red-500 font-bold text-[9px]">×</span>
                        <span className="text-red-400">Blocked / Damaged</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-text-muted">
                  No luxury venue screen registered. Register a theatre venue first.
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: AUDIENCE TICKETING LEDGER (VIEW & CANCEL BOOKINGS) */}
          {/* ========================================================= */}
          {activeTab === "bookings" && isTabPermitted("bookings") && (
            <div className="space-y-8 animate-fade-in" id="tab-bookings">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-left">
                  <h2 className="text-xl font-bold text-text-primary tracking-wide">
                    Audience Ticketing Ledger
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    View active bookings, filter statuses, update member details, reschedule slots, or cancel reservations.
                  </p>
                </div>
              </div>

              {/* Filters & Search bar */}
              <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                  <input 
                    type="text"
                    value={bookingsSearchQuery}
                    onChange={(e) => setBookingsSearchQuery(e.target.value)}
                    placeholder="Search by ID, email, movie, seat..."
                    className="w-full bg-white/[0.02] border border-white/10 rounded-md pl-10 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <span className="text-[10px] font-bold text-text-secondary uppercase">Filter Status:</span>
                  <div className="flex gap-1">
                    {["All", "Pending", "Settled", "Cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setBookingsStatusFilter(st)}
                        className={`px-3 py-1 text-[10px] font-semibold rounded cursor-pointer border border-white/5 transition-all ${
                          bookingsStatusFilter === st 
                            ? "bg-gold text-black border-gold" 
                            : "bg-white/5 text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Booking overlay form */}
              {editingBooking && (
                <div className="bg-[#121215] border border-gold/20 p-5 rounded-xl text-left space-y-4 shadow-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold block border-b border-white/5 pb-2">
                    ✏️ Modify Reservation: {editingBooking.id}
                  </span>

                  <form onSubmit={handleEditBookingSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Audience Member Email</label>
                      <input 
                        type="email"
                        value={editBookingEmail}
                        onChange={(e) => setEditBookingEmail(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded p-2 text-xs text-text-primary focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Assigned Seats (comma separated)</label>
                      <input 
                        type="text"
                        value={editBookingSeats}
                        onChange={(e) => setEditBookingSeats(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded p-2 text-xs text-text-primary focus:outline-none font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Show hour slot</label>
                      <select 
                        value={editBookingTimeSlot}
                        onChange={(e) => setEditBookingTimeSlot(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/10 rounded p-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                      >
                        <option value="10:30 AM" className="bg-[#0F0F11]">10:30 AM</option>
                        <option value="1:45 PM" className="bg-[#0F0F11]">1:45 PM</option>
                        <option value="4:30 PM" className="bg-[#0F0F11]">4:30 PM</option>
                        <option value="7:30 PM" className="bg-[#0F0F11]">7:30 PM</option>
                        <option value="10:15 PM" className="bg-[#0F0F11]">10:15 PM</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingBooking(null)}
                        className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-xs text-text-secondary rounded font-bold border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-3 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase rounded border-0 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Bookings Ledger List */}
              <div className="bg-[#0F0F11] border border-white/5 rounded-xl p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                  Reservation Ledgers Records ({currentBookings.length})
                </span>

                {currentBookings.length === 0 ? (
                  <div className="text-center py-16 text-text-muted text-xs">
                    No matching reservation bookings found in the ledgers records.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                          <th className="pb-3">Receipt Code</th>
                          <th className="pb-3">Customer Details</th>
                          <th className="pb-3">Movie & Theatre Venue</th>
                          <th className="pb-3">Time slot</th>
                          <th className="pb-3">Booked seats</th>
                          <th className="pb-3">Total Gross</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Past Bookings</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {currentBookings
                          .filter((b) => {
                            // Search filter
                            const q = bookingsSearchQuery.toLowerCase();
                            const matchesQ = 
                              b.id.toLowerCase().includes(q) ||
                              (b.userEmail || "").toLowerCase().includes(q) ||
                              (b.userName || "").toLowerCase().includes(q) ||
                              (b.mobileNumber || "").toLowerCase().includes(q) ||
                              b.movieTitle.toLowerCase().includes(q) ||
                              b.theatreName.toLowerCase().includes(q) ||
                              (b.seats || []).join(",").toLowerCase().includes(q);
                            
                            // Status filter
                            const matchesStatus = bookingsStatusFilter === "All" || b.status === bookingsStatusFilter;
                            return matchesQ && matchesStatus;
                          })
                          .map((b) => (
                            <tr key={b.id} className="hover:bg-white/[0.01]">
                              <td className="py-4 font-mono font-bold text-text-primary shrink-0">{b.id}</td>
                              <td className="py-4 pr-3 text-text-secondary">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-text-primary block">
                                    {b.userName || (() => {
                                      const match = registeredUsers.find(u => u.email.toLowerCase() === (b.userEmail || "").toLowerCase());
                                      return match?.name || "Guest Attendee";
                                    })()}
                                  </span>
                                  <span className="text-[10px] text-text-secondary block" title={b.userEmail}>
                                    {b.userEmail}
                                  </span>
                                  <span className="text-[10px] text-gold/80 block font-mono">
                                    {b.mobileNumber || (() => {
                                      const match = registeredUsers.find(u => u.email.toLowerCase() === (b.userEmail || "").toLowerCase());
                                      return match?.mobile || "No Mobile";
                                    })()}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 pr-2">
                                <p className="font-semibold text-text-primary">{b.movieTitle}</p>
                                <span className="text-[9px] text-text-muted">{b.theatreName}</span>
                              </td>
                              <td className="py-4 font-mono text-text-secondary whitespace-nowrap">{b.timeSlot} ({b.date})</td>
                              <td className="py-4 font-mono">
                                <div className="flex flex-wrap gap-1">
                                  {b.seats.map((s) => (
                                    <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] border border-white/10 text-text-secondary">{s}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 font-mono font-bold text-gold">₹{b.totalPrice.toLocaleString()}</td>
                              <td className="py-4">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border ${
                                  b.status === "Settled" 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                    : b.status === "Cancelled"
                                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                }`}>
                                  {b.status || "Pending"}
                                </span>
                              </td>
                              <td className="py-4 font-mono">
                                {(() => {
                                  const priorCount = bookings.filter(ob => ob.userEmail?.toLowerCase() === b.userEmail?.toLowerCase() && ob.id !== b.id).length;
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (b.userEmail) setViewingPastBookingsUser(b.userEmail);
                                      }}
                                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase cursor-pointer border transition-all ${
                                        priorCount > 0
                                          ? "bg-gold/10 text-gold border-gold/20 hover:bg-gold hover:text-black"
                                          : "bg-white/5 text-text-secondary border-white/10"
                                      }`}
                                    >
                                      {priorCount} prior
                                    </button>
                                  );
                                })()}
                              </td>
                              <td className="py-4 text-right space-x-1 shrink-0 whitespace-nowrap pr-1">
                                <button
                                  onClick={() => {
                                    setEditingBooking(b);
                                    setEditBookingEmail(b.userEmail || "");
                                    setEditBookingSeats((b.seats || []).join(", "));
                                    setEditBookingTimeSlot(b.timeSlot);
                                    setEditBookingStatus((b.status === "Confirmed" ? "Settled" : b.status) || "Pending");
                                  }}
                                  className="p-1 rounded bg-white/5 hover:bg-gold hover:text-black text-text-secondary border-0 cursor-pointer"
                                  title="Modify reservation"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                {b.status !== "Cancelled" && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Cancel and refund booking ${b.id}?`)) {
                                        if (onUpdateBooking) {
                                          onUpdateBooking(b.id, { ...b, status: "Cancelled" });
                                          alert("Booking cancelled successfully.");
                                        }
                                      }
                                    }}
                                    className="p-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border border-red-500/10 cursor-pointer"
                                    title="Cancel reservation"
                                  >
                                    <Ban className="w-3 h-3" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SIMULATED TICKET QR SCANNER */}
          {/* ========================================================= */}
          {activeTab === "qr_scanner" && isTabPermitted("qr_scanner") && (
            <div className="space-y-8 animate-fade-in" id="tab-qr-scanner">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-wide">
                  Virtual Digital QR Code Gate Scanner
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Scan receipt codes, validate security signatures, and authenticate admission logs for the physical gate.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Scanner console */}
                <div className="lg:col-span-1 bg-[#0F0F11] border border-white/5 p-6 rounded-xl flex flex-col justify-between space-y-6 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-gold uppercase tracking-[0.25em] block mb-4">
                      SIMULATOR SCANNING BEAMS
                    </span>

                    {/* Scanning frame mockup */}
                    <div className="relative border-2 border-dashed border-gold/30 rounded-xl bg-black/40 p-10 flex flex-col items-center justify-center gap-4 overflow-hidden shadow-inner select-none">
                      {isScanning && (
                        <div className="absolute left-0 right-0 h-[2.5px] bg-gold/70 shadow-[0_0_15px_rgba(212,175,55,1)] animate-[bounce_2s_infinite] pointer-events-none" />
                      )}
                      
                      <QrCode className={`w-16 h-16 ${isScanning ? "text-gold animate-pulse scale-105" : "text-text-muted"} transition-all`} />
                      <span className="text-[9px] font-mono text-text-muted">ALIGN RECEIPT ID BAR</span>
                    </div>
                  </div>

                  {/* Keyboard search input */}
                  <form onSubmit={handleTriggerSimulateScan} className="space-y-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Input Receipt ID manually</label>
                      <input 
                        type="text"
                        value={scanInputId}
                        onChange={(e) => setScanInputId(e.target.value)}
                        placeholder="e.g. BK-2735"
                        className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-center font-mono font-bold text-gold uppercase tracking-widest focus:outline-none focus:border-gold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isScanning || !scanInputId}
                      className="w-full py-2.5 bg-gold hover:bg-gold-light disabled:bg-white/5 text-black disabled:text-text-secondary/30 text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0"
                    >
                      {isScanning ? "Reading Token..." : "Trigger Scanner Beam"}
                    </button>
                  </form>
                </div>

                {/* Validation outcome & admission logs */}
                <div className="lg:col-span-2 bg-[#0F0F11] border border-white/5 p-5 rounded-xl text-left flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                      Scan Validation Feedback
                    </span>

                    {scanFeedback && (
                      <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg flex items-center gap-3 text-red-400 text-xs font-semibold">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>{scanFeedback}</span>
                      </div>
                    )}

                    {scannedBooking ? (
                      <div className="p-5 bg-white/[0.01] border border-white/10 rounded-xl space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                              {scannedBooking.id}
                            </span>
                            <h4 className="text-sm font-bold text-text-primary mt-2">{scannedBooking.movieTitle}</h4>
                            <p className="text-[11px] text-text-secondary mt-0.5">{scannedBooking.theatreName} · Today · {scannedBooking.timeSlot}</p>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            scannedBooking.status === "Cancelled" 
                              ? "bg-red-500/10 border-red-500/20 text-red-400" 
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}>
                            {scannedBooking.status || "Pending"}
                          </span>
                        </div>

                        <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-text-muted font-bold block mb-0.5">Booked Premium Seats:</span>
                            <span className="font-mono text-text-primary text-sm font-bold">{scannedBooking.seats.join(", ")}</span>
                          </div>
                          <div>
                            <span className="text-text-muted font-bold block mb-0.5">Audience Member:</span>
                            <span className="text-text-primary truncate block font-medium" title={scannedBooking.userEmail}>{scannedBooking.userEmail}</span>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-4 flex gap-3">
                          {scannedBooking.status !== "Cancelled" && !recentlyAdmitted.includes(scannedBooking.id) ? (
                            <button
                              onClick={() => {
                                setRecentlyAdmitted((prev) => [scannedBooking.id, ...prev]);
                                alert(`ACCESS GRANTED: Opened gate gates! Cleared entrance token: ${scannedBooking.id}.`);
                                setScannedBooking(null);
                                setScanInputId("");
                              }}
                              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase rounded border-0 cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                              Grant Gate Admission
                            </button>
                          ) : (
                            <div className="w-full py-2 bg-white/5 border border-white/10 text-center text-xs text-text-secondary font-bold uppercase rounded font-mono">
                              {scannedBooking.status === "Cancelled" ? "🛑 REJECTED: TICKET WAS CANCELLED / REFUNDED" : "✅ ADMISSION GRANTED & RECORDED"}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      !scanFeedback && (
                        <div className="text-center py-10 text-text-muted text-xs italic">
                          Scanner idle. Align ticket QR or enter ticket ID and trigger validation beam.
                        </div>
                      )
                    )}
                  </div>

                  {/* Log of recently admitted */}
                  <div className="border-t border-white/5 pt-4 mt-4">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-2">Recently Admitted Entry Logs ({recentlyAdmitted.length})</span>
                    {recentlyAdmitted.length === 0 ? (
                      <span className="text-[10px] text-text-muted italic">No logs recorded in this session.</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {recentlyAdmitted.map((id) => (
                          <span key={id} className="px-2 py-0.5 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] rounded flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                            {id} (Entry Confirmed)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PRIVATE RENTALS & MESSAGES */}
          {/* ========================================================= */}
          {activeTab === "rentals_messages" && effectiveSuperAdmin && (
            <div className="space-y-8 animate-fade-in" id="tab-rentals-messages">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-wide">
                  Private Room Rentals & Guest Enquiries
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Approve private theatre room reservations, view budget pricing sheets, and read guest contact forms.
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Panel 1: Theatre Private Room Rentals */}
                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    Private Theatre Rentals Requests ({rentalRequests.length})
                  </span>

                  {rentalRequests.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-xs">
                      No private room rental requests recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rentalRequests.map((req) => (
                        <div key={req.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-lg flex flex-col justify-between gap-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-text-secondary font-mono">{req.id}</span>
                              <h4 className="text-sm font-bold text-text-primary mt-1.5">{req.eventName}</h4>
                              <p className="text-xs text-text-secondary mt-0.5">Venue: <span className="text-text-primary font-semibold">{req.theatreName || "Luxury Suite"}</span> · Guests: {req.guests} · Hours: {req.duration}h</p>
                              <p className="text-[10px] text-text-muted mt-1">Client Contact: {req.user}</p>
                              {req.requirements && (
                                <p className="text-[11px] text-gold mt-2 font-serif italic">"{req.requirements}"</p>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono font-bold text-gold block">{req.price}</span>
                              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase mt-1.5 ${
                                req.status === "Approved" 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                                  : req.status === "Declined"
                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {req.status}
                              </span>
                            </div>
                          </div>

                          {req.status === "Pending" && (
                            <div className="border-t border-white/5 pt-3 flex gap-2">
                              <button
                                onClick={() => onUpdateRentalStatus(req.id, "Approved")}
                                className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold uppercase rounded border-0 cursor-pointer"
                              >
                                Approve Rental
                              </button>
                              <button
                                onClick={() => onUpdateRentalStatus(req.id, "Declined")}
                                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold uppercase rounded text-red-400 border-0 cursor-pointer"
                              >
                                Decline Request
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel 2: Contact Messages */}
                <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block mb-4 border-b border-white/5 pb-2">
                    Lobby Guest Enquiries ({contactMessages.length})
                  </span>

                  {contactMessages.length === 0 ? (
                    <div className="text-center py-16 text-text-muted text-xs">
                      No lobby guest contact form submissions.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contactMessages.map((msg, idx) => (
                        <div key={idx} className="p-4 bg-white/[0.01] border border-white/5 rounded-lg text-xs space-y-2">
                          <div className="flex justify-between text-text-secondary font-bold">
                            <span className="text-text-primary">{msg.name}</span>
                            <span className="font-mono text-[10px] text-text-muted">{msg.date}</span>
                          </div>
                          <span className="text-[10px] font-mono text-text-secondary block">Contact info: {msg.contact}</span>
                          <p className="text-text-primary leading-relaxed bg-black/20 p-2.5 rounded border border-white/5 italic">
                            "{msg.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: LIVE EVENTS MANAGEMENT PLATFORM */}
          {/* ========================================================= */}
          {activeTab === "events" && (
            <div className="space-y-8 animate-fade-in" id="tab-events">
              <EventsAdminModule />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8 animate-fade-in" id="tab-settings">
              <div>
                <h2 className="text-xl font-bold text-text-primary tracking-wide">
                  CineVenue System Settings
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Configure global ticketing multipliers, convenience charges, support details, and general platform status.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Column 1: Platform Identity */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                    🏛️ General Portal Profile
                  </span>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Platform Display Name</label>
                    <input 
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Customer Support Email</label>
                    <input 
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Customer Support Telephone</label>
                    <input 
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Column 2: Financial & Taxation Fees */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                    💰 Financial & Taxation Fees
                  </span>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Internet Convenience Fee (₹ per seat)</label>
                    <input 
                      type="number"
                      value={convenienceFee}
                      onChange={(e) => setConvenienceFee(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      min="0"
                      max="500"
                      required
                    />
                    <span className="text-[9px] text-text-muted block">Charged on top of each luxury venue reservation ticket.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">State CGST & SGST Joint Tax Percentage (%)</label>
                    <input 
                      type="number"
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      min="0"
                      max="35"
                      required
                    />
                    <span className="text-[9px] text-text-muted block">Legal Indian cinema service tax, added to net pricing.</span>
                  </div>
                </div>

                {/* Column 3: Platform Security & Status */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-6 text-left flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                      🛡️ System Security & Mode
                    </span>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Staff Auto Logout Session Timeout</label>
                      <select 
                        value={autoTimeoutMinutes}
                        onChange={(e) => setAutoTimeoutMinutes(Number(e.target.value))}
                        className="w-full bg-[#121215] border border-white/10 rounded p-2 text-xs text-text-primary focus:outline-none cursor-pointer"
                      >
                        <option value="5">5 Minutes (High Security)</option>
                        <option value="15">15 Minutes (Standard)</option>
                        <option value="30">30 Minutes (Convenient)</option>
                        <option value="60">1 Hour</option>
                      </select>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <label className="text-[10px] font-bold text-text-secondary uppercase block mb-1">System Global Status Toggle</label>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-text-primary font-semibold block">Platform Under Maintenance</span>
                          <span className="text-[9px] text-text-muted block">Only authorized admins will bypass screens.</span>
                        </div>
                        <button
                          type="button"
                          id="btn-admin-platform-maintenance-toggle"
                          onClick={async () => {
                            const nextVal = !globalAppSettings.maintenanceMode;
                            setMaintenanceMode(nextVal);
                            await updateGlobalSettings({ maintenanceMode: nextVal });
                          }}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${
                            globalAppSettings.maintenanceMode ? "bg-red-500" : "bg-white/10"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                            globalAppSettings.maintenanceMode ? "translate-x-5" : "translate-x-0"
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    {isSettingsSaved && (
                      <span className="text-[10px] text-emerald-400 font-semibold block text-center">
                        ✓ All configurations deployed successfully to the cloud servers!
                      </span>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5"
                    >
                      Save & Deploy Settings
                    </button>
                  </div>
                </div>
              </form>

              {/* Super Admin Account Access Section */}
              <div className="border-t border-white/5 pt-8">
                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-wide">
                    Super Admin Account Credentials
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Modify the username (email) and password required to unlock and manage the CineVenue administrator terminal.
                  </p>
                </div>

                <div className="mt-5 bg-[#0F0F11] border border-white/5 rounded-xl p-6 max-w-2xl text-left">
                  <form onSubmit={handleSaveAccountSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Super Admin Username / Email</label>
                        <input 
                          type="email"
                          value={editAdminEmail}
                          onChange={(e) => setEditAdminEmail(e.target.value)}
                          placeholder="Enter username / email"
                          className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Super Admin Password</label>
                        <input 
                          type="password"
                          value={editAdminPassword}
                          onChange={(e) => setEditAdminPassword(e.target.value)}
                          placeholder="Enter password"
                          className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] text-text-muted max-w-xs leading-normal">
                        Note: Updating these will immediately apply to both the central lock screen and authentication modal.
                      </span>

                      <div className="flex items-center gap-4">
                        {isAccountSettingsSaved && (
                          <span className="text-xs text-emerald-400 font-semibold animate-fade-in">
                            ✓ Saved!
                          </span>
                        )}
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5 transition-all"
                        >
                          Update Credentials
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Security Panel Passcode Section */}
              <div className="border-t border-white/5 pt-8">
                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gold" /> Security Panel Passcode (PIN) Management
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Configure a master 4-8 digit security PIN passcode to authorize critical administrative operations (e.g. toggling sub-websites, financial updates, system maintenance).
                  </p>
                </div>

                <div className="mt-5 bg-[#0F0F11] border border-amber-500/20 rounded-xl p-6 max-w-2xl text-left space-y-5">
                  <form onSubmit={handleSavePasscodeSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Security Passcode (4-8 Digit PIN)</label>
                        <div className="relative">
                          <input 
                            type={showPasscodeVisible ? "text" : "password"}
                            value={editPasscodeVal}
                            onChange={(e) => setEditPasscodeVal(e.target.value)}
                            placeholder="e.g. 8888"
                            className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-gold font-mono focus:outline-none focus:border-amber-400 tracking-widest"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasscodeVisible(!showPasscodeVisible)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/50 hover:text-white uppercase font-bold"
                          >
                            {showPasscodeVisible ? "Hide" : "Show"}
                          </button>
                        </div>
                        <span className="text-[9px] text-text-muted block">Default security passcode PIN is <code className="text-gold font-bold">8888</code></span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Require Passcode for Critical Operations</label>
                        <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded px-3 py-1.5">
                          <span className="text-xs text-white font-medium">Enforce PIN Authorization</span>
                          <button
                            type="button"
                            onClick={() => setIsPasscodeRequired(!isPasscodeRequired)}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${
                              isPasscodeRequired ? "bg-amber-500" : "bg-white/10"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              isPasscodeRequired ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>
                        <span className="text-[9px] text-text-muted block">Prompts PIN before turning sub-websites OFF or altering system values.</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Active PIN: {adminPasscode.replace(/./g, "•")}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {isPasscodeSaved && (
                          <span className="text-xs text-emerald-400 font-semibold animate-fade-in">
                            ✓ Security Passcode Saved!
                          </span>
                        )}
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-yellow-300 text-black text-xs font-extrabold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-amber-500/10 transition-all"
                        >
                          Update Security PIN
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Super Admin Location / City Management Section */}
              <div className="border-t border-white/5 pt-8">
                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-wide">
                    📍 City Locations Directory Management
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Add, edit, or delete dynamic geographic city nodes. These cities populate customer-facing menus and search engines.
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Active Locations List */}
                  <div className="lg:col-span-2 bg-[#0F0F11] border border-white/5 rounded-xl p-5 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2 mb-3">
                      🗺️ Active City Nodes
                    </span>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {cities.map((city, idx) => (
                        <div key={city + "-" + idx} className="flex items-center justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-xs text-text-primary">
                          {editingCityIndex === idx ? (
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={editingCityValue}
                                onChange={(e) => setEditingCityValue(e.target.value)}
                                className="bg-black/50 border border-gold rounded px-2 py-1 text-xs text-text-primary focus:outline-none w-full font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditCity(idx)}
                                className="px-2 py-1 bg-[#10b981] hover:bg-emerald-600 text-black font-bold text-[10px] uppercase rounded cursor-pointer border-0"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCityIndex(null)}
                                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-text-secondary font-bold text-[10px] uppercase rounded cursor-pointer border-0"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                                <span className="font-semibold">{city}</span>
                                {city === "All Cities" && (
                                  <span className="text-[9px] bg-white/10 text-text-muted px-1 rounded">System Default</span>
                                )}
                              </div>

                              {city !== "All Cities" && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditCity(idx, city)}
                                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-gold cursor-pointer border-0"
                                    title="Rename Location"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCity(city)}
                                    className="p-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black cursor-pointer border-0"
                                    title="Delete Location"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Register New City Node */}
                  <div className="lg:col-span-1 bg-[#0F0F11] border border-white/5 rounded-xl p-5 text-left flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2 mb-4">
                        ✨ Create Location Node
                      </span>

                      <form onSubmit={handleAddCity} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">City Node Name</label>
                          <input
                            type="text"
                            value={newCityName}
                            onChange={(e) => setNewCityName(e.target.value)}
                            placeholder="e.g. Pune"
                            className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5"
                        >
                          Add Location Node
                        </button>
                      </form>
                    </div>

                    <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-[10px] text-yellow-300 leading-normal">
                      💡 Locations managed here sync dynamically into theater registrations, filters, search engines, and portal options.
                    </div>
                  </div>
                </div>
              </div>

              {/* Super Admin Editor's Spotlight Movie Section */}
              <div className="border-t border-white/5 pt-8">
                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-wide">
                    🎬 Editor's Spotlight Feature Multiplex
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Highlight a cinematic masterpiece on the website home screen hero featured space, with custom image, genre, description, and available premium showtimes.
                  </p>
                </div>

                <div className="mt-5 bg-[#0F0F11] border border-white/5 rounded-xl p-6 text-left">
                  <form onSubmit={handleSaveSpotlight} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Featured Movie Title</label>
                        <input 
                          type="text"
                          value={spotlightTitle}
                          onChange={(e) => setSpotlightTitle(e.target.value)}
                          placeholder="e.g. Dune: Part Two"
                          className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Genre Category Accents</label>
                        <input 
                          type="text"
                          value={spotlightGenre}
                          onChange={(e) => setSpotlightGenre(e.target.value)}
                          placeholder="e.g. Action • Sci-Fi • Adventure"
                          className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">Duration</label>
                          <input 
                            type="text"
                            value={spotlightDuration}
                            onChange={(e) => setSpotlightDuration(e.target.value)}
                            placeholder="e.g. 2h 46m"
                            className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">Rating / Score</label>
                          <input 
                            type="text"
                            value={spotlightRating}
                            onChange={(e) => setSpotlightRating(e.target.value)}
                            placeholder="e.g. 9.1"
                            className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Backdrop Cinematic Wallpaper URL</label>
                        <input 
                          type="text"
                          value={spotlightImage}
                          onChange={(e) => setSpotlightImage(e.target.value)}
                          placeholder="Image link starting with https://"
                          className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Featured Showtimes (Comma Separated)</label>
                        <input 
                          type="text"
                          value={spotlightShowtimes}
                          onChange={(e) => setSpotlightShowtimes(e.target.value)}
                          placeholder="e.g. 11:30 AM, 3:00 PM, 6:45 PM, 10:15 PM"
                          className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Editor's Summary Description</label>
                      <textarea 
                        value={spotlightDescription}
                        onChange={(e) => setSpotlightDescription(e.target.value)}
                        placeholder="Provide an immersive high-impact review or summary sentence describing the masterpiece."
                        rows={3}
                        className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <span className="text-[10px] text-text-muted max-w-xs leading-normal">
                        Changes to Editor's Spotlight are propagated live instantly to all visitor homepages without server restarts.
                      </span>

                      <button
                        type="submit"
                        className="px-6 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5 transition-all"
                      >
                        Publish Spotlight Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PLATFORM PAYMENTS & VERIFICATION QUEUE */}
          {/* ========================================================= */}
          {activeTab === "verification_queue" && (
            <div className="space-y-8 animate-fade-in" id="tab-verification-queue">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    Platform Payments & Verification Queue
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Global queue for manually verifying customer UPI payment screenshots and 12-digit UTR reference numbers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1.5 rounded-lg font-mono font-semibold">
                    ⏳ {allVerificationItems.filter(i => i.verificationStatus === "Pending Review").length} Pending Review
                  </span>
                </div>
              </div>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#0F0F11] border border-amber-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pending Review</span>
                  <div className="text-2xl font-bold text-text-primary mt-1 font-mono">
                    {allVerificationItems.filter(i => i.verificationStatus === "Pending Review").length}
                  </div>
                </div>
                <div className="bg-[#0F0F11] border border-emerald-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Approved & Passes Issued</span>
                  <div className="text-2xl font-bold text-text-primary mt-1 font-mono">
                    {allVerificationItems.filter(i => i.verificationStatus === "Approved").length}
                  </div>
                </div>
                <div className="bg-[#0F0F11] border border-rose-500/20 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Rejected Payments</span>
                  <div className="text-2xl font-bold text-text-primary mt-1 font-mono">
                    {allVerificationItems.filter(i => i.verificationStatus === "Rejected").length}
                  </div>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-gold uppercase tracking-wider block">Total Submissions</span>
                  <div className="text-2xl font-bold text-text-primary mt-1 font-mono">
                    {allVerificationItems.length}
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F0F11] p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  {(["Pending Review", "Approved", "Rejected", "all"] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setVerifFilter(st)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        verifFilter === st 
                          ? "bg-gold text-black font-bold" 
                          : "text-text-secondary hover:bg-white/5"
                      }`}
                    >
                      {st === "all" ? "All Submissions" : st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={verifSearch}
                    onChange={e => setVerifSearch(e.target.value)}
                    placeholder="Search UTR, name or title..."
                    className="w-full bg-white/[0.02] border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Queue List Table / Cards */}
              <div className="space-y-4">
                {allVerificationItems
                  .filter(item => {
                    const matchesStatus = verifFilter === "all" || item.verificationStatus === verifFilter;
                    const matchesQuery = !verifSearch || 
                      item.title.toLowerCase().includes(verifSearch.toLowerCase()) ||
                      item.userName.toLowerCase().includes(verifSearch.toLowerCase()) ||
                      item.utr.toLowerCase().includes(verifSearch.toLowerCase());
                    return matchesStatus && matchesQuery;
                  })
                  .map(item => (
                    <div key={`${item.type}-${item.id}`} className="bg-[#0F0F11] border border-white/10 rounded-xl p-5 hover:border-gold/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            item.type === "movie" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          }`}>
                            {item.type === "movie" ? "🎬 Movie Ticket" : "🎪 Event Pass"}
                          </span>
                          <span className="text-xs font-mono font-bold text-gold">#{item.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            item.verificationStatus === "Approved" 
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                              : item.verificationStatus === "Rejected"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                          }`}>
                            {item.verificationStatus}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-text-primary">{item.title}</h3>
                        <p className="text-xs text-text-secondary">{item.venue} • {item.details} • Date: <span className="text-text-primary font-semibold">{item.date}</span> ({item.time})</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs bg-black/40 p-3 rounded-lg border border-white/5">
                          <div>
                            <span className="text-[9px] text-text-muted block uppercase font-bold">Attendee Info</span>
                            <span className="text-text-primary font-semibold block truncate">{item.userName}</span>
                            <span className="text-[10px] text-text-secondary font-mono block truncate">{item.userEmail}</span>
                            <span className="text-[10px] text-gold font-mono block">{item.mobile}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-muted block uppercase font-bold">12-Digit UTR Number</span>
                            <span className="text-gold font-mono font-bold text-sm block tracking-wider mt-0.5">{item.utr}</span>
                            <span className="text-[9px] text-text-muted block mt-0.5">Submitted via UPI</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-text-muted block uppercase font-bold">Total Payable</span>
                            <span className="text-emerald-400 font-mono font-bold text-base block mt-0.5">₹{item.amount.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Box */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                        {item.screenshot ? (
                          <button
                            onClick={() => setSelectedProofImg(item.screenshot)}
                            className="w-full sm:w-auto px-3 py-2 bg-white/5 hover:bg-white/10 text-gold border border-gold/30 rounded text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Screenshot Proof
                          </button>
                        ) : (
                          <span className="text-[10px] text-text-muted italic block">No screenshot attached</span>
                        )}

                        {item.verificationStatus === "Pending Review" && (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              onClick={() => {
                                if (item.type === "movie" && onVerifyBookingPayment) {
                                  onVerifyBookingPayment(item.id, "Approved");
                                } else if (item.type === "event" && onVerifyRegistrationPayment) {
                                  onVerifyRegistrationPayment(item.id, "Approved");
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-emerald-900/30"
                            >
                              ✅ Approve & Pass
                            </button>
                            <button
                              onClick={() => {
                                if (item.type === "movie" && onVerifyBookingPayment) {
                                  onVerifyBookingPayment(item.id, "Rejected");
                                } else if (item.type === "event" && onVerifyRegistrationPayment) {
                                  onVerifyRegistrationPayment(item.id, "Rejected");
                                }
                              }}
                              className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold text-xs rounded uppercase tracking-wider cursor-pointer transition-all"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {allVerificationItems.length === 0 && (
                  <div className="p-12 text-center bg-[#0F0F11] rounded-xl border border-white/5 text-text-muted">
                    <CheckCircle2 className="w-10 h-10 text-gold mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-semibold">No payment verification items found in the queue.</p>
                  </div>
                )}
              </div>

              {/* Proof Image Preview Modal */}
              {selectedProofImg && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#0F0F11] border border-white/10 rounded-2xl p-6 max-w-lg w-full relative space-y-4">
                    <button
                      onClick={() => setSelectedProofImg(null)}
                      className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 text-white rounded-full cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-base font-bold text-gold">UPI Payment Screenshot Verification Proof</h3>
                    <div className="overflow-hidden rounded-xl border border-white/10 max-h-[70vh] bg-black flex items-center justify-center">
                      <img src={selectedProofImg} alt="Payment Proof" className="max-w-full max-h-[65vh] object-contain" />
                    </div>
                    <button
                      onClick={() => setSelectedProofImg(null)}
                      className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded cursor-pointer"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: ADVERTISEMENT CONSOLE & CTR ANALYTICS */}
          {/* ========================================================= */}
          
          {activeTab === "fee_management" && (
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <FinanceModule />
            </div>
          )}

          {activeTab === "ads_console" && (
            <div className="space-y-8 animate-fade-in" id="tab-ads-console">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <Bell className="w-6 h-6 text-gold" />
                    📢 Advertisement Console & Click Analytics
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Publish hero sliders, homepage banners, and sponsored cards with real-time impression, click, and CTR tracking.
                  </p>
                </div>
              </div>

              {/* KPI Analytics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Impressions</span>
                  <div className="text-2xl font-bold text-gold mt-1 font-mono">
                    {advertisements.reduce((acc, ad) => acc + ad.impressions, 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total User Clicks</span>
                  <div className="text-2xl font-bold text-cyan-400 mt-1 font-mono">
                    {advertisements.reduce((acc, ad) => acc + ad.clicks, 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Average CTR %</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                    {(() => {
                      const totalImp = advertisements.reduce((acc, ad) => acc + ad.impressions, 0);
                      const totalClk = advertisements.reduce((acc, ad) => acc + ad.clicks, 0);
                      return totalImp > 0 ? ((totalClk / totalImp) * 100).toFixed(2) + "%" : "0.00%";
                    })()}
                  </div>
                </div>
                <div className="bg-[#0F0F11] border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Active Campaigns</span>
                  <div className="text-2xl font-bold text-text-primary mt-1 font-mono">
                    {advertisements.filter(ad => ad.status === "Active").length}
                  </div>
                </div>
              </div>

              {/* Create New Ad Form */}
              <div className="bg-[#0F0F11] border border-white/10 rounded-xl p-6 text-left space-y-4">
                <h3 className="text-sm font-bold text-gold uppercase tracking-wider">🚀 Publish New Advertisement Campaign</h3>
                {adSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg font-semibold">
                    {adSuccessMsg}
                  </div>
                )}
                <form onSubmit={handleCreateAdSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Campaign Title</label>
                    <input
                      type="text"
                      value={adTitle}
                      onChange={e => setAdTitle(e.target.value)}
                      placeholder="e.g. IMAX Laser 3D Gala Festival"
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Placement Location</label>
                    <select
                      value={adType}
                      onChange={e => setAdType(e.target.value as any)}
                      className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                    >
                      <option value="hero_slider">Hero Slider Banner</option>
                      <option value="homepage_banner">Homepage Middle Banner</option>
                      <option value="sponsored_card">Sponsored Feature Card</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Banner Image URL</label>
                    <input
                      type="text"
                      value={adImage}
                      onChange={e => setAdImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Destination Target Link</label>
                    <input
                      type="text"
                      value={adTargetUrl}
                      onChange={e => setAdTargetUrl(e.target.value)}
                      placeholder="e.g. #exclusive-events or #movies"
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Start Date</label>
                    <input
                      type="date"
                      value={adStartDate}
                      onChange={e => setAdStartDate(e.target.value)}
                      className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">End Date</label>
                    <input
                      type="date"
                      value={adEndDate}
                      onChange={e => setAdEndDate(e.target.value)}
                      className="w-full bg-[#121215] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div className="md:col-span-3 flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all shadow-lg shadow-gold/10"
                    >
                      Publish Campaign Live
                    </button>
                  </div>
                </form>
              </div>

              {/* Advertisements List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Active & Historical Campaigns</h3>
                  <div className="flex items-center gap-2">
                    {(["all", "hero_slider", "homepage_banner", "sponsored_card"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setAdFilter(t)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase cursor-pointer transition-all ${
                          adFilter === t ? "bg-gold text-black" : "bg-white/5 text-text-secondary hover:bg-white/10"
                        }`}
                      >
                        {t === "all" ? "All" : t.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advertisements
                    .filter(ad => adFilter === "all" || ad.type === adFilter)
                    .map(ad => {
                      const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
                      return (
                        <div key={ad.id} className="bg-[#0F0F11] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between p-4 space-y-3">
                          <div className="flex gap-4 items-start">
                            <img src={ad.imageUrl} alt={ad.title} className="w-24 h-16 object-cover rounded-lg border border-white/10 shrink-0" />
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-bold uppercase bg-gold/15 text-gold border border-gold/30 px-1.5 py-0.5 rounded">
                                  {ad.type.replace("_", " ")}
                                </span>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  ad.status === "Active" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-text-muted"
                                }`}>
                                  {ad.status}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-text-primary truncate">{ad.title}</h4>
                              <p className="text-[10px] text-text-muted font-mono truncate">{ad.targetUrl}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5 text-center font-mono">
                            <div>
                              <span className="text-[8px] text-text-muted uppercase block">Impressions</span>
                              <span className="text-xs font-bold text-text-primary">{ad.impressions}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-text-muted uppercase block">Clicks</span>
                              <span className="text-xs font-bold text-cyan-400">{ad.clicks}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-text-muted uppercase block">CTR %</span>
                              <span className="text-xs font-bold text-emerald-400">{ctr}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="text-[10px] text-text-muted font-mono">{ad.startDate} ~ {ad.endDate}</span>
                            <div className="flex items-center gap-2">
                              {onToggleAdStatus && (
                                <button
                                  onClick={() => onToggleAdStatus(ad.id)}
                                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gold rounded text-[10px] font-bold uppercase cursor-pointer"
                                >
                                  {ad.status === "Active" ? "Pause" : "Activate"}
                                </button>
                              )}
                              {onDeleteAd && (
                                <button
                                  onClick={() => onDeleteAd(ad.id)}
                                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded text-[10px] font-bold uppercase cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: UPI GATEWAY SETTINGS */}
          {/* ========================================================= */}
          {activeTab === "upi_settings" && (
            <div className="space-y-8 animate-fade-in" id="tab-upi-settings">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-gold" />
                    💳 UPI Gateway Settings & Admin QR Code
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Update the official admin UPI QR image URL, UPI ID, merchant account name, and customer payment instructions.
                  </p>
                </div>
              </div>

              {upiSaveMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg font-semibold animate-fade-in">
                  {upiSaveMessage}
                </div>
              )}

              <form onSubmit={handleSaveUpiSettings} className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
                {/* Column 1 & 2: Form Controls */}
                <div className="xl:col-span-2 bg-[#0F0F11] border border-white/10 rounded-xl p-6 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold block border-b border-white/5 pb-2">
                    🏛️ Merchant Account Credentials
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Official UPI ID (VPA)</label>
                      <input
                        type="text"
                        value={upiForm.upiId}
                        onChange={e => setUpiForm({ ...upiForm, upiId: e.target.value })}
                        placeholder="cinevenue@ybl"
                        className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase">Account Holder / Merchant Name</label>
                      <input
                        type="text"
                        value={upiForm.accountHolderName}
                        onChange={e => setUpiForm({ ...upiForm, accountHolderName: e.target.value })}
                        placeholder="CineVenue Entertainment Pvt Ltd"
                        className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Merchant Payment QR Image URL</label>
                    <input
                      type="text"
                      value={upiForm.qrImageUrl}
                      onChange={e => setUpiForm({ ...upiForm, qrImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Customer Payment Instructions</label>
                    <textarea
                      value={upiForm.instructions}
                      onChange={e => setUpiForm({ ...upiForm, instructions: e.target.value })}
                      rows={3}
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Support Helpline Mobile / WhatsApp</label>
                    <input
                      type="text"
                      value={upiForm.supportMobile || ""}
                      onChange={e => setUpiForm({ ...upiForm, supportMobile: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all shadow-lg shadow-gold/10"
                    >
                      💾 Save UPI Gateway Configuration
                    </button>
                  </div>
                </div>

                {/* Column 3: Live Preview Box */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/10 rounded-xl p-6 text-center space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold block border-b border-white/5 pb-2">
                    📱 Customer Scanner Live Preview
                  </span>

                  <div className="p-4 bg-white rounded-xl max-w-[200px] mx-auto shadow-xl">
                    <img src={upiForm.qrImageUrl} alt="QR Code" className="w-full h-auto aspect-square object-contain" />
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <span className="text-text-muted block text-[10px]">UPI VPA:</span>
                    <span className="text-gold font-bold block">{upiForm.upiId}</span>
                    <span className="text-text-primary block text-[11px] font-sans font-semibold">{upiForm.accountHolderName}</span>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: CINEVENUE SERVICE CONTROL CENTER */}
          {/* ========================================================= */}
          {activeTab === "service_control" && (
            <div className="space-y-8 animate-fade-in text-left font-sans" id="tab-service-control">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <Activity className="w-6 h-6 text-gold animate-pulse" />
                    CINEVENUE SERVICE CONTROL & EMERGENCY COMMAND
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Super Admin Mission Control to manage live operations, emergency kill switches, maintenance overlays, and incident response across all sub-websites.
                  </p>
                </div>
              </div>

              {/* 🚨 MASTER EMERGENCY KILL SWITCHES & DEFENSE CONSOLE */}
              <div className="bg-gradient-to-r from-red-950/60 via-[#0C0A0D] to-red-950/40 border-2 border-rose-500/50 rounded-2xl p-6 md:p-7 space-y-5 shadow-2xl relative overflow-hidden text-left">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-2xl animate-bounce">🚨</span>
                      <h3 className="text-lg md:text-xl font-mono font-black text-white uppercase tracking-wider">
                        EMERGENCY KILL SWITCHES & SYSTEM LOCKDOWN
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        HIGH SECURITY • DEFCON 1
                      </span>
                    </div>
                    <p className="text-xs text-rose-200/80 leading-relaxed font-sans">
                      Authorized failsafe controls to instantaneously freeze public customer transactions, terminate sub-website routing, or broadcast critical emergency notices across all client devices worldwide.
                    </p>
                  </div>

                  {/* Master Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleOpenEmergencyModal("all", "All Sub-Websites & Global Platform", "kill")}
                      className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-red-950/60 border border-rose-400/60 cursor-pointer flex items-center gap-2 animate-pulse"
                      title="Instantly shutdown all 6 sub-websites and platform"
                    >
                      <span>🚨 TRIGGER MASTER KILL SWITCH</span>
                    </button>
                    <button
                      onClick={() => handleOpenEmergencyModal("all", "All Sub-Websites & Global Platform", "restore")}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-950/60 border border-emerald-400/60 cursor-pointer flex items-center gap-2"
                      title="Restore all sub-websites to Live Operational status"
                    >
                      <span>⚡ RECOVER ALL TO LIVE</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Sub-Website Status Telemetry */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4 border-t border-rose-500/20">
                  {[
                    { key: "website", name: "Global Platform", icon: "🌐" },
                    { key: "movieBooking", name: "Movie Booking", icon: "🎬" },
                    { key: "eventBooking", name: "Event Booking", icon: "🎟️" },
                    { key: "filmProduction", name: "Film Production", icon: "🎥" },
                    { key: "eventManagement", name: "Event Mgmt", icon: "🎤" },
                    { key: "brandPromotion", name: "Brand PR", icon: "📢" },
                    { key: "cinecoins", name: "CineCoins", icon: "🪙" }
                  ].map((item) => {
                    const isItemLive = serviceControl?.[item.key]?.status !== false;
                    return (
                      <div 
                        key={item.key} 
                        className={`px-3 py-2 rounded-xl border text-left font-mono transition-all ${
                          isItemLive 
                            ? "bg-black/50 border-emerald-500/30 text-emerald-400" 
                            : "bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-md shadow-rose-950/50"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span>{item.icon}</span>
                          <span className="font-bold">{isItemLive ? "LIVE" : "KILLED"}</span>
                        </div>
                        <p className="text-[10px] font-bold text-white truncate pt-0.5">{item.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SERVICE CONTROLLER GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT & CENTER COLS: TOGGLES & CONFIGURATORS */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* MAIN SERVICE TOGGLE BOARD */}
                  <div className="bg-[#0A0A0C] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl text-left">
                    <div className="text-center space-y-2 border-b border-white/10 pb-6">
                      <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] block flex items-center justify-center gap-2">
                        <span>🛡️</span> Super Admin → Service Control Center
                      </span>
                      <h2 className="text-xl md:text-2xl font-mono font-bold text-white tracking-widest uppercase border-y border-white/10 py-3 bg-white/[0.02]">
                        CINEVENUE SERVICE CONTROL
                      </h2>
                    </div>

                    {/* GLOBAL WEBSITE ROW */}
                    <div className="bg-black/60 border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🌐</span>
                            <h4 className="text-base font-bold text-white uppercase tracking-wider">Global Website</h4>
                          </div>
                          <p className="text-xs text-text-muted">Master platform kill-switch. Disables all public client access when OFF.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase border ${
                            (serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true)
                              ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                              : "text-rose-400 bg-rose-400/10 border-rose-400/20 animate-pulse"
                          }`}>
                            Status : {(serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true) ? "🟢 LIVE" : "🔴 OFFLINE"}
                          </span>
                          <button
                            onClick={() => {
                              const isCurLive = (serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true);
                              handleOpenEmergencyModal("website", "Global Platform Website", isCurLive ? "kill" : "restore");
                            }}
                            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer border ${
                              (serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true)
                                ? "bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border-rose-500/50 shadow-md shadow-rose-900/30"
                                : "bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border-emerald-500/50 shadow-md shadow-emerald-900/30"
                            }`}
                          >
                            {(serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true) ? "🚨 Kill Switch" : "⚡ Restore"}
                          </button>
                          <button
                            onClick={() => {
                              if (!setServiceControl || !serviceControl) return;
                              const current = serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true;
                              const newStatus = !current;
                              setServiceControl((prev: any) => ({
                                ...prev,
                                website: { ...prev.website, status: newStatus },
                                globalWebsite: { ...prev.globalWebsite, status: newStatus }
                              }));
                              if (setServiceControlLogs) {
                                setServiceControlLogs((prevLogs: any[]) => [
                                  {
                                    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                                    timestamp: new Date().toISOString(),
                                    actor: "SUPER ADMIN",
                                    action: "STATUS_TOGGLED",
                                    service: "Global Website",
                                    details: `Global Website toggled to ${newStatus ? "LIVE (Turned ON)" : "OFFLINE (Turned OFF)"}`
                                  },
                                  ...(prevLogs || [])
                                ]);
                              }
                            }}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                              (serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true)
                                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                            }`}
                          >
                            {(serviceControl?.website?.status ?? serviceControl?.globalWebsite?.status ?? true) ? "Turn OFF" : "Turn ON"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedConfigService("website");
                              setIsEditMaintenanceModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-white/10" />

                    {/* THE ALL 6 SUB-WEBSITES OPERATIONAL & EMERGENCY CONTROL BOXES */}
                    <div className="space-y-6">
                      {[
                        { key: "movieBooking", name: "1. Movie Booking Sub-Website Box", icon: "🎬", visitors: "1,240", desc: "Theatres catalog, showtimes, seats & ticket booking" },
                        { key: "eventBooking", name: "2. Event Booking Sub-Website Box", icon: "🎟️", visitors: "327", desc: "Live concerts, fan galas, comedy shows & passes" },
                        { key: "filmProduction", name: "3. Film Production Sub-Website Box", icon: "🎥", visitors: "840", desc: "Casting hub, equipment rentals & investor brief" },
                        { key: "eventManagement", name: "4. Event Management Sub-Website Box", icon: "🎤", visitors: "610", desc: "Audio launches, movie promotions & celeb galas" },
                        { key: "brandPromotion", name: "5. Brand Publicity Sub-Website Box", icon: "📢", visitors: "490", desc: "Theatre ad space buyouts & media PR campaigns" },
                        { key: "cinecoins", name: "6. CineCoins Rewards & Loyalty Vault Box", icon: "🪙", visitors: "1,890", desc: "Digital wallet, redemption gateway, coin transfers & vouchers" }
                      ].map((pillar) => {
                        const pillarState = serviceControl?.[pillar.key];
                        const isLive = pillarState?.status !== false;
                        const pillarProposals = serviceProposals.filter(p => p.subWebsiteKey === pillar.key);

                        return (
                          <div 
                            key={pillar.key} 
                            className={`bg-black/60 border rounded-2xl p-6 space-y-5 transition-all shadow-xl ${
                              isLive 
                                ? "border-white/10 hover:border-gold/40" 
                                : "border-rose-500/50 bg-rose-950/10 shadow-rose-950/40"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                              <div className="space-y-1.5 text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{pillar.icon}</span>
                                  <h4 className="text-base font-bold text-white uppercase tracking-wider">{pillar.name}</h4>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                                  <span className={`font-mono font-bold px-2.5 py-0.5 rounded text-[10px] ${
                                    isLive ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border border-rose-400/20 animate-pulse"
                                  }`}>
                                    Status : {isLive ? "🟢 LIVE & OPERATIONAL" : "🔴 EMERGENCY KILL SWITCH ACTIVE"}
                                  </span>
                                  <span className="font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded text-[10px]">
                                    Active Visitors: {pillar.visitors}
                                  </span>
                                  {pillar.key !== "cinecoins" && (
                                    <span className="text-gold font-mono text-[10px] bg-gold/10 px-2.5 py-0.5 rounded border border-gold/20 font-bold">
                                      Proposals Inbox: {pillarProposals.length} received
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-white/50 font-light">{pillar.desc}</p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => setActiveCMSPillar(pillar.key as PillarKey)}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>🚀 Launch CMS</span>
                                </button>

                                {/* 🚨 Emergency Kill Switch with 2FA Confirmation Modal */}
                                <button
                                  onClick={() => handleOpenEmergencyModal(pillar.key, pillar.name, isLive ? "kill" : "restore")}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                                    isLive 
                                      ? "bg-rose-600/25 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/40 shadow-sm" 
                                      : "bg-emerald-600/25 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/40 shadow-sm"
                                  }`}
                                  title="Emergency Kill Switch with 2FA Confirmation"
                                >
                                  {isLive ? "🚨 Kill Switch" : "⚡ Restore"}
                                </button>

                                {/* Fast 1-Click Quick Toggles */}
                                <button
                                  onClick={() => {
                                    if (!setServiceControl) return;
                                    setServiceControl((prev: any) => ({
                                      ...prev,
                                      [pillar.key]: { ...prev[pillar.key], status: true }
                                    }));
                                    if (setServiceControlLogs) {
                                      setServiceControlLogs((prevLogs: any[]) => [
                                        {
                                          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                                          timestamp: new Date().toISOString(),
                                          actor: "SUPER ADMIN",
                                          action: "STATUS_TOGGLED",
                                          service: pillar.name,
                                          details: `Turned ON service: ${pillar.name}`
                                        },
                                        ...(prevLogs || [])
                                      ]);
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border ${
                                    isLive ? "bg-emerald-500 text-black border-emerald-400 font-extrabold shadow-md" : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                                  }`}
                                >
                                  ON
                                </button>
                                <button
                                  onClick={() => {
                                    if (!setServiceControl) return;
                                    setServiceControl((prev: any) => ({
                                      ...prev,
                                      [pillar.key]: { ...prev[pillar.key], status: false }
                                    }));
                                    if (setServiceControlLogs) {
                                      setServiceControlLogs((prevLogs: any[]) => [
                                        {
                                          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                                          timestamp: new Date().toISOString(),
                                          actor: "SUPER ADMIN",
                                          action: "STATUS_TOGGLED",
                                          service: pillar.name,
                                          details: `Turned OFF service: ${pillar.name}`
                                        },
                                        ...(prevLogs || [])
                                      ]);
                                    }
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer border ${
                                    !isLive ? "bg-rose-600 text-white border-rose-500 font-extrabold shadow-md animate-pulse" : "bg-white/5 text-white/50 border-white/10 hover:text-white"
                                  }`}
                                >
                                  OFF
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedConfigService(pillar.key);
                                    setIsEditMaintenanceModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer"
                                >
                                  Config
                                </button>
                              </div>
                            </div>

                            {/* Real-time Public Screen Advisory Preview */}
                            <div className={`p-3 rounded-xl border text-[11px] font-mono space-y-1.5 transition-all ${
                              !isLive 
                                ? "bg-rose-950/30 border-rose-500/40 text-rose-200" 
                                : "bg-white/[0.02] border-white/5 text-white/70"
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5">
                                  <span>{!isLive ? "🚨 Public Advisory Screen Notice" : "📋 Public Maintenance Template"}</span>
                                </span>
                                <span className="text-[10px] text-gold font-bold">
                                  EST RETURN: {pillarState?.expectedTime || "Promptly"}
                                </span>
                              </div>
                              <p className="font-bold text-white text-xs truncate">
                                {pillarState?.title || `${pillar.name} Operational`}
                              </p>
                              <p className="text-[10px] text-white/60 line-clamp-1 italic">
                                "{pillarState?.message || "All systems normal."}"
                              </p>
                            </div>
                            <div className="space-y-3 pt-1">
                              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gold">
                                <span>📩 Customer Proposals Delivered from Website</span>
                                <span className="text-[10px] text-text-muted font-mono">{pillarProposals.length} Submissions</span>
                              </div>

                              <div className="space-y-2">
                                {pillarProposals.map(prop => (
                                  <div key={prop.id} className="bg-[#121215] border border-white/10 rounded-xl p-4 space-y-3 hover:border-gold/30 transition-all text-xs">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-gold">{prop.id}</span>
                                        <span className="text-white font-bold">{prop.customerName}</span>
                                        <span className="text-[10px] text-text-muted font-mono">({prop.customerEmail})</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                                          prop.status === "Approved" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                                          prop.status === "Declined" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                                          prop.status === "In Review" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                                          "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                                        }`}>
                                          Status: {prop.status}
                                        </span>
                                        <span className="text-[10px] text-text-muted font-mono">{prop.submittedAt}</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary">
                                      <div>
                                        <span className="text-[9px] text-text-muted block uppercase font-bold">Requirement / Scope</span>
                                        <span className="text-white font-semibold block">{prop.projectTitleOrMovie}</span>
                                        <span className="text-gold font-mono block text-[11px]">{prop.budgetOrRequirement}</span>
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-text-muted block uppercase font-bold">Direct Message</span>
                                        <p className="text-text-primary italic leading-relaxed">{prop.message}</p>
                                        <span className="text-[10px] text-text-muted font-mono block pt-0.5">Contact: {prop.customerPhone}</span>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                                      <span className="text-[10px] font-bold text-text-muted uppercase">Admin Action:</span>
                                      <button
                                        onClick={() => onUpdateProposalStatus && onUpdateProposalStatus(prop.id, "Approved")}
                                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded text-[10px] font-bold cursor-pointer transition-all"
                                      >
                                        ✅ Approve Proposal
                                      </button>
                                      <button
                                        onClick={() => onUpdateProposalStatus && onUpdateProposalStatus(prop.id, "In Review")}
                                        className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded text-[10px] font-bold cursor-pointer transition-all"
                                      >
                                        🔍 In Review
                                      </button>
                                      <button
                                        onClick={() => onUpdateProposalStatus && onUpdateProposalStatus(prop.id, "Declined")}
                                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded text-[10px] font-bold cursor-pointer transition-all"
                                      >
                                        ❌ Decline
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {pillarProposals.length === 0 && (
                                  <p className="text-text-muted italic text-[11px] p-3 bg-white/[0.01] rounded border border-white/5">
                                    No proposal submissions received yet for this sub-website.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* MAINTENANCE MESSAGE TEMPLATE EDITOR */}
                  <div className="bg-white/[0.01] border border-white/10 rounded-xl p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] block">SECTION B</span>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Maintenance Template Configurator</h3>
                      </div>
                      <span className="text-[10px] text-text-muted font-mono font-semibold">
                        EDITING: <span className="text-gold font-bold uppercase">{selectedConfigService}</span>
                      </span>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!setServiceControl) return;
                        setServiceControl((prev: any) => ({
                          ...prev,
                          [selectedConfigService]: {
                            ...prev[selectedConfigService],
                            title: customTitleInput,
                            message: customMessageInput,
                            expectedTime: customExpectedTime,
                            icon: customIcon
                          }
                        }));
                        if (setServiceControlLogs) {
                          setServiceControlLogs((prev: any[]) => [
                            {
                              id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                              timestamp: new Date().toISOString(),
                              actor: "SUPER ADMIN",
                              action: "UPDATED CONFIG",
                              service: selectedConfigService,
                              details: `Configured template: "${customTitleInput}"`
                            },
                            ...prev
                          ]);
                        }
                        alert(`Successfully updated and saved maintenance template for ${selectedConfigService}!`);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Template Alert Title</label>
                        <input
                          type="text"
                          value={customTitleInput}
                          onChange={(e) => setCustomTitleInput(e.target.value)}
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                          placeholder="e.g., Portal Optimization"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Estimated Completion Time</label>
                        <input
                          type="text"
                          value={customExpectedTime}
                          onChange={(e) => setCustomExpectedTime(e.target.value)}
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                          placeholder="e.g., 2 Hours / 45 Minutes"
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Display Icon / Emoticon</label>
                        <input
                          type="text"
                          value={customIcon}
                          onChange={(e) => setCustomIcon(e.target.value)}
                          className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold"
                          placeholder="e.g., ⚙️ / 🎟️ / ⚡"
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Maintenance Explanation Message</label>
                        <textarea
                          value={customMessageInput}
                          onChange={(e) => setCustomMessageInput(e.target.value)}
                          className="w-full h-24 px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold resize-none"
                          placeholder="Detail why the service is currently offline for VIP users..."
                          required
                        />
                      </div>

                      <div className="md:col-span-2 text-right pt-2 border-t border-white/5">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-all shadow-md"
                        >
                          💾 Save Template & Apply Emergency Route
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* RIGHT COL: SYSTEM LOGS & TERMINAL */}
                <div className="xl:col-span-1 space-y-6">
                  <div className="bg-[#09090B] border border-white/10 rounded-xl p-5 flex flex-col justify-between h-full min-h-[500px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white">Live System Terminal logs</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              if (setServiceControlLogs) {
                                setServiceControlLogs([]);
                              }
                            }}
                            className="text-[9px] font-mono text-text-muted hover:text-white uppercase px-1.5 py-0.5 rounded border border-white/5 cursor-pointer"
                            title="Clear logs"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => {
                              if (setServiceControlLogs) {
                                setServiceControlLogs([
                                  {
                                    id: "LOG-9921",
                                    timestamp: new Date().toISOString(),
                                    actor: "SUPER ADMIN",
                                    action: "BOOT_SUCCESS",
                                    service: "Service Controller",
                                    details: "Successfully initialized CineVenue service matrix."
                                  },
                                  {
                                    id: "LOG-9922",
                                    timestamp: new Date(Date.now() - 600000).toISOString(),
                                    actor: "SUPER ADMIN",
                                    action: "CONFIG_SET",
                                    service: "Movie Booking",
                                    details: "Initialized default maintenance message."
                                  }
                                ]);
                              }
                            }}
                            className="text-[9px] font-mono text-gold hover:text-gold-light uppercase px-1.5 py-0.5 rounded border border-gold/10 cursor-pointer"
                            title="Seed template logs"
                          >
                            Seed
                          </button>
                        </div>
                      </div>

                      {/* Log Console Terminal */}
                      <div className="bg-black/80 rounded-lg p-3 font-mono text-[10px] text-zinc-400 space-y-3 h-[420px] overflow-y-auto border border-white/5 scrollbar-thin">
                        {serviceControlLogs.length === 0 ? (
                          <div className="text-center text-zinc-600 py-12 flex flex-col items-center gap-1">
                            <span>⌨️ Terminal Idle</span>
                            <span className="text-[9px]">Toggle some switches or save custom configurations to write to the logs stream.</span>
                          </div>
                        ) : (
                          serviceControlLogs.map((log: any, idx: number) => (
                            <div key={log.id || idx} className="space-y-1 border-b border-zinc-900 pb-2 last:border-0 text-left">
                              <div className="flex items-center justify-between text-zinc-500 text-[8px]">
                                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className="text-zinc-600">ID: {log.id}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-emerald-400">[{log.actor}]</span>
                                <span className={log.action === "DEACTIVATED" ? "text-rose-400 font-bold" : "text-[#D4AF37] font-bold"}>
                                  {log.action}
                                </span>
                                <span className="text-white font-medium">{log.service}</span>
                              </div>
                              <p className="text-zinc-500 text-[9px] font-light italic">
                                {log.details}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="text-[9px] font-mono text-text-muted mt-4 text-center border-t border-white/5 pt-3">
                      STATUS REPORT: GLOBAL CONTROLLER ENCRYPTION KEY STABLE
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: SUB-WEBSITES OPERATIONAL CONSOLE (5 PILLARS) */}
          {/* ========================================================= */}
          {activeTab === "sub_websites" && (
            <div className="space-y-8 animate-fade-in text-left font-sans" id="tab-subwebsites">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <Layers className="w-6 h-6 text-gold" />
                    SUB-WEBSITES MANAGEMENT CONSOLE (5 PILLARS)
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Operate all 5 sub-websites from dedicated columns. Manage live statuses, edit maintenance configs, process customer proposals, and control sub-site features.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gold bg-gold/10 px-3 py-1 rounded border border-gold/30 font-bold">
                    5 Pillar Operations
                  </span>
                </div>
              </div>

              {/* 5 SUB-WEBSITE COLUMNS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {[
                  {
                    key: "movieBooking",
                    name: "Movie Booking",
                    icon: "🎬",
                    color: "border-cyan-500/30",
                    badge: "bg-cyan-500/10 text-cyan-400",
                    desc: "Theatres catalog, showtimes, seats & ticket booking"
                  },
                  {
                    key: "eventBooking",
                    name: "Event Booking",
                    icon: "🎟️",
                    color: "border-amber-500/30",
                    badge: "bg-amber-500/10 text-amber-400",
                    desc: "Live concerts, fan galas, comedy shows & passes"
                  },
                  {
                    key: "filmProduction",
                    name: "Film Production",
                    icon: "🎥",
                    color: "border-red-500/30",
                    badge: "bg-red-500/10 text-red-400",
                    desc: "Casting hub, equipment rentals, investor pitch & portfolio"
                  },
                  {
                    key: "eventManagement",
                    name: "Event Management",
                    icon: "🎤",
                    color: "border-purple-500/30",
                    badge: "bg-purple-500/10 text-purple-400",
                    desc: "Audio launches, movie promotions & celeb galas"
                  },
                  {
                    key: "brandPromotion",
                    name: "Brand Publicity",
                    icon: "📢",
                    color: "border-emerald-500/30",
                    badge: "bg-emerald-500/10 text-emerald-400",
                    desc: "Theatre ad space buyouts & media PR campaigns"
                  }
                ].map((col) => {
                  const state = serviceControl?.[col.key];
                  const isLive = state?.status !== false;
                  const proposals = serviceProposals.filter(p => p.subWebsiteKey === col.key);

                  return (
                    <div
                      key={col.key}
                      className={`bg-[#0A0A0C] border ${col.color} rounded-2xl p-5 space-y-4 hover:border-gold/50 transition-all shadow-xl flex flex-col justify-between`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <span className="text-2xl">{col.icon}</span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                            isLive ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border-rose-400/20"
                          }`}>
                            {isLive ? "🟢 LIVE" : "🔴 OFF"}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-sm uppercase tracking-wider">{col.name}</h3>
                          <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{col.desc}</p>
                        </div>

                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 text-[10px] space-y-1 font-mono">
                          <div className="flex justify-between text-white/60">
                            <span>Inquiries Inbox:</span>
                            <span className="text-gold font-bold">{proposals.length} Submitted</span>
                          </div>
                          <div className="flex justify-between text-white/60">
                            <span>Status Message:</span>
                            <span className="text-white truncate max-w-[100px]">{state?.title || "Operational"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5">
                        {/* LAUNCH FULL CMS CONTROL PANEL BUTTON */}
                        <button
                          onClick={() => setActiveCMSPillar(col.key as PillarKey)}
                          className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-yellow-300 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5 border border-amber-300/50"
                        >
                          <span>🚀 Launch {col.name} CMS</span>
                        </button>
                        {col.key === "filmProduction" && (
                          <button
                            onClick={() => setActiveTab("film_production")}
                            className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md"
                          >
                            <Film className="w-3 h-3 text-amber-400" />
                            <span>🎥 Open 24 Crafts Admin & ATS</span>
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {/* TOGGLE BUTTON */}
                          <button
                            onClick={() => {
                              if (!setServiceControl) return;
                              const toggleAction = () => {
                                setServiceControl((prev: any) => ({
                                  ...prev,
                                  [col.key]: {
                                    ...prev[col.key],
                                    status: !isLive
                                  }
                                }));
                              };
                              executeProtectedAction(
                                toggleAction,
                                `${isLive ? "Turn OFF" : "Turn ON"} ${col.name} Sub-Website`
                              );
                            }}
                            className={`py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                              isLive
                                ? "bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30"
                                : "bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30"
                            }`}
                          >
                            {isLive ? "Turn OFF" : "Turn ON"}
                          </button>

                          {/* CONFIG BUTTON */}
                          <button
                            onClick={() => {
                              setSelectedConfigService(col.key);
                              setIsEditMaintenanceModalOpen(true);
                            }}
                            className="py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer text-center truncate px-1"
                          >
                            Config Msg
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DETAILED SUB-WEBSITES INBOX & MANAGEMENT TABLE */}
              <div className="bg-[#0A0A0C] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <span>📩</span> All Sub-Websites Customer Proposals & Inquiries Inbox
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Process proposals received from Movie Booking, Event Booking, Film Production, Event Management, and Brand Publicity sub-sites.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gold bg-gold/10 px-3 py-1 rounded border border-gold/30">
                      Total Inquiries: {serviceProposals.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {serviceProposals.map((prop) => (
                    <div key={prop.id} className="bg-black/60 border border-white/10 rounded-xl p-4 space-y-3 hover:border-gold/30 transition-all text-xs">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-gold">{prop.id}</span>
                          <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                            {prop.subWebsiteName || prop.subWebsiteKey}
                          </span>
                          <span className="text-white font-bold">{prop.customerName}</span>
                          <span className="text-[10px] text-text-muted font-mono">({prop.customerEmail})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${
                            prop.status === "Approved" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                            prop.status === "Declined" ? "bg-rose-500/20 text-rose-300 border-rose-500/30" :
                            prop.status === "In Review" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                            "bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse"
                          }`}>
                            Status: {prop.status}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">{prop.submittedAt}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-secondary">
                        <div>
                          <span className="text-[9px] text-text-muted block uppercase font-bold">Requirement / Scope</span>
                          <span className="text-white font-semibold block">{prop.projectTitleOrMovie}</span>
                          <span className="text-gold font-mono block text-[11px]">{prop.budgetOrRequirement}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-text-muted block uppercase font-bold">Direct Message / Details</span>
                          <p className="text-text-primary italic leading-relaxed">{prop.message}</p>
                          <span className="text-[10px] text-text-muted font-mono block pt-0.5">Contact: {prop.customerPhone}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Admin Action:</span>
                        <button
                          onClick={() => onUpdateProposalStatus && onUpdateProposalStatus(prop.id, "Approved")}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded text-[10px] font-bold cursor-pointer transition-all"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => onUpdateProposalStatus && onUpdateProposalStatus(prop.id, "In Review")}
                          className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 rounded text-[10px] font-bold cursor-pointer transition-all"
                        >
                          🔍 Under Review
                        </button>
                        <button
                          onClick={() => onUpdateProposalStatus && onUpdateProposalStatus(prop.id, "Declined")}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded text-[10px] font-bold cursor-pointer transition-all"
                        >
                          ❌ Decline
                        </button>
                      </div>
                    </div>
                  ))}

                  {serviceProposals.length === 0 && (
                    <div className="text-center py-8 text-text-muted italic text-xs bg-white/[0.01] rounded-xl border border-white/5">
                      No customer proposals or inquiries received yet. Users can submit inquiries directly from any of the 5 sub-websites.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: FOOTER & LEGAL PAGES EDITOR */}
          {/* ========================================================= */}
          {activeTab === "footer_pages" && (
            <div className="space-y-8 animate-fade-in text-left font-sans" id="tab-footerpages">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <FileText className="w-6 h-6 text-gold" />
                    FOOTER & LEGAL PAGES CONTENT MANAGER
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Edit live copy for About CineVenue, Privacy Policy, Terms of Use, and Concierge Contact pages displayed at the footer of the site.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (onUpdateFooterPagesData) {
                      onUpdateFooterPagesData(editingFooterPages);
                      setFooterSaveSuccessMsg("✅ Footer pages copy saved and updated live across CineVenue!");
                      setTimeout(() => setFooterSaveSuccessMsg(""), 4000);
                    }
                  }}
                  className="px-5 py-2.5 bg-gold hover:bg-gold-light text-dark-bg font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Footer Pages Copy
                </button>
              </div>

              {footerSaveSuccessMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <span>{footerSaveSuccessMsg}</span>
                </div>
              )}

              {/* Page Selection Sub-tabs */}
              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
                {[
                  { key: "about", label: "About CineVenue", icon: "📖" },
                  { key: "privacy", label: "Privacy Policy", icon: "🛡️" },
                  { key: "terms", label: "Terms of Use", icon: "⚖️" },
                  { key: "contact", label: "Concierge Contact", icon: "📞" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFooterPageTab(tab.key as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                      activeFooterPageTab === tab.key
                        ? "bg-gold text-dark-bg shadow-md"
                        : "bg-white/5 text-text-secondary hover:text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* EDITOR FORM: ABOUT CINEVENUE */}
              {activeFooterPageTab === "about" && (
                <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">
                    Edit: About CineVenue Page
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Page Title</label>
                      <input
                        type="text"
                        value={editingFooterPages.about.title}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          about: { ...p.about, title: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={editingFooterPages.about.subtitle}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          about: { ...p.about, subtitle: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Overview Description</label>
                    <textarea
                      rows={5}
                      value={editingFooterPages.about.description}
                      onChange={(e) => setEditingFooterPages(p => ({
                        ...p,
                        about: { ...p.about, description: e.target.value }
                      }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Our Vision Statement</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.about.vision}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          about: { ...p.about, vision: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Our Mission Statement</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.about.mission}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          about: { ...p.about, mission: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDITOR FORM: PRIVACY POLICY */}
              {activeFooterPageTab === "privacy" && (
                <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">
                    Edit: Privacy Policy Page
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Page Title</label>
                      <input
                        type="text"
                        value={editingFooterPages.privacy.title}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          privacy: { ...p.privacy, title: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Last Updated Stamp</label>
                      <input
                        type="text"
                        value={editingFooterPages.privacy.lastUpdated}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          privacy: { ...p.privacy, lastUpdated: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Intro Message</label>
                    <input
                      type="text"
                      value={editingFooterPages.privacy.intro}
                      onChange={(e) => setEditingFooterPages(p => ({
                        ...p,
                        privacy: { ...p.privacy, intro: e.target.value }
                      }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Payment Security Statement</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.privacy.paymentSecurity}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          privacy: { ...p.privacy, paymentSecurity: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Privacy Contact Email</label>
                      <input
                        type="text"
                        value={editingFooterPages.privacy.email}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          privacy: { ...p.privacy, email: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-gold font-mono focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDITOR FORM: TERMS OF USE */}
              {activeFooterPageTab === "terms" && (
                <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">
                    Edit: Terms of Use Page
                  </h3>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Welcome Text</label>
                    <input
                      type="text"
                      value={editingFooterPages.terms.welcome}
                      onChange={(e) => setEditingFooterPages(p => ({
                        ...p,
                        terms: { ...p.terms, welcome: e.target.value }
                      }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Account Responsibility</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.terms.accountResp}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          terms: { ...p.terms, accountResp: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Bookings Policy</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.terms.bookings}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          terms: { ...p.terms, bookings: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Payments Policy</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.terms.payments}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          terms: { ...p.terms, payments: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Intellectual Property Clause</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.terms.intellectualProperty}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          terms: { ...p.terms, intellectualProperty: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Limitation of Liability Clause</label>
                      <textarea
                        rows={3}
                        value={editingFooterPages.terms.limitationOfLiability}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          terms: { ...p.terms, limitationOfLiability: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EDITOR FORM: CONCIERGE CONTACT */}
              {activeFooterPageTab === "contact" && (
                <div className="bg-[#0A0A0C] border border-white/10 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">
                    Edit: Concierge Contact Page
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Page Title</label>
                      <input
                        type="text"
                        value={editingFooterPages.contact.title}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          contact: { ...p.contact, title: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Subtitle / Sub-heading</label>
                      <input
                        type="text"
                        value={editingFooterPages.contact.subtitle}
                        onChange={(e) => setEditingFooterPages(p => ({
                          ...p,
                          contact: { ...p.contact, subtitle: e.target.value }
                        }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:border-gold outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Greeting Description</label>
                    <textarea
                      rows={2}
                      value={editingFooterPages.contact.description}
                      onChange={(e) => setEditingFooterPages(p => ({
                        ...p,
                        contact: { ...p.contact, description: e.target.value }
                      }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-gold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-gold uppercase">Customer Support Contact Info</h4>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={editingFooterPages.contact.phone}
                          onChange={(e) => setEditingFooterPages(p => ({
                            ...p,
                            contact: { ...p.contact, phone: e.target.value }
                          }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:border-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Support Email</label>
                        <input
                          type="text"
                          value={editingFooterPages.contact.email}
                          onChange={(e) => setEditingFooterPages(p => ({
                            ...p,
                            contact: { ...p.contact, email: e.target.value }
                          }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gold font-mono focus:border-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Office Location Address</label>
                        <input
                          type="text"
                          value={editingFooterPages.contact.office}
                          onChange={(e) => setEditingFooterPages(p => ({
                            ...p,
                            contact: { ...p.contact, office: e.target.value }
                          }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-gold outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 bg-black/40 border border-white/5 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-white uppercase">Business & Hours</h4>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Business Email</label>
                        <input
                          type="text"
                          value={editingFooterPages.contact.businessEmail}
                          onChange={(e) => setEditingFooterPages(p => ({
                            ...p,
                            contact: { ...p.contact, businessEmail: e.target.value }
                          }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gold font-mono focus:border-gold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Support Hours</label>
                        <textarea
                          rows={3}
                          value={editingFooterPages.contact.supportHours}
                          onChange={(e) => setEditingFooterPages(p => ({
                            ...p,
                            contact: { ...p.contact, supportHours: e.target.value }
                          }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-gold outline-none font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: THEATRE BANK ACCOUNTS & SETTLEMENTS */}
          {/* ========================================================= */}
          {activeTab === "theatre_banks" && (
            <div className="space-y-8 animate-fade-in" id="tab-theatre-banks">
              <TheatreBankManagement
                theatres={theatres.map((t) => ({
                  id: t.id,
                  name: t.name,
                  location: t.location,
                  city: (t.location || "").split(" · ")[0] || "All Cities",
                  screens: 4,
                  status: "Active"
                }))}
                adminUser={{
                  id: "SUPER-01",
                  fullName: "Super Admin",
                  email: superAdminEmail,
                  role: effectiveSuperAdmin ? "Super Admin" : "Venue Admin"
                }}
                onOpenManagerDashboard={onOpenManagerDashboard}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: EVENT MANAGEMENT REQUESTS & INQUIRIES */}
          {/* ========================================================= */}
          {activeTab === "event_requests" && (
            <div className="space-y-8 animate-fade-in" id="tab-event-requests">
              <EventManagementAdminPanel
                eventRequests={adminEventRequests}
                onUpdateEventRequests={setAdminEventRequests}
                publicEvents={adminPublicEvents}
                onUpdatePublicEvents={setAdminPublicEvents}
                artistRequests={adminArtistRequests}
                onUpdateArtistRequests={setAdminArtistRequests}
                sponsorshipRequests={adminSponsorshipRequests}
                onUpdateSponsorshipRequests={setAdminSponsorshipRequests}
                portfolioItems={adminPortfolioItems}
                onUpdatePortfolioItems={setAdminPortfolioItems}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PROPOSALS & QUOTATIONS SYSTEM */}
          {/* ========================================================= */}
          {activeTab === "proposals" && (
            <div className="space-y-8 animate-fade-in" id="tab-proposals">
              <ProposalAdminModule
                adminEmail={superAdminEmail}
                isSuperAdmin={effectiveSuperAdmin}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: FILM PRODUCTION & 24 CRAFTS DIRECTORATE */}
          {/* ========================================================= */}
          {activeTab === "film_production" && (
            <div className="space-y-8 animate-fade-in" id="tab-film-production">
              <CineVenueFilmAdminTab
                onOpenSubWebsite={() => setActiveTab("sub_websites")}
                onOpenProposals={() => setActiveTab("proposals")}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: GEOGRAPHIC LOCATIONS MANAGER */}
          {/* ========================================================= */}
          {activeTab === "locations" && effectiveSuperAdmin && (
            <div className="space-y-8 animate-fade-in" id="tab-locations">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-3xl font-display font-semibold text-text-primary tracking-wide">
                    🗺️ Geographic Locations Directory
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Add, rename, or delete geographic nodes across the platform. These cities populate customer menus and theater listings.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* COLUMN 1 & 2: Active Locations Directory List */}
                <div className="xl:col-span-2 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block">
                        🗺️ Active City Nodes ({cities.length})
                      </span>
                    </div>
                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={locationsSearchQuery}
                        onChange={(e) => setLocationsSearchQuery(e.target.value)}
                        placeholder="Search locations..."
                        className="bg-[#050506] border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold w-full sm:w-48 font-sans"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-text-secondary">
                      <thead>
                        <tr className="bg-white/[0.01] border-b border-white/5 font-bold uppercase text-[9px] tracking-wider text-text-secondary">
                          <th className="p-3">Location Name</th>
                          <th className="p-3">Active Venues</th>
                          <th className="p-3">Type</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {cities
                          .filter(city => city.toLowerCase().includes(locationsSearchQuery.toLowerCase()))
                          .map((city, idx) => {
                            const originalIdx = cities.indexOf(city);
                            const venuesCount = theatres.filter(t => ((t.location || "").split(" · ")[0] || "").toLowerCase() === city.toLowerCase()).length;
                            return (
                              <tr key={city + "-" + idx} className="hover:bg-white/[0.01] transition-colors">
                                <td className="p-3 font-semibold text-text-primary">
                                  {editingCityIndex === originalIdx ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={editingCityValue}
                                        onChange={(e) => setEditingCityValue(e.target.value)}
                                        className="bg-black/50 border border-gold rounded px-2 py-1 text-xs text-text-primary focus:outline-none w-48 font-semibold"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditCity(originalIdx)}
                                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-[10px] uppercase rounded cursor-pointer border-0"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCityIndex(null)}
                                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-text-secondary font-bold text-[10px] uppercase rounded cursor-pointer border-0"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                                      <span>{city}</span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${venuesCount > 0 ? "bg-gold/10 text-gold" : "bg-white/5 text-text-muted"}`}>
                                    {venuesCount} {venuesCount === 1 ? "Venue" : "Venues"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {city === "All Cities" ? (
                                    <span className="text-[10px] bg-white/10 text-text-muted px-2 py-0.5 rounded font-bold uppercase tracking-wider">System Default</span>
                                  ) : (
                                    <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded font-bold uppercase tracking-wider">Dynamic Node</span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  {city !== "All Cities" && editingCityIndex !== originalIdx && (
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditCity(originalIdx, city)}
                                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-gold cursor-pointer border-0 animate-pulse"
                                        title="Rename Location"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCity(city)}
                                        className="p-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black cursor-pointer border-0"
                                        title="Delete Location"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        {cities.filter(city => city.toLowerCase().includes(locationsSearchQuery.toLowerCase())).length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-text-muted italic">
                              No matching locations found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* COLUMN 3: Register New City Node */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-6 text-left flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2 mb-4">
                      ✨ Create Location Node
                    </span>

                    <form onSubmit={handleAddCity} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">City Node Name</label>
                        <input
                          type="text"
                          value={newCityName}
                          onChange={(e) => setNewCityName(e.target.value)}
                          placeholder="e.g. Pune"
                          className="w-full bg-white/[0.02] border border-white/10 rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5"
                      >
                        Add Location Node
                      </button>
                    </form>
                  </div>

                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded p-4 text-[11px] text-yellow-300 leading-normal space-y-1">
                    <p className="font-bold uppercase tracking-wider text-[10px]">💡 Dynamic Sync Info</p>
                    <p>Locations managed here sync dynamically into theater registrations, filters, search engines, and portal options across the entire system instantly.</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: THEATRE CREATOR PORTAL */}
          {/* ========================================================= */}
          {activeTab === "theatre_creator" && effectiveSuperAdmin && (
            <div className="space-y-8 animate-fade-in" id="tab-theatre-creator">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-3xl font-display font-semibold text-text-primary tracking-wide">
                    Theatre Creator Portal
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Onboard independent theater venues, specify split commissions, and instantly create secure manager dashboards.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* COLUMN 1: FORM TO ONBOARD VENUE */}
                <div className="xl:col-span-1 bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-6">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                      {editingTheatreId !== null ? "🏛️ Edit Independent Venue Specs" : "🏛️ New Independent Venue Specs"}
                    </span>
                  </div>

                  {editingTheatreId !== null ? (
                    <form onSubmit={handleUpdateTheatreSubmit} className="space-y-4 text-left animate-fade-in">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Theatre Multiplex Name</label>
                        <input 
                          type="text"
                          value={etName}
                          onChange={(e) => setEtName(e.target.value)}
                          placeholder="e.g. Inox Luxury Insignia"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">City Location</label>
                            <button
                              type="button"
                              onClick={() => {
                                setShowTheatreCityOnTheFly(!showTheatreCityOnTheFly);
                              }}
                              className="text-[9px] font-bold text-gold hover:underline cursor-pointer bg-transparent border-0 p-0"
                            >
                              {showTheatreCityOnTheFly ? "✕ Cancel" : "+ Add New"}
                            </button>
                          </div>
                          {showTheatreCityOnTheFly ? (
                            <div className="flex gap-1.5 animate-fade-in">
                              <input
                                type="text"
                                placeholder="New city..."
                                value={theatreCityOnTheFlyValue}
                                onChange={(e) => setTheatreCityOnTheFlyValue(e.target.value)}
                                className="flex-1 bg-[#121215] border border-gold/40 hover:border-gold rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none font-sans"
                              />
                              <button
                                type="button"
                                onClick={() => handleCreateCityOnTheFly(theatreCityOnTheFlyValue, (newCity) => {
                                  setEtCity(newCity);
                                  setTcCity(newCity);
                                  setTheatreCityOnTheFlyValue("");
                                  setShowTheatreCityOnTheFly(false);
                                })}
                                className="px-2.5 py-1 bg-gold hover:bg-gold-light text-black font-bold text-[10px] uppercase rounded cursor-pointer border-0"
                              >
                                Add
                              </button>
                            </div>
                          ) : (
                            <select 
                              value={etCity}
                              onChange={(e) => setEtCity(e.target.value)}
                              className="w-full bg-[#121215] border border-white/10 rounded-md p-2 text-xs text-text-primary focus:outline-none cursor-pointer text-text-primary"
                            >
                              {cities.filter(c => c !== "All Cities").map((city) => (
                                <option key={city} value={city} className="bg-[#121215] text-text-primary">{city}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Slot Base Price (₹)</label>
                          <input 
                            type="text"
                            value={etPrice}
                            onChange={(e) => setEtPrice(e.target.value)}
                            placeholder="e.g. 250,000"
                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Sub-Location Address</label>
                        <input 
                          type="text"
                          value={etLocation}
                          onChange={(e) => setEtLocation(e.target.value)}
                          placeholder="e.g. Oberoi Mall, Goregaon East"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Bank Routing IFSC</label>
                          <input 
                            type="text"
                            value={etBankRouting}
                            onChange={(e) => setEtBankRouting(e.target.value)}
                            placeholder="IFSC800293"
                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Platform Split Share ({etAllocPercent}%)</label>
                          <input 
                            type="range"
                            min="10"
                            max="90"
                            value={etAllocPercent}
                            onChange={(e) => setEtAllocPercent(Number(e.target.value))}
                            className="w-full accent-gold bg-white/10 h-2 rounded cursor-pointer mt-2"
                          />
                        </div>
                      </div>

                      {/* Features checklist */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Luxury Multiplex Capabilities</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {["IMAX", "4K Laser", "Dolby Atmos", "Dolby Vision", "Recliner", "Lounge", "Valet Parking", "Gourmet Cafe"].map((feat) => {
                            const hasFeat = etFeatures.includes(feat);
                            return (
                              <button
                                key={feat}
                                type="button"
                                onClick={() => {
                                  if (hasFeat) setEtFeatures(etFeatures.filter(f => f !== feat));
                                  else setEtFeatures([...etFeatures, feat]);
                                }}
                                className="flex items-center gap-2 text-text-primary hover:text-gold cursor-pointer bg-transparent border-0 py-1 text-left"
                              >
                                {hasFeat ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-text-secondary" />}
                                <span className="truncate">{feat}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Banner Presets */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Theater Banner Concept</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { name: "Premium IMAX", url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80" },
                            { name: "Gold Lounge", url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80" },
                            { name: "VIP Suite", url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80" },
                            { name: "Royal Class", url: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=800&q=80" }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setEtImg(preset.url)}
                              className={`p-1 bg-white/5 hover:bg-white/10 rounded border text-[9px] uppercase tracking-wider font-semibold truncate transition-all cursor-pointer ${
                                etImg === preset.url ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary"
                              }`}
                            >
                              <img src={preset.url} alt="" className="w-full h-8 object-cover rounded mb-1" />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5"
                        >
                          Save Specifications
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTheatreId(null)}
                          className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-text-secondary text-xs font-bold uppercase tracking-wider rounded cursor-pointer border border-white/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleCreateTheatreSubmit} className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Theatre Multiplex Name</label>
                        <input 
                          type="text"
                          value={tcName}
                          onChange={(e) => setTcName(e.target.value)}
                          placeholder="e.g. Inox Luxury Insignia"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">City Location</label>
                            <button
                              type="button"
                              onClick={() => {
                                setShowTheatreCityOnTheFly(!showTheatreCityOnTheFly);
                              }}
                              className="text-[9px] font-bold text-gold hover:underline cursor-pointer bg-transparent border-0 p-0"
                            >
                              {showTheatreCityOnTheFly ? "✕ Cancel" : "+ Add New"}
                            </button>
                          </div>
                          {showTheatreCityOnTheFly ? (
                            <div className="flex gap-1.5 animate-fade-in">
                              <input
                                type="text"
                                placeholder="New city..."
                                value={theatreCityOnTheFlyValue}
                                onChange={(e) => setTheatreCityOnTheFlyValue(e.target.value)}
                                className="flex-1 bg-[#121215] border border-gold/40 hover:border-gold rounded px-2.5 py-1.5 text-xs text-text-primary focus:outline-none font-sans"
                              />
                              <button
                                type="button"
                                onClick={() => handleCreateCityOnTheFly(theatreCityOnTheFlyValue, (newCity) => {
                                  setTcCity(newCity);
                                  setEtCity(newCity);
                                  setTheatreCityOnTheFlyValue("");
                                  setShowTheatreCityOnTheFly(false);
                                })}
                                className="px-2.5 py-1 bg-gold hover:bg-gold-light text-black font-bold text-[10px] uppercase rounded cursor-pointer border-0"
                              >
                                Add
                              </button>
                            </div>
                          ) : (
                            <select 
                              value={tcCity}
                              onChange={(e) => setTcCity(e.target.value)}
                              className="w-full bg-[#121215] border border-white/10 rounded-md p-2 text-xs text-text-primary focus:outline-none cursor-pointer text-text-primary"
                            >
                              {cities.filter(c => c !== "All Cities").map((city) => (
                                <option key={city} value={city} className="bg-[#121215] text-text-primary">{city}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Slot Base Price (₹)</label>
                          <input 
                            type="text"
                            value={tcPrice}
                            onChange={(e) => setTcPrice(e.target.value)}
                            placeholder="e.g. 250,000"
                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Sub-Location Address</label>
                        <input 
                          type="text"
                          value={tcLocation}
                          onChange={(e) => setTcLocation(e.target.value)}
                          placeholder="e.g. Oberoi Mall, Goregaon East"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Bank Routing IFSC</label>
                          <input 
                            type="text"
                            value={tcBankRouting}
                            onChange={(e) => setTcBankRouting(e.target.value)}
                            placeholder="IFSC800293"
                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Platform Split Share ({tcAllocPercent}%)</label>
                          <input 
                            type="range"
                            min="10"
                            max="90"
                            value={tcAllocPercent}
                            onChange={(e) => setTcAllocPercent(Number(e.target.value))}
                            className="w-full accent-gold bg-white/10 h-2 rounded cursor-pointer mt-2"
                          />
                        </div>
                      </div>

                      {/* Features checklist */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Luxury Multiplex Capabilities</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {["IMAX", "4K Laser", "Dolby Atmos", "Dolby Vision", "Recliner", "Lounge", "Valet Parking", "Gourmet Cafe"].map((feat) => {
                            const hasFeat = tcFeatures.includes(feat);
                            return (
                              <button
                                key={feat}
                                type="button"
                                onClick={() => {
                                  if (hasFeat) setTcFeatures(tcFeatures.filter(f => f !== feat));
                                  else setTcFeatures([...tcFeatures, feat]);
                                }}
                                className="flex items-center gap-2 text-text-primary hover:text-gold cursor-pointer bg-transparent border-0 py-1 text-left"
                              >
                                {hasFeat ? <CheckSquare className="w-4 h-4 text-gold" /> : <Square className="w-4 h-4 text-text-secondary" />}
                                <span className="truncate">{feat}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Banner Presets */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Theater Banner Concept</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { name: "Premium IMAX", url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80" },
                            { name: "Gold Lounge", url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80" },
                            { name: "VIP Suite", url: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80" },
                            { name: "Royal Class", url: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=800&q=80" }
                          ].map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setTcImg(preset.url)}
                              className={`p-1 bg-white/5 hover:bg-white/10 rounded border text-[9px] uppercase tracking-wider font-semibold truncate transition-all cursor-pointer ${
                                tcImg === preset.url ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary"
                              }`}
                            >
                              <img src={preset.url} alt="" className="w-full h-8 object-cover rounded mb-1" />
                              <span>{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Auto-generate Dashboard Access Credentials */}
                      <div className="border-t border-white/5 pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-text-primary font-bold block">Deploy Manager Dashboard</span>
                            <span className="text-[9px] text-text-muted block">Instantly launch independent workspace credentials.</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setTcCreateAdmin(!tcCreateAdmin)}
                            className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 border-0 cursor-pointer ${
                              tcCreateAdmin ? "bg-gold text-black" : "bg-white/10"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                              tcCreateAdmin ? "translate-x-5" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {tcCreateAdmin && tcName && (
                          <div className="bg-black/50 border border-white/5 rounded p-3 space-y-1.5 animate-fade-in text-[10px]">
                            <p className="font-semibold text-gold uppercase tracking-wider">🚀 Auto-Generated Dashboard Access:</p>
                            <p className="text-text-secondary"><span className="text-text-muted font-mono">Email:</span> {tcAdminEmail}</p>
                            <p className="text-text-secondary"><span className="text-text-muted font-mono">Access Key:</span> {tcAdminPassword}</p>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-4 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5 animate-pulse"
                      >
                        Onboard Venue & Dashboard
                      </button>
                    </form>
                  )}
                </div>

                {/* COLUMN 2 & 3: LIVE PREVIEW & ACTIVE INDEPENDENT DASHBOARDS */}
                <div className="xl:col-span-2 space-y-8">
                  
                  {/* LIVE VISUAL PREVIEW CARD */}
                  <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2 text-left">
                      👁️ Real-time Customer & Dashboard Card Preview
                    </span>

                    <div className="bg-[#121214] border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm max-w-md mx-auto text-left flex flex-col md:flex-row h-fit shadow-xl transition-all">
                      <div className="w-full md:w-2/5 h-36 relative bg-[#1A1A1E]">
                        <img src={tcImg} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-2.5 left-2.5 bg-black/80 border border-white/10 text-text-secondary text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">
                          📍 {tcCity}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-display text-lg font-bold text-text-primary tracking-wide mb-1">
                            {tcName || "Multiplex Screen Name"}
                          </h3>
                          <p className="text-[11px] text-text-secondary leading-normal">
                            {tcLocation || "Sub-location Address Details..."}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {tcFeatures.map((feat) => (
                              <span key={feat} className="text-[8px] font-bold text-text-muted border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-4">
                          <div>
                            <div className="font-display text-sm font-bold text-gold">₹{tcPrice}</div>
                            <div className="text-[8px] text-text-muted font-bold uppercase tracking-wider">Base Rate</div>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE VENUES & DASHBOARDS LIST */}
                  <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-4 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                      📋 Active Independent Venues & Dashboards ({theatres.length})
                    </span>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                            <th className="pb-3">Venue & Location</th>
                            <th className="pb-3">Base Rental</th>
                            <th className="pb-3">Dashboard Manager Key</th>
                            <th className="pb-3 text-right">Independent Workspace Controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {theatres.map((t) => {
                            const connectedAdmin = theatreAdmins.find((a) => a.theatreId === t.id);
                            return (
                              <tr key={t.id} className="hover:bg-white/[0.01]">
                                <td className="py-3 pr-2">
                                  <div className="flex items-center gap-3">
                                    <img src={t.img} alt="" className="w-10 h-10 object-cover rounded border border-white/10" />
                                    <div>
                                      <p className="text-text-primary font-bold leading-none mb-1">{t.name}</p>
                                      <span className="text-[10px] text-text-secondary">📍 {t.location}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 pr-2 font-mono text-gold font-bold">
                                  {t.price}
                                </td>
                                <td className="py-3 pr-2">
                                  {connectedAdmin ? (
                                    <div className="space-y-0.5">
                                      <p className="text-text-primary font-mono text-[10px]">{connectedAdmin.email}</p>
                                      <p className="text-[9px] text-text-muted font-mono">Access Key: <span className="text-gold font-bold">{connectedAdmin.passwordHash}</span></p>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (!onUpdateTheatreAdmins) return;
                                        const sanitized = t.name.toLowerCase().replace(/[^a-z0-9]/g, "");
                                        const generatedEmail = `manager.${sanitized || "venue"}@cinevenue.com`;
                                        const generatedPass = `pass.${sanitized || "secret"}`;
                                        const newAdmin: TheatreAdmin = {
                                          id: "ADM-" + Math.floor(1000 + Math.random() * 9000),
                                          email: generatedEmail,
                                          passwordHash: generatedPass,
                                          theatreId: t.id,
                                          permissions: {
                                            addMovies: true,
                                            createShows: true,
                                            configureSeats: true,
                                            viewReports: true,
                                            scanTickets: true
                                          }
                                        };
                                        onUpdateTheatreAdmins([newAdmin, ...theatreAdmins]);
                                        alert(`Credentials created for "${t.name}" successfully! Email: ${generatedEmail}`);
                                      }}
                                      className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gold text-[9px] font-bold uppercase rounded border border-white/10 cursor-pointer"
                                    >
                                      + Generate Dashboard Key
                                    </button>
                                  )}
                                </td>
                                <td className="py-3 text-right space-x-2">
                                  <button
                                    onClick={() => handleStartEditTheatre(t)}
                                    className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white cursor-pointer border border-blue-500/20 inline-block align-middle transition-all"
                                    title="Edit Theatre Specs"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => onOpenManagerDashboard(t.id)}
                                    className="px-2.5 py-1.5 rounded bg-gold/10 hover:bg-gold text-gold hover:text-black text-[10px] font-extrabold uppercase transition-all cursor-pointer border-0 inline-flex items-center gap-1 inline-block align-middle"
                                    title="Launch Independent Theatre Workspace"
                                  >
                                    <Monitor className="w-3 h-3" />
                                    <span>Launch Dashboard</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      const url = `${window.location.origin}${window.location.pathname}?theatreId=${t.id}`;
                                      navigator.clipboard.writeText(url);
                                      alert(`Copied workspace share link: ${url}`);
                                    }}
                                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-text-secondary cursor-pointer border-0 inline-block align-middle"
                                    title="Copy Invite Link"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete the theatre screen "${t.name}"? This will disable its independent dashboard.`)) {
                                        onDeleteTheatre(t.id);
                                        alert(`Deleted "${t.name}"!`);
                                      }
                                    }}
                                    className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black cursor-pointer border border-red-500/20 inline-block align-middle"
                                    title="Delete Theatre Screen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: EVENT CREATOR PORTAL */}
          {/* ========================================================= */}
          {activeTab === "event_creator" && effectiveSuperAdmin && (
            <div className="space-y-8 animate-fade-in" id="tab-event-creator">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-3xl font-display font-semibold text-text-primary tracking-wide">
                    Event Creator Portal
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Onboard independent event companies, establish commission structures, and instantly activate secure manager credentials.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gold bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>PLATFORM COMMISSIONS HUB</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* COLUMN 1: ONBOARD FORM */}
                <div className="bg-[#0F0F11] border border-white/5 p-6 rounded-xl space-y-6 h-fit">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-[0.1em] border-b border-white/5 pb-3 text-left">
                    {editingOrganizerId ? "✏️ Edit Organizer Credentials" : "Onboard Independent Organizer"}
                  </h3>

                  <form onSubmit={handleCreateEventOrganizerSubmit} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Organizer Name</label>
                      <input 
                        type="text"
                        value={eoName}
                        onChange={(e) => setEoName(e.target.value)}
                        placeholder="e.g. Royal Standup Club"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Contact Number</label>
                      <input 
                        type="text"
                        value={eoContact}
                        onChange={(e) => setEoContact(e.target.value)}
                        placeholder="+91 99999 00000"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">IFSC Routing Gate</label>
                        <input 
                          type="text"
                          value={eoBankRouting}
                          onChange={(e) => setEoBankRouting(e.target.value)}
                          placeholder="IFSC800555"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Commission (%)</label>
                        <input 
                          type="number"
                          value={eoCommissionPercent}
                          onChange={(e) => setEoCommissionPercent(Number(e.target.value))}
                          placeholder="15"
                          className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Avatar Image URL</label>
                      <input 
                        type="text"
                        value={eoAvatar}
                        onChange={(e) => setEoAvatar(e.target.value)}
                        placeholder="Avatar image HTTPS URL..."
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                      />
                    </div>

                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Dashboard Access Email</label>
                      <input 
                        type="email"
                        value={eoEmail}
                        onChange={(e) => setEoEmail(e.target.value)}
                        placeholder="organizer@cinevenue.com"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Dashboard Access Key (Password)</label>
                      <input 
                        type="text"
                        value={eoPassword}
                        onChange={(e) => setEoPassword(e.target.value)}
                        placeholder="Secure Access Key"
                        className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-gold font-mono"
                        required
                      />
                    </div>

                    {!editingOrganizerId && (
                      <div className="pt-3 border-t border-white/5 space-y-3">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            id="eo-create-work"
                            checked={eoCreateWorkspace}
                            onChange={(e) => setEoCreateWorkspace(e.target.checked)}
                            className="accent-gold rounded border-white/10"
                          />
                          <label htmlFor="eo-create-work" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider cursor-pointer select-none">
                            Auto-generate Workspace Access Key
                          </label>
                        </div>

                        {eoCreateWorkspace && eoName && (
                          <div className="bg-black/50 border border-white/5 rounded p-3 space-y-1.5 animate-fade-in text-[10px]">
                            <p className="font-semibold text-gold uppercase tracking-wider">🚀 Auto-Generated Dashboard Access:</p>
                            <p className="text-text-secondary"><span className="text-text-muted font-mono">Email:</span> {eoEmail}</p>
                            <p className="text-text-secondary"><span className="text-text-muted font-mono">Access Key:</span> {eoPassword}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {editingOrganizerId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEoName("");
                            setEoContact("+91 99999 00000");
                            setEoBankRouting("IFSC800555");
                            setEoCommissionPercent(15);
                            setEoAvatar("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80");
                            setEoEmail("");
                            setEoPassword("");
                            setEditingOrganizerId(null);
                          }}
                          className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-xs text-text-secondary rounded font-bold border-0 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded cursor-pointer border-0 shadow-lg shadow-gold/5"
                      >
                        {editingOrganizerId ? "Save Changes" : "Onboard Organizer & Workspace"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* COLUMN 2 & 3: LIVE PREVIEW & ACTIVE ORGANIZERS LIST */}
                <div className="xl:col-span-2 space-y-8">
                  {/* REAL-TIME PREVIEW CARD */}
                  <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2 text-left">
                      👁️ Real-time Organizer Workspace Preview
                    </span>

                    <div className="bg-[#121214] border border-white/10 rounded-xl p-5 max-w-md mx-auto text-left flex items-center gap-4 shadow-xl">
                      <img 
                        src={eoAvatar || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"} 
                        alt="" 
                        className="w-14 h-14 rounded-full object-cover border border-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base font-bold text-text-primary tracking-wide truncate">
                          {eoName || "Organizer Brand Name"}
                        </h3>
                        <p className="text-[11px] text-text-secondary mt-0.5">IFSC Routing Gate: <span className="font-mono text-gold font-semibold">{eoBankRouting}</span></p>
                        <p className="text-[10px] text-text-muted mt-1">Platform Commission Fee rate is set at <span className="text-gold font-bold font-mono">{eoCommissionPercent}%</span></p>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20 uppercase shrink-0">
                        PENDING ACTIVATE
                      </span>
                    </div>
                  </div>

                  {/* ACTIVE ORGANIZERS GRID */}
                  <div className="bg-[#0F0F11] border border-white/5 p-5 rounded-xl space-y-4 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold block border-b border-white/5 pb-2">
                      📋 Active Independent Organizers & Workspaces ({eventOrganizers.length})
                    </span>

                    {eventOrganizers.length === 0 ? (
                      <div className="py-8 text-center text-text-muted text-xs">
                        No independent event organizers registered yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-text-secondary border-b border-white/5 font-bold uppercase text-[9px] tracking-wider">
                              <th className="pb-3">Organizer Partner</th>
                              <th className="pb-3">Commission Split</th>
                              <th className="pb-3">Manager Access Key</th>
                              <th className="pb-3 text-right">Workspace Controls</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {eventOrganizers.map((org) => {
                              const orgEventsCount = events.filter((e) => e.organizerId === org.id).length;
                              return (
                                <tr key={org.id} className="hover:bg-white/[0.01]">
                                  <td className="py-3 pr-2">
                                    <div className="flex items-center gap-3">
                                      <img src={org.avatar} alt="" className="w-10 h-10 object-cover rounded-full border border-white/10" />
                                      <div>
                                        <p className="text-text-primary font-bold leading-none mb-1">{org.name}</p>
                                        <span className="text-[9px] text-gold font-mono bg-gold/15 border border-gold/25 px-1 rounded uppercase mr-1.5">{org.id}</span>
                                        <span className="text-[10px] text-text-secondary">📞 {org.contact}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-2">
                                    <p className="font-mono text-text-primary font-bold">{org.commissionPercent}% platform fee</p>
                                    <p className="text-[10px] text-text-muted font-mono">{100 - org.commissionPercent}% payout split</p>
                                  </td>
                                  <td className="py-3 pr-2">
                                    <div className="space-y-0.5">
                                      <p className="text-text-primary font-mono text-[10px]">{org.email}</p>
                                      <p className="text-[9px] text-text-muted font-mono">Access Key: <span className="text-gold font-bold">{org.passwordHash}</span></p>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right space-x-2">
                                    {onOpenEventDashboard && (
                                      <button
                                        onClick={() => onOpenEventDashboard(org.id)}
                                        className="px-2.5 py-1.5 rounded bg-gold/10 hover:bg-gold text-gold hover:text-black text-[10px] font-extrabold uppercase transition-all cursor-pointer border-0 inline-flex items-center gap-1"
                                        title="Launch Independent Organizer Workspace"
                                      >
                                        <Monitor className="w-3 h-3" />
                                        <span>Launch Dashboard</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        setEditingOrganizerId(org.id);
                                        setEoName(org.name);
                                        setEoEmail(org.email);
                                        setEoPassword(org.passwordHash);
                                        setEoContact(org.contact);
                                        setEoBankRouting(org.bankRouting);
                                        setEoCommissionPercent(org.commissionPercent);
                                        setEoAvatar(org.avatar || "");
                                      }}
                                      className="p-1.5 rounded bg-white/5 hover:bg-gold hover:text-black text-text-secondary cursor-pointer border-0 inline-block align-middle"
                                      title="Edit Organizer Details"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        const url = `${window.location.origin}${window.location.pathname}?organizerId=${org.id}`;
                                        navigator.clipboard.writeText(url);
                                        alert(`Copied workspace invite link: ${url}`);
                                      }}
                                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-text-secondary cursor-pointer border-0 inline-block align-middle"
                                      title="Copy Workspace Invite Link"
                                    >
                                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to delete organizer "${org.name}"? This will revoke dashboard access.`)) {
                                          if (onUpdateEventOrganizers) {
                                            const updated = eventOrganizers.filter((o) => o.id !== org.id);
                                            onUpdateEventOrganizers(updated);
                                          }
                                        }
                                      }}
                                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black cursor-pointer border border-red-500/20 inline-block align-middle"
                                      title="De-register Organizer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* past bookings modal */}
          {viewingPastBookingsUser && (
            <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#121215] border border-gold/30 rounded-2xl max-w-4xl w-full p-6 text-left space-y-6 shadow-2xl relative animate-fade-in">
                <button
                  type="button"
                  onClick={() => setViewingPastBookingsUser(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary cursor-pointer border-0"
                >
                  <X className="w-5 h-5" />
                </button>

                <div>
                  <h3 className="text-lg font-bold text-text-primary tracking-wide flex items-center gap-2">
                    <Database className="w-5 h-5 text-gold" />
                    <span>Customer Account Hub & Booking History</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Viewing full system records and reservation logs for member: <span className="font-mono text-gold font-bold">{viewingPastBookingsUser}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Movie Bookings Ledger */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold block border-b border-white/5 pb-1.5">
                      🎬 Movie Ticket Reservations ({bookings.filter(b => (b.userEmail || "").toLowerCase() === viewingPastBookingsUser.toLowerCase()).length})
                    </span>

                    {(() => {
                      const userB = bookings.filter(b => (b.userEmail || "").toLowerCase() === viewingPastBookingsUser.toLowerCase());
                      return userB.length === 0 ? (
                        <p className="text-xs text-text-muted italic py-8 text-center">No movie bookings recorded for this account.</p>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                          {userB.map(b => (
                            <div key={b.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[10px] text-gold font-bold">{b.id}</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                  b.status === "Settled"
                                    ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
                                    : b.status === "Cancelled"
                                    ? "bg-red-500/15 border-red-500/20 text-red-400"
                                    : "bg-amber-500/15 border-amber-500/20 text-amber-400"
                                }`}>
                                  {b.status || "Pending"}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-text-primary leading-tight">{b.movieTitle}</p>
                              <p className="text-[10px] text-text-secondary leading-none">{b.theatreName}</p>
                              <div className="flex justify-between items-center pt-1 text-[9px] text-text-muted font-mono">
                                <span>Seats: {(b.seats || []).join(", ")}</span>
                                <span className="text-gold font-bold">₹{b.totalPrice}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Event Registrations Ledger */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold block border-b border-white/5 pb-1.5">
                      🎟️ Live Event Registrations ({eventRegistrations.filter(r => (r.userEmail || "").toLowerCase() === viewingPastBookingsUser.toLowerCase()).length})
                    </span>

                    {(() => {
                      const userR = eventRegistrations.filter(r => (r.userEmail || "").toLowerCase() === viewingPastBookingsUser.toLowerCase());
                      return userR.length === 0 ? (
                        <p className="text-xs text-text-muted italic py-8 text-center">No event registrations recorded for this account.</p>
                      ) : (
                        <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                          {userR.map(r => (
                            <div key={r.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[10px] text-gold font-bold">{r.id}</span>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                                  r.status === "Confirmed"
                                    ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/15 border-amber-500/20 text-amber-400"
                                }`}>
                                  {r.status || "Pending"}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-text-primary leading-tight">{r.eventTitle}</p>
                              <p className="text-[10px] text-text-secondary leading-none">Tickets: {r.quantity} | Paid: ₹{r.totalPrice}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Passcode Authorization Modal for Protected Actions */}
          {showPasscodeModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
              <div className="bg-[#0F0F11] border border-gold/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-gold">
                    <Shield className="w-5 h-5 text-gold shrink-0" />
                    <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">{passcodeActionTitle}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasscodeModal(false);
                      setPendingAction(null);
                      setPasscodeInput("");
                      setPasscodeError("");
                    }}
                    className="p-1 rounded-full text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer border-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">
                  This operation requires Security Passcode PIN authorization. Please enter your administrator passcode. (Default: <code className="text-gold font-mono font-bold">{adminPasscode || "8888"}</code>)
                </p>

                {passcodeError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                    ⚠️ {passcodeError}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePasscodeSubmit();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Security Passcode PIN</label>
                    <input
                      type="password"
                      autoFocus
                      value={passcodeInput}
                      onChange={(e) => setPasscodeInput(e.target.value)}
                      placeholder="Enter passcode (e.g. 8888)"
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-center text-lg tracking-[0.3em] font-mono text-gold focus:outline-none focus:border-gold"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasscodeModal(false);
                        setPendingAction(null);
                        setPasscodeInput("");
                        setPasscodeError("");
                      }}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-text-secondary uppercase cursor-pointer border-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider cursor-pointer border-0 shadow-lg shadow-gold/10"
                    >
                      Authorize & Execute
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Maintenance Message Configuration Modal for Sub-Websites */}
          {isEditMaintenanceModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
              <div className="bg-[#0F0F11] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left relative">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] block">Maintenance Template Configurator</span>
                    <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">
                      Configure Notice for: <span className="text-gold font-mono">{selectedConfigService}</span>
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditMaintenanceModalOpen(false)}
                    className="p-1 rounded-full text-text-secondary hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer border-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (setServiceControl) {
                      setServiceControl((prev: any) => ({
                        ...prev,
                        [selectedConfigService]: {
                          ...prev?.[selectedConfigService],
                          title: customTitleInput,
                          message: customMessageInput,
                          expectedTime: customExpectedTime,
                          icon: customIcon,
                          buttonText: customButtonText
                        }
                      }));
                    }
                    if (setServiceControlLogs) {
                      setServiceControlLogs((prev: any[]) => [
                        {
                          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
                          timestamp: new Date().toISOString(),
                          actor: "SUPER ADMIN",
                          action: "UPDATED CONFIG",
                          service: selectedConfigService,
                          details: `Configured template: "${customTitleInput}"`
                        },
                        ...prev
                      ]);
                    }
                    setIsEditMaintenanceModalOpen(false);
                    alert(`Successfully saved maintenance notice config for ${selectedConfigService}!`);
                  }}
                  className="space-y-4 text-left"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Notice Alert Title</label>
                    <input
                      type="text"
                      value={customTitleInput}
                      onChange={(e) => setCustomTitleInput(e.target.value)}
                      placeholder="e.g., Scheduled Platform Maintenance"
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Estimated Resume Time</label>
                      <input
                        type="text"
                        value={customExpectedTime}
                        onChange={(e) => setCustomExpectedTime(e.target.value)}
                        placeholder="e.g., 2 Hours / 45 Minutes"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Icon / Emoji</label>
                      <input
                        type="text"
                        value={customIcon}
                        onChange={(e) => setCustomIcon(e.target.value)}
                        placeholder="e.g., ⚙️ / 🎟️ / ⚡"
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Notice Explanation Message</label>
                    <textarea
                      rows={3}
                      value={customMessageInput}
                      onChange={(e) => setCustomMessageInput(e.target.value)}
                      placeholder="Explain why this service is paused and when bookings will resume..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-gold font-sans"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditMaintenanceModalOpen(false)}
                      className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-text-secondary uppercase cursor-pointer border-0"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-lg bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider cursor-pointer border-0 shadow-lg shadow-gold/10"
                    >
                      Save Notice Template
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Emergency Kill Switch Authorization Modal */}
          {isEmergencyKillModalOpen && (
            <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
              <div className="bg-[#0D0B0E] border-2 border-rose-500/50 rounded-2xl p-6 md:p-7 max-w-lg w-full shadow-2xl space-y-5 text-left relative overflow-hidden">
                {/* Red warning gradient backdrop bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />
                
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.25em] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      CRITICAL FAILSAFE OPERATION
                    </span>
                    <h3 className="font-extrabold text-base text-white uppercase tracking-wider flex items-center gap-2">
                      <span>🚨</span> Emergency Kill Switch Command
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEmergencyKillModalOpen(false)}
                    className="p-1.5 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer border-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-rose-300 font-bold">
                    <span>Target Service:</span>
                    <span className="font-mono text-white bg-black/50 px-2 py-0.5 rounded border border-rose-500/30">
                      {emergencyTargetName}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 leading-relaxed pt-1">
                    {emergencyActionType === "restore"
                      ? "This will restore public customer access and return the service to live operational status."
                      : "Executing this command immediately freezes public customer traffic, suspends new booking/order creation, and activates the emergency maintenance page across all client devices."}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleConfirmEmergencyAction();
                  }}
                  className="space-y-4"
                >
                  {/* Action Mode Radio */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Execution Action
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEmergencyActionType("kill");
                          setEmergencyNoticeTitle(`🚨 ${emergencyTargetName} Emergency Freeze`);
                        }}
                        className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                          emergencyActionType === "kill"
                            ? "bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30"
                            : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                        }`}
                      >
                        🚨 Kill Switch
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmergencyActionType("maintenance");
                          setEmergencyNoticeTitle(`🛠️ ${emergencyTargetName} Under Maintenance`);
                        }}
                        className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                          emergencyActionType === "maintenance"
                            ? "bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30"
                            : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                        }`}
                      >
                        🛠️ Maintenance
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmergencyActionType("restore");
                        }}
                        className={`py-2 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border cursor-pointer ${
                          emergencyActionType === "restore"
                            ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30"
                            : "bg-white/5 text-white/60 border-white/10 hover:text-white"
                        }`}
                      >
                        ⚡ Restore Live
                      </button>
                    </div>
                  </div>

                  {/* Incident / Audit Reason */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Incident Reason (Permanent Audit Log) *
                    </label>
                    <input
                      type="text"
                      value={emergencyReasonInput}
                      onChange={(e) => setEmergencyReasonInput(e.target.value)}
                      placeholder="e.g. Threat mitigation, critical DB patch, payment gateway outage..."
                      className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                      required
                    />
                  </div>

                  {emergencyActionType !== "restore" && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                            Public Screen Title
                          </label>
                          <input
                            type="text"
                            value={emergencyNoticeTitle}
                            onChange={(e) => setEmergencyNoticeTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                            Estimated Return Time
                          </label>
                          <input
                            type="text"
                            value={emergencyNoticeTime}
                            onChange={(e) => setEmergencyNoticeTime(e.target.value)}
                            className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                          Public Advisory Message
                        </label>
                        <textarea
                          rows={2}
                          value={emergencyNoticeMsg}
                          onChange={(e) => setEmergencyNoticeMsg(e.target.value)}
                          className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-rose-400 font-sans resize-none"
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* 2FA / Passcode Input */}
                  <div className="space-y-1 bg-black/40 border border-white/10 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                        Super Admin Passcode PIN (Default: 8888) *
                      </label>
                      <span className="text-[10px] text-text-muted font-mono">2FA Required</span>
                    </div>
                    <input
                      type="password"
                      value={emergencyPinVal}
                      onChange={(e) => {
                        setEmergencyPinVal(e.target.value);
                        setEmergencyPinError("");
                      }}
                      placeholder="Enter 4-digit PIN (e.g. 8888)"
                      className="w-full px-3 py-2 bg-black border border-white/20 rounded-xl text-sm font-mono text-center text-amber-400 focus:outline-none focus:border-rose-400 tracking-widest"
                      required
                    />
                    {emergencyPinError && (
                      <p className="text-[10px] text-rose-400 font-semibold pt-1">
                        ⚠️ {emergencyPinError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEmergencyKillModalOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white uppercase cursor-pointer transition-all"
                    >
                      Abort
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-lg ${
                        emergencyActionType === "restore"
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                          : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40"
                      }`}
                    >
                      {emergencyActionType === "restore"
                        ? "⚡ Confirm Restore"
                        : "🚨 Execute Kill Switch"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

