import { Tool } from 'langchain/tools';
import { BaseOpenAI } from './base.openai';
import { IAgentArgs } from '../interfaces/agent.intefaces';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BASE_PERSONA } from 'src/utils/persona.constant';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { IAgentType, agent_type } from 'src/utils/agent.constant';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { LLMChain } from 'langchain/chains';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

export class AgentOpenAI extends BaseOpenAI {
  public override readonly model: ChatOpenAI;
  public type = 'AGENT';
  public verbose: boolean;
  private tools: Tool[];
  private chainTemplate: string[];
  private persona?: string;
  private prefix?: string;
  private suffix?: string;
  private output_variables: string[];

  private agent;

  constructor({
    tools,
    model,
    verbose,
    persona,
    prefix,
    suffix,
    memory,
    output_variables,
  }: IAgentArgs) {
    super();
    this.tools = tools as Tool[];
    this.model = model;
    this.memory = memory;
    this.verbose = verbose;
    this.persona = persona ?? BASE_PERSONA;
    this.prefix = prefix;
    this.suffix = suffix;
    this.output_variables = output_variables ?? ['input', 'agent_scratchpad'];

    this.chainTemplate = [prefix, suffix, persona];

    this.logger.log('AgentOpenAI Built!', AgentOpenAI.name);
  }

  async promptAnswer(input: string): Promise<string> {
    try {
      const { output } = await this.agent.invoke({ input });

      return output;
    } catch (err) {
      return err;
    }
  }

  async buildAgent(type: keyof IAgentType) {
    try {
      const agentType = agent_type[type];
      const memoryConf = {
        inputKey: 'input',
        outputKey: 'output',
        aiPrefix: 'JendAI',
        humanPrefix: 'User',
        chatHistory: new ChatMessageHistory(),
      };
      const agentArgs: any = {};

      if (agentType.includes('chat')) {
        memoryConf['memoryKey'] = 'chat_history';
        agentArgs['humanMessage'] = this.suffix;
        agentArgs['systemMessage'] = `${this.persona}\n\n${this.prefix}`;
      } else {
        agentArgs['suffix'] = this.suffix;
        agentArgs['prefix'] = `${this.persona}\n\n${this.prefix}`;
      }
      const memory = this.memory ?? new BufferMemory(memoryConf);

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

  buildChain() {
    try {
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
      const prompt = ChatPromptTemplate.fromMessages(templates);

      const memory =
        this.memory ??
        new BufferMemory({
          inputKey: 'input',
          outputKey: 'output',
          aiPrefix: 'JendAI',
          humanPrefix: 'User',
          chatHistory: new ChatMessageHistory(),
          memoryKey: 'chat_history',
        });
      this.agent = new LLMChain({ llm: this.model, memory, prompt });

      return this;
    } catch (err) {
      throw err;
    }
  }
}
