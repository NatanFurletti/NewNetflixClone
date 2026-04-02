// src/interfaces/http/utils/RateLimitStore.ts
import { ICacheService } from '../../../infrastructure/cache/RedisCache';

interface HitData {
  totalHits: number;
  resetTime: number; // epoch ms
}

/**
 * Custom express-rate-limit Store backed by ICacheService (Redis or InMemory).
 * Works correctly in multi-instance deployments when Redis is configured.
 */
export class CacheRateLimitStore {
  private windowMs: number = 60_000;

  constructor(private cacheService: ICacheService) {}

  /** Called by express-rate-limit with the resolved options */
  init(options: { windowMs: number }): void {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<{ totalHits: number; resetTime: Date }> {
    const ttlSeconds = Math.ceil(this.windowMs / 1000);
    const existing = await this.cacheService.get<HitData>(`rl:${key}`);

    const now = Date.now();
    const resetTime = existing?.resetTime ?? now + this.windowMs;
    const totalHits = (existing?.totalHits ?? 0) + 1;

    await this.cacheService.set<HitData>(`rl:${key}`, { totalHits, resetTime }, ttlSeconds);

    return { totalHits, resetTime: new Date(resetTime) };
  }

  async decrement(key: string): Promise<void> {
    const existing = await this.cacheService.get<HitData>(`rl:${key}`);
    if (!existing || existing.totalHits <= 0) return;

    const ttlSeconds = Math.ceil(this.windowMs / 1000);
    await this.cacheService.set<HitData>(
      `rl:${key}`,
      { ...existing, totalHits: existing.totalHits - 1 },
      ttlSeconds,
    );
  }

  async resetKey(key: string): Promise<void> {
    await this.cacheService.delete(`rl:${key}`);
  }
}
