import { Controller, Post, Logger, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { LineWebhookDto } from './line-webhook/webhook-dto/webhook.dto';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  private readonly logger = new Logger();
  constructor(private readonly lineService: LineService) {}

  @Post('webhooks')
  async postLineWebhook(@Body() body: LineWebhookDto, @Req() req: Request) {
    try {
      const headers = req.headers;

      const signature = headers['x-line-signature'] as string;

      if (!signature || typeof signature !== 'string') {
        return { message: 'OK' };
      }

      const response = await this.lineService.handleMessage(body, signature);

      return response;
    } catch (err) {
      console.log(err, '<<< Error Webhook handler');
      this.logger.log(err, LineController.name + ' postLineWebhook');
      return err;
    }
  }
}
