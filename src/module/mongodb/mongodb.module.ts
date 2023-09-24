import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongodbService } from './mongodb.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MongodbService],
  exports: [MongodbService],
})
export class MongodbModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly mongodbService: MongodbService) {}

  async onModuleInit() {
    try {
      await this.mongodbService.connect();
    } catch (err) {
      throw err;
    }
  }
  async onModuleDestroy() {
    try {
      await this.mongodbService.close();
    } catch (err) {
      throw err;
    }
  }
}
