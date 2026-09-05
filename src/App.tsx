import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSettings } from "./context/AppSettingsContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Featured from "./components/Featured";
import NowShowing from "./components/NowShowing";
import EventsShowcase from "./components/EventsShowcase";
import Theatres from "./components/Theatres";
import PrivateRental from "./components/PrivateRental";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";

// Modals
import AuthModal from "./components/AuthModal";
import BookingModal from "./components/BookingModal";
import RentalModal from "./components/RentalModal";
import AdminPanel from "./components/AdminPanel";
import TheatreManagerDashboard from "./components/TheatreManagerDashboard";
import EventManagerDashboard from "./components/EventManagerDashboard";
import OrdersModal from "./components/OrdersModal";
import UserDashboardModal from "./components/UserDashboardModal";
import InfoModal from "./components/InfoModal";

// Sub-Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import MovieDetails from "./pages/MovieDetails";
import TheatreSelection from "./pages/TheatreSelection";
import SeatBooking from "./pages/SeatBooking";
import Payment from "./pages/Payment";
import Ticket from "./pages/Ticket";
import BookingHistory from "./pages/BookingHistory";
import Home from "./pages/Home";
import MaintenancePage from "./components/MaintenancePage";
import EventsApp from "./pages/events/EventsApp";
import LegalPolicies from "./pages/LegalPolicies";
import Services from "./pages/Services";
import AuthCallback from "./pages/AuthCallback";
import MobileBottomNav from "./components/MobileBottomNav";

// Admin Sub-Pages
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import Dashboard from "./admin/Dashboard";
import Movies from "./admin/Movies";
import EditMovie from "./admin/EditMovie";
import Shows from "./admin/Shows";
import TheatresAdmin from "./admin/Theatres";
import SeatLayoutGenerator from "./admin/SeatLayoutGenerator";

// Protected Route Guard
import ProtectedRoute from "./components/ProtectedRoute";

import CineCoinsModule from "./components/cinecoins/CineCoinsModule";
import MyAccountModule from "./components/account/MyAccountModule";
import FilmProductionSubWebsite from "./components/productions/FilmProductionSubWebsite";
import CineCoinsAdminControl from "./components/admin/CineCoinsAdminControl";
import EventManagementHub from "./components/events/EventManagementHub";
import CreateEvent from "./pages/CreateEvent";
import { ProposalSubmitForm } from "./components/proposals/ProposalSubmitForm";
import { CustomerProposalsView } from "./components/proposals/CustomerProposalsView";
import CineVenueLogo from "./components/CineVenueLogo";
import LocationSelector from "./components/location/LocationSelector";
import { calculateDistance, getCoordinates } from "./lib/location";

// Default Data & Types
import { INITIAL_MOVIES, INITIAL_THEATRES, INITIAL_EVENTS, DEFAULT_SPOTLIGHT, CITIES, DEFAULT_CINECOINS_SETTINGS, DEFAULT_CINECOINS_REWARDS, DEFAULT_CINECOINS_CHALLENGES, DEFAULT_CINECOINS_TRANSACTIONS, DEFAULT_CINECOINS_USER_WALLET } from "./data";
import { Movie, Theatre, Booking, MovieSchedule, RentalRequest, ContactMessage, TheatreAdmin, Event, EventCategory, EventReview, EventRegistration, NotifyMeRequest, EventOrganizer, SpotlightMovie, UpiGatewaySettings, Advertisement, ServiceProposal, RealtimeMetricOverride, FooterPagesData, DEFAULT_FOOTER_PAGES_DATA, CineCoinsSettings, CineCoinsReward, CineCoinsChallenge, CineCoinsTransaction, CineCoinsUserWallet, CastingApplication } from "./types";

export default function App() {
  // 1. Core Data Lists (loaded from localStorage or INITIAL_X fallback)
  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem("cine_movies");
    return saved ? JSON.parse(saved) : INITIAL_MOVIES;
  });

  const [theatres, setTheatres] = useState<Theatre[]>(() => {
    const saved = localStorage.getItem("cine_theatres");
    return saved ? JSON.parse(saved) : INITIAL_THEATRES;
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem("cine_events");
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [spotlight, setSpotlight] = useState<SpotlightMovie>(() => {
    const saved = localStorage.getItem("cine_spotlight");
    return saved ? JSON.parse(saved) : DEFAULT_SPOTLIGHT;
  });

  const [schedules, setSchedules] = useState<MovieSchedule[]>(() => {
    const saved = localStorage.getItem("cine_schedules");
    return saved ? JSON.parse(saved) : [
      { id: "SCH-1", movieTitle: "Kalki 2898 AD", theatreName: "IMAX Prasads", timeSlot: "7:30 PM", pricePerSeat: 250, date: "Today", isDeployed: true },
      { id: "SCH-2", movieTitle: "Kalki 2898 AD", theatreName: "PVR Nexus", timeSlot: "10:30 AM", pricePerSeat: 220, date: "Today", isDeployed: true },
      { id: "SCH-3", movieTitle: "Stree 2", theatreName: "Cinepolis GVK", timeSlot: "4:00 PM", pricePerSeat: 200, date: "Today", isDeployed: true },
      { id: "SCH-4", movieTitle: "Deadpool & Wolverine", theatreName: "Sathyam Cinemas", timeSlot: "10:15 PM", pricePerSeat: 300, date: "Today", isDeployed: true }
    ];
  });

  // 2. Interactive user submittals
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(() => {
    const saved = localStorage.getItem("cine_rental_requests");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((r: any) => r.id !== "RENT-001");
  });

  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem("cine_contact_messages");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((m: any) => m.contact !== "siddharth@roycapital.in");
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("cine_bookings");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((b: any) => b.id !== "BK-829104" && !b.id?.startsWith("BK-290"));
  });

  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>(() => {
    const saved = localStorage.getItem("cine_event_registrations");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((e: any) => e.id !== "EV-REG-481920");
  });

  const [notifyMeRequests, setNotifyMeRequests] = useState<NotifyMeRequest[]>(() => {
    const saved = localStorage.getItem("cine_notify_me_requests");
    return saved ? JSON.parse(saved) : [];
  });

  // 5 Sub-Websites Customer Proposals State
  const [serviceProposals, setServiceProposals] = useState<ServiceProposal[]>(() => {
    const saved = localStorage.getItem("cine_service_proposals");
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.filter((p: any) => !["PROP-101", "PROP-102", "PROP-103", "PROP-104", "PROP-105"].includes(p.id));
  });

  const [metricOverrides, setMetricOverrides] = useState<RealtimeMetricOverride>(() => {
    const saved = localStorage.getItem("cine_metric_overrides");
    return saved ? JSON.parse(saved) : {};
  });

  // 3. User Membership accounts & Role Access lists
  const [theatreAdmins, setTheatreAdmins] = useState<TheatreAdmin[]>(() => {
    const saved = localStorage.getItem("cine_theatre_admins");
    return saved ? JSON.parse(saved) : [
      {
        id: "TA-001",
        email: "pvr.admin@cinevenue.com",
        passwordHash: "PvrAdmin123",
        theatreId: 1,
        permissions: { addMovies: true, createShows: true, configureSeats: true, viewReports: true, scanTickets: true }
      },
      {
        id: "TA-002",
        email: "imax.admin@cinevenue.com",
        passwordHash: "ImaxAdmin123",
        theatreId: 2,
        permissions: { addMovies: true, createShows: true, configureSeats: true, viewReports: true, scanTickets: true }
      }
    ];
  });

  // Centralized Global Server-Side Application Settings via Supabase
  const {
    settings: globalAppSettings,
    updateGlobalSettings
  } = useAppSettings();

  // Authoritative serviceControl derived from global Supabase settings
  const serviceControl = useMemo(() => {
    const remote = globalAppSettings.serviceControls || {};
    const isMaintenance = globalAppSettings.maintenanceMode === true;
    const isSubwebsiteEnabled = globalAppSettings.globalSubwebsiteEnabled === true;
    const subwebsiteNotice = globalAppSettings.subwebsiteMaintenanceMessage || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance.";

    return {
      website: {
        status: remote.website?.status !== false,
        title: remote.website?.title || "CineVenue Under Maintenance",
        message: remote.website?.message || "Our platform is currently undergoing scheduled updates. We'll be back online shortly.",
        expectedTime: remote.website?.expectedTime || "30 July 2026, 06:00 PM"
      },
      movieBooking: {
        // Authoritative: if maintenanceMode is ON, movieBooking is globally disabled
        status: !isMaintenance && (remote.movieBooking?.status !== false),
        title: globalAppSettings.maintenanceTitle || remote.movieBooking?.title || "Movie Booking Temporarily Unavailable",
        message: globalAppSettings.maintenanceMessage || remote.movieBooking?.message || "We're upgrading our ticket booking experience.\n\nMovie booking will be available shortly.",
        expectedTime: (typeof globalAppSettings.maintenanceEndTime === "string" ? globalAppSettings.maintenanceEndTime : null) || remote.movieBooking?.expectedTime || "30 July 2026, 06:00 PM",
        visitors: remote.movieBooking?.visitors || 1240
      },
      eventBooking: {
        status: isSubwebsiteEnabled && (remote.eventBooking?.status !== false),
        title: !isSubwebsiteEnabled ? "SUB-WEBSITE TEMPORARILY UNAVAILABLE" : (remote.eventBooking?.title || "Event Booking Temporarily Unavailable"),
        message: !isSubwebsiteEnabled ? subwebsiteNotice : (remote.eventBooking?.message || "Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon."),
        expectedTime: remote.eventBooking?.expectedTime || "31 July 2026, 10:00 AM",
        visitors: remote.eventBooking?.visitors || 327
      },
      filmProduction: {
        status: isSubwebsiteEnabled && (remote.filmProduction?.status !== false),
        title: !isSubwebsiteEnabled ? "SUB-WEBSITE TEMPORARILY UNAVAILABLE" : (remote.filmProduction?.title || "Film Production Division Under Maintenance"),
        message: !isSubwebsiteEnabled ? subwebsiteNotice : (remote.filmProduction?.message || "We're updating our production portfolio and services.\n\nFor urgent enquiries contact info.cinevenue@gmail.com"),
        expectedTime: remote.filmProduction?.expectedTime || "30 July 2026, 12:00 PM"
      },
      eventManagement: {
        status: isSubwebsiteEnabled && (remote.eventManagement?.status !== false),
        title: !isSubwebsiteEnabled ? "SUB-WEBSITE TEMPORARILY UNAVAILABLE" : (remote.eventManagement?.title || "Event Management Under Maintenance"),
        message: !isSubwebsiteEnabled ? subwebsiteNotice : (remote.eventManagement?.message || "Movie Promotions, Audio Launches, Celebrity Shows, and Corporate Events are temporarily unavailable.\n\nPlease visit again soon."),
        expectedTime: remote.eventManagement?.expectedTime || "31 July 2026, 02:00 PM"
      },
      brandPromotion: {
        status: isSubwebsiteEnabled && (remote.brandPromotion?.status !== false),
        title: !isSubwebsiteEnabled ? "SUB-WEBSITE TEMPORARILY UNAVAILABLE" : (remote.brandPromotion?.title || "Brand Promotion Under Maintenance"),
        message: !isSubwebsiteEnabled ? subwebsiteNotice : (remote.brandPromotion?.message || "Brand Promotion and Media Campaign services are under maintenance.\n\nWe'll be back shortly."),
        expectedTime: remote.brandPromotion?.expectedTime || "31 July 2026, 05:00 PM"
      },
      cinecoins: {
        status: remote.cinecoins?.status !== false && remote.cineCoinsLoyalty?.status !== false,
        title: remote.cinecoins?.title || remote.cineCoinsLoyalty?.title || "CineCoins Rewards Vault Under Maintenance",
        message: remote.cinecoins?.message || remote.cineCoinsLoyalty?.message || "CineCoins redemption, transfers, and wallet operations are undergoing scheduled updates.\n\nWe'll be back online shortly.",
        expectedTime: remote.cinecoins?.expectedTime || remote.cineCoinsLoyalty?.expectedTime || "31 July 2026, 06:00 PM"
      },
      cineCoinsLoyalty: {
        status: remote.cinecoins?.status !== false && remote.cineCoinsLoyalty?.status !== false,
        title: remote.cinecoins?.title || remote.cineCoinsLoyalty?.title || "CineCoins Rewards Vault Under Maintenance",
        message: remote.cinecoins?.message || remote.cineCoinsLoyalty?.message || "CineCoins redemption, transfers, and wallet operations are undergoing scheduled updates.\n\nWe'll be back online shortly.",
        expectedTime: remote.cinecoins?.expectedTime || remote.cineCoinsLoyalty?.expectedTime || "31 July 2026, 06:00 PM"
      }
    };
  }, [globalAppSettings]);

  const [serviceControlLogs, setServiceControlLogs] = useState<any[]>(() => [
    {
      id: "LOG-1",
      serviceKey: "movieBooking",
      changedBy: "superadmin@cinevenue.com",
      action: "EDIT",
      timestamp: "2026-08-04, 10:15 AM",
      reason: "Initial setup of maintenance schedules"
    }
  ]);

  const isMovieBookingSystemActive = serviceControl.movieBooking.status;
  const isEventBookingSystemActive = serviceControl.eventBooking.status;

  const setIsMovieBookingSystemActive = async (active: boolean) => {
    await updateGlobalSettings({
      maintenanceMode: !active,
      serviceControls: {
        ...(globalAppSettings.serviceControls || {}),
        movieBooking: {
          ...((globalAppSettings.serviceControls as any)?.movieBooking || {}),
          status: active
        }
      }
    });
  };

  const setIsEventBookingSystemActive = async (active: boolean) => {
    await updateGlobalSettings({
      serviceControls: {
        ...(globalAppSettings.serviceControls || {}),
        eventBooking: {
          ...((globalAppSettings.serviceControls as any)?.eventBooking || {}),
          status: active
        }
      }
    });
  };

  const setServiceControl = async (updater: any) => {
    const updated = typeof updater === "function" ? updater(serviceControl) : updater;
    const isMaintenance = updated.movieBooking?.status === false || updated.website?.status === false || updated.globalWebsite?.status === false;
    
    // Keep cinecoins and cineCoinsLoyalty in sync
    if (updated.cinecoins && !updated.cineCoinsLoyalty) {
      updated.cineCoinsLoyalty = { ...updated.cinecoins };
    } else if (updated.cineCoinsLoyalty && !updated.cinecoins) {
      updated.cinecoins = { ...updated.cineCoinsLoyalty };
    }

    await updateGlobalSettings({
      maintenanceMode: isMaintenance,
      maintenanceTitle: updated.movieBooking?.title || updated.website?.title || globalAppSettings.maintenanceTitle,
      maintenanceMessage: updated.movieBooking?.message || updated.website?.message || globalAppSettings.maintenanceMessage,
      maintenanceEndTime: updated.movieBooking?.expectedTime || updated.website?.expectedTime || globalAppSettings.maintenanceEndTime,
      serviceControls: updated
    });
  };

  // UPI Gateway & Ads State
  const [upiGatewaySettings, setUpiGatewaySettings] = useState<UpiGatewaySettings>(() => {
    const saved = localStorage.getItem("cine_upi_settings");
    return saved ? JSON.parse(saved) : {
      upiId: "cinevenue@ybl",
      accountHolderName: "CineVenue Entertainment Pvt Ltd",
      qrImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
      instructions: "Scan the QR code using Google Pay, PhonePe, or Paytm. Submit the 12-digit UTR reference number and upload payment screenshot.",
      supportMobile: "+91 9876543210"
    };
  });

  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
    const saved = localStorage.getItem("cine_advertisements");
    return saved ? JSON.parse(saved) : [
      {
        id: "AD-101",
        title: "IMAX Laser 3D Gala Festival",
        type: "hero_slider",
        imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
        targetUrl: "#exclusive-events",
        impressions: 1420,
        clicks: 185,
        status: "Active",
        startDate: "2026-07-01",
        endDate: "2026-07-31"
      }
    ];
  });

  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);

  // Footer pages editable content & info modal trigger
  const [footerPagesData, setFooterPagesData] = useState<FooterPagesData>(() => {
    const saved = localStorage.getItem("cine_footer_pages_data");
    return saved ? JSON.parse(saved) : DEFAULT_FOOTER_PAGES_DATA;
  });

  const [infoModalType, setInfoModalType] = useState<"about" | "privacy" | "terms" | "refund" | "cookie" | "user-agreement" | "contact" | null>(null);

  useEffect(() => {
    localStorage.setItem("cine_footer_pages_data", JSON.stringify(footerPagesData));
  }, [footerPagesData]);

  useEffect(() => {
    localStorage.setItem("cine_upi_settings", JSON.stringify(upiGatewaySettings));
  }, [upiGatewaySettings]);

  useEffect(() => {
    localStorage.setItem("cine_advertisements", JSON.stringify(advertisements));
  }, [advertisements]);

  // Payment Verification & UTR Handlers
  const handleVerifyBookingPayment = (bookingId: string, status: "Approved" | "Rejected") => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          paymentVerificationStatus: status,
          qrCodeData: status === "Approved" ? `CINEVENUE-MOVIE-${b.id}-${b.utrNumber || "OK"}` : undefined,
          status: status === "Approved" ? "Confirmed" as const : "Cancelled" as const
        };
      }
      return b;
    }));
  };

  const handleVerifyRegistrationPayment = (regId: string, status: "Approved" | "Rejected") => {
    setEventRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        return {
          ...r,
          paymentVerificationStatus: status,
          qrCodeData: status === "Approved" ? `CINEVENUE-EVENT-${r.id}-${r.utrNumber || "OK"}` : undefined,
          status: status === "Approved" ? "Confirmed" as const : "Cancelled" as const
        };
      }
      return r;
    }));
  };

  const handleUpdateBookingUtr = (bookingId: string, utr: string, screenshotUrl: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          utrNumber: utr,
          paymentScreenshot: screenshotUrl,
          paymentVerificationStatus: "Pending Review" as const
        };
      }
      return b;
    }));
  };

  const handleUpdateRegistrationUtr = (regId: string, utr: string, screenshotUrl: string) => {
    setEventRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        return {
          ...r,
          utrNumber: utr,
          paymentScreenshot: screenshotUrl,
          paymentVerificationStatus: "Pending Review" as const
        };
      }
      return r;
    }));
  };

  const handleRecordAdImpression = (adId: string) => {
    setAdvertisements(prev => prev.map(ad => ad.id === adId ? { ...ad, impressions: ad.impressions + 1 } : ad));
  };

  const handleRecordAdClick = (adId: string) => {
    setAdvertisements(prev => prev.map(ad => ad.id === adId ? { ...ad, clicks: ad.clicks + 1 } : ad));
  };

  // ON/OFF toggle handlers for individual Movies, Events, and Schedules
  const handleToggleMovieActive = (movieTitle: string) => {
    setMovies(prev => prev.map(m => m.title === movieTitle ? { ...m, isActive: m.isActive === false ? true : false } : m));
  };

  const handleToggleEventActive = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isActive: e.isActive === false ? true : false } : e));
  };

  const handleToggleScheduleActive = (scheduleId: string) => {
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, isActive: s.isActive === false ? true : false } : s));
  };

  const [eventOrganizers, setEventOrganizers] = useState<EventOrganizer[]>(() => {
    const saved = localStorage.getItem("cine_event_organizers");
    return saved ? JSON.parse(saved) : [
      {
        id: "EO-001",
        email: "sunburn.org@cinevenue.com",
        passwordHash: "Sunburn123",
        name: "Sunburn Arena Events",
        contact: "+91 99999 88888",
        bankRouting: "HDFC0000240",
        commissionPercent: 12,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
      },
      {
        id: "EO-002",
        email: "gala.org@cinevenue.com",
        passwordHash: "Gala123",
        name: "Epic Gala Organizers",
        contact: "+91 88888 77777",
        bankRouting: "ICIC0000104",
        commissionPercent: 10,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80"
      }
    ];
  });

  const [registeredUsers, setRegisteredUsers] = useState<{ email: string; passwordHash: string; joinedAt: string; mobile?: string; name?: string }[]>(() => {
    const saved = localStorage.getItem("cine_registered_users");
    return saved ? JSON.parse(saved) : [];
  });

  // Credentials settings — loaded from env vars, never hardcoded in source
  const [superAdminEmail, setSuperAdminEmail] = useState(() => localStorage.getItem("cine_sa_email") || (import.meta as any).env?.VITE_SUPER_ADMIN_EMAIL || "");
  const [superAdminPassword, setSuperAdminPassword] = useState(() => localStorage.getItem("cine_sa_pass") || (import.meta as any).env?.VITE_SUPER_ADMIN_PASSWORD || "");
  const [cities, setCities] = useState<string[]>(() => {
    const saved = localStorage.getItem("cine_cities");
    return saved ? JSON.parse(saved) : CITIES;
  });

  // Global App States
  const [selectedCity, setSelectedCityState] = useState(() => {
    return localStorage.getItem("cine_user_location") || "All Cities";
  });
  
  const setSelectedCity = (city: string) => {
    setSelectedCityState(city);
    localStorage.setItem("cine_user_location", city);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(() => localStorage.getItem("cine_user_email"));

  // Open Modals / Workspace Triggers
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const handleOpenAuth = (mode: "signin" | "signup" = "signin") => {
    setAuthMode(mode);
    setAuthOpen(true);
  };
  const [locationOpen, setLocationOpen] = useState(false);
  const [bookingMovieTitle, setBookingMovieTitle] = useState("");
  const [bookingTimeSlot, setBookingTimeSlot] = useState("7:30 PM");
  const [rentalOpen, setRentalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [activeTheatreId, setActiveTheatreId] = useState<number | null>(null);
  const [activeOrganizerId, setActiveOrganizerId] = useState<string | null>(null);

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem("cine_movies", JSON.stringify(movies));
  }, [movies]);
  useEffect(() => {
    localStorage.setItem("cine_theatres", JSON.stringify(theatres));
  }, [theatres]);
  useEffect(() => {
    localStorage.setItem("cine_events", JSON.stringify(events));
  }, [events]);
  useEffect(() => {
    localStorage.setItem("cine_spotlight", JSON.stringify(spotlight));
  }, [spotlight]);
  useEffect(() => {
    localStorage.setItem("cine_schedules", JSON.stringify(schedules));
  }, [schedules]);
  useEffect(() => {
    localStorage.setItem("cine_rental_requests", JSON.stringify(rentalRequests));
  }, [rentalRequests]);
  useEffect(() => {
    localStorage.setItem("cine_contact_messages", JSON.stringify(contactMessages));
  }, [contactMessages]);
  useEffect(() => {
    localStorage.setItem("cine_bookings", JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem("cine_event_registrations", JSON.stringify(eventRegistrations));
  }, [eventRegistrations]);
  useEffect(() => {
    localStorage.setItem("cine_notify_me_requests", JSON.stringify(notifyMeRequests));
  }, [notifyMeRequests]);
  useEffect(() => {
    localStorage.setItem("cine_theatre_admins", JSON.stringify(theatreAdmins));
  }, [theatreAdmins]);
  useEffect(() => {
    localStorage.setItem("cine_event_organizers", JSON.stringify(eventOrganizers));
  }, [eventOrganizers]);
  useEffect(() => {
    localStorage.setItem("cine_registered_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);
  useEffect(() => {
    localStorage.setItem("cine_sa_email", superAdminEmail);
  }, [superAdminEmail]);
  useEffect(() => {
    localStorage.setItem("cine_sa_pass", superAdminPassword);
  }, [superAdminPassword]);
  useEffect(() => {
    localStorage.setItem("cine_cities", JSON.stringify(cities));
  }, [cities]);
  useEffect(() => {
    localStorage.setItem("cine_service_proposals", JSON.stringify(serviceProposals));
  }, [serviceProposals]);
  useEffect(() => {
    localStorage.setItem("cine_metric_overrides", JSON.stringify(metricOverrides));
  }, [metricOverrides]);

  // CineCoins Loyalty System State
  const [cineCoinsSettings, setCineCoinsSettings] = useState<CineCoinsSettings>(() => {
    const saved = localStorage.getItem("cine_coins_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let mergedRewardRules = DEFAULT_CINECOINS_SETTINGS.rewardRules || [];
        if (Array.isArray(parsed.rewardRules) && parsed.rewardRules.length > 0) {
          mergedRewardRules = (DEFAULT_CINECOINS_SETTINGS.rewardRules || []).map(defRule => {
            const found = parsed.rewardRules.find((r: any) => r.activityKey === defRule.activityKey || r.id === defRule.id);
            return found ? { ...defRule, ...found } : defRule;
          });
        }
        return {
          ...DEFAULT_CINECOINS_SETTINGS,
          ...parsed,
          coinsPerUnit: parsed.coinsPerUnit || DEFAULT_CINECOINS_SETTINGS.coinsPerUnit,
          currencyValue: parsed.currencyValue || DEFAULT_CINECOINS_SETTINGS.currencyValue,
          coinValueRupees: parsed.coinValueRupees || DEFAULT_CINECOINS_SETTINGS.coinValueRupees,
          rewardRules: mergedRewardRules,
          conversionHistory: Array.isArray(parsed.conversionHistory) ? parsed.conversionHistory : DEFAULT_CINECOINS_SETTINGS.conversionHistory,
          rewardHistory: Array.isArray(parsed.rewardHistory) ? parsed.rewardHistory : DEFAULT_CINECOINS_SETTINGS.rewardHistory,
        };
      } catch (e) {
        return DEFAULT_CINECOINS_SETTINGS;
      }
    }
    return DEFAULT_CINECOINS_SETTINGS;
  });

  const [cineCoinsRewards, setCineCoinsRewards] = useState<CineCoinsReward[]>(() => {
    const saved = localStorage.getItem("cine_coins_rewards");
    return saved ? JSON.parse(saved) : DEFAULT_CINECOINS_REWARDS;
  });

  const [cineCoinsChallenges, setCineCoinsChallenges] = useState<CineCoinsChallenge[]>(() => {
    const saved = localStorage.getItem("cine_coins_challenges");
    return saved ? JSON.parse(saved) : DEFAULT_CINECOINS_CHALLENGES;
  });

  const [cineCoinsTransactions, setCineCoinsTransactions] = useState<CineCoinsTransaction[]>(() => {
    const saved = localStorage.getItem("cine_coins_transactions");
    return saved ? JSON.parse(saved) : DEFAULT_CINECOINS_TRANSACTIONS;
  });

  const [cineCoinsUserWallet, setCineCoinsUserWallet] = useState<CineCoinsUserWallet>(() => {
    const saved = localStorage.getItem("cine_coins_user_wallet");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CINECOINS_USER_WALLET,
          ...parsed,
          lifetimeEarned: parsed.lifetimeEarned ?? (parsed as any).lifetimeEarnedCoins ?? DEFAULT_CINECOINS_USER_WALLET.lifetimeEarned,
          totalRedeemed: parsed.totalRedeemed ?? (parsed as any).lifetimeRedeemedCoins ?? DEFAULT_CINECOINS_USER_WALLET.totalRedeemed,
          claimedRewards: Array.isArray(parsed.claimedRewards) ? parsed.claimedRewards : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : DEFAULT_CINECOINS_USER_WALLET.notifications
        };
      } catch (e) {
        return DEFAULT_CINECOINS_USER_WALLET;
      }
    }
    return DEFAULT_CINECOINS_USER_WALLET;
  });

  const [castingApplications, setCastingApplications] = useState<CastingApplication[]>(() => {
    const saved = localStorage.getItem("cine_casting_applications");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cine_coins_settings", JSON.stringify(cineCoinsSettings));
  }, [cineCoinsSettings]);

  useEffect(() => {
    localStorage.setItem("cine_coins_rewards", JSON.stringify(cineCoinsRewards));
  }, [cineCoinsRewards]);

  useEffect(() => {
    localStorage.setItem("cine_coins_challenges", JSON.stringify(cineCoinsChallenges));
  }, [cineCoinsChallenges]);

  useEffect(() => {
    localStorage.setItem("cine_coins_transactions", JSON.stringify(cineCoinsTransactions));
  }, [cineCoinsTransactions]);

  useEffect(() => {
    localStorage.setItem("cine_coins_user_wallet", JSON.stringify(cineCoinsUserWallet));
  }, [cineCoinsUserWallet]);

  useEffect(() => {
    localStorage.setItem("cine_casting_applications", JSON.stringify(castingApplications));
  }, [castingApplications]);

  const handleAddServiceProposal = (proposal: Omit<ServiceProposal, "id" | "submittedAt" | "status">) => {
    const newProp: ServiceProposal = {
      ...proposal,
      id: `PROP-${Date.now().toString().slice(-4)}`,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "Pending"
    };
    setServiceProposals(prev => [newProp, ...prev]);
  };

  const handleUpdateProposalStatus = (id: string, status: ServiceProposal["status"], adminNotes?: string) => {
    setServiceProposals(prev => prev.map(p => p.id === id ? { ...p, status, adminNotes: adminNotes ?? p.adminNotes } : p));
  };

  const handleOpenAdmin = () => {
    setAdminOpen(true);
  };

  const handleOpenManagerDashboard = (theatreId: number) => {
    setAdminOpen(false);
    setActiveTheatreId(theatreId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("theatreId", String(theatreId));
      window.history.pushState({}, "", url.pathname + "?" + url.searchParams.toString());
    } catch {
      // Fallback
    }
  };

  const handleOpenEventDashboard = (organizerId: string) => {
    setAdminOpen(false);
    setActiveOrganizerId(organizerId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("organizerId", organizerId);
      window.history.pushState({}, "", url.pathname + "?" + url.searchParams.toString());
    } catch {
      // Fallback
    }
  };

  const handleCloseManagerDashboard = () => {
    setActiveTheatreId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("theatreId");
      const cleanSearch = url.searchParams.toString();
      window.history.pushState({}, "", url.pathname + (cleanSearch ? "?" + cleanSearch : ""));
    } catch {
      // Fallback
    }
  };

  const handleCloseEventDashboard = () => {
    setActiveOrganizerId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("organizerId");
      const cleanSearch = url.searchParams.toString();
      window.history.pushState({}, "", url.pathname + (cleanSearch ? "?" + cleanSearch : ""));
    } catch {
      // Fallback
    }
  };

  // Read workspace query params & hash on mount
  useEffect(() => {
    const checkAdminUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const orgIdParam = params.get("organizerId");
      const thIdParam = params.get("theatreId");
      const adminParam = params.get("admin");
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (orgIdParam) {
        setActiveOrganizerId(orgIdParam);
      }
      if (thIdParam) {
        setActiveTheatreId(Number(thIdParam));
      } else if (path === "/theatre-admin") {
        const savedUserEmail = localStorage.getItem("cine_user_email");
        const matchedTa = theatreAdmins.find(a => a.email.toLowerCase() === savedUserEmail?.toLowerCase());
        setActiveTheatreId(matchedTa?.theatreId || theatres[0]?.id || 1);
      }
      if (adminParam === "true" || hash === "#admin" || path === "/admin-dashboard") {
        setAdminOpen(true);
      }
    };

    checkAdminUrl();
    window.addEventListener("popstate", checkAdminUrl);
    window.addEventListener("hashchange", checkAdminUrl);
    return () => {
      window.removeEventListener("popstate", checkAdminUrl);
      window.removeEventListener("hashchange", checkAdminUrl);
    };
  }, [theatreAdmins, theatres]);

  // Handlers for state updates
  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem("cine_user_email", email);
    setAuthOpen(false);

    // If super admin logs in, automatically open superadmin dashboard
    if (email.toLowerCase() === superAdminEmail.toLowerCase()) {
      setAdminOpen(true);
    }

    // If theatre admin logs in, automatically route to theatre dashboard
    const ta = theatreAdmins.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (ta) {
      handleOpenManagerDashboard(ta.theatreId);
    }

    // If event organizer logs in, automatically route to event organizer dashboard
    const eo = eventOrganizers.find(o => o.email.toLowerCase() === email.toLowerCase());
    if (eo) {
      handleOpenEventDashboard(eo.id);
    }
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem("cine_user_email");
    setActiveTheatreId(null);
    setActiveOrganizerId(null);
    setAdminOpen(false);
    // Clear URL query parameters cleanly
    window.history.pushState({}, document.title, window.location.pathname);
  };

  const handleSearch = (city: string, date: string, timeSlot: string) => {
    setSelectedCity(city);
    // Handle schedule time filters if needed
  };

  const handleBookMovie = (title: string, showtime?: string) => {
    if (!isMovieBookingSystemActive) {
      alert("Movie ticket booking is currently turned OFF by Platform Admins.");
      return;
    }
    const targetMovie = movies.find(m => m.title === title);
    if (targetMovie && targetMovie.isActive === false) {
      alert(`Booking for "${title}" is currently turned OFF.`);
      return;
    }
    setBookingMovieTitle(title);
    if (showtime) {
      setBookingTimeSlot(showtime);
    }
  };

  const handleConfirmMovieBooking = (
    title: string,
    seats: string[],
    price: number,
    theatre: string,
    time: string,
    name?: string,
    mobile?: string,
    feeDetails?: {
      ticketAmount?: number;
      platformFee?: number;
      convenienceFee?: number;
      bookingFee?: number;
      otherFeeAmount?: number;
      taxAmount?: number;
      discountAmount?: number;
      gatewayFee?: number;
      feeLines?: any[];
      taxLines?: any[];
      paymentMethod?: string;
    }
  ) => {
    const newBooking: Booking = {
      id: "BK-" + Math.floor(100000 + Math.random() * 900000),
      movieTitle: title,
      theatreName: theatre,
      seats: seats,
      totalPrice: price,
      date: "Today",
      timeSlot: time,
      status: "Pending", // Starts as pending until settled by superadmin/theatre manager
      userEmail: userEmail || "guest@cinevenue.com",
      city: selectedCity,
      userName: name || "Premium Guest",
      mobileNumber: mobile || "+91 99999 99999",
      ticketAmount: feeDetails?.ticketAmount ?? price,
      platformFee: feeDetails?.platformFee ?? 0,
      convenienceFee: feeDetails?.convenienceFee ?? 0,
      bookingFee: feeDetails?.bookingFee ?? 0,
      otherFeeAmount: feeDetails?.otherFeeAmount ?? 0,
      taxAmount: feeDetails?.taxAmount ?? 0,
      discountAmount: feeDetails?.discountAmount ?? 0,
      gatewayFee: feeDetails?.gatewayFee ?? 0,
      feeLines: feeDetails?.feeLines,
      taxLines: feeDetails?.taxLines,
      paymentMethod: feeDetails?.paymentMethod || "UPI"
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    return newBooking;
  };

  const handleBookEvent = (registration: EventRegistration) => {
    const updated = [registration, ...eventRegistrations];
    setEventRegistrations(updated);
  };

  const handleAddReview = (eventId: string, review: EventReview) => {
    const updatedEvents = events.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          reviews: [review, ...(e.reviews || [])]
        };
      }
      return e;
    });
    setEvents(updatedEvents);
  };

  const handleAddNotifyMe = (eventId: string, eventTitle: string, email: string, name: string, mobile?: string) => {
    const newReq: NotifyMeRequest = {
      id: "NOTIF-" + Math.floor(100000 + Math.random() * 900000),
      eventId,
      eventTitle,
      userEmail: email,
      userName: name,
      mobileNumber: mobile,
      status: "Pending",
      requestedAt: new Date().toLocaleString()
    };
    setNotifyMeRequests([newReq, ...notifyMeRequests]);
  };

  const handleAddRental = (request: {
    eventName: string;
    guests: string;
    duration: string;
    eventType: string;
    requirements: string;
    price: string;
    theatreName?: string;
    city?: string;
  }) => {
    const newRental: RentalRequest = {
      id: "RENT-" + Math.floor(1000 + Math.random() * 9000),
      user: userEmail || "anonymous@cinevenue.com",
      eventName: request.eventName,
      guests: request.guests,
      duration: request.duration,
      eventType: request.eventType,
      requirements: request.requirements,
      price: request.price,
      date: new Date().toLocaleDateString(),
      status: "Pending",
      theatreName: request.theatreName,
      city: request.city
    };
    setRentalRequests([newRental, ...rentalRequests]);
  };

  const handleSendMessage = (name: string, contact: string, message: string) => {
    const newMessage: ContactMessage = {
      name,
      contact,
      message,
      date: new Date().toLocaleDateString()
    };
    setContactMessages([newMessage, ...contactMessages]);
  };

  // Convert bookings array to structured object { movieTitle: [bookedSeats] } expected by BookingModal
  const getGlobalBookings = () => {
    const mapping: { [movieTitle: string]: string[] } = {};
    bookings.forEach(b => {
      if (b.movieTitle === bookingMovieTitle) {
        if (!mapping[b.movieTitle]) {
          mapping[b.movieTitle] = [];
        }
        mapping[b.movieTitle].push(...b.seats);
      }
    });
    return mapping;
  };

  // Render correct full-screen workspace or master landing layouts
  if (!serviceControl.website.status && !adminOpen) {
    return (
      <MaintenancePage
        serviceName="CineVenue Global"
        title={serviceControl.website.title}
        message={serviceControl.website.message}
        expectedTime={serviceControl.website.expectedTime}
        icon="🌐"
        onBackToHome={() => {
          setAdminOpen(true);
        }}
      />
    );
  }

  return (
    <>
      <Routes>
      {/* Supabase OAuth Callback Handler */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/callback" element={<AuthCallback />} />

      {/* Events Sub-website */}
      <Route 
        path="/events/*" 
        element={
          serviceControl?.eventBooking?.status === false ? (
            <MaintenancePage
              serviceName="Event Booking"
              title={serviceControl?.eventBooking?.title || "Event Booking Temporarily Unavailable"}
              message={serviceControl?.eventBooking?.message || "Concerts, celebrity shows and live events are currently unavailable.\n\nPlease check back soon."}
              expectedTime={serviceControl?.eventBooking?.expectedTime || "31 July 2026, 10:00 AM"}
              icon="🎟️"
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <EventsApp />
          )
        } 
      />
      <Route path="/movies" element={<Navigate to="/booking" replace />} />
      <Route 
        path="/services" 
        element={
          serviceControl?.brandPromotion?.status === false ? (
            <MaintenancePage
              serviceName="Brand Publicity"
              title={serviceControl?.brandPromotion?.title || "Brand Promotion Under Maintenance"}
              message={serviceControl?.brandPromotion?.message || "Brand Promotion and Media Campaign services are under maintenance.\n\nWe'll be back shortly."}
              expectedTime={serviceControl?.brandPromotion?.expectedTime || "31 July 2026, 05:00 PM"}
              icon="📢"
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <Services />
          )
        } 
      />

      {/* Corporate Luxury Homepage */}
      <Route
        path="/"
        element={
          <div className="bg-[#09090A] min-h-screen">
            <Home
              userEmail={userEmail}
              onOpenAdmin={() => setAdminOpen(true)}
              onSendMessage={handleSendMessage}
              serviceControl={serviceControl}
              setServiceControl={setServiceControl}
              onAddServiceProposal={handleAddServiceProposal}
              onOpenOrders={() => setOrdersOpen(true)}
              onOpenAuth={handleOpenAuth}
            />
            <AdminPanel
              isOpen={adminOpen}
              onClose={() => setAdminOpen(false)}
              serviceControl={serviceControl}
              setServiceControl={setServiceControl}
              serviceControlLogs={serviceControlLogs}
              setServiceControlLogs={setServiceControlLogs}
              movies={movies}
              theatres={theatres}
              rentalRequests={rentalRequests}
              contactMessages={contactMessages}
              bookings={bookings}
              schedules={schedules}
              events={events}
              eventRegistrations={eventRegistrations}
              onAddEvent={(e) => setEvents([...events, e])}
              onDeleteEvent={(id) => setEvents(events.filter(e => e.id !== id))}
              onUpdateEventRegistrationStatus={(regId, status) => {
                const updated = eventRegistrations.map(r => {
                  if (r.id === regId) {
                    const mapStatus = status.startsWith("Approved") ? "Confirmed" as const : "Cancelled" as const;
                    return {
                      ...r,
                      status: mapStatus,
                      superadminApproved: status.startsWith("Approved")
                    };
                  }
                  return r;
                });
                setEventRegistrations(updated);
              }}
              notifyMeRequests={notifyMeRequests}
              onUpdateNotifyMeRequestStatus={(id, status) => {
                setNotifyMeRequests(notifyMeRequests.map(r => r.id === id ? { ...r, status, notifiedAt: new Date().toLocaleString() } : r));
              }}
              onAddMovie={(m) => setMovies([...movies, m])}
              onAddTheatre={(t) => setTheatres([...theatres, t])}
              onDeleteMovie={(title) => setMovies(movies.filter(m => m.title !== title))}
              onDeleteTheatre={(id) => setTheatres(theatres.filter(t => t.id !== id))}
              onUpdateTheatre={(t) => setTheatres(theatres.map(item => item.id === t.id ? t : item))}
              onUpdateRentalStatus={(id, status) => {
                setRentalRequests(rentalRequests.map(r => r.id === id ? { ...r, status } : r));
              }}
              onScheduleShow={(sch) => setSchedules([...schedules, sch])}
              onDeleteSchedule={(id) => setSchedules(schedules.filter(s => s.id !== id))}
              onDeploySchedule={(id) => setSchedules(schedules.map(s => s.id === id ? { ...s, isDeployed: true } : s))}
              onSettleVenueBookings={(name) => {
                setBookings(bookings.map(b => b.theatreName === name ? { ...b, status: "Settled" as const } : b));
              }}
              onAddRentalRequest={(req) => {
                const newRental: RentalRequest = {
                  id: "RENT-" + Math.floor(1000 + Math.random() * 9000),
                  user: req.userEmail || "member@cinevenue.com",
                  eventName: req.eventName,
                  guests: req.guests,
                  duration: req.duration,
                  eventType: req.eventType,
                  requirements: req.requirements,
                  price: req.price,
                  date: new Date().toLocaleDateString(),
                  status: "Pending",
                  theatreName: req.theatreName,
                  city: req.city
                };
                setRentalRequests([newRental, ...rentalRequests]);
              }}
              onOpenManagerDashboard={handleOpenManagerDashboard}
              onUpdateMovie={(oldTitle, m) => setMovies(movies.map(item => item.title === oldTitle ? m : item))}
              onUpdateSchedule={(id, sch) => setSchedules(schedules.map(item => item.id === id ? sch : item))}
              onUpdateBooking={(id, b) => setBookings(bookings.map(item => item.id === id ? b : item))}
              onDeleteBooking={(id) => setBookings(bookings.filter(b => b.id !== id))}
              
              isSuperAdmin={userEmail?.toLowerCase() === superAdminEmail.toLowerCase()}
              isTheatreAdmin={theatreAdmins.some(a => a.email.toLowerCase() === userEmail?.toLowerCase())}
              activeTheatreAdmin={theatreAdmins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase())}
              theatreAdmins={theatreAdmins}
              onUpdateTheatreAdmins={(admins) => setTheatreAdmins(admins)}
              eventOrganizers={eventOrganizers}
              onUpdateEventOrganizers={(orgs) => setEventOrganizers(orgs)}
              onOpenEventDashboard={handleOpenEventDashboard}
              superAdminEmail={superAdminEmail}
              superAdminPassword={superAdminPassword}
              onUpdateSuperAdminCredentials={(email, pass) => {
                setSuperAdminEmail(email);
                setSuperAdminPassword(pass);
              }}
              onAuthSuccess={handleLoginSuccess}
              registeredUsers={registeredUsers}
              onUpdateRegisteredUsers={(users) => setRegisteredUsers(users)}
              cities={cities}
              onUpdateCities={(c) => setCities(c)}
              spotlight={spotlight}
              onUpdateSpotlight={(s) => setSpotlight(s)}

              isMovieBookingSystemActive={isMovieBookingSystemActive}
              onToggleMovieBookingSystemActive={(active) => setIsMovieBookingSystemActive(active)}
              isEventBookingSystemActive={isEventBookingSystemActive}
              onToggleEventSystemActive={(active) => setIsEventBookingSystemActive(active)}
              onToggleMovieActive={handleToggleMovieActive}
              onToggleEventActive={handleToggleEventActive}
              onToggleScheduleActive={handleToggleScheduleActive}
              upiGatewaySettings={upiGatewaySettings}
              onUpdateUpiSettings={(settings) => setUpiGatewaySettings(settings)}
              advertisements={advertisements}
              onCreateAd={(ad) => setAdvertisements([ad, ...advertisements])}
              onToggleAdStatus={(id) => setAdvertisements(advertisements.map(a => a.id === id ? { ...a, status: a.status === "Active" ? "Paused" as const : "Active" as const } : a))}
              onDeleteAd={(id) => setAdvertisements(advertisements.filter(a => a.id !== id))}
              onVerifyBookingPayment={handleVerifyBookingPayment}
              onVerifyRegistrationPayment={handleVerifyRegistrationPayment}
            />
          </div>
        }
      />

      {/* Immersive Cinevenue Luxury Main Landing & Custom Modals */}
      <Route
        path="/booking"
        element={
          serviceControl?.movieBooking?.status === false ? (
            <MaintenancePage
              serviceName="Movie Booking"
              title={serviceControl?.movieBooking?.title || "Movie Booking Temporarily Unavailable"}
              message={serviceControl?.movieBooking?.message || "We are upgrading our booking system to provide a faster and smoother experience. Please visit again shortly."}
              expectedTime={serviceControl?.movieBooking?.expectedTime || "30 July 2026 06:00 PM"}
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
          <div className="bg-[#0A0A0B] min-h-screen text-text-primary selection:bg-gold selection:text-black">
            {/* Dynamic luxury layout navigation */}
            <Navbar
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              onOpenLocation={() => setLocationOpen(true)}
              cities={cities}
              userEmail={userEmail}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onLogout={handleLogout}
              onOpenAuth={handleOpenAuth}
              onOpenAdmin={handleOpenAdmin}
              onOpenTheatreDashboard={handleOpenManagerDashboard}
              onOpenEventDashboard={handleOpenEventDashboard}
              onOpenOrders={() => setIsUserDashboardOpen(true)}
              onOpenCineCoins={() => window.location.href = "/cinecoins"}
              onOpenAccount={() => window.location.href = "/account"}
              onOpenProductions={() => window.location.href = "/productions"}
              theatreAdmins={theatreAdmins}
              eventOrganizers={eventOrganizers}
              superAdminEmail={superAdminEmail}
            />

            {/* Render core screen workspace tabs */}
            {activeTheatreId !== null ? (
              <TheatreManagerDashboard
                theatreId={activeTheatreId}
                theatres={theatres}
                bookings={bookings}
                schedules={schedules}
                movies={movies}
                onClose={handleCloseManagerDashboard}
                onScheduleShow={(sch) => setSchedules([...schedules, sch])}
                onDeleteSchedule={(id) => setSchedules(schedules.filter(s => s.id !== id))}
                onSettleVenueBookings={(name) => {
                  const updated = bookings.map(b => b.theatreName === name ? { ...b, status: "Settled" as const } : b);
                  setBookings(updated);
                }}
                onUpdateTheatre={(t) => setTheatres(theatres.map(item => item.id === t.id ? t : item))}
              />
            ) : activeOrganizerId !== null ? (
              <EventManagerDashboard
                organizerId={activeOrganizerId}
                eventOrganizers={eventOrganizers}
                events={events}
                eventRegistrations={eventRegistrations}
                onClose={handleCloseEventDashboard}
                onAddEvent={(e) => setEvents([...events, e])}
                onDeleteEvent={(id) => setEvents(events.filter(e => e.id !== id))}
                onUpdateEventOrganizer={(eo) => setEventOrganizers(eventOrganizers.map(item => item.id === eo.id ? eo : item))}
                onUpdateEventRegistrationStatus={(regId, status) => {
                  const updated = eventRegistrations.map(r => {
                    if (r.id === regId) {
                      const mapStatus = status.startsWith("Approved") ? "Confirmed" as const : "Cancelled" as const;
                      return {
                        ...r,
                        status: mapStatus,
                        organizerApproved: status.startsWith("Approved"),
                      };
                    }
                    return r;
                  });
                  setEventRegistrations(updated);
                }}
              />
            ) : (
              /* Normal Customer Immersive Single Page Website */
              <div className="animate-fade-in">
                {/* Scroll Anchors Section */}
                <Hero
                  selectedCity={selectedCity}
                  setSelectedCity={setSelectedCity}
                  onSearch={handleSearch}
                  cities={cities}
                  advertisements={advertisements}
                  onRecordAdImpression={handleRecordAdImpression}
                  onRecordAdClick={handleRecordAdClick}
                />
                
                <Featured
                  spotlight={spotlight}
                  onBookMovie={handleBookMovie}
                  isMovieBookingSystemActive={isMovieBookingSystemActive}
                />

                <NowShowing
                  movies={movies}
                  selectedCity={selectedCity}
                  onBookMovie={handleBookMovie}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  isMovieBookingSystemActive={isMovieBookingSystemActive}
                  onToggleMovieBookingSystemActive={(active) => setIsMovieBookingSystemActive(active)}
                  onToggleMovieActive={handleToggleMovieActive}
                  advertisements={advertisements}
                  onRecordAdImpression={handleRecordAdImpression}
                  onRecordAdClick={handleRecordAdClick}
                />

                <EventsShowcase
                  events={events}
                  userEmail={userEmail}
                  onOpenAuth={() => setAuthOpen(true)}
                  selectedCity={selectedCity}
                  onBookEvent={handleBookEvent}
                  onAddReview={handleAddReview}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  notifyMeRequests={notifyMeRequests}
                  onAddNotifyMeRequest={handleAddNotifyMe}
                  isEventBookingSystemActive={isEventBookingSystemActive}
                  onToggleEventSystemActive={(active) => setIsEventBookingSystemActive(active)}
                  onToggleEventBookingStatus={handleToggleEventActive}
                />

                <Theatres
                  theatres={theatres}
                  selectedCity={selectedCity}
                  searchQuery={searchQuery}
                  onSelectTheatre={(name) => {
                    const defaultMovie = movies[0]?.title || "Kalki 2898 AD";
                    handleBookMovie(defaultMovie);
                  }}
                />

                <PrivateRental
                  onOpenRental={() => setRentalOpen(true)}
                />

                <ContactForm
                  onSendMessage={handleSendMessage}
                />

                <Footer
                  onOpenInfo={(tab) => setInfoModalType(tab)}
                  onOpenRental={() => setRentalOpen(true)}
                  onOpenAdmin={handleOpenAdmin}
                  onShare={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    alert("Platform Link Copied: Share CineVenue with other luxury film critics!");
                  }}
                />
              </div>
            )}

            {/* Overlays / Modals */}

            
            <LocationSelector 
              isOpen={locationOpen} 
              onClose={() => setLocationOpen(false)} 
              selectedCity={selectedCity} 
              setSelectedCity={setSelectedCity} 
              cities={cities} 
            />
            
            <BookingModal
              isOpen={bookingMovieTitle !== ""}
              onClose={() => setBookingMovieTitle("")}
              movieTitle={bookingMovieTitle}
              selectedCity={selectedCity}
              userEmail={userEmail}
              onOpenAuth={() => setAuthOpen(true)}
              globalBookings={getGlobalBookings()}
              onConfirmBooking={handleConfirmMovieBooking}
              selectedTimeSlot={bookingTimeSlot}
              schedules={schedules}
              theatres={theatres}
              registeredUsers={registeredUsers}
              isMovieBookingSystemActive={isMovieBookingSystemActive}
            />

            <UserDashboardModal
              isOpen={isUserDashboardOpen}
              onClose={() => setIsUserDashboardOpen(false)}
              userEmail={userEmail}
              bookings={bookings}
              eventRegistrations={eventRegistrations}
              onOpenAuth={() => setAuthOpen(true)}
              onUpdateBookingUtr={handleUpdateBookingUtr}
              onUpdateRegistrationUtr={handleUpdateRegistrationUtr}
            />

            <OrdersModal
              isOpen={ordersOpen}
              onClose={() => setOrdersOpen(false)}
              userEmail={userEmail}
              bookings={bookings}
              eventRegistrations={eventRegistrations}
              onOpenAuth={() => setAuthOpen(true)}
            />

            <RentalModal
              isOpen={rentalOpen}
              onClose={() => setRentalOpen(false)}
              userEmail={userEmail}
              onOpenAuth={() => setAuthOpen(true)}
              theatres={theatres}
              onSubmitRental={handleAddRental}
            />

            <AdminPanel
              isOpen={adminOpen}
              onClose={() => setAdminOpen(false)}
              serviceControl={serviceControl}
              setServiceControl={setServiceControl}
              serviceControlLogs={serviceControlLogs}
              setServiceControlLogs={setServiceControlLogs}
              movies={movies}
              theatres={theatres}
              rentalRequests={rentalRequests}
              contactMessages={contactMessages}
              bookings={bookings}
              schedules={schedules}
              events={events}
              eventRegistrations={eventRegistrations}
              onAddEvent={(e) => setEvents([...events, e])}
              onDeleteEvent={(id) => setEvents(events.filter(e => e.id !== id))}
              onUpdateEventRegistrationStatus={(regId, status) => {
                const updated = eventRegistrations.map(r => {
                  if (r.id === regId) {
                    const mapStatus = status.startsWith("Approved") ? "Confirmed" as const : "Cancelled" as const;
                    return {
                      ...r,
                      status: mapStatus,
                      superadminApproved: status.startsWith("Approved")
                    };
                  }
                  return r;
                });
                setEventRegistrations(updated);
              }}
              notifyMeRequests={notifyMeRequests}
              onUpdateNotifyMeRequestStatus={(id, status) => {
                setNotifyMeRequests(notifyMeRequests.map(r => r.id === id ? { ...r, status, notifiedAt: new Date().toLocaleString() } : r));
              }}
              onAddMovie={(m) => setMovies([...movies, m])}
              onAddTheatre={(t) => setTheatres([...theatres, t])}
              onDeleteMovie={(title) => setMovies(movies.filter(m => m.title !== title))}
              onDeleteTheatre={(id) => setTheatres(theatres.filter(t => t.id !== id))}
              onUpdateTheatre={(t) => setTheatres(theatres.map(item => item.id === t.id ? t : item))}
              onUpdateRentalStatus={(id, status) => {
                setRentalRequests(rentalRequests.map(r => r.id === id ? { ...r, status } : r));
              }}
              onScheduleShow={(sch) => setSchedules([...schedules, sch])}
              onDeleteSchedule={(id) => setSchedules(schedules.filter(s => s.id !== id))}
              onDeploySchedule={(id) => setSchedules(schedules.map(s => s.id === id ? { ...s, isDeployed: true } : s))}
              onSettleVenueBookings={(name) => {
                setBookings(bookings.map(b => b.theatreName === name ? { ...b, status: "Settled" as const } : b));
              }}
              onAddRentalRequest={(req) => {
                const newRental: RentalRequest = {
                  id: "RENT-" + Math.floor(1000 + Math.random() * 9000),
                  user: req.userEmail || "member@cinevenue.com",
                  eventName: req.eventName,
                  guests: req.guests,
                  duration: req.duration,
                  eventType: req.eventType,
                  requirements: req.requirements,
                  price: req.price,
                  date: new Date().toLocaleDateString(),
                  status: "Pending",
                  theatreName: req.theatreName,
                  city: req.city
                };
                setRentalRequests([newRental, ...rentalRequests]);
              }}
              onOpenManagerDashboard={handleOpenManagerDashboard}
              onUpdateMovie={(oldTitle, m) => setMovies(movies.map(item => item.title === oldTitle ? m : item))}
              onUpdateSchedule={(id, sch) => setSchedules(schedules.map(item => item.id === id ? sch : item))}
              onUpdateBooking={(id, b) => setBookings(bookings.map(item => item.id === id ? b : item))}
              onDeleteBooking={(id) => setBookings(bookings.filter(b => b.id !== id))}
              
              isSuperAdmin={Boolean(userEmail?.toLowerCase() === superAdminEmail.toLowerCase() || (!userEmail && localStorage.getItem("cine_user_email")?.toLowerCase() === superAdminEmail.toLowerCase()))}
              isTheatreAdmin={theatreAdmins.some(a => a.email.toLowerCase() === userEmail?.toLowerCase())}
              activeTheatreAdmin={theatreAdmins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase())}
              theatreAdmins={theatreAdmins}
              onUpdateTheatreAdmins={(admins) => setTheatreAdmins(admins)}
              eventOrganizers={eventOrganizers}
              onUpdateEventOrganizers={(orgs) => setEventOrganizers(orgs)}
              onOpenEventDashboard={handleOpenEventDashboard}
              superAdminEmail={superAdminEmail}
              superAdminPassword={superAdminPassword}
              onUpdateSuperAdminCredentials={(email, pass) => {
                setSuperAdminEmail(email);
                setSuperAdminPassword(pass);
              }}
              onAuthSuccess={handleLoginSuccess}
              registeredUsers={registeredUsers}
              onUpdateRegisteredUsers={(users) => setRegisteredUsers(users)}
              cities={cities}
              onUpdateCities={(c) => setCities(c)}
              spotlight={spotlight}
              onUpdateSpotlight={(s) => setSpotlight(s)}

              isMovieBookingSystemActive={isMovieBookingSystemActive}
              onToggleMovieBookingSystemActive={(active) => setIsMovieBookingSystemActive(active)}
              isEventBookingSystemActive={isEventBookingSystemActive}
              onToggleEventSystemActive={(active) => setIsEventBookingSystemActive(active)}
              onToggleMovieActive={handleToggleMovieActive}
              onToggleEventActive={handleToggleEventActive}
              onToggleScheduleActive={handleToggleScheduleActive}
              upiGatewaySettings={upiGatewaySettings}
              onUpdateUpiSettings={(settings) => setUpiGatewaySettings(settings)}
              advertisements={advertisements}
              onCreateAd={(ad) => setAdvertisements([ad, ...advertisements])}
              onToggleAdStatus={(id) => setAdvertisements(advertisements.map(a => a.id === id ? { ...a, status: a.status === "Active" ? "Paused" as const : "Active" as const } : a))}
              onDeleteAd={(id) => setAdvertisements(advertisements.filter(a => a.id !== id))}
              onVerifyBookingPayment={handleVerifyBookingPayment}
              onVerifyRegistrationPayment={handleVerifyRegistrationPayment}
              footerPagesData={footerPagesData}
              onUpdateFooterPagesData={(newData) => setFooterPagesData(newData)}
              cineCoinsSettings={cineCoinsSettings}
              onUpdateCineCoinsSettings={(s) => setCineCoinsSettings(s)}
              cineCoinsRewards={cineCoinsRewards}
              onUpdateCineCoinsRewards={(r) => setCineCoinsRewards(r)}
              cineCoinsChallenges={cineCoinsChallenges}
              onUpdateCineCoinsChallenges={(c) => setCineCoinsChallenges(c)}
              cineCoinsTransactions={cineCoinsTransactions}
              onUpdateCineCoinsTransactions={(t) => setCineCoinsTransactions(t)}
            />
          </div>
          )
        }
      />

      {/* Admin Panel — secret URL, not linked publicly */}
      <Route
        path="/adminpanel"
        element={
          <div className="bg-[#0A0A0B] min-h-screen text-text-primary">
            <AdminPanel
              isOpen={true}
              onClose={() => window.location.href = "/"}
              serviceControl={serviceControl}
              setServiceControl={setServiceControl}
              serviceControlLogs={serviceControlLogs}
              setServiceControlLogs={setServiceControlLogs}
              movies={movies}
              theatres={theatres}
              rentalRequests={rentalRequests}
              contactMessages={contactMessages}
              bookings={bookings}
              schedules={schedules}
              events={events}
              eventRegistrations={eventRegistrations}
              onAddEvent={(e) => setEvents([...events, e])}
              onDeleteEvent={(id) => setEvents(events.filter(e => e.id !== id))}
              onUpdateEventRegistrationStatus={(regId, status) => {
                const updated = eventRegistrations.map(r => {
                  if (r.id === regId) {
                    const mapStatus = status.startsWith("Approved") ? "Confirmed" as const : "Cancelled" as const;
                    return {
                      ...r,
                      status: mapStatus,
                      superadminApproved: status.startsWith("Approved")
                    };
                  }
                  return r;
                });
                setEventRegistrations(updated);
              }}
              notifyMeRequests={notifyMeRequests}
              onUpdateNotifyMeRequestStatus={(id, status) => {
                setNotifyMeRequests(notifyMeRequests.map(r => r.id === id ? { ...r, status, notifiedAt: new Date().toLocaleString() } : r));
              }}
              onAddMovie={(m) => setMovies([...movies, m])}
              onAddTheatre={(t) => setTheatres([...theatres, t])}
              onDeleteMovie={(title) => setMovies(movies.filter(m => m.title !== title))}
              onDeleteTheatre={(id) => setTheatres(theatres.filter(t => t.id !== id))}
              onUpdateTheatre={(t) => setTheatres(theatres.map(item => item.id === t.id ? t : item))}
              onUpdateRentalStatus={(id, status) => {
                setRentalRequests(rentalRequests.map(r => r.id === id ? { ...r, status } : r));
              }}
              onScheduleShow={(sch) => setSchedules([...schedules, sch])}
              onDeleteSchedule={(id) => setSchedules(schedules.filter(s => s.id !== id))}
              onDeploySchedule={(id) => setSchedules(schedules.map(s => s.id === id ? { ...s, isDeployed: true } : s))}
              onSettleVenueBookings={(name) => {
                setBookings(bookings.map(b => b.theatreName === name ? { ...b, status: "Settled" as const } : b));
              }}
              onAddRentalRequest={(req) => {
                const newRental: RentalRequest = {
                  id: "RENT-" + Math.floor(1000 + Math.random() * 9000),
                  user: req.userEmail || "member@cinevenue.com",
                  eventName: req.eventName,
                  guests: req.guests,
                  duration: req.duration,
                  eventType: req.eventType,
                  requirements: req.requirements,
                  price: req.price,
                  date: new Date().toLocaleDateString(),
                  status: "Pending",
                  theatreName: req.theatreName,
                  city: req.city
                };
                setRentalRequests([newRental, ...rentalRequests]);
              }}
              onOpenManagerDashboard={handleOpenManagerDashboard}
              onUpdateMovie={(oldTitle, m) => setMovies(movies.map(item => item.title === oldTitle ? m : item))}
              onUpdateSchedule={(id, sch) => setSchedules(schedules.map(item => item.id === id ? sch : item))}
              onUpdateBooking={(id, b) => setBookings(bookings.map(item => item.id === id ? b : item))}
              onDeleteBooking={(id) => setBookings(bookings.filter(b => b.id !== id))}
              
              isSuperAdmin={Boolean(userEmail?.toLowerCase() === superAdminEmail.toLowerCase() || (!userEmail && localStorage.getItem("cine_user_email")?.toLowerCase() === superAdminEmail.toLowerCase()))}
              isTheatreAdmin={theatreAdmins.some(a => a.email.toLowerCase() === userEmail?.toLowerCase())}
              activeTheatreAdmin={theatreAdmins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase())}
              theatreAdmins={theatreAdmins}
              onUpdateTheatreAdmins={(admins) => setTheatreAdmins(admins)}
              eventOrganizers={eventOrganizers}
              onUpdateEventOrganizers={(orgs) => setEventOrganizers(orgs)}
              onOpenEventDashboard={handleOpenEventDashboard}
              superAdminEmail={superAdminEmail}
              superAdminPassword={superAdminPassword}
              onUpdateSuperAdminCredentials={(email, pass) => {
                setSuperAdminEmail(email);
                setSuperAdminPassword(pass);
              }}
              onAuthSuccess={handleLoginSuccess}
              registeredUsers={registeredUsers}
              onUpdateRegisteredUsers={(users) => setRegisteredUsers(users)}
              cities={cities}
              onUpdateCities={(c) => setCities(c)}
              spotlight={spotlight}
              onUpdateSpotlight={(s) => setSpotlight(s)}

              isMovieBookingSystemActive={isMovieBookingSystemActive}
              onToggleMovieBookingSystemActive={(active) => setIsMovieBookingSystemActive(active)}
              isEventBookingSystemActive={isEventBookingSystemActive}
              onToggleEventSystemActive={(active) => setIsEventBookingSystemActive(active)}
              onToggleMovieActive={handleToggleMovieActive}
              onToggleEventActive={handleToggleEventActive}
              onToggleScheduleActive={handleToggleScheduleActive}
              upiGatewaySettings={upiGatewaySettings}
              onUpdateUpiSettings={(settings) => setUpiGatewaySettings(settings)}
              advertisements={advertisements}
              onCreateAd={(ad) => setAdvertisements([ad, ...advertisements])}
              onToggleAdStatus={(id) => setAdvertisements(advertisements.map(a => a.id === id ? { ...a, status: a.status === "Active" ? "Paused" as const : "Active" as const } : a))}
              onDeleteAd={(id) => setAdvertisements(advertisements.filter(a => a.id !== id))}
              onVerifyBookingPayment={handleVerifyBookingPayment}
              onVerifyRegistrationPayment={handleVerifyRegistrationPayment}
              footerPagesData={footerPagesData}
              onUpdateFooterPagesData={(newData) => setFooterPagesData(newData)}
              cineCoinsSettings={cineCoinsSettings}
              onUpdateCineCoinsSettings={(s) => setCineCoinsSettings(s)}
              cineCoinsRewards={cineCoinsRewards}
              onUpdateCineCoinsRewards={(r) => setCineCoinsRewards(r)}
              cineCoinsChallenges={cineCoinsChallenges}
              onUpdateCineCoinsChallenges={(c) => setCineCoinsChallenges(c)}
              cineCoinsTransactions={cineCoinsTransactions}
              onUpdateCineCoinsTransactions={(t) => setCineCoinsTransactions(t)}
            />
          </div>
        }
      />

      {/* CineVenue React Router Clone Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/movie/:id"
        element={
          !isMovieBookingSystemActive ? (
            <MaintenancePage
              serviceName="Movie Booking"
              title={globalAppSettings.maintenanceTitle || "Movie Booking Temporarily Unavailable"}
              message={globalAppSettings.maintenanceMessage || "We are upgrading our ticket booking experience. Movie booking will be available shortly."}
              expectedTime={typeof globalAppSettings.maintenanceEndTime === "string" ? globalAppSettings.maintenanceEndTime : "30 July 2026 06:00 PM"}
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <MovieDetails />
          )
        }
      />
      <Route
        path="/theatre-selection"
        element={
          !isMovieBookingSystemActive ? (
            <MaintenancePage
              serviceName="Movie Booking"
              title={globalAppSettings.maintenanceTitle || "Movie Booking Temporarily Unavailable"}
              message={globalAppSettings.maintenanceMessage || "We are upgrading our ticket booking experience. Movie booking will be available shortly."}
              expectedTime={typeof globalAppSettings.maintenanceEndTime === "string" ? globalAppSettings.maintenanceEndTime : "30 July 2026 06:00 PM"}
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <TheatreSelection />
          )
        }
      />
      <Route
        path="/seat-booking"
        element={
          !isMovieBookingSystemActive ? (
            <MaintenancePage
              serviceName="Movie Booking"
              title={globalAppSettings.maintenanceTitle || "Movie Booking Temporarily Unavailable"}
              message={globalAppSettings.maintenanceMessage || "We are upgrading our ticket booking experience. Movie booking will be available shortly."}
              expectedTime={typeof globalAppSettings.maintenanceEndTime === "string" ? globalAppSettings.maintenanceEndTime : "30 July 2026 06:00 PM"}
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <SeatBooking />
          )
        }
      />
      <Route
        path="/payment"
        element={
          !isMovieBookingSystemActive ? (
            <MaintenancePage
              serviceName="Movie Booking"
              title={globalAppSettings.maintenanceTitle || "Movie Booking Temporarily Unavailable"}
              message={globalAppSettings.maintenanceMessage || "We are upgrading our ticket booking experience. Movie booking will be available shortly."}
              expectedTime={typeof globalAppSettings.maintenanceEndTime === "string" ? globalAppSettings.maintenanceEndTime : "30 July 2026 06:00 PM"}
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <Payment />
          )
        }
      />
      <Route path="/ticket" element={<Ticket />} />
      <Route path="/booking-history" element={<BookingHistory />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* JWT-Protected Material UI Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="movies" element={<Movies />} />
        <Route path="edit-movie/:id" element={<EditMovie />} />
        <Route path="shows" element={<Shows />} />
        <Route path="theatres" element={<TheatresAdmin />} />
        <Route path="seat-layout-generator" element={<SeatLayoutGenerator />} />
      </Route>

      {/* CineCoins Standalone Loyalty Sub-website */}
      <Route 
        path="/cinecoins" 
        element={
          serviceControl?.cinecoins?.status === false ? (
            <MaintenancePage
              serviceName="CineCoins Rewards Vault"
              title={serviceControl?.cinecoins?.title || "CineCoins Rewards Vault Under Maintenance"}
              message={serviceControl?.cinecoins?.message || "CineCoins redemption, transfers, and wallet operations are undergoing scheduled updates.\n\nWe'll be back online shortly."}
              expectedTime={serviceControl?.cinecoins?.expectedTime || "31 July 2026, 06:00 PM"}
              icon="🪙"
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <CineCoinsModule 
              settings={cineCoinsSettings}
              rewards={cineCoinsRewards}
              challenges={cineCoinsChallenges}
              userWallet={cineCoinsUserWallet}
              transactions={cineCoinsTransactions}
              userEmail={userEmail}
              onOpenAuth={() => setAuthOpen(true)}
              onUpdateWallet={(updated) => setCineCoinsUserWallet(updated)}
              onAddTransaction={(tx) => setCineCoinsTransactions([tx, ...cineCoinsTransactions])}
            />
          )
        } 
      />

      {/* CineVenue Productions Sub-website */}
      {(() => {
        const renderFilmProduction = (initialMod?: any) => {
          if (serviceControl?.filmProduction?.status === false) {
            return (
              <MaintenancePage
                serviceName="Film Production"
                title={serviceControl?.filmProduction?.title || "Film Production Division Under Maintenance"}
                message={serviceControl?.filmProduction?.message || "We're updating our production portfolio and services.\n\nFor urgent enquiries contact info.cinevenue@gmail.com"}
                expectedTime={serviceControl?.filmProduction?.expectedTime || "30 July 2026, 12:00 PM"}
                icon="🎥"
                onBackToHome={() => window.location.href = "/"}
              />
            );
          }
          return (
            <FilmProductionSubWebsite 
              userEmail={userEmail}
              initialModule={initialMod}
              onOpenAuth={() => setAuthOpen(true)}
              onBookTickets={(title) => {
                setBookingMovieTitle(title);
              }}
              castingApplications={castingApplications}
              onAddCastingApplication={(app) => setCastingApplications([app, ...castingApplications])}
            />
          );
        };

        return (
          <>
            <Route path="/productions" element={renderFilmProduction()} />
            <Route path="/media-promotions" element={renderFilmProduction("media")} />
            <Route path="/film-production" element={renderFilmProduction()} />
            <Route path="/filmproduction" element={renderFilmProduction()} />
            <Route path="/24crafts" element={renderFilmProduction()} />
            <Route path="/crafts" element={renderFilmProduction()} />
          </>
        );
      })()}

      {/* CineVenue Event Management Hub & Create Event Sub-website */}
      {(() => {
        const renderEventManagement = (isCreate = false) => {
          if (serviceControl?.eventManagement?.status === false) {
            return (
              <MaintenancePage
                serviceName="Event Management"
                title={serviceControl?.eventManagement?.title || "Event Management Under Maintenance"}
                message={serviceControl?.eventManagement?.message || "Movie Promotions, Audio Launches, Celebrity Shows, and Corporate Events are temporarily unavailable.\n\nPlease visit again soon."}
                expectedTime={serviceControl?.eventManagement?.expectedTime || "31 July 2026, 02:00 PM"}
                icon="🎤"
                onBackToHome={() => window.location.href = "/"}
              />
            );
          }
          if (isCreate) return <CreateEvent />;
          return (
            <EventManagementHub 
              userEmail={userEmail}
              onOpenAuth={() => setAuthOpen(true)}
              onNavigateHome={() => window.location.href = "/"}
            />
          );
        };

        return (
          <>
            <Route path="/events" element={renderEventManagement()} />
            <Route path="/event-management" element={renderEventManagement()} />
            <Route path="/create-event" element={renderEventManagement(true)} />
          </>
        );
      })()}

      {/* My Account Sub-website */}
      <Route 
        path="/account" 
        element={
          <MyAccountModule 
            userEmail={userEmail}
            onLogout={handleLogout}
            onOpenAuth={() => setAuthOpen(true)}
            bookings={bookings}
            eventRegistrations={eventRegistrations}
            castingApplications={castingApplications}
            onAddCastingApplication={(app) => setCastingApplications([app, ...castingApplications])}
            userWallet={cineCoinsUserWallet}
            transactions={cineCoinsTransactions}
            onOpenCineCoins={() => window.location.href = "/cinecoins"}
          />
        } 
      />

      {/* CineVenue Proposal Management Hub & Submission Sub-routes */}
      <Route 
        path="/proposals" 
        element={
          serviceControl?.brandPromotion?.status === false ? (
            <MaintenancePage
              serviceName="Brand Publicity & Proposals"
              title={serviceControl?.brandPromotion?.title || "Brand Proposals Under Maintenance"}
              message={serviceControl?.brandPromotion?.message || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance."}
              expectedTime={serviceControl?.brandPromotion?.expectedTime || "31 July 2026, 05:00 PM"}
              icon="📢"
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <div className="min-h-screen bg-[#070709] text-text-primary p-4 md:p-10 font-sans">
              <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <CineVenueLogo size="md" onClick={() => window.location.href = "/"} />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.location.href = "/account"}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                    >
                      My Account
                    </button>
                    <button
                      onClick={() => window.location.href = "/"}
                      className="px-4 py-2 bg-gold hover:bg-gold-light text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Home
                    </button>
                  </div>
                </div>
                <CustomerProposalsView 
                  userEmail={userEmail || ""}
                  userName={userEmail ? userEmail.split("@")[0] : ""}
                />
              </div>
            </div>
          )
        } 
      />

      <Route 
        path="/submit-proposal" 
        element={
          serviceControl?.brandPromotion?.status === false ? (
            <MaintenancePage
              serviceName="Brand Publicity & Proposals"
              title={serviceControl?.brandPromotion?.title || "Brand Proposals Under Maintenance"}
              message={serviceControl?.brandPromotion?.message || "CineVenue sub-websites are temporarily unavailable while undergoing scheduled maintenance."}
              expectedTime={serviceControl?.brandPromotion?.expectedTime || "31 July 2026, 05:00 PM"}
              icon="📢"
              onBackToHome={() => window.location.href = "/"}
            />
          ) : (
            <div className="min-h-screen bg-[#070709] text-text-primary p-4 md:p-10 font-sans">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <CineVenueLogo size="md" onClick={() => window.location.href = "/"} />
                  <button
                    onClick={() => window.location.href = "/proposals"}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                  >
                    ← Back to Proposals
                  </button>
                </div>
                <ProposalSubmitForm 
                  userEmail={userEmail || ""}
                  userName={userEmail ? userEmail.split("@")[0] : ""}
                  onSuccess={() => {
                    window.location.href = "/proposals";
                  }}
                />
              </div>
            </div>
          )
        } 
      />

      {/* Official Legal & Compliance Routes */}
      <Route path="/legal" element={<LegalPolicies />} />
      <Route path="/policies" element={<LegalPolicies />} />
      <Route path="/privacy" element={<LegalPolicies initialPolicy="privacy" />} />
      <Route path="/privacy-statement" element={<LegalPolicies initialPolicy="privacy" />} />
      <Route path="/terms" element={<LegalPolicies initialPolicy="terms" />} />
      <Route path="/terms-and-conditions" element={<LegalPolicies initialPolicy="terms" />} />
      <Route path="/refund-policy" element={<LegalPolicies initialPolicy="refund" />} />
      <Route path="/refunds" element={<LegalPolicies initialPolicy="refund" />} />
      <Route path="/cookie-policy" element={<LegalPolicies initialPolicy="cookie" />} />
      <Route path="/cookies" element={<LegalPolicies initialPolicy="cookie" />} />
      <Route path="/user-agreement" element={<LegalPolicies initialPolicy="user-agreement" />} />

      {/* Dedicated Theatre Admin Workspace Route */}
      <Route
        path="/theatre-admin"
        element={
          <div className="bg-[#0A0A0B] min-h-screen text-text-primary">
            <TheatreManagerDashboard
              theatreId={activeTheatreId || Number(new URLSearchParams(window.location.search).get("theatreId")) || theatres[0]?.id || 1}
              theatres={theatres}
              bookings={bookings}
              schedules={schedules}
              movies={movies}
              onClose={() => {
                handleCloseManagerDashboard();
                window.location.href = "/";
              }}
              onScheduleShow={(sch) => setSchedules([...schedules, sch])}
              onDeleteSchedule={(id) => setSchedules(schedules.filter((s) => s.id !== id))}
              onSettleVenueBookings={(name) => {
                const updated = bookings.map((b) =>
                  b.theatreName === name ? { ...b, status: "Settled" as const } : b
                );
                setBookings(updated);
              }}
              onUpdateTheatre={(t) => setTheatres(theatres.map((item) => (item.id === t.id ? t : item)))}
            />
          </div>
        }
      />

      {/* Catch-all redirection to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

    <MobileBottomNav />

    {/* Global Auth Modal */}
    <AuthModal
      isOpen={authOpen}
      initialMode={authMode}
      onClose={() => setAuthOpen(false)}
      onAuthSuccess={handleLoginSuccess}
      registeredUsers={registeredUsers}
      onRegisterUser={(email, passwordHash, mobile) => {
        setRegisteredUsers([...registeredUsers, { email, passwordHash, mobile, joinedAt: new Date().toLocaleDateString() }]);
      }}
      superAdminEmail={superAdminEmail}
      superAdminPassword={superAdminPassword}
      theatreAdmins={theatreAdmins}
      eventOrganizers={eventOrganizers}
    />

    {/* Global Info Modal */}
    <InfoModal
      isOpen={infoModalType !== null}
      onClose={() => setInfoModalType(null)}
      type={infoModalType}
      footerPagesData={footerPagesData}
    />

    {/* Global Theatre Manager / Admin Workspace Modal Overlay */}
    {activeTheatreId !== null && (
      <TheatreManagerDashboard
        theatreId={activeTheatreId}
        theatres={theatres}
        bookings={bookings}
        schedules={schedules}
        movies={movies}
        onClose={handleCloseManagerDashboard}
        onScheduleShow={(sch) => setSchedules([...schedules, sch])}
        onDeleteSchedule={(id) => setSchedules(schedules.filter((s) => s.id !== id))}
        onSettleVenueBookings={(name) => {
          const updated = bookings.map((b) =>
            b.theatreName === name ? { ...b, status: "Settled" as const } : b
          );
          setBookings(updated);
        }}
        onUpdateTheatre={(t) => setTheatres(theatres.map((item) => (item.id === t.id ? t : item)))}
      />
    )}

    {/* Global Event Manager Workspace Modal Overlay */}
    {activeOrganizerId !== null && (
      <EventManagerDashboard
        organizerId={activeOrganizerId}
        eventOrganizers={eventOrganizers}
        events={events}
        eventRegistrations={eventRegistrations}
        onClose={handleCloseEventDashboard}
        onAddEvent={(e) => setEvents([...events, e])}
        onDeleteEvent={(id) => setEvents(events.filter((e) => e.id !== id))}
        onUpdateEventOrganizer={(eo) =>
          setEventOrganizers(eventOrganizers.map((item) => (item.id === eo.id ? eo : item)))
        }
        onUpdateEventRegistrationStatus={(regId, status) => {
          const updated = eventRegistrations.map((r) => {
            if (r.id === regId) {
              const mapStatus = status.startsWith("Approved")
                ? ("Confirmed" as const)
                : ("Cancelled" as const);
              return {
                ...r,
                status: mapStatus,
                superadminApproved: status.startsWith("Approved"),
              };
            }
            return r;
          });
          setEventRegistrations(updated);
        }}
      />
    )}
  </>
);
}
