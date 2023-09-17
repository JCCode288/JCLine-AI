import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OpenAIService } from 'src/module/openai/openai.service';
import * as _crypto from 'crypto';
import {
  ISendMeta,
  ISentMessages,
  SendMessageDto,
} from './webhook-dto/send-message.dto';
import { LineEventDto } from './webhook-dto/webhook.dto';

@Injectable()
export class LineWebhookService {
  constructor(private readonly openAIService: OpenAIService) {}
  private readonly logger = new Logger();
  private readonly crypto = _crypto;
  private readonly line_secret = process.env.LINE_SECRET;
  private readonly post_message_url =
    'https://api.line.me/v2/bot/message/reply';

  async handleMessage(message: string) {
    try {
      const promptResult = await this.openAIService.prompt(message);

      return promptResult.choices[0].message;
    } catch (err) {
      this.logger.log(err, LineWebhookService.name + ' handleMessage');
      throw err;
    }
  }

  verifyMessage(body: string, header_sign: string): Promise<boolean> {
    this.logger.log(body, 'Stringified Body');
    this.logger.log(header_sign, 'Header Sign');
    return new Promise((res, rej) => {
      const error = new HttpException(
        'Message verificatiton failed',
        HttpStatus.UNAUTHORIZED,
      );
      try {
        const signature = this.crypto
          .createHmac('SHA256', this.line_secret)
          .update(body)
          .digest('base64');

        this.logger.log({ signature }, 'Signature Body');

        if (signature !== header_sign) {
          res(false);
        }

        res(true);
      } catch (err) {
        rej(error);
      }
    });
  }

  async sendMessage({ replyToken, message }: ISendMeta) {
    try {
      const messageBuild: SendMessageDto = {
        replyToken,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      };

      const res = await fetch(this.post_message_url, {
        method: 'POST',
        body: JSON.stringify(messageBuild),
        headers: {
          'Content-Type': 'applicaiton/json',
          Authorization: 'Bearer',
        },
      });

      const data: ISentMessages = await res.json();

      if (!data.sentMessages.length) return false;

      return true;
    } catch (err) {
      this.logger.error(err, LineWebhookService.name);
      throw err;
    }
  }
}
