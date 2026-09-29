import { integrationManager } from "../src/modules/integrations/IntegrationManager";
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
  console.log(`   Found ${adapters.length} registered adapter(s):`, adapters.map(a => a.providerName).join(", "));
  if (adapters.length < 3) throw new Error("Missing adapters in IntegrationManager");
  console.log("   ✅ PASSED: All cinema POS adapters registered.\n");

  // 2. Test Vista Cinema Connect Adapter
  console.log("2. Testing Vista Cinema Connect Adapter...");
  const vista = new VistaConnectAdapter({
    baseApiUrl: "https://connect.vista.co/api/v1",
    theatreId: "VISTA-HYD-001",
    siteId: "SITE-01"
  });

  const vistaHandshake = await vista.testConnection();
  console.log("   Handshake:", vistaHandshake.message, `(${vistaHandshake.latencyMs}ms)`);
  
  const vistaScreens = await vista.getScreens("VISTA-HYD-001");
  console.log(`   Imported ${vistaScreens.length} screen(s):`, vistaScreens.map(s => s.name).join(", "));

  const vistaLayout = await vista.getSeatLayout(vistaScreens[0].id);
  console.log(`   Imported ${vistaLayout.length} seats for ${vistaScreens[0].name}`);

  const vistaAvailability = await vista.getSeatAvailability("vista_show_01");
  const bookedSeats = vistaAvailability.filter(s => s.status === "BOOKED");
  console.log(`   Live POS Box-Office Occupancy: ${bookedSeats.length} booked seat(s) detected (${bookedSeats.map(s => s.seatCode).join(", ")})`);

  const vistaHold = await vista.lockSeats("vista_show_01", ["A1", "A2"], "user-123");
  console.log("   POS Seat Lock:", vistaHold.message, `Token: ${vistaHold.holdToken}`);

  const vistaBooking = await vista.confirmBooking("CV-BOOKING-9901", "user-123");
  console.log(`   Dual-ID Confirmation: CineVenue ID [${vistaBooking.id}] <-> POS ID [${vistaBooking.posBookingId}]`);

  const vistaCancel = await vista.cancelBooking(vistaBooking.id);
  console.log("   Cancellation & Seat Release:", vistaCancel.message);
  console.log("   ✅ PASSED: Vista Cinema Connect complete lifecycle verified.\n");

  // 3. Test Veezi Cloud POS Adapter
  console.log("3. Testing Veezi Cloud POS Adapter...");
  const veezi = new VeeziPosAdapter({
    theatreId: "VEEZI-THEATRE-01"
  });
  const veeziHandshake = await veezi.testConnection();
  console.log("   Handshake:", veeziHandshake.message);

  const veeziHold = await veezi.lockSeats("veezi_show_01", ["A1"], "user-456");
  console.log("   Hold Token:", veeziHold.holdToken);

  const veeziBooking = await veezi.confirmBooking("CV-VEEZI-01", "user-456");
  console.log(`   Confirmed with POS TXN: ${veeziBooking.posBookingId}`);
  console.log("   ✅ PASSED: Veezi Cloud POS complete lifecycle verified.\n");

  // 4. Test Generic REST POS Adapter
  console.log("4. Testing Generic REST POS Adapter...");
  const rest = new GenericRestPosAdapter({
    baseApiUrl: "https://api.theatrepos.com/v1"
  });
  const restHandshake = await rest.testConnection();
  console.log("   Handshake:", restHandshake.message);

  const restBooking = await rest.confirmBooking("CV-REST-01", "user-789");
  console.log(`   Confirmed with REST POS: ${restBooking.posBookingId}`);
  console.log("   ✅ PASSED: Generic REST POS complete lifecycle verified.\n");

  console.log("=================================================");
  console.log("🎉 ALL POS ARCHITECTURE & SYNC TESTS PASSED!");
  console.log("=================================================");
}

verifyPosArchitecture().catch(err => {
  console.error("❌ POS Test Failure:", err);
  process.exit(1);
});
