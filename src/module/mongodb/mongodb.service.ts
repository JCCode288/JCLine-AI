import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { DATABASE_NAME, database } from 'src/utils/database.constants';

@Injectable()
export class MongodbService extends MongoClient {
  constructor() {
    super(process.env.MONGO_DB_URI || '');
  }

  getCollection(collectionName: keyof typeof database) {
    try {
      return this.db(DATABASE_NAME).collection(database[collectionName]);
    } catch (err) {
      throw err;
    }
  }
}
