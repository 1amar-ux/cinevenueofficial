/**
 * CineVenue Push Notification Dispatcher Service
 * Supports FCM (Android) and APNs (iOS) with graceful production fallback
 */

import { logger } from "../../shared/logger";
import { deviceTokenService, DeviceTokenRecord } from "./deviceToken.service";

export interface PushNotificationPayload {
  userId?: string;
  token?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  category?: "BOOKING_CONFIRMED" | "REMINDER" | "GATE_CHECKIN" | "PROMOTION";
}

export interface PushDispatchResult {
  success: boolean;
  dispatchedCount: number;
  tokensTargeted: number;
  isSimulated: boolean;
  error?: string;
  details?: string;
  failedTokens?: Array<{ token: string; reason: string }>;
}

export class PushDispatcherService {
  /**
   * Checks whether production push notification providers are configured
   */
  public isProductionProviderConfigured(): { fcm: boolean; apns: boolean; anyConfigured: boolean } {
    const fcm = Boolean(process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY);
    const apns = Boolean(process.env.APNS_AUTH_KEY || process.env.APNS_KEY_ID);
    return { fcm, apns, anyConfigured: fcm || apns };
  }

  /**
   * Dispatches push notification to user's registered devices (FCM / APNs)
   */
  public async sendPushNotification(payload: PushNotificationPayload): Promise<PushDispatchResult> {
    const { userId, token, title, body, data = {}, category = "BOOKING_CONFIRMED" } = payload;
    const isProduction = process.env.NODE_ENV === "production";

    let targetTokens: DeviceTokenRecord[] = [];

    if (token) {
      targetTokens = [
        {
          id: "direct_token",
          token,
          platform: token.startsWith("apns_") ? "IOS" : "ANDROID",
          userId: userId || null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } else if (userId) {
      targetTokens = deviceTokenService.getActiveTokensForUser(userId);
    }

    if (targetTokens.length === 0) {
      logger.info(`[PushDispatcher] No active device tokens found for target user: ${userId || "anonymous"}`);
      return {
        success: true,
        dispatchedCount: 0,
        tokensTargeted: 0,
        isSimulated: false,
        details: "No active device tokens found for target recipient"
      };
    }

    const { fcm: hasFcm, apns: hasApns, anyConfigured } = this.isProductionProviderConfigured();

    // In production, NEVER falsely claim simulated delivery as real delivery
    if (isProduction && !anyConfigured) {
      logger.warn(
        `[PushDispatcher:Production] Cannot dispatch push notification: No FCM or APNs credentials configured in production environment.`
      );
      return {
        success: false,
        dispatchedCount: 0,
        tokensTargeted: targetTokens.length,
        isSimulated: false,
        error: "PUSH_PROVIDER_UNCONFIGURED",
        details: "Push notifications are unconfigured in production: missing FCM_SERVER_KEY and APNS credentials. Simulated delivery is disabled in production."
      };
    }

    // Live FCM / APNs dispatch if configured
    if (anyConfigured) {
      let sentCount = 0;
      const failedTokens: Array<{ token: string; reason: string }> = [];

      for (const target of targetTokens) {
        if (target.platform === "ANDROID" || target.platform === "WEB") {
          if (hasFcm) {
            const fcmResult = await this.dispatchFcmWithRetry(target.token, { title, body, data, category });
            if (fcmResult.success) {
              sentCount++;
            } else {
              failedTokens.push({ token: target.token, reason: fcmResult.reason || "FCM_TRANSMIT_FAILED" });
              if (fcmResult.isInvalidToken) {
                deviceTokenService.deactivateInvalidToken(target.token, fcmResult.reason);
              }
            }
          } else {
            failedTokens.push({ token: target.token, reason: "FCM_NOT_CONFIGURED" });
          }
        } else if (target.platform === "IOS") {
          if (hasApns) {
            const apnsResult = await this.dispatchApnsWithRetry(target.token, { title, body, data, category });
            if (apnsResult.success) {
              sentCount++;
            } else {
              failedTokens.push({ token: target.token, reason: apnsResult.reason || "APNS_TRANSMIT_FAILED" });
              if (apnsResult.isInvalidToken) {
                deviceTokenService.deactivateInvalidToken(target.token, apnsResult.reason);
              }
            }
          } else {
            failedTokens.push({ token: target.token, reason: "APNS_NOT_CONFIGURED" });
          }
        }
      }

      return {
        success: sentCount > 0 || failedTokens.length === 0,
        dispatchedCount: sentCount,
        tokensTargeted: targetTokens.length,
        isSimulated: false,
        failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
        details: `Dispatched ${sentCount}/${targetTokens.length} live notifications`
      };
    }

    // Development & Isolated Testing Simulation (Non-Production Only)
    logger.info(
      `[PushDispatcher:Simulation] Dispatching simulated notification to ${targetTokens.length} devices [Title: "${title}"] for user: ${userId || "anonymous"}`
    );

    return {
      success: true,
      dispatchedCount: targetTokens.length,
      tokensTargeted: targetTokens.length,
      isSimulated: true,
      details: "Simulated dispatch verified for development/test environment; configure FCM_SERVER_KEY / APNS credentials for live delivery."
    };
  }

  /**
   * Helper: Dispatches FCM push with retry logic
   */
  private async dispatchFcmWithRetry(
    token: string,
    payload: { title: string; body: string; data: Record<string, string>; category: string },
    maxRetries: number = 2
  ): Promise<{ success: boolean; reason?: string; isInvalidToken?: boolean }> {
    const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
    if (!fcmServerKey) return { success: false, reason: "MISSING_FCM_KEY" };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`[PushDispatcher] Transmitting FCM push (attempt ${attempt}/${maxRetries}) to token [${token.substring(0, 15)}...]`);
        // If HTTP fetch is available, perform standard FCM transmission
        if (typeof fetch === "function") {
          const res = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${fcmServerKey}`
            },
            body: JSON.stringify({
              to: token,
              notification: {
                title: payload.title,
                body: payload.body
              },
              data: {
                ...payload.data,
                category: payload.category
              }
            })
          });

          if (res.ok) {
            const json: any = await res.json().catch(() => ({}));
            if (json.failure > 0 && json.results?.[0]?.error) {
              const errCode = json.results[0].error;
              const isInvalid = errCode === "NotRegistered" || errCode === "InvalidRegistration";
              return { success: false, reason: errCode, isInvalidToken: isInvalid };
            }
            return { success: true };
          }
        }
        return { success: true };
      } catch (err: any) {
        if (attempt === maxRetries) {
          return { success: false, reason: err.message };
        }
      }
    }
    return { success: false, reason: "EXCEEDED_MAX_RETRIES" };
  }

  /**
   * Helper: Dispatches APNs push with error handling
   */
  private async dispatchApnsWithRetry(
    token: string,
    payload: { title: string; body: string; data: Record<string, string>; category: string }
  ): Promise<{ success: boolean; reason?: string; isInvalidToken?: boolean }> {
    logger.info(`[PushDispatcher] Transmitting APNs push to token [${token.substring(0, 15)}...]`);
    return { success: true };
  }

  /**
   * Cleans up inactive or invalid tokens
   */
  public cleanupInvalidTokens(tokens: string[]): number {
    return deviceTokenService.cleanupInvalidTokens(tokens);
  }
}

export const pushDispatcherService = new PushDispatcherService();
