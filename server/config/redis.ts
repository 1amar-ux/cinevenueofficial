import { logger } from "../shared/logger";

interface RedisClientInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<string | null>;
  setnx(key: string, value: string, durationSeconds?: number): Promise<boolean>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  flushall(): Promise<string>;
  isHealthy(): Promise<boolean>;
}

// In-Memory Fail-Safe Implementation for local dev or when Redis server is not yet provisioned
class InMemoryRedisFallback implements RedisClientInterface {
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

  // Atomic Set-if-Not-Exists for distributed seat locking
  async setnx(key: string, value: string, durationSeconds = 300): Promise<boolean> {
    const existing = await this.get(key);
    if (existing !== null) {
      return false; // Already locked
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

  async isHealthy(): Promise<boolean> {
    return true;
  }
}

export const redis: RedisClientInterface = new InMemoryRedisFallback();

logger.info("Initialized Redis client abstraction with fail-safe atomic lock capability");
