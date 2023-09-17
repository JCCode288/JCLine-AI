import { Controller, Post, Logger, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { LineWebhookService } from './line-webhook/line-webhook.service';
import { LineWebhookDto } from './line-webhook/webhook-dto/webhook.dto';

@Controller('line')
export class LineController {
  private readonly logger = new Logger();
  constructor(private readonly lineWebhookService: LineWebhookService) {}

  @Post('webhooks')
  async postLineWebhook(@Body() body: LineWebhookDto, @Req() req: Request) {
    try {
      const headers = req.headers;

      let signature = headers['x-line-signature'] as string;

      if (!signature || typeof signature !== 'string') {
        signature = 'NoSignatureProvided';
      }

      const topEvent = body.events[0];
      const validate = await this.lineWebhookService.verifyMessage(
        JSON.stringify(body),
        signature,
      );

      const message = topEvent?.message;
      if (message && topEvent.type === 'message') {
        this.logger.log(message, LineController.name + ' Webhook Post');

        if (message.type === 'text' && message.text && validate) {
          const resMessage = await this.lineWebhookService.handleMessage(
            message.text,
          );
          this.logger.log(resMessage, LineController.name + ' Webhook Post');
        }
      }

      const response = 'OK';

      return { response };
    } catch (err) {
      this.logger.log(err, LineController.name + ' postLineWebhook');
      throw err;
    }
  }
}
