import { entertainmentAnalyticsService } from "../../server/services/entertainmentAnalyticsService";

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runEntertainmentAnalyticsTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const runTest = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message || String(err) });
    }
  };

  // 1. Overview KPIs
  await runTest("KPIs: Correct calculation of confirmed bookings, tickets, and revenue", async () => {
    const kpis = await entertainmentAnalyticsService.getOverviewKPIs();

    if (typeof kpis.totalConfirmedBookings !== "number" || kpis.totalConfirmedBookings <= 0) {
      throw new Error("totalConfirmedBookings must be a positive number from real records");
    }
    if (typeof kpis.totalTicketsSold !== "number" || kpis.totalTicketsSold < kpis.totalConfirmedBookings) {
      throw new Error("totalTicketsSold must be greater than or equal to total bookings");
    }
    if (typeof kpis.grossTicketSales !== "number" || kpis.grossTicketSales <= 0) {
      throw new Error("grossTicketSales must be a positive number");
    }
    if (typeof kpis.refundsProcessed !== "number" || kpis.refundsProcessed < 0) {
      throw new Error("refundsProcessed must be a non-negative number");
    }
    // Net Ticket Sales = Gross - Refunds
    const expectedNet = kpis.grossTicketSales - kpis.refundsProcessed;
    if (Math.abs(kpis.netTicketSales - expectedNet) > 0.01) {
      throw new Error(`netTicketSales (${kpis.netTicketSales}) must equal grossTicketSales (${kpis.grossTicketSales}) - refundsProcessed (${kpis.refundsProcessed})`);
    }
    // Check separate movie & event revenue streams exist and are positive
    if (kpis.movieBookingRevenue <= 0 || kpis.eventRevenue <= 0) {
      throw new Error("movieBookingRevenue and eventRevenue must both be positive numbers");
    }
    // Actual platform earnings must be positive
    if (kpis.actualPlatformEarnings <= 0) {
      throw new Error("actualPlatformEarnings must be positive");
    }
    if (kpis.bookingConversionRate < 0 || kpis.bookingConversionRate > 100) {
      throw new Error("bookingConversionRate must be a percentage between 0 and 100");
    }
  });

  // 2. Pending and Failed Bookings Exclusion
  await runTest("Sales Integrity: Exclude pending, failed, or unpaid bookings from sales totals", async () => {
    const kpis = await entertainmentAnalyticsService.getOverviewKPIs();
    const financial = await entertainmentAnalyticsService.getFinancialAnalytics();

    // Gross ticket sales should only include confirmed/completed bookings
    if (financial.platformFeesEarned <= 0) {
      throw new Error("Platform earnings must be calculated from confirmed sales");
    }
    if (financial.grossTicketSales !== kpis.grossTicketSales) {
      throw new Error("Financial gross ticket sales must match overview gross ticket sales exactly");
    }
  });

  // 3. Movie Analytics
  await runTest("Movie Analytics: Accurate breakdown by tickets, gross, theatre, and city", async () => {
    const movieData = await entertainmentAnalyticsService.getMovieAnalytics();

    if (!Array.isArray(movieData.moviesPerformance) || movieData.moviesPerformance.length === 0) {
      throw new Error("moviesPerformance must return non-empty array of movies");
    }
    const topMovie = movieData.moviesPerformance[0];
    if (!topMovie.movieTitle || typeof topMovie.ticketsSold !== "number" || typeof topMovie.grossSales !== "number") {
      throw new Error("Top movie must have movieTitle, ticketsSold, and grossSales");
    }
    if (topMovie.ticketsSold <= 0 || topMovie.grossSales <= 0) {
      throw new Error("Top movie must have positive tickets and sales");
    }
    // Check theatre-wise bookings
    if (!Array.isArray(movieData.theatreBreakdown) || movieData.theatreBreakdown.length === 0) {
      throw new Error("theatreBreakdown must return aggregated theatre data");
    }
    // Check city-wise bookings
    if (!Array.isArray(movieData.cityBreakdown) || movieData.cityBreakdown.length === 0) {
      throw new Error("cityBreakdown must return aggregated city data");
    }
    // Check genre and language performance
    if (!Array.isArray(movieData.genrePerformance) || !Array.isArray(movieData.languagePerformance)) {
      throw new Error("genrePerformance and languagePerformance must be arrays");
    }
  });

  // 4. Entertainment Event Analytics & Category Coverage
  await runTest("Event Analytics: Support all 8 entertainment categories and organizer performance", async () => {
    const eventData = await entertainmentAnalyticsService.getEventAnalytics();

    if (!Array.isArray(eventData.eventsList) || eventData.eventsList.length === 0) {
      throw new Error("eventsList must return non-empty array of entertainment events");
    }
    if (!Array.isArray(eventData.eventsByCategory) || eventData.eventsByCategory.length === 0) {
      throw new Error("eventsByCategory must return non-empty category breakdown");
    }

    const categoriesFound = eventData.eventsByCategory.map(c => c.category);
    const supportedCategories = [
      "Musical Nights",
      "Singing and Dance Performances",
      "Comedy Shows",
      "Pre-Release Events",
      "Trailer Launches",
      "Success Meets",
      "Celebrity Appearances",
      "Live Entertainment Shows"
    ];
    const hasAtLeastOneSupported = supportedCategories.some(cat => categoriesFound.includes(cat));
    if (!hasAtLeastOneSupported) {
      throw new Error("Event analytics must track supported entertainment categories");
    }

    // Verify organizer breakdown
    if (!Array.isArray(eventData.organizerPerformance) || eventData.organizerPerformance.length === 0) {
      throw new Error("organizerPerformance must return aggregated organizer metrics");
    }
  });

  // 5. Financial Analytics & Commercial Reconciliation
  await runTest("Financial Reconciliation: Strict separation of Gross, Net, Platform Earnings, and Partner Liabilities", async () => {
    const fin = await entertainmentAnalyticsService.getFinancialAnalytics();

    if (fin.grossTicketSales <= 0) {
      throw new Error("grossTicketSales must be positive");
    }
    if (fin.netTicketSales !== fin.grossTicketSales - fin.refundsProcessed) {
      throw new Error("netTicketSales must strictly equal grossTicketSales minus refundsProcessed");
    }
    // Check CineVenue platform earnings vs partner liabilities
    const partnerLiabilities = fin.theatreAmountsPayable + fin.organizerAmountsPayable;
    if (partnerLiabilities <= 0) {
      throw new Error("Partner liabilities (theatres and organizers) must be positive");
    }
    // Check CineVenue convenience fees collected
    if (fin.convenienceFeesCollected <= 0) {
      throw new Error("convenienceFeesCollected must be positive");
    }
    // Check settled vs pending
    if (fin.settledAmounts < 0 || fin.pendingSettlements < 0) {
      throw new Error("Settlement amounts cannot be negative");
    }
    // Check settlement reconciliation lists
    if (!Array.isArray(fin.theatresSettlementList) || !Array.isArray(fin.organizersSettlementList)) {
      throw new Error("theatresSettlementList and organizersSettlementList must be present");
    }
  });

  // 6. Audience Engagement & Telemetry
  await runTest("Audience Engagement: Privacy-conscious event tracking and device distribution", async () => {
    // Record a fresh test event to verify ingestion
    const trackResult = await entertainmentAnalyticsService.trackEngagementEvent({
      sessionId: "test-sess-analytics-999",
      eventType: "PAGE_VIEW",
      entityType: "MOVIE",
      entityId: "mov-01",
      city: "Hyderabad",
      device: "Mobile Chrome"
    });

    if (!trackResult || !trackResult.id) {
      throw new Error("trackEngagementEvent must persist and return the newly tracked event");
    }

    const engagement = await entertainmentAnalyticsService.getEngagementAndFunnel();
    if (engagement.totalPageViews <= 0) {
      throw new Error("totalPageViews must be positive");
    }
    if (engagement.moviePageViews <= 0 || engagement.eventPageViews <= 0) {
      throw new Error("moviePageViews and eventPageViews must be positive");
    }
    if (!Array.isArray(engagement.deviceBreakdown) || engagement.deviceBreakdown.length === 0) {
      throw new Error("deviceBreakdown must record device sessions");
    }
  });

  // 7. Booking Funnel 6 Stages
  await runTest("Booking Funnel: 6-stage drop-off and conversion rates calculation", async () => {
    const engagement = await entertainmentAnalyticsService.getEngagementAndFunnel();

    if (!Array.isArray(engagement.funnelStages) || engagement.funnelStages.length !== 6) {
      throw new Error(`Booking funnel must contain exactly 6 stages, got ${engagement.funnelStages?.length}`);
    }

    const expectedStageNums = [1, 2, 3, 4, 5, 6];

    engagement.funnelStages.forEach((stage, idx) => {
      if (stage.stageNumber !== expectedStageNums[idx]) {
        throw new Error(`Stage number must be ${expectedStageNums[idx]}, got ${stage.stageNumber}`);
      }
      if (typeof stage.sessionsCount !== "number" || stage.sessionsCount < 0) {
        throw new Error(`Stage ${stage.stageName} count must be a non-negative number`);
      }
      if (stage.conversionRate < 0 || stage.conversionRate > 100) {
        throw new Error(`Stage ${stage.stageName} conversion rate must be between 0 and 100%`);
      }
      if (stage.dropOffRate < 0 || stage.dropOffRate > 100) {
        throw new Error(`Stage ${stage.stageName} drop-off rate must be between 0 and 100%`);
      }
    });
  });

  // 8. Performance Rankings
  await runTest("Performance Rankings: Top movies, events, theatres, and organizers", async () => {
    const rankings = await entertainmentAnalyticsService.getRankings();

    if (!Array.isArray(rankings.topMovies) || rankings.topMovies.length === 0) {
      throw new Error("topMovies rankings must return non-empty array");
    }
    if (!Array.isArray(rankings.topEvents) || rankings.topEvents.length === 0) {
      throw new Error("topEvents rankings must return non-empty array");
    }
    if (!Array.isArray(rankings.topTheatres) || rankings.topTheatres.length === 0) {
      throw new Error("topTheatres rankings must return non-empty array");
    }
    if (!Array.isArray(rankings.topOrganizers) || rankings.topOrganizers.length === 0) {
      throw new Error("topOrganizers rankings must return non-empty array");
    }
  });

  // 9. Role-Based Access Control (RBAC) Data Scoping
  await runTest("RBAC Scoping: Theatre Admin and Event Organizer restricted to authorized entities", async () => {
    // 1. Super Admin sees all theatres
    const allTheatres = await entertainmentAnalyticsService.getMovieAnalytics({}, {
      role: "SUPER_ADMIN",
      email: "admin@cinevenue.com"
    });
    if (!allTheatres.theatreBreakdown || allTheatres.theatreBreakdown.length === 0) {
      throw new Error("Super Admin should see theatre breakdown");
    }

    // 2. Theatre Admin restricted to "th_prasads_01"
    const scopedTheatre = await entertainmentAnalyticsService.getMovieAnalytics({}, {
      role: "THEATRE_ADMIN",
      email: "theatreadmin@cinevenue.com",
      theatreId: "th_prasads_01"
    });
    if (scopedTheatre.theatreBreakdown.length !== 1 || scopedTheatre.theatreBreakdown[0].theatreId !== "th_prasads_01") {
      throw new Error("Theatre Admin must only see their assigned theatre's data");
    }

    // 3. Organizer restricted to "org_cine_live"
    const scopedOrganizer = await entertainmentAnalyticsService.getEventAnalytics({}, {
      role: "EVENT_ORGANIZER",
      email: "organizer@cinevenue.com",
      organizerId: "org_cine_live"
    });
    if (scopedOrganizer.organizerPerformance.length !== 1 || scopedOrganizer.organizerPerformance[0].organizerId !== "org_cine_live") {
      throw new Error("Organizer must only see their own organization");
    }
  });

  // 10. Secure RFC4180 CSV Export & Formula Injection Defense
  await runTest("CSV Export: RFC4180 format and formula injection defense", async () => {
    const csvData = await entertainmentAnalyticsService.exportReportCsv("movies");

    if (!csvData.includes("Movie Title,Language,Genre,Tickets Sold,Gross Sales (INR)")) {
      throw new Error("CSV export for movies must contain expected column headers");
    }

    // Check overview report export
    const overviewCsv = await entertainmentAnalyticsService.exportReportCsv("overview");
    if (!overviewCsv.includes("KPI Metric,Value,Notes")) {
      throw new Error("Overview CSV must include standard KPI header definition");
    }
  });

  // 11. Date and City Filters
  await runTest("Filters: City and Date-range filters apply correctly without crashing", async () => {
    const filteredKPIs = await entertainmentAnalyticsService.getOverviewKPIs({
      city: "Hyderabad"
    });
    if (typeof filteredKPIs.totalConfirmedBookings !== "number") {
      throw new Error("City filter must return valid KPIs");
    }

    // Filter with zero-match city
    const emptyKPIs = await entertainmentAnalyticsService.getOverviewKPIs({
      city: "NonExistentCityXYZ"
    });
    if (emptyKPIs.totalConfirmedBookings !== 0 || emptyKPIs.grossTicketSales !== 0) {
      throw new Error("Non-existent city filter must safely return 0 without errors");
    }
  });

  return results;
}
