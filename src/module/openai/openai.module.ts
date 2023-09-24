import { Module, OnModuleInit } from '@nestjs/common';
import { OpenaiConfig } from './openai.config';
import { OpenAIFactory } from './openai.factory';
import { RedisService } from './redis.service';
import { MongodbService } from './mongodb.service';
// import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

@Module({
  providers: [OpenAIFactory, OpenaiConfig, RedisService, MongodbService],
  exports: [OpenAIFactory],
})
export class OpenAIModule implements OnModuleInit {
  constructor(private readonly openAIFactory: OpenAIFactory) {}
  async onModuleInit() {
    try {
      // const embedding = await this.openAIFactory.build('embedding', null);
      // const context = await embedding.search('jendy');
      // console.log(context, '<<<< Context');
    } catch (err) {
      console.log(err);
    }
  }
}
