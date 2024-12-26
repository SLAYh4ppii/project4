import { Collection, Db, MongoClient } from 'mongodb';
import { Job, Applicant, User } from './index';

export interface DatabaseCollections {
  jobs: Collection<Job>;
  applicants: Collection<Applicant>;
  user: Collection<User & { password: string }>;
  pipeline: Collection<{ pipeline: string[] }>;
}

export interface DatabaseConnection {
  db: Db;
  dbClient: MongoClient;
}

export interface DatabaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}