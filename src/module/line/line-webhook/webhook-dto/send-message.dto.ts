export class SendMessageDto {
  public readonly replyToken: string;
  public readonly messages: ISendMessage[];
}

export interface ISendMessage {
  type: 'text';
  text: string;
}
export interface ISendMeta {
  replyToken: string;
  message: string;
}

export interface ISentMessages {
  sentMessages: ISentInfo[];
}

export interface ISentInfo {
  id: string;
  quoteToken: string;
}
