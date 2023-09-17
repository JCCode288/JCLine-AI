import { ILineSource } from './webhook.dto';

export class SendMessageDto {
  public readonly replyToken?: string;
  public readonly userId: string;
  public readonly messages: ISendMessage[];
}

export interface ISendMessage {
  type: 'text';
  text: string;
}
export interface ISendMeta {
  info: Omit<ILineSource, 'type'>;
  message: string;
}

export interface ISentMessages {
  sentMessages: ISentInfo[];
}

export interface ISentInfo {
  id: string;
  quoteToken: string;
}
