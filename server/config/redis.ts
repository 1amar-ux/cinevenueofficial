import Redis from "ioredis";
import { logger } from "../shared/logger";

export interface RedisClientInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  setnx(key: string, value: string, durationSeconds?: number): Promise<boolean>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  flushall(): Promise<string>;
  keys(pattern: string): Promise<string[]>;
  isHealthy(): Promise<boolean>;
}

// Atomic Lua script for distributed seat locking with owner re-acquisition / TTL refresh
const SETNX_OWNER_REFRESH_LUA = `
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
`;

export class IORedisClientWrapper implements RedisClientInterface {
  private client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 100, 2000)
    });

    this.client.on("error", (err) => {
      logger.warn(`[Redis:Live] Connection error: ${err.message}`);
    });
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string | null> {
    if (mode === "EX" && duration) {
      return await this.client.set(key, value, "EX", duration);
    }
    return await this.client.set(key, value);
  }

  async setnx(key: string, value: string, durationSeconds = 300): Promise<boolean> {
    const res = await this.client.eval(SETNX_OWNER_REFRESH_LUA, 1, key, value, durationSeconds);
    return Number(res) === 1;
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  async flushall(): Promise<string> {
    return await this.client.flushall();
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async isHealthy(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === "PONG";
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.client.disconnect();
  }
}

// In-Memory Fail-Safe Implementation for local dev or when Redis server is not yet provisioned
export class InMemoryRedisFallback implements RedisClientInterface {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<string | null> {
    const expiresAt = mode === "EX" && duration ? Date.now() + duration * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
    return "OK";
  }

  // Atomic Set-if-Not-Exists for distributed seat locking (idempotent for same owner)
  async setnx(key: string, value: string, durationSeconds = 300): Promise<boolean> {
    const existing = await this.get(key);
    if (existing !== null && existing !== value) {
      return false; // Already locked by another user
    }
    const expiresAt = Date.now() + durationSeconds * 1000;
    this.store.set(key, { value, expiresAt });
    return true;
  }

  async del(key: string): Promise<number> {
    const deleted = this.store.delete(key);
    return deleted ? 1 : 0;
  }

  async exists(key: string): Promise<number> {
    const val = await this.get(key);
    return val !== null ? 1 : 0;
  }

  async flushall(): Promise<string> {
    this.store.clear();
    return "OK";
  }

  async keys(pattern: string): Promise<string[]> {
    const now = Date.now();
    const result: string[] = [];
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    for (const [k, v] of this.store.entries()) {
      if (v.expiresAt && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      if (regex.test(k)) {
        result.push(k);
      }
    }
    return result;
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }
}

// Fail-closed client for production when live Redis is unconfigured or unavailable
export class FailingClosedProductionRedisClient implements RedisClientInterface {
  private reason: string;

  constructor(reason = "Production requires a live, shared Redis cluster (REDIS_URL). In-memory fallback is strictly blocked.") {
    this.reason = reason;
  }

  async get(): Promise<string | null> {
    return null;
  }

  async set(): Promise<string | null> {
    throw new Error(`[Redis:ProductionFailClosed] ${this.reason}`);
  }

  async setnx(): Promise<boolean> {
    logger.error(`[Redis:ProductionFailClosed] Seat lock blocked: ${this.reason}`);
    throw new Error(`[Redis:ProductionFailClosed] Seat lock unavailable: ${this.reason}`);
  }

  async del(): Promise<number> {
    return 0;
  }

  async exists(): Promise<number> {
    return 0;
  }

  async flushall(): Promise<string> {
    return "OK";
  }

  async keys(): Promise<string[]> {
    return [];
  }

  async isHealthy(): Promise<boolean> {
    return false;
  }
}

export function validateRedisConfiguration(): { isReady: boolean; mode: "LIVE" | "FALLBACK" | "FAIL_CLOSED"; error?: string } {
  const isProd = process.env.NODE_ENV === "production";
  const redisUrl = process.env.REDIS_URL;

  if (isProd) {
    if (!redisUrl || redisUrl.includes("localhost") || redisUrl.includes("127.0.0.1")) {
      return {
        isReady: false,
        mode: "FAIL_CLOSED",
        error: "Production multi-instance deployments require an external shared Redis instance (REDIS_URL must point to a live cluster, not localhost)."
      };
    }
    return { isReady: true, mode: "LIVE" };
  }

  if (redisUrl && !redisUrl.includes("localhost") && !redisUrl.includes("127.0.0.1")) {
    return { isReady: true, mode: "LIVE" };
  }

  return { isReady: true, mode: "FALLBACK" };
}

function initializeRedisClient(): RedisClientInterface {
  const isProd = process.env.NODE_ENV === "production";
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl && (isProd || (!redisUrl.includes("localhost") && !redisUrl.includes("127.0.0.1")))) {
    try {
      logger.info(`[Redis] Connecting to live external Redis instance: ${redisUrl.replace(/\/\/[^@]+@/, "//***@")}`);
      return new IORedisClientWrapper(redisUrl);
    } catch (err: any) {
      if (isProd) {
        logger.error(`[Redis:Production] Failed to initialize live Redis: ${err.message}. Activating fail-closed protection.`);
        return new FailingClosedProductionRedisClient(`Failed to initialize live Redis: ${err.message}`);
      }
    }
  }

  if (isProd) {
    logger.error("[Redis:Production] No external REDIS_URL provided in production! Failing closed to prevent multi-instance race conditions.");
    return new FailingClosedProductionRedisClient("Missing or invalid REDIS_URL in production mode.");
  }

  logger.info("[Redis:Dev] Initialized In-Memory Redis fallback for development and isolated unit testing.");
  return new InMemoryRedisFallback();
}

export const redis: RedisClientInterface = initializeRedisClient();
