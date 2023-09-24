import { Tool } from 'langchain/tools';
import { BaseOpenAI } from './base.openai';
import { IAgentArgs, IAgentStrategy } from '../interfaces/agent.intefaces';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { BASE_PERSONA } from 'src/utils/persona.constant';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { IAgentType, agent_type } from 'src/utils/agent.constant';
import { ConversationChain } from 'langchain/chains';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

export class AgentOpenAI extends BaseOpenAI implements IAgentStrategy {
  public override readonly model: ChatOpenAI;
  public type = 'AGENT';
  public tool_model: OpenAI;
  public verbose: boolean;
  private tools: Tool[];
  private chainTemplate: string[];
  private persona?: string;
  private prefix?: string;
  private suffix?: string;
  private contextMemory;

  private agent;

  constructor({
    tools,
    model,
    verbose,
    persona,
    prefix,
    suffix,
    memory,
  }: IAgentArgs) {
    super();
    this.tools = tools as Tool[];
    this.model = model;
    this.memory = memory;
    this.verbose = verbose;
    this.persona = persona ?? BASE_PERSONA;
    this.prefix = prefix;
    this.suffix = suffix;

    this.chainTemplate = [this.prefix, this.suffix, this.persona];

    this.logger.log('AgentOpenAI Built!', AgentOpenAI.name);
  }

  setVectorStore<T>(vectorStore: T): Promise<T> {
    try {
      this.contextMemory = vectorStore;

      return Promise.resolve(this.contextMemory as T);
    } catch (err) {
      throw err;
    }
  }

  async promptAnswer(input: string): Promise<string> {
    try {
      let context;

      if (this.contextMemory) {
        context = await this.contextMemory.search(input);
      }

      const { output } = await this.agent.call({ input, context });

      return output;
    } catch (err) {
      return err;
    }
  }

  async buildAgent(type: keyof IAgentType) {
    try {
      const agentType = agent_type[type];
      const agentArgs: any = {};

      if (agentType.includes('chat')) {
        agentArgs['humanMessage'] = this.suffix;
        agentArgs['systemMessage'] = `${this.persona}\n\n${this.prefix}`;
      } else {
        agentArgs['suffix'] = this.suffix;
        agentArgs['prefix'] = `${this.persona}\n\n${this.prefix}`;
      }
      const memory = this.memory;

      const agentOpts: any = {
        agentType,
        verbose: this.verbose,
        maxIterations: 20,
        memory,
        agentArgs,
      };

      const agent = await initializeAgentExecutorWithOptions(
        this.tools,
        this.model,
        agentOpts,
      );
      this.agent = agent;

      return this;
    } catch (err) {
      throw err;
    }
  }

  async buildChain() {
    try {
      const memory = this.memory;

      console.log(memory, '<<<<< Memory');

      const templates = this.chainTemplate.reduce(
        (base = [], templateMessage) => {
          if (templateMessage) {
            base.push(
              SystemMessagePromptTemplate.fromTemplate(templateMessage),
            );
          }
          return base;
        },
        [],
      );

      const prompt = ChatPromptTemplate.fromMessages([
        ...templates,
        HumanMessagePromptTemplate.fromTemplate(
          `Begin! You have to remember above instructions.\nHere's your latest history with user: \n[{chat_history}]\n\nHere's some context about the conversation that MIGHT be helpful, don't use it if it is out of context: \n{context}\n\nQuestion: {input}\nThought:`,
        ),
      ]);

      this.agent = new ConversationChain({
        llm: this.model,
        memory,
        prompt,
        verbose: this.verbose,
        outputKey: 'output',
      });

      return this;
    } catch (err) {
      throw err;
    }
  }
}
