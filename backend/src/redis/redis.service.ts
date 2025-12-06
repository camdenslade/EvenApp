// backend/src/redis/redis.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  // ====================================================================
  // # REDIS CLIENT INSTANCE
  // ====================================================================
  private client: RedisClientType;

  // ====================================================================
  // # INITIALIZATION (ON MODULE INIT)
  // ====================================================================
  /**
   * Initializes a Redis client on module load.
   * Automatically connects using REDIS_URL from environment variables.
   */
  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });

    this.client.on('error', (err) => console.error('Redis error:', err));

    await this.client.connect();
  }

  // ====================================================================
  // # GET VALUE
  // ====================================================================
  /**
   * Retrieves a value by key from Redis.
   */
  async get(key: string) {
    return this.client.get(key);
  }

  // ====================================================================
  // # SET VALUE
  // ====================================================================
  /**
   * Stores a value in Redis.
   * Optionally sets an expiration TTL (in seconds).
   */
  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      await this.client.set(key, value, { EX: ttlSeconds });
    } else {
      await this.client.set(key, value);
    }
  }

  // ====================================================================
  // # INCREMENT COUNTER
  // ====================================================================
  /**
   * Increments a numeric key's value by 1.
   */
  async increment(key: string) {
    return this.client.incr(key);
  }

  // ====================================================================
  // # DELETE KEY
  // ====================================================================
  /**
   * Removes a key from Redis.
   */
  async delete(key: string) {
    return this.client.del(key);
  }
}
