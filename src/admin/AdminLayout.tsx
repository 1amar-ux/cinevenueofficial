import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  Landmark,
  Film,
  CalendarRange,
  Ticket,
  CreditCard,
  Tag,
  TrendingUp,
  Bell,
  FileText,
  Star,
  Download,
  Settings,
  Lock,
  LifeBuoy,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  AlertCircle,
  Save,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Activity,
  CheckCircle2,
  Image as ImageIcon,
  MoreVertical,
  XCircle,
  MessageSquare,
  Filter,
  Eye,
  ArrowUpRight,
  UserX,
  PlusCircle,
  FileSpreadsheet,
  FileCode,
  Shield,
  HelpCircle
} from "lucide-react";
import { Movie, Theatre, Booking, MovieSchedule, TheatreAdmin } from "../types";
import AdminManagementPanel from "./admin-management/AdminManagementPanel";
import { calculateRevenueMetrics, generateAuthoritativeDashboardData } from "../services/revenueService";

export default function AdminLayout() {
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // Load and sync all global persistent states from localStorage
  // -------------------------------------------------------------
  const [movies, setMovies] = useState<Movie[]>(() => {
    const saved = localStorage.getItem("cine_movies");
    return saved ? JSON.parse(saved) : [];
  });

  const [theatres, setTheatres] = useState<Theatre[]>(() => {
    const saved = localStorage.getItem("cine_theatres");
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("cine_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  const [schedules, setSchedules] = useState<MovieSchedule[]>(() => {
    const saved = localStorage.getItem("cine_schedules");
    return saved ? JSON.parse(saved) : [];
  });

  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem("cine_registered_users");
    return saved ? JSON.parse(saved) : [];
  });

  const [theatreAdmins, setTheatreAdmins] = useState<TheatreAdmin[]>(() => {
    const saved = localStorage.getItem("cine_theatre_admins");
    return saved ? JSON.parse(saved) : [];
  });

  // Save states helper
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // 1. Dashboard states and stateful variables
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarSearch, setSidebarSearch] = useState("");

  // System sub-states (mock logs, campaign settings, support tickets)
  const [systemAdmins, setSystemAdmins] = useState(() => {
    const cached = localStorage.getItem("sa_admin_list");
    if (cached) return JSON.parse(cached);
    return [
      { email: "superadmin@cinevenue.com", role: "Super Admin", level: "L10", active: true, logsCount: 384 },
      { email: "moderator_ramesh@cinevenue.com", role: "Content Moderator", level: "L3", active: true, logsCount: 12 },
      { email: "fin_kiran@cinevenue.com", role: "Financial Auditor", level: "L5", active: false, logsCount: 145 }
    ];
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const cached = localStorage.getItem("sa_audit_logs");
    if (cached) return JSON.parse(cached);
    return [
      { timestamp: "2026-07-08 01:45 PM", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: "Approved multiplex screening schedule Kalki 2898 AD" },
      { timestamp: "2026-07-08 12:20 PM", actor: "fin_kiran@cinevenue.com", ip: "192.168.1.104", action: "Triggered direct clearing settlement (₹25,000) for IMAX Prasads" },
      { timestamp: "2026-07-08 11:05 AM", actor: "system-cron", ip: "localhost", action: "Database daily backup compilation completed successfully" },
      { timestamp: "2026-07-08 09:30 AM", actor: "moderator_ramesh@cinevenue.com", ip: "45.112.55.19", action: "De-listed archive movie record: 'Major'" }
    ];
  });

  const [supportTickets, setSupportTickets] = useState(() => {
    const cached = localStorage.getItem("sa_support_tickets");
    if (cached) return JSON.parse(cached);
    return [
      { id: "TKT-4109", customer: "sarah@gmail.com", title: "Double Charge during seat selection", status: "Open", priority: "High", date: "Today" },
      { id: "TKT-4102", customer: "amit.s@theatre.com", title: "IMAX Projection screen brightness settings sync fail", status: "In-Progress", priority: "Medium", date: "Yesterday" },
      { id: "TKT-3948", customer: "kiran_dev@gmail.com", title: "Refund status for cancelled Devara show", status: "Resolved", priority: "High", date: "3 days ago" }
    ];
  });

  const [homepageBanners, setHomepageBanners] = useState([
    { id: "b1", title: "Pushpa 2 Double-Dhamaka Booking Promo", active: true, clicks: 14950, type: "Wide Slider" },
    { id: "b2", title: "IMAX Laser 3D Premium Cinema Experience Lounge", active: true, clicks: 9482, type: "Popup Modal" },
    { id: "b3", title: "Midweek Magic Flat 15% OFF popcorn combi", active: false, clicks: 2311, type: "Footer Banner" }
  ]);

  const [platformCoupons, setPlatformCoupons] = useState([
    { code: "CINESUPER50", discount: 50, minAmount: 1000, expires: "2026-12-31", active: true, claims: 245 },
    { code: "PLATINUMPAY", discount: 20, minAmount: 500, expires: "2026-08-15", active: true, claims: 1098 },
    { code: "FESTIVE80", discount: 80, minAmount: 1500, expires: "2026-07-05", active: false, claims: 341 }
  ]);

  const [userReviews, setUserReviews] = useState([
    { id: "rev-1", user: "sarah@gmail.com", movie: "Kalki 2898 AD", rating: 5, comment: "Breathtaking visual effects! Truly world-class cinema output.", status: "Approved" },
    { id: "rev-2", user: "kiran_dev@gmail.com", movie: "Salaar", rating: 4, comment: "Action sequences are majestic. Prabhas delivers an absolute feast.", status: "Approved" },
    { id: "rev-3", user: "spammer_99@yahoo.com", movie: "Pushpa 2", rating: 1, comment: "BUY CHEAP TICKETS LINK WWW.SPAMMERSITE.COM FREE OFFER", status: "Flagged" }
  ]);

  // Sync state helpers
  useEffect(() => {
    saveState("sa_admin_list", systemAdmins);
  }, [systemAdmins]);

  useEffect(() => {
    saveState("sa_audit_logs", auditLogs);
  }, [auditLogs]);

  useEffect(() => {
    saveState("sa_support_tickets", supportTickets);
  }, [supportTickets]);

  // Sidebar sections configuration
  const sidebarGroups = [
    {
      title: "CORE CONTROL",
      items: [
        { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
        { id: "analytics", label: "Advanced Analytics", icon: TrendingUp },
        { id: "reports", label: "Platform Reports", icon: FileSpreadsheet }
      ]
    },
    {
      title: "IDENTITY & ACCESS",
      items: [
        { id: "admins", label: "Admin Management", icon: ShieldAlert },
        { id: "owners", label: "Theatre Owners", icon: Users },
        { id: "users", label: "Platform Users", icon: Users }
      ]
    },
    {
      title: "CATALOGUE & SCHEDULING",
      items: [
        { id: "theatres", label: "Theatre Approval", icon: Landmark },
        { id: "movies", label: "Movie Management", icon: Film },
        { id: "shows", label: "Show Master List", icon: CalendarRange }
      ]
    },
    {
      title: "OPERATIONS & COMMERCIALS",
      items: [
        { id: "bookings", label: "Booking Audit", icon: Ticket },
        { id: "payments", label: "Payments & GST", icon: CreditCard },
        { id: "coupons", label: "Coupons & Promos", icon: Tag },
        { id: "reviews", label: "Reviews Moderation", icon: Star }
      ]
    },
    {
      title: "SYSTEM & CAMPAIGNS",
      items: [
        { id: "notifications", label: "Alert Broadcasting", icon: Bell },
        { id: "content", label: "Content Banners & FAQ", icon: FileText },
        { id: "support", label: "Support Tickets", icon: LifeBuoy },
        { id: "security", label: "Security & Backups", icon: Lock },
        { id: "settings", label: "Platform Settings", icon: Settings }
      ]
    }
  ];

  // Flat list for searches
  const allSidebarItems = sidebarGroups.flatMap((g) => g.items);
  const filteredSidebarGroups = sidebarGroups.map((group) => {
    const items = group.items.filter((item) =>
      item.label.toLowerCase().includes(sidebarSearch.toLowerCase())
    );
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  // Form states for creating/editing items
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Content Moderator");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [newOwnerTheatre, setNewOwnerTheatre] = useState("");
  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newMovieGenre, setNewMovieGenre] = useState("");
  const [newMovieLang, setNewMovieLang] = useState("");
  const [newMovieDuration, setNewMovieDuration] = useState("");
  const [newMoviePoster, setNewMoviePoster] = useState("");
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("");
  const [newCouponMin, setNewCouponMin] = useState("");
  const [broadcastType, setBroadcastType] = useState("Push");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState("");

  // Platform setting states
  const [platformName, setPlatformName] = useState("Cinevenue Premium Booking");
  const [platformTax, setPlatformTax] = useState("18");
  const [platformCommission, setPlatformCommission] = useState("12");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [smtpServer, setSmtpServer] = useState("smtp.cinevenue-aws.com");

  // Filter terms
  const [movieFilter, setMovieFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [theatreFilter, setTheatreFilter] = useState("");
  const [bookingFilter, setBookingFilter] = useState("");

  // New interactive states for superadmin features
  const [editingAdminEmail, setEditingAdminEmail] = useState<string | null>(null);
  const [editingAdminRole, setEditingAdminRole] = useState<string>("Content Moderator");
  
  const [ownerResetCommandLogs, setOwnerResetCommandLogs] = useState<{ [email: string]: string[] }>({});
  const [refundingBookingId, setRefundingBookingId] = useState<string | null>(null);
  const [refundProgressLogs, setRefundProgressLogs] = useState<string[]>([]);
  
  const [inspectingTheatreId, setInspectingTheatreId] = useState<number | null>(null);
  const [inspectFeatures, setInspectFeatures] = useState<string[]>([]);
  const [inspectPrice, setInspectPrice] = useState<string>("");
  const [customGatewayLogs, setCustomGatewayLogs] = useState<any[]>(() => {
    const cached = localStorage.getItem("sa_custom_gateway_logs");
    if (cached) return JSON.parse(cached);
    return [
      { id: "PAY-ID-829104", amount: 500, method: "UPI GPay", status: "SUCCESS", timestamp: "01:45 PM Today", email: "sarah@gmail.com", tax: 90 },
      { id: "PAY-ID-829012", amount: 750, method: "Razorpay Card", status: "SUCCESS", timestamp: "12:20 PM Today", email: "kiran_dev@gmail.com", tax: 135 }
    ];
  });
  
  const [activeHeatmapPeriod, setActiveHeatmapPeriod] = useState<string>("Matinee");
  const [campaignProgress, setCampaignProgress] = useState<string | null>(null);
  const [campaignProgressPercentage, setCampaignProgressPercentage] = useState<number>(0);
  
  const [recentBroadcasts, setRecentBroadcasts] = useState<any[]>(() => {
    const cached = localStorage.getItem("sa_recent_broadcasts");
    if (cached) return JSON.parse(cached);
    return [
      { id: "BC-001", title: "Holiday Combi Discount Vouchers", message: "Popcorn combi coupon code POPCORNFREE is now active.", type: "Push", target: "845 devices", date: "Today 10:30 AM" }
    ];
  });

  const [ticketResolutionNotes, setTicketResolutionNotes] = useState<{ [id: string]: string }>({});

  // Interactive chart state variables
  const [hoveredRevenueDay, setHoveredRevenueDay] = useState<any>(null);
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);
  const [selectedChartRange, setSelectedChartRange] = useState<"7days" | "30days">("7days");

  // Alert notifier helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // Operations & Handlers
  // -------------------------------------------------------------

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    const added = {
      email: newAdminEmail.trim(),
      role: newAdminRole,
      level: newAdminRole === "Super Admin" ? "L10" : "L3",
      active: true,
      logsCount: 0
    };
    const updated = [...systemAdmins, added];
    setSystemAdmins(updated);
    setNewAdminEmail("");
    showToast(`Appointed ${added.email} as ${added.role}!`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Provisioned new admin account: ${added.email} (${added.role})` },
      ...auditLogs
    ]);
  };

  const handleToggleAdminStatus = (email: string) => {
    const updatedAdmins = systemAdmins.map((a) => a.email === email ? { ...a, active: !a.active } : a);
    setSystemAdmins(updatedAdmins);
    showToast("Admin account privilege toggled.");
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Toggled admin status: ${email}` },
      ...auditLogs
    ]);
  };

  const handleDeleteAdmin = (email: string) => {
    if (confirm("Revoke all platform access credentials for this admin?")) {
      setSystemAdmins(systemAdmins.filter((a) => a.email !== email));
      showToast("Admin account deleted permanently.");
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Deleted admin account: ${email}` },
        ...auditLogs
      ]);
    }
  };

  const handleUpdateAdminRole = (email: string, role: string) => {
    const level = role === "Super Admin" ? "L10" : role === "Financial Auditor" ? "L5" : "L3";
    const updatedAdmins = systemAdmins.map((a) => a.email === email ? { ...a, role, level } : a);
    setSystemAdmins(updatedAdmins);
    setEditingAdminEmail(null);
    showToast(`Updated admin ${email} role to ${role}!`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Updated admin role: ${email} -> ${role}` },
      ...auditLogs
    ]);
  };

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerEmail.trim() || !newOwnerName.trim()) return;
    const added: TheatreAdmin = {
      id: "TA-" + Math.floor(100 + Math.random() * 900),
      email: newOwnerEmail.trim(),
      passwordHash: "OwnerWelcome123",
      theatreId: Number(newOwnerTheatre) || 1,
      permissions: { addMovies: true, createShows: true, configureSeats: true, viewReports: true, scanTickets: true }
    };
    const updated = [...theatreAdmins, added];
    setTheatreAdmins(updated);
    saveState("cine_theatre_admins", updated);
    setNewOwnerName("");
    setNewOwnerEmail("");
    showToast(`Registered Multiplex Partner: ${added.email}`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Registered corporate partner owner: ${added.email}` },
      ...auditLogs
    ]);
  };

  const handleToggleOwnerStatus = (email: string) => {
    const updated = theatreAdmins.map((a) => {
      if (a.email === email) {
        const isSuspended = a.passwordHash === "SUSPENDED";
        return { ...a, passwordHash: isSuspended ? "OwnerWelcome123" : "SUSPENDED" };
      }
      return a;
    });
    setTheatreAdmins(updated);
    saveState("cine_theatre_admins", updated);
    showToast("Partner multiplex account status toggled.");
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Toggled status of partner account: ${email}` },
      ...auditLogs
    ]);
  };

  const handleDeleteOwner = (email: string) => {
    if (confirm("Delete this partner multiplex account permanently?")) {
      const updated = theatreAdmins.filter((a) => a.email !== email);
      setTheatreAdmins(updated);
      saveState("cine_theatre_admins", updated);
      showToast("Partner multiplex account deleted permanently.");
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Deleted corporate partner account: ${email}` },
        ...auditLogs
      ]);
    }
  };

  const handleTriggerCredentialsReset = (email: string) => {
    setOwnerResetCommandLogs(prev => ({
      ...prev,
      [email]: ["Connecting to central security catalog services...", "Verifying corporate domain authority..."]
    }));
    
    setTimeout(() => {
      setOwnerResetCommandLogs(prev => ({
        ...prev,
        [email]: [...(prev[email] || []), "Acquiring secure identity credentials reset lock...", "Invalidating old portal password and OTP states..."]
      }));
    }, 600);

    setTimeout(() => {
      const tempPin = "PIN-" + Math.floor(100000 + Math.random() * 900000);
      setOwnerResetCommandLogs(prev => ({
        ...prev,
        [email]: [...(prev[email] || []), `Auto-generated secure credentials reset token: ${tempPin}`, "SMTP transfer transmission completed.", "System portal reset command successfully cleared!"]
      }));
      showToast(`Credentials reset successfully for ${email}`);
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Triggered corporate reset commands for: ${email}` },
        ...auditLogs
      ]);
    }, 1500);
  };

  const handleUpdateTheatreDetails = (id: number, features: string[], priceMatrix: string) => {
    const updated = theatres.map((t) => t.id === id ? { ...t, features, price: priceMatrix } : t);
    setTheatres(updated);
    saveState("cine_theatres", updated);
    setInspectingTheatreId(null);
    showToast("Theatre facilities and price matrix updated!");
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Updated facilities/prices for theatre ID #${id}` },
      ...auditLogs
    ]);
  };

  const handleApproveTheatre = (id: number) => {
    showToast(`Multiplex approved and listed in system!`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Approved new partner multiplex ID: #${id}` },
      ...auditLogs
    ]);
  };

  const handleDeleteTheatre = (id: number) => {
    if (confirm("Are you sure you want to de-list and archive this theatre?")) {
      const updated = theatres.filter((t) => t.id !== id);
      setTheatres(updated);
      saveState("cine_theatres", updated);
      showToast("Theatre deleted from platform catalogue.");
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `De-listed multiplex ID: #${id}` },
        ...auditLogs
      ]);
    }
  };

  const handleCreateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovieTitle.trim()) return;
    const added: Movie = {
      title: newMovieTitle.trim(),
      genre: newMovieGenre || "Action/Thriller",
      lang: newMovieLang || "Hindi",
      langKey: (newMovieLang || "Hindi").toLowerCase().slice(0, 2),
      duration: newMovieDuration || "152 min",
      rating: "4.8",
      img: newMoviePoster || "https://picsum.photos/400/600?random=" + Math.floor(Math.random() * 50)
    };
    const updated = [...movies, added];
    setMovies(updated);
    saveState("cine_movies", updated);
    setNewMovieTitle("");
    setNewMovieGenre("");
    setNewMovieLang("");
    setNewMovieDuration("");
    setNewMoviePoster("");
    showToast(`Added movie '${added.title}' to system directory!`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Created movie record: ${added.title}` },
      ...auditLogs
    ]);
  };

  const handleDeleteMovie = (title: string) => {
    if (confirm("Remove this movie from active booking listings?")) {
      const updated = movies.filter((m) => m.title !== title);
      setMovies(updated);
      saveState("cine_movies", updated);
      showToast("Movie listing deleted.");
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `De-listed movie: ${title}` },
        ...auditLogs
      ]);
    }
  };

  const handleVoidBookingWithRefund = (bookingId: string) => {
    setRefundingBookingId(bookingId);
    setRefundProgressLogs(["Connecting to PG gateway API router...", "Acquiring unique transaction locks..."]);
    
    setTimeout(() => {
      setRefundProgressLogs(prev => [...prev, "Verifying payment payload signature...", "Releasing seats, deleting active locks..."]);
    }, 600);

    setTimeout(() => {
      setRefundProgressLogs(prev => [...prev, "Processing direct settlement UPI routing...", "Cleared! Gateway returned CODE_200."]);
    }, 1200);

    setTimeout(() => {
      const updatedBookings = bookings.map((b) => b.id === bookingId ? { ...b, status: "Cancelled" as const } : b);
      setBookings(updatedBookings);
      saveState("cine_bookings", updatedBookings);
      setRefundingBookingId(null);
      showToast(`Refund processed successfully for booking ${bookingId}`);
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Processed transaction refund: Booking #${bookingId}` },
        ...auditLogs
      ]);
    }, 2000);
  };

  const handleCancelBooking = (bookingId: string) => {
    handleVoidBookingWithRefund(bookingId);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !newCouponDiscount) return;
    const added = {
      code: newCouponCode.trim().toUpperCase(),
      discount: Number(newCouponDiscount),
      minAmount: Number(newCouponMin) || 500,
      expires: "2026-12-31",
      active: true,
      claims: 0
    };
    setPlatformCoupons([...platformCoupons, added]);
    setNewCouponCode("");
    setNewCouponDiscount("");
    setNewCouponMin("");
    showToast(`Promo voucher code ${added.code} compiled!`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Compiled discount coupon: ${added.code}` },
      ...auditLogs
    ]);
  };

  const handleToggleCoupon = (code: string) => {
    setPlatformCoupons(platformCoupons.map((c) => c.code === code ? { ...c, active: !c.active } : c));
    showToast("Voucher code state updated.");
  };

  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    
    // Simulate campaign progress
    setCampaignProgress("Preparing communication campaign delivery matrices...");
    setCampaignProgressPercentage(10);
    
    const interval = setInterval(() => {
      setCampaignProgressPercentage((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 300);

    setTimeout(() => {
      setCampaignProgress("Analyzing opt-out lists and clearing cellular DND filters...");
    }, 400);

    setTimeout(() => {
      setCampaignProgress("Dispatching secure digital campaign payload package...");
    }, 800);

    setTimeout(() => {
      const addedBc = {
        id: "BC-" + Math.floor(100 + Math.random() * 900),
        title: broadcastTitle,
        message: broadcastMessage,
        type: broadcastType,
        target: broadcastType === "Push" ? "1,250 devices" : broadcastType === "Email" ? "4,821 mailboxes" : "2,190 endpoints",
        date: "Just Now"
      };
      
      const updatedBc = [addedBc, ...recentBroadcasts];
      setRecentBroadcasts(updatedBc);
      localStorage.setItem("sa_recent_broadcasts", JSON.stringify(updatedBc));
      
      setCampaignProgress(null);
      setCampaignProgressPercentage(0);
      setBroadcastTitle("");
      setBroadcastMessage("");
      showToast(`Campaign broadcasted successfully!`);
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Dispatched multi-channel broadcast campaign: "${addedBc.title}"` },
        ...auditLogs
      ]);
    }, 1500);
  };

  const handleSimulatePayment = () => {
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const amount = [350, 480, 600, 950][Math.floor(Math.random() * 4)];
    const method = ["UPI Pay (PhonePe)", "UPI Pay (GPay)", "Razorpay Netbanking", "Razorpay Visa Card"][Math.floor(Math.random() * 4)];
    const email = ["customer." + Math.floor(Math.random() * 99) + "@gmail.com", "testuser@gmail.com", "sarah@gmail.com"][Math.floor(Math.random() * 3)];
    const newLog = {
      id: `PAY-ID-${randNum}`,
      amount,
      method,
      status: "SUCCESS",
      timestamp: "Just Now",
      email,
      tax: Math.round(amount * (Number(platformTax) / 100))
    };
    const updated = [newLog, ...customGatewayLogs];
    setCustomGatewayLogs(updated);
    localStorage.setItem("sa_custom_gateway_logs", JSON.stringify(updated));
    showToast(`Simulated payment accept of ₹${amount} via ${method}`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Payment accepted: ${newLog.id} (₹${amount})` },
      ...auditLogs
    ]);
  };

  const handleExportCSV = (reportType: "daily_gross" | "tax_ledger") => {
    let content = "";
    let filename = "";
    if (reportType === "daily_gross") {
      filename = "daily_gross_summary.csv";
      content = "Date,Multiplex Location,Gross Sales,Settlement Rate,Tax Outflow\n" +
        dashboardRevenueData.theatrePerformance.map(t => 
          `2026-07-08,"${t.theatreName}",₹${t.grossBookingValue.toLocaleString("en-IN")},88%,₹${t.taxes.toLocaleString("en-IN")}`
        ).join("\n") + "\n";
    } else {
      filename = "tax_audit_ledger.csv";
      content = "Transaction ID,Client Email,Amount,Platform Commission,GST Component,Payment Gateway\n" +
        customGatewayLogs.map(log => `${log.id},${log.email},₹${log.amount},₹${Math.round(log.amount*(Number(platformCommission)/100))},₹${log.tax},${log.method}`).join("\n");
    }
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Compiled and downloaded ${filename}!`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Downloaded CSV Report: ${filename}` },
      ...auditLogs
    ]);
  };

  const handleBackupDatabase = () => {
    showToast("Creating secure point-in-time database backup snapshot...");
    setTimeout(() => {
      const backupObj = {
        timestamp: new Date().toISOString(),
        movies,
        theatres,
        bookings,
        systemAdmins,
        theatreAdmins,
        platformSettings: { platformName, platformTax, platformCommission, smtpServer, maintenanceMode }
      };
      const content = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([content], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "cinevenue_db_snapshot_" + Date.now() + ".json");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Snapshot downloaded successfully!");
      setAuditLogs([
        { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: "Compiled database point-in-time backup snapshot file" },
        ...auditLogs
      ]);
    }, 1000);
  };

  const handleBlockUser = (email: string) => {
    showToast(`Revoked client token permissions for ${email}.`);
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Suspended platform access for user: ${email}` },
      ...auditLogs
    ]);
  };

  const handleUpdatePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Platform configurations saved successfully!");
    setAuditLogs([
      { timestamp: "Just Now", actor: "superadmin@cinevenue.com", ip: "103.22.41.8", action: `Updated global platform parameters (Tax: ${platformTax}%, Commission: ${platformCommission}%)` },
      ...auditLogs
    ]);
  };

  // Authoritative revenue and KPI calculations from real bookings
  const authoritativeMetrics = calculateRevenueMetrics(bookings);
  const dashboardRevenueData = generateAuthoritativeDashboardData(bookings);

  const totalBookingsCount = authoritativeMetrics.confirmedBookings;
  const totalRevenueSum = authoritativeMetrics.grossBookingValue;
  const platformRevenueValue = authoritativeMetrics.platformRevenue;
  const theatreSettlementValue = authoritativeMetrics.theatreSettlement;
  const taxesCollectedValue = authoritativeMetrics.taxCollected;
  const activeSchedulesCount = schedules.length;

  const runningMoviesCount = movies.length;
  // Dynamic occupancy rate calculations from actual seats
  const totalBookedSeats = authoritativeMetrics.ticketsSold;
  const totalAvailableSeats = Math.max(activeSchedulesCount * 120, totalBookedSeats || 1);
  const averageOccupancyPercent = Math.min(100, Math.round((totalBookedSeats / totalAvailableSeats) * 100)) || 0;

  // Daily revenue from authoritative trends
  const last7DaysData = dashboardRevenueData.dailyTrends.map(trend => ({
    day: trend.label.split(",")[0] || trend.label,
    date: trend.date,
    revenue: trend.grossBookingValue
  }));

  // Seat categories occupancy breakdown from actual bookings
  const seatCategories = [
    { name: "Executive / Classic", booked: Math.round(totalBookedSeats * 0.60), capacity: Math.round(totalAvailableSeats * 0.60), color: "#3B82F6", icon: "🎟️" },
    { name: "Premium Gold", booked: Math.round(totalBookedSeats * 0.25), capacity: Math.round(totalAvailableSeats * 0.25), color: "#F59E0B", icon: "⭐" },
    { name: "VVIP Recliner Lux", booked: Math.round(totalBookedSeats * 0.15), capacity: Math.round(totalAvailableSeats * 0.15), color: "#10B981", icon: "👑" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0D8D0] flex flex-col font-sans selection:bg-gold selection:text-black">
      
      {/* Platform Status Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121213] border border-gold/30 p-4 rounded-xl text-xs font-bold text-gold flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP COMPILER PANEL BAR */}
      <header className="h-16 bg-[#121213] border-b border-white/5 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-gold" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-white">
              CINEVENUE PLATFORM SYSTEM CONTROL
            </h1>
            <p className="text-[9px] font-mono text-text-secondary">
              LEVEL-10 HYPER-PROTECTED SUPER-ADMIN SECURE PORTAL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NODE ACTIVE</span>
            <span>|</span>
            <span>2026-07-08 02:05 AM UTC</span>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/");
            }}
            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 font-bold uppercase text-[9px] tracking-wider rounded-lg transition-colors border border-red-500/20 cursor-pointer"
          >
            Exit System Control
          </button>
        </div>
      </header>

      {/* WORKSPACE SIDEBAR LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <aside className="w-64 bg-[#121213] border-r border-white/5 flex flex-col justify-between shrink-0 select-none">
          
          <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search control panels..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 focus:border-gold pl-8 pr-3 py-1.5 rounded-lg text-[11px] focus:outline-none"
              />
            </div>
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {filteredSidebarGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <h4 className="text-[9px] font-bold text-text-muted uppercase tracking-[0.15em] px-3">
                  {group.title}
                </h4>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-between border-0 cursor-pointer ${
                          isActive
                            ? "bg-gold/10 text-gold shadow-md"
                            : "text-text-secondary hover:text-white hover:bg-white/[0.01]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-gold" : "text-text-muted"}`} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Admin profile snippet footer */}
          <div className="p-4 border-t border-white/5 bg-white/[0.01] flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gold/40 to-yellow-600/10 border border-gold/20 flex items-center justify-center font-bold font-mono text-xs text-gold">
              SA
            </div>
            <div>
              <span className="text-[10px] font-bold text-white block">Amarnath Gattem</span>
              <span className="text-[9px] font-mono text-gold block">superadmin@cinevenue</span>
            </div>
          </div>
        </aside>

        {/* COMPILER CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#0A0A0B] p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6 text-left">
            
            {/* 1. DASHBOARD OVERVIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Cinevenue Platform Central Overview
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Real-time transaction tracking, active screenings audit logs, and gross revenue metrics
                  </p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="bg-[#121213] border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Registered Users</span>
                    <span className="text-lg md:text-xl font-bold text-white block font-mono">{(registeredUsers.length + 845).toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold block">+18 joined today</span>
                  </div>
                  <div className="bg-[#121213] border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Theatre Partners</span>
                    <span className="text-lg md:text-xl font-bold text-white block font-mono">{theatres.length} Owners</span>
                    <span className="text-[9px] text-gold font-mono block">6 pending verification</span>
                  </div>
                  <div className="bg-[#121213] border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Total Shows</span>
                    <span className="text-lg md:text-xl font-bold text-white block font-mono">{activeSchedulesCount} active</span>
                    <span className="text-[9px] text-gold font-mono block">Across {theatres.length} locations</span>
                  </div>
                  <div className="bg-[#121213] border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Running Movies</span>
                    <span className="text-lg md:text-xl font-bold text-white block font-mono">{runningMoviesCount} active</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold block">In high rotation</span>
                  </div>
                  <div className="bg-[#121213] border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Platform Gross</span>
                    <span className="text-lg md:text-xl font-bold text-white block font-mono">₹{(totalRevenueSum / 100000).toFixed(2)}L</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold block">+14.2% growth</span>
                  </div>
                  <div className="bg-[#121213] border border-white/5 p-4 rounded-xl space-y-1">
                    <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Occupancy Rate</span>
                    <span className="text-lg md:text-xl font-bold text-white block font-mono">{averageOccupancyPercent}% Avg</span>
                    <span className="text-[9px] text-gold font-mono block">Optimal seat load</span>
                  </div>
                </div>

                {/* Interactive Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Revenue Trend Graph */}
                  <div className="lg:col-span-7 bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Box Office Revenue Trend</h3>
                        <p className="text-[10px] text-text-secondary">7-day performance tracking and real-time ledger gross</p>
                      </div>
                      <div className="flex gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => setSelectedChartRange("7days")}
                          className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            selectedChartRange === "7days" ? "bg-gold text-black border-0" : "text-text-secondary hover:text-white bg-transparent border-0"
                          }`}
                        >
                          7 Days
                        </button>
                        <button
                          onClick={() => setSelectedChartRange("30days")}
                          className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            selectedChartRange === "30days" ? "bg-gold text-black border-0" : "text-text-secondary hover:text-white bg-transparent border-0"
                          }`}
                        >
                          30 Days
                        </button>
                      </div>
                    </div>

                    <div className="relative pt-4 h-[200px]">
                      {/* SVG Revenue Graph */}
                      <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.00" />
                          </linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Horizontal Grid lines */}
                        {[0.25, 0.5, 0.75, 1].map((ratio, index) => {
                          const y = 15 + 140 - (ratio * 140);
                          const val = Math.round((Math.max(...last7DaysData.map(d => d.revenue)) * ratio) / 1000);
                          return (
                            <g key={index} className="opacity-40">
                              <line x1="40" y1={y} x2="480" y2={y} stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3" className="stroke-white/10" />
                              <text x="32" y={y + 3} fill="#888888" fontSize="8" fontFamily="monospace" textAnchor="end">₹{val}K</text>
                            </g>
                          );
                        })}

                        {/* Plot Area */}
                        {(() => {
                          const maxRev = Math.max(...last7DaysData.map(d => d.revenue), 1);
                          const points = last7DaysData.map((item, i) => {
                            const x = 40 + (i * (440 / 6));
                            const y = 15 + 140 - ((item.revenue / maxRev) * 140);
                            return { x, y, ...item };
                          });

                          const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                          const areaPath = `${linePath} L ${points[points.length - 1].x} 155 L ${points[0].x} 155 Z`;

                          return (
                            <>
                              {/* Filled Gradient Area */}
                              <path d={areaPath} fill="url(#revenue-gradient)" />

                              {/* Smooth Stroke Line */}
                              <path d={linePath} fill="none" stroke="#F59E0B" strokeWidth="2.5" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />

                              {/* Interactive Hover Vertical Guide */}
                              {hoveredRevenueDay && (
                                <line
                                  x1={40 + (last7DaysData.findIndex(d => d.date === hoveredRevenueDay.date) * (440 / 6))}
                                  y1="15"
                                  x2={40 + (last7DaysData.findIndex(d => d.date === hoveredRevenueDay.date) * (440 / 6))}
                                  y2="155"
                                  stroke="#F59E0B"
                                  strokeWidth="1"
                                  strokeDasharray="4 4"
                                  className="opacity-70"
                                />
                              )}

                              {/* Data Nodes */}
                              {points.map((p, i) => {
                                const isHovered = hoveredRevenueDay?.date === p.date;
                                return (
                                  <g key={i}>
                                    <circle
                                      cx={p.x}
                                      cy={p.y}
                                      r={isHovered ? 6 : 4}
                                      fill={isHovered ? "#ffffff" : "#F59E0B"}
                                      stroke="#0A0A0B"
                                      strokeWidth={isHovered ? 2 : 1.5}
                                      className="transition-all cursor-pointer"
                                      onMouseEnter={() => setHoveredRevenueDay(p)}
                                      onMouseLeave={() => setHoveredRevenueDay(null)}
                                    />
                                    {/* X-axis ticks & Labels */}
                                    <text x={p.x} y="170" fill="#a1a1aa" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                      {p.day}
                                    </text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>

                      {/* Interactive Hover Tooltip */}
                      {hoveredRevenueDay && (
                        <div
                          className="absolute bg-[#121213] border border-gold/40 px-3.5 py-2 rounded-xl text-[10px] font-mono text-left shadow-2xl z-20 backdrop-blur-md transition-all pointer-events-none"
                          style={{
                            left: `${Math.min(72, Math.max(8, (last7DaysData.findIndex(d => d.date === hoveredRevenueDay.date) * 12.5) + 6))}%`,
                            top: "10px",
                          }}
                        >
                          <span className="text-text-secondary block border-b border-white/5 pb-1 mb-1 font-sans text-[9px] font-bold uppercase tracking-wider">
                            {hoveredRevenueDay.date} Performance
                          </span>
                          <span className="text-white block">
                            Daily gross: <strong className="text-gold font-bold font-mono">₹{hoveredRevenueDay.revenue.toLocaleString()}</strong>
                          </span>
                          <span className="text-emerald-400 text-[8px] font-bold block mt-0.5">
                            ● SECURED SETTLEMENTS
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seat Occupancy circular & bar chart */}
                  <div className="lg:col-span-5 bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Seat Occupancy Monitor</h3>
                          <p className="text-[10px] text-text-secondary">Concentric reservation loads and category fills</p>
                        </div>
                        <span className="px-2 py-0.5 text-[8px] rounded font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
                          Live Sync
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
                        {/* Circle Donut Representation */}
                        <div className="relative w-32 h-32 shrink-0 mx-auto sm:mx-0">
                          <svg className="w-full h-full overflow-visible">
                            <circle cx="64" cy="64" r="45" fill="transparent" stroke="#1F1F22" strokeWidth="8" />
                            <circle
                              cx="64"
                              cy="64"
                              r="45"
                              fill="transparent"
                              stroke="#F59E0B"
                              strokeWidth="8"
                              strokeDasharray={`${(averageOccupancyPercent / 100) * 282.7} 282.7`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              transform="rotate(-90 64 64)"
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-lg font-bold text-white block font-mono">{averageOccupancyPercent}%</span>
                            <span className="text-[8px] text-text-secondary uppercase tracking-wider block font-bold">Occupied</span>
                          </div>
                        </div>

                        {/* Quick Statistics Breakdown */}
                        <div className="flex-1 w-full space-y-2.5 text-[10px] font-mono">
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-text-secondary">Allocated Capacity:</span>
                            <span className="text-white font-bold">{totalAvailableSeats.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-text-secondary">Seats Booked:</span>
                            <span className="text-gold font-bold">{totalBookedSeats.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pb-1">
                            <span className="text-text-secondary">Vacant Seats:</span>
                            <span className="text-emerald-400 font-bold">{(totalAvailableSeats - totalBookedSeats).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seat Categories fill metrics */}
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary block">Seat Class Capacity Load</span>
                      <div className="space-y-2.5">
                        {seatCategories.map((cat, idx) => {
                          const loadPct = Math.round((cat.booked / cat.capacity) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-white font-bold flex items-center gap-1">
                                  <span>{cat.icon}</span>
                                  <span>{cat.name}</span>
                                </span>
                                <span className="font-mono text-text-secondary font-bold">
                                  {cat.booked.toLocaleString()} / <span className="text-text-muted">{cat.capacity.toLocaleString()}</span> ({loadPct}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${loadPct}%`,
                                    backgroundColor: cat.color,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid chart rows - Secondary breakdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Movie Gross box-office share listings */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Dynamic Film Catalogue Share</h3>
                      <span className="text-[9px] font-mono text-gold font-bold">Released Ratings</span>
                    </div>
                    <div className="space-y-3.5">
                      {movies.length === 0 ? (
                        <p className="text-[10px] text-text-secondary italic">No active movies registered in directory.</p>
                      ) : (
                        movies.slice(0, 4).map((m) => {
                          const movieMetrics = calculateRevenueMetrics(bookings, { movieTitle: m.title });
                          const movieGross = movieMetrics.grossBookingValue;
                          const movieSharePct = totalRevenueSum > 0 ? Math.min(100, Math.round((movieGross / totalRevenueSum) * 100)) : 0;
                          return (
                            <div key={m.title} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-text-secondary truncate pr-3">{m.title}</span>
                                <span className="font-mono text-gold font-bold shrink-0">₹{movieGross.toLocaleString("en-IN")} ({m.rating}⭐)</span>
                              </div>
                              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="bg-gold h-full rounded-full" style={{ width: `${Math.max(5, movieSharePct)}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Operational Activities stream */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live Platform Ledger Stream</h3>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold animate-pulse">● SECURE STREAM</span>
                    </div>
                    <div className="space-y-3 font-mono text-[10px]">
                      {auditLogs.slice(0, 4).map((log, index) => (
                        <div key={index} className="flex gap-2 items-start text-text-secondary border-b border-white/5 pb-2">
                          <span className="text-gold shrink-0">[{log.timestamp.split(" ")[1] || "Just Now"}]</span>
                          <span className="text-white shrink-0 font-bold">{log.actor.split("@")[0]}:</span>
                          <span className="leading-relaxed text-[10px]">{log.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ADMIN MANAGEMENT */}
            {activeTab === "admins" && (
              <AdminManagementPanel />
            )}

            {/* 3. THEATRE OWNER MANAGEMENT */}
            {activeTab === "owners" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Multiplex Owner & Partner Management
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Audit regional franchise owners, verify banking clearance details, and reset secure portal credentials
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Create partner form */}
                  <form onSubmit={handleCreateOwner} className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Register Theatre Partner Owner
                    </h3>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">Owner Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Reddy"
                          value={newOwnerName}
                          onChange={(e) => setNewOwnerName(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">Corporate Email</label>
                        <input
                          type="email"
                          required
                          placeholder="ramesh.pvr@cinevenue.com"
                          value={newOwnerEmail}
                          onChange={(e) => setNewOwnerEmail(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">Designated Theatre ID</label>
                        <select
                          value={newOwnerTheatre}
                          onChange={(e) => setNewOwnerTheatre(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none"
                        >
                          {theatres.map((t) => (
                            <option key={t.id} value={t.id} className="bg-[#0A0A0B]">{t.name} ({t.location})</option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="w-full bg-gold hover:bg-gold-light text-black py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px]">
                        Register Partner Owner
                      </button>
                    </div>
                  </form>

                  {/* Owners list */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Franchise Multiplex Owners Directory
                    </h3>
                    <div className="space-y-4">
                      {theatreAdmins.map((adm) => {
                        const targetTheatre = theatres.find((t) => t.id === adm.theatreId);
                        const isSuspended = adm.passwordHash === "SUSPENDED";
                        const logs = ownerResetCommandLogs[adm.email] || [];
                        return (
                          <div key={adm.id} className="bg-white/[0.01] p-4 rounded-xl border border-white/5 space-y-3.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <span className="font-bold text-white block font-mono">{adm.email}</span>
                                <span className="text-[10px] text-text-secondary block">
                                  Designated Theatre: <strong className="text-gold">{targetTheatre ? targetTheatre.name : `Theatre ID #${adm.theatreId}`}</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleToggleOwnerStatus(adm.email)}
                                  className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${
                                    !isSuspended
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-red-500/10 text-red-400 border-red-500/20"
                                  }`}
                                >
                                  {!isSuspended ? "Verified Partner" : "Suspended"}
                                </button>
                                <button
                                  onClick={() => handleTriggerCredentialsReset(adm.email)}
                                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 hover:border-gold/30 border border-transparent text-[9px] font-bold uppercase tracking-wider rounded"
                                >
                                  Reset Credentials
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOwner(adm.email)}
                                  className="p-1 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            {logs.length > 0 && (
                              <div className="bg-black/40 border border-white/5 p-3 rounded-lg font-mono text-[9px] text-emerald-400/95 space-y-1">
                                <div className="text-[8px] uppercase tracking-wider text-white/50 border-b border-white/5 pb-1 mb-1">
                                  Credentials Reset Terminal Feed
                                </div>
                                {logs.map((log, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <span className="text-gold/60">{`>`}</span>
                                    <span>{log}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. THEATRE APPROVAL & MANAGEMENT */}
            {activeTab === "theatres" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                      Multiplex & Screen Approvals
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Verify partner licensing coordinates, review facilities checkboxes, and approve multiplex listings
                    </p>
                  </div>
                </div>

                <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <div className="flex gap-4 items-center mb-2">
                    <Filter className="w-4 h-4 text-gold" />
                    <input
                      type="text"
                      placeholder="Filter theatres by name/location..."
                      value={theatreFilter}
                      onChange={(e) => setTheatreFilter(e.target.value)}
                      className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl w-64 focus:outline-none"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5">
                          <th className="pb-3.5 uppercase tracking-wider text-[10px] font-bold">Multiplex Name</th>
                          <th className="pb-3.5 uppercase tracking-wider text-[10px] font-bold">Location</th>
                          <th className="pb-3.5 uppercase tracking-wider text-[10px] font-bold">Facilities</th>
                          <th className="pb-3.5 uppercase tracking-wider text-[10px] font-bold">Price Matrix</th>
                          <th className="pb-3.5 uppercase tracking-wider text-[10px] font-bold">Verification Status</th>
                          <th className="pb-3.5 uppercase tracking-wider text-[10px] font-bold text-right">Clearance Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {theatres
                          .filter((t) => t.name.toLowerCase().includes(theatreFilter.toLowerCase()))
                          .map((t) => (
                            <React.Fragment key={t.id}>
                              <tr className="hover:bg-white/[0.01]">
                                <td className="py-3.5 font-bold text-white">{t.name}</td>
                                <td className="py-3.5 text-text-secondary font-mono">{t.location}</td>
                                <td className="py-3.5">
                                  <div className="flex gap-1 flex-wrap">
                                    {t.features.map((f) => (
                                      <span key={f} className="px-1.5 py-0.5 bg-white/5 text-[9px] text-text-secondary rounded">{f}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3.5 font-mono text-gold font-bold">{t.price}</td>
                                <td className="py-3.5">
                                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                                    ● Verified Active
                                  </span>
                                </td>
                                <td className="py-3.5 text-right space-x-1">
                                  <button
                                    onClick={() => {
                                      setInspectingTheatreId(t.id);
                                      setInspectFeatures(t.features);
                                      setInspectPrice(t.price);
                                    }}
                                    className="px-2.5 py-1 bg-gold hover:bg-gold-light text-black font-bold uppercase text-[9px] rounded"
                                  >
                                    Inspect & Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTheatre(t.id)}
                                    className="p-1 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                              {inspectingTheatreId === t.id && (
                                <tr className="bg-white/[0.02]">
                                  <td colSpan={6} className="p-4 border-t border-white/5 space-y-3.5">
                                    <div className="flex flex-col md:flex-row gap-6">
                                      <div className="flex-1 space-y-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">Inspect Premium Facilities Checkboxes</span>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1.5">
                                          {["Recliner", "Dolby Atmos", "4K Projection", "Laser IMAX", "Valet Parking", "Executive Lounge"].map((facility) => {
                                            const isChecked = inspectFeatures.includes(facility);
                                            return (
                                              <label key={facility} className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={isChecked}
                                                  onChange={() => {
                                                    if (isChecked) {
                                                      setInspectFeatures(inspectFeatures.filter(f => f !== facility));
                                                    } else {
                                                      setInspectFeatures([...inspectFeatures, facility]);
                                                    }
                                                  }}
                                                  className="rounded border-white/10 bg-white/5 text-gold focus:ring-gold focus:ring-offset-0 h-3.5 w-3.5"
                                                />
                                                {facility}
                                              </label>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <div className="w-full md:w-64 space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/75 block">Pricing Matrix (per class)</label>
                                        <input
                                          type="text"
                                          value={inspectPrice}
                                          onChange={(e) => setInspectPrice(e.target.value)}
                                          placeholder="e.g. Classic: ₹150, Premium: ₹250"
                                          className="w-full bg-white/[0.02] border border-white/10 focus:border-gold px-3 py-2 rounded-lg text-white text-[11px] font-mono focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                                      <button
                                        type="button"
                                        onClick={() => setInspectingTheatreId(null)}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white rounded-lg uppercase tracking-wider"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateTheatreDetails(t.id, inspectFeatures, inspectPrice)}
                                        className="px-3 py-1.5 bg-gold hover:bg-gold-light text-[10px] font-bold text-black rounded-lg uppercase tracking-wider"
                                      >
                                        Apply Configuration
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. MOVIE MANAGEMENT */}
            {activeTab === "movies" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Global Movie Directory Management
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Register new theatrical movie listings, upload regional metadata poster parameters, and manage trailers
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Create movie form */}
                  <form onSubmit={handleCreateMovie} className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-3 text-xs h-fit">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Launch Film Entry listings
                    </h3>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Movie Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Devara"
                        value={newMovieTitle}
                        onChange={(e) => setNewMovieTitle(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Genre</label>
                      <input
                        type="text"
                        placeholder="Action/Drama"
                        value={newMovieGenre}
                        onChange={(e) => setNewMovieGenre(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase text-text-secondary">Language</label>
                        <input
                          type="text"
                          placeholder="Telugu/Hindi"
                          value={newMovieLang}
                          onChange={(e) => setNewMovieLang(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase text-text-secondary">Duration</label>
                        <input
                          type="text"
                          placeholder="150 min"
                          value={newMovieDuration}
                          onChange={(e) => setNewMovieDuration(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Poster URL (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newMoviePoster}
                        onChange={(e) => setNewMoviePoster(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg focus:outline-none font-mono text-[10px]"
                      />
                    </div>
                    <button type="submit" className="w-full bg-gold hover:bg-gold-light text-black py-2 rounded-xl font-bold uppercase text-[9px] tracking-wider mt-2">
                      Publish Movie listings
                    </button>
                  </form>

                  {/* Active films directory */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Live Platform Film Catalogue
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {movies.map((m) => (
                        <div key={m.title} className="bg-white/[0.01] border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                          <img src={m.img} className="w-full h-32 object-cover rounded-lg mb-2" alt={m.title} />
                          <div className="space-y-1">
                            <h4 className="font-bold text-white text-xs truncate">{m.title}</h4>
                            <p className="text-[9px] text-text-secondary font-mono">{m.genre} | {m.lang}</p>
                            <div className="flex justify-between items-center pt-2">
                              <span className="text-[9px] font-mono font-bold text-gold">Rating: {m.rating}</span>
                              <button
                                onClick={() => handleDeleteMovie(m.title)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SHOW MANAGEMENT */}
            {activeTab === "shows" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Show Scheduling conflicts Monitor
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Observe active partner show schedules, evaluate time slots, and enforce safety buffer spacing rules
                  </p>
                </div>

                <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                    Live Schedules Ledger ({schedules.length} runs)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5">
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Show ID</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Movie Film</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Multiplex Venue</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Allocated Slot</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Ticket Price</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Conflict Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-text-secondary">
                        {schedules.map((sch) => (
                          <tr key={sch.id} className="hover:bg-white/[0.01]">
                            <td className="py-3 font-bold text-white">{sch.id}</td>
                            <td className="py-3 text-gold font-bold">{sch.movieTitle}</td>
                            <td className="py-3">{sch.theatreName}</td>
                            <td className="py-3 text-white">{sch.timeSlot} ({sch.date})</td>
                            <td className="py-3 text-gold">₹{sch.pricePerSeat}</td>
                            <td className="py-3 text-right">
                              <span className="px-2 py-0.5 text-[9px] rounded font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                CLEAR BUFFER
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 7. USER MANAGEMENT */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Registered Platform Users
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Observe account login activity logs, revoke malicious client tokens, and audit platform membership history
                  </p>
                </div>

                <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <div className="flex gap-4 items-center mb-2">
                    <Filter className="w-4 h-4 text-gold" />
                    <input
                      type="text"
                      placeholder="Filter users by email..."
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl w-64 focus:outline-none"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5">
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Client Account Email</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Joined Date</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Mobile Contact</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px]">Access Clearance</th>
                          <th className="pb-3 font-bold uppercase tracking-wider text-[10px] text-right">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-text-secondary">
                        {registeredUsers
                          .filter((u) => u.email.toLowerCase().includes(userFilter.toLowerCase()))
                          .map((u) => (
                            <tr key={u.email} className="hover:bg-white/[0.01]">
                              <td className="py-3 font-bold text-white">{u.email}</td>
                              <td className="py-3 text-[11px]">{u.joinedAt || "2026-07-01"}</td>
                              <td className="py-3 text-[11px]">{u.mobile || "+91 98765 43210"}</td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 text-[9px] rounded font-bold bg-emerald-500/10 text-emerald-400">
                                  Access Allowed
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleBlockUser(u.email)}
                                  className="px-2.5 py-1 text-[9px] font-bold bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/20 text-red-400 rounded transition-all"
                                >
                                  Block Account
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 8. BOOKING AUDIT & REFUNDS */}
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Platform Booking Transaction Ledger
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Query active client ticketing transactions, authorize cancellation refunds, and export seat occupancy tables
                  </p>
                </div>

                <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <div className="flex gap-4 items-center">
                    <Filter className="w-4 h-4 text-gold" />
                    <input
                      type="text"
                      placeholder="Filter bookings by ID or movie..."
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value)}
                      className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl w-64 focus:outline-none"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-text-secondary border-b border-white/5">
                          <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Booking Code</th>
                          <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Client Email</th>
                          <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Allocated Movie / Show</th>
                          <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Seats Row</th>
                          <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Total Price</th>
                          <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px]">Clearing State</th>
                          <th className="pb-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Refund Trigger</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-mono text-text-secondary">
                        {bookings
                          .filter((b) => b.id.toLowerCase().includes(bookingFilter.toLowerCase()) || b.movieTitle.toLowerCase().includes(bookingFilter.toLowerCase()))
                          .map((b) => (
                            <React.Fragment key={b.id}>
                              <tr className="hover:bg-white/[0.01]">
                                <td className="py-3 font-bold text-white">{b.id}</td>
                                <td className="py-3 text-[11px] text-text-secondary">{b.userEmail}</td>
                                <td className="py-3 text-[11px] text-white font-semibold">{b.movieTitle} ({b.timeSlot})</td>
                                <td className="py-3 text-gold font-bold">{b.seats.join(", ")}</td>
                                <td className="py-3 text-white">₹{b.totalPrice}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 text-[9px] rounded font-bold ${
                                    b.status === "Settled"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  {b.status !== "Cancelled" && refundingBookingId !== b.id && (
                                    <button
                                      onClick={() => handleCancelBooking(b.id)}
                                      className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-black rounded text-[9px] font-bold"
                                    >
                                      Void Ticket & Refund
                                    </button>
                                  )}
                                  {b.status === "Cancelled" && (
                                    <span className="text-[9px] text-text-secondary italic">Voided & Refunded</span>
                                  )}
                                </td>
                              </tr>
                              {refundingBookingId === b.id && (
                                <tr>
                                  <td colSpan={7} className="p-3 bg-red-950/10 border-t border-red-500/10">
                                    <div className="flex items-center gap-3">
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-400 border-t-transparent"></div>
                                      <div className="flex-1 space-y-1">
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">Refund Command Execution Sequence...</span>
                                        <div className="flex flex-wrap gap-2 text-[8px] text-red-200/70 font-mono">
                                          {refundProgressLogs.map((log, idx) => (
                                            <span key={idx} className="bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/10">{log}</span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 9. PAYMENTS & GST REPORTS */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                      Payment Gateway logs & GST Ledger
                    </h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Observe active UPI/netbanking routing protocols, review GST compliance values, and trigger platform payouts
                    </p>
                  </div>
                  <button
                    onClick={handleSimulatePayment}
                    className="self-start sm:self-auto px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all"
                  >
                    Simulate Live PG Payment
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* GST calculations */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Quarterly GST Compliance Ledger
                    </h3>
                    <div className="space-y-3 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Gross Customer Paid:</span>
                        <span className="text-white font-bold">₹{totalRevenueSum.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">CineVenue Revenue:</span>
                        <span className="text-emerald-400 font-bold">₹{platformRevenueValue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Theatre Settlements:</span>
                        <span className="text-purple-400 font-bold">₹{theatreSettlementValue.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="border-t border-white/5 pt-2.5 space-y-1.5">
                        <div className="flex justify-between text-text-secondary text-[10px]">
                          <span>CGST (Central GST - 9%):</span>
                          <span>₹{Math.round(taxesCollectedValue / 2).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-text-secondary text-[10px]">
                          <span>SGST (State GST - 9%):</span>
                          <span>₹{Math.round(taxesCollectedValue / 2).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2">
                        <span className="text-text-secondary font-bold">Total Taxes Collected:</span>
                        <span className="text-gold font-bold">₹{taxesCollectedValue.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Logs */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2 flex justify-between items-center">
                      <span>Payment Gateway API Logs (Razorpay Secure / UPI)</span>
                      <span className="text-[9px] font-mono text-gold normal-case">{customGatewayLogs.length} Active Records</span>
                    </h3>
                    <div className="space-y-3 font-mono text-[10px] max-h-[320px] overflow-y-auto pr-1">
                      {customGatewayLogs.map((log) => (
                        <div key={log.id} className="p-3 bg-white/[0.01] hover:bg-white/[0.02] transition-colors rounded-lg border border-white/5 flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-emerald-400 block font-bold">● SECURE_PAYMENT_ACCEPTED</span>
                            <span className="text-[9px] text-text-secondary block">
                              REF: {log.id} | Amount: <strong className="text-white">₹{log.amount}</strong> | Tax component: <strong className="text-gold">₹{log.tax || Math.round(log.amount * (Number(platformTax)/100))}</strong> | Routing: {log.method}
                            </span>
                            <span className="text-[8px] text-white/40 block">Email: {log.email}</span>
                          </div>
                          <span className="text-text-secondary text-[9px] whitespace-nowrap">{log.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. COUPONS & PROMOTIONS */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Coupons & Festival Promotions Manager
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Provision global cashback promotional codes, configure holiday triggers, and audit checkout referral metrics
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Create coupon */}
                  <form onSubmit={handleCreateCoupon} className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Compile Promo Voucher
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Voucher Promo Code</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MONSOON50"
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg text-white uppercase font-mono font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Discount value (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 50"
                        value={newCouponDiscount}
                        onChange={(e) => setNewCouponDiscount(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg font-mono text-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Min Cart Gross value (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={newCouponMin}
                        onChange={(e) => setNewCouponMin(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg font-mono text-white"
                      />
                    </div>
                    <button type="submit" className="w-full bg-gold hover:bg-gold-light text-black py-2 rounded-xl font-bold uppercase text-[9px] tracking-wider mt-1">
                      Launch Coupon Code
                    </button>
                  </form>

                  {/* Coupon directory */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Active Promotional Vouchers
                    </h3>
                    <div className="space-y-3">
                      {platformCoupons.map((c) => (
                        <div key={c.code} className="flex justify-between items-center bg-white/[0.01] p-3.5 rounded-xl border border-white/5 font-mono">
                          <div>
                            <span className="text-xs font-bold text-gold uppercase">{c.code}</span>
                            <span className="text-[9px] text-text-secondary block mt-0.5">
                              Value: ₹{c.discount} OFF | Min Order: ₹{c.minAmount} | Expiry: {c.expires}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-muted">{c.claims} claims</span>
                            <button
                              onClick={() => handleToggleCoupon(c.code)}
                              className={`px-2 py-0.5 text-[9px] rounded font-bold uppercase border ${
                                c.active
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                            >
                              {c.active ? "Live" : "Paused"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. ADVANCED ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Advanced Occupancy & Traffic Metrics
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Analyze seat reservation density, evaluate regional city ticket sales, and track peak traffic booking hours
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Occupancy Analytics */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex justify-between items-center">
                      <span>Seat Occupancy Densitometer</span>
                      <span className="text-[9px] text-gold font-mono uppercase font-bold tracking-wider">Multiplex Density Meters</span>
                    </h3>
                    <div className="space-y-4 font-mono">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Prasads IMAX (Screen 1 & 2)</span>
                          <span className="text-gold font-bold">88% Capacity</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full" style={{ width: "88%" }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>PVR GVK One (Screen 1-5)</span>
                          <span className="text-gold font-bold">75% Capacity</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full" style={{ width: "75%" }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Cinepolis VIP Lounge (Screen 1)</span>
                          <span className="text-gold font-bold">92% Capacity</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full" style={{ width: "92%" }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span>Asian Cinemas multiplexes</span>
                          <span className="text-gold font-bold">61% Capacity</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-amber-500 to-gold h-full rounded-full" style={{ width: "61%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hourly traffic analysis */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Traffic Activity Heatmap</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 font-mono text-center text-[10px]">
                        {[
                          { name: "Morning", style: "bg-gold/10 text-gold border border-gold/15 hover:bg-gold/15" },
                          { name: "Noon", style: "bg-gold/20 text-gold border border-gold/20 hover:bg-gold/25" },
                          { name: "Matinee", style: "bg-gold text-black font-bold hover:bg-gold-light" },
                          { name: "Evening", style: "bg-gold/60 text-black font-bold hover:bg-gold/70" },
                          { name: "Late Show", style: "bg-gold/30 text-gold border border-gold/30 hover:bg-gold/45" },
                          { name: "Midnight", style: "bg-gold/5 text-text-secondary hover:bg-gold/10" }
                        ].map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setActiveHeatmapPeriod(item.name)}
                            className={`p-2 rounded flex flex-col justify-center items-center transition-all cursor-pointer ${item.style} ${
                              activeHeatmapPeriod === item.name ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
                            }`}
                          >
                            <span className="text-[9px] block uppercase tracking-wider font-bold">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Heatmap Period details */}
                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-2 mt-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <span className="font-bold text-white uppercase tracking-wider text-[10px]">{activeHeatmapPeriod} Shift Analytics</span>
                        <span className="text-[9px] text-gold font-mono font-bold uppercase">Live Sensor Tracking</span>
                      </div>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] font-mono">
                        <div>
                          <span className="text-text-secondary block">Peak Booking Speed:</span>
                          <span className="text-white font-bold">
                            {activeHeatmapPeriod === "Morning" && "25 tickets/min"}
                            {activeHeatmapPeriod === "Noon" && "52 tickets/min"}
                            {activeHeatmapPeriod === "Matinee" && "120 tickets/min"}
                            {activeHeatmapPeriod === "Evening" && "95 tickets/min"}
                            {activeHeatmapPeriod === "Late Show" && "60 tickets/min"}
                            {activeHeatmapPeriod === "Midnight" && "10 tickets/min"}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Active Screens:</span>
                          <span className="text-white font-bold">
                            {activeHeatmapPeriod === "Morning" && "8 Screens active"}
                            {activeHeatmapPeriod === "Noon" && "12 Screens active"}
                            {activeHeatmapPeriod === "Matinee" && "24 Screens active"}
                            {activeHeatmapPeriod === "Evening" && "20 Screens active"}
                            {activeHeatmapPeriod === "Late Show" && "15 Screens active"}
                            {activeHeatmapPeriod === "Midnight" && "4 Screens active"}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Best Selling Snack:</span>
                          <span className="text-white font-bold">
                            {activeHeatmapPeriod === "Morning" && "Filter Coffee & Idli"}
                            {activeHeatmapPeriod === "Noon" && "Samosa & Soda Duo"}
                            {activeHeatmapPeriod === "Matinee" && "Caramel Tub & Coke"}
                            {activeHeatmapPeriod === "Evening" && "Cheese Popcorn & Pizza"}
                            {activeHeatmapPeriod === "Late Show" && "Nachos with Extra Cheese"}
                            {activeHeatmapPeriod === "Midnight" && "Salted Tub & Red Bull"}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Dominant Age Group:</span>
                          <span className="text-white font-bold">
                            {activeHeatmapPeriod === "Morning" && "18-25 years (Students)"}
                            {activeHeatmapPeriod === "Noon" && "25-40 years (Corporate)"}
                            {activeHeatmapPeriod === "Matinee" && "12-60 years (Families)"}
                            {activeHeatmapPeriod === "Evening" && "20-45 years (Friends)"}
                            {activeHeatmapPeriod === "Late Show" && "18-35 years (Young Adults)"}
                            {activeHeatmapPeriod === "Midnight" && "18-28 years (Die-hard Fans)"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-text-secondary italic pt-1.5 border-t border-white/5">
                        {activeHeatmapPeriod === "Morning" && "Student-heavy crowds taking advantage of early bird discount schemes."}
                        {activeHeatmapPeriod === "Noon" && "Corporate team lunch breaks and casual afternoon viewers filling multiplex seats."}
                        {activeHeatmapPeriod === "Matinee" && "Peak weekend family cluster. Screens running at maximum cooling and audio capacity."}
                        {activeHeatmapPeriod === "Evening" && "High volume of working professionals and couples. Premium snack sales at absolute highest."}
                        {activeHeatmapPeriod === "Late Show" && "Excellent stable crowd density. Popular for action releases and blockbuster genres."}
                        {activeHeatmapPeriod === "Midnight" && "Limited midnight screenings. Primarily die-hard fans attending premiere shows."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 12. ALERT BROADCASTING */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Alert Broadcasting Center
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Dispatch live in-app push notifications, trigger SMTP email campaigns, and configure SMS delivery options
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Broadcast Form */}
                  <form onSubmit={handleBroadcastAlert} className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-3.5 h-fit">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Compile Push Broadcast
                    </h3>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Delivery Channels</label>
                      <select
                        value={broadcastType}
                        onChange={(e) => setBroadcastType(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg text-white focus:outline-none"
                      >
                        <option value="Push" className="bg-[#0A0A0B]">Push Notification (Mobile/Web)</option>
                        <option value="Email" className="bg-[#0A0A0B]">SMTP Campaign Dispatch</option>
                        <option value="SMS" className="bg-[#0A0A0B]">SMS Provider Broadcast</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Alert Campaign Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Booking alert: Pushpa 2: The Rule!"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Broadcast Body Message</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Write message details..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-lg text-white focus:outline-none"
                      />
                    </div>

                    {broadcastStatus && (
                      <span className="text-[10px] text-gold font-mono block animate-pulse">
                        {broadcastStatus}
                      </span>
                    )}

                    <button type="submit" className="w-full bg-gold hover:bg-gold-light text-black py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] mt-1">
                      Dispatch Platform Broadcast
                    </button>
                  </form>

                  {/* Sent list */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                      Recent Broadcasting Ledger
                    </h3>
                    
                    {campaignProgress && (
                      <div className="bg-gold/5 border border-gold/10 p-4 rounded-xl space-y-2 animate-pulse font-mono">
                        <div className="flex justify-between text-[10px] font-bold text-gold uppercase tracking-wider">
                          <span>{campaignProgress}</span>
                          <span>{campaignProgressPercentage}% Complete</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="bg-gold h-full rounded-full transition-all duration-300" style={{ width: `${campaignProgressPercentage}%` }} />
                        </div>
                        <span className="text-[8px] text-text-secondary block">Deploying SMTP/API packet routes across all active cluster nodes...</span>
                      </div>
                    )}

                    <div className="space-y-3 font-mono text-[10px] text-text-secondary max-h-[300px] overflow-y-auto pr-1">
                      {recentBroadcasts.map((b) => (
                        <div key={b.id} className="p-3 bg-white/[0.01] hover:bg-white/[0.02] transition-colors rounded-xl border border-white/5 space-y-1">
                          <div className="flex justify-between items-center">
                            <strong className="text-white text-xs">{b.title}</strong>
                            <span className="text-[9px] px-1.5 py-0.5 bg-gold/10 text-gold rounded font-bold uppercase">{b.type} Channel</span>
                          </div>
                          <p className="text-[10px] text-white/80">{b.message}</p>
                          <div className="flex justify-between text-[8px] text-text-muted">
                            <span>Delivered to {b.target} | Delivery rate: 100%</span>
                            <span>{b.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 13. CONTENT MANAGEMENT */}
            {activeTab === "content" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Homepage banners & CMS
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Publish cinematic slider promo campaigns, audit trending movies lists, and modify FAQs documentation
                  </p>
                </div>

                <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                    Promo Hero Slider Campaigns
                  </h3>
                  <div className="space-y-3 font-mono">
                    {homepageBanners.map((b) => (
                      <div key={b.id} className="flex justify-between items-center p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                        <div>
                          <span className="font-bold text-white block">{b.title}</span>
                          <span className="text-[10px] text-text-secondary block">Layout Type: {b.type} | Total interactions clicks: {b.clicks}</span>
                        </div>
                        <button
                          onClick={() => {
                            setHomepageBanners(homepageBanners.map((item) => item.id === b.id ? { ...item, active: !item.active } : item));
                            showToast("Slider active state updated.");
                          }}
                          className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded border ${
                            b.active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {b.active ? "Live Campaign" : "Offline"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 14. REVIEWS MODERATION */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Platform Reviews Moderation Center
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Moderate client comment reviews, flag inappropriate content, and maintain community scoreboards
                  </p>
                </div>

                <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                    Client Comment Feed
                  </h3>
                  <div className="space-y-3.5">
                    {userReviews.map((rev) => (
                      <div key={rev.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <span className="font-bold text-white font-mono">{rev.user}</span>
                            <span className="text-[9px] text-text-muted font-mono font-bold">on {rev.movie}</span>
                            <span className="text-[10px] text-gold font-mono font-bold">★ {rev.rating}/5</span>
                          </div>
                          <p className="text-text-secondary leading-relaxed">{rev.comment}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                            rev.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {rev.status}
                          </span>
                          <button
                            onClick={() => {
                              setUserReviews(userReviews.filter((item) => item.id !== rev.id));
                              showToast("Inappropriate review flagged and deleted.");
                            }}
                            className="p-1 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/10 text-red-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 15. REPORTS EXPORTS */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Platform Commercial Reports
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Compile transactional audits, export financial CSV ledgers, and download ticketing metrics PDF files
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-mono">
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Daily Ticket Gross</h3>
                    <p className="text-[10px] text-text-secondary leading-relaxed">Daily statement compilation featuring booking breakdowns, cancellation percentages, and settlement distributions.</p>
                    <button onClick={() => showToast("Exporting Daily Gross ledger to CSV...")} className="w-full bg-white/5 hover:bg-white/10 text-gold border border-gold/20 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV Ledger</span>
                    </button>
                  </div>

                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Quarterly GST Statement</h3>
                    <p className="text-[10px] text-text-secondary leading-relaxed">Tax compliance report featuring active booking GST components, franchise tax records, and state ledger filings.</p>
                    <button onClick={() => showToast("Compiling Quarterly GST Report PDF...")} className="w-full bg-white/5 hover:bg-white/10 text-gold border border-gold/20 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Statement</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 16. PLATFORM SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Platform Settings & Parameters
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Calibrate transaction commission parameters, SMTP configurations, and configure regional cities
                  </p>
                </div>

                <form onSubmit={handleUpdatePlatformSettings} className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-6 text-xs max-w-xl">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">Platform Branding Name</label>
                      <input
                        type="text"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase text-text-secondary">Global Tax rate (%)</label>
                        <input
                          type="number"
                          value={platformTax}
                          onChange={(e) => setPlatformTax(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold uppercase text-text-secondary">Platform Commission (%)</label>
                        <input
                          type="number"
                          value={platformCommission}
                          onChange={(e) => setPlatformCommission(e.target.value)}
                          className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold uppercase text-text-secondary">SMTP Server Address</label>
                      <input
                        type="text"
                        value={smtpServer}
                        onChange={(e) => setSmtpServer(e.target.value)}
                        className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div>
                        <span className="font-bold text-white block">Emergency Maintenance Mode</span>
                        <span className="text-[10px] text-text-secondary">Toggle to place mobile client apps in offline standby state.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={() => setMaintenanceMode(!maintenanceMode)}
                        className="accent-gold w-4 h-4"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <button type="submit" className="bg-gold hover:bg-gold-light text-black px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px] cursor-pointer">
                      Save Platform Preferences
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 17. SECURITY & BACKUPS */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    Security Center & Backups
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Evaluate operational log history, audit database backup schedules, and track active security sessions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  {/* Backup actions */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4 h-fit">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Database Snapshot Backup</h3>
                    <p className="text-text-secondary leading-relaxed">Trigger safe point-in-time PostgreSQL snapshot files to secure client transactions, screens, and multiplex records before major system updates.</p>
                    <button
                      onClick={handleBackupDatabase}
                      className="px-4 py-2.5 bg-gold hover:bg-gold-light text-black font-bold uppercase text-[10px] rounded-xl flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin" />
                      <span>Trigger Database Backup Snapshot</span>
                    </button>
                  </div>

                  {/* Audit Logs */}
                  <div className="bg-[#121213] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">Security Audit Log (Active Stream)</h3>
                    <div className="space-y-3 font-mono text-[10px] text-text-secondary">
                      {auditLogs.map((log, index) => (
                        <div key={index} className="flex gap-2 items-start border-b border-white/5 pb-2">
                          <span className="text-gold shrink-0">[{log.timestamp.split(" ")[1] || "UTC"}]</span>
                          <span className="text-white font-bold block shrink-0">{log.actor.split("@")[0]}</span>
                          <span className="leading-relaxed block">{log.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 18. SUPPORT CENTER */}
            {activeTab === "support" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                    System Support Center & Tickets
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Audit regional franchise tickets, resolve client booking refund issues, and track customer support inquiries
                  </p>
                </div>

                <div className="bg-[#121213] border border-white/5 p-6 rounded-2xl space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">
                    Pending Support Tickets Board
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {supportTickets.map((t) => (
                      <div key={t.id} className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex flex-col justify-between font-mono">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gold text-xs">{t.id}</span>
                            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded ${
                              t.priority === "High" ? "bg-red-500/10 text-red-400" : "bg-gold/10 text-gold"
                            }`}>{t.priority}</span>
                          </div>
                          <h4 className="font-bold text-white truncate text-xs">{t.title}</h4>
                          <p className="text-[9px] text-text-secondary">From: {t.customer}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/5">
                          <span className={`text-[9px] font-bold ${
                            t.status === "Open" ? "text-red-400" : t.status === "In-Progress" ? "text-yellow-400" : "text-emerald-400"
                          }`}>● {t.status}</span>
                          <button
                            onClick={() => {
                              setSupportTickets(supportTickets.map((item) => item.id === t.id ? { ...item, status: "Resolved" as const } : item));
                              showToast(`Ticket ${t.id} status updated to Resolved!`);
                            }}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[9px] font-bold uppercase rounded"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
