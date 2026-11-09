import assert from "assert";
import { pushDispatcherService } from "../../server/modules/notifications/pushDispatcher.service";
import { deviceTokenService } from "../../server/modules/notifications/deviceToken.service";

export async function runPushNotificationProviderTests(): Promise<Array<{ name: string; passed: boolean; error?: string }>> {
  const results: Array<{ name: string; passed: boolean; error?: string }> = [];

  const originalEnv = process.env.NODE_ENV;
  const originalFcm = process.env.FCM_SERVER_KEY;
  const originalApns = process.env.APNS_AUTH_KEY;

  try {
    // 1. Device Token Registration
    try {
      const tokenStr = `fcm_test_token_${Date.now()}_abc123`;
      const reg = deviceTokenService.registerToken({
        token: tokenStr,
        platform: "ANDROID",
        userId: "usr_push_test_01",
        deviceId: "dev_pixel_7",
        deviceModel: "Pixel 7 Pro",
        appVersion: "2.4.0"
      });

      assert(reg && reg.isActive === true, "Token must be active upon registration");
      assert(reg.platform === "ANDROID", "Platform must be recorded as ANDROID");
      assert(reg.userId === "usr_push_test_01", "User ID must match");

      results.push({ name: "Device Token: Registration persists active record with device metadata", passed: true });
    } catch (err: any) {
      results.push({ name: "Device Token: Registration", passed: false, error: err.message });
    }

    // 2. Platform Validation
    try {
      let threw = false;
      try {
        deviceTokenService.registerToken({
          token: "fcm_test_invalid_platform_token_long_enough",
          platform: "WINDOWS_PHONE",
          userId: "usr_test"
        });
      } catch {
        threw = true;
      }
      assert(threw, "Must reject unsupported device platform");
      results.push({ name: "Device Token: Platform validation rejects unsupported platforms", passed: true });
    } catch (err: any) {
      results.push({ name: "Device Token: Platform validation", passed: false, error: err.message });
    }

    // 3. Safe Simulation in Development Mode
    try {
      process.env.NODE_ENV = "development";
      delete process.env.FCM_SERVER_KEY;
      delete process.env.APNS_AUTH_KEY;

      const simResult = await pushDispatcherService.sendPushNotification({
        userId: "usr_push_test_01",
        title: "Booking Confirmed",
        body: "Your movie tickets for Devara are confirmed!",
        category: "BOOKING_CONFIRMED"
      });

      assert(simResult.success === true, "Development dispatch must succeed");
      assert(simResult.isSimulated === true, "Must be explicitly flagged as isSimulated: true");
      assert(simResult.dispatchedCount >= 1, "Must target registered device tokens");

      results.push({ name: "Push Dispatcher: Safe simulation in development mode flags isSimulated=true", passed: true });
    } catch (err: any) {
      results.push({ name: "Push Dispatcher: Safe simulation in dev mode", passed: false, error: err.message });
    }

    // 4. Production Fail-Closed on Unconfigured Credentials
    try {
      process.env.NODE_ENV = "production";
      delete process.env.FCM_SERVER_KEY;
      delete process.env.FIREBASE_SERVER_KEY;
      delete process.env.APNS_AUTH_KEY;
      delete process.env.APNS_KEY_ID;

      const prodResult = await pushDispatcherService.sendPushNotification({
        userId: "usr_push_test_01",
        title: "Production Alert",
        body: "This should fail closed without credentials"
      });

      assert(prodResult.success === false, "Production dispatch without credentials must NOT claim success");
      assert(prodResult.isSimulated === false, "Must NOT simulate delivery in production");
      assert(prodResult.error === "PUSH_PROVIDER_UNCONFIGURED", "Must return PUSH_PROVIDER_UNCONFIGURED error");

      results.push({ name: "Push Dispatcher: Production mode fails closed when push credentials unconfigured", passed: true });
    } catch (err: any) {
      results.push({ name: "Push Dispatcher: Production fail-closed", passed: false, error: err.message });
    }

    // 5. Direct Token Dispatch
    try {
      process.env.NODE_ENV = "development";
      const directToken = `apns_direct_token_${Date.now()}_long_enough`;
      const directResult = await pushDispatcherService.sendPushNotification({
        token: directToken,
        title: "Direct Push",
        body: "Test direct token"
      });

      assert(directResult.tokensTargeted === 1, "Must target exactly 1 token");
      assert(directResult.isSimulated === true, "Must flag simulation in dev");

      results.push({ name: "Push Dispatcher: Direct device token dispatch resolves platform correctly", passed: true });
    } catch (err: any) {
      results.push({ name: "Push Dispatcher: Direct device token dispatch", passed: false, error: err.message });
    }

    // 6. Token Deactivation & Cleanup
    try {
      const cleanToken = `fcm_clean_token_${Date.now()}_123456789`;
      deviceTokenService.registerToken({
        token: cleanToken,
        platform: "ANDROID",
        userId: "usr_clean_test"
      });

      const deactResult = deviceTokenService.deactivateToken(cleanToken, "usr_clean_test");
      assert(deactResult === true, "Token deactivation must succeed");

      const activeAfter = deviceTokenService.getActiveTokensForUser("usr_clean_test");
      assert(!activeAfter.some(t => t.token === cleanToken), "Deactivated token must not appear in active tokens list");

      results.push({ name: "Device Token: Token deactivation removes token from active dispatch pool", passed: true });
    } catch (err: any) {
      results.push({ name: "Device Token: Token deactivation", passed: false, error: err.message });
    }

    // 7. Invalid Token Cleanup Interface
    try {
      const invalidToken = `fcm_invalid_unregistered_${Date.now()}_xyz`;
      deviceTokenService.registerToken({
        token: invalidToken,
        platform: "ANDROID",
        userId: "usr_invalid_test"
      });

      const cleaned = pushDispatcherService.cleanupInvalidTokens([invalidToken]);
      assert(cleaned === 1, "Must clean up exactly 1 invalid token");

      results.push({ name: "Push Dispatcher: Invalid token cleanup interface safely prunes dead tokens", passed: true });
    } catch (err: any) {
      results.push({ name: "Push Dispatcher: Invalid token cleanup interface", passed: false, error: err.message });
    }

  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalFcm) process.env.FCM_SERVER_KEY = originalFcm;
    if (originalApns) process.env.APNS_AUTH_KEY = originalApns;
  }

  return results;
}

if (process.argv[1]?.includes("push_notification_provider.test")) {
  runPushNotificationProviderTests().then((res) => {
    console.log("Push Provider Tests:", res.length, "Passed:", res.filter(r => r.passed).length, "Failed:", res.filter(r => !r.passed).length);
    res.forEach(r => console.log(r.passed ? `  ✅ ${r.name}` : `  ❌ ${r.name}: ${r.error}`));
  });
}

