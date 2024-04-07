import { Module } from '@nestjs/common';
import { LineWebhookService } from './line-webhook.service';

@Module({
  imports: [],
  providers: [LineWebhookService],
  exports: [LineWebhookService],
})
export class LineWebhookModule {}
