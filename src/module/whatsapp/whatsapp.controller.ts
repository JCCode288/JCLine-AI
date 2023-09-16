import {
  Controller,
  Get,
  Post,
  Body,
  Logger,
  Res,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger();
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('/')
  async whatsappGet(@Res() res: Response) {
    try {
      res.status(200).json({ response: 'OK' });
    } catch (err) {
      this.logger.log(err, WhatsappController.name);
      throw err;
    }
  }

  @Get('/webhooks')
  async getWebhook(@Req() req: Request) {
    try {
      const valid = await this.whatsappService.validate(
        req.query['hub.verify_token'] as string,
      );

      if (req.query['hub.mode'] == 'subscribe' && valid) {
        return req.query['hub.challenge'];
      }

      throw new HttpException(
        'You are not authorized',
        HttpStatus.UNAUTHORIZED,
      );
    } catch (err) {
      this.logger.error(err, WhatsappController.name + ' Get Webhook');
      throw err;
    }
  }

  @Post('/webhooks')
  async postWebhooks(@Body() body) {
    try {
      this.logger.log(body, WhatsappController.name + ' Post Webhook');
    } catch (err) {
      this.logger.error(err, WhatsappController.name + ' Post Webhook');

      throw err;
    }
  }
}
