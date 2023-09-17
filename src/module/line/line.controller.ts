import {
  Controller,
  Post,
  Logger,
  Body,
  Req,
  Res,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
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
        throw new HttpException('Invalid Header', 400);
      }

      await this.lineWebhookService.verifyMessage(
        JSON.stringify(body),
        signature,
      );

      const message = body.events[0].message?.text;

      this.logger.log(message, LineController.name + ' Webhook Post');

      return await this.lineWebhookService.handleMessage(message);
    } catch (err) {
      this.logger.log(err, LineController.name + ' postLineWebhook');
      throw err;
    }
  }
}
