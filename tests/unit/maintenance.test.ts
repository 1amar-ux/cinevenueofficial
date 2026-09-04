import { 
  getGlobalAppSettings, 
  checkMovieBookingMaintenance, 
  invalidateMaintenanceCache,
  setTestMaintenanceState 
} from "../../server/middleware/maintenance";

export async function runMaintenanceTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results = [];

  // Reset to clean test state
  invalidateMaintenanceCache();

  // Test 1: Verify getGlobalAppSettings returns valid singleton shape
  try {
    setTestMaintenanceState({
      maintenanceMode: false,
      maintenanceTitle: "Movie Booking Temporarily Unavailable",
      maintenanceMessage: "We are upgrading our ticket booking experience. Movie booking will be available shortly."
    });

    const settings = await getGlobalAppSettings();
    if (
      typeof settings.maintenanceMode === "boolean" &&
      typeof settings.maintenanceTitle === "string" &&
      typeof settings.maintenanceMessage === "string"
    ) {
      results.push({ name: "AppSettings: Returns valid global configuration structure", passed: true });
    } else {
      results.push({ name: "AppSettings: Structure invalid", passed: false, error: JSON.stringify(settings) });
    }
  } catch (err: any) {
    results.push({ name: "AppSettings: Configuration retrieval", passed: false, error: err.message });
  }

  // Test 2: Verify checkMovieBookingMaintenance middleware permits requests when maintenance is OFF
  try {
    setTestMaintenanceState({ maintenanceMode: false });

    let nextCalled = false;
    let statusCode: number | null = null;

    const mockReq: any = { method: "POST", originalUrl: "/api/v1/bookings/lock-seats" };
    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return { json: () => {} };
      }
    };
    const mockNext = () => {
      nextCalled = true;
    };

    await checkMovieBookingMaintenance(mockReq, mockRes, mockNext);

    if (nextCalled && statusCode === null) {
      results.push({ name: "Maintenance Gate: Permits bookings when maintenance is OFF", passed: true });
    } else {
      results.push({ name: "Maintenance Gate: Blocked when maintenance was OFF", passed: false, error: "Expected next() to be called" });
    }
  } catch (err: any) {
    results.push({ name: "Maintenance Gate: Permit test error", passed: false, error: err.message });
  }

  // Test 3: Verify checkMovieBookingMaintenance rejects with HTTP 503 and MOVIE_BOOKING_MAINTENANCE when active
  try {
    setTestMaintenanceState({
      maintenanceMode: true,
      maintenanceTitle: "Platform Upgrades in Progress",
      maintenanceMessage: "Movie booking is temporarily unavailable due to scheduled maintenance."
    });

    let statusCode: number | null = null;
    let jsonResponse: any = null;
    let nextCalled = false;

    const mockReq: any = { method: "POST", originalUrl: "/api/v1/payments/create-order" };
    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonResponse = data;
          }
        };
      }
    };
    const mockNext = () => {
      nextCalled = true;
    };

    await checkMovieBookingMaintenance(mockReq, mockRes, mockNext);

    if (
      !nextCalled && 
      statusCode === 503 && 
      jsonResponse?.code === "MOVIE_BOOKING_MAINTENANCE" &&
      jsonResponse?.success === false
    ) {
      results.push({ name: "Maintenance Gate: Returns HTTP 503 MOVIE_BOOKING_MAINTENANCE when active", passed: true });
    } else {
      results.push({ 
        name: "Maintenance Gate: Failed to reject with 503", 
        passed: false, 
        error: `Got status ${statusCode}, nextCalled=${nextCalled}, code=${jsonResponse?.code}` 
      });
    }
  } catch (err: any) {
    results.push({ name: "Maintenance Gate: Active rejection test error", passed: false, error: err.message });
  }

  // Test 4: Invalidate maintenance cache
  try {
    invalidateMaintenanceCache();
    results.push({ name: "Maintenance Cache: Invalidation succeeds without error", passed: true });
  } catch (err: any) {
    results.push({ name: "Maintenance Cache: Invalidation failed", passed: false, error: err.message });
  }

  return results;
}
