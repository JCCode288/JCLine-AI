import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIChatInput } from 'langchain/chat_models/openai';
import { OpenAIEmbeddingsParams } from 'langchain/embeddings/openai';

@Injectable()
export class OpenaiConfig extends ConfigService {
  getAgentConfig(): Promise<Partial<OpenAIChatInput>> {
    return new Promise((res, rej) => {
      const openAIApiKey = this.get<string>('OPENAI_KEY');
      const temperature = this.get<number>('OPENAI_TEMPERATURE');

      const maxRetries = 10;
      const configs = {
        openAIApiKey,
        maxRetries,
        temperature,
      };

      for (const key in configs) {
        if (!configs[key]) rej('Config Unresolved');
      }

      res(configs);
    });
  }

  getEmbeddingConfig(): Promise<Partial<OpenAIEmbeddingsParams>> {
    return new Promise((res, rej) => {
      const openAIApiKey = this.get<string>('OPENAI_KEY');
      const timeout = 30000;

      const configs = {
        openAIApiKey,
        timeout,
      };

      for (const key in configs) {
        if (!configs[key]) rej('Config Unresolved');
      }

      res(configs);
    });
  }
}
