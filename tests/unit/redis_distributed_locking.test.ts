import { redis } from "../../server/config/redis";

async function runRedisLockingTests() {
  console.log("==========================================================================");
  console.log("CINEVENUE REDIS DISTRIBUTED SEAT LOCKING UNIT TEST SUITE");
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

  const showId = "show_unit_test";
  const seatKey1 = `lock:show:${showId}:seat:S1`;
  const seatKey2 = `lock:show:${showId}:seat:S2`;

  await redis.del(seatKey1);
  await redis.del(seatKey2);

  // 1. Basic Acquisition
  console.log("--- 1. Testing Atomic Lock Acquisition & Anti-Collisions ---");
  const lock1 = await redis.setnx(seatKey1, "user_alice", 10);
  assert(lock1 === true, "Alice acquires lock on S1");

  const lock2 = await redis.setnx(seatKey1, "user_bob", 10);
  assert(lock2 === false, "Bob is blocked from locking S1 while held by Alice");

  // 2. Owner Refresh
  console.log("\n--- 2. Testing Owner Lock Re-acquisition / Refresh ---");
  const refresh = await redis.setnx(seatKey1, "user_alice", 20);
  assert(refresh === true, "Alice can refresh her own lock on S1 without self-collision");

  // 3. Deletion and Handover
  console.log("\n--- 3. Testing Lock Release & Handover ---");
  await redis.del(seatKey1);
  const lockBobAfterDel = await redis.setnx(seatKey1, "user_bob", 10);
  assert(lockBobAfterDel === true, "Bob can acquire S1 after Alice releases it");

  // 4. Batch Rollback Simulation
  console.log("\n--- 4. Testing Multi-Seat Batch Rollback on Partial Collision ---");
  // Pre-condition: S1 is held by Bob. Charlie wants [S2, S1].
  const lockedKeys: string[] = [];
  let batchSucceeded = false;
  try {
    for (const key of [seatKey2, seatKey1]) {
      const ok = await redis.setnx(key, "user_charlie", 10);
      if (!ok) throw new Error(`Lock failed for ${key}`);
      lockedKeys.push(key);
    }
    batchSucceeded = true;
  } catch (err: any) {
    // Rollback
    for (const k of lockedKeys) {
      await redis.del(k);
    }
  }

  assert(batchSucceeded === false, "Charlie batch lock aborted on collision with S1");
  const s2Val = await redis.get(seatKey2);
  assert(s2Val === null, "S2 was rolled back and is completely free (no orphaned locks)");
  const s1Val = await redis.get(seatKey1);
  assert(s1Val === "user_bob", "S1 remains securely locked by Bob");

  // Clean up
  await redis.del(seatKey1);
  await redis.del(seatKey2);

  console.log("\n==========================================================================");
  console.log(`TOTAL PASSED: ${passed} | TOTAL FAILED: ${failed}`);
  console.log("==========================================================================");

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runRedisLockingTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});

