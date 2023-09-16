import { Module } from '@nestjs/common';
import { LineWebhookService } from './line-webhook.service';

@Module({ providers: [LineWebhookService], exports: [LineWebhookService] })
export class LineWebhookModule {}
