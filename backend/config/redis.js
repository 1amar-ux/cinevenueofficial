let Redis;
try {
  Redis = require("ioredis");
} catch (_) {
  try {
    const path = require("path");
    Redis = require(path.join(__dirname, "../node_modules/ioredis"));
  } catch (__) {
    Redis = null;
  }
}

// In-Memory Failover Store for high availability if Redis is offline or not configured
class InMemoryRedisFallback {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, ...args) {
    let ttlSeconds = null;
    let onlyIfNotExists = false;

    // Parse Redis SET options: [ 'EX', 300 ], [ 'NX', 'EX', 300 ], [ 'EX', 300, 'NX' ]
    for (let i = 0; i < args.length; i++) {
      const arg = String(args[i]).toUpperCase();
      if (arg === "EX" && args[i + 1] !== undefined) {
        ttlSeconds = parseInt(args[i + 1], 10);
        i++;
      } else if (arg === "PX" && args[i + 1] !== undefined) {
        ttlSeconds = Math.ceil(parseInt(args[i + 1], 10) / 1000);
        i++;
      } else if (arg === "NX") {
        onlyIfNotExists = true;
      }
    }

    const now = Date.now();

    // Synchronous atomic check-and-set within single JS turn to eliminate microtask interleaving
    if (onlyIfNotExists) {
      const existingItem = this.store.get(key);
      if (existingItem && (!existingItem.expiresAt || existingItem.expiresAt > now)) {
        return null; // Key already exists and active: atomic lock acquisition fails
      }
    }

    const expiresAt = ttlSeconds ? now + ttlSeconds * 1000 : null;
    this.store.set(key, { value: String(value), expiresAt });
    return "OK";
  }

  async del(...keys) {
    const flatKeys = keys.flat();
    let count = 0;
    for (const key of flatKeys) {
      if (this.store.delete(key)) {
        count++;
      }
    }
    return count;
  }

  async ttl(key) {
    const item = this.store.get(key);
    if (!item) return -2; // Key does not exist
    if (!item.expiresAt) return -1; // Key exists but has no TTL
    const remainingMs = item.expiresAt - Date.now();
    if (remainingMs <= 0) {
      this.store.delete(key);
      return -2;
    }
    return Math.ceil(remainingMs / 1000);
  }

  async keys(pattern) {
    const now = Date.now();
    const result = [];
    const regexPattern = new RegExp(
      "^" + pattern.replace(/[*]/g, ".*").replace(/[?]/g, ".") + "$"
    );
    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt && now > item.expiresAt) {
        this.store.delete(key);
        continue;
      }
      if (regexPattern.test(key)) {
        result.push(key);
      }
    }
    return result;
  }

  // Evaluates atomic Lua scripts synchronously (e.g. safe unlock: compare and delete)
  async eval(script, numKeys, ...args) {
    if (numKeys === 1) {
      const key = args[0];
      const expectedVal = args[1];
      const now = Date.now();
      const item = this.store.get(key);

      // Check if this is an unlock (del) or extend (expire) script
      if (script.includes("expire")) {
        const additionalSec = parseInt(args[2], 10) || 300;
        if (item && item.value === String(expectedVal) && (!item.expiresAt || item.expiresAt > now)) {
          item.expiresAt = now + additionalSec * 1000;
          return 1;
        }
        return 0;
      }

      // Default safe unlock (compare and del)
      if (item && item.value === String(expectedVal) && (!item.expiresAt || item.expiresAt > now)) {
        this.store.delete(key);
        return 1;
      }
      return 0;
    }
    return 0;
  }

  async flushall() {
    this.store.clear();
    return "OK";
  }
}

const fallback = new InMemoryRedisFallback();
let liveRedis = null;
let isConnected = false;

// Attempt live Redis connection if configured or default
try {
  if (Redis) {
    const host = process.env.REDIS_HOST || "127.0.0.1";
    const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
    const password = process.env.REDIS_PASSWORD || undefined;

    liveRedis = new Redis({
      host,
      port,
      password,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy(times) {
        if (times > 3) {
          // Stop aggressive retry spam; fallback store will handle locks
          return null;
        }
        return Math.min(times * 1000, 3000);
      },
    });

    liveRedis.on("connect", () => {
      isConnected = true;
      console.log("✅ Redis Connected successfully");
    });

    liveRedis.on("ready", () => {
      isConnected = true;
    });

    liveRedis.on("error", (err) => {
      isConnected = false;
      // Keep error logging clean and non-crashing
      if (process.env.NODE_ENV !== "test") {
        console.warn("⚠️ Redis unavailable, utilizing high-performance in-memory fallback:", err.message);
      }
    });

    liveRedis.on("close", () => {
      isConnected = false;
    });

    // Connect asynchronously in background without blocking server boot
    liveRedis.connect().catch((err) => {
      isConnected = false;
    });
  }
} catch (e) {
  isConnected = false;
  console.warn("⚠️ Redis initialization notice, running in memory-safe mode:", e.message);
}

// Resilient wrapper proxy that delegates to live Redis when connected, and fallback when offline
const redisWrapper = {
  isLive: () => isConnected,

  async get(key) {
    if (isConnected && liveRedis) {
      try {
        return await liveRedis.get(key);
      } catch (err) {
        return await fallback.get(key);
      }
    }
    return await fallback.get(key);
  },

  async set(key, value, ...args) {
    if (isConnected && liveRedis) {
      try {
        return await liveRedis.set(key, value, ...args);
      } catch (err) {
        return await fallback.set(key, value, ...args);
      }
    }
    return await fallback.set(key, value, ...args);
  },

  async del(...keys) {
    if (isConnected && liveRedis) {
      try {
        return await liveRedis.del(...keys);
      } catch (err) {
        return await fallback.del(...keys);
      }
    }
    return await fallback.del(...keys);
  },

  async ttl(key) {
    if (isConnected && liveRedis) {
      try {
        return await liveRedis.ttl(key);
      } catch (err) {
        return await fallback.ttl(key);
      }
    }
    return await fallback.ttl(key);
  },

  async keys(pattern) {
    if (isConnected && liveRedis) {
      try {
        return await liveRedis.keys(pattern);
      } catch (err) {
        return await fallback.keys(pattern);
      }
    }
    return await fallback.keys(pattern);
  },

  async eval(script, numKeys, ...args) {
    if (isConnected && liveRedis) {
      try {
        return await liveRedis.eval(script, numKeys, ...args);
      } catch (err) {
        return await fallback.eval(script, numKeys, ...args);
      }
    }
    return await fallback.eval(script, numKeys, ...args);
  },

  on(event, handler) {
    if (liveRedis) {
      liveRedis.on(event, handler);
    }
  },

  fallbackStore: fallback,
};

module.exports = redisWrapper;
