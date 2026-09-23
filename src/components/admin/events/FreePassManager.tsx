import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  PlusCircle,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Mail,
  Ban,
  Building2,
  User,
  AlertTriangle,
  RefreshCw,
  FileSpreadsheet,
  QrCode
} from 'lucide-react';
import { getEvents } from '../../../services/eventBookingService';
import type { EventItem } from '../../../types/eventBooking';

interface FreePassCategory {
  categoryId: string;
  name: string;
  allocatedCapacity: number;
  issuedCount: number;
  remaining: number;
  maxPerPerson: number;
  maxPerOrganisation: number;
  approvalRequired: boolean;
  status: string;
}

interface FreePassRecord {
  _id: string;
  ticketId: string;
  recipient?: {
    name: string;
    email: string;
    phone: string;
    organisation: string;
    designation: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  passCategory: string;
  status: 'VALID' | 'USED' | 'CANCELLED' | 'REFUNDED';
  checkedInAt?: string;
  createdAt: string;
}

interface PassRequestRecord {
  _id: string;
  requestId: string;
  applicantName: string;
  email: string;
  phone: string;
  organisation: string;
  designation: string;
  categoryName: string;
  requestedQuantity: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function FreePassManager() {
  const [events, setEvents] = useState<EventItem[]>(() => getEvents());
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'issued' | 'requests' | 'categories'>('issued');

  // Stats & categories
  const [capacityStats, setCapacityStats] = useState({
    totalCapacity: 1000,
    paidSold: 0,
    freeIssued: 0,
    reserved: 0,
    available: 1000,
    percentageCommitted: 0,
  });

  const [categories, setCategories] = useState<FreePassCategory[]>([
    { categoryId: 'cat-1', name: 'PRESS / MEDIA', allocatedCapacity: 100, issuedCount: 42, remaining: 58, maxPerPerson: 2, maxPerOrganisation: 5, approvalRequired: true, status: 'ACTIVE' },
    { categoryId: 'cat-2', name: 'GUEST', allocatedCapacity: 50, issuedCount: 20, remaining: 30, maxPerPerson: 2, maxPerOrganisation: 4, approvalRequired: false, status: 'ACTIVE' },
    { categoryId: 'cat-3', name: 'SPONSOR & PARTNER', allocatedCapacity: 50, issuedCount: 50, remaining: 0, maxPerPerson: 4, maxPerOrganisation: 10, approvalRequired: true, status: 'EXHAUSTED' },
    { categoryId: 'cat-4', name: 'CAST & CREW', allocatedCapacity: 50, issuedCount: 15, remaining: 35, maxPerPerson: 2, maxPerOrganisation: 5, approvalRequired: false, status: 'ACTIVE' },
  ]);

  const [issuedPasses, setIssuedPasses] = useState<FreePassRecord[]>([
    {
      _id: 'pass-1',
      ticketId: 'CVT-PASS-7842',
      recipient: { name: 'Rahul Sharma', email: 'rahul.s@timesmedia.in', phone: '+91 98765 43210', organisation: 'Times Media Network', designation: 'Senior Entertainment Editor' },
      passCategory: 'PRESS / MEDIA',
      status: 'VALID',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'pass-2',
      ticketId: 'CVT-PASS-7843',
      recipient: { name: 'Ananya Roy', email: 'ananya@redfm.in', phone: '+91 98111 22334', organisation: 'Red FM 93.5', designation: 'Radio Host' },
      passCategory: 'PRESS / MEDIA',
      status: 'USED',
      checkedInAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'pass-3',
      ticketId: 'CVT-PASS-7844',
      recipient: { name: 'Vikram Seth', email: 'vikram@hydsponsors.com', phone: '+91 94444 55555', organisation: 'Titanium Sponsor Group', designation: 'Director of Brand Partnerships' },
      passCategory: 'SPONSOR & PARTNER',
      status: 'VALID',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [passRequests, setPassRequests] = useState<PassRequestRecord[]>([
    {
      _id: 'req-1',
      requestId: 'REQ-MEDIA-8812',
      applicantName: 'Karthik Varma',
      email: 'karthik@cinemagaze.com',
      phone: '+91 99887 76655',
      organisation: 'CinemaGaze Daily',
      designation: 'Lead Reporter',
      categoryName: 'PRESS / MEDIA',
      requestedQuantity: 2,
      reason: 'Covering trailer release ceremony for weekend front-page column.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'req-2',
      requestId: 'REQ-MEDIA-8813',
      applicantName: 'Priya Nambiar',
      email: 'priya@filmjournal.in',
      phone: '+91 98777 66554',
      organisation: 'The Film Journal India',
      designation: 'Photojournalist',
      categoryName: 'PRESS / MEDIA',
      requestedQuantity: 1,
      reason: 'Live photography and media interview coverage.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Manual Issue Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organisation: '',
    designation: '',
    categoryId: categories[0]?.categoryId || '',
    quantity: 1,
    notes: '',
  });

  // Bulk CSV Upload State
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkParsedRecords, setBulkParsedRecords] = useState<any[]>([]);

  // Filtered passes
  const filteredPasses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return issuedPasses;
    return issuedPasses.filter(
      (p) =>
        p.ticketId.toLowerCase().includes(q) ||
        p.recipient?.name.toLowerCase().includes(q) ||
        p.recipient?.email.toLowerCase().includes(q) ||
        p.recipient?.organisation.toLowerCase().includes(q) ||
        p.passCategory.toLowerCase().includes(q)
    );
  }, [issuedPasses, searchQuery]);

  const handleIssuePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.organisation) {
      setNotification({ type: 'error', message: 'Please fill in Name, Email, and Organisation.' });
      return;
    }

    const cat = categories.find((c) => c.categoryId === formData.categoryId);
    const catName = cat ? cat.name : 'COMPLIMENTARY PASS';

    const newPass: FreePassRecord = {
      _id: `pass-${Date.now()}`,
      ticketId: `CVT-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        organisation: formData.organisation,
        designation: formData.designation,
      },
      passCategory: catName,
      status: 'VALID',
      createdAt: new Date().toISOString(),
    };

    setIssuedPasses([newPass, ...issuedPasses]);
    setCapacityStats((prev) => ({
      ...prev,
      freeIssued: prev.freeIssued + Number(formData.quantity),
      available: Math.max(0, prev.available - Number(formData.quantity)),
    }));

    setIsIssueModalOpen(false);
    setNotification({
      type: 'success',
      message: `✅ Free pass ${newPass.ticketId} successfully issued to ${formData.name} (${formData.organisation})! PDF generated and dispatched.`,
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      organisation: '',
      designation: '',
      categoryId: categories[0]?.categoryId || '',
      quantity: 1,
      notes: '',
    });
  };

  const handleCancelPass = (ticketId: string) => {
    if (!window.confirm(`Are you sure you want to cancel pass ${ticketId}? Capacity will be returned to the pool.`)) return;

    setIssuedPasses((prev) =>
      prev.map((p) => (p.ticketId === ticketId ? { ...p, status: 'CANCELLED' } : p))
    );
    setCapacityStats((prev) => ({
      ...prev,
      freeIssued: Math.max(0, prev.freeIssued - 1),
      available: prev.available + 1,
    }));
    setNotification({ type: 'success', message: `Pass ${ticketId} cancelled. Capacity restored to available pool.` });
  };

  const handleApproveRequest = (reqId: string) => {
    const req = passRequests.find((r) => r.requestId === reqId);
    if (!req) return;

    const newPass: FreePassRecord = {
      _id: `pass-${Date.now()}`,
      ticketId: `CVT-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: {
        name: req.applicantName,
        email: req.email,
        phone: req.phone,
        organisation: req.organisation,
        designation: req.designation,
      },
      passCategory: req.categoryName,
      status: 'VALID',
      createdAt: new Date().toISOString(),
    };

    setIssuedPasses([newPass, ...issuedPasses]);
    setPassRequests((prev) =>
      prev.map((r) => (r.requestId === reqId ? { ...r, status: 'APPROVED' } : r))
    );
    setCapacityStats((prev) => ({
      ...prev,
      freeIssued: prev.freeIssued + req.requestedQuantity,
      available: Math.max(0, prev.available - req.requestedQuantity),
    }));

    setNotification({
      type: 'success',
      message: `Request ${req.requestId} approved! Free pass ${newPass.ticketId} issued and emailed to ${req.email}.`,
    });
  };

  const handleRejectRequest = (reqId: string) => {
    setPassRequests((prev) =>
      prev.map((r) => (r.requestId === reqId ? { ...r, status: 'REJECTED' } : r))
    );
    setNotification({ type: 'error', message: `Request ${reqId} rejected. Zero inventory consumed.` });
  };

  const handleParseCsv = (text: string) => {
    setBulkCsvText(text);
    const lines = text.trim().split('\n');
    if (lines.length <= 1) {
      setBulkParsedRecords([]);
      return;
    }

    // Skip header line
    const records = lines.slice(1).map((line, idx) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        id: idx + 1,
        name: parts[0] || 'Unknown',
        email: parts[1] || '',
        phone: parts[2] || '',
        organisation: parts[3] || '',
        designation: parts[4] || '',
        category: parts[5] || 'PRESS / MEDIA',
        isValid: !!(parts[0] && parts[1] && parts[1].includes('@') && parts[3]),
      };
    });

    setBulkParsedRecords(records);
  };

  const handleConfirmBulkIssue = () => {
    const validOnes = bulkParsedRecords.filter((r) => r.isValid);
    if (validOnes.length === 0) {
      alert('No valid records found to issue passes.');
      return;
    }

    const created = validOnes.map((r) => ({
      _id: `pass-${Date.now()}-${r.id}`,
      ticketId: `CVT-PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: {
        name: r.name,
        email: r.email,
        phone: r.phone,
        organisation: r.organisation,
        designation: r.designation,
      },
      passCategory: r.category,
      status: 'VALID' as const,
      createdAt: new Date().toISOString(),
    }));

    setIssuedPasses([...created, ...issuedPasses]);
    setCapacityStats((prev) => ({
      ...prev,
      freeIssued: prev.freeIssued + created.length,
      available: Math.max(0, prev.available - created.length),
    }));

    setIsBulkModalOpen(false);
    setNotification({
      type: 'success',
      message: `🎉 Successfully bulk issued ${created.length} complimentary passes! All passes rendered to vector PDF and queued for email delivery.`,
    });
  };

  return (
    <div className="space-y-6 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-gold" />
            Complimentary & Free Pass Management
          </h2>
          <p className="text-xs text-white/50">
            Issue and verify press passes, media credentials, VIP sponsor invites, and guest passes with zero-trust QR passes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold text-black font-semibold text-xs hover:bg-gold/90 transition-all cursor-pointer shadow-lg shadow-gold/20"
          >
            <PlusCircle className="w-4 h-4" /> Issue Free Pass
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Bulk CSV Upload
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* UNIFIED CAPACITY METRICS CARD */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-[#0B0F17] border border-white/10 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-white/50 uppercase font-mono">Total Event Capacity</span>
          <p className="text-xl font-bold text-white">{capacityStats.totalCapacity.toLocaleString()}</p>
        </div>
        <div className="bg-[#0B0F17] border border-white/10 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-white/50 uppercase font-mono">Paid Tickets Sold</span>
          <p className="text-xl font-bold text-emerald-400">600</p>
        </div>
        <div className="bg-[#0B0F17] border border-white/10 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-white/50 uppercase font-mono">Free Passes Issued</span>
          <p className="text-xl font-bold text-gold">{issuedPasses.filter(p => p.status === 'VALID' || p.status === 'USED').length}</p>
        </div>
        <div className="bg-[#0B0F17] border border-white/10 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] text-white/50 uppercase font-mono">Active Reserved</span>
          <p className="text-xl font-bold text-amber-400">20</p>
        </div>
        <div className="bg-[#0B0F17] border border-white/10 p-3.5 rounded-xl space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-white/50 uppercase font-mono">Remaining Capacity</span>
          <p className="text-xl font-bold text-cyan-400">
            {capacityStats.totalCapacity - 600 - issuedPasses.filter(p => p.status === 'VALID' || p.status === 'USED').length - 20}
          </p>
        </div>
      </div>

      {/* CATEGORY CAPACITY ALLOCATION STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {categories.map((c) => {
          const isExhausted = c.remaining <= 0;
          return (
            <div key={c.categoryId} className="bg-white/5 border border-white/10 p-3 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">{c.name}</span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold uppercase ${
                    isExhausted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isExhausted ? 'EXHAUSTED' : 'AVAILABLE'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-white/60 font-mono">
                <span>Issued: {c.issuedCount} / {c.allocatedCapacity}</span>
                <span className="text-gold font-bold">{c.remaining} left</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gold h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (c.issuedCount / c.allocatedCapacity) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* SUB TABS: ISSUED PASSES vs PUBLIC REQUESTS */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex gap-2 border-b border-white/10 pb-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('issued')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'issued' ? 'bg-gold/20 text-gold border border-gold/40' : 'text-white/60 hover:text-white'
              }`}
            >
              Issued Passes ({filteredPasses.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'requests' ? 'bg-gold/20 text-gold border border-gold/40' : 'text-white/60 hover:text-white'
              }`}
            >
              Public Requests ({passRequests.filter((r) => r.status === 'PENDING').length})
              {passRequests.filter((r) => r.status === 'PENDING').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipient, org, pass ID..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-gold outline-none"
            />
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* TAB 1: ISSUED PASSES TABLE */}
        {activeTab === 'issued' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/5 text-white/40 uppercase font-mono text-[9px] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Pass ID & Category</th>
                  <th className="px-4 py-3">Recipient Details</th>
                  <th className="px-4 py-3">Organisation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredPasses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-white/40">
                      No complimentary passes found matching your filter.
                    </td>
                  </tr>
                ) : (
                  filteredPasses.map((pass) => (
                    <tr key={pass._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-white text-xs">{pass.ticketId}</p>
                        <span className="text-[9px] font-mono text-gold bg-gold/10 px-1.5 py-0.5 rounded border border-gold/30">
                          {pass.passCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{pass.recipient?.name || 'Guest'}</p>
                        <p className="text-[11px] text-white/40">{pass.recipient?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white/90 font-medium">{pass.recipient?.organisation || 'Direct Invitee'}</p>
                        <p className="text-[10px] text-white/40">{pass.recipient?.designation || 'Staff / Guest'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                            pass.status === 'VALID'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : pass.status === 'USED'
                              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {pass.status}
                        </span>
                        {pass.checkedInAt && (
                          <p className="text-[9px] text-white/40 font-mono mt-0.5">
                            Scanned {new Date(pass.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => alert(`Downloading PDF ticket pass for ${pass.ticketId}`)}
                            title="Download Vector PDF Pass"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => alert(`Email resent to ${pass.recipient?.email}`)}
                            title="Resend Pass via Email"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gold hover:text-gold/80 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          {pass.status === 'VALID' && (
                            <button
                              onClick={() => handleCancelPass(pass.ticketId)}
                              title="Cancel Pass & Return Capacity"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PUBLIC PASS REQUESTS & APPROVALS */}
        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead className="bg-white/5 text-white/40 uppercase font-mono text-[9px] border-b border-white/10">
                <tr>
                  <th className="px-4 py-3">Request ID & Category</th>
                  <th className="px-4 py-3">Applicant Details</th>
                  <th className="px-4 py-3">Organisation & Media</th>
                  <th className="px-4 py-3">Reason / Justification</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {passRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/40">
                      No public pass requests submitted.
                    </td>
                  </tr>
                ) : (
                  passRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-white text-xs">{req.requestId}</p>
                        <span className="text-[9px] font-mono text-gold bg-gold/10 px-1.5 py-0.5 rounded border border-gold/30">
                          {req.categoryName} ({req.requestedQuantity} pass)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{req.applicantName}</p>
                        <p className="text-[11px] text-white/40">{req.email}</p>
                        <p className="text-[10px] text-white/30">{req.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{req.organisation}</p>
                        <p className="text-[10px] text-white/40">{req.designation}</p>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate" title={req.reason}>
                        <p className="text-white/70 text-[11px] italic">"{req.reason}"</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                            req.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : req.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveRequest(req.requestId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.requestId)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/30 font-mono">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: MANUAL ISSUE FREE PASS */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-gold" />
                Issue Complimentary Pass
              </h3>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-white/40 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssuePass} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Pass Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                  >
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId} disabled={c.remaining <= 0}>
                        {c.name} ({c.remaining} remaining)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Quantity (Passes) *</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Recipient Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. media@example.com"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Organisation / Company *</label>
                  <input
                    type="text"
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    placeholder="e.g. ABC Media / Red FM"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-white/50 uppercase mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Senior Reporter / Film Critic"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-gold"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                ⚡ <strong>Admission: Complimentary (₹0)</strong>. This pass will be atomically deducted from the event's capacity. No payment gateway will be triggered. A secure vector PDF with a cryptographic QR code will be generated and emailed automatically.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold/90 text-black text-xs font-bold cursor-pointer shadow-lg shadow-gold/20"
                >
                  Issue Pass Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK CSV UPLOAD */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-left shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gold" />
                Bulk Complimentary Pass Issuance (CSV)
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-white/40 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-white/60">
                Paste CSV data or columns formatted as: <code className="text-gold font-mono">Name, Email, Phone, Organisation, Designation, Pass Type</code>.
              </p>

              <textarea
                rows={5}
                value={bulkCsvText}
                onChange={(e) => handleParseCsv(e.target.value)}
                placeholder={`Name, Email, Phone, Organisation, Designation, Pass Type\nArjun Reddy, arjun@media.in, 9876543210, Telugu Cinema Today, Editor, PRESS / MEDIA\nSuresh Varma, suresh@guest.com, 9811122233, Industry Guild, Member, GUEST`}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-[11px] text-white focus:border-gold outline-none"
              />

              {bulkParsedRecords.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/50">
                      Parsed: <strong className="text-white">{bulkParsedRecords.length} records</strong> (
                      <span className="text-emerald-400">{bulkParsedRecords.filter((r) => r.isValid).length} Valid</span>,{' '}
                      <span className="text-rose-400">{bulkParsedRecords.filter((r) => !r.isValid).length} Invalid</span>)
                    </span>
                    <span className="text-gold font-mono">Remaining Capacity: {capacityStats.available}</span>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-white/10 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-white/5 text-white/50 uppercase font-mono text-[8px]">
                        <tr>
                          <th className="px-3 py-1.5">Name</th>
                          <th className="px-3 py-1.5">Email</th>
                          <th className="px-3 py-1.5">Organisation</th>
                          <th className="px-3 py-1.5">Validation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bulkParsedRecords.map((rec) => (
                          <tr key={rec.id} className="text-white/80">
                            <td className="px-3 py-1.5">{rec.name}</td>
                            <td className="px-3 py-1.5 font-mono">{rec.email}</td>
                            <td className="px-3 py-1.5">{rec.organisation}</td>
                            <td className="px-3 py-1.5">
                              {rec.isValid ? (
                                <span className="text-emerald-400 font-bold">✓ Ready</span>
                              ) : (
                                <span className="text-rose-400 font-bold">✗ Incomplete</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBulkIssue}
                  disabled={bulkParsedRecords.filter((r) => r.isValid).length === 0}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold/90 text-black text-xs font-bold cursor-pointer disabled:opacity-40 shadow-lg shadow-gold/20"
                >
                  Confirm & Issue {bulkParsedRecords.filter((r) => r.isValid).length} Passes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
