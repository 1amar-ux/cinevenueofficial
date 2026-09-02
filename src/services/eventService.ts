import { EventManagementRequest, EventMessage } from "../types/productions";
import { INITIAL_EVENT_MANAGEMENT_REQUESTS } from "../data/productionsData";

const STORAGE_KEY = "cine_event_requests";

// Helper to normalize requests from API / localStorage
export const normalizeEventRequest = (req: any): EventManagementRequest => {
  const reqId = req.requestId || req.id || `REQ-EVT-${Date.now()}`;
  return {
    id: reqId,
    requestId: reqId,
    userEmail: req.userEmail || req.clientEmail || req.customerId || req.email || "client@cinevenue.com",
    customerId: req.customerId || req.userEmail || req.clientEmail || "client@cinevenue.com",
    eventName: req.eventName || req.title || "Untitled Event",
    eventType: req.eventType || req.eventCategory || "Film Event",
    description: req.description || req.eventDescription || "",
    preferredDate: req.preferredDate || req.eventDate || new Date().toISOString().split("T")[0],
    dateFlexibility: req.dateFlexibility || "Exact",
    preferredTime: req.preferredTime || req.eventTime || "18:00",
    city: req.city || req.location || "Hyderabad",
    venuePreference: req.venuePreference || req.venue || "To Be Finalized",
    venue: req.venue || req.venuePreference || "To Be Finalized",
    location: req.location || req.city || "Hyderabad",
    expectedAudience: req.expectedAudience || 1000,
    servicesRequired: Array.isArray(req.servicesRequired) ? req.servicesRequired : (Array.isArray(req.requiredServices) ? req.requiredServices : ["Stage & Production", "Sound & Lighting"]),
    requiredServices: Array.isArray(req.requiredServices) ? req.requiredServices : (Array.isArray(req.servicesRequired) ? req.servicesRequired : ["Sound", "Lighting"]),
    otherServicesText: req.otherServicesText || req.specialRequirements || "",
    specialRequirements: req.specialRequirements || req.otherServicesText || "",
    budgetRange: req.budgetRange || (req.budget && req.budget > 1000000 ? "₹25 Lakhs+" : "₹5–10 Lakhs"),
    budget: typeof req.budget === "number" ? req.budget : 500000,
    quoteAmount: typeof req.quoteAmount === "number" ? req.quoteAmount : 0,
    fullName: req.fullName || req.clientName || "Client",
    clientName: req.clientName || req.fullName || "Client",
    phone: req.phone || req.clientPhone || "+91 98490 00000",
    clientPhone: req.clientPhone || req.phone || "+91 98490 00000",
    email: req.email || req.clientEmail || req.userEmail || "client@cinevenue.com",
    clientEmail: req.clientEmail || req.email || req.userEmail || "client@cinevenue.com",
    company: req.company || req.clientCompany || "Production Studio",
    clientCompany: req.clientCompany || req.company || "Production Studio",
    submittedAt: req.submittedAt || (req.createdAt ? req.createdAt.split("T")[0] : new Date().toISOString().split("T")[0]),
    createdAt: req.createdAt || new Date().toISOString(),
    status: req.status || "Submitted",
    adminNotes: req.adminNotes || "",
    assignedTeamMember: req.assignedTeamMember || req.assignedEventManager || "Super Admin (CineVenue Executive)",
    assignedEventManager: req.assignedEventManager || req.assignedTeamMember || "Super Admin (CineVenue Executive)",
    assignedVendors: Array.isArray(req.assignedVendors) ? req.assignedVendors : [],
    additionalInfoPrompt: req.additionalInfoPrompt || "",
    userResponseInfo: req.userResponseInfo || "",
    documents: Array.isArray(req.documents) ? req.documents : [],
    updates: Array.isArray(req.updates) ? req.updates : [],
    messages: Array.isArray(req.messages) ? req.messages : []
  };
};

/**
 * Fetch all event requests across subportal and main portal
 */
export async function getEventRequests(userEmail?: string | null): Promise<EventManagementRequest[]> {
  let localList: EventManagementRequest[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localList = parsed.map(normalizeEventRequest);
      }
    }
  } catch (e) {
    console.warn("Error reading local event requests", e);
  }

  if (localList.length === 0) {
    localList = INITIAL_EVENT_MANAGEMENT_REQUESTS.map(normalizeEventRequest);
  }

  try {
    const url = "/api/events/requests";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const serverArray = Array.isArray(data) ? data : (data.events || []);
      if (Array.isArray(serverArray) && serverArray.length > 0) {
        const normalizedServer = serverArray.map(normalizeEventRequest);
        
        // Merge without losing locally added records or messages
        const mergedMap = new Map<string, EventManagementRequest>();
        normalizedServer.forEach(s => mergedMap.set(s.id, s));
        localList.forEach(l => {
          if (!mergedMap.has(l.id)) {
            mergedMap.set(l.id, l);
          } else {
            // Merge message threads if local has newer messages
            const existing = mergedMap.get(l.id)!;
            const existingMsgIds = new Set((existing.messages || []).map(m => m.id));
            const extraMsgs = (l.messages || []).filter(m => !existingMsgIds.has(m.id));
            if (extraMsgs.length > 0) {
              existing.messages = [...(existing.messages || []), ...extraMsgs];
            }
          }
        });

        const mergedList = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
        return mergedList;
      }
    }
  } catch (err) {
    console.warn("Backend API not reachable, using local storage requests", err);
  }

  return localList;
}

/**
 * Submit a new event request from either Main Portal or Subportal
 */
export async function submitEventRequest(reqData: Partial<EventManagementRequest>): Promise<EventManagementRequest> {
  const normalized = normalizeEventRequest(reqData);
  
  // 1. Update localStorage immediately
  let currentList: EventManagementRequest[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) currentList = JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  const updatedList = [normalized, ...currentList.filter(r => r.id !== normalized.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

  // 2. Dispatch custom event for real-time reactivity
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cine_event_requests_updated", { detail: normalized }));
  }

  // 3. Post to backend
  try {
    const res = await fetch("/api/events/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized)
    });
    if (res.ok) {
      const resData = await res.json();
      if (resData.event) {
        const serverEvent = normalizeEventRequest(resData.event);
        return serverEvent;
      }
    }
  } catch (err) {
    console.warn("Failed to sync new event request to server, cached locally:", err);
  }

  return normalized;
}

/**
 * Send a client message or producer reply on an event request
 */
export async function postEventMessage(
  requestId: string,
  message: {
    text: string;
    sender: "client" | "producer" | "admin" | "system";
    senderName: string;
    senderEmail?: string;
  }
): Promise<EventMessage> {
  const newMsg: EventMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sender: message.sender,
    senderName: message.senderName,
    senderEmail: message.senderEmail,
    text: message.text.trim(),
    timestamp: new Date().toISOString()
  };

  // 1. Update in localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const list: EventManagementRequest[] = JSON.parse(raw);
      const target = list.find(r => r.id === requestId || r.requestId === requestId);
      if (target) {
        if (!Array.isArray(target.messages)) target.messages = [];
        target.messages.push(newMsg);
        
        if (message.sender === "producer" || message.sender === "admin") {
          if (!Array.isArray(target.updates)) target.updates = [];
          target.updates.push({
            date: new Date().toISOString().split("T")[0],
            title: "Producer Message",
            note: message.text.trim(),
            author: message.senderName
          });
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn("Failed to update local message cache", e);
  }

  // 2. Dispatch event
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cine_event_message_added", { 
      detail: { requestId, message: newMsg } 
    }));
  }

  // 3. Post to backend
  try {
    await fetch(`/api/events/requests/${encodeURIComponent(requestId)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message.text,
        sender: message.sender,
        senderName: message.senderName,
        senderEmail: message.senderEmail
      })
    });
  } catch (err) {
    console.warn("Failed to post message to server, stored locally:", err);
  }

  return newMsg;
}

/**
 * Update request status from admin / subportal
 */
export async function updateRequestStatus(
  requestId: string, 
  status: string,
  adminNotes?: string
): Promise<void> {
  // Update local storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const list: EventManagementRequest[] = JSON.parse(raw);
      const target = list.find(r => r.id === requestId || r.requestId === requestId);
      if (target) {
        target.status = status;
        if (adminNotes) target.adminNotes = adminNotes;
        target.updates = [
          ...(target.updates || []),
          {
            date: new Date().toISOString().split("T")[0],
            title: `Status Changed to ${status}`,
            note: adminNotes || `Event status advanced to ${status}.`,
            author: "Event Desk"
          }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    }
  } catch (e) {
    console.warn("Failed to update local status", e);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cine_event_requests_updated", { detail: { requestId, status } }));
  }

  try {
    await fetch(`/api/events/admin/requests/${encodeURIComponent(requestId)}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  } catch (err) {
    console.warn("Failed to update status on server:", err);
  }
}
