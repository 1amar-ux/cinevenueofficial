import { createApp } from "../server/app";
import http from "http";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { setTestMaintenanceState } from "../server/middleware/maintenance";

dotenv.config();

// Ensure test runner starts with normal operational state
setTestMaintenanceState({
  globalSubwebsiteEnabled: true,
  maintenanceMode: false,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function runDeepLiveDataFlowDebug() {
  console.log("==================================================================");
  console.log("🔍 DEEP LIVE DATA-FLOW TRACE: ADMIN → API → DB → GET → ALL CLIENTS");
  console.log("==================================================================\n");

  const app = createApp();
  const server = http.createServer(app);

  const PORT = 49302;
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const BASE = `http://localhost:${PORT}/api/v1`;
  console.log(`Backend Active: ${BASE}`);
  console.log(`Supabase DB: ${process.env.SUPABASE_URL}\n`);

  let allPassed = true;

  function assert(condition: boolean, desc: string, details?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${desc}`);
    } else {
      console.error(`  ❌ FAIL: ${desc}`, details || "");
      allPassed = false;
    }
  }

  try {
    // ------------------------------------------------------------------
    // TEST TRACE 1: Admin Changes ONE Existing Movie
    // Target: "Kalki 2898 AD" (ID: "mov_1789542880345")
    // ------------------------------------------------------------------
    console.log("--- TRACE 1: Admin Updates Existing Movie Rating & Description ---");
    
    // Step 1a: Check original DB state
    const { data: origMovieDb } = await supabase
      .from("Movie")
      .select("id, title, rating, description")
      .eq("id", "mov_1789542880345")
      .single();
    console.log(`  Current DB State for "${origMovieDb?.title}": rating=${origMovieDb?.rating}`);

    const newRating = 9.3;
    const testUpdatedDesc = `Updated by Admin Live Trace at ${new Date().toISOString()}`;

    // Step 1b: Admin Panel executes PUT /movies/:id with admin credentials
    console.log(`  [Step 1] /adminpanel issues PUT /movies/mov_1789542880345 (rating=${newRating})`);
    const adminMoviePutRes = await axios.put(
      `${BASE}/movies/mov_1789542880345`,
      {
        title: "Kalki 2898 AD",
        rating: newRating,
        description: testUpdatedDesc,
        duration: 180,
        genre: "Action, Sci-Fi",
        language: "Telugu"
      },
      {
        headers: {
          "x-admin-passcode": "8888",
          "Origin": "https://cinevenue.com"
        }
      }
    );
    assert(adminMoviePutRes.status === 200 && adminMoviePutRes.data.success, "Admin PUT /movies/:id returned HTTP 200 Success");

    // Step 1c: Verify directly in Supabase Production PostgreSQL Database
    console.log("  [Step 2] Directly querying Production Supabase Database table 'Movie'");
    const { data: verifiedMovieDb } = await supabase
      .from("Movie")
      .select("id, title, rating, description")
      .eq("id", "mov_1789542880345")
      .single();
    assert(Number(verifiedMovieDb?.rating) === newRating, `Supabase DB record updated! Verified rating=${verifiedMovieDb?.rating}`);
    assert(verifiedMovieDb?.description === testUpdatedDesc, `Supabase DB description matches admin update`);

    // Step 1d: Make a fresh unauthenticated GET request (Normal Browser / Incognito / Mobile)
    console.log("  [Step 3] Fresh GET API request from unauthenticated Incognito browser session");
    const incognitoMovieGet = await axios.get(`${BASE}/movies`, {
      headers: { "Cache-Control": "no-cache" }
    });
    const incognitoTargetMovie = incognitoMovieGet.data.data.movies.find((m: any) => m.id === "mov_1789542880345");
    assert(Number(incognitoTargetMovie?.rating) === newRating, `Incognito client receives live updated rating (${incognitoTargetMovie?.rating}) from DB`);

    // Step 1e: Mobile Native Android & iOS requests
    console.log("  [Step 4] Native Android App request (Origin: https://localhost)");
    const androidMovieGet = await axios.get(`${BASE}/movies`, {
      headers: { "Origin": "https://localhost", "Cache-Control": "no-cache" }
    });
    const androidTargetMovie = androidMovieGet.data.data.movies.find((m: any) => m.id === "mov_1789542880345");
    assert(Number(androidTargetMovie?.rating) === newRating, `Android App receives live updated rating (${androidTargetMovie?.rating})`);

    console.log("  [Step 5] Native iOS App request (Origin: capacitor://localhost)");
    const iosMovieGet = await axios.get(`${BASE}/movies`, {
      headers: { "Origin": "capacitor://localhost", "Cache-Control": "no-cache" }
    });
    const iosTargetMovie = iosMovieGet.data.data.movies.find((m: any) => m.id === "mov_1789542880345");
    assert(Number(iosTargetMovie?.rating) === newRating, `iOS App receives live updated rating (${iosTargetMovie?.rating})`);

    // Restore original movie rating in DB
    await supabase.from("Movie").update({ rating: origMovieDb?.rating || 8.9, description: origMovieDb?.description }).eq("id", "mov_1789542880345");
    console.log("  Cleaned up: Restored original movie rating in DB\n");

    // ------------------------------------------------------------------
    // TEST TRACE 2: Admin Changes ONE Existing Theatre
    // Target: "PVR Nexus" (ID: "th_1")
    // ------------------------------------------------------------------
    console.log("--- TRACE 2: Admin Updates Existing Theatre Specs & Address ---");
    const testNewAddress = `Kukatpally Luxury Multiplex (Updated ${Date.now()})`;

    console.log("  [Step 1] /adminpanel issues PUT /theatres/th_1 with updated address");
    const adminTheatrePutRes = await axios.put(
      `${BASE}/theatres/th_1`,
      {
        name: "PVR Nexus",
        city: "Hyderabad",
        address: testNewAddress,
        location: testNewAddress,
        facilities: ["4K Laser", "Dolby Atmos", "Luxury Recliner", "VIP Butler Service"]
      },
      {
        headers: { "x-admin-passcode": "8888", "Origin": "https://cinevenue.com" }
      }
    );
    assert(adminTheatrePutRes.status === 200 && adminTheatrePutRes.data.success, "Admin PUT /theatres/:id returned HTTP 200 Success");

    console.log("  [Step 2] Directly querying Production Supabase Database table 'Theatre'");
    const { data: verifiedTheatreDb } = await supabase
      .from("Theatre")
      .select("id, name, address, city")
      .eq("id", "th_1")
      .single();
    assert(verifiedTheatreDb?.address === testNewAddress, `Supabase DB record updated! Verified address="${verifiedTheatreDb?.address}"`);

    console.log("  [Step 3] Fresh GET /theatres from Incognito / Mobile");
    const freshTheatresGet = await axios.get(`${BASE}/theatres`, {
      headers: { "Cache-Control": "no-cache" }
    });
    const freshTheatre = freshTheatresGet.data.data.theatres.find((t: any) => t.id === "th_1");
    assert(freshTheatre?.address === testNewAddress, `Incognito / User website receives updated theatre address`);

    // Restore original theatre address
    await supabase.from("Theatre").update({ address: "Hyderabad · Kukatpally" }).eq("id", "th_1");
    console.log("  Cleaned up: Restored original theatre address in DB\n");

    // ------------------------------------------------------------------
    // TEST TRACE 3: Admin Changes Show Schedule (Showtime & Price)
    // Target: "shw_th_1_1030AM"
    // ------------------------------------------------------------------
    console.log("--- TRACE 3: Admin Updates Show Showtime & Ticket Price ---");
    const newPrice = 350;

    console.log("  [Step 1] /adminpanel issues PUT /shows/shw_th_1_1030AM with price=350, timeSlot=11:45 AM");
    const adminShowPutRes = await axios.put(
      `${BASE}/shows/shw_th_1_1030AM`,
      {
        timeSlot: "11:45 AM",
        date: "2026-09-16",
        price: newPrice,
        pricePerSeat: newPrice
      },
      {
        headers: { "x-admin-passcode": "8888", "Origin": "https://cinevenue.com" }
      }
    );
    assert(adminShowPutRes.status === 200 && adminShowPutRes.data.success, "Admin PUT /shows/:id returned HTTP 200 Success");

    console.log("  [Step 2] Directly querying Production Supabase Database table 'Show' and 'ShowSeat'");
    const { data: verifiedShowDb } = await supabase
      .from("Show")
      .select("id, startTime")
      .eq("id", "shw_th_1_1030AM")
      .single();
    assert(new Date(verifiedShowDb?.startTime).getHours() === 11, `Supabase DB 'Show' startTime updated to 11:45 AM!`);

    const { data: verifiedSeatsDb } = await supabase
      .from("ShowSeat")
      .select("price")
      .eq("showId", "shw_th_1_1030AM")
      .limit(1);
    if (verifiedSeatsDb && verifiedSeatsDb.length > 0) {
      assert(Number(verifiedSeatsDb[0].price) === newPrice, `Supabase DB 'ShowSeat' price updated to ₹${newPrice}!`);
    }

    console.log("  [Step 3] Fresh GET /shows from Incognito / User Website");
    const freshShowsGet = await axios.get(`${BASE}/shows`, {
      headers: { "Cache-Control": "no-cache" }
    });
    const freshShow = freshShowsGet.data.data.shows.find((s: any) => s.id === "shw_th_1_1030AM");
    assert(new Date(freshShow?.startTime).getHours() === 11, `User website reads updated 11:45 AM showtime directly from API`);

    // Restore original showtime
    await supabase.from("Show").update({ startTime: "2026-09-16T10:30:00" }).eq("id", "shw_th_1_1030AM");
    console.log("  Cleaned up: Restored original showtime in DB\n");

    console.log("==================================================================");
    if (allPassed) {
      console.log("🎉 ALL DEEP DATA-FLOW TESTS PASSED 100%!");
      console.log("Data flows seamlessly: AdminPanel → API → Supabase DB → GET → Normal/Incognito/Android/iOS");
    } else {
      console.error("❌ SOME TRACE TESTS FAILED");
    }
    console.log("==================================================================");

  } catch (error: any) {
    console.error("Trace Execution Error:", error.response?.data || error.message);
    allPassed = false;
  } finally {
    server.close();
    process.exit(allPassed ? 0 : 1);
  }
}

runDeepLiveDataFlowDebug();
