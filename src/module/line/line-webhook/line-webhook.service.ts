import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as _crypto from 'crypto';
import {
  ISendMeta,
  ISentMessages,
  SendMessageDto,
} from './webhook-dto/send-message.dto';
import { OpenAIFactory } from 'src/module/openai/openai.factory';

@Injectable()
export class LineWebhookService {
  constructor(private readonly openAIFactory: OpenAIFactory) {}
  private readonly logger = new Logger();
  private readonly crypto = _crypto;
  private readonly line_secret = {
    secret: process.env.LINE_SECRET,
    id: process.env.LINE_SECRET_CHANNEL_ID,
    channel: process.env.LINE_SECRET_CHANNEL_SECRET,
  };
  private readonly post_message_url =
    'https://api.line.me/v2/bot/message/reply';

  async handleMessage(message: string, sessionId?: string) {
    try {
      const agentOpenAI = await this.openAIFactory.build('agent', null, {
        sessionId,
      });
      const vectorStore = await this.openAIFactory.build('embedding', null);

      await agentOpenAI.setVectorStore(vectorStore);
      const agent = await agentOpenAI.buildSequentialChain();

      const response = await agent.promptAnswer(message);

      return response;
    } catch (err) {
      this.logger.log(err, LineWebhookService.name + ' handleMessage');
      throw err;
    }
  }

  verifyMessage(body: string, header_sign: string): Promise<boolean> {
    return new Promise((res, rej) => {
      const error = new HttpException(
        'Message verificatiton failed',
        HttpStatus.UNAUTHORIZED,
      );
      try {
        const signature = this.crypto
          .createHmac('SHA256', this.line_secret.channel)
          .update(body)
          .digest('base64');

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
