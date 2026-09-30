/**
 * Verification Test Suite: CineVenue Event Upload & Admin Panel Integration
 * - Single source of truth for events
 * - Admin creation and instant customer-side synchronization
 * - FREE and PAID event configuration
 * - Admin editing and deletion
 * - Strict city isolation
 */

import {
  getEvents,
  saveEvent,
  deleteEvent,
  getEventById
} from '../src/services/eventBookingService';
import { filterEventsByCity } from '../src/utils/movieAvailability';
import { EventItem } from '../src/types/eventBooking';

function runAdminEventSyncTestSuite() {
  console.log('======================================================================');
  console.log('🏛️  CINEVENUE EVENT UPLOAD & ADMIN PANEL INTEGRATION TEST SUITE');
  console.log('======================================================================\n');

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

  // 1. Admin creates a new FREE event
  console.log('--- 1. Admin Event Creation (FREE) ---');
  const newFreeEvent: EventItem = {
    id: 'EVT-ADM-FREE-01',
    title: 'CineVenue Telugu Short Film Festival 2026',
    slug: 'telugu-short-film-festival-2026-vijayawada',
    description: 'Premier screening of award-winning independent short films.',
    category: 'Film Events',
    bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba',
    organizer: {
      id: 'ORG-AP',
      name: 'AP Film Development Guild',
      email: 'guild@apfilm.org',
      isVerified: true,
    },
    date: '2026-11-28',
    startTime: '05:00 PM',
    venueName: 'Tummalapalli Kalakshetram',
    venueAddress: 'Near Sub-Collector Office, Vijayawada',
    city: 'Vijayawada',
    seatingType: 'GeneralAdmission',
    eventType: 'FREE',
    totalCapacity: 800,
    soldCount: 0,
    status: 'Published',
    ticketTypes: [
      {
        id: 'TKT-FREE-ADM-1',
        eventId: 'EVT-ADM-FREE-01',
        name: 'General Public Free Pass',
        tier: 'General',
        description: 'Complimentary admission pass for film lovers.',
        price: 0,
        isFree: true,
        availableQuantity: 800,
        soldQuantity: 0,
        maxPerUser: 4,
        minPerUser: 1,
        status: 'Active',
        isRefundable: false,
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveEvent(newFreeEvent);
  const fetchedFree = getEventById('EVT-ADM-FREE-01');
  assert(!!fetchedFree && fetchedFree.title === newFreeEvent.title, 'Admin creates FREE event and it is saved in canonical store');
  assert(fetchedFree?.eventType === 'FREE' && fetchedFree?.ticketTypes[0].price === 0, 'FREE event stored with price 0 and FREE mode');

  // 2. Admin creates a new PAID event
  console.log('\n--- 2. Admin Event Creation (PAID) ---');
  const newPaidEvent: EventItem = {
    id: 'EVT-ADM-PAID-01',
    title: 'Anirudh Ravichander "Hukum" World Stadium Tour Live',
    slug: 'anirudh-ravichander-hukum-tour-hyderabad',
    description: 'Rockstar Anirudh live in concert with an electrifying 4-hour stadium musical feast.',
    category: 'Concerts',
    bannerUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    organizer: {
      id: 'ORG-CONCERT',
      name: 'Sunburn & CineVenue Live',
      email: 'live@cinevenue.in',
      isVerified: true,
    },
    date: '2026-12-19',
    startTime: '06:00 PM',
    venueName: 'G.M.C. Balayogi Athletic Stadium',
    venueAddress: 'Gachibowli, Hyderabad',
    city: 'Hyderabad',
    seatingType: 'GeneralAdmission',
    eventType: 'PAID',
    totalCapacity: 25000,
    soldCount: 0,
    status: 'Published',
    ticketTypes: [
      {
        id: 'TKT-ANI-VIP',
        eventId: 'EVT-ADM-PAID-01',
        name: 'Hukum VIP Fan Pit',
        tier: 'VIP',
        description: 'Stage-front VIP standing arena with priority entry.',
        price: 3999,
        isFree: false,
        availableQuantity: 5000,
        soldQuantity: 0,
        maxPerUser: 6,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      },
      {
        id: 'TKT-ANI-GEN',
        eventId: 'EVT-ADM-PAID-01',
        name: 'General Ground Admission',
        tier: 'General',
        description: 'Open stadium access.',
        price: 1499,
        isFree: false,
        availableQuantity: 20000,
        soldQuantity: 0,
        maxPerUser: 8,
        minPerUser: 1,
        status: 'Active',
        isRefundable: true,
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveEvent(newPaidEvent);
  const fetchedPaid = getEventById('EVT-ADM-PAID-01');
  assert(!!fetchedPaid && fetchedPaid.title === newPaidEvent.title, 'Admin creates PAID event and it is saved in canonical store');
  assert(fetchedPaid?.eventType === 'PAID' && fetchedPaid?.ticketTypes.length === 2, 'PAID event stored with 2 ticket tiers');

  // 3. Admin Panel Events list retrieves all events
  console.log('\n--- 3. Admin Panel Events List ---');
  const allEvents = getEvents();
  assert(allEvents.some(e => e.id === 'EVT-ADM-FREE-01'), 'Admin Events List contains newly created FREE event');
  assert(allEvents.some(e => e.id === 'EVT-ADM-PAID-01'), 'Admin Events List contains newly created PAID event');

  // 4. Customer-side city filtering synchronization
  console.log('\n--- 4. Customer-Side City Synchronization ---');
  const hydEvents = filterEventsByCity(allEvents, 'Hyderabad');
  assert(hydEvents.some(e => e.id === 'EVT-ADM-PAID-01'), 'Hyderabad customer browsing shows newly created Hyderabad event');
  assert(!hydEvents.some(e => e.id === 'EVT-ADM-FREE-01'), 'Hyderabad customer browsing excludes Vijayawada event (strict city isolation)');

  const vijEvents = filterEventsByCity(allEvents, 'Vijayawada');
  assert(vijEvents.some(e => e.id === 'EVT-ADM-FREE-01'), 'Vijayawada customer browsing shows newly created Vijayawada event');
  assert(!vijEvents.some(e => e.id === 'EVT-ADM-PAID-01'), 'Vijayawada customer browsing excludes Hyderabad event');

  // 5. Admin Editing an Event
  console.log('\n--- 5. Admin Event Editing ---');
  const updatedEvent: EventItem = {
    ...newPaidEvent,
    title: 'Anirudh Live — Special Extended Concert',
    startTime: '05:30 PM',
  };
  saveEvent(updatedEvent);
  const fetchedUpdated = getEventById('EVT-ADM-PAID-01');
  assert(fetchedUpdated?.title === 'Anirudh Live — Special Extended Concert', 'Editing event title updates canonical record');
  assert(fetchedUpdated?.startTime === '05:30 PM', 'Editing event time updates canonical record');

  // 6. Admin Deleting an Event
  console.log('\n--- 6. Admin Event Deletion ---');
  const deleteResult = deleteEvent('EVT-ADM-FREE-01');
  assert(deleteResult === true, 'Admin deleting event returns true');
  const postDeleteLookup = getEventById('EVT-ADM-FREE-01');
  assert(!postDeleteLookup, 'Deleted event is removed from canonical store and customer listing');

  console.log('\n======================================================================');
  console.log(`🏁 ADMIN EVENT INTEGRATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminEventSyncTestSuite();
