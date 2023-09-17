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
export interface IMetaContact extends Omit<ILineSource, 'type'> {
  replyToken: string;
}

export interface ISendMeta {
  info: IMetaContact;
  message: string;
}

export interface ISentMessages {
  sentMessages: ISentInfo[];
}

export interface ISentInfo {
  id: string;
  quoteToken: string;
}
