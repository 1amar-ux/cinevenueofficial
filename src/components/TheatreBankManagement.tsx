import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  CreditCard,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  Search,
  Filter,
  ArrowUpRight,
  DollarSign,
  FileText,
  Lock,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Ban,
  Monitor
} from "lucide-react";
import { TheatreBankAccount, BankVerificationStatus, TheatreSettlementRecord, TheatreBankStats } from "../types";
import { isValidIFSC, isValidPAN, isValidGSTIN } from "../utils/bankValidation";

interface TheatreVenue {
  id: string | number;
  name: string;
  location?: string;
  city?: string;
  state?: string;
  screens?: number;
  status?: string;
  ownerName?: string;
  ownerEmail?: string;
}

interface TheatreBankManagementProps {
  theatres: TheatreVenue[];
  adminUser?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  onLogAudit?: (action: string, reason: string, details?: any) => void;
  onOpenManagerDashboard?: (theatreId: number) => void;
}

export const TheatreBankManagement: React.FC<TheatreBankManagementProps> = ({
  theatres,
  adminUser = { id: "ADMIN-01", fullName: "Super Admin", email: "superadmin@cinevenue.com", role: "Super Admin" },
  onLogAudit,
  onOpenManagerDashboard
}) => {
  const [bankAccounts, setBankAccounts] = useState<Record<string, TheatreBankAccount[]>>({});
  const [selectedTheatreId, setSelectedTheatreId] = useState<string>(String(theatres[0]?.id || "1"));
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<TheatreBankStats>({
    totalAccounts: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    missingDetails: 0,
    suspended: 0
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TheatreBankAccount | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "HDFC Bank",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    accountType: "Current" as "Current" | "Savings",
    branchName: "",
    branchAddress: "",
    beneficiaryName: "",
    pan: "",
    gstin: "",
    upiId: "",
    isPrimary: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionNotes, setActionNotes] = useState("");
  const [revealedAccountNumbers, setRevealedAccountNumbers] = useState<Record<string, string>>({});
  const [settlementHistory, setSettlementHistory] = useState<TheatreSettlementRecord[]>([]);

  // Disbursal Form
  const [settleData, setSettleData] = useState({
    amount: 125000,
    grossSales: 160000,
    commission: 19200,
    taxes: 15800,
    notes: "Monthly net box office settlement"
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  };

  // Load all bank accounts and stats
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch("/api/admin/theatre-bank-stats");
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setStats(data.stats);
      }

      // Fetch accounts for all theatres
      const accMap: Record<string, TheatreBankAccount[]> = {};
      for (const t of theatres) {
        const tId = String(t.id);
        const res = await fetch(`/api/admin/theatres/${tId}/bank-accounts`);
        if (res.ok) {
          const resData = await res.json();
          accMap[tId] = resData.bankAccounts || [];
        }
      }
      setBankAccounts(accMap);

      // Load settlement history for selected theatre
      if (selectedTheatreId) {
        fetchSettlements(selectedTheatreId);
      }
    } catch (err) {
      console.error("Error loading bank data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettlements = async (theatreId: string) => {
    try {
      const res = await fetch(`/api/admin/theatres/${theatreId}/settlements`);
      if (res.ok) {
        const data = await res.json();
        setSettlementHistory(data.settlements || []);
      }
    } catch (err) {
      console.error("Error fetching settlements", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [theatres]);

  useEffect(() => {
    if (selectedTheatreId) {
      fetchSettlements(selectedTheatreId);
    }
  }, [selectedTheatreId]);

  const selectedTheatre = theatres.find(t => String(t.id) === String(selectedTheatreId)) || theatres[0];
  const currentAccounts = bankAccounts[selectedTheatreId] || [];
  const primaryAccount = currentAccounts.find(a => a.isPrimary);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.accountHolderName.trim()) errors.accountHolderName = "Account holder name is required.";
    if (!formData.bankName.trim()) errors.bankName = "Bank name is required.";
    if (!formData.accountNumber.trim()) errors.accountNumber = "Account number is required.";
    else if (formData.accountNumber.length < 8) errors.accountNumber = "Account number must be at least 8 digits.";

    if (isAddModalOpen && formData.accountNumber !== formData.confirmAccountNumber) {
      errors.confirmAccountNumber = "Account number does not match confirmation.";
    }

    if (!formData.ifscCode.trim()) {
      errors.ifscCode = "IFSC code is required.";
    } else if (!isValidIFSC(formData.ifscCode)) {
      errors.ifscCode = "Invalid IFSC format (e.g., HDFC0000045, SBIN0004125).";
    }

    if (formData.pan && !isValidPAN(formData.pan)) {
      errors.pan = "Invalid PAN format (e.g., AAACP1234F).";
    }

    if (formData.gstin && !isValidGSTIN(formData.gstin)) {
      errors.gstin = "Invalid GSTIN format (e.g., 36AAACP1234F1Z5).";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add Bank Account
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/bank-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        },
        body: JSON.stringify({
          ...formData,
          createdBy: adminUser.email
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to add bank account.");
      }

      showNotification("success", "Bank account successfully registered and submitted for verification.");
      setIsAddModalOpen(false);
      resetForm();
      fetchAllData();
      onLogAudit?.("THEATRE_BANK_ACCOUNT_ADDED", `Added bank account ${formData.bankName} for ${selectedTheatre?.name}`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit Bank Account
  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/bank-accounts/${selectedAccount.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        },
        body: JSON.stringify({
          ...formData,
          updatedBy: adminUser.email
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update bank account.");
      }

      showNotification("success", "Bank account updated successfully. Re-verification required if account details changed.");
      setIsEditModalOpen(false);
      setSelectedAccount(null);
      resetForm();
      fetchAllData();
      onLogAudit?.("THEATRE_BANK_ACCOUNT_EDITED", `Updated bank account ${selectedAccount.id} for ${selectedTheatre?.name}`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Bank Account
  const handleVerifyAccount = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/bank-accounts/${selectedAccount.id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        },
        body: JSON.stringify({ notes: actionNotes })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Verification failed");

      showNotification("success", `Bank account for ${selectedTheatre?.name} has been verified.`);
      setIsVerifyModalOpen(false);
      setSelectedAccount(null);
      setActionNotes("");
      fetchAllData();
      onLogAudit?.("THEATRE_BANK_ACCOUNT_VERIFIED", `Verified bank account ${selectedAccount.maskedAccountNumber} with notes: ${actionNotes}`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reject Bank Account
  const handleRejectAccount = async () => {
    if (!selectedAccount) return;
    if (!actionNotes.trim()) {
      showNotification("error", "Rejection reason is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/bank-accounts/${selectedAccount.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        },
        body: JSON.stringify({ reason: actionNotes })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Rejection failed");

      showNotification("success", "Bank account has been marked as Rejected.");
      setIsRejectModalOpen(false);
      setSelectedAccount(null);
      setActionNotes("");
      fetchAllData();
      onLogAudit?.("THEATRE_BANK_ACCOUNT_REJECTED", `Rejected bank account ${selectedAccount.maskedAccountNumber}. Reason: ${actionNotes}`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Suspend Bank Account
  const handleSuspendAccount = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/bank-accounts/${selectedAccount.id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        },
        body: JSON.stringify({ reason: actionNotes || "Suspended by CineVenue Risk Review" })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Suspension failed");

      showNotification("success", "Bank account has been suspended.");
      setIsSuspendModalOpen(false);
      setSelectedAccount(null);
      setActionNotes("");
      fetchAllData();
      onLogAudit?.("THEATRE_BANK_ACCOUNT_SUSPENDED", `Suspended bank account ${selectedAccount.maskedAccountNumber}`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Set Primary Account
  const handleSetPrimary = async (account: TheatreBankAccount) => {
    if (account.verificationStatus !== "Verified") {
      showNotification("error", "Only verified bank accounts can be set as the Primary Settlement Account.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/bank-accounts/${account.id}/set-primary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to set primary account");

      showNotification("success", `Primary settlement account updated to ${account.bankName} (${account.maskedAccountNumber}).`);
      fetchAllData();
      onLogAudit?.("THEATRE_PRIMARY_BANK_CHANGED", `Set primary bank account to ${account.maskedAccountNumber} for ${selectedTheatre?.name}`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reveal Full Account Number (Security Action with Audit)
  const handleRevealAccountNumber = async (account: TheatreBankAccount) => {
    if (revealedAccountNumbers[account.id]) {
      // Hide
      const updated = { ...revealedAccountNumbers };
      delete updated[account.id];
      setRevealedAccountNumbers(updated);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/bank-accounts/${account.id}/reveal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Permission denied to reveal bank account");

      setRevealedAccountNumbers(prev => ({
        ...prev,
        [account.id]: data.fullAccountNumber
      }));

      onLogAudit?.("THEATRE_BANK_ACCOUNT_FULL_REVEALED", `Authorized viewing of full account number for ${account.bankName} (${account.maskedAccountNumber})`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disburse Settlement
  const handleProcessSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryAccount || primaryAccount.verificationStatus !== "Verified") {
      showNotification("error", "Cannot process settlement: Venue does not have an active verified primary bank account.");
      return;
    }

    setLoading(true);
    try {
      const idempotencyKey = `CV-SET-${selectedTheatreId}-${Date.now()}`;
      const res = await fetch(`/api/admin/theatres/${selectedTheatreId}/settlements/disburse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": adminUser.id,
          "x-admin-email": adminUser.email
        },
        body: JSON.stringify({
          theatreName: selectedTheatre?.name,
          amount: settleData.amount,
          grossSales: settleData.grossSales,
          commission: settleData.commission,
          taxes: settleData.taxes,
          idempotencyKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Settlement disbursal failed");

      showNotification("success", `₹${data.settlement.netAmount.toLocaleString("en-IN")} successfully disbursed to ${primaryAccount.beneficiaryName} via NEFT (${data.settlement.utr}).`);
      setIsSettleModalOpen(false);
      fetchSettlements(selectedTheatreId);
      onLogAudit?.("THEATRE_SETTLEMENT_DISBURSED", `Disbursed payout ₹${settleData.amount} to ${selectedTheatre?.name} via ${primaryAccount.maskedAccountNumber}`);
    } catch (err: any) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountHolderName: "",
      bankName: "HDFC Bank",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      accountType: "Current",
      branchName: "",
      branchAddress: "",
      beneficiaryName: "",
      pan: "",
      gstin: "",
      upiId: "",
      isPrimary: true
    });
    setFormErrors({});
  };

  const openEditModal = (acc: TheatreBankAccount) => {
    setSelectedAccount(acc);
    setFormData({
      accountHolderName: acc.accountHolderName,
      bankName: acc.bankName,
      accountNumber: "", // Keep empty unless user re-inputs
      confirmAccountNumber: "",
      ifscCode: acc.ifscCode,
      accountType: acc.accountType,
      branchName: acc.branchName,
      branchAddress: acc.branchAddress || "",
      beneficiaryName: acc.beneficiaryName,
      pan: acc.pan || "",
      gstin: acc.gstin || "",
      upiId: acc.upiId || "",
      isPrimary: acc.isPrimary
    });
    setIsEditModalOpen(true);
  };

  // Status Badge Helper
  const renderStatusBadge = (status: BankVerificationStatus) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case "Pending Verification":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
            Pending Verification
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <Ban className="w-3.5 h-3.5 text-red-600" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Not Added
          </span>
        );
    }
  };

  // Filtered theatres list
  const filteredTheatres = theatres.filter(t => {
    const tId = String(t.id);
    const accs = bankAccounts[tId] || [];
    const prim = accs.find(a => a.isPrimary) || accs[0];
    const status = prim ? prim.verificationStatus : "Not Added";

    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prim && prim.bankName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (prim && prim.maskedAccountNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    if (statusFilter === "VERIFIED") return status === "Verified";
    if (statusFilter === "PENDING") return status === "Pending Verification";
    if (statusFilter === "MISSING") return status === "Not Added" || accs.length === 0;
    if (statusFilter === "REJECTED") return status === "Rejected";
    if (statusFilter === "SUSPENDED") return status === "Suspended";
    return true;
  });

  return (
    <div id="theatre-bank-management-container" className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          id="bank-toast-notification"
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
              : 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Building2 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Theatre Bank Accounts & Settlement Access</h1>
              <p className="text-sm text-slate-500">
                Authoritative multi-venue bank verification, encrypted settlement disbursement, and KYC compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="refresh-bank-data-btn"
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            id="add-bank-account-header-btn"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Bank Account
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{stats.totalAccounts}</p>
          <span className="text-xs text-slate-500">Across all cinema venues</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Verified & Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.verified}</p>
          <span className="text-xs text-emerald-600 font-medium">Ready for payouts</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Verification</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{stats.pending}</p>
          <span className="text-xs text-amber-600 font-medium">Awaiting compliance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Missing Bank Details</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2">{stats.missingDetails}</p>
          <span className="text-xs text-rose-600 font-medium">Settlement blocked</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected / Suspended</span>
            <Ban className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.rejected + stats.suspended}</p>
          <span className="text-xs text-slate-500">Requires venue action</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Venues List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-sm">Select Theatre Venue</h2>
              <span className="text-xs text-slate-500">{filteredTheatres.length} venues</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-theatre-venues-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search venue name, city, bank..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: "ALL", label: "All" },
                { id: "VERIFIED", label: "Verified" },
                { id: "PENDING", label: "Pending" },
                { id: "MISSING", label: "Missing" },
                { id: "REJECTED", label: "Rejected" }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Venues Scroll List */}
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
              {filteredTheatres.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No venues found matching filters
                </div>
              ) : (
                filteredTheatres.map(t => {
                  const tId = String(t.id);
                  const accs = bankAccounts[tId] || [];
                  const prim = accs.find(a => a.isPrimary) || accs[0];
                  const status = prim ? prim.verificationStatus : "Not Added";
                  const isSelected = tId === String(selectedTheatreId);

                  return (
                    <button
                      key={tId}
                      id={`venue-select-btn-${tId}`}
                      onClick={() => setSelectedTheatreId(tId)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-indigo-50/80 border border-indigo-200 shadow-xs'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{t.name}</p>
                          <p className="text-xs text-slate-500 truncate">{t.city || "Hyderabad"}, {t.state || "Telangana"}</p>
                        </div>
                        {renderStatusBadge(status)}
                      </div>

                      {prim ? (
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-600 bg-white/70 px-2 py-1 rounded border border-slate-100">
                          <span className="font-medium text-slate-800">{prim.bankName}</span>
                          <span className="font-mono text-slate-500">{prim.maskedAccountNumber}</span>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>No bank account registered</span>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Venue Bank Profile & Details */}
        <div className="lg:col-span-8 space-y-6">
          {selectedTheatre ? (
            <>
              {/* Active Venue Banner */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedTheatre.name}</h2>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                      Venue ID: {selectedTheatre.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedTheatre.location || "Main Complex"}, {selectedTheatre.city || "Hyderabad"} • {selectedTheatre.screens || 4} Screens
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenManagerDashboard && (
                    <button
                      id="launch-theatre-dashboard-from-bank"
                      onClick={() => onOpenManagerDashboard(Number(selectedTheatre.id))}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer"
                      title="Open Independent Theatre Admin Workspace"
                    >
                      <Monitor className="w-4 h-4 text-amber-600" />
                      <span>Launch Dashboard</span>
                    </button>
                  )}
                  <button
                    id="disburse-settlement-btn"
                    onClick={() => setIsSettleModalOpen(true)}
                    disabled={!primaryAccount || primaryAccount.verificationStatus !== "Verified"}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all ${
                      primaryAccount && primaryAccount.verificationStatus === "Verified"
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                    title={
                      primaryAccount && primaryAccount.verificationStatus === "Verified"
                        ? "Disburse payout to verified bank account"
                        : "Settlement requires a verified primary bank account"
                    }
                  >
                    <DollarSign className="w-4 h-4" />
                    Process Settlement
                  </button>
                  <button
                    id="add-bank-btn-for-selected"
                    onClick={() => {
                      resetForm();
                      setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Account
                  </button>
                </div>
              </div>

              {/* Registered Accounts Card List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Bank & Settlement Accounts ({currentAccounts.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Primary account receives automated weekly/monthly settlements
                  </span>
                </div>

                {currentAccounts.length === 0 ? (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-3">
                    <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">No Bank Accounts On File</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      This cinema venue does not have any bank account registered. Settlements cannot be processed until a verified bank account is linked.
                    </p>
                    <button
                      id="add-first-bank-account-btn"
                      onClick={() => {
                        resetForm();
                        setIsAddModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Register Bank Account
                    </button>
                  </div>
                ) : (
                  currentAccounts.map(acc => {
                    const isRevealed = Boolean(revealedAccountNumbers[acc.id]);
                    const displayAccNum = isRevealed ? revealedAccountNumbers[acc.id] : acc.maskedAccountNumber;

                    return (
                      <div
                        key={acc.id}
                        id={`bank-account-card-${acc.id}`}
                        className={`bg-white rounded-xl border p-5 transition-all shadow-sm ${
                          acc.isPrimary
                            ? 'border-indigo-300 ring-1 ring-indigo-200'
                            : 'border-slate-200'
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-50 text-indigo-700 rounded-lg border border-slate-200">
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-900 text-base">{acc.bankName}</h4>
                                {acc.isPrimary && (
                                  <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-full">
                                    Primary Settlement Account
                                  </span>
                                )}
                                {renderStatusBadge(acc.verificationStatus)}
                              </div>
                              <p className="text-xs text-slate-500">
                                {acc.accountType} Account • Branch: {acc.branchName || "Main"}
                              </p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {!acc.isPrimary && acc.verificationStatus === "Verified" && (
                              <button
                                id={`set-primary-btn-${acc.id}`}
                                onClick={() => handleSetPrimary(acc)}
                                className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
                              >
                                Set as Primary
                              </button>
                            )}
                            <button
                              id={`edit-bank-btn-${acc.id}`}
                              onClick={() => openEditModal(acc)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                              title="Edit account details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-4 text-xs">
                          <div>
                            <span className="text-slate-500 block mb-0.5">Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {displayAccNum}
                              </span>
                              <button
                                id={`reveal-acc-btn-${acc.id}`}
                                onClick={() => handleRevealAccountNumber(acc)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                                title={isRevealed ? "Hide account number" : "Authorized reveal (logged)"}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5 text-indigo-600" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-500 block mb-0.5">IFSC Code:</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">{acc.ifscCode}</span>
                          </div>

                          <div>
                            <span className="text-slate-500 block mb-0.5">Beneficiary / Holder Name:</span>
                            <span className="font-semibold text-slate-900 text-sm">{acc.beneficiaryName || acc.accountHolderName}</span>
                          </div>

                          {acc.pan && (
                            <div>
                              <span className="text-slate-500 block mb-0.5">PAN:</span>
                              <span className="font-mono font-semibold text-slate-800">{acc.pan}</span>
                            </div>
                          )}

                          {acc.gstin && (
                            <div>
                              <span className="text-slate-500 block mb-0.5">GSTIN:</span>
                              <span className="font-mono font-semibold text-slate-800">{acc.gstin}</span>
                            </div>
                          )}

                          {acc.upiId && (
                            <div>
                              <span className="text-slate-500 block mb-0.5">UPI ID:</span>
                              <span className="font-mono font-semibold text-slate-800">{acc.upiId}</span>
                            </div>
                          )}
                        </div>

                        {/* Verification Metadata & Compliance Banner */}
                        {acc.verificationStatus === "Verified" && acc.verifiedAt && (
                          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">Verified on {new Date(acc.verifiedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              {acc.verifiedBy && <span className="text-emerald-700"> by {acc.verifiedBy}</span>}
                              {acc.verificationNotes && (
                                <p className="text-emerald-700/90 mt-0.5 italic">"{acc.verificationNotes}"</p>
                              )}
                            </div>
                          </div>
                        )}

                        {acc.verificationStatus === "Rejected" && (
                          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">Verification Rejected:</span>
                              <p className="text-rose-700 mt-0.5">{acc.verificationNotes || "KYC documents did not match bank record."}</p>
                            </div>
                          </div>
                        )}

                        {acc.verificationStatus === "Suspended" && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 flex items-start gap-2">
                            <Ban className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold">Account Suspended:</span>
                              <p className="text-red-700 mt-0.5">{acc.verificationNotes || "Account temporarily placed on compliance hold."}</p>
                            </div>
                          </div>
                        )}

                        {/* Admin Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                          {acc.verificationStatus === "Pending Verification" && (
                            <>
                              <button
                                id={`reject-account-btn-${acc.id}`}
                                onClick={() => {
                                  setSelectedAccount(acc);
                                  setActionNotes("");
                                  setIsRejectModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                              >
                                Reject Account
                              </button>
                              <button
                                id={`verify-account-btn-${acc.id}`}
                                onClick={() => {
                                  setSelectedAccount(acc);
                                  setActionNotes("Corporate bank records & GST validated successfully.");
                                  setIsVerifyModalOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                              >
                                Verify Account
                              </button>
                            </>
                          )}

                          {acc.verificationStatus === "Verified" && (
                            <button
                              id={`suspend-account-btn-${acc.id}`}
                              onClick={() => {
                                setSelectedAccount(acc);
                                setActionNotes("");
                                setIsSuspendModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                            >
                              Suspend Account
                            </button>
                          )}

                          {(acc.verificationStatus === "Rejected" || acc.verificationStatus === "Suspended") && (
                            <button
                              id={`re-verify-account-btn-${acc.id}`}
                              onClick={() => {
                                setSelectedAccount(acc);
                                setActionNotes("Re-evaluating compliance and bank proof.");
                                setIsVerifyModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                            >
                              Re-Verify Account
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Settlement History for Selected Venue */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Disbursement & Settlement History</h3>
                    <p className="text-xs text-slate-500">Historical payout records dispatched to verified bank accounts</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    {settlementHistory.length} Settlements Processed
                  </span>
                </div>

                {settlementHistory.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No prior settlements disbursed for this theatre venue yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Settlement ID</th>
                          <th className="p-2.5">Bank & Account</th>
                          <th className="p-2.5">Gross Sales</th>
                          <th className="p-2.5">Platform Share</th>
                          <th className="p-2.5">Net Disbursed</th>
                          <th className="p-2.5">Status & UTR</th>
                          <th className="p-2.5">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {settlementHistory.map(st => (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="p-2.5 font-mono font-bold text-slate-900">{st.id}</td>
                            <td className="p-2.5">
                              <span className="font-semibold text-slate-800 block">{st.bankName || "HDFC Bank"}</span>
                              <span className="font-mono text-slate-500">{st.maskedAccountNumber || "XXXX XXXX 4921"}</span>
                            </td>
                            <td className="p-2.5 font-semibold text-slate-900">₹{st.grossSales.toLocaleString("en-IN")}</td>
                            <td className="p-2.5 text-slate-600">₹{(st.commission + st.taxes).toLocaleString("en-IN")}</td>
                            <td className="p-2.5 font-bold text-emerald-700">₹{st.netAmount.toLocaleString("en-IN")}</td>
                            <td className="p-2.5">
                              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px]">
                                {st.status}
                              </span>
                              {st.utr && <span className="block font-mono text-[10px] text-slate-500 mt-0.5">{st.utr}</span>}
                            </td>
                            <td className="p-2.5 text-slate-500">
                              {new Date(st.settlementDate).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm text-slate-400">
              Select a theatre venue from the left column to manage bank details.
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD / REGISTER BANK ACCOUNT                        */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Register Bank Account</h3>
                <p className="text-xs text-slate-500">Venue: {selectedTheatre?.name}</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Holder Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-account-holder-name"
                    type="text"
                    required
                    value={formData.accountHolderName}
                    onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder="e.g. Prasads Multiplex Pvt Ltd"
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                      formErrors.accountHolderName ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.accountHolderName && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.accountHolderName}</span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="add-bank-name"
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="State Bank of India">State Bank of India</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                    <option value="Bank of Baroda">Bank of Baroda</option>
                    <option value="Canara Bank">Canara Bank</option>
                    <option value="Federal Bank">Federal Bank</option>
                    <option value="IDBI Bank">IDBI Bank</option>
                    <option value="Other Commercial Bank">Other Commercial Bank</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-account-number"
                    type="password"
                    required
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Enter full bank account number"
                    className={`w-full p-2.5 font-mono border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                      formErrors.accountNumber ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.accountNumber && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.accountNumber}</span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm Account Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-confirm-account-number"
                    type="text"
                    required
                    value={formData.confirmAccountNumber}
                    onChange={e => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                    placeholder="Re-type account number"
                    className={`w-full p-2.5 font-mono border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                      formErrors.confirmAccountNumber ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.confirmAccountNumber && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.confirmAccountNumber}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    IFSC Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="add-ifsc-code"
                    type="text"
                    required
                    value={formData.ifscCode}
                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0000045"
                    className={`w-full p-2.5 font-mono uppercase border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                      formErrors.ifscCode ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  {formErrors.ifscCode && (
                    <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.ifscCode}</span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="add-account-type"
                    value={formData.accountType}
                    onChange={e => setFormData({ ...formData, accountType: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Current">Current Account (Business/Corporate)</option>
                    <option value="Savings">Savings Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
                  <input
                    id="add-branch-name"
                    type="text"
                    value={formData.branchName}
                    onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                    placeholder="e.g. Khairatabad Main Branch"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beneficiary Name</label>
                  <input
                    id="add-beneficiary-name"
                    type="text"
                    value={formData.beneficiaryName}
                    onChange={e => setFormData({ ...formData, beneficiaryName: e.target.value })}
                    placeholder="Name as registered with bank"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PAN (Optional)</label>
                  <input
                    id="add-pan"
                    type="text"
                    value={formData.pan}
                    onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="AAACP1234F"
                    className="w-full p-2.5 font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {formErrors.pan && <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.pan}</span>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN (Optional)</label>
                  <input
                    id="add-gstin"
                    type="text"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="36AAACP1234F1Z5"
                    className="w-full p-2.5 font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {formErrors.gstin && <span className="text-rose-600 text-[11px] mt-0.5 block">{formErrors.gstin}</span>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">UPI ID (Optional)</label>
                  <input
                    id="add-upi-id"
                    type="text"
                    value={formData.upiId}
                    onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="venue@hdfcbank"
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">Set as Primary Settlement Account</p>
                  <p className="text-[11px] text-slate-500">Will receive future settlements once verified</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-slate-600 text-[11px] flex items-start gap-2">
                <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Security Note:</strong> Account numbers are encrypted using AES-256 before storage.
                  Masked accounts (<code className="font-mono">XXXX XXXX 1234</code>) are displayed in public views.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT BANK ACCOUNT                                  */}
      {/* ========================================================= */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Edit Bank Account</h3>
                <p className="text-xs text-slate-500">Currently: {selectedAccount.bankName} ({selectedAccount.maskedAccountNumber})</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditAccount} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={formData.accountHolderName}
                    onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                <span className="font-semibold block mb-0.5">Changing Account Number:</span>
                Leave account number blank if you do not wish to change it. If changed, the status will reset to <strong>Pending Verification</strong>.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Account Number (Optional)</label>
                  <input
                    type="password"
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="Leave blank to keep existing"
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm New Account Number</label>
                  <input
                    type="text"
                    value={formData.confirmAccountNumber}
                    onChange={e => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                    placeholder="Confirm if changed"
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    required
                    value={formData.ifscCode}
                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 font-mono uppercase border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Type</label>
                  <select
                    value={formData.accountType}
                    onChange={e => setFormData({ ...formData, accountType: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="Current">Current Account</option>
                    <option value="Savings">Savings Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    value={formData.beneficiaryName}
                    onChange={e => setFormData({ ...formData, beneficiaryName: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VERIFY BANK ACCOUNT                                */}
      {/* ========================================================= */}
      {isVerifyModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <span className="p-2.5 bg-emerald-100 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Approve & Verify Bank Account</h3>
                <p className="text-xs text-slate-500">{selectedAccount.bankName} • {selectedAccount.maskedAccountNumber}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 text-slate-700">
              <p><strong>Venue:</strong> {selectedTheatre?.name}</p>
              <p><strong>Holder:</strong> {selectedAccount.accountHolderName}</p>
              <p><strong>IFSC:</strong> {selectedAccount.ifscCode}</p>
              <p><strong>Branch:</strong> {selectedAccount.branchName}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compliance Verification Notes / Penny Check Reference <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="e.g. Bank statement and cancelled cheque verified. Penny drop test matched account holder."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyAccount}
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REJECT BANK ACCOUNT                                */}
      {/* ========================================================= */}
      {isRejectModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <span className="p-2.5 bg-rose-100 rounded-lg">
                <XCircle className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reject Bank Account</h3>
                <p className="text-xs text-slate-500">{selectedAccount.bankName} • {selectedAccount.maskedAccountNumber}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="e.g. Account name mismatch with CIN/GST records or invalid IFSC."
                className="w-full p-2.5 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectAccount}
                disabled={loading || !actionNotes.trim()}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUSPEND BANK ACCOUNT                               */}
      {/* ========================================================= */}
      {isSuspendModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <span className="p-2.5 bg-amber-100 rounded-lg">
                <Ban className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Suspend Bank Account</h3>
                <p className="text-xs text-slate-500">{selectedAccount.bankName} • {selectedAccount.maskedAccountNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Suspended accounts cannot receive payouts. You can re-verify or unsuspend this account at any time.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Suspension Reason
              </label>
              <textarea
                rows={3}
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder="e.g. Account under dispute or bank branch merger."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSuspendModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSuspendAccount}
                disabled={loading}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DISBURSE SETTLEMENT PAYOUT                         */}
      {/* ========================================================= */}
      {isSettleModalOpen && primaryAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <span className="p-2.5 bg-emerald-100 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Disburse Theatre Payout (NEFT/RTGS)</h3>
                <p className="text-xs text-slate-500">Venue: {selectedTheatre?.name}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2 text-slate-700">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-600">Beneficiary Bank:</span>
                <span className="font-bold text-slate-900">{primaryAccount.bankName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-600">Account Number:</span>
                <span className="font-mono font-bold text-slate-900">{primaryAccount.maskedAccountNumber}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-600">IFSC Code:</span>
                <span className="font-mono font-bold text-slate-900">{primaryAccount.ifscCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">Account Holder:</span>
                <span className="font-semibold text-slate-900">{primaryAccount.beneficiaryName || primaryAccount.accountHolderName}</span>
              </div>
            </div>

            <form onSubmit={handleProcessSettlement} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gross Box Office (₹)</label>
                  <input
                    type="number"
                    value={settleData.grossSales}
                    onChange={e => setSettleData({ ...settleData, grossSales: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Net Payout Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={settleData.amount}
                    onChange={e => setSettleData({ ...settleData, amount: Number(e.target.value) })}
                    className="w-full p-2 border border-emerald-300 bg-emerald-50/50 rounded-lg font-bold text-emerald-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settlement Description / Notes</label>
                <input
                  type="text"
                  value={settleData.notes}
                  onChange={e => setSettleData({ ...settleData, notes: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  Disbursement will generate an authoritative bank UTR reference and record immutable financial audit trails.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Authorize Payout Disbursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheatreBankManagement;
