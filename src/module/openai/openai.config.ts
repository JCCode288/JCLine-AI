import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenaiConfig extends ConfigService {
  getOpenAIConfig() {
    const apiKey = this.get<string>('OPENAI_KEY');
    const maxRetries = 10;

    return {
      apiKey,
      maxRetries,
    };
  }
}
