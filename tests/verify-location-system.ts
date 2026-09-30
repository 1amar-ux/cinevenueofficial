/**
 * Verification Test Suite for:
 * CineVenue Location Selection Modal System (District / BookMyShow Style)
 * - Geolocation Nearest Hub Resolution
 * - Alias & Locality Resolution
 * - Real-time Filtering
 * - City Isolation
 */

import { POPULAR_CITIES, ALL_INDIAN_CITIES, ALIASES, findNearestCity, calculateDistance, getCoordinates } from '../src/lib/location';
import { filterTheatresByCity } from '../src/utils/movieAvailability';
import { Theatre } from '../src/types';

function runLocationTestSuite() {
  console.log('===============================================================');
  console.log('🌍 RUNNING CINEVENUE LOCATION MODAL SYSTEM TEST SUITE');
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

  // 1. Geolocation & Nearest City Matching
  console.log('--- 1. GPS Geolocation & Distance Calculation ---');

  // HITEC City coordinates (near Hyderabad)
  const hydNear = findNearestCity(17.4435, 78.3772);
  assert(hydNear.name === 'Hyderabad', 'GPS near HITEC City resolves to Hyderabad');

  // Whitefield coordinates (near Bengaluru)
  const blrNear = findNearestCity(12.9698, 77.7500);
  assert(blrNear.name === 'Bengaluru', 'GPS near Whitefield resolves to Bengaluru');

  // Bandra coordinates (near Mumbai)
  const mumNear = findNearestCity(19.0596, 72.8295);
  assert(mumNear.name === 'Mumbai', 'GPS near Bandra resolves to Mumbai');

  // Prakasam Barrage (near Vijayawada)
  const vijNear = findNearestCity(16.5050, 80.6050);
  assert(vijNear.name === 'Vijayawada', 'GPS near Prakasam Barrage resolves to Vijayawada');

  const dist = calculateDistance(17.3850, 78.4867, 19.0760, 72.8777);
  assert(dist > 600 && dist < 750, `Distance between Hyderabad & Mumbai is ~${Math.round(dist)} km`);

  // 2. City Aliases Resolution
  console.log('\n--- 2. City Aliases Resolution ---');

  assert(ALIASES['vizag'] === 'Visakhapatnam', 'Alias "vizag" -> Visakhapatnam');
  assert(ALIASES['bezawada'] === 'Vijayawada', 'Alias "bezawada" -> Vijayawada');
  assert(ALIASES['bombay'] === 'Mumbai', 'Alias "bombay" -> Mumbai');
  assert(ALIASES['bangalore'] === 'Bengaluru', 'Alias "bangalore" -> Bengaluru');
  assert(ALIASES['madras'] === 'Chennai', 'Alias "madras" -> Chennai');

  // 3. Locality & Search Matching
  console.log('\n--- 3. Sub-Locality Matching ---');

  const kukatpallyCity = POPULAR_CITIES.find(c => c.localities.includes('Kukatpally'));
  assert(kukatpallyCity?.name === 'Hyderabad', 'Locality "Kukatpally" belongs to Hyderabad');

  const koramangalaCity = POPULAR_CITIES.find(c => c.localities.includes('Koramangala'));
  assert(koramangalaCity?.name === 'Bengaluru', 'Locality "Koramangala" belongs to Bengaluru');

  const bandraCity = POPULAR_CITIES.find(c => c.localities.includes('Bandra'));
  assert(bandraCity?.name === 'Mumbai', 'Locality "Bandra" belongs to Mumbai');

  // 4. Extended Alphabetical A-Z Database
  console.log('\n--- 4. Extended Alphabetical A-Z City Database ---');

  assert(ALL_INDIAN_CITIES.length >= 40, `All Indian Cities catalog contains ${ALL_INDIAN_CITIES.length} cities (>= 40)`);
  assert(ALL_INDIAN_CITIES.some(c => c.name === 'Warangal'), 'Warangal present in extended catalog');
  assert(ALL_INDIAN_CITIES.some(c => c.name === 'Tirupati'), 'Tirupati present in extended catalog');
  assert(ALL_INDIAN_CITIES.some(c => c.name === 'Kochi'), 'Kochi present in extended catalog');

  // 5. City Isolation with Dynamic Scoping
  console.log('\n--- 5. Dynamic Scoping & Strict City Isolation ---');

  const testTheatres: Theatre[] = [
    { id: 1, name: 'PVR Nexus Hyderabad', location: 'Hyderabad · Kukatpally', city: 'Hyderabad', features: ['4K'], price: '₹250', img: '' },
    { id: 2, name: 'IMAX Prasads', location: 'Hyderabad · Tank Bund', city: 'Hyderabad', features: ['IMAX'], price: '₹350', img: '' },
    { id: 3, name: 'PVR Forum Koramangala', location: 'Bengaluru · Koramangala', city: 'Bengaluru', features: ['4K'], price: '₹300', img: '' },
    { id: 4, name: 'PVP Square INOX', location: 'Vijayawada · MG Road', city: 'Vijayawada', features: ['Laser'], price: '₹200', img: '' },
  ];

  const hydOnly = filterTheatresByCity(testTheatres, 'Hyderabad');
  assert(hydOnly.length === 2 && hydOnly.every(t => t.city === 'Hyderabad'), 'Hyderabad isolation returns only Hyderabad theatres');

  const blrOnly = filterTheatresByCity(testTheatres, 'Bengaluru');
  assert(blrOnly.length === 1 && blrOnly[0].city === 'Bengaluru', 'Bengaluru isolation returns only Bengaluru theatres');

  const allCities = filterTheatresByCity(testTheatres, 'All Cities');
  assert(allCities.length === 4, '"All Cities" returns all theatres across India');

  console.log('\n===============================================================');
  console.log(`🏁 LOCATION SYSTEM TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLocationTestSuite();
