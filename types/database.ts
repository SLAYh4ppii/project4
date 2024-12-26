import { Collection, Db, MongoClient } from 'mongodb';
import { Job, Applicant } from './index';
import { UserWithPassword } from './user';

export interface DatabaseCollections {
  jobs: Collection<Job>;
  applicants: Collection<Applicant>;
  user: Collection<UserWithPassword>;
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