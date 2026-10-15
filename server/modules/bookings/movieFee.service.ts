import fs from "fs";
import path from "path";
import { prisma } from "../../config/database";
import { logger } from "../../shared/logger";
import { ValidationError, NotFoundError } from "../../shared/errors";

export interface MovieFeeConfigItem {
  id: string;
  ticketPrice: number;
  baseCharge: number;
  category: string;
  gstRate: number;
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  enabled: boolean;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlobalMovieFeeSettings {
  enabled: boolean;
  defaultGstRate: number;
  defaultFeeApplication: "PER_TICKET" | "PER_BOOKING";
  updatedAt?: string;
  updatedBy?: string;
}

export interface MovieTicketFeeLine {
  ticketPrice: number;
  category: string;
  baseCharge: number;
  gstRate: number;
  gstAmount: number;
  totalFee: number;
  configId?: string;
}

export interface MovieFeeCalculationResult {
  ticketCount: number;
  ticketSubtotal: number;
  baseChargeTotal: number;
  convenienceFeeGstTotal: number;
  totalConvenienceFee: number;
  musicianDonationAmount: number;
  discountAmount: number;
  finalPayableAmount: number;
  isFeeEnabled: boolean;
  gstRateApplied: number;
  feeApplication: "PER_TICKET" | "PER_BOOKING";
  feeLines: MovieTicketFeeLine[];
  feeSnapshot: {
    isFeeEnabled: boolean;
    feeApplication: "PER_TICKET" | "PER_BOOKING";
    gstRateApplied: number;
    baseChargeTotal: number;
    convenienceFeeGstTotal: number;
    totalConvenienceFee: number;
    ticketSubtotal: number;
    finalPayableAmount: number;
    feeLines: MovieTicketFeeLine[];
    calculatedAt: string;
  };
}

// Canonical Default Configurations Seed as specified in requirements:
// Includes duplicate entries for ₹84 and ₹147 for distinct categories
export const DEFAULT_MOVIE_FEE_CONFIGS: Omit<MovieFeeConfigItem, "id" | "createdAt" | "updatedAt">[] = [
  { ticketPrice: 50, baseCharge: 12.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Budget Tier" },
  { ticketPrice: 84, baseCharge: 14.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Standard Matinee" },
  { ticketPrice: 84, baseCharge: 14.00, category: "SPECIAL", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Morning Show Special" },
  { ticketPrice: 100, baseCharge: 14.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Economy Tier" },
  { ticketPrice: 120, baseCharge: 16.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Regular Silver" },
  { ticketPrice: 125, baseCharge: 16.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Weekday Tier" },
  { ticketPrice: 147, baseCharge: 17.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Standard Prime" },
  { ticketPrice: 147, baseCharge: 17.00, category: "PREMIUM", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Balcony Classic" },
  { ticketPrice: 150, baseCharge: 20.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Gold Class" },
  { ticketPrice: 175, baseCharge: 23.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Executive Tier" },
  { ticketPrice: 177, baseCharge: 23.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Deluxe Tier" },
  { ticketPrice: 200, baseCharge: 25.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "VIP Gold Tier" },
  { ticketPrice: 235, baseCharge: 25.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Weekend Prime" },
  { ticketPrice: 250, baseCharge: 28.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Premium Diamond" },
  { ticketPrice: 295, baseCharge: 28.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Dolby Atmos Tier" },
  { ticketPrice: 350, baseCharge: 34.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "IMAX 2D Tier" },
  { ticketPrice: 470, baseCharge: 36.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "IMAX 3D Laser" },
  { ticketPrice: 708, baseCharge: 36.00, category: "STANDARD", gstRate: 18.0, feeApplication: "PER_TICKET", enabled: true, description: "Luxury Recliner Suite" }
];

const SETTINGS_FILE = path.join(process.cwd(), "server/config/movie_fee_settings.json");

class MovieFeeService {
  private inMemoryConfigs: MovieFeeConfigItem[] = [];
  private inMemoryAuditLogs: any[] = [];
  private globalSettings: GlobalMovieFeeSettings = {
    enabled: true,
    defaultGstRate: 18.0,
    defaultFeeApplication: "PER_TICKET"
  };
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    // Load file-persisted settings if available
    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.globalSettings) this.globalSettings = { ...this.globalSettings, ...parsed.globalSettings };
        if (Array.isArray(parsed.configs) && parsed.configs.length > 0) {
          this.inMemoryConfigs = parsed.configs;
          this.isInitialized = true;
          return;
        }
      }
    } catch (e) {
      logger.warn(`Failed reading movie_fee_settings.json: ${e}`);
    }

    // Default Seed
    this.inMemoryConfigs = DEFAULT_MOVIE_FEE_CONFIGS.map((item, idx) => ({
      id: `MFC-${idx + 101}`,
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    this.saveToFile();
    this.isInitialized = true;
  }

  private saveToFile() {
    try {
      const data = {
        globalSettings: this.globalSettings,
        configs: this.inMemoryConfigs,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err: any) {
      logger.warn(`Failed saving movie_fee_settings.json: ${err.message}`);
    }
  }

  public getGlobalSettings(): GlobalMovieFeeSettings {
    return { ...this.globalSettings };
  }

  public async updateGlobalSettings(
    updates: Partial<GlobalMovieFeeSettings>,
    actorEmail?: string
  ): Promise<GlobalMovieFeeSettings> {
    const prevEnabled = this.globalSettings.enabled;
    const prevGst = this.globalSettings.defaultGstRate;

    if (updates.enabled !== undefined) this.globalSettings.enabled = Boolean(updates.enabled);
    if (updates.defaultGstRate !== undefined && Number(updates.defaultGstRate) >= 0) {
      this.globalSettings.defaultGstRate = Number(updates.defaultGstRate);
    }
    if (updates.defaultFeeApplication) {
      this.globalSettings.defaultFeeApplication = updates.defaultFeeApplication === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET";
    }
    this.globalSettings.updatedAt = new Date().toISOString();
    this.globalSettings.updatedBy = actorEmail || "Super Admin";

    this.saveToFile();

    // Audit log
    await this.logAudit({
      action: "GLOBAL_SETTINGS_UPDATED",
      actorEmail: actorEmail || "Super Admin",
      gstRate: this.globalSettings.defaultGstRate,
      reason: `Global settings updated. Enabled: ${this.globalSettings.enabled} (was ${prevEnabled}), GST: ${this.globalSettings.defaultGstRate}% (was ${prevGst}%)`,
      metadata: { previous: { enabled: prevEnabled, gstRate: prevGst }, current: this.globalSettings }
    });

    return { ...this.globalSettings };
  }

  public async updateSettings(
    updates: Partial<GlobalMovieFeeSettings>,
    actorEmail?: string
  ): Promise<GlobalMovieFeeSettings> {
    return this.updateGlobalSettings(updates, actorEmail);
  }

  public async getAllConfigs(): Promise<MovieFeeConfigItem[]> {
    try {
      if ((prisma as any).movieConvenienceFee?.findMany) {
        const dbConfigs = await (prisma as any).movieConvenienceFee.findMany({
          orderBy: [{ ticketPrice: "asc" }, { category: "asc" }]
        });
        if (dbConfigs && dbConfigs.length > 0) {
          return dbConfigs.map((c: any) => ({
            id: c.id,
            ticketPrice: Number(c.ticketPrice || c.ticket_price),
            baseCharge: Number(c.baseCharge || c.base_charge),
            category: c.category || "STANDARD",
            gstRate: Number(c.gstRate !== undefined ? c.gstRate : c.gst_rate ?? 18.0),
            feeApplication: (c.feeApplication || c.fee_application || "PER_TICKET") as "PER_TICKET" | "PER_BOOKING",
            enabled: c.enabled !== undefined ? Boolean(c.enabled) : true,
            description: c.description || null,
            createdAt: c.createdAt || c.created_at,
            updatedAt: c.updatedAt || c.updated_at
          }));
        }
      }
    } catch (err: any) {
      logger.warn(`Database movie convenience fee lookup fallback: ${err.message}`);
    }

    return [...this.inMemoryConfigs];
  }

  public async getConfigById(id: string): Promise<MovieFeeConfigItem | null> {
    const all = await this.getAllConfigs();
    return all.find((c) => c.id === id) || null;
  }

  public async createConfig(
    data: {
      ticketPrice: number;
      baseCharge: number;
      category?: string;
      gstRate?: number;
      feeApplication?: "PER_TICKET" | "PER_BOOKING";
      enabled?: boolean;
      description?: string;
    },
    actorEmail?: string
  ): Promise<MovieFeeConfigItem> {
    const ticketPrice = Number(data.ticketPrice);
    const baseCharge = Number(data.baseCharge);
    const category = (data.category || "STANDARD").trim().toUpperCase();
    const gstRate = data.gstRate !== undefined ? Number(data.gstRate) : this.globalSettings.defaultGstRate;
    const feeApplication = data.feeApplication === "PER_BOOKING" ? "PER_BOOKING" : "PER_TICKET";
    const enabled = data.enabled !== undefined ? Boolean(data.enabled) : true;

    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      throw new ValidationError("Ticket price must be a valid positive number");
    }
    if (isNaN(baseCharge) || baseCharge < 0) {
      throw new ValidationError("Base charge must be a non-negative number");
    }

    // Validate duplicate prices: cannot have identical ticketPrice AND identical category
    const all = await this.getAllConfigs();
    const duplicate = all.find(
      (c) => Number(c.ticketPrice) === ticketPrice && c.category.toUpperCase() === category
    );
    if (duplicate) {
      throw new ValidationError(
        `A convenience fee configuration for ₹${ticketPrice} with category "${category}" already exists (Config ID: ${duplicate.id}). Please edit the existing entry or use a different category name (e.g. SPECIAL, PREMIUM, RECLINER).`
      );
    }

    const id = `MFC-${Date.now().toString().slice(-6)}`;
    const newConfig: MovieFeeConfigItem = {
      id,
      ticketPrice,
      baseCharge,
      category,
      gstRate,
      feeApplication,
      enabled,
      description: data.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if ((prisma as any).movieConvenienceFee?.create) {
        await (prisma as any).movieConvenienceFee.create({
          data: {
            id,
            ticketPrice,
            baseCharge,
            category,
            gstRate,
            feeApplication,
            enabled,
            description: data.description || null
          }
        });
      }
    } catch (e: any) {
      logger.warn(`Could not persist to DB MovieConvenienceFee: ${e.message}`);
    }

    this.inMemoryConfigs.push(newConfig);
    this.saveToFile();

    this.logAudit({
      feeConfigId: id,
      action: "CREATED",
      ticketPrice,
      baseCharge,
      gstRate,
      actorEmail: actorEmail || "Super Admin",
      reason: `Created fee tier: ₹${ticketPrice} -> ₹${baseCharge.toFixed(2)} base fee (${category})`,
      metadata: newConfig
    });

    return newConfig;
  }

  public async updateConfig(
    id: string,
    updates: Partial<Omit<MovieFeeConfigItem, "id" | "createdAt" | "updatedAt">>,
    actorEmail?: string
  ): Promise<MovieFeeConfigItem> {
    const all = await this.getAllConfigs();
    const existingIndex = all.findIndex((c) => c.id === id);
    if (existingIndex === -1) {
      throw new NotFoundError("MovieConvenienceFee", id);
    }

    const existing = all[existingIndex];
    const ticketPrice = updates.ticketPrice !== undefined ? Number(updates.ticketPrice) : existing.ticketPrice;
    const baseCharge = updates.baseCharge !== undefined ? Number(updates.baseCharge) : existing.baseCharge;
    const category = updates.category !== undefined ? updates.category.trim().toUpperCase() : existing.category;
    const gstRate = updates.gstRate !== undefined ? Number(updates.gstRate) : existing.gstRate;
    const feeApplication = updates.feeApplication !== undefined ? updates.feeApplication : existing.feeApplication;
    const enabled = updates.enabled !== undefined ? Boolean(updates.enabled) : existing.enabled;

    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      throw new ValidationError("Ticket price must be a valid positive number");
    }
    if (isNaN(baseCharge) || baseCharge < 0) {
      throw new ValidationError("Base charge must be a non-negative number");
    }

    // Check conflict with other entries
    const duplicate = all.find(
      (c) => c.id !== id && Number(c.ticketPrice) === ticketPrice && c.category.toUpperCase() === category
    );
    if (duplicate) {
      throw new ValidationError(
        `Another fee configuration already exists for ₹${ticketPrice} with category "${category}" (Config ID: ${duplicate.id}).`
      );
    }

    const updated: MovieFeeConfigItem = {
      ...existing,
      ticketPrice,
      baseCharge,
      category,
      gstRate,
      feeApplication,
      enabled,
      description: updates.description !== undefined ? updates.description : existing.description,
      updatedAt: new Date().toISOString()
    };

    try {
      if ((prisma as any).movieConvenienceFee?.update) {
        await (prisma as any).movieConvenienceFee.update({
          where: { id },
          data: {
            ticketPrice,
            baseCharge,
            category,
            gstRate,
            feeApplication,
            enabled,
            description: updated.description
          }
        });
      }
    } catch (e: any) {
      logger.warn(`Could not update DB MovieConvenienceFee: ${e.message}`);
    }

    const memIdx = this.inMemoryConfigs.findIndex((c) => c.id === id);
    if (memIdx !== -1) {
      this.inMemoryConfigs[memIdx] = updated;
    } else {
      this.inMemoryConfigs.push(updated);
    }
    this.saveToFile();

    this.logAudit({
      feeConfigId: id,
      action: "UPDATED",
      ticketPrice,
      baseCharge,
      gstRate,
      actorEmail: actorEmail || "Super Admin",
      reason: `Updated fee tier ${id}: ₹${ticketPrice} (Base: ₹${baseCharge.toFixed(2)}, Category: ${category}, Enabled: ${enabled})`,
      metadata: { previous: existing, current: updated }
    });

    return updated;
  }

  public async deleteConfig(id: string, actorEmail?: string): Promise<boolean> {
    const all = await this.getAllConfigs();
    const existing = all.find((c) => c.id === id);
    if (!existing) {
      throw new NotFoundError("MovieConvenienceFee", id);
    }

    try {
      if ((prisma as any).movieConvenienceFee?.delete) {
        await (prisma as any).movieConvenienceFee.delete({ where: { id } });
      }
    } catch (e: any) {
      logger.warn(`Could not delete from DB MovieConvenienceFee: ${e.message}`);
    }

    this.inMemoryConfigs = this.inMemoryConfigs.filter((c) => c.id !== id);
    this.saveToFile();

    this.logAudit({
      feeConfigId: id,
      action: "DELETED",
      ticketPrice: existing.ticketPrice,
      baseCharge: existing.baseCharge,
      actorEmail: actorEmail || "Super Admin",
      reason: `Deleted fee tier: ₹${existing.ticketPrice} (${existing.category})`,
      metadata: existing
    });

    return true;
  }

  // Authoritative Calculation Engine for Movie Tickets
  public async calculateMovieBookingFees(
    ticketsOrInput:
      | Array<{ price: number; category?: string }>
      | {
          tickets: Array<{ price: number; category?: string }>;
          couponCode?: string;
          couponDiscount?: number;
          musicianDonation?: boolean;
          otherCharges?: number;
        },
    options?: {
      couponCode?: string;
      musicianDonation?: boolean;
      couponDiscount?: number;
      otherCharges?: number;
    }
  ): Promise<MovieFeeCalculationResult> {
    const rawTickets = Array.isArray(ticketsOrInput)
      ? ticketsOrInput
      : ticketsOrInput?.tickets || [];
    const opts = Array.isArray(ticketsOrInput)
      ? (options || {})
      : { ...ticketsOrInput, ...options };

    const configs = await this.getAllConfigs();
    const activeConfigs = configs.filter((c) => c.enabled);
    const isFeeEnabled = this.globalSettings.enabled;
    const globalGst = this.globalSettings.defaultGstRate;
    const feeApplication = this.globalSettings.defaultFeeApplication;

    const ticketCount = Math.max(0, rawTickets.length);
    let ticketSubtotal = 0;
    const feeLines: MovieTicketFeeLine[] = [];

    // Helper: Find best matching fee config for a given ticket price & category
    const findMatchingConfig = (price: number, cat?: string): MovieFeeConfigItem | null => {
      if (activeConfigs.length === 0) return null;
      const cleanCat = (cat || "STANDARD").trim().toUpperCase();

      // 1. Exact match on price and category
      const exactBoth = activeConfigs.find(
        (c) => Number(c.ticketPrice) === price && c.category.toUpperCase() === cleanCat
      );
      if (exactBoth) return exactBoth;

      // 2. Exact match on price
      const exactPrice = activeConfigs.find((c) => Number(c.ticketPrice) === price);
      if (exactPrice) return exactPrice;

      // 3. Closest price tier
      let closest = activeConfigs[0];
      let minDiff = Math.abs(Number(closest.ticketPrice) - price);
      for (const c of activeConfigs) {
        const diff = Math.abs(Number(c.ticketPrice) - price);
        if (diff < minDiff) {
          minDiff = diff;
          closest = c;
        }
      }
      return closest;
    };

    let totalBaseCharge = 0;
    let totalGst = 0;

    for (const t of rawTickets) {
      const price = Math.round(Number(t.price || 0) * 100) / 100;
      ticketSubtotal += price;

      if (!isFeeEnabled) {
        feeLines.push({
          ticketPrice: price,
          category: t.category || "STANDARD",
          baseCharge: 0,
          gstRate: globalGst,
          gstAmount: 0,
          totalFee: 0
        });
        continue;
      }

      const match = findMatchingConfig(price, t.category);
      const base = match ? Number(match.baseCharge) : 20.00;
      const rate = globalGst !== undefined ? globalGst : (match && match.gstRate !== undefined ? Number(match.gstRate) : 18.0);
      const gst = Math.round(((base * rate) / 100) * 100) / 100;
      const lineFee = Math.round((base + gst) * 100) / 100;

      feeLines.push({
        ticketPrice: price,
        category: match?.category || t.category || "STANDARD",
        baseCharge: base,
        gstRate: rate,
        gstAmount: gst,
        totalFee: lineFee,
        configId: match?.id
      });
    }

    ticketSubtotal = Math.round(ticketSubtotal * 100) / 100;

    if (isFeeEnabled && feeLines.length > 0) {
      if (feeApplication === "PER_BOOKING") {
        // Apply once per booking (using the first/highest line's base charge)
        const highestLine = [...feeLines].sort((a, b) => b.baseCharge - a.baseCharge)[0];
        totalBaseCharge = highestLine ? highestLine.baseCharge : 20.00;
        totalGst = Math.round(((totalBaseCharge * globalGst) / 100) * 100) / 100;
      } else {
        // PER_TICKET: sum of all lines
        totalBaseCharge = feeLines.reduce((sum, l) => sum + l.baseCharge, 0);
        totalGst = feeLines.reduce((sum, l) => sum + l.gstAmount, 0);
      }
    }

    totalBaseCharge = Math.round(totalBaseCharge * 100) / 100;
    totalGst = Math.round(totalGst * 100) / 100;
    const totalConvenienceFee = Math.round((totalBaseCharge + totalGst) * 100) / 100;

    // Musician donation optional add-on (₹1 per ticket or direct amount)
    const musicianDonationAmount =
      opts?.otherCharges !== undefined
        ? Number(opts.otherCharges)
        : opts?.musicianDonation
        ? ticketCount * 1.00
        : 0;

    // Coupon discount logic
    let discountAmount = opts?.couponDiscount !== undefined ? Number(opts.couponDiscount) : 0;
    if (discountAmount === 0 && opts?.couponCode) {
      const code = opts.couponCode.trim().toUpperCase();
      if (code === "WELCOME50" && ticketSubtotal >= 200) discountAmount = 50;
      else if (code === "CINE20") discountAmount = Math.min(100, Math.round(ticketSubtotal * 0.2));
      else if (code === "FLAT50" && ticketSubtotal >= 250) discountAmount = 50;
      else if (code === "STUDENT10") discountAmount = Math.round(ticketSubtotal * 0.1);
    }

    const finalPayableAmount = Math.max(
      0,
      Math.round((ticketSubtotal + totalConvenienceFee + musicianDonationAmount - discountAmount) * 100) / 100
    );

    const feeSnapshot = {
      isFeeEnabled,
      feeApplication,
      gstRateApplied: globalGst,
      baseChargeTotal: totalBaseCharge,
      convenienceFeeGstTotal: totalGst,
      totalConvenienceFee,
      ticketSubtotal,
      finalPayableAmount,
      feeLines,
      calculatedAt: new Date().toISOString()
    };

    return {
      ticketCount,
      ticketSubtotal,
      baseChargeTotal: totalBaseCharge,
      convenienceFeeGstTotal: totalGst,
      totalConvenienceFee,
      musicianDonationAmount,
      discountAmount,
      finalPayableAmount,
      isFeeEnabled,
      gstRateApplied: globalGst,
      feeApplication,
      feeLines,
      feeSnapshot
    };
  }

  public async getAuditLogs(): Promise<any[]> {
    try {
      if ((prisma as any).movieFeeAuditLog?.findMany) {
        const logs = await (prisma as any).movieFeeAuditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 50
        });
        if (logs && logs.length > 0) return logs;
      }
    } catch (err: any) {
      logger.warn(`Could not read DB MovieFeeAuditLog: ${err.message}`);
    }
    return [...this.inMemoryAuditLogs];
  }

  private async logAudit(data: {
    feeConfigId?: string;
    action: string;
    ticketPrice?: number;
    baseCharge?: number;
    gstRate?: number;
    actorEmail?: string;
    reason?: string;
    metadata?: any;
  }) {
    const entry = {
      id: `MFA-${Date.now().toString().slice(-6)}`,
      feeConfigId: data.feeConfigId || null,
      action: data.action,
      ticketPrice: data.ticketPrice || null,
      baseCharge: data.baseCharge || null,
      gstRate: data.gstRate || null,
      actorId: "admin",
      actorEmail: data.actorEmail || "Super Admin",
      reason: data.reason || null,
      metadata: data.metadata || null,
      createdAt: new Date().toISOString()
    };

    try {
      if ((prisma as any).movieFeeAuditLog?.create) {
        await (prisma as any).movieFeeAuditLog.create({
          data: {
            ...entry
          }
        });
      }
    } catch (e: any) {
      // In-memory fallback
    }

    this.inMemoryAuditLogs.unshift(entry);
    if (this.inMemoryAuditLogs.length > 100) this.inMemoryAuditLogs.pop();
  }
}

export const movieFeeService = new MovieFeeService();
