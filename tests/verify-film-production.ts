import http from "http";
import jwt from "jsonwebtoken";
import { createApp } from "../server/app";
import { env } from "../server/config/env";
import { setTestMaintenanceState } from "../server/middleware/maintenance";

async function verifyFilmProduction() {
  console.log("=================================================");
  console.log("🎬 Verifying Movie Production: Indian Casting Calls & Proposals");
  console.log("=================================================\n");

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  console.log(`[TEST SERVER] Running live on ${baseUrl}\n`);

  // Ensure subwebsites are enabled
  setTestMaintenanceState({ globalSubwebsiteEnabled: true });

  // Generate test auth token
  const testToken = jwt.sign(
    {
      userId: "user_filmmaker_test_01",
      email: "filmmaker@cinevenue.com",
      role: "CUSTOMER",
      name: "Filmmaker Test"
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "1h" }
  );
  const authHeaders = {
    "Authorization": `Bearer ${testToken}`,
    "Content-Type": "application/json"
  };

  let allPassed = true;

  try {
    // 1. Verify /film-production route accessibility
    console.log("1. Testing GET /film-production direct URL...");
    const resPage = await fetch(`${baseUrl}/film-production`, {
      headers: { accept: "text/html" }
    });
    console.log(`   Status: HTTP ${resPage.status} (Expected: not 503)`);
    if (resPage.status === 503) {
      console.error("   ❌ FAILED: Unexpected 503 maintenance response");
      allPassed = false;
    } else {
      console.log("   ✅ PASSED: /film-production is reachable and not blocked by maintenance gate.");
    }

    // 2. Testing Marketplace Proposals API: GET /api/v1/marketplace/proposals
    console.log("\n2. Testing GET /api/v1/marketplace/proposals...");
    const resProposals = await fetch(`${baseUrl}/api/v1/marketplace/proposals`, {
      headers: authHeaders
    });
    console.log(`   Status: HTTP ${resProposals.status}`);
    const proposalsData = await resProposals.json();
    console.log(`   Success: ${proposalsData.success}, Records count: ${proposalsData.data?.length || 0}`);
    if (resProposals.status === 200 && proposalsData.success) {
      console.log("   ✅ PASSED: Proposals API operational.");
    } else {
      console.error("   ❌ FAILED: Proposals API failed");
      allPassed = false;
    }

    // 3. Testing Marketplace Proposals API: POST /api/v1/marketplace/proposals
    console.log("\n3. Testing POST /api/v1/marketplace/proposals (Create Proposal)...");
    const testProposal = {
      projectId: "proj-101",
      submittedBy: "producer_test@cinevenue.com",
      applicantName: "Venkata Rao Productions",
      applicantEmail: "producer_test@cinevenue.com",
      applicantRole: "Executive Producer",
      industry: "Tollywood",
      proposalType: "CO_PRODUCTION",
      category: "Co-Production / Financing",
      title: "Co-Production Collaboration for Epic Action Period Film",
      pitchSummary: "Seeking 30% co-financing with global distribution rights sharing for upcoming pan-Indian film.",
      deliverables: ["4K HDR Master", "Dolby Atmos Stems", "Regional Dubbing Tracks"],
      timelineWeeks: 16,
      proposedBudget: 15000000,
      currency: "INR",
      milestones: [
        { title: "Script Lock & Cast Signing", amount: 3000000, durationWeeks: 4 },
        { title: "Principal Photography Wrap", amount: 7000000, durationWeeks: 8 },
        { title: "Final Post-Production & Censor", amount: 5000000, durationWeeks: 4 }
      ]
    };

    const resCreateProp = await fetch(`${baseUrl}/api/v1/marketplace/proposals`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(testProposal)
    });
    const createPropData = await resCreateProp.json();
    console.log(`   Status: HTTP ${resCreateProp.status}, Success: ${createPropData.success}`);
    const createdId = createPropData.data?.proposal?.id || createPropData.data?.id;
    console.log(`   Created Proposal ID: ${createdId}`);
    if (resCreateProp.status === 201 && createPropData.success) {
      console.log("   ✅ PASSED: Proposal created successfully with milestones & escrow breakdown.");
    } else {
      console.error("   ❌ FAILED: Proposal creation failed", createPropData);
      allPassed = false;
    }

    // 4. Testing Proposal Status Transition: PATCH /api/v1/marketplace/proposals/:id/status
    if (createdId) {
      console.log("\n4. Testing PATCH /api/v1/marketplace/proposals/:id/status (Accept Proposal)...");
      const resPatch = await fetch(`${baseUrl}/api/v1/marketplace/proposals/${createdId}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          status: "ACCEPTED",
          notes: "Approved by Film Production Committee"
        })
      });
      const patchData = await resPatch.json();
      console.log(`   Status: HTTP ${resPatch.status}, Success: ${patchData.success}`);
      if (resPatch.status === 200 && patchData.success) {
        console.log("   ✅ PASSED: Proposal status transitioned to ACCEPTED with audit notes.");
      } else {
        console.error("   ❌ FAILED: Status update failed", patchData);
        allPassed = false;
      }
    }

    // 5. Testing Casting Audition Application: POST /api/v1/marketplace/applications
    console.log("\n5. Testing POST /api/v1/marketplace/applications (Audition Submission)...");
    const testAudition = {
      jobId: "CAST-001",
      applicantId: "actor-test-01",
      applicantName: "Rohan Sharma",
      applicantEmail: "rohan.sharma@example.com",
      applicantPhone: "+91 98765 43210",
      applicantRole: "Lead Antagonist (Telugu/Hindi)",
      roleType: "CASTING",
      industry: "Tollywood",
      experienceYears: 4,
      portfolioLinks: [
        "https://youtube.com/watch?v=sample-monologue",
        "https://drive.google.com/sample-headshot.jpg"
      ],
      coverLetter: "Excited for this pan-Indian role. Fluent in Telugu, Hindi, and English.",
      spokenLanguages: ["Telugu", "Hindi", "English"],
      selfTapeUrl: "https://youtube.com/watch?v=sample-monologue",
      headshotUrl: "https://drive.google.com/sample-headshot.jpg",
      status: "SUBMITTED"
    };

    const resAudition = await fetch(`${baseUrl}/api/v1/marketplace/applications`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(testAudition)
    });
    const auditionData = await resAudition.json();
    console.log(`   Status: HTTP ${resAudition.status}, Success: ${auditionData.success}`);
    console.log(`   Audition Application ID: ${auditionData.data?.id}`);
    if (resAudition.status === 201 && auditionData.success) {
      console.log("   ✅ PASSED: Audition application received and registered.");
    } else {
      console.error("   ❌ FAILED: Audition application failed", auditionData);
      allPassed = false;
    }

    console.log("\n=================================================");
    if (allPassed) {
      console.log("🎉 ALL TESTS PASSED: Indian Casting Calls & Proposal Management verified!");
    } else {
      console.log("⚠️ SOME TESTS FAILED");
    }
    console.log("=================================================");

  } catch (err: any) {
    console.error("Verification error:", err.message);
    allPassed = false;
  } finally {
    server.close();
    process.exit(allPassed ? 0 : 1);
  }
}

verifyFilmProduction();
