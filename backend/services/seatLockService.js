const redis = require("../config/redis");

const DEFAULT_LOCK_TTL_SECONDS = 300; // 5 minutes standard ticket hold

// Lua script to atomically release lock ONLY if the current holder matches userId
const LUA_SAFE_UNLOCK = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

// Lua script to extend lock TTL safely
const LUA_EXTEND_LOCK = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("expire", KEYS[1], ARGV[2])
else
  return 0
end
`;

/**
 * Format Redis key for seat lock
 */
const formatKey = (showId, seat) => `show:${showId}:seat:${seat}`;

/**
 * Lock seats atomically for a user with compensation rollback on any contention
 *
 * @param {string} showId - Show Identifier
 * @param {string[]} seatNumbers - Array of seat names, e.g. ["A1", "A2"]
 * @param {string} userId - ID of the booking user
 * @param {number} [ttlSeconds=300] - Lock expiration in seconds
 * @returns {Promise<{success: boolean, showId: string, lockedSeats: string[], expiresAt: number, ttlSeconds: number}>}
 */
exports.lockSeat = async (showId, seatNumbers, userId, ttlSeconds = DEFAULT_LOCK_TTL_SECONDS) => {
  if (!showId) {
    throw new Error("showId is required to lock seats");
  }
  if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    throw new Error("At least one seat number is required");
  }
  if (!userId) {
    throw new Error("userId is required to lock seats");
  }

  const acquiredKeys = [];

  try {
    for (const seat of seatNumbers) {
      const key = formatKey(showId, seat);

      // Atomic SET IF NOT EXISTS with TTL
      // Returns "OK" if key was set, or null if key already exists
      const result = await redis.set(key, String(userId), "NX", "EX", ttlSeconds);

      if (result !== "OK") {
        const error = new Error(`Seat ${seat} is already locked by another customer`);
        error.code = "SEAT_ALREADY_LOCKED";
        error.seat = seat;
        error.showId = showId;
        throw error;
      }

      acquiredKeys.push(key);
    }

    return {
      success: true,
      showId,
      lockedSeats: seatNumbers,
      expiresAt: Date.now() + ttlSeconds * 1000,
      ttlSeconds,
    };
  } catch (error) {
    // Immediate compensation rollback: release any seats locked during this batch
    if (acquiredKeys.length > 0) {
      await Promise.all(
        acquiredKeys.map(async (key) => {
          try {
            await redis.eval(LUA_SAFE_UNLOCK, 1, key, String(userId));
          } catch (_) {
            await redis.del(key);
          }
        })
      );
    }
    throw error;
  }
};

/**
 * Unlock seats safely. If userId is provided, only unlocks if the seat belongs to that user.
 *
 * @param {string} showId - Show Identifier
 * @param {string[]} seatNumbers - Array of seat names, e.g. ["A1", "A2"]
 * @param {string|null} [userId=null] - Optional user ID for ownership check
 */
exports.unlockSeat = async (showId, seatNumbers, userId = null) => {
  if (!showId || !seatNumbers || !Array.isArray(seatNumbers)) {
    return { success: false, unlockedCount: 0 };
  }

  let unlockedCount = 0;

  for (const seat of seatNumbers) {
    const key = formatKey(showId, seat);
    if (userId) {
      // Safe ownership check using atomic Lua script
      const res = await redis.eval(LUA_SAFE_UNLOCK, 1, key, String(userId));
      if (res === 1) unlockedCount++;
    } else {
      // System or Admin force unlock
      const res = await redis.del(key);
      if (res > 0) unlockedCount++;
    }
  }

  return {
    success: true,
    unlockedSeats: seatNumbers,
    unlockedCount,
  };
};

/**
 * Check if a single seat is locked
 */
exports.isSeatLocked = async (showId, seatNumber) => {
  const key = formatKey(showId, seatNumber);
  const lockedBy = await redis.get(key);
  const remainingTtl = lockedBy ? await redis.ttl(key) : null;

  return {
    locked: !!lockedBy,
    lockedBy: lockedBy || null,
    remainingTtl: remainingTtl !== null && remainingTtl > 0 ? remainingTtl : 0,
  };
};

/**
 * Get all actively locked seats for a specific show
 *
 * @param {string} showId
 * @returns {Promise<Record<string, { userId: string, remainingTtl: number, expiresAt: number }>>}
 */
exports.getShowLockedSeats = async (showId) => {
  const pattern = `show:${showId}:seat:*`;
  const keys = await redis.keys(pattern);
  const lockedMap = {};

  if (!keys || keys.length === 0) {
    return lockedMap;
  }

  for (const key of keys) {
    const seatNumber = key.replace(`show:${showId}:seat:`, "");
    const userId = await redis.get(key);
    if (userId) {
      const remainingTtl = await redis.ttl(key);
      const ttlSec = remainingTtl > 0 ? remainingTtl : 0;
      lockedMap[seatNumber] = {
        userId,
        remainingTtl: ttlSec,
        expiresAt: Date.now() + ttlSec * 1000,
      };
    }
  }

  return lockedMap;
};

/**
 * Extend seat lock duration for an active user checkout session
 */
exports.extendLock = async (showId, seatNumbers, userId, additionalSeconds = DEFAULT_LOCK_TTL_SECONDS) => {
  if (!showId || !seatNumbers || !userId) return false;

  for (const seat of seatNumbers) {
    const key = formatKey(showId, seat);
    await redis.eval(LUA_EXTEND_LOCK, 1, key, String(userId), additionalSeconds);
  }

  return true;
};
