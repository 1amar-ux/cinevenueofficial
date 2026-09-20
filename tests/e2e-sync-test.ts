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

async function runE2ESyncTests() {
  console.log("=================================================");
  console.log("🎬 CineVenue End-to-End Point-to-Point Sync Test");
  console.log("=================================================\n");

  const app = createApp();
  const server = http.createServer(app);

  const PORT = 49201;
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  const BASE = `http://localhost:${PORT}/api/v1`;
  console.log(`Unified Test Server active on ${BASE}`);

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
    // ----------------------------------------------------
    // TEST 1: Cache-Control & CORS Headers
    // ----------------------------------------------------
    console.log("\n--- TEST 1: Cache-Control & CORS Inspection ---");
    const moviesRes = await axios.get(`${BASE}/movies`, {
      headers: { Origin: "https://cinevenue.com" }
    });
    const cacheHeader = String(moviesRes.headers["cache-control"] || "");
    assert(cacheHeader.includes("no-store") || cacheHeader.includes("no-cache"), `GET /movies has strict no-cache header: "${cacheHeader}"`);
    assert(moviesRes.headers["access-control-allow-origin"] === "https://cinevenue.com" || moviesRes.headers["access-control-allow-origin"] === "*", "CORS origin allowed for https://cinevenue.com");

    const capacitorRes = await axios.get(`${BASE}/theatres`, {
      headers: { Origin: "capacitor://localhost" }
    });
    assert(capacitorRes.headers["access-control-allow-origin"] === "capacitor://localhost" || capacitorRes.headers["access-control-allow-origin"] === "*", "CORS origin allowed for Capacitor Native Android/iOS");

    // ----------------------------------------------------
    // TEST 2: Unauthenticated Incognito / Fresh Browser Read
    // ----------------------------------------------------
    console.log("\n--- TEST 2: Incognito / Fresh Browser Unauthenticated Read ---");
    const freshMovies = await axios.get(`${BASE}/movies`);
    assert(freshMovies.data.success === true && Array.isArray(freshMovies.data.data.movies), "Fresh browser reads live movies from API");
    console.log(`     Movies count from DB: ${freshMovies.data.data.movies.length}`);

    const freshTheatres = await axios.get(`${BASE}/theatres`);
    assert(freshTheatres.data.success === true && Array.isArray(freshTheatres.data.data.theatres), "Fresh browser reads live theatres from API");
    console.log(`     Theatres count from DB: ${freshTheatres.data.data.theatres.length}`);

    const freshEvents = await axios.get(`${BASE}/events`);
    assert(freshEvents.data.success === true && Array.isArray(freshEvents.data.data.events), "Fresh browser reads live events from API");
    console.log(`     Events count from DB: ${freshEvents.data.data.events.length}`);

    // ----------------------------------------------------
    // TEST 3: Admin Movie CRUD -> API -> Supabase DB Flow
    // ----------------------------------------------------
    console.log("\n--- TEST 3: Movie Admin CRUD -> Database Flow ---");
    const testMovieTitle = `E2E Test Movie ${Date.now()}`;
    const createMovieRes = await axios.post(
      `${BASE}/movies`,
      {
        title: testMovieTitle,
        description: "Test movie for point-to-point connection audit",
        duration: 145,
        durationMins: 145,
        rating: 9.1,
        genres: ["Action", "Sci-Fi"],
        languages: ["Telugu", "Hindi"],
        posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1"
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(createMovieRes.status === 201 && createMovieRes.data.success, "Admin creates movie via POST /movies");
    const createdMovieId = createMovieRes.data.data.movie.id;

    // Direct Supabase DB verification
    const { data: dbMovie } = await supabase.from("Movie").select("*").eq("id", createdMovieId).maybeSingle();
    assert(dbMovie && dbMovie.title === testMovieTitle, `Created movie verified in Supabase DB (ID: ${createdMovieId})`);

    // Update Movie
    const updateMovieRes = await axios.put(
      `${BASE}/movies/${createdMovieId}`,
      {
        title: `${testMovieTitle} (Updated)`,
        rating: 9.5
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(updateMovieRes.data.success === true, "Admin updates movie via PUT /movies/:id");

    const { data: dbUpdatedMovie } = await supabase.from("Movie").select("*").eq("id", createdMovieId).maybeSingle();
    assert(dbUpdatedMovie && dbUpdatedMovie.title === `${testMovieTitle} (Updated)`, "Updated title verified directly in Supabase DB");

    // Delete Movie
    const deleteMovieRes = await axios.delete(`${BASE}/movies/${createdMovieId}`, {
      headers: { "x-admin-passcode": "8888" }
    });
    assert(deleteMovieRes.data.success === true, "Admin deletes movie via DELETE /movies/:id");

    const { data: dbDeletedMovie } = await supabase.from("Movie").select("*").eq("id", createdMovieId).maybeSingle();
    assert(!dbDeletedMovie || dbDeletedMovie.isActive === false, "Deleted movie removed or deactivated in Supabase DB");

    // ----------------------------------------------------
    // TEST 4: Admin Theatre CRUD -> API -> Supabase DB Flow
    // ----------------------------------------------------
    console.log("\n--- TEST 4: Theatre Admin CRUD -> Database Flow ---");
    const testTheatreName = `E2E Test Theatre ${Date.now()}`;
    const createTheatreRes = await axios.post(
      `${BASE}/theatres`,
      {
        name: testTheatreName,
        city: "Hyderabad",
        address: "Hitec City, Hyderabad",
        totalScreens: 3,
        facilities: ["IMAX", "Dolby Atmos"]
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(createTheatreRes.status === 201 && createTheatreRes.data.success, "Admin creates theatre via POST /theatres");
    const createdTheatreId = createTheatreRes.data.data.theatre.id;

    // Verify in Supabase
    const { data: dbTheatre } = await supabase.from("Theatre").select("*").eq("id", createdTheatreId).maybeSingle();
    assert(dbTheatre && dbTheatre.name === testTheatreName, `Created theatre verified in Supabase DB (ID: ${createdTheatreId})`);

    // Update Theatre (including extra UI fields that used to crash PostgREST)
    const updateTheatreRes = await axios.put(
      `${BASE}/theatres/${createdTheatreId}`,
      {
        name: `${testTheatreName} (Remodeled)`,
        address: "Jubilee Hills, Hyderabad",
        totalScreens: 4,
        facilities: ["4K Projection", "Recliner"]
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(updateTheatreRes.data.success === true, "Admin updates theatre with UI fields safely via PUT /theatres/:id");

    const { data: dbUpdatedTheatre } = await supabase.from("Theatre").select("*").eq("id", createdTheatreId).maybeSingle();
    assert(dbUpdatedTheatre && dbUpdatedTheatre.name === `${testTheatreName} (Remodeled)`, "Updated theatre verified in Supabase DB");

    // Delete Theatre
    const deleteTheatreRes = await axios.delete(`${BASE}/theatres/${createdTheatreId}`, {
      headers: { "x-admin-passcode": "8888" }
    });
    assert(deleteTheatreRes.data.success === true, "Admin deletes theatre via DELETE /theatres/:id");

    const { data: dbDeletedTheatre } = await supabase.from("Theatre").select("*").eq("id", createdTheatreId).maybeSingle();
    assert(!dbDeletedTheatre || dbDeletedTheatre.status === "INACTIVE", "Deleted theatre removed/inactivated in Supabase DB");

    // ----------------------------------------------------
    // TEST 5: Show Creation from UI payload (Name & TimeSlot)
    // ----------------------------------------------------
    console.log("\n--- TEST 5: Show Creation via UI Payload ---");
    const createShowRes = await axios.post(
      `${BASE}/shows`,
      {
        movieTitle: "Kalki 2898 AD",
        theatreName: "PVR Nexus",
        startTime: "10:45 PM",
        timeSlot: "10:45 PM",
        price: 350,
        date: "Today"
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(createShowRes.status === 201 && createShowRes.data.success, "Admin schedules show using UI names & timeSlot");
    const createdShowId = createShowRes.data.data.show.id;

    const { data: dbShow } = await supabase.from("Show").select("*").eq("id", createdShowId).maybeSingle();
    assert(dbShow && dbShow.id === createdShowId, `Created show verified in Supabase DB (ID: ${createdShowId})`);

    // Delete Show
    const deleteShowRes = await axios.delete(`${BASE}/shows/${createdShowId}`, {
      headers: { "x-admin-passcode": "8888" }
    });
    assert(deleteShowRes.data.success === true, "Admin cancels show via DELETE /shows/:id");

    // ----------------------------------------------------
    // TEST 6: Event Creation -> Supabase DB Flow
    // ----------------------------------------------------
    console.log("\n--- TEST 6: Event Creation -> Database Flow ---");
    const testEventTitle = `E2E Gala Event ${Date.now()}`;
    const createEventRes = await axios.post(
      `${BASE}/events`,
      {
        title: testEventTitle,
        description: "Annual Live Gala with celebrity performances",
        city: "Hyderabad",
        venue: "Gachibowli Stadium",
        price: 999,
        capacity: 1000,
        category: "Concerts",
        time: "07:30 PM",
        ticketTypes: [
          { name: "Silver Pass", price: 999, capacity: 600 },
          { name: "Gold VIP", price: 2499, capacity: 400 }
        ]
      },
      { headers: { "x-admin-passcode": "8888" } }
    );
    assert(createEventRes.status === 201 && createEventRes.data.success, "Admin creates event with ticket types via POST /events");
    const createdEventId = createEventRes.data.data.event.id;

    const { data: dbEvent } = await supabase.from("Event").select("*").eq("id", createdEventId).maybeSingle();
    assert(dbEvent && dbEvent.title === testEventTitle, `Created event verified in Supabase DB (ID: ${createdEventId})`);

    // Clean up Event
    const deleteEventRes = await axios.delete(`${BASE}/events/${createdEventId}`, {
      headers: { "x-admin-passcode": "8888" }
    });
    assert(deleteEventRes.data.success === true, "Admin deletes event via DELETE /events/:id");

  } catch (err: any) {
    console.error("Test execution error:", err.response?.data || err.message);
    failed++;
  } finally {
    server.close();
  }

  console.log("\n=================================================");
  console.log(`Test Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ESyncTests().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
