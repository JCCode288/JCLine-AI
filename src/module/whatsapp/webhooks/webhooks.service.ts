import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger();

  async handleMessage(message: string) {
    try {
      // const promptResult = await this.openAIService.prompt(message);
      //       return promptResult;
    } catch (err) {
      this.logger.log(err, WebhooksService.name + ' handleMessage');
      throw err;
    }
  }
}
