import { Injectable } from '@nestjs/common';
import { OpenAIFactory } from '../openai.factory';
import {
  HUMAN_RETRIEVAL_TEMPLATE,
  RETRIEVAL_SCHEMA,
  SYSTEM_RETRIEVAL_TEMPLATE,
} from './retrieval.chain';
import {
  HUMAN_RESPONSE_TEMPLATE,
  RESPONSE_SCHEMA,
  SYSTEM_RESPONSE_TEMPLATE,
} from './response.chain';
import {
  EXPLANATION_SCHEMA,
  HUMAN_EXPLANATION_TEMPLATE,
  SYSTEM_EXPLANATION_TEMPLATE,
} from './explanation.chain';
import {
  HUMAN_STEPBACK_TEMPLATE,
  STEPBACK_SCHEMA,
  SYSTEM_STEPBACK_TEMPLATE,
} from './stepback.chain';

@Injectable()
export class ChainRepository {
  constructor(private readonly openAIFactory: OpenAIFactory) {}

  private async getRetrievalChain() {
    return this.openAIFactory.buildChain({
      system: SYSTEM_RETRIEVAL_TEMPLATE,
      human: HUMAN_RETRIEVAL_TEMPLATE,
      schema: RETRIEVAL_SCHEMA,
      memory: { inputMessagesKey: 'question', outputMessagesKey: 'knowledge' },
    });
  }

  private async getResponseChain() {
    return this.openAIFactory.buildChain({
      system: SYSTEM_RESPONSE_TEMPLATE,
      human: HUMAN_RESPONSE_TEMPLATE,
      schema: RESPONSE_SCHEMA,
      memory: { inputMessagesKey: 'knowledge', outputMessagesKey: 'response' },
    });
  }

  private async getStepbackChain() {
    return this.openAIFactory.buildChain({
      system: SYSTEM_STEPBACK_TEMPLATE,
      human: HUMAN_STEPBACK_TEMPLATE,
      schema: STEPBACK_SCHEMA,
      memory: {
        inputMessagesKey: 'explanation',
        outputMessagesKey: 'isEnough',
      },
    });
  }

  private async getExplanationChain() {
    return this.openAIFactory.buildChain({
      system: SYSTEM_EXPLANATION_TEMPLATE,
      human: HUMAN_EXPLANATION_TEMPLATE,
      schema: EXPLANATION_SCHEMA,
      memory: {
        inputMessagesKey: 'knowledge',
        outputMessagesKey: 'explanation',
      },
    });
  }

  async buildStepbackChains() {
    const [retrievalChain, explanationChain, stepbackChain, responseChain] =
      await Promise.all([
        this.getRetrievalChain(),
        this.getExplanationChain(),
        this.getStepbackChain(),
        this.getResponseChain(),
      ]);

    return {
      retrievalChain,
      explanationChain,
      stepbackChain,
      responseChain,
    };
  }
}
