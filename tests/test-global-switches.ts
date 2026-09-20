import axios from "axios";
import { createApp } from "../server/app";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || "https://mpeedjoyvimegnmymweb.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);

async function testGlobalKillSwitches() {
  console.log("==================================================================");
  console.log("🔒 TESTING LIVE GLOBAL SWITCHES: WEBSITE & SUB-WEBSITES OFF/ON");
  console.log("==================================================================");

  const app = createApp();
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const BASE = `http://localhost:${port}/api/v1`;

  let allPassed = true;
  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      allPassed = false;
    }
  }

  try {
    // ------------------------------------------------------------------
    // TEST 1: ADMIN TRIGGERS WEBSITE / MOVIE BOOKING MAINTENANCE "OFF"
    // ------------------------------------------------------------------
    console.log("\n--- STEP 1: Admin Triggers Global Website Maintenance (OFF) ---");
    const adminMaintOnRes = await axios.post(
      `${BASE}/admin/settings/global`,
      {
        maintenanceMode: true,
        maintenanceTitle: "Live Platform Upgrades in Progress",
        maintenanceMessage: "CineVenue is currently paused for scheduled updates. Check back in 30 mins."
      },
      {
        headers: { "x-admin-passcode": "8888" }
      }
    );
    assert(adminMaintOnRes.status === 200, "Admin POST /admin/settings/global executed with HTTP 200");

    // Verify in Supabase DB directly
    const { data: dbSettingsMaint } = await supabase
      .from("app_settings")
      .select("maintenance_mode, maintenance_title")
      .eq("id", "global_default")
      .single();
    assert(dbSettingsMaint?.maintenance_mode === true, "Supabase Database 'app_settings.maintenance_mode' is LIVE TRUE (Maintenance Active)");

    // Verify User / Mobile Client API GET /settings/app
    const clientSettingsRes = await axios.get(`${BASE}/settings/app?_cb=${Date.now()}`);
    assert(clientSettingsRes.data.data.maintenanceMode === true, "User Website / Mobile App receives maintenanceMode=true");

    // Verify Booking / Payment Gate blocks live booking attempt
    try {
      await axios.post(`${BASE}/payments/create-order`, { bookingId: "test_booking", amount: 500 });
      assert(false, "Booking gate should have blocked payment order with HTTP 503");
    } catch (err: any) {
      assert(err.response?.status === 503 && (err.response?.data?.code === "MOVIE_BOOKING_MAINTENANCE" || err.response?.data?.code === "PLATFORM_MAINTENANCE"), "Booking & Payment Gate blocked request with HTTP 503");
    }

    // ------------------------------------------------------------------
    // TEST 2: ADMIN RESTORES GLOBAL WEBSITE (ON)
    // ------------------------------------------------------------------
    console.log("\n--- STEP 2: Admin Restores Global Website (ON) ---");
    await axios.post(
      `${BASE}/admin/settings/global`,
      {
        maintenanceMode: false
      },
      {
        headers: { "x-admin-passcode": "8888" }
      }
    );
    const { data: dbSettingsRestored } = await supabase
      .from("app_settings")
      .select("maintenance_mode")
      .eq("id", "global_default")
      .single();
    assert(dbSettingsRestored?.maintenance_mode === false, "Supabase Database 'app_settings.maintenance_mode' restored to FALSE (Live Online)");

    // ------------------------------------------------------------------
    // TEST 3: ADMIN TRIGGERS ALL SUB-WEBSITES OFF
    // ------------------------------------------------------------------
    console.log("\n--- STEP 3: Admin Triggers Global Sub-Websites Switch (OFF) ---");
    const adminSubOffRes = await axios.post(
      `${BASE}/admin/settings/subwebsite`,
      {
        enabled: false,
        message: "All CineVenue sub-websites are temporarily paused by management."
      },
      {
        headers: { "x-admin-passcode": "8888" }
      }
    );
    assert(adminSubOffRes.status === 200, "Admin POST /admin/settings/subwebsite executed with HTTP 200");

    // Verify in Supabase DB directly
    const { data: dbSettingsSub } = await supabase
      .from("app_settings")
      .select("global_subwebsite_enabled, subwebsite_maintenance_message")
      .eq("id", "global_default")
      .single();
    assert(dbSettingsSub?.global_subwebsite_enabled === false, "Supabase Database 'app_settings.global_subwebsite_enabled' is LIVE FALSE (Sub-Websites OFF)");

    // Verify Sub-website API Gate blocks sub-website requests with HTTP 503
    try {
      await axios.get(`http://localhost:${port}/api/v1/events/categories`);
      assert(false, "Subwebsite gate should have blocked /events request with HTTP 503");
    } catch (err: any) {
      assert(err.response?.status === 503 && err.response?.data?.subWebsiteEnabled === false, "Sub-website Gate blocked request with HTTP 503 { subWebsiteEnabled: false }");
    }

    // ------------------------------------------------------------------
    // TEST 4: ADMIN RESTORES ALL SUB-WEBSITES (ON)
    // ------------------------------------------------------------------
    console.log("\n--- STEP 4: Admin Restores Global Sub-Websites (ON) ---");
    await axios.post(
      `${BASE}/admin/settings/subwebsite`,
      {
        enabled: true
      },
      {
        headers: { "x-admin-passcode": "8888" }
      }
    );
    const { data: dbSettingsSubRestored } = await supabase
      .from("app_settings")
      .select("global_subwebsite_enabled")
      .eq("id", "global_default")
      .single();
    assert(dbSettingsSubRestored?.global_subwebsite_enabled === true, "Supabase Database 'app_settings.global_subwebsite_enabled' restored to TRUE (Live Online)");

    console.log("\n==================================================================");
    if (allPassed) {
      console.log("🎉 ALL GLOBAL SWITCH TESTS PASSED 100%!");
      console.log("Website Trigger OFF and Sub-websites Trigger OFF reflect immediately across Backend, Supabase DB, and all Clients!");
    } else {
      console.error("❌ SOME GLOBAL SWITCH TESTS FAILED");
    }
    console.log("==================================================================");

  } catch (error: any) {
    console.error("Test error:", error.response?.data || error.message);
    allPassed = false;
  } finally {
    server.close();
    process.exit(allPassed ? 0 : 1);
  }
}

testGlobalKillSwitches();
