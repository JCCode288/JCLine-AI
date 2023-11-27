import { Controller, Post, Logger, Body, Req } from '@nestjs/common';
import { LineWebhookDto } from './line-webhook/webhook-dto/webhook.dto';
import { LineService } from './line.service';

@Controller('line')
export class LineController {
  private readonly logger = new Logger();
  constructor(private readonly lineService: LineService) {}

  @Post('webhooks')
  async postLineWebhook(@Body() body: LineWebhookDto, @Req() req) {
    try {
      const headers = req.headers;
      const signature = headers['x-line-signature'] as string;

      const response = await this.lineService.handleMessage(body, signature);

      console.log(response);

      return response;
    } catch (err) {
      console.log(err, 'Webhook Error');

      return err;
    }
  }
}
