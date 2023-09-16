import { Module } from '@nestjs/common';
import { LineService } from './line.service';
import { LineWebhookService } from './line-webhook/line-webhook.service';
import { LineWebhookModule } from './line-webhook/line-webhook.module';
import { LineController } from './line.controller';

@Module({
  imports: [LineWebhookModule],
  providers: [LineService],
  controllers: [LineController],
})
export class LineModule {}
