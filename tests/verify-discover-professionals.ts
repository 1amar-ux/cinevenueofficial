import http from "http";
import { createApp } from "../server/app";

// Polyfill localStorage for Node.js test environment
const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => storageMap.get(k) || null,
  setItem: (k: string, v: string) => storageMap.set(k, String(v)),
  removeItem: (k: string) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

import { 
  discoverProfessionals, 
  fetchProfessionalPublicProfile,
  considerForCastingCall,
  sendProjectInvitation,
  submitProfileReport,
  getProfileReports,
  updateProfileVerificationAdmin,
  updateProfileStatusAdmin
} from "../src/services/filmProductionService";

async function runTests() {
  console.log("=== RUNNING DISCOVER PROFESSIONALS VERIFICATION SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // Spin up live test server to test Express endpoints
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[TEST SERVER] Live API running on ${baseUrl}\n`);

  try {
    // 1. Live Server API - /api/film-production/professionals
    console.log("--- TEST 1: Live Server API Discovery ---");
    const apiRes = await fetch(`${baseUrl}/api/film-production/professionals`);
    assert(apiRes.status === 200, `API HTTP 200 OK: ${baseUrl}/api/film-production/professionals`);
    const apiJson = await apiRes.json();
    assert(apiJson.success === true, "API response has success: true");
    assert(apiJson.data?.professionals?.length > 0, `API returned ${apiJson.data?.professionals?.length} professionals`);

    // Verify privacy sanitization on backend response
    const apiFirst = apiJson.data.professionals[0];
    assert(!apiFirst.phone, "Backend sanitization: phone is stripped from public response");
    assert(!apiFirst.userEmail, "Backend sanitization: email is stripped from public response");
    assert(apiFirst.followers === undefined, "Backend sanitization: zero social vanity metrics");

    // 2. Live Server API - Filter by Role
    console.log("\n--- TEST 2: Live Server API Filter by Role ---");
    const dirRes = await fetch(`${baseUrl}/api/film-production/professionals?role=Director`);
    const dirJson = await dirRes.json();
    assert(dirJson.success === true, "Role filter API returned success");
    assert(dirJson.data.professionals.length > 0, `Found ${dirJson.data.professionals.length} Directors via API`);

    // 3. Live Server API - Public Profile by Username
    console.log("\n--- TEST 3: Live Server API Public Profile Dashboard ---");
    const profileRes = await fetch(`${baseUrl}/api/film-production/professionals/${encodeURIComponent(apiFirst.handle)}`);
    assert(profileRes.status === 200, `Fetched public profile for ${apiFirst.handle}`);
    const profileJson = await profileRes.json();
    assert(profileJson.data?.profile?.fullName === apiFirst.fullName, `Full name verified: ${profileJson.data?.profile?.fullName}`);
    assert(!profileJson.data?.profile?.phone, "Public profile API hides phone");

    // 4. Client Service - discoverProfessionals
    console.log("\n--- TEST 4: Client Service Discovery & Privacy ---");
    const defaultRes = await discoverProfessionals({}, 1, 10);
    assert(defaultRes.professionals.length > 0, `Client service returned ${defaultRes.professionals.length} professionals (total: ${defaultRes.total})`);
    
    const sample = defaultRes.professionals[0];
    assert(!!sample.fullName, `Profile has full name: ${sample.fullName}`);
    assert(!!sample.handle, `Profile has handle: ${sample.handle}`);
    assert(!!sample.primaryCraftName, `Profile has craft: ${sample.primaryCraftName}`);
    assert(!sample.phone, "Private phone is sanitized and NOT exposed");

    // 5. Client Service - Filter by Role
    console.log("\n--- TEST 5: Client Service Filter by Role ---");
    const roleRes = await discoverProfessionals({ role: "Director" }, 1, 10);
    assert(roleRes.professionals.length > 0, `Client found ${roleRes.professionals.length} Directors`);

    // 6. Client Service - Search Query
    console.log("\n--- TEST 6: Client Service Search Query ---");
    const searchRes = await discoverProfessionals({ searchQuery: "Telugu" }, 1, 10);
    assert(searchRes.professionals.length > 0, `Search for 'Telugu' returned ${searchRes.professionals.length} professionals`);

    // 7. Casting Consideration Shortlist
    console.log("\n--- TEST 7: Shortlist for Casting Call ---");
    const considerRes = await considerForCastingCall({
      castingCallId: "cast-test-1",
      projectTitle: "Vayu 2800",
      characterName: "Lead Antagonist",
      candidateUsername: sample.handle || "@kiran_varman",
      candidateName: sample.fullName,
      recruiterEmail: "casting@cinevenue.com",
      recruiterName: "Casting Director",
      notes: "Exceptional stunt and method acting tape",
      stage: "Shortlisted"
    });
    assert(considerRes.id.startsWith("cons-"), `Consideration created with ID: ${considerRes.id}`);

    // 8. Project Invitation
    console.log("\n--- TEST 8: Project Invitation ---");
    const inviteRes = sendProjectInvitation({
      projectId: "proj-test-1",
      projectTitle: "Mahasenani",
      companyName: "Arka Media Works",
      position: "Associate Director",
      senderEmail: "director@cinevenue.com",
      senderName: "Director",
      recipientId: sample.id,
      recipientName: sample.fullName,
      proposedRemuneration: "₹15,00,000",
      workDates: "Dec 2026",
      message: "Formal invitation to collaborate on Mahasenani"
    });
    assert(inviteRes.id.startsWith("inv-"), `Invitation created with ID: ${inviteRes.id}`);

    // 9. Safety & Authenticity Report
    console.log("\n--- TEST 9: Safety & Authenticity Report ---");
    const reportRes = await submitProfileReport({
      targetProfileId: sample.id,
      targetUsername: sample.handle || "@kiran_varman",
      targetFullName: sample.fullName,
      reporterEmail: "filmmaker@cinevenue.com",
      reason: "Misleading Credentials / Fake Filmography",
      details: "Discrepancy in past associate director credit"
    });
    assert(reportRes.id.startsWith("rep-"), `Profile report created with ID: ${reportRes.id}`);

    const allReports = getProfileReports();
    assert(allReports.some(r => r.id === reportRes.id), "Report is persisted in trust & safety moderation queue");

    // 10. Admin Moderation (Verify & Suspend)
    console.log("\n--- TEST 10: Admin Verification & Status Toggles ---");
    const updatedProf = updateProfileVerificationAdmin(sample.id, "Professional Verified");
    assert(updatedProf?.verificationLevel === "Professional Verified", "Verification level updated to Professional Verified");

    const suspendedProf = updateProfileStatusAdmin(sample.id, "Suspended");
    assert(suspendedProf?.status === "Suspended", "Profile status successfully toggled to Suspended");

    // Revert back to active so tests leave state clean
    updateProfileStatusAdmin(sample.id, "Active");
    console.log("Profile status reverted to Active.");

  } catch (err) {
    console.error("Test execution threw an error:", err);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
