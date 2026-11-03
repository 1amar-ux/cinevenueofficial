/**
 * CineVenue Centralized Authoritative Pricing & Convenience Fee Management Engine
 *
 * Single Source of Truth for all fee configurations, slab evaluations,
 * tax calculations, immutable booking snapshots, and payment validation.
 */

import fs from "fs";
import path from "path";
import { prisma } from "../config/database";
import { logger } from "../shared/logger";
import { ValidationError, NotFoundError } from "../shared/errors";

export interface ConvenienceFeeSlabItem {
  id: string;
  configId?: string;
  minPrice: number;
  maxPrice: number | null; // null indicates "₹500 and above"
  feeAmount: number;
  feeType: "FIXED" | "PERCENTAGE";
  applyTo: "BOTH" | "MOVIES" | "EVENTS";
  category: string;
  enabled: boolean;
  orderIndex: number;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingConfigItem {
  id: string;
  enabled: boolean;
  calculationType: "SLAB" | "FIXED" | "PERCENTAGE";
  fixedAmount: number;
  percentageRate: number;
  applyTo: "BOTH" | "MOVIES" | "EVENTS";
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  gstEnabled: boolean;
  gstPercentage: number;
  taxMethod: "EXCLUSIVE" | "INCLUSIVE";
  displayTaxSeparately: boolean;
  eventFeeCalculationType?: "SLAB" | "FIXED" | "PERCENTAGE" | null;
  eventFixedAmount?: number | null;
  eventPercentageRate?: number | null;
  version: number;
  updatedAt: string;
  updatedBy: string;
  slabs: ConvenienceFeeSlabItem[];
}

export interface TicketItemInput {
  price: number;
  category?: string;
}

export interface PricingCalculationParams {
  itemType?: "MOVIE" | "EVENT";
  tickets?: (TicketItemInput | number)[];
  ticketPrice?: number;
  quantity?: number;
  couponCode?: string;
  cineCoinsToRedeem?: number;
  musicianDonation?: boolean;
  otherCharges?: number;
  paymentMethod?: string;
}

export interface PricingFeeLine {
  ticketPrice: number;
  category: string;
  baseCharge: number;
  gstRate: number;
  gstAmount: number;
  totalFee: number;
  slabId?: string;
  slabDescription?: string;
}

export interface PricingCalculationResult {
  itemType: "MOVIE" | "EVENT";
  ticketCount: number;
  baseTicketAmount: number;
  ticketSubtotal: number;
  baseConvenienceFee: number;
  convenienceFeeGstTotal: number;
  totalConvenienceFee: number;
  convenienceFee: number;
  taxAmount: number;
  gstRate: number;
  taxMethod: "EXCLUSIVE" | "INCLUSIVE";
  displayTaxSeparately: boolean;
  discountAmount: number;
  couponDiscount: number;
  cineCoinsDiscount: number;
  musicianDonationAmount: number;
  otherCharges: number;
  finalPayableAmount: number;
  totalAmount: number;
  isFeeEnabled: boolean;
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  calculationType: "SLAB" | "FIXED" | "PERCENTAGE";
  pricingVersion: number;
  feeLines: PricingFeeLine[];
  feeSnapshot: {
    pricingVersion: number;
    itemType: "MOVIE" | "EVENT";
    ticketCount: number;
    baseTicketAmount: number;
    baseConvenienceFee: number;
    convenienceFeeGstTotal: number;
    totalConvenienceFee: number;
    taxMethod: "EXCLUSIVE" | "INCLUSIVE";
    gstRate: number;
    discountAmount: number;
    musicianDonationAmount: number;
    otherCharges: number;
    finalPayableAmount: number;
    isFeeEnabled: boolean;
    feeApplication: "PER_TICKET" | "PER_BOOKING";
    calculationType: "SLAB" | "FIXED" | "PERCENTAGE";
    feeLines: PricingFeeLine[];
    calculatedAt: string;
  };
}

// Canonical initial default slabs as specified in prompt section 2
export const INITIAL_DEFAULT_SLABS: ConvenienceFeeSlabItem[] = [
  {
    id: "SLAB-1",
    configId: "global_pricing_config",
    minPrice: 1,
    maxPrice: 49,
    feeAmount: 10,
    feeType: "FIXED",
    applyTo: "BOTH",
    category: "STANDARD",
    enabled: true,
    orderIndex: 0,
    description: "Tier 1: Budget Tickets (₹1–₹49)"
  },
  {
    id: "SLAB-2",
    configId: "global_pricing_config",
    minPrice: 50,
    maxPrice: 99,
    feeAmount: 12,
    feeType: "FIXED",
    applyTo: "BOTH",
    category: "STANDARD",
    enabled: true,
    orderIndex: 1,
    description: "Tier 2: Economy Tickets (₹50–₹99)"
  },
  {
    id: "SLAB-3",
    configId: "global_pricing_config",
    minPrice: 100,
    maxPrice: 199,
    feeAmount: 16,
    feeType: "FIXED",
    applyTo: "BOTH",
    category: "STANDARD",
    enabled: true,
    orderIndex: 2,
    description: "Tier 3: Regular Prime (₹100–₹199)"
  },
  {
    id: "SLAB-4",
    configId: "global_pricing_config",
    minPrice: 200,
    maxPrice: 499,
    feeAmount: 25,
    feeType: "FIXED",
    applyTo: "BOTH",
    category: "STANDARD",
    enabled: true,
    orderIndex: 3,
    description: "Tier 4: Gold & Premium (₹200–₹499)"
  },
  {
    id: "SLAB-5",
    configId: "global_pricing_config",
    minPrice: 500,
    maxPrice: null, // null represents "₹500 and above"
    feeAmount: 35,
    feeType: "FIXED",
    applyTo: "BOTH",
    category: "STANDARD",
    enabled: true,
    orderIndex: 4,
    description: "Tier 5: Luxury Recliner & VIP Suites (₹500+)"
  }
];

export const INITIAL_DEFAULT_CONFIG: PricingConfigItem = {
  id: "global_pricing_config",
  enabled: true,
  calculationType: "SLAB",
  fixedAmount: 15.00,
  percentageRate: 10.00,
  applyTo: "BOTH",
  feeApplication: "PER_TICKET",
  gstEnabled: true,
  gstPercentage: 18.00,
  taxMethod: "EXCLUSIVE",
  displayTaxSeparately: true,
  eventFeeCalculationType: "SLAB",
  eventFixedAmount: 20.00,
  eventPercentageRate: 10.00,
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: "System Default",
  slabs: INITIAL_DEFAULT_SLABS
};

const CONFIG_FILE = path.join(process.cwd(), "server/config/centralized_pricing.json");
const TMP_CONFIG_FILE = path.join("/tmp", "centralized_pricing.json");

export class CentralizedPricingService {
  private activeConfig: PricingConfigItem = { ...INITIAL_DEFAULT_CONFIG };
  private auditLogs: any[] = [];
  private isLoadedFromStorage = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      // 1. Try reading from /tmp (most current runtime overrides in serverless environment)
      if (fs.existsSync(TMP_CONFIG_FILE)) {
        const raw = fs.readFileSync(TMP_CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) {
          this.activeConfig = parsed;
          this.isLoadedFromStorage = true;
          return;
        }
      }

      // 2. Try reading from persistent repository config file
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) {
          this.activeConfig = parsed;
          this.isLoadedFromStorage = true;
          return;
        }
      }
    } catch (e: any) {
      logger.warn(`Failed to read stored centralized pricing config: ${e.message}`);
    }

    // Default initialization
    this.activeConfig = {
      ...INITIAL_DEFAULT_CONFIG,
      slabs: [...INITIAL_DEFAULT_SLABS]
    };
    this.persistToStorage();
    this.isLoadedFromStorage = true;
  }

  private persistToStorage() {
    try {
      const payload = JSON.stringify(this.activeConfig, null, 2);
      try {
        const dir = path.dirname(CONFIG_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(CONFIG_FILE, payload, "utf-8");
      } catch (e) {}

      try {
        fs.writeFileSync(TMP_CONFIG_FILE, payload, "utf-8");
      } catch (e) {}
    } catch (err: any) {
      logger.warn(`Failed persisting centralized pricing config: ${err.message}`);
    }
  }

  // Synchronize with database if connected
  private async syncFromDatabase(): Promise<void> {
    try {
      if ((prisma as any).pricingConfiguration?.findUnique) {
        const dbConfig = await (prisma as any).pricingConfiguration.findUnique({
          where: { id: "global_pricing_config" },
          include: { slabs: { orderBy: { orderIndex: "asc" } } }
        });

        if (dbConfig) {
          this.activeConfig = {
            id: dbConfig.id,
            enabled: Boolean(dbConfig.enabled),
            calculationType: (dbConfig.calculationType || "SLAB") as any,
            fixedAmount: Number(dbConfig.fixedAmount || 15),
            percentageRate: Number(dbConfig.percentageRate || 10),
            applyTo: (dbConfig.applyTo || "BOTH") as any,
            feeApplication: (dbConfig.feeApplication || "PER_TICKET") as any,
            gstEnabled: Boolean(dbConfig.gstEnabled),
            gstPercentage: Number(dbConfig.gstPercentage || 18),
            taxMethod: (dbConfig.taxMethod || "EXCLUSIVE") as any,
            displayTaxSeparately: Boolean(dbConfig.displayTaxSeparately),
            eventFeeCalculationType: dbConfig.eventFeeCalculationType as any,
            eventFixedAmount: dbConfig.eventFixedAmount ? Number(dbConfig.eventFixedAmount) : null,
            eventPercentageRate: dbConfig.eventPercentageRate ? Number(dbConfig.eventPercentageRate) : null,
            version: Number(dbConfig.version || 1),
            updatedAt: dbConfig.updatedAt ? new Date(dbConfig.updatedAt).toISOString() : new Date().toISOString(),
            updatedBy: dbConfig.updatedBy || "Administrator",
            slabs: Array.isArray(dbConfig.slabs) && dbConfig.slabs.length > 0
              ? dbConfig.slabs.map((s: any) => ({
                  id: s.id,
                  configId: s.configId,
                  minPrice: Number(s.minPrice),
                  maxPrice: s.maxPrice !== null && s.maxPrice !== undefined ? Number(s.maxPrice) : null,
                  feeAmount: Number(s.feeAmount),
                  feeType: (s.feeType || "FIXED") as any,
                  applyTo: (s.applyTo || "BOTH") as any,
                  category: s.category || "STANDARD",
                  enabled: s.enabled !== undefined ? Boolean(s.enabled) : true,
                  orderIndex: Number(s.orderIndex || 0),
                  description: s.description || null,
                  createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : undefined,
                  updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined
                }))
              : [...this.activeConfig.slabs]
          };
          this.persistToStorage();
        }
      }
    } catch (e: any) {
      // Fallback to memory/file storage gracefully if DB is offline
    }
  }

  // ==========================================
  // 1. GET & UPDATE ACTIVE CONFIGURATION
  // ==========================================

  public async getConfig(): Promise<PricingConfigItem> {
    await this.syncFromDatabase();
    return JSON.parse(JSON.stringify(this.activeConfig));
  }

  public async updateConfig(
    updates: Partial<PricingConfigItem>,
    actorEmail: string = "superadmin@cinevenue.com",
    metadata?: any
  ): Promise<PricingConfigItem> {
    await this.syncFromDatabase();
    const prev = JSON.parse(JSON.stringify(this.activeConfig));

    if (updates.enabled !== undefined) this.activeConfig.enabled = Boolean(updates.enabled);
    if (updates.calculationType) this.activeConfig.calculationType = updates.calculationType;
    if (updates.fixedAmount !== undefined) this.activeConfig.fixedAmount = Math.max(0, Number(updates.fixedAmount));
    if (updates.percentageRate !== undefined) this.activeConfig.percentageRate = Math.max(0, Number(updates.percentageRate));
    if (updates.applyTo) this.activeConfig.applyTo = updates.applyTo;
    if (updates.feeApplication) this.activeConfig.feeApplication = updates.feeApplication;
    if (updates.gstEnabled !== undefined) this.activeConfig.gstEnabled = Boolean(updates.gstEnabled);
    if (updates.gstPercentage !== undefined) this.activeConfig.gstPercentage = Math.max(0, Number(updates.gstPercentage));
    if (updates.taxMethod) this.activeConfig.taxMethod = updates.taxMethod;
    if (updates.displayTaxSeparately !== undefined) this.activeConfig.displayTaxSeparately = Boolean(updates.displayTaxSeparately);

    if (updates.eventFeeCalculationType !== undefined) this.activeConfig.eventFeeCalculationType = updates.eventFeeCalculationType;
    if (updates.eventFixedAmount !== undefined) {
      this.activeConfig.eventFixedAmount = updates.eventFixedAmount !== null ? Math.max(0, Number(updates.eventFixedAmount)) : null;
    }
    if (updates.eventPercentageRate !== undefined) {
      this.activeConfig.eventPercentageRate = updates.eventPercentageRate !== null ? Math.max(0, Number(updates.eventPercentageRate)) : null;
    }

    if (Array.isArray(updates.slabs)) {
      this.validateSlabs(updates.slabs);
      this.activeConfig.slabs = updates.slabs.map((s, idx) => ({
        ...s,
        orderIndex: s.orderIndex !== undefined ? s.orderIndex : idx
      }));
    }

    this.activeConfig.version = (this.activeConfig.version || 1) + 1;
    this.activeConfig.updatedAt = new Date().toISOString();
    this.activeConfig.updatedBy = actorEmail;

    // Persist to local & /tmp file
    this.persistToStorage();

    // Persist to DB if available
    try {
      if ((prisma as any).pricingConfiguration?.upsert) {
        await (prisma as any).pricingConfiguration.upsert({
          where: { id: "global_pricing_config" },
          create: {
            id: "global_pricing_config",
            enabled: this.activeConfig.enabled,
            calculationType: this.activeConfig.calculationType,
            fixedAmount: this.activeConfig.fixedAmount,
            percentageRate: this.activeConfig.percentageRate,
            applyTo: this.activeConfig.applyTo,
            feeApplication: this.activeConfig.feeApplication,
            gstEnabled: this.activeConfig.gstEnabled,
            gstPercentage: this.activeConfig.gstPercentage,
            taxMethod: this.activeConfig.taxMethod,
            displayTaxSeparately: this.activeConfig.displayTaxSeparately,
            eventFeeCalculationType: this.activeConfig.eventFeeCalculationType || null,
            eventFixedAmount: this.activeConfig.eventFixedAmount || null,
            eventPercentageRate: this.activeConfig.eventPercentageRate || null,
            version: this.activeConfig.version,
            updatedBy: actorEmail
          },
          update: {
            enabled: this.activeConfig.enabled,
            calculationType: this.activeConfig.calculationType,
            fixedAmount: this.activeConfig.fixedAmount,
            percentageRate: this.activeConfig.percentageRate,
            applyTo: this.activeConfig.applyTo,
            feeApplication: this.activeConfig.feeApplication,
            gstEnabled: this.activeConfig.gstEnabled,
            gstPercentage: this.activeConfig.gstPercentage,
            taxMethod: this.activeConfig.taxMethod,
            displayTaxSeparately: this.activeConfig.displayTaxSeparately,
            eventFeeCalculationType: this.activeConfig.eventFeeCalculationType || null,
            eventFixedAmount: this.activeConfig.eventFixedAmount || null,
            eventPercentageRate: this.activeConfig.eventPercentageRate || null,
            version: this.activeConfig.version,
            updatedBy: actorEmail
          }
        });
      }
    } catch (dbErr: any) {
      logger.warn(`Database pricingConfiguration save fallback: ${dbErr.message}`);
    }

    // Audit Log
    await this.recordAuditLog({
      action: "CONFIG_UPDATED",
      actorEmail,
      previousConfig: prev,
      updatedConfig: this.activeConfig,
      reason: metadata?.reason || "Convenience fee configuration updated by administrator",
      metadata
    });

    return JSON.parse(JSON.stringify(this.activeConfig));
  }

  // ==========================================
  // 2. SLAB MANAGEMENT & OVERLAP VALIDATION
  // ==========================================

  public validateSlabs(slabs: ConvenienceFeeSlabItem[]): void {
    if (!Array.isArray(slabs)) throw new ValidationError("Slabs must be an array");

    for (let i = 0; i < slabs.length; i++) {
      const slab = slabs[i];
      if (slab.minPrice === undefined || slab.minPrice === null || Number(slab.minPrice) < 0) {
        throw new ValidationError(`Slab ${i + 1}: Minimum price must be 0 or higher`);
      }
      if (slab.maxPrice !== null && slab.maxPrice !== undefined) {
        if (Number(slab.maxPrice) <= Number(slab.minPrice)) {
          throw new ValidationError(
            `Slab ${i + 1} range invalid: Maximum price (₹${slab.maxPrice}) must be greater than Minimum price (₹${slab.minPrice})`
          );
        }
      }
      if (slab.feeAmount === undefined || Number(slab.feeAmount) < 0) {
        throw new ValidationError(`Slab ${i + 1}: Fee amount cannot be negative`);
      }
    }

    // Check overlaps for slabs with the same target scope (MOVIES, EVENTS, BOTH)
    const activeEnabledSlabs = slabs.filter((s) => s.enabled);
    for (let i = 0; i < activeEnabledSlabs.length; i++) {
      for (let j = i + 1; j < activeEnabledSlabs.length; j++) {
        const a = activeEnabledSlabs[i];
        const b = activeEnabledSlabs[j];

        // Only check overlap if targets overlap
        const targetsOverlap =
          a.applyTo === "BOTH" || b.applyTo === "BOTH" || a.applyTo === b.applyTo;
        if (!targetsOverlap) continue;

        const aMin = Number(a.minPrice);
        const aMax = a.maxPrice !== null && a.maxPrice !== undefined ? Number(a.maxPrice) : Infinity;
        const bMin = Number(b.minPrice);
        const bMax = b.maxPrice !== null && b.maxPrice !== undefined ? Number(b.maxPrice) : Infinity;

        const isOverlapping = Math.max(aMin, bMin) <= Math.min(aMax, bMax);
        if (isOverlapping) {
          throw new ValidationError(
            `Overlapping price slabs detected: [₹${aMin} - ${aMax === Infinity ? 'Above' : '₹' + aMax}] and [₹${bMin} - ${bMax === Infinity ? 'Above' : '₹' + bMax}]. Slabs for the same target cannot overlap.`
          );
        }
      }
    }
  }

  public async addSlab(
    slabData: Omit<ConvenienceFeeSlabItem, "id">,
    actorEmail: string = "superadmin@cinevenue.com"
  ): Promise<PricingConfigItem> {
    const id = `SLAB-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newSlab: ConvenienceFeeSlabItem = {
      id,
      configId: "global_pricing_config",
      minPrice: Number(slabData.minPrice),
      maxPrice: slabData.maxPrice !== null && slabData.maxPrice !== undefined ? Number(slabData.maxPrice) : null,
      feeAmount: Number(slabData.feeAmount),
      feeType: slabData.feeType || "FIXED",
      applyTo: slabData.applyTo || "BOTH",
      category: slabData.category || "STANDARD",
      enabled: slabData.enabled !== undefined ? Boolean(slabData.enabled) : true,
      orderIndex: this.activeConfig.slabs.length,
      description: slabData.description || `Slab ₹${slabData.minPrice} - ${slabData.maxPrice ? '₹' + slabData.maxPrice : 'Above'}`
    };

    const nextSlabs = [...this.activeConfig.slabs, newSlab].sort(
      (a, b) => Number(a.minPrice) - Number(b.minPrice)
    );
    this.validateSlabs(nextSlabs);

    return this.updateConfig({ slabs: nextSlabs }, actorEmail, {
      action: "SLAB_CREATED",
      slabId: id,
      newSlab
    });
  }

  public async updateSlab(
    id: string,
    updates: Partial<ConvenienceFeeSlabItem>,
    actorEmail: string = "superadmin@cinevenue.com"
  ): Promise<PricingConfigItem> {
    const idx = this.activeConfig.slabs.findIndex((s) => s.id === id);
    if (idx === -1) throw new NotFoundError("ConvenienceFeeSlab", id);

    const updated = { ...this.activeConfig.slabs[idx], ...updates };
    const nextSlabs = [...this.activeConfig.slabs];
    nextSlabs[idx] = updated;
    nextSlabs.sort((a, b) => Number(a.minPrice) - Number(b.minPrice));

    this.validateSlabs(nextSlabs);

    return this.updateConfig({ slabs: nextSlabs }, actorEmail, {
      action: "SLAB_UPDATED",
      slabId: id,
      updates
    });
  }

  public async deleteSlab(
    id: string,
    actorEmail: string = "superadmin@cinevenue.com"
  ): Promise<PricingConfigItem> {
    const nextSlabs = this.activeConfig.slabs.filter((s) => s.id !== id);
    return this.updateConfig({ slabs: nextSlabs }, actorEmail, {
      action: "SLAB_DELETED",
      slabId: id
    });
  }

  // ==========================================
  // 3. AUTHORITATIVE PRICING CALCULATION
  // ==========================================

  public calculatePricing(params: PricingCalculationParams): PricingCalculationResult {
    const config = this.activeConfig;
    const itemType = params.itemType === "EVENT" ? "EVENT" : "MOVIE";

    // 1. Normalize Tickets Input
    let ticketItems: TicketItemInput[] = [];
    if (Array.isArray(params.tickets) && params.tickets.length > 0) {
      ticketItems = params.tickets.map((t) => {
        if (typeof t === "number") return { price: t, category: "STANDARD" };
        return {
          price: Number(t.price || 0),
          category: (t.category || "STANDARD").toUpperCase()
        };
      });
    } else if (params.ticketPrice !== undefined) {
      const qty = Math.max(1, Number(params.quantity || 1));
      for (let i = 0; i < qty; i++) {
        ticketItems.push({ price: Number(params.ticketPrice), category: "STANDARD" });
      }
    } else {
      ticketItems = [{ price: 150, category: "STANDARD" }];
    }

    const ticketCount = ticketItems.length;
    const ticketSubtotal = Math.round(ticketItems.reduce((acc, t) => acc + t.price, 0) * 100) / 100;

    // 2. Check if Convenience Fee is Applicable to this itemType
    const isGlobalEnabled = Boolean(config.enabled);
    const scopeApplies =
      config.applyTo === "BOTH" ||
      (itemType === "MOVIE" && config.applyTo === "MOVIES") ||
      (itemType === "EVENT" && config.applyTo === "EVENTS");
    const isFeeEnabled = isGlobalEnabled && scopeApplies && ticketSubtotal > 0;

    // 3. Determine Calculation Type & Rates
    let calcType: "SLAB" | "FIXED" | "PERCENTAGE" = config.calculationType || "SLAB";
    let fixedAmt = config.fixedAmount;
    let pctRate = config.percentageRate;

    if (itemType === "EVENT" && config.eventFeeCalculationType) {
      calcType = config.eventFeeCalculationType;
      if (config.eventFixedAmount !== null && config.eventFixedAmount !== undefined) {
        fixedAmt = config.eventFixedAmount;
      }
      if (config.eventPercentageRate !== null && config.eventPercentageRate !== undefined) {
        pctRate = config.eventPercentageRate;
      }
    }

    const feeApp: "PER_TICKET" | "PER_BOOKING" = config.feeApplication === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET";
    const gstRate = config.gstEnabled ? Number(config.gstPercentage || 18.0) : 0;
    const taxMethod = config.taxMethod || "EXCLUSIVE";

    // 4. Calculate Convenience Fee Lines
    const feeLines: PricingFeeLine[] = [];
    let baseChargeTotal = 0;
    let gstTotal = 0;

    if (isFeeEnabled) {
      if (calcType === "FIXED") {
        const lineFee = fixedAmt;
        const count = feeApp === "PER_TICKET" ? ticketCount : 1;
        baseChargeTotal = Math.round(lineFee * count * 100) / 100;
        gstTotal = gstRate > 0 ? Math.round(baseChargeTotal * (gstRate / 100) * 100) / 100 : 0;

        ticketItems.forEach((t) => {
          const perTicketBase = feeApp === "PER_TICKET" ? lineFee : Math.round((lineFee / ticketCount) * 100) / 100;
          const perTicketGst = gstRate > 0 ? Math.round(perTicketBase * (gstRate / 100) * 100) / 100 : 0;
          feeLines.push({
            ticketPrice: t.price,
            category: t.category || "STANDARD",
            baseCharge: perTicketBase,
            gstRate,
            gstAmount: perTicketGst,
            totalFee: Math.round((perTicketBase + perTicketGst) * 100) / 100,
            slabDescription: `Fixed Fee (${feeApp === "PER_TICKET" ? "₹" + fixedAmt + "/ticket" : "₹" + fixedAmt + "/booking"})`
          });
        });
      } else if (calcType === "PERCENTAGE") {
        baseChargeTotal = Math.round(ticketSubtotal * (pctRate / 100) * 100) / 100;
        gstTotal = gstRate > 0 ? Math.round(baseChargeTotal * (gstRate / 100) * 100) / 100 : 0;

        ticketItems.forEach((t) => {
          const perTicketBase = Math.round(t.price * (pctRate / 100) * 100) / 100;
          const perTicketGst = gstRate > 0 ? Math.round(perTicketBase * (gstRate / 100) * 100) / 100 : 0;
          feeLines.push({
            ticketPrice: t.price,
            category: t.category || "STANDARD",
            baseCharge: perTicketBase,
            gstRate,
            gstAmount: perTicketGst,
            totalFee: Math.round((perTicketBase + perTicketGst) * 100) / 100,
            slabDescription: `Percentage Fee (${pctRate}%)`
          });
        });
      } else {
        // SLAB-BASED CALCULATION
        const targetScope = itemType === "MOVIE" ? "MOVIES" : "EVENTS";
        const availableSlabs = (config.slabs || []).filter(
          (s) => s.enabled && (s.applyTo === "BOTH" || s.applyTo === targetScope)
        );

        if (feeApp === "PER_TICKET") {
          ticketItems.forEach((t) => {
            const matchingSlab = availableSlabs.find((s) => {
              const minMatch = t.price >= Number(s.minPrice);
              const maxMatch = s.maxPrice === null || s.maxPrice === undefined || t.price <= Number(s.maxPrice);
              return minMatch && maxMatch;
            });

            let tBase = fixedAmt;
            let slabDesc = `Default Standard Fee (₹${fixedAmt})`;
            let sId = undefined;

            if (matchingSlab) {
              sId = matchingSlab.id;
              slabDesc = matchingSlab.description || `Slab ₹${matchingSlab.minPrice} - ${matchingSlab.maxPrice ? '₹' + matchingSlab.maxPrice : 'Above'}`;
              if (matchingSlab.feeType === "PERCENTAGE") {
                tBase = Math.round(t.price * (Number(matchingSlab.feeAmount) / 100) * 100) / 100;
              } else {
                tBase = Number(matchingSlab.feeAmount);
              }
            }

            const tGst = gstRate > 0 ? Math.round(tBase * (gstRate / 100) * 100) / 100 : 0;
            baseChargeTotal += tBase;
            gstTotal += tGst;

            feeLines.push({
              ticketPrice: t.price,
              category: t.category || "STANDARD",
              baseCharge: tBase,
              gstRate,
              gstAmount: tGst,
              totalFee: Math.round((tBase + tGst) * 100) / 100,
              slabId: sId,
              slabDescription: slabDesc
            });
          });
        } else {
          // PER_BOOKING Slab lookup using total order subtotal or average price
          const avgPrice = ticketCount > 0 ? ticketSubtotal / ticketCount : 0;
          const matchingSlab = availableSlabs.find((s) => {
            const minMatch = avgPrice >= Number(s.minPrice);
            const maxMatch = s.maxPrice === null || s.maxPrice === undefined || avgPrice <= Number(s.maxPrice);
            return minMatch && maxMatch;
          });

          baseChargeTotal = matchingSlab
            ? (matchingSlab.feeType === "PERCENTAGE" ? Math.round(ticketSubtotal * (Number(matchingSlab.feeAmount) / 100) * 100) / 100 : Number(matchingSlab.feeAmount))
            : fixedAmt;
          gstTotal = gstRate > 0 ? Math.round(baseChargeTotal * (gstRate / 100) * 100) / 100 : 0;

          feeLines.push({
            ticketPrice: ticketSubtotal,
            category: "ORDER_BOOKING",
            baseCharge: baseChargeTotal,
            gstRate,
            gstAmount: gstTotal,
            totalFee: Math.round((baseChargeTotal + gstTotal) * 100) / 100,
            slabId: matchingSlab?.id,
            slabDescription: matchingSlab?.description || `Order Booking Flat Fee (₹${baseChargeTotal})`
          });
        }
      }
    }

    baseChargeTotal = Math.round(baseChargeTotal * 100) / 100;
    gstTotal = Math.round(gstTotal * 100) / 100;
    const totalConvenienceFee = Math.round((baseChargeTotal + gstTotal) * 100) / 100;

    // 5. Discounts (Coupons & CineCoins)
    let couponDiscount = 0;
    if (params.couponCode) {
      const code = params.couponCode.trim().toUpperCase();
      if (code === "WELCOME50" || code === "FLAT50") couponDiscount = Math.min(ticketSubtotal, 50);
      else if (code === "CINE20" || code === "CINEEVENT20") couponDiscount = Math.round(ticketSubtotal * 0.20 * 100) / 100;
      else if (code === "STUDENT10") couponDiscount = Math.round(ticketSubtotal * 0.10 * 100) / 100;
      else if (code === "FIRSTPASS100") couponDiscount = Math.min(ticketSubtotal, 100);
      else if (code === "VIPGALA300") couponDiscount = Math.min(ticketSubtotal, 300);
    }

    let cineCoinsDiscount = 0;
    if (params.cineCoinsToRedeem && Number(params.cineCoinsToRedeem) > 0) {
      const maxAllowed = Math.round(ticketSubtotal * 0.20 * 100) / 100;
      cineCoinsDiscount = Math.min(Number(params.cineCoinsToRedeem), maxAllowed);
    }

    const discountAmount = Math.round((couponDiscount + cineCoinsDiscount) * 100) / 100;

    // 6. Other Charges (Musician Donation etc.)
    const musicianDonationAmount = params.musicianDonation ? ticketCount * 1.00 : 0;
    const otherCharges = Math.round(((params.otherCharges || 0) + musicianDonationAmount) * 100) / 100;

    // 7. Final Payable Amount (ticketSubtotal + totalConvenienceFee + otherCharges - discountAmount)
    const rawTotal = ticketSubtotal + totalConvenienceFee + otherCharges - discountAmount;
    const finalPayableAmount = Math.max(0, Math.round(rawTotal * 100) / 100);

    const calculatedAt = new Date().toISOString();

    const result: PricingCalculationResult = {
      itemType,
      ticketCount,
      baseTicketAmount: ticketSubtotal,
      ticketSubtotal,
      baseConvenienceFee: baseChargeTotal,
      convenienceFeeGstTotal: gstTotal,
      totalConvenienceFee,
      convenienceFee: totalConvenienceFee,
      taxAmount: gstTotal,
      gstRate,
      taxMethod,
      displayTaxSeparately: Boolean(config.displayTaxSeparately),
      discountAmount,
      couponDiscount,
      cineCoinsDiscount,
      musicianDonationAmount,
      otherCharges,
      finalPayableAmount,
      totalAmount: finalPayableAmount,
      isFeeEnabled,
      feeApplication: feeApp,
      calculationType: calcType,
      pricingVersion: config.version || 1,
      feeLines,
      feeSnapshot: {
        pricingVersion: config.version || 1,
        itemType,
        ticketCount,
        baseTicketAmount: ticketSubtotal,
        baseConvenienceFee: baseChargeTotal,
        convenienceFeeGstTotal: gstTotal,
        totalConvenienceFee,
        taxMethod,
        gstRate,
        discountAmount,
        musicianDonationAmount,
        otherCharges,
        finalPayableAmount,
        isFeeEnabled,
        feeApplication: feeApp,
        calculationType: calcType,
        feeLines,
        calculatedAt
      }
    };

    return result;
  }

  // ==========================================
  // 4. AMOUNT VALIDATION & TAMPER DETECTION
  // ==========================================

  public validateBookingPrice(
    claimedTotal: number,
    params: PricingCalculationParams
  ): { isValid: boolean; expectedAmount: number; difference: number; breakdown: PricingCalculationResult } {
    const breakdown = this.calculatePricing(params);
    const expected = breakdown.finalPayableAmount;
    const claimed = Math.round(Number(claimedTotal) * 100) / 100;
    const diff = Math.abs(claimed - expected);

    // Allow at most 0.05 difference for floating rounding tolerance
    const isValid = diff <= 0.05;

    return {
      isValid,
      expectedAmount: expected,
      difference: diff,
      breakdown
    };
  }

  // ==========================================
  // 5. PERMANENT BOOKING PRICING SNAPSHOTS
  // ==========================================

  public async saveBookingSnapshot(
    bookingId: string,
    breakdown: PricingCalculationResult,
    eventRegistrationId?: string
  ): Promise<any> {
    try {
      if ((prisma as any).bookingPricingSnapshot?.upsert) {
        return await (prisma as any).bookingPricingSnapshot.upsert({
          where: { bookingId },
          create: {
            bookingId,
            eventRegistrationId: eventRegistrationId || null,
            baseTicketAmount: breakdown.baseTicketAmount,
            ticketCount: breakdown.ticketCount,
            convenienceFee: breakdown.totalConvenienceFee,
            gstAmount: breakdown.convenienceFeeGstTotal,
            gstPercentage: breakdown.gstRate,
            discountAmount: breakdown.discountAmount,
            otherCharges: breakdown.otherCharges,
            finalPayableAmount: breakdown.finalPayableAmount,
            pricingVersion: breakdown.pricingVersion,
            configSnapshot: this.activeConfig as any,
            breakdownLines: breakdown.feeLines as any
          },
          update: {
            finalPayableAmount: breakdown.finalPayableAmount,
            breakdownLines: breakdown.feeLines as any
          }
        });
      }
    } catch (e: any) {
      logger.warn(`Failed saving BookingPricingSnapshot to DB: ${e.message}`);
    }
    return breakdown.feeSnapshot;
  }

  public async getBookingSnapshot(bookingId: string): Promise<any | null> {
    try {
      if ((prisma as any).bookingPricingSnapshot?.findUnique) {
        const snap = await (prisma as any).bookingPricingSnapshot.findUnique({
          where: { bookingId }
        });
        if (snap) return snap;
      }

      // Check booking.feeSnapshot
      const b = await prisma.booking.findUnique({
        where: { id: bookingId }
      });
      if (b && (b as any).feeSnapshot) {
        return (b as any).feeSnapshot;
      }
    } catch (e) {}
    return null;
  }

  // ==========================================
  // 6. AUDIT LOGGING
  // ==========================================

  public async recordAuditLog(entry: {
    action: string;
    actorEmail: string;
    previousConfig?: any;
    updatedConfig?: any;
    reason?: string;
    metadata?: any;
  }): Promise<void> {
    const logItem = {
      id: `AUDIT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      action: entry.action,
      actorEmail: entry.actorEmail,
      previousConfig: entry.previousConfig || null,
      updatedConfig: entry.updatedConfig || null,
      reason: entry.reason || "Pricing configuration updated",
      metadata: entry.metadata || {},
      createdAt: new Date().toISOString()
    };

    this.auditLogs.unshift(logItem);
    if (this.auditLogs.length > 200) this.auditLogs.pop();

    try {
      if ((prisma as any).pricingAuditLog?.create) {
        await (prisma as any).pricingAuditLog.create({
          data: {
            action: entry.action,
            actorEmail: entry.actorEmail,
            previousConfig: entry.previousConfig as any,
            updatedConfig: entry.updatedConfig as any,
            reason: entry.reason
          }
        });
      }
    } catch (e) {}
  }

  public async getAuditLogs(): Promise<any[]> {
    try {
      if ((prisma as any).pricingAuditLog?.findMany) {
        const dbLogs = await (prisma as any).pricingAuditLog.findMany({
          take: 100,
          orderBy: { createdAt: "desc" }
        });
        if (dbLogs && dbLogs.length > 0) return dbLogs;
      }
    } catch (e) {}
    return this.auditLogs;
  }
}

export const centralizedPricingService = new CentralizedPricingService();

