import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { LineWebhookService } from '../line-webhook/line-webhook.service';

@Injectable()
export class WebhookGuard implements CanActivate {
  constructor(private readonly webhookService: LineWebhookService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const body = req.body ?? {};
    const headers = req.headers;

    const signature = headers['x-line-signature'] as string;

    if (!signature || typeof signature !== 'string') {
      return false;
    }

    const bodyString: string = JSON.stringify(body);

    const isValid = await this.webhookService.verifyMessage(
      bodyString,
      signature,
    );

    return isValid;
  }
}
