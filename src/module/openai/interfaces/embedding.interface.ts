import { RedisVectorStore } from 'langchain/vectorstores/redis';

export interface IEmbeddingArgs {
  verbose: boolean;
  vectorStore: RedisVectorStore;
}
