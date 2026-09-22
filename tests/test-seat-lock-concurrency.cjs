const assert = require("assert");
const seatLockService = require("../backend/services/seatLockService");
const redis = require("../backend/config/redis");

async function runTests() {
  console.log("=================================================");
  console.log("🧪 Starting Seat Lock & Concurrency Resilience Test");
  console.log("=================================================");

  const showId = "show_test_" + Date.now();
  const user1 = "usr_001_alice";
  const user2 = "usr_002_bob";
  const user3 = "usr_003_charlie";

  // Clean any previous test data
  const testSeats = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2"];
  await seatLockService.unlockSeat(showId, testSeats);

  console.log("\n[Test 1] Basic Seat Locking & Expiry Calculation");
  const lockResult = await seatLockService.lockSeat(showId, ["A1", "A2"], user1, 300);
  assert.strictEqual(lockResult.success, true, "Lock should succeed");
  assert.strictEqual(lockResult.lockedSeats.length, 2, "Should have locked 2 seats");
  assert(lockResult.expiresAt > Date.now(), "expiresAt should be in the future");

  const a1Status = await seatLockService.isSeatLocked(showId, "A1");
  assert.strictEqual(a1Status.locked, true, "A1 should report locked");
  assert.strictEqual(a1Status.lockedBy, user1, "A1 should be locked by user1");
  console.log("✅ Test 1 Passed: Seats locked with valid TTL & ownership");

  console.log("\n[Test 2] High-Concurrency Race Condition (10 Concurrent Requests for Same Seat)");
  // 10 concurrent requests from different users competing for seat A3
  const racers = Array.from({ length: 10 }, (_, i) => `racer_${i}`);
  const raceResults = await Promise.allSettled(
    racers.map((racerId) => seatLockService.lockSeat(showId, ["A3"], racerId, 120))
  );

  const successfulLocks = raceResults.filter((r) => r.status === "fulfilled");
  const rejectedLocks = raceResults.filter((r) => r.status === "rejected");

  console.log(`-> Concurrent Requests: ${racers.length}`);
  console.log(`-> Fulfilled (Won lock): ${successfulLocks.length}`);
  console.log(`-> Rejected (Locked out): ${rejectedLocks.length}`);

  assert.strictEqual(successfulLocks.length, 1, "CRITICAL: Exactly ONE request must win the lock");
  assert.strictEqual(rejectedLocks.length, 9, "CRITICAL: Exactly 9 requests must be rejected with 0 double-booking");

  const a3Status = await seatLockService.isSeatLocked(showId, "A3");
  assert.strictEqual(a3Status.locked, true, "Seat A3 must be held by the sole winner");
  console.log("✅ Test 2 Passed: ZERO double-booking under extreme concurrency race");

  console.log("\n[Test 3] Partial Batch Failure & Automatic Compensation Rollback");
  // Pre-lock seat B2 by user2
  await seatLockService.lockSeat(showId, ["B2"], user2, 300);

  // Now user3 attempts to lock batch ["B1", "B2", "B3"]
  // "B1" will acquire first, but "B2" will fail because user2 has it.
  // The system MUST roll back "B1" so user3 doesn't leave "B1" orphaned!
  let batchFailedAsExpected = false;
  try {
    await seatLockService.lockSeat(showId, ["B1", "B2", "B3"], user3, 300);
  } catch (err) {
    batchFailedAsExpected = true;
    assert.strictEqual(err.code, "SEAT_ALREADY_LOCKED", "Error code must be SEAT_ALREADY_LOCKED");
    assert.strictEqual(err.seat, "B2", "Failed seat must report B2");
    console.log(`-> Batch lock correctly aborted: ${err.message}`);
  }
  assert.strictEqual(batchFailedAsExpected, true, "Batch lock must throw error on partial collision");

  // Verify rollback: B1 MUST NOT be locked!
  const b1Status = await seatLockService.isSeatLocked(showId, "B1");
  assert.strictEqual(b1Status.locked, false, "B1 must be rolled back and free!");

  // Verify original lock: B2 must still remain safely with user2
  const b2Status = await seatLockService.isSeatLocked(showId, "B2");
  assert.strictEqual(b2Status.locked, true, "B2 must remain locked by user2");
  assert.strictEqual(b2Status.lockedBy, user2, "B2 owner must remain user2");

  // Verify B3 was never locked
  const b3Status = await seatLockService.isSeatLocked(showId, "B3");
  assert.strictEqual(b3Status.locked, false, "B3 must remain free");
  console.log("✅ Test 3 Passed: Batch compensation rollback succeeded with zero orphaned locks");

  console.log("\n[Test 4] Safe Ownership-Verified Unlock (Anti-Hijack Protection)");
  // User 1 owns A1. User 3 attempts to maliciously or mistakenly unlock A1
  const hijackAttempt = await seatLockService.unlockSeat(showId, ["A1"], user3);
  assert.strictEqual(hijackAttempt.unlockedCount, 0, "Non-owner must NOT be able to unlock seat");

  // Verify A1 is still safely held by user 1
  const a1StillLocked = await seatLockService.isSeatLocked(showId, "A1");
  assert.strictEqual(a1StillLocked.locked, true, "A1 must stay locked");
  assert.strictEqual(a1StillLocked.lockedBy, user1, "A1 owner must still be user1");

  // Legitimate owner user1 unlocks A1
  const legitUnlock = await seatLockService.unlockSeat(showId, ["A1"], user1);
  assert.strictEqual(legitUnlock.unlockedCount, 1, "Legitimate owner unlock must succeed");

  const a1NowFree = await seatLockService.isSeatLocked(showId, "A1");
  assert.strictEqual(a1NowFree.locked, false, "A1 must now be free");
  console.log("✅ Test 4 Passed: Safe Lua ownership validation prevented lock hijacking");

  console.log("\n[Test 5] Query Locked Seats for Show");
  // Currently locked: A2 (by user1), A3 (by racer winner), B2 (by user2)
  const lockedShowMap = await seatLockService.getShowLockedSeats(showId);
  console.log("-> Actively locked seats for show:", Object.keys(lockedShowMap));
  assert(lockedShowMap["A2"], "A2 must appear in show locked map");
  assert(lockedShowMap["A3"], "A3 must appear in show locked map");
  assert(lockedShowMap["B2"], "B2 must appear in show locked map");
  assert.strictEqual(lockedShowMap["A1"], undefined, "A1 was unlocked and must not appear");
  console.log("✅ Test 5 Passed: Real-time locked seats catalog returned accurately");

  console.log("\n[Test 6] Lock Extension & System Unlock");
  // Extend lock for A2
  const extendRes = await seatLockService.extendLock(showId, ["A2"], user1, 600);
  assert.strictEqual(extendRes, true, "Extend lock should succeed");

  // System force unlock (without userId, e.g. after successful payment confirmation)
  const sysUnlock = await seatLockService.unlockSeat(showId, ["A2", "A3", "B2"]);
  assert.strictEqual(sysUnlock.unlockedCount, 3, "System unlock should release all remaining seats");

  const finalMap = await seatLockService.getShowLockedSeats(showId);
  assert.strictEqual(Object.keys(finalMap).length, 0, "All seats must now be free");
  console.log("✅ Test 6 Passed: Lock TTL extension and post-payment cleanup verified");

  console.log("\n=================================================");
  console.log("🎉 ALL SEAT LOCK & CONCURRENCY TESTS PASSED (6/6)");
  console.log("=================================================\n");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
