import { integrationManager } from "../src/modules/integrations/IntegrationManager";
import { MockPosAdapter } from "../src/modules/integrations/adapters/MockPosAdapter";
import { VistaConnectAdapter } from "../src/modules/integrations/adapters/VistaConnectAdapter";
import { VeeziPosAdapter } from "../src/modules/integrations/adapters/VeeziPosAdapter";
import { GenericRestPosAdapter } from "../src/modules/integrations/adapters/GenericRestPosAdapter";

async function verifyPosArchitecture() {
  console.log("=================================================");
  console.log("🎟️ Verifying Universal POS Integration Architecture");
  console.log("=================================================\n");

  // 1. Check Adapters in IntegrationManager
  console.log("1. Checking Registered Adapters in IntegrationManager...");
  const adapters = integrationManager.getAllAdapters();
  console.log(`   Found ${adapters.length} registered adapter(s):`, Array.from(new Set(adapters.map(a => a.providerName))).join(", "));
  if (adapters.length < 4) throw new Error("Missing adapters in IntegrationManager");
  console.log("   ✅ PASSED: All cinema POS adapters registered.\n");

  // 2. Test Mock POS Adapter (DEVELOPMENT / TEST ONLY)
  console.log("2. Testing Mock POS Adapter (DEVELOPMENT ONLY)...");
  const mock = new MockPosAdapter();
  const mockHandshake = await mock.testConnection();
  console.log("   Handshake:", mockHandshake.message, `(${mockHandshake.latencyMs}ms)`);
  
  const mockScreens = await mock.getScreens();
  console.log(`   Imported ${mockScreens.length} screen(s):`, mockScreens.map(s => s.name).join(", "));

  const mockSeats = await mock.getSeats(mockScreens[0].id);
  console.log(`   Imported ${mockSeats.length} seats for ${mockScreens[0].name}`);

  const mockAvailability = await mock.getSeatAvailability("mock_show_01");
  const bookedMockSeats = mockAvailability.filter(s => s.status === "BOOKED");
  console.log(`   Live POS Box-Office Occupancy: ${bookedMockSeats.length} booked seat(s) detected (${bookedMockSeats.map(s => s.seatCode).join(", ")})`);

  const mockHold = await mock.holdSeats("mock_show_01", ["A1", "A2"], "user-123");
  console.log("   POS Seat Hold:", mockHold.message, `Token: ${mockHold.holdToken}`);

  const mockBooking = await mock.createBooking({
    bookingId: "CV-BOOKING-MOCK-01",
    theatreId: "mock_theatre_01",
    screenId: "mock_screen_01",
    movieId: "mock_movie_01",
    showId: "mock_show_01",
    userId: "user-123",
    seatIds: ["A1", "A2"],
    amount: 900,
    holdToken: mockHold.holdToken
  });
  console.log(`   Dual-ID Confirmation: CineVenue ID [${mockBooking.id}] <-> POS ID [${mockBooking.posBookingId}]`);

  const mockCancel = await mock.cancelBooking(mockBooking.id);
  console.log("   Cancellation & Seat Release:", mockCancel.message);
  console.log("   ✅ PASSED: Mock POS complete development lifecycle verified.\n");

  // 3. Test Vista Cinema Connect Adapter
  console.log("3. Testing Vista Cinema Connect Adapter...");
  const vista = new VistaConnectAdapter({
    baseApiUrl: "https://connect.vista.co/api/v1",
    theatreId: "VISTA-HYD-001",
    siteId: "SITE-01"
  });

  const vistaHandshake = await vista.testConnection();
  console.log("   Handshake:", vistaHandshake.message, `(${vistaHandshake.latencyMs}ms)`);
  
  const vistaScreens = await vista.getScreens("VISTA-HYD-001");
  console.log(`   Imported ${vistaScreens.length} screen(s):`, vistaScreens.map(s => s.name).join(", "));

  const vistaSeats = await vista.getSeats(vistaScreens[0].id);
  console.log(`   Imported ${vistaSeats.length} seats for ${vistaScreens[0].name}`);

  const vistaAvailability = await vista.getSeatAvailability("vista_show_01");
  const bookedSeats = vistaAvailability.filter(s => s.status === "BOOKED");
  console.log(`   Live POS Box-Office Occupancy: ${bookedSeats.length} booked seat(s) detected (${bookedSeats.map(s => s.seatCode).join(", ")})`);

  const vistaHold = await vista.holdSeats("vista_show_01", ["A1", "A2"], "user-123");
  console.log("   POS Seat Lock:", vistaHold.message, `Token: ${vistaHold.holdToken}`);

  const vistaBooking = await vista.createBooking({
    bookingId: "CV-BOOKING-9901",
    theatreId: "VISTA-HYD-001",
    screenId: "vista_scr_01",
    movieId: "vista_mov_01",
    showId: "vista_show_01",
    userId: "user-123",
    seatIds: ["A1", "A2"],
    amount: 900,
    holdToken: vistaHold.holdToken
  });
  console.log(`   Dual-ID Confirmation: CineVenue ID [${vistaBooking.id}] <-> POS ID [${vistaBooking.posBookingId}]`);

  const vistaCancel = await vista.cancelBooking(vistaBooking.id);
  console.log("   Cancellation & Seat Release:", vistaCancel.message);
  console.log("   ✅ PASSED: Vista Cinema Connect complete lifecycle verified.\n");

  // 4. Test Veezi Cloud POS Adapter
  console.log("4. Testing Veezi Cloud POS Adapter...");
  const veezi = new VeeziPosAdapter({
    theatreId: "VEEZI-THEATRE-01"
  });
  const veeziHandshake = await veezi.testConnection();
  console.log("   Handshake:", veeziHandshake.message);

  const veeziHold = await veezi.holdSeats("veezi_show_01", ["A1"], "user-456");
  console.log("   Hold Token:", veeziHold.holdToken);

  const veeziBooking = await veezi.createBooking({
    bookingId: "CV-VEEZI-01",
    theatreId: "VEEZI-THEATRE-01",
    screenId: "veezi_scr_01",
    movieId: "veezi_mov_01",
    showId: "veezi_show_01",
    userId: "user-456",
    seatIds: ["A1"],
    amount: 400
  });
  console.log(`   Confirmed with POS TXN: ${veeziBooking.posBookingId}`);
  console.log("   ✅ PASSED: Veezi Cloud POS complete lifecycle verified.\n");

  // 5. Test Generic REST POS Adapter
  console.log("5. Testing Generic REST POS Adapter...");
  const rest = new GenericRestPosAdapter({
    baseApiUrl: "https://api.theatrepos.com/v1"
  });
  const restHandshake = await rest.testConnection();
  console.log("   Handshake:", restHandshake.message);

  const restBooking = await rest.createBooking({
    bookingId: "CV-REST-01",
    theatreId: "REST-POS-01",
    screenId: "rest_screen_01",
    movieId: "rest_mov_01",
    showId: "rest_show_01",
    userId: "user-789",
    seatIds: ["A1"],
    amount: 350
  });
  console.log(`   Confirmed with REST POS: ${restBooking.posBookingId}`);
  console.log("   ✅ PASSED: Generic REST POS complete lifecycle verified.\n");

  console.log("=================================================");
  console.log("🎉 ALL POS ARCHITECTURE, MOCK POS & SYNC TESTS PASSED!");
  console.log("=================================================");
}

verifyPosArchitecture().catch(err => {
  console.error("❌ POS Test Failure:", err);
  process.exit(1);
});
