import {
  isSubwebsitePath,
  isSubwebsiteApiPath,
  isExemptRoute,
  checkGlobalSubwebsiteMiddleware,
  renderSubwebsiteUnavailableHtml
} from "../../server/middleware/subwebsiteGate";
import {
  setTestMaintenanceState,
  invalidateMaintenanceCache
} from "../../server/middleware/maintenance";

export async function runSubwebsiteGateTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results = [];

  // Reset to clean test state
  invalidateMaintenanceCache();

  // Test 1: isSubwebsitePath accurately detects all subwebsite direct browser routes
  try {
    const validPaths = [
      "/production",
      "/production/casting",
      "/events",
      "/events/summer-gala",
      "/promotions",
      "/film-production",
      "/event-management",
      "/media-promotion",
      "/services",
      "/services/film-production"
    ];
    const invalidPaths = [
      "/",
      "/movies",
      "/movie/kalki-2898",
      "/theatres",
      "/adminpanel",
      "/admin/dashboard",
      "/login",
      "/cinecoins"
    ];

    let allPassed = true;
    for (const p of validPaths) {
      if (!isSubwebsitePath(p)) {
        allPassed = false;
        results.push({ name: `Subwebsite Path: Should match '${p}'`, passed: false, error: "Returned false" });
      }
    }
    for (const p of invalidPaths) {
      if (isSubwebsitePath(p)) {
        allPassed = false;
        results.push({ name: `Subwebsite Path: Should NOT match '${p}'`, passed: false, error: "Returned true" });
      }
    }

    if (allPassed) {
      results.push({ name: "Subwebsite Path Detector: Correctly matches all sub-website direct URLs", passed: true });
    }
  } catch (err: any) {
    results.push({ name: "Subwebsite Path Detector Error", passed: false, error: err.message });
  }

  // Test 2: isSubwebsiteApiPath accurately identifies sub-website backend APIs
  try {
    const validApis = [
      "/api/v1/events",
      "/api/v1/events/featured",
      "/api/v1/marketplace",
      "/api/v1/marketplace/jobs",
      "/api/production/castings"
    ];
    const invalidApis = [
      "/api/v1/movies",
      "/api/v1/theatres",
      "/api/v1/bookings/create",
      "/api/v1/auth/login",
      "/api/v1/admin/settings"
    ];

    let allPassed = true;
    for (const api of validApis) {
      if (!isSubwebsiteApiPath(api)) {
        allPassed = false;
        results.push({ name: `Subwebsite API: Should match '${api}'`, passed: false, error: "Returned false" });
      }
    }
    for (const api of invalidApis) {
      if (isSubwebsiteApiPath(api)) {
        allPassed = false;
        results.push({ name: `Subwebsite API: Should NOT match '${api}'`, passed: false, error: "Returned true" });
      }
    }

    if (allPassed) {
      results.push({ name: "Subwebsite API Detector: Correctly classifies sub-website API endpoints", passed: true });
    }
  } catch (err: any) {
    results.push({ name: "Subwebsite API Detector Error", passed: false, error: err.message });
  }

  // Test 3: isExemptRoute safeguards admin, auth, and static assets from interception
  try {
    const exemptRoutes = [
      "/adminpanel",
      "/admin",
      "/admin/movies",
      "/api/v1/admin/dashboard",
      "/api/v1/auth/login",
      "/api/v1/payments/webhook",
      "/api/v1/health",
      "/health",
      "/assets/index.js",
      "/assets/style.css",
      "/favicon.ico",
      "/@vite/client"
    ];

    let allExempt = true;
    for (const route of exemptRoutes) {
      if (!isExemptRoute(route)) {
        allExempt = false;
        results.push({ name: `Exempt Check: Should exempt '${route}'`, passed: false, error: "Returned false" });
      }
    }

    if (allExempt) {
      results.push({ name: "Exemption Gate: Admin, auth, and asset routes are strictly protected", passed: true });
    }
  } catch (err: any) {
    results.push({ name: "Exemption Gate Error", passed: false, error: err.message });
  }

  // Test 4: Direct browser navigation to disabled sub-website returns HTTP 503 HTML with Back button
  try {
    setTestMaintenanceState({
      globalSubwebsiteEnabled: false,
      subwebsiteMaintenanceMessage: "Custom test maintenance active across all sub-websites."
    });

    let statusCode: number | null = null;
    let contentType: string | null = null;
    let responseBody = "";
    let nextCalled = false;

    const mockReq: any = {
      method: "GET",
      originalUrl: "/production",
      headers: { accept: "text/html,application/xhtml+xml" }
    };
    const mockRes: any = {
      setHeader: (name: string, val: string) => {
        if (name.toLowerCase() === "content-type") contentType = val;
      },
      status: (code: number) => {
        statusCode = code;
        return {
          send: (html: string) => {
            responseBody = html;
          }
        };
      }
    };
    const mockNext = () => {
      nextCalled = true;
    };

    await checkGlobalSubwebsiteMiddleware(mockReq, mockRes, mockNext);

    if (
      !nextCalled &&
      statusCode === 503 &&
      contentType?.includes("text/html") &&
      responseBody.includes("SUB-WEBSITE TEMPORARILY UNAVAILABLE") &&
      responseBody.includes("Back to CineVenue Home")
    ) {
      results.push({
        name: "Direct Browser Gate: Intercepts /production with HTTP 503 HTML maintenance screen",
        passed: true
      });
    } else {
      results.push({
        name: "Direct Browser Gate: Failed to block /production properly",
        passed: false,
        error: `statusCode: ${statusCode}, nextCalled: ${nextCalled}, containsTitle: ${responseBody.includes("SUB-WEBSITE TEMPORARILY UNAVAILABLE")}`
      });
    }
  } catch (err: any) {
    results.push({ name: "Direct Browser Gate Error", passed: false, error: err.message });
  }

  // Test 5: Sub-website API request returns HTTP 503 JSON when disabled
  try {
    setTestMaintenanceState({
      globalSubwebsiteEnabled: false,
      subwebsiteMaintenanceMessage: "Sub-websites offline for upgrade."
    });

    let statusCode: number | null = null;
    let jsonResponse: any = null;
    let nextCalled = false;

    const mockReq: any = {
      method: "GET",
      originalUrl: "/api/v1/events/categories",
      headers: { accept: "application/json" }
    };
    const mockRes: any = {
      setHeader: () => {},
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

    await checkGlobalSubwebsiteMiddleware(mockReq, mockRes, mockNext);

    if (
      !nextCalled &&
      statusCode === 503 &&
      jsonResponse?.success === false &&
      jsonResponse?.subWebsiteEnabled === false &&
      jsonResponse?.code === "SUB_WEBSITE_DISABLED"
    ) {
      results.push({
        name: "API Gate: Returns HTTP 503 JSON { success: false, subWebsiteEnabled: false }",
        passed: true
      });
    } else {
      results.push({
        name: "API Gate: Failed to return 503 JSON",
        passed: false,
        error: `statusCode: ${statusCode}, nextCalled: ${nextCalled}, json: ${JSON.stringify(jsonResponse)}`
      });
    }
  } catch (err: any) {
    results.push({ name: "API Gate Error", passed: false, error: err.message });
  }

  // Test 6: Requests proceed unimpeded when sub-websites are ONLINE (globalSubwebsiteEnabled = true)
  try {
    setTestMaintenanceState({
      globalSubwebsiteEnabled: true
    });

    let nextCalled = false;
    let statusCode: number | null = null;

    const mockReq: any = {
      method: "GET",
      originalUrl: "/production",
      headers: { accept: "text/html" }
    };
    const mockRes: any = {
      setHeader: () => {},
      status: (code: number) => {
        statusCode = code;
        return { send: () => {} };
      }
    };
    const mockNext = () => {
      nextCalled = true;
    };

    await checkGlobalSubwebsiteMiddleware(mockReq, mockRes, mockNext);

    if (nextCalled && statusCode === null) {
      results.push({
        name: "Online State: Allows normal access to sub-websites when switch is ON",
        passed: true
      });
    } else {
      results.push({
        name: "Online State: Erroneously blocked when switch was ON",
        passed: false,
        error: `statusCode: ${statusCode}, nextCalled: ${nextCalled}`
      });
    }
  } catch (err: any) {
    results.push({ name: "Online State Error", passed: false, error: err.message });
  }

  // Test 7: Main movie ticketing, homepage, and admin are never blocked even when sub-websites are disabled
  try {
    setTestMaintenanceState({
      globalSubwebsiteEnabled: false
    });

    const testRoutes = [
      "/",
      "/movie/kalki-2898",
      "/theatres",
      "/theatre-selection",
      "/adminpanel",
      "/api/v1/movies",
      "/api/v1/theatres"
    ];

    let allAllowed = true;
    for (const route of testRoutes) {
      let nextCalled = false;
      let statusCode: number | null = null;

      const mockReq: any = {
        method: "GET",
        originalUrl: route,
        headers: { accept: "text/html" }
      };
      const mockRes: any = {
        setHeader: () => {},
        status: (code: number) => {
          statusCode = code;
          return { send: () => {}, json: () => {} };
        }
      };
      const mockNext = () => {
        nextCalled = true;
      };

      await checkGlobalSubwebsiteMiddleware(mockReq, mockRes, mockNext);
      if (!nextCalled || statusCode !== null) {
        allAllowed = false;
        results.push({
          name: `Critical Route Protection: Unintentionally blocked '${route}'`,
          passed: false,
          error: `statusCode: ${statusCode}, nextCalled: ${nextCalled}`
        });
      }
    }

    if (allAllowed) {
      results.push({
        name: "Non-Subwebsite Route Protection: Main ticketing, Home, and Admin are never blocked",
        passed: true
      });
    }
  } catch (err: any) {
    results.push({ name: "Route Protection Error", passed: false, error: err.message });
  }

  return results;
}
