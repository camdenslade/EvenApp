// backend/src/redis/redis.module.ts

import { Module } from '@nestjs/common';

// Services --------------------------------------------------------------
import { RedisService } from './redis.service';

@Module({
  // ====================================================================
  // # PROVIDERS
  // ====================================================================
  providers: [RedisService],

  // ====================================================================
  // # EXPORTS
  // ====================================================================
  exports: [RedisService],
})
export class RedisModule {}
