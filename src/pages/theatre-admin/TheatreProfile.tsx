import React, { useState, useEffect } from "react";
import {
  MapPin,
  Landmark,
  Phone,
  Mail,
  Clock,
  Award,
  CheckCircle,
  Save,
  Sliders,
  ShieldCheck,
  CreditCard,
  Plus,
  Edit2,
  AlertTriangle,
  XCircle,
  Lock,
  DollarSign,
  Ban,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { Theatre, TheatreBankAccount, BankVerificationStatus, TheatreSettlementRecord } from "../../types";
import { isValidIFSC, isValidPAN, isValidGSTIN } from "../../utils/bankValidation";

interface TheatreProfileProps {
  theatre: Theatre;
  onUpdateTheatre: (t: Theatre) => void;
}

export default function TheatreProfile({ theatre, onUpdateTheatre }: TheatreProfileProps) {
  const [name, setName] = useState(theatre.name);
  const [location, setLocation] = useState(theatre.location);
  const [price, setPrice] = useState(theatre.price);
  const [bankRouting, setBankRouting] = useState(theatre.bankRouting || "");
  const [img, setImg] = useState(theatre.img);
  const [features, setFeatures] = useState<string[]>(theatre.features || []);
  const [success, setSuccess] = useState(false);

  // Bank Accounts State for Theatre Owner
  const [bankAccounts, setBankAccounts] = useState<TheatreBankAccount[]>([]);
  const [settlements, setSettlements] = useState<TheatreSettlementRecord[]>([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Bank Form State
  const [bankForm, setBankForm] = useState({
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
    upiId: ""
  });
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});
  const [bankNotification, setBankNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const availableFeatures = [
    "4K Laser Projection",
    "Dolby Atmos sound",
    "Luxury Recliners",
    "Gourmet Food",
    "Valet Parking",
    "Wheelchair Access",
    "Bar & Lounge",
    "IMAX certified"
  ];

  // Fetch Bank Accounts for this theatre
  const fetchBankDetails = async () => {
    setLoadingBank(true);
    try {
      const res = await fetch(`/api/admin/theatres/${theatre.id}/bank-accounts`);
      if (res.ok) {
        const data = await res.json();
        setBankAccounts(data.bankAccounts || []);
      }

      const stRes = await fetch(`/api/admin/theatres/${theatre.id}/settlements`);
      if (stRes.ok) {
        const stData = await stRes.json();
        setSettlements(stData.settlements || []);
      }
    } catch (err) {
      console.error("Failed to load theatre bank info", err);
    } finally {
      setLoadingBank(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, [theatre.id]);

  const handleToggleFeature = (feat: string) => {
    if (features.includes(feat)) {
      setFeatures(features.filter((f) => f !== feat));
    } else {
      setFeatures([...features, feat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTheatre({
      ...theatre,
      name,
      location,
      price,
      bankRouting,
      img,
      features
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  // Validate Bank Form
  const validateBankForm = () => {
    const errs: Record<string, string> = {};
    if (!bankForm.accountHolderName.trim()) errs.accountHolderName = "Account holder name is required.";
    if (!bankForm.bankName.trim()) errs.bankName = "Bank name is required.";
    if (!bankForm.accountNumber.trim()) errs.accountNumber = "Account number is required.";
    else if (bankForm.accountNumber.length < 8) errs.accountNumber = "Minimum 8 digits required.";

    if (bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      errs.confirmAccountNumber = "Account number does not match confirmation.";
    }

    if (!bankForm.ifscCode.trim()) {
      errs.ifscCode = "IFSC code is required.";
    } else if (!isValidIFSC(bankForm.ifscCode)) {
      errs.ifscCode = "Invalid IFSC format (e.g., HDFC0000045).";
    }

    if (bankForm.pan && !isValidPAN(bankForm.pan)) {
      errs.pan = "Invalid PAN format (e.g., AAACP1234F).";
    }

    if (bankForm.gstin && !isValidGSTIN(bankForm.gstin)) {
      errs.gstin = "Invalid GSTIN format (e.g., 36AAACP1234F1Z5).";
    }

    setBankErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save / Update Bank Account
  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBankForm()) return;

    setLoadingBank(true);
    try {
      const res = await fetch(`/api/admin/theatres/${theatre.id}/bank-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-id": `THEATRE-OWNER-${theatre.id}`,
          "x-admin-email": (theatre as any).ownerEmail || (theatre as any).email || `theatre_${theatre.id}@cinevenue.com`
        },
        body: JSON.stringify({
          ...bankForm,
          isPrimary: true
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit bank account.");
      }

      setBankNotification({
        type: "success",
        message: "Bank account details submitted! CineVenue compliance team will verify within 24 hours."
      });
      setIsBankModalOpen(false);
      fetchBankDetails();
    } catch (err: any) {
      setBankNotification({ type: "error", message: err.message });
    } finally {
      setLoadingBank(false);
    }
  };

  const primaryAccount = bankAccounts.find(a => a.isPrimary) || bankAccounts[0];

  const renderStatusBadge = (status: BankVerificationStatus) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified & Active for Disbursals
          </span>
        );
      case "Pending Verification":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
            Pending CineVenue Verification
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Verification Rejected
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <Ban className="w-3.5 h-3.5" />
            Account Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-text-muted border border-white/10">
            <AlertTriangle className="w-3.5 h-3.5" />
            Not Added (Settlements Paused)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left select-none max-w-4xl">
      <div>
        <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide">
          Theatre Profile & Settlement Settings
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your branding, amenities, and authoritative bank account for box office payouts.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-bold uppercase tracking-wider">
          <CheckCircle className="w-4 h-4" />
          <span>Profile changes synchronized successfully!</span>
        </div>
      )}

      {bankNotification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 font-bold ${
            bankNotification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          {bankNotification.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{bankNotification.message}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION: BANK & SETTLEMENT DETAILS                        */}
      {/* ========================================================= */}
      <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gold/10 text-gold rounded-xl border border-gold/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                Bank & Box Office Settlement Account
              </h3>
              <p className="text-xs text-text-secondary">
                Weekly & monthly revenue share is disbursed directly to your verified primary account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBankForm({
                accountHolderName: primaryAccount ? primaryAccount.accountHolderName : theatre.name,
                bankName: primaryAccount ? primaryAccount.bankName : "HDFC Bank",
                accountNumber: "",
                confirmAccountNumber: "",
                ifscCode: primaryAccount ? primaryAccount.ifscCode : "",
                accountType: primaryAccount ? primaryAccount.accountType : "Current",
                branchName: primaryAccount ? primaryAccount.branchName : "",
                branchAddress: primaryAccount ? primaryAccount.branchAddress || "" : "",
                beneficiaryName: primaryAccount ? primaryAccount.beneficiaryName : theatre.name,
                pan: primaryAccount ? primaryAccount.pan || "" : "",
                gstin: primaryAccount ? primaryAccount.gstin || "" : "",
                upiId: primaryAccount ? primaryAccount.upiId || "" : ""
              });
              setBankErrors({});
              setIsBankModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-gold/15"
          >
            <Plus className="w-3.5 h-3.5" />
            {primaryAccount ? "Update Bank Account" : "Add Bank Account"}
          </button>
        </div>

        {/* Current Account Status View */}
        {primaryAccount ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gold" />
                <div>
                  <h4 className="font-bold text-text-primary text-sm">{primaryAccount.bankName}</h4>
                  <span className="text-xs text-text-muted">{primaryAccount.accountType} Account • Branch: {primaryAccount.branchName || "Main"}</span>
                </div>
              </div>
              {renderStatusBadge(primaryAccount.verificationStatus)}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Masked Account Number:
                </span>
                <span className="font-mono font-bold text-text-primary text-sm">
                  {primaryAccount.maskedAccountNumber}
                </span>
              </div>

              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">
                  IFSC Code:
                </span>
                <span className="font-mono font-bold text-gold text-sm">
                  {primaryAccount.ifscCode}
                </span>
              </div>

              <div>
                <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">
                  Beneficiary Name:
                </span>
                <span className="font-semibold text-text-primary text-sm">
                  {primaryAccount.beneficiaryName || primaryAccount.accountHolderName}
                </span>
              </div>

              {primaryAccount.pan && (
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">
                    Registered PAN:
                  </span>
                  <span className="font-mono text-text-secondary font-semibold">
                    {primaryAccount.pan}
                  </span>
                </div>
              )}

              {primaryAccount.gstin && (
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">
                    GSTIN:
                  </span>
                  <span className="font-mono text-text-secondary font-semibold">
                    {primaryAccount.gstin}
                  </span>
                </div>
              )}

              {primaryAccount.upiId && (
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-bold tracking-wider mb-1">
                    UPI ID:
                  </span>
                  <span className="font-mono text-text-secondary font-semibold">
                    {primaryAccount.upiId}
                  </span>
                </div>
              )}
            </div>

            {primaryAccount.verificationStatus === "Verified" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Verified for Automated Disbursals</span>
                  <p className="text-emerald-300/80 text-[11px] mt-0.5">
                    Your account is fully verified. Weekly net booking revenue is automatically routed via NEFT/RTGS to this account.
                  </p>
                </div>
              </div>
            )}

            {primaryAccount.verificationStatus === "Pending Verification" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400 flex items-start gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Verification in Progress</span>
                  <p className="text-amber-300/80 text-[11px] mt-0.5">
                    Our compliance team is verifying your bank account details. Disbursements will resume immediately upon approval.
                  </p>
                </div>
              </div>
            )}

            {primaryAccount.verificationStatus === "Rejected" && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs text-rose-400 flex items-start gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Verification Failed: {primaryAccount.verificationNotes || "Details mismatched"}</span>
                  <p className="text-rose-300/80 text-[11px] mt-0.5">
                    Please click "Update Bank Account" above to submit corrected details.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-xl p-8 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-gold/40 mx-auto" />
            <h4 className="text-sm font-bold text-text-primary">No Bank Account Linked</h4>
            <p className="text-xs text-text-secondary max-w-md mx-auto">
              You must register a valid commercial bank account to receive box office revenue share and rental payments.
            </p>
            <button
              type="button"
              onClick={() => {
                setBankForm({
                  accountHolderName: theatre.name,
                  bankName: "HDFC Bank",
                  accountNumber: "",
                  confirmAccountNumber: "",
                  ifscCode: "",
                  accountType: "Current",
                  branchName: "",
                  branchAddress: "",
                  beneficiaryName: theatre.name,
                  pan: "",
                  gstin: "",
                  upiId: ""
                });
                setBankErrors({});
                setIsBankModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-gold/15"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Bank Account Now
            </button>
          </div>
        )}

        {/* Settlement History Table */}
        {settlements.length > 0 && (
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-gold" />
                Recent Disbursals ({settlements.length})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-text-muted font-bold text-[10px] uppercase">
                    <th className="pb-2">Reference ID</th>
                    <th className="pb-2">Bank & Account</th>
                    <th className="pb-2 text-right">Gross Sales</th>
                    <th className="pb-2 text-right">Net Disbursed</th>
                    <th className="pb-2 text-right">Status & UTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {settlements.map(st => (
                    <tr key={st.id} className="hover:bg-white/[0.01]">
                      <td className="py-2.5 font-bold text-text-primary">{st.id}</td>
                      <td className="py-2.5 text-text-secondary">{st.bankName} ({st.maskedAccountNumber})</td>
                      <td className="py-2.5 text-right text-text-primary">₹{st.grossSales.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold">₹{st.netAmount.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-emerald-400 font-bold">{st.status}</span>
                        {st.utr && <span className="block text-[9px] text-text-muted">{st.utr}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Brand Details Card */}
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3">
            1. Brand Identity & Visual Assets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                Theatre Name
              </label>
              <input
                type="text"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none focus:bg-white/[0.03] transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                Base Ticket Starting Price (₹)
              </label>
              <input
                type="text"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none focus:bg-white/[0.03] transition-all"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                Location Address String
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                <input
                  type="text"
                  required
                  className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 pl-10 rounded-xl text-text-primary focus:border-gold focus:outline-none focus:bg-white/[0.03] transition-all"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                Branding Cover Image Link
              </label>
              <input
                type="url"
                required
                className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none focus:bg-white/[0.03] transition-all font-mono"
                value={img}
                onChange={(e) => setImg(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Custom Premium Features */}
        <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gold" />
            <span>2. Premium Theatre Amenities & Technologies</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
            {availableFeatures.map((feat) => {
              const active = features.includes(feat);
              return (
                <button
                  type="button"
                  key={feat}
                  onClick={() => handleToggleFeature(feat)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-1 justify-between transition-all cursor-pointer ${
                    active
                      ? "bg-gold/10 border-gold/30 text-gold"
                      : "bg-white/[0.01] border-white/5 text-text-secondary hover:border-white/20"
                  }`}
                >
                  <Award className={`w-4 h-4 ${active ? "text-gold" : "text-text-muted"}`} />
                  <span className="font-bold text-[10px] uppercase tracking-wider mt-1">{feat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-gold hover:bg-gold-light text-black px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-gold/15"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Configurations</span>
          </button>
        </div>
      </form>

      {/* ========================================================= */}
      {/* MODAL: REGISTER / UPDATE BANK DETAILS                     */}
      {/* ========================================================= */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-[#121215] border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wider">
                  Bank & Settlement Account Setup
                </h3>
                <p className="text-xs text-text-secondary">Venue: {theatre.name}</p>
              </div>
              <button
                onClick={() => setIsBankModalOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBankAccount} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    Account Holder Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountHolderName}
                    onChange={e => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    placeholder="Legal Entity / Multiplex Name"
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                  {bankErrors.accountHolderName && (
                    <span className="text-rose-400 text-[10px]">{bankErrors.accountHolderName}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    Bank Name <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={bankForm.bankName}
                    onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="bg-[#18181C] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
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
                    <option value="Other Commercial Bank">Other Commercial Bank</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    Account Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={bankForm.accountNumber}
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="Full Account Number"
                    className="bg-white/[0.02] border border-white/10 font-mono px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                  {bankErrors.accountNumber && (
                    <span className="text-rose-400 text-[10px]">{bankErrors.accountNumber}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    Confirm Account Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.confirmAccountNumber}
                    onChange={e => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                    placeholder="Re-type Account Number"
                    className="bg-white/[0.02] border border-white/10 font-mono px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                  {bankErrors.confirmAccountNumber && (
                    <span className="text-rose-400 text-[10px]">{bankErrors.confirmAccountNumber}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    IFSC Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankForm.ifscCode}
                    onChange={e => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="HDFC0000045"
                    className="bg-white/[0.02] border border-white/10 font-mono uppercase px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                  {bankErrors.ifscCode && (
                    <span className="text-rose-400 text-[10px]">{bankErrors.ifscCode}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    Account Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={bankForm.accountType}
                    onChange={e => setBankForm({ ...bankForm, accountType: e.target.value as any })}
                    className="bg-[#18181C] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  >
                    <option value="Current">Current Account (Corporate / Business)</option>
                    <option value="Savings">Savings Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.branchName}
                    onChange={e => setBankForm({ ...bankForm, branchName: e.target.value })}
                    placeholder="e.g. Khairatabad Main"
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    Beneficiary Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.beneficiaryName}
                    onChange={e => setBankForm({ ...bankForm, beneficiaryName: e.target.value })}
                    placeholder="Legal name on bank passbook"
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    PAN (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankForm.pan}
                    onChange={e => setBankForm({ ...bankForm, pan: e.target.value.toUpperCase() })}
                    placeholder="AAACP1234F"
                    className="bg-white/[0.02] border border-white/10 font-mono uppercase px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                  {bankErrors.pan && <span className="text-rose-400 text-[10px]">{bankErrors.pan}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankForm.gstin}
                    onChange={e => setBankForm({ ...bankForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="36AAACP1234F1Z5"
                    className="bg-white/[0.02] border border-white/10 font-mono uppercase px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                  {bankErrors.gstin && <span className="text-rose-400 text-[10px]">{bankErrors.gstin}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={bankForm.upiId}
                    onChange={e => setBankForm({ ...bankForm, upiId: e.target.value })}
                    placeholder="venue@hdfcbank"
                    className="bg-white/[0.02] border border-white/10 font-mono px-3.5 py-2.5 rounded-xl text-text-primary focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-text-muted text-[11px] flex items-start gap-2">
                <Lock className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span>
                  All financial account information is encrypted in transit and at rest using AES-256 standards. CineVenue will never display unmasked account numbers.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 text-text-muted hover:text-text-primary text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingBank}
                  className="px-5 py-2.5 bg-gold hover:bg-gold-light text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-gold/15 flex items-center gap-2"
                >
                  {loadingBank && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Submit for Compliance Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
