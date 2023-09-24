import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client;

  async onModuleDestroy() {
    try {
      await this.client.disconnect();
    } catch (err) {
      throw err;
    }
  }

  async onModuleInit() {
    try {
      this.client = createClient({
        socket: {
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT ?? 6379,
        },
        password: process.env.REDIS_PASS,
      });

      await this.client.connect();
    } catch (err) {
      throw err;
    }
  }

  getClient() {
    return this.client;
  }
}
