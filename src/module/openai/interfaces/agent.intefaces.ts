import { StructuredTool, Tool } from 'langchain/tools';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseMemory } from 'langchain/memory';

export interface IAgentArgs {
  model: ChatOpenAI;
  tools: (StructuredTool | Tool)[] | [];
  verbose: boolean;
  persona?: string;
  prefix?: string;
  suffix?: string;
  output_variables?: string[];
  memory?: BaseMemory;
  sessionId?: string;
}
