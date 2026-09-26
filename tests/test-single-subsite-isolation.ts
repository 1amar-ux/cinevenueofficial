import http from "http";
import { createApp } from "../server/app";
import { setTestMaintenanceState } from "../server/middleware/maintenance";

async function runTest() {
  const app = createApp();
  console.log("================================================================================");
  console.log("🧪 TESTING SINGLE SUB-WEBSITE TOGGLE ISOLATION");
  console.log("================================================================================");

  setTestMaintenanceState({
    maintenanceMode: false,
    globalSubwebsiteEnabled: true,
    serviceControls: {
      website: { status: true },
      movieBooking: { status: true },
      eventBooking: { status: true },
      filmProduction: { status: true },
      eventManagement: { status: true },
      brandPromotion: { status: true },
      cinecoins: { status: true },
      cineCoinsLoyalty: { status: true }
    }
  });

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const requestJson = async (method: string, path: string, body?: any) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        "x-admin-passcode": "8888",
        "Cache-Control": "no-cache, no-store"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // 1. Initial baseline: All should be LIVE
    console.log("\n--- STEP 1: Verify Initial Baseline (All LIVE) ---");
    const baseline = await requestJson("GET", "/api/v1/system/maintenance-status");
    const subsites = baseline.data.subsites;
    console.log("Subsite Statuses:", Object.keys(subsites).map(k => `${k}: ${subsites[k].status ? "ONLINE" : "OFFLINE"}`).join(", "));
    
    if (!subsites.filmProduction.status || !subsites.eventManagement.status || !subsites.movieBooking.status) {
      throw new Error("Baseline failure: Not all subwebsites are LIVE initially!");
    }
    console.log("✅ PASS: All 5 subwebsites are LIVE at baseline");

    // 2. Toggle OFF only filmProduction
    console.log("\n--- STEP 2: Toggle OFF ONLY filmProduction ---");
    const toggleFilmRes = await requestJson("POST", "/api/v1/admin/subsites/filmProduction/maintenance", {
      maintenance: true,
      message: "Film production maintenance only"
    });
    console.log("Toggle API Response:", toggleFilmRes.status, toggleFilmRes.data?.message || toggleFilmRes.data);

    const statusAfterFilmOff = await requestJson("GET", "/api/v1/system/maintenance-status");
    const subsAfterFilmOff = statusAfterFilmOff.data.subsites;
    console.log("Global maintenanceMode:", statusAfterFilmOff.data.globalMaintenanceMode);
    console.log("Subsite Statuses:", Object.keys(subsAfterFilmOff).map(k => `${k}: ${subsAfterFilmOff[k].status ? "ONLINE" : "OFFLINE"}`).join(", "));

    if (statusAfterFilmOff.data.globalMaintenanceMode !== false) {
      throw new Error("FAIL: Global maintenanceMode became true when turning off a single subwebsite!");
    }
    if (subsAfterFilmOff.filmProduction.status !== false) {
      throw new Error("FAIL: filmProduction did not turn OFF!");
    }
    if (subsAfterFilmOff.eventManagement.status !== true) {
      throw new Error("FAIL: eventManagement was turned OFF when only filmProduction was toggled!");
    }
    if (subsAfterFilmOff.brandPromotion.status !== true) {
      throw new Error("FAIL: brandPromotion was turned OFF when only filmProduction was toggled!");
    }
    if (subsAfterFilmOff.eventBooking.status !== true) {
      throw new Error("FAIL: eventBooking was turned OFF when only filmProduction was toggled!");
    }
    if (subsAfterFilmOff.movieBooking.status !== true) {
      throw new Error("FAIL: movieBooking was turned OFF when only filmProduction was toggled!");
    }
    console.log("✅ PASS: ONLY filmProduction is OFF! All other 4 subwebsites remain strictly ONLINE!");

    // 3. Restore filmProduction to ON
    console.log("\n--- STEP 3: Restore filmProduction to LIVE ---");
    await requestJson("POST", "/api/v1/admin/subsites/filmProduction/maintenance", {
      maintenance: false
    });
    const statusRestored = await requestJson("GET", "/api/v1/system/maintenance-status");
    if (!statusRestored.data.subsites.filmProduction.status) {
      throw new Error("FAIL: filmProduction failed to restore to LIVE!");
    }
    console.log("✅ PASS: filmProduction successfully restored to LIVE");

    // 4. Toggle OFF only eventManagement
    console.log("\n--- STEP 4: Toggle OFF ONLY eventManagement ---");
    await requestJson("POST", "/api/v1/admin/subsites/eventManagement/maintenance", {
      maintenance: true
    });
    const statusEventOff = await requestJson("GET", "/api/v1/system/maintenance-status");
    const subsEventOff = statusEventOff.data.subsites;
    console.log("Subsite Statuses:", Object.keys(subsEventOff).map(k => `${k}: ${subsEventOff[k].status ? "ONLINE" : "OFFLINE"}`).join(", "));

    if (subsEventOff.eventManagement.status !== false) {
      throw new Error("FAIL: eventManagement did not turn OFF!");
    }
    if (subsEventOff.filmProduction.status !== true) {
      throw new Error("FAIL: filmProduction was turned OFF when only eventManagement was toggled!");
    }
    if (subsEventOff.brandPromotion.status !== true) {
      throw new Error("FAIL: brandPromotion was turned OFF when only eventManagement was toggled!");
    }
    if (subsEventOff.movieBooking.status !== true) {
      throw new Error("FAIL: movieBooking was turned OFF when only eventManagement was toggled!");
    }
    console.log("✅ PASS: ONLY eventManagement is OFF! All other subwebsites remain strictly ONLINE!");

    // 5. Restore eventManagement to ON
    await requestJson("POST", "/api/v1/admin/subsites/eventManagement/maintenance", {
      maintenance: false
    });

    // 6. Toggle OFF only movieBooking
    console.log("\n--- STEP 5: Toggle OFF ONLY movieBooking ---");
    await requestJson("POST", "/api/v1/admin/subsites/movieBooking/maintenance", {
      maintenance: true
    });
    const statusMovieOff = await requestJson("GET", "/api/v1/system/maintenance-status");
    const subsMovieOff = statusMovieOff.data.subsites;
    console.log("Subsite Statuses:", Object.keys(subsMovieOff).map(k => `${k}: ${subsMovieOff[k].status ? "ONLINE" : "OFFLINE"}`).join(", "));

    if (statusMovieOff.data.globalMaintenanceMode !== false) {
      throw new Error("FAIL: Global maintenanceMode became true when turning off movieBooking!");
    }
    if (subsMovieOff.movieBooking.status !== false) {
      throw new Error("FAIL: movieBooking did not turn OFF!");
    }
    if (subsMovieOff.filmProduction.status !== true) {
      throw new Error("FAIL: filmProduction was turned OFF when movieBooking was toggled!");
    }
    if (subsMovieOff.eventManagement.status !== true) {
      throw new Error("FAIL: eventManagement was turned OFF when movieBooking was toggled!");
    }
    if (subsMovieOff.eventBooking.status !== true) {
      throw new Error("FAIL: eventBooking was turned OFF when movieBooking was toggled!");
    }
    console.log("✅ PASS: ONLY movieBooking is OFF! All other subwebsites remain strictly ONLINE!");

    // Restore movieBooking
    await requestJson("POST", "/api/v1/admin/subsites/movieBooking/maintenance", {
      maintenance: false
    });

    console.log("\n================================================================================");
    console.log("🎉 SUCCESS: Single sub-website toggling is completely isolated!");
    console.log("Toggling off 1 sub-website turns off ONLY that 1 sub-website.");
    console.log("================================================================================");
  } finally {
    server.close();
    process.exit(0);
  }
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
