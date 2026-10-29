import fs from "fs";
import path from "path";
import { prisma } from "../config/database";
import { logger } from "../shared/logger";
import { auditEntryLogService } from "./auditEntryLogService";

export type AlertCategory = "LISTING" | "BOOKING" | "PAYMENT" | "TICKET" | "ORGANIZER";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type InvestigationStatus = "NEW" | "UNDER_REVIEW" | "ESCALATED" | "RESOLVED" | "FALSE_POSITIVE";
export type ReportStatus = "PENDING" | "INVESTIGATING" | "DISMISSED" | "ACTIONED";

export interface InternalNote {
  id: string;
  author: string;
  note: string;
  timestamp: string;
}

export interface ActionHistoryItem {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface FraudAlertRecord {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  detectionRule: string;
  ruleTriggered?: string;
  relatedEntityType: string;
  entityType?: string;
  relatedEntityId: string;
  entityId?: string;
  relatedEntityTitle?: string | null;
  riskScore: number;
  evidenceSummary: string;
  evidenceData?: any;
  evidence?: Array<{ signal: string; value?: string; confidence?: number }>;
  investigationStatus: InvestigationStatus;
  status?: InvestigationStatus;
  assignedTo?: string | null;
  assignedInvestigator?: string | null;
  internalNotes: InternalNote[];
  resolutionReason?: string | null;
  actionHistory: ActionHistoryItem[];
  isRestricted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserReportRecord {
  id: string;
  category: string;
  reporterEmail: string;
  reporterName?: string | null;
  targetType: string;
  targetId: string;
  targetTitle: string;
  reason: string;
  evidenceText?: string | null;
  status: ReportStatus;
  linkedAlertId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FraudRuleConfigRecord {
  id: string;
  maxBookingAttemptsPerWindow: number;
  bookingAttemptWindowMinutes: number;
  bookingAttemptWindowSeconds?: number;
  failedBookingThreshold: number;
  maxFailedBookingsThreshold?: number;
  seatHoldReleaseThreshold: number;
  listingSimilarityThreshold: number;
  priceChangePercentThreshold: number;
  duplicateScanWindowMinutes: number;
  duplicateScanWindowSeconds?: number;
  riskScoreWeights: {
    listing: number;
    booking: number;
    payment: number;
    ticket: number;
  };
  autoEscalateThreshold: number;
  alertRetentionDays: number;
  updatedBy?: string | null;
  updatedAt: string;
  metadata?: any;
}

export interface FraudMetrics {
  totalOpenAlerts: number;
  criticalAlerts: number;
  suspiciousListings: number;
  suspiciousBookingPatterns: number;
  paymentIrregularities: number;
  duplicateTicketScans: number;
  casesUnderInvestigation: number;
  resolvedCases: number;
  totalAlerts: number;
  breakdownByCategory: Record<string, number>;
  breakdownBySeverity: Record<string, number>;
  breakdownByStatus: Record<string, number>;
}

// Persistent fallback store path
const FALLBACK_STORE_PATH = path.resolve(process.cwd(), "server/config/fraud_trust_store.json");

interface FallbackStoreData {
  alerts: FraudAlertRecord[];
  reports: UserReportRecord[];
  config: FraudRuleConfigRecord;
}

const DEFAULT_CONFIG: FraudRuleConfigRecord = {
  id: "default_fraud_config",
  maxBookingAttemptsPerWindow: 5,
  bookingAttemptWindowMinutes: 10,
  bookingAttemptWindowSeconds: 600,
  failedBookingThreshold: 3,
  maxFailedBookingsThreshold: 3,
  seatHoldReleaseThreshold: 4,
  listingSimilarityThreshold: 80,
  priceChangePercentThreshold: 50,
  duplicateScanWindowMinutes: 15,
  duplicateScanWindowSeconds: 900,
  riskScoreWeights: {
    listing: 30,
    booking: 25,
    payment: 25,
    ticket: 20
  },
  autoEscalateThreshold: 75,
  alertRetentionDays: 90,
  updatedBy: "system",
  updatedAt: new Date().toISOString()
};

export function decorateAlertRecord(record: FraudAlertRecord): FraudAlertRecord {
  if (!record) return record;
  (record as any).ruleTriggered = record.detectionRule;
  (record as any).entityType = record.relatedEntityType;
  (record as any).entityId = record.relatedEntityId;
  (record as any).status = record.investigationStatus;
  (record as any).assignedInvestigator = record.assignedTo;

  if (Array.isArray(record.evidenceData?.signals)) {
    (record as any).evidence = record.evidenceData.signals;
  } else if (Array.isArray(record.evidenceData)) {
    (record as any).evidence = record.evidenceData;
  } else {
    (record as any).evidence = [
      { signal: record.detectionRule, value: record.evidenceSummary, confidence: record.riskScore }
    ];
  }

  return record;
}

function loadStore(): FallbackStoreData {
  try {
    if (fs.existsSync(FALLBACK_STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(FALLBACK_STORE_PATH, "utf-8"));
      return {
        alerts: Array.isArray(parsed.alerts) ? parsed.alerts.map(decorateAlertRecord) : [],
        reports: Array.isArray(parsed.reports) ? parsed.reports : [],
        config: parsed.config && typeof parsed.config === "object" ? parsed.config : DEFAULT_CONFIG
      };
    }
  } catch (err) {
    logger.error("[FraudTrustStore] Error loading fallback store", err);
  }
  return { alerts: [], reports: [], config: DEFAULT_CONFIG };
}

function saveStore(data: FallbackStoreData) {
  try {
    const dir = path.dirname(FALLBACK_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(FALLBACK_STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    logger.error("[FraudTrustStore] Error saving fallback store", err);
  }
}

// In-memory cache for ultra-responsive reads
let memoryStore = loadStore();

// Text similarity utility (Token overlap + Jaccard similarity)
export function calculateTextSimilarity(textA: string, textB: string): number {
  if (!textA || !textB) return 0;
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const tokensA = new Set(normalize(textA));
  const tokensB = new Set(normalize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) intersectionCount++;
  });

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  if (unionSize === 0) return 0;

  return Math.round((intersectionCount / unionSize) * 100);
}

export class FraudTrustService {
  /**
   * Calculate real, authoritative fraud metrics from persisted alerts
   */
  async getMetrics(range?: string): Promise<FraudMetrics> {
    const alerts = await this.getAllAlertsList();

    let filtered = alerts;
    if (range && range !== "ALL") {
      const now = Date.now();
      let windowMs = 24 * 60 * 60 * 1000;
      if (range === "7D") windowMs = 7 * 24 * 60 * 60 * 1000;
      else if (range === "30D") windowMs = 30 * 24 * 60 * 60 * 1000;
      else if (range === "90D") windowMs = 90 * 24 * 60 * 60 * 1000;

      filtered = alerts.filter((a) => {
        const t = new Date(a.createdAt).getTime();
        return now - t <= windowMs;
      });
    }

    const isOpen = (status: InvestigationStatus) =>
      status === "NEW" || status === "UNDER_REVIEW" || status === "ESCALATED";

    const metrics: FraudMetrics = {
      totalOpenAlerts: filtered.filter((a) => isOpen(a.investigationStatus)).length,
      criticalAlerts: filtered.filter((a) => a.severity === "CRITICAL" && isOpen(a.investigationStatus)).length,
      suspiciousListings: filtered.filter((a) => a.category === "LISTING" && isOpen(a.investigationStatus)).length,
      suspiciousBookingPatterns: filtered.filter((a) => a.category === "BOOKING" && isOpen(a.investigationStatus)).length,
      paymentIrregularities: filtered.filter((a) => a.category === "PAYMENT" && isOpen(a.investigationStatus)).length,
      duplicateTicketScans: filtered.filter((a) => a.category === "TICKET" && a.detectionRule === "DUPLICATE_TICKET_SCAN" && isOpen(a.investigationStatus)).length,
      casesUnderInvestigation: filtered.filter((a) => a.investigationStatus === "UNDER_REVIEW").length,
      resolvedCases: filtered.filter((a) => a.investigationStatus === "RESOLVED" || a.investigationStatus === "FALSE_POSITIVE").length,
      totalAlerts: filtered.length,
      breakdownByCategory: {},
      breakdownBySeverity: {},
      breakdownByStatus: {}
    };

    filtered.forEach((a) => {
      metrics.breakdownByCategory[a.category] = (metrics.breakdownByCategory[a.category] || 0) + 1;
      metrics.breakdownBySeverity[a.severity] = (metrics.breakdownBySeverity[a.severity] || 0) + 1;
      metrics.breakdownByStatus[a.investigationStatus] = (metrics.breakdownByStatus[a.investigationStatus] || 0) + 1;
    });

    return metrics;
  }

  /**
   * Retrieve alerts with multi-dimensional filtering, searching, and pagination
   */
  async getAlerts(params: {
    category?: string;
    severity?: string;
    status?: string;
    entityId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    entityType?: string;
    page?: number;
    limit?: number;
    sortBy?: "createdAt" | "riskScore" | "severity";
    sortOrder?: "asc" | "desc";
  }): Promise<{ alerts: FraudAlertRecord[]; items: FraudAlertRecord[]; total: number; page: number; limit: number; totalPages: number }> {
    let list = await this.getAllAlertsList();

    if (params.category && params.category !== "ALL") {
      list = list.filter((a) => a.category.toUpperCase() === params.category!.toUpperCase());
    }
    if (params.severity && params.severity !== "ALL") {
      list = list.filter((a) => a.severity.toUpperCase() === params.severity!.toUpperCase());
    }
    if (params.status && params.status !== "ALL") {
      list = list.filter((a) => a.investigationStatus.toUpperCase() === params.status!.toUpperCase());
    }
    if (params.entityType && params.entityType !== "ALL") {
      list = list.filter((a) => a.relatedEntityType.toUpperCase() === params.entityType!.toUpperCase());
    }
    if (params.entityId) {
      list = list.filter((a) => a.relatedEntityId === params.entityId || (a as any).entityId === params.entityId);
    }

    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      list = list.filter((a) => new Date(a.createdAt).getTime() >= start);
    }
    if (params.endDate) {
      const end = new Date(params.endDate).getTime();
      list = list.filter((a) => new Date(a.createdAt).getTime() <= end);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter((a) =>
        a.id.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.detectionRule.toLowerCase().includes(q) ||
        a.relatedEntityId.toLowerCase().includes(q) ||
        (a.relatedEntityTitle && a.relatedEntityTitle.toLowerCase().includes(q)) ||
        (a.assignedTo && a.assignedTo.toLowerCase().includes(q))
      );
    }

    const sortBy = params.sortBy || "createdAt";
    const sortOrder = params.sortOrder || "desc";

    list.sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === "createdAt") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const total = list.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      alerts: paginated,
      items: paginated,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Get single alert by ID
   */
  async getAlertById(id: string): Promise<FraudAlertRecord | null> {
    const list = await this.getAllAlertsList();
    const found = list.find((a) => a.id === id);
    return found ? decorateAlertRecord(found) : null;
  }

  /**
   * Create or update a fraud alert
   */
  async recordAlert(alertInput: {
    category: AlertCategory;
    severity?: AlertSeverity;
    title: string;
    description: string;
    detectionRule: string;
    relatedEntityType: string;
    relatedEntityId: string;
    relatedEntityTitle?: string | null;
    riskScore?: number;
    evidenceSummary: string;
    evidenceData?: any;
    investigationStatus?: InvestigationStatus;
  }): Promise<FraudAlertRecord> {
    const config = await this.getConfig();
    const riskScore = alertInput.riskScore ?? 50;

    // Auto-escalate severity if risk score exceeds configured threshold
    let severity: AlertSeverity = alertInput.severity || "MEDIUM";
    if (riskScore >= config.autoEscalateThreshold && severity !== "CRITICAL") {
      severity = "HIGH";
    }
    if (riskScore >= 90) {
      severity = "CRITICAL";
    }

    const id = `FA-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const record: FraudAlertRecord = {
      id,
      category: alertInput.category,
      severity,
      title: alertInput.title,
      description: alertInput.description,
      detectionRule: alertInput.detectionRule,
      relatedEntityType: alertInput.relatedEntityType,
      relatedEntityId: alertInput.relatedEntityId,
      relatedEntityTitle: alertInput.relatedEntityTitle || null,
      riskScore,
      evidenceSummary: alertInput.evidenceSummary,
      evidenceData: alertInput.evidenceData || {},
      investigationStatus: alertInput.investigationStatus || "NEW",
      assignedTo: null,
      internalNotes: [],
      resolutionReason: null,
      actionHistory: [
        {
          id: `act-${Date.now()}`,
          action: "ALERT_CREATED",
          actor: "Fraud Detection Engine",
          timestamp: nowIso,
          details: `Rule: ${alertInput.detectionRule} (Risk: ${riskScore})`
        }
      ],
      isRestricted: false,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    decorateAlertRecord(record);

    // 1. Persist to memory and disk store
    memoryStore.alerts.unshift(record);
    saveStore(memoryStore);

    // 2. Persist to database if available
    if ((prisma as any).fraudAlert && typeof (prisma as any).fraudAlert.create === "function") {
      try {
        await (prisma as any).fraudAlert.create({
          data: {
            id: record.id,
            category: record.category,
            severity: record.severity,
            title: record.title,
            description: record.description,
            detectionRule: record.detectionRule,
            relatedEntityType: record.relatedEntityType,
            relatedEntityId: record.relatedEntityId,
            relatedEntityTitle: record.relatedEntityTitle,
            riskScore: record.riskScore,
            evidenceSummary: record.evidenceSummary,
            evidenceData: record.evidenceData,
            investigationStatus: record.investigationStatus,
            isRestricted: record.isRestricted,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }
        });
      } catch (dbErr: any) {
        logger.warn(`[FraudTrustService] DB write fallback engaged: ${dbErr?.message || dbErr}`);
      }
    }

    // 3. Record system audit log
    auditEntryLogService.recordAdminActivity({
      actorId: "system_detector",
      actorName: "Fraud Engine",
      actorEmail: "security@cinevenue.com",
      actorRole: "SYSTEM",
      activity: "FRAUD_ALERT_CREATED",
      module: "SECURITY_FRAUD",
      resourceId: record.id,
      resourceType: "FraudAlert",
      status: "SUCCESS",
      severity: record.severity === "CRITICAL" ? "CRITICAL" : "WARNING",
      details: `[${record.category}] ${record.title} (${record.detectionRule}, Risk: ${record.riskScore})`,
      afterValue: {
        id: record.id,
        category: record.category,
        severity: record.severity,
        riskScore: record.riskScore
      }
    });

    return record;
  }

  /**
   * Alias: createAlert
   */
  async createAlert(params: {
    category: AlertCategory;
    severity?: AlertSeverity;
    title: string;
    description?: string;
    ruleTriggered?: string;
    detectionRule?: string;
    riskScore?: number;
    entityType?: string;
    relatedEntityType?: string;
    entityId?: string;
    relatedEntityId?: string;
    relatedEntityTitle?: string;
    evidenceSummary?: string;
    evidence?: any;
    evidenceData?: any;
    actorEmail?: string;
  }): Promise<FraudAlertRecord> {
    const detectionRule = params.ruleTriggered || params.detectionRule || "MANUAL_INVESTIGATION";
    const relatedEntityType = params.entityType || params.relatedEntityType || "SYSTEM";
    const relatedEntityId = params.entityId || params.relatedEntityId || `ent_${Date.now()}`;
    const evidenceData = params.evidence || params.evidenceData || {};
    const evidenceSummary = params.evidenceSummary || `Investigation raised by ${params.actorEmail || "system"}`;

    return this.recordAlert({
      category: params.category,
      severity: params.severity,
      title: params.title,
      description: params.description || params.title,
      detectionRule,
      relatedEntityType,
      relatedEntityId,
      relatedEntityTitle: params.relatedEntityTitle,
      riskScore: params.riskScore,
      evidenceSummary,
      evidenceData
    });
  }

  /**
   * Update investigation status
   */
  async updateAlertStatus(
    id: string,
    status: InvestigationStatus,
    actor: any,
    reason?: string,
    details?: string
  ): Promise<FraudAlertRecord> {
    const alert = await this.getAlertById(id);
    if (!alert) {
      throw new Error(`Fraud alert ${id} not found.`);
    }

    const prevStatus = alert.investigationStatus;
    const nowIso = new Date().toISOString();
    const effectiveActor = typeof actor === "string" ? { email: actor, name: actor, role: "ADMIN" } : (actor || {});
    const effectiveReason = reason || details || alert.resolutionReason;

    alert.investigationStatus = status;
    alert.updatedAt = nowIso;
    if (effectiveReason) {
      alert.resolutionReason = effectiveReason;
    }

    const actionItem: ActionHistoryItem = {
      id: `act-${Date.now()}`,
      action: `STATUS_CHANGED_TO_${status}`,
      actor: effectiveActor.name || effectiveActor.email || "Administrator",
      timestamp: nowIso,
      details: effectiveReason ? `Reason: ${effectiveReason}` : undefined
    };
    alert.actionHistory.push(actionItem);

    // Save
    saveStore(memoryStore);

    if ((prisma as any).fraudAlert && typeof (prisma as any).fraudAlert.update === "function") {
      try {
        await (prisma as any).fraudAlert.update({
          where: { id },
          data: {
            investigationStatus: status,
            resolutionReason: effectiveReason,
            actionHistory: alert.actionHistory,
            updatedAt: new Date(nowIso)
          }
        });
      } catch (e) {}
    }

    // Audit Log
    auditEntryLogService.recordAdminActivity({
      actorId: effectiveActor.id,
      actorName: effectiveActor.name,
      actorEmail: effectiveActor.email,
      actorRole: effectiveActor.role || "ADMIN",
      activity: "FRAUD_ALERT_STATUS_UPDATED",
      module: "SECURITY_FRAUD",
      resourceId: alert.id,
      resourceType: "FraudAlert",
      status: "SUCCESS",
      severity: status === "RESOLVED" || status === "FALSE_POSITIVE" ? "INFO" : "WARNING",
      details: `Alert ${id} status changed from ${prevStatus} to ${status}${effectiveReason ? ` (${effectiveReason})` : ""}`,
      beforeValue: { status: prevStatus },
      afterValue: { status, resolutionReason: effectiveReason }
    });

    return decorateAlertRecord(alert);
  }

  /**
   * Assign investigator to an alert
   */
  async assignInvestigator(
    id: string,
    investigatorEmail: string,
    actor: any
  ): Promise<FraudAlertRecord> {
    const alert = await this.getAlertById(id);
    if (!alert) {
      throw new Error(`Fraud alert ${id} not found.`);
    }

    const effectiveActor = typeof actor === "string" ? { email: actor, name: actor, role: "ADMIN" } : (actor || {});
    const nowIso = new Date().toISOString();
    alert.assignedTo = investigatorEmail;
    alert.investigationStatus = alert.investigationStatus === "NEW" ? "UNDER_REVIEW" : alert.investigationStatus;
    alert.updatedAt = nowIso;

    alert.actionHistory.push({
      id: `act-${Date.now()}`,
      action: "INVESTIGATOR_ASSIGNED",
      actor: effectiveActor.name || effectiveActor.email || "Administrator",
      timestamp: nowIso,
      details: `Assigned to ${investigatorEmail}`
    });

    saveStore(memoryStore);

    if ((prisma as any).fraudAlert && typeof (prisma as any).fraudAlert.update === "function") {
      try {
        await (prisma as any).fraudAlert.update({
          where: { id },
          data: {
            assignedTo: investigatorEmail,
            investigationStatus: alert.investigationStatus,
            actionHistory: alert.actionHistory,
            updatedAt: new Date(nowIso)
          }
        });
      } catch (e) {}
    }

    auditEntryLogService.recordAdminActivity({
      actorId: effectiveActor.id,
      actorName: effectiveActor.name,
      actorEmail: effectiveActor.email,
      actorRole: effectiveActor.role || "ADMIN",
      activity: "FRAUD_INVESTIGATOR_ASSIGNED",
      module: "SECURITY_FRAUD",
      resourceId: alert.id,
      resourceType: "FraudAlert",
      status: "SUCCESS",
      details: `Investigator ${investigatorEmail} assigned to alert ${id}`
    });

    return decorateAlertRecord(alert);
  }

  /**
   * Add internal investigative note
   */
  async addInternalNote(
    id: string,
    noteText: string,
    author: any
  ): Promise<FraudAlertRecord> {
    const alert = await this.getAlertById(id);
    if (!alert) {
      throw new Error(`Fraud alert ${id} not found.`);
    }

    const effectiveAuthor = typeof author === "string" ? { email: author, name: author } : (author || {});
    const nowIso = new Date().toISOString();
    const newNote: InternalNote = {
      id: `note-${Date.now()}`,
      author: effectiveAuthor.name || effectiveAuthor.email || "Investigator",
      note: noteText,
      timestamp: nowIso
    };

    alert.internalNotes.push(newNote);
    alert.updatedAt = nowIso;

    alert.actionHistory.push({
      id: `act-${Date.now()}`,
      action: "NOTE_ADDED",
      actor: effectiveAuthor.name || effectiveAuthor.email || "Investigator",
      timestamp: nowIso,
      details: `Added note: ${noteText.substring(0, 60)}...`
    });

    saveStore(memoryStore);

    if ((prisma as any).fraudAlert && typeof (prisma as any).fraudAlert.update === "function") {
      try {
        await (prisma as any).fraudAlert.update({
          where: { id },
          data: {
            internalNotes: alert.internalNotes,
            actionHistory: alert.actionHistory,
            updatedAt: new Date(nowIso)
          }
        });
      } catch (e) {}
    }

    return decorateAlertRecord(alert);
  }

  /**
   * Temporarily restrict an entity
   */
  async restrictEntity(
    id: string,
    isRestricted: boolean,
    actor: any,
    reason?: string
  ): Promise<FraudAlertRecord> {
    const alert = await this.getAlertById(id);
    if (!alert) {
      throw new Error(`Fraud alert ${id} not found.`);
    }

    const effectiveActor = typeof actor === "string" ? { email: actor, name: actor, role: "ADMIN" } : (actor || {});
    const nowIso = new Date().toISOString();
    alert.isRestricted = isRestricted;
    alert.updatedAt = nowIso;

    alert.actionHistory.push({
      id: `act-${Date.now()}`,
      action: isRestricted ? "ENTITY_RESTRICTED" : "RESTRICTION_REMOVED",
      actor: effectiveActor.name || effectiveActor.email || "Administrator",
      timestamp: nowIso,
      details: reason || (isRestricted ? "Temporary safety restriction" : "Safety restriction lifted")
    });

    saveStore(memoryStore);

    if ((prisma as any).fraudAlert && typeof (prisma as any).fraudAlert.update === "function") {
      try {
        await (prisma as any).fraudAlert.update({
          where: { id },
          data: {
            isRestricted,
            actionHistory: alert.actionHistory,
            updatedAt: new Date(nowIso)
          }
        });
      } catch (e) {}
    }

    auditEntryLogService.recordAdminActivity({
      actorId: effectiveActor.id,
      actorName: effectiveActor.name,
      actorEmail: effectiveActor.email,
      actorRole: effectiveActor.role || "ADMIN",
      activity: isRestricted ? "FRAUD_ENTITY_RESTRICTED" : "FRAUD_RESTRICTION_REMOVED",
      module: "SECURITY_FRAUD",
      resourceId: alert.relatedEntityId,
      resourceType: alert.relatedEntityType,
      status: "SUCCESS",
      severity: isRestricted ? "WARNING" : "INFO",
      details: `${alert.relatedEntityType} ${alert.relatedEntityId} restriction ${isRestricted ? "enacted" : "lifted"}${reason ? ` (${reason})` : ""}`
    });

    return decorateAlertRecord(alert);
  }

  /**
   * Alias: toggleEntityRestriction
   */
  async toggleEntityRestriction(
    id: string,
    isRestricted: boolean,
    actor: any,
    reason?: string
  ): Promise<FraudAlertRecord> {
    return this.restrictEntity(id, isRestricted, actor, reason);
  }

  /**
   * Get user reports
   */
  async getReports(params: {
    status?: string;
    targetType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reports: UserReportRecord[]; total: number; page: number; limit: number }> {
    let list = memoryStore.reports;

    if (params.status && params.status !== "ALL") {
      list = list.filter((r) => r.status.toUpperCase() === params.status!.toUpperCase());
    }
    if (params.targetType && params.targetType !== "ALL") {
      list = list.filter((r) => r.targetType.toUpperCase() === params.targetType!.toUpperCase());
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const total = list.length;
    const startIndex = (page - 1) * limit;

    return {
      reports: list.slice(startIndex, startIndex + limit),
      total,
      page,
      limit
    };
  }

  /**
   * Submit citizen / user report
   */
  async submitUserReport(reportInput: {
    category: string;
    reporterEmail: string;
    reporterName?: string;
    targetType?: string;
    targetId?: string;
    targetEntityId?: string;
    targetTitle?: string;
    title?: string;
    reason?: string;
    description?: string;
    evidenceText?: string;
    ipAddress?: string;
  }): Promise<UserReportRecord> {
    const id = `UR-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const targetType = reportInput.targetType || "EVENT";
    const targetId = reportInput.targetId || reportInput.targetEntityId || `ent_${Date.now()}`;
    const targetTitle = reportInput.targetTitle || reportInput.title || `Entity ${targetId}`;
    const reason = reportInput.reason || reportInput.description || "Suspicious or misleading activity reported";

    const record: UserReportRecord = {
      id,
      category: reportInput.category,
      reporterEmail: reportInput.reporterEmail.trim().toLowerCase(),
      reporterName: reportInput.reporterName || null,
      targetType,
      targetId,
      targetTitle,
      reason,
      evidenceText: reportInput.evidenceText || null,
      status: "PENDING",
      linkedAlertId: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    memoryStore.reports.unshift(record);

    // Deduplication & Aggregation Check:
    // If the same entity receives 2 or more reports, automatically raise a FraudAlert
    const existingEntityReports = memoryStore.reports.filter(
      (r) => r.targetId === record.targetId
    );

    if (existingEntityReports.length >= 2) {
      let existingAlert = memoryStore.alerts.find(
        (a) => a.relatedEntityId === record.targetId && a.investigationStatus !== "RESOLVED"
      );

      if (!existingAlert) {
        existingAlert = await this.recordAlert({
          category: "LISTING",
          severity: "MEDIUM",
          title: `Multiple Citizen Reports: ${record.targetTitle}`,
          description: `Received ${existingEntityReports.length} separate user complaints regarding possible fake or misleading details.`,
          detectionRule: "COMMUNITY_REPORTS_THRESHOLD",
          relatedEntityType: record.targetType,
          relatedEntityId: record.targetId,
          relatedEntityTitle: record.targetTitle,
          riskScore: 70,
          evidenceSummary: `${existingEntityReports.length} complaints on record. Latest reporter: ${record.reporterEmail}`,
          evidenceData: {
            signals: [
              { signal: "COMMUNITY_COMPLAINTS", value: `${existingEntityReports.length} complaints`, confidence: 80 }
            ],
            reportCount: existingEntityReports.length,
            reports: existingEntityReports.map((r) => ({ id: r.id, reason: r.reason, email: r.reporterEmail }))
          }
        });
      }
      record.linkedAlertId = existingAlert.id;
    }

    saveStore(memoryStore);

    if ((prisma as any).userReport && typeof (prisma as any).userReport.create === "function") {
      try {
        await (prisma as any).userReport.create({
          data: {
            id: record.id,
            category: record.category,
            reporterEmail: record.reporterEmail,
            reporterName: record.reporterName,
            targetType: record.targetType,
            targetId: record.targetId,
            targetTitle: record.targetTitle,
            reason: record.reason,
            evidenceText: record.evidenceText,
            status: record.status,
            linkedAlertId: record.linkedAlertId,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt)
          }
        });
      } catch (e) {}
    }

    return record;
  }

  async updateReportStatus(id: string, status: ReportStatus, actor: any): Promise<UserReportRecord> {
    const report = memoryStore.reports.find((r) => r.id === id);
    if (!report) {
      throw new Error(`Report ${id} not found.`);
    }

    const effectiveActor = typeof actor === "string" ? { email: actor, name: actor } : (actor || {});
    report.status = status;
    report.updatedAt = new Date().toISOString();
    saveStore(memoryStore);

    if ((prisma as any).userReport && typeof (prisma as any).userReport.update === "function") {
      try {
        await (prisma as any).userReport.update({
          where: { id },
          data: { status, updatedAt: new Date(report.updatedAt) }
        });
      } catch (e) {}
    }

    auditEntryLogService.recordAdminActivity({
      actorId: effectiveActor.id,
      actorName: effectiveActor.name,
      actorEmail: effectiveActor.email,
      actorRole: effectiveActor.role || "ADMIN",
      activity: "USER_REPORT_STATUS_UPDATED",
      module: "SECURITY_FRAUD",
      resourceId: report.id,
      resourceType: "UserReport",
      status: "SUCCESS",
      details: `Report ${id} status updated to ${status}`
    });

    return report;
  }

  async getConfig(): Promise<FraudRuleConfigRecord> {
    const conf = memoryStore.config || DEFAULT_CONFIG;
    (conf as any).maxFailedBookingsThreshold = conf.failedBookingThreshold;
    (conf as any).bookingAttemptWindowSeconds = conf.bookingAttemptWindowMinutes * 60;
    (conf as any).duplicateScanWindowSeconds = conf.duplicateScanWindowMinutes * 60;
    return conf;
  }

  async updateConfig(
    newConfig: any,
    actor: any
  ): Promise<FraudRuleConfigRecord> {
    const current = await this.getConfig();
    const effectiveActor = typeof actor === "string" ? { email: actor, name: actor } : (actor || {});

    const failedThreshold = newConfig.failedBookingThreshold ?? newConfig.maxFailedBookingsThreshold;
    const windowMinutes = newConfig.bookingAttemptWindowMinutes ?? (newConfig.bookingAttemptWindowSeconds ? Math.ceil(newConfig.bookingAttemptWindowSeconds / 60) : undefined);
    const scanMinutes = newConfig.duplicateScanWindowMinutes ?? (newConfig.duplicateScanWindowSeconds ? Math.ceil(newConfig.duplicateScanWindowSeconds / 60) : undefined);

    // Bounds and validation with clamping
    const updated: FraudRuleConfigRecord = {
      ...current,
      maxBookingAttemptsPerWindow: Math.max(2, Math.min(50, Number(newConfig.maxBookingAttemptsPerWindow) || current.maxBookingAttemptsPerWindow)),
      bookingAttemptWindowMinutes: Math.max(1, Math.min(60, Number(windowMinutes) || current.bookingAttemptWindowMinutes)),
      failedBookingThreshold: Math.max(1, Math.min(20, Number(failedThreshold) || current.failedBookingThreshold)),
      seatHoldReleaseThreshold: Math.max(2, Math.min(20, Number(newConfig.seatHoldReleaseThreshold) || current.seatHoldReleaseThreshold)),
      listingSimilarityThreshold: Math.max(0, Math.min(100, Number(newConfig.listingSimilarityThreshold) !== undefined ? Number(newConfig.listingSimilarityThreshold) : current.listingSimilarityThreshold)),
      priceChangePercentThreshold: Math.max(10, Math.min(200, Number(newConfig.priceChangePercentThreshold) || current.priceChangePercentThreshold)),
      duplicateScanWindowMinutes: Math.max(1, Math.min(60, Number(scanMinutes) || current.duplicateScanWindowMinutes)),
      autoEscalateThreshold: Math.max(50, Math.min(95, Number(newConfig.autoEscalateThreshold) || current.autoEscalateThreshold)),
      alertRetentionDays: Math.max(30, Math.min(365, Number(newConfig.alertRetentionDays) || current.alertRetentionDays)),
      riskScoreWeights: newConfig.riskScoreWeights || current.riskScoreWeights,
      updatedBy: effectiveActor.name || effectiveActor.email || "Administrator",
      updatedAt: new Date().toISOString()
    };

    (updated as any).maxFailedBookingsThreshold = updated.failedBookingThreshold;
    (updated as any).bookingAttemptWindowSeconds = updated.bookingAttemptWindowMinutes * 60;
    (updated as any).duplicateScanWindowSeconds = updated.duplicateScanWindowMinutes * 60;

    memoryStore.config = updated;
    saveStore(memoryStore);

    if ((prisma as any).fraudRuleConfig && typeof (prisma as any).fraudRuleConfig.upsert === "function") {
      try {
        await (prisma as any).fraudRuleConfig.upsert({
          where: { id: "default_fraud_config" },
          update: {
            maxBookingAttemptsPerWindow: updated.maxBookingAttemptsPerWindow,
            bookingAttemptWindowMinutes: updated.bookingAttemptWindowMinutes,
            failedBookingThreshold: updated.failedBookingThreshold,
            seatHoldReleaseThreshold: updated.seatHoldReleaseThreshold,
            listingSimilarityThreshold: updated.listingSimilarityThreshold,
            priceChangePercentThreshold: updated.priceChangePercentThreshold,
            duplicateScanWindowMinutes: updated.duplicateScanWindowMinutes,
            riskScoreWeights: updated.riskScoreWeights,
            autoEscalateThreshold: updated.autoEscalateThreshold,
            alertRetentionDays: updated.alertRetentionDays,
            updatedBy: updated.updatedBy,
            updatedAt: new Date(updated.updatedAt)
          },
          create: {
            id: "default_fraud_config",
            ...updated,
            updatedAt: new Date(updated.updatedAt)
          }
        });
      } catch (e) {}
    }

    auditEntryLogService.recordAdminActivity({
      actorId: effectiveActor.id,
      actorName: effectiveActor.name,
      actorEmail: effectiveActor.email,
      actorRole: effectiveActor.role || "ADMIN",
      activity: "FRAUD_RULE_CONFIG_UPDATED",
      module: "SECURITY_FRAUD",
      resourceId: "default_fraud_config",
      resourceType: "FraudRuleConfig",
      status: "SUCCESS",
      severity: "WARNING",
      details: `Updated fraud detection rules and threshold bounds`,
      beforeValue: current,
      afterValue: updated
    });

    return updated;
  }

  async updateRuleConfig(newConfig: any, actor: any): Promise<FraudRuleConfigRecord> {
    return this.updateConfig(newConfig, actor);
  }

  // =========================================================================
  // DETECTION ENGINES & HOOKS
  // =========================================================================

  /**
   * Listing Risk Detection
   */
  async checkListingRisk(
    targetListing: {
      id: string;
      title: string;
      description?: string;
      venue?: string;
      price?: number;
      organizerId?: string;
    },
    existingListings: Array<{ id: string; title: string; venue?: string; price?: number; status?: string }>
  ): Promise<FraudAlertRecord | null> {
    const config = await this.getConfig();

    // 1. Duplicate listing similarity check
    for (const existing of existingListings) {
      if (existing.id === targetListing.id) continue;
      const sim = calculateTextSimilarity(targetListing.title, existing.title);
      if (sim >= config.listingSimilarityThreshold) {
        return this.recordAlert({
          category: "LISTING",
          severity: sim >= 90 ? "HIGH" : "MEDIUM",
          title: `Near-Duplicate Listing Detected: ${targetListing.title}`,
          description: `Listing '${targetListing.title}' exhibits ${sim}% text similarity with existing listing '${existing.title}' (${existing.id}).`,
          detectionRule: "DUPLICATE_EVENT_LISTING",
          relatedEntityType: "EVENT",
          relatedEntityId: targetListing.id,
          relatedEntityTitle: targetListing.title,
          riskScore: sim,
          evidenceSummary: `${sim}% lexical similarity with ${existing.id}`,
          evidenceData: {
            similarity: sim,
            matchedId: existing.id,
            matchedTitle: existing.title
          }
        });
      }
    }

    return null;
  }

  /**
   * Comprehensive Listing Submission Evaluation
   */
  async evaluateListingSubmission(params: {
    listingId: string;
    title: string;
    venueName?: string;
    organizerId?: string;
    organizerName?: string;
    isOrganizerVerified?: boolean;
    newPrice?: number;
    existingListings?: Array<{ id: string; title: string; venueName?: string }>;
  }): Promise<FraudAlertRecord[]> {
    const alerts: FraudAlertRecord[] = [];
    const config = await this.getConfig();

    // 1. Text similarity duplicate check
    if (params.existingListings && params.existingListings.length > 0) {
      for (const existing of params.existingListings) {
        if (existing.id === params.listingId) continue;
        const sim = calculateTextSimilarity(params.title, existing.title);
        if (sim >= config.listingSimilarityThreshold) {
          const alert = await this.recordAlert({
            category: "LISTING",
            severity: sim >= 90 ? "HIGH" : "MEDIUM",
            title: `Near-Duplicate Listing Detected: ${params.title}`,
            description: `Listing '${params.title}' has ${sim}% title similarity with existing event '${existing.title}' (${existing.id}).`,
            detectionRule: "LISTING_DUPLICATE_DETECTED",
            relatedEntityType: "EVENT",
            relatedEntityId: params.listingId,
            relatedEntityTitle: params.title,
            riskScore: sim,
            evidenceSummary: `${sim}% lexical similarity with existing event ${existing.id}`,
            evidenceData: {
              signals: [
                { signal: "LEXICAL_SIMILARITY", value: `${sim}% match`, confidence: sim },
                { signal: "MATCHED_EVENT_ID", value: existing.id, confidence: 90 }
              ]
            }
          });
          alerts.push(alert);
          break;
        }
      }
    }

    // 2. Unverified organizer listing check
    if (params.isOrganizerVerified === false) {
      const alert = await this.recordAlert({
        category: "ORGANIZER",
        severity: "LOW",
        title: `Unverified Organizer Submission: ${params.organizerName || params.organizerId}`,
        description: `Listing '${params.title}' submitted by unverified organizer ${params.organizerName || params.organizerId}. Flagged for administrative verification without automatic block.`,
        detectionRule: "LISTING_UNVERIFIED_ORGANIZER",
        relatedEntityType: "ORGANIZER",
        relatedEntityId: params.organizerId || params.listingId,
        relatedEntityTitle: params.organizerName || "Unverified Organizer",
        riskScore: 35,
        evidenceSummary: `KYC documents and bank verification pending for organizer ${params.organizerId}`,
        evidenceData: {
          signals: [
            { signal: "UNVERIFIED_KYC", value: "KYC verification pending", confidence: 60 }
          ]
        }
      });
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * Booking Risk Detection Hook
   */
  async checkBookingRisk(
    userId: string,
    recentAttempts: Array<{ timestamp: number; success: boolean }>
  ): Promise<FraudAlertRecord | null> {
    const config = await this.getConfig();
    const now = Date.now();
    const windowMs = config.bookingAttemptWindowMinutes * 60 * 1000;

    const inWindow = recentAttempts.filter((a) => now - a.timestamp <= windowMs);
    const failedCount = inWindow.filter((a) => !a.success).length;

    if (inWindow.length >= config.maxBookingAttemptsPerWindow && failedCount >= config.failedBookingThreshold) {
      return this.recordAlert({
        category: "BOOKING",
        severity: "HIGH",
        title: `Rapid Failed Booking Spikes: ${userId}`,
        description: `Customer account ${userId} exceeded safety thresholds with ${inWindow.length} attempts (${failedCount} failures) in ${config.bookingAttemptWindowMinutes} minutes.`,
        detectionRule: "RAPID_FAILED_BOOKINGS",
        relatedEntityType: "USER",
        relatedEntityId: userId,
        relatedEntityTitle: `User ${userId}`,
        riskScore: 78,
        evidenceSummary: `${failedCount} failed orders in ${config.bookingAttemptWindowMinutes} min window`,
        evidenceData: {
          totalAttempts: inWindow.length,
          failedCount,
          windowMinutes: config.bookingAttemptWindowMinutes
        }
      });
    }

    return null;
  }

  /**
   * Comprehensive Booking Attempt Evaluation
   */
  async evaluateBookingAttempt(params: {
    userId: string;
    userEmail?: string;
    targetEntityId?: string;
    seatsCount?: number;
    ipAddress?: string;
    recentAttemptsIn5Min?: number;
    recentFailuresIn10Min?: number;
  }): Promise<FraudAlertRecord[]> {
    const alerts: FraudAlertRecord[] = [];
    const config = await this.getConfig();

    const failures = params.recentFailuresIn10Min ?? 0;
    const attempts = params.recentAttemptsIn5Min ?? 0;

    if (failures >= config.failedBookingThreshold) {
      const alert = await this.recordAlert({
        category: "BOOKING",
        severity: failures >= 5 ? "CRITICAL" : "HIGH",
        title: `Repeated Failed Bookings Spike: ${params.userId}`,
        description: `Customer account ${params.userId} logged ${failures} consecutive failed checkout attempts within 10 minutes.`,
        detectionRule: "BOOKING_REPEATED_FAILURES",
        relatedEntityType: "BOOKING",
        relatedEntityId: params.targetEntityId || params.userId,
        relatedEntityTitle: `Customer ${params.userEmail || params.userId}`,
        riskScore: Math.min(95, 60 + failures * 7),
        evidenceSummary: `${failures} failed attempts in 10-minute window. IP: ${params.ipAddress || "Unknown"}`,
        evidenceData: {
          signals: [
            { signal: "REPEATED_FAILURES", value: `${failures} failures`, confidence: 85 },
            { signal: "RATE_ANOMALY", value: `${attempts} attempts in 5 min`, confidence: 80 }
          ]
        }
      });
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * Payment Irregularity Hook
   */
  async recordPaymentIrregularity(payload: {
    bookingId?: string;
    orderId: string;
    expectedAmountPaise: number;
    receivedAmountPaise: number;
    errorType: string;
    provider: string;
  }): Promise<FraudAlertRecord> {
    const diff = Math.abs(payload.expectedAmountPaise - payload.receivedAmountPaise);
    const expectedINR = (payload.expectedAmountPaise / 100).toFixed(2);
    const receivedINR = (payload.receivedAmountPaise / 100).toFixed(2);

    return this.recordAlert({
      category: "PAYMENT",
      severity: "CRITICAL",
      title: `Payment Amount Mismatch: Order ${payload.orderId}`,
      description: `Authoritative checkout calculation expects ₹${expectedINR}, but client payment token submitted ₹${receivedINR} (diff: ₹${(diff / 100).toFixed(2)}).`,
      detectionRule: "PAYMENT_AMOUNT_MISMATCH",
      relatedEntityType: "BOOKING",
      relatedEntityId: payload.bookingId || payload.orderId,
      relatedEntityTitle: `Order ${payload.orderId}`,
      riskScore: 94,
      evidenceSummary: `Expected ₹${expectedINR} vs Submitted ₹${receivedINR}. Confirmation blocked.`,
      evidenceData: {
        orderId: payload.orderId,
        provider: payload.provider,
        expectedAmountINR: expectedINR,
        receivedAmountINR: receivedINR,
        errorType: payload.errorType
      }
    });
  }

  /**
   * Comprehensive Payment Transaction Evaluation
   */
  async evaluatePaymentTransaction(params: {
    bookingId: string;
    expectedAmount: number;
    actualAmount: number;
    paymentGateway: string;
    transactionReference: string;
    isSignatureValid?: boolean;
    existingTransactionRefs?: string[];
  }): Promise<FraudAlertRecord[]> {
    const alerts: FraudAlertRecord[] = [];

    // 1. Amount mismatch check
    if (params.expectedAmount !== params.actualAmount) {
      const diff = Math.abs(params.expectedAmount - params.actualAmount);
      const alert = await this.recordAlert({
        category: "PAYMENT",
        severity: "CRITICAL",
        title: `Payment Amount Mismatch: Booking ${params.bookingId}`,
        description: `Server-side verified checkout expected ₹${params.expectedAmount}, but gateway callback received ₹${params.actualAmount} (Discrepancy: ₹${diff}).`,
        detectionRule: "PAYMENT_AMOUNT_MISMATCH",
        relatedEntityType: "BOOKING",
        relatedEntityId: params.bookingId,
        relatedEntityTitle: `Booking ${params.bookingId}`,
        riskScore: 98,
        evidenceSummary: `Expected ₹${params.expectedAmount} vs Gateway ₹${params.actualAmount}. Confirmation halted.`,
        evidenceData: {
          signals: [
            { signal: "AMOUNT_MISMATCH", value: `Expected ₹${params.expectedAmount}, got ₹${params.actualAmount}`, confidence: 100 },
            { signal: "GATEWAY", value: params.paymentGateway, confidence: 95 }
          ]
        }
      });
      alerts.push(alert);
    }

    // 2. Duplicate reference check (replay attack)
    if (params.existingTransactionRefs && params.existingTransactionRefs.includes(params.transactionReference)) {
      const alert = await this.recordAlert({
        category: "PAYMENT",
        severity: "CRITICAL",
        title: `Duplicate Payment Reference: ${params.transactionReference}`,
        description: `Transaction reference '${params.transactionReference}' was previously confirmed on another checkout. Replay attack blocked.`,
        detectionRule: "PAYMENT_DUPLICATE_REFERENCE",
        relatedEntityType: "BOOKING",
        relatedEntityId: params.bookingId,
        relatedEntityTitle: `Booking ${params.bookingId}`,
        riskScore: 92,
        evidenceSummary: `Replay attack detected: ref ${params.transactionReference} already consumed.`,
        evidenceData: {
          signals: [
            { signal: "REPLAYED_REFERENCE", value: params.transactionReference, confidence: 99 }
          ]
        }
      });
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * Ticket & QR Security Hook
   */
  async recordTicketScanAnomaly(payload: {
    ticketCode: string;
    bookingNumber?: string;
    title?: string;
    scanType: "DUPLICATE" | "CANCELLED" | "INVALID";
    operator: string;
    previousScannedAt?: string | null;
  }): Promise<FraudAlertRecord> {
    const rule =
      payload.scanType === "DUPLICATE"
        ? "DUPLICATE_TICKET_SCAN"
        : payload.scanType === "CANCELLED"
        ? "CANCELLED_TICKET_SCAN"
        : "INVALID_TICKET_TOKEN";

    const severity: AlertSeverity = payload.scanType === "DUPLICATE" ? "HIGH" : payload.scanType === "CANCELLED" ? "MEDIUM" : "LOW";
    const riskScore = payload.scanType === "DUPLICATE" ? 82 : payload.scanType === "CANCELLED" ? 48 : 35;

    return this.recordAlert({
      category: "TICKET",
      severity,
      title: `${payload.scanType === "DUPLICATE" ? "Duplicate Scan Attempt" : "Cancelled Ticket Scan"}: ${payload.ticketCode}`,
      description: `Ticket ${payload.ticketCode} was presented at terminal '${payload.operator}' with status ${payload.scanType}. Admission denied.`,
      detectionRule: rule,
      relatedEntityType: "TICKET",
      relatedEntityId: payload.ticketCode,
      relatedEntityTitle: payload.title || `Ticket ${payload.ticketCode}`,
      riskScore,
      evidenceSummary: `Scan rejected by ${payload.operator}. Previous scan: ${payload.previousScannedAt || "N/A"}`,
      evidenceData: {
        ticketCode: payload.ticketCode,
        bookingNumber: payload.bookingNumber,
        operator: payload.operator,
        scanType: payload.scanType,
        previousScannedAt: payload.previousScannedAt
      }
    });
  }

  /**
   * Comprehensive Ticket Scan Evaluation
   */
  async evaluateTicketScan(params: {
    ticketId: string;
    bookingId?: string;
    showId?: string;
    gateStaffId?: string;
    previousScansCount?: number;
    lastScanTimestamp?: string;
    ticketStatus?: string;
  }): Promise<FraudAlertRecord[]> {
    const alerts: FraudAlertRecord[] = [];

    // 1. Invalid status (CANCELLED, REFUNDED)
    if (params.ticketStatus === "CANCELLED" || params.ticketStatus === "REFUNDED") {
      const alert = await this.recordAlert({
        category: "TICKET",
        severity: "CRITICAL",
        title: `Invalid Ticket Status Scan: ${params.ticketId}`,
        description: `Ticket ${params.ticketId} with status '${params.ticketStatus}' was presented at gate terminal. Entry refused.`,
        detectionRule: "TICKET_INVALID_STATUS",
        relatedEntityType: "TICKET",
        relatedEntityId: params.ticketId,
        relatedEntityTitle: `Ticket ${params.ticketId}`,
        riskScore: 90,
        evidenceSummary: `Admission attempted with cancelled/refunded pass by terminal ${params.gateStaffId || "Gate"}`,
        evidenceData: {
          signals: [
            { signal: "INVALID_STATUS", value: params.ticketStatus, confidence: 95 }
          ]
        }
      });
      alerts.push(alert);
    }

    // 2. Duplicate rapid rescan
    if ((params.previousScansCount ?? 0) > 0) {
      const alert = await this.recordAlert({
        category: "TICKET",
        severity: "HIGH",
        title: `Duplicate Ticket Scan: ${params.ticketId}`,
        description: `Ticket ${params.ticketId} has already been scanned ${params.previousScansCount} time(s). Rescan recorded.`,
        detectionRule: "TICKET_DUPLICATE_SCAN",
        relatedEntityType: "TICKET",
        relatedEntityId: params.ticketId,
        relatedEntityTitle: `Ticket ${params.ticketId}`,
        riskScore: 82,
        evidenceSummary: `Previous scan registered at ${params.lastScanTimestamp || "earlier"}. Gate staff: ${params.gateStaffId || "Gate"}`,
        evidenceData: {
          signals: [
            { signal: "RAPID_RESCAN", value: `${params.previousScansCount} prior scans`, confidence: 85 }
          ]
        }
      });
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * RFC4180 CSV Export
   */
  async exportAlertsCsv(params: any): Promise<string> {
    const { alerts } = await this.getAlerts({ ...params, limit: 1000 });

    const headers = [
      "Alert ID",
      "Category",
      "Severity",
      "Status",
      "Risk Score",
      "Entity Type",
      "Entity ID",
      "Rule Triggered",
      "Title",
      "Assigned To",
      "Restricted",
      "Created At"
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = alerts.map((a) =>
      [
        escapeCsv(a.id),
        escapeCsv(a.category),
        escapeCsv(a.severity),
        escapeCsv(a.investigationStatus || a.status),
        escapeCsv(a.riskScore),
        escapeCsv(a.relatedEntityType || a.entityType),
        escapeCsv(a.relatedEntityId || a.entityId),
        escapeCsv(a.detectionRule || a.ruleTriggered),
        escapeCsv(a.title),
        escapeCsv(a.assignedTo || a.assignedInvestigator || "Unassigned"),
        escapeCsv(a.isRestricted ? "YES" : "NO"),
        escapeCsv(a.createdAt)
      ].join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  }

  private async getAllAlertsList(): Promise<FraudAlertRecord[]> {
    return memoryStore.alerts.map(decorateAlertRecord);
  }
}

export const fraudTrustService = new FraudTrustService();
