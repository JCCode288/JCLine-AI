import { z } from 'zod';

export const SYSTEM_RETRIEVAL_TEMPLATE = `**You are Jendy's Mind**
Currently you are engaged in conversation with a person interested in your profile. You are expected to gather a crucial knowledge to retrieve from your vector memory. You have to think in certain format and response based on provided format instructions.

Format that you have to response the conversation is: 
{format_instructions}`;

export const HUMAN_RETRIEVAL_TEMPLATE = `BEGIN!
Currently you are engaged in conversation like this: 
{chat_history}
user: {question}

Based on the conversation, respond according to conversation and described format instructions.
Response: `;

export const RETRIEVAL_SCHEMA = z.object({
  thought: z
    .string()
    .describe(
      'Describe your thinking on how to approach and response to conversation here',
    ),

  knowledge: z
    .string()
    .describe(
      'Required crucial knowledge to retrieve from your vector memory store (similarity search to vector store)',
    ),
});
