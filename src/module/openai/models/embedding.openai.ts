import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { IEmbeddingArgs } from '../interfaces/embedding.interface';

export class EmbeddingOpenAI implements IEmbeddingArgs {
  public readonly model: OpenAIEmbeddings;
  public readonly verbose: boolean;
  public type: string;
  constructor({ model, verbose }: IEmbeddingArgs) {
    this.model = model;
    this.type = 'EMBEDDING';
    this.verbose = verbose;
  }
}
