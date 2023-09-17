import { Module } from '@nestjs/common';
import { LineWebhookService } from './line-webhook.service';
import { OpenAIModule } from 'src/module/openai/openai.module';

@Module({
  imports: [OpenAIModule],
  providers: [LineWebhookService],
  exports: [LineWebhookService],
})
export class LineWebhookModule {}
