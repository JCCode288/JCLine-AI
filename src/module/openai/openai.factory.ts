import { Injectable } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import {
  BufferWindowMemory,
  EntityMemory,
  VectorStoreRetrieverMemory,
} from 'langchain/memory';
import { BaseChatMessageHistory } from '@langchain/core/chat_history';
import { MongoDBChatMessageHistory } from '@langchain/mongodb';
import { MongodbService } from './mongodb.service';
import { RedisVectorStore } from '@langchain/redis';
import { RedisService } from './redis.service';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { BASE_PERSONA } from 'src/utils/persona.constant';
import { IChainTemplate, IMemoryOpts } from './interfaces/openai.interface';
import { z } from 'zod';
import { StructuredOutputParser } from 'langchain/output_parsers';
import {
  RunnableSequence,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';

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

  async buildChain<T extends z.ZodRawShape>(templates: IChainTemplate<T>) {
    const outputParser = new StructuredOutputParser(templates.schema);

    const [prompt, model] = await Promise.all([
      ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(BASE_PERSONA),
        SystemMessagePromptTemplate.fromTemplate(templates.system),
        HumanMessagePromptTemplate.fromTemplate(templates.human),
      ]).partial({ format_instructions: outputParser.getFormatInstructions() }),
      this.getModel('agent'),
    ]);

    const chain = RunnableSequence.from([prompt, model, outputParser]);

    if (templates.memory) {
      const { inputMessagesKey, outputMessagesKey } = templates.memory;

      return new RunnableWithMessageHistory({
        runnable: chain,
        getMessageHistory: (sessionId: string) =>
          this.buildChatMemory(sessionId),
        inputMessagesKey,
        outputMessagesKey,
        historyMessagesKey: 'chat_history',
      });
    }

    return chain;
  }

  private getModel(type: 'agent'): Promise<ChatOpenAI>;
  private getModel(type: 'embedding'): Promise<OpenAIEmbeddings>;
  private getModel(type: 'tool'): Promise<OpenAI>;
  private async getModel(type: 'agent' | 'embedding' | 'tool') {
    if (type === 'agent') {
      return new ChatOpenAI({
        ...(await this.openAIConfig.getAgentConfig()),
        modelName: this.agentModelName,
      }).bind({
        response_format: {
          type: 'json_object',
        },
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

  async buildBufferWindowMemory({
    userId,
    inputKey = 'input',
    outputKey = 'output',
    returnMessages = false,
    aiPrefix = 'JendAI',
  }: IMemoryOpts) {
    return new BufferWindowMemory({
      k: 8,
      inputKey,
      outputKey,
      chatHistory: await this.buildChatMemory(userId),
      memoryKey: 'chat_history',
      returnMessages,
      aiPrefix,
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

  async buildVectorMemory(opts: IMemoryOpts) {
    try {
      const vectorStore = await this.buildVectorStore();
      return new VectorStoreRetrieverMemory({
        vectorStoreRetriever: vectorStore.asRetriever(3),
        inputKey: opts.inputKey ?? 'input',
        outputKey: opts.outputKey ?? 'output',
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
