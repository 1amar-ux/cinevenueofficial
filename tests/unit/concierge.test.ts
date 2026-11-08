import { createApp } from "../../server/app";
import { generateConciergeResponse, getFallbackConciergeResponse } from "../../server/modules/ai/concierge.service";

async function runConciergeTests() {
  console.log("==========================================================================");
  console.log("CINEVENUE AI VIP CONCIERGE INTEGRATION TEST SUITE");
  console.log("==========================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ${details}`);
      failed++;
    }
  }

  // 1. Test fallback logic produces structured action tags
  console.log("--- 1. Testing Fallback Response Generation ---");
  const fallbackMovie = getFallbackConciergeResponse("Show me Coolie tickets in IMAX", "Hyderabad");
  assert(
    fallbackMovie.includes("[[ACTION|movie|Coolie|/booking?search=Coolie"),
    "Movie query includes structured [[ACTION|movie|...]] tag"
  );
  assert(
    fallbackMovie.includes("Prasads IMAX"),
    "Movie query includes flagship venue reference"
  );

  const fallbackEvent = getFallbackConciergeResponse("I want passes for Sunburn Alan Walker", "Hyderabad");
  assert(
    fallbackEvent.includes("[[ACTION|event|Alan Walker Sunburn Arena"),
    "Event query includes structured [[ACTION|event|...]] tag"
  );

  // 2. Test generateConciergeResponse
  console.log("\n--- 2. Testing generateConciergeResponse ---");
  const response = await generateConciergeResponse("Tell me about CineCoins rewards");
  assert(response.success === true, "Response reports success = true");
  assert(typeof response.text === "string" && response.text.length > 20, "Response returns substantive text");
  assert(response.text.includes("[[ACTION|cinecoins"), "Response includes CineCoins action tag");

  // 3. Test Express App Route Handling
  console.log("\n--- 3. Testing Express App Route Integration ---");
  const app = createApp();

  // Test missing prompt validation
  let mockResStatus = 0;
  let mockResJson: any = null;
  const mockRes: any = {
    status: (code: number) => {
      mockResStatus = code;
      return mockRes;
    },
    json: (data: any) => {
      mockResJson = data;
      return mockRes;
    },
    setHeader: () => mockRes
  };

  // We can invoke the app using express request mocking or direct handler testing
  const { handleConciergeRequest } = await import("../../server/modules/ai/concierge.controller");
  
  await handleConciergeRequest({ body: {} } as any, mockRes as any);
  assert(mockResStatus === 400, "Empty prompt returns HTTP 400 Bad Request");
  assert(mockResJson.error === "ValidationError", "Returns ValidationError code");

  await handleConciergeRequest({ body: { prompt: "Book Coolie" } } as any, mockRes as any);
  assert(mockResStatus === 200, "Valid prompt returns HTTP 200 OK");
  assert(mockResJson.success === true, "Returns success = true");
  assert(mockResJson.text.includes("[[ACTION|"), "Returns structured action tags in text");

  console.log("\n==========================================================================");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runConciergeTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
