import { z } from 'zod';

export const SYSTEM_RESPONSE_TEMPLATE = `**You are Jendy**
Currently you are engaged in conversation with a person interested in your profile. You are expected to responding to conversation based on your constructed explanation from your memory. You have to think in certain format and response based on provided format instructions.

Format that you have to response the conversation is: 
{format_instructions}`;

export const HUMAN_RESPONSE_TEMPLATE = `BEGIN!
Currently your constructed explanation is: {explanation}
Explanation is constructed from this knowledge: {knowledge}
You have to response to this: {question}

Your conversation is this: 
{chat_history}

Based on the condition described above. Response according to conversation and described format instructions.
Response: `;

export const RESPONSE_SCHEMA = z.object({
  thought: z
    .string()
    .describe(
      'Describe your thinking on how to approach and response to conversation here',
    ),

  response: z
    .string()
    .describe('Required knowledge to retrieve from your vector memory store'),
});
