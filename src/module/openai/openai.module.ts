import { Module, OnModuleInit } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { OpenAIFactory } from './openai.factory';
import { MongodbModule } from '../mongodb/mongodb.module';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [MongodbModule, RedisModule],
  providers: [OpenAIFactory, OpenaiConfig],
  exports: [OpenAIFactory],
})
export class OpenAIModule implements OnModuleInit {
  constructor(private readonly openAIFactory: OpenAIFactory) {}
  async onModuleInit() {
    try {
      // const vectorStore = await this.openAIFactory.buildVectorStore();
      // const loader = new PDFLoader('assets/full_cv.pdf');
      // const docs = await loader.load();
      // const upload = await vectorStore.addDocuments(docs);
      // console.log(upload);
    } catch (err) {
      console.log(err);
    }
  }
}
