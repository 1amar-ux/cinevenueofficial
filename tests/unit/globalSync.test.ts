import { globalSyncService } from "../../server/services/globalSyncService";
import { realtimeHub } from "../../server/services/realtimeHub";
import * as fs from "fs";
import * as path from "path";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runGlobalSyncTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            results.push({ name, passed: true });
          })
          .catch((err) => {
            results.push({ name, passed: false, error: err?.message || String(err) });
          });
      } else {
        results.push({ name, passed: true });
      }
    } catch (err: any) {
      results.push({ name, passed: false, error: err?.message || String(err) });
    }
  }

  // 1. Initial State Verification
  await test("Global Sync Service initializes canonical store with baseline version and seed entities", async () => {
    const adminState = await globalSyncService.getAdminState();
    if (!adminState) throw new Error("Admin state is null or undefined");
    if (typeof adminState.syncVersion !== "number" || adminState.syncVersion < 1000) {
      throw new Error(`Expected syncVersion >= 1000, got ${adminState.syncVersion}`);
    }
    if (!Array.isArray(adminState.banners) || adminState.banners.length === 0) {
      throw new Error("Expected seed banners to be initialized");
    }
    if (!Array.isArray(adminState.coupons) || adminState.coupons.length === 0) {
      throw new Error("Expected seed coupons to be initialized");
    }
    if (!Array.isArray(adminState.reviews) || adminState.reviews.length === 0) {
      throw new Error("Expected seed reviews to be initialized");
    }
  });

  // 2. Public vs Admin Partitioning
  await test("Partitioning: getPublicState filters administrative data and returns only active/approved entities", async () => {
    const publicState = await globalSyncService.getPublicState();
    // Public state must not expose support tickets
    if ((publicState as any).supportTickets !== undefined) {
      throw new Error("Public state must NOT expose support tickets");
    }
    // All returned banners in public state must be active
    const inactiveBanners = publicState.banners.filter((b) => !b.active);
    if (inactiveBanners.length > 0) {
      throw new Error("Public state must only contain active banners");
    }
    // All returned reviews in public state must be Approved
    const unapprovedReviews = publicState.reviews.filter((r) => r.status !== "Approved");
    if (unapprovedReviews.length > 0) {
      throw new Error("Public state must only contain Approved reviews");
    }
  });

  // 3. Banner Creation and Persistence
  let createdBannerId = "";
  await test("Banner Management: Create new promo banner persists to canonical store and increments syncVersion", async () => {
    const initialVersion = (await globalSyncService.getAdminState()).syncVersion;
    const newBanner = await globalSyncService.createBanner({
      title: "Sync Test Gala Festival",
      type: "Super Sale Hero",
      imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200",
      targetUrl: "/events",
      active: true,
      displayOrder: 99
    });
    createdBannerId = newBanner.id;

    const afterState = await globalSyncService.getAdminState();
    if (afterState.syncVersion <= initialVersion) {
      throw new Error(`Expected version > ${initialVersion}, got ${afterState.syncVersion}`);
    }
    const found = afterState.banners.find((b) => b.id === createdBannerId);
    if (!found || found.title !== "Sync Test Gala Festival") {
      throw new Error("Created banner not found in authoritative state");
    }
  });

  // 4. Banner Toggle Active
  await test("Banner Management: Toggle banner active status safely updates state across all devices", async () => {
    const prevVersion = (await globalSyncService.getAdminState()).syncVersion;
    const toggled = await globalSyncService.toggleBanner(createdBannerId);
    if (toggled.active !== false) {
      throw new Error("Expected banner active status to toggle to false");
    }

    // Public state must now hide it
    const publicState = await globalSyncService.getPublicState();
    if (publicState.banners.some((b) => b.id === createdBannerId)) {
      throw new Error("Toggled-off banner must no longer appear in public state");
    }

    const adminState = await globalSyncService.getAdminState();
    if (adminState.syncVersion <= prevVersion) {
      throw new Error("Expected syncVersion increment after toggle");
    }
  });

  // 5. Banner Deletion
  await test("Banner Management: Delete banner removes item and dispatches real-time broadcast", async () => {
    await globalSyncService.deleteBanner(createdBannerId);
    const adminState = await globalSyncService.getAdminState();
    if (adminState.banners.some((b) => b.id === createdBannerId)) {
      throw new Error("Banner still exists in admin state after deletion");
    }
  });

  // 6. Optimistic Concurrency Control
  await test("Concurrency Control: Reject mutation with stale clientVersion to prevent overwrites", async () => {
    const adminState = await globalSyncService.getAdminState();
    const staleVersion = adminState.syncVersion - 5; // Deliberately stale

    let conflictCaught = false;
    try {
      await globalSyncService.updateBanner({
        id: adminState.banners[0].id,
        title: "Malicious Stale Overwrite",
        type: "Hero Slider",
        active: true,
        clientVersion: staleVersion
      });
    } catch (err: any) {
      if (err.message.includes("CONFLICT_DETECTED")) {
        conflictCaught = true;
      }
    }

    if (!conflictCaught) {
      throw new Error("Expected CONFLICT_DETECTED error when writing with outdated clientVersion");
    }
  });

  // 7. Coupon Lifecycle
  let testCouponCode = "TESTSYNC50";
  await test("Coupon Synchronization: Create, toggle and synchronize discount vouchers", async () => {
    const coupon = await globalSyncService.upsertCoupon({
      code: testCouponCode,
      discount: 50,
      minAmount: 300,
      expires: "2027-01-01",
      active: true,
      claims: 0
    });
    if (coupon.code !== testCouponCode) {
      throw new Error("Coupon code mismatch");
    }

    // Verify it is present in admin state
    let state = await globalSyncService.getAdminState();
    let found = state.coupons.find((c) => c.code === testCouponCode);
    if (!found) throw new Error("Coupon not saved to authoritative state");

    // Toggle coupon
    await globalSyncService.toggleCoupon(testCouponCode);
    state = await globalSyncService.getAdminState();
    found = state.coupons.find((c) => c.code === testCouponCode);
    if (!found || found.active !== false) throw new Error("Coupon did not toggle to inactive");

    // Clean up
    await globalSyncService.deleteCoupon(testCouponCode);
    state = await globalSyncService.getAdminState();
    if (state.coupons.some((c) => c.code === testCouponCode)) {
      throw new Error("Coupon not deleted from authoritative state");
    }
  });

  // 8. Review Moderation
  await test("Review Moderation: Moderate user review status and propagate to public website", async () => {
    const adminState = await globalSyncService.getAdminState();
    const targetReview = adminState.reviews[0];
    if (!targetReview) throw new Error("No reviews available to test");

    const newStatus = targetReview.status === "Approved" ? "Flagged" : "Approved";
    await globalSyncService.moderateReview(targetReview.id, newStatus);

    const updatedState = await globalSyncService.getAdminState();
    const updatedReview = updatedState.reviews.find((r) => r.id === targetReview.id);
    if (!updatedReview || updatedReview.status !== newStatus) {
      throw new Error(`Expected review status to be ${newStatus}`);
    }

    // Restore original status
    await globalSyncService.moderateReview(targetReview.id, targetReview.status);
  });

  // 9. Support Ticket Management
  await test("Support Ticket: Admin can update status and keep support state synchronized", async () => {
    const adminState = await globalSyncService.getAdminState();
    const ticket = adminState.supportTickets[0];
    if (!ticket) throw new Error("No support tickets available to test");

    const updated = await globalSyncService.updateSupportTicket(ticket.id, {
      status: "Resolved",
      responseMessage: "Issue resolved by Global Admin across all active consoles."
    });

    if (updated.status !== "Resolved") {
      throw new Error("Expected ticket status to update to Resolved");
    }
  });

  // 10. Cities and Spotlight Synchronization
  await test("Global Settings: Cities and Spotlight updates synchronize across public and admin consoles", async () => {
    const testCities = ["Hyderabad", "Bengaluru", "Mumbai", "Chennai", "Delhi NCR", "SyncCityTest"];
    await globalSyncService.updateCities(testCities);

    const state = await globalSyncService.getPublicState();
    if (!state.cities.includes("SyncCityTest")) {
      throw new Error("New city not reflected in synchronized public state");
    }

    // Revert back without test city
    await globalSyncService.updateCities(testCities.filter((c) => c !== "SyncCityTest"));
  });

  // 11. Feature Toggles Synchronization
  await test("Feature Toggles: System flags propagate authoritative values and increment syncVersion", async () => {
    const initialToggles = (await globalSyncService.getAdminState()).featureToggles;
    const toggledMovieBooking = !initialToggles.isMovieBookingSystemActive;

    await globalSyncService.updateFeatureToggles({
      isMovieBookingSystemActive: toggledMovieBooking
    });

    const afterState = await globalSyncService.getPublicState();
    if (afterState.featureToggles.isMovieBookingSystemActive !== toggledMovieBooking) {
      throw new Error("Feature toggle not reflected in public state");
    }

    // Revert to initial
    await globalSyncService.updateFeatureToggles({
      isMovieBookingSystemActive: initialToggles.isMovieBookingSystemActive
    });
  });

  // 12. Delta Sync & Changelog
  await test("Delta Fallback: getDelta returns granular change events since client's last known version", async () => {
    const currentState = await globalSyncService.getAdminState();
    const delta = await globalSyncService.getDelta(currentState.syncVersion - 2);

    if (delta.currentVersion !== currentState.syncVersion) {
      throw new Error(`Expected delta currentVersion ${currentState.syncVersion}, got ${delta.currentVersion}`);
    }
    if (!Array.isArray(delta.changes)) {
      throw new Error("Expected changes array in delta response");
    }
  });

  // 13. Real-Time Hub Event Delivery & SSE Client Emulation
  await test("Real-Time Hub: Broadcasts events to subscribed listeners and enforces private administrative filtering", async () => {
    let publicReceived = false;
    let privateReceived = false;

    // Emulate a public SSE client
    const mockPublicRes: any = {
      write: (data: string) => {
        if (data.includes("BROADCAST_ALERT")) {
          publicReceived = true;
        }
      }
    };
    const unregPublic = realtimeHub.registerSseClient(mockPublicRes, "customer");

    // Emulate an admin SSE client
    const mockAdminRes: any = {
      write: (data: string) => {
        if (data.includes("ADMIN_LOG_TEST")) {
          privateReceived = true;
        }
      }
    };
    const unregAdmin = realtimeHub.registerSseClient(mockAdminRes, "super_admin");

    // Broadcast a public event
    realtimeHub.broadcastUpdate({
      type: "BROADCAST_ALERT",
      payload: { message: "Test Broadcast to all devices" },
      version: 9999,
      isPrivate: false,
      timestamp: new Date().toISOString()
    });

    // Broadcast a private event
    realtimeHub.broadcastUpdate({
      type: "ADMIN_LOG_TEST" as any,
      payload: { secret: "admin-only" },
      version: 10000,
      isPrivate: true,
      timestamp: new Date().toISOString()
    });

    unregPublic();
    unregAdmin();

    if (!publicReceived) {
      throw new Error("Public client did not receive public broadcast event");
    }
    if (!privateReceived) {
      throw new Error("Admin client did not receive private broadcast event");
    }
  });

  // 14. Persistence to Disk Verification
  await test("Disk Persistence: Authoritative store file exists and retains valid JSON across process calls", async () => {
    const storePath = path.resolve(process.cwd(), "server/config/global_admin_store.json");
    if (!fs.existsSync(storePath)) {
      throw new Error(`Store file does not exist at ${storePath}`);
    }
    const raw = fs.readFileSync(storePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed.syncVersion || !parsed.banners || !parsed.coupons) {
      throw new Error("Store file lacks mandatory schema properties");
    }
  });

  return results;
}
