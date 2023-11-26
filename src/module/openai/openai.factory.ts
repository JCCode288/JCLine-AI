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
import {
  BufferWindowMemory,
  EntityMemory,
  VectorStoreRetrieverMemory,
} from 'langchain/memory';
import { MongoDBChatMessageHistory } from 'langchain/stores/message/mongodb';
import { MongodbService } from './mongodb.service';
import { RedisVectorStore } from 'langchain/vectorstores/redis';
import { RedisService } from './redis.service';

@Injectable()
export class OpenAIFactory {
  private agentModelName = 'gpt-3.5-turbo';
  private embeddingModelName = 'text-embedding-ada-002';
  private toolModelName = 'text-davinci-003';

  constructor(
    private readonly openAIConfig: OpenaiConfig,
    private readonly mongodbService: MongodbService,
    private readonly redisService: RedisService,
  ) {}
  async build(
    type: 'agent',
    tools: (StructuredTool | Tool)[] | [],
    options: Partial<Omit<IAgentArgs, 'model'>>,
  ): Promise<AgentOpenAI>;

  async build(
    type: 'embedding',
    tools: [],
    options?: Partial<Omit<IEmbeddingArgs, 'model'>>,
  ): Promise<EmbeddingOpenAI>;

  async build(
    type: 'agent' | 'embedding' | 'tool',
    tools: (StructuredTool | Tool)[] = [],
    options?:
      | Partial<Omit<IAgentArgs, 'model'>>
      | Partial<Omit<IEmbeddingArgs, 'model'>>,
  ) {
    try {
      if (type === 'agent') {
        const model: ChatOpenAI = await this.getModel(type);
        const memory = await this.buildBufferWindowMemory(options['sessionId']);

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
        const vectorStore = await this.buildVectorStore();

        const embeddingOptions: IEmbeddingArgs = {
          verbose: options?.verbose,
          vectorStore,
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
    userId: string,
    returnMessages = false,
    aiPrefix?: string,
  ) {
    try {
      return new EntityMemory({
        llm: await this.getModel('tool'),
        k: 5,
        inputKey: 'input',
        outputKey: 'output',
        aiPrefix: aiPrefix ?? 'JendAI',
        humanPrefix: 'User',
        chatHistory: await this.buildChatMemory(userId),
        chatHistoryKey: 'chat_history',
        entitiesKey: 'entity_history',
        returnMessages,
      });
    } catch (err) {
      throw err;
    }
  }

  async buildBufferWindowMemory(
    userId: string,
    returnMessages = false,
    aiPrefix?: string,
  ) {
    return new BufferWindowMemory({
      k: 5,
      inputKey: 'input',
      outputKey: 'output',
      chatHistory: await this.buildChatMemory(userId),
      memoryKey: 'chat_history',
      returnMessages,
      aiPrefix: aiPrefix ?? 'JendAI',
    });
  }

  async buildChatMemory(userId: string) {
    try {
      let sessionId: string;
      const collection = this.mongodbService.getCollection('MEMORY');

      const user = await collection.findOne({ userId });

      if (user?._id) {
        sessionId = user._id.toString();
      } else {
        sessionId = (
          await collection.insertOne({ userId })
        ).insertedId.toString();
      }
      return new MongoDBChatMessageHistory({ collection, sessionId });
    } catch (err) {
      throw err;
    }
  }

  async buildVectorMemory() {
    try {
      const vectorStore = await this.buildVectorStore();
      return new VectorStoreRetrieverMemory({
        vectorStoreRetriever: vectorStore.asRetriever(1),
        inputKey: 'input',
        outputKey: 'output',
        memoryKey: 'chat_history',
      });
    } catch (err) {
      throw err;
    }
  }

  async buildVectorStore() {
    try {
      const model = await this.getModel('embedding');
      const client = this.redisService.getClient();

      const vectorStore = new RedisVectorStore(model, {
        redisClient: client,
        indexName: 'docs',
      });

      return vectorStore;
    } catch (err) {
      throw err;
    }
  }
}
