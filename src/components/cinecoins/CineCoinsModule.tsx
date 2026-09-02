import React, { useState, useEffect } from "react";
import { 
  Coins, Gift, Award, Shield, Trophy, Zap, Share2, Sparkles, 
  Calendar, RotateCw, CheckCircle, ChevronRight, Copy, Check, 
  Filter, Search, AlertCircle, ArrowUpRight, ArrowDownRight, 
  Crown, Star, HelpCircle, FileText, Smartphone, Lock, Wallet, Flame,
  Bell, Send, CreditCard, Tag, Clock, UserCheck, Smile, Percent,
  Play, CheckSquare, Settings, Activity, ShieldAlert
} from "lucide-react";
import CineVenueLogo from "../CineVenueLogo";
import { 
  CineCoinsSettings, CineCoinsReward, CineCoinsChallenge, 
  CineCoinsTransaction, CineCoinsUserWallet 
} from "../../types";

interface CineCoinsModuleProps {
  userEmail: string | null;
  onOpenAuth: () => void;
  settings: CineCoinsSettings;
  rewards: CineCoinsReward[];
  challenges: CineCoinsChallenge[];
  transactions: CineCoinsTransaction[];
  userWallet: CineCoinsUserWallet;
  onUpdateWallet: (wallet: CineCoinsUserWallet) => void;
  onAddTransaction: (tx: CineCoinsTransaction) => void;
  onClose?: () => void;
}

export default function CineCoinsModule({
  userEmail,
  onOpenAuth,
  settings,
  rewards,
  challenges,
  transactions,
  userWallet,
  onUpdateWallet,
  onAddTransaction,
  onClose
}: CineCoinsModuleProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "wallet" | "earn" | "daily" | "spin" | "refer" | "buy" | "send" | "use" | "store" | "transactions" | "expiring" | "achievements" | "notifications" | "settings" | "faq"
  >("dashboard");

  // UI Local States
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string>("All");
  const [txFilter, setTxFilter] = useState<string>("All");
  const [txSearch, setTxSearch] = useState<string>("");

  // Spin Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spunResult, setSpunResult] = useState<string | null>(null);

  // Scratch Card State
  const [scratched, setScratched] = useState(false);
  const [scratchReward, setScratchReward] = useState<number>(0);

  // Modals State
  const [selectedRewardToClaim, setSelectedRewardToClaim] = useState<CineCoinsReward | null>(null);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  // Buy Coins Modal / State
  const [buyPackAmountRs, setBuyPackAmountRs] = useState<number>(500);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);
  const [buySuccessMsg, setBuySuccessMsg] = useState<string | null>(null);

  // Send Coins P2P State
  const [sendRecipient, setSendRecipient] = useState<string>("");
  const [sendCoinsAmount, setSendCoinsAmount] = useState<number>(100);
  const [sendOtpStep, setSendOtpStep] = useState(false);
  const [sendOtpInput, setSendOtpInput] = useState<string>("");
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);

  // Profile Completion local state
  const [profileName, setProfileName] = useState<string>("CineVenue Member");
  const [profileDob, setProfileDob] = useState<string>(userWallet?.dob || "1998-08-15");
  const [profileMobile, setProfileMobile] = useState<string>("+91 98765 43210");

  // Security Settings
  const [txPin, setTxPin] = useState<string>(userWallet?.transactionPin || "1234");
  const [newTxPin, setNewTxPin] = useState<string>("");
  const [pinUpdateSuccess, setPinUpdateSuccess] = useState<boolean>(false);

  // Calculations
  const coinsPerUnit = settings?.coinsPerUnit || 1000;
  const currencyValue = settings?.currencyValue || 10;
  const coinValue = settings?.coinValueRupees || (currencyValue / coinsPerUnit) || 0.01;
  const currentCoins = userWallet?.balanceCoins ?? 0;
  const lockedCoins = userWallet?.lockedBalance ?? 0;
  const availableBalance = currentCoins - lockedCoins;
  const walletValueRs = (currentCoins * coinValue).toFixed(2);
  const toggles = settings?.featureToggles || {
    wallet: true,
    earnCoins: true,
    dailyRewards: true,
    dailySpin: true,
    referral: true,
    buyCoins: true,
    sendCoins: true,
    rewardsStore: true,
    challenges: true,
    leaderboard: true,
    transactions: true
  };

  // Dynamic Rule Lookups
  const dailyLoginRule = settings?.rewardRules?.find(r => r.activityKey === "daily_login");
  const dailyLoginAmount = (dailyLoginRule && dailyLoginRule.status === "Active") ? dailyLoginRule.rewardCoins : (settings?.earnRules?.dailyLoginCoins || 100);

  const spinWheelRule = settings?.rewardRules?.find(r => r.activityKey === "spin_wheel");
  const referFriendRule = settings?.rewardRules?.find(r => r.activityKey === "refer_friend");
  const referFriendAmount = (referFriendRule && referFriendRule.status === "Active") ? referFriendRule.rewardCoins : (settings?.earnRules?.referralBonusCoins || 2000);

  const profileRule = settings?.rewardRules?.find(r => r.activityKey === "profile_completion");
  const profileAmount = (profileRule && profileRule.status === "Active") ? profileRule.rewardCoins : (settings?.earnRules?.profileCompleteCoins || 500);

  const firstMovieRule = settings?.rewardRules?.find(r => r.activityKey === "first_movie_booking");
  const firstMovieAmount = (firstMovieRule && firstMovieRule.status === "Active") ? firstMovieRule.rewardCoins : 2000;

  const birthdayRule = settings?.rewardRules?.find(r => r.activityKey === "birthday_bonus");
  const birthdayAmount = (birthdayRule && birthdayRule.status === "Active") ? birthdayRule.rewardCoins : (settings?.earnRules?.birthdayCoins || 5000);

  const getRuleDisplay = (key: string, fallback: string) => {
    const rule = settings?.rewardRules?.find(r => r.activityKey === key);
    if (!rule) return fallback;
    if (rule.status !== "Active") return "Disabled";
    return rule.displayValue || fallback;
  };


  // Centralized Reward Engine Validator
  const executeReward = (
    amountCoins: number,
    type: CineCoinsTransaction['type'],
    source: string,
    description?: string
  ): boolean => {
    if (userWallet?.isFrozen || userWallet?.status === "Frozen") {
      alert("⚠️ Your CineCoin Wallet is currently FROZEN. Please un-freeze your wallet under CineCoin Settings to perform transactions.");
      return false;
    }

    const newBalance = (userWallet?.balanceCoins || 0) + amountCoins;
    const currentLifetime = userWallet?.lifetimeEarned || 0;
    const newLifetime = amountCoins > 0 ? currentLifetime + amountCoins : currentLifetime;

    const updatedWallet: CineCoinsUserWallet = {
      ...userWallet,
      balanceCoins: newBalance,
      lifetimeEarned: newLifetime,
      notifications: [
        {
          id: "NOTIF-" + Date.now(),
          title: `🎉 ${amountCoins > 0 ? "Earned" : "Deducted"} ${Math.abs(amountCoins)} CineCoins!`,
          message: source,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: type
        },
        ...(userWallet?.notifications || [])
      ]
    };

    onUpdateWallet(updatedWallet);

    onAddTransaction({
      id: "TXN-" + Math.floor(100000 + Math.random() * 900000),
      userEmail: userEmail || "member@cinevenue.com",
      type: type,
      coins: Math.abs(amountCoins),
      amountRupees: Math.abs(amountCoins) * coinValue,
      previousBalance: userWallet.balanceCoins,
      newBalance: newBalance,
      source: source,
      reason: description,
      status: "Completed",
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    });

    return true;
  };

  if (!settings.isEnabled) {
    return (
      <div className="min-h-screen bg-[#08080A] flex items-center justify-center p-6 text-center text-white font-sans">
        <div className="max-w-md bg-[#111115] border border-white/10 rounded-3xl p-8 space-y-4 shadow-2xl">
          <Coins className="w-12 h-12 text-gold mx-auto opacity-50" />
          <h2 className="text-xl font-bold">CineCoins System Paused</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            The CineCoins Rewards & Wallet System is currently under scheduled maintenance. Please check back shortly!
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-6 py-2.5 bg-gold text-black font-extrabold text-xs rounded-xl hover:bg-gold-light"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Handle Spin Wheel (Determined by admin weighted logic)
  const handleSpinWheel = async () => {
    if (isSpinning) return;
    if (userWallet.isFrozen) {
      alert("⚠️ Your CineCoin Wallet is currently FROZEN. Unfreeze in Settings to spin!");
      return;
    }
    
    // Check if already spun today (simulated in frontend via lastSpinDate which we can store in state or assume done)
    if (userWallet.lastSpinDate === new Date().toLocaleDateString()) {
       alert("You've already used your 1 Free Spin for today!");
       return;
    }
    
    setIsSpinning(true);
    setSpunResult(null);

    const activeSegments = (spinWheelRule?.spinSegments && spinWheelRule.spinSegments.length > 0)
      ? spinWheelRule.spinSegments
      : [
          { id: "s1", label: "100 CC", coins: 100, weight: 30, color: "#F59E0B" },
          { id: "s2", label: "200 CC", coins: 200, weight: 25, color: "#10B981" },
          { id: "s3", label: "500 CC", coins: 500, weight: 15, color: "#6366F1" },
          { id: "s4", label: "1,000 CC", coins: 1000, weight: 10, color: "#EC4899" },
          { id: "s5", label: "2,000 CC", coins: 2000, weight: 5, color: "#EAB308" },
          { id: "s6", label: "Try Again", coins: 0, weight: 15, color: "#6B7280" }
        ];

    let serverWonCoins = 100;
    let targetIndex = 0;

    // Offline weighted logic based on Admin settings
    const totalWeight = activeSegments.reduce((sum, seg) => sum + seg.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < activeSegments.length; i++) {
      if (randomNum < activeSegments[i].weight) {
        targetIndex = i;
        break;
      }
      randomNum -= activeSegments[i].weight;
    }
    serverWonCoins = activeSegments[targetIndex].coins;

    const extraRounds = 6;
    // Simple rotation similar to old code
    const newRotation = wheelRotation + 360 * extraRounds + (targetIndex * (360 / activeSegments.length));
    setWheelRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setSpunResult(serverWonCoins > 0 ? `🎉 Congratulations! You won ${serverWonCoins} CineCoins!` : "Better luck next time! Spin again tomorrow.");
      if (serverWonCoins > 0) {
        const success = executeReward(serverWonCoins, "Earned", "Daily Spin & Win Wheel Prize");
        if (success) {
           onUpdateWallet({
             ...userWallet,
             balanceCoins: (userWallet.balanceCoins || 0) + serverWonCoins,
             lifetimeEarned: (userWallet.lifetimeEarned || 0) + serverWonCoins,
             lastSpinDate: new Date().toLocaleDateString(),
             notifications: [
                {
                  id: "NOTIF-" + Date.now(),
                  title: `🎉 Earned ${serverWonCoins} CineCoins!`,
                  message: "Daily Spin & Win Wheel Prize",
                  date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  read: false,
                  type: "Earned" as const
                },
                ...(userWallet.notifications || [])
             ]
           });
        }
      } else {
         onUpdateWallet({
           ...userWallet,
           lastSpinDate: new Date().toLocaleDateString()
         });
      }
    }, 3500);
  };

  // Handle Daily Checkin with Frontend Validation
  const handleClaimDailyCheckin = async () => {
    if (dailyLoginRule && dailyLoginRule.status === "Disabled") {
      alert("Daily login rewards are currently disabled by the Super Admin.");
      return;
    }

    if (userWallet.lastLoginDate === new Date().toLocaleDateString()) {
      alert("Daily reward already claimed for today!");
      return;
    }

    const nextStreak = userWallet.dailyStreak + 1;
    let bonusReward = 0;
    if (nextStreak % 7 === 0) bonusReward = 50;
    else if (nextStreak % 4 === 0) bonusReward = 20;
    
    const totalReward = dailyLoginAmount + bonusReward;

    const sourceDesc = `Daily Login Reward (Day ${nextStreak} Streak: +${dailyLoginAmount} CC base ${bonusReward > 0 ? `+${bonusReward} CC Streak Milestone Bonus` : ""})`;
    const success = executeReward(totalReward, "Earned", sourceDesc);
    if (success) {
      // We must manually trigger the wallet update again but preserve the notifications added by executeReward
      const updatedNotifications = [
        {
          id: "NOTIF-" + Date.now(),
          title: `🎉 Earned ${totalReward} CineCoins!`,
          message: sourceDesc,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
          type: "Earned" as const
        },
        ...(userWallet?.notifications || [])
      ];

      const newBalance = (userWallet?.balanceCoins || 0) + totalReward;
      const newLifetime = (userWallet?.lifetimeEarned || 0) + totalReward;

      const updatedWallet: CineCoinsUserWallet = {
        ...userWallet,
        balanceCoins: newBalance,
        lifetimeEarned: newLifetime,
        notifications: updatedNotifications,
        dailyStreak: nextStreak,
        lastLoginDate: new Date().toLocaleDateString()
      };
      onUpdateWallet(updatedWallet);
    }
  };

  // Handle Scratch Card
  const handleScratch = () => {
    if (scratched) return;
    const win = Math.floor(Math.random() * 150) + 50;
    setScratchReward(win);
    setScratched(true);
    executeReward(win, "Earned", "Mystery Scratch Card Reward");
  };

  // Handle Buy CineCoins
  const handleConfirmBuyCoins = () => {
    setIsProcessingBuy(true);
    setTimeout(() => {
      const purchasedCoins = Math.round(buyPackAmountRs / coinValue);
      setIsProcessingBuy(false);
      executeReward(purchasedCoins, "Purchase", `Purchased CineCoins Package (₹${buyPackAmountRs})`);
      setBuySuccessMsg(`✓ Payment Successful! ${purchasedCoins} CineCoins credited instantly!`);
      setTimeout(() => setBuySuccessMsg(null), 4000);
    }, 1500);
  };

  // Handle Send CineCoins
  const handleInitiateSend = () => {
    if (!sendRecipient || sendCoinsAmount <= 0) {
      alert("Please enter a valid recipient email/phone and amount of coins.");
      return;
    }
    if (sendCoinsAmount > availableBalance) {
      alert(`Insufficient available balance! You have ${availableBalance} available CC.`);
      return;
    }
    setSendOtpStep(true);
  };

  const handleConfirmSendOtp = () => {
    if (sendOtpInput.length < 4) {
      alert("Please enter the 4-digit security OTP sent to your registered mobile.");
      return;
    }
    const transferFee = Math.round(sendCoinsAmount * 0.02); // 2% transfer fee
    const totalDeduct = sendCoinsAmount + transferFee;

    if (totalDeduct > userWallet.balanceCoins) {
      alert("Insufficient total coins to cover transfer fee.");
      return;
    }

    const success = executeReward(-totalDeduct, "Transfer Sent", `Sent ${sendCoinsAmount} CC to ${sendRecipient} (Fee: ${transferFee} CC)`);
    if (success) {
      setSendSuccessMsg(`✓ Successfully transferred ${sendCoinsAmount} CineCoins to ${sendRecipient}!`);
      setSendOtpStep(false);
      setSendRecipient("");
      setSendCoinsAmount(100);
      setSendOtpInput("");
      setTimeout(() => setSendSuccessMsg(null), 5000);
    }
  };

  // Toggle Wallet Freeze
  const handleToggleFreezeWallet = () => {
    const nextFreezeState = !userWallet.isFrozen;
    const updated: CineCoinsUserWallet = {
      ...userWallet,
      isFrozen: nextFreezeState,
      status: nextFreezeState ? "Frozen" : "Active"
    };
    onUpdateWallet(updated);
    alert(nextFreezeState ? "🔒 Your CineCoin Wallet is now FROZEN. All purchases, transfers, and redemptions are locked." : "🔓 Your CineCoin Wallet is now UN-FROZEN and fully active.");
  };

  // Claim Reward Voucher
  const handleConfirmClaimReward = () => {
    if (!selectedRewardToClaim) return;
    if ((userWallet?.balanceCoins || 0) < selectedRewardToClaim.coinPrice) {
      alert(`Insufficient CineCoins balance! You need ${selectedRewardToClaim.coinPrice} CineCoins.`);
      return;
    }

    const success = executeReward(-selectedRewardToClaim.coinPrice, "Redeemed", `Redeemed Voucher: ${selectedRewardToClaim.title}`);
    if (success) {
      const currentClaimed = userWallet?.claimedRewards || [];
      const updatedWallet: CineCoinsUserWallet = {
        ...userWallet,
        balanceCoins: (userWallet?.balanceCoins || 0) - selectedRewardToClaim.coinPrice,
        claimedRewards: [...currentClaimed, selectedRewardToClaim.id]
      };
      onUpdateWallet(updatedWallet);
      setClaimSuccessMessage(`✓ Voucher Unlocked! Promo Code: ${selectedRewardToClaim.couponCode || "CINEPASS2026"}`);
      setTimeout(() => {
        setSelectedRewardToClaim(null);
        setClaimSuccessMessage(null);
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-text-primary font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0B0B0E]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CineVenueLogo size="md" onClick={() => window.location.href = "/"} />
            <div className="h-6 w-[1px] bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 bg-[#1A1408] border border-amber-500/40 px-3.5 py-1.5 rounded-full shadow-inner">
              <span className="text-xs font-bold text-gold">🪙</span>
              <span className="text-xs font-extrabold text-gold uppercase tracking-wider">CINECOIN REWARDS & WALLET</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Balance Badge */}
            <div 
              onClick={() => setActiveTab("wallet")}
              className="flex items-center gap-3 bg-[#111115] border border-gold/30 hover:border-gold/60 px-4 py-1.5 rounded-xl shadow-lg shadow-gold/5 cursor-pointer transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-extrabold text-sm shadow">
                🪙
              </div>
              <div className="text-left">
                <div className="text-[9px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                  <span>BALANCE</span>
                  {userWallet?.isFrozen && <span className="text-rose-400 font-extrabold">(FROZEN)</span>}
                </div>
                <div className="text-xs font-black text-gold font-mono flex items-center gap-1.5">
                  <span>{(userWallet?.balanceCoins || 6915).toLocaleString()} {settings?.coinSymbol || "CC"}</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">(≈ ₹{walletValueRs})</span>
                </div>
              </div>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl text-text-muted hover:text-white hover:border-gold/40 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black font-black text-[9px] rounded-full flex items-center justify-center">
                {userWallet.notifications?.filter(n => !n.read).length || 4}
              </span>
            </button>

            {/* User Badge */}
            <div className="flex items-center gap-2 bg-[#111115] border border-white/10 px-3.5 py-2 rounded-xl text-xs">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span>👑</span> Member
              </span>
              <span className="text-text-muted">|</span>
              <span className="text-white font-medium max-w-[120px] truncate">
                {userEmail ? userEmail.split("@")[0] : "superadmin"}
              </span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-text-muted hover:text-white text-xs font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container with Left Sidebar Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-60 shrink-0 space-y-6">
          {/* Active / Top HOME button */}
          <div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-amber-500/20 via-gold/25 to-amber-500/20 text-gold border border-gold/50 shadow-lg shadow-gold/10"
                  : "bg-white/[0.03] text-text-secondary hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <span className="text-sm">📊</span>
              <span>HOME</span>
            </button>
          </div>

          {/* MAIN MENU SECTION */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest px-3 py-1">
              MAIN MENU
            </div>

            {[
              { id: "earn", label: "EARN COINS", icon: "⚡" },
              { id: "wallet", label: "MY WALLET", icon: "💳" },
              { id: "daily", label: "DAILY CHECK IN", icon: "📅" },
              { id: "spin", label: "DAILY SPIN", icon: "🎡" },
              { id: "send", label: "SEND COINS", icon: "📱" },
              { id: "use", label: "USE COINS", icon: "🎫" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-amber-500/20 via-gold/25 to-amber-500/20 text-gold border border-gold/50 shadow-md shadow-gold/10 font-extrabold"
                    : "text-text-secondary hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* MORE SECTION */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <div className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest px-3 py-1">
              MORE
            </div>

            {[
              { id: "refer", label: "REFER & EARN", icon: "👥" },
              { id: "store", label: "REWARDS STORE", icon: "🛍️" },
              { id: "transactions", label: "TRANSACTIONS", icon: "📜" },
              { id: "expiring", label: "EXPIRING", icon: "⏳" },
              { id: "achievements", label: "BADGES", icon: "🏆" },
              { id: "settings", label: "SETTINGS", icon: "⚙️" },
              { id: "faq", label: "FAQ", icon: "❓" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-amber-500/20 via-gold/25 to-amber-500/20 text-gold border border-gold/50 shadow-md shadow-gold/10 font-extrabold"
                    : "text-text-secondary hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* Frozen Wallet Alert Banner */}
          {userWallet.isFrozen && (
            <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-extrabold uppercase tracking-wider block">Wallet Frozen Notice</span>
                  <span>Your CineCoin wallet is locked for security. Un-freeze it in CineCoin Settings to resume transactions.</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("settings")}
                className="px-4 py-1.5 bg-rose-500 text-white font-extrabold rounded-lg hover:bg-rose-600 text-[11px]"
              >
                Unfreeze Wallet
              </button>
            </div>
          )}

          {/* 1. CINECOIN CUSTOMER HOME / DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              {/* Balance Overview 6-Card Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* 1. CURRENT BALANCE */}
                <div className="bg-[#0E0E12] border border-amber-500/40 rounded-2xl p-4 space-y-1 shadow-lg relative overflow-hidden">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">CURRENT BALANCE</div>
                  <div className="text-2xl font-black text-gold font-mono">{(userWallet?.balanceCoins || 6915).toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">≈ ₹{walletValueRs}</div>
                </div>

                {/* 2. AVAILABLE */}
                <div className="bg-[#0E0E12] border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">AVAILABLE</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{(availableBalance || 6915).toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted">Usable now</div>
                </div>

                {/* 3. LOCKED */}
                <div className="bg-[#0E0E12] border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">LOCKED</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">{userWallet?.lockedBalance || 0}</div>
                  <div className="text-[10px] text-text-muted">Pending review</div>
                </div>

                {/* 4. EXPIRING SOON */}
                <div className="bg-[#0E0E12] border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">EXPIRING SOON</div>
                  <div className="text-2xl font-black text-rose-400 font-mono">{userWallet?.expiringCoins || 50}</div>
                  <div className="text-[10px] text-text-muted">Expires in 30d</div>
                </div>

                {/* 5. TOTAL EARNED */}
                <div className="bg-[#0E0E12] border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">TOTAL EARNED</div>
                  <div className="text-2xl font-black text-white font-mono">{(userWallet?.lifetimeEarned || 7165).toLocaleString()}</div>
                  <div className="text-[10px] text-text-muted">Lifetime</div>
                </div>

                {/* 6. TOTAL USED */}
                <div className="bg-[#0E0E12] border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="text-[10px] text-text-muted font-bold uppercase tracking-wider">TOTAL USED</div>
                  <div className="text-2xl font-black text-sky-400 font-mono">{userWallet?.totalRedeemed || 250}</div>
                  <div className="text-[10px] text-text-muted">Redeemed</div>
                </div>
              </div>

              {/* QUICK WALLET ACTIONS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E0E12] border border-white/10 rounded-2xl p-4">
                <span className="text-xs font-black text-white uppercase tracking-wider px-1">QUICK WALLET ACTIONS:</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setActiveTab("use")}
                    className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black text-xs font-black uppercase rounded-xl shadow cursor-pointer transition-all flex items-center gap-2 border-0"
                  >
                    <span>🎫</span>
                    <span>USE CINECOINS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("earn")}
                    className="px-5 py-2.5 bg-[#18181E] hover:bg-white/10 text-white text-xs font-extrabold uppercase rounded-xl border border-white/10 cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span>⚡</span>
                    <span>EARN CINECOINS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("send")}
                    className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-black uppercase rounded-xl shadow cursor-pointer transition-all flex items-center gap-2 border-0"
                  >
                    <span>📱</span>
                    <span>SEND CINECOINS</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("transactions")}
                    className="px-5 py-2.5 bg-[#18181E] hover:bg-white/10 text-text-muted hover:text-white text-xs font-extrabold uppercase rounded-xl border border-white/10 cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span>📜</span>
                    <span>TRANSACTIONS</span>
                  </button>
                </div>
              </div>

              {/* TODAY'S LOGIN REWARD CARD */}
              <div className="bg-gradient-to-r from-[#14120B] via-[#1C180E] to-[#121118] border border-amber-500/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
                <div className="space-y-2 text-left">
                  <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <span>🔥</span> TODAY'S LOGIN REWARD
                  </div>
                  <h2 className="text-2xl font-black text-white">Daily Check In Reward: +{dailyLoginAmount || 10} CineCoins</h2>
                  <p className="text-xs text-text-secondary">Claim +{dailyLoginAmount || 10} CineCoins once per calendar day.</p>
                </div>

                <div className="shrink-0">
                  <button
                    onClick={handleClaimDailyCheckin}
                    className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-yellow-300 text-black text-sm font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 border-0 cursor-pointer transition-all"
                  >
                    CLAIM +{dailyLoginAmount || 10} CC
                  </button>
                </div>
              </div>

              {/* Earning Avenues Quick Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => setActiveTab("daily")}
                  className="bg-[#0E0E12] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">📅</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Day {userWallet.dailyStreak + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Daily Login & Streaks</h3>
                  <p className="text-xs text-text-muted">Earn daily check-in coins and unlock 7-day milestone bonuses.</p>
                </div>

                <div 
                  onClick={() => setActiveTab("spin")}
                  className="bg-[#0E0E12] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">🎡</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">1 Free Spin</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Daily Spin & Win</h3>
                  <p className="text-xs text-text-muted">Spin the fortune wheel once per day to win up to 2,000 CineCoins.</p>
                </div>

                <div 
                  onClick={() => setActiveTab("refer")}
                  className="bg-[#0E0E12] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">👥</span>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">+{referFriendAmount || 200} CC</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">Refer & Earn</h3>
                  <p className="text-xs text-text-muted">Invite friends using your unique referral code to earn instant coins.</p>
                </div>
              </div>
            </div>
          )}

        {/* 2. MY WALLET TAB */}
        {activeTab === "wallet" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                💳 My CineCoin Digital Wallet
              </h2>
              <p className="text-xs text-text-secondary mt-1">Detailed summary of your available, locked, earned, and spent CineCoin ledger.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-[#1A180E] to-[#0F0F12] border border-amber-500/40 rounded-3xl p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Wallet Account</span>
                    <span className="text-sm font-extrabold text-white">{userEmail || "member@cinevenue.com"}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${userWallet.isFrozen ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
                    {userWallet.isFrozen ? "FROZEN" : "ACTIVE"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Total Balance</span>
                  <div className="text-4xl font-black text-gold font-mono">{userWallet.balanceCoins.toLocaleString()} <span className="text-sm">CC</span></div>
                  <div className="text-xs text-emerald-400 font-bold">Equivalent Value: ₹{walletValueRs} INR</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Available Coins</span>
                    <span className="text-emerald-400 font-mono font-bold text-base">{availableBalance.toLocaleString()} CC</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Locked Coins</span>
                    <span className="text-amber-400 font-mono font-bold text-base">{userWallet.lockedBalance || 0} CC</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setActiveTab("buy")} className="flex-1 py-2.5 bg-amber-500 text-black font-extrabold text-xs uppercase rounded-xl">Buy Coins</button>
                  <button onClick={() => setActiveTab("send")} className="flex-1 py-2.5 bg-sky-600 text-white font-extrabold text-xs uppercase rounded-xl">Send Coins</button>
                </div>
              </div>

              {/* Wallet Ledger Stats */}
              <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Wallet Ledger Statistics</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-text-muted">Total Lifetime Earned:</span>
                    <span className="font-mono font-bold text-emerald-400">+{userWallet.lifetimeEarned} CC</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-text-muted">Total Redeemed / Used:</span>
                    <span className="font-mono font-bold text-rose-400">-{userWallet.totalRedeemed || 0} CC</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-text-muted">Total Purchased:</span>
                    <span className="font-mono font-bold text-white">+{userWallet.totalPurchased || 0} CC</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-text-muted">Referral Bonuses Earned:</span>
                    <span className="font-mono font-bold text-gold">+{userWallet.successfulReferrals * (referFriendAmount || 2000)} CC</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-text-muted">Coins Expiring Soon:</span>
                    <span className="font-mono font-bold text-rose-400">{userWallet.expiringCoins} CC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. EARN CINECOINS CENTER */}
        {activeTab === "earn" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⚡ CineCoin Earning Center – All Earning Avenues
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Explore all verified activities and campaigns to maximize your reward balance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { title: "📅 DAILY LOGIN", reward: getRuleDisplay("daily_login", "+100 CC"), desc: "Claim daily check-in rewards and build your streak.", tab: "daily", btn: "Claim Daily Reward" },
                { title: "🎡 DAILY SPIN", reward: getRuleDisplay("spin_wheel", "Variable"), desc: "Spin the fortune wheel every 24 hours.", tab: "spin", btn: "Spin Now" },
                { title: "👥 REFER A FRIEND", reward: getRuleDisplay("refer_friend", "+2,000 CC"), desc: "Earn when your referred friends book tickets.", tab: "refer", btn: "Invite Friends" },
                { title: "🎂 BIRTHDAY BONUS", reward: getRuleDisplay("birthday_bonus", "+5,000 CC"), desc: "Annual birthday celebration gift voucher.", tab: "settings", btn: "Update DOB" },
                { title: "🎁 WELCOME BONUS", reward: getRuleDisplay("registration", "+1,000 CC"), desc: "New verified user onboarding bonus.", tab: "dashboard", btn: "Claimed ✓" },
                { title: "👤 PROFILE COMPLETION", reward: getRuleDisplay("profile_completion", "+500 CC"), desc: "Verify mobile, email, photo, and bio.", tab: "settings", btn: "Complete Profile" },
                { title: "🎟️ FIRST BOOKING", reward: getRuleDisplay("first_movie_booking", "+2,000 CC"), desc: "Bonus credited on your very first movie booking.", tab: "use", btn: "Book Ticket" },
                { title: "💰 CASHBACK", reward: getRuleDisplay("spend_per_100", "100 CC / ₹100"), desc: "Automatic coin cashback on all cinema tickets.", tab: "use", btn: "Browse Movies" },
                { title: "🏆 EVENT REWARDS", reward: getRuleDisplay("event_booking", "+1,000 CC"), desc: "Earn flat rewards for live events & concerts.", tab: "use", btn: "Book Events" },
                { title: "🔥 STREAK BONUSES", reward: "+250 CC", desc: "Maintain 7-day, 14-day, and 30-day login streaks.", tab: "daily", btn: "View Streaks" },
                { title: "🎬 WATCH & ENGAGE", reward: getRuleDisplay("movie_review", "+250 CC"), desc: "Watch promotional trailers and review shows.", tab: "dashboard", btn: "Start Activities" },
                { title: "🎉 FESTIVAL OFFERS", reward: getRuleDisplay("festival_bonus", "Special"), desc: "Diwali, New Year, and Anniversary limited campaigns.", tab: "dashboard", btn: "Explore Offers" }
              ].map((card, idx) => (
                <div key={idx} className="bg-[#0F0F12] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">{card.title}</h3>
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{card.reward}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">{card.desc}</p>
                  </div>

                  <button
                    onClick={() => setActiveTab(card.tab as any)}
                    className="w-full py-2 bg-white/5 hover:bg-gold hover:text-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-white/10"
                  >
                    {card.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. DAILY LOGIN & STREAK TAB */}
        {activeTab === "daily" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📅 Daily Login Reward & Streak Tracker
              </h2>
              <p className="text-xs text-text-secondary mt-1">Log in daily to earn streak coins and progress through 7-day reward cycles.</p>
            </div>

            <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-5">
                <div>
                  <span className="text-[10px] text-text-muted uppercase font-bold block">Current Login Streak</span>
                  <div className="text-3xl font-black text-gold font-mono flex items-center gap-2">
                    <span>{userWallet.dailyStreak} DAYS</span>
                    <span className="text-xl">🔥</span>
                  </div>
                  <span className="text-[10px] text-text-muted">Longest streak: {Math.max(userWallet.dailyStreak, 7)} Days</span>
                </div>

                <button
                  onClick={handleClaimDailyCheckin}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black uppercase rounded-xl shadow-lg cursor-pointer"
                >
                  CLAIM TODAY'S REWARD (+{dailyLoginAmount} CC)
                </button>
              </div>

              {/* 7 Day Streak Calendar Progression */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Reward Cycle</h3>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { day: 1, cc: 5 },
                    { day: 2, cc: 10 },
                    { day: 3, cc: 15 },
                    { day: 4, cc: 20 },
                    { day: 5, cc: 25 },
                    { day: 6, cc: 30 },
                    { day: 7, cc: 50 },
                  ].map((item) => (
                    <div
                      key={item.day}
                      className={`p-3 rounded-2xl border text-center space-y-1 ${
                        item.day <= userWallet.dailyStreak
                          ? "bg-amber-500/20 border-amber-400 text-amber-300"
                          : "bg-white/[0.02] border-white/10 text-white/40"
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold block text-text-muted">Day {item.day}</span>
                      <span className="text-sm font-black font-mono block">{item.day <= userWallet.dailyStreak ? "✓" : `+${item.cc} CC`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. DAILY SPIN & WIN WHEEL */}
        {activeTab === "spin" && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto text-center">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white">🎡 Daily Spin & Win Wheel</h2>
                <p className="text-xs text-text-secondary">Spin the wheel every 24 hours to win up to 500 CC guaranteed jackpot!</p>
              </div>

              {/* Animated Wheel */}
              <div className="relative w-72 h-72 mx-auto my-4 flex items-center justify-center">
                <div className="absolute -top-4 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-md" />

                <div 
                  className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden relative transition-transform duration-[3500ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  <div className="w-full h-full relative bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700">
                    {[50, 100, 20, 200, 500, 10, 150, 300].map((val, idx) => (
                      <div
                        key={idx}
                        className="absolute w-1/2 h-1/2 top-0 right-0 origin-bottom-left flex items-center justify-center text-black font-extrabold text-xs font-mono border-b border-black/20"
                        style={{
                          transform: `rotate(${idx * 45}deg)`,
                          backgroundColor: idx % 2 === 0 ? "#D4AF37" : "#F59E0B"
                        }}
                      >
                        <span className="transform -rotate-45 translate-x-4 -translate-y-2">+{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute w-16 h-16 rounded-full bg-black border-2 border-gold flex items-center justify-center text-gold font-black text-xs shadow-xl z-10">
                  CINE
                </div>
              </div>

              {spunResult && (
                <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs py-3 px-4 rounded-xl font-bold animate-bounce">
                  {spunResult}
                </div>
              )}

              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-wider shadow-xl transition-all cursor-pointer border-0 ${
                  isSpinning
                    ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] hover:from-amber-400 hover:to-yellow-300 text-black shadow-amber-500/20"
                }`}
              >
                {isSpinning ? "Spinning Wheel..." : "SPIN WHEEL NOW (1 FREE SPIN)"}
              </button>
            </div>
          </div>
        )}

        {/* 6. REFER & EARN TAB */}
        {activeTab === "refer" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-3xl p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black text-3xl mx-auto shadow-lg">
                👥
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">Refer Friends & Earn <span className="text-gold">{referFriendAmount} CC</span></h2>
                <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                  Your referred friends receive a welcome bonus, and you earn {referFriendAmount} CC after they complete their first booking.
                </p>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4 max-w-md mx-auto">
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Your Unique Referral Code</span>
                  <div className="flex items-center justify-between bg-black/60 border border-amber-500/30 rounded-xl px-4 py-2.5 mt-1.5">
                    <span className="font-mono text-base font-black text-gold tracking-widest">{userWallet.referralCode}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(userWallet.referralCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="text-xs font-bold text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer bg-transparent border-0"
                    >
                      {copiedCode ? "✓ Copied" : "Copy Code"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => window.open(`https://api.whatsapp.com/send?text=Use referral code ${userWallet.referralCode} on CineVenue to get 100 CineCoins!`)} className="py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">WhatsApp</button>
                  <button onClick={() => window.open(`https://telegram.me/share/url?url=https://cinevenue.com&text=Use code ${userWallet.referralCode}`)} className="py-2 rounded-xl bg-sky-600/20 text-sky-300 border border-sky-500/30 text-xs font-bold">Telegram</button>
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://cinevenue.com`)} className="py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold">Facebook</button>
                </div>
              </div>

              {/* Anti-Fraud Notice */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 text-left space-y-1">
                <span className="font-bold block">🛡️ Referral Anti-Fraud Safeguards Active</span>
                <span className="text-text-muted block text-[11px]">Multiple referrals from the same device, IP address, or phone number are placed under PENDING REVIEW to maintain program fairness.</span>
              </div>
            </div>
          </div>
        )}

        {/* 7. BUY CINECOINS TAB */}
        {activeTab === "buy" && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                💰 Buy CineCoins Packages
              </h2>
              <p className="text-xs text-text-secondary mt-1">Purchase CineCoins instantly via UPI, NetBanking, or Credit/Debit Cards.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { rupees: 100, coins: 1000, label: "Starter Pack" },
                { rupees: 500, coins: 5000, label: "Popular Pack", popular: true },
                { rupees: 1000, coins: 10500, label: "VIP Power Pack", bonus: "+500 CC Bonus" }
              ].map((pack) => (
                <div
                  key={pack.rupees}
                  onClick={() => setBuyPackAmountRs(pack.rupees)}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-3 relative ${
                    buyPackAmountRs === pack.rupees
                      ? "bg-amber-500/15 border-amber-400 shadow-xl scale-105"
                      : "bg-[#0F0F12] border-white/10 hover:border-amber-500/40"
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-3 right-4 bg-amber-500 text-black font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase">BEST VALUE</span>
                  )}
                  <span className="text-xs text-text-muted font-bold block uppercase">{pack.label}</span>
                  <div className="text-2xl font-black text-white">₹{pack.rupees} INR</div>
                  <div className="text-lg font-black text-gold font-mono">🪙 {pack.coins} CC</div>
                  {pack.bonus && <span className="text-[10px] text-emerald-400 font-bold block">{pack.bonus}</span>}
                </div>
              ))}
            </div>

            {buySuccessMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs py-3 px-4 rounded-xl font-bold animate-bounce text-center">
                {buySuccessMsg}
              </div>
            )}

            <button
              onClick={handleConfirmBuyCoins}
              disabled={isProcessingBuy}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-gold to-yellow-500 text-black text-sm font-black uppercase rounded-2xl shadow-xl cursor-pointer border-0"
            >
              {isProcessingBuy ? "Processing Gateway Payment..." : `PROCEED TO PAY ₹${buyPackAmountRs} INR`}
            </button>
          </div>
        )}

        {/* 8. SEND CINECOINS (P2P TRANSFER) */}
        {activeTab === "send" && (
          <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📲 Send CineCoins to Friends
              </h2>
              <p className="text-xs text-text-secondary mt-1">Instant peer-to-peer CineCoin wallet transfer with OTP security.</p>
            </div>

            <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-4">
              {!sendOtpStep ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase">Recipient Email or Phone</label>
                    <input
                      type="text"
                      placeholder="e.g. friend@gmail.com or +91 9876543210"
                      value={sendRecipient}
                      onChange={(e) => setSendRecipient(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-text-muted uppercase">CineCoins Amount</label>
                    <input
                      type="number"
                      value={sendCoinsAmount}
                      onChange={(e) => setSendCoinsAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono outline-none focus:border-gold"
                    />
                    <span className="text-[10px] text-text-muted block">Available Balance: {availableBalance} CC (2% transfer fee applies)</span>
                  </div>

                  {sendSuccessMsg && (
                    <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs py-3 px-4 rounded-xl font-bold">
                      {sendSuccessMsg}
                    </div>
                  )}

                  <button
                    onClick={handleInitiateSend}
                    className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold uppercase rounded-xl shadow-lg cursor-pointer border-0"
                  >
                    CONTINUE TO OTP VERIFICATION →
                  </button>
                </>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Security OTP Required</h3>
                    <p className="text-xs text-text-muted">Enter 4-digit code sent to verify transfer of {sendCoinsAmount} CC to {sendRecipient}.</p>
                  </div>

                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1 2 3 4"
                    value={sendOtpInput}
                    onChange={(e) => setSendOtpInput(e.target.value)}
                    className="w-32 mx-auto text-center px-4 py-3 bg-white/5 border border-gold rounded-xl text-lg font-mono tracking-widest text-gold outline-none"
                  />

                  <div className="flex gap-2">
                    <button onClick={() => setSendOtpStep(false)} className="w-1/2 py-2.5 bg-white/10 text-white text-xs font-bold rounded-xl">Cancel</button>
                    <button onClick={handleConfirmSendOtp} className="w-1/2 py-2.5 bg-emerald-500 text-black text-xs font-extrabold uppercase rounded-xl">CONFIRM TRANSFER</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. USE CINECOINS / REDEMPTION SIMULATOR */}
        {activeTab === "use" && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🎟️ Use CineCoins at Checkout
              </h2>
              <p className="text-xs text-text-secondary mt-1">Apply CineCoins directly on ticket bookings and food concessions.</p>
            </div>

            <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between text-xs py-2 border-b border-white/5">
                <span className="text-text-muted">Sample Ticket Order Total:</span>
                <span className="font-bold text-white font-mono">₹500.00</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-white/5">
                <span className="text-text-muted">Max Usable CineCoins (50% Cap):</span>
                <span className="font-bold text-gold font-mono">2,500 CC (₹250.00 Off)</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-white/5 font-extrabold">
                <span className="text-white">Remaining Payment Required:</span>
                <span className="text-emerald-400 font-mono">₹250.00</span>
              </div>

              <button
                onClick={() => window.location.href = "/#now-showing"}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black uppercase rounded-xl shadow-lg cursor-pointer border-0"
              >
                BROWSE MOVIES & BOOK NOW WITH CINECOINS
              </button>
            </div>
          </div>
        )}

        {/* 10. REWARDS STORE / CATALOG */}
        {activeTab === "store" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  🛍️ Rewards Store & Gift Vouchers
                </h2>
                <p className="text-xs text-text-secondary mt-1">Redeem your coins for free passes, snacks, and partner gifts.</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {["All", "Movie", "Food", "Event", "Gift Card", "VIP"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStoreCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase cursor-pointer border-0 ${
                      storeCategory === cat ? "bg-amber-500 text-black font-extrabold" : "bg-white/5 text-text-secondary hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards
                .filter((r) => storeCategory === "All" || r.category === storeCategory)
                .map((reward) => (
                  <div key={reward.id} className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden hover:border-gold/50 transition-all flex flex-col justify-between shadow-xl">
                    <div className="relative h-44 overflow-hidden">
                      <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-amber-500/30 px-3 py-1 rounded-full text-xs font-extrabold text-gold">
                        {reward.category}
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">{reward.title}</h3>
                        <p className="text-xs text-text-secondary leading-relaxed mt-1">{reward.description}</p>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-text-muted uppercase font-bold block">Redemption</span>
                          <span className="text-base font-black text-gold font-mono">🪙 {reward.coinPrice} CC</span>
                        </div>

                        <button
                          onClick={() => setSelectedRewardToClaim(reward)}
                          disabled={userWallet.balanceCoins < reward.coinPrice}
                          className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase border-0 ${
                            userWallet.balanceCoins >= reward.coinPrice ? "bg-amber-500 text-black hover:bg-amber-400 cursor-pointer" : "bg-white/10 text-white/40 cursor-not-allowed"
                          }`}
                        >
                          Claim Voucher
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 11. TRANSACTIONS */}
        {activeTab === "transactions" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  📜 Complete Wallet Transaction History
                </h2>
                <p className="text-xs text-text-secondary mt-1">Audit trail of all credits, debits, purchases, and redemptions.</p>
              </div>

              <div className="flex items-center gap-2">
                {["All", "Earned", "Redeemed", "Purchase", "Transfer Sent"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTxFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border-0 cursor-pointer ${
                      txFilter === f ? "bg-amber-500 text-black font-extrabold" : "bg-white/5 text-text-muted hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0F0F12] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-text-secondary font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="p-4">Txn ID</th>
                      <th className="p-4">Source / Event</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">CineCoins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {transactions
                      .filter((t) => txFilter === "All" || t.type === txFilter)
                      .map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.02]">
                          <td className="p-4 font-bold text-gold">{tx.id}</td>
                          <td className="p-4 text-white font-sans">{tx.source}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === "Earned" || tx.type === "Purchase" || tx.type === "Bonus"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 text-text-muted">{tx.date}</td>
                          <td className={`p-4 text-right font-extrabold ${
                            tx.type === "Earned" || tx.type === "Purchase" || tx.type === "Bonus" ? "text-emerald-400" : "text-rose-400"
                          }`}>
                            {tx.type === "Earned" || tx.type === "Purchase" || tx.type === "Bonus" ? "+" : "-"}{tx.coins} CC
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 12. EXPIRING CINECOINS */}
        {activeTab === "expiring" && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⏳ Expiring CineCoins Reminder
              </h2>
              <p className="text-xs text-text-secondary mt-1">CineCoins are valid for 12 months. Use expiring coins before they lapse!</p>
            </div>

            <div className="bg-gradient-to-br from-rose-500/10 to-[#0F0F12] border border-rose-500/30 rounded-3xl p-6 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-text-muted uppercase">Coins Expiring in Next 30 Days</span>
                <div className="text-4xl font-black text-rose-400 font-mono">{userWallet.expiringCoins} CC</div>
                <span className="text-xs text-white block">Expiry Date: {userWallet.expiringDate}</span>
              </div>

              <button
                onClick={() => setActiveTab("store")}
                className="w-full py-3 bg-amber-500 text-black font-extrabold text-xs uppercase rounded-xl shadow cursor-pointer border-0"
              >
                REDEEM EXPIRING COINS NOW
              </button>
            </div>
          </div>
        )}

        {/* 13. ACHIEVEMENTS & BADGES */}
        {activeTab === "achievements" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🏆 CineCoin Badges & Trophies
              </h2>
              <p className="text-xs text-text-secondary mt-1">Unlock milestone badges as you watch movies and participate in events.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "🏆 First Booking", desc: "Booked 1st movie ticket", unlocked: true },
                { title: "🔥 7-Day Streak", desc: "Maintained 7-day login streak", unlocked: userWallet.dailyStreak >= 7 },
                { title: "🎯 10 Bookings", desc: "Completed 10 movie bookings", unlocked: false },
                { title: "👥 5 Referrals", desc: "Referred 5 friends successfully", unlocked: userWallet.successfulReferrals >= 5 },
                { title: "🎂 Birthday Reward", desc: "Claimed birthday bonus", unlocked: true },
                { title: "💰 1,000 CC Earned", desc: "Earned 1,000 lifetime coins", unlocked: userWallet.lifetimeEarned >= 1000 },
                { title: "🎬 Movie Lover", desc: "Attended 25 film shows", unlocked: false },
                { title: "🌟 VIP Member", desc: "Reached top loyalty tier", unlocked: false }
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border space-y-2 ${
                    badge.unlocked
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : "bg-[#0F0F12] border-white/10 opacity-50 text-text-muted"
                  }`}
                >
                  <div className="text-xs font-bold uppercase">{badge.title}</div>
                  <p className="text-[11px] leading-relaxed">{badge.desc}</p>
                  <span className="text-[9px] font-black uppercase tracking-wider block">
                    {badge.unlocked ? "✓ UNLOCKED" : "🔒 LOCKED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 14. CUSTOMER NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🔔 Wallet Notifications
              </h2>
              <p className="text-xs text-text-secondary mt-1">Alerts on credits, rewards, transfers, and security updates.</p>
            </div>

            <div className="space-y-3">
              {(userWallet.notifications || [
                { id: "1", title: "🎉 Welcome Bonus Credited!", message: "100 CineCoins added to your wallet.", date: "Today", read: false },
                { id: "2", title: "🎡 Daily Spin Winner", message: "You won 50 CineCoins from Daily Spin.", date: "Yesterday", read: true }
              ]).map((n) => (
                <div key={n.id} className="bg-[#0F0F12] border border-white/10 rounded-2xl p-4 text-xs space-y-1">
                  <div className="flex justify-between items-center font-bold text-white">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-text-muted">{n.date}</span>
                  </div>
                  <p className="text-text-secondary">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 15. SETTINGS & SECURITY */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ⚙️ CineCoin Security & Wallet Settings
              </h2>
              <p className="text-xs text-text-secondary mt-1">Manage transaction PIN, security freeze, and connected device sessions.</p>
            </div>

            <div className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 space-y-6">
              {/* Wallet Freeze Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
                <div>
                  <h3 className="text-sm font-bold text-white">FREEZE MY CINECOIN WALLET</h3>
                  <p className="text-xs text-text-muted mt-0.5">Temporarily block all purchases, transfers, and redemptions if suspicious activity is detected.</p>
                </div>
                <button
                  onClick={handleToggleFreezeWallet}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer border-0 ${
                    userWallet.isFrozen ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-rose-600 text-white hover:bg-rose-500"
                  }`}
                >
                  {userWallet.isFrozen ? "UNFREEZE WALLET" : "FREEZE WALLET"}
                </button>
              </div>

              {/* Set Transaction PIN */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-white">Set 4-Digit Transaction PIN</h3>
                <div className="flex gap-3">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="New PIN (e.g. 5678)"
                    value={newTxPin}
                    onChange={(e) => setNewTxPin(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white font-mono outline-none"
                  />
                  <button
                    onClick={() => {
                      if (newTxPin.length === 4) {
                        setTxPin(newTxPin);
                        setPinUpdateSuccess(true);
                        setTimeout(() => setPinUpdateSuccess(false), 3000);
                        setNewTxPin("");
                      } else {
                        alert("PIN must be exactly 4 numeric digits.");
                      }
                    }}
                    className="px-5 py-2.5 bg-amber-500 text-black text-xs font-bold uppercase rounded-xl border-0 cursor-pointer"
                  >
                    Update PIN
                  </button>
                </div>
                {pinUpdateSuccess && <span className="text-xs text-emerald-400 font-bold block">✓ Transaction PIN updated successfully!</span>}
              </div>
            </div>
          </div>
        )}

        {/* 16. FAQ & RULES */}
        {activeTab === "faq" && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="bg-[#0F0F12] border border-amber-500/30 rounded-2xl p-6 text-left">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                ❓ Frequently Asked Questions & Loyalty Terms
              </h2>
              <p className="text-xs text-text-secondary mt-1">Everything you need to know about CineCoins rules, conversion rates, and redemptions.</p>
            </div>

            <div className="space-y-4">
              {[
                { q: "What is the valuation rate of CineCoins?", a: "By default, 100 CineCoins = ₹10 INR (1 CC = ₹0.10). Admin reserves the right to adjust coin conversion rates during special promotional seasons." },
                { q: "When do CineCoins expire?", a: "CineCoins are valid for 12 months (365 days) from the date they are credited into your wallet." },
                { q: "What is the minimum redemption limit?", a: "Minimum redemption threshold is 100 CineCoins (equivalent to ₹10 discount)." },
                { q: "Can I combine CineCoins with card discount offers?", a: "Yes, CineCoins act as instant wallet currency that can be applied at checkout alongside bank cards or promo coupon codes." },
                { q: "What happens if my ticket booking is cancelled?", a: "If a movie ticket or event pass booking is cancelled or refunded, any CineCoins earned from that booking will automatically be deducted from your wallet balance." }
              ].map((faq, idx) => (
                <div key={idx} className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 space-y-2 text-left">
                  <h3 className="text-sm font-bold text-gold">Q: {faq.q}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* CLAIM VOUCHER MODAL */}
      {selectedRewardToClaim && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0F0F12] border border-amber-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5 text-center relative">
            <button
              onClick={() => setSelectedRewardToClaim(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white"
            >
              ✕
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-2xl text-gold">
              🎁
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">{selectedRewardToClaim.title}</h3>
              <p className="text-xs text-text-secondary">{selectedRewardToClaim.description}</p>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Redemption Price:</span>
                <span className="font-bold text-gold font-mono">{selectedRewardToClaim.coinPrice} CC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Your Balance:</span>
                <span className="font-bold text-white font-mono">{userWallet.balanceCoins} CC</span>
              </div>
            </div>

            {claimSuccessMessage ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs py-3 px-4 rounded-xl font-bold animate-bounce">
                {claimSuccessMessage}
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setSelectedRewardToClaim(null)}
                  className="w-1/2 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClaimReward}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#D4AF37] text-black text-xs font-extrabold uppercase rounded-xl shadow-lg"
                >
                  Confirm Claim
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
