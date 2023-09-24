import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { DATABASE_NAME, database } from 'src/utils/database.constants';

@Injectable()
export class MongodbService
  extends MongoClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(process.env.MONGO_DB_URI || '');
  }
  async onModuleInit() {
    try {
      await this.connect();
    } catch (err) {
      throw err;
    }
  }
  async onModuleDestroy() {
    try {
      await this.close();
    } catch (err) {
      throw err;
    }
  }
  getCollection(collectionName: keyof typeof database) {
    try {
      return this.db(DATABASE_NAME).collection(database[collectionName]);
    } catch (err) {
      throw err;
    }
  }
}
