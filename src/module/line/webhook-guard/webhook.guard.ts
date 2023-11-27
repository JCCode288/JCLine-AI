import {
  NestInterceptor,
  ExecutionContext,
  Injectable,
  CallHandler,
} from '@nestjs/common';
import { LineWebhookService } from '../line-webhook/line-webhook.service';

@Injectable()
export class WebhookGuard implements NestInterceptor {
  constructor(private readonly webhookService: LineWebhookService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest();
    const res = httpContext.getResponse();

    const body = req.body ?? {};
    const headers = req.headers;
    const signature = headers['x-line-signature'] as string;
    try {
      if (!signature || typeof signature !== 'string') {
        throw new Error('Invalid Request');
      }

      const bodyString: string = JSON.stringify(body);

      const isValid = await this.webhookService.verifyMessage(
        bodyString,
        signature,
      );

      if (isValid) {
        return next.handle();
      }
      console.log({ isValid, bodyString, signature });

      throw new Error('Invalid Request');
    } catch (err) {
      res.status(201).json({ message: 'OK' });
    }
  }
}
