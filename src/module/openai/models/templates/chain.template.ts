export const HUMAN_PROMPT_TEMPLATE = `Begin! You have to remember above instructions.\nHere's your latest history with user: \n[{chat_history}]\n\nHere's some context about the conversation that MIGHT be helpful, don't use it if it is out of context: \n{documents}\n\nQuestion: {input}\nThought:`;

const FORMAT_PREFIX =
  'You are expected to finish a response completion from a certain format.';

export const MEMORY_PREFIX = `Below is your chat history with current user: `;

export const MAIN_CHAIN_TEMPLATE = `${FORMAT_PREFIX} 
Your job is to give response based from the input, thought, stepback (paraphrase question from your thought), and context of input.
<format>
BEGIN!
input: "{input}"
stepback: "{stepback}"
thought: "{thought}"
response: You are expected to only fill this line without responding full format
</format>
Response only with a string of your response.`;

export const THOUGHT_CHAIN_TEMPLATE = `${FORMAT_PREFIX} 
You job is to give your thought based from input and stepback (paraphrase question from your thought).
BEGIN!
<format>
input: "{input}"
stepback: "{stepback}"
thought: You are expected to only fill this line without responding full format
</format>
Response only with a string of your thought.`;

export const STEPBACK_CHAIN_TEMPLATE = `${FORMAT_PREFIX} 
Stepback is a paraphrase question from breakdown of an input.
Your job is to give your stepback question from user input.
BEGIN!
<format>
input: "{input}"
stepback: You are expected to only fill this line without responding full format
</format>
Response only with a string of your stepback.`;

export const DOCUMENT_TEMPLATE = `Here's some document that might give you better insight:
<document>
{documents}
</document>`;
