import { StructuredTool, Tool } from 'langchain/tools';
import { z } from 'zod';

export interface IOpenAI {
  model: any;
  verbose: boolean;
}

export type IOpenAIBuildType = 'agent' | 'embedding' | 'tool';

export type IOpenAIBuildTool = StructuredTool | Tool;

export type ISchema<T extends z.ZodRawShape = any> = z.ZodObject<
  T,
  z.UnknownKeysParam,
  z.ZodTypeAny
>;

export interface IMemoryOpts {
  userId: string;
  inputKey?: string;
  outputKey?: string;
  returnMessages?: boolean;
  aiPrefix?: string;
}

export interface IChainTemplate<T extends z.ZodRawShape> {
  system: string;
  human: string;
  schema: ISchema<T>;
  memory?: {
    inputMessagesKey: string;
    outputMessagesKey: string;
  };
}
