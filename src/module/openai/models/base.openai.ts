import { Logger } from '@nestjs/common';
import {
  BaseChatModel,
  BaseChatModelCallOptions,
} from 'langchain/chat_models/base';
import { IOpenAI } from '../interfaces/openai.interface';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { BaseMemory } from 'langchain/memory';

export abstract class BaseOpenAI implements IOpenAI {
  protected readonly logger = new Logger();
  public readonly model:
    | BaseChatModel<BaseChatModelCallOptions>
    | OpenAIEmbeddings;
  protected readonly model_name: string;
  public type: string;
  protected temperature: number;
  public readonly verbose: boolean;
  protected memory: BaseMemory;
}
