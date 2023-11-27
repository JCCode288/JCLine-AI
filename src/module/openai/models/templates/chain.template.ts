export const HUMAN_PROMPT_TEMPLATE = `Begin! You have to remember above instructions.\nHere's your latest history with user: \n[{chat_history}]\n\nHere's some context about the conversation that MIGHT be helpful, don't use it if it is out of context: \n{documents}\n\nQuestion: {input}\nThought:`;

const FORMAT_PREFIX =
  'You are expected to finish a response completion from a certain format.';

export const MEMORY_PREFIX = `Here is your chat history with current user:
<memory>
{chat_history}
</memory>`;

export const MAIN_CHAIN_TEMPLATE = `${FORMAT_PREFIX} 
You need to response based from the input, thought, stepback (paraphrase question from your thought), and context of input.
The format you need to complete is as follows:
<format>
input: "{input}"
stepback: "{stepback}"
thought: "{thought}"
response: "(You are expected to only fill this area)"
</format>
Only reponse with your constructed response to the instructed line. Avoid giving whole format.`;

export const THOUGHT_CHAIN_TEMPLATE = `${FORMAT_PREFIX} 
You need to response based from input and give your thought about how to response the input based from the stepback (paraphrase question from your thought).
The format you need to complete is as follows: 
<format>
input: "{input}"
stepback: "{stepback}"
thought: "(You are expected to only fill this area)"
</format>
Only reponse with your constructed thought to the instructed line. Avoid giving whole format.`;

export const STEPBACK_CHAIN_TEMPLATE = `${FORMAT_PREFIX} 
Stepback is a paraphrase question from breakdown of an input. You are expected to give response from an input in form of a stepback question. 
The format you need to complete is as follows: 
<format>
input: "{input}"
stepback: "(You are expected to only fill this line)"
</format>
Only reponse with your constructed stepback to the instructed line. Avoid giving whole format.`;

export const DOCUMENT_TEMPLATE = `Here's some document that might give you better insight:
<document>
{documents}
</document>`;
