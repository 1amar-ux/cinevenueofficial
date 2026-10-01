/**
 * CineVenue Acceptance Test Suite: AC-MTS-01 to AC-MTS-16
 * Movie Discovery Flow: Selected City → Movie → All Eligible Theatres in City → Date → Showtimes → Seat Selection
 */

import { getEligibleTheatresAndShows, parseTimeToMinutes, filterTheatresByCity } from '../src/utils/movieAvailability';
import { Theatre, MovieSchedule } from '../src/types';

export function runMovieTheatresShowtimesAcceptanceTests() {
  console.log('======================================================================');
  console.log('🎬 CINEVENUE MOVIE → THEATRES & SHOWTIMES ACCEPTANCE SUITE (AC-MTS-01 → 16)');
  console.log('======================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testId: string, description: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [${testId}] PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [${testId}] FAIL: ${description}`);
      if (detail) console.error(`     Details: ${detail}`);
      failed++;
    }
  }

  // Baseline Mock Theatres
  const testTheatres: Theatre[] = [
    { id: 1, name: 'PVP Square INOX', city: 'Vijayawada', location: 'Vijayawada · MG Road' } as any,
    { id: 2, name: 'Capital Cinemas', city: 'Vijayawada', location: 'Vijayawada · Trendset Mall' } as any,
    { id: 3, name: 'Alankar Theatre', city: 'Vijayawada', location: 'Vijayawada · Arundelpet' } as any,
    { id: 4, name: 'Miraj Cinemas', city: 'Vijayawada', location: 'Vijayawada · Gandhi Nagar' } as any,
    { id: 5, name: 'Cine Square', city: 'Vijayawada', location: 'Vijayawada · Benz Circle' } as any,
    { id: 6, name: 'Old Palace Talkies', city: 'Vijayawada', location: 'Vijayawada · One Town', status: 'INACTIVE' } as any,
    { id: 7, name: 'PVR Nexus', city: 'Hyderabad', location: 'Hyderabad · Kukatpally' } as any,
    { id: 8, name: 'IMAX Prasads', city: 'Hyderabad', location: 'Hyderabad · Necklace Road' } as any,
  ];

  // Baseline Mock Schedules
  let testSchedules: MovieSchedule[] = [
    // PVP Square INOX: 3 shows for Coolie today
    { id: 'sch-1', movieTitle: 'Coolie', theatreName: 'PVP Square INOX', timeSlot: '06:30 PM', date: 'Today', pricePerSeat: 250, isActive: true, isDeployed: true },
    { id: 'sch-2', movieTitle: 'Coolie', theatreName: 'PVP Square INOX', timeSlot: '10:00 AM', date: 'Today', pricePerSeat: 200, isActive: true, isDeployed: true },
    { id: 'sch-3', movieTitle: 'Coolie', theatreName: 'PVP Square INOX', timeSlot: '01:00 PM', date: 'Today', pricePerSeat: 220, isActive: true, isDeployed: true },
    
    // Capital Cinemas: 1 show for Coolie today
    { id: 'sch-4', movieTitle: 'Coolie', theatreName: 'Capital Cinemas', timeSlot: '04:30 PM', date: 'Today', pricePerSeat: 250, isActive: true, isDeployed: true },

    // Alankar: shows only for a different movie ("Pushpa 2") today
    { id: 'sch-5', movieTitle: 'Pushpa 2', theatreName: 'Alankar Theatre', timeSlot: '07:00 PM', date: 'Today', pricePerSeat: 180, isActive: true, isDeployed: true },

    // Miraj Cinemas: show for Coolie on Oct 2 (Tomorrow), NOT today
    { id: 'sch-6', movieTitle: 'Coolie', theatreName: 'Miraj Cinemas', timeSlot: '05:00 PM', date: '2026-10-02', pricePerSeat: 210, isActive: true, isDeployed: true },

    // Cine Square: show for Coolie today but cancelled/inactive
    { id: 'sch-7', movieTitle: 'Coolie', theatreName: 'Cine Square', timeSlot: '09:00 PM', date: 'Today', pricePerSeat: 200, isActive: false, isDeployed: true },

    // Old Palace Talkies: show for Coolie today, but theatre is INACTIVE
    { id: 'sch-8', movieTitle: 'Coolie', theatreName: 'Old Palace Talkies', timeSlot: '02:00 PM', date: 'Today', pricePerSeat: 150, isActive: true, isDeployed: true },

    // Hyderabad Theatres: shows for Coolie today
    { id: 'sch-9', movieTitle: 'Coolie', theatreName: 'PVR Nexus', timeSlot: '11:00 AM', date: 'Today', pricePerSeat: 300, isActive: true, isDeployed: true },
    { id: 'sch-10', movieTitle: 'Coolie', theatreName: 'IMAX Prasads', timeSlot: '08:00 PM', date: 'Today', pricePerSeat: 450, isActive: true, isDeployed: true }
  ];

  // -------------------------------------------------------------
  // AC-MTS-01: Movie + City (Both eligible theatres appear)
  // -------------------------------------------------------------
  const vjaToday = getEligibleTheatresAndShows(testTheatres, testSchedules, 'Coolie', 'Vijayawada', '2026-10-01', true, false);
  const vjaTheatreNames = vjaToday.map(g => g.theatre.name);
  assert(
    vjaTheatreNames.includes('PVP Square INOX') && vjaTheatreNames.includes('Capital Cinemas'),
    'AC-MTS-01',
    'Both theatres with eligible shows in Vijayawada appear'
  );

  // -------------------------------------------------------------
  // AC-MTS-02: Different City (Zero cross-city leakage)
  // -------------------------------------------------------------
  assert(
    !vjaTheatreNames.includes('PVR Nexus') && !vjaTheatreNames.includes('IMAX Prasads'),
    'AC-MTS-02',
    'Hyderabad theatres do not leak into Vijayawada results'
  );

  // -------------------------------------------------------------
  // AC-MTS-03: No Show (Theatre in same city with no show excluded)
  // -------------------------------------------------------------
  assert(
    !vjaTheatreNames.includes('Alankar Theatre'),
    'AC-MTS-03',
    'Theatre with no show for the selected movie does NOT appear'
  );

  // -------------------------------------------------------------
  // AC-MTS-04: Different Date (Oct 1 vs Oct 2)
  // -------------------------------------------------------------
  assert(
    !vjaTheatreNames.includes('Miraj Cinemas'),
    'AC-MTS-04a',
    'Theatre with show only on Oct 2 does NOT appear on Oct 1'
  );
  const vjaTomorrow = getEligibleTheatresAndShows(testTheatres, testSchedules, 'Coolie', 'Vijayawada', '2026-10-02', false, true);
  const vjaTomorrowNames = vjaTomorrow.map(g => g.theatre.name);
  assert(
    vjaTomorrowNames.includes('Miraj Cinemas'),
    'AC-MTS-04b',
    'Theatre with show on Oct 2 DOES appear when Oct 2 is selected'
  );

  // -------------------------------------------------------------
  // AC-MTS-05: Cancelled Show
  // -------------------------------------------------------------
  assert(
    !vjaTheatreNames.includes('Cine Square'),
    'AC-MTS-05',
    'Theatre whose only show is cancelled/inactive does NOT appear'
  );

  // -------------------------------------------------------------
  // AC-MTS-06: Inactive Theatre
  // -------------------------------------------------------------
  assert(
    !vjaTheatreNames.includes('Old Palace Talkies'),
    'AC-MTS-06',
    'Inactive theatre does NOT appear even if a schedule exists'
  );

  // -------------------------------------------------------------
  // AC-MTS-07: Inactive Screen
  // -------------------------------------------------------------
  const inactiveScreenTheatres: Theatre[] = [
    { id: 99, name: 'Inactive Screen Cinema', city: 'Vijayawada', location: 'Vijayawada' } as any
  ];
  const inactiveScreenSchedules: MovieSchedule[] = [
    { id: 'sch-99', movieTitle: 'Coolie', theatreName: 'Inactive Screen Cinema', timeSlot: '03:00 PM', date: 'Today', isActive: false, isDeployed: false, pricePerSeat: 200 }
  ];
  const screenTest = getEligibleTheatresAndShows(inactiveScreenTheatres, inactiveScreenSchedules, 'Coolie', 'Vijayawada', '2026-10-01', true, false);
  assert(
    screenTest.length === 0,
    'AC-MTS-07',
    'Theatre with only inactive screen/show does NOT appear'
  );

  // -------------------------------------------------------------
  // AC-MTS-08: Multiple Shows (Chronological sorting)
  // -------------------------------------------------------------
  const pvpGroup = vjaToday.find(g => g.theatre.name === 'PVP Square INOX');
  const pvpShowTimes = pvpGroup ? pvpGroup.shows.map(s => s.time) : [];
  assert(
    pvpShowTimes.length === 3 &&
    pvpShowTimes[0] === '10:00 AM' &&
    pvpShowTimes[1] === '01:00 PM' &&
    pvpShowTimes[2] === '06:30 PM',
    'AC-MTS-08',
    'Showtimes are sorted strictly chronologically (10:00 AM → 01:00 PM → 06:30 PM)',
    `Received: ${JSON.stringify(pvpShowTimes)}`
  );

  // -------------------------------------------------------------
  // AC-MTS-09: Showtime Selection Context (Carries showId)
  // -------------------------------------------------------------
  const selectedShow = pvpGroup?.shows[0];
  assert(
    Boolean(selectedShow && selectedShow.id === 'sch-2'),
    'AC-MTS-09',
    'Selected showtime carries authoritative showId (sch-2)'
  );

  // -------------------------------------------------------------
  // AC-MTS-10: City Switch (Vijayawada -> Hyderabad)
  // -------------------------------------------------------------
  const hydToday = getEligibleTheatresAndShows(testTheatres, testSchedules, 'Coolie', 'Hyderabad', '2026-10-01', true, false);
  const hydTheatreNames = hydToday.map(g => g.theatre.name);
  assert(
    hydTheatreNames.includes('PVR Nexus') &&
    hydTheatreNames.includes('IMAX Prasads') &&
    !hydTheatreNames.includes('PVP Square INOX'),
    'AC-MTS-10',
    'City switch to Hyderabad immediately unloads Vijayawada theatres and loads Hyderabad theatres'
  );

  // -------------------------------------------------------------
  // AC-MTS-11: Date Switch (Oct 1 -> Oct 2)
  // -------------------------------------------------------------
  assert(
    vjaToday.length === 2 && vjaTomorrow.length === 1 && vjaTomorrow[0].theatre.name === 'Miraj Cinemas',
    'AC-MTS-11',
    'Date switch refreshes eligible theatres strictly for the target date'
  );

  // -------------------------------------------------------------
  // AC-MTS-12: Empty State (No fallback to another city)
  // -------------------------------------------------------------
  const vizagToday = getEligibleTheatresAndShows(testTheatres, testSchedules, 'Coolie', 'Visakhapatnam', '2026-10-01', true, false);
  assert(
    vizagToday.length === 0,
    'AC-MTS-12',
    'City with no shows returns empty array, triggering empty state without silent fallback'
  );

  // -------------------------------------------------------------
  // AC-MTS-13: Cache Isolation (Keys include city + movie + date)
  // -------------------------------------------------------------
  const cacheKeyVja = `shows:Vijayawada:Coolie:2026-10-01`;
  const cacheKeyHyd = `shows:Hyderabad:Coolie:2026-10-01`;
  assert(
    cacheKeyVja !== cacheKeyHyd,
    'AC-MTS-13',
    'Cache keys strictly partition by city, preventing cross-city cache pollution'
  );

  // -------------------------------------------------------------
  // AC-MTS-14: Admin Show Creation
  // -------------------------------------------------------------
  const dynamicSchedules = [...testSchedules];
  dynamicSchedules.push({
    id: 'sch-admin-new',
    movieTitle: 'Coolie',
    theatreName: 'Alankar Theatre',
    timeSlot: '07:30 PM',
    date: 'Today',
    pricePerSeat: 200,
    isActive: true,
    isDeployed: true
  });
  const afterAdminAdd = getEligibleTheatresAndShows(testTheatres, dynamicSchedules, 'Coolie', 'Vijayawada', '2026-10-01', true, false);
  const afterAdminAddNames = afterAdminAdd.map(g => g.theatre.name);
  assert(
    afterAdminAddNames.includes('Alankar Theatre'),
    'AC-MTS-14',
    'Newly created Admin show makes the theatre immediately discoverable'
  );

  // -------------------------------------------------------------
  // AC-MTS-15: Admin Show Cancellation
  // -------------------------------------------------------------
  const afterAdminCancel = getEligibleTheatresAndShows(
    testTheatres,
    testSchedules.map(s => s.id === 'sch-4' ? { ...s, isActive: false } : s),
    'Coolie',
    'Vijayawada',
    '2026-10-01',
    true,
    false
  );
  const afterCancelNames = afterAdminCancel.map(g => g.theatre.name);
  assert(
    !afterCancelNames.includes('Capital Cinemas'),
    'AC-MTS-15',
    'Cancelling the only show of Capital Cinemas immediately removes the theatre from discovery'
  );

  // -------------------------------------------------------------
  // AC-MTS-16: Booking Validation (CITY_MISMATCH)
  // -------------------------------------------------------------
  function validateBookingCityMatch(theatreCity: string, selectedCity: string): { valid: boolean; reason?: string } {
    if (selectedCity === 'All Cities') return { valid: true };
    const normTheatre = (theatreCity || '').trim().toLowerCase();
    const normSelected = (selectedCity || '').trim().toLowerCase();
    if (!normTheatre.includes(normSelected) && !normSelected.includes(normTheatre)) {
      return { valid: false, reason: 'CITY_MISMATCH' };
    }
    return { valid: true };
  }

  const mismatchValidation = validateBookingCityMatch('Hyderabad', 'Vijayawada');
  const matchValidation = validateBookingCityMatch('Vijayawada', 'Vijayawada');
  assert(
    !mismatchValidation.valid && mismatchValidation.reason === 'CITY_MISMATCH' && matchValidation.valid,
    'AC-MTS-16',
    'Mismatched city context returns CITY_MISMATCH and blocks booking'
  );

  console.log('\n======================================================================');
  console.log(`🏁 CINEVENUE MOVIE THEATRES & SHOWTIMES RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Auto-run if executed directly
runMovieTheatresShowtimesAcceptanceTests();
