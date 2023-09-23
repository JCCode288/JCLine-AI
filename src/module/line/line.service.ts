import { Injectable, Logger } from '@nestjs/common';
import { LineWebhookService } from './line-webhook/line-webhook.service';
import { LineWebhookDto } from './line-webhook/webhook-dto/webhook.dto';
import { IMetaContact } from './line-webhook/webhook-dto/send-message.dto';

@Injectable()
export class LineService {
  private readonly logger = new Logger();

  constructor(private readonly lineWebhookService: LineWebhookService) {}

  async handleMessage(body: LineWebhookDto, signature: string) {
    try {
      const topEvent = body.events[0];
      const message = topEvent?.message;
      const info: IMetaContact = {
        replyToken: topEvent?.replyToken,
        userId: topEvent.source.userId,
      };

      if (!message && topEvent.type !== 'message') {
        return { event: 'OK' };
      }

      this.logger.log(message, LineService.name + ' Webhook Post');

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

      const aiMessage = await this.lineWebhookService.handleMessage(
        message.text,
        info.userId,
      );

      const send_message = await this.lineWebhookService.sendMessage({
        info,
        message: aiMessage,
      });
      this.logger.log(aiMessage, LineService.name + ' Webhook Post');

      return { response: 'OK', send_message };
    } catch (err) {
      throw err;
    }
  }
}
