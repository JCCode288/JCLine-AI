import { Module } from '@nestjs/common';
import { LineService } from './line.service';
import { LineWebhookModule } from './line-webhook/line-webhook.module';
import { LineController } from './line.controller';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [LineWebhookModule, OpenAIModule],
  providers: [LineService],
  controllers: [LineController],
})
export class LineModule {}
