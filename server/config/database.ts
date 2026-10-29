import { PrismaClient } from "@prisma/client";
import { logger } from "../shared/logger";
import { env } from "./env";
import { supabaseAdmin } from "./supabaseAdmin";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prismaConnected = false;

const TABLE_COLUMNS: Record<string, Set<string>> = {
  Movie: new Set([
    'id', 'title', 'description', 'posterUrl', 'backdropUrl', 'trailerUrl',
    'duration', 'rating', 'votes', 'genres', 'languages', 'formats',
    'status', 'releaseDate', 'isActive', 'createdAt', 'updatedAt'
  ]),
  Theatre: new Set([
    'id', 'name', 'address', 'city', 'state', 'phone', 'status', 'createdAt', 'updatedAt'
  ]),
  Screen: new Set([
    'id', 'theatreId', 'name', 'capacity', 'status', 'createdAt', 'updatedAt'
  ]),
  Seat: new Set([
    'id', 'screenId', 'row', 'number', 'category', 'price', 'status', 'createdAt', 'updatedAt'
  ]),
  Show: new Set([
    'id', 'theatreId', 'screenId', 'movieId', 'eventId', 'startTime', 'endTime',
    'language', 'format', 'status', 'createdAt', 'updatedAt'
  ]),
  ShowSeat: new Set([
    'id', 'showId', 'seatId', 'price', 'status', 'lockedUntil', 'lockedBy'
  ]),
  Booking: new Set([
    'id', 'bookingNumber', 'theatreId', 'showId', 'userId', 'ticketAmount',
    'platformFee', 'convenienceFee', 'taxAmount', 'discountAmount', 'gatewayFee',
    'totalAmount', 'status', 'createdAt', 'updatedAt',
    'ticketSubtotal', 'ticket_subtotal', 'convenienceFeeTax', 'convenience_fee_tax',
    'feeSnapshot', 'fee_snapshot'
  ]),
  BookingItem: new Set([
    'id', 'bookingId', 'showSeatId', 'price'
  ]),
  Payment: new Set([
    'id', 'bookingId', 'provider', 'providerId', 'orderId', 'signature',
    'amount', 'currency', 'status', 'createdAt', 'updatedAt'
  ]),
  Ticket: new Set([
    'id', 'bookingId', 'ticketCode', 'qrToken', 'isUsed', 'usedAt', 'scannedBy',
    'createdAt', 'updatedAt'
  ]),
  Event: new Set([
    'id', 'title', 'description', 'category', 'bannerUrl', 'date', 'time',
    'city', 'venue', 'price', 'capacity', 'organizerId', 'status', 'createdAt', 'updatedAt'
  ]),
  EventTicketType: new Set([
    'id', 'eventId', 'name', 'price', 'capacity', 'available'
  ]),
  EventRegistration: new Set([
    'id', 'eventId', 'userId', 'ticketCount', 'totalAmount', 'status', 'passCode', 'createdAt'
  ]),
  EventFeeAuditLog: new Set([
    'id', 'eventId', 'action', 'previousStatus', 'newStatus', 'feeType', 'feeAmount',
    'feeApplication', 'enabled', 'actorId', 'actorEmail', 'reason', 'metadata', 'createdAt'
  ]),
  MovieConvenienceFee: new Set([
    'id', 'ticketPrice', 'baseCharge', 'category', 'gstRate', 'feeApplication', 'enabled',
    'description', 'createdAt', 'updatedAt',
    'ticket_price', 'base_charge', 'gst_rate', 'fee_application', 'created_at', 'updated_at'
  ]),
  MovieFeeAuditLog: new Set([
    'id', 'feeConfigId', 'action', 'ticketPrice', 'baseCharge', 'gstRate', 'actorId',
    'actorEmail', 'reason', 'metadata', 'createdAt',
    'fee_config_id', 'ticket_price', 'base_charge', 'gst_rate', 'actor_id', 'actor_email', 'created_at'
  ]),
  User: new Set([
    'id', 'email', 'passwordHash', 'name', 'mobile', 'role', 'isActive', 'isVerified',
    'profileImageUrl', 'dateOfBirth', 'lastLoginAt', 'createdAt', 'updatedAt'
  ]),
  AuthProvider: new Set([
    'id', 'userId', 'provider', 'providerAccountId', 'createdAt'
  ]),
  app_settings: new Set([
    'id', 'maintenance_mode', 'maintenance_title', 'maintenance_message',
    'maintenance_countdown_enabled', 'maintenance_end_time', 'service_controls',
    'updated_at', 'updated_by', 'global_subwebsite_enabled', 'subwebsite_maintenance_message'
  ]),
  FinancialAuditLog: new Set([
    'id', 'eventType', 'actorEmail', 'description', 'metadata', 'createdAt'
  ]),
  Employee: new Set([
    'id', 'employeeId', 'fullName', 'username', 'email', 'mobile', 'department',
    'designation', 'roleId', 'passwordHash', 'status', 'lastLoginAt', 'createdAt', 'updatedAt'
  ]),
  Role: new Set([
    'id', 'name', 'displayName', 'description', 'isSystemRole', 'createdAt', 'updatedAt'
  ]),
  Permission: new Set([
    'id', 'module', 'action', 'description', 'createdAt', 'updatedAt'
  ]),
  RolePermission: new Set([
    'id', 'roleId', 'permissionId', 'createdAt'
  ]),
  EmployeePermission: new Set([
    'id', 'employeeId', 'permissionId', 'isGranted', 'createdAt', 'updatedAt'
  ]),
  EmployeeActivityLog: new Set([
    'id', 'employeeId', 'employeeName', 'username', 'employeeCode', 'action', 'module', 'result',
    'ipAddress', 'userAgent', 'metadata', 'createdAt'
  ]),
  AuditEntryLog: new Set([
    'id', 'timestamp', 'logType', 'actorId', 'actorName', 'actorEmail', 'actorRole',
    'activity', 'module', 'resourceId', 'resourceType', 'status', 'severity', 'details',
    'ipAddress', 'userAgent', 'device', 'beforeValue', 'afterValue', 'metadata', 'createdAt'
  ]),
  FraudAlert: new Set([
    'id', 'category', 'severity', 'title', 'description', 'detectionRule', 'relatedEntityType',
    'relatedEntityId', 'relatedEntityTitle', 'riskScore', 'evidenceSummary', 'evidenceData',
    'investigationStatus', 'assignedTo', 'internalNotes', 'resolutionReason', 'actionHistory',
    'isRestricted', 'createdAt', 'updatedAt'
  ]),
  UserReport: new Set([
    'id', 'category', 'reporterEmail', 'reporterName', 'targetType', 'targetId',
    'targetTitle', 'reason', 'evidenceText', 'status', 'linkedAlertId', 'createdAt', 'updatedAt'
  ]),
  FraudRuleConfig: new Set([
    'id', 'maxBookingAttemptsPerWindow', 'bookingAttemptWindowMinutes', 'failedBookingThreshold',
    'seatHoldReleaseThreshold', 'listingSimilarityThreshold', 'priceChangePercentThreshold',
    'duplicateScanWindowMinutes', 'riskScoreWeights', 'autoEscalateThreshold', 'alertRetentionDays',
    'updatedBy', 'updatedAt', 'metadata'
  ]),
  AnalyticsEngagementEvent: new Set([
    'id', 'eventType', 'entityType', 'entityId', 'entityTitle', 'category', 'city',
    'sessionId', 'userId', 'device', 'metadata', 'createdAt'
  ])
};

function sanitizeRecord(tableName: string, data: any) {
  if (!data || typeof data !== "object") return {};
  const clean: any = {};
  const allowed = TABLE_COLUMNS[tableName];

  // Map known aliases if incoming from client
  const normalized: any = { ...data };
  if (tableName === "Movie") {
    if (normalized.durationMins !== undefined && normalized.duration === undefined) {
      normalized.duration = Number(normalized.durationMins) || 120;
    }
    if (normalized.poster && !normalized.posterUrl) normalized.posterUrl = normalized.poster;
    if (normalized.banner && !normalized.backdropUrl) normalized.backdropUrl = normalized.banner;
    if (typeof normalized.genre === "string" && !normalized.genres) {
      normalized.genres = normalized.genre.split(",").map((s: string) => s.trim());
    }
    if (typeof normalized.language === "string" && !normalized.languages) {
      normalized.languages = [normalized.language.trim()];
    }
  } else if (tableName === "Theatre") {
    if (normalized.location && !normalized.address) normalized.address = normalized.location;
  } else if (tableName === "Event") {
    if (normalized.venueName && !normalized.venue) normalized.venue = normalized.venueName;
    if (normalized.image && !normalized.bannerUrl) normalized.bannerUrl = normalized.image;
    if (normalized.convenienceFeeEnabled !== undefined) {
      if (normalized.convenience_fee_enabled === undefined) normalized.convenience_fee_enabled = normalized.convenienceFeeEnabled;
      delete normalized.convenienceFeeEnabled;
    }
    if (normalized.convenienceFeeType !== undefined) {
      if (normalized.convenience_fee_type === undefined) normalized.convenience_fee_type = normalized.convenienceFeeType;
      delete normalized.convenienceFeeType;
    }
    if (normalized.convenienceFeeAmount !== undefined) {
      if (normalized.convenience_fee_amount === undefined) normalized.convenience_fee_amount = normalized.convenienceFeeAmount;
      delete normalized.convenienceFeeAmount;
    }
    if (normalized.convenienceFeeApplication !== undefined) {
      if (normalized.convenience_fee_application === undefined) normalized.convenience_fee_application = normalized.convenienceFeeApplication;
      delete normalized.convenienceFeeApplication;
    }
    if (normalized.convenienceFeeStatus !== undefined) {
      if (normalized.convenience_fee_status === undefined) normalized.convenience_fee_status = normalized.convenienceFeeStatus;
      delete normalized.convenienceFeeStatus;
    }
    if (normalized.convenienceFeeApprovedBy !== undefined) {
      if (normalized.convenience_fee_approved_by === undefined) normalized.convenience_fee_approved_by = normalized.convenienceFeeApprovedBy;
      delete normalized.convenienceFeeApprovedBy;
    }
    if (normalized.convenienceFeeApprovedAt !== undefined) {
      if (normalized.convenience_fee_approved_at === undefined) normalized.convenience_fee_approved_at = normalized.convenienceFeeApprovedAt;
      delete normalized.convenienceFeeApprovedAt;
    }
  } else if (tableName === "EventRegistration") {
    if (normalized.ticketSubtotal !== undefined) {
      if (normalized.ticket_subtotal === undefined) normalized.ticket_subtotal = normalized.ticketSubtotal;
      delete normalized.ticketSubtotal;
    }
    if (normalized.convenienceFee !== undefined) {
      if (normalized.convenience_fee === undefined) normalized.convenience_fee = normalized.convenienceFee;
      delete normalized.convenienceFee;
    }
    if (normalized.discountAmount !== undefined) {
      if (normalized.discount_amount === undefined) normalized.discount_amount = normalized.discountAmount;
      delete normalized.discountAmount;
    }
    if (normalized.finalPayableAmount !== undefined) {
      if (normalized.final_payable_amount === undefined) normalized.final_payable_amount = normalized.finalPayableAmount;
      delete normalized.finalPayableAmount;
    }
    if (normalized.feeConfigurationSnapshot !== undefined) {
      if (normalized.fee_configuration_snapshot === undefined) normalized.fee_configuration_snapshot = normalized.feeConfigurationSnapshot;
      delete normalized.feeConfigurationSnapshot;
    }
  } else if (tableName === "Booking") {
    if (normalized.ticketSubtotal !== undefined && normalized.ticket_subtotal === undefined) {
      normalized.ticket_subtotal = normalized.ticketSubtotal;
    }
    if (normalized.convenienceFeeTax !== undefined && normalized.convenience_fee_tax === undefined) {
      normalized.convenience_fee_tax = normalized.convenienceFeeTax;
    }
    if (normalized.feeSnapshot !== undefined && normalized.fee_snapshot === undefined) {
      normalized.fee_snapshot = normalized.feeSnapshot;
    }
  } else if (tableName === "MovieConvenienceFee") {
    if (normalized.ticketPrice !== undefined && normalized.ticket_price === undefined) {
      normalized.ticket_price = normalized.ticketPrice;
    }
    if (normalized.baseCharge !== undefined && normalized.base_charge === undefined) {
      normalized.base_charge = normalized.baseCharge;
    }
    if (normalized.gstRate !== undefined && normalized.gst_rate === undefined) {
      normalized.gst_rate = normalized.gstRate;
    }
    if (normalized.feeApplication !== undefined && normalized.fee_application === undefined) {
      normalized.fee_application = normalized.feeApplication;
    }
  } else if (tableName === "MovieFeeAuditLog") {
    if (normalized.feeConfigId !== undefined && normalized.fee_config_id === undefined) {
      normalized.fee_config_id = normalized.feeConfigId;
    }
    if (normalized.ticketPrice !== undefined && normalized.ticket_price === undefined) {
      normalized.ticket_price = normalized.ticketPrice;
    }
    if (normalized.baseCharge !== undefined && normalized.base_charge === undefined) {
      normalized.base_charge = normalized.baseCharge;
    }
    if (normalized.gstRate !== undefined && normalized.gst_rate === undefined) {
      normalized.gst_rate = normalized.gstRate;
    }
    if (normalized.actorId !== undefined && normalized.actor_id === undefined) {
      normalized.actor_id = normalized.actorId;
    }
    if (normalized.actorEmail !== undefined && normalized.actor_email === undefined) {
      normalized.actor_email = normalized.actorEmail;
    }
  } else if (tableName === "app_settings") {
    if (normalized.maintenanceMode !== undefined && normalized.maintenance_mode === undefined) {
      normalized.maintenance_mode = normalized.maintenanceMode;
    }
    if (normalized.maintenanceTitle !== undefined && normalized.maintenance_title === undefined) {
      normalized.maintenance_title = normalized.maintenanceTitle;
    }
    if (normalized.maintenanceMessage !== undefined && normalized.maintenance_message === undefined) {
      normalized.maintenance_message = normalized.maintenanceMessage;
    }
    if (normalized.maintenanceCountdownEnabled !== undefined && normalized.maintenance_countdown_enabled === undefined) {
      normalized.maintenance_countdown_enabled = normalized.maintenanceCountdownEnabled;
    }
    if (normalized.maintenanceEndTime !== undefined && normalized.maintenance_end_time === undefined) {
      normalized.maintenance_end_time = normalized.maintenanceEndTime;
    }
    if (normalized.globalSubwebsiteEnabled !== undefined && normalized.global_subwebsite_enabled === undefined) {
      normalized.global_subwebsite_enabled = normalized.globalSubwebsiteEnabled;
    }
    if (normalized.subwebsiteMaintenanceMessage !== undefined && normalized.subwebsite_maintenance_message === undefined) {
      normalized.subwebsite_maintenance_message = normalized.subwebsiteMaintenanceMessage;
    }
    if (normalized.serviceControls !== undefined && normalized.service_controls === undefined) {
      normalized.service_controls = normalized.serviceControls;
    }
    if (normalized.updatedAt !== undefined && normalized.updated_at === undefined) {
      normalized.updated_at = normalized.updatedAt;
    }
    if (normalized.updatedBy !== undefined && normalized.updated_by === undefined) {
      normalized.updated_by = normalized.updatedBy;
    }
    normalized.updated_at = new Date().toISOString();
  }

  for (const [k, v] of Object.entries(normalized)) {
    // Exclude relational nested Prisma objects like { create: ... }, { connect: ... } but preserve valid JSON columns
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      !(v instanceof Date) &&
      k !== "service_controls" &&
      k !== "serviceControls" &&
      k !== "metadata"
    ) {
      continue;
    }
    // Whitelist check if table columns are known
    if (allowed && !allowed.has(k)) {
      continue;
    }
    clean[k] = v;
  }
  return clean;
}

function applyWhereClause(query: any, where: any) {
  if (!where || typeof where !== "object") return query;
  let q = query;
  for (const [k, v] of Object.entries(where)) {
    if (k === "OR") continue;
    if (v === null) {
      q = q.is(k, null);
    } else if (v !== undefined) {
      const formatVal = (val: any) => val instanceof Date ? val.toISOString() : val;
      if (typeof v === "object" && !(v instanceof Date)) {
        // Skip Prisma relational filters like authProviders: { some: ... }
        if ("some" in (v as any) || "every" in (v as any) || "none" in (v as any)) {
          continue;
        }
        if ("equals" in (v as any)) {
          const eqVal = formatVal((v as any).equals);
          if ((v as any).mode === "insensitive" && typeof eqVal === "string") {
            q = q.ilike(k, eqVal);
          } else {
            q = q.eq(k, eqVal);
          }
        } else if ("contains" in (v as any)) {
          const cVal = formatVal((v as any).contains);
          if ((v as any).mode === "insensitive" && typeof cVal === "string") {
            q = q.ilike(k, `%${cVal}%`);
          } else {
            q = q.like(k, `%${cVal}%`);
          }
        } else if ("startsWith" in (v as any)) {
          const sVal = formatVal((v as any).startsWith);
          if ((v as any).mode === "insensitive" && typeof sVal === "string") {
            q = q.ilike(k, `${sVal}%`);
          } else {
            q = q.like(k, `${sVal}%`);
          }
        } else if ("in" in (v as any) && Array.isArray((v as any).in)) {
          q = q.in(k, (v as any).in.map(formatVal));
        } else if ("gt" in (v as any)) {
          q = q.gt(k, formatVal((v as any).gt));
        } else if ("gte" in (v as any)) {
          q = q.gte(k, formatVal((v as any).gte));
        } else if ("lt" in (v as any)) {
          q = q.lt(k, formatVal((v as any).lt));
        } else if ("lte" in (v as any)) {
          q = q.lte(k, formatVal((v as any).lte));
        } else {
          // Compound unique constraint object like provider_providerAccountId: { provider: "google", providerAccountId: "123" }
          for (const [subK, subV] of Object.entries(v as any)) {
            if (subV !== undefined && subV !== null && typeof subV !== "object") {
              q = q.eq(subK, subV);
            }
          }
        }
      } else {
        q = q.eq(k, formatVal(v));
      }
    }
  }
  return q;
}

const TABLES_WITHOUT_UPDATED_AT = new Set([
  "PasswordResetToken",
  "RefreshToken",
  "EmailVerificationToken",
  "EventTicketType",
  "AuthProvider",
  "ShowSeat",
  "EventRegistration",
  "BookingItem",
  "app_settings",
  "FinancialAuditLog",
  "EventFeeAuditLog",
  "MovieFeeAuditLog"
]);

function normalizeReturnedRecord(tableName: string, data: any): any {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) return data.map((item) => normalizeReturnedRecord(tableName, item));
  if (tableName === "app_settings") {
    return {
      ...data,
      maintenanceMode: data.maintenance_mode !== undefined ? data.maintenance_mode : data.maintenanceMode,
      maintenanceTitle: data.maintenance_title !== undefined ? data.maintenance_title : data.maintenanceTitle,
      maintenanceMessage: data.maintenance_message !== undefined ? data.maintenance_message : data.maintenanceMessage,
      maintenanceCountdownEnabled: data.maintenance_countdown_enabled !== undefined ? data.maintenance_countdown_enabled : data.maintenanceCountdownEnabled,
      maintenanceEndTime: data.maintenance_end_time !== undefined ? data.maintenance_end_time : data.maintenanceEndTime,
      serviceControls: data.service_controls !== undefined ? data.service_controls : data.serviceControls,
      globalSubwebsiteEnabled: data.global_subwebsite_enabled !== undefined ? data.global_subwebsite_enabled : data.globalSubwebsiteEnabled,
      subwebsiteMaintenanceMessage: data.subwebsite_maintenance_message !== undefined ? data.subwebsite_maintenance_message : data.subwebsiteMaintenanceMessage,
      updatedAt: data.updated_at !== undefined ? data.updated_at : data.updatedAt,
      updatedBy: data.updated_by !== undefined ? data.updated_by : data.updatedBy
    };
  }
  if (tableName === "Event") {
    const isFeeEnabled = data.convenience_fee_enabled !== undefined ? Boolean(data.convenience_fee_enabled) : Boolean(data.convenienceFeeEnabled);
    const feeType = data.convenience_fee_type || data.convenienceFeeType || "FIXED";
    const feeAmt = Number(data.convenience_fee_amount !== undefined ? data.convenience_fee_amount : (data.convenienceFeeAmount || 0));
    const feeApp = data.convenience_fee_application || data.convenienceFeeApplication || "PER_TICKET";
    const feeStat = data.convenience_fee_status || data.convenienceFeeStatus || "PENDING";
    const feeAppBy = data.convenience_fee_approved_by !== undefined ? data.convenience_fee_approved_by : data.convenienceFeeApprovedBy;
    const feeAppAt = data.convenience_fee_approved_at !== undefined ? data.convenience_fee_approved_at : data.convenienceFeeApprovedAt;
    return {
      ...data,
      convenienceFeeEnabled: isFeeEnabled,
      convenienceFeeType: feeType,
      convenienceFeeAmount: feeAmt,
      convenienceFeeApplication: feeApp,
      convenienceFeeStatus: feeStat,
      convenienceFeeApprovedBy: feeAppBy,
      convenienceFeeApprovedAt: feeAppAt,
      convenience_fee_enabled: isFeeEnabled,
      convenience_fee_type: feeType,
      convenience_fee_amount: feeAmt,
      convenience_fee_application: feeApp,
      convenience_fee_status: feeStat,
      convenience_fee_approved_by: feeAppBy,
      convenience_fee_approved_at: feeAppAt,
    };
  }
  if (tableName === "EventRegistration") {
    const subtotal = Number(data.ticket_subtotal !== undefined ? data.ticket_subtotal : (data.ticketSubtotal || 0));
    const fee = Number(data.convenience_fee !== undefined ? data.convenience_fee : (data.convenienceFee || 0));
    const discount = Number(data.discount_amount !== undefined ? data.discount_amount : (data.discountAmount || 0));
    const finalAmount = Number(data.final_payable_amount !== undefined ? data.final_payable_amount : (data.finalPayableAmount || data.totalAmount || 0));
    const snapshot = data.fee_configuration_snapshot !== undefined ? data.fee_configuration_snapshot : data.feeConfigurationSnapshot;
    return {
      ...data,
      ticketSubtotal: subtotal,
      convenienceFee: fee,
      discountAmount: discount,
      finalPayableAmount: finalAmount,
      feeConfigurationSnapshot: snapshot,
      ticket_subtotal: subtotal,
      convenience_fee: fee,
      discount_amount: discount,
      final_payable_amount: finalAmount,
      fee_configuration_snapshot: snapshot,
    };
  }
  if (tableName === "MovieConvenienceFee") {
    return {
      ...data,
      ticketPrice: Number(data.ticket_price !== undefined ? data.ticket_price : (data.ticketPrice || 0)),
      baseCharge: Number(data.base_charge !== undefined ? data.base_charge : (data.baseCharge || 0)),
      gstRate: Number(data.gst_rate !== undefined ? data.gst_rate : (data.gstRate !== undefined ? data.gstRate : 18.0)),
      feeApplication: data.fee_application || data.feeApplication || "PER_TICKET",
      category: data.category || "STANDARD",
      enabled: data.enabled !== undefined ? Boolean(data.enabled) : true,
      description: data.description || null,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt
    };
  }
  if (tableName === "MovieFeeAuditLog") {
    return {
      ...data,
      feeConfigId: data.fee_config_id || data.feeConfigId,
      ticketPrice: data.ticket_price !== undefined ? Number(data.ticket_price) : (data.ticketPrice !== undefined ? Number(data.ticketPrice) : undefined),
      baseCharge: data.base_charge !== undefined ? Number(data.base_charge) : (data.baseCharge !== undefined ? Number(data.baseCharge) : undefined),
      gstRate: data.gst_rate !== undefined ? Number(data.gst_rate) : (data.gstRate !== undefined ? Number(data.gstRate) : undefined),
      actorId: data.actor_id || data.actorId,
      actorEmail: data.actor_email || data.actorEmail,
      createdAt: data.created_at || data.createdAt
    };
  }
  return data;
}

function createSupabaseTableProxy(tableName: string) {
  const hasUpdatedAt = !TABLES_WITHOUT_UPDATED_AT.has(tableName);

  return {
    async findMany(args?: any) {
      if (!supabaseAdmin) return [];
      try {
        let query = supabaseAdmin.from(tableName).select("*");
        if (args?.where?.OR && Array.isArray(args.where.OR)) {
          const orParts: string[] = [];
          for (const branch of args.where.OR) {
            for (const [k, v] of Object.entries(branch)) {
              if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
                orParts.push(`${k}.eq.${v}`);
              }
            }
          }
          if (orParts.length > 0) query = query.or(orParts.join(","));
        }
        query = applyWhereClause(query, args?.where);
        if (args?.orderBy) {
          for (const [k, v] of Object.entries(args.orderBy)) {
            query = query.order(k, { ascending: v === "asc" });
          }
        }
        if (args?.take) {
          query = query.limit(args.take);
        }
        const { data, error } = await query;
        if (error) {
          logger.warn(`[SupabaseProxy:${tableName}] findMany error: ${error.message}`);
          return [];
        }
        return normalizeReturnedRecord(tableName, data || []);
      } catch (e: any) {
        logger.warn(`[SupabaseProxy:${tableName}] findMany exception: ${e.message}`);
        return [];
      }
    },

    async findUnique(args: any) {
      if (!supabaseAdmin) return null;
      try {
        let query = supabaseAdmin.from(tableName).select("*");
        query = applyWhereClause(query, args?.where);
        const { data, error } = await query.limit(1).maybeSingle();
        if (error) {
          return null;
        }
        return normalizeReturnedRecord(tableName, data || null);
      } catch {
        return null;
      }
    },

    async findFirst(args?: any) {
      if (!supabaseAdmin) return null;
      try {
        let query = supabaseAdmin.from(tableName).select("*");
        if (args?.where?.OR && Array.isArray(args.where.OR)) {
          const orParts: string[] = [];
          for (const branch of args.where.OR) {
            for (const [k, v] of Object.entries(branch)) {
              if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
                orParts.push(`${k}.eq.${v}`);
              }
            }
          }
          if (orParts.length > 0) query = query.or(orParts.join(","));
        }
        query = applyWhereClause(query, args?.where);
        const { data, error } = await query.limit(1).maybeSingle();
        if (error) {
          return null;
        }
        return normalizeReturnedRecord(tableName, data || null);
      } catch {
        return null;
      }
    },

    async create(args: any) {
      if (!supabaseAdmin) throw new Error(`Database offline: cannot create in ${tableName}`);
      const dataToInsert = sanitizeRecord(tableName, args.data);
      if (!dataToInsert.id) {
        dataToInsert.id = `${tableName.toLowerCase().slice(0, 3)}_${Math.random().toString(36).substring(2, 10)}`;
      }
      if (hasUpdatedAt && ['User', 'Movie', 'Theatre', 'Screen', 'Seat', 'Show', 'Booking', 'Payment', 'Ticket', 'Event'].includes(tableName)) {
        dataToInsert.updatedAt = dataToInsert.updatedAt || new Date().toISOString();
      }
      const { data, error } = await supabaseAdmin.from(tableName).insert(dataToInsert).select().single();
      if (error) {
        throw new Error(`[SupabaseProxy:${tableName}] create error: ${error.message}`);
      }
      return normalizeReturnedRecord(tableName, data);
    },

    async createMany(args: any) {
      if (!supabaseAdmin) return { count: 0 };
      const records = (args.data || []).map((d: any) => {
        const clean = sanitizeRecord(tableName, d);
        const rec: any = {
          ...clean,
          id: clean.id || `${tableName.toLowerCase().slice(0, 3)}_${Math.random().toString(36).substring(2, 10)}`
        };
        if (hasUpdatedAt) {
          rec.updatedAt = new Date().toISOString();
        }
        return rec;
      });
      const { data, error } = await supabaseAdmin.from(tableName).insert(records).select();
      if (error) {
        logger.warn(`[SupabaseProxy:${tableName}] createMany error: ${error.message}`);
        return { count: 0 };
      }
      return { count: data?.length || 0 };
    },

    async update(args: any) {
      if (!supabaseAdmin) throw new Error(`Database offline: cannot update ${tableName}`);
      const cleanData = sanitizeRecord(tableName, args.data);
      const updatePayload = hasUpdatedAt
        ? { ...cleanData, updatedAt: new Date().toISOString() }
        : { ...cleanData };
      let query = supabaseAdmin.from(tableName).update(updatePayload);
      query = applyWhereClause(query, args?.where);
      const { data, error } = await query.select().single();
      if (error) {
        throw new Error(`[SupabaseProxy:${tableName}] update error: ${error.message}`);
      }
      return normalizeReturnedRecord(tableName, data);
    },

    async upsert(args: any) {
      if (!supabaseAdmin) throw new Error(`Database offline: cannot upsert ${tableName}`);
      const where = args?.where || {};
      let existing: any = null;
      try {
        let checkQuery = supabaseAdmin.from(tableName).select("*");
        checkQuery = applyWhereClause(checkQuery, where);
        const { data } = await checkQuery.maybeSingle();
        existing = data;
      } catch {
        existing = null;
      }

      if (existing) {
        const cleanUpdate = sanitizeRecord(tableName, args.update);
        const updatePayload = hasUpdatedAt
          ? { ...cleanUpdate, updatedAt: new Date().toISOString() }
          : { ...cleanUpdate };
        let updateQuery = supabaseAdmin.from(tableName).update(updatePayload);
        updateQuery = applyWhereClause(updateQuery, where);
        const { data, error } = await updateQuery.select().single();
        if (error) {
          logger.warn(`[SupabaseProxy:${tableName}] upsert(update) error: ${error.message}`);
          return normalizeReturnedRecord(tableName, { ...existing, ...cleanUpdate });
        }
        return normalizeReturnedRecord(tableName, data || { ...existing, ...cleanUpdate });
      } else {
        const cleanCreate = sanitizeRecord(tableName, args.create);
        const record: any = {
          id: cleanCreate.id || crypto.randomUUID(),
          ...cleanCreate,
          createdAt: cleanCreate.createdAt || new Date().toISOString()
        };
        if (hasUpdatedAt) {
          record.updatedAt = new Date().toISOString();
        }
        const { data, error } = await supabaseAdmin.from(tableName).insert(record).select().single();
        if (error) {
          logger.warn(`[SupabaseProxy:${tableName}] upsert(create) error: ${error.message}`);
          return normalizeReturnedRecord(tableName, record);
        }
        return normalizeReturnedRecord(tableName, data || record);
      }
    },

    async updateMany(args: any) {
      if (!supabaseAdmin) return { count: 0 };
      const cleanData = sanitizeRecord(tableName, args.data);
      const updatePayload = hasUpdatedAt
        ? { ...cleanData, updatedAt: new Date().toISOString() }
        : { ...cleanData };
      let query = supabaseAdmin.from(tableName).update(updatePayload);
      query = applyWhereClause(query, args?.where);
      const { data, error } = await query.select();
      if (error) {
        logger.warn(`[SupabaseProxy:${tableName}] updateMany error: ${error.message}`);
        return { count: 0 };
      }
      return { count: data?.length || 0 };
    },

    async delete(args: any) {
      if (!supabaseAdmin) return null;
      let query = supabaseAdmin.from(tableName).delete();
      query = applyWhereClause(query, args?.where);
      const { data } = await query.select().maybeSingle();
      return data || null;
    },

    async deleteMany(args?: any) {
      if (!supabaseAdmin) return { count: 0 };
      let query = supabaseAdmin.from(tableName).delete();
      query = applyWhereClause(query, args?.where);
      const { data } = await query.select();
      return { count: data?.length || 0 };
    },

    async count(args?: any) {
      if (!supabaseAdmin) return 0;
      try {
        const { count, error } = await supabaseAdmin
          .from(tableName)
          .select("*", { count: "exact", head: true });
        if (error) return 0;
        return count || 0;
      } catch {
        return 0;
      }
    }
  };
}

const TABLE_MAP: { [key: string]: string } = {
  user: "User",
  movie: "Movie",
  theatre: "Theatre",
  screen: "Screen",
  seat: "Seat",
  show: "Show",
  showSeat: "ShowSeat",
  booking: "Booking",
  bookingItem: "BookingItem",
  payment: "Payment",
  ticket: "Ticket",
  event: "Event",
  eventTicketType: "EventTicketType",
  eventRegistration: "EventRegistration",
  settlement: "Settlement",
  app_settings: "app_settings",
  appsettings: "app_settings",
  appSettings: "app_settings",
  emailverificationtoken: "EmailVerificationToken",
  refreshtoken: "RefreshToken",
  passwordresettoken: "PasswordResetToken",
  authprovider: "AuthProvider",
  financialauditlog: "FinancialAuditLog",
  financialAuditLog: "FinancialAuditLog",
  eventfeeauditlog: "EventFeeAuditLog",
  eventFeeAuditLog: "EventFeeAuditLog",
  movieconveniencefee: "MovieConvenienceFee",
  movieConvenienceFee: "MovieConvenienceFee",
  moviefee: "MovieConvenienceFee",
  movieFee: "MovieConvenienceFee",
  moviefeeauditlog: "MovieFeeAuditLog",
  movieFeeAuditLog: "MovieFeeAuditLog",
  employeeactivitylog: "EmployeeActivityLog",
  employeeActivityLog: "EmployeeActivityLog",
  auditentrylog: "AuditEntryLog",
  auditEntryLog: "AuditEntryLog"
};

function initPrismaClient(): PrismaClient {
  if (globalThis.prismaGlobal) return globalThis.prismaGlobal;
  try {
    const rawClient = new PrismaClient({
      datasourceUrl: env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/cinevenue",
      log: []
    });

    const hybridClient = new Proxy(rawClient as any, {
      get(target, prop: string) {
        if (prop === "$disconnect" || prop === "$connect") {
          return async () => {
            try {
              return await target[prop]?.();
            } catch {
              return;
            }
          };
        }
        if (prop === "$queryRaw") {
          return async (...args: any[]) => {
            if (prismaConnected) {
              try {
                return await target.$queryRaw(...args);
              } catch (err) {
                if (supabaseAdmin) return [{ count: 1 }];
                throw err;
              }
            }
            if (supabaseAdmin) return [{ count: 1 }];
            return [{ count: 1 }];
          };
        }
        if (prop === "$transaction") {
          return async (fnOrArray: any) => {
            if (typeof fnOrArray === "function") {
              return fnOrArray(hybridClient);
            }
            if (Array.isArray(fnOrArray)) {
              return Promise.all(fnOrArray);
            }
            return null;
          };
        }

        const modelName = prop.toLowerCase();
        const mappedTable = TABLE_MAP[modelName] || TABLE_MAP[prop];
        if (mappedTable) {
          const supabaseHandler = createSupabaseTableProxy(mappedTable);
          const rawModel = target[prop];

          if (!rawModel || !prismaConnected) return supabaseHandler;

          return new Proxy(rawModel, {
            get(mTarget, mProp: string) {
              return async (...mArgs: any[]) => {
                if (prismaConnected) {
                  try {
                    return await (mTarget as any)[mProp]?.(...mArgs);
                  } catch {
                    // Fall back to Supabase
                  }
                }
                const fallbackFn = (supabaseHandler as any)[mProp];
                if (typeof fallbackFn === "function") {
                  return await fallbackFn(...mArgs);
                }
                try {
                  return await (mTarget as any)[mProp]?.(...mArgs);
                } catch {
                  return null;
                }
              };
            }
          });
        }

        return target[prop];
      }
    });

    globalThis.prismaGlobal = hybridClient;
    return hybridClient;
  } catch (err: any) {
    return new Proxy({} as any, {
      get(target, prop: string) {
        const mapped = TABLE_MAP[prop.toLowerCase()] || TABLE_MAP[prop];
        if (mapped) return createSupabaseTableProxy(mapped);
        return () => null;
      }
    });
  }
}

export const prisma = initPrismaClient();

export async function checkDatabaseConnection(): Promise<boolean> {
  // If Supabase is configured and healthy, we are connected to the central database
  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin.from("app_settings").select("id").limit(1);
      if (!error) {
        return true;
      }
    } catch {
      // ignore
    }
  }

  try {
    await (prisma as any).$queryRaw`SELECT 1`;
    prismaConnected = true;
    return true;
  } catch {
    prismaConnected = false;
  }

  return false;
}

export function isDatabaseConnected(): boolean {
  return Boolean(supabaseAdmin) || prismaConnected;
}
