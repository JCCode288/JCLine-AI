import { Tool } from 'langchain/tools';
import { BaseOpenAI } from './base.openai';
import { IAgentArgs, IAgentStrategy } from '../interfaces/agent.intefaces';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { OpenAI } from 'langchain/llms/openai';
import { BASE_PERSONA } from 'src/utils/persona.constant';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { IAgentType, agent_type } from 'src/utils/agent.constant';
import { ConversationChain, LLMChain, SequentialChain } from 'langchain/chains';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import {
  DOCUMENT_TEMPLATE,
  HUMAN_PROMPT_TEMPLATE,
  MAIN_CHAIN_TEMPLATE,
  STEPBACK_CHAIN_TEMPLATE,
  THOUGHT_CHAIN_TEMPLATE,
} from './templates/chain.template';

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
  private thoughtChain?;
  private stepbackChain?;
  private mainChain?;
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

  getAgent() {
    return this.agent;
  }

  async promptAnswer(input: string): Promise<string> {
    try {
      let documents;

      if (this.contextMemory) {
        documents = await this.contextMemory.search(input);
      }

      const agent = this.agent ?? this.mainChain;

      const { output } = await agent.call({ input, documents });

      return output;
    } catch (err) {
      return err;
    }
  }

  async buildAgent(type: IAgentType) {
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

  async buildSequentialChain() {
    try {
      await Promise.all([
        this.buildStepbackChain(),
        this.buildThoughtChain(),
        this.buildMainChain(),
      ]);

      const chains = [this.stepbackChain, this.thoughtChain, this.mainChain];

      this.agent = new SequentialChain({
        chains,
        inputVariables: ['input', 'documents'],
        verbose: this.verbose,
        memory: this.memory,
      });

      return this;
    } catch (err) {
      throw err;
    }
  }

  async buildStepbackChain() {
    try {
      const promptMessages = [
        SystemMessagePromptTemplate.fromTemplate(BASE_PERSONA),
        SystemMessagePromptTemplate.fromTemplate(DOCUMENT_TEMPLATE),
        HumanMessagePromptTemplate.fromTemplate(STEPBACK_CHAIN_TEMPLATE),
      ];

      const prompt = new ChatPromptTemplate({
        promptMessages,
        inputVariables: ['input', 'documents'],
      });

      this.stepbackChain = new LLMChain({
        llm: this.model,
        prompt,
        verbose: this.verbose,
        outputKey: 'stepback',
      });

      return this;
    } catch (err) {
      throw err;
    }
  }

  async buildThoughtChain() {
    try {
      const promptMessages = [
        SystemMessagePromptTemplate.fromTemplate(BASE_PERSONA),
        SystemMessagePromptTemplate.fromTemplate(DOCUMENT_TEMPLATE),
        HumanMessagePromptTemplate.fromTemplate(THOUGHT_CHAIN_TEMPLATE),
      ];

      const prompt = new ChatPromptTemplate({
        promptMessages,
        inputVariables: ['input', 'documents', 'stepback'],
      });

      this.thoughtChain = new LLMChain({
        llm: this.model,
        prompt,
        verbose: this.verbose,
        outputKey: 'thought',
      });

      return this;
    } catch (err) {
      throw err;
    }
  }

  async buildMainChain() {
    try {
      const promptMessages = [
        SystemMessagePromptTemplate.fromTemplate(BASE_PERSONA),
        SystemMessagePromptTemplate.fromTemplate(DOCUMENT_TEMPLATE),
        HumanMessagePromptTemplate.fromTemplate(MAIN_CHAIN_TEMPLATE),
      ];

      const prompt = new ChatPromptTemplate({
        promptMessages,
        inputVariables: ['input', 'stepback', 'thought', 'context'],
      });

      this.mainChain = new LLMChain({
        llm: this.model,
        memory: this.memory,
        prompt,
        outputKey: 'output',
      });
    } catch (err) {
      throw err;
    }
  }

  async buildChain() {
    try {
      const memory = this.memory;

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
        HumanMessagePromptTemplate.fromTemplate(HUMAN_PROMPT_TEMPLATE),
      ]);

      this.mainChain = new ConversationChain({
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
