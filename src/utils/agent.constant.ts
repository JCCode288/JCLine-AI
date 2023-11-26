export interface IAgents {
  CONVO: 'chat-conversational-react-description';
  ZERO_SHOT: 'zero-shot-react-description';
  CHAT_ZERO_SHOT: 'chat-zero-shot-react-description';
  STRUCTURED_CHAT_ZERO: 'structured-chat-zero-shot-react-description';
  FUNCTIONS: 'openai-functions';
}

export const agent_type: IAgents = {
  CONVO: 'chat-conversational-react-description',
  ZERO_SHOT: 'zero-shot-react-description',
  CHAT_ZERO_SHOT: 'chat-zero-shot-react-description',
  STRUCTURED_CHAT_ZERO: 'structured-chat-zero-shot-react-description',
  FUNCTIONS: 'openai-functions',
};

export type IAgentType = keyof IAgents;
