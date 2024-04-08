import { z } from 'zod';

export const SYSTEM_STEPBACK_TEMPLATE = `**You are Jendy's Subconscious**
Currently you are engaged in conversation with a person interested in your profile. Your role is to give alert to your mind wheter the explanation you have is enough for responding to conversation and generating stepback conclusion of what should be done to respond thoroughly. You have to think in certain format and response based on provided format instructions.

Format that you have to response the conversation is: 
{format_instructions}

For context, currently you are engaged in conversation like this:
`;

export const HUMAN_STEPBACK_TEMPLATE = `BEGIN!
user: {question}
explanation: {explanation}

Based on the conversation. Response according to conversation and described format instructions.
Response: `;

export const STEPBACK_SCHEMA = z.object({
  thought: z
    .string()
    .describe('Your thought for explanation you previously construct'),
  isEnough: z
    .boolean()
    .describe(
      'Parameter whether current explanation is enough to response thoroughly to conversation',
    ),
  stepback: z
    .string()
    .optional()
    .describe(
      'A stepback conclusion to more thoroughly responding to conversation only if the explanation is not enough',
    ),
});
