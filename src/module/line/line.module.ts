import { Module } from '@nestjs/common';
import { LineService } from './line.service';
import { LineWebhookModule } from './line-webhook/line-webhook.module';
import { LineController } from './line.controller';
import { WebhookGuard } from './webhook-guard/webhook.guard';

@Module({
  imports: [LineWebhookModule],
  providers: [LineService, WebhookGuard],
  controllers: [LineController],
})
export class LineModule {}
