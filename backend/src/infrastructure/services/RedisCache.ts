// src/infrastructure/services/RedisCache.ts
import { createClient, RedisClientType } from 'redis';

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class RedisCache implements ICacheService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;

  constructor(private connectionString: string = 'redis://localhost:6379') {}

  async connect(): Promise<void> {
    this.client = createClient({
      url: this.connectionString,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await this.client.connect();
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected && this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting key ${key} from Redis:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.setEx(
        key,
        ttlSeconds,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error(`Error setting key ${key} in Redis:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key} from Redis:`, error);
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    try {
      await this.client.flushAll();
    } catch (error) {
      console.error('Error clearing Redis:', error);
    }
  }
}
