import { Module } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { OpenAIFactory } from './openai.factory';
import { RedisService } from './redis.service';
import { MongodbService } from './mongodb.service';
import { ChainService } from './chains/chain.service';
import { ChainRepository } from './chains/chain.repository';

@Module({
  providers: [
    OpenAIFactory,
    OpenaiConfig,
    RedisService,
    MongodbService,
    ChainService,
    ChainRepository,
  ],
  exports: [ChainService],
})
export class OpenAIModule {}
