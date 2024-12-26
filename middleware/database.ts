import { MongoClient, Db } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { DatabaseConnection } from '@/types/database';

if (!process.env.DB_URL) {
  throw new Error('DB_URL is not defined');
}

const client = new MongoClient(process.env.DB_URL);

async function database(
  req: NextApiRequest & DatabaseConnection,
  res: NextApiResponse,
  next: NextHandler
) {
  if (!client.connect()) await client.connect();
  req.dbClient = client;
  req.db = client.db('ATS');
  return next();
}

export default database;