import { IEmbeddingArgs } from '../interfaces/embedding.interface';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RedisVectorStore } from 'langchain/vectorstores/redis';

export class EmbeddingOpenAI {
  public readonly verbose: boolean;
  public type: string;
  private vectorStore: RedisVectorStore;
  constructor({ verbose, vectorStore }: IEmbeddingArgs) {
    this.type = 'EMBEDDING';
    this.verbose = verbose;
    this.vectorStore = vectorStore;
  }

  async injectPDF(path: string) {
    try {
      const loader = new PDFLoader(path);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 75,
        chunkOverlap: 1,
        separators: ['SUMMARY', 'EDUCATION', 'EXPERIENCE', 'PROJECTS', '\n\n'],
      });

      const docs = await loader.load();

      const splittedDocs = await splitter.splitDocuments(docs);

      await this.vectorStore.addDocuments(splittedDocs);

      console.log(splittedDocs, '<<<<< PDF');
    } catch (err) {
      throw err;
    }
  }

  async search(input: string) {
    try {
      const context = await this.vectorStore.similaritySearchWithScore(
        input,
        1,
      );

      return context[0][0].pageContent;
    } catch (err) {
      throw err;
    }
  }
}
