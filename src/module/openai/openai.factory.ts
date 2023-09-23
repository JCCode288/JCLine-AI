import { Injectable } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { IAgentArgs } from './interfaces/agent.intefaces';
import { IEmbeddingArgs } from './interfaces/embedding.interface';
import { AgentOpenAI } from './models/agent.openai';
import { EmbeddingOpenAI } from './models/embedding.openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { StructuredTool, Tool } from 'langchain/tools';
import { EntityMemory } from 'langchain/memory';
import { MongoClient, ObjectId } from 'mongodb';
import { MongoDBChatMessageHistory } from 'langchain/stores/message/mongodb';

@Injectable()
export class OpenAIFactory {
  private readonly apiKey = process.env.OPENAI_KEY;
  private agentModelName = 'gpt-3.5-turbo';
  private embeddingModelName = 'text-ada-002';
  private toolModelName = 'text-davinci-003';

  constructor(private readonly openAIConfig: OpenaiConfig) {}
  async build(
    type: 'agent',
    tools: (StructuredTool | Tool)[] | [],
    options?: Partial<IAgentArgs>,
  ): Promise<AgentOpenAI>;

  async build(
    type: 'embedding',
    tools: [],
    options?: Omit<IEmbeddingArgs, 'model'>,
  ): Promise<EmbeddingOpenAI>;

  async build(
    type: 'agent' | 'embedding' | 'tool',
    tools: (StructuredTool | Tool)[] = [],
    options?: Partial<IAgentArgs> | Omit<IEmbeddingArgs, 'model'>,
  ) {
    try {
      if (type === 'agent') {
        const model: ChatOpenAI = await this.getModel(type);
        const memory = await this.buildEntityMemory();
        const agentOpts: IAgentArgs = {
          ...options,
          memory,
          verbose: true,
          tools,
          model,
        };
        return new AgentOpenAI(agentOpts);
      }

      if (type === 'embedding') {
        const model: OpenAIEmbeddings = await this.getModel('embedding');
        const embeddingOptions: IEmbeddingArgs = {
          verbose: options.verbose,
          model,
        };

        return new EmbeddingOpenAI(embeddingOptions);
      }
    } catch (err) {
      throw err;
    }
  }

  private getModel(type: 'agent'): Promise<ChatOpenAI>;

  private getModel(type: 'embedding'): Promise<OpenAIEmbeddings>;

  private getModel(type: 'tool'): Promise<OpenAI>;

  private async getModel(type: 'agent' | 'embedding' | 'tool') {
    if (type === 'agent') {
      return new ChatOpenAI({
        ...(await this.openAIConfig.getAgentConfig()),
        modelName: this.agentModelName,
      });
    }

    if (type === 'embedding') {
      return new OpenAIEmbeddings({
        ...(await this.openAIConfig.getEmbeddingConfig()),
        modelName: this.embeddingModelName,
      });
    }

    return new OpenAI({
      ...(await this.openAIConfig.getToolConfig()),
      modelName: this.toolModelName,
    });
  }

  async buildEntityMemory(
    sessionId = new ObjectId().toString(),
    returnMessages = false,
    aiPrefix?: string,
  ) {
    try {
      const client = new MongoClient(process.env.MONGO_DB_URI || '');
      await client.connect();
      const collection = client.db('langchain').collection('memory');

      return new EntityMemory({
        llm: await this.getModel('tool'),
        k: 5,
        inputKey: 'input',
        outputKey: 'output',
        aiPrefix: aiPrefix ?? 'JendAI',
        humanPrefix: 'User',
        chatHistory: new MongoDBChatMessageHistory({ collection, sessionId }),
        chatHistoryKey: 'chat_history',
        entitiesKey: 'entity_history',
        returnMessages,
      });
    } catch (err) {
      throw err;
    }
  }
}
