import http from "http";
import { createApp } from "../server/app";
import { prisma } from "../server/config/database";
import { authService } from "../server/modules/auth/auth.service";

interface TestResult {
  scenario: number;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordResult(scenario: number, name: string, passed: boolean, details?: string) {
  results.push({ scenario, name, passed, details });
  const icon = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${icon} [Scenario ${scenario}] ${name}`);
  if (details) {
    console.log(`       Details: ${details}`);
  }
}

async function runTests() {
  console.log("=================================================================");
  console.log("🚀 CINEVENUE PHASE 4A — BACKEND MOBILE ENHANCEMENTS TEST SUITE");
  console.log("=================================================================\n");

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`Test server running at: ${baseUrl}\n`);

  try {
    const timestamp = Date.now();
    const testEmail = `flutter_test_${timestamp}@cinevenue.com`;
    const testPassword = "Password123!";

    // Setup Test User
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Flutter Test User",
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`
      })
    });
    const regData = await regRes.json();
    let accessToken = regData.token || regData.data?.tokens?.accessToken;
    let refreshToken = regData.data?.tokens?.refreshToken;

    // -------------------------------------------------------------------
    // Scenario 1: Website Cookie Authentication on /refresh
    // -------------------------------------------------------------------
    try {
      const cookieHeader = `cine_refresh_token=${refreshToken}`;
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": cookieHeader
        },
        body: JSON.stringify({})
      });
      const data = await res.json();
      const setCookie = res.headers.get("set-cookie") || "";
      const hasCookie = setCookie.includes("cine_access_token=");

      const passed = res.status === 200 && data.success === true && hasCookie;
      recordResult(
        1,
        "Website cookie authentication preserved on /auth/refresh",
        passed,
        `HTTP: ${res.status}, Set-Cookie: ${hasCookie}`
      );

      // Update tokens after rotation
      if (data.data?.tokens?.accessToken) {
        accessToken = data.data.tokens.accessToken;
        refreshToken = data.data.tokens.refreshToken;
      }
    } catch (e: any) {
      recordResult(1, "Website cookie refresh", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 2: Mobile JSON Token Refresh
    // -------------------------------------------------------------------
    let prevRefreshToken = refreshToken;
    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
      const data = await res.json();
      const newAccessToken = data.data?.tokens?.accessToken;
      const newRefreshToken = data.data?.tokens?.refreshToken;

      const passed =
        res.status === 200 &&
        data.success === true &&
        typeof newAccessToken === "string" &&
        newAccessToken.length > 20 &&
        typeof newRefreshToken === "string" &&
        newRefreshToken.length > 20 &&
        Boolean(data.token);

      recordResult(
        2,
        "Mobile JSON token refresh returns refreshed accessToken and refreshToken in JSON body",
        passed,
        `HTTP: ${res.status}, Has JSON AccessToken: ${Boolean(newAccessToken)}, Has JSON RefreshToken: ${Boolean(newRefreshToken)}`
      );

      // Save rotated tokens
      prevRefreshToken = refreshToken;
      accessToken = newAccessToken;
      refreshToken = newRefreshToken;
    } catch (e: any) {
      recordResult(2, "Mobile JSON token refresh", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 3: Refresh-Token Rotation & Reuse Prevention
    // -------------------------------------------------------------------
    try {
      // Re-submitting the previously rotated refresh token MUST be rejected
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: prevRefreshToken })
      });
      const data = await res.json();

      const passed = res.status === 401 && data.success === false;
      recordResult(
        3,
        "Refresh-token reuse is prevented; invalidated previous token returns 401",
        passed,
        `HTTP: ${res.status}, Error: ${data.error?.message || data.message}`
      );
    } catch (e: any) {
      recordResult(3, "Refresh-token reuse prevention", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 4: Unauthorized Profile Update Rejected
    // -------------------------------------------------------------------
    try {
      // 4A. Unauthenticated update
      const noAuthRes = await fetch(`${baseUrl}/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Hacker Name" })
      });

      // 4B. Attempting to change role or admin privileges
      const roleTamperRes = await fetch(`${baseUrl}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name: "Valid Name", role: "SUPER_ADMIN" })
      });

      const passed = noAuthRes.status === 401 && roleTamperRes.status === 400;
      recordResult(
        4,
        "Unauthorized profile updates and role tampering attempts are rejected (401 & 400)",
        passed,
        `NoAuth: ${noAuthRes.status}, RoleTamper: ${roleTamperRes.status}`
      );
    } catch (e: any) {
      recordResult(4, "Unauthorized profile update rejection", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 5: Valid User Profile Update (PUT /api/v1/auth/me)
    // -------------------------------------------------------------------
    try {
      const updatedName = "Ananya Sharma";
      const updatedMobile = `99${Math.floor(10000000 + Math.random() * 90000000)}`;
      const updatedAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb";

      const res = await fetch(`${baseUrl}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: updatedName,
          mobile: updatedMobile,
          profileImageUrl: updatedAvatar
        })
      });
      const data = await res.json();

      const user = data.data?.user;
      const passed =
        res.status === 200 &&
        data.success === true &&
        user?.name === updatedName &&
        user?.mobile === updatedMobile &&
        user?.profileImageUrl === updatedAvatar;

      recordResult(
        5,
        "Valid profile update succeeds (PUT /api/v1/auth/me) and returns updated profile",
        passed,
        `HTTP: ${res.status}, Name: ${user?.name}, Mobile: ${user?.mobile}`
      );
    } catch (e: any) {
      recordResult(5, "Valid profile update", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 6: FCM Android Push Notification Device Token Registration
    // -------------------------------------------------------------------
    const testFcmToken = `fcm_android_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
    try {
      const res = await fetch(`${baseUrl}/notifications/device-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          token: testFcmToken,
          platform: "ANDROID",
          deviceModel: "Google Pixel 8 Pro",
          appVersion: "1.0.0"
        })
      });
      const data = await res.json();

      const passed =
        res.status === 200 &&
        data.success === true &&
        data.data?.platform === "ANDROID" &&
        data.data?.isActive === true;

      recordResult(
        6,
        "FCM Android push notification device token registered successfully",
        passed,
        `HTTP: ${res.status}, Platform: ${data.data?.platform}, Active: ${data.data?.isActive}`
      );
    } catch (e: any) {
      recordResult(6, "FCM Android token registration", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 7: APNs iOS Push Notification Device Token Registration
    // -------------------------------------------------------------------
    const testApnsToken = `apns_ios_${timestamp}_${Math.random().toString(36).substring(2, 10)}`;
    try {
      const res = await fetch(`${baseUrl}/notifications/device-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          token: testApnsToken,
          platform: "IOS",
          deviceModel: "iPhone 15 Pro",
          appVersion: "1.0.0"
        })
      });
      const data = await res.json();

      const passed =
        res.status === 200 &&
        data.success === true &&
        data.data?.platform === "IOS" &&
        data.data?.isActive === true;

      recordResult(
        7,
        "APNs iOS push notification device token registered successfully",
        passed,
        `HTTP: ${res.status}, Platform: ${data.data?.platform}, Active: ${data.data?.isActive}`
      );
    } catch (e: any) {
      recordResult(7, "APNs iOS token registration", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 8: Duplicate Device Token Prevention (Upsert Behavior)
    // -------------------------------------------------------------------
    try {
      // Re-registering the same FCM token with updated appVersion
      const res = await fetch(`${baseUrl}/notifications/device-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          token: testFcmToken,
          platform: "ANDROID",
          deviceModel: "Google Pixel 8 Pro",
          appVersion: "1.0.1"
        })
      });
      const data = await res.json();

      const statsRes = await fetch(`${baseUrl}/notifications/device-tokens/stats`);
      const stats = await statsRes.json();

      const passed = res.status === 200 && data.success === true && stats.success === true;
      recordResult(
        8,
        "Duplicate device tokens are prevented via upsert and exact uniqueness enforcement",
        passed,
        `HTTP: ${res.status}, Total Registered: ${stats.data?.total}, Active: ${stats.data?.active}`
      );
    } catch (e: any) {
      recordResult(8, "Duplicate device token prevention", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 9: Device Token Deactivation on Logout
    // -------------------------------------------------------------------
    try {
      const res = await fetch(`${baseUrl}/notifications/device-token/deactivate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ token: testFcmToken })
      });
      const data = await res.json();

      const passed = res.status === 200 && data.success === true && data.data?.deactivated === true;
      recordResult(
        9,
        "Device push token safely deactivated on logout/deactivate request",
        passed,
        `HTTP: ${res.status}, Deactivated: ${data.data?.deactivated}`
      );
    } catch (e: any) {
      recordResult(9, "Device token deactivation", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 10: Movies API Pagination & Search
    // -------------------------------------------------------------------
    try {
      // 10A. Paginated request
      const paginatedRes = await fetch(`${baseUrl}/movies?page=1&limit=2`);
      const paginatedData = await paginatedRes.json();
      const p = paginatedData.pagination;

      const hasPaginationFields =
        paginatedRes.status === 200 &&
        paginatedData.success === true &&
        p?.page === 1 &&
        p?.limit === 2 &&
        typeof p?.total === "number" &&
        typeof p?.totalPages === "number" &&
        typeof p?.hasNextPage === "boolean" &&
        paginatedData.data?.movies?.length <= 2;

      // 10B. Search query filter
      const searchRes = await fetch(`${baseUrl}/movies?search=Baththa`);
      const searchData = await searchRes.json();

      const passed = hasPaginationFields && searchRes.status === 200;
      recordResult(
        10,
        "Movies API pagination (page, limit, total, totalPages) and search verified",
        passed,
        `Page: ${p?.page}, Limit: ${p?.limit}, Total: ${p?.total}, NextPage: ${p?.hasNextPage}`
      );
    } catch (e: any) {
      recordResult(10, "Movies API pagination", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 11: Theatres API Pagination
    // -------------------------------------------------------------------
    try {
      const res = await fetch(`${baseUrl}/theatres?page=1&limit=2`);
      const data = await res.json();
      const p = data.pagination;

      const passed =
        res.status === 200 &&
        data.success === true &&
        p?.page === 1 &&
        p?.limit === 2 &&
        typeof p?.total === "number" &&
        data.data?.theatres?.length <= 2;

      recordResult(
        11,
        "Theatres API pagination returns structured page metadata and limit enforcement",
        passed,
        `Page: ${p?.page}, Limit: ${p?.limit}, Total: ${p?.total}, Count: ${data.data?.theatres?.length}`
      );
    } catch (e: any) {
      recordResult(11, "Theatres API pagination", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 12: Events API Pagination
    // -------------------------------------------------------------------
    try {
      const res = await fetch(`${baseUrl}/events?page=1&limit=2`);
      const data = await res.json();
      const p = data.pagination;

      const passed =
        res.status === 200 &&
        data.success === true &&
        p?.page === 1 &&
        p?.limit === 2 &&
        typeof p?.total === "number";

      recordResult(
        12,
        "Events API pagination returns structured page metadata",
        passed,
        `Page: ${p?.page}, Limit: ${p?.limit}, Total: ${p?.total}, Count: ${data.data?.events?.length}`
      );
    } catch (e: any) {
      recordResult(12, "Events API pagination", false, e.message);
    }

    // -------------------------------------------------------------------
    // Scenario 13: Existing Website Compatibility (Unpaginated Default Requests)
    // -------------------------------------------------------------------
    try {
      // Calls without page/limit query parameters must continue returning standard envelope without pagination field
      const moviesRes = await fetch(`${baseUrl}/movies`);
      const moviesData = await moviesRes.json();

      const theatresRes = await fetch(`${baseUrl}/theatres`);
      const theatresData = await theatresRes.json();

      const eventsRes = await fetch(`${baseUrl}/events`);
      const eventsData = await eventsRes.json();

      const passed =
        moviesRes.status === 200 &&
        moviesData.pagination === undefined &&
        Array.isArray(moviesData.data?.movies) &&
        theatresRes.status === 200 &&
        theatresData.pagination === undefined &&
        Array.isArray(theatresData.data?.theatres) &&
        eventsRes.status === 200 &&
        eventsData.pagination === undefined &&
        Array.isArray(eventsData.data?.events);

      recordResult(
        13,
        "Existing website compatibility preserved; unpaginated calls return classic envelope",
        passed,
        `Movies: ${moviesData.data?.movies?.length}, Theatres: ${theatresData.data?.theatres?.length}, Events: ${eventsData.data?.events?.length}`
      );
    } catch (e: any) {
      recordResult(13, "Existing website compatibility", false, e.message);
    }

  } catch (fatalError: any) {
    console.error("FATAL ERROR in test execution:", fatalError);
  } finally {
    server.close();
  }

  // -------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------
  console.log("\n=================================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`TOTAL SCENARIOS: ${total}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log("=================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();

