import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { OpenAIService } from 'src/module/openai/openai.service';
import * as _crypto from 'crypto';

@Injectable()
export class LineWebhookService {
  constructor(private readonly openAIService: OpenAIService) {}
  private readonly logger = new Logger();
  private readonly crypto = _crypto;
  private readonly line_secret = process.env.LINE_SECRET;

  async handleMessage(message: string) {
    try {
      const promptResult = await this.openAIService.prompt(message);

      return promptResult.choices[0].message;
    } catch (err) {
      this.logger.log(err, LineWebhookService.name + ' handleMessage');
      throw err;
    }
  }

  verifyMessage(body: string, header_sign: string) {
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
          rej(false);
        }

        res(true);
      } catch (err) {
        rej(error);
      }
    });
  }
}
