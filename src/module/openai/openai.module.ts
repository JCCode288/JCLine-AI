import { Module } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { OpenAIFactory } from './openai.factory';
import { MongodbModule } from '../mongodb/mongodb.module';

@Module({
  imports: [MongodbModule],
  providers: [OpenAIFactory, OpenaiConfig],
  exports: [OpenAIFactory],
})
export class OpenAIModule {}
