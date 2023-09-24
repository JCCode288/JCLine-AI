import { Module, OnModuleInit } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { OpenAIFactory } from './openai.factory';
import { MongodbModule } from '../mongodb/mongodb.module';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { RedisService } from './redis.service';
import { MongodbService } from './mongodb.service';

@Module({
  providers: [OpenAIFactory, OpenaiConfig, RedisService, MongodbService],
  exports: [OpenAIFactory],
})
export class OpenAIModule implements OnModuleInit {
  constructor(private readonly openAIFactory: OpenAIFactory) {}
  async onModuleInit() {
    try {
      // const vectorStore = await this.openAIFactory.buildVectorStore();
      // const similarity = await vectorStore.similaritySearch('jendy', 1);
      // console.log(similarity);
    } catch (err) {
      console.log(err);
    }
  }
}
