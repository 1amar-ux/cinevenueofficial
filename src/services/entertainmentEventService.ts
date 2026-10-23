import { 
  EventProposalRecord, 
  ProposalStatus, 
  ProposalFollowUp, 
  ProposalInternalNote, 
  EventQuotation, 
  QuotationItem,
  EntertainmentCategoryKey 
} from "../types/entertainmentEvent";
import apiClient from "./apiClient";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { saveEvent } from "./eventBookingService";

const PROPOSALS_STORAGE_KEY = "cine_entertainment_event_proposals";

// In-memory / initial seed proposals for immediate rich operational demonstration
const INITIAL_ENTERTAINMENT_PROPOSALS: EventProposalRecord[] = [
  {
    id: "CVE-PROP-2026-00101",
    referenceId: "CVE-PROP-2026-00101",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    status: "Under Review",
    category: "movie_promotions",
    eventType: "Pre-Release Events",
    eventName: "Hari Hara Veera Mallu - Grand Pre-Release Gala",
    eventDescription: "Massive stadium pre-release celebration featuring live stage performances, 4K LED mapping, and teaser reveal.",
    preferredDate: "2026-11-14",
    alternativeDate: "2026-11-15",
    preferredCity: "Hyderabad",
    preferredVenue: "LB Stadium, Hyderabad",
    expectedAudience: 25000,
    expectedDurationHours: 4,
    isPaidEvent: false,
    organizerType: "Production House",
    companyName: "Mega Surya Productions",
    contactPerson: "K. Raghunath Varma",
    mobile: "+91 98480 22334",
    email: "raghu.varma@megasuryaprod.com",
    officeAddress: "Jubilee Hills Road No. 36, Hyderabad",
    websiteUrl: "https://megasuryaprod.com",
    isFilmRelated: true,
    movieTitle: "Hari Hara Veera Mallu",
    productionHouseName: "Mega Surya Productions",
    directorName: "Jyothi Krishna",
    producerName: "A.M. Rathnam",
    leadActors: "Pawan Kalyan, Nidhhi Agerwal, Bobby Deol",
    musicDirector: "M. M. Keeravani",
    celebrityAttendanceStatus: "Confirmed",
    servicesRequired: [
      "Complete Event Planning and Management",
      "Venue Search and Booking",
      "Stage Setup",
      "LED Screens",
      "Sound Systems",
      "Lighting",
      "Truss and Production Equipment",
      "Live Streaming",
      "Security and Crowd Management",
      "Guest Hospitality"
    ],
    estimatedBudget: 4500000,
    isQuotRequestedWithoutBudget: false,
    budgetFlexibility: "Flexible Budget",
    expectedDeliverables: "Turnkey arena management, satellite uplinking, 40ft Jimmy Jib camera setups and 200 VIP bouncer security grid.",
    specialRequirements: "Separate red-carpet holding lounge and air-conditioned VIP green rooms for star cast.",
    assignedEventManager: "Vikram Reddy (Sr. Production Head)",
    assignedManagerEmail: "vikram.reddy@cinevenue.com",
    lastFollowUpDate: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0],
    nextFollowUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    internalNotes: [
      {
        id: "NOTE-1",
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        authorName: "Vikram Reddy",
        note: "Police commissionerate clearance applied. Venue inspection scheduled for Wednesday.",
        isPrivate: true
      }
    ],
    followUps: [
      {
        id: "FU-1",
        date: new Date(Date.now() - 1 * 86400000).toISOString(),
        type: "Meeting",
        summary: "Met with Executive Producer at Park Hyatt. Finalized stage footprint: 120ft x 60ft.",
        nextFollowUpDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        authorName: "Vikram Reddy"
      }
    ],
    isConvertedToEvent: false
  },
  {
    id: "CVE-PROP-2026-00102",
    referenceId: "CVE-PROP-2026-00102",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "Quotation Sent",
    category: "music_live",
    eventType: "Live Music Concerts",
    eventName: "Anirudh Ravichander - Hukum Live Arena Tour",
    eventDescription: "High-octane concert arena spectacle featuring multi-genre live playback, laser choreography, and pyrotechnics.",
    preferredDate: "2026-12-05",
    preferredCity: "Bangalore",
    preferredVenue: "Palace Grounds, Bengaluru",
    expectedAudience: 18000,
    expectedDurationHours: 3.5,
    isPaidEvent: true,
    ticketPriceRange: "₹999 - ₹7,999",
    organizerType: "Artist Management",
    companyName: "Pulse Entertainment World",
    contactPerson: "Arjun Nair",
    mobile: "+91 97401 55667",
    email: "arjun@pulseworld.live",
    isFilmRelated: false,
    artistNames: "Anirudh Ravichander & 14-piece Band",
    performanceType: "Full Live Band & Vocals",
    performersCount: 18,
    performanceDurationMins: 180,
    technicalRiderNotes: "Digico Quantum 338 mixer, d&b GSL line arrays, 40 motorized Martin beam fixtures.",
    servicesRequired: [
      "Stage Setup",
      "Sound Systems",
      "Lighting",
      "LED Screens",
      "Ticketing and Online Registration",
      "QR Ticket Validation",
      "Security and Crowd Management"
    ],
    estimatedBudget: 8500000,
    isQuotRequestedWithoutBudget: false,
    budgetFlexibility: "Exact Budget",
    quotation: {
      id: "QUO-99120",
      quotationNumber: "CINE-QUO-2026-0089",
      proposalId: "CVE-PROP-2026-00102",
      revision: 1,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      validUntil: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
      status: "Sent",
      items: [
        { id: "QI-1", serviceName: "Concert Stage & Heavy Duty Roof Truss", description: "100x60ft goal post truss with hydraulic risers", quantity: 1, unit: "Setup", unitPrice: 1800000, totalPrice: 1800000 },
        { id: "QI-2", serviceName: "d&b audiotechnik GSL Line Array System", description: "Main L/R, Outfills, Subs & Shure Axient wireless package", quantity: 1, unit: "Package", unitPrice: 2200000, totalPrice: 2200000 },
        { id: "QI-3", serviceName: "Curved 4K HDR P2.9 LED Backwall (3000 sq.ft)", description: "Novastar processors, redundant signal lines", quantity: 1, unit: "Wall", unitPrice: 1500000, totalPrice: 1500000 },
        { id: "QI-4", serviceName: "GrandMA3 Intelligent Lighting & Laser Show", description: "Beam, wash, blinder & 30W RGB lasers", quantity: 1, unit: "Package", unitPrice: 1200000, totalPrice: 1200000 },
        { id: "QI-5", serviceName: "Ticketing & Turnstile QR Gate Validation", description: "Cloud validation, 12 offline lane scanners", quantity: 1, unit: "Service", unitPrice: 400000, totalPrice: 400000 }
      ],
      subtotal: 7100000,
      discountAmount: 200000,
      taxRatePercent: 18,
      taxAmount: 1242000,
      grandTotal: 8142000,
      advancePercentage: 50,
      advanceAmount: 4071000,
      paymentMilestones: [
        { milestone: "On Quotation Acceptance & Date Block", percentage: 50, amount: 4071000, dueOn: "Immediate" },
        { milestone: "On Stage & Equipment Rigging (Event Day -1)", percentage: 40, amount: 3256800, dueOn: "2026-12-04" },
        { milestone: "Post Event Settlement", percentage: 10, amount: 814200, dueOn: "2026-12-07" }
      ],
      inclusions: ["All rigging hardware and crane operators", "Backup 500kVA sound generator", "Certified sound engineers and lighting designers"],
      exclusions: ["Venue rental charges payable directly to Palace Grounds", "City police & entertainment tax permits"],
      termsAndConditions: [
        "Quotation valid for 14 calendar days.",
        "50% advance required to guarantee hardware reservation.",
        "Cancellations within 7 days of event forfeit 50% advance."
      ],
      preparedBy: "CineVenue Executive Events Directorate"
    },
    internalNotes: [],
    followUps: [],
    isConvertedToEvent: false
  }
];

// Helper: load proposals from persistent store or localStorage
export async function getEventProposals(): Promise<EventProposalRecord[]> {
  let list: EventProposalRecord[] = [];

  // Try API first
  try {
    const res = await apiClient.get<{ success: boolean; data: EventProposalRecord[] }>("/events/proposals");
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      list = res.data.data;
    }
  } catch (err) {
    // API not yet serving or offline
  }

  // Fallback to Supabase if available
  if (list.length === 0 && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("event_proposals")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map((d: any) => ({
          ...d,
          id: d.id || d.reference_id,
          referenceId: d.reference_id || d.id,
          createdAt: d.created_at || d.createdAt,
          updatedAt: d.updated_at || d.updatedAt,
          servicesRequired: Array.isArray(d.services_required) ? d.services_required : (d.servicesRequired || []),
          internalNotes: d.internal_notes || d.internalNotes || [],
          followUps: d.follow_ups || d.followUps || []
        }));
      }
    } catch {}
  }

  // LocalStorage / Seed Fallback
  if (list.length === 0 && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PROPOSALS_STORAGE_KEY);
      if (raw) {
        list = JSON.parse(raw);
      } else {
        list = INITIAL_ENTERTAINMENT_PROPOSALS;
        localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      list = INITIAL_ENTERTAINMENT_PROPOSALS;
    }
  }

  return list;
}

// Helper: Save proposals list to localStorage & Supabase
export function persistProposalsLocally(list: EventProposalRecord[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent("cinevenue_proposals_updated", { detail: list }));
    } catch {}
  }
}

// Generate unique reference ID
export function generateProposalReferenceId(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `CVE-PROP-${year}-${randomPart}`;
}

// Submit a new proposal
export async function submitEventProposal(
  proposalInput: Omit<EventProposalRecord, "id" | "referenceId" | "createdAt" | "updatedAt" | "status" | "internalNotes" | "followUps" | "isConvertedToEvent">
): Promise<{ success: boolean; proposal: EventProposalRecord; message: string }> {
  const refId = generateProposalReferenceId();
  const newRecord: EventProposalRecord = {
    ...proposalInput,
    id: refId,
    referenceId: refId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "New",
    internalNotes: [],
    followUps: [],
    isConvertedToEvent: false
  };

  // Try API submission
  try {
    const apiRes = await apiClient.post("/events/proposals", newRecord);
    if (apiRes.data?.success && apiRes.data.data) {
      // Synchronize locally
      const current = await getEventProposals();
      const updated = [apiRes.data.data, ...current.filter(p => p.id !== apiRes.data.data.id)];
      persistProposalsLocally(updated);
      return { success: true, proposal: apiRes.data.data, message: "Proposal submitted successfully!" };
    }
  } catch {}

  // Fallback direct Supabase insert
  if (isSupabaseConfigured) {
    try {
      await supabase.from("event_proposals").insert([{
        id: refId,
        reference_id: refId,
        category: newRecord.category,
        event_type: newRecord.eventType,
        event_name: newRecord.eventName,
        event_description: newRecord.eventDescription,
        preferred_date: newRecord.preferredDate,
        preferred_city: newRecord.preferredCity,
        expected_audience: newRecord.expectedAudience,
        company_name: newRecord.companyName,
        contact_person: newRecord.contactPerson,
        mobile: newRecord.mobile,
        email: newRecord.email,
        services_required: newRecord.servicesRequired,
        estimated_budget: newRecord.estimatedBudget,
        status: "New",
        payload_data: newRecord
      }]);
    } catch {}
  }

  // Local storage guarantee
  const current = await getEventProposals();
  const updated = [newRecord, ...current.filter(p => p.id !== newRecord.id)];
  persistProposalsLocally(updated);

  return {
    success: true,
    proposal: newRecord,
    message: "Proposal submitted successfully! Our events team will review and get in touch within 24 hours."
  };
}

// Update proposal status & details
export async function updateProposalStatus(
  proposalId: string, 
  newStatus: ProposalStatus, 
  options: { reason?: string; authorName?: string; note?: string } = {}
): Promise<EventProposalRecord | null> {
  const list = await getEventProposals();
  const idx = list.findIndex(p => p.id === proposalId || p.referenceId === proposalId);
  if (idx === -1) return null;

  const target = list[idx];
  target.status = newStatus;
  target.updatedAt = new Date().toISOString();

  if (options.reason) {
    target.rejectionOrCancellationReason = options.reason;
  }

  if (options.note) {
    target.internalNotes.unshift({
      id: `NOTE-${Date.now()}`,
      date: new Date().toISOString(),
      authorName: options.authorName || "Administrator",
      note: options.note,
      isPrivate: true
    });
  }

  list[idx] = { ...target };
  persistProposalsLocally(list);

  // Sync with API
  try {
    await apiClient.put(`/events/proposals/${encodeURIComponent(proposalId)}`, target);
  } catch {}

  return target;
}

// Assign Event Manager
export async function assignProposalEventManager(
  proposalId: string,
  managerName: string,
  managerEmail: string,
  authorName: string = "Super Admin"
): Promise<EventProposalRecord | null> {
  const list = await getEventProposals();
  const idx = list.findIndex(p => p.id === proposalId);
  if (idx === -1) return null;

  const target = list[idx];
  target.assignedEventManager = managerName;
  target.assignedManagerEmail = managerEmail;
  target.updatedAt = new Date().toISOString();

  target.internalNotes.unshift({
    id: `NOTE-${Date.now()}`,
    date: new Date().toISOString(),
    authorName,
    note: `Assigned event manager: ${managerName} (${managerEmail})`,
    isPrivate: true
  });

  list[idx] = { ...target };
  persistProposalsLocally(list);

  try {
    await apiClient.put(`/events/proposals/${encodeURIComponent(proposalId)}`, target);
  } catch {}

  return target;
}

// Add Follow-up Entry
export async function addProposalFollowUp(
  proposalId: string,
  followUp: Omit<ProposalFollowUp, "id">
): Promise<EventProposalRecord | null> {
  const list = await getEventProposals();
  const idx = list.findIndex(p => p.id === proposalId);
  if (idx === -1) return null;

  const target = list[idx];
  const newFollowUp: ProposalFollowUp = {
    ...followUp,
    id: `FU-${Date.now()}`
  };

  target.followUps.unshift(newFollowUp);
  target.lastFollowUpDate = followUp.date;
  if (followUp.nextFollowUpDate) {
    target.nextFollowUpDate = followUp.nextFollowUpDate;
  }
  target.updatedAt = new Date().toISOString();

  list[idx] = { ...target };
  persistProposalsLocally(list);

  try {
    await apiClient.put(`/events/proposals/${encodeURIComponent(proposalId)}`, target);
  } catch {}

  return target;
}

// Attach or Update Quotation
export async function saveProposalQuotation(
  proposalId: string,
  quotationData: Omit<EventQuotation, "id" | "quotationNumber" | "proposalId" | "createdAt">
): Promise<EventProposalRecord | null> {
  const list = await getEventProposals();
  const idx = list.findIndex(p => p.id === proposalId);
  if (idx === -1) return null;

  const target = list[idx];
  const nextRev = (target.quotation?.revision || 0) + 1;
  const quotNumber = target.quotation?.quotationNumber || `CINE-QUO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const finalQuotation: EventQuotation = {
    ...quotationData,
    id: `QUO-${Date.now()}`,
    quotationNumber: quotNumber,
    proposalId,
    revision: nextRev,
    createdAt: new Date().toISOString()
  };

  target.quotation = finalQuotation;
  target.status = "Quotation Sent";
  target.updatedAt = new Date().toISOString();

  target.internalNotes.unshift({
    id: `NOTE-${Date.now()}`,
    date: new Date().toISOString(),
    authorName: quotationData.preparedBy || "Finance Team",
    note: `Generated quotation ${quotNumber} (Rev ${nextRev}) for ₹${finalQuotation.grandTotal.toLocaleString("en-IN")}.`,
    isPrivate: true
  });

  list[idx] = { ...target };
  persistProposalsLocally(list);

  try {
    await apiClient.put(`/events/proposals/${encodeURIComponent(proposalId)}`, target);
  } catch {}

  return target;
}

// Convert Approved Proposal into a Canonical Live CineVenue Event
export async function convertProposalToEvent(
  proposalId: string,
  authorName: string = "Super Admin"
): Promise<{ success: boolean; eventId?: string; message: string }> {
  const list = await getEventProposals();
  const idx = list.findIndex(p => p.id === proposalId);
  if (idx === -1) {
    return { success: false, message: "Proposal not found." };
  }

  const proposal = list[idx];

  // Prevent duplicate conversion
  if (proposal.isConvertedToEvent && proposal.convertedEventId) {
    return {
      success: false,
      eventId: proposal.convertedEventId,
      message: `Proposal has already been converted into event ID: ${proposal.convertedEventId}.`
    };
  }

  // Format canonical Event record
  const generatedEventId = `EVT-CONF-${Date.now()}`;
  const canonicalEvent = {
    id: generatedEventId,
    title: proposal.eventName,
    description: proposal.eventDescription || `Official entertainment event organized by ${proposal.companyName}.`,
    category: proposal.eventType || "Live Entertainment",
    venueName: proposal.preferredVenue || "Event Arena",
    venueAddress: `${proposal.preferredVenue}, ${proposal.preferredCity}`,
    city: proposal.preferredCity,
    date: proposal.preferredDate,
    time: "07:00 PM",
    image: proposal.isFilmRelated 
      ? "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80" 
      : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
    bannerUrl: proposal.isFilmRelated
      ? "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80"
      : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
    isPaid: proposal.isPaidEvent,
    featured: true,
    isActive: true,
    status: "PUBLISHED",
    capacity: proposal.expectedAudience || 5000,
    ticketPrice: proposal.isPaidEvent ? 500 : 0,
    categories: [
      {
        id: `CAT-${Date.now()}-1`,
        name: proposal.isPaidEvent ? "VIP Pass" : "Entry Pass",
        price: proposal.isPaidEvent ? 500 : 0,
        availableSeats: proposal.expectedAudience || 5000,
        benefits: ["Guaranteed entry", "Designated stage view"]
      }
    ],
    metadata: {
      sourceProposalId: proposal.id,
      organizerName: proposal.companyName,
      organizerContact: proposal.contactPerson,
      organizerPhone: proposal.mobile,
      organizerEmail: proposal.email,
      assignedManager: proposal.assignedEventManager
    }
  };

  // 1. Save into canonical event repository
  saveEvent(canonicalEvent as any);

  // 2. Mark proposal as converted
  proposal.isConvertedToEvent = true;
  proposal.convertedEventId = generatedEventId;
  proposal.convertedAt = new Date().toISOString();
  proposal.status = "Converted to Event";

  proposal.internalNotes.unshift({
    id: `NOTE-${Date.now()}`,
    date: new Date().toISOString(),
    authorName,
    note: `Proposal successfully converted into live CineVenue Event (ID: ${generatedEventId}).`,
    isPrivate: true
  });

  list[idx] = { ...proposal };
  persistProposalsLocally(list);

  try {
    await apiClient.put(`/events/proposals/${encodeURIComponent(proposalId)}`, proposal);
  } catch {}

  return {
    success: true,
    eventId: generatedEventId,
    message: `Successfully converted proposal into official CineVenue Event (${generatedEventId})!`
  };
}

// Export Proposals to CSV
export function exportProposalsToCsv(proposals: EventProposalRecord[]): void {
  if (proposals.length === 0) return;

  const headers = [
    "Proposal ID",
    "Submission Date",
    "Status",
    "Event Name",
    "Category",
    "Event Type",
    "Company / Organizer",
    "Contact Person",
    "Mobile",
    "Email",
    "City",
    "Venue",
    "Preferred Date",
    "Expected Audience",
    "Estimated Budget (INR)",
    "Assigned Manager",
    "Converted Event ID"
  ];

  const rows = proposals.map(p => [
    `"${p.id}"`,
    `"${p.createdAt.split("T")[0]}"`,
    `"${p.status}"`,
    `"${(p.eventName || "").replace(/"/g, '""')}"`,
    `"${p.category}"`,
    `"${p.eventType}"`,
    `"${(p.companyName || "").replace(/"/g, '""')}"`,
    `"${(p.contactPerson || "").replace(/"/g, '""')}"`,
    `"${p.mobile}"`,
    `"${p.email}"`,
    `"${p.preferredCity}"`,
    `"${(p.preferredVenue || "").replace(/"/g, '""')}"`,
    `"${p.preferredDate}"`,
    p.expectedAudience,
    p.estimatedBudget,
    `"${p.assignedEventManager || "Unassigned"}"`,
    `"${p.convertedEventId || "N/A"}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `CineVenue_Event_Proposals_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
