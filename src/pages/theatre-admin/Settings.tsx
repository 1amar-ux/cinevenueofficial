import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Lock,
  Bell,
  Landmark,
  FileSpreadsheet,
  Wallet,
  Mail,
  MessageSquare,
  Building2,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Camera,
  RotateCcw,
  RefreshCw,
  Send,
  CreditCard,
  Tv,
  Check,
  CheckCircle2
} from "lucide-react";
import { Theatre } from "../../types";

interface SettingsProps {
  theatre: Theatre;
  onUpdateTheatre: (t: Theatre) => void;
}

export default function Settings({ theatre, onUpdateTheatre }: SettingsProps) {
  const [activeSection, setActiveSection] = useState<
    "profile" | "gst" | "bank" | "payment" | "email" | "sms"
  >("profile");

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // ----------------------------------------------------
  // SECTION 1: THEATRE PROFILE STATE
  // ----------------------------------------------------
  const [profileForm, setProfileForm] = useState({
    logoUrl: theatre.img || "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=120&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
    name: theatre.name,
    ownerName: "Alexander Kuruvilla",
    businessName: "Grand CineVenues Private Limited",
    regNumber: "CIN-U92110MH2024PTC184291",
    email: "pvr.admin@cinevenue.com",
    mobile: "+91 98450 12345",
    alternateMobile: "+91 98450 67890",
    address: theatre.location,
    city: "Hyderabad",
    state: "Telangana",
    country: "India",
    pincode: "500081",
    gmapsLocation: "https://maps.google.com/?q=IMAX+Prasads+Hyderabad",
    latitude: "17.4116",
    longitude: "78.4682",
    website: "https://www.cinevenue.com/grand-imax",
    description: "CineVenue's premier luxury multiplex showcasing laser projection, executive pushback recliners, Dolby Atmos audio channels, and premium gourmet in-seat dining portals.",
    parking: true,
    wheelchair: true,
    foodCourt: true,
    ac: true,
    dolbyAtmos: true,
    threeD: true,
    imax: true,
    fourDx: false,
    wifi: true,
    status: "Open",
    openHours: "09:00 AM",
    closeHours: "11:50 PM",
    weeklyHolidays: "None",
    emergencyContact: "+91 91100 91100",
    facebook: "https://facebook.com/cinevenue",
    instagram: "https://instagram.com/cinevenue",
    twitter: "https://twitter.com/cinevenue",
    youtube: "https://youtube.com/cinevenue"
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setProfileForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setProfileForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTheatre({
      ...theatre,
      name: profileForm.name,
      location: profileForm.address,
      img: profileForm.logoUrl,
      features: [
        ...(profileForm.imax ? ["IMAX Certified"] : []),
        ...(profileForm.dolbyAtmos ? ["Dolby Atmos Audio"] : []),
        ...(profileForm.wheelchair ? ["Wheelchair Access"] : []),
        ...(profileForm.parking ? ["Valet Parking"] : []),
        ...(profileForm.foodCourt ? ["Gourmet Food"] : []),
        ...(profileForm.threeD ? ["3D Screenings"] : [])
      ]
    });
    showToast("Theatre profile updated and synced successfully!");
  };

  // ----------------------------------------------------
  // SECTION 2: GST & TAX STATE
  // ----------------------------------------------------
  const [gstForm, setGstForm] = useState({
    gstNumber: "36AAAAA1111A1Z1",
    panNumber: "AAAAA1111A",
    businessType: "Private Limited",
    legalName: "GRAND CINEVENUES PRIVATE LIMITED",
    tradeName: "CineVenue Grand IMAX",
    gstState: "Telangana (Code: 36)",
    registrationDate: "2024-04-12",
    taxPercentage: "18.0",
    invoicePrefix: "CV-HYD-",
    invoiceFooter: "Thank you for choosing CineVenue. Terms & Conditions apply. Computer-generated invoice.",
    generateInvoice: true,
    enableGst: true,
    certificateUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&q=80"
  });

  const [gstErrors, setGstErrors] = useState<{ [key: string]: string }>({});

  const validateGst = () => {
    const errors: { [key: string]: string } = {};
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!gstRegex.test(gstForm.gstNumber)) {
      errors.gstNumber = "Invalid GSTIN format (e.g., 36AAAAA1111A1Z1)";
    }
    if (!panRegex.test(gstForm.panNumber)) {
      errors.panNumber = "Invalid PAN format (e.g., ABCDE1234F)";
    }
    setGstErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveGst = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateGst()) {
      localStorage.setItem(`cine_theatre_gst_${theatre.id}`, JSON.stringify(gstForm));
      showToast("GST and tax details saved securely!");
    } else {
      showToast("Please fix the validation errors in GST form.", "error");
    }
  };

  // ----------------------------------------------------
  // SECTION 3: BANK ACCOUNT STATE
  // ----------------------------------------------------
  const [bankAccounts, setBankAccounts] = useState<any[]>([
    {
      id: "BANK-1",
      holderName: "GRAND CINEVENUES PVT LTD",
      bankName: "HDFC Bank Limited",
      branch: "Madhapur Jubilee Hills Branch",
      accountNumber: "50200084729104",
      ifscCode: "HDFC0000240",
      upiId: "cinevenue@hdfc",
      accountType: "Current",
      isPrimary: true,
      status: "Verified",
      chequePreview: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=100&q=80"
    }
  ]);

  const [newBank, setNewBank] = useState({
    holderName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifscCode: "",
    upiId: "",
    accountType: "Current",
    isPrimary: false
  });

  const [showAddBank, setShowAddBank] = useState(false);

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBank.accountNumber !== newBank.confirmAccountNumber) {
      showToast("Account numbers do not match!", "error");
      return;
    }
    if (!newBank.holderName || !newBank.bankName || !newBank.ifscCode) {
      showToast("Please fill in all mandatory bank fields.", "error");
      return;
    }

    const created: any = {
      id: "BANK-" + Date.now(),
      holderName: newBank.holderName,
      bankName: newBank.bankName,
      branch: newBank.branch,
      accountNumber: newBank.accountNumber,
      ifscCode: newBank.ifscCode.toUpperCase(),
      upiId: newBank.upiId || `${newBank.accountNumber}@upi`,
      accountType: newBank.accountType,
      isPrimary: newBank.isPrimary,
      status: "Verification Pending"
    };

    let updatedBanks = [...bankAccounts];
    if (newBank.isPrimary) {
      updatedBanks = updatedBanks.map(b => ({ ...b, isPrimary: false }));
    }
    updatedBanks.push(created);

    setBankAccounts(updatedBanks);
    setShowAddBank(false);
    setNewBank({
      holderName: "",
      bankName: "",
      branch: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      upiId: "",
      accountType: "Current",
      isPrimary: false
    });
    showToast("Bank account added! Verification process started.");
  };

  const removeBankAccount = (id: string) => {
    if (confirm("Are you sure you want to remove this bank account?")) {
      const filtered = bankAccounts.filter(b => b.id !== id);
      setBankAccounts(filtered);
      showToast("Bank account removed.");
    }
  };

  // ----------------------------------------------------
  // SECTION 4: PAYMENT SETTINGS STATE
  // ----------------------------------------------------
  const [paymentSettings, setPaymentSettings] = useState({
    enableUpi: true,
    enableCreditCard: true,
    enableDebitCard: true,
    enableNetBanking: true,
    enableWallets: false,
    enableCashCounter: true,
    settlementFrequency: "Daily",
    settlementDay: "Monday",
    commissionPercent: "2.5",
    convenienceFee: "15",
    cancellationCharge: "10",
    refundTime: "24",
    minBookingAmount: "100",
    maxBookingAmount: "5000",
    enableOnline: true,
    enableOffline: true,
    gatewayStatus: "Connected",
    transactionTimeout: "300"
  });

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setPaymentSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setPaymentSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`cine_payment_settings_${theatre.id}`, JSON.stringify(paymentSettings));
    showToast("Payment configurations finalized successfully!");
  };

  // ----------------------------------------------------
  // SECTION 5: EMAIL SETTINGS STATE
  // ----------------------------------------------------
  const [emailConfig, setEmailConfig] = useState({
    senderName: "CineVenue Bookings",
    senderEmail: "tickets@cinevenue.com",
    replyToEmail: "support@cinevenue.com",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: "587",
    smtpUsername: "apikey_cinevenue_prod",
    smtpPassword: "SG.zPQ8xX47S869XyZ73K9Q",
    encryption: "TLS",
    enableEmails: true,
    confirmConfirm: true,
    confirmCancel: true,
    confirmRefund: true,
    confirmReminder: true
  });

  const [showEmailPass, setShowEmailPass] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`cine_email_config_${theatre.id}`, JSON.stringify(emailConfig));
    showToast("SMTP server configurations saved securely!");
  };

  const handleTestEmail = () => {
    showToast("Sending verification packet... SMTP handshake established!", "success");
    alert(`Success! Test email successfully sent from ${emailConfig.senderEmail} using ${emailConfig.smtpHost}:${emailConfig.smtpPort}`);
  };

  // ----------------------------------------------------
  // SECTION 6: SMS SETTINGS STATE
  // ----------------------------------------------------
  const [smsConfig, setSmsConfig] = useState({
    provider: "Twilio",
    apiKey: "SK73948291048291048AC",
    apiSecret: "e93810f839d7381b83d891",
    senderId: "CINEVN",
    templateId: "DLT_1107161829381928",
    enableSms: true,
    confirmConfirm: true,
    confirmCancel: true,
    confirmRefund: true,
    confirmReminder: true,
    promotional: false,
    otp: true
  });

  const [showSmsSecret, setShowSmsSecret] = useState(false);
  const [smsBalance, setSmsBalance] = useState("₹4,821.50 (Approx. 32,143 SMS)");

  const handleSaveSms = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`cine_sms_config_${theatre.id}`, JSON.stringify(smsConfig));
    showToast("SMS gateway credentials validated and saved.");
  };

  const handleTestSms = () => {
    showToast("Test payload dispatched! Delivered in 1.4s.", "success");
    alert(`Simulated SMS sent to Admin phone with Sender ID: ${smsConfig.senderId}\n"Your booking for Kalki 2898 AD at ${theatre.name} is CONFIRMED! Seats: A3, A4. Enjoy your screening!"`);
  };


  // Load settings on mounting
  useEffect(() => {
    const savedGst = localStorage.getItem(`cine_theatre_gst_${theatre.id}`);
    if (savedGst) setGstForm(JSON.parse(savedGst));

    const savedPayment = localStorage.getItem(`cine_payment_settings_${theatre.id}`);
    if (savedPayment) setPaymentSettings(JSON.parse(savedPayment));

    const savedEmail = localStorage.getItem(`cine_email_config_${theatre.id}`);
    if (savedEmail) setEmailConfig(JSON.parse(savedEmail));

    const savedSms = localStorage.getItem(`cine_sms_config_${theatre.id}`);
    if (savedSms) setSmsConfig(JSON.parse(savedSms));
  }, [theatre.id]);


  return (
    <div className="space-y-6 text-left select-none relative pb-12">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm transition-all animate-bounce ${
            toast.type === "success"
              ? "bg-[#10B981] text-[#0A0A0B] font-bold"
              : "bg-[#EF4444] text-[#E0D8D0] font-bold"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-xs">{toast.message}</span>
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-wide flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-gold" />
            <span>Operational Settings</span>
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Calibrate legal compliances, profile images, bank routing settlements, and notification dispatches
          </p>
        </div>
        <div className="bg-[#121215] border border-white/5 rounded-xl px-3 py-1 text-[10px] text-text-secondary font-mono">
          Terminal Status: <strong className="text-emerald-400">ONLINE (Node-v18)</strong>
        </div>
      </div>

      {/* Settings Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar panel */}
        <div className="lg:col-span-1 bg-[#121215] border border-white/5 p-4 rounded-2xl space-y-1.5 shadow-xl">
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all border-0 cursor-pointer ${
              activeSection === "profile"
                ? "bg-gold text-black shadow-lg shadow-gold/10"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Theatre Profile</span>
          </button>

          <button
            onClick={() => setActiveSection("gst")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all border-0 cursor-pointer ${
              activeSection === "gst"
                ? "bg-gold text-black shadow-lg shadow-gold/10"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>GST & Tax Details</span>
          </button>

          <button
            onClick={() => setActiveSection("bank")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all border-0 cursor-pointer ${
              activeSection === "bank"
                ? "bg-gold text-black shadow-lg shadow-gold/10"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <Landmark className="w-4 h-4 shrink-0" />
            <span>Bank Account</span>
          </button>

          <button
            onClick={() => setActiveSection("payment")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all border-0 cursor-pointer ${
              activeSection === "payment"
                ? "bg-gold text-black shadow-lg shadow-gold/10"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span>Payment Settings</span>
          </button>

          <button
            onClick={() => setActiveSection("email")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all border-0 cursor-pointer ${
              activeSection === "email"
                ? "bg-gold text-black shadow-lg shadow-gold/10"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Email Settings</span>
          </button>

          <button
            onClick={() => setActiveSection("sms")}
            className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all border-0 cursor-pointer ${
              activeSection === "sms"
                ? "bg-gold text-black shadow-lg shadow-gold/10"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>SMS Settings</span>
          </button>
        </div>

        {/* Configurations Forms Container */}
        <div className="lg:col-span-3 space-y-6">
          {/* 1. THEATRE PROFILE FORM */}
          {activeSection === "profile" && (
            <form onSubmit={handleSaveProfile} className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl text-xs">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Theatre Profile</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Manage digital brochures, logo visuals, banners and working hours</p>
              </div>

              {/* Cover Banner Mock preview */}
              <div className="relative h-44 rounded-xl overflow-hidden group bg-neutral-900 border border-white/5">
                <img src={profileForm.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Logo overlapping preview */}
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-gold bg-[#121215]">
                    <img src={profileForm.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{profileForm.name}</h4>
                    <span className="text-[9px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded uppercase font-bold font-mono">
                      {profileForm.status} ● Active Partner
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Theatre Name</label>
                  <input
                    type="text"
                    required
                    name="name"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03]"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Owner Name</label>
                  <input
                    type="text"
                    required
                    name="ownerName"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03]"
                    value={profileForm.ownerName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Business Name (Corporate)</label>
                  <input
                    type="text"
                    required
                    name="businessName"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03]"
                    value={profileForm.businessName}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Theatre Registration Number</label>
                  <input
                    type="text"
                    required
                    name="regNumber"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03] font-mono"
                    value={profileForm.regNumber}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Primary Contact Email</label>
                  <input
                    type="email"
                    required
                    name="email"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03] font-mono"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Mobile Number</label>
                  <input
                    type="text"
                    required
                    name="mobile"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03]"
                    value={profileForm.mobile}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Alternate Number</label>
                  <input
                    type="text"
                    name="alternateMobile"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03]"
                    value={profileForm.alternateMobile}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Website</label>
                  <input
                    type="url"
                    name="website"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03] font-mono text-gold"
                    value={profileForm.website}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Street Address</label>
                  <input
                    type="text"
                    required
                    name="address"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:bg-white/[0.03]"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">City</label>
                  <input
                    type="text"
                    required
                    name="city"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">State</label>
                  <input
                    type="text"
                    required
                    name="state"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none"
                    value={profileForm.state}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Pincode</label>
                  <input
                    type="text"
                    required
                    name="pincode"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none font-mono"
                    value={profileForm.pincode}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Google Maps Link</label>
                  <input
                    type="text"
                    name="gmapsLocation"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none font-mono text-[11px]"
                    value={profileForm.gmapsLocation}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Latitude</label>
                  <input
                    type="text"
                    name="latitude"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none font-mono"
                    value={profileForm.latitude}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none font-mono"
                    value={profileForm.longitude}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Logo Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="logoUrl"
                    className="flex-1 bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none font-mono"
                    value={profileForm.logoUrl}
                    onChange={handleProfileChange}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt("Enter a custom image URL for logo:");
                      if (url) setProfileForm(p => ({ ...p, logoUrl: url }));
                    }}
                    className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                  >
                    Set Logo
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-gold px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none leading-relaxed"
                  value={profileForm.description}
                  onChange={handleProfileChange}
                />
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Open Hours</label>
                  <input
                    type="text"
                    name="openHours"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary font-mono"
                    value={profileForm.openHours}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Close Hours</label>
                  <input
                    type="text"
                    name="closeHours"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary font-mono"
                    value={profileForm.closeHours}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Weekly Holidays</label>
                  <input
                    type="text"
                    name="weeklyHolidays"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary"
                    value={profileForm.weeklyHolidays}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    className="bg-white/[0.02] border border-white/10 hover:border-white/20 px-3.5 py-2.5 rounded-xl text-text-primary font-mono"
                    value={profileForm.emergencyContact}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              {/* Amenity Facilities Checklist */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wide text-[10px]">Facilities & Accessibility Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: "parking", label: "Valet Parking" },
                    { id: "wheelchair", label: "Wheelchair Access" },
                    { id: "foodCourt", label: "Gourmet Food Court" },
                    { id: "ac", label: "Full AC Climate Control" },
                    { id: "dolbyAtmos", label: "Dolby Atmos 7.1" },
                    { id: "threeD", label: "3D Digital Projections" },
                    { id: "imax", label: "IMAX Laser System" },
                    { id: "fourDx", label: "4DX Motion FX" },
                    { id: "wifi", label: "High-Speed WiFi" }
                  ].map(fac => (
                    <label key={fac.id} className="flex items-center gap-2.5 p-2.5 bg-white/[0.01] border border-white/5 hover:border-white/15 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        name={fac.id}
                        className="accent-gold w-3.5 h-3.5 cursor-pointer"
                        checked={(profileForm as any)[fac.id]}
                        onChange={handleProfileChange}
                      />
                      <span className="font-semibold text-text-secondary text-[11px] select-none">{fac.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wide text-[10px]">Social Media Channels</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase">Facebook Link</label>
                    <input
                      type="url"
                      name="facebook"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono text-[10px]"
                      value={profileForm.facebook}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase">Instagram handle</label>
                    <input
                      type="url"
                      name="instagram"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono text-[10px]"
                      value={profileForm.instagram}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase">Twitter (X) handle</label>
                    <input
                      type="url"
                      name="twitter"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono text-[10px]"
                      value={profileForm.twitter}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-text-secondary uppercase">YouTube Channel</label>
                    <input
                      type="url"
                      name="youtube"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono text-[10px]"
                      value={profileForm.youtube}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-light text-black px-5 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/15"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Profile Details</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. GST & TAX DETAILS */}
          {activeSection === "gst" && (
            <form onSubmit={handleSaveGst} className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl text-xs">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">GST & Tax Details</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Configure state tax rates, GST registrations, invoice prefix schemes, and upload certificates</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">GSTIN Number</label>
                  <input
                    type="text"
                    required
                    name="gstNumber"
                    className={`bg-white/[0.02] border px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs focus:outline-none ${
                      gstErrors.gstNumber ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-gold"
                    }`}
                    value={gstForm.gstNumber}
                    onChange={(e) => setGstForm(p => ({ ...p, gstNumber: e.target.value.toUpperCase() }))}
                  />
                  {gstErrors.gstNumber && <p className="text-[9px] text-red-400 font-mono">{gstErrors.gstNumber}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Business PAN Card</label>
                  <input
                    type="text"
                    required
                    name="panNumber"
                    className={`bg-white/[0.02] border px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs focus:outline-none ${
                      gstErrors.panNumber ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-gold"
                    }`}
                    value={gstForm.panNumber}
                    onChange={(e) => setGstForm(p => ({ ...p, panNumber: e.target.value.toUpperCase() }))}
                  />
                  {gstErrors.panNumber && <p className="text-[9px] text-red-400 font-mono">{gstErrors.panNumber}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Legal Business Name</label>
                  <input
                    type="text"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none"
                    value={gstForm.legalName}
                    onChange={(e) => setGstForm(p => ({ ...p, legalName: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Trade Name (Branding)</label>
                  <input
                    type="text"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none"
                    value={gstForm.tradeName}
                    onChange={(e) => setGstForm(p => ({ ...p, tradeName: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Business Type</label>
                  <select
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                    value={gstForm.businessType}
                    onChange={(e) => setGstForm(p => ({ ...p, businessType: e.target.value }))}
                  >
                    <option value="Private Limited" className="bg-[#0A0A0B]">Private Limited (Pvt Ltd)</option>
                    <option value="Sole Proprietorship" className="bg-[#0A0A0B]">Sole Proprietorship</option>
                    <option value="Partnership Firm" className="bg-[#0A0A0B]">Partnership Firm</option>
                    <option value="Public Limited" className="bg-[#0A0A0B]">Public Limited</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">GST State / Code</label>
                  <input
                    type="text"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none"
                    value={gstForm.gstState}
                    onChange={(e) => setGstForm(p => ({ ...p, gstState: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Tax Percent Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none font-mono"
                    value={gstForm.taxPercentage}
                    onChange={(e) => setGstForm(p => ({ ...p, taxPercentage: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Tax Invoice Code Prefix</label>
                  <input
                    type="text"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none font-mono text-gold"
                    value={gstForm.invoicePrefix}
                    onChange={(e) => setGstForm(p => ({ ...p, invoicePrefix: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-secondary uppercase tracking-wider text-[10px]">Invoice Footer Message</label>
                <input
                  type="text"
                  required
                  className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none"
                  value={gstForm.invoiceFooter}
                  onChange={(e) => setGstForm(p => ({ ...p, invoiceFooter: e.target.value }))}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-4">
                <label className="flex items-center gap-2.5 p-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-gold w-3.5 h-3.5 cursor-pointer"
                    checked={gstForm.generateInvoice}
                    onChange={(e) => setGstForm(p => ({ ...p, generateInvoice: e.target.checked }))}
                  />
                  <div>
                    <span className="font-bold text-white block">Auto-generate GST tax receipts</span>
                    <span className="text-[9px] text-text-muted">Sends a direct formatted PDF voucher to the ticketed customer's email inbox</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-gold w-3.5 h-3.5 cursor-pointer"
                    checked={gstForm.enableGst}
                    onChange={(e) => setGstForm(p => ({ ...p, enableGst: e.target.checked }))}
                  />
                  <div>
                    <span className="font-bold text-white block">Levy SGST + CGST surcharge</span>
                    <span className="text-[9px] text-text-muted">Splits tax component proportionally into legal box office ledger streams</span>
                  </div>
                </label>
              </div>

              {/* GST Certificate upload preview */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wide text-[10px]">GST Registration Certificate</h4>
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="w-16 h-16 rounded overflow-hidden bg-[#121215] shrink-0 border border-white/10">
                    <img src={gstForm.certificateUrl} alt="GST Cert" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 text-left flex-1">
                    <span className="font-bold text-white text-[11px] block">Certificate_Form_REG-06.pdf</span>
                    <span className="text-[9px] text-text-secondary block font-mono">Size: 452 KB | Uploaded on {gstForm.registrationDate}</span>
                    <button
                      type="button"
                      onClick={() => alert("Simulated file upload! Choose file dialog would show here to replace REG-06 certificate.")}
                      className="text-gold font-bold uppercase text-[9px] hover:underline cursor-pointer bg-transparent border-0"
                    >
                      Upload new PDF certificate
                    </button>
                  </div>
                  <a
                    href={gstForm.certificateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase text-[9px] border border-white/5"
                  >
                    Preview Cert
                  </a>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-light text-black px-5 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/15"
                >
                  <Save className="w-4 h-4" />
                  <span>Lock Compliance tax settings</span>
                </button>
              </div>
            </form>
          )}

          {/* 3. BANK ACCOUNT PAGE */}
          {activeSection === "bank" && (
            <div className="space-y-6">
              {/* Existing accounts card list */}
              <div className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl text-xs">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">Connected Bank Accounts</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Primary bank routing networks for ticketing settlement dispatches</p>
                  </div>
                  {!showAddBank && (
                    <button
                      onClick={() => setShowAddBank(true)}
                      className="px-3.5 py-2 bg-gold hover:bg-gold-light text-black text-[10px] font-bold uppercase tracking-wider rounded-xl flex items-center gap-1 transition-colors cursor-pointer border-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Bank Route</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {bankAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-all"
                    >
                      <div className="flex gap-3.5 items-start">
                        <div className="p-3 bg-gold/5 border border-gold/10 text-gold rounded-xl shrink-0 mt-1">
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{acc.bankName}</span>
                            {acc.isPrimary && (
                              <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Primary Route
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              acc.status === "Verified" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                            }`}>
                              {acc.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-text-secondary text-[10px] font-mono">
                            <span>Holder: <strong className="text-white">{acc.holderName}</strong></span>
                            <span>A/C Number: <strong className="text-white">•••• •••• {acc.accountNumber.slice(-4)}</strong></span>
                            <span>IFSC: <strong className="text-white">{acc.ifscCode}</strong></span>
                            <span>UPI ID: <strong className="text-gold">{acc.upiId}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t border-white/5 md:border-0">
                        <button
                          type="button"
                          onClick={() => alert(`Simulated Passbook/Cheque previewer for Account: ${acc.accountNumber}`)}
                          className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-text-primary text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          View Documents
                        </button>
                        <button
                          type="button"
                          disabled={acc.isPrimary}
                          onClick={() => removeBankAccount(acc.id)}
                          className={`p-2 rounded-lg text-red-400 border transition-colors cursor-pointer ${
                            acc.isPrimary
                              ? "bg-neutral-800/20 border-white/5 opacity-30 cursor-not-allowed"
                              : "bg-red-500/5 hover:bg-red-500 hover:text-black border-red-500/10"
                          }`}
                          title="Remove bank routing account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add account modal/form inline */}
              {showAddBank && (
                <form onSubmit={handleAddBankAccount} className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl text-xs">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wide">Register New Bank Settlement Route</h3>
                      <p className="text-[11px] text-text-secondary mt-0.5">Introduce secondary commercial routes under secure KYC routing rules</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddBank(false)}
                      className="text-text-muted hover:text-white uppercase font-bold text-[10px]"
                    >
                      Close Form
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary"
                        placeholder="e.g. GRAND CINEVENUES PVT LTD"
                        value={newBank.holderName}
                        onChange={(e) => setNewBank(p => ({ ...p, holderName: e.target.value.toUpperCase() }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Bank Name *</label>
                      <input
                        type="text"
                        required
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary"
                        placeholder="e.g. HDFC Bank Ltd"
                        value={newBank.bankName}
                        onChange={(e) => setNewBank(p => ({ ...p, bankName: e.target.value }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Branch Location</label>
                      <input
                        type="text"
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary"
                        placeholder="e.g. Jubilee Hills Road 36"
                        value={newBank.branch}
                        onChange={(e) => setNewBank(p => ({ ...p, branch: e.target.value }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Account Type</label>
                      <select
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                        value={newBank.accountType}
                        onChange={(e) => setNewBank(p => ({ ...p, accountType: e.target.value }))}
                      >
                        <option value="Current" className="bg-[#0A0A0B]">Current Account</option>
                        <option value="Savings" className="bg-[#0A0A0B]">Savings Account</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Account Number *</label>
                      <input
                        type="password"
                        required
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary font-mono text-xs"
                        placeholder="Enter full digits"
                        value={newBank.accountNumber}
                        onChange={(e) => setNewBank(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Confirm Account Number *</label>
                      <input
                        type="text"
                        required
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary font-mono text-xs"
                        placeholder="Re-enter account digits"
                        value={newBank.confirmAccountNumber}
                        onChange={(e) => setNewBank(p => ({ ...p, confirmAccountNumber: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Bank IFSC Code *</label>
                      <input
                        type="text"
                        required
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary font-mono text-xs uppercase"
                        placeholder="e.g. HDFC0000240"
                        value={newBank.ifscCode}
                        onChange={(e) => setNewBank(p => ({ ...p, ifscCode: e.target.value }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">UPI Virtual ID</label>
                      <input
                        type="text"
                        className="bg-white/[0.02] border border-white/10 px-3.5 py-2 rounded-xl text-text-primary font-mono text-xs"
                        placeholder="e.g. cinevenue@hdfc"
                        value={newBank.upiId}
                        onChange={(e) => setNewBank(p => ({ ...p, upiId: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row items-center justify-between border-t border-white/5 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-gold w-3.5 h-3.5 cursor-pointer"
                        checked={newBank.isPrimary}
                        onChange={(e) => setNewBank(p => ({ ...p, isPrimary: e.target.checked }))}
                      />
                      <div>
                        <span className="font-bold text-white block">Mark as primary payout routing route</span>
                        <span className="text-[9px] text-text-secondary">This directs automatic box-office settlements to this target bank account</span>
                      </div>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddBank(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text-secondary rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer border-0"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gold hover:bg-gold-light text-black rounded-xl font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer border-0 shadow-lg shadow-gold/10"
                      >
                        Confirm Payout Route
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 4. PAYMENT SETTINGS */}
          {activeSection === "payment" && (
            <form onSubmit={handleSavePayment} className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl text-xs">
              <div className="border-b border-white/5 pb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Payment Gateways & Commission Matrix</h3>
                <p className="text-[11px] text-text-secondary mt-0.5">Enable customer checkout channels, set conveniences surcharges and configure cancellation rules</p>
              </div>

              {/* Payment Gateways connectivity status */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex gap-3 items-center">
                  <CreditCard className="w-8 h-8 text-gold" />
                  <div className="space-y-0.5 text-left">
                    <span className="font-bold text-white text-[11px] block">Razopay & PineLabs Payment Gateway Core</span>
                    <span className="text-[9px] text-text-secondary block font-mono">Status: Connected | API Handshake: Latency 42ms</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {paymentSettings.gatewayStatus}
                </span>
              </div>

              {/* Payment Methods checkboxes */}
              <div className="space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wide text-[10px]">Enable Customer Checkout Portals</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: "enableUpi", label: "UPI (GooglePay, PhonePe)" },
                    { id: "enableCreditCard", label: "Credit Cards (Visa, Mastercard)" },
                    { id: "enableDebitCard", label: "Debit Cards (RuPay, Visa)" },
                    { id: "enableNetBanking", label: "Net Banking (32 major banks)" },
                    { id: "enableWallets", label: "Wallets (Paytm, AmazonPay)" },
                    { id: "enableCashCounter", label: "Cash Bookings at Box Office" }
                  ].map(method => (
                    <label key={method.id} className="flex items-center gap-2.5 p-2.5 bg-white/[0.01] border border-white/5 hover:border-white/15 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        name={method.id}
                        className="accent-gold w-3.5 h-3.5 cursor-pointer"
                        checked={(paymentSettings as any)[method.id]}
                        onChange={handlePaymentChange}
                      />
                      <span className="font-semibold text-text-secondary text-[11px] select-none">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Settlement Settings */}
              <div className="border-t border-white/5 pt-4 space-y-4">
                <h4 className="font-bold text-white uppercase tracking-wide text-[10px]">Settlement & Payout Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Settlement Frequency</label>
                    <select
                      name="settlementFrequency"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary"
                      value={paymentSettings.settlementFrequency}
                      onChange={handlePaymentChange}
                    >
                      <option value="Daily" className="bg-[#0A0A0B]">Daily Auto-Discharge</option>
                      <option value="Weekly" className="bg-[#0A0A0B]">Weekly Ledger Sweep</option>
                      <option value="Monthly" className="bg-[#0A0A0B]">Monthly Bulk Settlement</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Weekly Settlement Day</label>
                    <select
                      name="settlementDay"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary"
                      value={paymentSettings.settlementDay}
                      onChange={handlePaymentChange}
                    >
                      {[
                        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
                      ].map(day => (
                        <option key={day} value={day} className="bg-[#0A0A0B]">{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">CineVenue Commission Share (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="commissionPercent"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono"
                      value={paymentSettings.commissionPercent}
                      onChange={handlePaymentChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Customer Convenience Fee (₹/seat)</label>
                    <input
                      type="number"
                      name="convenienceFee"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono text-gold"
                      value={paymentSettings.convenienceFee}
                      onChange={handlePaymentChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Ticket Cancellation Surcharge (%)</label>
                    <input
                      type="number"
                      name="cancellationCharge"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono"
                      value={paymentSettings.cancellationCharge}
                      onChange={handlePaymentChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Refund Settlement Window (hours)</label>
                    <input
                      type="number"
                      name="refundTime"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono"
                      value={paymentSettings.refundTime}
                      onChange={handlePaymentChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Minimum Single Booking Amount (₹)</label>
                    <input
                      type="number"
                      name="minBookingAmount"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono"
                      value={paymentSettings.minBookingAmount}
                      onChange={handlePaymentChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Maximum Single Booking Amount (₹)</label>
                    <input
                      type="number"
                      name="maxBookingAmount"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono"
                      value={paymentSettings.maxBookingAmount}
                      onChange={handlePaymentChange}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-text-secondary font-semibold">Interactive Gateway Timeout (sec)</label>
                    <input
                      type="number"
                      name="transactionTimeout"
                      className="bg-white/[0.02] border border-white/10 px-3 py-2 rounded-xl text-text-primary font-mono"
                      value={paymentSettings.transactionTimeout}
                      onChange={handlePaymentChange}
                    />
                  </div>
                </div>
              </div>

              {/* Online/Offline Switches */}
              <div className="flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-4">
                <label className="flex items-center gap-2.5 p-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-gold w-3.5 h-3.5 cursor-pointer"
                    checked={paymentSettings.enableOnline}
                    name="enableOnline"
                    onChange={handlePaymentChange}
                  />
                  <div>
                    <span className="font-bold text-white block">Enable Online Ticket Booking</span>
                    <span className="text-[9px] text-text-secondary">Allows movie lovers to search and reserve seats via the web app</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-gold w-3.5 h-3.5 cursor-pointer"
                    checked={paymentSettings.enableOffline}
                    name="enableOffline"
                    onChange={handlePaymentChange}
                  />
                  <div>
                    <span className="font-bold text-white block">Enable Box Office Offline POS booking</span>
                    <span className="text-[9px] text-text-secondary">Permits ushers and staff to issue manual layout print seats</span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-light text-black px-5 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/15"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Gateway settings</span>
                </button>
              </div>
            </form>
          )}

          {/* 5. EMAIL SETTINGS */}
          {activeSection === "email" && (
            <div className="space-y-6">
              <form onSubmit={handleSaveEmail} className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl text-xs">
                <div className="border-b border-white/5 pb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wide">SMTP Email Servers Configurations</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Customize transaction receipt SMTP nodes, encryption keys and sender IDs</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowEmailPreview(!showEmailPreview)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase text-[9px] border border-white/5 cursor-pointer transition-colors"
                    >
                      {showEmailPreview ? "Hide Preview" : "Template Preview"}
                    </button>
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      className="px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded font-bold uppercase text-[9px] cursor-pointer"
                    >
                      Test SMTP
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Sender Name Display</label>
                    <input
                      type="text"
                      required
                      className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary"
                      value={emailConfig.senderName}
                      onChange={(e) => setEmailConfig(p => ({ ...p, senderName: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Sender Outgoing Email</label>
                    <input
                      type="email"
                      required
                      className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                      value={emailConfig.senderEmail}
                      onChange={(e) => setEmailConfig(p => ({ ...p, senderEmail: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Reply-To Address</label>
                    <input
                      type="email"
                      required
                      className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                      value={emailConfig.replyToEmail}
                      onChange={(e) => setEmailConfig(p => ({ ...p, replyToEmail: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">SMTP Server Host</label>
                    <input
                      type="text"
                      required
                      className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig(p => ({ ...p, smtpHost: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">SMTP Handshake Port</label>
                    <input
                      type="text"
                      required
                      className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig(p => ({ ...p, smtpPort: e.target.value.replace(/\D/g, "") }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">SMTP Server Encryption</label>
                    <select
                      className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer font-semibold"
                      value={emailConfig.encryption}
                      onChange={(e) => setEmailConfig(p => ({ ...p, encryption: e.target.value }))}
                    >
                      <option value="TLS" className="bg-[#0A0A0B]">TLS / STARTTLS (Secure)</option>
                      <option value="SSL" className="bg-[#0A0A0B]">SSL Dedicated Encryption</option>
                      <option value="NONE" className="bg-[#0A0A0B]">None / Cleartext Sockets</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">SMTP Server Username</label>
                    <input
                      type="text"
                      required
                      className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                      value={emailConfig.smtpUsername}
                      onChange={(e) => setEmailConfig(p => ({ ...p, smtpUsername: e.target.value }))}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">SMTP Relay Password</label>
                    <div className="relative">
                      <input
                        type={showEmailPass ? "text" : "password"}
                        required
                        className="w-full bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                        value={emailConfig.smtpPassword}
                        onChange={(e) => setEmailConfig(p => ({ ...p, smtpPassword: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailPass(!showEmailPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white bg-transparent border-0 cursor-pointer"
                      >
                        {showEmailPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email triggers checklist */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white uppercase tracking-wide text-[10px]">Auto-Trigger Notifications Mailboxes</h4>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-gold w-3.5 h-3.5"
                        checked={emailConfig.enableEmails}
                        onChange={(e) => setEmailConfig(p => ({ ...p, enableEmails: e.target.checked }))}
                      />
                      <span className="font-bold text-text-primary">Enable Email Alerts</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { id: "confirmConfirm", label: "Booking Confirmation Receipt", desc: "Instantly sends a tax invoice PDF once payment captures" },
                      { id: "confirmCancel", label: "Cancellation Slips Voucher", desc: "Advises user about seat release and cancellation percentage charges" },
                      { id: "confirmRefund", label: "Refund Clearance Statement", desc: "Mails banks transaction references once refund clearance approves" },
                      { id: "confirmReminder", label: "Showing Reminder alert", desc: "Sends an automated countdown remind 2 hours before screen time" }
                    ].map(trig => (
                      <label key={trig.id} className="flex gap-2.5 p-2.5 bg-white/[0.01] border border-white/5 rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-gold w-3.5 h-3.5 mt-0.5 cursor-pointer"
                          checked={(emailConfig as any)[trig.id]}
                          disabled={!emailConfig.enableEmails}
                          onChange={(e) => setEmailConfig(p => ({ ...p, [trig.id]: e.target.checked }))}
                        />
                        <div className="space-y-0.5 text-left">
                          <span className="font-bold text-text-primary block text-[11px]">{trig.label}</span>
                          <span className="text-[9px] text-text-muted leading-relaxed block">{trig.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <button
                    type="submit"
                    className="bg-gold hover:bg-gold-light text-black px-5 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/15"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Outgoing SMTP configurations</span>
                  </button>
                </div>
              </form>

              {/* Template preview panel */}
              {showEmailPreview && (
                <div className="bg-[#121215] border border-gold/20 rounded-2xl p-6 shadow-2xl text-left space-y-4 text-xs animate-[fadeIn_0.5s_ease-out]">
                  <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                    <span className="text-[10px] text-gold font-mono uppercase tracking-wider">CineVenue Ticket Mail HTML Template</span>
                    <button
                      onClick={() => setShowEmailPreview(false)}
                      className="text-text-muted hover:text-white"
                    >
                      Close Preview
                    </button>
                  </div>
                  <div className="bg-white text-black p-6 rounded-xl max-w-md mx-auto space-y-4 shadow-xl">
                    <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
                      <h4 className="font-bold text-gray-900 text-sm font-sans tracking-tight">CineVenue Bookings</h4>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded font-mono font-bold">PAID</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Movie Ticket Confirmation</p>
                      <h3 className="text-base font-bold text-black font-sans leading-tight">Kalki 2898 AD (3D IMAX Laser)</h3>
                      <p className="text-xs text-gray-700">Venue: <strong>{theatre.name}</strong></p>
                      <p className="text-xs text-gray-700">Timing: <strong>Today, 7:30 PM (Evening Show)</strong></p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3 text-xs">
                      <div>
                        <span className="text-gray-400 block uppercase tracking-wider text-[9px]">Reserved Seats</span>
                        <span className="text-gray-900 font-bold font-mono">A3, A4 (Gold Circle)</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block uppercase tracking-wider text-[9px]">Total Amount Paid</span>
                        <span className="text-[#F59E0B] font-bold font-mono">₹530.00 (Incl. GST)</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-2 space-y-1">
                      <div className="w-24 h-24 bg-gray-50 border border-gray-200 flex items-center justify-center p-1 rounded-lg">
                        <span className="text-[9px] font-mono text-gray-400 text-center">QR Code Voucher [BK-829104]</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono tracking-widest font-bold">BK-829104</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6. SMS CONFIGURATION */}
          {activeSection === "sms" && (
            <form onSubmit={handleSaveSms} className="bg-[#121215] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl text-xs">
              <div className="border-b border-white/5 pb-4 flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">SMS Gateway Providers Integration</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">Link Twilio, Gupshup, or MSG91 credentials to dispatch OTP vouchers, reminders, and promotional alerts</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestSms}
                  className="px-3 py-1.5 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 rounded font-bold uppercase text-[9px] cursor-pointer"
                >
                  Test SMS
                </button>
              </div>

              {/* SMS Balance widget */}
              <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider font-bold block">DLT SMS Route Balance</span>
                  <span className="text-lg font-mono font-bold text-gold">{smsBalance}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSmsBalance("₹10,000.00 (Approx. 66,666 SMS)");
                    showToast("Surcharge recharged via primary HDFC account!");
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded font-bold uppercase text-[9px] border border-white/5 cursor-pointer"
                >
                  Recharge DLT route
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">SMS Gateway Provider</label>
                  <select
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none cursor-pointer"
                    value={smsConfig.provider}
                    onChange={(e) => setSmsConfig(p => ({ ...p, provider: e.target.value }))}
                  >
                    <option value="Twilio" className="bg-[#0A0A0B]">Twilio API Cloud</option>
                    <option value="Gupshup" className="bg-[#0A0A0B]">Gupshup SMS Enterprise</option>
                    <option value="Msg91" className="bg-[#0A0A0B]">Msg91 Route</option>
                    <option value="SMSHorizon" className="bg-[#0A0A0B]">SMS Horizon India</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Sender ID (DLT Registered)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary uppercase font-mono font-bold text-center w-36 tracking-widest text-sm focus:border-gold focus:outline-none"
                    value={smsConfig.senderId}
                    onChange={(e) => setSmsConfig(p => ({ ...p, senderId: e.target.value.toUpperCase() }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">API Authentication Key</label>
                  <input
                    type="text"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                    value={smsConfig.apiKey}
                    onChange={(e) => setSmsConfig(p => ({ ...p, apiKey: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">API Secret Key / Token</label>
                  <div className="relative">
                    <input
                      type={showSmsSecret ? "text" : "password"}
                      required
                      className="w-full bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                      value={smsConfig.apiSecret}
                      onChange={(e) => setSmsConfig(p => ({ ...p, apiSecret: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmsSecret(!showSmsSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white bg-transparent border-0 cursor-pointer"
                    >
                      {showSmsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Primary Template ID (DLT Registered)</label>
                  <input
                    type="text"
                    required
                    className="bg-white/[0.02] border border-white/10 px-3.5 py-2.5 rounded-xl text-text-primary font-mono text-xs"
                    placeholder="e.g. DLT_1107161829381928"
                    value={smsConfig.templateId}
                    onChange={(e) => setSmsConfig(p => ({ ...p, templateId: e.target.value.replace(/\D/g, "") }))}
                  />
                </div>
              </div>

              {/* SMS triggers checkboxes */}
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white uppercase tracking-wide text-[10px]">Auto-Trigger Mobile Notifications</h4>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-gold w-3.5 h-3.5"
                      checked={smsConfig.enableSms}
                      onChange={(e) => setSmsConfig(p => ({ ...p, enableSms: e.target.checked }))}
                    />
                    <span className="font-bold text-text-primary">Enable SMS Alerts</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: "confirmConfirm", label: "Booking Confirm OTP / SMS Voucher", desc: "Dispatches SMS voucher with seat row details instantly" },
                    { id: "confirmCancel", label: "Cancellation Slips SMS", desc: "Confirms seat release and refund initiation status" },
                    { id: "confirmRefund", label: "Refund Clearance SMS", desc: "Mails payout reference codes directly to mobile" },
                    { id: "confirmReminder", label: "Showtime Countdown reminders", desc: "Sends automatic mobile text 1 hour before showtime" },
                    { id: "promotional", label: "Promotional bulk messages", desc: "Permits Friday trailer marketing campaigns" },
                    { id: "otp", label: "Ushers verification PIN OTP", desc: "Sends dual auth login checks for staff safety" }
                  ].map(trig => (
                    <label key={trig.id} className="flex gap-2.5 p-2.5 bg-white/[0.01] border border-white/5 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-gold w-3.5 h-3.5 mt-0.5 cursor-pointer"
                        checked={(smsConfig as any)[trig.id]}
                        disabled={!smsConfig.enableSms}
                        onChange={(e) => setSmsConfig(p => ({ ...p, [trig.id]: e.target.checked }))}
                      />
                      <div className="space-y-0.5 text-left">
                        <span className="font-bold text-text-primary block text-[11px]">{trig.label}</span>
                        <span className="text-[9px] text-text-muted leading-relaxed block">{trig.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-white/5">
                <button
                  type="submit"
                  className="bg-gold hover:bg-gold-light text-black px-5 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-lg shadow-gold/15"
                >
                  <Save className="w-4 h-4" />
                  <span>Update SMS Route credentials</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
