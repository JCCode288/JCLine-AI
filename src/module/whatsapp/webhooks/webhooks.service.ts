import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from 'src/module/openai/openai.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly openAIService: OpenAIService) {}
  private readonly logger = new Logger();

  async handleMessage(message: string) {
    try {
      const promptResult = await this.openAIService.prompt(message);

      return promptResult;
    } catch (err) {
      throw err;
    }
  }
}
