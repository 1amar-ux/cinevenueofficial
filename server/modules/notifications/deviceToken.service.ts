import fs from "fs";
import path from "path";
import { logger } from "../../shared/logger";
import { ValidationError } from "../../shared/errors";

export type DevicePlatform = "ANDROID" | "IOS" | "WEB";

export interface DeviceTokenRecord {
  id: string;
  token: string;
  platform: DevicePlatform;
  userId: string | null;
  deviceId?: string | null;
  deviceModel?: string | null;
  appVersion?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORE_PATH = path.resolve(process.cwd(), "server/config/device_tokens.json");

export class DeviceTokenService {
  private tokens: Map<string, DeviceTokenRecord> = new Map();
  private isLoaded: boolean = false;

  constructor() {
    this.loadTokens();
  }

  private loadTokens(): void {
    if (this.isLoaded) return;
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, "utf8");
        const list: DeviceTokenRecord[] = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const item of list) {
            this.tokens.set(item.token, item);
          }
        }
      }
      this.isLoaded = true;
    } catch (err: any) {
      logger.warn(`[DeviceTokenService] Failed to load device tokens store: ${err.message}`);
      this.isLoaded = true;
    }
  }

  private persistTokens(): void {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const list = Array.from(this.tokens.values());
      fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf8");
    } catch (err: any) {
      logger.warn(`[DeviceTokenService] Failed to persist device tokens: ${err.message}`);
    }
  }

  /**
   * Registers or updates a device push token (FCM for Android, APNs for iOS)
   * Enforces exact uniqueness per token to prevent duplicate notification deliveries.
   */
  public registerToken(params: {
    token: string;
    platform: string;
    userId?: string | null;
    deviceId?: string | null;
    deviceModel?: string | null;
    appVersion?: string | null;
  }): DeviceTokenRecord {
    const rawToken = String(params.token || "").trim();
    if (!rawToken || rawToken.length < 10) {
      throw new ValidationError("A valid device push notification token is required (minimum 10 characters).");
    }

    const rawPlatform = String(params.platform || "").toUpperCase().trim();
    if (!["ANDROID", "IOS", "WEB"].includes(rawPlatform)) {
      throw new ValidationError("Invalid device platform. Allowed platforms: 'ANDROID', 'IOS', 'WEB'.");
    }

    const platform = rawPlatform as DevicePlatform;
    const now = new Date().toISOString();

    const existing = this.tokens.get(rawToken);
    if (existing) {
      existing.userId = params.userId || existing.userId || null;
      existing.platform = platform;
      existing.deviceId = params.deviceId !== undefined ? params.deviceId : existing.deviceId;
      existing.deviceModel = params.deviceModel !== undefined ? params.deviceModel : existing.deviceModel;
      existing.appVersion = params.appVersion !== undefined ? params.appVersion : existing.appVersion;
      existing.isActive = true;
      existing.updatedAt = now;
      this.persistTokens();

      logger.info(`[DeviceTokenService] Updated push token for ${platform} user: ${existing.userId || "anonymous"}`);
      return existing;
    }

    const newRecord: DeviceTokenRecord = {
      id: `dvt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      token: rawToken,
      platform,
      userId: params.userId || null,
      deviceId: params.deviceId || null,
      deviceModel: params.deviceModel || null,
      appVersion: params.appVersion || null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    this.tokens.set(rawToken, newRecord);
    this.persistTokens();

    logger.info(`[DeviceTokenService] Registered new ${platform} push token for user: ${newRecord.userId || "anonymous"}`);
    return newRecord;
  }

  /**
   * Deactivates a device push token (e.g., on logout or app uninstall)
   */
  public deactivateToken(token: string, userId?: string | null): boolean {
    const rawToken = String(token || "").trim();
    if (!rawToken) return false;

    const existing = this.tokens.get(rawToken);
    if (!existing) return false;

    // If userId provided, ensure caller owns or is associated with the token
    if (userId && existing.userId && existing.userId !== userId) {
      logger.warn(`[DeviceTokenService] Unauthorized attempt to deactivate token owned by ${existing.userId} from ${userId}`);
      return false;
    }

    existing.isActive = false;
    existing.updatedAt = new Date().toISOString();
    this.persistTokens();

    logger.info(`[DeviceTokenService] Deactivated push token for ${existing.platform} user: ${existing.userId || "anonymous"}`);
    return true;
  }

  /**
   * Retrieves active tokens for a specific user ID
   */
  public getActiveTokensForUser(userId: string): DeviceTokenRecord[] {
    if (!userId) return [];
    return Array.from(this.tokens.values()).filter(t => t.userId === userId && t.isActive);
  }

  /**
   * Total registered tokens count
   */
  public getTotalTokensCount(): { total: number; active: number; android: number; ios: number; web: number } {
    const list = Array.from(this.tokens.values());
    const active = list.filter(t => t.isActive);
    return {
      total: list.length,
      active: active.length,
      android: active.filter(t => t.platform === "ANDROID").length,
      ios: active.filter(t => t.platform === "IOS").length,
      web: active.filter(t => t.platform === "WEB").length
    };
  }
}

export const deviceTokenService = new DeviceTokenService();

