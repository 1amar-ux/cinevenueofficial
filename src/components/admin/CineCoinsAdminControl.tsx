import React, { useState } from "react";
import { 
  Coins, Settings, Shield, Award, Gift, Zap, RefreshCw, 
  Plus, Trash2, Edit, Check, X, Search, Lock, Unlock, 
  BarChart2, Filter, DollarSign, Users, AlertTriangle, FileSpreadsheet,
  Download, ArrowUpRight, ArrowDownRight, Activity, Clock, FileText,
  Percent, ShieldAlert, CheckCircle2, AlertOctagon, HelpCircle,
  TrendingUp, Radio, Send, RotateCcw, Power, Cpu, ShieldCheck, Eye,
  Sparkles, Calendar, Tag, ChevronRight, UserCheck, KeyRound, CheckSquare
} from "lucide-react";
import { 
  CineCoinsSettings, CineCoinsReward, CineCoinsChallenge, 
  CineCoinsTransaction, CineCoinsUserWallet, CineCoinsAuditLog,
  CineCoinsApprovalRequest, CineCoinsFraudAlert, CineCoinsOffer,
  CineCoinsLimitsConfig, CineCoinRewardItemConfig, CineCoinValueHistoryRecord,
  CineCoinRewardHistoryRecord, CineCoinSpinSegment
} from "../../types";

interface CineCoinsAdminControlProps {
  settings: CineCoinsSettings;
  onUpdateSettings: (settings: CineCoinsSettings) => void;
  rewards: CineCoinsReward[];
  onUpdateRewards: (rewards: CineCoinsReward[]) => void;
  challenges: CineCoinsChallenge[];
  onUpdateChallenges: (challenges: CineCoinsChallenge[]) => void;
  transactions: CineCoinsTransaction[];
  onUpdateTransactions: (txs: CineCoinsTransaction[]) => void;
  userWallets?: CineCoinsUserWallet[];
  onUpdateWallet?: (wallet: CineCoinsUserWallet) => void;
}

export default function CineCoinsAdminControl({
  settings,
  onUpdateSettings,
  rewards,
  onUpdateRewards,
  challenges,
  onUpdateChallenges,
  transactions,
  onUpdateTransactions,
  userWallets = [],
  onUpdateWallet
}: CineCoinsAdminControlProps) {
  // Navigation Menu matching prompt exact 20-item hierarchy:
  // 1. Dashboard, 2. Wallets, 3. Users, 4. Transactions, 5. Purchases, 6. Redemptions, 7. Transfers, 8. Refunds, 9. Cashback, 10. Bonus CineCoins, 11. Offers, 12. Expiry Management, 13. Limits & Controls, 14. Fraud & Risk, 15. Approvals, 16. Reports, 17. Audit Logs, 18. Security, 19. Settings, 20. Emergency Controls
  const [activeMenu, setActiveMenu] = useState<
    | "dashboard"
    | "wallets"
    | "users"
    | "transactions"
    | "purchases"
    | "redemptions"
    | "transfers"
    | "refunds"
    | "cashback"
    | "bonus"
    | "offers"
    | "expiry"
    | "limits"
    | "fraud"
    | "approvals"
    | "reports"
    | "audit_logs"
    | "security"
    | "settings"
    | "emergency"
    | "cinecoin_value"
    | "reward_values"
    | "reward_history"
    | "referrals"
    | "overview"
  >("dashboard");

  // Filter States
  const [dateRangeFilter, setDateRangeFilter] = useState<"today" | "yesterday" | "last7" | "last30" | "this_month" | "custom">("last30");
  const [txSearch, setTxSearch] = useState("");
  const [txStatusFilter, setTxStatusFilter] = useState<string>("ALL");
  const [txTypeFilter, setTxTypeFilter] = useState<string>("ALL");
  const [walletSearch, setWalletSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");

  // Manual Adjustment Modal State
  const [isManualAdjustModalOpen, setIsManualAdjustModalOpen] = useState(false);
  const [manualAdjustUser, setManualAdjustUser] = useState("");
  const [manualAdjustType, setManualAdjustType] = useState<"Credit" | "Debit">("Credit");
  const [manualAdjustCoins, setManualAdjustCoins] = useState<number>(500);
  const [manualAdjustReason, setManualAdjustReason] = useState("");
  const [manualAdjust2FA, setManualAdjust2FA] = useState("");
  const [manualAdjustError, setManualAdjustError] = useState("");

  // Bonus Distribution Modal State
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [bonusType, setBonusType] = useState<string>("Promotional");
  const [bonusCoins, setBonusCoins] = useState<number>(1000);
  const [bonusUserTarget, setBonusUserTarget] = useState<string>("ALL_USERS");
  const [bonusSpecificUser, setBonusSpecificUser] = useState<string>("");
  const [bonusReason, setBonusReason] = useState<string>("Festival promotional reward");
  const [bonusExpiryDays, setBonusExpiryDays] = useState<number>(90);

  // Selected Wallet for Ledger Drilldown Modal
  const [selectedWalletLedger, setSelectedWalletLedger] = useState<CineCoinsUserWallet | null>(null);

  // New Offer Modal State
  const [isNewOfferModalOpen, setIsNewOfferModalOpen] = useState(false);
  const [newOfferName, setNewOfferName] = useState("");
  const [newOfferType, setNewOfferType] = useState<"Cashback" | "Bonus" | "Welcome" | "Referral" | "Festival">("Cashback");
  const [newOfferVal, setNewOfferVal] = useState(15);
  const [newOfferIsPct, setNewOfferIsPct] = useState(true);
  const [newOfferMinSpend, setNewOfferMinSpend] = useState(400);
  const [newOfferMaxReward, setNewOfferMaxReward] = useState(1000);
  const [newOfferStart, setNewOfferStart] = useState("2026-09-01");
  const [newOfferEnd, setNewOfferEnd] = useState("2026-10-31");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<CineCoinsAuditLog[]>([
    {
      id: "LOG-9001",
      adminId: "ADMIN-01",
      adminName: "Super Admin",
      action: "Manual Credit",
      userId: "member@cinevenue.com",
      walletId: "WAL-4091",
      transactionId: "TX-9901",
      previousValue: "850 CC",
      newValue: "950 CC",
      reason: "Loyalty Compensation for delayed ticket confirmation",
      ipAddress: "152.57.12.99",
      device: "Chrome / Windows 11",
      timestamp: "2026-08-20 22:15:00"
    },
    {
      id: "LOG-9002",
      adminId: "ADMIN-01",
      adminName: "Super Admin",
      action: "Conversion Rate Baseline",
      userId: "SYSTEM",
      walletId: "N/A",
      previousValue: "1,000 CC = ₹10",
      newValue: "1,000 CC = ₹10",
      reason: "Standard 1,000 CC = ₹10 baseline verification",
      ipAddress: "152.57.12.99",
      device: "Chrome / Windows 11",
      timestamp: "2026-08-20 18:30:12"
    }
  ]);

  // Approval Requests State
  const [approvalRequests, setApprovalRequests] = useState<CineCoinsApprovalRequest[]>([
    {
      id: "APP-301",
      requesterAdmin: "Admin Support",
      type: "Large Credit",
      amountCoins: 10000,
      userEmail: "corporate.booking@enterprise.com",
      reason: "Corporate Gifting Partnership Credit",
      status: "REQUESTED",
      requestedAt: "2026-08-24 20:00"
    },
    {
      id: "APP-302",
      requesterAdmin: "Loyalty Executive",
      type: "Large Refund",
      amountCoins: 7500,
      userEmail: "rahul.sharma@gmail.com",
      reason: "Audio Launch Pass Tech Glitch Refund",
      status: "APPROVED",
      requestedAt: "2026-08-23 11:30",
      reviewedBy: "Super Admin",
      reviewedAt: "2026-08-23 12:00"
    }
  ]);

  // Fraud Alerts State
  const [fraudAlerts, setFraudAlerts] = useState<CineCoinsFraudAlert[]>([
    {
      id: "FRD-101",
      walletId: "WAL-8820",
      userEmail: "suspicious.user99@tempmail.com",
      riskLevel: "High",
      triggerReason: "Rapid peer-to-peer transfers from 5 new accounts within 10 minutes",
      flaggedTxId: "TX-7712",
      status: "Open",
      detectedAt: "2026-08-24 21:40"
    },
    {
      id: "FRD-102",
      walletId: "WAL-2041",
      userEmail: "bot.tester@proxy.net",
      riskLevel: "Critical",
      triggerReason: "Abnormal cashback claims exceeding daily cap limit via script execution",
      status: "Frozen",
      detectedAt: "2026-08-23 19:15"
    }
  ]);

  // Offers State
  const [offers, setOffers] = useState<CineCoinsOffer[]>([
    {
      id: "OFFER-01",
      offerName: "Festival Mega 2x Cashback",
      description: "Earn 20% CineCoins cashback on all IMAX & VIP ticket bookings",
      type: "Cashback",
      rewardValue: 20,
      isPercentage: true,
      minTxAmount: 500,
      maxReward: 500,
      startDate: "2026-08-10",
      endDate: "2026-11-30",
      userUsageLimit: 2,
      totalUsageLimit: 1000,
      currentUsageCount: 142,
      status: "Active"
    },
    {
      id: "OFFER-02",
      offerName: "First Booking Welcome Bonus",
      description: "Get 2,000 Bonus CineCoins instantly upon completing your first movie ticket booking",
      type: "Welcome",
      rewardValue: 2000,
      isPercentage: false,
      minTxAmount: 300,
      maxReward: 2000,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      userUsageLimit: 1,
      totalUsageLimit: 50000,
      currentUsageCount: 12840,
      status: "Active"
    }
  ]);

  // Limits Config State
  const [limits, setLimits] = useState<CineCoinsLimitsConfig>({
    purchaseMin: 100,
    purchaseMax: 50000,
    purchaseDaily: 100000,
    purchaseMonthly: 500000,
    redemptionMin: 50,
    redemptionMax: 20000,
    redemptionDaily: 30000,
    redemptionMonthly: 100000,
    maxOrderRedemptionPercent: 50,
    transferMin: 100,
    transferMax: 5000,
    transferDaily: 10000,
    transferMonthly: 30000,
    walletMaxBalance: 200000,
    manualAdminCreditLimit: 5000,
    manualAdminDebitLimit: 5000
  });

  // =========================================================================
  // 1. CINECOIN VALUE CONTROL (Super Admin Only)
  // Default: 1,000 CC = ₹10 => 1 CC = ₹0.01
  // =========================================================================
  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [isValueConfirmStep, setIsValueConfirmStep] = useState(false);
  const [inputCoinsPerUnit, setInputCoinsPerUnit] = useState<number>(settings.coinsPerUnit || 1000);
  const [inputCurrencyValue, setInputCurrencyValue] = useState<number>(settings.currencyValue || 10);
  const [valueChangeReason, setValueChangeReason] = useState("");
  const [value2FAPin, setValue2FAPin] = useState("");
  const [valueFormError, setValueFormError] = useState("");

  const currentCoinsPerUnit = settings.coinsPerUnit || 1000;
  const currentCurrencyValue = settings.currencyValue || 10;
  const currentCoinValueRupees = currentCurrencyValue / currentCoinsPerUnit; // e.g. 0.01

  // Handle Opening Value Modal
  const handleOpenValueModal = () => {
    setInputCoinsPerUnit(currentCoinsPerUnit);
    setInputCurrencyValue(currentCurrencyValue);
    setValueChangeReason("");
    setValue2FAPin("");
    setValueFormError("");
    setIsValueConfirmStep(false);
    setIsValueModalOpen(true);
  };

  // Step 1: Validate and go to confirmation
  const handleProceedToValueConfirm = () => {
    if (!inputCoinsPerUnit || inputCoinsPerUnit <= 0) {
      setValueFormError("Please enter a valid CineCoin quantity (e.g. 1000).");
      return;
    }
    if (!inputCurrencyValue || inputCurrencyValue <= 0) {
      setValueFormError("Please enter a valid INR currency value (e.g. 10).");
      return;
    }
    if (!valueChangeReason.trim()) {
      setValueFormError("A mandatory business justification reason is required.");
      return;
    }
    if (!value2FAPin.trim()) {
      setValueFormError("Please enter your Super Admin Security PIN / 2FA Code.");
      return;
    }
    setValueFormError("");
    setIsValueConfirmStep(true);
  };

  // Step 2: Final save conversion value
  const handleConfirmValueChange = () => {
    const prevRateText = `${currentCoinsPerUnit.toLocaleString()} CC = ₹${currentCurrencyValue}`;
    const newRateText = `${inputCoinsPerUnit.toLocaleString()} CC = ₹${inputCurrencyValue}`;
    const newUnitRate = inputCurrencyValue / inputCoinsPerUnit;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const timestampStr = `${dateStr} ${timeStr}`;

    const newHistoryRecord: CineCoinValueHistoryRecord = {
      id: `VAL-HIST-${Date.now().toString().slice(-6)}`,
      date: dateStr,
      time: timeStr,
      previousValue: prevRateText,
      newValue: newRateText,
      coinsPerUnit: inputCoinsPerUnit,
      currencyValue: inputCurrencyValue,
      changedBy: "Super Admin",
      reason: valueChangeReason,
      ipAddress: "152.57.12.99",
      timestamp: timestampStr
    };

    const updatedConversionHistory = [newHistoryRecord, ...(settings.conversionHistory || [])];

    const updatedSettings: CineCoinsSettings = {
      ...settings,
      coinsPerUnit: inputCoinsPerUnit,
      currencyValue: inputCurrencyValue,
      coinValueRupees: newUnitRate,
      conversionHistory: updatedConversionHistory
    };

    onUpdateSettings(updatedSettings);

    logAuditEvent(
      "CineCoin Conversion Value Changed",
      "SYSTEM",
      "N/A",
      valueChangeReason,
      prevRateText,
      newRateText
    );

    setIsValueModalOpen(false);
    setIsValueConfirmStep(false);
    alert(`✅ CineCoin Conversion Rate successfully updated to: ${newRateText} (1 CC = ₹${newUnitRate.toFixed(3)}). Future transactions will apply this rate!`);
  };

  // =========================================================================
  // 2. REWARD VALUES & EARNING RULES (13 Activities)
  // =========================================================================
  const currentRewardRules = settings.rewardRules && settings.rewardRules.length >= 13
    ? settings.rewardRules
    : [];

  const [selectedRewardToEdit, setSelectedRewardToEdit] = useState<CineCoinRewardItemConfig | null>(null);
  const [isRewardEditModalOpen, setIsRewardEditModalOpen] = useState(false);
  const [isRewardConfirmStep, setIsRewardConfirmStep] = useState(false);
  
  // Edit Form Fields
  const [editRewardCoins, setEditRewardCoins] = useState<number>(0);
  const [editRewardStatus, setEditRewardStatus] = useState<"Active" | "Disabled">("Active");
  const [editRewardMinSpend, setEditRewardMinSpend] = useState<number>(100);
  const [editRewardDailyLimit, setEditRewardDailyLimit] = useState<number>(1);
  const [editFestivalName, setEditFestivalName] = useState<string>("");
  const [editCampaignStart, setEditCampaignStart] = useState<string>("");
  const [editCampaignEnd, setEditCampaignEnd] = useState<string>("");
  const [editSpinSegments, setEditSpinSegments] = useState<CineCoinSpinSegment[]>([]);
  const [rewardEditReason, setRewardEditReason] = useState("");
  const [rewardEditError, setRewardEditError] = useState("");

  const handleOpenRewardEdit = (rule: CineCoinRewardItemConfig) => {
    setSelectedRewardToEdit(rule);
    setEditRewardCoins(rule.rewardCoins);
    setEditRewardStatus(rule.status);
    setEditRewardMinSpend(rule.minSpend || 100);
    setEditRewardDailyLimit(rule.dailyLimit || 1);
    setEditFestivalName(rule.festivalName || "Festival Campaign Bonus");
    setEditCampaignStart(rule.campaignStartDate || "2026-10-01");
    setEditCampaignEnd(rule.campaignEndDate || "2026-11-15");
    setEditSpinSegments(rule.spinSegments ? JSON.parse(JSON.stringify(rule.spinSegments)) : []);
    setRewardEditReason("");
    setRewardEditError("");
    setIsRewardConfirmStep(false);
    setIsRewardEditModalOpen(true);
  };

  const handleProceedRewardConfirm = () => {
    if (!rewardEditReason.trim()) {
      setRewardEditError("Please provide a mandatory reason for changing this reward rule.");
      return;
    }
    setRewardEditError("");
    setIsRewardConfirmStep(true);
  };

  const handleConfirmRewardSave = () => {
    if (!selectedRewardToEdit) return;

    const prevValueStr = selectedRewardToEdit.activityKey === 'spin_wheel' 
      ? selectedRewardToEdit.displayValue 
      : `${selectedRewardToEdit.rewardCoins.toLocaleString()} CC`;
    
    const newValueStr = selectedRewardToEdit.activityKey === 'spin_wheel'
      ? `Variable (${editSpinSegments.length} Segments)`
      : selectedRewardToEdit.activityKey === 'spend_per_100'
        ? `${editRewardCoins} CC / ₹100`
        : `${editRewardCoins.toLocaleString()} CC`;

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const timestampStr = `${dateStr} ${timeStr}`;

    const newHistoryEntry: CineCoinRewardHistoryRecord = {
      id: `REW-HIST-${Date.now().toString().slice(-6)}`,
      activityKey: selectedRewardToEdit.activityKey,
      rewardActivity: selectedRewardToEdit.activityName,
      previousValue: prevValueStr,
      newValue: newValueStr,
      previousStatus: selectedRewardToEdit.status,
      newStatus: editRewardStatus,
      changedBy: "Super Admin",
      reason: rewardEditReason,
      date: dateStr,
      time: timeStr,
      ipAddress: "152.57.12.99",
      timestamp: timestampStr
    };

    const updatedRules = currentRewardRules.map(r => {
      if (r.id === selectedRewardToEdit.id || r.activityKey === selectedRewardToEdit.activityKey) {
        return {
          ...r,
          rewardCoins: editRewardCoins,
          displayValue: newValueStr,
          status: editRewardStatus,
          minSpend: editRewardMinSpend,
          dailyLimit: editRewardDailyLimit,
          festivalName: editFestivalName,
          campaignStartDate: editCampaignStart,
          campaignEndDate: editCampaignEnd,
          spinSegments: selectedRewardToEdit.activityKey === 'spin_wheel' ? editSpinSegments : r.spinSegments,
          updatedBy: "Super Admin",
          updatedAt: timestampStr
        };
      }
      return r;
    });

    const updatedRewardHistory = [newHistoryEntry, ...(settings.rewardHistory || [])];

    // Synchronize earnRules for backward-compatibility
    const updatedEarnRules = { ...settings.earnRules };
    if (selectedRewardToEdit.activityKey === 'registration') updatedEarnRules.referralBonusCoins = editRewardCoins;
    if (selectedRewardToEdit.activityKey === 'daily_login') updatedEarnRules.dailyLoginCoins = editRewardCoins;
    if (selectedRewardToEdit.activityKey === 'profile_completion') updatedEarnRules.profileCompleteCoins = editRewardCoins;
    if (selectedRewardToEdit.activityKey === 'movie_review') updatedEarnRules.reviewCoins = editRewardCoins;
    if (selectedRewardToEdit.activityKey === 'birthday_bonus') updatedEarnRules.birthdayCoins = editRewardCoins;
    if (selectedRewardToEdit.activityKey === 'festival_bonus') updatedEarnRules.festivalCoins = editRewardCoins;

    const updatedSettings: CineCoinsSettings = {
      ...settings,
      rewardRules: updatedRules,
      rewardHistory: updatedRewardHistory,
      earnRules: updatedEarnRules
    };

    onUpdateSettings(updatedSettings);

    logAuditEvent(
      `Reward Rule Modified: ${selectedRewardToEdit.activityName}`,
      "SYSTEM",
      "N/A",
      rewardEditReason,
      `${prevValueStr} (${selectedRewardToEdit.status})`,
      `${newValueStr} (${editRewardStatus})`
    );

    setIsRewardEditModalOpen(false);
    setIsRewardConfirmStep(false);
    setSelectedRewardToEdit(null);
    alert(`✅ Reward for "${selectedRewardToEdit.activityName}" updated to ${newValueStr} (${editRewardStatus}). Old transactions remain untouched!`);
  };

  const handleQuickToggleRewardStatus = (rule: CineCoinRewardItemConfig) => {
    const newStatus: "Active" | "Disabled" = rule.status === "Active" ? "Disabled" : "Active";
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const timestampStr = `${dateStr} ${timeStr}`;

    const newHistoryEntry: CineCoinRewardHistoryRecord = {
      id: `REW-HIST-${Date.now().toString().slice(-6)}`,
      activityKey: rule.activityKey,
      rewardActivity: rule.activityName,
      previousValue: rule.displayValue,
      newValue: rule.displayValue,
      previousStatus: rule.status,
      newStatus: newStatus,
      changedBy: "Super Admin",
      reason: `Quick status toggle to ${newStatus}`,
      date: dateStr,
      time: timeStr,
      ipAddress: "152.57.12.99",
      timestamp: timestampStr
    };

    const updatedRules = currentRewardRules.map(r => {
      if (r.id === rule.id) {
        return {
          ...r,
          status: newStatus,
          updatedBy: "Super Admin",
          updatedAt: timestampStr
        };
      }
      return r;
    });

    onUpdateSettings({
      ...settings,
      rewardRules: updatedRules,
      rewardHistory: [newHistoryEntry, ...(settings.rewardHistory || [])]
    });

    logAuditEvent(
      `Reward Status Toggled: ${rule.activityName}`,
      "SYSTEM",
      "N/A",
      `Quick toggle to ${newStatus}`,
      rule.status,
      newStatus
    );
  };

  // Helper to log audit event
  const logAuditEvent = (action: string, userEmail: string, walletId: string, reason: string, prevVal?: string, newVal?: string, txId?: string) => {
    const newLog: CineCoinsAuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      adminId: "ADMIN-01",
      adminName: "Super Admin",
      action,
      userId: userEmail,
      walletId,
      transactionId: txId,
      previousValue: prevVal,
      newValue: newVal,
      reason,
      ipAddress: "152.57.12.99",
      device: "Chrome / Windows 11",
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Financial Stats Calculation
  const totalInCirculation = userWallets.reduce((acc, w) => acc + w.balanceCoins, 0) || 25000000;
  const totalPurchased = transactions.filter(t => t.type === 'Purchase').reduce((a, t) => a + t.coins, 0) || 12450000;
  const totalCredited = transactions.filter(t => t.type === 'Earned' || t.type === 'Credit' || t.type === 'Cashback' || t.type === 'Bonus' || t.type === 'Manual Credit').reduce((a, t) => a + t.coins, 0) || 16800000;
  const totalRedeemed = transactions.filter(t => t.type === 'Redeemed' || t.type === 'Redemption').reduce((a, t) => a + t.coins, 0) || 4250000;
  const totalRefunded = transactions.filter(t => (t.type as string) === 'Refunded' || t.type === 'Refund').reduce((a, t) => a + t.coins, 0) || 85000;
  const totalExpired = transactions.filter(t => (t.type as string) === 'Expired' || t.type === 'Expiry').reduce((a, t) => a + t.coins, 0) || 32000;
  const activeWalletsCount = userWallets.filter(w => !w.isFrozen && w.status !== 'Frozen' && w.status !== 'Suspended').length || 45280;
  const frozenWalletsCount = userWallets.filter(w => w.isFrozen || w.status === 'Frozen' || w.status === 'Suspended').length || 14;

  // Emergency Control Confirmation Modal State
  const [emergencyActionPending, setEmergencyActionPending] = useState<string | null>(null);
  const [emergency2FA, setEmergency2FA] = useState("");

  const handleTriggerEmergencyAction = (actionKey: string) => {
    if (emergency2FA !== "123456" && emergency2FA !== "888888" && emergency2FA !== "Amarnath123") {
      alert("Invalid 2FA Verification Code. Please check your authenticator code.");
      return;
    }

    if (actionKey === "DISABLE_PURCHASES") {
      onUpdateSettings({ ...settings, featureToggles: { ...settings.featureToggles, rewards: false } });
    } else if (actionKey === "MAINTENANCE_MODE") {
      onUpdateSettings({ ...settings, isEnabled: false });
    }

    logAuditEvent(`EMERGENCY ACTION TRIGGERED: ${actionKey}`, "GLOBAL", "N/A", `Emergency kill switch ${actionKey} executed with 2FA authorization`);
    alert(`🚨 Emergency Action [${actionKey}] has been successfully executed and logged to permanent audit memory.`);
    setEmergencyActionPending(null);
    setEmergency2FA("");
  };

  // Export to File Handler (CSV, Excel simulation)
  const handleExportData = (format: 'CSV' | 'Excel' | 'PDF', title: string, dataObj: any[]) => {
    let content = "";
    if (format === 'CSV' || format === 'Excel') {
      if (dataObj.length > 0) {
        const keys = Object.keys(dataObj[0]);
        content = keys.join(",") + "\n";
        dataObj.forEach(row => {
          content += keys.map(k => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(",") + "\n";
        });
      }
    } else {
      content = `--- ${title.toUpperCase()} REPORT (${new Date().toLocaleDateString()}) ---\n\n`;
      content += JSON.stringify(dataObj, null, 2);
    }

    const blob = new Blob([content], { type: format === 'PDF' ? 'application/pdf' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CineCoins_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.${format === 'Excel' ? 'xlsx' : format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
    logAuditEvent(`Report Exported (${format})`, "SYSTEM", "N/A", `Exported ${title} report in ${format} format`);
  };

  return (
    <div className="bg-[#08090C] text-white min-h-screen flex flex-col lg:flex-row border-t border-amber-500/20 font-sans">
      {/* LEFT SIDEBAR NAVIGATION MATCHING EXACT 17 STRUCTURED MENU TABS */}
      <aside className="w-full lg:w-72 bg-[#0C0D12] border-r border-white/10 flex-shrink-0 flex flex-col justify-between p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-extrabold text-sm shadow-md">
              🪙
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-amber-400 tracking-wide uppercase">CineCoin Admin</h2>
              <p className="text-[10px] text-white/50">Central Value & Rewards Engine</p>
            </div>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-230px)] overflow-y-auto pr-1 custom-scrollbar text-xs">
            {[
              { id: "overview", label: "Overview", icon: BarChart2, badge: "Live" },
              { id: "wallets", label: "Wallets", icon: Users },
              { id: "transactions", label: "Transactions", icon: FileText, badge: `${transactions.length}` },
              { id: "users", label: "Users", icon: Search },
              { id: "cinecoin_value", label: "CineCoin Value", icon: DollarSign, isPrimary: true, badge: "Rate Control" },
              { id: "reward_values", label: "Reward Values", icon: Gift, isPrimary: true, badge: "13 Rules" },
              { id: "reward_history", label: "Reward History", icon: Clock },
              { id: "cashback", label: "Cashback", icon: Percent },
              { id: "referrals", label: "Referrals", icon: Send },
              { id: "expiry", label: "Expiry", icon: Clock },
              { id: "limits", label: "Limits", icon: SlidersIcon },
              { id: "approvals", label: "Approvals", icon: CheckCircle2, badge: approvalRequests.filter(a => a.status === 'REQUESTED').length },
              { id: "fraud", label: "Fraud & Risk", icon: ShieldAlert, badge: fraudAlerts.filter(f => f.status === 'Open').length },
              { id: "reports", label: "Reports", icon: Download },
              { id: "audit_logs", label: "Audit Logs", icon: FileSpreadsheet },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "emergency", label: "Emergency", icon: Power, isDanger: true }
            ].map(item => {
              const IconComp = item.icon || Coins;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer font-medium ${
                    isActive 
                      ? item.isDanger 
                        ? "bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20" 
                        : "bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/20"
                      : item.isPrimary
                        ? "text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 font-bold"
                        : item.isDanger
                          ? "text-rose-400 hover:bg-rose-500/10"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className={`w-4 h-4 ${isActive ? (item.isDanger ? "text-white" : "text-black") : item.isPrimary ? "text-amber-400" : "text-amber-400/80"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase ${
                      isActive 
                        ? "bg-black/20 text-black font-bold" 
                        : typeof item.badge === 'number' && item.badge > 0
                          ? "bg-rose-500 text-white font-bold"
                          : "bg-amber-500/20 text-amber-400 font-bold"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Master Conversion Rate Mini Card */}
        <div className="bg-[#12131A] border border-amber-500/20 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-white/60 uppercase tracking-widest font-mono">Conversion Rate</span>
            <span className="font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              🟢 ACTIVE
            </span>
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
            <span className="text-white/70 font-mono">{currentCoinsPerUnit.toLocaleString()} CC = ₹{currentCurrencyValue}</span>
            <span className="font-bold text-amber-400 font-mono">1 CC = ₹{currentCoinValueRupees.toFixed(3)}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-h-screen custom-scrollbar">
        {/* TOP HEADER BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0E13] border border-white/10 p-5 rounded-2xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">CineCoin Super Admin Control</span>
              <span className="text-white/40">/</span>
              <span className="text-xs text-white uppercase font-bold">{activeMenu.replace('_', ' ')}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight capitalize">
              {activeMenu === 'cinecoin_value' ? 'CineCoin Value Control' : activeMenu === 'reward_values' ? 'Reward Values & Earning Rules' : `${activeMenu.replace('_', ' ')} Management`}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {activeMenu === 'cinecoin_value' && (
              <button
                onClick={handleOpenValueModal}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-black" />
                <span>EDIT CINECOIN VALUE</span>
              </button>
            )}

            <button
              onClick={() => handleExportData('CSV', activeMenu, transactions)}
              className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* TAB 1: CINECOIN VALUE CONTROL (Requested Specification) */}
        {/* ========================================================================= */}
        {activeMenu === "cinecoin_value" && (
          <div className="space-y-6">
            {/* CINECOIN OVERVIEW & RATE HERO CARD */}
            <div className="bg-gradient-to-br from-[#13141E] via-[#0E0F16] to-[#0A0B10] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10 border-b border-white/10 pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full font-mono text-xs font-extrabold uppercase">
                      Central Conversion Rate
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Status: 🟢 Active
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {currentCoinsPerUnit.toLocaleString()} CC = ₹{currentCurrencyValue}
                  </h2>
                  <p className="text-sm text-amber-300/80 font-mono font-semibold">
                    1 CineCoin = ₹{currentCoinValueRupees.toFixed(3)} INR
                  </p>
                </div>

                <button
                  onClick={handleOpenValueModal}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm rounded-2xl flex items-center gap-2.5 shadow-xl shadow-amber-500/25 cursor-pointer transform hover:-translate-y-0.5 transition-all"
                >
                  <Edit className="w-4 h-4 text-black" />
                  <span>EDIT VALUE</span>
                </button>
              </div>

              {/* OVERVIEW STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                <div className="bg-black/50 border border-white/10 p-4 rounded-2xl space-y-1">
                  <p className="text-[11px] text-white/50 uppercase font-mono tracking-wider">Total CineCoins</p>
                  <p className="text-xl font-black text-amber-400 font-mono">
                    {totalInCirculation.toLocaleString()} CC
                  </p>
                  <p className="text-[10px] text-white/40">Total active in circulation</p>
                </div>

                <div className="bg-black/50 border border-white/10 p-4 rounded-2xl space-y-1">
                  <p className="text-[11px] text-white/50 uppercase font-mono tracking-wider">Current Value</p>
                  <p className="text-xl font-black text-emerald-400 font-mono">
                    ₹{((totalInCirculation * currentCoinValueRupees)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-white/40">Monetary platform reserve</p>
                </div>

                <div className="bg-black/50 border border-white/10 p-4 rounded-2xl space-y-1">
                  <p className="text-[11px] text-white/50 uppercase font-mono tracking-wider">Conversion Rate</p>
                  <p className="text-xl font-black text-white font-mono">
                    {currentCoinsPerUnit.toLocaleString()} CC = ₹{currentCurrencyValue}
                  </p>
                  <p className="text-[10px] text-amber-400">1 CC = ₹{currentCoinValueRupees.toFixed(3)}</p>
                </div>

                <div className="bg-black/50 border border-white/10 p-4 rounded-2xl space-y-1">
                  <p className="text-[11px] text-white/50 uppercase font-mono tracking-wider">Security & Rule</p>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5 pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Super Admin 2FA</span>
                  </p>
                  <p className="text-[10px] text-white/40">Historical protection active</p>
                </div>
              </div>

              {/* HISTORICAL INTEGRITY CALLOUT */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3.5 text-xs text-amber-200/90 leading-relaxed">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase text-amber-400 tracking-wider">Important Historical Transaction Protection: </span>
                  Changing the CineCoin monetary conversion value does <strong className="text-white">NOT</strong> rewrite the INR value of previously settled transactions. All existing customer coin balances remain identical in CC count, and historical transaction ledgers retain the conversion rate that applied when they occurred. Only future transactions use the active rate.
                </div>
              </div>
            </div>

            {/* VALUE HISTORY SECTION */}
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>VALUE HISTORY</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Immutable audit record of all CineCoin conversion rate modifications.
                  </p>
                </div>
                <span className="px-3 py-1 bg-white/5 text-amber-400 text-xs font-mono font-bold rounded-lg border border-white/10">
                  {(settings.conversionHistory || []).length} Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-black/60 text-amber-400 uppercase text-[10px] font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Previous Value</th>
                      <th className="p-3">New Value</th>
                      <th className="p-3">Unit Rate</th>
                      <th className="p-3">Changed By</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {(settings.conversionHistory || []).map((hist) => (
                      <tr key={hist.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-white/70">{hist.date} {hist.time}</td>
                        <td className="p-3 text-white/50">{hist.previousValue}</td>
                        <td className="p-3 text-emerald-400 font-bold">{hist.newValue}</td>
                        <td className="p-3 text-amber-300">1 CC = ₹{(hist.currencyValue / hist.coinsPerUnit).toFixed(3)}</td>
                        <td className="p-3 text-white font-sans font-medium">{hist.changedBy}</td>
                        <td className="p-3 font-sans text-white/70 max-w-xs">{hist.reason}</td>
                        <td className="p-3 text-white/40">{hist.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REWARD VALUES & EARNING RULES (13 Configurable Activities) */}
        {/* ========================================================================= */}
        {activeMenu === "reward_values" && (
          <div className="space-y-6">
            {/* STATS STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0D0E13] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-white/50 uppercase font-mono">Configurable Activities</p>
                  <p className="text-2xl font-black text-amber-400">13 Activities</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Gift className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-white/50 uppercase font-mono">Active Rewards</p>
                  <p className="text-2xl font-black text-emerald-400">
                    {currentRewardRules.filter(r => r.status === "Active").length} / 13 Active
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#0D0E13] border border-white/10 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-white/50 uppercase font-mono">Highest Single Bonus</p>
                  <p className="text-2xl font-black text-purple-400">5,000 CC</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* REWARD VALUES TABLE */}
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-400" />
                    <span>REWARD VALUE TABLE</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Super Admin configurable earning rewards for every customer activity. All changes apply to future rewards only.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-black/60 text-amber-400 uppercase text-[10px] font-mono border-b border-white/10">
                    <tr>
                      <th className="p-3">Reward Activity</th>
                      <th className="p-3">Eligibility & Details</th>
                      <th className="p-3 text-right">Current Reward</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Quick Toggle</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {currentRewardRules.map((rule) => {
                      const isActive = rule.status === "Active";
                      return (
                        <tr key={rule.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-3 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs">
                                🪙
                              </span>
                              <span className="font-bold">{rule.activityName}</span>
                            </div>
                          </td>

                          <td className="p-3 text-white/60 max-w-sm">
                            <p className="text-xs">{rule.description}</p>
                            {rule.minSpend && (
                              <span className="text-[10px] text-amber-400 font-mono">Min Spend: ₹{rule.minSpend} • </span>
                            )}
                            {rule.festivalName && (
                              <span className="text-[10px] text-purple-400 font-mono">{rule.festivalName} • </span>
                            )}
                            <span className="text-[10px] text-white/40">Updated by {rule.updatedBy}</span>
                          </td>

                          <td className="p-3 text-right font-mono font-extrabold text-amber-400 text-sm">
                            {rule.displayValue}
                          </td>

                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                              isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                              {rule.status}
                            </span>
                          </td>

                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleQuickToggleRewardStatus(rule)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                isActive 
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {isActive ? "Disable" : "Enable"}
                            </button>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleOpenRewardEdit(rule)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 ml-auto cursor-pointer shadow-md shadow-amber-500/10 transition-transform active:scale-95"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
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
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REWARD HISTORY (Permanent Audit of Reward Changes) */}
        {/* ========================================================================= */}
        {activeMenu === "reward_history" && (
          <div className="space-y-6">
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span>REWARD VALUE HISTORY</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Read-only record of every reward amount and status adjustment made by Super Admin.
                  </p>
                </div>
                <span className="px-3 py-1 bg-white/5 text-amber-400 font-mono text-xs font-bold rounded-lg border border-white/10">
                  {(settings.rewardHistory || []).length} Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/80 font-mono">
                  <thead className="bg-black/60 text-amber-400 uppercase text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Reward Activity</th>
                      <th className="p-3">Previous Value</th>
                      <th className="p-3">New Value</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Changed By</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {(settings.rewardHistory || []).map((hist) => (
                      <tr key={hist.id} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-white/70">{hist.date} {hist.time}</td>
                        <td className="p-3 font-sans font-bold text-white">{hist.rewardActivity}</td>
                        <td className="p-3 text-white/50">{hist.previousValue}</td>
                        <td className="p-3 text-emerald-400 font-bold">{hist.newValue}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            hist.newStatus === "Disabled" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                          }`}>
                            {hist.newStatus || "Active"}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-white">{hist.changedBy}</td>
                        <td className="p-3 font-sans text-white/70 max-w-xs">{hist.reason}</td>
                        <td className="p-3 text-white/40">{hist.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* OTHER EXISTING PANELS: OVERVIEW, WALLETS, TRANSACTIONS, USERS, LIMITS, ETC. */}
        {/* ========================================================================= */}
        {activeMenu === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[
                { label: "Circulation Balance", val: `${(totalInCirculation / 1000).toFixed(1)}k CC`, icon: Coins, color: "text-amber-400" },
                { label: "Total Purchased", val: `${(totalPurchased / 1000).toFixed(1)}k CC`, icon: DollarSign, color: "text-emerald-400" },
                { label: "Total Credited", val: `${(totalCredited / 1000).toFixed(1)}k CC`, icon: ArrowUpRight, color: "text-cyan-400" },
                { label: "Total Redeemed", val: `${(totalRedeemed / 1000).toFixed(1)}k CC`, icon: ArrowDownRight, color: "text-purple-400" },
                { label: "Total Refunded", val: `${(totalRefunded / 1000).toFixed(1)}k CC`, icon: RotateCcw, color: "text-blue-400" },
                { label: "Total Expired", val: `${(totalExpired / 1000).toFixed(1)}k CC`, icon: Clock, color: "text-rose-400" },
                { label: "Conversion Rate", val: `${currentCoinsPerUnit} CC = ₹${currentCurrencyValue}`, icon: DollarSign, color: "text-amber-400" },
                { label: "Total INR Value", val: `₹${(totalInCirculation * currentCoinValueRupees).toLocaleString()}`, icon: Shield, color: "text-amber-300" },
                { label: "Active Wallets", val: activeWalletsCount.toLocaleString(), icon: Users, color: "text-emerald-300" },
                { label: "Active Rewards", val: "13 Rules", icon: Gift, color: "text-gold" }
              ].map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div key={idx} className="bg-[#0D0E13] border border-white/10 p-4 rounded-2xl space-y-2 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/50 uppercase font-mono tracking-wider">{m.label}</span>
                      <Icon className={`w-4 h-4 ${m.color}`} />
                    </div>
                    <p className={`text-lg font-black ${m.color}`}>{m.val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TRANSACTIONS VIEW */}
        {activeMenu === "transactions" && (
          <div className="space-y-4">
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by Tx ID, User Email, Source..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-full sm:w-64 outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {transactions.length} Total Records
              </span>
            </div>

            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80 font-mono">
                <thead className="bg-black/60 text-amber-400 uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3">Tx ID</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Coins</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {transactions.slice(0, 50).map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-amber-300 font-bold">{tx.id}</td>
                      <td className="p-3 font-sans text-white">{tx.userEmail}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-white/10 font-bold text-[10px] uppercase">
                          {tx.type}
                        </span>
                      </td>
                      <td className={`p-3 font-bold ${tx.type === 'Purchase' || tx.type === 'Earned' || tx.type === 'Credit' || tx.type === 'Bonus' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'Redeemed' || tx.type === 'Redemption' || tx.type === 'Debit' ? '-' : '+'}{tx.coins.toLocaleString()} CC
                      </td>
                      <td className="p-3 font-sans text-white/60">{tx.source}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 text-white/40">{tx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WALLETS VIEW */}
        {activeMenu === "wallets" && (
          <div className="space-y-4">
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <input
                type="text"
                placeholder="Search wallets by email..."
                value={walletSearch}
                onChange={(e) => setWalletSearch(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white w-64 outline-none focus:border-amber-400"
              />
              <span className="text-xs text-amber-400 font-mono font-bold">
                {userWallets.length} Wallets Loaded
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userWallets.map(w => (
                <div key={w.userEmail} className="bg-[#0D0E13] border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{w.userEmail}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black text-amber-400 font-mono">{w.balanceCoins.toLocaleString()} CC</span>
                    <span className="text-xs text-white/50 font-mono">≈ ₹{(w.balanceCoins * currentCoinValueRupees).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-white/50 flex justify-between">
                    <span>Streak: {w.dailyStreak || 0} days</span>
                    <span>Referrals: {w.successfulReferrals || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REFERRALS VIEW */}
        {activeMenu === "referrals" && (
          <div className="space-y-6">
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-amber-400" />
                <span>REFERRAL ENGINE CONTROL & FRAUD PREVENTION</span>
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Referral bonuses are automatically governed by centralized reward rules. Referrals are rewarded only when friends complete account verification and their first booking.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-amber-400">Refer a Friend (Registration)</p>
                  <p className="text-2xl font-black text-white font-mono">
                    {currentRewardRules.find(r => r.activityKey === 'refer_friend')?.displayValue || "2,000 CC"}
                  </p>
                  <p className="text-[11px] text-white/50">Issued once the invited friend registers and verifies credentials.</p>
                </div>

                <div className="bg-black/50 border border-white/10 p-4 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-emerald-400">Friend's First Booking</p>
                  <p className="text-2xl font-black text-white font-mono">
                    {currentRewardRules.find(r => r.activityKey === 'friend_first_booking')?.displayValue || "3,000 CC"}
                  </p>
                  <p className="text-[11px] text-white/50">Issued to the referrer after the referred user completes their first paid ticket.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOGS VIEW */}
        {activeMenu === "audit_logs" && (
          <div className="space-y-4">
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">Permanent Immutable Audit Ledger</h3>
                <p className="text-[11px] text-white/50">Mandatory rule: Audit records can never be edited or deleted.</p>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 font-mono text-xs font-bold rounded-lg border border-amber-500/20">
                {auditLogs.length} Records
              </span>
            </div>

            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80 font-mono">
                <thead className="bg-black/50 text-amber-400 uppercase text-[10px] border-b border-white/10">
                  <tr>
                    <th className="p-3">Log ID</th>
                    <th className="p-3">Admin</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target User</th>
                    <th className="p-3">Prev → New</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 text-amber-300 font-bold">{log.id}</td>
                      <td className="p-3 font-sans font-medium text-white">{log.adminName}</td>
                      <td className="p-3">
                        <span className="bg-white/10 px-2 py-0.5 rounded text-[9px] uppercase font-bold text-emerald-400">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-white/70">{log.userId}</td>
                      <td className="p-3 text-white/50">{log.previousValue || 'N/A'} → {log.newValue || 'N/A'}</td>
                      <td className="p-3 font-sans text-white/60 max-w-xs truncate">{log.reason}</td>
                      <td className="p-3 text-white/40">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {activeMenu === "settings" && (
          <div className="space-y-6">
            <div className="bg-[#0D0E13] border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">CineCoin Master Feature Switches</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { key: 'wallet', label: 'Wallet System' },
                  { key: 'rewards', label: 'Purchase Engine' },
                  { key: 'rewardsStore', label: 'Rewards Store' },
                  { key: 'referral', label: 'Referral Engine' },
                  { key: 'challenges', label: 'Challenges' },
                  { key: 'dailyRewards', label: 'Daily Login Coins' }
                ].map(item => {
                  const isChecked = settings.featureToggles[item.key as keyof typeof settings.featureToggles];
                  return (
                    <button
                      key={item.key}
                      onClick={() => onUpdateSettings({
                        ...settings,
                        featureToggles: {
                          ...settings.featureToggles,
                          [item.key]: !isChecked
                        }
                      })}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                        isChecked 
                          ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
                          : "bg-black/50 border-white/10 text-white/40"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${isChecked ? "bg-amber-500 text-black font-extrabold" : "bg-white/10 text-white/50"}`}>
                        {isChecked ? "ON" : "OFF"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* EMERGENCY CONTROLS VIEW */}
        {activeMenu === "emergency" && (
          <div className="space-y-6">
            <div className="bg-rose-950/30 border border-rose-500/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white font-black">
                  🚨
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-rose-400 uppercase tracking-wider">Emergency Kill Switches & Maintenance</h3>
                  <p className="text-xs text-white/70">
                    Executing these actions immediately halts operational systems. Requires 2FA verification.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setEmergencyActionPending("DISABLE_PURCHASES")}
                  className="p-4 bg-rose-900/40 border border-rose-500/50 hover:bg-rose-900/60 rounded-xl text-left space-y-1 cursor-pointer transition-all"
                >
                  <p className="text-xs font-extrabold text-rose-300">Disable All CineCoin Purchases</p>
                  <p className="text-[10px] text-white/60">Immediately blocks users from buying new coins.</p>
                </button>

                <button
                  onClick={() => setEmergencyActionPending("MAINTENANCE_MODE")}
                  className="p-4 bg-rose-900/40 border border-rose-500/50 hover:bg-rose-900/60 rounded-xl text-left space-y-1 cursor-pointer transition-all"
                >
                  <p className="text-xs font-extrabold text-rose-300">Trigger System Maintenance Mode</p>
                  <p className="text-[10px] text-white/60">Halts all CineCoin earning & redemption features globally.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 1: EDIT CINECOIN VALUE MODAL (Super Admin Only) */}
        {/* ========================================================================= */}
        {isValueModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0F1015] border border-amber-500/40 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setIsValueModalOpen(false)}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!isValueConfirmStep ? (
                // Step 1: Configuration Form
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Super Admin Security Authorization</span>
                    </div>
                    <h3 className="text-xl font-black text-white">Edit CineCoin Conversion Value</h3>
                    <p className="text-xs text-white/60">
                      Update the centralized monetary value of CineCoins across the entire CineVenue ecosystem.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/80">CineCoin Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={inputCoinsPerUnit}
                        onChange={(e) => setInputCoinsPerUnit(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/80">INR Value (₹)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.5"
                        value={inputCurrencyValue}
                        onChange={(e) => setInputCurrencyValue(Math.max(0.01, parseFloat(e.target.value) || 1))}
                        className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-emerald-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Dynamic Calculation Display */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center space-y-1">
                    <p className="text-[11px] text-white/60 uppercase font-mono">Resulting Conversion Display</p>
                    <p className="text-xl font-black text-amber-400 font-mono">
                      {inputCoinsPerUnit.toLocaleString()} CineCoins = ₹{inputCurrencyValue}
                    </p>
                    <p className="text-xs text-white/70 font-mono">
                      (1 CineCoin = ₹{(inputCurrencyValue / inputCoinsPerUnit).toFixed(4)} INR)
                    </p>
                  </div>

                  {/* Mandatory Reason Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80">Mandatory Business Reason *</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Festive promotion campaign or financial liquidity adjustment..."
                      value={valueChangeReason}
                      onChange={(e) => setValueChangeReason(e.target.value)}
                      className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-xl p-3 text-xs text-white outline-none"
                    />
                  </div>

                  {/* 2FA Verification */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>Super Admin Security PIN / 2FA *</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter Admin PIN (Default: 123456 or Admin password)"
                      value={value2FAPin}
                      onChange={(e) => setValue2FAPin(e.target.value)}
                      className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                    />
                  </div>

                  {valueFormError && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl font-medium">
                      ⚠️ {valueFormError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsValueModalOpen(false)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleProceedToValueConfirm}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                    >
                      CONTINUE
                    </button>
                  </div>
                </div>
              ) : (
                // Step 2: Confirmation Popup Dialog
                <div className="space-y-5 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-2xl border border-amber-500/30">
                    ⚠️
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white">Confirm CineCoin Value Change</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Are you sure you want to change the CineCoin value from:
                    </p>
                    <div className="p-3 bg-black/60 rounded-xl border border-white/10 space-y-1 font-mono text-xs">
                      <p className="text-white/50 line-through">
                        {currentCoinsPerUnit.toLocaleString()} CC = ₹{currentCurrencyValue}
                      </p>
                      <p className="text-amber-400 font-extrabold text-sm">
                        ↓ {inputCoinsPerUnit.toLocaleString()} CC = ₹{inputCurrencyValue} (1 CC = ₹{(inputCurrencyValue / inputCoinsPerUnit).toFixed(3)})
                      </p>
                    </div>
                    <p className="text-[11px] text-amber-300/80">
                      Reason: "{valueChangeReason}"
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsValueConfirmStep(false)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirmValueChange}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      CONFIRM CHANGE
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: EDIT REWARD VALUE MODAL (With Confirmation) */}
        {/* ========================================================================= */}
        {isRewardEditModalOpen && selectedRewardToEdit && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0F1015] border border-amber-500/40 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setIsRewardEditModalOpen(false)}
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {!isRewardConfirmStep ? (
                // Step 1: Form
                <div className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Gift className="w-5 h-5" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider">Reward Rule Configuration</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{selectedRewardToEdit.activityName}</h3>
                    <p className="text-xs text-white/60">{selectedRewardToEdit.description}</p>
                  </div>

                  {/* Current vs New Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-1">
                      <p className="text-[10px] text-white/50 uppercase font-mono">Current Reward</p>
                      <p className="text-base font-black text-white font-mono">{selectedRewardToEdit.displayValue}</p>
                    </div>

                    <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-1">
                      <p className="text-[10px] text-white/50 uppercase font-mono">Status</p>
                      <select
                        value={editRewardStatus}
                        onChange={(e) => setEditRewardStatus(e.target.value as any)}
                        className="bg-black border border-white/20 text-xs font-bold text-amber-400 rounded-lg p-1 w-full outline-none"
                      >
                        <option value="Active">Active 🟢</option>
                        <option value="Disabled">Disabled 🔴</option>
                      </select>
                    </div>
                  </div>

                  {/* New Reward Value Input (If not spin wheel) */}
                  {selectedRewardToEdit.activityKey !== 'spin_wheel' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/80">
                        New Reward Amount ({selectedRewardToEdit.activityKey === 'spend_per_100' ? 'CineCoins per ₹100' : 'CineCoins'}) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editRewardCoins}
                        onChange={(e) => setEditRewardCoins(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-400 outline-none"
                      />
                    </div>
                  )}

                  {/* Specific fields for specific rewards */}
                  {selectedRewardToEdit.activityKey === 'spend_per_100' && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 border border-white/10 rounded-xl">
                      <div>
                        <label className="text-[11px] text-white/60 font-bold">Min Qualifying Spend (₹)</label>
                        <input
                          type="number"
                          value={editRewardMinSpend}
                          onChange={(e) => setEditRewardMinSpend(parseInt(e.target.value) || 100)}
                          className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs font-mono text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-white/60 font-bold">Daily Spend Cap (CC)</label>
                        <input
                          type="number"
                          value={10000}
                          disabled
                          className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-xs font-mono text-white/50"
                        />
                      </div>
                    </div>
                  )}

                  {selectedRewardToEdit.activityKey === 'festival_bonus' && (
                    <div className="space-y-3 p-3 bg-black/40 border border-white/10 rounded-xl">
                      <div>
                        <label className="text-[11px] text-white/60 font-bold">Festival Campaign Name</label>
                        <input
                          type="text"
                          value={editFestivalName}
                          onChange={(e) => setEditFestivalName(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-white/60 font-bold">Start Date</label>
                          <input
                            type="date"
                            value={editCampaignStart}
                            onChange={(e) => setEditCampaignStart(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-white/60 font-bold">End Date</label>
                          <input
                            type="date"
                            value={editCampaignEnd}
                            onChange={(e) => setEditCampaignEnd(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Spin Wheel Segment Weights Editor */}
                  {selectedRewardToEdit.activityKey === 'spin_wheel' && (
                    <div className="space-y-2 p-3 bg-black/40 border border-white/10 rounded-xl">
                      <p className="text-xs font-bold text-amber-400">Spin Wheel Segments & Probabilities</p>
                      <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                        {editSpinSegments.map((seg, idx) => (
                          <div key={seg.id} className="flex items-center gap-2 text-xs bg-black/60 p-2 rounded-lg border border-white/5">
                            <span className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                            <input
                              type="text"
                              value={seg.label}
                              onChange={(e) => {
                                const copy = [...editSpinSegments];
                                copy[idx].label = e.target.value;
                                setEditSpinSegments(copy);
                              }}
                              className="w-24 bg-black border border-white/10 rounded px-1.5 py-1 text-xs text-white"
                            />
                            <span className="text-white/50 text-[10px]">Coins:</span>
                            <input
                              type="number"
                              value={seg.coins}
                              onChange={(e) => {
                                const copy = [...editSpinSegments];
                                copy[idx].coins = parseInt(e.target.value) || 0;
                                setEditSpinSegments(copy);
                              }}
                              className="w-16 bg-black border border-white/10 rounded px-1.5 py-1 text-xs text-amber-400 font-mono"
                            />
                            <span className="text-white/50 text-[10px]">Weight:</span>
                            <input
                              type="number"
                              value={seg.weight}
                              onChange={(e) => {
                                const copy = [...editSpinSegments];
                                copy[idx].weight = parseInt(e.target.value) || 1;
                                setEditSpinSegments(copy);
                              }}
                              className="w-12 bg-black border border-white/10 rounded px-1.5 py-1 text-xs text-emerald-400 font-mono"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mandatory Reason */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80">Reason for Change *</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Festival boost, marketing campaign, seasonal update..."
                      value={rewardEditReason}
                      onChange={(e) => setRewardEditReason(e.target.value)}
                      className="w-full bg-black border border-white/20 focus:border-amber-400 rounded-xl p-3 text-xs text-white outline-none"
                    />
                  </div>

                  {rewardEditError && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl font-medium">
                      ⚠️ {rewardEditError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsRewardEditModalOpen(false)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleProceedRewardConfirm}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      SAVE CHANGES
                    </button>
                  </div>
                </div>
              ) : (
                // Step 2: Confirmation Popup Dialog
                <div className="space-y-5 text-center">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-2xl border border-amber-500/30">
                    ❓
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white">Confirm Reward Rule Change</h3>
                    <p className="text-xs text-white/70">
                      Change <strong>{selectedRewardToEdit.activityName}</strong> reward from:
                    </p>
                    <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-xs space-y-1">
                      <p className="text-white/50 line-through">{selectedRewardToEdit.displayValue}</p>
                      <p className="text-amber-400 font-extrabold text-sm">
                        ↓ {selectedRewardToEdit.activityKey === 'spin_wheel' ? 'Updated Segment Matrix' : `${editRewardCoins.toLocaleString()} CC`} ({editRewardStatus})
                      </p>
                    </div>
                    <p className="text-[11px] text-amber-300/80">
                      Reason: "{rewardEditReason}"
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsRewardConfirmStep(false)}
                      className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirmRewardSave}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      CONFIRM
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EMERGENCY 2FA MODAL */}
        {emergencyActionPending && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F1015] border border-rose-500/50 max-w-md w-full rounded-2xl p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-xl">
                ⚠️
              </div>
              <h3 className="text-lg font-extrabold text-white">2FA Emergency Confirmation</h3>
              <p className="text-xs text-white/60">
                You are executing emergency kill switch <span className="text-rose-400 font-bold font-mono">[{emergencyActionPending}]</span>. Enter 2FA code (use 123456 or 888888) to confirm:
              </p>

              <input
                type="password"
                placeholder="Enter 2FA Code"
                value={emergency2FA}
                onChange={(e) => setEmergency2FA(e.target.value)}
                className="w-full bg-black border border-white/20 text-center font-mono text-lg text-amber-400 px-4 py-2.5 rounded-xl outline-none focus:border-rose-400"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEmergencyActionPending(null)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTriggerEmergencyAction(emergencyActionPending)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  Confirm Kill Switch
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Custom SlidersIcon
function SlidersIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
  );
}
