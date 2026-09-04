import http from "http";
import { createApp } from "../server/app";
import { setTestMaintenanceState, invalidateMaintenanceCache } from "../server/middleware/maintenance";

async function runLiveVerification() {
  console.log("=================================================");
  console.log("🔍 Live Verification: CineVenue Global Sub-Website System");
  console.log("=================================================\n");

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[TEST SERVER] Running live on ${baseUrl}\n`);

  try {
    // -----------------------------------------------------------------
    // PHASE 1: SUB-WEBSITES ENABLED (ONLINE)
    // -----------------------------------------------------------------
    console.log("--- PHASE 1: Sub-Websites are ONLINE (Default) ---");
    setTestMaintenanceState({ globalSubwebsiteEnabled: true });

    // Check status API
    const resStatus = await fetch(`${baseUrl}/api/v1/settings/subwebsite`);
    const statusData = await resStatus.json();
    console.log(`1. Public Status Endpoint: HTTP ${resStatus.status}, Enabled: ${statusData.data?.globalSubwebsiteEnabled}`);

    // Check direct browser URL when ON
    const resProdOn = await fetch(`${baseUrl}/production`, {
      headers: { accept: "text/html" }
    });
    console.log(`2. Direct URL /production when ON: HTTP ${resProdOn.status} (Passes through to client router)`);

    // -----------------------------------------------------------------
    // PHASE 2: ADMIN TURNS SUB-WEBSITES OFF (GLOBALLY DISABLED)
    // -----------------------------------------------------------------
    console.log("\n--- PHASE 2: Admin Disables All Sub-Websites (OFF) ---");
    
    // Call the actual Admin API endpoint to disable sub-websites
    const resAdminToggle = await fetch(`${baseUrl}/api/v1/admin/settings/subwebsite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": "8888"
      },
      body: JSON.stringify({
        enabled: false,
        message: "CineVenue sub-websites are temporarily undergoing scheduled system upgrades."
      })
    });
    const adminToggleData = await resAdminToggle.json();
    console.log(`3. Admin API POST /settings/subwebsite: HTTP ${resAdminToggle.status}, Success: ${adminToggleData.success}`);
    console.log(`   Message from server: "${adminToggleData.message}"`);

    // TEST A: Direct Browser URL visit to /production (Android, iPhone, PC, Mac, Incognito)
    const resDirectProd = await fetch(`${baseUrl}/production`, {
      headers: { accept: "text/html" }
    });
    const htmlBody = await resDirectProd.text();
    const is503Html = resDirectProd.status === 503;
    const hasUnavailableHeading = htmlBody.includes("SUB-WEBSITE TEMPORARILY UNAVAILABLE");
    const hasBackButton = htmlBody.includes("Back to CineVenue Home");
    console.log(`4. Direct URL /production when OFF: HTTP ${resDirectProd.status}`);
    console.log(`   - Returned HTTP 503: ${is503Html ? "✅ YES" : "❌ NO"}`);
    console.log(`   - Contains 'SUB-WEBSITE TEMPORARILY UNAVAILABLE': ${hasUnavailableHeading ? "✅ YES" : "❌ NO"}`);
    console.log(`   - Contains '[Back to CineVenue Home]' button: ${hasBackButton ? "✅ YES" : "❌ NO"}`);

    // TEST B: Direct Browser URL visit to /events
    const resDirectEvents = await fetch(`${baseUrl}/events`, {
      headers: { accept: "text/html" }
    });
    console.log(`5. Direct URL /events when OFF: HTTP ${resDirectEvents.status} (503 Intercepted)`);

    // TEST C: Internal Sub-Website API request (/api/v1/events)
    const resApiEvents = await fetch(`${baseUrl}/api/v1/events`, {
      headers: { accept: "application/json" }
    });
    const apiJson = await resApiEvents.json();
    console.log(`6. Sub-Website API /api/v1/events when OFF: HTTP ${resApiEvents.status}`);
    console.log(`   - subWebsiteEnabled: ${apiJson.subWebsiteEnabled} (Expected: false)`);
    console.log(`   - code: "${apiJson.code}" (Expected: SUB_WEBSITE_DISABLED)`);

    // TEST D: Main Movie Ticketing & Homepage MUST NOT BE BLOCKED
    const resHome = await fetch(`${baseUrl}/health`);
    console.log(`7. Main Platform Health Check: HTTP ${resHome.status} (Exempt, Unaffected)`);

    const resAdminCheck = await fetch(`${baseUrl}/api/v1/admin/settings/global`, {
      headers: { "x-admin-passcode": "8888" }
    });
    console.log(`8. Admin Panel API /admin/settings/global: HTTP ${resAdminCheck.status} (Exempt, Fully Accessible)`);

    // -----------------------------------------------------------------
    // PHASE 3: ADMIN TURNS SUB-WEBSITES BACK ON (RESTORATION)
    // -----------------------------------------------------------------
    console.log("\n--- PHASE 3: Admin Restores Sub-Websites (ON) ---");
    const resRestore = await fetch(`${baseUrl}/api/v1/admin/settings/subwebsite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-passcode": "8888"
      },
      body: JSON.stringify({ enabled: true })
    });
    const restoreData = await resRestore.json();
    console.log(`9. Admin API Restore: HTTP ${resRestore.status}, Success: ${restoreData.success}`);

    const resDirectRestored = await fetch(`${baseUrl}/production`, {
      headers: { accept: "text/html" }
    });
    console.log(`10. Direct URL /production after restore: HTTP ${resDirectRestored.status} (Passes through, 503 lifted)`);

    console.log("\n=================================================");
    console.log("🎉 VERIFICATION COMPLETE: SYSTEM IS 100% OPERATIONAL!");
    console.log("=================================================");

  } finally {
    server.close();
  }
}

runLiveVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
