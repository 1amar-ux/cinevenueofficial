/**
 * Acceptance Test Suite: CineVenue Event Pass System (Vertical A4 & Check-in Verification)
 */

import { generatePassHtml, formatEventDateAndDay } from '../src/utils/eventPassPdf';
import {
  INITIAL_BOOKINGS,
  getBookingPassId,
  getBookingOrderId,
  isFreeEventBooking,
  validatePass,
  validateAndCheckInTicket,
  reverseCheckInTicket,
  createEventBooking,
  createFreeEventPassBooking,
  findBookingByIdentifier,
} from '../src/services/eventBookingService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✓ ${message}`);
}

async function runAcceptanceTests() {
  console.log('========================================================');
  console.log('RUNNING CINEVENUE EVENT PASS ACCEPTANCE TESTS');
  console.log('========================================================\n');

  // Test 1: Date and Day Formatting
  console.log('--- Test 1: Date and Day Formatting ---');
  const d1 = formatEventDateAndDay('2026-10-18');
  assert(d1.day === 'Sunday', `Day must be Sunday for 2026-10-18 (got ${d1.day})`);
  assert(d1.formattedDate === '18 October 2026', `Formatted date should be 18 October 2026 (got ${d1.formattedDate})`);

  // Test 2: Paid Event Pass HTML Generation (Portrait A4 & CINEVENUE Branding)
  console.log('\n--- Test 2: Paid Event Pass Generation (A4 Portrait) ---');
  const paidBooking = {
    id: 'EVT-BK-000184',
    passCode: 'CV-EVT-2026-000184',
    orderId: 'CV-ORDER-2026-00184',
    eventId: 'EVT-100',
    bookingMode: 'PAID' as const,
    eventTitle: 'CineVenue Grand Launch',
    eventDate: '2026-10-18',
    eventTime: '6:00 PM',
    venueName: 'Grand Convention Hall',
    venueAddress: 'HITEC City Main Boulevard, Madhapur, Hyderabad, Telangana 500081',
    city: 'Hyderabad',
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
    ticketTypeName: 'VIP',
    ticketCount: 1,
    primaryAttendee: {
      name: 'Amarnath',
      email: 'amarnath@cinevenue.in',
      phone: '+91 98765 43210',
    },
    pricing: {
      ticketSubtotal: 999,
      platformBookingFee: 0,
      taxAmount: 0,
      discountAmount: 0,
      cineCoinsRedeemed: 0,
      cineCoinsDiscount: 0,
      finalAmount: 999,
    },
    paymentMethod: 'Online Gateway',
    paymentStatus: 'PAID' as const,
    bookingStatus: 'CONFIRMED' as const,
    qrCodePayload: 'CV-EVT-2026-000184',
    bookedAt: '2026-09-15T14:30:00.000Z',
    checkedIn: false,
  };

  const paidHtml = generatePassHtml(paidBooking);

  // Check 1: Vertical A4 layout
  assert(paidHtml.includes('size: A4 portrait'), 'Pass CSS must specify "size: A4 portrait"');
  assert(paidHtml.includes('max-width: 580px') || paidHtml.includes('pass-container'), 'Pass must use vertical container');

  // Check 2: CINEVENUE branding must be one continuous word
  assert(paidHtml.includes('CINE<span class="gold-accent">VENUE</span>') || paidHtml.includes('CINEVENUE'), 'Pass must display CINEVENUE without gap');
  assert(!paidHtml.includes('CINE VENUE'), 'Pass must NOT contain "CINE VENUE" with a space');

  // Check 3: Event poster
  assert(paidHtml.includes('poster-img') && paidHtml.includes(paidBooking.bannerUrl), 'Pass must include actual dynamic event poster');

  // Check 4: Event info
  assert(paidHtml.includes('CineVenue Grand Launch'), 'Pass must display Event Name');
  assert(paidHtml.includes('18 October 2026'), 'Pass must display Event Date');
  assert(paidHtml.includes('Sunday'), 'Pass must display Event Day (Sunday)');
  assert(paidHtml.includes('6:00 PM'), 'Pass must display Event Time');
  assert(paidHtml.includes('Grand Convention Hall'), 'Pass must display Venue');
  assert(paidHtml.includes('HITEC City Main Boulevard, Madhapur, Hyderabad'), 'Pass must display full address');

  // Check 5 & 6: Fee and Order ID
  assert(paidHtml.includes('₹999'), 'Paid pass must display actual fee ₹999');
  assert(paidHtml.includes('CV-ORDER-2026-00184'), 'Paid pass must display Order ID CV-ORDER-2026-00184');
  assert(paidHtml.includes('PAID'), 'Paid pass must display payment status PAID');

  // Check 7 & 8: Pass Holder and Pass ID
  assert(paidHtml.includes('Amarnath'), 'Pass must display Attendee Name Amarnath');
  assert(paidHtml.includes('VIP'), 'Pass must display Pass Type VIP');
  assert(paidHtml.includes('CV-EVT-2026-000184'), 'Pass must display unique Pass ID CV-EVT-2026-000184');

  // Check 9: QR code and Footer
  assert(paidHtml.includes('SCAN AT ENTRY'), 'Pass must contain "SCAN AT ENTRY"');
  assert(paidHtml.includes('CINEVENUE ENTERTAINMENTS'), 'Pass must contain footer "CINEVENUE ENTERTAINMENTS"');

  // Test 3: Free Event Pass Generation
  console.log('\n--- Test 3: Free Event Pass Generation (No ₹0, Free Order) ---');
  const freeBooking = {
    id: 'EVT-BK-000219',
    passCode: 'CV-EVT-2026-000219',
    orderId: 'CV-FREE-2026-000219',
    eventId: 'EVT-100',
    bookingMode: 'FREE' as const,
    eventTitle: 'CineVenue Grand Launch',
    eventDate: '2026-10-18',
    eventTime: '6:00 PM',
    venueName: 'Grand Convention Hall',
    venueAddress: 'HITEC City Main Boulevard, Madhapur, Hyderabad, Telangana 500081',
    city: 'Hyderabad',
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
    ticketTypeName: 'General Admission',
    ticketCount: 1,
    primaryAttendee: {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98123 45678',
    },
    pricing: {
      ticketSubtotal: 0,
      platformBookingFee: 0,
      taxAmount: 0,
      discountAmount: 0,
      cineCoinsRedeemed: 0,
      cineCoinsDiscount: 0,
      finalAmount: 0,
    },
    paymentMethod: 'FREE_REGISTRATION',
    paymentStatus: 'FREE' as const,
    bookingStatus: 'CONFIRMED' as const,
    qrCodePayload: 'CV-EVT-2026-000219',
    bookedAt: '2026-09-16T11:15:00.000Z',
    checkedIn: false,
  };

  const freeHtml = generatePassHtml(freeBooking);

  assert(freeHtml.includes('FREE ENTRY'), 'Free pass must display "FREE ENTRY" as event fee');
  assert(!freeHtml.includes('>₹0<'), 'Free pass must NOT display ₹0 as customer-facing fee');
  assert(freeHtml.includes('FREE ORDER'), 'Free pass must display "FREE ORDER"');
  assert(freeHtml.includes('CV-FREE-2026-000219'), 'Free pass must display Order ID CV-FREE-2026-000219');
  assert(freeHtml.includes('CV-EVT-2026-000219'), 'Free pass must display Pass ID CV-EVT-2026-000219');

  // Test 4: Stable Pass ID & Order ID across downloads
  console.log('\n--- Test 4: Stability of Pass ID across downloads ---');
  const id1 = getBookingPassId(paidBooking);
  const id2 = getBookingPassId(paidBooking);
  assert(id1 === id2 && id1 === 'CV-EVT-2026-000184', 'Pass ID must be stable and consistent');

  const order1 = getBookingOrderId(paidBooking);
  const order2 = getBookingOrderId(paidBooking);
  assert(order1 === order2 && order1 === 'CV-ORDER-2026-00184', 'Order ID must be stable and consistent');

  // Test 5: QR Validation & Check-in Flow
  console.log('\n--- Test 5: QR Validation & Duplicate Check-in Protection ---');
  // Read-only pass validation
  const validCheck = validatePass('CV-EVT-2026-000184');
  assert(validCheck.valid === true, 'Pass CV-EVT-2026-000184 must validate as valid');
  assert(validCheck.status === 'VALID', 'Pass status should be VALID');

  // Perform Check-in
  const checkInRes = validateAndCheckInTicket('CV-EVT-2026-000184', 'Main Gate Staff');
  assert(checkInRes.success === true, 'Check-in must succeed for active pass');

  // Secondary Check-in attempt (Duplicate scanning protection)
  const dupCheck = validatePass('CV-EVT-2026-000184');
  assert(dupCheck.valid === false, 'Duplicate scan must NOT be valid for entry');
  assert(dupCheck.status === 'ALREADY_CHECKED_IN', 'Duplicate scan must report ALREADY_CHECKED_IN');

  const dupCheckIn = validateAndCheckInTicket('CV-EVT-2026-000184', 'Main Gate Staff');
  assert(dupCheckIn.success === false, 'Duplicate check-in attempt must fail');
  assert(dupCheckIn.alreadyCheckedIn === true, 'Duplicate check-in response must have alreadyCheckedIn === true');

  // Test 6: Cancelled Pass Handling
  console.log('\n--- Test 6: Cancelled Pass Handling ---');
  const cancelledCheck = validatePass('CV-EVT-2026-000108');
  assert(cancelledCheck.valid === false, 'Cancelled pass must not be valid');
  assert(cancelledCheck.status === 'CANCELLED', 'Status must be CANCELLED');

  // Test 7: Invalid Pass Handling
  console.log('\n--- Test 7: Invalid Pass Handling ---');
  const invalidCheck = validatePass('INVALID-PASS-999');
  assert(invalidCheck.valid === false, 'Unknown pass must not be valid');
  assert(invalidCheck.status === 'INVALID', 'Status must be INVALID');

  console.log('\n========================================================');
  console.log('🎉 ALL 7 ACCEPTANCE TEST SUITES PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runAcceptanceTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
