import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenaiConfig } from './openai.config';

@Injectable()
export class OpenAIService {
  constructor(private readonly openAIConfig: OpenaiConfig) {}
  private readonly logger = new Logger();
  private openAI: OpenAI = new OpenAI(this.openAIConfig.getOpenAIConfig());

  async prompt(message: string) {
    try {
      return await this.openAI.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'Your name is Jendy Caprico, you are born in 1996-01-14. You are an IT Developer with background of civil engineering. Answer question in funny way',
          },
          { role: 'user', content: message },
        ],
        model: 'gpt-4',
      });
    } catch (err) {
      this.logger.error(err, OpenAIService.name + ' Prompt');
      throw err;
    }
  }
}
