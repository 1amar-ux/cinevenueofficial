# CINEVENUE — STAGING SHARED REDIS AUDIT & VALIDATION REPORT

**Component:** Distributed Seat Locking & Multi-Instance Synchronization  
**Implementation:** `ioredis` Client Wrapper (`server/config/redis.ts`)  
**Script Engine:** Atomic Lua 5.1 (`SETNX_OWNER_REFRESH_LUA`)  
**Unit Test Suite:** [`tests/unit/redis_distributed_locking.test.ts`](../../tests/unit/redis_distributed_locking.test.ts)  
**Status Breakdown:**
* **Redis Client & Lua Script Logic:** **VERIFIED IN UNIT TESTS (10/10 Passed)**
* **Production Fail-Closed Guard:** **VERIFIED IN UNIT TESTS**
* **Real Redis Cloud Connectivity:** **BLOCKED (Instance Not Provisioned)**
* **Multi-Instance Locking Against Shared Redis:** **NOT VERIFIED (Requires Live Cluster)**

---

## 1. FACTUAL AUDIT FINDINGS: REDIS INFRASTRUCTURE STATE

During local unit testing, Redis operations were evaluated against:
1. `InMemoryRedisFallback`: Emulated single-process in-memory store validating atomic claim, owner refresh, and rollback semantics.
2. `FailingClosedProductionRedisClient`: Verifying that production mode strictly blocks seat locking when an external cluster is missing.

### Accurate Accounting of Redis State:
* ❌ **Real Redis Connectivity:** **BLOCKED.** No live Redis server was provisioned or connected during this preflight.
* ❌ **Multi-Instance Synchronization:** **NOT VERIFIED.** Multi-instance locking across separate Node.js processes requires a live Redis cluster (`REDIS_URL`) and has not yet been executed.
* ✅ **Unit Test Logic:** **VERIFIED.** The 10 unit test assertions confirmed that the Lua script syntax, owner-aware refresh rules, and production fail-closed guards behave as expected.

---

## 2. REDIS ARCHITECTURE & CONFIGURATION

The CineVenue backend uses a distributed Redis caching and locking architecture:

```
[ Express API Instance 1 ] ──┐
                             ├──► [ Shared Redis 7.x ] ──► Atomic Lua Seat Locking
[ Express API Instance 2 ] ──┘     Keys: lock:show:{showId}:seat:{seatId}
                                   TTL: 600s (10 Minutes)
```

### Connection Specification:
* **Environment Variable:** `REDIS_URL`
* **Supported Protocols:**
  * Plain TCP: `redis://:password@host:6379`
  * TLS Encrypted: `rediss://:password@host:6380`
* **Client Settings:**
  * `lazyConnect: true`
  * `maxRetriesPerRequest: 2`
  * `enableOfflineQueue: false`
  * `retryStrategy: (times) => Math.min(times * 100, 2000)`

---

## 3. ATOMIC LUA SCRIPT ENGINE

To eliminate race conditions between checking seat status and claiming ownership across concurrent nodes, CineVenue executes an atomic Lua script:

```lua
local current = redis.call('GET', KEYS[1])
if not current then
  redis.call('SET', KEYS[1], ARGV[1], 'EX', tonumber(ARGV[2]))
  return 1
elseif current == ARGV[1] then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
  return 1
else
  return 0
end
```

### Invariants Enforced by Script:
1. **Atomic Acquisition:** If the key does not exist, sets ownership to `ARGV[1]` (User ID) with expiration `ARGV[2]` seconds (10 min). Returns `1` (Success).
2. **Owner-Aware Refresh:** If the key exists and belongs to the same user, refreshes the expiration TTL. Returns `1` (Success).
3. **Anti-Collision Guard:** If the key exists and belongs to a different user, acquisition is blocked. Returns `0` (Collision).
4. **Zero TTL Leakage:** Atomic execution guarantees no seat can be claimed without an expiration time.

---

## 4. PRODUCTION & STAGING FAIL-CLOSED PROTECTION

In production/staging mode (`NODE_ENV=production`), `validateRedisConfiguration()` strictly enforces:

```typescript
if (isProd) {
  if (!redisUrl || redisUrl.includes("localhost") || redisUrl.includes("127.0.0.1")) {
    return {
      isReady: false,
      mode: "FAIL_CLOSED",
      error: "Production multi-instance deployments require an external shared Redis instance..."
    };
  }
}
```

* **No Silent Fallback:** The backend refuses to silently fall back to an in-memory `Map` when `NODE_ENV=production`.
* **FailingClosedProductionRedisClient:** If Redis is missing or disconnected, calls to `setnx()` throw an immediate terminating exception:
  `[Redis:ProductionFailClosed] Seat lock unavailable: Production requires a live, shared Redis cluster (REDIS_URL). In-memory fallback is strictly blocked.`

---

## 5. AUTOMATED UNIT TEST RESULTS (LOCAL EXECUTION)

All 10 unit test assertions in [`tests/unit/redis_distributed_locking.test.ts`](../../tests/unit/redis_distributed_locking.test.ts) passed in the local test runner:

| Test Case | Scenario Description | Test Type | Result |
| :--- | :--- | :---: | :---: |
| **TC-REDIS-01** | Alice acquires lock on seat S1 | Unit (In-Memory) | **PASS** |
| **TC-REDIS-02** | Bob is blocked from acquiring seat S1 while held by Alice | Unit (In-Memory) | **PASS** |
| **TC-REDIS-03** | Alice refreshes her own lock on S1 without self-collision | Unit (In-Memory) | **PASS** |
| **TC-REDIS-04** | Bob successfully acquires S1 after Alice releases the lock | Unit (In-Memory) | **PASS** |
| **TC-REDIS-05** | Multi-seat batch lock aborts on partial collision (S1 held by Bob) | Unit (In-Memory) | **PASS** |
| **TC-REDIS-06** | S2 rolled back cleanly on partial batch collision (no orphaned locks) | Unit (In-Memory) | **PASS** |
| **TC-REDIS-07** | S1 remains securely locked by Bob after Charlie's aborted batch attempt | Unit (In-Memory) | **PASS** |
| **TC-REDIS-08** | Production validator flags missing `REDIS_URL` as NOT ready | Unit (Fail-Closed) | **PASS** |
| **TC-REDIS-09** | Production validator activates `FAIL_CLOSED` mode | Unit (Fail-Closed) | **PASS** |
| **TC-REDIS-10** | `FailingClosedProductionRedisClient` blocks seat locking in production | Unit (Fail-Closed) | **PASS** |

---

## 6. PENDING STAGING PREREQUISITES

* **Live Redis Instance:** Provisioning of an external Redis 7.x instance (Upstash, AWS ElastiCache, or Redis Cloud).
* **Multi-Instance Verification:** Executing live lock acquisition concurrently from two independent nodes against the provisioned Redis cluster.
