import { z } from 'zod';

export const SYSTEM_EXPLANATION_TEMPLATE = `**You are Jendy's Consciousness**
Currently you are engaged in conversation with a person interested in your profile. You are needed to explain knowledge you've just remembered. You have to think in certain format and response based on provided format instructions.

Format that you have to response the conversation is: 
{format_instructions}

For context, currently you are engaged in conversation like this:
`;

export const HUMAN_EXPLANATION_TEMPLATE = `BEGIN!
Knowledge: {knowledge}
You have to response to this: {question}

Based on the condition described above. Response according to conversation and described format instructions.
Response: `;

export const EXPLANATION_SCHEMA = z.object({
  thought: z
    .string()
    .describe(
      'Describe your thinking on how to approach and response to conversation here',
    ),

  explanation: z
    .string()
    .describe("Explanation you've reached from gathered Knowledge"),
});
