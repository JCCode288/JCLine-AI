import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { OpenaiConfig } from './openai.config';

@Module({
  providers: [OpenAIService, OpenaiConfig],
  exports: [OpenAIService],
})
export class OpenAIModule {}
