import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

export interface IEmbeddingArgs {
  model: OpenAIEmbeddings;
  verbose: boolean;
}
