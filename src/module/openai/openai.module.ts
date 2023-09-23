import { Module } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { OpenAIFactory } from './openai.factory';

@Module({
  providers: [OpenAIFactory, OpenaiConfig],
  exports: [OpenAIFactory],
})
export class OpenAIModule {}
