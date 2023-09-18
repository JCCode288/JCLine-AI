import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OpenAIService } from 'src/module/openai/openai.service';
import * as _crypto from 'crypto';
import {
  ISendMeta,
  ISentMessages,
  SendMessageDto,
} from './webhook-dto/send-message.dto';

@Injectable()
export class LineWebhookService {
  constructor(private readonly openAIService: OpenAIService) {}
  private readonly logger = new Logger();
  private readonly crypto = _crypto;
  private readonly line_secret = {
    secret: process.env.LINE_SECRET,
    id: process.env.LINE_SECRET_CHANNEL_ID,
    channel: process.env.LINE_SECRET_CHANNEL_SECRET,
  };
  private readonly post_message_url =
    'https://api.line.me/v2/bot/message/reply';

  async handleMessage(message: string) {
    try {
      const promptResult = await this.openAIService.prompt(message);

      return promptResult.choices[0].message.content;
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
          .createHmac('SHA256', this.line_secret.secret)
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

  async sendMessage({ info, message }: ISendMeta) {
    try {
      const messageBuild: SendMessageDto = {
        ...info,
        messages: [
          {
            type: 'text',
            text: message,
          },
        ],
      };

      const token = await this.getToken();

      const res = await fetch(this.post_message_url, {
        method: 'POST',
        body: JSON.stringify(messageBuild),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data: ISentMessages = await res.json();

      console.log(data, '<<<< Webhook Response');

      if (!data?.sentMessages?.length) {
        return false;
      }

      return true;
    } catch (err) {
      this.logger.error(err, LineWebhookService.name);
      throw err;
    }
  }

  async getToken(): Promise<string> {
    try {
      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');
      formData.append('client_id', this.line_secret.id);
      formData.append('client_secret', this.line_secret.channel);

      const res = await fetch('https://api.line.me/oauth2/v3/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await res.json();

      return data.access_token;
    } catch (err) {
      this.logger.error(err, LineWebhookService.name);
      throw err;
    }
  }
}
