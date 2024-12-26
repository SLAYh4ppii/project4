import { Db, Collection } from 'mongodb';

export interface MongoDBClient {
  connect(): Promise<void>;
  db(name: string): Db;
  close(): Promise<void>;
}

export interface DatabaseConnection {
  db: Db;
  dbClient: MongoDBClient;
}