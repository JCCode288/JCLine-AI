import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { OpenAIModule } from 'src/module/openai/openai.module';

@Module({
  imports: [OpenAIModule],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
