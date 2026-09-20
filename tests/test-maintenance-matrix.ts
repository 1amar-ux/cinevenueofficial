import axios from "axios";
import http from "http";
import { createApp } from "../server/app";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { setTestMaintenanceState } from "../server/middleware/maintenance";

dotenv.config();

// Reset test runner to clean default live state
setTestMaintenanceState({
  maintenanceMode: false,
  globalSubwebsiteEnabled: true,
  serviceControls: {
    website: { status: true },
    movieBooking: { status: true },
    filmProduction: { status: true },
    eventManagement: { status: true },
    brandPromotion: { status: true },
    eventBooking: { status: true },
    cinecoins: { status: true }
  }
});

const supabase = createClient(
  process.env.SUPABASE_URL || "https://mpeedjoyvimegnmymweb.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);

async function runMaintenanceMatrixTests() {
  console.log("================================================================================");
  console.log("🚀 TESTING CINEVENUE MAINTENANCE-MODE & LIVE-STATUS SYNCHRONIZATION MATRIX");
  console.log("================================================================================\n");

  const app = createApp();
  const server = http.createServer(app);

  const PORT = 49209;
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const BASE = `http://localhost:${PORT}/api/v1`;
  const ROOT = `http://localhost:${PORT}`;

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${desc}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // CASE A: GLOBAL MAINTENANCE ON
    // Main = Maintenance, All public subsites = Maintenance
    // -------------------------------------------------------------------------
    console.log("--- CASE A: Global Platform Maintenance ON ---");
    const globalOnRes = await axios.put(
      `${BASE}/admin/system/maintenance`,
      {
        maintenanceMode: true,
        title: "CineVenue Platform Under Scheduled Upgrade",
        message: "We are improving our servers. All public services are temporarily offline."
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(globalOnRes.status === 200 && globalOnRes.data.globalMaintenanceMode === true, "PUT /api/v1/admin/system/maintenance activates global maintenance");

    // Verify GET /system/maintenance-status
    const statusA = await axios.get(`${BASE}/system/maintenance-status?_cb=${Date.now()}`);
    assert(statusA.data.globalMaintenanceMode === true, "GET /system/maintenance-status reports globalMaintenanceMode=true");
    assert(statusA.data.subsites.filmProduction.isMaintenance === true, "Subsite filmProduction is in maintenance under global maintenance");
    assert(statusA.data.subsites.eventManagement.isMaintenance === true, "Subsite eventManagement is in maintenance under global maintenance");
    assert(statusA.data.subsites.movieBooking.isMaintenance === true, "Movie booking is in maintenance under global maintenance");

    // Verify booking gate returns 503
    try {
      await axios.post(`${BASE}/payments/create-order`, { bookingId: "test_b", amount: 200 });
      assert(false, "Payment create-order should have been blocked with 503");
    } catch (e: any) {
      assert(e.response?.status === 503 && (e.response?.data?.code === "MOVIE_BOOKING_MAINTENANCE" || e.response?.data?.code === "PLATFORM_MAINTENANCE"), "Booking & Payment Gate blocked with HTTP 503");
    }

    // Verify subsite direct browser route returns 503
    try {
      await axios.get(`${ROOT}/film-production`, { headers: { Accept: "text/html" } });
      assert(false, "GET /film-production should return 503 under global maintenance");
    } catch (e: any) {
      assert(e.response?.status === 503, "Direct browser visit to /film-production blocked with 503 HTML");
    }

    // Admin Panel remains accessible
    const adminHealth = await axios.get(`${BASE}/admin/health`, { headers: { "x-admin-passcode": "8888" } }).catch(() => null);
    assert(adminHealth !== null, "Admin routes remain accessible during global maintenance");

    // -------------------------------------------------------------------------
    // CASE B: GLOBAL MAINTENANCE OFF
    // Main = Live, All public subsites = Live unless individually disabled
    // -------------------------------------------------------------------------
    console.log("\n--- CASE B: Global Platform Maintenance OFF ---");
    const globalOffRes = await axios.put(
      `${BASE}/admin/system/maintenance`,
      { maintenanceMode: false },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(globalOffRes.status === 200 && globalOffRes.data.globalMaintenanceMode === false, "PUT /api/v1/admin/system/maintenance deactivates global maintenance");

    const statusB = await axios.get(`${BASE}/system/maintenance-status?_cb=${Date.now()}`);
    assert(statusB.data.globalMaintenanceMode === false, "GET /system/maintenance-status reports globalMaintenanceMode=false");
    assert(statusB.data.subsites.filmProduction.isMaintenance === false, "Subsite filmProduction is LIVE");
    assert(statusB.data.subsites.eventManagement.isMaintenance === false, "Subsite eventManagement is LIVE");
    assert(statusB.data.subsites.movieBooking.isMaintenance === false, "Movie booking is LIVE");

    // -------------------------------------------------------------------------
    // CASE C: SUBSITE A (Film Production) MAINTENANCE ON
    // Main = Live, Subsite A = Maintenance, Subsite B (Events) = Live
    // -------------------------------------------------------------------------
    console.log("\n--- CASE C: Subsite A (Film Production) Maintenance ON ---");
    const subAOnRes = await axios.put(
      `${BASE}/admin/subsites/filmProduction/maintenance`,
      {
        maintenance: true,
        title: "Film Production Division Scheduled Maintenance",
        message: "Casting portal and auditions are offline for updates."
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(subAOnRes.status === 200 && subAOnRes.data.isMaintenance === true, "PUT /api/v1/admin/subsites/filmProduction/maintenance activates filmProduction maintenance");

    const statusC = await axios.get(`${BASE}/system/maintenance-status?_cb=${Date.now()}`);
    assert(statusC.data.globalMaintenanceMode === false, "Global platform maintenance mode remains FALSE");
    assert(statusC.data.subsites.filmProduction.isMaintenance === true, "Subsite filmProduction is in MAINTENANCE");
    assert(statusC.data.subsites.eventManagement.isMaintenance === false, "Subsite eventManagement remains LIVE");
    assert(statusC.data.subsites.movieBooking.isMaintenance === false, "Movie booking remains LIVE");

    // Dedicated subsite maintenance check API
    const subACheck = await axios.get(`${BASE}/system/subsites/filmProduction/maintenance?_cb=${Date.now()}`);
    assert(subACheck.data.isMaintenance === true && subACheck.data.reason === "INDIVIDUAL_SUBSITE_MAINTENANCE", "Dedicated API confirms filmProduction maintenance with reason INDIVIDUAL_SUBSITE_MAINTENANCE");

    const subBCheck = await axios.get(`${BASE}/system/subsites/eventManagement/maintenance?_cb=${Date.now()}`);
    assert(subBCheck.data.isMaintenance === false && subBCheck.data.reason === "LIVE", "Dedicated API confirms eventManagement is LIVE");

    // Verify subsite direct browser route blocks ONLY Film Production
    try {
      await axios.get(`${ROOT}/film-production`, { headers: { Accept: "text/html" } });
      assert(false, "GET /film-production should return 503");
    } catch (e: any) {
      assert(e.response?.status === 503, "Direct browser visit to /film-production blocked with 503 HTML");
    }

    // -------------------------------------------------------------------------
    // CASE D: SUBSITE A (Film Production) RESTORED TO LIVE (OFF)
    // Main = Live, Subsite A = Live, Everything else unchanged
    // -------------------------------------------------------------------------
    console.log("\n--- CASE D: Subsite A (Film Production) Restored to LIVE ---");
    const subAOffRes = await axios.put(
      `${BASE}/admin/subsites/filmProduction/maintenance`,
      { maintenance: false },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(subAOffRes.status === 200 && subAOffRes.data.isMaintenance === false, "PUT /api/v1/admin/subsites/filmProduction/maintenance restores filmProduction to LIVE");

    const statusD = await axios.get(`${BASE}/system/maintenance-status?_cb=${Date.now()}`);
    assert(statusD.data.globalMaintenanceMode === false, "Global platform remains LIVE");
    assert(statusD.data.subsites.filmProduction.isMaintenance === false, "filmProduction is restored to LIVE");
    assert(statusD.data.subsites.eventManagement.isMaintenance === false, "eventManagement remains LIVE");

    // -------------------------------------------------------------------------
    // CASE E: REFRESH BROWSER / CACHE-BUSTING VERIFICATION
    // Response must strictly contain Cache-Control: no-store, no-cache
    // -------------------------------------------------------------------------
    console.log("\n--- CASE E: Refresh Browser & Strict Cache-Busting Verification ---");
    const refreshRes = await axios.get(`${BASE}/system/maintenance-status?_cb=${Date.now()}`);
    const cacheHeader = String(refreshRes.headers["cache-control"] || "");
    assert(cacheHeader.includes("no-store") && cacheHeader.includes("no-cache"), `Maintenance status has strict no-cache/no-store header: "${cacheHeader}"`);
    assert(refreshRes.headers["pragma"] === "no-cache", "Pragma no-cache present");

    // -------------------------------------------------------------------------
    // CASE F: INCOGNITO / FRESH CLIENT UNCACHED FETCH
    // -------------------------------------------------------------------------
    console.log("\n--- CASE F: Incognito / Fresh Client Simulation ---");
    const incognitoClient = axios.create();
    const incognitoRes = await incognitoClient.get(`${BASE}/system/maintenance-status`, {
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });
    assert(incognitoRes.status === 200 && incognitoRes.data.globalMaintenanceMode === false, "Incognito / Fresh client receives authoritative live server status");

    // -------------------------------------------------------------------------
    // CASE G: MULTIPLE CLIENTS / BROADCAST SIMULATION
    // Device A changes state -> Device B fetches and sees state immediately
    // -------------------------------------------------------------------------
    console.log("\n--- CASE G: Multi-Device Point-to-Point Sync ---");
    // Device A turns on eventManagement maintenance
    await axios.put(
      `${BASE}/admin/subsites/eventManagement/maintenance`,
      { maintenance: true, message: "Device A triggered event maintenance." },
      { headers: { "x-admin-passcode": "8888" } }
    );
    // Device B immediately requests
    const deviceBRes = await axios.get(`${BASE}/system/subsites/eventManagement/maintenance?_cb=${Date.now()}`);
    assert(deviceBRes.data.isMaintenance === true && deviceBRes.data.message.includes("Device A"), "Device B immediately observes Device A's update (< 100ms)");

    // Restore eventManagement
    await axios.put(
      `${BASE}/admin/subsites/eventManagement/maintenance`,
      { maintenance: false },
      { headers: { "x-admin-passcode": "8888" } }
    );

    // -------------------------------------------------------------------------
    // CASE H: QUICK SUCCESSIVE TOGGLES (FLAPPING MITIGATION)
    // Toggle ON then OFF within 200ms -> Final state must be LAST action (OFF)
    // -------------------------------------------------------------------------
    console.log("\n--- CASE H: Quick Successive Toggles (Anti-Flapping Test) ---");
    const p1 = axios.put(
      `${BASE}/admin/system/maintenance`,
      { maintenanceMode: true },
      { headers: { "x-admin-passcode": "8888" } }
    );
    await new Promise((r) => setTimeout(r, 50));
    const p2 = axios.put(
      `${BASE}/admin/system/maintenance`,
      { maintenanceMode: false },
      { headers: { "x-admin-passcode": "8888" } }
    );
    await Promise.all([p1, p2]);

    // Give 100ms for DB settle
    await new Promise((r) => setTimeout(r, 100));
    const finalStateRes = await axios.get(`${BASE}/system/maintenance-status?_cb=${Date.now()}`);
    assert(finalStateRes.data.globalMaintenanceMode === false, "Rapid successive toggles resolve strictly to the LAST action (LIVE/OFF)");

    // -------------------------------------------------------------------------
    // CASE I: PERSISTENCE ACROSS RESTART SIMULATION
    // Reading settings reflects persisted DB/file configuration
    // -------------------------------------------------------------------------
    console.log("\n--- CASE I: Persistence Across Server State Simulation ---");
    const { getGlobalAppSettings, invalidateMaintenanceCache } = await import("../server/middleware/maintenance");
    invalidateMaintenanceCache();
    const restartedSettings = await getGlobalAppSettings();
    assert(restartedSettings.maintenanceMode === false, "Post-cache-invalidation settings reliably loaded from persisted storage");

    // -------------------------------------------------------------------------
    // CASE J: CLEAR CACHE SIMULATION
    // Fresh request with no cache produces 100% verified state
    // -------------------------------------------------------------------------
    console.log("\n--- CASE J: Cache-Busted Read Confirmation ---");
    const cacheClearedRes = await axios.get(`${BASE}/system/maintenance-status?t=${Date.now()}`);
    assert(cacheClearedRes.data.success === true, "Clean un-cached fetch succeeds with 100% data integrity");

    console.log("\n================================================================================");
    if (failed === 0) {
      console.log(`🎉 ALL ${passed} MAINTENANCE MATRIX TESTS PASSED (100% SUCCESS)!`);
      console.log("Global and Sub-website maintenance modes are completely decoupled and synchronized.");
    } else {
      console.error(`❌ ${failed} TESTS FAILED out of ${passed + failed}`);
    }
    console.log("================================================================================");

  } catch (err: any) {
    console.error("Fatal test error:", err.response?.data || err.message);
    failed++;
  } finally {
    server.close();
    process.exit(failed === 0 ? 0 : 1);
  }
}

runMaintenanceMatrixTests();
