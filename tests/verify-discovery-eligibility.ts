/**
 * Verification Test Suite for:
 * 1. YouTube Trailer & Teaser Video Management & URL Normalization
 * 2. Canonical Show Status & 26-Reason Booking Eligibility in Asia/Kolkata
 * 3. Movie Availability, Release Windows & Zero Cross-City Leakage
 */

import { parseAndValidateYouTubeUrl, buildSafeYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../src/utils/youtube';
import { calculateShowBoundaryTimestamps, evaluateShowBookingEligibility } from '../src/utils/showEligibility';
import { filterTheatresByCity, filterShowsByCity, deriveMovieReleaseStatus, getActiveMovieVideos } from '../src/utils/movieAvailability';
import { Movie, Theatre, Show, MovieVideo } from '../src/types';

function runTestSuite() {
  console.log('===============================================================');
  console.log('🚀 RUNNING CINEVENUE DISCOVERY, ELIGIBILITY & YOUTUBE TEST SUITE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     Details: ${detail}`);
      failed++;
    }
  }

  // -----------------------------------------------------------------
  // 1. YouTube URL Parser & Validator Tests
  // -----------------------------------------------------------------
  console.log('--- 1. YouTube URL Parser & Normalizer Tests ---');

  const standardUrl = parseAndValidateYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert(standardUrl.isValid && standardUrl.videoId === 'dQw4w9WgXcQ', 'Standard watch?v= URL extraction');

  const shortUrl = parseAndValidateYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
  assert(shortUrl.isValid && shortUrl.videoId === 'dQw4w9WgXcQ', 'Short youtu.be URL extraction');

  const shortsUrl = parseAndValidateYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert(shortsUrl.isValid && shortsUrl.videoId === 'dQw4w9WgXcQ', 'YouTube Shorts URL extraction');

  const rawId = parseAndValidateYouTubeUrl('dQw4w9WgXcQ');
  assert(rawId.isValid && rawId.videoId === 'dQw4w9WgXcQ', 'Direct 11-char Video ID extraction');

  const maliciousUrl = parseAndValidateYouTubeUrl('<iframe src="javascript:alert(1)"></iframe>');
  assert(!maliciousUrl.isValid, 'Reject malicious iframe input');

  const wrongDomain = parseAndValidateYouTubeUrl('https://vimeo.com/12345678');
  assert(!wrongDomain.isValid, 'Reject unsupported domain (vimeo.com)');

  const embedUrl = buildSafeYouTubeEmbedUrl('dQw4w9WgXcQ');
  assert(embedUrl.includes('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'Safe YouTube embed URL construction');

  const thumbUrl = getYouTubeThumbnailUrl('dQw4w9WgXcQ', 'hq');
  assert(thumbUrl === 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 'High quality YouTube thumbnail generator');

  // -----------------------------------------------------------------
  // 2. Show Status & Timezone Midnight-Crossing Tests
  // -----------------------------------------------------------------
  console.log('\n--- 2. Show Boundaries & Midnight-Crossing in Asia/Kolkata ---');

  const normalShow = calculateShowBoundaryTimestamps('2026-10-01', '14:30', '17:30');
  assert(
    normalShow.showStartAt.includes('2026-10-01T14:30:00+05:30') &&
    normalShow.showEndAt.includes('2026-10-01T17:30:00+05:30'),
    'Daytime show boundaries calculation'
  );

  const midnightShow = calculateShowBoundaryTimestamps('2026-10-01', '23:30', '02:30');
  assert(
    midnightShow.showStartAt.includes('2026-10-01T23:30:00+05:30') &&
    midnightShow.showEndAt.includes('2026-10-02T02:30:00+05:30'),
    'Midnight-crossing show rolls over +1 calendar day in Asia/Kolkata'
  );

  // -----------------------------------------------------------------
  // 3. Show Booking Eligibility with Canonical Reasons
  // -----------------------------------------------------------------
  console.log('\n--- 3. Show Booking Eligibility & 26 Canonical Blocked Reasons ---');

  const sampleShow: Show = {
    id: 'SH-101',
    movieId: 'M-01',
    movieTitle: 'Pushpa 2',
    theatreId: 1,
    theatreName: 'PVR Nexus',
    theatreCity: 'Hyderabad',
    showDate: '2026-10-01',
    showStartTime: '18:00',
    showEndTime: '21:00',
    showTimezone: 'Asia/Kolkata',
    showStartAt: '2026-10-01T18:00:00+05:30',
    showEndAt: '2026-10-01T21:00:00+05:30',
    pricePerSeat: 250,
    totalSeats: 150,
    availableSeats: 45,
    showStatus: 'SCHEDULED',
    isActive: true,
  };

  const eligibleResult = evaluateShowBookingEligibility(sampleShow, {
    currentTime: '2026-10-01T10:00:00+05:30',
  });
  assert(eligibleResult.bookingEligible && eligibleResult.blockedReason === 'NONE', 'Eligible future show passes with NONE');

  // Cancelled show
  const cancelledShow: Show = { ...sampleShow, showStatus: 'CANCELLED' };
  const cancelledResult = evaluateShowBookingEligibility(cancelledShow, {
    currentTime: '2026-10-01T10:00:00+05:30',
  });
  assert(!cancelledResult.bookingEligible && cancelledResult.blockedReason === 'SHOW_CANCELLED', 'Cancelled show returns SHOW_CANCELLED');

  // Started show
  const startedResult = evaluateShowBookingEligibility(sampleShow, {
    currentTime: '2026-10-01T18:30:00+05:30', // after 18:00
  });
  assert(!startedResult.bookingEligible && startedResult.blockedReason === 'SHOW_STARTED', 'Started show returns SHOW_STARTED');

  // House full show
  const fullShow: Show = { ...sampleShow, availableSeats: 0 };
  const fullResult = evaluateShowBookingEligibility(fullShow, {
    currentTime: '2026-10-01T10:00:00+05:30',
  });
  assert(!fullResult.bookingEligible && fullResult.blockedReason === 'HOUSE_FULL', 'Zero seat show returns HOUSE_FULL');

  // Admin booking lock
  const lockedShow: Show = { ...sampleShow, adminBookingDisabled: true };
  const lockedResult = evaluateShowBookingEligibility(lockedShow, {
    currentTime: '2026-10-01T10:00:00+05:30',
  });
  assert(!lockedResult.bookingEligible && lockedResult.blockedReason === 'ADMIN_BOOKING_DISABLED', 'Admin disabled show returns ADMIN_BOOKING_DISABLED');

  // -----------------------------------------------------------------
  // 4. City Isolation & Zero Cross-City Leakage
  // -----------------------------------------------------------------
  console.log('\n--- 4. City Isolation & Discovery Filtering ---');

  const mockTheatres: Theatre[] = [
    { id: 1, name: 'PVR Nexus', location: 'Hyderabad · Kukatpally', city: 'Hyderabad', features: ['IMAX'], price: '₹250', img: '' },
    { id: 2, name: 'IMAX Prasads', location: 'Hyderabad · Tank Bund', city: 'Hyderabad', features: ['IMAX'], price: '₹350', img: '' },
    { id: 3, name: 'PVP Square INOX', location: 'Vijayawada · MG Road', city: 'Vijayawada', features: ['4K'], price: '₹200', img: '' },
    { id: 4, name: 'Cinepolis Sudarshan', location: 'Guntur · Lakshmipuram', city: 'Guntur', features: ['Dolby'], price: '₹180', img: '' },
  ];

  const hydTheatres = filterTheatresByCity(mockTheatres, 'Hyderabad');
  assert(
    hydTheatres.length === 2 && hydTheatres.every((t) => t.city === 'Hyderabad'),
    'Strict city isolation for Hyderabad (2 theatres, 0 Vijayawada/Guntur leaks)'
  );

  const vijayawadaTheatres = filterTheatresByCity(mockTheatres, 'Vijayawada');
  assert(
    vijayawadaTheatres.length === 1 && vijayawadaTheatres[0].name === 'PVP Square INOX',
    'Strict city isolation for Vijayawada'
  );

  const mockShows: Show[] = [
    { ...sampleShow, id: 'SH-HYD-1', theatreId: 1, theatreName: 'PVR Nexus' },
    { ...sampleShow, id: 'SH-VIJ-1', theatreId: 3, theatreName: 'PVP Square INOX' },
  ];

  const hydShows = filterShowsByCity(mockShows, hydTheatres);
  assert(
    hydShows.length === 1 && hydShows[0].id === 'SH-HYD-1',
    'Shows strictly filtered by selected city theatres with zero leaks'
  );

  // -----------------------------------------------------------------
  // 5. Movie Release Window & Active Video Extractor
  // -----------------------------------------------------------------
  console.log('\n--- 5. Release Windows & Video Ordering ---');

  const sampleMovie: Movie = {
    title: 'Devara Part 1',
    genre: 'Action',
    lang: 'Telugu',
    rating: '8.4',
    img: '',
    langKey: 'telugu',
    releaseDate: '2026-10-15',
    videos: [
      {
        id: 'v2',
        movieId: 'Devara Part 1',
        type: 'TEASER',
        title: 'Official Teaser',
        youtubeVideoId: 'dQw4w9WgXcQ',
        youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
        displayOrder: 2,
        isActive: true,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'v1',
        movieId: 'Devara Part 1',
        type: 'TRAILER',
        title: 'Official Trailer',
        youtubeVideoId: 'dQw4w9WgXcQ',
        youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
        displayOrder: 1,
        isActive: true,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
      {
        id: 'v3',
        movieId: 'Devara Part 1',
        type: 'TRAILER',
        title: 'Draft Inactive Trailer',
        youtubeVideoId: 'dQw4w9WgXcQ',
        youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
        displayOrder: 3,
        isActive: false,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ],
  };

  const releaseStatus = deriveMovieReleaseStatus(sampleMovie, '2026-10-01T00:00:00Z');
  assert(releaseStatus === 'UPCOMING', 'Future release date correctly evaluates to UPCOMING');

  const activeVideos = getActiveMovieVideos(sampleMovie);
  assert(
    activeVideos.length === 2 &&
    activeVideos[0].title === 'Official Trailer' &&
    activeVideos[1].title === 'Official Teaser',
    'Active videos exclude inactives and are sorted by displayOrder ASC (1, 2)'
  );

  console.log('\n===============================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
