import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarRange,
  Layers,
  Ticket,
  QrCode,
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
  Bell,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Send,
  Eye,
  Lock,
  Unlock,
  Printer,
  ChevronRight,
  FileCheck,
  Zap,
  Activity,
  LogOut,
  ExternalLink,
  Sliders,
  Sparkles,
  Wifi,
  WifiOff,
  TrendingUp,
  BarChart3,
  CreditCard,
  Banknote,
  Smartphone,
  Wrench,
  Thermometer,
  Cpu,
  Tv,
  Volume2,
  HeartHandshake,
  MessageSquare,
  Compass
} from "lucide-react";
import { Theatre, Booking, Movie, MovieSchedule } from "../../types";
import {
  theatreOperationsService,
  OperationalTask,
  ApprovalRequest,
  OperationalChecklist,
  CashierShift,
  ImmutableAuditLog,
  LiveOperationsStatus,
  DCRData
} from "../../services/theatreOperationsService";
import ThemeToggle from "../ThemeToggle";

interface TheatreManagerOperationsDashboardProps {
  theatreId: number | string;
  theatres: Theatre[];
  bookings: Booking[];
  schedules: MovieSchedule[];
  movies: Movie[];
  userRole?: string;
  managerName?: string;
  onClose?: () => void;
  onOpenOwnerPortal?: () => void;
}

export default function TheatreManagerOperationsDashboard({
  theatreId,
  theatres,
  bookings,
  schedules,
  movies,
  userRole = "THEATRE_MANAGER",
  managerName = "Sanjay Varma",
  onClose,
  onOpenOwnerPortal
}: TheatreManagerOperationsDashboardProps) {
  const theatre = theatres.find((t) => String(t.id) === String(theatreId)) || theatres[0] || {
    id: theatreId,
    name: "Prasads IMAX Multiplex",
    city: "Hyderabad"
  };

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [liveStatus, setLiveStatus] = useState<LiveOperationsStatus | null>(null);
  const [tasks, setTasks] = useState<OperationalTask[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [shifts, setShifts] = useState<CashierShift[]>([]);
  const [auditLogs, setAuditLogs] = useState<ImmutableAuditLog[]>([]);
  const [dcr, setDcr] = useState<DCRData | null>(null);
  const [checklists, setChecklists] = useState<OperationalChecklist[]>([]);
  const [seatMap, setSeatMap] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [accessibility, setAccessibility] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Control States
  const [selectedShowId, setSelectedShowId] = useState<string>("show_1");
  const [financialTimeframe, setFinancialTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  const [lowBookingThreshold, setLowBookingThreshold] = useState<number>(25);
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>("ALL");
  const [bookingSearch, setBookingSearch] = useState<string>("");
  const [qrCodeInput, setQrCodeInput] = useState<string>("");
  const [qrScanResult, setQrScanResult] = useState<{ success: boolean; message: string; booking?: Booking } | null>(null);

  // Modals
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    description: "",
    category: "MAINTENANCE" as OperationalTask["category"],
    screenName: "Audi 1 (IMAX)",
    assignedTo: "",
    priority: "MEDIUM" as OperationalTask["priority"],
    deadline: ""
  });

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    type: "PRICE_CHANGE" as ApprovalRequest["type"],
    showTitle: movies[0]?.title || "Kalki 2898 AD",
    oldValue: "₹350",
    newValue: "₹400",
    reason: ""
  });

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [newShiftForm, setNewShiftForm] = useState({
    cashierName: "",
    counterNumber: "Box Office Counter 1",
    shiftType: "MORNING" as CashierShift["shiftType"],
    openingFloat: 2000,
    notes: ""
  });

  const [supportForm, setSupportForm] = useState({
    subject: "",
    description: "",
    priority: "HIGH",
    category: "BOOKING_DESYNC"
  });
  const [supportSentSuccess, setSupportSentSuccess] = useState(false);

  const [newComplaintForm, setNewComplaintForm] = useState({
    patronName: "",
    seatNumber: "",
    screenName: "Audi 1",
    category: "AIR_CONDITIONING" as any,
    details: ""
  });
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  const [newAccessForm, setNewAccessForm] = useState({
    customerName: "",
    seatNumber: "",
    screenName: "Audi 1",
    assistanceType: "WHEELCHAIR_ACCESS" as any,
    notes: ""
  });
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [
        statusData,
        tasksData,
        apprData,
        shiftsData,
        auditData,
        dcrData,
        chkData,
        seatData,
        finData,
        facData,
        accData,
        cmpData
      ] = await Promise.all([
        theatreOperationsService.getLiveStatus(theatre.id),
        theatreOperationsService.getTasks(theatre.id),
        theatreOperationsService.getApprovals(theatre.id),
        theatreOperationsService.getShifts(theatre.id),
        theatreOperationsService.getAuditLogs(theatre.id),
        theatreOperationsService.getDCR(theatre.id),
        theatreOperationsService.getChecklists(theatre.id),
        theatreOperationsService.getShowSeatMap(theatre.id, selectedShowId),
        theatreOperationsService.getFinancialAnalytics(theatre.id),
        theatreOperationsService.getFacilities(theatre.id),
        theatreOperationsService.getAccessibilityRequests(theatre.id),
        theatreOperationsService.getCustomerComplaints(theatre.id)
      ]);
      setLiveStatus(statusData);
      setTasks(tasksData);
      setApprovals(apprData);
      setShifts(shiftsData);
      setAuditLogs(auditData);
      setDcr(dcrData);
      setChecklists(chkData);
      setSeatMap(seatData);
      setFinancials(finData);
      setFacilities(facData);
      setAccessibility(accData);
      setComplaints(cmpData);
    } catch (err) {
      console.error("[LOAD_OPS_DATA_ERROR]", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, [theatre.id, selectedShowId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    await theatreOperationsService.createTask(theatre.id, {
      ...newTaskForm,
      assignedTo: newTaskForm.assignedTo || "Duty Staff",
      createdBy: managerName
    });
    setIsNewTaskOpen(false);
    setNewTaskForm({
      title: "",
      description: "",
      category: "MAINTENANCE",
      screenName: "Audi 1 (IMAX)",
      assignedTo: "",
      priority: "MEDIUM",
      deadline: ""
    });
    loadData();
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: OperationalTask["status"]) => {
    await theatreOperationsService.updateTaskStatus(theatre.id, taskId, newStatus);
    loadData();
  };

  const handleCreateApprovalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvalForm.reason.trim()) return;
    await theatreOperationsService.createApprovalRequest(theatre.id, {
      type: approvalForm.type,
      requestedBy: managerName,
      details: {
        showTitle: approvalForm.showTitle,
        oldValue: approvalForm.oldValue,
        newValue: approvalForm.newValue,
        reason: approvalForm.reason
      }
    });
    setIsApprovalModalOpen(false);
    setApprovalForm({
      type: "PRICE_CHANGE",
      showTitle: movies[0]?.title || "Kalki 2898 AD",
      oldValue: "₹350",
      newValue: "₹400",
      reason: ""
    });
    loadData();
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftForm.cashierName.trim()) return;
    await theatreOperationsService.openShift(theatre.id, newShiftForm);
    setIsShiftModalOpen(false);
    loadData();
  };

  const handleCloseShift = async (shiftId: string) => {
    const entered = window.prompt("Enter counted physical cash drawer amount (₹):", "16500");
    if (!entered) return;
    const cash = Number(entered);
    if (isNaN(cash)) {
      alert("Invalid cash amount");
      return;
    }
    await theatreOperationsService.closeShift(theatre.id, shiftId, cash, managerName, "End of shift drawer reconciliation");
    loadData();
  };

  const handleValidateQr = (e: React.FormEvent) => {
    e.preventDefault();
    const query = qrCodeInput.trim().toUpperCase();
    if (!query) return;

    const matched = bookings.find(
      (b) =>
        b.id.toUpperCase() === query ||
        b.seats.some((s) => s.toUpperCase() === query) ||
        (b.userEmail && b.userEmail.toUpperCase().includes(query))
    );

    if (matched) {
      if ((matched as any).isScanned) {
        setQrScanResult({
          success: false,
          message: `DUPLICATE ENTRY ALERT: Ticket ${matched.id} was ALREADY checked in! Reject admission to prevent duplicate entry.`,
          booking: matched
        });
        theatreOperationsService.recordAuditLog(theatre.id, {
          action: "QR_DUPLICATE_ENTRY_REJECTED",
          category: "SECURITY",
          performedBy: managerName,
          details: { bookingId: matched.id, attemptTime: new Date().toISOString() }
        });
      } else {
        (matched as any).isScanned = true;
        (matched as any).scannedAt = new Date().toLocaleTimeString();
        setQrScanResult({
          success: true,
          message: `ADMISSION APPROVED: Valid ticket for ${matched.movieTitle} (${matched.seats.join(", ")})`,
          booking: matched
        });
        theatreOperationsService.recordAuditLog(theatre.id, {
          action: "QR_TICKET_VALIDATED_ENTRY",
          category: "SECURITY",
          performedBy: managerName,
          details: { bookingId: matched.id, seats: matched.seats, movie: matched.movieTitle }
        });
      }
    } else {
      setQrScanResult({
        success: false,
        message: `INVALID TICKET: No active booking found with reference "${query}"`
      });
      theatreOperationsService.recordAuditLog(theatre.id, {
        action: "QR_SCAN_FAILURE_LOGGED",
        category: "SECURITY",
        performedBy: managerName,
        details: { scannedCode: query }
      });
    }
  };

  const handleSendSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.subject.trim() || !supportForm.description.trim()) return;
    await theatreOperationsService.dispatchSupportTicket(theatre.id, {
      ...supportForm,
      reportedBy: managerName
    });
    setSupportSentSuccess(true);
    setSupportForm({ subject: "", description: "", priority: "HIGH", category: "BOOKING_DESYNC" });
    setTimeout(() => setSupportSentSuccess(false), 5000);
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintForm.details.trim()) return;
    await theatreOperationsService.createCustomerComplaint(theatre.id, {
      ...newComplaintForm,
      loggedBy: managerName
    });
    setIsComplaintModalOpen(false);
    setNewComplaintForm({ patronName: "", seatNumber: "", screenName: "Audi 1", category: "AIR_CONDITIONING", details: "" });
    loadData();
  };

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccessForm.customerName.trim()) return;
    await theatreOperationsService.createAccessibilityRequest(theatre.id, newAccessForm);
    setIsAccessModalOpen(false);
    setNewAccessForm({ customerName: "", seatNumber: "", screenName: "Audi 1", assistanceType: "WHEELCHAIR_ACCESS", notes: "" });
    loadData();
  };

  // Filtered lists
  const filteredTasks = tasks.filter((t) => (taskFilterStatus === "ALL" ? true : t.status === taskFilterStatus));
  const theatreBookings = bookings.filter(
    (b) => !b.theatreName || b.theatreName.toLowerCase() === theatre.name.toLowerCase()
  );
  const searchedBookings = theatreBookings.filter(
    (b) =>
      !bookingSearch.trim() ||
      b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.movieTitle.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.userEmail && b.userEmail.toLowerCase().includes(bookingSearch.toLowerCase())) ||
      b.seats.some((s) => s.toLowerCase().includes(bookingSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#09090B] text-slate-100 flex overflow-hidden font-sans select-none">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#101014] border-r border-white/5 flex flex-col justify-between shrink-0 hidden md:flex">
        
        {/* UPPER PART: Identity & Live Status */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-5 border-b border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">Live Operations</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30 font-bold font-mono">
                MANAGER
              </span>
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-white tracking-wide truncate">
                {theatre.name}
              </h2>
              <p className="text-[11px] text-text-secondary truncate mt-0.5">
                Duty Manager: <strong className="text-white">{managerName}</strong>
              </p>
            </div>
          </div>

          {/* Navigation Links matching the 10 Core Audited Modules */}
          <nav className="p-3 space-y-1 flex-1 text-xs">
            {[
              { id: "overview", label: "Operations Overview", icon: LayoutDashboard },
              { id: "ticketing", label: "Live Ticketing & Heatmap", icon: Ticket, badge: seatMap ? `${seatMap.occupancyPercentage}%` : "76%" },
              { id: "financials", label: "Financial Dashboard", icon: BarChart3 },
              { id: "shows", label: "Show Schedule & Timeline", icon: CalendarRange, badge: schedules.length || 6 },
              { id: "checklists", label: "Show-Readiness Checklists", icon: CheckCircle2 },
              { id: "facilities", label: "Facilities & Maintenance", icon: Wrench, badge: tasks.filter(t => t.category === "MAINTENANCE").length },
              { id: "staff", label: "Staff & Shifts", icon: Users },
              { id: "customer", label: "Customer Access & Care", icon: HeartHandshake, badge: complaints.length },
              { id: "qr", label: "Ticket Verification (QR)", icon: QrCode },
              { id: "box-office", label: "Box Office / POS", icon: DollarSign },
              { id: "dcr", label: "Daily Collection Report", icon: FileText },
              { id: "tasks", label: "Task & Incident Centre", icon: AlertTriangle, badge: tasks.filter(t => t.status === "PENDING").length, badgeColor: "bg-amber-500/20 text-amber-300" },
              { id: "approvals", label: "Owner Approvals", icon: FileCheck, badge: approvals.filter(a => a.status === "PENDING_APPROVAL").length, badgeColor: "bg-rose-500/20 text-rose-300" },
              { id: "support", label: "Alerts & CineVenue Support", icon: Headphones },
              { id: "audit", label: "Audit Log & Accountability", icon: ShieldCheck }
            ].map((item) => {
              const active = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-0 ${
                    active
                      ? "bg-gold/15 text-gold border border-gold/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${active ? "text-gold" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${item.badgeColor || "bg-gold/20 text-gold"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* LOWER PART: Connectivity & Portal Exit */}
        <div className="p-4 border-t border-white/5 space-y-2.5 shrink-0 bg-[#0C0C0F]">
          <div className="bg-white/[0.02] border border-white/5 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              {liveStatus?.systemStatus.isLiveBackend ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="text-slate-300">
                {liveStatus?.systemStatus.isLiveBackend ? "Live Telemetry" : "Local Standby"}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-gold hover:text-yellow-300 p-1 cursor-pointer bg-transparent border-0"
              title="Refresh Live Operations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {onOpenOwnerPortal && (
            <button
              onClick={onOpenOwnerPortal}
              className="w-full py-2 px-3 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Switch to Owner Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer border-0 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Operations Portal</span>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#09090B]">
        
        {/* TOP BAR */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between bg-[#101014]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-base font-display font-bold text-white flex items-center gap-2">
              <span>{theatre.name}</span>
              <span className="text-slate-600 font-light">/</span>
              <span className="text-gold font-semibold text-xs sm:text-sm">
                {activeTab === "overview" && "Operations Control Centre"}
                {activeTab === "ticketing" && "Authoritative Seat Inventory & Heatmap"}
                {activeTab === "financials" && "Daily / Weekly / Monthly Box Office Analytics"}
                {activeTab === "shows" && "Daily Show Schedule & Production Milestones"}
                {activeTab === "checklists" && "Auditorium Readiness Checklists"}
                {activeTab === "facilities" && "Facilities, AV & HVAC Equipment Status"}
                {activeTab === "staff" && "Staff Attendance & Shift Stations"}
                {activeTab === "customer" && "Customer Access, Complaints & Special Assistance"}
                {activeTab === "qr" && "QR Ticket Verification & Entry Counter"}
                {activeTab === "box-office" && "Box Office Counter Sales & Drawer Handovers"}
                {activeTab === "dcr" && "Official Exhibition Daily Collection Report (DCR)"}
                {activeTab === "tasks" && "Task & Incident Centre"}
                {activeTab === "approvals" && "Owner Approvals Queue"}
                {activeTab === "support" && "Alerts & CineVenue Support"}
                {activeTab === "audit" && "Manager Accountability Audit Trail"}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle variant="dropdown" />
            <button
              onClick={() => setIsNewTaskOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-gold hover:bg-yellow-400 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span>Log Task</span>
            </button>
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-gold" />
              <span>Request Approval</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OPERATIONS OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Telemetry KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Today's Shows</span>
                    <CalendarRange className="w-4 h-4 text-gold" />
                  </div>
                  <div className="text-3xl font-bold font-display text-white">#12</div>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>7 Completed, 5 Upcoming</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Tickets Booked</span>
                    <Ticket className="w-4 h-4 text-gold" />
                  </div>
                  <div className="text-3xl font-bold font-display text-white">#1,248</div>
                  <p className="text-[11px] text-slate-400">Counter: 312 | Online: 936</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                    <span>Occupancy</span>
                    <Activity className="w-4 h-4 text-gold" />
                  </div>
                  <div className="text-3xl font-bold font-display text-white">76%</div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-gold h-full rounded-full" style={{ width: "76%" }} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-amber-500/20 space-y-2 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <div className="flex items-center justify-between text-amber-300 text-xs font-medium">
                    <span>Pending Tasks</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold font-display text-amber-400">#4</div>
                  <p className="text-[11px] text-amber-300/80">2 Maintenance, 1 Turnaround, 1 Complaint</p>
                </div>
              </div>

              {/* 5-STAGE DAILY RUNBOOK */}
              <div className="p-6 rounded-2xl bg-[#121217] border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gold" />
                      <span>Cinema Manager Daily Operations Runbook</span>
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">Live progression tracking through the day's cinema operations</p>
                  </div>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono font-medium">
                    STAGE 3 OF 5: DURING SHOW
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                  {[
                    { step: 1, title: "1. Opening Readiness", desc: "Equipment boot, screen readiness & staff attendance", status: "COMPLETED" },
                    { step: 2, title: "2. Before Each Show", desc: "Confirm auditorium clean, seat map active & concessions stock", status: "COMPLETED" },
                    { step: 3, title: "3. During Show", desc: "Monitor QR admission, audio decibels & patron complaints", status: "ACTIVE" },
                    { step: 4, title: "4. Between Shows", desc: "Auditorium turnaround sanitization & 3D glasses restocking", status: "PENDING" },
                    { step: 5, title: "5. Night Closing", desc: "Reconcile cash drawers, incident logs & sign off Daily DCR", status: "PENDING" }
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-3.5 rounded-xl border text-left space-y-1.5 transition-all ${
                        s.status === "ACTIVE"
                          ? "bg-gold/10 border-gold/40 text-gold"
                          : s.status === "COMPLETED"
                          ? "bg-emerald-500/5 border-emerald-500/20 text-slate-300"
                          : "bg-white/[0.02] border-white/5 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span>Phase {s.step}</span>
                        {s.status === "COMPLETED" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {s.status === "ACTIVE" && <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />}
                      </div>
                      <h4 className="text-xs font-bold text-white">{s.title}</h4>
                      <p className="text-[11px] leading-tight text-slate-400">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ACTIONS & LIVE ALERTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-gold" />
                      <span>Live Operational Telemetry & Alerts</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Sync: 18s ago</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-white">Audi 1 Recliner E-12 Under Maintenance</h4>
                        <p className="text-[11px] text-slate-300">Footrest motor jammed. Seat blocked in booking engine to prevent double selling.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-200 text-xs flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-white">Turnstile Scanner Throughput Optimal</h4>
                        <p className="text-[11px] text-slate-300">Gates 1, 2, 3, 4 operating at 18 admissions/min. Zero network dropped packets.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-gold" />
                      <span>Manager Quick Actions</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <button
                      onClick={() => setActiveTab("ticketing")}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left space-y-1 cursor-pointer border border-white/5 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-gold" />
                      <div className="font-bold text-white">Check Seat Heatmap</div>
                      <p className="text-[10px] text-slate-400">View live seat inventory</p>
                    </button>
                    <button
                      onClick={() => setIsNewTaskOpen(true)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left space-y-1 cursor-pointer border border-white/5 transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-amber-400" />
                      <div className="font-bold text-white">Raise Maintenance Ticket</div>
                      <p className="text-[10px] text-slate-400">Assign technician</p>
                    </button>
                    <button
                      onClick={() => setIsApprovalModalOpen(true)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left space-y-1 cursor-pointer border border-white/5 transition-colors"
                    >
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <div className="font-bold text-white">Request Owner Approval</div>
                      <p className="text-[10px] text-slate-400">Price change / refund</p>
                    </button>
                    <button
                      onClick={() => setActiveTab("support")}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left space-y-1 cursor-pointer border border-white/5 transition-colors"
                    >
                      <Headphones className="w-4 h-4 text-blue-400" />
                      <div className="font-bold text-white">CineVenue Tech Hotline</div>
                      <p className="text-[10px] text-slate-400">24/7 priority support</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE TICKETING & VISUAL HEATMAP */}
          {activeTab === "ticketing" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-gold" />
                    <span>Authoritative Live Seat Occupancy Heatmap</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Synchronized with the customer CineVenue booking engine. Prevents double-booking and stale allocations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedShowId}
                    onChange={(e) => setSelectedShowId(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-gold"
                  >
                    <option value="show_1">Kalki 2898 AD (IMAX) - 06:45 PM</option>
                    <option value="show_2">Coolie (Atmos) - 07:30 PM</option>
                    <option value="show_3">The Paradise (Gold) - 09:15 PM</option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gold border border-white/10 cursor-pointer"
                    title="Refresh Seat Matrix"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Show Stats Banner */}
              {seatMap && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#121217] border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase">Tickets Sold</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">{seatMap.bookedSeats} / {seatMap.totalSeats}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121217] border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase">Remaining Seats</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{seatMap.availableSeats} Seats</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121217] border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase">Occupancy</div>
                    <div className="text-xl font-bold font-mono text-gold mt-0.5">{seatMap.occupancyPercentage}%</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121217] border border-white/5">
                    <div className="text-slate-400 text-[10px] uppercase">Show Revenue</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">₹{seatMap.revenue.toLocaleString()}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#121217] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-[10px] uppercase">Sold Out Status</div>
                      <div className={`text-sm font-bold uppercase mt-0.5 ${seatMap.isSoldOut ? "text-rose-400" : "text-emerald-400"}`}>
                        {seatMap.isSoldOut ? "SOLD OUT" : "SEATS OPEN"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Visual Seat Matrix */}
              <div className="p-6 rounded-2xl bg-[#121217] border border-white/5 space-y-6">
                {/* Cinema Screen Curve Graphic */}
                <div className="max-w-md mx-auto text-center space-y-1">
                  <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-gold to-transparent rounded-full shadow-lg shadow-gold/20" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Auditorium IMAX Screen</span>
                </div>

                {/* Seat Heatmap Legend */}
                <div className="flex flex-wrap items-center justify-center gap-5 text-xs pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/60" />
                    <span className="text-slate-300">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600" />
                    <span className="text-slate-300">Booked (Paid)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500 animate-pulse" />
                    <span className="text-slate-300">Locked (In Checkout)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-red-950 border border-rose-500/40 relative">
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-bold">✕</span>
                    </div>
                    <span className="text-slate-300">Maintenance Hold</span>
                  </div>
                </div>

                {/* Grid */}
                {seatMap && (
                  <div className="max-w-2xl mx-auto space-y-2 pt-2">
                    {["A", "B", "C", "D", "E", "F", "G", "H"].map((rowLetter) => {
                      const rowSeats = seatMap.seats.filter((s: any) => s.row === rowLetter);
                      return (
                        <div key={rowLetter} className="flex items-center justify-center gap-1.5">
                          <span className="w-5 text-xs text-slate-500 font-bold font-mono">{rowLetter}</span>
                          <div className="flex gap-1 sm:gap-1.5">
                            {rowSeats.map((seat: any) => {
                              let bg = "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 hover:scale-110";
                              if (seat.status === "BOOKED") bg = "bg-rose-500/80 border-rose-600 text-white cursor-not-allowed";
                              if (seat.status === "LOCKED") bg = "bg-amber-400 border-amber-500 text-black animate-pulse cursor-not-allowed";
                              if (seat.status === "BLOCKED") bg = "bg-red-950 border-rose-500/50 text-rose-300 cursor-not-allowed";

                              return (
                                <button
                                  key={seat.seatNumber}
                                  onClick={() => {
                                    alert(`Seat ${seat.seatNumber} (${seat.category}): ₹${seat.price} — Status: ${seat.status}`);
                                  }}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center border transition-all cursor-pointer ${bg}`}
                                  title={`${seat.seatNumber} (${seat.category}) - ₹${seat.price} [${seat.status}]`}
                                >
                                  {seat.status === "BLOCKED" ? "✕" : seat.col}
                                </button>
                              );
                            })}
                          </div>
                          <span className="w-5 text-xs text-slate-500 font-bold font-mono text-right">{rowLetter}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL DASHBOARD */}
          {activeTab === "financials" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gold" />
                    <span>Cinema Box Office Financial Dashboard</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Clear separation of Gross Collections, Taxes, Discounts, Platform Fees, and Theatre Settlements.
                  </p>
                </div>
                <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                  {(["daily", "weekly", "monthly"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFinancialTimeframe(t)}
                      className={`px-3 py-1 rounded-lg font-bold capitalize transition-all border-0 cursor-pointer ${
                        financialTimeframe === t ? "bg-gold text-black" : "bg-transparent text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {financials && (
                <div className="space-y-4">
                  {/* Revenue Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-2">
                      <div className="text-slate-400 text-xs font-medium">Daily Box Office Gross</div>
                      <div className="text-2xl font-bold font-mono text-white">₹{financials.timeframeMetrics.dailyGross.toLocaleString()}</div>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{financials.timeframeMetrics.historicalComparison.vsYesterday} vs Yesterday</span>
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-2">
                      <div className="text-slate-400 text-xs font-medium">Weekly Box Office Total</div>
                      <div className="text-2xl font-bold font-mono text-white">₹{financials.timeframeMetrics.weeklyGross.toLocaleString()}</div>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{financials.timeframeMetrics.historicalComparison.vsLastWeekSameDay} vs Last Week</span>
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-2">
                      <div className="text-slate-400 text-xs font-medium">Monthly Box Office Run</div>
                      <div className="text-2xl font-bold font-mono text-gold">₹{financials.timeframeMetrics.monthlyGross.toLocaleString()}</div>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{financials.timeframeMetrics.historicalComparison.monthOverMonthGrowth} MoM Growth</span>
                      </p>
                    </div>
                  </div>

                  {/* Payment Breakdown & Deductions Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    
                    {/* Payment Channel Mix */}
                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-3">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">Payment Method Breakdown</h4>
                      <div className="space-y-2.5">
                        {[
                          { label: "UPI & Instant QR (PhonePe / GPay)", pct: financials.paymentMethodsBreakdown.upi.percentage, amt: financials.paymentMethodsBreakdown.upi.amount, icon: Smartphone, color: "bg-emerald-400" },
                          { label: "Credit & Debit Cards (Visa / MC / RuPay)", pct: financials.paymentMethodsBreakdown.creditDebitCards.percentage, amt: financials.paymentMethodsBreakdown.creditDebitCards.amount, icon: CreditCard, color: "bg-blue-400" },
                          { label: "Counter Cash Collections", pct: financials.paymentMethodsBreakdown.counterCash.percentage, amt: financials.paymentMethodsBreakdown.counterCash.amount, icon: Banknote, color: "bg-amber-400" }
                        ].map((m) => {
                          const Icon = m.icon;
                          return (
                            <div key={m.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Icon className="w-3.5 h-3.5 text-gold" />
                                  <span className="font-medium text-slate-200">{m.label}</span>
                                </div>
                                <span className="font-mono font-bold text-white">₹{m.amt.toLocaleString()} ({m.pct}%)</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Financial Accounting Settlement Breakdown */}
                    <div className="p-5 rounded-2xl bg-[#121217] border border-white/5 space-y-3">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">Financial Deductions & Owner Settlement</h4>
                      <div className="divide-y divide-white/5 text-xs text-slate-300">
                        <div className="py-2 flex justify-between">
                          <span>Gross Box Office Receipts</span>
                          <span className="font-mono font-bold text-white">₹{financials.deductionsAndSettlements.grossCollections.toLocaleString()}</span>
                        </div>
                        <div className="py-2 flex justify-between text-rose-300">
                          <span>Less: Discounts & Vouchers Deductions</span>
                          <span className="font-mono">- ₹{financials.deductionsAndSettlements.discountsAndVouchers.toLocaleString()}</span>
                        </div>
                        <div className="py-2 flex justify-between text-rose-300">
                          <span>Less: Authorized Patron Refunds</span>
                          <span className="font-mono">- ₹{financials.deductionsAndSettlements.refundsIssued.toLocaleString()}</span>
                        </div>
                        <div className="py-2 flex justify-between text-amber-300">
                          <span>Less: GST / Entertainment Tax (18%)</span>
                          <span className="font-mono">- ₹{financials.deductionsAndSettlements.gstTaxAmount.toLocaleString()}</span>
                        </div>
                        <div className="py-2 flex justify-between text-slate-400">
                          <span>Less: Platform Fees (₹25/ticket)</span>
                          <span className="font-mono">- ₹{financials.deductionsAndSettlements.totalPlatformFees.toLocaleString()}</span>
                        </div>
                        <div className="py-2 flex justify-between text-emerald-400">
                          <span>Add: Box Office Concessions F&B Net</span>
                          <span className="font-mono">+ ₹{financials.deductionsAndSettlements.fbCounterRevenue.toLocaleString()}</span>
                        </div>
                        <div className="py-3 flex justify-between text-sm font-bold border-t border-gold/30 text-gold">
                          <span>Net Settlement Payable to Theatre Owner</span>
                          <span className="font-mono">₹{financials.deductionsAndSettlements.netPayableToTheatre.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SHOW SCHEDULE & PRODUCTION MILESTONES */}
          {activeTab === "shows" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Cinema Schedule & House-Readiness Milestones</h3>
                  <p className="text-xs text-text-secondary">Screen timelines, door opening intervals, AV pre-checks, and production milestones.</p>
                </div>
                <button
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold text-xs font-bold border border-gold/30 cursor-pointer transition-colors"
                >
                  Request Schedule / Showtime Change
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    screen: "Audi 1 (IMAX with Laser)",
                    movie: "Kalki 2898 AD",
                    showtime: "06:45 PM",
                    doorOpen: "06:25 PM (-20m)",
                    houseReady: "06:35 PM (-10m)",
                    turnaround: "15 mins",
                    status: "READY",
                    milestones: ["DCP Content Ingested", "IMAX 12-Ch Calibration Checked", "3D Glasses Counted & Sanitized"]
                  },
                  {
                    screen: "Audi 2 (Dolby Atmos)",
                    movie: "Coolie",
                    showtime: "07:30 PM",
                    doorOpen: "07:10 PM (-20m)",
                    houseReady: "07:20 PM (-10m)",
                    turnaround: "15 mins",
                    status: "TURNAROUND_IN_PROGRESS",
                    milestones: ["Housekeeping Turnaround active", "Subwoofer test pending"]
                  },
                  {
                    screen: "Audi 3 (VIP Luxury Lounge)",
                    movie: "The Paradise",
                    showtime: "09:15 PM",
                    doorOpen: "08:55 PM (-20m)",
                    houseReady: "09:05 PM (-10m)",
                    turnaround: "20 mins",
                    status: "SCHEDULED",
                    milestones: ["Recliner armrest wipe scheduled", "Chef catering menu sync ready"]
                  }
                ].map((s, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#121217] border border-white/5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-gold font-bold text-sm">{s.screen}</span>
                        <span className="text-slate-500">•</span>
                        <h4 className="text-white font-bold">{s.movie}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === "READY" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300 animate-pulse"
                      }`}>
                        {s.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/[0.01] p-3 rounded-lg border border-white/5 text-slate-300">
                      <div>Showtime: <strong className="text-white font-mono">{s.showtime}</strong></div>
                      <div>Door Open: <strong className="text-slate-200 font-mono">{s.doorOpen}</strong></div>
                      <div>House Ready: <strong className="text-slate-200 font-mono">{s.houseReady}</strong></div>
                      <div>Turnaround Window: <strong className="text-slate-200">{s.turnaround}</strong></div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {s.milestones.map((m, mIdx) => (
                        <span key={mIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 text-[11px] text-slate-300 border border-white/5">
                          <CheckCircle2 className="w-3 h-3 text-gold" />
                          <span>{m}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CHECKLISTS */}
          {activeTab === "checklists" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Show-Readiness & Safety Checklists</h3>
                  <p className="text-xs text-text-secondary">Mandatory opening, pre-show, turnaround, and night closing digital sign-offs.</p>
                </div>
                <button
                  onClick={() => {
                    const manager = window.prompt("Enter Duty Manager Sign-off Name:", managerName);
                    if (manager) {
                      theatreOperationsService.submitChecklist(theatre.id, {
                        type: "CLOSING",
                        signOffManager: manager,
                        items: [
                          { id: "1", task: "All Audi Screens Projectors Safely Powered Off", done: true },
                          { id: "2", task: "Cashier Drawers Counted & Locked in Safe", done: true },
                          { id: "3", task: "Emergency Fire Exits & Foyer Locked", done: true }
                        ]
                      });
                      alert("Daily closing checklist submitted with manager sign-off.");
                      loadData();
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black text-xs font-bold cursor-pointer transition-colors"
                >
                  Sign Off Night Closing Checklist
                </button>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: "Daily Opening Readiness Checklist",
                    type: "OPENING",
                    verifiedBy: "Sanjay Varma (Duty Manager)",
                    items: [
                      { title: "DCP Server and Projector Lamp Power Check", done: true, by: "K. Ramesh" },
                      { title: "Dolby Atmos Processor & Subwoofer Sweep", done: true, by: "K. Ramesh" },
                      { title: "Box Office POS Terminals & UPI QR Displays Active", done: true, by: "P. Lakshmi" },
                      { title: "Optical Turnstile Gate 1 & 2 Scanners Active", done: true, by: "Security Gate Lead" },
                      { title: "Emergency Fire Exit Illuminated & Pathways Clear", done: true, by: "Sanjay Varma" }
                    ]
                  },
                  {
                    title: "Between-Show Turnaround Cleaning Checklist (Audi 2)",
                    type: "CLEANING_TURNAROUND",
                    verifiedBy: "M. Suresh (Housekeeping Lead)",
                    items: [
                      { title: "Aisle & Seating Vacuum Sweep", done: true, by: "Housekeeping Team B" },
                      { title: "Recliner Armrest & Cup Holder Sanitisation", done: true, by: "Housekeeping Team B" },
                      { title: "Restock Sanitised 3D Glasses Bins", done: false, by: "Pending" }
                    ]
                  }
                ].map((chk, i) => (
                  <div key={i} className="p-5 rounded-xl bg-[#121217] border border-white/5 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <h4 className="font-bold text-white text-sm">{chk.title}</h4>
                      <span className="text-emerald-400 text-[11px] font-mono">Sign-off: {chk.verifiedBy}</span>
                    </div>

                    <div className="space-y-2">
                      {chk.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/[0.02]">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              defaultChecked={item.done}
                              className="accent-gold w-4 h-4 rounded cursor-pointer"
                            />
                            <span className={item.done ? "text-slate-200" : "text-amber-300 font-semibold"}>
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Verified: {item.by}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: FACILITIES & MAINTENANCE */}
          {activeTab === "facilities" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Facilities, AV & HVAC Equipment Status</h3>
                  <p className="text-xs text-text-secondary">Live telemetry monitoring for cinema projection, acoustics, chiller units, and turnstiles.</p>
                </div>
                <button
                  onClick={() => setIsNewTaskOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black text-xs font-bold cursor-pointer transition-colors"
                >
                  + Raise Equipment Maintenance Ticket
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.map((eq) => (
                  <div key={eq.id} className="p-5 rounded-xl bg-[#121217] border border-white/5 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-bold uppercase">{eq.type}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {eq.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-sm">{eq.name}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">Location: <span className="text-slate-200">{eq.screenName}</span></p>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-1 text-slate-400 text-[11px]">
                      {eq.lampHoursRemaining && <p>Laser Diode Life: <strong className="text-emerald-400">{eq.lampHoursRemaining.toLocaleString()} hrs remaining</strong></p>}
                      {eq.temperature && <p>Operating Temp: <strong className="text-white">{eq.temperature}</strong></p>}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[10px]">
                      <button
                        onClick={() => {
                          alert(`Diagnostic ping sent to ${eq.name}: Status Verified Healthy (Response 18ms).`);
                        }}
                        className="text-gold hover:underline cursor-pointer bg-transparent border-0 p-0 font-bold"
                      >
                        Run Diagnostic Sweep
                      </button>
                      <span className="text-slate-500 font-mono">SN: CV-HW-{eq.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: STAFF & SHIFTS */}
          {activeTab === "staff" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Staff Duty Roster & Live Attendance</h3>
                  <p className="text-xs text-text-secondary">Assigned stations, check-in timestamps, and operational shift duties.</p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                  14 Staff Checked In
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "K. Ramesh", role: "Chief Projectionist", station: "Projection Booth 1 & 2", status: "PRESENT", phone: "+91 98480 11223", tasks: "Audi 1 Recliner E-12 Repair" },
                  { name: "P. Lakshmi", role: "Box Office Cashier", station: "Counter 1", status: "PRESENT", phone: "+91 94401 55667", tasks: "Morning Shift Float Reconciliation" },
                  { name: "M. Suresh", role: "Housekeeping Lead", station: "Turnaround Sanitation Team", status: "PRESENT", phone: "+91 99890 33441", tasks: "Audi 2 Cleaning Turnaround" },
                  { name: "T. Kiran", role: "Turnstile Gate Usher", station: "Gate 1 (Audi 1 & 2)", status: "PRESENT", phone: "+91 98850 77889", tasks: "Hearing Loop Loop Assist" },
                  { name: "V. Anand", role: "Concessions Lead", station: "Main Bar & Popcorn Bar", status: "PRESENT", phone: "+91 97000 44556", tasks: "Machine Temp Check" },
                  { name: "N. Venkatesh", role: "Audi Usher", station: "Audi 3 Luxury Lounge", status: "ON_BREAK", phone: "+91 96520 88990", tasks: "Row G Spill Recovery" }
                ].map((st, i) => (
                  <div key={i} className="p-5 rounded-xl bg-[#121217] border border-white/5 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{st.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.status === "PRESENT" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {st.status}
                      </span>
                    </div>
                    <p className="text-gold font-medium">{st.role}</p>
                    <p className="text-slate-400">Station: <span className="text-slate-200">{st.station}</span></p>
                    <p className="text-slate-400">Active Task: <span className="text-amber-300">{st.tasks}</span></p>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{st.phone}</span>
                      <button
                        onClick={() => alert(`Direct task alert dispatched to ${st.name}`)}
                        className="text-gold hover:underline cursor-pointer bg-transparent border-0 p-0 font-bold"
                      >
                        Page Staff
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CUSTOMER ACCESS, COMPLAINTS & ACCESSIBILITY */}
          {activeTab === "customer" && (
            <div className="space-y-6">
              {/* Accessibility Requests */}
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-gold" />
                      <span>Accessibility & Special Assistance Requests</span>
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Wheelchair companion escort, hearing loop receivers, and elder assistance with strict privacy protection.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAccessModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-gold hover:bg-yellow-400 text-black text-xs font-bold cursor-pointer transition-colors"
                  >
                    + Log Assistance Request
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {accessibility.map((req) => (
                    <div key={req.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{req.customerName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-gold font-medium">{req.assistanceType}</p>
                      <p className="text-slate-400">Seat: <span className="text-slate-200">{req.seatNumber || "Foyer Entrance"}</span> ({req.screenName})</p>
                      {req.assignedStaff && <p className="text-slate-400">Assigned Usher: <strong className="text-slate-200">{req.assignedStaff}</strong></p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Complaints Tracker */}
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gold" />
                      <span>Customer Complaints & Rapid Incident Resolution</span>
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5">Air conditioning temperature, acoustic clarity, and seating comfort feedback.</p>
                  </div>
                  <button
                    onClick={() => setIsComplaintModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 cursor-pointer"
                  >
                    + Log Patron Complaint
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {complaints.map((cmp) => (
                    <div key={cmp.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{cmp.patronName}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-gold font-mono">{cmp.category}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cmp.status === "RESOLVED" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {cmp.status}
                        </span>
                      </div>
                      <p className="text-slate-300">{cmp.details}</p>
                      {cmp.resolutionNotes && (
                        <p className="text-emerald-300 text-[11px] bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                          <strong>Resolution:</strong> {cmp.resolutionNotes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: QR TICKET VERIFICATION */}
          {activeTab === "qr" && (
            <div className="space-y-5 max-w-2xl mx-auto text-center">
              <div className="bg-[#121217] p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/15 text-gold border border-gold/30">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">Gate Turnstile Ticket Verification</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Scan customer ticket QR code or manually enter the Booking Reference to authenticate admission and prevent duplicate gate entry.
                  </p>
                </div>

                <form onSubmit={handleValidateQr} className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="text"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    placeholder="Enter Booking ID (e.g. CV-BKG-101)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-gold font-mono uppercase"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gold hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer border-0 transition-colors"
                  >
                    Validate
                  </button>
                </form>

                {qrScanResult && (
                  <div
                    className={`p-4 rounded-xl border text-left text-xs ${
                      qrScanResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {qrScanResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>{qrScanResult.success ? "ADMISSION APPROVED" : "ADMISSION DENIED / DUPLICATE ATTEMPT"}</span>
                    </div>
                    <p className="text-[11px]">{qrScanResult.message}</p>
                  </div>
                )}
              </div>

              {/* Turnstile throughput stats */}
              <div className="p-4 rounded-2xl bg-[#121217] border border-white/5 flex items-center justify-around text-xs">
                <div>
                  <div className="text-2xl font-bold font-display text-white">#142</div>
                  <div className="text-slate-400 text-[10px] uppercase">Checked In Today</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-bold font-display text-emerald-400">18 / min</div>
                  <div className="text-slate-400 text-[10px] uppercase">Peak Gate Throughput</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-bold font-display text-gold">0 Reused</div>
                  <div className="text-slate-400 text-[10px] uppercase">Security Breaches</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: BOX OFFICE / POS */}
          {activeTab === "box-office" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Box Office Counter Sales & Cashier Shifts</h3>
                  <p className="text-xs text-text-secondary">Walk-in counter collections, cash drawer float verification, and shift closure reconciliation.</p>
                </div>
                <button
                  onClick={() => setIsShiftModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black text-xs font-bold cursor-pointer transition-colors"
                >
                  + Open New Cashier Shift
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shifts.map((shift) => (
                  <div key={shift.id} className="p-5 rounded-xl bg-[#121217] border border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-sm">{shift.counterNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        shift.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300 animate-pulse" : "bg-white/5 text-slate-400"
                      }`}>
                        {shift.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>On-duty Cashier: <strong className="text-slate-200">{shift.cashierName}</strong> ({shift.shiftType})</p>
                      <p>Opening Cash Float: <strong className="text-gold font-mono">₹{shift.openingFloat.toLocaleString()}</strong></p>
                      <p>Counter UPI Collected: <strong className="text-slate-200 font-mono">₹{shift.upiAmount?.toLocaleString() || "0"}</strong></p>
                      {shift.status === "CLOSED" && (
                        <p className={shift.discrepancy === 0 ? "text-emerald-400" : "text-rose-400 font-bold"}>
                          Drawer Discrepancy: ₹{shift.discrepancy || 0}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Opened: {new Date(shift.openedAt).toLocaleTimeString()}</span>
                      {shift.status === "ACTIVE" && (
                        <button
                          onClick={() => handleCloseShift(shift.id)}
                          className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 cursor-pointer"
                        >
                          Reconcile & Close Shift
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: DCR */}
          {activeTab === "dcr" && (
            <div className="space-y-5">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Official Daily Collection Report (DCR)</h3>
                  <p className="text-xs text-text-secondary">Official exhibition industry reconciliation summary prepared for Theatre Owner verification.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-gold" />
                  <span>Print Official DCR</span>
                </button>
              </div>

              {dcr && (
                <div className="p-6 rounded-2xl bg-[#121217] border border-white/5 space-y-6 text-xs">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <div className="text-lg font-bold text-white font-display">{theatre.name}</div>
                      <div className="text-slate-400">DCR Date: <strong className="text-slate-200">{dcr.date}</strong></div>
                    </div>
                    <div className="text-right">
                      <span className="text-gold font-mono font-bold text-sm">STATUS: {dcr.summary.ownerSettlementStatus}</span>
                      <div className="text-[10px] text-slate-500">Prepared by Duty Manager: {managerName}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-slate-400 text-[11px]">Gross Box Office</div>
                      <div className="text-xl font-bold font-mono text-white mt-1">₹{dcr.summary.grossBoxOffice.toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-slate-400 text-[11px]">GST / Entertainment Tax (18%)</div>
                      <div className="text-xl font-bold font-mono text-rose-300 mt-1">₹{dcr.summary.gstEntertainmentTax.toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-slate-400 text-[11px]">Net Exhibition Share</div>
                      <div className="text-xl font-bold font-mono text-emerald-400 mt-1">₹{dcr.summary.netExhibitionRevenue.toLocaleString()}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="text-slate-400 text-[11px]">Occupancy Rate</div>
                      <div className="text-xl font-bold font-mono text-gold mt-1">{dcr.summary.occupancyPercentage}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">Channel Reconciliation</h4>
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-slate-400">Online CineVenue Bookings</div>
                        <div className="font-mono text-white text-sm mt-0.5">₹{dcr.summary.breakdownByChannel.onlineCineVenue.grossAmount.toLocaleString()} ({dcr.summary.breakdownByChannel.onlineCineVenue.tickets} tickets)</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Counter Box Office Cash</div>
                        <div className="font-mono text-white text-sm mt-0.5">₹{dcr.summary.breakdownByChannel.counterCash.grossAmount.toLocaleString()} ({dcr.summary.breakdownByChannel.counterCash.tickets} tickets)</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Counter Box Office UPI</div>
                        <div className="font-mono text-white text-sm mt-0.5">₹{dcr.summary.breakdownByChannel.counterUPI.grossAmount.toLocaleString()} ({dcr.summary.breakdownByChannel.counterUPI.tickets} tickets)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 12: TASKS & INCIDENT CENTRE */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="bg-[#121217] p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manager Task & Incident Centre</h3>
                  <p className="text-xs text-text-secondary">Auditorium cleaning turnaround, maintenance, and staff escalations.</p>
                </div>
                <div className="flex items-center gap-2">
                  {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTaskFilterStatus(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                        taskFilterStatus === st ? "bg-gold text-black" : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-xl bg-[#121217] border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === "CRITICAL" ? "bg-rose-500/20 text-rose-300" : task.priority === "HIGH" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"
                        }`}>
                          {task.priority}
                        </span>
                        <h4 className="font-bold text-white text-sm">{task.title}</h4>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ESCALATED">Escalated</option>
                      </select>
                    </div>

                    <p className="text-slate-300">{task.description}</p>
                    {task.incidentNotes && (
                      <p className="text-amber-300/90 text-[11px] bg-amber-500/5 p-2 rounded border border-amber-500/10">
                        <strong>Incident Notes:</strong> {task.incidentNotes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Assigned: <strong className="text-slate-300">{task.assignedTo}</strong></span>
                      <span>Deadline: <strong className="text-slate-300">{new Date(task.deadline).toLocaleTimeString()}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: APPROVALS QUEUE */}
          {activeTab === "approvals" && (
            <div className="space-y-4">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Owner Approval Workflow</h3>
                  <p className="text-xs text-text-secondary">Restricted actions (price modifications, refunds &gt; ₹500, show cancellations) requiring Owner sign-off.</p>
                </div>
                <button
                  onClick={() => setIsApprovalModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black text-xs font-bold cursor-pointer transition-colors"
                >
                  + New Request
                </button>
              </div>

              <div className="space-y-3">
                {approvals.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-[#121217] border border-white/5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gold font-bold">{req.type}</span>
                        <span className="text-slate-500">|</span>
                        <span className="text-white font-medium">{req.details.showTitle || "Cinema Operation"}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-300" : req.status === "REJECTED" ? "bg-rose-500/20 text-rose-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-slate-300">Justification: {req.details.reason}</p>
                    {req.details.oldValue && (
                      <p className="text-slate-400 text-[11px]">Proposed Change: <span className="line-through text-slate-500">{req.details.oldValue}</span> → <strong className="text-emerald-400">{req.details.newValue}</strong></p>
                    )}

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Requested by: <strong className="text-slate-300">{req.requestedBy}</strong> ({new Date(req.createdAt).toLocaleDateString()})</span>
                      {req.approvedBy && <span>Decision: <strong className="text-emerald-400">{req.approvedBy}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 14: SUPPORT & ALERTS */}
          {activeTab === "support" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-[#121217] p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center border border-gold/30">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">CineVenue Priority Technical Operations Hotline</h3>
                    <p className="text-xs text-text-secondary">Direct incident dispatch to CineVenue Central Operations Command.</p>
                  </div>
                </div>

                {supportSentSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Priority ticket dispatched! CineVenue Senior Systems Operations Engineer assigned.</span>
                  </div>
                )}

                <form onSubmit={handleSendSupportTicket} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Issue Category</label>
                    <select
                      value={supportForm.category}
                      onChange={(e) => setSupportForm({ ...supportForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                    >
                      <option value="BOOKING_DESYNC">Booking Synchronization / Turnstile Desync</option>
                      <option value="PROJECTION_AUDIO">Projection / Sound Rig Emergency</option>
                      <option value="PAYMENT_GATEWAY">Counter POS Payment Gateway Timeout</option>
                      <option value="EMERGENCY">Emergency Show Cancellation Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Subject</label>
                    <input
                      type="text"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                      placeholder="Brief operational issue summary..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Details & Affected Audi</label>
                    <textarea
                      rows={3}
                      value={supportForm.description}
                      onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
                      placeholder="Describe symptoms, screen number, error messages..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gold hover:bg-yellow-400 text-black font-bold text-xs uppercase tracking-wider cursor-pointer border-0 transition-colors"
                  >
                    Dispatch Urgent Incident Ticket
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 15: AUDIT LOG */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="bg-[#121217] p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Manager Accountability & Tamper-Evident Audit Trail</h3>
                  <p className="text-xs text-text-secondary">Immutable event log of sensitive operations, overrides, shift drawer closures, and tickets.</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                  APPEND-ONLY ENCRYPTED LOG
                </span>
              </div>

              <div className="space-y-2.5">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl bg-[#121217] border border-white/5 flex items-start justify-between text-xs gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gold font-bold">{log.action}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.category}</span>
                      </div>
                      <p className="text-slate-300">
                        {log.details ? JSON.stringify(log.details).replace(/[{}"]/g, " ") : "Action recorded."}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 shrink-0">
                      <div>{log.performedBy} ({log.userRole})</div>
                      <div className="font-mono text-[10px]">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: CREATE TASK */}
      {isNewTaskOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Log Operational Task / Incident</h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="e.g. Audi 2 Clean Up Beverage Spill"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={newTaskForm.category}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="CLEANING">Cleaning Turnaround</option>
                    <option value="CUSTOMER_COMPLAINT">Customer Complaint</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="SECURITY">Security</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Assign Staff Member</label>
                <input
                  type="text"
                  value={newTaskForm.assignedTo}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, assignedTo: e.target.value })}
                  placeholder="e.g. M. Suresh (Housekeeping Lead)"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Specific details regarding the task..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black font-bold uppercase tracking-wider cursor-pointer border-0"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST APPROVAL */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Submit Owner Approval Request</h3>
            <p className="text-text-secondary">Changes to ticket pricing, refunds, or show cancellations require Theatre Owner sign-off.</p>
            
            <form onSubmit={handleCreateApprovalRequest} className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Request Type</label>
                <select
                  value={approvalForm.type}
                  onChange={(e) => setApprovalForm({ ...approvalForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                >
                  <option value="PRICE_CHANGE">Ticket Price Modification</option>
                  <option value="SHOW_CANCELLATION">Emergency Show Cancellation</option>
                  <option value="REFUND_OVERRIDE">Customer Refund Override (&gt; ₹500)</option>
                  <option value="RESCHEDULE">Showtime Reschedule</option>
                </select>
              </div>

              {approvalForm.type === "PRICE_CHANGE" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Current Price</label>
                    <input
                      type="text"
                      value={approvalForm.oldValue}
                      onChange={(e) => setApprovalForm({ ...approvalForm, oldValue: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Proposed Price</label>
                    <input
                      type="text"
                      value={approvalForm.newValue}
                      onChange={(e) => setApprovalForm({ ...approvalForm, newValue: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-300 font-medium block mb-1">Justification Reason</label>
                <textarea
                  required
                  rows={3}
                  value={approvalForm.reason}
                  onChange={(e) => setApprovalForm({ ...approvalForm, reason: e.target.value })}
                  placeholder="Explain why this change is necessary..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black font-bold uppercase tracking-wider cursor-pointer border-0"
                >
                  Send for Sign-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OPEN CASHIER SHIFT */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Open Cashier Drawer Shift</h3>
            <form onSubmit={handleOpenShift} className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Cashier Full Name</label>
                <input
                  type="text"
                  required
                  value={newShiftForm.cashierName}
                  onChange={(e) => setNewShiftForm({ ...newShiftForm, cashierName: e.target.value })}
                  placeholder="e.g. P. Lakshmi"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Counter Number</label>
                  <input
                    type="text"
                    value={newShiftForm.counterNumber}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, counterNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Opening Cash Float (₹)</label>
                  <input
                    type="number"
                    value={newShiftForm.openingFloat}
                    onChange={(e) => setNewShiftForm({ ...newShiftForm, openingFloat: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShiftModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black font-bold uppercase tracking-wider cursor-pointer border-0"
                >
                  Verify & Open Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG COMPLAINT */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Log Customer Complaint</h3>
            <form onSubmit={handleCreateComplaint} className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Patron Name</label>
                <input
                  type="text"
                  required
                  value={newComplaintForm.patronName}
                  onChange={(e) => setNewComplaintForm({ ...newComplaintForm, patronName: e.target.value })}
                  placeholder="e.g. R. Venkatesh"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Screen & Seat</label>
                  <input
                    type="text"
                    value={newComplaintForm.seatNumber}
                    onChange={(e) => setNewComplaintForm({ ...newComplaintForm, seatNumber: e.target.value })}
                    placeholder="e.g. Audi 2, Row G-14"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={newComplaintForm.category}
                    onChange={(e) => setNewComplaintForm({ ...newComplaintForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="AIR_CONDITIONING">Air Conditioning</option>
                    <option value="SEATING">Seating Recliner</option>
                    <option value="SOUND_VIDEO">Sound / Visual</option>
                    <option value="F_AND_B">Concessions F&B</option>
                    <option value="STAFF_BEHAVIOUR">Staff / Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Details & Customer Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={newComplaintForm.details}
                  onChange={(e) => setNewComplaintForm({ ...newComplaintForm, details: e.target.value })}
                  placeholder="Details of the complaint..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComplaintModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black font-bold uppercase tracking-wider cursor-pointer border-0"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACCESSIBILITY REQUEST */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Log Special Assistance Request</h3>
            <form onSubmit={handleCreateAccess} className="space-y-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Customer / Companion Name</label>
                <input
                  type="text"
                  required
                  value={newAccessForm.customerName}
                  onChange={(e) => setNewAccessForm({ ...newAccessForm, customerName: e.target.value })}
                  placeholder="e.g. S. Murthy (Elder Escort)"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Screen & Seat</label>
                  <input
                    type="text"
                    value={newAccessForm.seatNumber}
                    onChange={(e) => setNewAccessForm({ ...newAccessForm, seatNumber: e.target.value })}
                    placeholder="e.g. Audi 1, A-1"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Assistance Type</label>
                  <select
                    value={newAccessForm.assistanceType}
                    onChange={(e) => setNewAccessForm({ ...newAccessForm, assistanceType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="WHEELCHAIR_ACCESS">Wheelchair Companion Escort</option>
                    <option value="HEARING_LOOP">Hearing Loop Receiver</option>
                    <option value="ELDER_ESCORT">Elder Guidance</option>
                    <option value="SERVICE_ANIMAL">Service Animal Assistance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Special Assistance Notes</label>
                <textarea
                  rows={2}
                  value={newAccessForm.notes}
                  onChange={(e) => setNewAccessForm({ ...newAccessForm, notes: e.target.value })}
                  placeholder="Enter specific assistance notes..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer border-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gold hover:bg-yellow-400 text-black font-bold uppercase tracking-wider cursor-pointer border-0"
                >
                  Save & Page Usher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
