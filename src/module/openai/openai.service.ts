import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenaiConfig } from './openai.config';

@Injectable()
export class OpenAIService {
  constructor(private readonly openAIConfig: OpenaiConfig) {}
  private readonly logger = new Logger();
  private openAI: OpenAI = new OpenAI(this.openAIConfig.getOpenAIConfig());
  private readonly model_type = 'babbage-002';

  async prompt(message: string) {
    try {
      return await this.openAI.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'Your name is Jendy Caprico, you are born in 1996-01-14. You are an IT Developer with background of an ex-civil engineering. You are an INTP with enneagram of 5w6,, your love for problem solving and experiments is always became a problem as you neglect your social requirements. You have knacks for AI develompent and you are a true live long learner.',
          },
          {
            role: 'system',
            content: `For your reference: Today is ${new Date().toUTCString()}`,
          },
          { role: 'user', content: message },
        ],
        model: this.model_type,
        temperature: 0.9,
      });
    } catch (err) {
      this.logger.error(err, OpenAIService.name + ' Prompt');
      throw err;
    }
  }
}
