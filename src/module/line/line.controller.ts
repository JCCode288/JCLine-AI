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

      const signature = headers['x-line-signature'] as string;

      if (!signature || typeof signature !== 'string') {
        return { message: 'OK' };
      }

      const topEvent = body.events[0];
      const message = topEvent?.message;
      const info = {
        replyToken: topEvent.source.userId,
        userId: topEvent?.replyToken,
      };

      if (!message && topEvent.type !== 'message') {
        return { event: 'OK' };
      }

      this.logger.log(message, LineController.name + ' Webhook Post');

      const validate = await this.lineWebhookService.verifyMessage(
        JSON.stringify(body),
        signature,
      );

      if (
        (!info.replyToken && !info.userId) ||
        (message.type !== 'text' && !message.text && !validate)
      ) {
        return { msg: 'OK' };
      }

      const resMessage = await this.lineWebhookService.handleMessage(
        message.text,
      );
      const aiMessage = resMessage.content;
      const send_message = await this.lineWebhookService.sendMessage({
        info,
        message: aiMessage,
      });
      this.logger.log(resMessage, LineController.name + ' Webhook Post');

      return { response: 'OK', send_message };
    } catch (err) {
      console.log(err, '<<< Error Webhook handler');
      this.logger.log(err, LineController.name + ' postLineWebhook');
      return err;
    }
  }
}
