import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { CachePort } from '@domain/ports/out/cache.port';

@Injectable()
export class RedisCacheAdapter
  implements CachePort, OnModuleInit, OnModuleDestroy
{
  private redisClient!: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.redisClient = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.redisClient.on('error', (error) => {
      console.warn('Redis client error:', error.message);
    });
  }

  async onModuleDestroy() {
    await this.redisClient?.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const multi = this.redisClient.multi();
    multi.incr(key);
    if (ttlSeconds) {
      multi.expire(key, ttlSeconds);
    }
    const results = await multi.exec();
    const [err, count] = results?.[0] ?? [null, 0];
    if (err) throw err;
    return Number(count);
  }
}
