import { Module, OnModuleInit } from '@nestjs/common';
import { LineWebhookService } from './line-webhook.service';
import { OpenAIModule } from 'src/module/openai/openai.module';
import { OpenAIFactory } from 'src/module/openai/openai.factory';

@Module({
  imports: [OpenAIModule],
  providers: [LineWebhookService],
  exports: [LineWebhookService],
})
export class LineWebhookModule implements OnModuleInit {
  constructor(private readonly webhookHandler: LineWebhookService) {}
  async onModuleInit() {
    try {
      const result = await this.webhookHandler.handleMessage(
        'who are you?',
        'test',
      );
      console.log(result);
    } catch (err) {
      throw err;
    }
  }
}
