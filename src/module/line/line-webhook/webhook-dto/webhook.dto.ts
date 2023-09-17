export class LineWebhookDto {
  public readonly 'destination': string;
  public readonly 'events': LineEventDto[];
}

export class LineEventDto {
  public readonly 'type': string;
  public readonly 'message'?: ILineMessage;
  public readonly 'timestamp': number;
  public readonly 'source': ILineSource;
  public readonly 'replyToken'?: string;
  public readonly 'mode': string;
  public readonly 'webhookEventId': string;
  public readonly 'deliveryContext': IDeliveryContext;
}

export interface ILineMessage {
  type: string;
  id: string;
  text: string;
}

export interface ILineSource {
  type: string;
  userId?: string;
}

export interface IDeliveryContext {
  isRedelivery: boolean;
}
