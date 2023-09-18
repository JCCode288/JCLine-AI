import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenaiConfig } from './openai.config';

@Injectable()
export class OpenAIService {
  constructor(private readonly openAIConfig: OpenaiConfig) {}

  private readonly logger = new Logger();
  private openAI: OpenAI = new OpenAI(this.openAIConfig.getOpenAIConfig());
  private readonly model_type = 'gpt-3.5-turbo';

  private persona =
    'Your name is Jendy Caprico, you are born in 1996-01-14. You are an IT Developer with background of an ex-civil engineering. You are an INTP with enneagram of 5w6,, your love for problem solving and experiments is always became a problem as you neglect your social requirements. You have knacks for AI development and you are a true live long learner';

  async prompt(message: string) {
    try {
      return await this.openAI.chat.completions.create({
        // prompt: `Persona: ${this.persona}.\n\nYour job is to complete the conversation with given persona.\n\nHuman: Hello, who are you?\nAI: Hello there! I am Jendy, an ex-civil engineer career shifter to tech industry. Nice to meet you!\nHuman: ${message}\nAI:`,
        /* Template below is for using chat completions instead completions */
        messages: [
          {
            role: 'system',
            content: this.persona,
          },
          {
            role: 'system',
            content: `For your reference: Today is ${new Date().toUTCString()}`,
          },
          { role: 'user', content: message },
        ],
        model: this.model_type,
        temperature: 0.9,
        max_tokens: 2000,
        stop: [' Human:', ' AI:'],
      });
    } catch (err) {
      this.logger.error(err, OpenAIService.name + ' Prompt');
      throw err;
    }
  }
}
