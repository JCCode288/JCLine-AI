import { Module } from '@nestjs/common';
import { MongodbService } from '../openai/mongodb.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MongodbService],
  exports: [],
})
export class MongodbModule {
  constructor(private readonly mongodbService: MongodbService) {}
}
