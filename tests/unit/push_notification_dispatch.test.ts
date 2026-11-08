import { deviceTokenService } from "../../server/modules/notifications/deviceToken.service";
import { pushDispatcherService } from "../../server/modules/notifications/pushDispatcher.service";

async function runPushNotificationTests() {
  console.log("==========================================================================");
  console.log("CINEVENUE PUSH NOTIFICATION (FCM / APNS) DISPATCH TEST SUITE");
  console.log("==========================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ${details}`);
      failed++;
    }
  }

  const testUserId = "usr_push_test_" + Date.now();
  const fcmToken = "fcm_android_token_test_abc123456789";
  const apnsToken = "apns_ios_token_test_xyz9876543210";

  // 1. Register FCM token
  console.log("--- 1. Testing Device Token Registration ---");
  const fcmRecord = deviceTokenService.registerToken({
    token: fcmToken,
    platform: "ANDROID",
    userId: testUserId,
    deviceId: "android_device_001"
  });
  assert(fcmRecord.platform === "ANDROID", "Registered Android FCM token");
  assert(fcmRecord.isActive === true, "FCM token is active");

  // 2. Register APNs token
  const apnsRecord = deviceTokenService.registerToken({
    token: apnsToken,
    platform: "IOS",
    userId: testUserId,
    deviceId: "iphone_device_002"
  });
  assert(apnsRecord.platform === "IOS", "Registered iOS APNs token");
  assert(apnsRecord.isActive === true, "APNs token is active");

  // 3. Dispatch to User ID
  console.log("\n--- 2. Testing Push Dispatch to User Devices ---");
  const dispatchResult = await pushDispatcherService.sendPushNotification({
    userId: testUserId,
    title: "Movie Booking Confirmed!",
    body: "Your tickets for Coolie (IMAX 3D) are confirmed. Show starts at 7:30 PM.",
    category: "BOOKING_CONFIRMED"
  });

  assert(dispatchResult.success === true, "Dispatch reports success = true");
  assert(dispatchResult.tokensTargeted === 2, "Targeted both active devices (Android + iOS)");
  assert(dispatchResult.dispatchedCount === 2, "Dispatched to 2 devices");

  // 4. Dispatch to Direct Token
  console.log("\n--- 3. Testing Direct Token Push Dispatch ---");
  const directResult = await pushDispatcherService.sendPushNotification({
    token: fcmToken,
    title: "Gate Check-in Ready",
    body: "Present your QR code at Screen 1 gate.",
    category: "GATE_CHECKIN"
  });
  assert(directResult.success === true, "Direct token dispatch reports success = true");
  assert(directResult.tokensTargeted === 1, "Targeted exactly 1 device");

  // 5. Deactivation test
  console.log("\n--- 4. Testing Token Deactivation ---");
  const deactivated = deviceTokenService.deactivateToken(fcmToken, testUserId);
  assert(deactivated === true, "Deactivated Android token successfully");

  const afterDeactTokens = deviceTokenService.getActiveTokensForUser(testUserId);
  assert(afterDeactTokens.length === 1, "Only 1 active token remaining (iOS)");
  assert(afterDeactTokens[0].platform === "IOS", "Remaining active token is iOS APNs");

  // Cleanup
  deviceTokenService.deactivateToken(apnsToken, testUserId);

  console.log("\n==========================================================================");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runPushNotificationTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});

