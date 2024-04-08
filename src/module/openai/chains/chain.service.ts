import { Injectable, OnModuleInit } from '@nestjs/common';
import { ChainRepository } from './chain.repository';
import { VectorStore } from 'langchain/dist/vectorstores/base';
import { OpenAIFactory } from '../openai.factory';

@Injectable()
export class ChainService implements OnModuleInit {
  constructor(
    private readonly chainRepo: ChainRepository,
    private readonly openAIFactory: OpenAIFactory,
  ) {}
  private vectorStore: VectorStore;
  private readonly limit = 6;

  async onModuleInit() {
    this.vectorStore = await this.openAIFactory.buildVectorStore();
  }

  async promptAnswer(
    message: string,
    userId: string = new Date().toUTCString(),
    count = 1,
  ): Promise<string> {
    const question = message;

    try {
      const { retrievalChain, explanationChain, stepbackChain, responseChain } =
        await this.chainRepo.buildStepbackChains();

      const callConfig = { configurable: { sessionId: userId } };

      const retrieval = await retrievalChain.invoke({ question }, callConfig);

      let { knowledge } = retrieval;
      knowledge = await this.handleRetrieval(knowledge);

      const { explanation } = await explanationChain.invoke(
        {
          question,
          knowledge,
        },
        callConfig,
      );

      const { isEnough, stepback } = await stepbackChain.invoke(
        {
          question,
          explanation,
        },
        callConfig,
      );

      if (!isEnough && count < this.limit) {
        message = `${message} \nwhat you lacks in previous response is: ${stepback}. Please response according to this current session with according to my feedback`;

        return this.promptAnswer(message, userId, count + 1);
      }

      const { response } = await responseChain.invoke(
        {
          question,
          knowledge,
          explanation,
        },
        callConfig,
      );

      return response;
    } catch (err) {
      throw err;
    }
  }

  async handleRetrieval(knowledge: string) {
    const [[data, score]] = await this.vectorStore.similaritySearchWithScore(
      knowledge,
      2,
    );

    if (score < 0.4) return 'Nothing Similar';

    console.log(data.metadata, '<<< Document Metadata');

    return data.pageContent;
  }
}
