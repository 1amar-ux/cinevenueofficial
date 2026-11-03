import { INITIAL_MOVIES, INITIAL_THEATRES } from "../src/data";
import { getPrimaryMovieTrailer } from "../src/utils/movieAvailability";

function verifyBaththaAndSeats() {
  console.log("================================================================================");
  console.log("VERIFY BATHTHA METADATA, POSTER, TRAILER & NORMAL TIERED PRICING");
  console.log("================================================================================\n");

  let passed = 0;
  const total = 5;

  const movie = INITIAL_MOVIES.find((m) => m.title.toLowerCase() === "baththa");
  if (!movie) {
    console.error("✗ Movie Baththa not found in INITIAL_MOVIES");
    process.exit(1);
  }

  // 1. Verify Cast & Crew
  console.log("[TEST 1/5] Cast & Crew Retrieval for 'Baththa'");
  const hasVijaySethupathi = movie.castMembers?.some((c) => c.name.includes("Vijay Sethupathi"));
  const hasSaiPrithviraj = movie.castMembers?.some((c) => c.name.includes("Sai Prithviraj"));
  const hasBalaji = movie.director === "Balaji Tharaneetharan" || movie.crewMembers?.some((c) => c.name.includes("Balaji"));
  const hasSaiAbhyankkar = movie.crewMembers?.some((c) => c.name.includes("Sai Abhyankkar"));
  const hasAtlee = movie.crewMembers?.some((c) => c.name.includes("Atlee"));

  if (hasVijaySethupathi && hasSaiPrithviraj && hasBalaji && hasSaiAbhyankkar && hasAtlee) {
    console.log(`  ✓ Director: ${movie.director}`);
    console.log(`  ✓ Lead Actor: Vijay Sethupathi (${movie.castMembers?.[0].character})`);
    console.log(`  ✓ Child Lead: Master Sai Prithviraj (${movie.castMembers?.[1].character})`);
    console.log(`  ✓ Music: Sai Abhyankkar, Presenter: Atlee`);
    console.log(`  ✓ Total Cast Members: ${movie.castMembers?.length}, Crew Members: ${movie.crewMembers?.length}`);
    passed++;
  } else {
    console.error("  ✗ Cast/Crew verification failed");
  }

  // 2. Verify Official Poster & Trailer Media
  console.log("\n[TEST 2/5] Official Poster & YouTube Trailer Media");
  const trailer = getPrimaryMovieTrailer(movie);
  const correctYoutubeId = "fLnMzPk_p_M";
  const hasLocalPoster = movie.poster === "/baththa-poster.jpg" || movie.img === "/baththa-poster.jpg";

  if (hasLocalPoster && movie.trailerUrl?.includes(correctYoutubeId) && (trailer?.youtubeVideoId === correctYoutubeId || trailer?.youtubeUrl?.includes(correctYoutubeId))) {
    console.log(`  ✓ Official Poster Path: ${movie.poster}`);
    console.log(`  ✓ Official Trailer URL: ${movie.trailerUrl}`);
    console.log(`  ✓ YouTube Video ID: ${trailer?.youtubeVideoId || correctYoutubeId}`);
    passed++;
  } else {
    console.error(`  ✗ Poster or Trailer mismatch: Poster=${movie.poster}, Trailer=${movie.trailerUrl}`);
  }

  // 3. Verify Expanded Seat Count (140 Seats)
  console.log("\n[TEST 3/5] Expanded Theatre Seating Capacity");
  const theatre = INITIAL_THEATRES[0];
  const totalRows = theatre.seatRows?.length || 0;
  const seatsPerRow = theatre.seatsPerRow || 0;
  const totalSeats = totalRows * seatsPerRow;

  if (totalSeats >= 140 && totalRows === 10 && seatsPerRow === 14) {
    console.log(`  ✓ Theatre: "${theatre.name}"`);
    console.log(`  ✓ Seat Matrix: ${totalRows} Rows (A-K) × ${seatsPerRow} Columns = ${totalSeats} Total Seats`);
    passed++;
  } else {
    console.error(`  ✗ Seat expansion failed: got ${totalSeats} seats (${totalRows} x ${seatsPerRow})`);
  }

  // 4. Verify Seat Tiers & Sections
  console.log("\n[TEST 4/5] Seat Tiers & Multiplex Sections (Classic, Prime, Recliner)");
  const reclinerCount = theatre.reclinerSeats?.length || 0;
  const premiumCount = (theatre.premiumRows?.length || 0) * seatsPerRow;
  const classicCount = totalSeats - reclinerCount - premiumCount;

  if (reclinerCount === 28 && premiumCount === 56 && classicCount === 56) {
    console.log(`  ✓ Luxury Recliners (Rows J, K): ${reclinerCount} seats`);
    console.log(`  ✓ Prime / Elite (Rows E, F, G, H): ${premiumCount} seats`);
    console.log(`  ✓ Classic (Rows A, B, C, D): ${classicCount} seats`);
    passed++;
  } else {
    console.error(`  ✗ Seat tiers mismatch: Recliners=${reclinerCount}, Prime=${premiumCount}, Classic=${classicCount}`);
  }

  // 5. Verify Normal Multiplex Pricing (No flat ₹10 sandbox pricing)
  console.log("\n[TEST 5/5] Normal Multiplex Pricing & Slabs");
  const classicPrice = theatre.seatPrices?.["A"] || 0;
  const primePrice = theatre.seatPrices?.["E"] || 0;
  const reclinerPrice = theatre.seatPrices?.["J"] || 0;

  if (classicPrice === 150 && primePrice === 220 && reclinerPrice === 350 && movie.price === 150) {
    console.log(`  ✓ Standard Movie Base Price: ₹${movie.price}`);
    console.log(`  ✓ Classic Tier Price: ₹${classicPrice}`);
    console.log(`  ✓ Prime / Elite Tier Price: ₹${primePrice}`);
    console.log(`  ✓ Luxury Recliner Tier Price: ₹${reclinerPrice}`);
    console.log(`  ✓ Flat ₹10 testing price completely removed in favor of real cinema prices.`);
    passed++;
  } else {
    console.error(`  ✗ Normal pricing mismatch: Classic=${classicPrice}, Prime=${primePrice}, Recliner=${reclinerPrice}`);
  }

  console.log("\n================================================================================");
  console.log(`RESULT: ${passed}/${total} TESTS PASSED`);
  console.log("================================================================================\n");

  if (passed !== total) process.exit(1);
}

verifyBaththaAndSeats();
